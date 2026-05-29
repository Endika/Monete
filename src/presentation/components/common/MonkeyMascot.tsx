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
          <polygon points="268,55 175,205 370,205" />
        </clipPath>
      </defs>

      {/* ── Party hat (drawn first so head overlaps the base) ── */}
      {/* Hat body: slightly off-center triangle, banana yellow */}
      <polygon points="268,55 175,205 370,205" fill="#FFC53D" />
      {/* 2 bold raspberry dots on hat */}
      <g clipPath="url(#hatClipMascot)">
        <circle cx="252" cy="115" r="11" fill="#FF4D79" />
        <circle cx="282" cy="158" r="11" fill="#FF4D79" />
      </g>
      {/* Hat band: bold raspberry stripe at base */}
      <ellipse cx="272" cy="205" rx="98" ry="16" fill="#FF4D79" />
      {/* Pom-pom */}
      <circle cx="261" cy="45" r="24" fill="#34D399" />
      {/* Pom-pom highlight */}
      <circle cx="255" cy="38" r="10" fill="white" opacity="0.55" />

      {/* ── Ears (behind head) ── */}
      <circle cx="90" cy="230" r="52" fill="#5A4034" />
      <circle cx="422" cy="230" r="52" fill="#5A4034" />
      {/* Inner ear cream */}
      <circle cx="90" cy="230" r="32" fill="#FFF1DD" />
      <circle cx="422" cy="230" r="32" fill="#FFF1DD" />

      {/* ── Head ── */}
      <circle cx="256" cy="295" r="185" fill="#3B2A22" />

      {/* ── Cheeks ── */}
      <circle cx="155" cy="330" r="34" fill="#FF8FA8" opacity="0.80" />
      <circle cx="357" cy="330" r="34" fill="#FF8FA8" opacity="0.80" />

      {/* ── Muzzle ── */}
      <ellipse cx="256" cy="348" rx="90" ry="62" fill="#FFF1DD" />

      {/* ── Nose ── */}
      <ellipse cx="256" cy="336" rx="14" ry="9" fill="#3B2A22" />

      {/* ── Smile ── */}
      <path
        d="M 216 362 Q 256 390 296 362"
        fill="none"
        stroke="#3B2A22"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* ── Eyes: large sclera → bold pupil → highlight ── */}
      {/* Left eye sclera */}
      <circle cx="196" cy="258" r="32" fill="white" />
      {/* Right eye sclera */}
      <circle cx="316" cy="258" r="32" fill="white" />
      {/* Left pupil */}
      <circle cx="198" cy="261" r="16" fill="#3B2A22" />
      {/* Right pupil */}
      <circle cx="318" cy="261" r="16" fill="#3B2A22" />
      {/* Left eye shine */}
      <circle cx="190" cy="252" r="7" fill="white" />
      {/* Right eye shine */}
      <circle cx="310" cy="252" r="7" fill="white" />
    </svg>
  )
}
