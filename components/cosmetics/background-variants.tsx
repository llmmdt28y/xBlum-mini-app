import React from "react"
import { BaseEquippedBackground, BasePreviewBackground } from "./base-background"

// ── POSICIONES COMPARTIDAS ──
export const BACKGROUND_ELEMENTS_PREVIEW = [
  { x: -90, y: -50, rot: -5, op: 0.15, size: 24, color: "#ffffff" },
  { x:  90, y: -50, rot:  5, op: 0.15, size: 24, color: "#ffffff" },
  { x: -110, y: 10, rot:  0, op: 0.20, size: 28, color: "#ffffff" },
  { x:  110, y: 10, rot:  0, op: 0.20, size: 28, color: "#ffffff" },
  { x: -160, y: -20, rot:  10, op: 0.08, size: 20, color: "#ffffff" },
  { x:  160, y: -20, rot: -10, op: 0.08, size: 20, color: "#ffffff" },
  { x: -140, y:  50, rot:  -5, op: 0.12, size: 22, color: "#ffffff" },
  { x:  140, y:  50, rot:   5, op: 0.12, size: 22, color: "#ffffff" },
  { x: -75,  y:  80, rot: -15, op: 0.10, size: 18, color: "#ffffff" },
  { x:  75,  y:  80, rot:  15, op: 0.10, size: 18, color: "#ffffff" },
  { x: -40,  y: -90, rot:  10, op: 0.08, size: 18, color: "#ffffff" },
  { x:  40,  y: -90, rot: -10, op: 0.08, size: 18, color: "#ffffff" },
]

