[cite_start][cite: 1] "use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Share, Search, Settings } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. ARTE SVG (Rediseño de fondos y nuevo background de iconos) ──

const SpiralSVG = () => {
  const dots = Array.from({ length: 140 }).map((_, i) => {
    const angle = 0.20 * i
    const radius = 28 + 0.3 * i
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const size = 0.4 + (i / 140) * 0.8
    const opacity = 0.15 + (i / 140) * 0.85
    if (radius > 48) return null
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">{dots}</svg>
}

const StardustSVG = () => {
  const stars = Array.from({ length: 70 }).map((_, i) => {
    let x, y, r;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      r = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
    } while (r < 28 || r > 46);

    const size = Math.random() * 0.8 + 0.3;
    const opacity = Math.random() * 0.8 + 0.2;
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{stars}</svg>
}

// Nuevo background de iconos distribuidos hacia los lados
const IconBackgroundSVG = () => {
  const icons = [
    { x: 10, y: 15, size: 7 }, { x: 90, y: 15, size: 7 },
    { x: 10, y: 35, size: 6 }, { x: 90, y: 35, size: 6 },
    { x: 10, y: 55, size: 7 }, { x: 90, y: 55, size: 7 },
    { x: 10, y: 75, size: 6 }, { x: 90, y: 75, size: 6 },
    { x: 10, y: 95, size: 7 }, { x: 90, y: 95, size: 7 },
  ]
  const iconSet = ["🎁", "💎", "⭐", "💰", "🔥", "⚡"]
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {icons.map((pos, i) => (
        <text key={i} x={pos.x} y={pos.y} fontSize={pos.size} textAnchor="middle" dominantBaseline="central" opacity="0.3" fill="#8e8e93">
          {iconSet[i % iconSet.length]}
        </text>
      ))}
    </svg>
  )
}

const PhantomSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 40 55 Q 50 65 60 55" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const CoreSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] opacity-80">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 28 30 L 72 30 L 50 90" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="3" />
  </svg>
)

// Wrapper de Gradiente Sutil para las Auras
const ArtWrapper = ({ children, glowColor }: { children: React.ReactNode, glowColor: string }) => (
  <div className="w-full h-full relative flex items-center justify-center">
    <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />
    <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
  </div>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──
const NFT_ITEMS = [
  { id: '1', name: "Spiral", type: "SHADE", rarity: "Epic", price: 15000, issueNumber: "332", stock: 100, art: <ArtWrapper glowColor="rgba(168,85,247,0.15)"><SpiralSVG /></ArtWrapper> },
  { id: '2', name: "Stardust", type: "SHADE", rarity: "Rare", price: 5000, issueNumber: "12", stock: 500, art: <ArtWrapper glowColor="rgba(59,130,246,0.1)"><StardustSVG /></ArtWrapper> },
  { id: '3', name: "Gifts", type: "SHADE", rarity: "Epic", price: 20000, issueNumber: "7", stock: 250, art: <ArtWrapper glowColor="rgba(249,115,22,0.1)"><IconBackgroundSVG /></ArtWrapper> },
  { id: '4', name: "Phantom", type: "GIFT", rarity: "Legendary", price: 45000, issueNumber: "9", stock: 10, art: <PhantomSVG /> },
  { id: '5', name: "Core", type: "GIFT", rarity: "Mythic", price: 150000, issueNumber: "1", stock: 0, art: <CoreSVG /> }
]

// ── 3. VISTA PRINCIPAL (Marketplace + NFT Details) ──
export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)

  // Control nativo de botón atrás en Telegram
  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      if (selectedItem) {
        setSelectedItem(null)
        setShowDetailPanel(false)
      } else {
        setCurrentView("levels")
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack);
      tg.BackButton.hide()
    }
  }, [setCurrentView, selectedItem])

  const handleSelectItem = (item: any) => {
    setSelectedItem(item)
    setShowDetailPanel(true)
  }

  // ── PANTALLA PRINCIPAL: GRID MARKETPLACE (Estilo Achievements) ──
  return (
    <div className="flex-1 bg-black min-h-screen relative overflow-x-hidden animate-in fade-in duration-300">

      {/* Header Minimalista (Estilo Achievements) */}
      <div className="sticky top-0 z-30 flex items-center justify-between w-full bg-black/90 backdrop-blur-xl px-4"
        style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)" }}>
        <h2 className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Market</h2>
        <div className="flex items-center gap-4">
          <Search size={20} className="text-white opacity-80" />
          <Settings size={20} className="text-white opacity-80" />
        </div>
      </div>

      <div className="px-3 pt-3 pb-32">
        {/* Grid de 2 Columnas (Estilo Achievements) */}
        <div className="grid grid-cols-2 gap-4">
          {NFT_ITEMS.map((item) => {
            const isSoldOut = item.stock === 0
            const priceDisplay = item.price >= 1000 ? `${item.price / 1000}k` : item.price

            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`bg-[#1c1c1e] rounded-[16px] p-4 flex flex-col aspect-square active:scale-[0.96] transition-transform ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Encabezado de Tarjeta (Compacto) */}
                <div className="flex items-center justify-between w-full opacity-60">
                  <span className="text-[10px] font-bold text-[#8e8e93] tracking-widest">{item.type}</span>
                  <span className="text-[10px] font-bold text-[#8e8e93]">#{item.issueNumber}</span>
                </div>

                {/* Arte Central (Redimensionado) */}
                <div className="flex-1 w-full flex items-center justify-center pointer-events-none mt-2 mb-2">
                  <div className="w-[85%] aspect-square flex items-center justify-center">
                    {item.art}
                  </div>
                </div>

                {/* Footer de Tarjeta (Compacto) */}
                <div className="w-full flex flex-col items-center justify-end mt-auto">
                  <p className="text-white text-[13px] font-semibold tracking-wide" style={{ fontFamily: SFD }}>{item.name}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${isSoldOut ? 'text-[#636366]' : 'text-[#3b82f6]'}`} style={{ fontFamily: SF }}>
                    {isSoldOut ? 'SOLD' : `${priceDisplay} BP`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PANTALLA 2: DETALLE DEL NFT COMPACTO (Estilo Desk Calendar, Bottom Sheet) ── */}
      {selectedItem && (
        <div className={`fixed inset-0 bg-black/50 z-40 ${showDetailPanel ? 'block' : 'hidden'}`} onClick={() => setShowDetailPanel(false)}>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black rounded-t-[24px] z-50 animate-in slide-in-from-bottom-full duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Indicador de arrastre (compacto) */}
            <div className="w-10 h-1 bg-[#1c1c1e] rounded-full mx-auto mb-4" />

            <div className="flex flex-col items-center pb-8">
              {/* NFT Card Gigante (Mismo estilo que antes pero en panel) */}
              <div className="w-[85vw] max-w-[340px] aspect-square bg-[#0a0a0a] rounded-[32px] flex items-center justify-center mb-6">
                {selectedItem.art}
              </div>

              {/* Título y Share */}
              <h1 className="text-[26px] font-bold text-white mb-4 tracking-tight" style={{ fontFamily: SFD }}>
                {selectedItem.name} <span className="text-[#636366]">#{selectedItem.issueNumber}</span>
              </h1>
              <button className="flex items-center gap-2 bg-[#1c1c1e] px-5 py-2.5 rounded-full active:opacity-70 transition-opacity mb-8">
                <Share size={14} className="text-white" />
                <span className="text-white font-semibold text-[13px]" style={{ fontFamily: SF }}>Share</span>
              </button>

              {/* Tabla de Atributos Compacta */}
              <div className="w-full bg-[#111] rounded-[24px] overflow-hidden flex flex-col">
                <AttributeRow label="Owner:" value="xBlum Market" icon="/xblum-profile.png" />
                <div className="h-px bg-[#1c1c1e] w-full" />
                <AttributeRow label="Rarity:" value={selectedItem.rarity} />
                <div className="h-px bg-[#1c1c1e] w-full" />
                <AttributeRow label="Type:" value={selectedItem.type === "SHADE" ? "Profile Shade" : "Profile Gift"} />
                <div className="h-px bg-[#1c1c1e] w-full" />
                <AttributeRow label="Issued:" value={`${selectedItem.issueNumber} / 25,000`} />
              </div>
            </div>

            {/* Floating Buy Button */}
            <div className="p-4 bg-gradient-to-t from-black via-black to-transparent">
              <button
                disabled={selectedItem.stock === 0 || currentBP < selectedItem.price}
                className={`w-full py-[18px] rounded-[18px] text-[16px] font-bold transition-all active:scale-[0.98] ${
                  selectedItem.stock === 0 ? 'bg-[#1c1c1e] text-[#636366]' : 'bg-white text-black'
                  }`}
                style={{ fontFamily: SFD }}
              >
                {selectedItem.stock === 0 ? "Out of Stock" : `Buy for ${selectedItem.price.toLocaleString()} BP`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE DE TABLA (Atributos a la izquierda alineados, Compacto) ──
function AttributeRow({ label, value, icon }: { label: string, value: string, icon?: string }) {
  return (
    <div className="flex items-center px-4 py-3 text-left w-full">
      {/* Columna Label Fija */}
      <span className="text-[#8e8e93] text-[13px] font-medium w-[90px] shrink-0" style={{ fontFamily: SF }}>
        {label}
      </span>

      {/* Columna Valor (con o sin ícono) */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && (
          <img src={icon} alt="" className={`w-5 h-5 object-cover ${icon.includes('profile') ? 'rounded-full' : 'rounded-sm'}`} />
        )}
        <span className="text-[13px] font-medium text-white truncate" style={{ fontFamily: SF }}>
          {value}
        </span>
      </div>
    </div>
  )
}
