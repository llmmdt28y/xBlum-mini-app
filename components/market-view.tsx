"use client"

import { useApp } from "@/lib/app-context"
import { useEffect } from "react"
import { Store, Plus, Filter, Star, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Nombres Premium e Imágenes Mapeadas) ──
const MARKET_BOXES = [
  { 
    id: 'eternal', 
    name: 'Eternal Beacon', 
    serial: '#12,311', 
    price: 150, 
    date: 'MAY 7, 2026', 
    color: '#a855f7', // Púrpura
    image: '/1000009371.png', 
    isSoldOut: false,
    rarity: 'MYTHIC'
  },
  { 
    id: 'aureus', 
    name: 'Aureus', 
    serial: '#11,351', 
    price: 120, 
    date: 'MAY 7, 2026', 
    color: '#facc15', // Dorado
    image: '/1000009361.png', 
    isSoldOut: false,
    rarity: 'LEGENDARY'
  },
  { 
    id: 'toxic', 
    name: 'Toxic Whisper', 
    serial: '#8531', 
    price: 75, 
    date: 'MAY 7, 2026', 
    color: '#c084fc', // Lila/Blanco
    image: '/1000009370.png', 
    isSoldOut: true,
    rarity: 'EPIC'
  },
  { 
    id: 'secret', 
    name: 'Secret', 
    serial: '#00,001', 
    price: 50, 
    date: 'MAY 7, 2026', 
    color: '#eab308', // Arena/Dorado oscuro
    image: '/1000009369.png', 
    isSoldOut: true,
    rarity: 'RARE'
  }
]

// ── Animaciones CSS ──
const animationStyles = `
  @keyframes box-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .animate-box-float {
    animation: box-float 3.5s ease-in-out infinite;
  }
`;

