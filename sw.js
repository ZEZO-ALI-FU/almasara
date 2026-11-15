const C="almasara-v2";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method==="POST"&&u.origin===location.origin&&u.pathname.endsWith("/share")){
    e.respondWith((async()=>{
      try{ const fd=await e.request.formData(); const fs=fd.getAll("audio").filter(f=>f&&f.size); const c=await caches.open("shared");
        for(const k of await c.keys()) await c.delete(k);
        for(let i=0;i<fs.length;i++) await c.put("./shared/"+i,new Response(fs[i],{headers:{"Content-Type":fs[i].type||"audio/ogg","X-Name":encodeURIComponent(fs[i].name||("voice"+i))}}));
      }catch(err){}
      return Response.redirect("./index.html?share=1",303);
    })()); return;
  }
  if(e.request.method!=="GET"||u.origin!==location.origin) return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
