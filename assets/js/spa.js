// Keeps the address bar on the site root: menu/link clicks swap the page content in place.
// Real hrefs stay on every link, so crawlers, right-click/open-in-new-tab and no-JS still work.
(function(){
  if(!window.fetch||!window.DOMParser||!window.history||!history.pushState)return;
  var cache={},busy=false;
  var norm=function(u){var p=new URL(u,location.href).pathname;return p==='/'||p==='/index'?'/index.html':p};
  var isPage=function(a){
    if(!a||!a.href)return false;
    if(a.target&&a.target!=='_self')return false;
    if(a.hasAttribute('download'))return false;
    var u=new URL(a.href,location.href);
    if(u.origin!==location.origin)return false;
    var p=u.pathname;
    if(p!=='/'&&!/\.html$/.test(p))return false;
    if(/\/404\.html$/.test(p))return false;
    return true;
  };
  var fetchPage=function(href){
    if(cache[href])return Promise.resolve(cache[href]);
    return fetch(href,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(t){
      var d=new DOMParser().parseFromString(t,'text/html');
      if(!d.querySelector('main'))throw new Error('no main');
      return(cache[href]=d);
    });
  };
  // scroll-reveal, count-up and quote form for freshly inserted content
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});
  var co=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;co.unobserve(e.target);
    var t=+e.target.dataset.count,s=performance.now(),d=1600,el=e.target;
    (function f(n){var p=Math.min((n-s)/d,1);el.textContent=Math.round(t*(1-Math.pow(1-p,3)))+'+';if(p<1)requestAnimationFrame(f)})(s);
  })},{threshold:.6});
  var init=function(root){
    root.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
    root.querySelectorAll('[data-count]').forEach(function(el){co.observe(el)});
    var q=root.querySelector('#quote');
    if(q)q.addEventListener('submit',function(e){
      e.preventDefault();var f=new FormData(q);
      var body='Name: '+f.get('name')+'\nPhone: '+f.get('phone')+'\nEmail: '+f.get('email')+'\nInterested in: '+f.get('type')+'\n\n'+f.get('msg');
      location.href='mailto:info@zenithonsolar.com?subject='+encodeURIComponent('Solar enquiry – '+f.get('type'))+'&body='+encodeURIComponent(body);
      var m=root.querySelector('#fmsg');if(m)m.textContent='Opening your email app… thank you!';
    });
  };
  var show=function(d,href){
    var cur=document.querySelector('main');
    var next=document.importNode(d.querySelector('main'),true);
    cur.replaceWith(next);
    document.title=d.title;
    var nm=d.querySelector('meta[name="description"]'),cm=document.querySelector('meta[name="description"]');
    if(nm&&cm)cm.setAttribute('content',nm.getAttribute('content'));
    document.body.className=d.body.className;
    var want=norm(href);
    document.querySelectorAll('#links a.nl').forEach(function(a){a.classList.toggle('active',norm(a.href)===want)});
    var ov=document.getElementById('overlay');if(ov)ov.classList.remove('open');
    window.scrollTo({top:0,behavior:'instant'});
    init(next);
  };
  var go=function(href,push){
    if(busy)return;busy=true;
    fetchPage(href).then(function(d){
      if(push)history.pushState({spa:1,href:href},'',location.href);  // same URL: address bar does not change
      show(d,href);busy=false;
    }).catch(function(){busy=false;location.href=href});
  };
  history.replaceState({spa:1,href:location.href},'',location.href);
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a');
    if(!isPage(a))return;
    var u=new URL(a.href,location.href);
    if(u.hash&&norm(u.href)===norm(location.href))return;
    e.preventDefault();
    if(norm(u.href)===norm(history.state&&history.state.href||location.href)){window.scrollTo({top:0,behavior:'smooth'});return}
    go(u.href,true);
  });
  document.addEventListener('mouseover',function(e){
    var a=e.target.closest&&e.target.closest('a');
    if(isPage(a))fetchPage(new URL(a.href,location.href).href).catch(function(){});
  });
  window.addEventListener('popstate',function(e){
    if(e.state&&e.state.spa&&e.state.href)go(e.state.href,false);
  });
})();
