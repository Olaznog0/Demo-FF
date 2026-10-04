'use strict';
const registry=require('./client-config.js');
try{const restaurant=require('./sectors/restaurants/el-fogon-latino/config.js');registry.clients.fogon=restaurant;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const dental=require('./sectors/dentists/config.js');registry.clients.dental=dental;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const accounting=require('./sectors/accountants/config.js');registry.clients.accounting=accounting;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const moving=require('./sectors/movers/config.js');registry.clients.moving=moving;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
for(const [id,client]of Object.entries(require('./pitch-client-config.js').clients)){
 if(Object.hasOwn(registry.clients,id))throw new Error('Pitch ID collides with an existing client');
 registry.clients[id]=client;
}
module.exports=registry;
