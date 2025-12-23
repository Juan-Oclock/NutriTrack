const fs = require('fs');
const path = require('path');

// SVG template for NutriTrack icon (green circle with leaf)
const generateSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#22c55e" rx="${size * 0.15}"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.28}" fill="white" opacity="0.9"/>
    <path d="M${size * 0.35} ${size * 0.15}
             Q${size * 0.55} ${size * 0.25} ${size * 0.5} ${size * 0.45}
             Q${size * 0.45} ${size * 0.55} ${size * 0.35} ${size * 0.55}
             Q${size * 0.25} ${size * 0.55} ${size * 0.2} ${size * 0.45}
             Q${size * 0.15} ${size * 0.25} ${size * 0.35} ${size * 0.15}
             Z"
          fill="#22c55e"/>
    <path d="M${size * 0.35} ${size * 0.22} L${size * 0.35} ${size * 0.48}"
          stroke="#22c55e"
          stroke-width="${size * 0.02}"
          stroke-linecap="round"/>
  </g>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const svg = generateSvg(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Generated icon-${size}x${size}.svg`);
});

// Generate maskable icon (512)
const maskableSvg = generateSvg(512);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.svg'), maskableSvg);
console.log('Generated icon-maskable-512x512.svg');

// Generate apple touch icon (180x180)
const appleTouchSvg = generateSvg(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchSvg);
console.log('Generated apple-touch-icon.svg');

// Generate shortcut icons
const shortcutAddSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#22c55e" rx="14"/>
  <line x1="48" y1="24" x2="48" y2="72" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <line x1="24" y1="48" x2="72" y2="48" stroke="white" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

const shortcutScanSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#22c55e" rx="14"/>
  <rect x="20" y="20" width="20" height="4" rx="2" fill="white"/>
  <rect x="20" y="20" width="4" height="20" rx="2" fill="white"/>
  <rect x="56" y="20" width="20" height="4" rx="2" fill="white"/>
  <rect x="72" y="20" width="4" height="20" rx="2" fill="white"/>
  <rect x="20" y="72" width="20" height="4" rx="2" fill="white"/>
  <rect x="20" y="56" width="4" height="20" rx="2" fill="white"/>
  <rect x="56" y="72" width="20" height="4" rx="2" fill="white"/>
  <rect x="72" y="56" width="4" height="20" rx="2" fill="white"/>
  <rect x="28" y="45" width="40" height="6" rx="3" fill="white"/>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, 'shortcut-add.svg'), shortcutAddSvg);
fs.writeFileSync(path.join(iconsDir, 'shortcut-scan.svg'), shortcutScanSvg);
console.log('Generated shortcut icons');

console.log('All icons generated successfully!');
