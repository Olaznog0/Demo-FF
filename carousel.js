(function(root){
'use strict';
function mountCarousel(element,options={}){
 const track=element.querySelector('[data-carousel-track]');
 const previous=element.querySelector('[data-carousel-prev]');
 const next=element.querySelector('[data-carousel-next]');
 const toggle=element.querySelector('[data-carousel-toggle]');
 const progress=element.querySelector('[data-carousel-progress]');
 const slides=Array.from(track.children);let timer=null;
 const lifecycle=new AbortController();const listen=(target,event,handler,options={})=>target?.addEventListener(event,handler,{...options,signal:lifecycle.signal});
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let playing=options.autoplay!==false&&!reduced.matches&&slides.length>1;
 const unit=()=>slides[0]?.getBoundingClientRect().width+20||1;const visible=()=>Math.max(1,Math.round((track.clientWidth+20)/unit()));const maxIndex=()=>Math.max(0,slides.length-visible());const position=()=>Math.max(0,Math.min(maxIndex(),Math.round(track.scrollLeft/unit())));
 const stop=()=>{clearInterval(timer);timer=null;};
 function update(){const current=position();if(progress)progress.textContent=`${current+1}–${Math.min(current+visible(),slides.length)} / ${slides.length}`;if(previous)previous.disabled=current===0;if(next)next.disabled=current>=maxIndex();if(toggle){toggle.setAttribute('aria-pressed',String(playing));toggle.textContent=playing?options.pauseLabel:options.playLabel;}}
 function go(delta,wrap=false){const current=position();let index=current+delta;if(wrap&&index>maxIndex())index=0;index=Math.max(0,Math.min(maxIndex(),index));const slide=slides[index];if(slide)track.scrollTo({left:slide.offsetLeft-track.firstElementChild.offsetLeft,behavior:reduced.matches?'instant':'smooth'});}
 function start(){stop();if(playing&&!reduced.matches&&!document.hidden&&!element.contains(document.activeElement)&&!element.matches?.(':hover')&&slides.length>1)timer=setInterval(()=>go(1,true),options.interval||7500);}
 listen(previous,'click',()=>{playing=false;stop();go(-1);update();});
 listen(next,'click',()=>{playing=false;stop();go(1);update();});
 listen(toggle,'click',()=>{playing=!playing;start();update();});
 listen(track,'scroll',update,{passive:true});
 listen(track,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();playing=false;stop();go(e.key==='ArrowLeft'?-1:1);update();}});
 listen(track,'pointerdown',()=>{playing=false;stop();update();},{passive:true});
 listen(element,'mouseenter',stop);listen(element,'mouseleave',start);
 listen(element,'focusin',stop);listen(element,'focusout',()=>setTimeout(()=>{if(!element.contains(document.activeElement))start();},0));
 listen(document,'visibilitychange',()=>document.hidden?stop():start());
 listen(reduced,'change',()=>{if(reduced.matches){playing=false;stop();update();}});
 const observer=new ResizeObserver(update);observer.observe(track);
 if(slides.length<=1){previous?.setAttribute('hidden','');next?.setAttribute('hidden','');toggle?.setAttribute('hidden','');}
 slides.forEach((slide,index)=>{slide.setAttribute('role','group');slide.setAttribute('aria-label',`${index+1} / ${slides.length}`);});
 start();update();return {stop,go,destroy(){playing=false;stop();observer.disconnect();lifecycle.abort();}};
}
root.SalonCarousel={mount:mountCarousel};
})(window);
