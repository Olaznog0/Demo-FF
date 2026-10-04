'use strict';
const http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path');
const root = __dirname, assetRoot = path.resolve(root, '../assets');
const PUBLIC_FILES = new Set(['index.html', 'styles.css', 'app.js', 'model.mjs', 'business-data.json', 'reviews-data.js', 'reviews-ui.js', 'calendar-ui.js']);
const LOCAL_FILES = new Set(['launcher.html', 'launcher.js']);
const ASSETS = new Set(['ocimatik-logo.svg', 'restaurant-cover.webp', 'de-happertjes-kibbeling-concept.webp', 'salon-scene.webp', 'hair-inspiration.webp']);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const PORT = Number(process.env.CAMPAIGN20_PORT || 4188);
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  let url; try { url = new URL(req.url, 'http://localhost'); } catch { res.writeHead(400); res.end(); return; }
  const pathname = url.pathname === '/' ? '/campaign20/launcher.html' : url.pathname === '/campaign20/' ? '/campaign20/index.html' : url.pathname;
  let file, filename;
  const pageMatch = /^\/campaign20\/([a-z0-9-]+\.(?:html|js|mjs|json|css))$/.exec(pathname);
  const assetMatch = /^\/(?:demos\/)?assets\/([a-z0-9-]+\.(?:webp|svg))$/.exec(pathname);
  if (pageMatch && (PUBLIC_FILES.has(pageMatch[1]) || LOCAL_FILES.has(pageMatch[1]))) { file = pageMatch[1]; filename = path.join(root, file); }
  else if (assetMatch && ASSETS.has(assetMatch[1])) { file = assetMatch[1]; filename = path.join(assetRoot, file); }
  else { res.writeHead(404); res.end('Not found'); return; }
  try {
    const stat = await fs.lstat(filename); if (stat.isSymbolicLink() || !stat.isFile()) { res.writeHead(404); res.end(); return; }
    const body = await fs.readFile(filename); res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Length': body.length }); res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
if (require.main === module) server.listen(PORT, '127.0.0.1', () => console.log('Personalized campaign preview: http://127.0.0.1:' + PORT + '/campaign20/launcher.html'));
module.exports = { server, PUBLIC_FILES, LOCAL_FILES, ASSETS };
