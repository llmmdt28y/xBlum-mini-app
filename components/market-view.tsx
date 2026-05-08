"use client"

import { useApp } from "@/lib/app-context"
import { useEffect } from "react"
import { ChevronLeft, ChevronRight, Search, Hexagon } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual del Market ────────────────────────────────────
const PACKS_DB = [
  { 
    id: 'iron', 
    boxName: 'IRON BOX', 
    packName: 'PIXEL PACK', 
    serial: '#8531', 
    price: 50, 
    date: 'MAY 7, 2026', 
    color: '#94a3b8', // Gris azulado (Common)
    glow: 'rgba(148, 163, 184, 0.4)' 
  },
  { 
    id: 'genesis', 
    boxName: 'GENESIS BOX', 
    packName: 'MYTHIC PACK', 
    serial: '#12,311', 
    price: 150, 
    date: 'MAY 7, 2026', 
    color: '#a855f7', // Púrpura (Mythic)
    glow: 'rgba(168, 85, 247, 0.4)' 
  },
  { 
    id: 'meme', 
    boxName: 'MEME BOX', 
    packName: 'EPIC PACK', 
    serial: '#11,351', 
    price: 75, 
    date: 'MAY 7, 2026', 
    color: '#eab308', // Dorado (Epic)
    glow: 'rgba(234, 179, 8, 0.4)' 
  }
]

const INDIVIDUAL_ITEMS = [
  { id: 1, title: 'MYTHIC PIXEL HEART #00,001', price: 150, color: '#a855f7' },
  { id: 2, title: 'EPIC NAME ICON #00,244', price: 75, color: '#eab308' },
  { id: 3, title: 'RARE COSMETIC PACK #12,311', price: 50, color: '#3b82f6' },
  { id: 4, title: 'COMMON REWARD #11,351', price: 25, color: '#94a3b8' }
]

