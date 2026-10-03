'use strict';
// These tests use controlled network/SDK fixtures only. No Google or Resend
// request, business email, calendar write or new dependency is created.
const test=require('node:test');
const assert=require('node:assert/strict');
const {compileFunction}=require('../integration-loader.js');
const registry=require('../business-registry.js');

function environment(t, changes={}) {
  const saved={...process.env},originalFetch=global.fetch;
  for(const [name,value]of Object.entries(changes))if(value===undefined)delete process.env[name];else process.env[name]=value;
  t.after(()=>{global.fetch=originalFetch;for(const name of Object.keys(process.env))if(!(name in saved))delete process.env[name];Object.assign(process.env,saved);});
}
function resolver(){const file=require.resolve('../google-business.js');delete require.cache[file];return require(file).resolvePlaceId;}
function business(overrides={}) {
  return {id:'resolver-fixture',name:'Verified Test Restaurant',defaultLanguage:'nl',google:{placeId:'',resolvePlaceId:true},business:{address:'Fixture Street 29, Den Haag',phone:'+31642510834',coordinates:{lat:52.0741804,lng:4.3225177}},...overrides};
}
function details(overrides={}) {return {id:'ChIJFixtureOnly',location:{latitude:52.0741804,longitude:4.3225177},internationalPhoneNumber:'+31 6 42510834',...overrides};}
function placesFixture(record=details()) {
  const calls=[];
  global.fetch=async(url,options)=>{
    calls.push({url:String(url),options});
    return {ok:true,json:async()=>String(url).endsWith('places:searchText')?{places:[{id:'ChIJFixtureOnly'}]}:record};
  };
  return calls;
}
test('resolver skips discovery without a key, on disabled lookup, and for original FF',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:undefined,GOOGLE_PLACE_ID:'FF_PRIVATE_FIXTURE'});
  global.fetch=async()=>{throw new Error('Unexpected external request');};
  const resolve=resolver();assert.equal(await resolve(business()),'');
  assert.equal(await resolve(business({id:'ff'})),'FF_PRIVATE_FIXTURE');
  assert.equal(await resolve(business({google:{placeId:'EXPLICIT_FIXTURE',resolvePlaceId:true}})),'EXPLICIT_FIXTURE');
  process.env.GOOGLE_PLACES_API_KEY='unit-google-key';
  assert.equal(await resolve(business({google:{placeId:'',resolvePlaceId:false}})),'');
  delete process.env.GOOGLE_PLACE_ID;assert.equal(await resolve(business({id:'ff'})),'');
});
test('resolver searches the verified name/address then verifies location and normalized phone; successful concurrent lookups are cached',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:'unit-google-key'});const calls=placesFixture(),resolve=resolver(),config=business();
  const results=await Promise.all([resolve(config),resolve(config)]);
  assert.deepEqual(results,['ChIJFixtureOnly','ChIJFixtureOnly']);assert.equal(calls.length,2);
  assert.equal(calls[0].url,'https://places.googleapis.com/v1/places:searchText');
  assert.equal(calls[0].options.method,'POST');assert.equal(calls[0].options.headers['X-Goog-FieldMask'],'places.id');
  const query=JSON.parse(calls[0].options.body);assert.equal(query.textQuery,`${config.name}, ${config.business.address}`);assert.equal(query.languageCode,'nl');assert.equal(query.pageSize,1);
  assert.equal(calls[1].url,'https://places.googleapis.com/v1/places/ChIJFixtureOnly');assert.equal(calls[1].options.headers['X-Goog-FieldMask'],'id,location,internationalPhoneNumber');
  assert.equal(await resolve(config),'ChIJFixtureOnly');assert.equal(calls.length,2);
  const changed=business({business:{...config.business,coordinates:{lat:52.1,lng:4.4}}});
  await assert.rejects(resolve(changed),/location mismatch/);assert.equal(calls.length,4,'coordinate changes must invalidate the old identity cache');
});
test('resolver rejects a homonym at another location and a same-location business with another phone',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:'unit-google-key'});
  for(const [record,message]of [[details({location:{latitude:52.1,longitude:4.4}}),/location mismatch/],[details({internationalPhoneNumber:'+31 6 11111111'}),/phone mismatch/]]){
    placesFixture(record);await assert.rejects(resolver()(business()),message);
  }
});
test('resolver rejects absent or malformed coordinate components rather than accepting NaN comparisons',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:'unit-google-key'});
  for(const location of [undefined,{}, {latitude:'not-a-coordinate',longitude:4.3225177},{latitude:52.0741804},{latitude:null,longitude:4.3225177}]){
    placesFixture(details({location}));await assert.rejects(resolver()(business()),/location mismatch|identity|coordinate/i);
  }
});
test('resolver rejects invalid verified coordinates before making a discovery request',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:'unit-google-key'});let calls=0;
  global.fetch=async()=>{calls++;throw new Error('Must not request with unverified coordinates');};
  const base=business();
  for(const coordinates of [{lat:'52.0741804',lng:4.3225177},{lat:52.0741804,lng:NaN}])await assert.rejects(resolver()(business({business:{...base.business,coordinates}})),/Verified coordinates required/);
  assert.equal(calls,0);
});
test('failed Google lookup is removed from cache so a later verified retry can succeed',async t=>{
  environment(t,{GOOGLE_PLACES_API_KEY:'unit-google-key'});let calls=0;
  global.fetch=async url=>{calls++;if(calls===1)return {ok:false,status:503};return {ok:true,json:async()=>String(url).endsWith('places:searchText')?{places:[{id:'ChIJFixtureOnly'}]}:details()};};
  const resolve=resolver(),config=business();await assert.rejects(resolve(config),/lookup unavailable/);assert.equal(await resolve(config),'ChIJFixtureOnly');assert.equal(calls,3);
});

