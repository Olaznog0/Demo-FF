'use strict';
// Keep the original FF integrations; scope each request to the selected business.
const {AsyncLocalStorage}=require('node:async_hooks');
const registry=require('./business-registry.js');
const context=new AsyncLocalStorage();
const originalClient='ff';
const limits=new Map();
function currentClient(){return context.getStore()?.client||registry.clients[process.env.ACTIVE_CALENDAR_CLIENT_ID||originalClient];}
function secret(name){const c=currentClient();if(!c)return undefined;const suffix=c.id.toUpperCase().replace(/[^A-Z0-9]/g,'_');return process.env[`${name}__${suffix}`]||(c.id===originalClient||process.env.ACTIVE_CALENDAR_CLIENT_ID===c.id?process.env[name]:undefined);}
async function placeId(){const {resolvePlaceId}=require('./google-business.js');return resolvePlaceId(currentClient());}
function calendarDefinition(legacy){const c=currentClient();if(!c||c.id===originalClient)return legacy;const durations=c.calendar?.serviceDurations||{};return {...legacy,timeZone:c.timeZone,business:{name:c.name,email:c.business.email||'',phone:c.business.phoneDisplay||'',phoneHref:c.business.phone||'',addressLines:[c.business.address],directionsUrl:c.business.mapsUrl},services:c.services.filter(s=>s.bookingEligible!==false).map(s=>({id:s.id,icon:'',durationMinutes:durations[s.id]||0,name:s.title,tag:s.title})),businessDays:(c.hours||[]).filter(h=>!h.closed).flatMap(h=>h.days.map(day=>({dayOfWeek:day,label:{nl:'',en:''},intervals:[{start:h.open,end:h.close}]})))};}
function calendarReady(){const c=currentClient();if(!c)return false;if(c.id!==originalClient&&c.calendar?.confirmed!==true)return false;return !!(secret('GOOGLE_CALENDAR_ID')&&secret('GOOGLE_CLIENT_EMAIL')&&secret('GOOGLE_PRIVATE_KEY'));}
function deny(status,error){return {statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({error})};}
function withClient(handler,type){return async event=>{
 const id=event.queryStringParameters?.client||process.env.ACTIVE_CALENDAR_CLIENT_ID||registry.defaultClient;
 if(!Object.hasOwn(registry.clients,id))return deny(400,'invalid_client');
 const client=registry.clients[id],lang=event.queryStringParameters?.lang;
 if(lang&&!client.languages.includes(lang))return deny(400,'invalid_language');
 const origin=event.headers?.origin;const configured=process.env.URL||process.env.BOOKING_BASE_URL;
 if(origin&&configured&&new URL(configured).origin!==origin)return deny(403,'forbidden_origin');
 const ip=event.headers?.['x-nf-client-connection-ip']||event.headers?.['x-forwarded-for']||'local';
 const now=Date.now();for(const [key,value]of limits)if(value.until<now)limits.delete(key);
 const key=`${type}:${ip}`;const limit=limits.get(key)||{count:0,until:now+60000};limit.count++;limits.set(key,limit);if(limit.count>30)return deny(429,'rate_limited');
 return context.run({client},async()=>{
  if(type==='calendar'&&!calendarReady())return deny(503,'calendar_not_configured_for_business');
  if(type==='whatsapp'&&client.id!==originalClient)return deny(503,'whatsapp_bot_not_configured_for_business');
  try{return await handler(event);}catch{return deny(500,'integration_unavailable');}
 });
};}
module.exports={currentClient,secret,placeId,calendarDefinition,calendarReady,withClient};
