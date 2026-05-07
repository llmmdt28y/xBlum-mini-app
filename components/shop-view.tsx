"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. ARTE SVG (Rediseño y nuevas formas) ──

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

// NUEVO: Iconos grises de signo de dólar ($) distribuidos aleatoriamente hacia los lados
const TreasuresSVG = () => {
  // Generar un patrón disperso de iconos de dólar
  const dollars = Array.from({ length: 25 }).map((_, i) => {
    let x, y, r;
    do {
        x = Math.random() * 100;
        y = Math.random() * 100;
        // Distancia desde el centro (50, 50)
        r = Math.sqrt(Math.pow(x-50, 2) + Math.pow(y-50, 2));
    } while (r < 30 || r > 50); // Mantener una zona central vacía más grande

    const scale = 0.5 + Math.random() * 0.4;
    const rotate = Math.random() * 30 - 15; // Rotación aleatoria sutil
    const opacity = 0.2 + Math.random() * 0.2;

    return (
      <text
        key={i}
        x={x}
        y={y}
        fontSize="12" // Tamaño del texto para el símbolo de dólar
        textAnchor="middle"
        dominantBaseline="central"
        fill="#8e8e93" // Gris elegante
        opacity={opacity}
        transform={`scale(${scale}) rotate(${rotate} ${x} ${y})`}
      >
        $
      </text>
    );
  });

  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_4px_rgba(142,142,147,0.3)]">{dollars}</svg>
}

const PhantomSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[55%] h-[55%] drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 40 55 Q 50 65 60 55" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
  </svg>
)

const CoreSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] opacity-80">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 28 30 L 72 30 L 50 90" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="3" />
  </svg>
)

