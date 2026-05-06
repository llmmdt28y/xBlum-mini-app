"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Icono Pixelado (SVG Dinámico 7x7) ──
const PixelDiamond = ({ variant, className }: { variant: 'pink' | 'cyan', className?: string }) => {
  // Colores exactos extraídos de la imagen
  const colors = variant === 'pink'
    ? { d: '#4a3e44', p: '#e8a8c1', w: '#ffffff', glow: 'rgba(232, 168, 193, 0.4)' }
    : { d: '#3e484a', p: '#82c3cd', w: '#ffffff', glow: 'rgba(130, 195, 205, 0.4)' };

  return (
    <svg viewBox="0 0 7 7" className={className} style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}>
       {/* Fila 0 */}
       <rect x="3" y="0" width="1" height="1" fill={colors.d} />
       {/* Fila 1 */}
       <rect x="2" y="1" width="1" height="1" fill={colors.d} />
       <rect x="3" y="1" width="1" height="1" fill={colors.p} />
       <rect x="4" y="1" width="1" height="1" fill={colors.d} />
       {/* Fila 2 */}
       <rect x="1" y="2" width="1" height="1" fill={colors.d} />
       <rect x="2" y="2" width="1" height="1" fill={colors.p} />
       <rect x="3" y="2" width="1" height="1" fill={colors.w} />
       <rect x="4" y="2" width="1" height="1" fill={colors.p} />
       <rect x="5" y="2" width="1" height="1" fill={colors.d} />
       {/* Fila 3 (Centro) */}
       <rect x="0" y="3" width="1" height="1" fill={colors.d} />
       <rect x="1" y="3" width="1" height="1" fill={colors.p} />
       <rect x="2" y="3" width="1" height="1" fill={colors.w} />
       <rect x="3" y="3" width="1" height="1" fill={colors.w} />
       <rect x="4" y="3" width="1" height="1" fill={colors.w} />
       <rect x="5" y="3" width="1" height="1" fill={colors.p} />
       <rect x="6" y="3" width="1" height="1" fill={colors.d} />
       {/* Fila 4 */}
       <rect x="1" y="4" width="1" height="1" fill={colors.d} />
       <rect x="2" y="4" width="1" height="1" fill={colors.p} />
       <rect x="3" y="4" width="1" height="1" fill={colors.w} />
       <rect x="4" y="4" width="1" height="1" fill={colors.p} />
       <rect x="5" y="4" width="1" height="1" fill={colors.d} />
       {/* Fila 5 */}
       <rect x="2" y="5" width="1" height="1" fill={colors.d} />
       <rect x="3" y="5" width="1" height="1" fill={colors.p} />
       <rect x="4" y="5" width="1" height="1" fill={colors.d} />
       {/* Fila 6 */}
       <rect x="3" y="6" width="1" height="1" fill={colors.d} />
    </svg>
  )
}

export function LevelsView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { setCurrentView } = useApp() as any;

  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden font-sans text-white pb-20 select-none">
      
      {/* ── Fondo de Estrellas (Stardust Effect) ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle at 85% 40%, rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle at 45% 70%, rgba(255,255,255,0.12) 1px, transparent 1px),
          radial-gradient(circle at 25% 85%, rgba(255,255,255,0.15) 1.5px, transparent 1.5px),
          radial-gradient(circle at 75% 10%, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)
        `,
        backgroundSize: `120px 120px`,
      }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[52px] pb-4">
         <button 
            onClick={() => setCurrentView('home')} 
            className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform"
         >
            <ChevronLeft size={22} strokeWidth={2.5} className="text-white pr-0.5" />
         </button>
         <span className="text-[16px] font-bold text-white absolute left-1/2 -translate-x-1/2" style={{ fontFamily: SFD }}>
            Level 3
         </span>
      </div>

      {/* ── Hero Section ── */}
      <div className="relative z-10 flex flex-col items-center mt-12 mb-16">
         <div className="relative mb-7 flex justify-center items-center">
            {/* Resplandor trasero */}
            <div className="absolute w-[60px] h-[60px] bg-[#e8a8c1] blur-[32px] opacity-30 rounded-full" />
            <PixelDiamond variant="pink" className="w-[90px] h-[90px] relative z-10" />
         </div>
         <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-3" style={{ fontFamily: SFD }}>
            Level 3
         </h1>
         <p className="text-[12px] font-bold text-[#8e8e93] tracking-[0.18em] uppercase" style={{ fontFamily: SF }}>
            Advanced
         </p>
      </div>

      {/* ── Tarjetas y Línea de Tiempo ── */}
      <div className="relative z-10 px-5 w-full flex flex-col gap-[28px]">

         {/* ── Level 3 Card (Current) ── */}
         <div className="bg-[#141415] rounded-[22px] p-5 w-full">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2.5">
                  <PixelDiamond variant="pink" className="w-[18px] h-[18px]" />
                  <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level 3</span>
               </div>
               <span className="text-[13px] font-bold text-[#d1d1d6]" style={{ fontFamily: SF }}>55/450XP</span>
            </div>
            
            {/* Barra de Progreso a Cuadros */}
            <div className="flex items-center justify-between w-full mb-4 gap-[3px]">
               {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={`h-[5px] flex-1 max-w-[8px] rounded-[1px] ${i < 4 ? 'bg-[#ffffff]' : 'bg-[#3a3a3c]'}`} />
               ))}
            </div>
            
            <p className="text-[13px] text-[#8e8e93] leading-[1.4]" style={{ fontFamily: SF }}>
              You are proficient in using various AI applications effectively.
            </p>
         </div>

         {/* ── Separador Horizontal Punteado ── */}
         <div className="w-full border-t border-dashed border-[#2c2c2e]" />

         {/* ── Level 1 Card (Timeline) ── */}
         <div className="flex w-full">
            
            {/* Timeline Vertical Track */}
            <div className="w-[28px] flex-shrink-0 flex justify-center relative">
               {/* Línea vertical sólida */}
               <div className="absolute top-[32px] bottom-[-40px] w-[2px] bg-[#2c2c2e]" />
               {/* Punto blanco brillante */}
               <div className="absolute top-[32px] w-[7px] h-[7px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] z-10" />
            </div>

            {/* Level 1 Content Card */}
            <div className="flex-1 bg-[#141415] rounded-[22px] p-5 mb-6">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                     <PixelDiamond variant="cyan" className="w-[18px] h-[18px]" />
                     <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level 1</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#d1d1d6]" style={{ fontFamily: SF }}>150/150XP</span>
               </div>
               
               {/* Barra de Progreso a Cuadros (Completa) */}
               <div className="flex items-center justify-between w-full mb-4 gap-[3px]">
                  {Array.from({ length: 24 }).map((_, i) => (
                     <div key={i} className="h-[5px] flex-1 max-w-[8px] rounded-[1px] bg-[#ffffff]" />
                  ))}
               </div>
               
               <p className="text-[13px] text-[#8e8e93] leading-[1.4]" style={{ fontFamily: SF }}>
                 You understand the basics of AI but is not used to many tools yet
               </p>
            </div>
         </div>

      </div>
    </div>
  )
}
