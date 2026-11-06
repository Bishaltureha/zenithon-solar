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
// Web3Forms access key: its mail goes to the address the key was created with (no activation step). Replace the key to change the receiving mail.
const WEB3FORMS_KEY='PASTE_ACCESS_KEY_HERE';
// quote form -> emailed via Web3Forms (no backend) and, in the same click, opens WhatsApp with the enquiry pre-filled.
if($('quote'))$('quote').addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.target,f=new FormData(form),btn=form.querySelector('button[type=submit]'),msg=$('fmsg');
  if(f.get('_gotcha'))return; // honeypot: bots only
  const name=(f.get('name')||'').trim(),phone=(f.get('phone')||'').trim(),email=(f.get('email')||'').trim(),type=f.get('type'),req=(f.get('msg')||'').trim();
  if(phone.replace(/\D/g,'').length<7){msg.textContent='Please enter a valid phone number.';return}
  const text=`New solar enquiry – ${type}\nName: ${name}\nPhone: ${phone}\nEmail: ${email||'-'}\nRequirement: ${req||'-'}`;
  const wa='https://wa.me/919833302828?text='+encodeURIComponent(text);
  btn.disabled=true;msg.textContent='Sending your enquiry…';
  // open WhatsApp synchronously (inside the click) so popup blockers allow it
  const win=window.open(wa,'_blank');
  const mail=fetch('https://api.web3forms.com/submit',{
    method:'POST',keepalive:true,
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({access_key:WEB3FORMS_KEY,subject:'Solar enquiry – '+type+' – '+name,from_name:'Zenithon Solar Website',
      Name:name,Phone:phone,Email:email||'-',Interested_in:type,Requirement:req||'-',replyto:email||undefined})
  }).then(r=>r.json().then(j=>r.ok&&j.success===true));
  mail.catch(()=>false).then(ok=>{
    if(!win)msg.innerHTML='Email sent. <a href="'+wa+'" target="_blank" rel="noopener">Tap here to send on WhatsApp too</a>.';
    else msg.textContent=ok?'Thank you! Your enquiry was emailed to us. Please tap Send in WhatsApp to finish.':'WhatsApp opened, but email could not be sent. Please tap Send in WhatsApp, or call +91 98333 02828.';
    if(ok===false&&!win)msg.innerHTML='Could not send email. <a href="'+wa+'" target="_blank" rel="noopener">Send on WhatsApp</a> or call +91 98333 02828.';
    if(ok)form.reset();
    btn.disabled=false;
  });
});
$('yr').textContent=new Date().getFullYear();

// Services dropdown: opens on click/tap (and on hover with a mouse, via CSS). Closes on outside click, Escape, or choosing an item.
(function(){
  var dds=document.querySelectorAll('.nl-dd');
  function close(dd){dd.classList.remove('open');var a=dd.querySelector('a.nl');if(a)a.setAttribute('aria-expanded','false')}
  dds.forEach(function(dd){
    var a=dd.querySelector('a.nl');if(!a)return;
    a.setAttribute('aria-expanded','false');
    a.addEventListener('click',function(e){e.preventDefault();var o=dd.classList.toggle('open');a.setAttribute('aria-expanded',o?'true':'false')});
  });
  document.addEventListener('click',function(e){dds.forEach(function(dd){if(!dd.contains(e.target))close(dd)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')dds.forEach(close)});
})();

// service-landing: on a service page, show the Services dropdown already open (current service highlighted),
// so visitors arriving from Google can see and switch to the other services. Closes on scroll, outside click or Escape.
(function(){
  var path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'');
  var services=['/ground-mount','/residential','/housing-society','/commercial','/operations-maintenance'];
  if(services.indexOf(path)<0)return;
  var dd=document.querySelector('.nl-dd');if(!dd)return;
  var cur=dd.querySelector('.dd-menu a[href="'+path+'"]');
  if(cur){cur.setAttribute('aria-current','page');cur.classList.add('current')}
  var links=document.getElementById('links');
  if(!links||getComputedStyle(links).display==='none')return;   // phone/tablet burger menu: nothing to open
  var a=dd.querySelector('a.nl');
  function shut(){dd.classList.remove('open');if(a)a.setAttribute('aria-expanded','false');window.removeEventListener('scroll',onScroll)}
  function onScroll(){if(window.scrollY>60)shut()}
  setTimeout(function(){
    if(window.scrollY>60)return;
    dd.classList.add('open');if(a)a.setAttribute('aria-expanded','true');
    window.addEventListener('scroll',onScroll,{passive:true});
  },700);
})();
