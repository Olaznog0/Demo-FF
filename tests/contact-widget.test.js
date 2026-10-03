'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../core.js'),source=fs.readFileSync(require('node:path').join(__dirname,'../contact-widget.js'),'utf8');
function setup(mode,response,lang='en',extra={}){
 let submit,reset=0;const requests=[];
 const button={disabled:false,textContent:''},status={textContent:'',className:'',focus(){}},form={reportValidity:()=>true,addEventListener(name,callback){if(name==='submit')submit=callback;},querySelector(selector){return selector==='button'?button:status;},reset(){reset++;}};
 const element={innerHTML:'',classList:{add(){}},querySelector(){return form;}};
 const document={readyState:'loading',documentElement:{lang},querySelectorAll:()=>[],addEventListener(){}};
 const completions=[],window={SiteCore:core,...(extra.confirm?{DemoConfirmation:{complete(...args){completions.push(args);return true;}}}:{})};const values={name:'Demo Visitor',email:'visitor@example.test',phone:'',topic:'intro',message:'A general enquiry',...extra.values};
 const fields=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{value}]));form.elements={namedItem:key=>fields[key]};
 class FakeFormData{get(key){return values[key];}[Symbol.iterator](){return Object.entries(values)[Symbol.iterator]();}}
 vm.runInNewContext(source,{window,document,URL,URLSearchParams,AbortController,AbortSignal,FormData:FakeFormData,location:{origin:'http://localhost:4174'},fetch:async(url,options)=>{requests.push({url:String(url),options});if(response instanceof Error)throw response;return response;}});
 const client={id:'own-client',name:'Test company',services:[{id:'intro',title:{en:'An introduction',nl:'Een kennismaking'}}],contact:{mode,endpoint:'/api/contact'},...extra.client};
 const api=window.ContactWidget.mount(element,{client,lang});
 return {window,element,client,api,fields,status,button,requests,completions,submit:()=>submit({preventDefault(){}}),get reset(){return reset;}};
}
test('contact bootstrap is idempotent and preserves the existing form until the business or language changes',()=>{
 const fixture=setup('demo'),initial=fixture.element.innerHTML;
 const mounted=fixture.window.ContactWidget.mount(fixture.element,{client:fixture.client,lang:'en'});
 assert.equal(mounted,fixture.api);assert.equal(fixture.element.innerHTML,initial);
 const changed=fixture.window.ContactWidget.mount(fixture.element,{client:fixture.client,lang:'nl'});
 assert.notEqual(changed,fixture.api);assert.match(fixture.element.innerHTML,/Stuur een bericht/);assert.equal((fixture.element.innerHTML.match(/<form /g)||[]).length,1);
});
test('contact drafts survive a language re-render only in page memory without sending or storing data',()=>{
 const fixture=setup('demo',undefined,'en',{values:{message:'My preferred moving date is next month',movingFrom:'2512'}});
 const draft=fixture.window.ContactWidget.draft(fixture.element);
 fixture.window.ContactWidget.mount(fixture.element,{client:fixture.client,lang:'nl'});
 fixture.fields.message.value='';fixture.fields.movingFrom.value='';
 fixture.window.ContactWidget.restore(fixture.element,draft);
 assert.equal(fixture.fields.message.value,'My preferred moving date is next month');assert.equal(fixture.fields.movingFrom.value,'2512');assert.equal(fixture.requests.length,0);
});
test('contact demo completes locally with a neutral enquiry acknowledgement and no delivery claim',async()=>{
 const fixture=setup('demo');await fixture.submit();assert.equal(fixture.requests.length,0);assert.match(fixture.status.textContent,/Thank you for your enquiry/);assert(!fixture.status.textContent.includes('Your message has been sent'));assert.equal(fixture.reset,0);assert.equal(fixture.button.disabled,false);
});
test('contact API submits the selected business and language, and acknowledges only provider-confirmed success',async()=>{
 const fixture=setup('api',{ok:true,status:200,json:async()=>({ok:true,id:'provider-message'})},'nl');await fixture.submit();assert.equal(fixture.requests.length,1);const request=fixture.requests[0],url=new URL(request.url),data=JSON.parse(request.options.body);assert.equal(url.searchParams.get('client'),'own-client');assert.equal(url.searchParams.get('lang'),'nl');assert.equal(data.lang,'nl');assert.equal(data.email,'visitor@example.test');assert.match(data.message,/Een kennismaking/);assert.equal(fixture.reset,1);assert.match(fixture.status.textContent,/is verzonden/);
});
test('unconfigured, rejected or uncertain contact requests never show successful delivery',async()=>{
 for(const response of [{ok:false,status:503,json:async()=>({})},{ok:false,status:502,json:async()=>({ok:false})},{ok:true,status:200,json:async()=>({ok:false})},{ok:true,status:200,json:async()=>({ok:true})},new Error('Timeout')]){
  const fixture=setup('api',response);await fixture.submit();assert.equal(fixture.reset,0);assert(!fixture.status.textContent.includes('Your message has been sent'));assert.equal(fixture.button.disabled,false);assert.equal(fixture.status.className,'cw-status cw-error');
 }
});
test('shared contact thanks routes a non-personal demo summary locally and a real message only after provider receipt',async()=>{
 const demo=setup('demo',undefined,'en',{confirm:true,client:{sector:'moving-company'},values:{movingDate:'2027-01-20',movingFrom:'PRIVATE POSTCODE',message:'PRIVATE MESSAGE'}});await demo.submit();assert.equal(demo.requests.length,0);assert.equal(demo.completions.length,1);const details=demo.completions[0][2];assert.equal(details.type,'enquiry');assert.equal(details.topicId,'intro');assert.equal(details.movingDate,'2027-01-20');assert(!JSON.stringify(details).includes('PRIVATE'));assert(!('name'in details));assert.equal(demo.completions[0][3],'demo');
 const api=setup('api',{ok:true,status:200,json:async()=>({ok:true,id:'actual-receipt'})},'nl',{confirm:true});await api.submit();assert.equal(api.completions.length,1);assert.equal(api.completions[0][3],'api');assert.equal(api.completions[0][4].id,'actual-receipt');
 const failed=setup('api',{ok:true,status:200,json:async()=>({ok:true})},'en',{confirm:true});await failed.submit();assert.equal(failed.completions.length,0);assert.equal(failed.reset,0);
});
test('all contact form labels and states include the four supported market languages',()=>{const fixture=setup('demo');for(const value of Object.values(fixture.window.ContactWidget.copy))for(const lang of ['nl','en','es','ca'])assert(value[lang]);});
test('moving enquiries add preferred date and city/postcode preferences to the original API message contract',async()=>{
 const date=core.futureDays({workingDays:[0,1,2,3,4,5,6]},new Date(),'Europe/Amsterdam')[0].toISOString().slice(0,10);
 const fixture=setup('api',{ok:true,status:200,json:async()=>({ok:true,id:'confirmed'})},'en',{client:{sector:'moving-company'},values:{movingDate:date,movingFrom:'The Hague 2512',movingTo:'Voorburg 2274'}});await fixture.submit();assert.equal(fixture.requests.length,1);const data=JSON.parse(fixture.requests[0].options.body);assert(data.message.includes('When would you like to move?: '+date));assert(data.message.includes('From · city or postcode: The Hague 2512'));assert(data.message.includes('To · city or postcode: Voorburg 2274'));assert(fixture.element.innerHTML.includes('name="movingDate"'));assert(!fixture.element.innerHTML.includes('Full address'));
});
test('moving date remains optional, but a past preference is rejected before any transmission',async()=>{
 const past=setup('api',undefined,'en',{client:{sector:'moving-company'},values:{movingDate:'2020-01-01'}});await past.submit();assert.equal(past.requests.length,0);assert.match(past.status.textContent,/from tomorrow/);
 const blank=setup('demo',undefined,'nl',{client:{sector:'moving-company'},values:{movingDate:''}});await blank.submit();assert.equal(blank.requests.length,0);assert.match(blank.status.textContent,/Bedankt/);
});

