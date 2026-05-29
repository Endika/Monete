import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('public')
mkdirSync(OUT, { recursive: true })

// Brand palette
const BG_RASPBERRY = '#FF4D79'
const COCOA_DARK = '#3B2A22'
const COCOA_MID = '#5A4034'
const CREAM = '#FFF1DD'
const ROSY = '#FF8FA8'
const BANANA = '#FFC53D'
const MINT = '#34D399'

/**
 * Renders the Monete monkey mascot centered inside a square canvas of `size` px.
 * When `withBackground` is true, draws the rounded-square raspberry background (app icon).
 * When false, renders transparent background (for standalone SVG use).
 * `padding` adds safe-zone inset for maskable icons.
 *
 * Design canvas: 512×512, scaled via `s`.
 *
 * Key geometry (all at 512-unit canvas):
 *   Head:   cx=256, cy=295, r=185   — big, low-centered, fills most of frame
 *   Ears:   left cx=90, right cx=422, cy=230, rOuter=52, rInner=32
 *   Eyes:   left cx=196, right cx=316, cy=258, rSclera=32, rPupil=16, rShine=7
 *   Muzzle: cx=256, cy=348, rx=90, ry=62
 *   Nose:   ellipse cx=256, cy=338, rx=14, ry=9
 *   Smile:  arc from (216,365) to (296,365)
 *   Cheeks: left cx=155, right cx=357, cy=330, r=34
 *   Hat:    triangle tip=(268,55), base left=(175,205), base right=(370,205), tilted ~5°
 *   Pom:    cx=261, cy=45, r=24
 */
