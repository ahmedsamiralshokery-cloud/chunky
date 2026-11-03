const V="chunky-v1";
const SHELL=["./","index.html","css/style.css","js/app.js","js/pwa.js","js/menu-data.js","manifest.webmanifest","img/logo.jpg","img/wm.png","img/bg.jpg","icons/icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin!==location.origin){
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(caches.open(V).then(async c=>{const m=await c.match(r),f=fetch(r).then(x=>{c.put(r,x.clone());return x}).catch(()=>m);return m||f}));
  return}
 const key=u.origin+u.pathname,fresh=r.mode==="navigate"||u.pathname.endsWith("/")||/\.(?:js|css|html|webmanifest)$/.test(u.pathname);
 if(fresh)e.respondWith(fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(key,y))}return x}).catch(()=>caches.match(key).then(m=>m||caches.match("index.html"))));
 else e.respondWith(caches.match(key).then(m=>m||fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(key,y))}return x})));
});