// ── Gráfico de Caja en CSS para los Packs ──
const BoxGraphic = ({ color, glow }: { color: string, glow: string }) => (
  <div className="relative w-[60px] h-[60px] flex items-center justify-center my-3">
    <div className="absolute inset-0 blur-md opacity-40 rounded-full" style={{ backgroundColor: glow }}></div>
    <div className="relative w-12 h-12 bg-gradient-to-br from-white/20 to-black/80 rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
      <div className="w-6 h-6 rounded-md flex items-center justify-center shadow-inner" style={{ backgroundColor: color }}>
         <Hexagon className="w-3.5 h-3.5 text-white fill-white opacity-80" />
      </div>
    </div>
  </div>
)

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myStars = 150 // Simulación del saldo

  // Configuración del botón Back de Telegram
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
      
      {/* ── Header Principal (Bajado con pt-16 para no chocar con la UI nativa) ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 pt-16 pb-4 bg-black/90 backdrop-blur-md">
         <h1 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
            XBLUM <span className="font-normal text-[#e5e5ea]">MARKETPLACE</span>
         </h1>
         {/* Balance con el ícono oficial en src */}
         <div className="bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-[0_0_10px_rgba(124,58,237,0.4)]">
            <img src="/telegram-star-icon.png" alt="Star" className="w-4 h-4 object-contain" />
            <span className="text-white font-bold text-[13px] tracking-wide" style={{ fontFamily: SF }}>{myStars} STARS</span>
         </div>
      </div>

      <div className="flex flex-col relative overflow-x-hidden">
        
        {/* ── Carrusel "PRE-SALE" ── */}
        <div className="w-full flex flex-col items-center mt-2">
           <h2 className="text-white font-bold text-[19px] mb-4" style={{ fontFamily: SFD }}>PRE-SALE: COSMETIC PACKS</h2>
           
           <div className="relative w-[calc(100%-40px)] h-[180px] bg-[#0a0a0b] rounded-[16px] border border-[#2c2c2e] flex flex-col items-center justify-center overflow-hidden mx-5 shadow-lg">
              {/* Resplandor Cósmico de Fondo */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4c1d95]/40 via-transparent to-transparent opacity-80"></div>
              
              {/* Gráfico Mythic Central */}
              <div className="relative z-10 w-20 h-20 bg-gradient-to-b from-[#c084fc] to-[#7e22ce] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-white/20" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                 <Hexagon className="w-10 h-10 text-white fill-white/20" strokeWidth={1} />
              </div>
              
              <div className="relative z-10 mt-5 text-center">
                 <p className="text-[11px] font-bold tracking-widest" style={{ fontFamily: SF }}>
                    <span className="text-[#8e8e93]">RARITY: </span> 
                    <span className="text-[#c084fc]">MYTHIC</span>
                 </p>
                 <p className="text-white font-bold text-[15px] mt-1 tracking-wide" style={{ fontFamily: SFD }}>#COSMIC-PACK #001</p>
              </div>

              {/* Controles del carrusel */}
              <button className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"><ChevronLeft className="text-white w-6 h-6"/></button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"><ChevronRight className="text-white w-6 h-6"/></button>
           </div>
           
           {/* Botones de Navegación Horizontales */}
           <div className="w-full flex gap-2 px-5 mt-4 overflow-x-auto scrollbar-hide">
              {["VIEW COLLECTION", "TELEGRAM", "FRAGMENT", "WEB"].map((btn) => (
                 <button key={btn} className="shrink-0 px-3 py-1.5 rounded-[8px] border border-[#2c2c2e] bg-[#111111] text-[#e5e5ea] font-semibold text-[11px] uppercase tracking-wider hover:bg-[#1c1c1e] transition-colors" style={{ fontFamily: SF }}>
                    {btn}
                 </button>
              ))}
           </div>
        </div>

        {/* ── Cuadrícula de Packs (Lootboxes) ── */}
        <div className="grid grid-cols-3 gap-2 px-5 mt-6">
           {PACKS_DB.map((pack) => (
              <div key={pack.id} className="bg-[#111111] rounded-[16px] border border-[#2c2c2e] p-3 flex flex-col items-center relative transition-transform active:scale-95 text-center">
                 <span className="text-white font-bold text-[12px] uppercase tracking-wide" style={{ fontFamily: SF }}>{pack.boxName}</span>
                 
                 <BoxGraphic color={pack.color} glow={pack.glow} />
                 
                 <span className="text-white font-bold text-[11px] mt-1" style={{ fontFamily: SF }}>{pack.packName}</span>
                 <span className="text-[#8e8e93] font-medium text-[11px]" style={{ fontFamily: SF }}>{pack.serial}</span>
                 
                 <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span className="text-white font-bold text-[12px]" style={{ fontFamily: SF }}>{pack.price} STARS</span>
                 </div>
                 
                 <span className="text-[#636366] text-[9px] uppercase tracking-widest mt-1.5 font-bold" style={{ fontFamily: SF }}>{pack.date}</span>
              </div>
           ))}
        </div>

        {/* ── Individual Items (Lista con Buscador) ── */}
        <div className="px-5 mt-8">
           <h2 className="text-white font-bold text-[18px] uppercase tracking-wide mb-4" style={{ fontFamily: SFD }}>INDIVIDUAL ITEMS</h2>
           
           {/* Buscador Gris */}
           <div className="w-full h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center px-3 mb-4">
              <Search className="w-4 h-4 text-[#8e8e93] mr-2 shrink-0" />
              <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-white text-[15px] flex-1 placeholder:text-[#8e8e93]" style={{ fontFamily: SF }} />
           </div>

           {/* Lista de Items */}
           <div className="flex flex-col gap-3">
              {INDIVIDUAL_ITEMS.map((item) => (
                 <div key={item.id} className="flex items-center gap-4 bg-transparent py-1">
                    {/* Icono de Rareza (Hexágono Coloreado) */}
                    <div className="w-12 h-12 flex items-center justify-center shrink-0 relative" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", backgroundColor: item.color }}>
                       <div className="absolute inset-0 bg-black/20"></div>
                       <Hexagon className="w-6 h-6 text-white fill-white/40 relative z-10" strokeWidth={1} />
                    </div>
                    
                    {/* Detalles del Ítem */}
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
