(function(root){
'use strict';
const registry=typeof module!=='undefined'?require('../../public-client-config.js'):root.PublicClientRegistry;
const config=registry.clients['bloom'];
if(typeof module!=='undefined')module.exports=config;
root.PublicConceptConfig=config;
root.ClientRegistry={defaultClient:'bloom',clients:registry.clients};
})(typeof window==='undefined'?globalThis:window);
