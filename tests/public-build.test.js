'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {build,preflight,manifest}=require('../scripts/build-showcase.js');
const prefix='ocimatik-public-build-test-';
async function cleanup(directory){
 const resolved=path.resolve(directory),parent=path.resolve(os.tmpdir());
 assert.equal(path.dirname(resolved),parent);assert(path.basename(resolved).startsWith(prefix));
 let files=0,bytes=0;async function inspect(folder){assert(!(await fs.lstat(folder)).isSymbolicLink());for(const name of await fs.readdir(folder)){const entryPath=path.join(folder,name),entry=await fs.lstat(entryPath);assert(!entry.isSymbolicLink(),'Test links must be unlinked before recursive cleanup');if(entry.isDirectory())await inspect(entryPath);else{files++;bytes+=entry.size;}}}
 await inspect(resolved);const before=await fs.statfs(parent);await fs.rm(resolved,{recursive:true});const after=await fs.statfs(parent);assert.equal(await fs.access(resolved).then(()=>true,()=>false),false);
 console.log(JSON.stringify({removedOwnTestDirectory:resolved,files,logicalBytes:bytes,physicalFreeBefore:Number(before.bavail)*Number(before.bsize),physicalFreeAfter:Number(after.bavail)*Number(after.bsize)}));
}
async function fixture(){
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),prefix)),sourceRoot=path.join(directory,'source'),targetDirectory=path.join(sourceRoot,'dist');
 try{
  await fs.mkdir(sourceRoot);
  for(const file of manifest){await fs.mkdir(path.dirname(path.join(sourceRoot,file)),{recursive:true});await fs.writeFile(path.join(sourceRoot,file),'fixture: '+file);}
  for(const page of ['booking.html','confirmation.html'])await fs.writeFile(path.join(sourceRoot,page),'<html><head><title>Private business</title><meta name="description" content="Private business"><meta name="robots" content="index,follow"><script defer src="client-config.js"></script><script defer src="sectors/dentists/config.js"></script><script defer src="sectors/accountants/config.js"></script><script defer src="sectors/movers/config.js"></script><script defer src="sectors/restaurants/el-fogon-latino/config.js"></script><script defer src="public-client-config.js"></script></head><body></body></html>');
  return {directory,sourceRoot,targetDirectory};
 }catch(error){await cleanup(directory);throw error;}
}
test('a stale private configuration blocks the public build before any output is overwritten or deleted',async()=>{
 const f=await fixture();try{await fs.mkdir(f.targetDirectory);await fs.writeFile(path.join(f.targetDirectory,'client-config.js'),'PRIVATE ORIGINAL');await fs.writeFile(path.join(f.targetDirectory,'index.html'),'UNCHANGED ORIGINAL');await assert.rejects(build(f),/unexpected file: client-config.js/);assert.equal(await fs.readFile(path.join(f.targetDirectory,'client-config.js'),'utf8'),'PRIVATE ORIGINAL');assert.equal(await fs.readFile(path.join(f.targetDirectory,'index.html'),'utf8'),'UNCHANGED ORIGINAL');}finally{await cleanup(f.directory);}
});
test('public preflight rejects a directory junction without following or modifying its target',async()=>{
 const f=await fixture(),outside=path.join(f.directory,'outside'),link=path.join(f.targetDirectory,'assets');let linked=false;
 try{await fs.mkdir(outside);await fs.writeFile(path.join(outside,'keep.txt'),'ORIGINAL OUTSIDE');await fs.mkdir(f.targetDirectory);await fs.symlink(outside,link,process.platform==='win32'?'junction':'dir');linked=true;await assert.rejects(build(f),/refused link: assets/);assert.equal(await fs.readFile(path.join(outside,'keep.txt'),'utf8'),'ORIGINAL OUTSIDE');assert.equal((await fs.readdir(outside)).length,1);}finally{if(linked)await fs.unlink(link);await cleanup(f.directory);}
});
test('a linked output root is rejected before traversal',async()=>{const f=await fixture(),outside=path.join(f.directory,'outside');let linked=false;try{await fs.mkdir(outside);await fs.symlink(outside,f.targetDirectory,process.platform==='win32'?'junction':'dir');linked=true;await assert.rejects(build(f),/refused link: dist/);assert.deepEqual(await fs.readdir(outside),[]);}finally{if(linked)await fs.unlink(f.targetDirectory);await cleanup(f.directory);}});
test('a clean public build can be rebuilt safely and strips all private configuration scripts',async()=>{
 const f=await fixture();try{await build(f);await preflight(f.targetDirectory);for(const file of manifest)await fs.access(path.join(f.targetDirectory,file));for(const page of ['booking.html','confirmation.html']){const html=await fs.readFile(path.join(f.targetDirectory,page),'utf8');assert(!html.includes('Private business'));assert(!html.includes('src="client-config.js"'));assert(!html.includes('src="sectors/'));assert(html.includes('src="public-client-config.js"'));assert.match(html,/<meta name="robots" content="noindex,nofollow">/);assert.equal((html.match(/name="robots"/g)||[]).length,1);assert.match(html,/href="https:\/\/ocimatik\.com\/favicon\.svg"/);}assert.equal(await fs.access(path.join(f.targetDirectory,'client-config.js')).then(()=>true,()=>false),false);await fs.writeFile(path.join(f.sourceRoot,'public-client-config.js'),'UPDATED PUBLIC REGISTRY');await build(f);assert.equal(await fs.readFile(path.join(f.targetDirectory,'public-client-config.js'),'utf8'),'UPDATED PUBLIC REGISTRY');}finally{await cleanup(f.directory);}
});
