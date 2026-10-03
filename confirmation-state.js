(function(root){
 'use strict';
 const key='ocimatik-confirmation-v1',ttl=15*60*1000;
 const types=new Set(['booking','enquiry','table']);
 const base=root.document?.currentScript?.src||root.location?.href||'http://localhost/confirmation-state.js';
 function day(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';const date=new Date(value+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:'';}
 const short=value=>typeof value==='string'?value.replace(/[\u0000-\u001f]/g,'').slice(0,90):'';
 function payload(client,lang,details={},mode='demo',receipt=null,now=Date.now()){
  if(!client?.id||!client.languages?.includes(lang)||!types.has(details.type)||!['demo','api'].includes(mode))throw new Error('Invalid confirmation');
  if(mode==='api'&&(receipt?.ok!==true||!short(details.type==='enquiry'?receipt.id:receipt.eventId)))throw new Error('Receipt not confirmed');
  const services=new Set([...(client.services||[]),...(client.contact?.topics||[])].map(service=>service.id));
  return {version:1,clientId:client.id,lang,type:details.type,status:mode==='demo'?'demo':'confirmed',createdAt:now,
   serviceId:services.has(details.serviceId)?details.serviceId:'',topicId:services.has(details.topicId)?details.topicId:'',
   date:day(details.date),time:/^([01]\d|2[0-3]):[0-5]\d$/.test(details.time||'')?details.time:'',
   party:Number.isInteger(Number(details.party))&&Number(details.party)>=1&&Number(details.party)<=24?Number(details.party):null,
   movingDate:day(details.movingDate)};
 }
 function complete(client,lang,details,mode='demo',receipt=null){
  const data=payload(client,lang,details,mode,receipt);
  try{root.sessionStorage.setItem(key,JSON.stringify(data));}catch{return false;}
  const url=new URL('confirmation.html',base);url.search=new URLSearchParams({client:client.id,lang,type:data.type});
  root.location.assign(url.href);return true;
 }
 function read(client,type,now=Date.now()){
  let data;try{data=JSON.parse(root.sessionStorage.getItem(key)||'null');}catch{return null;}
  if(!data||data.version!==1||data.clientId!==client.id||data.type!==type||!types.has(type)||!client.languages.includes(data.lang)||!['demo','confirmed'].includes(data.status)||!Number.isFinite(data.createdAt)||now-data.createdAt<0||now-data.createdAt>ttl){if(data&&now-data.createdAt>ttl)clear();return null;}
  // Only these non-personal fields can reach the summary, even if storage is modified.
  return {version:1,clientId:client.id,lang:data.lang,type,status:data.status,createdAt:data.createdAt,
   serviceId:(client.services||[]).some(s=>s.id===data.serviceId)?data.serviceId:'',topicId:[...(client.services||[]),...(client.contact?.topics||[])].some(s=>s.id===data.topicId)?data.topicId:'',date:day(data.date),time:/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time||'')?data.time:'',party:Number.isInteger(data.party)&&data.party>=1&&data.party<=24?data.party:null,movingDate:day(data.movingDate)};
 }
 function clear(){try{root.sessionStorage.removeItem(key);}catch{}}
 const api={payload,complete,read,clear,key,ttl};root.DemoConfirmation=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
