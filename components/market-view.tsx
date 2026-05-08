"use client"

import { useApp } from "@/lib/app-context"
import { useEffect } from "react"
// ¡AQUÍ ESTABA EL ERROR! Faltaba importar 'Search'
import { Store, Plus, Filter, Star, ArrowUpRight, Hexagon, Ghost, Zap, Rocket, Search } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual adaptada al diseño de las cajas ──
const MARKET_BOXES = [
  { id: 'common', name: 'Iron Box', limit: '0 / 5000', color: '#4ade80', icon: Ghost, isSoldOut: true }, // Verde Neón
  { id: 'epic', name: 'Meme Box', limit: '0 / 4000', color: '#facc15', icon: Zap, isSoldOut: true },     // Dorado/Amarillo
  { id: 'mythic', name: 'Genesis Box', limit: '0 / 6000', color: '#c084fc', icon: Rocket, isSoldOut: true } // Púrpura
]

const INDIVIDUAL_ITEMS = [
  { id: 1, title: 'MYTHIC PIXEL HEART #00,001', price: 150, color: '#a855f7' },
  { id: 2, title: 'EPIC NAME ICON #00,244', price: 75, color: '#eab308' },
  { id: 3, title: 'RARE COSMETIC PACK #12,311', price: 50, color: '#3b82f6' },
  { id: 4, title: 'COMMON REWARD #11,351', price: 25, color: '#94a3b8' }
]