const ArtWrapper = ({ children, glowColor }: { children: React.ReactNode, glowColor: string }) => (
  <div className="w-full h-full relative flex items-center justify-center">
    <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
    <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
  </div>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──
const NFT_ITEMS = [
  { id: '1', name: "Spiral", type: "SHADE", rarity: "Epic", price: 15000, issueNumber: "332", stock: 100, model: "Aura", symbol: "Core Ring", backdrop: "Void", art: <ArtWrapper glowColor="rgba(168,85,247,0.15)"><SpiralSVG /></ArtWrapper> },
  { id: '2', name: "Stardust", type: "SHADE", rarity: "Rare", price: 5000, issueNumber: "12", stock: 500, model: "Particle", symbol: "Nebula", backdrop: "Deep Space", art: <ArtWrapper glowColor="rgba(59,130,246,0.1)"><StardustSVG /></ArtWrapper> },
  { id: '3', name: "Treasures", type: "SHADE", rarity: "Epic", price: 20000, issueNumber: "7", stock: 250, model: "Relic", symbol: "Geo Wealth", backdrop: "Obsidian", art: <ArtWrapper glowColor="rgba(249,115,22,0.1)"><TreasuresSVG /></ArtWrapper> },
  { id: '4', name: "Phantom", type: "GIFT", rarity: "Legendary", price: 45000, issueNumber: "9", stock: 10, model: "Spirit", symbol: "Ghost Face", backdrop: "Abyss", art: <PhantomSVG /> },
  { id: '5', name: "Core", type: "GIFT", rarity: "Mythic", price: 150000, issueNumber: "1", stock: 0, model: "Structure", symbol: "Prism", backdrop: "Black", art: <CoreSVG /> }
]

// ── 3. VISTA PRINCIPAL ──
export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      if (selectedItem) setSelectedItem(null)
      else setCurrentView("levels")
    }

    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack); tg.BackButton.hide() }
  }, [setCurrentView, selectedItem])

  return (
    <div className="flex-1 bg-black min-h-screen relative overflow-x-hidden animate-in fade-in duration-300">
      
      {/* HEADER LIMPIO (Sin botones laterales, solo título grande y search bar) */}
      <div className="w-full pt-[max(env(safe-area-inset-top),20px)] px-4 bg-black">
        <h1 className="text-[32px] font-bold text-white mt-4 mb-4 tracking-tight" style={{ fontFamily: SFD }}>
          Market
        </h1>
        
        {/* Search Bar Estilo Telegram */}
        <div className="w-full bg-[#1c1c1e] rounded-[10px] flex items-center px-3 py-2 mb-6">
          <Search size={18} className="text-[#8e8e93] mr-2" />
          <input 
            type="text" 
            placeholder="Search In Market" 
            className="bg-transparent border-none outline-none text-[16px] text-white placeholder-[#8e8e93] w-full"
            style={{ fontFamily: SF }}
          />
        </div>
      </div>

      {/* GRID DE 2 COLUMNAS (Estilo Achievements / Market) */}
      <div className="px-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {NFT_ITEMS.map((item) => {
            const isSoldOut = item.stock === 0
            const priceDisplay = item.price >= 1000 ? `${item.price / 1000}k` : item.price

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-[#161616] rounded-[20px] p-3 flex flex-col aspect-[3/4] active:scale-[0.97] transition-transform ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-[#636366] tracking-widest">{item.type}</span>
                  <span className="text-[10px] font-bold text-[#636366]">#{item.issueNumber}</span>
                </div>

                {/* Arte Central */}
                <div className="flex-1 w-full flex items-center justify-center my-2 relative">
                  <div className="w-[90%] aspect-square flex items-center justify-center">
                    {item.art}
                  </div>
                </div>

                {/* Footer de la tarjeta */}
                <div className="w-full flex flex-col items-center justify-end pb-1">
                  <p className="text-white text-[15px] font-semibold tracking-wide" style={{ fontFamily: SFD }}>{item.name}</p>
                  <p className={`text-[12px] font-bold mt-1 ${isSoldOut ? 'text-[#636366]' : 'text-[#3b82f6]'}`} style={{ fontFamily: SF }}>
                    {isSoldOut ? 'SOLD' : `${priceDisplay} BP`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PANEL DE DETALLE COMPACTO (Estilo "Desk Calendar") ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
          <div 
            className="w-full bg-[#101010] rounded-t-[24px] flex flex-col px-4 pt-2 pb-6 max-h-[85vh] animate-in slide-in-from-bottom-full duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indicador de arrastre */}
            <div className="w-10 h-1.5 bg-[#2c2c2e] rounded-full mx-auto mt-2 mb-6" />

            {/* Arte Principal Flotante */}
            <div className="w-[180px] h-[180px] mx-auto flex items-center justify-center mb-4">
              {selectedItem.art}
            </div>

            {/* Títulos Centrales */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-[22px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                {selectedItem.name} <span className="text-[#8e8e93] font-normal">#{selectedItem.issueNumber}</span>
              </h2>
              <span className="text-[#8e8e93] text-[14px] mt-1" style={{ fontFamily: SF }}>{selectedItem.type === "SHADE" ? "Profile Shade" : "Profile Gift"}</span>
            </div>

            {/* Tabla de Atributos (Estricta al diseño compacto) */}
            <div className="w-full bg-[#1c1c1e] rounded-[16px] flex flex-col overflow-hidden mb-6">
              
              <TableRow label="owner">
                <img src="/xblum-profile.png" alt="" className="w-5 h-5 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="text-[#4ea8e9] font-medium text-[14px]">xBlum Market</span>
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="model">
                <span className="text-white text-[14px]">{selectedItem.model}</span>
                <Tag text={selectedItem.rarity.toLowerCase()} />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="symbol">
                <span className="text-white text-[14px]">{selectedItem.symbol}</span>
                <Tag text="0.4%" />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="backdrop">
                <span className="text-white text-[14px]">{selectedItem.backdrop}</span>
                <Tag text="0.9%" />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="quantity">
                <span className="text-white text-[14px]">{selectedItem.issueNumber}/25,000 issued</span>
              </TableRow>

            </div>

            {/* Botón Flotante Azul */}
            <button
              disabled={selectedItem.stock === 0 || currentBP < selectedItem.price}
              className={`w-full py-3.5 rounded-2xl text-[16px] font-bold transition-all active:scale-[0.98] ${
                selectedItem.stock === 0 ? 'bg-[#2c2c2e] text-[#636366]' : 'bg-[#2aa1ff] text-white'
              }`}
              style={{ fontFamily: SFD }}
            >
              {selectedItem.stock === 0 ? "ok" : `Buy for ${selectedItem.price.toLocaleString()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTES DE TABLA AUXILIARES ──

function TableRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-3 w-full">
      <span className="text-[#8e8e93] text-[14px] font-bold w-24 shrink-0" style={{ fontFamily: SF }}>
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0" style={{ fontFamily: SF }}>
        {children}
      </div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return (
    <span className="bg-[#1c2c3e] text-[#4ea8e9] px-2 py-0.5 rounded-[6px] text-[11px] font-bold tracking-wide">
      {text}
    </span>
  )
}
