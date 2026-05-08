"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, ExternalLink, Filter, ArrowUpDown, Lock, Search, Plus } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos de Lootboxes ─────────────────────────────────────────
const LOOTBOXES_DB = [
  {
    id: "vanguard_box",
    name: "Vanguard Box",
    price: "150",
    currency: "Stars",
    color: "#8b5cf6", // Morado
    glow: "rgba(139, 92, 246, 0.6)",
    soldOut: true,
    stats: { onSale: 0, floor: "150", volume: "12K" }
  },
  {
    id: "premium_box",
    name: "Premium Box",
    price: "50",
    currency: "Stars",
    color: "#facc15", // Amarillo/Dorado
    glow: "rgba(250, 204, 21, 0.6)",
    soldOut: false,
    stats: { onSale: 457, floor: "45.5", volume: "23K" }
  },
  {
    id: "basic_box",
    name: "Basic Box",
    price: "5,000",
    currency: "BP",
    color: "#06b6d4", // Cyan
    glow: "rgba(6, 182, 212, 0.6)",
    soldOut: false,
    stats: { onSale: 1250, floor: "5,000", volume: "1.2M" }
  }
]

// ── Drop Pool (Items que pueden salir en la Premium Box) ──
const PREMIUM_DROPS = [
  { id: 1, name: "Pixel Hearts (Gold)", serial: "#3445", price: "75", rarity: "Epic", color: "#facc15" },
  { id: 2, name: "Void Plasma", serial: "#1122", price: "120", rarity: "Mythic", color: "#8b5cf6" },
  { id: 3, name: "Sparkle Title", serial: "#8912", price: "40", rarity: "Rare", color: "#60a5fa" },
  { id: 4, name: "Basic Hearts", serial: "#10234", price: "15", rarity: "Common", color: "#ffffff" },
]

