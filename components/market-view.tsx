"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Filter, Star, ArrowUpRight } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Nombres Premium e Imágenes Mapeadas) ──
const MARKET_BOXES = [
  { 
    id: 'secret', 
    name: 'Secret', 
    color: '#eab308', 
    image: '/1000009369.png', 
    isSoldOut: false 
  },
  { 
    id: 'toxic', 
    name: 'Toxic Whisper', 
    color: '#c084fc', 
    image: '/1000009370.png', 
    isSoldOut: false 
  },
  { 
    id: 'eternal', 
    name: 'Eternal Beacon', 
    color: '#a855f7', 
    image: '/1000009371.png', 
    isSoldOut: true 
  },
  { 
    id: 'aureus', 
    name: 'Aureus', 
    color: '#facc15', 
    image: '/1000009361.png', 
    isSoldOut: false 
  }
]

// ── Paquetes de Estrellas (Basado en la imagen de referencia) ──
const STAR_PACKAGES = [
  { stars: "100", price: "$2.49", stacked: false },
  { stars: "250", price: "$5.89", stacked: false },
  { stars: "500", price: "$11.59", stacked: false },
  { stars: "1 000", price: "$22.99", stacked: true },
  { stars: "2 500", price: "$56.99", stacked: true },
  { stars: "10 000", price: "$226.99", stacked: true },
]

