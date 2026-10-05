(function(root){
'use strict';
function mountCarousel(element,options={}){
 const track=element.querySelector('[data-carousel-track]');
 const previous=element.querySelector('[data-carousel-prev]');
 const next=element.querySelector('[data-carousel-next]');
 const toggle=element.querySelector('[data-carousel-toggle]');
 const progress=element.querySelector('[data-carousel-progress]');
 if(!track)return {stop(){},go(){},destroy(){}};
 const slides=Array.from(track.children);let timer=null,destroyed=false;
 const lifecycle=new AbortController();const listen=(target,event,handler,options={})=>target?.addEventListener(event,handler,{...options,signal:lifecycle.signal});
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let playing=options.autoplay!==false&&!reduced.matches&&slides.length>1;
 const unit=()=>slides.length>1?Math.max(1,slides[1].offsetLeft-slides[0].offsetLeft):Math.max(1,slides[0]?.getBoundingClientRect().width||1);
 const gap=()=>Math.max(0,unit()-(slides[0]?.getBoundingClientRect().width||0));
 const visible=()=>Math.max(1,Math.min(slides.length,Math.floor((track.clientWidth+gap())/unit()+.01)));
 const scrollLimit=()=>Math.max(0,track.scrollWidth-track.clientWidth);
 const maxIndex=()=>Math.min(Math.max(0,slides.length-1),Math.ceil(scrollLimit()/unit()));
 const position=()=>Math.max(0,Math.min(maxIndex(),Math.round(track.scrollLeft/unit())));
 const stop=()=>{clearInterval(timer);timer=null;};
 function update(){
  const current=position(),scrollable=maxIndex()>0;
  if(progress)progress.textContent=slides.length?`${current+1}–${Math.min(current+visible(),slides.length)} / ${slides.length}`:'';
  if(previous)previous.disabled=current===0;if(next)next.disabled=current>=maxIndex();
  for(const control of [previous,next,toggle])if(control){if(scrollable)control.removeAttribute('hidden');else control.setAttribute('hidden','');}
  if(toggle){toggle.disabled=reduced.matches;toggle.setAttribute('aria-pressed',String(playing&&scrollable));toggle.textContent=playing&&scrollable?options.pauseLabel:options.playLabel;}
 }
 function go(delta,wrap=false){const current=position();let index=current+delta;if(wrap&&index>maxIndex())index=0;index=Math.max(0,Math.min(maxIndex(),index));const slide=slides[index];if(slide)track.scrollTo({left:Math.min(scrollLimit(),slide.offsetLeft-track.firstElementChild.offsetLeft),behavior:reduced.matches?'instant':'smooth'});}
 function start(){stop();if(!destroyed&&playing&&!reduced.matches&&!document.hidden&&!element.contains(document.activeElement)&&!element.matches?.(':hover')&&maxIndex()>0)timer=setInterval(()=>go(1,true),options.interval||7500);}
 listen(previous,'click',()=>{playing=false;stop();go(-1);update();});
 listen(next,'click',()=>{playing=false;stop();go(1);update();});
 listen(toggle,'click',()=>{playing=!reduced.matches&&!playing;start();update();});
 listen(track,'scroll',update,{passive:true});
 listen(track,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();playing=false;stop();go(e.key==='ArrowLeft'?-1:1);update();}});
 listen(track,'pointerdown',()=>{playing=false;stop();update();},{passive:true});
 listen(element,'mouseenter',stop);listen(element,'mouseleave',start);
 listen(element,'focusin',stop);listen(element,'focusout',()=>setTimeout(()=>{if(!element.contains(document.activeElement))start();},0));
 listen(document,'visibilitychange',()=>document.hidden?stop():start());
 listen(reduced,'change',()=>{if(reduced.matches){playing=false;stop();update();}});
 const observer=new ResizeObserver(()=>{update();start();});observer.observe(track);
 slides.forEach((slide,index)=>{slide.setAttribute('role','group');slide.setAttribute('aria-label',`${index+1} / ${slides.length}`);});
 start();update();return {stop,go,destroy(){destroyed=true;playing=false;stop();observer.disconnect();lifecycle.abort();}};
}
root.SalonCarousel={mount:mountCarousel};
})(window);
