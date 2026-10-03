'use strict';
const resolved=new Map();
const digits=value=>String(value||'').replace(/\D/g,'').replace(/^00/,'').replace(/^0/,'');
function googleApiKey(config,name='GOOGLE_PLACES_API_KEY'){const suffix=String(config?.id||'').toUpperCase().replace(/[^A-Z0-9]/g,'_');return process.env[`${name}__${suffix}`]||process.env[name]||'';}
async function resolvePlaceId(config){
 if(config.google.placeId)return config.google.placeId;
 if(config.id==='ff')return process.env.GOOGLE_PLACE_ID||'';
 const coordinates=config.business?.coordinates;
 const apiKey=googleApiKey(config);
 if(!config.google.resolvePlaceId||!config.business.address||!coordinates||!apiKey)return '';
 if(!Number.isFinite(coordinates.lat)||!Number.isFinite(coordinates.lng))throw new Error('Verified coordinates required');
 const key=`${config.id}:${config.name}:${config.business.address}:${config.business.phone}:${coordinates.lat}:${coordinates.lng}`;
 if(resolved.has(key))return resolved.get(key);
 const request=(async()=>{
  const headers={'X-Goog-Api-Key':apiKey,'Content-Type':'application/json'};
  const search=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{...headers,'X-Goog-FieldMask':'places.id'},body:JSON.stringify({textQuery:`${config.name}, ${config.business.address}`,languageCode:config.defaultLanguage||'nl',pageSize:1}),signal:AbortSignal.timeout(10000)});
  if(!search.ok)throw new Error('Business lookup unavailable');
  const id=(await search.json()).places?.[0]?.id;if(typeof id!=='string'||!id)throw new Error('Business not found');
  // Confirm the returned location and phone against the already verified business, never a homonym.
  const details=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,{headers:{...headers,'X-Goog-FieldMask':'id,location,internationalPhoneNumber'},signal:AbortSignal.timeout(10000)});
  if(!details.ok)throw new Error('Business identity unavailable');
  const place=await details.json();const location=place.location;
  if(!location||!Number.isFinite(location.latitude)||!Number.isFinite(location.longitude)||Math.abs(location.latitude-coordinates.lat)>0.0015||Math.abs(location.longitude-coordinates.lng)>0.0025)throw new Error('Business location mismatch');
  if(config.business.phone&&place.internationalPhoneNumber&&digits(config.business.phone)!==digits(place.internationalPhoneNumber))throw new Error('Business phone mismatch');
  return id;
 })();resolved.set(key,request);
 try{return await request;}catch(error){resolved.delete(key);throw error;}
}
module.exports={resolvePlaceId,googleApiKey};
