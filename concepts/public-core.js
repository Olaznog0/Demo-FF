(function(){
 'use strict';
 const C=window.SiteCore,originalLink=C.link,originalMap=C.mapEmbed;
 C.link=(...args)=>'/'+originalLink(...args);
 C.mapEmbed=config=>{
  if(!config.concept?.fictional||!config.map?.query)return originalMap(config);
  const url=new URL('https://www.google.com/maps');
  url.search=new URLSearchParams({q:config.map.query,output:'embed',z:'16'});
  return url.href;
 };
})();
