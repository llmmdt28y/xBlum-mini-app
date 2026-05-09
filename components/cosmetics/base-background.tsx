import React from "react"

export function BaseEquippedBackground({
  height = "550px",
  gradient,
  noiseOpacity = 0,
  containerMask = "none",
  innerMask = "none",
  children
}: {
  height?: string, gradient?: string, noiseOpacity?: number, containerMask?: string, innerMask?: string, children: React.ReactNode
}) {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none z-0" style={{
        height, background: gradient,
        maskImage: containerMask !== "none" ? containerMask : undefined,
        WebkitMaskImage: containerMask !== "none" ? containerMask : undefined
      }}>
       {noiseOpacity > 0 && (
         <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{
             opacity: noiseOpacity,
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 85%, black 100%)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 85%, black 100%)'
         }}></div>
       )}
       <div className="absolute inset-0 z-0 pointer-events-none" style={{
         maskImage: innerMask !== "none" ? innerMask : undefined,
         WebkitMaskImage: innerMask !== "none" ? innerMask : undefined
       }}>
         {children}
       </div>
    </div>
  )
}

export function BasePreviewBackground({
  gradient, noiseOpacity = 0, innerMask = "none", children
}: {
  gradient?: string, noiseOpacity?: number, innerMask?: string, children: React.ReactNode
}) {
  return (
    <div className="relative w-full h-[200px] flex items-center justify-center overflow-hidden rounded-[24px]" style={{ background: gradient }}>
       {noiseOpacity > 0 && (
         <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{
             opacity: noiseOpacity,
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 80%, black 100%)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 80%, black 100%)'
         }}></div>
       )}
       <div className="absolute inset-0 pointer-events-none z-0" style={{
         maskImage: innerMask !== "none" ? innerMask : undefined,
         WebkitMaskImage: innerMask !== "none" ? innerMask : undefined
       }}>
         {children}
       </div>
    </div>
  )
}
