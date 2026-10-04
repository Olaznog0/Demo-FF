'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const shared=['locale-bootstrap.js','style.css','appointment.css','actions.css','core.js','i18n.js','site-shell.js','script.js','appointment.js','carousel.js','contact-widget.js','contact-widget.css','sector-site.js','sector-compact.css','confirmation-state.js','confirmation.js','confirmation.css','public-client-config.js','sectors/index.html','sectors/gallery.css','sectors/gallery.js','concepts/public-site.js','concepts/public-core.js','concepts/public.css','sectors/dentists/dental.css','sectors/accountants/accounting.css','sectors/movers/moving.css'];
const assets=['ocimatik-logo.svg','google-maps.svg','salon-scene.webp','hair-inspiration.webp','accounting-office-concept.webp','dental-office-cover.webp','moving-cover.webp','restaurant-cover.webp','menu-chicken.svg','menu-beef.svg','menu-plantain.svg','pica-pollo-photo.webp','rabo-de-vaca-photo.webp','tostones-photo.webp'];
const concepts=['salon','restaurants','dentists','accountants','movers'].flatMap(name=>['index.html','config.js'].map(file=>`concepts/${name}/${file}`));
const pages=['index.html','booking.html','confirmation.html'];
const manifest=Object.freeze([...shared,...assets.map(file=>'assets/'+file),...concepts,...pages]);
const allowedFiles=new Set(manifest),allowedDirectories=new Set();
for(const file of manifest){let folder=path.posix.dirname(file);while(folder!=='.'){allowedDirectories.add(folder);folder=path.posix.dirname(folder);}}
const privateScripts=['client-config.js','sectors/dentists/config.js','sectors/accountants/config.js','sectors/movers/config.js','sectors/restaurants/el-fogon-latino/config.js'];

async function preflight(target){
 async function inspect(absolute,relative=''){
  let entry;try{entry=await fs.lstat(absolute);}catch(error){if(error.code==='ENOENT'&&!relative)return;throw error;}
  if(entry.isSymbolicLink())throw new Error(`Public build refused link: ${relative||'dist'}`);
  if(entry.isDirectory()){
   if(relative&&!allowedDirectories.has(relative))throw new Error(`Public build refused unexpected directory: ${relative}`);
   for(const name of await fs.readdir(absolute))await inspect(path.join(absolute,name),relative?relative+'/'+name:name);
  }else if(!entry.isFile()||!allowedFiles.has(relative))throw new Error(`Public build refused unexpected file: ${relative||'dist'}`);
 }
 // lstat checks every entry before readdir; directory links/junctions are never followed.
 await inspect(target);
}

async function build({sourceRoot=root,targetDirectory=path.join(sourceRoot,'dist')}={}){
 sourceRoot=path.resolve(sourceRoot);targetDirectory=path.resolve(targetDirectory);
 const relative=path.relative(sourceRoot,targetDirectory);
 if(!relative||relative.startsWith('..'+path.sep)||relative==='..'||path.isAbsolute(relative))throw new Error('Public output must be inside its source workspace');
 await preflight(targetDirectory);
 async function copy(file){await fs.mkdir(path.dirname(path.join(targetDirectory,file)),{recursive:true});await fs.copyFile(path.join(sourceRoot,file),path.join(targetDirectory,file));}
 await fs.mkdir(targetDirectory,{recursive:true});
 for(const file of [...shared,...concepts,...assets.map(file=>'assets/'+file)])await copy(file);
 for(const file of ['booking.html','confirmation.html']){
  let html=await fs.readFile(path.join(sourceRoot,file),'utf8');
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>Business Websites · Ocimatik</title>');
  html=html.replace(/(<meta name="description" content=")[^"]*/i,'$1Your next visit, at a glance.');
  for(const src of privateScripts)html=html.replace(new RegExp(`<script\\s+defer\\s+src="${src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*><\\/script>`,'g'),'');
  await fs.writeFile(path.join(targetDirectory,file),html);
 }
 await fs.writeFile(path.join(targetDirectory,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=sectors/index.html"><title>Business Websites · Ocimatik</title></head><body><a href="sectors/index.html">Explore our business websites</a></body></html>');
 console.log('Public fictitious business concepts ready in dist; real pitch configurations excluded.');
}
module.exports={build,preflight,manifest};
if(require.main===module)build().catch(error=>{console.error(error.message);process.exitCode=1;});
