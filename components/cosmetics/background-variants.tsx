import React from "react"
import { BaseEquippedBackground, BasePreviewBackground } from "./base-background"
import { BACKGROUND_ELEMENTS_PREVIEW } from "./shared-positions"

// --- COMPONENTES VISUALES COMPARTIDOS ---
export const PixelHeartOutline = ({ color, opacity, size = 20 }: { color: string, opacity: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <rect x="2" y="1" width="2" height="1" /><rect x="7" y="1" width="2" height="1" /><rect x="1" y="2" width="1" height="1" /><rect x="4" y="2" width="1" height="1" /><rect x="6" y="2" width="1" height="1" /><rect x="9" y="2" width="1" height="1" /><rect x="0" y="3" width="1" height="3" /><rect x="5" y="3" width="1" height="1" /><rect x="10" y="3" width="1" height="3" /><rect x="1" y="6" width="1" height="1" /><rect x="9" y="6" width="1" height="1" /><rect x="2" y="7" width="1" height="1" /><rect x="8" y="7" width="1" height="1" /><rect x="3" y="8" width="1" height="1" /><rect x="7" y="8" width="1" height="1" /><rect x="4" y="9" width="1" height="1" /><rect x="6" y="9" width="1" height="1" /><rect x="5" y="10" width="1" height="1" />
  </svg>
)

// --- VARIANTE 1: PIXEL HEARTS ---
export const PreviewPixelHearts = () => (
  <BasePreviewBackground>
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <PixelHeartOutline color={h.color} opacity={h.op} size={h.size} />
       </div>
    ))}
  </BasePreviewBackground>
)

export const EquippedPixelHearts = () => (
  <BaseEquippedBackground height="400px" innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[35%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
         <PixelHeartOutline color={h.color} opacity={h.op} size={h.size} />
      </div>
    ))}
  </BaseEquippedBackground>
)

// --- VARIANTE 2: ASTRAL STARS ---
export const PreviewAstralStars = () => (
  <BasePreviewBackground gradient="linear-gradient(to bottom, #4a3b32 0%, #1e1612 60%, #000000 100%)" noiseOpacity={0.4} innerMask="radial-gradient(ellipse at center, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <img src="/telegram-star-icon.png" alt="star" style={{ width: h.size, height: h.size, filter: 'grayscale(1) brightness(2) opacity(0.25)' }} />
       </div>
    ))}
  </BasePreviewBackground>
)

export const EquippedAstralStars = () => (
  <BaseEquippedBackground height="550px" gradient="linear-gradient(to bottom, #4a3b32 0%, #1e1612 50%, #000000 100%)" noiseOpacity={0.35} containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)" innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[28%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
         <img src="/telegram-star-icon.png" alt="star" style={{ width: h.size, height: h.size, filter: 'grayscale(1) brightness(2) opacity(0.2)' }} />
      </div>
    ))}
  </BaseEquippedBackground>
)

// --- VARIANTE 3: XENO HELM ---
export const PreviewXenoHelm = () => (
  <BasePreviewBackground
    gradient="linear-gradient(to bottom, #001a33 0%, #00091a 60%, #000000 100%)"
    noiseOpacity={0.3}
    innerMask="radial-gradient(ellipse at center, black 10%, transparent 80%)"
  >
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
          <img
             src="/xeno-helm-icon.png"
             alt="xeno-helm"
             style={{
                 width: h.size,
                 height: h.size,
                 filter: 'grayscale(1) brightness(1.6) opacity(0.2) drop-shadow(0 0 5px #00c3ff)'
             }}
          />
       </div>
    ))}
  </BasePreviewBackground>
)

export const EquippedXenoHelm = () => (
  <BaseEquippedBackground
    height="550px"
    gradient="linear-gradient(to bottom, #001a33 0%, #00091a 50%, #000000 100%)"
    noiseOpacity={0.25}
    containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)"
    innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)"
  >
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[28%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
         <img
             src="/xeno-helm-icon.png"
             alt="xeno-helm"
             style={{
                 width: h.size,
                 height: h.size,
                 filter: 'grayscale(1) brightness(1.6) opacity(0.2) drop-shadow(0 0 5px #00c3ff)'
             }}
         />
      </div>
    ))}
  </BaseEquippedBackground>
)
