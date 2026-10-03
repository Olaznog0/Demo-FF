(function(root){
 'use strict';
 const document=root.document,html=document.documentElement,scope=html.dataset.localeScope==='agency'?'agency':'business';
 const allowed=(html.dataset.locales||(scope==='agency'?'en,es,nl':'nl,en')).split(','),fallback=html.dataset.localeDefault||(scope==='agency'?'en':'nl');
 const storageKey=scope==='agency'?'ocimatik-language-v2':'ocimatik-business-language-v1';
 const requested=new URLSearchParams(root.location.search).get('lang');
 function stored(){try{return root.localStorage.getItem(storageKey);}catch{return null;}}
 function remember(language){try{root.localStorage.setItem(storageKey,language);}catch{}}
 function resolve(languages=allowed,defaultLanguage=fallback,query=requested){
  const language=query!==null?(languages.includes(query)?query:defaultLanguage):(languages.includes(stored())?stored():defaultLanguage);
  if(languages.includes(query))remember(language);
  html.lang=language;return language;
 }
 const language=resolve();
 let complete=false,released=false;
 html.setAttribute('data-locale-pending','');
 const style=document.createElement('style');style.textContent='html[data-locale-pending] body{visibility:hidden}';document.head.append(style);
 function release(){if(released)return;released=true;html.removeAttribute('data-locale-pending');root.clearTimeout(timer);}
 function ready(){complete=true;if(document.readyState!=='loading')release();}
 const timer=root.setTimeout(release,2000);
 document.addEventListener('DOMContentLoaded',()=>{if(complete)release();},{once:true});
 root.LocaleBootstrap={language,storageKey,resolve,remember,ready};
})(window);
