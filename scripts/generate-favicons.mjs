// Generates the full favicon family + avatar exports from public/brand/needle-mark.svg
// Run with: node scripts/generate-favicons.mjs

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const SVG_PATH = 'public/brand/needle-mark.svg';
const ICONS_DIR = 'public/icons';
const AVATARS_DIR = 'public/brand/avatar-exports';

const AMBER = '#D4A24C';
const DARK = '#0E0A06';

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(AVATARS_DIR, { recursive: true });

const svgSource = readFileSync(SVG_PATH, 'utf-8');
const amberSvg = svgSource.replace(/currentColor/g, AMBER);
const darkSvg  = svgSource.replace(/currentColor/g, DARK);

// ─── Standard PNGs (amber on transparent, 10% padding) ───────────────────────

const SIZES = [16, 32, 48, 64, 96, 128, 144, 152, 192, 256, 384, 512];

async function generateStandardPngs() {
  for (const size of SIZES) {
    const padding   = Math.round(size * 0.1);
    const innerSize = size - padding * 2;
    await sharp(Buffer.from(amberSvg))
      .resize(innerSize, innerSize)
      .extend({ top: padding, bottom: padding, left: padding, right: padding,
                background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(`${ICONS_DIR}/icon-${size}.png`);
    console.log(`✓ icon-${size}.png`);
  }
}

// ─── Apple Touch Icon (180×180, amber on dark, 18% padding) ──────────────────

async function generateAppleTouch() {
  const size    = 180;
  const padding = Math.round(size * 0.18);
  const inner   = size - padding * 2;
  await sharp(Buffer.from(amberSvg))
    .resize(inner, inner)
    .extend({ top: padding, bottom: padding, left: padding, right: padding,
              background: DARK })
    .png()
    .toFile(`${ICONS_DIR}/apple-touch-icon.png`);
  console.log('✓ apple-touch-icon.png');
}

// ─── PWA Maskable (512×512, amber on dark, 20% safe zone) ────────────────────

async function generateMaskable() {
  const size    = 512;
  const padding = Math.round(size * 0.2);
  const inner   = size - padding * 2;
  await sharp(Buffer.from(amberSvg))
    .resize(inner, inner)
    .extend({ top: padding, bottom: padding, left: padding, right: padding,
              background: DARK })
    .png()
    .toFile(`${ICONS_DIR}/icon-maskable-512.png`);
  console.log('✓ icon-maskable-512.png');
}

// ─── favicon.ico (multi-size: 16, 32, 48) ────────────────────────────────────

async function generateIco() {
  const icoBuffer = await pngToIco([
    `${ICONS_DIR}/icon-16.png`,
    `${ICONS_DIR}/icon-32.png`,
    `${ICONS_DIR}/icon-48.png`,
  ]);
  writeFileSync('public/favicon.ico', icoBuffer);
  console.log('✓ favicon.ico');
}

// ─── Avatar exports ───────────────────────────────────────────────────────────

async function generateAvatars() {
  const platforms = [
    { name: 'github',       size: 460 },
    { name: 'linkedin',     size: 400 },
    { name: 'twitter',      size: 400 },
    { name: 'slack',        size: 512 },
    { name: 'square-512',   size: 512 },
    { name: 'square-1024',  size: 1024 },
  ];

  for (const { name, size } of platforms) {
    const padding = Math.round(size * 0.18);
    const inner   = size - padding * 2;
    await sharp(Buffer.from(amberSvg))
      .resize(inner, inner)
      .extend({ top: padding, bottom: padding, left: padding, right: padding,
                background: DARK })
      .png()
      .toFile(`${AVATARS_DIR}/avatar-${name}.png`);
    console.log(`✓ avatar-${name}.png`);
  }

  // Inverted: dark needle on amber — for light-mode contexts
  const size    = 512;
  const padding = Math.round(size * 0.18);
  const inner   = size - padding * 2;
  await sharp(Buffer.from(darkSvg))
    .resize(inner, inner)
    .extend({ top: padding, bottom: padding, left: padding, right: padding,
              background: AMBER })
    .png()
    .toFile(`${AVATARS_DIR}/avatar-inverted-512.png`);
  console.log('✓ avatar-inverted-512.png');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nGenerating favicon family...\n');
  await generateStandardPngs();
  await generateAppleTouch();
  await generateMaskable();
  await generateIco();
  console.log('\nGenerating avatar exports...\n');
  await generateAvatars();
  console.log('\nAll done.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
