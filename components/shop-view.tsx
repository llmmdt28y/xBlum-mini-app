"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Share, Pin, Zap } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. COSMÉTICOS PREMIUM REDISEÑADOS (SVG ART CON ESPACIO CENTRAL) ──

// Diseño 1: Espiral Única Limpia (Estilo Imagen de Referencia)
const SingleSpiral = () => {
  const dots = Array.from({ length: 90 }).map((_, i) => {
    // Math para espiral única y suave
    const angle = 0.22 * i
    const radius = 26 + 0.25 * i // Inicia fuera del centro (radio 26)
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const size = 0.6 + (i / 90) * 1.2
    const opacity = 0.3 + (i / 90) * 0.7
    if (radius > 48) return null
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
      {dots}
      {/* Guía central para avatar (Opcional, invisible pero delimita) */}
      <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1 4" opacity="0.1" />
    </svg>
  )
}

// Diseño 2: Estrellas dispersas (Stardust)
const Stardust = () => {
  // Generar puntos aleatorios fuera del radio central 25
  const stars = Array.from({ length: 60 }).map((_, i) => {
    let x, y, r;
    do {
        x = Math.random() * 80 + 10;
        y = Math.random() * 80 + 10;
        // Distancia al centro (Pitágoras)
        r = Math.sqrt(Math.pow(x-50, 2) + Math.pow(y-50, 2));
    } while (r < 26 || r > 48); // Mantener entre radio 26 y 48

    const size = Math.random() * 1 + 0.3;
    const opacity = Math.random() * 0.7 + 0.3;
    
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
      {stars}
    </svg>
  )
}

// Diseño 3: Cosmic Halo (Reciclado e Integrado)
const CosmicHalo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.3"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" opacity="0.6"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="15 5 2 5" opacity="0.9"/>
    <circle cx="50" cy="50" r="26" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
  </svg>
)

// Regalos de Perfil Vectoriales
const VectorGhost = () => (
  <svg viewBox="0 0 100 100" className="w-[65%] h-[65%] drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <circle cx="40" cy="45" r="5" fill="#ffffff" />
    <circle cx="60" cy="45" r="5" fill="#ffffff" />
    <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const VectorDiamond = () => (
  <svg viewBox="0 0 100 100" className="w-[65%] h-[65%] drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 30 25 L 70 25 L 50 90" fill="none" stroke="#ffffff" strokeWidth="4" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="4" />
  </svg>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──
const NFT_ITEMS = [
  { id: 'aura_spiral', name: "Spiral", type: "Profile Shade", rarity: "Epic", collection: "xBlum Aura", price: 15000, issueNumber: "332,646", maxIssue: "350,000", art: <SingleSpiral />, stock: 17354 },
  { id: 'aura_dust',   name: "Stardust", type: "Profile Shade", rarity: "Rare", collection: "xBlum Aura", price: 5000, issueNumber: "12,005", maxIssue: "50,000", art: <Stardust />, stock: 37995 },
  { id: 'aura_halo',   name: "Halo", type: "Profile Shade", rarity: "Epic", collection: "xBlum Aura", price: 20000, issueNumber: "7,810", maxIssue: "25,000", art: <CosmicHalo />, stock: 2190 },
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

  // ── VISTA DE DETALLE DEL NFT ──
  if (selectedItem) {
    const isSoldOut = selectedItem.stock === 0
    return (
      <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-32 animate-in slide-in-from-right-4 duration-300">
        <div className="px-5 pt-6 pb-6 relative z-10">
          
          {/* Tarjeta de Arte Grande */}
          <div className="w-full aspect-square bg-[#0a0a0a] rounded-[32px] mb-6 flex flex-col items-center justify-center relative overflow-hidden border border-[#1c1c1e] shadow-2xl">
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
            <button className="flex items-center gap-2 bg-[#1c1c1e] border border-[#2c2c2e] px-6 py-2.5 rounded-full active:scale-95 transition-transform">
              <Share size={16} className="text-white" />
              <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>Share</span>
            </button>
          </div>

          {/* Tabla de Atributos NFT (Alineada a la izquierda) */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1e] rounded-[24px] overflow-hidden mb-8">
             <AttributeRow 
               label="Owner" 
               value="xBlum Market" 
               icon={<img src="/xblum-profile.png" alt="" className="w-5 h-5 rounded-full object-cover" />} 
             />
             <div className="h-px bg-[#1c1c1e] ml-4" />
             <AttributeRow 
               label="Game" 
               value="xBlum AI" 
               icon={<img src="/xblum-logo.png" alt="" className="w-5 h-5 object-contain" />} 
             />
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
                isSoldOut ? 'bg-[#1c1c1e] text-[#636366]' : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.25)]'
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

  // ── VISTA DE GRID (Compacta Estilo Imagen de Referencia) ──
  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-10 select-none animate-in fade-in duration-500">
      
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 w-full bg-[#060606]/90 backdrop-blur-xl border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 20px)" }}>
        <h2 className="text-[16px] font-bold text-white absolute left-1/2 -translate-x-1/2" style={{ fontFamily: SFD }}>Market</h2>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-[#0a0a0a] border border-[#1c1c1e] rounded-full">
            <Zap size={11} className="text-amber-400" fill="currentColor"/>
            <span className="text-[11px] font-bold text-white" style={{ fontFamily: SFD }}>
                {currentBP >= 1000 ? `${(currentBP/1000).toFixed(1)}k` : currentBP}
            </span>
        </div>
      </div>

      <div className="px-3 pt-3 pb-4 relative z-10">
        {/* Grid Súper Compacto (gap reducido) */}
        <div className="grid grid-cols-2 gap-2">
           {NFT_ITEMS.map((item) => {
              const isSoldOut = item.stock === 0
              return (
                <button 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  disabled={isSoldOut}
                  className={`relative bg-[#0a0a0a] rounded-[18px] p-2 flex flex-col items-center justify-between border border-[#1c1c1e] transition-all hover:border-[#2c2c2e] active:scale-[0.96] aspect-square ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
                >
                  {/* Tipo (Top Left) */}
                  <div className="absolute top-2 left-2.5 text-[9px] font-bold text-[#636366] uppercase tracking-wider" style={{ fontFamily: SF }}>
                    {item.type.split(' ')[1]}
                  </div>
                  
                  {/* Número de Serie (Top Right) */}
                  <div className="absolute top-2 right-2.5 text-[9px] font-bold text-[#8e8e93]" style={{ fontFamily: SF }}>
                    #{item.issueNumber.split(',')[0]}
                  </div>

                  {/* Arte Visual (Compacto) */}
                  <div className="w-full flex-1 flex items-center justify-center mt-3 pointer-events-none">
                    <div className="w-[75%] h-[75%] flex items-center justify-center">
                       {item.art}
                    </div>
                  </div>

                  {/* Info y Precio (Bottom) */}
                  <div className="w-full mt-1.5 flex flex-col items-center">
                    <p className="text-white text-[12px] font-bold leading-tight" style={{ fontFamily: SFD }}>{item.name}</p>
                    <p className="text-blue-400 text-[10px] font-bold mt-0.5" style={{ fontFamily: SF }}>
                      {isSoldOut ? 'SOLD OUT' : `${item.price >= 1000 ? item.price/1000 + 'k' : item.price} BP`}
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

function AttributeRow({ label, value, icon, valueColor = "white" }: any) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5 text-left">
      <span className="text-[#8e8e93] text-[14px] font-medium min-w-[90px]" style={{ fontFamily: SF }}>{label}:</span>
      <div className="flex items-center gap-2">
        {icon}
        <span 
          className="text-[14px] font-medium" 
          style={{ color: valueColor, fontFamily: SF }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
