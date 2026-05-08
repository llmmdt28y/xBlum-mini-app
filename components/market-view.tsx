"use client"

import { useApp } from "@/lib/app-context"
import { useEffect } from "react"
import { Store, Plus, Filter, Star, ArrowUpRight, Hexagon } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// Base de Datos Visual adaptada al diseño de las cajas
const MARKET_BOXES = [
  { id: 'common', name: 'Iron Box', limit: '0 / 5000', color: '#4ade80', isSoldOut: true }, // Verde neón
  { id: 'epic', name: 'Meme Box', limit: '0 / 4000', color: '#facc15', isSoldOut: true },   // Amarillo
  { id: 'mythic', name: 'Genesis Box', limit: '0 / 6000', color: '#c084fc', isSoldOut: true } // Púrpura
]

// Componente para renderizar la Caja 3D con luz y holograma flotante
const Box3DGraphic = ({ color }: { color: string }) => (
  <div className="relative w-full h-[85px] flex flex-col items-center justify-end mt-2 mb-3">
    {/* Haz de luz proyectado hacia arriba */}
    <div 
      className="absolute bottom-[20px] w-12 h-16 blur-[6px] opacity-40 z-0"
      style={{ 
        background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' 
      }}
    ></div>
    
    {/* Ítem Flotante (Animación de rebote suave) */}
    <div className="absolute top-0 animate-[bounce_3s_ease-in-out_infinite] z-10">
      <div className="w-8 h-8 flex items-center justify-center opacity-90" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
         <Hexagon className="w-full h-full" style={{ color: color, fill: `${color}40` }} strokeWidth={1.5} />
      </div>
    </div>
    
    {/* Base física de la caja negra */}
    <div className="w-[52px] h-[34px] bg-[#161618] rounded-lg border-t-[3px] border-t-[#2c2c2e] relative z-20 flex items-center justify-center shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
      {/* Cerradura brillante */}
      <div className="w-[14px] h-[14px] bg-[#0a0a0b] rounded-[4px] flex items-center justify-center border border-[#111]">
        <div className="w-[4px] h-[4px] rounded-[1px]" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}></div>
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
      
      {/* ── Header (pt-16 para bajarlo de la UI nativa) ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-5 pt-16 pb-4 bg-black/90 backdrop-blur-md">
         <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
               <Store className="w-4 h-4 text-blue-500" />
            </div>
            <h1 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
         </div>

         {/* Botón de Balance Oficial */}
         <div className="bg-[#1c1c1e] rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e]">
            <img src="/telegram-star-icon.png" alt="Stars" className="w-[14px] h-[14px] object-contain" />
            <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars}</span>
            <button className="w-[22px] h-[22px] rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95">
               <Plus className="w-3.5 h-3.5 text-white/80" strokeWidth={3} />
            </button>
         </div>
      </div>

      <div className="flex flex-col relative overflow-x-hidden pt-2">
        
        {/* ── Carrusel Superpuesto (Exactamente 5 cartas visibles) ── */}
        <div className="w-full flex flex-col items-center mt-4 overflow-visible">
           <div className="relative w-full h-[150px] flex items-center justify-center">
              
              {/* Cartas más lejanas (Z-10) */}
              <div className="absolute z-10 w-[90px] h-[90px] bg-[#0a0a0b] rounded-2xl right-[78%] opacity-20 scale-90 flex items-center justify-center border border-white/5">
                 <Hexagon className="w-8 h-8 text-white/30" />
              </div>
              <div className="absolute z-10 w-[90px] h-[90px] bg-[#0a0a0b] rounded-2xl left-[78%] opacity-20 scale-90 flex items-center justify-center border border-white/5">
                 <Hexagon className="w-8 h-8 text-white/30" />
              </div>

              {/* Cartas intermedias (Z-20) */}
              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] right-[58%] opacity-60 scale-95 flex items-center justify-center border border-[#1c1c1e]">
                 <Hexagon className="w-10 h-10 text-white/50" />
              </div>
              <div className="absolute z-20 w-[115px] h-[115px] bg-[#0f0f10] rounded-[20px] left-[58%] opacity-60 scale-95 flex items-center justify-center border border-[#1c1c1e]">
                 <Hexagon className="w-10 h-10 text-[#facc15]/50 fill-[#facc15]/10" />
              </div>

              {/* Carta Central Principal (Z-30) */}
              <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[28px] border border-[#2c2c2e] shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent"></div>
                 <div className="w-[70px] h-[70px] bg-[#1a1a1e] rounded-2xl flex items-center justify-center border border-[#2c2c2e] z-10 shadow-lg">
                    <img src="/robot-achievement.png" className="w-[120%] h-[120%] object-cover pointer-events-none" />
                 </div>
              </div>

           </div>
           
           <h2 className="text-white font-bold text-[22px] mt-6" style={{ fontFamily: SFD }}>xBlum Presale</h2>
           
           {/* Botones de Enlace (Links) */}
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
           {/* Header Lootboxes */}
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

           {/* Grid de Cajas 3D */}
           <div className="grid grid-cols-3 gap-[10px] px-5">
              {MARKET_BOXES.map((box) => (
                 <div key={box.id} className="flex flex-col items-center w-full group cursor-pointer">
                    <div className="w-full bg-[#141415] rounded-[24px] p-2.5 flex flex-col items-center relative transition-transform active:scale-[0.98]">
                       
                       {/* Etiqueta Sold Out (Arriba Izquierda) */}
                       {box.isSoldOut && (
                          <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider z-30">
                             Sold out
                          </div>
                       )}

                       {/* Gráfico 3D de la Caja */}
                       <Box3DGraphic color={box.color} />

                       {/* Botón Market Interno */}
                       <button className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 hover:bg-[#3a3a3c] transition-colors" style={{ fontFamily: SF }}>
                          Market
                       </button>
                    </div>

                    {/* Textos Externos (Bajo el recuadro) */}
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
                    <div className="w-full bg-[#141415] rounded-[24px] p-2.5 flex flex-col items-center relative">
                       
                       {/* Etiqueta Cantidad Gris (Arriba Izquierda) */}
                       <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-1.5 py-[2px] rounded text-[9px] font-bold tracking-wider z-30">
                          x0
                       </div>

                       {/* Gráfico 3D de la Caja */}
                       <Box3DGraphic color={box.color} />

                       {/* Botón Unbox Deshabilitado */}
                       <button disabled className="w-full bg-[#1c1c1e] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1" style={{ fontFamily: SF }}>
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
