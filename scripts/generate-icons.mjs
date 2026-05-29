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
 * The monkey is drawn with organic Bézier paths — no stacked circle shapes
 * for structural elements. Circles are only used for tiny details (pupils, shines).
 *
 * Key geometry (all at 512-unit canvas):
 *   Head:       wide rounded-blob path, lower-half heavy, cx≈256 cy≈300
 *   Ears:       floppy rounded path shapes on sides, not circles
 *   Face-patch: cream teardrop path covering eye+muzzle zone
 *   Eyes:       almond-shaped paths with curved upper lids, pupils=small circles
 *   Muzzle:     rounded bean path with friendly nose dot
 *   Smile:      open grin — a filled white arc showing teeth
 *   Cheeks:     soft rosy oval paths, not hard circles
 *   Hat:        tilted cone path with pom-pom, jaunty off-center
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
      <!-- Tilted hat cone clip -->
      <path d="M ${x(272)},${y(52)} C ${x(290)},${y(100)} ${x(340)},${y(170)} ${x(385)},${y(210)} L ${x(168)},${y(210)} C ${x(210)},${y(170)} ${x(255)},${y(100)} ${x(272)},${y(52)} Z"/>
    </clipPath>
    <clipPath id="headClip${size}">
      <!-- Head shape for clipping cheeks/features inside head -->
      <path d="M ${x(256)},${y(110)}
               C ${x(330)},${y(108)} ${x(430)},${y(170)} ${x(445)},${y(270)}
               C ${x(460)},${y(370)} ${x(400)},${y(478)} ${x(256)},${y(480)}
               C ${x(112)},${y(478)} ${x(52)},${y(370)} ${x(67)},${y(270)}
               C ${x(82)},${y(170)} ${x(182)},${y(108)} ${x(256)},${y(110)} Z"/>
    </clipPath>
  </defs>

  ${bg}

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- PARTY HAT — drawn first so the head overlaps its base     -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Hat body: jaunty tilted cone, banana yellow -->
  <!-- Slightly tilted right (+12 deg feel), tip off-center -->
  <path d="M ${x(272)},${y(52)}
           C ${x(290)},${y(100)} ${x(340)},${y(170)} ${x(385)},${y(210)}
           L ${x(168)},${y(210)}
           C ${x(210)},${y(170)} ${x(255)},${y(100)} ${x(272)},${y(52)} Z"
        fill="${BANANA}"/>

  <!-- Hat decorative dots (raspberry), clipped to hat shape -->
  <g clip-path="url(#hatClip${size})">
    <circle cx="${x(258)}" cy="${y(118)}" r="${d(13)}" fill="${BG_RASPBERRY}"/>
    <circle cx="${x(300)}" cy="${y(163)}" r="${d(13)}" fill="${BG_RASPBERRY}"/>
    <circle cx="${x(220)}" cy="${y(170)}" r="${d(10)}" fill="${BG_RASPBERRY}"/>
  </g>

  <!-- Hat band: raspberry stripe across the base, slight curve -->
  <path d="M ${x(163)},${y(204)} C ${x(255)},${y(222)} ${x(340)},${y(220)} ${x(390)},${y(207)}
           C ${x(390)},${y(220)} ${x(360)},${y(228)} ${x(276)},${y(228)}
           C ${x(195)},${y(228)} ${x(163)},${y(220)} ${x(163)},${y(204)} Z"
        fill="${BG_RASPBERRY}"/>

  <!-- Pom-pom: fluffy mint blob at hat tip -->
  <circle cx="${x(270)}" cy="${y(44)}" r="${d(26)}" fill="${MINT}"/>
  <!-- Pom-pom highlight -->
  <circle cx="${x(262)}" cy="${y(36)}" r="${d(11)}" fill="white" opacity="0.60"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- EARS — floppy rounded blobs behind the head               -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Left ear: a floppy rounded kidney/blob shape -->
  <path d="M ${x(82)},${y(200)}
           C ${x(42)},${y(195)} ${x(28)},${y(220)} ${x(32)},${y(255)}
           C ${x(36)},${y(295)} ${x(72)},${y(310)} ${x(112)},${y(298)}
           C ${x(138)},${y(290)} ${x(148)},${y(268)} ${x(140)},${y(240)}
           C ${x(132)},${y(210)} ${x(110)},${y(202)} ${x(82)},${y(200)} Z"
        fill="${COCOA_MID}"/>
  <!-- Left inner ear cream -->
  <path d="M ${x(86)},${y(216)}
           C ${x(62)},${y(214)} ${x(52)},${y(232)} ${x(54)},${y(258)}
           C ${x(58)},${y(286)} ${x(80)},${y(296)} ${x(106)},${y(286)}
           C ${x(124)},${y(278)} ${x(130)},${y(258)} ${x(122)},${y(238)}
           C ${x(114)},${y(218)} ${x(100)},${y(216)} ${x(86)},${y(216)} Z"
        fill="${CREAM}"/>

  <!-- Right ear: mirrored floppy blob -->
  <path d="M ${x(430)},${y(200)}
           C ${x(470)},${y(195)} ${x(484)},${y(220)} ${x(480)},${y(255)}
           C ${x(476)},${y(295)} ${x(440)},${y(310)} ${x(400)},${y(298)}
           C ${x(374)},${y(290)} ${x(364)},${y(268)} ${x(372)},${y(240)}
           C ${x(380)},${y(210)} ${x(402)},${y(202)} ${x(430)},${y(200)} Z"
        fill="${COCOA_MID}"/>
  <!-- Right inner ear cream -->
  <path d="M ${x(426)},${y(216)}
           C ${x(450)},${y(214)} ${x(460)},${y(232)} ${x(458)},${y(258)}
           C ${x(454)},${y(286)} ${x(432)},${y(296)} ${x(406)},${y(286)}
           C ${x(388)},${y(278)} ${x(382)},${y(258)} ${x(390)},${y(238)}
           C ${x(398)},${y(218)} ${x(412)},${y(216)} ${x(426)},${y(216)} Z"
        fill="${CREAM}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- HEAD — organic rounded blob, slightly pear-shaped         -->
  <!-- Wider at jaw/cheeks, slightly narrower at forehead        -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(110)}
           C ${x(330)},${y(108)} ${x(430)},${y(170)} ${x(445)},${y(270)}
           C ${x(460)},${y(370)} ${x(400)},${y(478)} ${x(256)},${y(480)}
           C ${x(112)},${y(478)} ${x(52)},${y(370)} ${x(67)},${y(270)}
           C ${x(82)},${y(170)} ${x(182)},${y(108)} ${x(256)},${y(110)} Z"
        fill="${COCOA_DARK}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- FACE PATCH — cream zone where eyes + muzzle live          -->
  <!-- Classic monkey "mask": a wide rounded heart/teardrop      -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(200)}
           C ${x(310)},${y(195)} ${x(370)},${y(220)} ${x(375)},${y(285)}
           C ${x(380)},${y(340)} ${x(345)},${y(410)} ${x(295)},${y(435)}
           C ${x(270)},${y(446)} ${x(242)},${y(446)} ${x(217)},${y(435)}
           C ${x(167)},${y(410)} ${x(132)},${y(340)} ${x(137)},${y(285)}
           C ${x(142)},${y(220)} ${x(202)},${y(195)} ${x(256)},${y(200)} Z"
        fill="${CREAM}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- CHEEKS — soft rosy blobs, slight asymmetry for charm      -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- Left cheek -->
  <path d="M ${x(148)},${y(315)}
           C ${x(132)},${y(308)} ${x(122)},${y(322)} ${x(124)},${y(344)}
           C ${x(128)},${y(368)} ${x(150)},${y(378)} ${x(172)},${y(370)}
           C ${x(190)},${y(362)} ${x(192)},${y(342)} ${x(180)},${y(324)}
           C ${x(170)},${y(312)} ${x(158)},${y(312)} ${x(148)},${y(315)} Z"
        fill="${ROSY}" opacity="0.85"/>
  <!-- Right cheek -->
  <path d="M ${x(364)},${y(315)}
           C ${x(380)},${y(308)} ${x(390)},${y(322)} ${x(388)},${y(344)}
           C ${x(384)},${y(368)} ${x(362)},${y(378)} ${x(340)},${y(370)}
           C ${x(322)},${y(362)} ${x(320)},${y(342)} ${x(332)},${y(324)}
           C ${x(342)},${y(312)} ${x(354)},${y(312)} ${x(364)},${y(315)} Z"
        fill="${ROSY}" opacity="0.85"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MUZZLE — rounded protruding bean/snout shape              -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(340)}
           C ${x(296)},${y(338)} ${x(326)},${y(352)} ${x(328)},${y(378)}
           C ${x(330)},${y(406)} ${x(304)},${y(424)} ${x(256)},${y(426)}
           C ${x(208)},${y(424)} ${x(182)},${y(406)} ${x(184)},${y(378)}
           C ${x(186)},${y(352)} ${x(216)},${y(338)} ${x(256)},${y(340)} Z"
        fill="${CREAM}"/>

  <!-- Nose: friendly rounded-triangle/cat-nose shape -->
  <path d="M ${x(256)},${y(354)}
           C ${x(248)},${y(354)} ${x(242)},${y(358)} ${x(244)},${y(366)}
           C ${x(246)},${y(373)} ${x(252)},${y(374)} ${x(256)},${y(374)}
           C ${x(260)},${y(374)} ${x(266)},${y(373)} ${x(268)},${y(366)}
           C ${x(270)},${y(358)} ${x(264)},${y(354)} ${x(256)},${y(354)} Z"
        fill="${COCOA_DARK}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- SMILE — wide happy open grin, shows a little cream/white  -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- Outer smile arc (dark outline of lips) -->
  <path d="M ${x(210)},${y(382)}
           C ${x(218)},${y(400)} ${x(236)},${y(416)} ${x(256)},${y(416)}
           C ${x(276)},${y(416)} ${x(294)},${y(400)} ${x(302)},${y(382)}
           C ${x(290)},${y(390)} ${x(274)},${y(395)} ${x(256)},${y(395)}
           C ${x(238)},${y(395)} ${x(222)},${y(390)} ${x(210)},${y(382)} Z"
        fill="${COCOA_DARK}"/>
  <!-- Inner mouth / teeth — bright white grin -->
  <path d="M ${x(218)},${y(386)}
           C ${x(226)},${y(400)} ${x(240)},${y(408)} ${x(256)},${y(408)}
           C ${x(272)},${y(408)} ${x(286)},${y(400)} ${x(294)},${y(386)}
           C ${x(278)},${y(393)} ${x(268)},${y(390)} ${x(256)},${y(390)}
           C ${x(244)},${y(390)} ${x(233)},${y(393)} ${x(218)},${y(386)} Z"
        fill="white"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- EYES — almond/curved-lid shapes for joyful expression     -->
  <!-- Upper lid curves upward giving delighted arched look      -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Left eye white (almond sclera) -->
  <path d="M ${x(170)},${y(258)}
           C ${x(175)},${y(232)} ${x(195)},${y(222)} ${x(213)},${y(228)}
           C ${x(231)},${y(234)} ${x(238)},${y(252)} ${x(233)},${y(272)}
           C ${x(228)},${y(290)} ${x(208)},${y(296)} ${x(190)},${y(290)}
           C ${x(172)},${y(284)} ${x(166)},${y(270)} ${x(170)},${y(258)} Z"
        fill="white"/>
  <!-- Left pupil -->
  <circle cx="${x(202)}" cy="${y(258)}" r="${d(16)}" fill="${COCOA_DARK}"/>
  <!-- Left eye shine -->
  <circle cx="${x(194)}" cy="${y(250)}" r="${d(7)}" fill="white"/>

  <!-- Left upper eyelid arc — curved for cheerful squint -->
  <path d="M ${x(168)},${y(256)}
           C ${x(176)},${y(230)} ${x(200)},${y(218)} ${x(236)},${y(230)}"
        fill="none" stroke="${COCOA_DARK}" stroke-width="${d(5)}" stroke-linecap="round"/>

  <!-- Right eye white (almond sclera) -->
  <path d="M ${x(342)},${y(258)}
           C ${x(347)},${y(232)} ${x(327)},${y(222)} ${x(309)},${y(228)}
           C ${x(291)},${y(234)} ${x(284)},${y(252)} ${x(289)},${y(272)}
           C ${x(294)},${y(290)} ${x(314)},${y(296)} ${x(332)},${y(290)}
           C ${x(350)},${y(284)} ${x(346)},${y(270)} ${x(342)},${y(258)} Z"
        fill="white"/>
  <!-- Right pupil -->
  <circle cx="${x(310)}" cy="${y(258)}" r="${d(16)}" fill="${COCOA_DARK}"/>
  <!-- Right eye shine -->
  <circle cx="${x(302)}" cy="${y(250)}" r="${d(7)}" fill="white"/>

  <!-- Right upper eyelid arc -->
  <path d="M ${x(344)},${y(256)}
           C ${x(336)},${y(230)} ${x(312)},${y(218)} ${x(276)},${y(230)}"
        fill="none" stroke="${COCOA_DARK}" stroke-width="${d(5)}" stroke-linecap="round"/>

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
