(function(root){
'use strict';
const registry=typeof module!=='undefined'?require('../../public-client-config.js'):root.PublicClientRegistry;
const config=registry.clients['lumen'];
if(typeof module!=='undefined')module.exports=config;
root.PublicConceptConfig=config;
root.DentistConfig=config;
})(typeof window==='undefined'?globalThis:window);
