'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const shared=['locale-bootstrap.js','index.html','booking.html','confirmation.html','confirmation.js','confirmation.css','confirmation-state.js','actions.css','faq.html','style.css','appointment.css','client-config.js','core.js','i18n.js','site-shell.js','script.js','appointment.js','carousel.js','contact-widget.js','contact-widget.css','sector-site.js','sector-compact.css','pitch-businesses.js','pitch-client-config.js','pitches/index.html','pitches/site.js','pitches/styles.css','pitch-library/index.html','pitch-library/gallery.css','pitch-library/gallery.js'];
const sectors=[['sectors/restaurants/el-fogon-latino','restaurant'],['sectors/dentists','dental'],['sectors/accountants','accounting'],['sectors/movers','moving']];
async function copyAssets(source,target){
 await fs.cp(source,target,{recursive:true,dereference:false,filter:async file=>{
  const entry=await fs.lstat(file);
  return entry.isDirectory()||(entry.isFile()&&/\.(?:svg|webp|jpe?g)$/i.test(file));
 }});
}
async function build(){
 const target=path.join(root,'dist-pitch');await fs.mkdir(target,{recursive:true});
 for(const file of shared){await fs.mkdir(path.dirname(path.join(target,file)),{recursive:true});if(['booking.html','confirmation.html'].includes(file)){const html=(await fs.readFile(path.join(root,file),'utf8')).replace(/<script\s+defer\s+src="public-client-config\.js"[^>]*><\/script>/g,'');await fs.writeFile(path.join(target,file),html);}else await fs.copyFile(path.join(root,file),path.join(target,file));}
 await copyAssets(path.join(root,'assets'),path.join(target,'assets'));
 for(const [relative,prefix]of sectors){
  const source=path.join(root,relative);await fs.access(source);
  const folder=path.join(target,relative);await fs.mkdir(folder,{recursive:true});for(const file of ['index.html',`${prefix}.css`,`${prefix}.js`,'config.js'])await fs.copyFile(path.join(source,file),path.join(folder,file));
  try{await fs.access(path.join(source,'assets'));}catch(error){if(error.code==='ENOENT')continue;throw error;}await copyAssets(path.join(source,'assets'),path.join(folder,'assets'));
 }
 // This package is for private pitches. It includes real public business data, never server code or credentials.
 console.log('Private pitch frontend ready in dist-pitch; open /pitch-library/index.html from an HTTP server rooted here.');
}
module.exports={build,shared,sectors};
if(require.main===module)build().catch(error=>{console.error('Private pitch build failed: '+error.message);process.exitCode=1;});
