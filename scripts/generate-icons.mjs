import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve('public')
mkdirSync(OUT, { recursive: true })

// Brand palette — per design brief
const FUR = '#B0744A' // warm brown fur
const OUTLINE = '#5A3A24' // hand-drawn dark outline
const PEACH = '#F0C9A0' // face-mask, inner ears, muzzle
const IRIS = '#D98E33' // amber iris
const PUPIL = '#3A2A20' // dark pupil
const CHEEK = '#FF8FA8' // rosy blush
const MOUTH_INT = '#7A3B3B' // mouth interior
const TONGUE = '#FF6B81' // tongue
const BG_CREAM = '#FFF7EE' // icon background

// Confetti palette
const CONF_RASP = '#FF4D79'
const CONF_BAN = '#FFC53D'
const CONF_MINT = '#34D399'
const CONF_SKY = '#56A8FF'
const CONF_GRAPE = '#A66CFF'

/**
 * HAND-DRAWN FREEHAND MONKEY — the whole aesthetic is deliberate imperfection.
 *
 * Technique:
 * 1. Every shape uses cubic Bézier paths with INTENTIONALLY uneven control
 *    points — small wobbles baked into coordinates (3–8 px off-axis nudges)
 *    so fills read organic even without filter support.
 * 2. Fills are drawn SLIGHTLY OFFSET from outlines (2–4 px shift) so the
 *    colour bleeds like marker that doesn't stay in lines.
 * 3. Outline group has an SVG roughen filter (feTurbulence + feDisplacementMap)
 *    for ink-jitter where librsvg supports it; baked wobble is the fallback.
 * 4. stroke-linecap/linejoin="round", varying stroke-width for brush-pen feel.
 * 5. Confetti = wobbly triangles, quick pen dashes, small lumpy blobs —
 *    NOT perfect circles.
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

  // Roughen filter — bonus ink wobble where librsvg supports it
  // The baked-in path irregularity is the primary hand-drawn mechanism
  const defs = `
  <defs>
    <filter id="roughen" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="turbulence" baseFrequency="0.018 0.022" numOctaves="3" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${d(5)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="roughen-fill" x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="turbulence" baseFrequency="0.012 0.015" numOctaves="2" seed="3" result="noise2"/>
      <feDisplacementMap in="SourceGraphic" in2="noise2" scale="${d(3)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  ${defs}

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- CONFETTI — wobbly hand-scrawled marks around the head     -->
  <!-- Triangles, dashes, blobs — NOT perfect circles            -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen)" stroke-linecap="round" stroke-linejoin="round">

    <!-- Raspberry squiggly triangle top-left -->
    <path d="M ${x(62)},${y(165)} C ${x(68)},${y(142)} ${x(80)},${y(138)} ${x(90)},${y(155)}
             C ${x(97)},${y(168)} ${x(88)},${y(178)} ${x(72)},${y(178)}
             C ${x(60)},${y(178)} ${x(58)},${y(170)} ${x(62)},${y(165)} Z"
          fill="${CONF_RASP}" stroke="${CONF_RASP}" stroke-width="${d(2)}"/>
    <!-- Rasp dash scribble near top -->
    <path d="M ${x(46)},${y(128)} C ${x(52)},${y(122)} ${x(62)},${y(125)} ${x(68)},${y(130)}"
          fill="none" stroke="${CONF_RASP}" stroke-width="${d(4)}"/>

    <!-- Banana wobbly blob top-right -->
    <path d="M ${x(428)},${y(98)} C ${x(436)},${y(82)} ${x(452)},${y(84)} ${x(456)},${y(100)}
             C ${x(458)},${y(114)} ${x(446)},${y(124)} ${x(432)},${y(120)}
             C ${x(420)},${y(116)} ${x(420)},${y(106)} ${x(428)},${y(98)} Z"
          fill="${CONF_BAN}" stroke="${CONF_BAN}" stroke-width="${d(2)}"/>
    <!-- Banana quick dot -->
    <path d="M ${x(418)},${y(72)} C ${x(422)},${y(68)} ${x(428)},${y(70)} ${x(426)},${y(76)}
             C ${x(424)},${y(80)} ${x(418)},${y(78)} ${x(418)},${y(72)} Z"
          fill="${CONF_BAN}"/>

    <!-- Mint lumpy squiggle far-right -->
    <path d="M ${x(460)},${y(294)} C ${x(474)},${y(288)} ${x(482)},${y(300)} ${x(476)},${y(316)}
             C ${x(470)},${y(330)} ${x(456)},${y(330)} ${x(450)},${y(318)}
             C ${x(444)},${y(306)} ${x(450)},${y(296)} ${x(460)},${y(294)} Z"
          fill="${CONF_MINT}" stroke="${CONF_MINT}" stroke-width="${d(2)}"/>
    <!-- Mint dash line -->
    <path d="M ${x(488)},${y(272)} C ${x(494)},${y(278)} ${x(496)},${y(286)} ${x(490)},${y(290)}"
          fill="none" stroke="${CONF_MINT}" stroke-width="${d(3.5)}"/>

    <!-- Sky wobbly blob bottom-left -->
    <path d="M ${x(46)},${y(378)} C ${x(54)},${y(362)} ${x(70)},${y(362)} ${x(76)},${y(378)}
             C ${x(80)},${y(394)} ${x(68)},${y(406)} ${x(52)},${y(402)}
             C ${x(38)},${y(398)} ${x(38)},${y(386)} ${x(46)},${y(378)} Z"
          fill="${CONF_SKY}" stroke="${CONF_SKY}" stroke-width="${d(2)}"/>

    <!-- Grape lumpy triangle top-center-right -->
    <path d="M ${x(388)},${y(46)} C ${x(396)},${y(34)} ${x(408)},${y(38)} ${x(410)},${y(52)}
             C ${x(412)},${y(64)} ${x(402)},${y(72)} ${x(390)},${y(68)}
             C ${x(378)},${y(64)} ${x(380)},${y(52)} ${x(388)},${y(46)} Z"
          fill="${CONF_GRAPE}" stroke="${CONF_GRAPE}" stroke-width="${d(2)}"/>
    <!-- Grape little dash -->
    <path d="M ${x(412)},${y(34)} C ${x(418)},${y(30)} ${x(426)},${y(34)}"
          fill="none" stroke="${CONF_GRAPE}" stroke-width="${d(3)}"/>

    <!-- Raspberry squiggle bottom-right -->
    <path d="M ${x(438)},${y(408)} C ${x(448)},${y(396)} ${x(462)},${y(400)} ${x(462)},${y(416)}
             C ${x(462)},${y(430)} ${x(450)},${y(436)} ${x(438)},${y(430)}
             C ${x(428)},${y(424)} ${x(428)},${y(414)} ${x(438)},${y(408)} Z"
          fill="${CONF_RASP}"/>

    <!-- Extra sky dot top area -->
    <path d="M ${x(130)},${y(74)} C ${x(136)},${y(68)} ${x(144)},${y(72)} ${x(142)},${y(80)}
             C ${x(140)},${y(86)} ${x(132)},${y(86)} ${x(130)},${y(80)}
             C ${x(128)},${y(76)} ${x(128)},${y(74)} ${x(130)},${y(74)} Z"
          fill="${CONF_SKY}"/>

    <!-- Banana quick scribble bottom area -->
    <path d="M ${x(98)},${y(442)} C ${x(104)},${y(436)} ${x(114)},${y(440)} ${x(112)},${y(448)}"
          fill="none" stroke="${CONF_BAN}" stroke-width="${d(4)}"/>
  </g>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- FILLS — painted slightly off-register behind outlines     -->
  <!-- Shift by ~3px so colour bleeds like marker over lines     -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen-fill)">

    <!-- Left ear fill — 3px nudge left+up from outline -->
    <path d="M ${x(95)},${y(223)}
             C ${x(44)},${y(207)} ${x(18)},${y(243)} ${x(23)},${y(291)}
             C ${x(28)},${y(338)} ${x(73)},${y(366)} ${x(126)},${y(348)}
             C ${x(160)},${y(336)} ${x(173)},${y(303)} ${x(160)},${y(266)}
             C ${x(148)},${y(228)} ${x(126)},${y(218)} ${x(95)},${y(223)} Z"
          fill="${FUR}"/>
    <!-- Left inner ear fill -->
    <path d="M ${x(100)},${y(245)}
             C ${x(70)},${y(237)} ${x(54)},${y(257)} ${x(58)},${y(290)}
             C ${x(62)},${y(320)} ${x(88)},${y(336)} ${x(116)},${y(326)}
             C ${x(138)},${y(318)} ${x(146)},${y(294)} ${x(136)},${y(268)}
             C ${x(126)},${y(246)} ${x(112)},${y(242)} ${x(100)},${y(245)} Z"
          fill="${PEACH}"/>

    <!-- Right ear fill — 3px nudge right+up -->
    <path d="M ${x(417)},${y(223)}
             C ${x(468)},${y(207)} ${x(494)},${y(243)} ${x(489)},${y(291)}
             C ${x(484)},${y(338)} ${x(439)},${y(366)} ${x(386)},${y(348)}
             C ${x(352)},${y(336)} ${x(339)},${y(303)} ${x(352)},${y(266)}
             C ${x(364)},${y(228)} ${x(386)},${y(218)} ${x(417)},${y(223)} Z"
          fill="${FUR}"/>
    <!-- Right inner ear fill -->
    <path d="M ${x(412)},${y(245)}
             C ${x(442)},${y(237)} ${x(458)},${y(257)} ${x(454)},${y(290)}
             C ${x(450)},${y(320)} ${x(424)},${y(336)} ${x(396)},${y(326)}
             C ${x(374)},${y(318)} ${x(366)},${y(294)} ${x(376)},${y(268)}
             C ${x(386)},${y(246)} ${x(400)},${y(242)} ${x(412)},${y(245)} Z"
          fill="${PEACH}"/>

    <!-- Head fill — slightly larger blob, 2px offset, bleeds behind outline -->
    <path d="M ${x(258)},${y(94)}
             C ${x(320)},${y(89)} ${x(414)},${y(136)} ${x(437)},${y(238)}
             C ${x(458)},${y(326)} ${x(422)},${y(444)} ${x(313)},${y(485)}
             C ${x(284)},${y(493)} ${x(228)},${y(494)} ${x(199)},${y(485)}
             C ${x(91)},${y(444)} ${x(56)},${y(326)} ${x(77)},${y(238)}
             C ${x(100)},${y(136)} ${x(194)},${y(89)} ${x(258)},${y(94)} Z"
          fill="${FUR}"/>

    <!-- Face-mask fill — offset 2px so peach bleeds slightly -->
    <path d="M ${x(258)},${y(182)}
             C ${x(317)},${y(178)} ${x(378)},${y(211)} ${x(381)},${y(285)}
             C ${x(385)},${y(352)} ${x(348)},${y(434)} ${x(295)},${y(460)}
             C ${x(272)},${y(470)} ${x(239)},${y(470)} ${x(216)},${y(460)}
             C ${x(164)},${y(434)} ${x(127)},${y(352)} ${x(131)},${y(285)}
             C ${x(135)},${y(211)} ${x(197)},${y(178)} ${x(258)},${y(182)} Z"
          fill="${PEACH}"/>

    <!-- Left cheek fill — offset 3px left -->
    <path d="M ${x(148)},${y(326)}
             C ${x(130)},${y(316)} ${x(118)},${y(332)} ${x(122)},${y(359)}
             C ${x(127)},${y(385)} ${x(153)},${y(399)} ${x(180)},${y(389)}
             C ${x(200)},${y(381)} ${x(204)},${y(357)} ${x(190)},${y(334)}
             C ${x(178)},${y(318)} ${x(161)},${y(318)} ${x(148)},${y(326)} Z"
          fill="${CHEEK}" opacity="0.75"/>

    <!-- Right cheek fill — offset 3px right -->
    <path d="M ${x(364)},${y(326)}
             C ${x(382)},${y(316)} ${x(394)},${y(332)} ${x(390)},${y(359)}
             C ${x(385)},${y(385)} ${x(359)},${y(399)} ${x(332)},${y(389)}
             C ${x(312)},${y(381)} ${x(308)},${y(357)} ${x(322)},${y(334)}
             C ${x(334)},${y(318)} ${x(350)},${y(318)} ${x(364)},${y(326)} Z"
          fill="${CHEEK}" opacity="0.75"/>

    <!-- Muzzle fill — offset 2px down -->
    <path d="M ${x(256)},${y(350)}
             C ${x(303)},${y(346)} ${x(338)},${y(362)} ${x(340)},${y(394)}
             C ${x(342)},${y(428)} ${x(313)},${y(453)} ${x(257)},${y(454)}
             C ${x(200)},${y(453)} ${x(171)},${y(428)} ${x(173)},${y(394)}
             C ${x(175)},${y(362)} ${x(210)},${y(346)} ${x(256)},${y(350)} Z"
          fill="${PEACH}"/>

    <!-- Mouth interior fill -->
    <path d="M ${x(198)},${y(393)}
             C ${x(208)},${y(424)} ${x(230)},${y(448)} ${x(255)},${y(450)}
             C ${x(280)},${y(448)} ${x(303)},${y(424)} ${x(314)},${y(393)}
             C ${x(298)},${y(408)} ${x(279)},${y(416)} ${x(257)},${y(416)}
             C ${x(234)},${y(416)} ${x(215)},${y(408)} ${x(198)},${y(393)} Z"
          fill="${MOUTH_INT}"/>
    <!-- Teeth fill -->
    <path d="M ${x(206)},${y(396)}
             C ${x(217)},${y(410)} ${x(235)},${y(416)} ${x(256)},${y(416)}
             C ${x(277)},${y(416)} ${x(295)},${y(410)} ${x(306)},${y(396)}
             C ${x(292)},${y(407)} ${x(275)},${y(410)} ${x(256)},${y(410)}
             C ${x(237)},${y(410)} ${x(220)},${y(407)} ${x(206)},${y(396)} Z"
          fill="white"/>
    <!-- Tongue fill -->
    <path d="M ${x(234)},${y(420)}
             C ${x(234)},${y(410)} ${x(245)},${y(405)} ${x(256)},${y(405)}
             C ${x(267)},${y(405)} ${x(278)},${y(410)} ${x(278)},${y(420)}
             C ${x(278)},${y(436)} ${x(268)},${y(442)} ${x(256)},${y(442)}
             C ${x(244)},${y(442)} ${x(234)},${y(436)} ${x(234)},${y(420)} Z"
          fill="${TONGUE}"/>

    <!-- Left eye white fill — offset 2px -->
    <path d="M ${x(156)},${y(250)}
             C ${x(160)},${y(213)} ${x(191)},${y(197)} ${x(218)},${y(205)}
             C ${x(245)},${y(213)} ${x(253)},${y(242)} ${x(245)},${y(271)}
             C ${x(237)},${y(299)} ${x(209)},${y(309)} ${x(184)},${y(299)}
             C ${x(159)},${y(289)} ${x(152)},${y(267)} ${x(156)},${y(250)} Z"
          fill="white"/>
    <!-- Left iris fill -->
    <path d="M ${x(177)},${y(249)}
             C ${x(181)},${y(231)} ${x(196)},${y(223)} ${x(211)},${y(227)}
             C ${x(226)},${y(231)} ${x(232)},${y(245)} ${x(228)},${y(264)}
             C ${x(224)},${y(281)} ${x(209)},${y(287)} ${x(195)},${y(283)}
             C ${x(181)},${y(279)} ${x(175)},${y(265)} ${x(177)},${y(249)} Z"
          fill="${IRIS}"/>

    <!-- Right eye white fill — offset 2px -->
    <path d="M ${x(356)},${y(250)}
             C ${x(352)},${y(213)} ${x(321)},${y(197)} ${x(294)},${y(205)}
             C ${x(267)},${y(213)} ${x(259)},${y(242)} ${x(267)},${y(271)}
             C ${x(275)},${y(299)} ${x(303)},${y(309)} ${x(328)},${y(299)}
             C ${x(353)},${y(289)} ${x(360)},${y(267)} ${x(356)},${y(250)} Z"
          fill="white"/>
    <!-- Right iris fill -->
    <path d="M ${x(335)},${y(249)}
             C ${x(331)},${y(231)} ${x(316)},${y(223)} ${x(301)},${y(227)}
             C ${x(286)},${y(231)} ${x(280)},${y(245)} ${x(284)},${y(264)}
             C ${x(288)},${y(281)} ${x(303)},${y(287)} ${x(317)},${y(283)}
             C ${x(331)},${y(279)} ${x(337)},${y(265)} ${x(335)},${y(249)} Z"
          fill="${IRIS}"/>

    <!-- Nose fill — lumpy rounded bump -->
    <path d="M ${x(237)},${y(361)}
             C ${x(237)},${y(349)} ${x(249)},${y(343)} ${x(256)},${y(345)}
             C ${x(263)},${y(343)} ${x(275)},${y(349)} ${x(275)},${y(362)}
             C ${x(271)},${y(371)} ${x(261)},${y(375)} ${x(256)},${y(375)}
             C ${x(251)},${y(375)} ${x(241)},${y(371)} ${x(237)},${y(361)} Z"
          fill="${OUTLINE}"/>

    <!-- Hair tufts fills -->
    <path d="M ${x(271)},${y(97)}
             C ${x(274)},${y(69)} ${x(294)},${y(44)} ${x(304)},${y(27)}
             C ${x(312)},${y(44)} ${x(318)},${y(61)} ${x(307)},${y(83)}
             C ${x(297)},${y(71)} ${x(283)},${y(75)} ${x(271)},${y(97)} Z"
          fill="${OUTLINE}"/>
    <path d="M ${x(255)},${y(97)}
             C ${x(256)},${y(73)} ${x(268)},${y(52)} ${x(275)},${y(38)}
             C ${x(281)},${y(52)} ${x(283)},${y(69)} ${x(275)},${y(89)}
             C ${x(269)},${y(81)} ${x(261)},${y(83)} ${x(255)},${y(97)} Z"
          fill="${FUR}"/>

  </g>

  <!-- ══════════════════════════════════════════════════════════ -->
  <!-- OUTLINES — confident hand-drawn dark strokes             -->
  <!-- Wobbly cubic paths, varying stroke-width, round caps     -->
  <!-- feTurbulence adds ink jitter on top of baked wobble      -->
  <!-- ══════════════════════════════════════════════════════════ -->
  <g filter="url(#roughen)" fill="none" stroke="${OUTLINE}" stroke-linecap="round" stroke-linejoin="round">

    <!-- Left ear outline — wobbly path, overshoot at top -->
    <path d="M ${x(100)},${y(228)}
             C ${x(50)},${y(211)} ${x(20)},${y(247)} ${x(25)},${y(294)}
             C ${x(30)},${y(342)} ${x(78)},${y(370)} ${x(130)},${y(352)}
             C ${x(164)},${y(340)} ${x(176)},${y(308)} ${x(163)},${y(270)}
             C ${x(150)},${y(232)} ${x(128)},${y(221)} ${x(100)},${y(228)} Z"
          stroke-width="${d(7.5)}"/>
    <!-- Left ear inner outline — slightly thinner, different wobble -->
    <path d="M ${x(103)},${y(249)}
             C ${x(73)},${y(241)} ${x(56)},${y(262)} ${x(60)},${y(293)}
             C ${x(65)},${y(323)} ${x(91)},${y(339)} ${x(119)},${y(329)}
             C ${x(141)},${y(321)} ${x(149)},${y(297)} ${x(139)},${y(271)}
             C ${x(129)},${y(249)} ${x(115)},${y(245)} ${x(103)},${y(249)} Z"
          stroke-width="${d(4.5)}"/>

    <!-- Right ear outline -->
    <path d="M ${x(412)},${y(228)}
             C ${x(462)},${y(211)} ${x(492)},${y(247)} ${x(487)},${y(294)}
             C ${x(482)},${y(342)} ${x(434)},${y(370)} ${x(382)},${y(352)}
             C ${x(348)},${y(340)} ${x(336)},${y(308)} ${x(349)},${y(270)}
             C ${x(362)},${y(232)} ${x(384)},${y(221)} ${x(412)},${y(228)} Z"
          stroke-width="${d(7.5)}"/>
    <!-- Right ear inner outline -->
    <path d="M ${x(409)},${y(249)}
             C ${x(439)},${y(241)} ${x(456)},${y(262)} ${x(452)},${y(293)}
             C ${x(447)},${y(323)} ${x(421)},${y(339)} ${x(393)},${y(329)}
             C ${x(371)},${y(321)} ${x(363)},${y(297)} ${x(373)},${y(271)}
             C ${x(383)},${y(249)} ${x(397)},${y(245)} ${x(409)},${y(249)} Z"
          stroke-width="${d(4.5)}"/>

    <!-- Head outline — big wobbly blob, control points nudged by 4–9px irregularly -->
    <!-- Deliberate: top is slightly lumpy, left side has a small indent, right dips different -->
    <path d="M ${x(258)},${y(97)}
             C ${x(304)},${y(90)} ${x(378)},${y(118)} ${x(416)},${y(172)}
             C ${x(450)},${y(222)} ${x(456)},${y(298)} ${x(440)},${y(370)}
             C ${x(425)},${y(442)} ${x(372)},${y(487)} ${x(310)},${y(486)}
             C ${x(284)},${y(494)} ${x(228)},${y(494)} ${x(202)},${y(486)}
             C ${x(140)},${y(487)} ${x(87)},${y(442)} ${x(72)},${y(370)}
             C ${x(56)},${y(298)} ${x(62)},${y(222)} ${x(96)},${y(172)}
             C ${x(134)},${y(118)} ${x(208)},${y(90)} ${x(258)},${y(97)} Z"
          stroke-width="${d(9)}"/>

    <!-- Face-mask outline — wobbly peach-zone border, thinner stroke -->
    <path d="M ${x(257)},${y(185)}
             C ${x(312)},${y(180)} ${x(375)},${y(214)} ${x(379)},${y(287)}
             C ${x(384)},${y(354)} ${x(347)},${y(435)} ${x(295)},${y(461)}
             C ${x(272)},${y(471)} ${x(240)},${y(471)} ${x(217)},${y(461)}
             C ${x(165)},${y(435)} ${x(128)},${y(354)} ${x(133)},${y(287)}
             C ${x(137)},${y(214)} ${x(198)},${y(180)} ${x(257)},${y(185)} Z"
          stroke-width="${d(5.5)}"/>

    <!-- Muzzle outline — lumpy rounded dome -->
    <path d="M ${x(257)},${y(349)}
             C ${x(305)},${y(344)} ${x(340)},${y(361)} ${x(342)},${y(393)}
             C ${x(344)},${y(428)} ${x(314)},${y(453)} ${x(257)},${y(455)}
             C ${x(199)},${y(453)} ${x(170)},${y(428)} ${x(172)},${y(393)}
             C ${x(174)},${y(361)} ${x(209)},${y(344)} ${x(257)},${y(349)} Z"
          stroke-width="${d(5)}"/>

    <!-- Muzzle center crease -->
    <path d="M ${x(257)},${y(353)} C ${x(256)},${y(381)} ${x(257)},${y(401)} ${x(256)},${y(422)}"
          stroke-width="${d(2.5)}" opacity="0.3"/>

    <!-- Nose outline — tiny lumpy bump, heavier stroke -->
    <path d="M ${x(238)},${y(362)}
             C ${x(238)},${y(349)} ${x(250)},${y(343)} ${x(256)},${y(345)}
             C ${x(263)},${y(343)} ${x(275)},${y(349)} ${x(275)},${y(363)}
             C ${x(271)},${y(372)} ${x(261)},${y(376)} ${x(256)},${y(376)}
             C ${x(251)},${y(376)} ${x(241)},${y(372)} ${x(238)},${y(362)} Z"
          stroke-width="${d(4)}"/>

    <!-- Nostril scratches — two little curved dashes -->
    <path d="M ${x(247)},${y(362)} C ${x(248)},${y(366)} ${x(250)},${y(368)}"
          stroke-width="${d(2.5)}" opacity="0.6"/>
    <path d="M ${x(265)},${y(362)} C ${x(264)},${y(366)} ${x(262)},${y(368)}"
          stroke-width="${d(2.5)}" opacity="0.6"/>

    <!-- Mouth / grin outline — wide open wobbly arc -->
    <path d="M ${x(199)},${y(393)}
             C ${x(208)},${y(425)} ${x(231)},${y(449)} ${x(256)},${y(451)}
             C ${x(281)},${y(449)} ${x(304)},${y(425)} ${x(315)},${y(393)}
             C ${x(299)},${y(408)} ${x(280)},${y(416)} ${x(257)},${y(416)}
             C ${x(234)},${y(416)} ${x(214)},${y(408)} ${x(199)},${y(393)} Z"
          stroke-width="${d(5)}"/>

    <!-- Teeth divider line — subtle horizontal -->
    <path d="M ${x(212)},${y(402)} C ${x(232)},${y(408)} ${x(256)},${y(410)} ${x(280)},${y(408)} C ${x(296)},${y(406)} ${x(304)},${y(402)}"
          stroke-width="${d(2)}" opacity="0.4"/>

    <!-- Tongue center groove -->
    <path d="M ${x(256)},${y(408)} C ${x(255)},${y(420)} ${x(257)},${y(430)} ${x(256)},${y(440)}"
          stroke-width="${d(2.5)}" stroke="#D44060" opacity="0.6"/>

    <!-- Left eye outline — wobbly almond, overshoot at corners -->
    <path d="M ${x(157)},${y(252)}
             C ${x(161)},${y(214)} ${x(192)},${y(198)} ${x(219)},${y(207)}
             C ${x(246)},${y(214)} ${x(254)},${y(243)} ${x(246)},${y(272)}
             C ${x(238)},${y(300)} ${x(209)},${y(310)} ${x(184)},${y(300)}
             C ${x(159)},${y(290)} ${x(153)},${y(268)} ${x(157)},${y(252)} Z"
          stroke-width="${d(6.5)}"/>

    <!-- Left iris outline -->
    <path d="M ${x(178)},${y(250)}
             C ${x(182)},${y(232)} ${x(197)},${y(224)} ${x(212)},${y(228)}
             C ${x(227)},${y(232)} ${x(233)},${y(246)} ${x(229)},${y(265)}
             C ${x(225)},${y(282)} ${x(210)},${y(288)} ${x(196)},${y(284)}
             C ${x(182)},${y(280)} ${x(176)},${y(266)} ${x(178)},${y(250)} Z"
          stroke-width="${d(3)}"/>

    <!-- Left pupil outline — slightly lumpy blob not circle -->
    <path d="M ${x(194)},${y(244)}
             C ${x(200)},${y(238)} ${x(212)},${y(240)} ${x(216)},${y(250)}
             C ${x(220)},${y(260)} ${x(216)},${y(270)} ${x(208)},${y(272)}
             C ${x(200)},${y(274)} ${x(192)},${y(268)} ${x(190)},${y(258)}
             C ${x(188)},${y(248)} ${x(190)},${y(244)} ${x(194)},${y(244)} Z"
          stroke-width="${d(2)}" fill="${PUPIL}" stroke="${PUPIL}"/>
    <!-- Left eye shine sparkle — two quick dabs -->
    <path d="M ${x(192)},${y(242)} C ${x(194)},${y(240)} ${x(198)},${y(241)} ${x(198)},${y(244)}"
          stroke="white" stroke-width="${d(5)}" fill="none"/>
    <path d="M ${x(211)},${y(261)} C ${x(213)},${y(260)} ${x(215)},${y(262)}"
          stroke="white" stroke-width="${d(3.5)}" fill="none" opacity="0.8"/>

    <!-- Right eye outline -->
    <path d="M ${x(355)},${y(252)}
             C ${x(351)},${y(214)} ${x(320)},${y(198)} ${x(293)},${y(207)}
             C ${x(266)},${y(214)} ${x(258)},${y(243)} ${x(266)},${y(272)}
             C ${x(274)},${y(300)} ${x(303)},${y(310)} ${x(328)},${y(300)}
             C ${x(353)},${y(290)} ${x(359)},${y(268)} ${x(355)},${y(252)} Z"
          stroke-width="${d(6.5)}"/>

    <!-- Right iris outline -->
    <path d="M ${x(334)},${y(250)}
             C ${x(330)},${y(232)} ${x(315)},${y(224)} ${x(300)},${y(228)}
             C ${x(285)},${y(232)} ${x(279)},${y(246)} ${x(283)},${y(265)}
             C ${x(287)},${y(282)} ${x(302)},${y(288)} ${x(316)},${y(284)}
             C ${x(330)},${y(280)} ${x(336)},${y(266)} ${x(334)},${y(250)} Z"
          stroke-width="${d(3)}"/>

    <!-- Right pupil -->
    <path d="M ${x(298)},${y(244)}
             C ${x(304)},${y(238)} ${x(316)},${y(240)} ${x(320)},${y(250)}
             C ${x(324)},${y(260)} ${x(320)},${y(270)} ${x(312)},${y(272)}
             C ${x(304)},${y(274)} ${x(296)},${y(268)} ${x(294)},${y(258)}
             C ${x(292)},${y(248)} ${x(294)},${y(244)} ${x(298)},${y(244)} Z"
          stroke-width="${d(2)}" fill="${PUPIL}" stroke="${PUPIL}"/>
    <!-- Right eye shine -->
    <path d="M ${x(296)},${y(242)} C ${x(298)},${y(240)} ${x(302)},${y(241)} ${x(302)},${y(244)}"
          stroke="white" stroke-width="${d(5)}" fill="none"/>
    <path d="M ${x(315)},${y(261)} C ${x(317)},${y(260)} ${x(319)},${y(262)}"
          stroke="white" stroke-width="${d(3.5)}" fill="none" opacity="0.8"/>

    <!-- Left eyebrow — thick wobbly brush stroke, slight arch with wobble -->
    <!-- Drawn as a fat filled path to mimic a marker swipe, not a perfect arc -->
    <path d="M ${x(154)},${y(219)}
             C ${x(168)},${y(195)} ${x(196)},${y(185)} ${x(232)},${y(196)}
             C ${x(234)},${y(200)} ${x(236)},${y(205)} ${x(234)},${y(207)}
             C ${x(200)},${y(197)} ${x(172)},${y(207)} ${x(158)},${y(229)}
             C ${x(155)},${y(226)} ${x(153)},${y(222)} ${x(154)},${y(219)} Z"
          fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${d(2)}"/>

    <!-- Right eyebrow — mirrored wobbly swipe -->
    <path d="M ${x(358)},${y(219)}
             C ${x(344)},${y(195)} ${x(316)},${y(185)} ${x(280)},${y(196)}
             C ${x(278)},${y(200)} ${x(276)},${y(205)} ${x(278)},${y(207)}
             C ${x(312)},${y(197)} ${x(340)},${y(207)} ${x(354)},${y(229)}
             C ${x(357)},${y(226)} ${x(359)},${y(222)} ${x(358)},${y(219)} Z"
          fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="${d(2)}"/>

    <!-- Hair tuft outlines — spiky wiggly strands -->
    <path d="M ${x(271)},${y(98)}
             C ${x(274)},${y(70)} ${x(295)},${y(44)} ${x(305)},${y(27)}
             C ${x(313)},${y(44)} ${x(319)},${y(62)} ${x(308)},${y(84)}
             C ${x(298)},${y(72)} ${x(284)},${y(76)} ${x(271)},${y(98)} Z"
          stroke-width="${d(5)}" fill="${OUTLINE}"/>
    <path d="M ${x(254)},${y(98)}
             C ${x(255)},${y(74)} ${x(267)},${y(53)} ${x(274)},${y(39)}
             C ${x(280)},${y(53)} ${x(282)},${y(70)} ${x(274)},${y(90)}
             C ${x(268)},${y(82)} ${x(260)},${y(84)} ${x(254)},${y(98)} Z"
          stroke-width="${d(4)}" fill="${FUR}"/>

    <!-- Cheek hatching — a few loose parallel scratches for hand-drawn blush texture -->
    <!-- Left cheek cross-hatch lines -->
    <path d="M ${x(138)},${y(348)} C ${x(148)},${y(342)} ${x(162)},${y(344)} ${x(170)},${y(354)}"
          stroke="${CHEEK}" stroke-width="${d(2.5)}" opacity="0.55"/>
    <path d="M ${x(134)},${y(360)} C ${x(146)},${y(354)} ${x(164)},${y(356)} ${x(178)},${y(365)}"
          stroke="${CHEEK}" stroke-width="${d(2.5)}" opacity="0.55"/>
    <path d="M ${x(138)},${y(372)} C ${x(150)},${y(368)} ${x(165)},${y(370)} ${x(174)},${y(378)}"
          stroke="${CHEEK}" stroke-width="${d(2)}" opacity="0.45"/>
    <!-- Right cheek cross-hatch lines -->
    <path d="M ${x(374)},${y(348)} C ${x(364)},${y(342)} ${x(350)},${y(344)} ${x(342)},${y(354)}"
          stroke="${CHEEK}" stroke-width="${d(2.5)}" opacity="0.55"/>
    <path d="M ${x(378)},${y(360)} C ${x(366)},${y(354)} ${x(348)},${y(356)} ${x(334)},${y(365)}"
          stroke="${CHEEK}" stroke-width="${d(2.5)}" opacity="0.55"/>
    <path d="M ${x(374)},${y(372)} C ${x(362)},${y(368)} ${x(347)},${y(370)} ${x(338)},${y(378)}"
          stroke="${CHEEK}" stroke-width="${d(2)}" opacity="0.45"/>

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
