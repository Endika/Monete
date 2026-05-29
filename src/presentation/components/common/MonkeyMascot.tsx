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
       * CHILD'S CRAYON DRAWING of a happy monkey
       * ─────────────────────────────────────────────────────────────
       * Palette: fur #B0744A | outline #5A3A24 | peach #F0C9A0
       *          iris #D98E33 | pupil #3A2A20 | cheek #FF8FA8
       *          mouth #7A3B3B | tongue #FF6B81
       *
       * Technique — pushed hard into naive kid-crayon territory:
       *  • STRONG asymmetry: left eye bigger/higher, right ear smaller/lower,
       *    head lumpy, grin crooked (higher on left), eyebrows differ.
       *  • Fills offset 6–12 px from outlines so colour bleeds OUTSIDE the lines.
       *  • Stroke-width varies wildly: head outline 14px, right eye 7px.
       *  • Scribble cheek hatching (back-and-forth crayon lines).
       *  • Three wonky hair tufts — all different sizes, leaning different ways.
       *  • feTurbulence scale 9 (fills) and 7 (outlines) for real jitter.
       *  • Round caps/joins throughout.
       */}

      <defs>
        {/* Strong crayon roughen — scale bumped for real jitter */}
        <filter id="roughen" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.025 0.030"
            numOctaves={4}
            seed={13}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={9}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="roughen-fill" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.018 0.022"
            numOctaves={3}
            seed={5}
            result="noise2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise2"
            scale={7}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* ── FILLS — big offsets so colour CLEARLY bleeds outside outlines ── */}
      <g filter="url(#roughen-fill)">
        {/* LEFT EAR fill — nudged 8px left+up, noticeably bigger than right */}
        <path
          d="M 82,206 C 28,186 -2,228 6,284 C 14,340 66,374 128,352 C 166,337 181,300 166,258 C 152,216 122,202 82,206 Z"
          fill="#B0744A"
        />
        {/* Left inner ear fill */}
        <path
          d="M 90,232 C 58,222 40,246 46,284 C 52,320 82,340 118,328 C 144,319 154,292 142,262 C 130,238 114,232 90,232 Z"
          fill="#F0C9A0"
        />

        {/* RIGHT EAR fill — smaller, lower (asymmetric!) */}
        <path
          d="M 426,240 C 474,225 502,260 496,306 C 490,352 444,376 394,356 C 360,341 348,309 360,273 C 372,242 396,232 426,240 Z"
          fill="#B0744A"
        />
        {/* Right inner ear fill */}
        <path
          d="M 420,262 C 450,252 466,272 460,306 C 456,338 428,354 400,342 C 378,332 370,308 382,278 C 392,256 406,252 420,262 Z"
          fill="#F0C9A0"
        />

        {/* HEAD fill — lumpy asymmetric blob offset 8px, left side lower */}
        <path
          d="M 248,88 C 296,78 388,116 426,176 C 462,234 466,318 448,398 C 431,472 376,504 308,500 C 278,506 222,506 190,500 C 122,504 64,472 52,398 C 38,318 46,234 82,176 C 122,116 196,78 248,88 Z"
          fill="#B0744A"
        />

        {/* FACE MASK fill — offset 6px down+left, bleeds into fur */}
        <path
          d="M 252,188 C 316,180 386,218 388,298 C 392,372 352,456 296,482 C 272,492 236,494 210,482 C 154,456 116,372 122,298 C 128,218 190,180 252,188 Z"
          fill="#F0C9A0"
        />

        {/* LEFT CHEEK scribble blob — big, offset left, clearly outside outline */}
        <path
          d="M 128,330 C 108,314 92,334 98,368 C 104,400 138,416 172,402 C 198,390 204,360 186,334 C 170,314 148,314 128,330 Z"
          fill="#FF8FA8"
          opacity="0.55"
        />
        {/* Cheek scribble lines — back-and-forth crayon hatching */}
        <path
          d="M 108,344 L 172,336"
          stroke="#FF8FA8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 100,358 L 180,354"
          stroke="#FF8FA8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 106,372 L 182,370"
          stroke="#FF8FA8"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M 116,386 L 176,386"
          stroke="#FF8FA8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* RIGHT CHEEK scribble blob — offset right */}
        <path
          d="M 382,336 C 402,320 418,340 412,374 C 406,406 372,422 340,408 C 314,396 310,364 328,340 C 344,320 364,320 382,336 Z"
          fill="#FF8FA8"
          opacity="0.55"
        />
        {/* Right cheek scribble lines */}
        <path
          d="M 404,350 L 330,344"
          stroke="#FF8FA8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 412,364 L 326,362"
          stroke="#FF8FA8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 408,378 L 328,378"
          stroke="#FF8FA8"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M 396,392 L 336,392"
          stroke="#FF8FA8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* MUZZLE fill — offset 6px down, bleeds below muzzle outline */}
        <path
          d="M 252,358 C 306,350 346,370 348,406 C 350,444 318,472 256,472 C 194,472 164,444 168,406 C 172,370 200,350 252,358 Z"
          fill="#F0C9A0"
        />

        {/* MOUTH interior */}
        <path
          d="M 192,404 C 204,438 228,464 255,466 C 282,464 308,438 320,404 C 302,422 280,430 256,430 C 232,430 210,422 192,404 Z"
          fill="#7A3B3B"
        />
        {/* Teeth — lumpy white strip */}
        <path
          d="M 200,408 C 215,424 234,430 256,430 C 278,430 298,424 314,408 C 296,420 276,424 256,424 C 236,424 216,420 200,408 Z"
          fill="white"
        />
        {/* Tongue */}
        <path
          d="M 228,432 C 228,420 242,414 256,414 C 270,414 284,420 284,432 C 284,452 272,460 256,460 C 240,460 228,452 228,432 Z"
          fill="#FF6B81"
        />

        {/* LEFT EYE fill — BIGGER, higher up (asymmetric!), offset 6px up+left */}
        <path
          d="M 142,238 C 148,196 184,178 218,188 C 252,198 262,232 252,268 C 242,304 208,318 176,306 C 144,294 136,268 142,238 Z"
          fill="white"
        />
        {/* Left iris — amber */}
        <path
          d="M 166,240 C 172,218 192,208 212,214 C 232,220 240,238 234,262 C 228,284 208,292 188,286 C 168,280 160,262 166,240 Z"
          fill="#D98E33"
        />

        {/* RIGHT EYE fill — SMALLER, lower (asymmetric!), offset 6px down+right */}
        <path
          d="M 368,270 C 362,232 330,214 298,224 C 266,234 256,266 266,298 C 276,328 308,340 336,328 C 364,316 374,292 368,270 Z"
          fill="white"
        />
        {/* Right iris — slightly smaller */}
        <path
          d="M 348,270 C 344,252 326,242 308,248 C 290,254 282,270 288,290 C 294,310 314,318 332,312 C 350,306 356,290 348,270 Z"
          fill="#D98E33"
        />

        {/* NOSE fill — big lumpy dark blob offset down */}
        <path
          d="M 232,368 C 232,352 246,344 256,348 C 266,344 280,352 278,368 C 274,380 263,385 256,384 C 249,385 238,380 232,368 Z"
          fill="#5A3A24"
        />

        {/* HAIR TUFTS fills — 3 wonky spikes, all different, kid-drawn */}
        {/* Middle tuft — tallest, leans right */}
        <path
          d="M 262,96 C 268,66 294,38 308,18 C 318,38 322,62 308,88 C 296,74 278,78 262,96 Z"
          fill="#5A3A24"
        />
        {/* Left tuft — shorter, leans left */}
        <path
          d="M 232,100 C 226,72 220,48 222,28 C 234,44 244,64 240,90 C 236,82 228,84 232,100 Z"
          fill="#B0744A"
        />
        {/* Right tuft — medium, fattest */}
        <path
          d="M 284,94 C 292,68 308,50 316,36 C 322,50 322,68 312,88 C 306,78 292,80 284,94 Z"
          fill="#B0744A"
        />
      </g>

      {/* ── OUTLINES — thick uneven crayon strokes, variable widths ── */}
      <g
        filter="url(#roughen)"
        fill="none"
        stroke="#5A3A24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* LEFT EAR outline — bigger, higher, stroke 12px */}
        <path
          d="M 88,214 C 34,192 2,234 10,292 C 18,350 74,382 136,358 C 174,342 188,302 172,258 C 156,214 130,202 88,214 Z"
          strokeWidth="12"
        />
        {/* Left inner ear */}
        <path
          d="M 96,238 C 62,228 44,252 50,290 C 56,328 86,346 122,332 C 148,322 158,294 146,264 C 134,238 116,232 96,238 Z"
          strokeWidth="6"
        />

        {/* RIGHT EAR outline — smaller, lower, thinner stroke 9px */}
        <path
          d="M 422,248 C 470,232 500,268 494,314 C 488,360 440,386 388,364 C 350,348 338,312 352,274 C 366,240 392,230 422,248 Z"
          strokeWidth="9"
        />
        {/* Right inner ear */}
        <path
          d="M 416,268 C 448,256 464,278 458,312 C 452,344 424,360 394,346 C 370,334 362,310 374,282 C 386,258 400,254 416,268 Z"
          strokeWidth="5"
        />

        {/* HEAD outline — strongly lumpy, asymmetric, heavy 14px stroke */}
        <path
          d="M 256,96 C 306,86 392,116 432,178 C 468,238 472,326 452,410 C 434,490 374,512 308,510 C 280,518 220,518 188,510 C 118,512 56,490 42,410 C 26,326 36,238 76,178 C 118,116 204,86 256,96 Z"
          strokeWidth="14"
        />

        {/* FACE MASK outline — irregular blob */}
        <path
          d="M 254,194 C 316,186 384,226 386,306 C 390,380 350,468 294,494 C 270,506 232,506 206,494 C 148,468 108,380 116,306 C 124,226 190,186 254,194 Z"
          strokeWidth="8"
        />

        {/* MUZZLE outline */}
        <path
          d="M 254,360 C 308,352 348,374 350,412 C 352,452 318,480 256,480 C 194,480 162,452 164,412 C 166,374 202,352 254,360 Z"
          strokeWidth="7"
        />

        {/* Muzzle center crease */}
        <path d="M 256,364 C 254,394 257,416 254,440" strokeWidth="3" opacity="0.35" />

        {/* NOSE outline */}
        <path
          d="M 234,370 C 234,354 248,346 256,350 C 264,346 278,354 278,370 C 274,382 264,387 256,386 C 248,387 238,382 234,370 Z"
          strokeWidth="5.5"
        />
        {/* Nostril scratches */}
        <path d="M 244,368 C 246,374 249,378" strokeWidth="3" opacity="0.55" />
        <path d="M 268,368 C 266,374 263,378" strokeWidth="3" opacity="0.55" />

        {/* CROOKED GRIN — wide, asymmetric, higher on left than right */}
        <path
          d="M 186,400 C 196,436 224,464 254,466 C 284,464 312,436 324,408 C 306,426 282,434 256,434 C 230,434 206,424 186,400 Z"
          strokeWidth="7"
        />
        {/* Teeth divider */}
        <path
          d="M 198,412 C 222,420 256,424 284,420 C 302,416 316,412"
          strokeWidth="2.5"
          opacity="0.4"
        />
        {/* Tongue groove */}
        <path
          d="M 256,422 C 254,436 257,448 255,460"
          strokeWidth="3"
          stroke="#D44060"
          opacity="0.55"
        />

        {/* LEFT EYE outline — BIGGER, rounder, higher, thick 10px stroke */}
        <path
          d="M 148,244 C 154,202 190,184 224,196 C 258,206 268,240 256,278 C 244,316 206,328 172,316 C 138,304 130,274 148,244 Z"
          strokeWidth="10"
        />
        {/* Left pupil */}
        <path
          d="M 184,234 C 194,224 214,228 220,244 C 226,260 220,276 208,278 C 196,280 184,272 182,258 C 180,244 180,234 184,234 Z"
          strokeWidth="2"
          fill="#3A2A20"
          stroke="#3A2A20"
        />
        {/* Left eye shine */}
        <path d="M 182,232 C 186,228 192,230 192,236" stroke="white" strokeWidth="7" fill="none" />
        <path
          d="M 208,258 C 212,256 215,259"
          stroke="white"
          strokeWidth="4.5"
          fill="none"
          opacity="0.8"
        />

        {/* RIGHT EYE outline — SMALLER, lower, thinner 7px stroke */}
        <path
          d="M 364,278 C 358,238 326,220 294,230 C 262,240 252,272 262,306 C 272,338 306,350 334,336 C 362,322 370,298 364,278 Z"
          strokeWidth="7"
        />
        {/* Right pupil — smaller than left */}
        <path
          d="M 294,250 C 304,240 320,244 326,260 C 332,276 326,290 314,292 C 302,294 292,284 290,268 C 288,254 290,250 294,250 Z"
          strokeWidth="2"
          fill="#3A2A20"
          stroke="#3A2A20"
        />
        {/* Right eye shine */}
        <path
          d="M 292,248 C 296,244 302,246 302,252"
          stroke="white"
          strokeWidth="5.5"
          fill="none"
        />
        <path
          d="M 314,270 C 318,268 320,271"
          stroke="white"
          strokeWidth="3.5"
          fill="none"
          opacity="0.8"
        />

        {/* LEFT EYEBROW — thick sweeping arch, tilted, kid's rough stroke */}
        <path
          d="M 136,222 C 152,194 188,180 232,194 C 236,200 238,206 234,210 C 192,196 158,208 142,234 C 138,230 134,226 136,222 Z"
          fill="#5A3A24"
          stroke="#5A3A24"
          strokeWidth="3"
        />

        {/* RIGHT EYEBROW — different angle/thickness from left (asymmetric!) */}
        <path
          d="M 374,234 C 358,208 328,196 290,208 C 286,212 284,218 288,222 C 326,210 354,222 366,244 C 370,240 374,236 374,234 Z"
          fill="#5A3A24"
          stroke="#5A3A24"
          strokeWidth="3"
        />

        {/* HAIR TUFTS outlines — three wonky spikes, all different */}
        {/* Middle spike — leans right, tallest */}
        <path
          d="M 264,98 C 270,68 296,40 310,20 C 320,40 324,64 310,90 C 298,76 280,80 264,98 Z"
          strokeWidth="7"
          fill="#5A3A24"
        />
        {/* Left spike — shorter, leans left */}
        <path
          d="M 230,102 C 224,74 218,50 220,30 C 232,46 242,66 238,92 C 234,84 226,86 230,102 Z"
          strokeWidth="5"
          fill="#B0744A"
        />
        {/* Right spike — medium, fattest */}
        <path
          d="M 286,96 C 294,70 310,52 318,38 C 326,52 326,70 314,90 C 308,80 294,82 286,96 Z"
          strokeWidth="5"
          fill="#B0744A"
        />

        {/* WHISKERS — simple stick lines, kid-drawn style */}
        <path d="M 210,390 L 148,376" strokeWidth="4" opacity="0.5" />
        <path d="M 210,398 L 146,394" strokeWidth="3.5" opacity="0.45" />
        <path d="M 302,390 L 364,376" strokeWidth="4" opacity="0.5" />
        <path d="M 302,398 L 366,394" strokeWidth="3.5" opacity="0.45" />
      </g>
    </svg>
  )
}
