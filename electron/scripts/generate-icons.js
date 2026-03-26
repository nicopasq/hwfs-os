/**
 * generate-icons.js
 * Run once after `npm install` to produce platform icon files from icon.svg.
 *
 *   node scripts/generate-icons.js
 *
 * Outputs:
 *   assets/icon.png   (1024×1024, used as Linux icon + base for others)
 *   assets/icon.ico   (Windows — multi-size ICO: 16,32,48,64,128,256)
 *   assets/icon.icns  (macOS  — ICNS bundle)
 */

'use strict';

const sharp     = require('sharp');
const png2icons = require('png2icons');
const fs        = require('fs');
const path      = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const SVG    = path.join(ASSETS, 'icon.svg');

async function main() {
  console.log('Generating HuronWest app icons from icon.svg …\n');

  // ── 1. SVG → 1024×1024 PNG ─────────────────────────────────────────────────
  const pngBuffer = await sharp(SVG)
    .resize(1024, 1024)
    .png()
    .toBuffer();

  const pngPath = path.join(ASSETS, 'icon.png');
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`✓ icon.png  (${pngBuffer.length} bytes)`);

  // ── 2. PNG → ICO (Windows) ──────────────────────────────────────────────────
  const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BICUBIC2, 0, true);
  if (!icoBuffer) throw new Error('ICO generation failed');
  const icoPath = path.join(ASSETS, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`✓ icon.ico  (${icoBuffer.length} bytes)`);

  // ── 3. PNG → ICNS (macOS) ───────────────────────────────────────────────────
  const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BICUBIC2, 0);
  if (!icnsBuffer) throw new Error('ICNS generation failed');
  const icnsPath = path.join(ASSETS, 'icon.icns');
  fs.writeFileSync(icnsPath, icnsBuffer);
  console.log(`✓ icon.icns (${icnsBuffer.length} bytes)`);

  console.log('\nAll icons generated. You can now run:');
  console.log('  npm run dist:win   — build Windows installer');
  console.log('  npm run dist:mac   — build macOS DMG (run on macOS)');
}

main().catch(err => {
  console.error('\n✗ Icon generation failed:', err.message);
  process.exit(1);
});
