'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {resolvePlaceId,googleApiKey}=require('../google-business.js');
test('business-specific Google project credentials take precedence for identity lookup',async()=>{
 const names=['GOOGLE_PLACES_API_KEY','GOOGLE_PLACES_API_KEY__SCOPED_GOOGLE','GOOGLE_TRANSLATE_API_KEY__SCOPED_GOOGLE'];
 const original=names.map(name=>process.env[name]),savedFetch=global.fetch,headers=[];
 try{
  process.env[names[0]]='shared-fixture';process.env[names[1]]='business-fixture';process.env[names[2]]='translation-fixture';
  const config={id:'scoped-google',name:'Scope fixture',defaultLanguage:'nl',google:{resolvePlaceId:true},business:{address:'Fixture address',phone:'+31700000000',coordinates:{lat:52.05,lng:4.3}}};
  global.fetch=async(url,options)=>{headers.push(options.headers['X-Goog-Api-Key']);return {ok:true,json:async()=>String(url).includes('searchText')?{places:[{id:'fixture-place'}]}:{location:{latitude:52.05,longitude:4.3},internationalPhoneNumber:'+31700000000'}};};
  assert.equal(await resolvePlaceId(config),'fixture-place');assert.deepEqual(headers,['business-fixture','business-fixture']);
  assert.equal(googleApiKey(config,'GOOGLE_TRANSLATE_API_KEY'),'translation-fixture');
  assert.equal(googleApiKey({id:'different-business'}),'shared-fixture');
 }finally{global.fetch=savedFetch;names.forEach((name,index)=>{if(original[index]===undefined)delete process.env[name];else process.env[name]=original[index];});}
});