function monkeySvg({ size, withBackground = true, padding = 0 }) {
  const radius = size * 0.22

  const s = (size - padding * 2) / 512
  const ox = padding
  const oy = padding

  const x = (v) => (ox + v * s).toFixed(2)
  const y = (v) => (oy + v * s).toFixed(2)
  const d = (v) => (v * s).toFixed(2)

  const bg = withBackground
    ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${BG_RASPBERRY}"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="hatClip${size}">
      <!-- Slightly tilted triangle for hat clip -->
      <polygon points="${x(268)},${y(55)} ${x(175)},${y(205)} ${x(370)},${y(205)}"/>
    </clipPath>
  </defs>

  ${bg}

  <!-- ── Party hat (drawn first so head overlaps its base) ── -->
  <!-- Hat body: tilted triangle, banana yellow -->
  <polygon points="${x(268)},${y(55)} ${x(175)},${y(205)} ${x(370)},${y(205)}"
           fill="${BANANA}"/>
  <!-- 2 bold raspberry dots on hat — readable even small -->
  <g clip-path="url(#hatClip${size})">
    <circle cx="${x(252)}" cy="${y(115)}" r="${d(11)}" fill="${BG_RASPBERRY}"/>
    <circle cx="${x(282)}" cy="${y(158)}" r="${d(11)}" fill="${BG_RASPBERRY}"/>
  </g>
  <!-- Hat band: bold raspberry stripe at base -->
  <ellipse cx="${x(272)}" cy="${y(205)}" rx="${d(98)}" ry="${d(16)}" fill="${BG_RASPBERRY}"/>
  <!-- Pom-pom: mint circle at tip, large enough to see -->
  <circle cx="${x(261)}" cy="${y(45)}" r="${d(24)}" fill="${MINT}"/>
  <!-- Pom-pom highlight -->
  <circle cx="${x(255)}" cy="${y(38)}" r="${d(10)}" fill="white" opacity="0.55"/>

  <!-- ── Ears (behind head) ── -->
  <circle cx="${x(90)}"  cy="${y(230)}" r="${d(52)}" fill="${COCOA_MID}"/>
  <circle cx="${x(422)}" cy="${y(230)}" r="${d(52)}" fill="${COCOA_MID}"/>
  <!-- Inner ear cream -->
  <circle cx="${x(90)}"  cy="${y(230)}" r="${d(32)}" fill="${CREAM}"/>
  <circle cx="${x(422)}" cy="${y(230)}" r="${d(32)}" fill="${CREAM}"/>

  <!-- ── Head ── -->
  <circle cx="${x(256)}" cy="${y(295)}" r="${d(185)}" fill="${COCOA_DARK}"/>

  <!-- ── Cheeks (bold rosy circles) ── -->
  <circle cx="${x(155)}" cy="${y(330)}" r="${d(34)}" fill="${ROSY}" opacity="0.80"/>
  <circle cx="${x(357)}" cy="${y(330)}" r="${d(34)}" fill="${ROSY}" opacity="0.80"/>

  <!-- ── Muzzle (large cream oval) ── -->
  <ellipse cx="${x(256)}" cy="${y(348)}" rx="${d(90)}" ry="${d(62)}" fill="${CREAM}"/>

  <!-- ── Nose (small cocoa ellipse, not tiny circles) ── -->
  <ellipse cx="${x(256)}" cy="${y(336)}" rx="${d(14)}" ry="${d(9)}" fill="${COCOA_DARK}"/>

  <!-- ── Smile (bold arc) ── -->
  <path d="M ${x(216)} ${y(362)} Q ${x(256)} ${y(390)} ${x(296)} ${y(362)}"
        fill="none" stroke="${COCOA_DARK}" stroke-width="${d(7)}" stroke-linecap="round"/>

  <!-- ── Eyes: large sclera → bold pupil → highlight ── -->
  <!-- Left eye sclera -->
  <circle cx="${x(196)}" cy="${y(258)}" r="${d(32)}" fill="white"/>
  <!-- Right eye sclera -->
  <circle cx="${x(316)}" cy="${y(258)}" r="${d(32)}" fill="white"/>
  <!-- Left pupil -->
  <circle cx="${x(198)}" cy="${y(261)}" r="${d(16)}" fill="${COCOA_DARK}"/>
  <!-- Right pupil -->
  <circle cx="${x(318)}" cy="${y(261)}" r="${d(16)}" fill="${COCOA_DARK}"/>
  <!-- Left eye shine -->
  <circle cx="${x(190)}" cy="${y(252)}" r="${d(7)}" fill="white"/>
  <!-- Right eye shine -->
  <circle cx="${x(310)}" cy="${y(252)}" r="${d(7)}" fill="white"/>
</svg>`
}

const outputs = [
  { name: 'icon-192.png', size: 192, svg: monkeySvg({ size: 192 }) },
  { name: 'icon-512.png', size: 512, svg: monkeySvg({ size: 512 }) },
  {
    name: 'icon-maskable-512.png',
    size: 512,
    svg: monkeySvg({ size: 512, padding: 512 * 0.1, rounded: false }),
  },
  { name: 'apple-touch-icon.png', size: 180, svg: monkeySvg({ size: 180 }) },
]

for (const out of outputs) {
  const png = await sharp(Buffer.from(out.svg)).png().toBuffer()
  writeFileSync(resolve(OUT, out.name), png)
  console.log(`wrote ${out.name} (${out.size}×${out.size})`)
}

const favBuffers = await Promise.all(
  [16, 32, 48].map((sz) => sharp(Buffer.from(monkeySvg({ size: sz }))).png().toBuffer()),
)

function buildIco(pngs, sizes) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  const entries = []
  let offset = 6 + pngs.length * 16
  for (let i = 0; i < pngs.length; i++) {
    const e = Buffer.alloc(16)
    const sz = sizes[i] === 256 ? 0 : sizes[i]
    e.writeUInt8(sz, 0)
    e.writeUInt8(sz, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(pngs[i].length, 8)
    e.writeUInt32LE(offset, 12)
    offset += pngs[i].length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...pngs])
}

writeFileSync(resolve(OUT, 'favicon.ico'), buildIco(favBuffers, [16, 32, 48]))
console.log('wrote favicon.ico (16+32+48 multi-size)')
