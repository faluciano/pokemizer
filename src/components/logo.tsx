// Pokemizer mark: rounded "P" tile matching the favicon, with a small red
// sparkle accent. Original design — no Nintendo/TPC trade dress.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="10"
        fill="#18181b"
        stroke="#3f3f46"
        strokeWidth="2"
      />
      <text
        x="23"
        y="25.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontWeight="700"
        fontSize="30"
        fill="#e4e4e7"
      >
        P
      </text>
      <path
        d="M37 6.5 Q37.9 10.1 41.5 11 Q37.9 11.9 37 15.5 Q36.1 11.9 32.5 11 Q36.1 10.1 37 6.5 Z"
        fill="#ef4444"
      />
    </svg>
  );
}
