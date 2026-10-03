'use strict';
const core=require('./core.js');
const {resolvePlaceId,googleApiKey}=require('./google-business.js');
async function google(url,fieldMask,config){const headers={'X-Goog-Api-Key':googleApiKey(config)};if(fieldMask)headers['X-Goog-FieldMask']=fieldMask;const response=await fetch(url,{headers,signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Places unavailable');return response.json();}
async function getPlace(config,lang){
 const placeId=await resolvePlaceId(config);
 const url=new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);url.searchParams.set('languageCode',lang);
 const p=await google(url,'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,googleMapsUri,rating,userRatingCount,regularOpeningHours,reviews,photos,attributions',config);
 const photos=[];
 for(const photo of (p.photos||[]).slice(0,Math.max(0,Math.min(8,config.google.maxPhotos||0)))){
  // Media resource names are refreshed on each request, never stored as long-lived URLs.
  if(!/^places\/[^/]+\/photos\/[^/]+$/.test(photo.name))continue;
  try{const media=new URL(`https://places.googleapis.com/v1/${photo.name}/media`);media.searchParams.set('maxWidthPx','1000');media.searchParams.set('skipHttpRedirect','true');const data=await google(media,undefined,config);if(data.photoUri)photos.push({url:data.photoUri,authorAttributions:photo.authorAttributions||[],googleMapsUri:photo.googleMapsUri||p.googleMapsUri});}catch{/* Preserve the available details if a single photo fails. */}
 }
 return {displayName:p.displayName?.text||'',address:p.formattedAddress||'',phone:p.internationalPhoneNumber||p.nationalPhoneNumber||'',googleMapsUri:p.googleMapsUri||'',rating:p.rating,count:p.userRatingCount,hours:p.regularOpeningHours?.weekdayDescriptions||[],attributions:p.attributions||[],reviews:(p.reviews||[]).map(r=>({author:r.authorAttribution||{},rating:r.rating,...core.reviewCopy(r,lang),relativeDate:r.relativePublishTimeDescription||'',googleMapsUri:r.googleMapsUri||p.googleMapsUri})),photos};
}
module.exports={getPlace};