// ── Animación Flotante ──
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
  <div className="relative w-full h-[110px] flex flex-col items-center justify-center mb-1 mt-3">
    <div 
      className="absolute bottom-4 w-[60px] h-[60px] opacity-30 rounded-full z-0"
      style={{ backgroundColor: color, filter: 'blur(20px)' }}
    ></div>
    <div className="relative z-10 animate-box-float">
      <img 
        src={imgSrc} 
        alt="Lootbox" 
        draggable={false}
        className="w-[90px] h-[90px] object-contain mix-blend-screen pointer-events-none select-none"
        style={{ WebkitTouchCallout: "none" }}
      />
    </div>
  </div>
)

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myStars = 0 

  // ── Estados del Panel Top UP ──
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")

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

  // ── Manejador del Input de Estrellas ──
  const handleStarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Solo números
    if (val === '') {
      setStarInput('')
      return
    }
    const num = parseInt(val, 10)
    // Limita a 150,000 máximo como solicitaste
    if (num > 150000) {
      setStarInput('150000')
    } else {
      setStarInput(num.toString())
    }
  }

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 bg-[#000000] pb-32">
      <style>{animationStyles}</style>
      
      {/* ── Header Principal ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-14 pb-4 bg-black">
         <div className="flex items-center gap-2">
            <Store className="w-[22px] h-[22px] text-[#3b82f6]" strokeWidth={2.5} />
            <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>
               xBlum Market
            </h1>
         </div>
      </div>

      {/* ── Caja de Saldo Flotante ── */}
      <div className="fixed top-[85px] right-5 z-40 bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all">
         <img 
            src="/telegram-star-icon.png" 
            alt="Stars" 
            draggable={false}
            className="w-[18px] h-[18px] object-contain pointer-events-none select-none" 
            style={{ WebkitTouchCallout: "none" }}
         />
         <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars}</span>
         <button 
            onClick={() => setIsTopUpOpen(true)}
            className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 transition-transform ml-1"
         >
            <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
         </button>
      </div>

      <div className="flex flex-col relative overflow-x-hidden pt-4">
        
        {/* ── 5 Tarjetas Superpuestas Sincronizadas ── */}
        <div className="w-full h-[180px] relative flex justify-center items-center overflow-hidden">
            <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] -translate-x-[130px] rotate-[-15deg] flex items-center justify-center border border-[#1c1c1e] shadow-lg opacity-40">
                <span className="text-white/30 font-bold text-5xl" style={{ fontFamily: SFD }}>?</span>
            </div>
            <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] translate-x-[130px] rotate-[15deg] flex items-center justify-center border border-[#1c1c1e] shadow-lg opacity-40">
                <span className="text-white/30 font-bold text-5xl" style={{ fontFamily: SFD }}>?</span>
            </div>
            <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] -translate-x-[70px] rotate-[-8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                <span className="text-white/50 font-bold text-6xl drop-shadow-md" style={{ fontFamily: SFD }}>?</span>
            </div>
            <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] translate-x-[70px] rotate-[8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                <span className="text-white/50 font-bold text-6xl drop-shadow-md" style={{ fontFamily: SFD }}>?</span>
            </div>
            <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[32px] flex items-center justify-center border border-[#3a3a3c] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                <span className="text-white/80 font-bold text-7xl drop-shadow-lg" style={{ fontFamily: SFD }}>?</span>
            </div>
        </div>

        {/* ── Título y Botones Links ── */}
        <div className="w-full flex flex-col items-center mt-6">
            <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Presale</h2>
            <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>
                    Play <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>
                    Telegram <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>
                    X <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
            </div>
        </div>

        {/* ── Sección Lootboxes ── */}
        <div className="mt-10 px-5">
           <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-[24px] flex items-center gap-2" style={{ fontFamily: SFD }}>
                 Lootboxes <span className="text-[#8e8e93] text-[22px] font-medium">{MARKET_BOXES.length}</span>
              </h3>
              <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-[14px] bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                    <Filter className="w-[18px] h-[18px] text-[#3b82f6]" strokeWidth={2.5} />
                 </button>
                 <button className="w-10 h-10 rounded-[14px] bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                    <Star className="w-[18px] h-[18px] text-[#8e8e93]" strokeWidth={2.5} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3">
              {MARKET_BOXES.map((box) => (
                 <div key={box.id} className="flex flex-col w-full">
                    <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col relative border border-[#1c1c1e]">
                       {box.isSoldOut && (
                          <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">
                             Sold out
                          </div>
                       )}
                       <LootboxVisual color={box.color} imgSrc={box.image} />
                       <button className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform" style={{ fontFamily: SF }}>
                          Market
                       </button>
                    </div>
                    <div className="mt-3 text-center flex flex-col items-center">
                      <span className="text-white font-bold text-[14px] leading-tight" style={{ fontFamily: SFD }}>{box.name}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Sección My Inventory ── */}
        <div className="mt-12 pb-10 px-5">
           <div className="flex items-center mb-5">
              <h3 className="text-white font-bold text-[24px] flex items-center gap-2" style={{ fontFamily: SFD }}>
                 My Inventory <span className="text-[#8e8e93] text-[22px] font-medium">0</span>
              </h3>
           </div>
           <div className="grid grid-cols-3 gap-3">
              {MARKET_BOXES.map((box) => (
                 <div key={`inv-${box.id}`} className="flex flex-col w-full">
                    <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col relative border border-[#1c1c1e] opacity-60">
                       <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">
                          x0
                       </div>
                       <LootboxVisual color={box.color} imgSrc={box.image} />
                       <button disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1" style={{ fontFamily: SF }}>
                          Unbox
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* ── Modal Top UP (Bottom Sheet) ── */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Overlay oscuro */}
          <div 
            className="absolute inset-0 bg-black/70 animate-in fade-in duration-300"
            onClick={() => setIsTopUpOpen(false)}
          />
          
          {/* Contenedor del Panel (Permite scroll y se acomoda al teclado nativamente) */}
          <div className="relative w-full bg-[#000000] rounded-t-[28px] px-5 pt-4 pb-[env(safe-area-inset-bottom,20px)] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Indicador de arrastre (Handle) */}
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            
            {/* Título */}
            <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>
              Top UP
            </h2>
            
            {/* Input Personalizado */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <img 
                 src="/telegram-star-icon.png" 
                 alt="Star" 
                 className="w-10 h-10 object-contain pointer-events-none select-none"
              />
              <input 
                 type="text"
                 inputMode="numeric"
                 value={starInput}
                 onChange={handleStarInput}
                 placeholder="0"
                 className="bg-transparent text-white font-bold text-[56px] w-[200px] text-center outline-none placeholder:text-[#3a3a3c] caret-blue-500"
                 style={{ fontFamily: SFD }}
              />
            </div>

            {/* Subtítulo Choose Package */}
            <p className="text-[#3b82f6] font-semibold text-[15px] mb-2 px-2" style={{ fontFamily: SF }}>
              choose package
            </p>

            {/* Lista de Paquetes */}
            <div className="flex flex-col">
              {STAR_PACKAGES.map((pkg, i) => (
                <button 
                  key={i} 
                  className="flex items-center justify-between py-[18px] px-2 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors rounded-lg"
                >
                   <div className="flex items-center gap-4">
                      {/* Lógica para mostrar 1 o 3 estrellas apiladas según la imagen */}
                      <div className="relative flex items-center justify-center w-8 h-8">
                        {pkg.stacked ? (
                          <>
                            <img src="/telegram-star-icon.png" className="absolute left-0 w-[22px] h-[22px] z-10 drop-shadow-md" />
                            <img src="/telegram-star-icon.png" className="absolute left-[6px] w-[22px] h-[22px] z-20 drop-shadow-md" />
                            <img src="/telegram-star-icon.png" className="absolute left-[12px] w-[22px] h-[22px] z-30 drop-shadow-md" />
                          </>
                        ) : (
                          <img src="/telegram-star-icon.png" className="w-[22px] h-[22px]" />
                        )}
                      </div>
                      <span className="text-white font-bold text-[17px]" style={{ fontFamily: SF }}>{pkg.stars} stars</span>
                   </div>
                   <span className="text-[#8e8e93] font-medium text-[16px]" style={{ fontFamily: SF }}>{pkg.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
