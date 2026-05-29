export function MonkeyMascot({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Monete monkey mascot"
      role="img"
    >
      {/* ── Palette (per design brief) ── */}
      {/* fur: #B0744A | fur-dark: #6B4128 | peach face: #F0C9A0 */}
      {/* iris: #D98E33 | pupil: #3A2A20 | brow: #5A3A24 */}
      {/* cheek: #FF8FA8 | mouth: #7A3B3B | tongue: #FF6B81 */}

      {/* ── Confetti balls — festive glossy spheres near head ── */}
      {/* Raspberry top-left */}
      <circle cx="78" cy="148" r="26" fill="#FF4D79" />
      <circle cx="70" cy="140" r="10" fill="white" opacity="0.45" />

      {/* Banana top-right */}
      <circle cx="434" cy="112" r="22" fill="#FFC53D" />
      <circle cx="426" cy="104" r="8" fill="white" opacity="0.45" />

      {/* Mint far-right */}
      <circle cx="466" cy="308" r="20" fill="#34D399" />
      <circle cx="459" cy="300" r="7" fill="white" opacity="0.45" />

      {/* Sky bottom-left */}
      <circle cx="62" cy="390" r="18" fill="#56A8FF" />
      <circle cx="56" cy="383" r="6" fill="white" opacity="0.45" />

      {/* Grape top-center-right */}
      <circle cx="390" cy="60" r="17" fill="#A66CFF" />
      <circle cx="384" cy="53" r="6" fill="white" opacity="0.45" />

      {/* Small raspberry bottom-right */}
      <circle cx="448" cy="420" r="15" fill="#FF4D79" />
      <circle cx="443" cy="414" r="5" fill="white" opacity="0.45" />

      {/* ── Ears — large floppy rounded blob shapes, behind head ── */}
      {/* Left ear outer (warm brown) */}
      <path
        d="M 98,226 C 48,210 22,245 26,292 C 30,340 76,368 128,350 C 162,338 174,306 162,268 C 150,230 128,220 98,226 Z"
        fill="#B0744A"
      />
      {/* Left ear darker shadow rim */}
      <path
        d="M 100,230 C 56,216 34,248 38,290 C 42,330 82,354 124,340 C 152,330 162,302 152,270 C 142,236 122,226 100,230 Z"
        fill="#6B4128"
        opacity="0.35"
      />
      {/* Left inner ear (peach) */}
      <path
        d="M 102,248 C 72,240 56,260 60,292 C 64,322 90,338 118,328 C 140,320 148,296 138,270 C 128,248 114,244 102,248 Z"
        fill="#F0C9A0"
      />

      {/* Right ear outer (warm brown) */}
      <path
        d="M 414,226 C 464,210 490,245 486,292 C 482,340 436,368 384,350 C 350,338 338,306 350,268 C 362,230 384,220 414,226 Z"
        fill="#B0744A"
      />
      {/* Right ear darker shadow rim */}
      <path
        d="M 412,230 C 456,216 478,248 474,290 C 470,330 430,354 388,340 C 360,330 350,302 360,270 C 370,236 390,226 412,230 Z"
        fill="#6B4128"
        opacity="0.35"
      />
      {/* Right inner ear (peach) */}
      <path
        d="M 410,248 C 440,240 456,260 452,292 C 448,322 422,338 394,328 C 372,320 364,296 374,270 C 384,248 398,244 410,248 Z"
        fill="#F0C9A0"
      />

      {/* ── Head — big warm-brown organic blob, wider at cheeks/jaw ── */}
      <path
        d="M 256,96 C 316,92 408,138 432,240 C 452,328 418,444 310,484 C 282,492 230,492 202,484 C 94,444 60,328 80,240 C 104,138 196,92 256,96 Z"
        fill="#B0744A"
      />
      {/* Head shadow / depth — darker crescent on left gives dimension */}
      <path
        d="M 256,96 C 196,92 104,138 80,240 C 68,298 78,360 110,412 C 88,360 84,298 98,244 C 118,150 204,108 256,108 Z"
        fill="#6B4128"
        opacity="0.28"
      />

      {/* ── Hair tuft — small pointy cowlick on top, slightly right ── */}
      <path
        d="M 270,96 C 272,68 292,44 302,28 C 310,44 316,60 306,82 C 296,70 282,74 270,96 Z"
        fill="#6B4128"
      />
      {/* Second tuft strand — slightly left, fluffy feel */}
      <path
        d="M 256,96 C 256,72 268,52 274,38 C 280,52 282,68 274,88 C 268,80 260,82 256,96 Z"
        fill="#B0744A"
      />

      {/* ── Face mask — peach rounded oval covering eye+muzzle zone ── */}
      <path
        d="M 256,184 C 314,180 374,212 378,286 C 382,352 346,432 294,458 C 272,468 240,468 218,458 C 166,432 130,352 134,286 C 138,212 198,180 256,184 Z"
        fill="#F0C9A0"
      />

      {/* ── Cheeks — rosy soft blobs peeking from face-mask sides ── */}
      {/* Left blush cheek */}
      <path
        d="M 152,328 C 134,318 122,334 126,360 C 130,386 156,400 182,390 C 202,382 206,358 192,336 C 180,320 164,320 152,328 Z"
        fill="#FF8FA8"
        opacity="0.82"
      />
      {/* Right blush cheek */}
      <path
        d="M 360,328 C 378,318 390,334 386,360 C 382,386 356,400 330,390 C 310,382 306,358 320,336 C 332,320 348,320 360,328 Z"
        fill="#FF8FA8"
        opacity="0.82"
      />

      {/* ── Muzzle — rounded dome/bean shape, lower face ── */}
      <path
        d="M 256,348 C 302,344 336,360 338,392 C 340,426 312,450 256,452 C 200,450 172,426 174,392 C 176,360 210,344 256,348 Z"
        fill="#F0C9A0"
      />
      {/* Muzzle shadow crease — subtle center line for dome feel */}
      <path
        d="M 256,352 C 256,380 256,400 256,420"
        fill="none"
        stroke="#6B4128"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Nose — friendly rounded arch path (not a circle) */}
      <path
        d="M 238,362 C 238,350 250,344 256,346 C 262,344 274,350 274,362 C 270,370 260,374 256,374 C 252,374 242,370 238,362 Z"
        fill="#5A3A24"
      />

      {/* ── Smile — wide open laughing grin with tongue ── */}
      {/* Wide dark outer lip / grin shape */}
      <path
        d="M 200,392 C 210,422 232,446 256,448 C 280,446 302,422 312,392 C 296,406 278,414 256,414 C 234,414 216,406 200,392 Z"
        fill="#7A3B3B"
      />
      {/* Teeth — upper white band */}
      <path
        d="M 208,395 C 218,408 236,414 256,414 C 276,414 294,408 304,395 C 290,405 274,408 256,408 C 238,408 222,405 208,395 Z"
        fill="white"
      />
      {/* Tongue — pink curved blob inside mouth */}
      <path
        d="M 236,418 C 236,408 246,404 256,404 C 266,404 276,408 276,418 C 276,434 266,440 256,440 C 246,440 236,434 236,418 Z"
        fill="#FF6B81"
      />
      {/* Tongue center groove */}
      <path
        d="M 256,406 C 256,418 256,428 256,438"
        fill="none"
        stroke="#D44060"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* ── Eyes — big round almond shapes, large sclera, bright ── */}
      {/* Left eye white sclera (large rounded almond) */}
      <path
        d="M 158,252 C 162,216 192,200 218,208 C 244,216 252,244 244,272 C 236,298 208,308 184,298 C 160,288 154,268 158,252 Z"
        fill="white"
      />
      {/* Left iris (warm amber oval path) */}
      <path
        d="M 178,250 C 182,232 196,224 210,228 C 224,232 230,246 226,264 C 222,280 208,286 194,282 C 180,278 174,264 178,250 Z"
        fill="#D98E33"
      />
      {/* Left pupil */}
      <circle cx="204" cy="256" r="14" fill="#3A2A20" />
      {/* Left eye big shine sparkle */}
      <circle cx="194" cy="244" r="8" fill="white" />
      {/* Left small secondary shine */}
      <circle cx="212" cy="264" r="4" fill="white" opacity="0.7" />

      {/* Right eye white sclera (mirrored almond) */}
      <path
        d="M 354,252 C 350,216 320,200 294,208 C 268,216 260,244 268,272 C 276,298 304,308 328,298 C 352,288 358,268 354,252 Z"
        fill="white"
      />
      {/* Right iris */}
      <path
        d="M 334,250 C 330,232 316,224 302,228 C 288,232 282,246 286,264 C 290,280 304,286 318,282 C 332,278 338,264 334,250 Z"
        fill="#D98E33"
      />
      {/* Right pupil */}
      <circle cx="308" cy="256" r="14" fill="#3A2A20" />
      {/* Right eye big shine sparkle */}
      <circle cx="298" cy="244" r="8" fill="white" />
      {/* Right small secondary shine */}
      <circle cx="316" cy="264" r="4" fill="white" opacity="0.7" />

      {/* ── Eyebrows — thick dark curved arches, raised high = happy ── */}
      {/* Left eyebrow */}
      <path
        d="M 156,218 C 172,196 204,188 238,200"
        fill="none"
        stroke="#5A3A24"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Right eyebrow */}
      <path
        d="M 356,218 C 340,196 308,188 274,200"
        fill="none"
        stroke="#5A3A24"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  )
}