test('all ten business contact selectors keep unique IDs and labels in Dutch and English',()=>{
 const clients=[require('../client-config.js').clients.ayden,require('../sectors/dentists/config.js'),require('../sectors/accountants/config.js'),require('../sectors/movers/config.js'),require('../sectors/restaurants/el-fogon-latino/config.js'),...Object.values(require('../public-client-config.js').clients)];
 const normal=label=>label.toLowerCase().replace(/^(?:een|a|an) /,'');
 for(const client of clients)for(const lang of ['nl','en']){
  const fixture=setup('demo',undefined,lang,{client}),select=fixture.element.innerHTML.match(/<select[^>]*name="topic"[^>]*>([\s\S]*?)<\/select>/)[1],options=[...select.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)];
  assert.equal(new Set(options.map(option=>option[1])).size,options.length,client.id+':'+lang+' unique IDs');assert.equal(new Set(options.map(option=>normal(option[2]))).size,options.length,client.id+':'+lang+' unique labels');
  if(client.id==='moving')assert.equal(options.filter(option=>normal(option[2])===(lang==='nl'?'algemene vraag':'general enquiry')).length,1);
 }
});

test('configured general topics suppress the default and repeated IDs or equivalent labels are collapsed',()=>{
 for(const lang of ['nl','en']){
  const title={nl:'Een algemene vraag',en:'A general enquiry'},fixture=setup('demo',undefined,lang,{client:{contact:{mode:'demo',topics:[{id:'general-topic',title},{id:'general-topic',title:{nl:'Ander label',en:'Different label'}},{id:'duplicate-label',title},{id:'consultation',title:{nl:'Een kennismaking',en:'An introduction'}}]}}});
  const select=fixture.element.innerHTML.match(/<select[^>]*name="topic"[^>]*>([\s\S]*?)<\/select>/)[1];assert.equal((select.match(/<option /g)||[]).length,2);assert(!select.includes('value=""'));assert(select.includes('value="consultation"'));
 }
});
