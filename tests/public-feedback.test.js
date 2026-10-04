'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const registry=require('../public-client-config.js'),core=require('../core.js');
const sandbox={window:{SiteCore:{...core}},location:{pathname:'/concepts/salon/index.html'},URL,URLSearchParams,Intl};
vm.runInNewContext(fs.readFileSync(require.resolve('../concepts/public-core.js'),'utf8'),sandbox);
const feedback=sandbox.window.SiteCore.publicFeedback;

for(const config of Object.values(registry.clients))test(`${config.name} has coherent sample scores and distinct original portraits in EN/NL`,()=>{
 const summary=feedback.aggregate(config),average=config.feedback.reduce((sum,person)=>sum+person.rating,0)/config.feedback.length;
 assert.equal(summary.count,config.feedback.length);assert.equal(summary.rating,average);
 const portraits=new Set();
 for(const person of config.feedback){
  assert.equal(person.kind,'fictional-concept');
  const en=feedback.card(person,'en'),nl=feedback.card(person,'nl');
  assert(en.includes(person.text.en));assert(nl.includes(person.text.nl));
  assert(en.includes(`${person.rating.toFixed(1)} out of 5`));assert(nl.includes(`${person.rating.toFixed(1).replace('.',',')} van 5`));
  assert(en.includes('role="img"'));assert(nl.includes('Geïllustreerde avatar'));
  const avatar=feedback.avatar(person,'en');
  assert.equal(avatar,feedback.avatar(person,'en'));
  assert.equal(avatar.replace(/aria-label="[^"]+"/,''),feedback.avatar(person,'nl').replace(/aria-label="[^"]+"/,''));
  portraits.add(avatar.replace(/aria-label="[^"]+"/,''));
  assert(!/https?:|google|googleusercontent|profile|verified|verifie|<img|schema\.org/i.test(en+nl));
 }
 assert.equal(portraits.size,config.feedback.length);
 assert(feedback.summary(config,'en').includes(`${config.feedback.length} guest voices`));
 assert(feedback.summary(config,'nl').includes(`${config.feedback.length} ervaringen`));
});

test('Sample review helpers reject real businesses and invalid or unlabelled fictional scores',()=>{
 assert.throws(()=>feedback.aggregate({concept:{fictional:false},feedback:registry.clients.bloom.feedback}));
 for(const rating of [null,0,6,NaN,4.5])assert.throws(()=>feedback.aggregate({concept:{fictional:true},feedback:[{rating}]}));
 assert.throws(()=>feedback.card({author:'Real reviewer',rating:5,text:{en:'Actual text'}},'en'));
});

test('Portraits and quotes escape authored labels without enabling remote image URLs or markup',()=>{
 const malicious={author:'<img src=x onerror=alert(1)>',avatarSeed:'test',kind:'fictional-concept',rating:4,text:{en:'<script>alert(1)</script>',nl:'<b>test</b>'}};
 const card=feedback.card(malicious,'en');
 assert(card.includes('&lt;img'));assert(card.includes('&lt;script&gt;'));assert(!/<(?:img|script)\b/i.test(card));
});

test('Real campaign Google ratings remain identity-bound and retain their observed distributions',()=>{
 const context={window:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../campaign20/reviews-data.js'),'utf8'),context);
 const businesses=Object.values(context.window.CAMPAIGN_REVIEWS.businesses);
 assert.equal(businesses.length,20);
 assert(businesses.some(business=>business.rating<4));
 assert(businesses.flatMap(business=>business.reviews).some(review=>review.rating===4));
 for(const business of businesses){assert(business.cid);assert(business.reviews.every(review=>review.authorName&&review.rating>=1&&review.rating<=5));}
 const ui=fs.readFileSync(require.resolve('../campaign20/reviews-ui.js'),'utf8');
 assert(ui.includes("'★'.repeat(review.rating)"));assert(ui.includes("'☆'.repeat(5 - review.rating)"));
});