// ── Nuevo Diseño Minimalista de Lootbox ──
const LootboxMinimal = ({ color, floatingIcon: Icon }: { color: string, floatingIcon: any }) => (
  <div className="relative w-full h-[110px] flex flex-col items-center justify-end mt-2 mb-2 group cursor-pointer">
    {/* Resplandor Ambiental (Sombra de color en el fondo) */}
    <div className="absolute bottom-4 w-16 h-16 rounded-full blur-[24px] opacity-30 transition-opacity group-hover:opacity-50" style={{ backgroundColor: color }}></div>

    {/* Haz Holográfico (Ancho arriba, estrecho en la base) */}
    <div 
      className="absolute bottom-[40px] w-[64px] h-[55px] opacity-40 z-0 transition-all duration-500 group-hover:h-[65px]"
      style={{ 
        background: `linear-gradient(to bottom, transparent 0%, ${color} 100%)`,
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' 
      }}
    ></div>

    {/* Ítem Flotante Animado (Rebote) */}
    <div className="absolute top-0 animate-[bounce_3s_ease-in-out_infinite] z-10 transition-transform duration-500 group-hover:-translate-y-2">
      <div style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
         <Icon className="w-[34px] h-[34px]" style={{ color: color, fill: `${color}30` }} strokeWidth={1.5} />
      </div>
    </div>

    {/* Base de la Caja (Matte Black Sleek) */}
    <div className="relative z-20 w-[68px] h-[44px] bg-[#121214] rounded-[10px] shadow-[0_12px_25px_rgba(0,0,0,0.9)] border border-[#2c2c2e] flex flex-col items-center overflow-hidden">
       {/* Brillo en el borde superior */}
       <div className="w-full h-[1px] bg-white/10"></div>
       {/* Banda de Energía Neón */}
       <div className="w-full h-[3px] shadow-[0_0_12px_currentColor] opacity-100 mt-1.5" style={{ backgroundColor: color, color: color }}></div>
       {/* Cerradura / Interfaz Frontal */}
       <div className="w-[16px] h-[16px] bg-[#050505] rounded-[5px] mt-1.5 flex items-center justify-center border border-[#1f1f22] shadow-inner">
          {/* Núcleo de energía que palpita */}
          <div className="w-[4px] h-[4px] rounded-sm animate-pulse" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
       </div>
    </div>
  </div>
)

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myStars = 150 

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    
    const handleBack = () => {
      setCurrentView("home")
      tg.BackButton.hide() 
    }
    
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 bg-[#000000] pb-32">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 pt-16 pb-4 bg-black/90 backdrop-blur-md">
         <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
               <Store className="w-4 h-4 text-blue-500" />
            </div>
            <h1 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
         </div>

         <div className="bg-[#1c1c1e] rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e]">
            <img src="/telegram-star-icon.png" alt="Stars" className="w-[14px] h-[14px] object-contain" />
            <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars}</span>
            <button className="w-[22px] h-[22px] rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95">
               <Plus className="w-3.5 h-3.5 text-white/80" strokeWidth={3} />
            </button>
         </div>
      </div>

      <div className="flex flex-col relative overflow-x-hidden pt-2">
        
        {/* ── Carrusel Superpuesto ── */}
        <div className="w-full flex flex-col items-center mt-4 overflow-visible">
           <div className="relative w-full h-[150px] flex items-center justify-center">
              
              <div className="absolute z-10 w-[90px] h-[90px] bg-[#0a0a0b] rounded-2xl right-[78%] opacity-20 scale-90 flex items-center justify-center border border-white/5">
                 <Hexagon className="w-8 h-8 text-white/30" />
              </div>
              <div className="absolute z-10 w-[90px] h-[90px] bg-[#0a0a0b] rounded-2xl left-[78%] opacity-20 scale-90 flex items-center justify-center border border-white/5">
                 <Hexagon className="w-8 h-8 text-white/30" />
              </div>

              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] right-[58%] opacity-60 scale-95 flex items-center justify-center border border-[#1c1c1e]">
                 <Hexagon className="w-10 h-10 text-white/50" />
              </div>
              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] left-[58%] opacity-60 scale-95 flex items-center justify-center border border-[#1c1c1e]">
                 <Hexagon className="w-10 h-10 text-[#facc15]/50 fill-[#facc15]/10" />
              </div>

              <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[28px] border border-[#2c2c2e] shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                 <div className="w-[70px] h-[70px] bg-[#1a1a1e] rounded-2xl flex items-center justify-center border border-[#2c2c2e] z-10 shadow-lg">
                    <img src="/robot-achievement.png" className="w-[120%] h-[120%] object-cover pointer-events-none" />
                 </div>
              </div>

           </div>
           
           <h2 className="text-white font-bold text-[22px] mt-6" style={{ fontFamily: SFD }}>xBlum Presale</h2>
           
           <div className="flex items-center justify-center gap-3 mt-4">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a2333] rounded-full text-[#3b82f6] font-semibold text-[12px] border border-[#3b82f6]/20 active:opacity-70 transition-opacity" style={{ fontFamily: SF }}>
                 Play <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a2333] rounded-full text-[#3b82f6] font-semibold text-[12px] border border-[#3b82f6]/20 active:opacity-70 transition-opacity" style={{ fontFamily: SF }}>
                 Telegram <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a2333] rounded-full text-[#3b82f6] font-semibold text-[12px] border border-[#3b82f6]/20 active:opacity-70 transition-opacity" style={{ fontFamily: SF }}>
                 X <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>

        {/* ── Sección Lootboxes ── */}
        <div className="mt-10">
           <div className="flex items-center justify-between px-5 mb-5">
              <h3 className="text-white font-bold text-[22px] flex items-center gap-2.5" style={{ fontFamily: SFD }}>
                 Lootboxes <span className="text-[#8e8e93] text-[20px] font-medium">3</span>
              </h3>
              <div className="flex gap-2">
                 <button className="w-[34px] h-[34px] rounded-xl bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                    <Filter className="w-4 h-4 text-[#3b82f6]" strokeWidth={2.5} />
                 </button>
                 <button className="w-[34px] h-[34px] rounded-xl bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                    <Star className="w-4 h-4 text-[#8e8e93]" strokeWidth={2.5} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-[10px] px-5">
              {MARKET_BOXES.map((box) => (
                 <div key={box.id} className="flex flex-col items-center w-full">
                    <div className="w-full bg-[#141415] rounded-[24px] p-2.5 pb-3 flex flex-col items-center relative transition-transform active:scale-[0.98]">
                       
                       {box.isSoldOut && (
                          <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider z-30">
                             Sold out
                          </div>
                       )}

                       {/* Implementación del Nuevo Diseño Minimalista */}
                       <LootboxMinimal color={box.color} floatingIcon={box.icon} />

                       <button className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] hover:bg-[#3a3a3c] transition-colors" style={{ fontFamily: SF }}>
                          Market
                       </button>
                    </div>

                    <div className="mt-2.5 text-center flex flex-col items-center">
                       <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{box.name}</span>
                       <span className="text-[#8e8e93] font-medium text-[12px] mt-0.5" style={{ fontFamily: SF }}>{box.limit}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Sección My Inventory ── */}
        <div className="mt-10">
           <div className="flex items-center px-5 mb-5">
              <h3 className="text-white font-bold text-[22px] flex items-center gap-2.5" style={{ fontFamily: SFD }}>
                 My Inventory <span className="text-[#8e8e93] text-[20px] font-medium">0</span>
              </h3>
           </div>

           <div className="grid grid-cols-3 gap-[10px] px-5">
              {MARKET_BOXES.map((box) => (
                 <div key={`inv-${box.id}`} className="flex flex-col items-center w-full opacity-60">
                    <div className="w-full bg-[#141415] rounded-[24px] p-2.5 pb-3 flex flex-col items-center relative">
                       
                       <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-1.5 py-[2px] rounded text-[9px] font-bold tracking-wider z-30">
                          x0
                       </div>

                       <LootboxMinimal color={box.color} floatingIcon={box.icon} />

                       <button disabled className="w-full bg-[#1c1c1e] text-[#636366] font-bold text-[13px] py-2 rounded-[14px]" style={{ fontFamily: SF }}>
                          Unbox
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Individual Items ── */}
        <div className="px-5 mt-10">
           <h2 className="text-white font-bold text-[18px] uppercase tracking-wide mb-4" style={{ fontFamily: SFD }}>INDIVIDUAL ITEMS</h2>
           
           <div className="w-full h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center px-3 mb-4">
              <Search className="w-4 h-4 text-[#8e8e93] mr-2 shrink-0" />
              <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-white text-[15px] flex-1 placeholder:text-[#8e8e93]" style={{ fontFamily: SF }} />
           </div>

           <div className="flex flex-col gap-3">
              {INDIVIDUAL_ITEMS.map((item) => (
                 <div key={item.id} className="flex items-center gap-4 bg-transparent py-1">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0 relative" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", backgroundColor: item.color }}>
                       <div className="absolute inset-0 bg-black/20"></div>
                       <Hexagon className="w-6 h-6 text-white fill-white/40 relative z-10" strokeWidth={1} />
                    </div>
                    
                    <div className="flex flex-col justify-center">
                       <span className="text-white font-bold text-[13px] tracking-wide" style={{ fontFamily: SF }}>{item.title}</span>
                       <div className="flex items-center gap-1 mt-1">
                          <img src="/telegram-star-icon.png" alt="Star" className="w-3.5 h-3.5 object-contain" />
                          <span className="text-[#e5e5ea] font-medium text-[13px]" style={{ fontFamily: SF }}>{item.price} STARS</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
