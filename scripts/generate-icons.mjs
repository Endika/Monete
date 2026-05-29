import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('public')
mkdirSync(OUT, { recursive: true })

// Brand palette — per design brief
const FUR = '#B0744A' // warm brown fur
const FUR_DARK = '#6B4128' // darker outline / shadow shapes
const PEACH = '#F0C9A0' // face-mask, muzzle, inner ears, hands
const IRIS = '#D98E33' // amber-brown iris
const PUPIL = '#3A2A20' // dark pupil
const BROW = '#5A3A24' // eyebrows + key outlines
const CHEEK = '#FF8FA8' // rosy blush cheeks
const MOUTH_INT = '#7A3B3B' // mouth interior
const TONGUE = '#FF6B81' // tongue
const BG_CREAM = '#FFF7EE' // icon background square

// Confetti ball palette
const CONF_RASP = '#FF4D79'
const CONF_BAN = '#FFC53D'
const CONF_MINT = '#34D399'
const CONF_SKY = '#56A8FF'
const CONF_GRAPE = '#A66CFF'

/**
 * Renders the Monete monkey mascot centered inside a square canvas of `size` px.
 * When `withBackground` is true, draws a warm cream rounded-square background (app icon).
 * When false, renders transparent background (for standalone SVG use).
 * `padding` adds safe-zone inset for maskable icons.
 *
 * Design canvas: 512×512, scaled via `s`.
 *
 * The monkey is drawn entirely with organic cubic Bézier <path> curves.
 * Circles are ONLY used for tiny details: pupils, eye highlights, and confetti balls.
 *
 * Key geometry (all at 512-unit canvas):
 *   Head:        wide warm-brown rounded-blob path, slightly wider at cheeks
 *   Ears:        large floppy rounded paths on sides with peach inner-ear fills
 *   Hair tuft:   small pointy cowlick path on top-right of head crown
 *   Face-mask:   peach rounded oval path covering eye+muzzle zone
 *   Eyes:        big round almond paths (large white sclera), amber iris, dark pupil
 *   Eyebrows:    thick curved dark strokes raised cheerfully above eyes
 *   Cheeks:      rosy soft oval paths, positioned outside the face-mask
 *   Muzzle:      rounded dome/bean path below nose line
 *   Mouth:       wide open grin — dark lip arc + white teeth + tongue path
 *   Confetti:    small glossy colored circles floating around head
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
    ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius.toFixed(2)}" ry="${radius.toFixed(2)}" fill="${BG_CREAM}"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- CONFETTI BALLS — festive glossy spheres around the head   -->
  <!-- Drawn first so the monkey overlaps them naturally         -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Raspberry ball top-left -->
  <circle cx="${x(78)}" cy="${y(148)}" r="${d(26)}" fill="${CONF_RASP}"/>
  <circle cx="${x(70)}" cy="${y(140)}" r="${d(10)}" fill="white" opacity="0.45"/>

  <!-- Banana ball top-right -->
  <circle cx="${x(434)}" cy="${y(112)}" r="${d(22)}" fill="${CONF_BAN}"/>
  <circle cx="${x(426)}" cy="${y(104)}" r="${d(8)}" fill="white" opacity="0.45"/>

  <!-- Mint ball far-right -->
  <circle cx="${x(466)}" cy="${y(308)}" r="${d(20)}" fill="${CONF_MINT}"/>
  <circle cx="${x(459)}" cy="${y(300)}" r="${d(7)}" fill="white" opacity="0.45"/>

  <!-- Sky ball bottom-left -->
  <circle cx="${x(62)}" cy="${y(390)}" r="${d(18)}" fill="${CONF_SKY}"/>
  <circle cx="${x(56)}" cy="${y(383)}" r="${d(6)}" fill="white" opacity="0.45"/>

  <!-- Grape ball top-center-right -->
  <circle cx="${x(390)}" cy="${y(60)}" r="${d(17)}" fill="${CONF_GRAPE}"/>
  <circle cx="${x(384)}" cy="${y(53)}" r="${d(6)}" fill="white" opacity="0.45"/>

  <!-- Extra small raspberry bottom-right -->
  <circle cx="${x(448)}" cy="${y(420)}" r="${d(15)}" fill="${CONF_RASP}"/>
  <circle cx="${x(443)}" cy="${y(414)}" r="${d(5)}" fill="white" opacity="0.45"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- EARS — large floppy rounded blob shapes, behind head      -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Left ear outer (warm brown) — big rounded kidney blob -->
  <path d="M ${x(98)},${y(226)}
           C ${x(48)},${y(210)} ${x(22)},${y(245)} ${x(26)},${y(292)}
           C ${x(30)},${y(340)} ${x(76)},${y(368)} ${x(128)},${y(350)}
           C ${x(162)},${y(338)} ${x(174)},${y(306)} ${x(162)},${y(268)}
           C ${x(150)},${y(230)} ${x(128)},${y(220)} ${x(98)},${y(226)} Z"
        fill="${FUR}"/>
  <!-- Left ear darker shadow rim -->
  <path d="M ${x(100)},${y(230)}
           C ${x(56)},${y(216)} ${x(34)},${y(248)} ${x(38)},${y(290)}
           C ${x(42)},${y(330)} ${x(82)},${y(354)} ${x(124)},${y(340)}
           C ${x(152)},${y(330)} ${x(162)},${y(302)} ${x(152)},${y(270)}
           C ${x(142)},${y(236)} ${x(122)},${y(226)} ${x(100)},${y(230)} Z"
        fill="${FUR_DARK}" opacity="0.35"/>
  <!-- Left inner ear (peach) -->
  <path d="M ${x(102)},${y(248)}
           C ${x(72)},${y(240)} ${x(56)},${y(260)} ${x(60)},${y(292)}
           C ${x(64)},${y(322)} ${x(90)},${y(338)} ${x(118)},${y(328)}
           C ${x(140)},${y(320)} ${x(148)},${y(296)} ${x(138)},${y(270)}
           C ${x(128)},${y(248)} ${x(114)},${y(244)} ${x(102)},${y(248)} Z"
        fill="${PEACH}"/>

  <!-- Right ear outer (warm brown) -->
  <path d="M ${x(414)},${y(226)}
           C ${x(464)},${y(210)} ${x(490)},${y(245)} ${x(486)},${y(292)}
           C ${x(482)},${y(340)} ${x(436)},${y(368)} ${x(384)},${y(350)}
           C ${x(350)},${y(338)} ${x(338)},${y(306)} ${x(350)},${y(268)}
           C ${x(362)},${y(230)} ${x(384)},${y(220)} ${x(414)},${y(226)} Z"
        fill="${FUR}"/>
  <!-- Right ear darker shadow rim -->
  <path d="M ${x(412)},${y(230)}
           C ${x(456)},${y(216)} ${x(478)},${y(248)} ${x(474)},${y(290)}
           C ${x(470)},${y(330)} ${x(430)},${y(354)} ${x(388)},${y(340)}
           C ${x(360)},${y(330)} ${x(350)},${y(302)} ${x(360)},${y(270)}
           C ${x(370)},${y(236)} ${x(390)},${y(226)} ${x(412)},${y(230)} Z"
        fill="${FUR_DARK}" opacity="0.35"/>
  <!-- Right inner ear (peach) -->
  <path d="M ${x(410)},${y(248)}
           C ${x(440)},${y(240)} ${x(456)},${y(260)} ${x(452)},${y(292)}
           C ${x(448)},${y(322)} ${x(422)},${y(338)} ${x(394)},${y(328)}
           C ${x(372)},${y(320)} ${x(364)},${y(296)} ${x(374)},${y(270)}
           C ${x(384)},${y(248)} ${x(398)},${y(244)} ${x(410)},${y(248)} Z"
        fill="${PEACH}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- HEAD — big warm-brown organic blob                        -->
  <!-- Wider at cheeks/jaw, slightly tapered up top, no flat     -->
  <!-- edges — all curves for a soft friendly character feel     -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(96)}
           C ${x(316)},${y(92)} ${x(408)},${y(138)} ${x(432)},${y(240)}
           C ${x(452)},${y(328)} ${x(418)},${y(444)} ${x(310)},${y(484)}
           C ${x(282)},${y(492)} ${x(230)},${y(492)} ${x(202)},${y(484)}
           C ${x(94)},${y(444)} ${x(60)},${y(328)} ${x(80)},${y(240)}
           C ${x(104)},${y(138)} ${x(196)},${y(92)} ${x(256)},${y(96)} Z"
        fill="${FUR}"/>

  <!-- Head shadow / depth — a darker crescent on left+top giving dimension -->
  <path d="M ${x(256)},${y(96)}
           C ${x(196)},${y(92)} ${x(104)},${y(138)} ${x(80)},${y(240)}
           C ${x(68)},${y(298)} ${x(78)},${y(360)} ${x(110)},${y(412)}
           C ${x(88)},${y(360)} ${x(84)},${y(298)} ${x(98)},${y(244)}
           C ${x(118)},${y(150)} ${x(204)},${y(108)} ${x(256)},${y(108)} Z"
        fill="${FUR_DARK}" opacity="0.28"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- HAIR TUFT — small pointy cowlick on top of head          -->
  <!-- Slightly off-center to the right for jaunty personality  -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(270)},${y(96)}
           C ${x(272)},${y(68)} ${x(292)},${y(44)} ${x(302)},${y(28)}
           C ${x(310)},${y(44)} ${x(316)},${y(60)} ${x(306)},${y(82)}
           C ${x(296)},${y(70)} ${x(282)},${y(74)} ${x(270)},${y(96)} Z"
        fill="${FUR_DARK}"/>
  <!-- Second tuft strand — slightly left, gives fluffy feel -->
  <path d="M ${x(256)},${y(96)}
           C ${x(256)},${y(72)} ${x(268)},${y(52)} ${x(274)},${y(38)}
           C ${x(280)},${y(52)} ${x(282)},${y(68)} ${x(274)},${y(88)}
           C ${x(268)},${y(80)} ${x(260)},${y(82)} ${x(256)},${y(96)} Z"
        fill="${FUR}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- FACE MASK — peach rounded oval covering eye+muzzle zone  -->
  <!-- Classic monkey face-patch, wider at middle, round at top -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(184)}
           C ${x(314)},${y(180)} ${x(374)},${y(212)} ${x(378)},${y(286)}
           C ${x(382)},${y(352)} ${x(346)},${y(432)} ${x(294)},${y(458)}
           C ${x(272)},${y(468)} ${x(240)},${y(468)} ${x(218)},${y(458)}
           C ${x(166)},${y(432)} ${x(130)},${y(352)} ${x(134)},${y(286)}
           C ${x(138)},${y(212)} ${x(198)},${y(180)} ${x(256)},${y(184)} Z"
        fill="${PEACH}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- CHEEKS — rosy soft blobs, peeking out from face-mask     -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- Left blush cheek -->
  <path d="M ${x(152)},${y(328)}
           C ${x(134)},${y(318)} ${x(122)},${y(334)} ${x(126)},${y(360)}
           C ${x(130)},${y(386)} ${x(156)},${y(400)} ${x(182)},${y(390)}
           C ${x(202)},${y(382)} ${x(206)},${y(358)} ${x(192)},${y(336)}
           C ${x(180)},${y(320)} ${x(164)},${y(320)} ${x(152)},${y(328)} Z"
        fill="${CHEEK}" opacity="0.82"/>
  <!-- Right blush cheek -->
  <path d="M ${x(360)},${y(328)}
           C ${x(378)},${y(318)} ${x(390)},${y(334)} ${x(386)},${y(360)}
           C ${x(382)},${y(386)} ${x(356)},${y(400)} ${x(330)},${y(390)}
           C ${x(310)},${y(382)} ${x(306)},${y(358)} ${x(320)},${y(336)}
           C ${x(332)},${y(320)} ${x(348)},${y(320)} ${x(360)},${y(328)} Z"
        fill="${CHEEK}" opacity="0.82"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- MUZZLE — rounded dome/bean shape, lower face             -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <path d="M ${x(256)},${y(348)}
           C ${x(302)},${y(344)} ${x(336)},${y(360)} ${x(338)},${y(392)}
           C ${x(340)},${y(426)} ${x(312)},${y(450)} ${x(256)},${y(452)}
           C ${x(200)},${y(450)} ${x(172)},${y(426)} ${x(174)},${y(392)}
           C ${x(176)},${y(360)} ${x(210)},${y(344)} ${x(256)},${y(348)} Z"
        fill="${PEACH}"/>

  <!-- Muzzle shadow line (center crease) giving it 3D dome feel -->
  <path d="M ${x(256)},${y(352)} C ${x(256)},${y(380)} ${x(256)},${y(400)} ${x(256)},${y(420)}"
        fill="none" stroke="${FUR_DARK}" stroke-width="${d(2.5)}" stroke-linecap="round" opacity="0.25"/>

  <!-- Nose — friendly rounded arch (not circle, a path) -->
  <path d="M ${x(238)},${y(362)}
           C ${x(238)},${y(350)} ${x(250)},${y(344)} ${x(256)},${y(346)}
           C ${x(262)},${y(344)} ${x(274)},${y(350)} ${x(274)},${y(362)}
           C ${x(270)},${y(370)} ${x(260)},${y(374)} ${x(256)},${y(374)}
           C ${x(252)},${y(374)} ${x(242)},${y(370)} ${x(238)},${y(362)} Z"
        fill="${BROW}"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- SMILE — wide open laughing grin with tongue              -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- Wide dark outer lip / grin shape -->
  <path d="M ${x(200)},${y(392)}
           C ${x(210)},${y(422)} ${x(232)},${y(446)} ${x(256)},${y(448)}
           C ${x(280)},${y(446)} ${x(302)},${y(422)} ${x(312)},${y(392)}
           C ${x(296)},${y(406)} ${x(278)},${y(414)} ${x(256)},${y(414)}
           C ${x(234)},${y(414)} ${x(216)},${y(406)} ${x(200)},${y(392)} Z"
        fill="${MOUTH_INT}"/>
  <!-- Teeth — upper white band inside the grin opening -->
  <path d="M ${x(208)},${y(395)}
           C ${x(218)},${y(408)} ${x(236)},${y(414)} ${x(256)},${y(414)}
           C ${x(276)},${y(414)} ${x(294)},${y(408)} ${x(304)},${y(395)}
           C ${x(290)},${y(405)} ${x(274)},${y(408)} ${x(256)},${y(408)}
           C ${x(238)},${y(408)} ${x(222)},${y(405)} ${x(208)},${y(395)} Z"
        fill="white"/>
  <!-- Tongue — small pink curved blob inside the mouth -->
  <path d="M ${x(236)},${y(418)}
           C ${x(236)},${y(408)} ${x(246)},${y(404)} ${x(256)},${y(404)}
           C ${x(266)},${y(404)} ${x(276)},${y(408)} ${x(276)},${y(418)}
           C ${x(276)},${y(434)} ${x(266)},${y(440)} ${x(256)},${y(440)}
           C ${x(246)},${y(440)} ${x(236)},${y(434)} ${x(236)},${y(418)} Z"
        fill="${TONGUE}"/>
  <!-- Tongue center line groove -->
  <path d="M ${x(256)},${y(406)} C ${x(256)},${y(418)} ${x(256)},${y(428)} ${x(256)},${y(438)}"
        fill="none" stroke="#D44060" stroke-width="${d(2)}" stroke-linecap="round" opacity="0.5"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- EYES — big round almond-ish shapes (large, bright, happy) -->
  <!-- Large sclera for maximum expressiveness at icon sizes     -->
  <!-- ══════════════════════════════════════════════════════════ -->

  <!-- Left eye white (large rounded almond, tilted slightly up) -->
  <path d="M ${x(158)},${y(252)}
           C ${x(162)},${y(216)} ${x(192)},${y(200)} ${x(218)},${y(208)}
           C ${x(244)},${y(216)} ${x(252)},${y(244)} ${x(244)},${y(272)}
           C ${x(236)},${y(298)} ${x(208)},${y(308)} ${x(184)},${y(298)}
           C ${x(160)},${y(288)} ${x(154)},${y(268)} ${x(158)},${y(252)} Z"
        fill="white"/>
  <!-- Left iris — warm amber (path for slight oval) -->
  <path d="M ${x(178)},${y(250)}
           C ${x(182)},${y(232)} ${x(196)},${y(224)} ${x(210)},${y(228)}
           C ${x(224)},${y(232)} ${x(230)},${y(246)} ${x(226)},${y(264)}
           C ${x(222)},${y(280)} ${x(208)},${y(286)} ${x(194)},${y(282)}
           C ${x(180)},${y(278)} ${x(174)},${y(264)} ${x(178)},${y(250)} Z"
        fill="${IRIS}"/>
  <!-- Left pupil -->
  <circle cx="${x(204)}" cy="${y(256)}" r="${d(14)}" fill="${PUPIL}"/>
  <!-- Left eye shine — big white dot for sparkle -->
  <circle cx="${x(194)}" cy="${y(244)}" r="${d(8)}" fill="white"/>
  <!-- Small secondary shine -->
  <circle cx="${x(212)}" cy="${y(264)}" r="${d(4)}" fill="white" opacity="0.7"/>

  <!-- Right eye white (large rounded almond, mirrored) -->
  <path d="M ${x(354)},${y(252)}
           C ${x(350)},${y(216)} ${x(320)},${y(200)} ${x(294)},${y(208)}
           C ${x(268)},${y(216)} ${x(260)},${y(244)} ${x(268)},${y(272)}
           C ${x(276)},${y(298)} ${x(304)},${y(308)} ${x(328)},${y(298)}
           C ${x(352)},${y(288)} ${x(358)},${y(268)} ${x(354)},${y(252)} Z"
        fill="white"/>
  <!-- Right iris -->
  <path d="M ${x(334)},${y(250)}
           C ${x(330)},${y(232)} ${x(316)},${y(224)} ${x(302)},${y(228)}
           C ${x(288)},${y(232)} ${x(282)},${y(246)} ${x(286)},${y(264)}
           C ${x(290)},${y(280)} ${x(304)},${y(286)} ${x(318)},${y(282)}
           C ${x(332)},${y(278)} ${x(338)},${y(264)} ${x(334)},${y(250)} Z"
        fill="${IRIS}"/>
  <!-- Right pupil -->
  <circle cx="${x(308)}" cy="${y(256)}" r="${d(14)}" fill="${PUPIL}"/>
  <!-- Right eye shine -->
  <circle cx="${x(298)}" cy="${y(244)}" r="${d(8)}" fill="white"/>
  <!-- Small secondary shine -->
  <circle cx="${x(316)}" cy="${y(264)}" r="${d(4)}" fill="white" opacity="0.7"/>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- EYEBROWS — thick dark curved arches, raised high =        -->
  <!-- cheerful/delighted expression                             -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- Left eyebrow — thick arched stroke, raised toward center  -->
  <path d="M ${x(156)},${y(218)}
           C ${x(172)},${y(196)} ${x(204)},${y(188)} ${x(238)},${y(200)}"
        fill="none" stroke="${BROW}" stroke-width="${d(10)}" stroke-linecap="round"/>

  <!-- Right eyebrow — mirrored, raised -->
  <path d="M ${x(356)},${y(218)}
           C ${x(340)},${y(196)} ${x(308)},${y(188)} ${x(274)},${y(200)}"
        fill="none" stroke="${BROW}" stroke-width="${d(10)}" stroke-linecap="round"/>

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
