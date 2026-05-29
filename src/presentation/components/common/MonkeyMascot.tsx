export function MonkeyMascot({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Monete monkey mascot"
      role="img"
    >
      <defs>
        <clipPath id="hatClipMascot">
          <path d="M 272,52 C 290,100 340,170 385,210 L 168,210 C 210,170 255,100 272,52 Z" />
        </clipPath>
      </defs>

      {/* ── Party hat (drawn first so the head overlaps the base) ── */}
      {/* Jaunty tilted cone, tip off-center to the right */}
      <path
        d="M 272,52 C 290,100 340,170 385,210 L 168,210 C 210,170 255,100 272,52 Z"
        fill="#FFC53D"
      />
      {/* Hat decorative dots (raspberry), clipped to hat shape */}
      <g clipPath="url(#hatClipMascot)">
        <circle cx="258" cy="118" r="13" fill="#FF4D79" />
        <circle cx="300" cy="163" r="13" fill="#FF4D79" />
        <circle cx="220" cy="170" r="10" fill="#FF4D79" />
      </g>
      {/* Hat band: raspberry stripe across base */}
      <path
        d="M 163,204 C 255,222 340,220 390,207 C 390,220 360,228 276,228 C 195,228 163,220 163,204 Z"
        fill="#FF4D79"
      />
      {/* Pom-pom: fluffy mint circle at tip */}
      <circle cx="270" cy="44" r="26" fill="#34D399" />
      <circle cx="262" cy="36" r="11" fill="white" opacity="0.60" />

      {/* ── Ears — floppy rounded blob shapes, not circles ── */}
      {/* Left ear */}
      <path
        d="M 82,200 C 42,195 28,220 32,255 C 36,295 72,310 112,298 C 138,290 148,268 140,240 C 132,210 110,202 82,200 Z"
        fill="#5A4034"
      />
      {/* Left inner ear cream */}
      <path
        d="M 86,216 C 62,214 52,232 54,258 C 58,286 80,296 106,286 C 124,278 130,258 122,238 C 114,218 100,216 86,216 Z"
        fill="#FFF1DD"
      />
      {/* Right ear */}
      <path
        d="M 430,200 C 470,195 484,220 480,255 C 476,295 440,310 400,298 C 374,290 364,268 372,240 C 380,210 402,202 430,200 Z"
        fill="#5A4034"
      />
      {/* Right inner ear cream */}
      <path
        d="M 426,216 C 450,214 460,232 458,258 C 454,286 432,296 406,286 C 388,278 382,258 390,238 C 398,218 412,216 426,216 Z"
        fill="#FFF1DD"
      />

      {/* ── Head — organic rounded blob, pear-shaped, wider at jaw ── */}
      <path
        d="M 256,110 C 330,108 430,170 445,270 C 460,370 400,478 256,480 C 112,478 52,370 67,270 C 82,170 182,108 256,110 Z"
        fill="#3B2A22"
      />

      {/* ── Face patch — classic monkey cream mask ── */}
      {/* Covers the eye+muzzle zone — wide rounded heart/teardrop */}
      <path
        d="M 256,200 C 310,195 370,220 375,285 C 380,340 345,410 295,435 C 270,446 242,446 217,435 C 167,410 132,340 137,285 C 142,220 202,195 256,200 Z"
        fill="#FFF1DD"
      />

      {/* ── Cheeks — soft rosy blobs ── */}
      {/* Left cheek */}
      <path
        d="M 148,315 C 132,308 122,322 124,344 C 128,368 150,378 172,370 C 190,362 192,342 180,324 C 170,312 158,312 148,315 Z"
        fill="#FF8FA8"
        opacity="0.85"
      />
      {/* Right cheek */}
      <path
        d="M 364,315 C 380,308 390,322 388,344 C 384,368 362,378 340,370 C 322,362 320,342 332,324 C 342,312 354,312 364,315 Z"
        fill="#FF8FA8"
        opacity="0.85"
      />

      {/* ── Muzzle — rounded protruding snout blob ── */}
      <path
        d="M 256,340 C 296,338 326,352 328,378 C 330,406 304,424 256,426 C 208,424 182,406 184,378 C 186,352 216,338 256,340 Z"
        fill="#FFF1DD"
      />
      {/* Nose: friendly rounded shape */}
      <path
        d="M 256,354 C 248,354 242,358 244,366 C 246,373 252,374 256,374 C 260,374 266,373 268,366 C 270,358 264,354 256,354 Z"
        fill="#3B2A22"
      />

      {/* ── Smile — wide open grin, shows white teeth ── */}
      {/* Outer dark lip shape */}
      <path
        d="M 210,382 C 218,400 236,416 256,416 C 276,416 294,400 302,382 C 290,390 274,395 256,395 C 238,395 222,390 210,382 Z"
        fill="#3B2A22"
      />
      {/* Inner white grin */}
      <path
        d="M 218,386 C 226,400 240,408 256,408 C 272,408 286,400 294,386 C 278,393 268,390 256,390 C 244,390 233,393 218,386 Z"
        fill="white"
      />

      {/* ── Eyes — almond paths with cheerful arched upper lids ── */}
      {/* Left eye white sclera (almond shape) */}
      <path
        d="M 170,258 C 175,232 195,222 213,228 C 231,234 238,252 233,272 C 228,290 208,296 190,290 C 172,284 166,270 170,258 Z"
        fill="white"
      />
      {/* Left pupil */}
      <circle cx="202" cy="258" r="16" fill="#3B2A22" />
      {/* Left eye shine */}
      <circle cx="194" cy="250" r="7" fill="white" />
      {/* Left upper eyelid — arched for delighted expression */}
      <path
        d="M 168,256 C 176,230 200,218 236,230"
        fill="none"
        stroke="#3B2A22"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Right eye white sclera (almond shape) */}
      <path
        d="M 342,258 C 347,232 327,222 309,228 C 291,234 284,252 289,272 C 294,290 314,296 332,290 C 350,284 346,270 342,258 Z"
        fill="white"
      />
      {/* Right pupil */}
      <circle cx="310" cy="258" r="16" fill="#3B2A22" />
      {/* Right eye shine */}
      <circle cx="302" cy="250" r="7" fill="white" />
      {/* Right upper eyelid — arched for delighted expression */}
      <path
        d="M 344,256 C 336,230 312,218 276,230"
        fill="none"
        stroke="#3B2A22"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
