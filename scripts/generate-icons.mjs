import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('public')
mkdirSync(OUT, { recursive: true })

// Brand palette
const FUR = '#B0744A'
const OUTLINE = '#5A3A24'
const PEACH = '#F0C9A0'
const PUPIL = '#3A2A20'
const CHEEK = '#FF8FA8'
const MOUTH_INT = '#7A3B3B'
const TONGUE = '#FF6B81'
const BG_CREAM = '#FFF7EE'

// Confetti palette
const CONF_RASP = '#FF4D79'
const CONF_BAN = '#FFC53D'
const CONF_MINT = '#34D399'
const CONF_SKY = '#56A8FF'
const CONF_GRAPE = '#A66CFF'

/**
 * CHILD'S CRAYON DRAWING of a happy monkey.
 *
 * Design intent: looks like a happy 6-year-old drew it.
 *   • Strongly asymmetric: left eye bigger/higher, right ear bigger, head lumpy
 *   • Thick uneven crayon strokes — stroke-width swings from 5 to 16
 *   • Color visibly OUTSIDE the lines (fills offset 6–12 px from outlines)
 *   • Scribble fills for cheeks (back-and-forth crayon hatching)
 *   • Lopsided 5-point crayon stars in confetti
 *   • feTurbulence scale bumped to 8–10 for real jitter
 *   • Paths baked with heavy irregularity — NOT symmetric
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

  // Strong crayon roughen filter — bigger displacement for real jitter
  const defs = `
  <defs>
    <filter id="roughen" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="turbulence" baseFrequency="0.025 0.030" numOctaves="4" seed="13" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${d(9)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="roughen-fill" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="turbulence" baseFrequency="0.018 0.022" numOctaves="3" seed="5" result="noise2"/>
      <feDisplacementMap in="SourceGraphic" in2="noise2" scale="${d(7)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="crayon-grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="2" result="grain"/>
      <feColorMatrix type="saturate" values="0" in="grain" result="grey"/>
      <feBlend in="SourceGraphic" in2="grey" mode="multiply" result="blended"/>
      <feComposite in="blended" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  ${defs}

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- CONFETTI — lopsided crayon stars, wobbly dots, crossed lines  -->
  <!-- Kid's party marks, deliberately wonky                         -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen)" stroke-linecap="round" stroke-linejoin="round">

    <!-- Raspberry lopsided star top-left — 5 jagged points, uneven arms -->
    <path d="M ${x(72)},${y(110)}
             L ${x(80)},${y(88)} L ${x(92)},${y(104)}
             L ${x(110)},${y(90)} L ${x(100)},${y(112)}
             L ${x(118)},${y(118)} L ${x(98)},${y(126)}
             L ${x(106)},${y(148)} L ${x(84)},${y(132)}
             L ${x(62)},${y(144)} L ${x(68)},${y(122)}
             L ${x(48)},${y(112)} Z"
          fill="${CONF_RASP}" stroke="${CONF_RASP}" stroke-width="${d(2.5)}"/>

    <!-- Banana wobbly star top-right area -->
    <path d="M ${x(428)},${y(72)}
             L ${x(438)},${y(54)} L ${x(446)},${y(68)}
             L ${x(462)},${y(58)} L ${x(452)},${y(76)}
             L ${x(468)},${y(84)} L ${x(450)},${y(90)}
             L ${x(456)},${y(108)} L ${x(440)},${y(96)}
             L ${x(422)},${y(106)} L ${x(428)},${y(88)}
             L ${x(412)},${y(78)} Z"
          fill="${CONF_BAN}" stroke="${CONF_BAN}" stroke-width="${d(2)}"/>

    <!-- Mint lopsided star right-middle -->
    <path d="M ${x(476)},${y(280)}
             L ${x(483)},${y(264)} L ${x(490)},${y(278)}
             L ${x(504)},${y(270)} L ${x(496)},${y(286)}
             L ${x(508)},${y(296)} L ${x(492)},${y(298)}
             L ${x(494)},${y(315)} L ${x(480)},${y(306)}
             L ${x(466)},${y(314)} L ${x(470)},${y(298)}
             L ${x(456)},${y(288)} Z"
          fill="${CONF_MINT}" stroke="${CONF_MINT}" stroke-width="${d(2)}"/>

    <!-- Sky crossed lines / X mark bottom-left -->
    <path d="M ${x(46)},${y(362)} L ${x(74)},${y(408)}"
          stroke="${CONF_SKY}" stroke-width="${d(7)}" fill="none"/>
    <path d="M ${x(74)},${y(362)} L ${x(46)},${y(408)}"
          stroke="${CONF_SKY}" stroke-width="${d(7)}" fill="none"/>

    <!-- Grape star bottom-center-right -->
    <path d="M ${x(430)},${y(408)}
             L ${x(440)},${y(390)} L ${x(448)},${y(404)}
             L ${x(464)},${y(396)} L ${x(455)},${y(412)}
             L ${x(470)},${y(422)} L ${x(452)},${y(426)}
             L ${x(456)},${y(444)} L ${x(442)},${y(433)}
             L ${x(426)},${y(442)} L ${x(430)},${y(424)}
             L ${x(416)},${y(414)} Z"
          fill="${CONF_GRAPE}" stroke="${CONF_GRAPE}" stroke-width="${d(2)}"/>

    <!-- Raspberry scribble dot top-center-left -->
    <path d="M ${x(142)},${y(64)} C ${x(150)},${y(56)} ${x(162)},${y(60)} ${x(160)},${y(72)}
             C ${x(158)},${y(82)} ${x(146)},${y(84)} ${x(140)},${y(76)}
             C ${x(136)},${y(70)} ${x(138)},${y(64)} ${x(142)},${y(64)} Z"
          fill="${CONF_RASP}"/>

    <!-- Banana quick scribble dash lower-left area -->
    <path d="M ${x(58)},${y(456)} C ${x(70)},${y(448)} ${x(84)},${y(452)} ${x(90)},${y(462)}"
          fill="none" stroke="${CONF_BAN}" stroke-width="${d(6)}"/>

    <!-- Mint dot upper right edge -->
    <path d="M ${x(386)},${y(44)} C ${x(392)},${y(36)} ${x(404)},${y(40)} ${x(402)},${y(52)}
             C ${x(400)},${y(62)} ${x(388)},${y(64)} ${x(382)},${y(56)}
             C ${x(378)},${y(50)} ${x(382)},${y(44)} ${x(386)},${y(44)} Z"
          fill="${CONF_MINT}"/>

    <!-- Sky zigzag scribble line top area -->
    <path d="M ${x(178)},${y(44)} L ${x(190)},${y(32)} L ${x(202)},${y(46)} L ${x(214)},${y(34)}"
          fill="none" stroke="${CONF_SKY}" stroke-width="${d(5)}"/>

    <!-- Grape dash bottom-right area -->
    <path d="M ${x(350)},${y(468)} C ${x(362)},${y(462)} ${x(376)},${y(466)}"
          fill="none" stroke="${CONF_GRAPE}" stroke-width="${d(5.5)}"/>

  </g>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- FILLS — big offsets so colour CLEARLY bleeds outside outlines  -->
  <!-- A child's crayon colour goes outside the lines by a LOT        -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen-fill)">

    <!-- LEFT EAR fill — nudged 8px left+up, bigger/higher than right -->
    <!-- Kid drew left ear bigger — it's charmingly uneven            -->
    <path d="M ${x(82)},${y(206)}
             C ${x(28)},${y(186)} ${x(-2)},${y(228)} ${x(6)},${y(284)}
             C ${x(14)},${y(340)} ${x(66)},${y(374)} ${x(128)},${y(352)}
             C ${x(166)},${y(337)} ${x(181)},${y(300)} ${x(166)},${y(258)}
             C ${x(152)},${y(216)} ${x(122)},${y(202)} ${x(82)},${y(206)} Z"
          fill="${FUR}"/>
    <!-- Left inner ear fill — peach, offset inward -->
    <path d="M ${x(90)},${y(232)}
             C ${x(58)},${y(222)} ${x(40)},${y(246)} ${x(46)},${y(284)}
             C ${x(52)},${y(320)} ${x(82)},${y(340)} ${x(118)},${y(328)}
             C ${x(144)},${y(319)} ${x(154)},${y(292)} ${x(142)},${y(262)}
             C ${x(130)},${y(238)} ${x(114)},${y(232)} ${x(90)},${y(232)} Z"
          fill="${PEACH}"/>

    <!-- RIGHT EAR fill — smaller, lower than left (asymmetry!) -->
    <path d="M ${x(426)},${y(240)}
             C ${x(474)},${y(225)} ${x(502)},${y(260)} ${x(496)},${y(306)}
             C ${x(490)},${y(352)} ${x(444)},${y(376)} ${x(394)},${y(356)}
             C ${x(360)},${y(341)} ${x(348)},${y(309)} ${x(360)},${y(273)}
             C ${x(372)},${y(242)} ${x(396)},${y(232)} ${x(426)},${y(240)} Z"
          fill="${FUR}"/>
    <!-- Right inner ear fill -->
    <path d="M ${x(420)},${y(262)}
             C ${x(450)},${y(252)} ${x(466)},${y(272)} ${x(460)},${y(306)}
             C ${x(456)},${y(338)} ${x(428)},${y(354)} ${x(400)},${y(342)}
             C ${x(378)},${y(332)} ${x(370)},${y(308)} ${x(382)},${y(278)}
             C ${x(392)},${y(256)} ${x(406)},${y(252)} ${x(420)},${y(262)} Z"
          fill="${PEACH}"/>

    <!-- HEAD fill — lumpy, asymmetric blob offset 8px, not centered   -->
    <!-- Left side lower than right, top is lumpy, bottom left caves in -->
    <path d="M ${x(248)},${y(88)}
             C ${x(296)},${y(78)} ${x(388)},${y(116)} ${x(426)},${y(176)}
             C ${x(462)},${y(234)} ${x(466)},${y(318)} ${x(448)},${y(398)}
             C ${x(431)},${y(472)} ${x(376)},${y(504)} ${x(308)},${y(500)}
             C ${x(278)},${y(506)} ${x(222)},${y(506)} ${x(190)},${y(500)}
             C ${x(122)},${y(504)} ${x(64)},${y(472)} ${x(52)},${y(398)}
             C ${x(38)},${y(318)} ${x(46)},${y(234)} ${x(82)},${y(176)}
             C ${x(122)},${y(116)} ${x(196)},${y(78)} ${x(248)},${y(88)} Z"
          fill="${FUR}"/>

    <!-- FACE MASK fill — offset 6px down+left, bleeds into brown fur -->
    <path d="M ${x(252)},${y(188)}
             C ${x(316)},${y(180)} ${x(386)},${y(218)} ${x(388)},${y(298)}
             C ${x(392)},${y(372)} ${x(352)},${y(456)} ${x(296)},${y(482)}
             C ${x(272)},${y(492)} ${x(236)},${y(494)} ${x(210)},${y(482)}
             C ${x(154)},${y(456)} ${x(116)},${y(372)} ${x(122)},${y(298)}
             C ${x(128)},${y(218)} ${x(190)},${y(180)} ${x(252)},${y(188)} Z"
          fill="${PEACH}"/>

    <!-- LEFT CHEEK scribble fill — back-and-forth crayon lines        -->
    <!-- Big rosy splotch offset left, clearly outside the outline     -->
    <path d="M ${x(128)},${y(330)}
             C ${x(108)},${y(314)} ${x(92)},${y(334)} ${x(98)},${y(368)}
             C ${x(104)},${y(400)} ${x(138)},${y(416)} ${x(172)},${y(402)}
             C ${x(198)},${y(390)} ${x(204)},${y(360)} ${x(186)},${y(334)}
             C ${x(170)},${y(314)} ${x(148)},${y(314)} ${x(128)},${y(330)} Z"
          fill="${CHEEK}" opacity="0.55"/>
    <!-- Cheek scribble lines — back-and-forth crayon hatching -->
    <path d="M ${x(108)},${y(344)} L ${x(172)},${y(336)}" stroke="${CHEEK}" stroke-width="${d(5)}" stroke-linecap="round" fill="none" opacity="0.7"/>
    <path d="M ${x(100)},${y(358)} L ${x(180)},${y(354)}" stroke="${CHEEK}" stroke-width="${d(5)}" stroke-linecap="round" fill="none" opacity="0.7"/>
    <path d="M ${x(106)},${y(372)} L ${x(182)},${y(370)}" stroke="${CHEEK}" stroke-width="${d(4.5)}" stroke-linecap="round" fill="none" opacity="0.65"/>
    <path d="M ${x(116)},${y(386)} L ${x(176)},${y(386)}" stroke="${CHEEK}" stroke-width="${d(4)}" stroke-linecap="round" fill="none" opacity="0.6"/>

    <!-- RIGHT CHEEK scribble fill — offset right -->
    <path d="M ${x(382)},${y(336)}
             C ${x(402)},${y(320)} ${x(418)},${y(340)} ${x(412)},${y(374)}
             C ${x(406)},${y(406)} ${x(372)},${y(422)} ${x(340)},${y(408)}
             C ${x(314)},${y(396)} ${x(310)},${y(364)} ${x(328)},${y(340)}
             C ${x(344)},${y(320)} ${x(364)},${y(320)} ${x(382)},${y(336)} Z"
          fill="${CHEEK}" opacity="0.55"/>
    <!-- Right cheek scribble lines -->
    <path d="M ${x(404)},${y(350)} L ${x(330)},${y(344)}" stroke="${CHEEK}" stroke-width="${d(5)}" stroke-linecap="round" fill="none" opacity="0.7"/>
    <path d="M ${x(412)},${y(364)} L ${x(326)},${y(362)}" stroke="${CHEEK}" stroke-width="${d(5)}" stroke-linecap="round" fill="none" opacity="0.7"/>
    <path d="M ${x(408)},${y(378)} L ${x(328)},${y(378)}" stroke="${CHEEK}" stroke-width="${d(4.5)}" stroke-linecap="round" fill="none" opacity="0.65"/>
    <path d="M ${x(396)},${y(392)} L ${x(336)},${y(392)}" stroke="${CHEEK}" stroke-width="${d(4)}" stroke-linecap="round" fill="none" opacity="0.6"/>

    <!-- MUZZLE fill — offset 6px down, bleeds below muzzle outline -->
    <path d="M ${x(252)},${y(358)}
             C ${x(306)},${y(350)} ${x(346)},${y(370)} ${x(348)},${y(406)}
             C ${x(350)},${y(444)} ${x(318)},${y(472)} ${x(256)},${y(472)}
             C ${x(194)},${y(472)} ${x(164)},${y(444)} ${x(168)},${y(406)}
             C ${x(172)},${y(370)} ${x(200)},${y(350)} ${x(252)},${y(358)} Z"
          fill="${PEACH}"/>

    <!-- MOUTH interior -->
    <path d="M ${x(192)},${y(404)}
             C ${x(204)},${y(438)} ${x(228)},${y(464)} ${x(255)},${y(466)}
             C ${x(282)},${y(464)} ${x(308)},${y(438)} ${x(320)},${y(404)}
             C ${x(302)},${y(422)} ${x(280)},${y(430)} ${x(256)},${y(430)}
             C ${x(232)},${y(430)} ${x(210)},${y(422)} ${x(192)},${y(404)} Z"
          fill="${MOUTH_INT}"/>
    <!-- Teeth — lumpy white strip -->
    <path d="M ${x(200)},${y(408)}
             C ${x(215)},${y(424)} ${x(234)},${y(430)} ${x(256)},${y(430)}
             C ${x(278)},${y(430)} ${x(298)},${y(424)} ${x(314)},${y(408)}
             C ${x(296)},${y(420)} ${x(276)},${y(424)} ${x(256)},${y(424)}
             C ${x(236)},${y(424)} ${x(216)},${y(420)} ${x(200)},${y(408)} Z"
          fill="white"/>
    <!-- Tongue -->
    <path d="M ${x(228)},${y(432)}
             C ${x(228)},${y(420)} ${x(242)},${y(414)} ${x(256)},${y(414)}
             C ${x(270)},${y(414)} ${x(284)},${y(420)} ${x(284)},${y(432)}
             C ${x(284)},${y(452)} ${x(272)},${y(460)} ${x(256)},${y(460)}
             C ${x(240)},${y(460)} ${x(228)},${y(452)} ${x(228)},${y(432)} Z"
          fill="${TONGUE}"/>

    <!-- LEFT EYE fill — BIGGER, higher up (asymmetric!) — offset 6px up+left -->
    <!-- Left eye is noticeably larger than right eye -->
    <path d="M ${x(142)},${y(238)}
             C ${x(148)},${y(196)} ${x(184)},${y(178)} ${x(218)},${y(188)}
             C ${x(252)},${y(198)} ${x(262)},${y(232)} ${x(252)},${y(268)}
             C ${x(242)},${y(304)} ${x(208)},${y(318)} ${x(176)},${y(306)}
             C ${x(144)},${y(294)} ${x(136)},${y(268)} ${x(142)},${y(238)} Z"
          fill="white"/>
    <!-- Left iris — amber, tilted -->
    <path d="M ${x(166)},${y(240)}
             C ${x(172)},${y(218)} ${x(192)},${y(208)} ${x(212)},${y(214)}
             C ${x(232)},${y(220)} ${x(240)},${y(238)} ${x(234)},${y(262)}
             C ${x(228)},${y(284)} ${x(208)},${y(292)} ${x(188)},${y(286)}
             C ${x(168)},${y(280)} ${x(160)},${y(262)} ${x(166)},${y(240)} Z"
          fill="#D98E33"/>

    <!-- RIGHT EYE fill — SMALLER, slightly lower (asymmetric!) — offset 6px down+right -->
    <path d="M ${x(368)},${y(270)}
             C ${x(362)},${y(232)} ${x(330)},${y(214)} ${x(298)},${y(224)}
             C ${x(266)},${y(234)} ${x(256)},${y(266)} ${x(266)},${y(298)}
             C ${x(276)},${y(328)} ${x(308)},${y(340)} ${x(336)},${y(328)}
             C ${x(364)},${y(316)} ${x(374)},${y(292)} ${x(368)},${y(270)} Z"
          fill="white"/>
    <!-- Right iris — slightly smaller -->
    <path d="M ${x(348)},${y(270)}
             C ${x(344)},${y(252)} ${x(326)},${y(242)} ${x(308)},${y(248)}
             C ${x(290)},${y(254)} ${x(282)},${y(270)} ${x(288)},${y(290)}
             C ${x(294)},${y(310)} ${x(314)},${y(318)} ${x(332)},${y(312)}
             C ${x(350)},${y(306)} ${x(356)},${y(290)} ${x(348)},${y(270)} Z"
          fill="#D98E33"/>

    <!-- NOSE fill — big lumpy brown blob offset down -->
    <path d="M ${x(232)},${y(368)}
             C ${x(232)},${y(352)} ${x(246)},${y(344)} ${x(256)},${y(348)}
             C ${x(266)},${y(344)} ${x(280)},${y(352)} ${x(278)},${y(368)}
             C ${x(274)},${y(380)} ${x(263)},${y(385)} ${x(256)},${y(384)}
             C ${x(249)},${y(385)} ${x(238)},${y(380)} ${x(232)},${y(368)} Z"
          fill="${OUTLINE}"/>

    <!-- HAIR TUFTS fills — 3 wonky spikes, off-center, one leaning left -->
    <!-- Middle tuft — leans right a bit -->
    <path d="M ${x(262)},${y(96)}
             C ${x(268)},${y(66)} ${x(294)},${y(38)} ${x(308)},${y(18)}
             C ${x(318)},${y(38)} ${x(322)},${y(62)} ${x(308)},${y(88)}
             C ${x(296)},${y(74)} ${x(278)},${y(78)} ${x(262)},${y(96)} Z"
          fill="${OUTLINE}"/>
    <!-- Left tuft — leans left -->
    <path d="M ${x(232)},${y(100)}
             C ${x(226)},${y(72)} ${x(220)},${y(48)} ${x(222)},${y(28)}
             C ${x(234)},${y(44)} ${x(244)},${y(64)} ${x(240)},${y(90)}
             C ${x(236)},${y(82)} ${x(228)},${y(84)} ${x(232)},${y(100)} Z"
          fill="${FUR}"/>
    <!-- Right tuft — shorter, fatter -->
    <path d="M ${x(284)},${y(94)}
             C ${x(292)},${y(68)} ${x(308)},${y(50)} ${x(316)},${y(36)}
             C ${x(322)},${y(50)} ${x(322)},${y(68)} ${x(312)},${y(88)}
             C ${x(306)},${y(78)} ${x(292)},${y(80)} ${x(284)},${y(94)} Z"
          fill="${FUR}"/>

  </g>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- OUTLINES — thick uneven crayon strokes, variable widths        -->
  <!-- Strokes overshoot, cross, vary wildly — CHILDLIKE              -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen)" fill="none" stroke="${OUTLINE}" stroke-linecap="round" stroke-linejoin="round">

    <!-- LEFT EAR outline — bigger, higher, stroke varies widely -->
    <path d="M ${x(88)},${y(214)}
             C ${x(34)},${y(192)} ${x(2)},${y(234)} ${x(10)},${y(292)}
             C ${x(18)},${y(350)} ${x(74)},${y(382)} ${x(136)},${y(358)}
             C ${x(174)},${y(342)} ${x(188)},${y(302)} ${x(172)},${y(258)}
             C ${x(156)},${y(214)} ${x(130)},${y(202)} ${x(88)},${y(214)} Z"
          stroke-width="${d(12)}"/>
    <!-- Left inner ear — thinner, different wobble -->
    <path d="M ${x(96)},${y(238)}
             C ${x(62)},${y(228)} ${x(44)},${y(252)} ${x(50)},${y(290)}
             C ${x(56)},${y(328)} ${x(86)},${y(346)} ${x(122)},${y(332)}
             C ${x(148)},${y(322)} ${x(158)},${y(294)} ${x(146)},${y(264)}
             C ${x(134)},${y(238)} ${x(116)},${y(232)} ${x(96)},${y(238)} Z"
          stroke-width="${d(6)}"/>

    <!-- RIGHT EAR outline — smaller, lower, different shape from left -->
    <path d="M ${x(422)},${y(248)}
             C ${x(470)},${y(232)} ${x(500)},${y(268)} ${x(494)},${y(314)}
             C ${x(488)},${y(360)} ${x(440)},${y(386)} ${x(388)},${y(364)}
             C ${x(350)},${y(348)} ${x(338)},${y(312)} ${x(352)},${y(274)}
             C ${x(366)},${y(240)} ${x(392)},${y(230)} ${x(422)},${y(248)} Z"
          stroke-width="${d(9)}"/>
    <!-- Right inner ear — stroke slightly different from left -->
    <path d="M ${x(416)},${y(268)}
             C ${x(448)},${y(256)} ${x(464)},${y(278)} ${x(458)},${y(312)}
             C ${x(452)},${y(344)} ${x(424)},${y(360)} ${x(394)},${y(346)}
             C ${x(370)},${y(334)} ${x(362)},${y(310)} ${x(374)},${y(282)}
             C ${x(386)},${y(258)} ${x(400)},${y(254)} ${x(416)},${y(268)} Z"
          stroke-width="${d(5)}"/>

    <!-- HEAD outline — strongly lumpy, asymmetric, heavy stroke -->
    <!-- Left side is lower + more indented than right — clearly wonky -->
    <path d="M ${x(256)},${y(96)}
             C ${x(306)},${y(86)} ${x(392)},${y(116)} ${x(432)},${y(178)}
             C ${x(468)},${y(238)} ${x(472)},${y(326)} ${x(452)},${y(410)}
             C ${x(434)},${y(490)} ${x(374)},${y(512)} ${x(308)},${y(510)}
             C ${x(280)},${y(518)} ${x(220)},${y(518)} ${x(188)},${y(510)}
             C ${x(118)},${y(512)} ${x(56)},${y(490)} ${x(42)},${y(410)}
             C ${x(26)},${y(326)} ${x(36)},${y(238)} ${x(76)},${y(178)}
             C ${x(118)},${y(116)} ${x(204)},${y(86)} ${x(256)},${y(96)} Z"
          stroke-width="${d(14)}"/>

    <!-- FACE MASK outline — irregular blob, left side different from right -->
    <path d="M ${x(254)},${y(194)}
             C ${x(316)},${y(186)} ${x(384)},${y(226)} ${x(386)},${y(306)}
             C ${x(390)},${y(380)} ${x(350)},${y(468)} ${x(294)},${y(494)}
             C ${x(270)},${y(506)} ${x(232)},${y(506)} ${x(206)},${y(494)}
             C ${x(148)},${y(468)} ${x(108)},${y(380)} ${x(116)},${y(306)}
             C ${x(124)},${y(226)} ${x(190)},${y(186)} ${x(254)},${y(194)} Z"
          stroke-width="${d(8)}"/>

    <!-- MUZZLE outline — lumpy rounded lump -->
    <path d="M ${x(254)},${y(360)}
             C ${x(308)},${y(352)} ${x(348)},${y(374)} ${x(350)},${y(412)}
             C ${x(352)},${y(452)} ${x(318)},${y(480)} ${x(256)},${y(480)}
             C ${x(194)},${y(480)} ${x(162)},${y(452)} ${x(164)},${y(412)}
             C ${x(166)},${y(374)} ${x(202)},${y(352)} ${x(254)},${y(360)} Z"
          stroke-width="${d(7)}"/>

    <!-- Muzzle center crease — wobbly dashed line -->
    <path d="M ${x(256)},${y(364)} C ${x(254)},${y(394)} ${x(257)},${y(416)} ${x(254)},${y(440)}"
          stroke-width="${d(3)}" opacity="0.35"/>

    <!-- NOSE outline — big lumpy blob, thick stroke -->
    <path d="M ${x(234)},${y(370)}
             C ${x(234)},${y(354)} ${x(248)},${y(346)} ${x(256)},${y(350)}
             C ${x(264)},${y(346)} ${x(278)},${y(354)} ${x(278)},${y(370)}
             C ${x(274)},${y(382)} ${x(264)},${y(387)} ${x(256)},${y(386)}
             C ${x(248)},${y(387)} ${x(238)},${y(382)} ${x(234)},${y(370)} Z"
          stroke-width="${d(5.5)}"/>

    <!-- Nostril scratches — two diagonal squiggles -->
    <path d="M ${x(244)},${y(368)} C ${x(246)},${y(374)} ${x(249)},${y(378)}"
          stroke-width="${d(3)}" opacity="0.55"/>
    <path d="M ${x(268)},${y(368)} C ${x(266)},${y(374)} ${x(263)},${y(378)}"
          stroke-width="${d(3)}" opacity="0.55"/>

    <!-- CROOKED GRIN — wide, asymmetric mouth, higher on left than right -->
    <!-- Left side starts higher — a kid's lopsided smile                 -->
    <path d="M ${x(186)},${y(400)}
             C ${x(196)},${y(436)} ${x(224)},${y(464)} ${x(254)},${y(466)}
             C ${x(284)},${y(464)} ${x(312)},${y(436)} ${x(324)},${y(408)}
             C ${x(306)},${y(426)} ${x(282)},${y(434)} ${x(256)},${y(434)}
             C ${x(230)},${y(434)} ${x(206)},${y(424)} ${x(186)},${y(400)} Z"
          stroke-width="${d(7)}"/>

    <!-- Teeth divider — wobbly squiggle -->
    <path d="M ${x(198)},${y(412)} C ${x(222)},${y(420)} ${x(256)},${y(424)} ${x(284)},${y(420)} C ${x(302)},${y(416)} ${x(316)},${y(412)}"
          stroke-width="${d(2.5)}" opacity="0.4"/>

    <!-- Tongue groove -->
    <path d="M ${x(256)},${y(422)} C ${x(254)},${y(436)} ${x(257)},${y(448)} ${x(255)},${y(460)}"
          stroke-width="${d(3)}" stroke="#D44060" opacity="0.55"/>

    <!-- LEFT EYE outline — BIGGER, rounder, higher up, thick stroke    -->
    <!-- Overshoot at corners — line keeps going past the corner        -->
    <path d="M ${x(148)},${y(244)}
             C ${x(154)},${y(202)} ${x(190)},${y(184)} ${x(224)},${y(196)}
             C ${x(258)},${y(206)} ${x(268)},${y(240)} ${x(256)},${y(278)}
             C ${x(244)},${y(316)} ${x(206)},${y(328)} ${x(172)},${y(316)}
             C ${x(138)},${y(304)} ${x(130)},${y(274)} ${x(148)},${y(244)} Z"
          stroke-width="${d(10)}"/>

    <!-- Left pupil — big lumpy blob -->
    <path d="M ${x(184)},${y(234)}
             C ${x(194)},${y(224)} ${x(214)},${y(228)} ${x(220)},${y(244)}
             C ${x(226)},${y(260)} ${x(220)},${y(276)} ${x(208)},${y(278)}
             C ${x(196)},${y(280)} ${x(184)},${y(272)} ${x(182)},${y(258)}
             C ${x(180)},${y(244)} ${x(180)},${y(234)} ${x(184)},${y(234)} Z"
          stroke-width="${d(2)}" fill="${PUPIL}" stroke="${PUPIL}"/>
    <!-- Left eye shine -->
    <path d="M ${x(182)},${y(232)} C ${x(186)},${y(228)} ${x(192)},${y(230)} ${x(192)},${y(236)}"
          stroke="white" stroke-width="${d(7)}" fill="none"/>
    <path d="M ${x(208)},${y(258)} C ${x(212)},${y(256)} ${x(215)},${y(259)}"
          stroke="white" stroke-width="${d(4.5)}" fill="none" opacity="0.8"/>

    <!-- RIGHT EYE outline — SMALLER, lower, thinner stroke — very uneven from left -->
    <path d="M ${x(364)},${y(278)}
             C ${x(358)},${y(238)} ${x(326)},${y(220)} ${x(294)},${y(230)}
             C ${x(262)},${y(240)} ${x(252)},${y(272)} ${x(262)},${y(306)}
             C ${x(272)},${y(338)} ${x(306)},${y(350)} ${x(334)},${y(336)}
             C ${x(362)},${y(322)} ${x(370)},${y(298)} ${x(364)},${y(278)} Z"
          stroke-width="${d(7)}"/>

    <!-- Right pupil — smaller than left -->
    <path d="M ${x(294)},${y(250)}
             C ${x(304)},${y(240)} ${x(320)},${y(244)} ${x(326)},${y(260)}
             C ${x(332)},${y(276)} ${x(326)},${y(290)} ${x(314)},${y(292)}
             C ${x(302)},${y(294)} ${x(292)},${y(284)} ${x(290)},${y(268)}
             C ${x(288)},${y(254)} ${x(290)},${y(250)} ${x(294)},${y(250)} Z"
          stroke-width="${d(2)}" fill="${PUPIL}" stroke="${PUPIL}"/>
    <!-- Right eye shine -->
    <path d="M ${x(292)},${y(248)} C ${x(296)},${y(244)} ${x(302)},${y(246)} ${x(302)},${y(252)}"
          stroke="white" stroke-width="${d(5.5)}" fill="none"/>
    <path d="M ${x(314)},${y(270)} C ${x(318)},${y(268)} ${x(320)},${y(271)}"
          stroke="white" stroke-width="${d(3.5)}" fill="none" opacity="0.8"/>

    <!-- LEFT EYEBROW — thick wobbly arc, tilted (kid's rough stroke) -->
    <!-- Goes from low-left to high-right in a sweeping lopsided arch  -->
    <path d="M ${x(136)},${y(222)}
             C ${x(152)},${y(194)} ${x(188)},${y(180)} ${x(232)},${y(194)}
             C ${x(236)},${y(200)} ${x(238)},${y(206)} ${x(234)},${y(210)}
             C ${x(192)},${y(196)} ${x(158)},${y(208)} ${x(142)},${y(234)}
             C ${x(138)},${y(230)} ${x(134)},${y(226)} ${x(136)},${y(222)} Z"
          fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${d(3)}"/>

    <!-- RIGHT EYEBROW — different angle/thickness from left (asymmetric!) -->
    <path d="M ${x(374)},${y(234)}
             C ${x(358)},${y(208)} ${x(328)},${y(196)} ${x(290)},${y(208)}
             C ${x(286)},${y(212)} ${x(284)},${y(218)} ${x(288)},${y(222)}
             C ${x(326)},${y(210)} ${x(354)},${y(222)} ${x(366)},${y(244)}
             C ${x(370)},${y(240)} ${x(374)},${y(236)} ${x(374)},${y(234)} Z"
          fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${d(3)}"/>

    <!-- HAIR TUFTS outlines — three wonky spikes, all different sizes -->
    <!-- Middle spike — leans right, tallest -->
    <path d="M ${x(264)},${y(98)}
             C ${x(270)},${y(68)} ${x(296)},${y(40)} ${x(310)},${y(20)}
             C ${x(320)},${y(40)} ${x(324)},${y(64)} ${x(310)},${y(90)}
             C ${x(298)},${y(76)} ${x(280)},${y(80)} ${x(264)},${y(98)} Z"
          stroke-width="${d(7)}" fill="${OUTLINE}"/>
    <!-- Left spike — shorter, leans left -->
    <path d="M ${x(230)},${y(102)}
             C ${x(224)},${y(74)} ${x(218)},${y(50)} ${x(220)},${y(30)}
             C ${x(232)},${y(46)} ${x(242)},${y(66)} ${x(238)},${y(92)}
             C ${x(234)},${y(84)} ${x(226)},${y(86)} ${x(230)},${y(102)} Z"
          stroke-width="${d(5)}" fill="${FUR}"/>
    <!-- Right spike — medium, fattest -->
    <path d="M ${x(286)},${y(96)}
             C ${x(294)},${y(70)} ${x(310)},${y(52)} ${x(318)},${y(38)}
             C ${x(326)},${y(52)} ${x(326)},${y(70)} ${x(314)},${y(90)}
             C ${x(308)},${y(80)} ${x(294)},${y(82)} ${x(286)},${y(96)} Z"
          stroke-width="${d(5)}" fill="${FUR}"/>

    <!-- WHISKERS — simple stick lines from muzzle, kid-drawn style -->
    <path d="M ${x(210)},${y(390)} L ${x(148)},${y(376)}"
          stroke="${OUTLINE}" stroke-width="${d(4)}" opacity="0.5"/>
    <path d="M ${x(210)},${y(398)} L ${x(146)},${y(394)}"
          stroke="${OUTLINE}" stroke-width="${d(3.5)}" opacity="0.45"/>
    <path d="M ${x(302)},${y(390)} L ${x(364)},${y(376)}"
          stroke="${OUTLINE}" stroke-width="${d(4)}" opacity="0.5"/>
    <path d="M ${x(302)},${y(398)} L ${x(366)},${y(394)}"
          stroke="${OUTLINE}" stroke-width="${d(3.5)}" opacity="0.45"/>

  </g>

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
