"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

interface TgIconProps {
  name: string
  size?: number
  animate?: boolean
  loop?: boolean
  className?: string
  style?: React.CSSProperties
}

export function TgIcon({
  name,
  size = 20,
  animate = false,
  loop = false,
  className,
  style,
}: TgIconProps) {
  return (
    <DotLottieReact
      src={`/icons/${name}.lottie`}
      autoplay={animate}
      loop={loop}
      style={{ width: size, height: size, ...style }}
      className={className}
    />
  )
}
