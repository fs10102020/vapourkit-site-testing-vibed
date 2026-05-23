import sharp from 'sharp';

await sharp('public/pictures/Main Screen.png')
  .resize(1200, 630, { fit: 'cover', position: 'center' })
  .png({ compressionLevel: 9, palette: true })
  .toFile('public/og.png');

console.log('Generated public/og.png (1200x630)');
