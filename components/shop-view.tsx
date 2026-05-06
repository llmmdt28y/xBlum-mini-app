"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Package, Crown, Ghost, Sparkles, ShieldAlert, CircleDashed, Hexagon, Zap, Gem, Lock } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos y Configuración de Rarezas ──
type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic"

const RARITY_STYLES: Record<Rarity, { color: string, border: string, bg: string, shadow: string, label: string }> = {
  common:    { color: "#ffffff", border: "border-white/20", bg: "bg-white/5", shadow: "shadow-white/10", label: "Common" },
  rare:      { color: "#3b82f6", border: "border-blue-500/30", bg: "bg-blue-500/10", shadow: "shadow-blue-500/20", label: "Rare" },
  epic:      { color: "#a855f7", border: "border-purple-500/40", bg: "bg-purple-500/10", shadow: "shadow-purple-500/30", label: "Epic" },
  legendary: { color: "#f59e0b", border: "border-amber-500/50", bg: "bg-amber-500/10", shadow: "shadow-amber-500/40", label: "Legendary" },
  mythic:    { color: "#ef4444", border: "border-red-500/50", bg: "bg-red-500/10", shadow: "shadow-red-500/40", label: "Mythic" }
}

// ── Base de Datos de Cosméticos (Simulada) ──
const SHOP_ITEMS = [
  { id: 'box_1',    name: "Quantum Mystery Box", type: "box",    price: 3000,  stock: "∞", rarity: "epic",      icon: <Package size={32} /> },
  { id: 'box_2',    name: "Void Mystery Box",    type: "box",    price: 8000,  stock: "∞", rarity: "legendary", icon: <Hexagon size={32} /> },
  { id: 'pro_1',    name: "xBlum Pro (1 Month)", type: "sub",    price: 50000, stock: 0,   rarity: "mythic",    icon: <Crown size={32} /> },
  { id: 'aura_1',   name: "Neon Matrix Aura",    type: "aura",   price: 15000, stock: 12,  rarity: "epic",      icon: <Sparkles size={32} /> },
  { id: 'pin_1',    name: "Hacker Ghost Pin",    type: "pin",    price: 25000, stock: 0,   rarity: "legendary", icon: <Ghost size={32} /> },
  { id: 'border_1', name: "Plasma Ring",         type: "border", price: 5000,  stock: 350, rarity: "rare",      icon: <CircleDashed size={32} /> },
  { id: 'badge_1',  name: "Pioneer Badge",       type: "badge",  price: 12000, stock: 0,   rarity: "legendary", icon: <ShieldAlert size={32} /> },
  { id: 'bg_1',     name: "Deep Space Void",     type: "bg",     price: 8000,  stock: 89,  rarity: "rare",      icon: <Gem size={32} /> }
]

export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [activeFilter, setActiveFilter] = useState("all")

  const filters = ["all", "box", "aura", "pin", "border", "badge"]
  
  const filteredItems = SHOP_ITEMS.filter(item => activeFilter === "all" || item.type === activeFilter)

  // ── Botón Atrás Nativo ──
  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (tg?.BackButton) {
      tg.BackButton.show()
      const handleBack = () => setCurrentView("levels")
      tg.BackButton.onClick(handleBack)
      return () => {
        tg.BackButton.offClick(handleBack)
        tg.BackButton.hide()
      }
    }
  }, [setCurrentView])

  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-32 select-none animate-in fade-in duration-500">
      
      {/* Fondo Stardust de xBlum */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full bg-black/80 backdrop-blur-md border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: SFD }}>Marketplace</h2>
      </div>

      <div className="px-5 pt-8 pb-4 relative z-10 flex flex-col items-center animate-in slide-in-from-top-4 duration-700">
         <h1 className="text-[34px] font-bold text-white tracking-tight mb-2 text-center" style={{ fontFamily: SFD }}>
           Exclusive Drops
         </h1>
         <p className="text-[#8e8e93] text-[14px] text-center max-w-[280px]" style={{ fontFamily: SF }}>
           Use your BP to unlock extremely rare cosmetics and showcase your status.
         </p>

         {/* Balance Actual */}
         <div className="mt-6 px-4 py-2 rounded-full border border-[#1c1c1e] bg-[#111] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{currentBP.toLocaleString()} BP</span>
         </div>
      </div>

      {/* Filtros Horizontales */}
      <div className="w-full overflow-x-auto no-scrollbar px-5 py-4 relative z-10">
         <div className="flex gap-2 w-max">
            {filters.map(filter => (
               <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold capitalize transition-all ${
                     activeFilter === filter ? 'bg-white text-black' : 'bg-[#141415] border border-[#1c1c1e] text-[#8e8e93]'
                  }`}
                  style={{ fontFamily: SF }}
               >
                  {filter}
               </button>
            ))}
         </div>
      </div>

      {/* Grid de Ítems (Estilo NFT Fragment) */}
      <div className="px-5 grid grid-cols-2 gap-3 relative z-10 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
         {filteredItems.map(item => {
            const rarity = RARITY_STYLES[item.rarity as Rarity]
            const isOutOfStock = item.stock === 0
            
            return (
               <div key={item.id} className={`relative rounded-[22px] overflow-hidden flex flex-col transition-all active:scale-[0.97] ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                    style={{ background: "#111", border: `1px solid ${isOutOfStock ? '#1c1c1e' : '#2c2c2e'}` }}>
                  
                  {/* Resplandor Superior por Rareza */}
                  <div className={`absolute top-0 inset-x-0 h-[60px] opacity-30 ${rarity.bg} blur-xl`} />

                  {/* Header de la tarjeta (Stock y Rareza) */}
                  <div className="flex items-center justify-between px-3 pt-3 relative z-10">
                     <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rarity.color, fontFamily: SFD }}>
                        {rarity.label}
                     </span>
                     <span className="text-[11px] font-bold text-[#636366]" style={{ fontFamily: SF }}>
                        {isOutOfStock ? '0/0' : `${item.stock} left`}
                     </span>
                  </div>

                  {/* Contenedor del Icono/Visual */}
                  <div className="flex-1 flex items-center justify-center py-6 relative z-10">
                     <div className={`w-[64px] h-[64px] rounded-full flex items-center justify-center ${rarity.bg} border ${rarity.border} ${rarity.shadow} shadow-lg relative`}>
                        {/* Efecto de cristal y destello */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-full" />
                        <div style={{ color: rarity.color }}>{item.icon}</div>
                     </div>
                  </div>

                  {/* Info y Botón de Compra */}
                  <div className="px-3 pb-3 relative z-10">
                     <p className="text-white font-bold text-[14px] leading-tight mb-3 truncate" style={{ fontFamily: SFD }}>
                        {item.name}
                     </p>

                     <button disabled={isOutOfStock || currentBP < item.price}
                             className={`w-full py-2.5 rounded-[14px] flex items-center justify-center gap-1.5 transition-colors
                                ${isOutOfStock 
                                    ? 'bg-[#1c1c1e] text-[#636366]' 
                                    : currentBP >= item.price 
                                       ? 'bg-white text-black hover:bg-gray-200' 
                                       : 'bg-[#1c1c1e] text-white/50'}`}>
                        {isOutOfStock ? (
                           <>
                              <Lock size={14} />
                              <span className="text-[12px] font-bold" style={{ fontFamily: SFD }}>SOLD OUT</span>
                           </>
                        ) : (
                           <span className="text-[13px] font-bold" style={{ fontFamily: SFD }}>
                              {item.price.toLocaleString()} BP
                           </span>
                        )}
                     </button>
                  </div>
               </div>
            )
         })}
      </div>

    </div>
  )
}
