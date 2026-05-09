import React from "react"
import { BaseEquippedBackground, BasePreviewBackground } from "./base-background"
import { BACKGROUND_ELEMENTS_PREVIEW } from "./shared-positions"

// --- COMPONENTES VISUALES COMPARTIDOS ---
export const PixelHeartOutline = ({ color, opacity, size = 20 }: { color: string, opacity: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <rect x="2" y="1" width="2" height="1" /><rect x="7" y="1" width="2" height="1" /><rect x="1" y="2" width="1" height="1" /><rect x="4" y="2" width="1" height="1" /><rect x="6" y="2" width="1" height="1" /><rect x="9" y="2" width="1" height="1" /><rect x="0" y="3" width="1" height="3" /><rect x="5" y="3" width="1" height="1" /><rect x="10" y="3" width="1" height="3" /><rect x="1" y="6" width="1" height="1" /><rect x="9" y="6" width="1" height="1" /><rect x="2" y="7" width="1" height="1" /><rect x="8" y="7" width="1" height="1" /><rect x="3" y="8" width="1" height="1" /><rect x="7" y="8" width="1" height="1" /><rect x="4" y="9" width="1" height="1" /><rect x="6" y="9" width="1" height="1" /><rect x="5" y="10" width="1" height="1" />
  </svg>
)

// ── ICONO BOLSAS DE DINERO ──
export const MoneyBagIcon = ({
  color = "#1f2f52",
  opacity = 0.18,
  size = 24
}: {
  color?: string
  opacity?: number
  size?: number
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <path d="M24 10C24 10 28 16 32 16C36 16 40 10 40 10L45 16C45 16 40 21 32 21C24 21 19 16 19 16L24 10Z" fill={color} />
    <path d="M18 24C18 18 23 15 32 15C41 15 46 18 46 24C46 28 43 31 43 31C43 31 50 37 50 45C50 55 42 60 32 60C22 60 14 55 14 45C14 37 21 31 21 31C21 31 18 28 18 24Z" fill={color} />
    <path d="M32 27C28.5 27 26 29 26 32C26 35 28 36.5 31 37.5V42C29 41.8 27.5 40.8 26.5 39.5L24 42C25.8 44 28 45 31 45.2V48H34V45.1C37.7 44.7 40 42.5 40 39C40 35.8 38 34 34 32.8V29.5C35.5 29.7 36.8 30.4 37.8 31.3L40 28.7C38.5 27.2 36.5 26.3 34 26V23H31V26.1C27.5 26.5 25 28.7 25 32C25 35.2 27.1 36.9 31 38V41.6C28.8 41.4 27 40.3 25.7 38.8L23.5 41.5C25.4 43.7 28 45 31 45.3V48H34V45.2C38 44.7 41 42.3 41 38.8C41 35.4 38.9 33.4 34 32V29.4C35.8 29.6 37.2 30.4 38.4 31.4L40.5 28.6C38.8 27 36.8 26.1 34 25.8V23H31V25.9C27.4 26.3 25 28.7 25 32C25 35.1 26.9 36.8 31 38V41.5C28.7 41.2 26.8 40.1 25.2 38.3L22.8 41C25 43.5 27.8 44.9 31 45.2V48H34V45.1C38.4 44.5 41 41.9 41 38.5C41 35.1 39.1 33.2 34 31.8V29.2C35.8 29.5 37.2 30.2 38.5 31.2L40.5 28.5C38.7 27 36.6 26.1 34 25.8V23H31V26C27.5 26.4 25 28.7 25 32" fill="#5a6d93" opacity="0.5" />
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

// --- VARIANTE 3: MONEY BAGS (Con ajuste de contraste e iluminación) ---
export const PreviewMoneyBags = () => (
  <BasePreviewBackground
    // Degradado azul pizarra metálico más claro en la parte superior para crear contraste
    gradient="linear-gradient(to bottom, #4a5c7a 0%, #2a374f 60%, #0d131f 100%)"
    noiseOpacity={0.35} 
    innerMask="radial-gradient(ellipse at center, black 10%, transparent 80%)"
  >
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div
         key={i}
         className="absolute left-1/2 top-1/2"
         style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}
       >
           <MoneyBagIcon
             color="#0f1626" // Navy casi negro para crear un efecto de silueta/sombra fuerte
             opacity={0.4}   // Mayor opacidad para que resalten sobre el ruido
             size={h.size + 4} // Ligeramente más grandes para notar los detalles de la bolsa
           />
       </div>
    ))}
  </BasePreviewBackground>
)

export const EquippedMoneyBags = () => (
  <BaseEquippedBackground
    height="550px"
    gradient="linear-gradient(to bottom, #4a5c7a 0%, #2a374f 50%, #000000 100%)"
    noiseOpacity={0.3} // Ruido equilibrado
    containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)"
    innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)"
  >
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div
        key={i}
        className="absolute left-1/2 top-[28%]"
        style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}
      >
           <MoneyBagIcon
             color="#0f1626"
             opacity={0.4}
             size={h.size + 4}
           />
      </div>
    ))}
  </BaseEquippedBackground>
)
