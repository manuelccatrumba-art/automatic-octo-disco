// Script de geração dos ícones da marca Love Alarm — usa 'sharp' para rasterizar SVG.
// Não faz parte do build da app; corre-se manualmente sempre que a marca mudar.
const path = require('path');
const sharp = require('sharp');

const DARK_BG = '#0A0510';
const DARK_BG_2 = '#1a0a24';
const PINK = '#FF3B6F';
const PINK_DEEP = '#C81F52';
const PINK_LIGHT = '#FF8FB0';

// Heart path centrado num viewBox 0..100, ponta em baixo.
const HEART_PATH =
  'M50 88 C50 88 8 61 8 30 C8 14 20 3 35 3 C42 3 47 7 50 13 C53 7 58 3 65 3 C80 3 92 14 92 30 C92 61 50 88 50 88 Z';

function ringsSvg({ color, opacityScale = 1 }) {
  return `
    <circle cx="50" cy="46" r="34" fill="none" stroke="${color}" stroke-width="3" opacity="${0.5 * opacityScale}"/>
    <circle cx="50" cy="46" r="44" fill="none" stroke="${color}" stroke-width="2.5" opacity="${0.3 * opacityScale}"/>
    <circle cx="50" cy="46" r="54" fill="none" stroke="${color}" stroke-width="2" opacity="${0.15 * opacityScale}"/>
  `;
}

// --- 1. Ícone principal (iOS + fallback), quadrado opaco 1024x1024 ---
function mainIconSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="${DARK_BG_2}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </radialGradient>
      <linearGradient id="heart" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${PINK_LIGHT}"/>
        <stop offset="55%" stop-color="${PINK}"/>
        <stop offset="100%" stop-color="${PINK_DEEP}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" fill="url(#bg)"/>
    <g>${ringsSvg({ color: PINK_LIGHT })}</g>
    <path d="${HEART_PATH}" transform="translate(0,4) scale(0.62) translate(29,26)" fill="url(#heart)"/>
  </svg>`;
}

// --- 2. Android adaptive icon: foreground (heart + anéis, transparente) ---
function foregroundSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heart" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${PINK_LIGHT}"/>
        <stop offset="55%" stop-color="${PINK}"/>
        <stop offset="100%" stop-color="${PINK_DEEP}"/>
      </linearGradient>
    </defs>
    <g>${ringsSvg({ color: PINK_LIGHT, opacityScale: 0.9 })}</g>
    <path d="${HEART_PATH}" transform="translate(0,4) scale(0.5) translate(29,26)" fill="url(#heart)"/>
  </svg>`;
}

// --- 3. Android adaptive icon: background (gradiente escuro, opaco) ---
function backgroundSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="${DARK_BG_2}"/>
        <stop offset="100%" stop-color="${DARK_BG}"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" fill="url(#bg)"/>
  </svg>`;
}

// --- 4. Android monochrome (silhueta única cor, para ícones temáticos Android 13+) ---
function monochromeSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#FFFFFF">
      ${ringsSvg({ color: '#FFFFFF', opacityScale: 1 })}
    </g>
    <path d="${HEART_PATH}" transform="translate(0,4) scale(0.5) translate(29,26)" fill="#FFFFFF"/>
  </svg>`;
}

// --- 5. Splash icon (foreground sozinho, transparente, para cima do splash escuro) ---
function splashSvg(size) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heart" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${PINK_LIGHT}"/>
        <stop offset="55%" stop-color="${PINK}"/>
        <stop offset="100%" stop-color="${PINK_DEEP}"/>
      </linearGradient>
    </defs>
    <g>${ringsSvg({ color: PINK_LIGHT, opacityScale: 0.9 })}</g>
    <path d="${HEART_PATH}" transform="translate(0,4) scale(0.62) translate(29,26)" fill="url(#heart)"/>
  </svg>`;
}

async function render(svg, size, outFile, opaque) {
  const buf = Buffer.from(svg);
  let img = sharp(buf, { density: 384 }).resize(size, size);
  if (opaque) {
    img = img.flatten({ background: DARK_BG });
  }
  await img.png().toFile(path.join(__dirname, '..', 'assets', outFile));
  console.log('wrote', outFile, size);
}

(async () => {
  await render(mainIconSvg(1024), 1024, 'icon.png', true);
  await render(foregroundSvg(512), 512, 'android-icon-foreground.png', false);
  await render(backgroundSvg(512), 512, 'android-icon-background.png', true);
  await render(monochromeSvg(432), 432, 'android-icon-monochrome.png', false);
  await render(splashSvg(1024), 1024, 'splash-icon.png', false);
  await render(mainIconSvg(48), 48, 'favicon.png', true);
})();
