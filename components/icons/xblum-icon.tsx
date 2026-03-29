import { cn } from "@/lib/utils"

interface XBlumIconProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "blue" | "white" | "gradient"
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
}

export function XBlumIcon({ className, size = "md", variant = "blue" }: XBlumIconProps) {
  const bgClass = variant === "gradient" 
    ? "bg-gradient-to-br from-blue-500 to-blue-600"
    : variant === "blue" 
      ? "bg-blue-500" 
      : "bg-white/10"

  return (
    <div className={cn("rounded-2xl flex items-center justify-center", sizeMap[size], bgClass, className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn("w-3/4 h-3/4", variant === "white" ? "text-white" : "text-white")}
        fill="currentColor"
      >
        {/* Flame shape without eyes/holes */}
        <path d="M50 5C50 5 30 25 30 50C30 60 35 70 42 78C35 70 33 58 38 48C43 38 50 30 50 30C50 30 57 38 62 48C67 58 65 70 58 78C65 70 70 60 70 50C70 25 50 5 50 5Z" />
      </svg>
    </div>
  )
}
