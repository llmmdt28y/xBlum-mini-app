export function TelegramStar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z"
        fill="url(#star-gradient)"
        stroke="url(#star-stroke)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id="star-gradient" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" />
          <stop offset="1" stopColor="#FFA500" />
        </linearGradient>
        <linearGradient id="star-stroke" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE55C" />
          <stop offset="1" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
    </svg>
  )
}
