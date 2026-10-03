'use strict';
const registry=require('./client-config.js');
try{const restaurant=require('./sectors/restaurants/el-fogon-latino/config.js');registry.clients.fogon=restaurant;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const dental=require('./sectors/dentists/config.js');registry.clients.dental=dental;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const accounting=require('./sectors/accountants/config.js');registry.clients.accounting=accounting;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
try{const moving=require('./sectors/movers/config.js');registry.clients.moving=moving;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
module.exports=registry;
