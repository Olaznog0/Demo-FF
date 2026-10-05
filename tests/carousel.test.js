'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../carousel.js'),'utf8');
function setup({reduced=false,hidden=false,count=3,autoplay,cardWidth=300,gap=20,viewport=300}={}){
 function target(){const listeners=new Map(),attributes={};return {listeners,attributes,addEventListener(type,fn){const group=listeners.get(type)||[];group.push(fn);listeners.set(type,group);},dispatch(type,event={}){for(const fn of listeners.get(type)||[])fn(event);},setAttribute(name,value){attributes[name]=value;},removeAttribute(name){delete attributes[name];}};}
 const previous=target(),next=target(),toggle=target(),progress=target(),track=target(),element=target(),document=target(),media=target();
 let focused=false,hovered=false,sequence=0,disconnected=false,resizeCallback;const timers=new Map(),scrolls=[];
 const slides=Array.from({length:count},(_,index)=>({...target(),offsetLeft:index*(cardWidth+gap),getBoundingClientRect:()=>({width:cardWidth})}));
 Object.assign(track,{children:slides,firstElementChild:slides[0],clientWidth:viewport,scrollWidth:Math.max(viewport,count*cardWidth+Math.max(0,count-1)*gap),scrollLeft:0,scrollTo({left,behavior}){track.scrollLeft=left;scrolls.push({left,behavior});track.dispatch('scroll');}});
 Object.assign(document,{hidden,activeElement:null});Object.assign(media,{matches:reduced});
 Object.assign(element,{querySelector:selector=>({'[data-carousel-track]':track,'[data-carousel-prev]':previous,'[data-carousel-next]':next,'[data-carousel-toggle]':toggle,'[data-carousel-progress]':progress}[selector]),contains:()=>focused,matches:()=>hovered});
 const window={matchMedia:()=>media};
 vm.runInNewContext(source,{window,document,AbortController,ResizeObserver:class{constructor(callback){resizeCallback=callback;}observe(){}disconnect(){disconnected=true;}},setInterval(callback,interval){timers.set(++sequence,{callback,interval});return sequence;},clearInterval(id){timers.delete(id);},setTimeout(callback){callback();}});
 const api=window.SalonCarousel.mount(element,{playLabel:'Play',pauseLabel:'Pause',...(autoplay===undefined?{}:{autoplay})});
 return {timers,element,track,previous,next,toggle,progress,document,media,scrolls,api,tick(){for(const {callback} of [...timers.values()])callback();},hover(value){hovered=value;element.dispatch(value?'mouseenter':'mouseleave');},focus(value){focused=value;element.dispatch(value?'focusin':'focusout');},resize(width){track.clientWidth=width;track.scrollWidth=Math.max(width,count*cardWidth+Math.max(0,count-1)*gap);resizeCallback();},get disconnected(){return disconnected;}};
}
test('review carousels start a gentle default autoplay and keep visible controls in sync',()=>{
 const fixture=setup();assert.equal(fixture.timers.size,1);assert.equal([...fixture.timers.values()][0].interval,7500);assert.equal(fixture.toggle.attributes['aria-pressed'],'true');assert.equal(fixture.toggle.textContent,'Pause');
 fixture.tick();assert.equal(fixture.track.scrollLeft,320);assert.equal(fixture.progress.textContent,'2–2 / 3');fixture.tick();fixture.tick();assert.equal(fixture.track.scrollLeft,0);
 fixture.next.dispatch('click');assert.equal(fixture.timers.size,0);assert.equal(fixture.toggle.attributes['aria-pressed'],'false');assert.equal(fixture.toggle.textContent,'Play');fixture.toggle.dispatch('click');assert.equal(fixture.timers.size,1);
 fixture.api.destroy();assert.equal(fixture.timers.size,0);assert.equal(fixture.disconnected,true);
});
test('autoplay pauses on hover, keyboard focus and hidden pages and respects reduced motion',()=>{
 const fixture=setup();fixture.hover(true);assert.equal(fixture.timers.size,0);fixture.hover(false);assert.equal(fixture.timers.size,1);fixture.focus(true);assert.equal(fixture.timers.size,0);fixture.hover(false);assert.equal(fixture.timers.size,0);fixture.focus(false);assert.equal(fixture.timers.size,1);
 fixture.document.hidden=true;fixture.document.dispatch('visibilitychange');assert.equal(fixture.timers.size,0);fixture.document.hidden=false;fixture.document.dispatch('visibilitychange');assert.equal(fixture.timers.size,1);
 fixture.media.matches=true;fixture.media.dispatch('change');assert.equal(fixture.timers.size,0);assert.equal(fixture.toggle.attributes['aria-pressed'],'false');assert.equal(fixture.toggle.disabled,true);fixture.toggle.dispatch('click');assert.equal(fixture.timers.size,0);assert.equal(fixture.toggle.attributes['aria-pressed'],'false');
 for(const options of [{reduced:true},{hidden:true},{count:1},{autoplay:false}]){const initial=setup(options);assert.equal(initial.timers.size,0);initial.api.destroy();}
 fixture.api.destroy();
});
test('wide review sections show two cards and move by the actual card spacing',()=>{
 const fixture=setup({count:4,gap:28,viewport:628});
 assert.equal(fixture.progress.textContent,'1–2 / 4');fixture.tick();assert.equal(fixture.track.scrollLeft,328);assert.equal(fixture.progress.textContent,'2–3 / 4');
 fixture.tick();assert.equal(fixture.track.scrollLeft,656);assert.equal(fixture.progress.textContent,'3–4 / 4');assert.equal(fixture.next.disabled,true);fixture.tick();assert.equal(fixture.track.scrollLeft,0);
 fixture.api.destroy();
});
test('a visible next-card peek uses native scroll limits without overshooting the final review',()=>{
 const fixture=setup({count:3,cardWidth:282,gap:20,viewport:300});
 assert.equal(fixture.progress.textContent,'1–1 / 3');fixture.tick();assert.equal(fixture.track.scrollLeft,302);fixture.tick();assert.equal(fixture.track.scrollLeft,586);assert.equal(fixture.progress.textContent,'3–3 / 3');assert.equal(fixture.next.disabled,true);
 fixture.previous.dispatch('click');assert.equal(fixture.track.scrollLeft,302);assert.equal(fixture.timers.size,0);
 let prevented=false;fixture.track.dispatch('keydown',{key:'ArrowLeft',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(fixture.track.scrollLeft,0);
 fixture.api.destroy();
});
test('controls and autoplay match actual overflow, including after responsive resizing',()=>{
 const fixture=setup({count:2,viewport:620});assert.equal(fixture.timers.size,0);assert.equal(fixture.progress.textContent,'1–2 / 2');
 for(const control of [fixture.previous,fixture.next,fixture.toggle])assert.equal(control.attributes.hidden,'');
 fixture.resize(300);assert.equal(fixture.timers.size,1);for(const control of [fixture.previous,fixture.next,fixture.toggle])assert.equal(control.attributes.hidden,undefined);
 fixture.track.dispatch('pointerdown');assert.equal(fixture.timers.size,0);assert.equal(fixture.toggle.attributes['aria-pressed'],'false');fixture.resize(620);assert.equal(fixture.timers.size,0);
 fixture.api.destroy();fixture.focus(false);assert.equal(fixture.timers.size,0);
});
