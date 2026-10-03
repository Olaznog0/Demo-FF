'use strict';
const path=require('node:path'),Module=require('node:module'),esbuild=require('esbuild');
const handlers=new Map();
function loadFunction(name){
 if(!/^(place|google-reviews|bookings|booking-cancel|booking-reminders|contact|whatsapp)$/.test(name))throw new Error('Unknown function');
 if(handlers.has(name))return handlers.get(name);
 // Compile the restored TypeScript modules in memory; never generate a second checkout or bundle on disk.
 const handler=compileFunction(name);handlers.set(name,handler);return handler;
}
function compileFunction(name,dependencies={}){
 const entry=path.join(__dirname,'netlify','functions',name+'.ts');
 const result=esbuild.buildSync({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'cjs',target:'node22',packages:'external',logLevel:'silent'});
 const compiled=new Module(entry,module);compiled.filename=entry;compiled.paths=Module._nodeModulePaths(__dirname);const realRequire=compiled.require.bind(compiled);compiled.require=id=>Object.hasOwn(dependencies,id)?dependencies[id]:realRequire(id);compiled._compile(result.outputFiles[0].text,entry);return compiled.exports.handler;
}
module.exports={loadFunction,compileFunction};
