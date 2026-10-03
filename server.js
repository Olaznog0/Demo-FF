'use strict';
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const registry=require('./business-registry.js');
const core=require('./core.js');
const {loadFunction}=require('./integration-loader.js');
const PORT=Number(process.env.PORT||4174),HOST=process.env.HOST||'127.0.0.1';
const PUBLIC_ORIGIN=process.env.PUBLIC_ORIGIN||`http://localhost:${PORT}`;
const root=__dirname,limits=new Map();
const publicFiles=new Set(['locale-bootstrap.js','index.html','booking.html','confirmation.html','confirmation.js','confirmation.css','confirmation-state.js','actions.css','faq.html','style.css','appointment.css','client-config.js','core.js','i18n.js','site-shell.js','script.js','appointment.js','carousel.js','contact-widget.js','contact-widget.css','sector-site.js','sector-compact.css','sectors/index.html','sectors/gallery.css','sectors/gallery.js','pitch-library/index.html','pitch-library/gallery.css','pitch-library/gallery.js','public-client-config.js','concepts/public-site.js','concepts/public.css','concepts/public-core.js']);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function rateLimit(ip){const now=Date.now();for(const [key,value] of limits)if(value.reset<now)limits.delete(key);for(const key of [ip,'global']){const item=limits.get(key)||{count:0,reset:now+60000};item.count++;limits.set(key,item);if(item.count>(key==='global'?60:20))return false;}return true;}
function allowedRequest(req){const origin=req.headers.origin;const expected=new URL(PUBLIC_ORIGIN);const localHosts=new Set([`localhost:${PORT}`,`127.0.0.1:${PORT}`,expected.host]);return localHosts.has(req.headers.host)&&(!origin||origin===expected.origin||origin===`http://127.0.0.1:${PORT}`);}
const {getPlace}=require('./place-adapter.js');
const {googleApiKey}=require('./google-business.js');
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
 let url;try{url=new URL(req.url,'http://local');}catch{json(res,400,{error:'invalid_request'});return;}
 const routes={'/api/google-reviews':'google-reviews','/api/bookings':'bookings','/api/bookings/cancel':'booking-cancel','/api/contact':'contact','/api/whatsapp':'whatsapp'};
 if(Object.hasOwn(routes,url.pathname)){
  if(!allowedRequest(req)){json(res,403,{error:'forbidden_origin'});return;}
  if(!rateLimit(req.socket.remoteAddress)){json(res,429,{error:'rate_limited'});return;}
  let body='';try{for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16384){json(res,413,{error:'request_too_large'});return;}}
   const result=await loadFunction(routes[url.pathname])({httpMethod:req.method,queryStringParameters:Object.fromEntries(url.searchParams),headers:req.headers,body,rawUrl:`${PUBLIC_ORIGIN}${req.url}`,path:url.pathname});
   res.writeHead(result.statusCode,{...result.headers,'Cache-Control':result.headers?.['Cache-Control']||'no-store'});res.end(result.body);
  }catch{json(res,503,{error:'integration_unavailable'});}return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 if(url.pathname==='/api/place'){
  if(!allowedRequest(req)){json(res,403,{error:'forbidden_origin'});return;}
  if(!rateLimit(req.socket.remoteAddress)){res.setHeader('Retry-After','60');json(res,429,{error:'rate_limited'});return;}
  const clientId=url.searchParams.get('client'),lang=url.searchParams.get('lang');
  if(!Object.hasOwn(registry.clients,clientId)){json(res,400,{error:'invalid_client_or_language'});return;}
  const c=registry.clients[clientId];
  if(!c.languages.includes(lang)){json(res,400,{error:'invalid_client_or_language'});return;}
  if(!c.google.enabled||!(c.google.placeId||c.google.resolvePlaceId||(c.id==='ff'?process.env.GOOGLE_PLACE_ID:''))||!googleApiKey(c)){json(res,503,{error:'integration_not_configured'});return;}
  try{json(res,200,await getPlace(c,lang));}catch{json(res,502,{error:'google_unavailable'});}return;
 }
 let relative;try{relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';}catch{res.writeHead(400);res.end();return;}
 const sector=/^sectors\/restaurants\/el-fogon-latino\/(index\.html|restaurant\.css|restaurant\.js|config\.js|assets\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg))$/.test(relative);
 const dental=/^sectors\/dentists\/(index\.html|dental\.css|dental\.js|config\.js|assets\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg))$/.test(relative);
 const accounting=/^sectors\/accountants\/(index\.html|accounting\.css|accounting\.js|config\.js|assets\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg))$/.test(relative);
 const moving=/^sectors\/movers\/(index\.html|moving\.css|moving\.js|config\.js|assets\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg))$/.test(relative);
 const concept=/^concepts\/(salon|restaurants|dentists|accountants|movers)\/(index\.html|config\.js)$/.test(relative);
 const asset=/^assets\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp|svg)$/.test(relative)||sector||dental||accounting||moving||concept;
 if(!publicFiles.has(relative)&&!asset){res.writeHead(404);res.end('Not found');return;}
 const filename=path.resolve(root,relative);if(!filename.startsWith(root+path.sep)){res.writeHead(404);res.end();return;}
 try{const content=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':content.length});res.end(req.method==='HEAD'?undefined:content);}catch{res.writeHead(404);res.end('Not found');}
});
if(require.main===module)server.listen(PORT,HOST,()=>console.log(`Demo preview: http://localhost:${PORT}/`));
module.exports={server,getPlace,allowedRequest};
