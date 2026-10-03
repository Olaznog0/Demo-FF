'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../carousel.js'),'utf8');
function setup({reduced=false,hidden=false,count=3,autoplay}={}){
 function target(){const listeners=new Map(),attributes={};return {listeners,attributes,addEventListener(type,fn){const group=listeners.get(type)||[];group.push(fn);listeners.set(type,group);},dispatch(type,event={}){for(const fn of listeners.get(type)||[])fn(event);},setAttribute(name,value){attributes[name]=value;}};}
 const previous=target(),next=target(),toggle=target(),progress=target(),track=target(),element=target(),document=target(),media=target();
 let focused=false,hovered=false,sequence=0,disconnected=false;const timers=new Map(),scrolls=[];
 const slides=Array.from({length:count},(_,index)=>({...target(),offsetLeft:index*320,getBoundingClientRect:()=>({width:300})}));
 Object.assign(track,{children:slides,firstElementChild:slides[0],clientWidth:300,scrollLeft:0,scrollTo({left,behavior}){track.scrollLeft=left;scrolls.push({left,behavior});track.dispatch('scroll');}});
 Object.assign(document,{hidden,activeElement:null});Object.assign(media,{matches:reduced});
 Object.assign(element,{querySelector:selector=>({'[data-carousel-track]':track,'[data-carousel-prev]':previous,'[data-carousel-next]':next,'[data-carousel-toggle]':toggle,'[data-carousel-progress]':progress}[selector]),contains:()=>focused,matches:()=>hovered});
 const window={matchMedia:()=>media};
 vm.runInNewContext(source,{window,document,AbortController,ResizeObserver:class{observe(){}disconnect(){disconnected=true;}},setInterval(callback,interval){timers.set(++sequence,{callback,interval});return sequence;},clearInterval(id){timers.delete(id);},setTimeout(callback){callback();}});
 const api=window.SalonCarousel.mount(element,{playLabel:'Play',pauseLabel:'Pause',...(autoplay===undefined?{}:{autoplay})});
 return {timers,element,track,previous,next,toggle,progress,document,media,scrolls,api,tick(){for(const {callback} of [...timers.values()])callback();},hover(value){hovered=value;element.dispatch(value?'mouseenter':'mouseleave');},focus(value){focused=value;element.dispatch(value?'focusin':'focusout');},get disconnected(){return disconnected;}};
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
 fixture.media.matches=true;fixture.media.dispatch('change');assert.equal(fixture.timers.size,0);assert.equal(fixture.toggle.attributes['aria-pressed'],'false');
 for(const options of [{reduced:true},{hidden:true},{count:1},{autoplay:false}]){const initial=setup(options);assert.equal(initial.timers.size,0);initial.api.destroy();}
 fixture.api.destroy();
});