// ── Componente: Caja 3D Estilizada ──
const LootboxGraphic = ({ color, glow }: { color: string, glow: string }) => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute -top-4 w-12 h-12 rounded-full blur-xl opacity-60" style={{ backgroundColor: glow }}></div>
    <div className="relative w-12 h-12 bg-[#1a1a1a] rounded-xl border-t-2 border-[#333] shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
      <div className="w-4 h-4 bg-[#0a0a0a] rounded-sm border border-[#333] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}></div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/20 to-transparent"></div>
    </div>
    <div className="absolute -top-3 w-6 h-6 animate-pulse" style={{ background: color, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
  </div>
)

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myBP = ctx.x_points ?? ctx.tokens ?? 0
  const myStars = 0 

  const [selectedBox, setSelectedBox] = useState<any>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    
    const handleBack = () => {
      if (selectedBox) {
        setSelectedBox(null)
      } else { 
        setCurrentView("home")
        tg.BackButton.hide() 
      }
    }
    
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
    // AQUÍ ESTABA EL ERROR: Decía selectedItem en vez de selectedBox
  }, [setCurrentView, selectedBox]) 

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 bg-[#000000] pb-24">
      
      {/* ── Header Principal ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 pt-8 pb-4 bg-black/80 backdrop-blur-md">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
               <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
         </div>
         <button className="bg-[#1c1c1e] border border-[#2c2c2e] px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars}</span>
            <span className="text-[#8e8e93] font-bold text-[14px] leading-none mb-[2px] ml-0.5">+</span>
         </button>
      </div>

      <div className="flex flex-col relative overflow-x-hidden">
        
        {/* ── Carrusel "Presale" (Efecto Superpuesto 3D) ── */}
        <div className="w-full flex flex-col items-center mt-6">
           <div className="relative w-full h-[140px] flex items-center justify-center">
              <div className="absolute left-[15%] w-[100px] h-[100px] bg-[#111] rounded-[24px] border border-[#222] scale-75 opacity-50 blur-[1px] flex items-center justify-center transform -rotate-6">
                 <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
              </div>
              <div className="absolute right-[15%] w-[100px] h-[100px] bg-[#111] rounded-[24px] border border-[#222] scale-75 opacity-50 blur-[1px] flex items-center justify-center transform rotate-6">
                 <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              </div>
              <div className="relative z-10 w-[120px] h-[120px] bg-[#141415] rounded-[32px] border border-[#2c2c2e] shadow-2xl flex items-center justify-center">
                 <LootboxGraphic color="#8b5cf6" glow="rgba(139, 92, 246, 0.4)" />
              </div>
           </div>
           
           <h2 className="text-white font-bold text-[22px] mt-6" style={{ fontFamily: SFD }}>Vanguard Presale</h2>
           
           <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] rounded-full text-blue-400 font-bold text-[13px]" style={{ fontFamily: SF }}>
                 Play <ExternalLink className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] rounded-full text-blue-400 font-bold text-[13px]" style={{ fontFamily: SF }}>
                 Telegram <ExternalLink className="w-3 h-3" />
              </button>
           </div>
        </div>

        {/* ── Banner de Balance (Degradado Púrpura) ── */}
        <div className="px-5 mt-8">
           <div className="w-full bg-gradient-to-r from-[#2a1738] to-[#111111] rounded-[24px] p-5 border border-[#3a204d] relative overflow-hidden">
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full"></div>
              
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                       <span className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>{myStars}</span>
                    </div>
                    <span className="text-[#a78bfa] text-[13px] font-bold mt-1" style={{ fontFamily: SF }}>Stars Balance</span>
                 </div>
                 
                 <div className="flex flex-col gap-2">
                    <button className="bg-[#8b5cf6] text-white font-bold text-[14px] px-5 py-2 rounded-xl active:bg-[#7c3aed] transition-colors" style={{ fontFamily: SF }}>
                       Top Up
                    </button>
                    <button className="bg-[#1c1c1e]/80 backdrop-blur-sm text-white font-bold text-[12px] px-5 py-1.5 rounded-xl border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                       About Stars
                    </button>
                 </div>
              </div>
              <p className="text-[#8e8e93] text-[11px] mt-4 font-medium" style={{ fontFamily: SF }}>
                 Use Telegram Stars to buy exclusive lootboxes and cosmetics.
              </p>
           </div>
        </div>

        {/* ── Sección Lootboxes ── */}
        <div className="px-5 mt-8">
           <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-[22px] flex items-center gap-2" style={{ fontFamily: SFD }}>
                 Lootboxes <span className="text-[#48484a] text-[18px]">{LOOTBOXES_DB.length}</span>
              </h3>
              <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                    <Filter className="w-4 h-4 text-[#8e8e93]" />
                 </button>
                 <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                    <Star className="w-4 h-4 text-[#8e8e93]" />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3">
              {LOOTBOXES_DB.map((box) => (
                 <div 
                   key={box.id} 
                   className={`bg-[#111111] rounded-[20px] border border-[#1c1c1e] p-3 flex flex-col items-center relative transition-transform ${box.soldOut ? 'opacity-70 grayscale-[30%]' : 'active:scale-95'}`}
                   onClick={() => !box.soldOut && setSelectedBox(box)}
                 >
                    {box.soldOut ? (
                       <div className="absolute top-2 left-2 bg-[#3a1a1a] border border-[#ff4d4d]/30 text-[#ff4d4d] px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider">
                          Sold out
                       </div>
                    ) : (
                       <div className="absolute top-2 right-2 text-[#8e8e93]">
                          {box.currency === 'Stars' ? <Star className="w-3 h-3 fill-current" /> : <span className="text-[9px] font-bold">BP</span>}
                       </div>
                    )}

                    <div className="mt-6 mb-4">
                       <LootboxGraphic color={box.color} glow={box.glow} />
                    </div>

                    <button className="w-full bg-[#1c1c1e] text-white font-bold text-[12px] py-2 rounded-[10px] mt-auto" style={{ fontFamily: SF }}>
                       Market
                    </button>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Inventario Placeholder ── */}
        <div className="px-5 mt-10">
           <h3 className="text-white font-bold text-[22px] flex items-center gap-2 mb-4" style={{ fontFamily: SFD }}>
              My Inventory <span className="text-[#48484a] text-[18px]">0</span>
           </h3>
           <div className="w-full h-[100px] rounded-[20px] border border-dashed border-[#2c2c2e] flex items-center justify-center">
              <span className="text-[#48484a] font-medium" style={{ fontFamily: SF }}>No items in market</span>
           </div>
        </div>
      </div>

      {/* ── MODAL DE COLECCIÓN ── */}
      {selectedBox && (
         <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-5 pt-8 pb-4 bg-black border-b border-[#1c1c1e]">
               <button 
                  className="text-white flex items-center gap-1 text-[16px] font-medium" 
                  style={{ fontFamily: SF }}
                  onClick={() => setSelectedBox(null)}
               >
                  <ChevronLeft className="w-6 h-6" /> {selectedBox.name}
               </button>
               <button className="bg-[#1c1c1e] px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars}</span>
                  <Plus className="w-3.5 h-3.5 text-[#8e8e93]" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
               <div className="flex flex-col items-center mt-6">
                  <h1 className="text-white text-[28px] font-bold" style={{ fontFamily: SFD }}>Collection</h1>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
                     <span className="text-[#8e8e93] text-[14px] font-medium" style={{ fontFamily: SF }}>xBlum · {selectedBox.name}</span>
                  </div>

                  <div className="flex items-center justify-center gap-8 mt-8 w-full px-8">
                     <div className="flex flex-col items-center">
                        <span className="text-white font-bold text-[18px]" style={{ fontFamily: SF }}>{selectedBox.stats.onSale}</span>
                        <span className="text-[#8e8e93] text-[12px] mt-1" style={{ fontFamily: SF }}>On sale</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-white font-bold text-[18px] flex items-center gap-1" style={{ fontFamily: SF }}>
                           {selectedBox.stats.floor} {selectedBox.currency === 'Stars' && <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />}
                        </span>
                        <span className="text-[#8e8e93] text-[12px] mt-1" style={{ fontFamily: SF }}>Floor</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-white font-bold text-[18px] flex items-center gap-1" style={{ fontFamily: SF }}>
                           {selectedBox.stats.volume} {selectedBox.currency === 'Stars' && <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />}
                        </span>
                        <span className="text-[#8e8e93] text-[12px] mt-1" style={{ fontFamily: SF }}>Volume</span>
                     </div>
                  </div>

                  <div className="w-[80%] aspect-video bg-[#0a0a0b] rounded-[24px] border border-[#1c1c1e] mt-8 flex items-center justify-center">
                     <div className="scale-[1.5]">
                        <LootboxGraphic color={selectedBox.color} glow={selectedBox.glow} />
                     </div>
                  </div>
               </div>

               <div className="px-5 mt-10">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>
                        Possible Drops <span className="text-[#48484a] text-[16px]">{PREMIUM_DROPS.length}</span>
                     </h3>
                     <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-md bg-[#1c1c1e] flex items-center justify-center"><Filter className="w-4 h-4 text-white" /></button>
                        <button className="w-8 h-8 rounded-md bg-[#1c1c1e] flex items-center justify-center"><ArrowUpDown className="w-4 h-4 text-white" /></button>
                     </div>
                  </div>

                  <div className="w-full h-10 bg-[#1c1c1e] rounded-xl flex items-center px-3 mb-6 border border-[#2c2c2e]">
                     <Search className="w-4 h-4 text-[#8e8e93] mr-2" />
                     <input type="text" placeholder="Search by name or serial" className="bg-transparent border-none outline-none text-white text-[14px] flex-1 placeholder:text-[#636366]" style={{ fontFamily: SF }} />
                  </div>

                  <div className="flex flex-col gap-3">
                     {PREMIUM_DROPS.map((drop) => (
                        <div key={drop.id} className="flex items-center justify-between bg-[#111111] p-3 rounded-[16px] border border-[#1c1c1e]">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-[12px] bg-[#1a1a1a] flex items-center justify-center border border-[#2c2c2e] overflow-hidden relative">
                                 <div className="absolute inset-0 opacity-20" style={{ backgroundColor: drop.color }}></div>
                                 <Hexagon className="w-6 h-6" style={{ color: drop.color }} strokeWidth={1.5} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{drop.name}</span>
                                 <span className="text-[#8e8e93] text-[12px] mt-0.5" style={{ fontFamily: SF }}>{drop.serial} • {drop.rarity}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-white font-bold text-[14px] flex items-center gap-1" style={{ fontFamily: SF }}>
                                 {selectedBox.currency === 'Stars' ? <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" /> : <span className="text-[10px] text-blue-400 mt-0.5">BP</span>}
                                 {drop.price}
                              </span>
                              <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
                                 <Plus className="w-4 h-4 text-blue-400" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent pt-10">
               <button className="w-full bg-blue-500 active:bg-blue-600 transition-colors text-white font-bold text-[17px] py-4 rounded-[16px]" style={{ fontFamily: SF }}>
                  Buy {selectedBox.name} for {selectedBox.price} {selectedBox.currency}
               </button>
            </div>
         </div>
      )}
    </div>
  )
}