function request(client='ayden',payload={}) {
  return {httpMethod:'POST',queryStringParameters:{client,lang:'nl'},headers:{'x-nf-client-connection-ip':'backend-new-fixture'},rawUrl:`http://localhost:4174/api/contact?client=${client}`,body:JSON.stringify({name:'Fixture Visitor',email:'visitor@example.org',phone:'',message:'A controlled enquiry fixture only.',...payload})};
}
function contactEnv(overrides={}) {
  return {ACTIVE_CALENDAR_CLIENT_ID:undefined,RESEND_API_KEY:'unit-ff-only',CONTACT_TO_EMAIL:'ff-only@example.org',CONTACT_FROM_EMAIL:'FF <ff@example.org>',RESEND_API_KEY__AYDEN:'unit-ayden-only',CONTACT_TO_EMAIL__AYDEN:'ayden-only@example.org',CONTACT_FROM_EMAIL__AYDEN:'Ayden <ayden@example.org>',URL:undefined,BOOKING_BASE_URL:undefined,...overrides};
}
function resendFixture(outcome={data:{id:'email_fixture'},error:null}) {
  const calls=[];
  class Resend {
    constructor(key){this.emails={send:async(payload,options)=>{calls.push({key,payload,options});if(outcome instanceof Error)throw outcome;return typeof outcome==='function'?outcome():outcome;}};}
  }
  return {calls,Resend};
}
test('contact cannot fall back to FF email credentials for an unconfigured merchant; missing configuration gives 503',async t=>{
  environment(t,contactEnv({RESEND_API_KEY__AYDEN:undefined,CONTACT_TO_EMAIL__AYDEN:undefined,CONTACT_FROM_EMAIL__AYDEN:undefined}));
  const mock=resendFixture(),handler=compileFunction('contact',{resend:{Resend:mock.Resend}});
  const result=await handler(request());assert.equal(result.statusCode,503);assert.equal(JSON.parse(result.body).error,'email_not_configured_for_business');assert.equal(mock.calls.length,0);assert.equal(JSON.parse(result.body).ok,undefined);
});
test('contact SDK error and missing receipt ID return 502, never a success acknowledgement',async t=>{
  environment(t,contactEnv());
  for(const outcome of [{data:null,error:{message:'Fixture provider failure'}},{data:{},error:null},{data:{id:''},error:null}]){
    const mock=resendFixture(outcome),handler=compileFunction('contact',{resend:{Resend:mock.Resend}});
    const result=await handler(request());assert.equal(result.statusCode,502);const data=JSON.parse(result.body);assert.equal(data.error,'email_not_confirmed');assert.equal(data.ok,undefined);assert.equal(mock.calls.length,1);
  }
});
test('contact does not treat a blank or non-string provider receipt as proof of email delivery',async t=>{
  environment(t,contactEnv());
  for(const id of ['   ',42,{fixture:'not-an-id'}]){
    const mock=resendFixture({data:{id},error:null}),handler=compileFunction('contact',{resend:{Resend:mock.Resend}});
    const result=await handler(request());assert.equal(result.statusCode,502);assert.equal(JSON.parse(result.body).ok,undefined);
  }
});
test('contact success uses the selected merchant recipient/key and idempotency namespace without leaking FF routing',async t=>{
  environment(t,contactEnv());const mock=resendFixture(),handler=compileFunction('contact',{resend:{Resend:mock.Resend}});
  const first=await handler(request('ayden',{name:'  Fixture Visitor  ',message:'  A controlled enquiry fixture only.  '}));
  assert.equal(first.statusCode,200);assert.deepEqual(JSON.parse(first.body),{ok:true,id:'email_fixture'});
  await handler(request('ayden'));assert.equal(mock.calls[0].key,'unit-ayden-only');assert.equal(mock.calls[0].payload.to,'ayden-only@example.org');assert.equal(mock.calls[0].payload.from,'Ayden <ayden@example.org>');assert.equal(mock.calls[0].payload.replyTo,'visitor@example.org');assert.equal(mock.calls[0].payload.subject,`${registry.clients.ayden.name} · website enquiry`);assert.match(mock.calls[0].payload.text,/Name: Fixture Visitor/);
  const firstKey=mock.calls[0].options.idempotencyKey;assert.match(firstKey,/^contact-ayden-[a-f\d]{64}$/);assert.equal(mock.calls[1].options.idempotencyKey,firstKey);
  await handler(request('ff'));assert.equal(mock.calls[2].payload.to,'ff-only@example.org');assert.equal(mock.calls[2].key,'unit-ff-only');assert.match(mock.calls[2].options.idempotencyKey,/^contact-ff-[a-f\d]{64}$/);assert.notEqual(mock.calls[2].options.idempotencyKey,firstKey);
  await handler(request('ayden',{message:'A different controlled enquiry fixture.'}));assert.notEqual(mock.calls[3].options.idempotencyKey,firstKey);
});
