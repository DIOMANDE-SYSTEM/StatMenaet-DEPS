/* StatMen — service worker : fonctionne hors connexion pour la page, jamais pour Firebase */
const V='statmen-v1';
const SHELL=['./','pwa/icon-192.png','pwa/icon-512.png','pwa/apple-touch-icon.png','pwa/manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Firebase / API : toujours le réseau
  if(/firebase|googleapis\.com\/(identitytoolkit|v1)|firestore|securetoken/.test(u.hostname+u.pathname)&&!/fonts/.test(u.hostname))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('./',cp));return res}).catch(()=>caches.match('./',{ignoreSearch:true})));
    return;
  }
  // Ressources (polices, bibliothèques CDN, images) : cache d'abord, puis réseau
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>h)));
});