// ── Componente Visual de la Caja ──
const LootboxVisual = ({ color, imgSrc }: { color: string, imgSrc: string }) => (
  <div className="relative w-full h-[110px] flex flex-col items-center justify-end mt-2 mb-2 group cursor-pointer">
    
    {/* Resplandor trasero */}
    <div 
      className="absolute bottom-[20%] w-[60px] h-[60px] opacity-20 rounded-full z-0 transition-opacity duration-500 group-hover:opacity-40"
      style={{ backgroundColor: color, filter: 'blur(15px)' }}
    ></div>

    {/* Imagen de la Caja protegida y animada */}
    <div className="relative z-10 animate-box-float transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
      <img 
        src={imgSrc} 
        alt="Lootbox" 
        draggable={false}
        className="w-[90px] h-[90px] object-contain pointer-events-none mix-blend-screen select-none"
        style={{ WebkitTouchCallout: "none" }}
      />
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
      <style>{animationStyles}</style>
      
      {/* ── Header Principal ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-16 pb-4 bg-black/90 backdrop-blur-md">
         <div className="flex items-center gap-2.5">
            <h1 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>
               XBLUM <span className="font-normal text-[#e5e5ea]">MARKETPLACE</span>
            </h1>
         </div>
      </div>

      {/* ── Balance Oficial de Stars (Flotante y Movido hacia abajo) ── */}
      <div className="fixed top-[70px] right-5 z-50 bg-[#111111] rounded-[10px] px-3 py-1.5 flex items-center gap-2 border border-[#2c2c2e] shadow-lg backdrop-blur-md">
         <img 
            src="/telegram-star-icon.png" 
            alt="Stars" 
            draggable={false}
            className="w-[16px] h-[16px] object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] pointer-events-none select-none" 
            style={{ WebkitTouchCallout: "none" }}
         />
         <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars} STARS</span>
      </div>

      <div className="flex flex-col relative overflow-x-hidden pt-2">
        
        {/* ── Carrusel "PRE-SALE: COSMETIC PACKS" (De 3 Tarjetas) ── */}
        <div className="w-full flex flex-col items-center mt-2 px-5">
           <h2 className="text-white font-bold text-[20px] mb-4 w-full text-center" style={{ fontFamily: SFD }}>PRE-SALE: COSMETIC PACKS</h2>
           
           <div className="relative w-full h-[180px] bg-[#0a0a0b] rounded-[16px] border border-[#1c1c1e] flex flex-col items-center justify-center overflow-hidden shadow-lg group">
              {/* Fondo Cósmico */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4c1d95]/30 via-[#0a0a0b] to-[#0a0a0b] opacity-80"></div>
              
              {/* Tarjetas Laterales (Solo 2, con opacidad al final para desvanecerse) */}
              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] right-[58%] opacity-40 scale-95 flex items-center justify-center border border-[#1c1c1e] overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent z-10"></div>
              </div>
              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] left-[58%] opacity-40 scale-95 flex items-center justify-center border border-[#1c1c1e] overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
              </div>

              {/* Caja Principal Destacada (Centro) */}
              <div className="relative z-30 w-[120px] h-[120px] flex items-center justify-center animate-box-float drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                 <img 
                    src="/1000009371.png" 
                    alt="Eternal Beacon" 
                    draggable={false}
                    className="w-[120px] h-[120px] object-contain mix-blend-screen pointer-events-none select-none" 
                    style={{ WebkitTouchCallout: "none" }}
                 />
              </div>
              
              <div className="relative z-30 -mt-2 text-center">
                 <p className="text-[11px] font-bold tracking-widest" style={{ fontFamily: SF }}>
                    <span className="text-[#8e8e93]">RARITY: </span> 
                    <span className="text-[#c084fc]">MYTHIC</span>
                 </p>
                 <p className="text-white font-bold text-[15px] mt-1 tracking-wide" style={{ fontFamily: SFD }}>#ETERNAL-BEACON #001</p>
              </div>

              {/* Controles del carrusel */}
              <button className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"><ChevronLeft className="text-white w-6 h-6"/></button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"><ChevronRight className="text-white w-6 h-6"/></button>
           </div>
           
           {/* Botones de Navegación Rápidos */}
           <div className="w-full flex justify-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
              {["VIEW COLLECTION", "TELEGRAM", "FRAGMENT", "WEB"].map((btn) => (
                 <button key={btn} className="shrink-0 px-3.5 py-1.5 rounded-[8px] border border-[#2c2c2e] bg-[#111111] text-[#a1a1aa] font-semibold text-[11px] uppercase tracking-wider hover:bg-[#1c1c1e] hover:text-white transition-colors" style={{ fontFamily: SF }}>
                    {btn}
                 </button>
              ))}
           </div>
        </div>

        {/* ── Sección Lootboxes ── */}
        <div className="mt-10">
           <div className="flex items-center justify-between px-5 mb-5">
              <h3 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>
                 LOOTBOXES
              </h3>
           </div>

           <div className="grid grid-cols-3 gap-[10px] px-5">
              {MARKET_BOXES.map((box) => (
                 <div key={box.id} className="flex flex-col items-center w-full">
                    <div className="w-full bg-[#111111] rounded-[20px] p-2 pb-3 flex flex-col items-center relative transition-transform active:scale-[0.98] border border-[#1c1c1e]">
                       
                       {box.isSoldOut && (
                          <div className="absolute top-2 left-2 bg-[#3a1a1a] text-[#ff4d4d] px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider z-30 border border-[#ff4d4d]/20">
                             Sold out
                          </div>
                       )}

                       <LootboxVisual color={box.color} imgSrc={box.image} />

                       <button className="w-full bg-[#1c1c1e] text-white font-bold text-[12px] py-2 rounded-[12px] hover:bg-[#2c2c2e] transition-colors border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                          Market
                       </button>
                    </div>

                    <div className="mt-3 text-center flex flex-col items-center px-1">
                       <span className="text-white font-bold text-[13px] leading-tight tracking-wide" style={{ fontFamily: SFD }}>{box.name}</span>
                       <span className="text-[#8e8e93] font-medium text-[11px] mt-0.5" style={{ fontFamily: SF }}>{box.serial}</span>
                       
                       <div className="flex items-center gap-1 mt-1.5">
                          <img 
                             src="/telegram-star-icon.png" 
                             alt="Star" 
                             draggable={false}
                             className="w-[12px] h-[12px] object-contain pointer-events-none select-none" 
                             style={{ WebkitTouchCallout: "none" }}
                          />
                          <span className="text-[#e5e5ea] font-bold text-[12px]" style={{ fontFamily: SF }}>{box.price} STARS</span>
                       </div>
                       
                       <span className="text-[#636366] text-[9px] font-bold uppercase tracking-widest mt-1.5">{box.date}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Sección My Inventory ── */}
        <div className="mt-12 pb-10">
           <div className="flex items-center px-5 mb-5">
              <h3 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>
                 MY INVENTORY
              </h3>
           </div>

           <div className="grid grid-cols-3 gap-[10px] px-5">
              {MARKET_BOXES.map((box) => (
                 <div key={`inv-${box.id}`} className="flex flex-col items-center w-full opacity-50">
                    <div className="w-full bg-[#111111] rounded-[20px] p-2 pb-3 flex flex-col items-center relative border border-[#1c1c1e]">
                       
                       <div className="absolute top-2 left-2 bg-[#2c2c2e] text-[#a1a1aa] px-1.5 py-[2px] rounded text-[9px] font-bold tracking-wider z-30">
                          x0
                       </div>

                       <LootboxVisual color={box.color} imgSrc={box.image} />

                       <button disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[12px] py-2 rounded-[12px] border border-[#1c1c1e]" style={{ fontFamily: SF }}>
                          Unbox
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
