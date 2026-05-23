import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const src = resolve('public/pictures/Main Screen.png');
const dest = resolve('public/og.jpg');

if (!existsSync(src)) {
  console.error('[gen:og] source not found:', src);
  process.exit(1);
}

try {
  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(dest);
  console.log(`[gen:og] generated ${dest} (1200x630)`);
} catch (err) {
  console.error('[gen:og] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
}
