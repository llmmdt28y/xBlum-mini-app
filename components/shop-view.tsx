"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Share, Pin } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. COSMÉTICOS PREMIUM REDISEÑADOS Y COMPACTOS (SVG + GRADIENT + DISTRIBUCIÓN) ──

// Envoltorio para aplicar degradado de fondo y distribución
const ArtWrapper = ({ children, gradientColor = "rgba(255,255,255,0.05)" }: { children: React.ReactNode, gradientColor?: string }) => (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-[12px]">
        {/* Degradado de fondo radial que se expande */}
        <div className="absolute inset-0 opacity-80" style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientColor} 0%, transparent 70%)`
        }} />
        {/* El arte SVG encima, distribuido hacia afuera */}
        <div className="relative z-10 w-[110%] h-[110%] flex items-center justify-center scale-110">
            {children}
        </div>
    </div>
)

// Diseño 1: Espiral Única Distribuida y Suave (Estilo Referencia)
const SingleSpiral = () => {
  const dots = Array.from({ length: 120 }).map((_, i) => {
    const angle = 0.20 * i
    // Empieza más lejos y se expande más rápido hacia los bordes
    const radius = 22 + 0.35 * i 
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const size = 0.5 + (i / 120) * 1.0 // Puntos más pequeños y consistentes
    const opacity = 0.2 + (i / 120) * 0.7
    if (radius > 49) return null
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
      {dots}
    </svg>
  )
}

// Diseño 2: Stardust (Estrellas esparcidas con degradado)
const Stardust = () => {
  const stars = Array.from({ length: 80 }).map((_, i) => {
    let x, y, r;
    do {
        x = Math.random() * 90 + 5; // Más cerca de los bordes (5 a 95)
        y = Math.random() * 90 + 5;
        r = Math.sqrt(Math.pow(x-50, 2) + Math.pow(y-50, 2));
    } while (r < 22 || r > 49); // Esparcidas entre radio 22 y 49

    const size = Math.random() * 0.8 + 0.2;
    const opacity = Math.random() * 0.6 + 0.2;
    
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
      {stars}
    </svg>
  )
}

// Diseño 3: Gifts Pattern (NUEVO - Patrón de emojis de regalos distribuido)
const GiftsPattern = () => {
    const gifts = Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2;
        // Distribuido en dos anillos hacia afuera
        const radius = i % 2 === 0 ? 30 : 45; 
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const opacity = i % 2 === 0 ? 0.8 : 0.4;
        
        // Usamos Unicode para el emoji del regalo (🎁)
        return (
            <text key={i} x={x} y={y} fontSize="6" textAnchor="middle" dominantBaseline="central" opacity={opacity}>
                🎁
            </text>
        );
    });
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {gifts}
        </svg>
    );
};

// Regalos de Perfil Vectoriales (Más pequeños y finos)
const VectorGhost = () => (
  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] opacity-90">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <circle cx="40" cy="45" r="4" fill="#ffffff" />
    <circle cx="60" cy="45" r="4" fill="#ffffff" />
    <path d="M 45 60 Q 50 65 55 60" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const VectorDiamond = () => (
  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-90">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 30 25 L 70 25 L 50 90" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="3" />
  </svg>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──
const NFT_ITEMS = [
  { id: 'aura_spiral', name: "Spiral", type: "Shade", rarity: "Epic", collection: "xBlum Aura", price: 15000, issueNumber: "332,646", maxIssue: "350,000", art: <ArtWrapper gradientColor="rgba(168,85,247,0.08)"><SingleSpiral /></ArtWrapper>, stock: 17354 },
  { id: 'aura_dust',   name: "Stardust", type: "Shade", rarity: "Rare", collection: "xBlum Aura", price: 5000, issueNumber: "12,005", maxIssue: "50,000", art: <ArtWrapper gradientColor="rgba(59,130,246,0.08)"><Stardust /></ArtWrapper>, stock: 37995 },
  { id: 'aura_gifts',  name: "Gifts", type: "Shade", rarity: "Epic", collection: "xBlum Aura", price: 20000, issueNumber: "7,810", maxIssue: "25,000", art: <ArtWrapper gradientColor="rgba(232,168,193,0.08)"><GiftsPattern /></ArtWrapper>, stock: 2190 }, // NUEVO
  { id: 'gift_ghost',  name: "Phantom", type: "Gift", rarity: "Legendary", collection: "xBlum Pins", price: 45000, issueNumber: "9,220", maxIssue: "10,000", art: <VectorGhost />, stock: 780 },
  { id: 'gift_diamond',name: "Core", type: "Gift", rarity: "Mythic", collection: "xBlum Pins", price: 150000, issueNumber: "1", maxIssue: "100", art: <VectorDiamond />, stock: 0 } // Sold Out
]

// ── 3. VISTA PRINCIPAL (SHOP VIEW - SUPER COMPACTA) ──

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

  // ── VISTA DE DETALLE DEL NFT (TAMBIÉN COMPACTA) ──
  if (selectedItem) {
    const isSoldOut = selectedItem.stock === 0
    return (
      <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-24 animate-in slide-in-from-right-2 duration-300">
        <div className="px-4 pt-4 pb-4 relative z-10 flex flex-col items-center">
          
          {/* Tarjeta de Arte Grande (reducida) */}
          <div className="w-[85%] aspect-square bg-[#0a0a0a] rounded-[24px] mb-4 flex flex-col items-center justify-center relative overflow-hidden border border-[#1c1c1e] shadow-xl">
             <div className="absolute inset-0 bg-gradient-to-b from-white/3 to-transparent pointer-events-none" />
             <div className="w-full h-full p-6 flex items-center justify-center">
                {selectedItem.art}
             </div>
          </div>

          {/* Título y Share (Compacto) */}
          <div className="flex flex-col items-center mb-6 w-full text-center px-2">
            <h1 className="text-[22px] font-bold text-white mb-3 tracking-tight" style={{ fontFamily: SFD }}>
              {selectedItem.name} <span className="text-[#636366]">#{selectedItem.issueNumber.split(',')[0]}</span>
            </h1>
            <button className="flex items-center gap-1.5 bg-[#141415] border border-[#1c1c1e] px-4 py-1.5 rounded-full active:scale-95 transition-transform">
              <Share size={12} className="text-white/70" />
              <span className="text-white/90 font-bold text-[12px]" style={{ fontFamily: SF }}>Share</span>
            </button>
          </div>

          {/* Tabla de Atributos NFT (Compacta y alineada) */}
          <div className="w-full bg-[#0a0a0a] border border-[#1c1c1e] rounded-[18px] overflow-hidden mb-6">
             <AttributeRow 
               label="Owner" 
               value="xBlum Market" 
               icon={<img src="/xblum-profile.png" alt="" className="w-4 h-4 rounded-full object-cover" />} 
             />
             <div className="h-px bg-[#1c1c1e] ml-3" />
             <AttributeRow 
               label="Game" 
               value="xBlum AI" 
               icon={<img src="/xblum-logo.png" alt="" className="w-4 h-4 object-contain" />} 
             />
             <div className="h-px bg-[#1c1c1e] ml-3" />
             <AttributeRow label="Collection" value={selectedItem.collection} />
             <div className="h-px bg-[#1c1c1e] ml-3" />
             <AttributeRow label="Rarity" value={selectedItem.rarity} valueColor="#8e8e93" />
             <div className="h-px bg-[#1c1c1e] ml-3" />
             <AttributeRow label="Type" value={selectedItem.type} />
             <div className="h-px bg-[#1c1c1e] ml-3" />
             <AttributeRow label="Issued" value={`${selectedItem.issueNumber} / ${selectedItem.maxIssue}`} />
          </div>

          {/* Botón Fijo de Compra (Compacto) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#060606] via-[#060606] to-transparent z-50">
            <button 
              disabled={isSoldOut || currentBP < selectedItem.price}
              className={`w-full py-3 rounded-[16px] text-[15px] font-bold transition-all active:scale-[0.98] ${
                isSoldOut ? 'bg-[#1c1c1e] text-[#636366]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
              style={{ fontFamily: SFD }}
            >
              {isSoldOut ? "Sold Out" : `Buy for ${selectedItem.price.toLocaleString()} BP`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── VISTA DE GRID (3 COLUMNAS - SUPER COMPACTA SIN SCROLL) ──
  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-4 select-none animate-in fade-in duration-300">
      
      {/* Header Sticky (Limpio y reducido) */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full bg-[#060606]/95 backdrop-blur-xl border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)" }}>
        <h2 className="text-[15px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Market</h2>
      </div>

      <div className="px-2.5 pt-3 pb-2 relative z-10">
        {/* Grid Súper Compacto de 3 Columnas (gap mínimo) */}
        <div className="grid grid-cols-3 gap-1.5">
           {NFT_ITEMS.map((item) => {
              const isSoldOut = item.stock === 0
              return (
                <button 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  disabled={isSoldOut}
                  className={`relative bg-[#0a0a0a] rounded-[14px] p-1.5 flex flex-col items-center justify-between border border-[#1c1c1e] transition-all hover:border-[#2c2c2e] active:scale-[0.96] aspect-square ${isSoldOut ? 'opacity-30 grayscale' : ''}`}
                >
                  {/* Tipo (Top Left - Tiny) */}
                  <div className="absolute top-1.5 left-2 text-[7px] font-bold text-[#636366] uppercase tracking-wider" style={{ fontFamily: SF }}>
                    {item.type}
                  </div>
                  
                  {/* Número de Serie (Top Right - Tiny) */}
                  <div className="absolute top-1.5 right-2 text-[7px] font-bold text-[#8e8e93]" style={{ fontFamily: SF }}>
                    #{item.issueNumber.split(',')[0]}
                  </div>

                  {/* Arte Visual (Compacto) */}
                  <div className="w-full flex-1 flex items-center justify-center mt-3 pointer-events-none">
                    <div className="w-[85%] h-[85%] flex items-center justify-center rounded-lg overflow-hidden">
                       {item.art}
                    </div>
                  </div>

                  {/* Info y Precio (Bottom - Tiny) */}
                  <div className="w-full mt-1 flex flex-col items-center text-center">
                    <p className="text-white text-[10px] font-bold leading-tight mb-0.5 truncate w-full px-0.5" style={{ fontFamily: SFD }}>{item.name}</p>
                    <p className="text-blue-400 text-[8px] font-bold" style={{ fontFamily: SF }}>
                      {isSoldOut ? 'SOLD' : `${item.price >= 1000 ? (item.price/1000).toFixed(0) + 'k' : item.price} BP`}
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

// ── COMPONENTES AUXILIARES (COMPACTOS) ──

function AttributeRow({ label, value, icon, valueColor = "white" }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 text-left">
      <span className="text-[#8e8e93] text-[13px] font-medium min-w-[75px]" style={{ fontFamily: SF }}>{label}:</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span 
          className="text-[13px] font-medium truncate" 
          style={{ color: valueColor, fontFamily: SF }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
