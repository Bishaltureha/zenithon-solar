const $=id=>document.getElementById(id);
// nav
const nav=$('nav');const onScroll=()=>nav.classList.toggle('scrolled',scrollY>40);addEventListener('scroll',onScroll,{passive:true});onScroll();
if($('burger'))$('burger').onclick=()=>$('overlay').classList.add('open');
if($('close'))$('close').onclick=()=>$('overlay').classList.remove('open');
$('overlay').querySelectorAll('a').forEach(a=>a.onclick=()=>$('overlay').classList.remove('open'));
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// count-up
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);
  const t=+e.target.dataset.count,s=performance.now(),d=1600;
  (function f(n){const p=Math.min((n-s)/d,1);e.target.textContent=Math.round(t*(1-Math.pow(1-p,3)))+'+';if(p<1)requestAnimationFrame(f)})(s);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
// savings calculator (120 units per kW per month, per brochure: 3 kW = ~360 units)
const kw=$('kw'),rate=$('rate'),inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
function calc(){
  const k=+kw.value,r=+rate.value,u=k*120,m=u*r;
  $('kwOut').textContent=k+' kW';$('rateOut').textContent='₹'+r;
  $('units').textContent=u.toLocaleString('en-IN');$('monthly').textContent=inr(m);$('yearly').textContent=inr(m*12);
  document.querySelectorAll('#presets button').forEach(b=>b.classList.toggle('on',+b.dataset.kw===k));
}
if(kw){kw.oninput=calc;rate.oninput=calc;
document.querySelectorAll('#presets button').forEach(b=>b.onclick=()=>{kw.value=b.dataset.kw;calc()});calc();}
// quote form -> opens visitor's email app (no backend). Swap for Formspree etc. to send directly.
if($('quote'))$('quote').addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target);
  const body=`Name: ${f.get('name')}\nPhone: ${f.get('phone')}\nEmail: ${f.get('email')}\nInterested in: ${f.get('type')}\n\n${f.get('msg')}`;
  location.href=`mailto:info@zenithonsolar.com?subject=${encodeURIComponent('Solar enquiry – '+f.get('type'))}&body=${encodeURIComponent(body)}`;
  $('fmsg').textContent='Opening your email app… thank you!';
});
$('yr').textContent=new Date().getFullYear();
