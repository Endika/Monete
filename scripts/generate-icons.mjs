import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('public')
mkdirSync(OUT, { recursive: true })

// Brand palette
const BG_CREAM = '#FFF7EE'
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
 */
function monkeySvg({ size, withBackground = true, padding = 0 }) {
  const radius = size * 0.22

  // All coordinates are designed at 512×512 and scaled down.
  const s = (size - padding * 2) / 512
  const ox = padding
  const oy = padding

  // Helper: scale + offset a coordinate pair
  const x = (v) => (ox + v * s).toFixed(2)
  const y = (v) => (oy + v * s).toFixed(2)
  const d = (v) => (v * s).toFixed(2)

  const bg = withBackground
    ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${BG_RASPBERRY}"/>`
    : ''

  // ── Head (main round circle) ──────────────────────────────────────────────
  // Center at (256, 272), r=165
  const headCx = 256
  const headCy = 272
  const headR = 165

  // ── Ears (two circles behind the head) ───────────────────────────────────
  // Left ear outer: cx=108, cy=240, r=54
  // Right ear outer: cx=404, cy=240, r=54
  // Inner ear (cream): same center, r=34

  // ── Eyes ─────────────────────────────────────────────────────────────────
  // Left eye: cx=205, cy=248, r=20; pupil r=10
  // Right eye: cx=307, cy=248, r=20; pupil r=10
  // Eye-shine: r=5 offset up-left

  // ── Muzzle ───────────────────────────────────────────────────────────────
  // Ellipse cx=256, cy=320, rx=72, ry=52

  // ── Nostrils ─────────────────────────────────────────────────────────────
  // Left: cx=238, cy=315, r=8; Right: cx=274, cy=315, r=8

  // ── Cheeks ───────────────────────────────────────────────────────────────
  // Left: cx=168, cy=305, r=30; Right: cx=344, cy=305, r=30

  // ── Smile ────────────────────────────────────────────────────────────────
  // Arc path

  // ── Party hat ────────────────────────────────────────────────────────────
  // Triangle tip at (256, 72), base at (196,178) and (316,178)
  // Hat stripes: horizontal lines
  // Confetti dots: small circles
  // Pom-pom: circle at tip (256, 65), r=18

  // ── Hat band ─────────────────────────────────────────────────────────────
  // Ellipse at hat base: cx=256, cy=178, rx=60, ry=12

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}

  <!-- Left outer ear -->
  <circle cx="${x(108)}" cy="${y(240)}" r="${d(54)}" fill="${COCOA_MID}"/>
  <!-- Right outer ear -->
  <circle cx="${x(404)}" cy="${y(240)}" r="${d(54)}" fill="${COCOA_MID}"/>
  <!-- Left inner ear -->
  <circle cx="${x(108)}" cy="${y(240)}" r="${d(34)}" fill="${CREAM}"/>
  <!-- Right inner ear -->
  <circle cx="${x(404)}" cy="${y(240)}" r="${d(34)}" fill="${CREAM}"/>

  <!-- Head -->
  <circle cx="${x(headCx)}" cy="${y(headCy)}" r="${d(headR)}" fill="${COCOA_DARK}"/>

  <!-- Cheeks -->
  <circle cx="${x(168)}" cy="${y(305)}" r="${d(30)}" fill="${ROSY}" opacity="0.72"/>
  <circle cx="${x(344)}" cy="${y(305)}" r="${d(30)}" fill="${ROSY}" opacity="0.72"/>

  <!-- Muzzle -->
  <ellipse cx="${x(256)}" cy="${y(320)}" rx="${d(72)}" ry="${d(52)}" fill="${CREAM}"/>

  <!-- Nostrils -->
  <circle cx="${x(238)}" cy="${y(315)}" r="${d(8)}" fill="${COCOA_DARK}"/>
  <circle cx="${x(274)}" cy="${y(315)}" r="${d(8)}" fill="${COCOA_DARK}"/>

  <!-- Smile -->
  <path d="M ${x(228)} ${y(340)} Q ${x(256)} ${y(360)} ${x(284)} ${y(340)}"
        fill="none" stroke="${COCOA_DARK}" stroke-width="${d(5)}" stroke-linecap="round"/>

  <!-- Eyes (white sclera) -->
  <circle cx="${x(205)}" cy="${y(248)}" r="${d(20)}" fill="white"/>
  <circle cx="${x(307)}" cy="${y(248)}" r="${d(20)}" fill="white"/>
  <!-- Pupils -->
  <circle cx="${x(207)}" cy="${y(250)}" r="${d(11)}" fill="${COCOA_DARK}"/>
  <circle cx="${x(309)}" cy="${y(250)}" r="${d(11)}" fill="${COCOA_DARK}"/>
  <!-- Eye shine -->
  <circle cx="${x(201)}" cy="${y(244)}" r="${d(5)}" fill="white" opacity="0.85"/>
  <circle cx="${x(303)}" cy="${y(244)}" r="${d(5)}" fill="white" opacity="0.85"/>

  <!-- Party hat (triangle) -->
  <polygon points="${x(256)},${y(80)} ${x(192)},${y(182)} ${x(320)},${y(182)}"
           fill="${BANANA}"/>

  <!-- Hat raspberry stripes (horizontal bands inside triangle, clipped) -->
  <clipPath id="hatClip">
    <polygon points="${x(256)},${y(80)} ${x(192)},${y(182)} ${x(320)},${y(182)}"/>
  </clipPath>
  <g clip-path="url(#hatClip)">
    <rect x="${x(180)}" y="${y(110)}" width="${d(152)}" height="${d(14)}" fill="${BG_RASPBERRY}" opacity="0.75"/>
    <rect x="${x(180)}" y="${y(140)}" width="${d(152)}" height="${d(14)}" fill="${BG_RASPBERRY}" opacity="0.75"/>
    <rect x="${x(180)}" y="${y(165)}" width="${d(152)}" height="${d(10)}" fill="${BG_RASPBERRY}" opacity="0.75"/>
    <!-- Confetti dots on hat -->
    <circle cx="${x(248)}" cy="${y(102)}" r="${d(5)}" fill="white" opacity="0.9"/>
    <circle cx="${x(264)}" cy="${y(130)}" r="${d(5)}" fill="${MINT}" opacity="0.9"/>
    <circle cx="${x(240)}" cy="${y(155)}" r="${d(5)}" fill="white" opacity="0.9"/>
    <circle cx="${x(270)}" cy="${y(155)}" r="${d(5)}" fill="${MINT}" opacity="0.9"/>
  </g>

  <!-- Hat band -->
  <ellipse cx="${x(256)}" cy="${y(182)}" rx="${d(64)}" ry="${d(13)}" fill="${BG_RASPBERRY}"/>

  <!-- Pom-pom -->
  <circle cx="${x(256)}" cy="${y(72)}" r="${d(18)}" fill="${MINT}"/>
  <circle cx="${x(256)}" cy="${y(72)}" r="${d(10)}" fill="white" opacity="0.6"/>
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
