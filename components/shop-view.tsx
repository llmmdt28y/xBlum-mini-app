"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { ChevronLeft, Share, Pin } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. COSMÉTICOS CREADOS DESDE CERO (SVG ART) ──

const SpiralAura = () => {
  // Genera una espiral de puntos matemáticamente
  const dots = Array.from({ length: 150 }).map((_, i) => {
    const angle = 0.25 * i
    const radius = 0.3 * i
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const size = 0.5 + (i / 150) * 1.5
    const opacity = 0.2 + (i / 150) * 0.8
    if (radius > 48) return null // Mantener dentro del viewBox
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{dots}</svg>
}

const RadialAura = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
      {[10, 20, 30, 40].map((r, i) => (
        <circle key={r} cx="50" cy="50" r={r} stroke="#ffffff" strokeWidth="1.5" strokeDasharray={`${2 + i * 2} ${4 + i * 2}`} fill="none" opacity={0.3 + (i * 0.2)} />
      ))}
      <circle cx="50" cy="50" r="2" fill="#ffffff" />
    </svg>
  )
}

const VectorGhost = () => (
  <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <circle cx="40" cy="45" r="5" fill="#ffffff" />
    <circle cx="60" cy="45" r="5" fill="#ffffff" />
    <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const VectorDiamond = () => (
  <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 30 25 L 70 25 L 50 90" fill="none" stroke="#ffffff" strokeWidth="4" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="4" />
  </svg>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──

const NFT_ITEMS = [
  { id: 'aura_spiral', name: "Spiral", type: "Profile Shade", rarity: "Epic", collection: "xBlum Aura", price: 15000, issueNumber: "332,646", maxIssue: "350,000", art: <SpiralAura />, stock: 17354 },
  { id: 'aura_radial', name: "Glance", type: "Profile Shade", rarity: "Rare", collection: "xBlum Aura", price: 5000, issueNumber: "12,005", maxIssue: "50,000", art: <RadialAura />, stock: 37995 },
  { id: 'gift_ghost',  name: "Phantom", type: "Profile Gift", rarity: "Legendary", collection: "xBlum Pins", price: 45000, issueNumber: "9,220", maxIssue: "10,000", art: <VectorGhost />, stock: 780 },
  { id: 'gift_diamond',name: "Core", type: "Profile Gift", rarity: "Mythic", collection: "xBlum Pins", price: 150000, issueNumber: "1", maxIssue: "100", art: <VectorDiamond />, stock: 0 } // Sold Out
]

// ── 3. VISTA PRINCIPAL (SHOP VIEW) ──

export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Botón atrás nativo adaptativo
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

  // ── VISTA DE DETALLE DEL NFT (Imitando tu 3ra imagen) ──
  if (selectedItem) {
    const isSoldOut = selectedItem.stock === 0
    return (
      <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-32 animate-in slide-in-from-right-4 duration-300">
        <div className="px-5 pt-6 pb-6">
          
          {/* Tarjeta de Arte Grande */}
          <div className="w-full aspect-square bg-[#111] rounded-[32px] mb-6 flex flex-col items-center justify-center relative overflow-hidden border border-[#1c1c1e] shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
             <div className="w-full h-full p-10 flex items-center justify-center">
                {selectedItem.art}
             </div>
          </div>

          {/* Título y Share */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-[28px] font-bold text-white mb-4" style={{ fontFamily: SFD }}>
              {selectedItem.name} <span className="text-[#8e8e93]">#{selectedItem.issueNumber.split(',')[0]}</span>
            </h1>
            <button className="flex items-center gap-2 bg-[#1c1c1e] px-6 py-2.5 rounded-full active:scale-95 transition-transform">
              <Share size={16} className="text-white" />
              <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>Share</span>
            </button>
          </div>

          {/* Tabla de Atributos NFT */}
          <div className="bg-[#111] border border-[#1c1c1e] rounded-[24px] overflow-hidden mb-8">
             <AttributeRow label="Owner" value="xBlum Marketplace" isLink />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow label="Game" value="xBlum AI" icon={<CheckBadge />} />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow label="Collection" value={selectedItem.collection} />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow label="Rarity" value={selectedItem.rarity} valueColor="#8e8e93" />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow label="Type" value={selectedItem.type} />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow label="Issued" value={`${selectedItem.issueNumber} / ${selectedItem.maxIssue}`} />
          </div>

          {/* Botón Fijo de Compra */}
          <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#060606] via-[#060606] to-transparent z-50">
            <button 
              disabled={isSoldOut || currentBP < selectedItem.price}
              className={`w-full py-4 rounded-[20px] text-[17px] font-bold transition-all active:scale-[0.98] ${
                isSoldOut ? 'bg-[#1c1c1e] text-[#636366]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
              style={{ fontFamily: SFD }}
            >
              {isSoldOut ? "Out of Stock" : `Buy for ${selectedItem.price.toLocaleString()} BP`}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ── VISTA DE GRID (Marketplace Principal) ──
  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-32 select-none animate-in fade-in duration-500">
      
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full bg-[#060606]/80 backdrop-blur-xl border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: SFD }}>Market</h2>
      </div>

      <div className="px-5 pt-6 pb-6">
        <h1 className="text-[28px] font-bold text-white mb-6" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>
          Exclusive Drops
        </h1>

        {/* Grid Estilo Telegram Gifts */}
        <div className="grid grid-cols-2 gap-3">
           {NFT_ITEMS.map((item) => {
              const isSoldOut = item.stock === 0
              return (
                <button 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`relative bg-[#0a0a0a] rounded-[24px] p-2.5 flex flex-col items-center justify-between aspect-square active:scale-[0.96] transition-all border border-[#1c1c1e] hover:border-white/20 ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
                >
                  {/* Icono Pin decorativo */}
                  <div className="absolute top-3 left-3">
                    <Pin size={12} className="text-white/40 -rotate-45" fill="currentColor" />
                  </div>
                  
                  {/* Número de Serie */}
                  <div className="absolute top-2.5 right-3 text-[10px] font-bold text-[#8e8e93]" style={{ fontFamily: SF }}>
                    #{item.issueNumber.split(',')[0]}
                  </div>

                  {/* Arte Visual */}
                  <div className="w-full flex-1 flex items-center justify-center mt-4 pointer-events-none">
                    <div className="w-[80%] h-[80%] flex items-center justify-center">
                       {item.art}
                    </div>
                  </div>

                  {/* Nombre y Precio */}
                  <div className="w-full mt-2 flex flex-col items-center">
                    <p className="text-white text-[13px] font-bold" style={{ fontFamily: SFD }}>{item.name}</p>
                    <p className="text-blue-400 text-[11px] font-bold mt-0.5" style={{ fontFamily: SF }}>
                      {isSoldOut ? 'SOLD OUT' : `${item.price.toLocaleString()} BP`}
                    </p>
                  </div>
                </button>
              )
           })}
        </div>
      </div>

    </div>
  )
}

// ── COMPONENTES AUXILIARES ──

function AttributeRow({ label, value, icon, isLink, valueColor = "white" }: any) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[#8e8e93] text-[15px] font-medium" style={{ fontFamily: SF }}>{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span 
          className="text-[15px] font-medium" 
          style={{ color: isLink ? "#3b82f6" : valueColor, fontFamily: SF }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function CheckBadge() {
  return (
    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-3 h-3 text-black">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </div>
  )
}
