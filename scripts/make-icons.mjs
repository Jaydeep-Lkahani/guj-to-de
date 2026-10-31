// Usage: npm run icons
// Draws the app icon (the "D" logo from the nav: indigo gradient, white D, saffron dot) as PNGs
// for the web app manifest, plus an SVG favicon. No image tools needed: a tiny PNG encoder below.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const FROM = [0x4c, 0x3f, 0xd1]; // --brand
const TO = [0x7a, 0x4b, 0xe0]; // nav logo gradient end
const DOT = [0xf5, 0xa5, 0x24]; // --accent (saffron)

// The logo in a 1×1 square. Outer "D" minus inner "D" gives the letter; same paths as favicon.svg.
function inD(x, y, stem, top, bottom, rx) {
  if (y < top || y > bottom || x < stem) return false;
  if (x <= 0.5) return true;
  const ry = (bottom - top) / 2;
  const cy = (top + bottom) / 2;
  return ((x - 0.5) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}
const letter = (x, y) => inD(x, y, 0.32, 0.28, 0.72, 0.2) && !inD(x, y, 0.42, 0.38, 0.62, 0.1);
const dot = (x, y) => (x - 0.72) ** 2 + (y - 0.72) ** 2 <= 0.045 ** 2;

/** Is (x, y) inside a rounded square of corner radius r? */
function inRounded(x, y, r) {
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

/**
 * Render the icon. `rounded`: transparent rounded corners ("any" icons); otherwise full-bleed.
 * `scale` < 1 shrinks the logo towards the centre (maskable icons need an 80 % safe zone).
 */
function render(size, { rounded, scale = 1 }) {
  const S = 4; // 4×4 supersampling for smooth edges
  const px = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let pxl = 0; pxl < size; pxl++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const x = (pxl + (sx + 0.5) / S) / size;
          const y = (py + (sy + 0.5) / S) / size;
          if (rounded && !inRounded(x, y, 0.22)) continue;
          const lx = (x - 0.5) / scale + 0.5;
          const ly = (y - 0.5) / scale + 0.5;
          const t = (x + y) / 2; // diagonal gradient, like bg-gradient-to-br
          let c = FROM.map((v, i) => v + (TO[i] - v) * t);
          if (letter(lx, ly)) c = [255, 255, 255];
          else if (dot(lx, ly)) c = DOT;
          r += c[0];
          g += c[1];
          b += c[2];
          a += 255;
        }
      }
      const n = S * S;
      const o = (py * size + pxl) * 4;
      const covered = a / 255;
      px[o] = covered ? Math.round(r / covered) : 0;
      px[o + 1] = covered ? Math.round(g / covered) : 0;
      px[o + 2] = covered ? Math.round(b / covered) : 0;
      px[o + 3] = Math.round(a / n);
    }
  }
  return png(size, px);
}

// ── Minimal PNG encoder (RGBA, 8 bit) ──────────────────────────────────────────────────────

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rows[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Output ─────────────────────────────────────────────────────────────────────────────────

const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${hex(FROM)}"/>
      <stop offset="1" stop-color="${hex(TO)}"/>
    </linearGradient>
  </defs>
  <rect width="1" height="1" rx="0.22" fill="url(#g)"/>
  <path fill="#fff" fill-rule="evenodd" d="M.32 .28H.5A.2 .22 0 0 1 .5 .72H.32ZM.42 .38H.5A.1 .12 0 0 1 .5 .62H.42Z"/>
  <circle cx=".72" cy=".72" r=".045" fill="${hex(DOT)}"/>
</svg>
`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', render(192, { rounded: true }));
writeFileSync('public/icons/icon-512.png', render(512, { rounded: true }));
writeFileSync('public/icons/maskable-512.png', render(512, { rounded: false, scale: 0.8 }));
writeFileSync('public/icons/apple-touch-icon.png', render(180, { rounded: false }));
writeFileSync('public/favicon.svg', favicon);
console.log('Icons written to public/icons and public/favicon.svg');