// --- COMPONENTES VISUALES ---
export const PixelHeartOutline = ({ color, opacity, size = 20 }: { color: string, opacity: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <rect x="2" y="1" width="2" height="1" /><rect x="7" y="1" width="2" height="1" /><rect x="1" y="2" width="1" height="1" /><rect x="4" y="2" width="1" height="1" /><rect x="6" y="2" width="1" height="1" /><rect x="9" y="2" width="1" height="1" /><rect x="0" y="3" width="1" height="3" /><rect x="5" y="3" width="1" height="1" /><rect x="10" y="3" width="1" height="3" /><rect x="1" y="6" width="1" height="1" /><rect x="9" y="6" width="1" height="1" /><rect x="2" y="7" width="1" height="1" /><rect x="8" y="7" width="1" height="1" /><rect x="3" y="8" width="1" height="1" /><rect x="7" y="8" width="1" height="1" /><rect x="4" y="9" width="1" height="1" /><rect x="6" y="9" width="1" height="1" /><rect x="5" y="10" width="1" height="1" />
  </svg>
)

export const MoneyBagIcon = ({ color = "#1f2f52", opacity = 0.18, size = 24 }: { color?: string, opacity?: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <path d="M24 10C24 10 28 16 32 16C36 16 40 10 40 10L45 16C45 16 40 21 32 21C24 21 19 16 19 16L24 10Z" fill={color} />
    <path d="M18 24C18 18 23 15 32 15C41 15 46 18 46 24C46 28 43 31 43 31C43 31 50 37 50 45C50 55 42 60 32 60C22 60 14 55 14 45C14 37 21 31 21 31C21 31 18 28 18 24Z" fill={color} />
    <path d="M32 27C28.5 27 26 29 26 32C26 35 28 36.5 31 37.5V42C29 41.8 27.5 40.8 26.5 39.5L24 42C25.8 44 28 45 31 45.2V48H34V45.1C37.7 44.7 40 42.5 40 39C40 35.8 38 34 34 32.8V29.5C35.5 29.7 36.8 30.4 37.8 31.3L40 28.7C38.5 27.2 36.5 26.3 34 26V23H31V26.1C27.5 26.5 25 28.7 25 32C25 35.2 27.1 36.9 31 38V41.6C28.8 41.4 27 40.3 25.7 38.8L23.5 41.5C25.4 43.7 28 45 31 45.3V48H34V45.2C38 44.7 41 42.3 41 38.8C41 35.4 38.9 33.4 34 32V29.4C35.8 29.6 37.2 30.4 38.4 31.4L40.5 28.6C38.8 27 36.8 26.1 34 25.8V23H31V25.9C27.4 26.3 25 28.7 25 32C25 35.1 26.9 36.8 31 38V41.5C28.7 41.2 26.8 40.1 25.2 38.3L22.8 41C25 43.5 27.8 44.9 31 45.2V48H34V45.1C38.4 44.5 41 41.9 41 38.5C41 35.1 39.1 33.2 34 31.8V29.2C35.8 29.5 37.2 30.2 38.5 31.2L40.5 28.5C38.7 27 36.6 26.1 34 25.8V23H31V26C27.5 26.4 25 28.7 25 32" fill="#5a6d93" opacity="0.5" />
  </svg>
)

export const CrownIcon = ({ color = "#4a362a", opacity = 0.35, size = 24 }: { color?: string, opacity?: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <path d="M3 16L2.4 8.2C2.3 7.1 3.5 6.4 4.4 7L8 9.5L11.1 3.3C11.5 2.5 12.5 2.5 12.9 3.3L16 9.5L19.6 7C20.5 6.4 21.7 7.1 21.6 8.2L21 16H3Z" fill={color} />
    <path d="M3 18H21V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V18Z" fill={color} opacity="0.7" />
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
    {/* ESCALA REDUCIDA para la tarjeta pequeña */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
       <PixelHeartOutline color="#ffffff" opacity={0.9} size={36} />
    </div>
  </BasePreviewBackground>
)

export const EquippedPixelHearts = () => (
  <BaseEquippedBackground height="550px" containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)" innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[28%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
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
    {/* ESCALA REDUCIDA para la tarjeta pequeña */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
       <img src="/telegram-star-icon.png" alt="star" style={{ width: 36, height: 36, filter: 'grayscale(1) brightness(2)', opacity: 0.9 }} />
    </div>
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

// --- VARIANTE 3: MONEY BAGS (Blue/Slate) ---
export const PreviewMoneyBags = () => (
  <BasePreviewBackground gradient="linear-gradient(to bottom, #4a5c7a 0%, #2a374f 60%, #0d131f 100%)" noiseOpacity={0.35} innerMask="radial-gradient(ellipse at center, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <MoneyBagIcon color="#0f1626" opacity={0.4} size={h.size + 4} />
       </div>
    ))}
    {/* ESCALA REDUCIDA para la tarjeta pequeña */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
       <MoneyBagIcon color="#0f1626" opacity={0.8} size={40} />
    </div>
  </BasePreviewBackground>
)

export const EquippedMoneyBags = () => (
  <BaseEquippedBackground height="550px" gradient="linear-gradient(to bottom, #4a5c7a 0%, #2a374f 50%, #000000 100%)" noiseOpacity={0.3} containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)" innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[28%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <MoneyBagIcon color="#0f1626" opacity={0.4} size={h.size + 4} />
      </div>
    ))}
  </BaseEquippedBackground>
)

// --- VARIANTE 4: MOCHA ROYALTY ---
export const PreviewMochaWealth = () => (
  <BasePreviewBackground gradient="linear-gradient(to bottom, #9b8478 0%, #856e62 60%, #6d574b 100%)" noiseOpacity={0.35} innerMask="radial-gradient(ellipse at center, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
       <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <CrownIcon color="#4a362a" opacity={0.35} size={h.size + 4} />
       </div>
    ))}
    {/* ESCALA REDUCIDA para la tarjeta pequeña */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
       <CrownIcon color="#4a362a" opacity={0.8} size={40} />
    </div>
  </BasePreviewBackground>
)

export const EquippedMochaWealth = () => (
  <BaseEquippedBackground height="550px" gradient="linear-gradient(to bottom, #9b8478 0%, #856e62 50%, #000000 100%)" noiseOpacity={0.3} containerMask="linear-gradient(to bottom, black 0%, black 75%, transparent 100%)" innerMask="radial-gradient(ellipse at center 40%, black 10%, transparent 80%)">
    {BACKGROUND_ELEMENTS_PREVIEW.map((h, i) => (
      <div key={i} className="absolute left-1/2 top-[28%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
           <CrownIcon color="#4a362a" opacity={0.35} size={h.size + 4} />
      </div>
    ))}
  </BaseEquippedBackground>
)
