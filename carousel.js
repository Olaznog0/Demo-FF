(function(root){
'use strict';
function mountCarousel(element,options={}){
 const track=element.querySelector('[data-carousel-track]');
 const previous=element.querySelector('[data-carousel-prev]');
 const next=element.querySelector('[data-carousel-next]');
 const toggle=element.querySelector('[data-carousel-toggle]');
 const progress=element.querySelector('[data-carousel-progress]');
 if(!track)return {stop(){},go(){},destroy(){}};
 const slides=Array.from(track.children);let timer=null,destroyed=false,intendedStop=null,anchorIndex=0;
 const reviews=slides.some(slide=>slide.hasAttribute('data-review-card'));
 const lifecycle=new AbortController();const listen=(target,event,handler,options={})=>target?.addEventListener(event,handler,{...options,signal:lifecycle.signal});
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let playing=options.autoplay!==false&&!reduced.matches&&slides.length>1;
 const unit=()=>slides.length>1?Math.max(1,slides[1].offsetLeft-slides[0].offsetLeft):Math.max(1,slides[0]?.getBoundingClientRect().width||1);
 const gap=()=>Math.max(0,unit()-(slides[0]?.getBoundingClientRect().width||0));
 const visible=()=>Math.max(1,Math.min(slides.length,Math.floor((track.clientWidth+gap())/unit()+.01)));
 const scrollLimit=()=>Math.max(0,track.scrollWidth-track.clientWidth);
 function positions(){
  const step=reviews?visible():1,missing=reviews&&slides.length>step?(step-slides.length%step)%step:0;
  const tail=missing?missing*unit()-gap():0;
  track.style.setProperty('--carousel-page-tail',tail+'px');track.classList.toggle('has-page-tail',tail>0);track.classList.toggle('is-paged',reviews&&step>1);
  const stops=[],first=slides[0]?.offsetLeft||0,maximum=scrollLimit();
  slides.forEach((slide,index)=>{slide.classList.toggle('is-page-start',index%step===0);if(index%step!==0)return;const left=Math.min(maximum,slide.offsetLeft-first);if(!stops.length||Math.abs(left-stops.at(-1).left)>1)stops.push({left,index});});
  return stops;
 }
 function position(stops){
  let nearest=0;stops.forEach((stop,index)=>{const distance=intendedStop?Math.abs(stop.index-intendedStop.index):Math.abs(stop.left-track.scrollLeft);const best=intendedStop?Math.abs(stops[nearest].index-intendedStop.index):Math.abs(stops[nearest].left-track.scrollLeft);if(distance<best)nearest=index;});return nearest;
 }
 const stop=()=>{clearInterval(timer);timer=null;};
 function update(){
  const stops=positions(),selected=position(stops),current=stops[selected]?.index||0,scrollable=stops.length>1;anchorIndex=current;
  if(progress)progress.textContent=slides.length?`${current+1}–${Math.min(current+visible(),slides.length)} / ${slides.length}`:'';
  if(previous)previous.disabled=selected===0;if(next)next.disabled=selected>=stops.length-1;
  for(const control of [previous,next,toggle])if(control){if(scrollable)control.removeAttribute('hidden');else control.setAttribute('hidden','');}
  if(toggle){toggle.disabled=reduced.matches;toggle.setAttribute('aria-pressed',String(playing&&scrollable));toggle.textContent=playing&&scrollable?options.pauseLabel:options.playLabel;}
 }
 function go(delta,wrap=false){const stops=positions();if(!stops.length)return;let selected=position(stops)+delta;if(wrap&&selected>=stops.length)selected=0;selected=Math.max(0,Math.min(stops.length-1,selected));intendedStop=stops[selected];track.scrollTo({left:intendedStop.left,behavior:reduced.matches?'instant':'smooth'});update();}
 function start(){stop();if(!destroyed&&playing&&!reduced.matches&&!document.hidden&&!element.contains(document.activeElement)&&!element.matches?.(':hover')&&positions().length>1)timer=setInterval(()=>go(1,true),options.interval||7500);}
 listen(previous,'click',()=>{playing=false;stop();go(-1);update();});
 listen(next,'click',()=>{playing=false;stop();go(1);update();});
 listen(toggle,'click',()=>{playing=!reduced.matches&&!playing;start();update();});
 listen(track,'scroll',()=>{const stops=positions();if(intendedStop&&stops.length&&Math.abs(stops[position(stops)].left-track.scrollLeft)<=1.5)intendedStop=null;update();},{passive:true});
 listen(track,'scrollend',()=>{intendedStop=null;update();});
 listen(track,'keydown',e=>{if(e.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();playing=false;stop();const stops=positions(),selected=position(stops);go(e.key==='Home'?-selected:e.key==='End'?stops.length-1-selected:e.key==='ArrowLeft'?-1:1);});
 listen(track,'pointerdown',()=>{intendedStop=null;playing=false;stop();update();},{passive:true});
 listen(track,'wheel',()=>{intendedStop=null;update();},{passive:true});
 listen(element,'mouseenter',stop);listen(element,'mouseleave',start);
 listen(element,'focusin',stop);listen(element,'focusout',()=>setTimeout(()=>{if(!element.contains(document.activeElement))start();},0));
 listen(document,'visibilitychange',()=>document.hidden?stop():start());
 listen(reduced,'change',()=>{if(reduced.matches){playing=false;stop();}update();});
 const observer=new ResizeObserver(()=>{const anchor=intendedStop?.index??anchorIndex,stops=positions();if(stops.length){let nearest=0;stops.forEach((stop,index)=>{if(Math.abs(stop.index-anchor)<Math.abs(stops[nearest].index-anchor))nearest=index;});const destination=stops[nearest];if(intendedStop||Math.abs(destination.left-track.scrollLeft)>1.5){intendedStop=destination;track.scrollTo({left:destination.left,behavior:reduced.matches?'instant':'smooth'});}}update();start();});observer.observe(track);
 slides.forEach((slide,index)=>{slide.setAttribute('role','group');slide.setAttribute('aria-label',`${index+1} / ${slides.length}`);});
 start();update();return {stop,go,destroy(){destroyed=true;playing=false;stop();observer.disconnect();lifecycle.abort();}};
}
root.SalonCarousel={mount:mountCarousel};
})(window);
