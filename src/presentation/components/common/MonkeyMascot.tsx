export function MonkeyMascot({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Monete monkey mascot"
      role="img"
    >
      {/*
       * HAND-DRAWN FREEHAND MONKEY
       * ─────────────────────────────────────────────────────────────
       * Palette: fur #B0744A | outline #5A3A24 | peach #F0C9A0
       *          iris #D98E33 | pupil #3A2A20 | cheek #FF8FA8
       *          mouth #7A3B3B | tongue #FF6B81
       *
       * Technique:
       *  • Every shape is a cubic Bézier <path> with intentionally
       *    uneven control points (3–8 px off-axis nudges) — no
       *    geometric primitives for face structure.
       *  • Fills rendered ~2–3 px offset from outlines so colour
       *    "bleeds" like marker that doesn't stay in the lines.
       *  • feTurbulence + feDisplacementMap adds ink-jitter bonus
       *    where supported (baked wobble is the primary mechanism).
       *  • Thick round-capped strokes of varying width = brush-pen.
       */}

      <defs>
        <filter id="roughen" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.018 0.022"
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="roughen-fill" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012 0.015"
            numOctaves={2}
            seed={3}
            result="noise2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise2"
            scale={3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* ── FILLS — painted slightly off-register behind outlines ── */}
      <g filter="url(#roughen-fill)">
        {/* Left ear fill — 3px nudge left+up */}
        <path
          d="M 95,223 C 44,207 18,243 23,291 C 28,338 73,366 126,348 C 160,336 173,303 160,266 C 148,228 126,218 95,223 Z"
          fill="#B0744A"
        />
        {/* Left inner ear fill */}
        <path
          d="M 100,245 C 70,237 54,257 58,290 C 62,320 88,336 116,326 C 138,318 146,294 136,268 C 126,246 112,242 100,245 Z"
          fill="#F0C9A0"
        />

        {/* Right ear fill — 3px nudge right+up */}
        <path
          d="M 417,223 C 468,207 494,243 489,291 C 484,338 439,366 386,348 C 352,336 339,303 352,266 C 364,228 386,218 417,223 Z"
          fill="#B0744A"
        />
        {/* Right inner ear fill */}
        <path
          d="M 412,245 C 442,237 458,257 454,290 C 450,320 424,336 396,326 C 374,318 366,294 376,268 C 386,246 400,242 412,245 Z"
          fill="#F0C9A0"
        />

        {/* Head fill — slightly larger blob, 2px offset, bleeds behind outline */}
        <path
          d="M 258,94 C 320,89 414,136 437,238 C 458,326 422,444 313,485 C 284,493 228,494 199,485 C 91,444 56,326 77,238 C 100,136 194,89 258,94 Z"
          fill="#B0744A"
        />

        {/* Face-mask fill — offset 2px so peach bleeds slightly */}
        <path
          d="M 258,182 C 317,178 378,211 381,285 C 385,352 348,434 295,460 C 272,470 239,470 216,460 C 164,434 127,352 131,285 C 135,211 197,178 258,182 Z"
          fill="#F0C9A0"
        />

        {/* Left cheek fill — offset 3px left */}
        <path
          d="M 148,326 C 130,316 118,332 122,359 C 127,385 153,399 180,389 C 200,381 204,357 190,334 C 178,318 161,318 148,326 Z"
          fill="#FF8FA8"
          opacity="0.75"
        />

        {/* Right cheek fill — offset 3px right */}
        <path
          d="M 364,326 C 382,316 394,332 390,359 C 385,385 359,399 332,389 C 312,381 308,357 322,334 C 334,318 350,318 364,326 Z"
          fill="#FF8FA8"
          opacity="0.75"
        />

        {/* Muzzle fill — offset 2px down */}
        <path
          d="M 256,350 C 303,346 338,362 340,394 C 342,428 313,453 257,454 C 200,453 171,428 173,394 C 175,362 210,346 256,350 Z"
          fill="#F0C9A0"
        />

        {/* Mouth interior fill */}
        <path
          d="M 198,393 C 208,424 230,448 255,450 C 280,448 303,424 314,393 C 298,408 279,416 257,416 C 234,416 215,408 198,393 Z"
          fill="#7A3B3B"
        />
        {/* Teeth fill */}
        <path
          d="M 206,396 C 217,410 235,416 256,416 C 277,416 295,410 306,396 C 292,407 275,410 256,410 C 237,410 220,407 206,396 Z"
          fill="white"
        />
        {/* Tongue fill */}
        <path
          d="M 234,420 C 234,410 245,405 256,405 C 267,405 278,410 278,420 C 278,436 268,442 256,442 C 244,442 234,436 234,420 Z"
          fill="#FF6B81"
        />

        {/* Left eye white fill — offset 2px */}
        <path
          d="M 156,250 C 160,213 191,197 218,205 C 245,213 253,242 245,271 C 237,299 209,309 184,299 C 159,289 152,267 156,250 Z"
          fill="white"
        />
        {/* Left iris fill */}
        <path
          d="M 177,249 C 181,231 196,223 211,227 C 226,231 232,245 228,264 C 224,281 209,287 195,283 C 181,279 175,265 177,249 Z"
          fill="#D98E33"
        />

        {/* Right eye white fill — offset 2px */}
        <path
          d="M 356,250 C 352,213 321,197 294,205 C 267,213 259,242 267,271 C 275,299 303,309 328,299 C 353,289 360,267 356,250 Z"
          fill="white"
        />
        {/* Right iris fill */}
        <path
          d="M 335,249 C 331,231 316,223 301,227 C 286,231 280,245 284,264 C 288,281 303,287 317,283 C 331,279 337,265 335,249 Z"
          fill="#D98E33"
        />

        {/* Nose fill — lumpy rounded bump */}
        <path
          d="M 237,361 C 237,349 249,343 256,345 C 263,343 275,349 275,362 C 271,371 261,375 256,375 C 251,375 241,371 237,361 Z"
          fill="#5A3A24"
        />

        {/* Hair tuft fills */}
        <path
          d="M 271,97 C 274,69 294,44 304,27 C 312,44 318,61 307,83 C 297,71 283,75 271,97 Z"
          fill="#5A3A24"
        />
        <path
          d="M 255,97 C 256,73 268,52 275,38 C 281,52 283,69 275,89 C 269,81 261,83 255,97 Z"
          fill="#B0744A"
        />
      </g>

      {/* ── OUTLINES — hand-drawn dark strokes with ink-jitter filter ── */}
      <g
        filter="url(#roughen)"
        fill="none"
        stroke="#5A3A24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left ear outline — wobbly blob */}
        <path
          d="M 100,228 C 50,211 20,247 25,294 C 30,342 78,370 130,352 C 164,340 176,308 163,270 C 150,232 128,221 100,228 Z"
          strokeWidth="7.5"
        />
        {/* Left inner ear */}
        <path
          d="M 103,249 C 73,241 56,262 60,293 C 65,323 91,339 119,329 C 141,321 149,297 139,271 C 129,249 115,245 103,249 Z"
          strokeWidth="4.5"
        />

        {/* Right ear outline */}
        <path
          d="M 412,228 C 462,211 492,247 487,294 C 482,342 434,370 382,352 C 348,340 336,308 349,270 C 362,232 384,221 412,228 Z"
          strokeWidth="7.5"
        />
        {/* Right inner ear */}
        <path
          d="M 409,249 C 439,241 456,262 452,293 C 447,323 421,339 393,329 C 371,321 363,297 373,271 C 383,249 397,245 409,249 Z"
          strokeWidth="4.5"
        />

        {/* Head outline — big wobbly blob, control points nudged irregularly */}
        <path
          d="M 258,97 C 304,90 378,118 416,172 C 450,222 456,298 440,370 C 425,442 372,487 310,486 C 284,494 228,494 202,486 C 140,487 87,442 72,370 C 56,298 62,222 96,172 C 134,118 208,90 258,97 Z"
          strokeWidth="9"
        />

        {/* Face-mask outline */}
        <path
          d="M 257,185 C 312,180 375,214 379,287 C 384,354 347,435 295,461 C 272,471 240,471 217,461 C 165,435 128,354 133,287 C 137,214 198,180 257,185 Z"
          strokeWidth="5.5"
        />

        {/* Muzzle outline — lumpy dome */}
        <path
          d="M 257,349 C 305,344 340,361 342,393 C 344,428 314,453 257,455 C 199,453 170,428 172,393 C 174,361 209,344 257,349 Z"
          strokeWidth="5"
        />

        {/* Muzzle center crease */}
        <path d="M 257,353 C 256,381 257,401 256,422" strokeWidth="2.5" opacity="0.3" />

        {/* Nose outline */}
        <path
          d="M 238,362 C 238,349 250,343 256,345 C 263,343 275,349 275,363 C 271,372 261,376 256,376 C 251,376 241,372 238,362 Z"
          strokeWidth="4"
        />

        {/* Nostril scratches */}
        <path d="M 247,362 C 248,366 250,368" strokeWidth="2.5" opacity="0.6" />
        <path d="M 265,362 C 264,366 262,368" strokeWidth="2.5" opacity="0.6" />

        {/* Grin outline — wide wobbly arc */}
        <path
          d="M 199,393 C 208,425 231,449 256,451 C 281,449 304,425 315,393 C 299,408 280,416 257,416 C 234,416 214,408 199,393 Z"
          strokeWidth="5"
        />

        {/* Teeth divider */}
        <path
          d="M 212,402 C 232,408 256,410 280,408 C 296,406 304,402"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Tongue center groove */}
        <path
          d="M 256,408 C 255,420 257,430 256,440"
          strokeWidth="2.5"
          stroke="#D44060"
          opacity="0.6"
        />

        {/* Left eye outline — wobbly almond */}
        <path
          d="M 157,252 C 161,214 192,198 219,207 C 246,214 254,243 246,272 C 238,300 209,310 184,300 C 159,290 153,268 157,252 Z"
          strokeWidth="6.5"
        />
        {/* Left iris outline */}
        <path
          d="M 178,250 C 182,232 197,224 212,228 C 227,232 233,246 229,265 C 225,282 210,288 196,284 C 182,280 176,266 178,250 Z"
          strokeWidth="3"
        />
        {/* Left pupil — lumpy blob not circle */}
        <path
          d="M 194,244 C 200,238 212,240 216,250 C 220,260 216,270 208,272 C 200,274 192,268 190,258 C 188,248 190,244 194,244 Z"
          strokeWidth="2"
          fill="#3A2A20"
          stroke="#3A2A20"
        />
        {/* Left eye shine dabs */}
        <path d="M 192,242 C 194,240 198,241 198,244" stroke="white" strokeWidth="5" fill="none" />
        <path
          d="M 211,261 C 213,260 215,262"
          stroke="white"
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />

        {/* Right eye outline */}
        <path
          d="M 355,252 C 351,214 320,198 293,207 C 266,214 258,243 266,272 C 274,300 303,310 328,300 C 353,290 359,268 355,252 Z"
          strokeWidth="6.5"
        />
        {/* Right iris outline */}
        <path
          d="M 334,250 C 330,232 315,224 300,228 C 285,232 279,246 283,265 C 287,282 302,288 316,284 C 330,280 336,266 334,250 Z"
          strokeWidth="3"
        />
        {/* Right pupil */}
        <path
          d="M 298,244 C 304,238 316,240 320,250 C 324,260 320,270 312,272 C 304,274 296,268 294,258 C 292,248 294,244 298,244 Z"
          strokeWidth="2"
          fill="#3A2A20"
          stroke="#3A2A20"
        />
        {/* Right eye shine dabs */}
        <path d="M 296,242 C 298,240 302,241 302,244" stroke="white" strokeWidth="5" fill="none" />
        <path
          d="M 315,261 C 317,260 319,262"
          stroke="white"
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />

        {/* Left eyebrow — thick wobbly marker swipe */}
        <path
          d="M 154,219 C 168,195 196,185 232,196 C 234,200 236,205 234,207 C 200,197 172,207 158,229 C 155,226 153,222 154,219 Z"
          fill="#5A3A24"
          stroke="#5A3A24"
          strokeWidth="2"
        />

        {/* Right eyebrow — mirrored wobbly swipe */}
        <path
          d="M 358,219 C 344,195 316,185 280,196 C 278,200 276,205 278,207 C 312,197 340,207 354,229 C 357,226 359,222 358,219 Z"
          fill="#5A3A24"
          stroke="#5A3A24"
          strokeWidth="2"
        />

        {/* Hair tuft outlines — spiky wiggly strands */}
        <path
          d="M 271,98 C 274,70 295,44 305,27 C 313,44 319,62 308,84 C 298,72 284,76 271,98 Z"
          strokeWidth="5"
          fill="#5A3A24"
        />
        <path
          d="M 254,98 C 255,74 267,53 274,39 C 280,53 282,70 274,90 C 268,82 260,84 254,98 Z"
          strokeWidth="4"
          fill="#B0744A"
        />

        {/* Cheek hatching — loose parallel scratches for hand-drawn blush texture */}
        {/* Left cheek hatch lines */}
        <path
          d="M 138,348 C 148,342 162,344 170,354"
          stroke="#FF8FA8"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <path
          d="M 134,360 C 146,354 164,356 178,365"
          stroke="#FF8FA8"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <path
          d="M 138,372 C 150,368 165,370 174,378"
          stroke="#FF8FA8"
          strokeWidth="2"
          opacity="0.45"
        />
        {/* Right cheek hatch lines */}
        <path
          d="M 374,348 C 364,342 350,344 342,354"
          stroke="#FF8FA8"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <path
          d="M 378,360 C 366,354 348,356 334,365"
          stroke="#FF8FA8"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <path
          d="M 374,372 C 362,368 347,370 338,378"
          stroke="#FF8FA8"
          strokeWidth="2"
          opacity="0.45"
        />
      </g>
    </svg>
  )
}
