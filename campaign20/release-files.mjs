import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
export const PUBLIC_ENTRY_FILES = Object.freeze(['index.html', 'styles.css', 'app.js', 'model.mjs', 'business-data.json', 'reviews-data.js', 'reviews-ui.js', 'calendar-ui.js']);
export const PUBLIC_ASSETS = Object.freeze(['ocimatik-logo.svg', 'restaurant-cover.webp', 'de-happertjes-kibbeling-concept.webp', 'salon-scene.webp', 'hair-inspiration.webp']);
const here = path.dirname(fileURLToPath(import.meta.url));
export async function getCampaignFiles() {
  const records = [];
  for (const [sourceRoot, destinationPrefix, files] of [[here, 'pitch', PUBLIC_ENTRY_FILES], [path.resolve(here, '../assets'), 'demos/assets', PUBLIC_ASSETS]]) {
    for (const basename of files) {
      const sourcePath = path.resolve(sourceRoot, basename);
      if (path.dirname(sourcePath) !== sourceRoot) throw new Error('Unexpected release source path.');
      const stat = await fs.lstat(sourcePath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Release files must be regular non-symlink files: ' + basename);
      const bytes = await fs.readFile(sourcePath);
      records.push({ sourcePath, destinationPath: destinationPrefix + '/' + basename, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
  return records;
}
