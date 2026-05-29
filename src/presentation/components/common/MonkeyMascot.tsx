export function MonkeyMascot({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Monete monkey mascot"
      role="img"
    >
      {/* Left outer ear */}
      <circle cx="108" cy="240" r="54" fill="#5A4034" />
      {/* Right outer ear */}
      <circle cx="404" cy="240" r="54" fill="#5A4034" />
      {/* Left inner ear */}
      <circle cx="108" cy="240" r="34" fill="#FFF1DD" />
      {/* Right inner ear */}
      <circle cx="404" cy="240" r="34" fill="#FFF1DD" />

      {/* Head */}
      <circle cx="256" cy="272" r="165" fill="#3B2A22" />

      {/* Cheeks */}
      <circle cx="168" cy="305" r="30" fill="#FF8FA8" opacity="0.72" />
      <circle cx="344" cy="305" r="30" fill="#FF8FA8" opacity="0.72" />

      {/* Muzzle */}
      <ellipse cx="256" cy="320" rx="72" ry="52" fill="#FFF1DD" />

      {/* Nostrils */}
      <circle cx="238" cy="315" r="8" fill="#3B2A22" />
      <circle cx="274" cy="315" r="8" fill="#3B2A22" />

      {/* Smile */}
      <path
        d="M 228 340 Q 256 360 284 340"
        fill="none"
        stroke="#3B2A22"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Eyes - white sclera */}
      <circle cx="205" cy="248" r="20" fill="white" />
      <circle cx="307" cy="248" r="20" fill="white" />
      {/* Pupils */}
      <circle cx="207" cy="250" r="11" fill="#3B2A22" />
      <circle cx="309" cy="250" r="11" fill="#3B2A22" />
      {/* Eye shine */}
      <circle cx="201" cy="244" r="5" fill="white" opacity="0.85" />
      <circle cx="303" cy="244" r="5" fill="white" opacity="0.85" />

      {/* Party hat (triangle) */}
      <polygon points="256,80 192,182 320,182" fill="#FFC53D" />

      {/* Hat stripes + confetti */}
      <clipPath id="hatClipMascot">
        <polygon points="256,80 192,182 320,182" />
      </clipPath>
      <g clipPath="url(#hatClipMascot)">
        <rect x="180" y="110" width="152" height="14" fill="#FF4D79" opacity="0.75" />
        <rect x="180" y="140" width="152" height="14" fill="#FF4D79" opacity="0.75" />
        <rect x="180" y="165" width="152" height="10" fill="#FF4D79" opacity="0.75" />
        {/* Confetti dots on hat */}
        <circle cx="248" cy="102" r="5" fill="white" opacity="0.9" />
        <circle cx="264" cy="130" r="5" fill="#34D399" opacity="0.9" />
        <circle cx="240" cy="155" r="5" fill="white" opacity="0.9" />
        <circle cx="270" cy="155" r="5" fill="#34D399" opacity="0.9" />
      </g>

      {/* Hat band */}
      <ellipse cx="256" cy="182" rx="64" ry="13" fill="#FF4D79" />

      {/* Pom-pom */}
      <circle cx="256" cy="72" r="18" fill="#34D399" />
      <circle cx="256" cy="72" r="10" fill="white" opacity="0.6" />
    </svg>
  )
}
