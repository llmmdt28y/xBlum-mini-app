"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Filter, Star, ArrowUpRight, ChevronLeft, Info } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Costo 0 para Pruebas) ──
const MARKET_BOXES = [
  { id: 'secret', name: 'Secret', color: '#eab308', image: '/1000009369.png', isSoldOut: false, price: 0 },
  { id: 'toxic', name: 'Toxic Whisper', color: '#c084fc', image: '/1000009370.png', isSoldOut: false, price: 0 },
  { id: 'eternal', name: 'Eternal Beacon', color: '#a855f7', image: '/1000009371.png', isSoldOut: true, price: 0 },
  { id: 'aureus', name: 'Aureus', color: '#facc15', image: '/1000009361.png', isSoldOut: false, price: 0 }
]

// ── Items con "?" para futura implementación ──
const INSIDE_ITEMS = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  name: "???",
  rarity: "Unknown",
  color: "#3a3a3c",
  drop: "??%"
}))

// ── Animaciones ──
const animationStyles = `
  @keyframes box-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .animate-box-float {
    animation: box-float 3.5s ease-in-out infinite;
  }
  
  /* Animación de Rotación para el Spin */
  @keyframes box-spin-3d {
    0% { transform: rotateY(0deg) scale(1); }
    50% { transform: rotateY(180deg) scale(1.1); filter: brightness(1.5); }
    100% { transform: rotateY(360deg) scale(1); }
  }
  .animate-spin-3d {
    animation: box-spin-3d 0.8s linear infinite;
  }

  @keyframes shake-error {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
  }
  .animate-shake { animation: shake-error 0.4s ease-in-out; }
`;

const LootboxVisual = ({ color, imgSrc, size = "normal", isSpinning = false }: { color: string, imgSrc: string, size?: "normal" | "large", isSpinning?: boolean }) => {
  const containerClass = size === "large" ? "h-[140px]" : "h-[110px]"
  const imgClass = size === "large" ? "w-[110px] h-[110px]" : "w-[85px] h-[85px]"
  
  return (
    <div className={`relative w-full ${containerClass} flex flex-col items-center justify-center mb-1 mt-3`}>
      <div className={`absolute w-[60px] h-[60px] opacity-30 rounded-full z-0`} style={{ backgroundColor: color, filter: 'blur(20px)' }}></div>
      <div className={`relative z-10 ${isSpinning ? 'animate-spin-3d' : 'animate-box-float'}`}>
        <img src={imgSrc} alt="Lootbox" draggable={false} className={`${imgClass} object-contain mix-blend-screen pointer-events-none select-none`} style={{ WebkitTouchCallout: "none" }} />
      </div>
    </div>
  )
}

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myStars = 1500 

  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  // ── Lógica de Apertura ──
  const [openAmount, setOpenAmount] = useState(1) // 1 a 3
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => viewingBoxId ? setViewingBoxId(null) : setCurrentView("home")
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [viewingBoxId])

  const handleOpen = () => {
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 2400) // Simulación de giro
  }

  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)

  // Componente Reutilizable de Saldo (Sincronizado)
  const StarsBalance = () => (
    <div className="bg-[#1c1c1e] rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] h-[34px]">
      <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain" />
      <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
      <button onClick={(e) => { e.stopPropagation(); setIsTopUpOpen(true) }} className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 ml-1">
        <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
      </button>
    </div>
  )

  if (viewingBoxId && activeBoxData) {
    return (
      <div className="flex-1 overflow-y-auto relative animate-in slide-in-from-right-8 fade-in duration-300 bg-[#000000] pb-32">
        <style>{animationStyles}</style>

        {/* Header Detalle */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-14 pb-4 bg-black">
           <button onClick={() => setViewingBoxId(null)} className="flex items-center gap-1 text-white active:opacity-70 transition-opacity">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>back</span>
           </button>
           <StarsBalance />
        </div>

        <div className="flex flex-col px-5 pt-6 items-center">
           <h2 className="text-white font-bold text-[28px] mb-8" style={{ fontFamily: SFD }}>{activeBoxData.name}</h2>

           {/* ── Slots de Apertura (1 a 3) ── */}
           <div className="w-full flex flex-col items-center mb-10 relative">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white mb-4 z-20" />
              
              <div className={`flex items-center justify-center w-full gap-3 transition-all duration-500`}>
                 {Array.from({ length: openAmount }).map((_, i) => (
                    <div key={i} className={`${openAmount > 1 ? 'w-[100px] h-[130px]' : 'w-[140px] h-[160px]'} bg-[#111111] rounded-[24px] flex flex-col items-center justify-center border border-[#1c1c1e] shadow-xl relative transition-all duration-300`}>
                       <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size={openAmount > 1 ? "normal" : "large"} isSpinning={isSpinning} />
                    </div>
                 ))}
              </div>
           </div>

           {/* ── Controles de Apertura ── */}
           <div className="w-full flex flex-col gap-4">
              <div className="flex bg-[#111111] p-1 rounded-2xl border border-[#1c1c1e]">
                 {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => !isSpinning && setOpenAmount(n)} className={`flex-1 py-2 rounded-xl font-bold text-[14px] transition-all ${openAmount === n ? 'bg-[#1c1c1e] text-white' : 'text-[#636366]'}`}>
                       x{n}
                    </button>
                 ))}
              </div>

              <button onClick={handleOpen} disabled={isSpinning} className="w-full bg-[#3b82f6] text-white py-4 rounded-[18px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(59,130,246,0.3)] disabled:opacity-50" style={{ fontFamily: SF }}>
                 {isSpinning ? "Spinning..." : `Open x${openAmount} (Free)`}
              </button>
           </div>

           <div className="w-full flex flex-col mt-12">
              <h3 className="text-white font-bold text-[22px] mb-4" style={{ fontFamily: SFD }}>What's inside</h3>
              <div className="grid grid-cols-3 gap-3">
                 {INSIDE_ITEMS.map((item) => (
                    <div key={item.id} className="bg-[#0a0a0b] rounded-[20px] p-4 flex flex-col items-center border border-[#1c1c1e]">
                       <span className="text-[24px] font-bold text-white/20 mb-2" style={{ fontFamily: SFD }}>?</span>
                       <span className="text-[#8e8e93] font-bold text-[12px]">{item.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 bg-[#000000] pb-32">
        <style>{animationStyles}</style>
        
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-14 pb-4 bg-black">
           <div className="flex items-center gap-2">
              <Store className="w-[22px] h-[22px] text-[#3b82f6]" strokeWidth={2.5} />
              <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
           </div>
           <StarsBalance />
        </div>

        <div className="flex flex-col relative overflow-x-hidden pt-4 px-5">
          <div className="w-full h-[180px] relative flex justify-center items-center overflow-hidden mb-8">
              <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[32px] flex items-center justify-center border border-[#3a3a3c] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                  <span className="text-white/80 font-bold text-7xl drop-shadow-lg" style={{ fontFamily: SFD }}>?</span>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             {MARKET_BOXES.map((box) => (
                <div key={box.id} className="flex flex-col w-full">
                   <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col border border-[#1c1c1e]">
                      <LootboxVisual color={box.color} imgSrc={box.image} />
                      <button onClick={() => setViewingBoxId(box.id)} className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform" style={{ fontFamily: SF }}>Market</button>
                   </div>
                   <div className="mt-3 text-center">
                     <span className="text-white font-bold text-[14px]" style={{ fontFamily: SFD }}>{box.name}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Modal Top UP (Simplificado para el ejemplo) */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsTopUpOpen(false)} />
          <div className="relative w-full bg-[#000000] rounded-t-[28px] px-5 pt-8 pb-10 border-t border-[#1c1c1e] animate-in slide-in-from-bottom duration-300">
             <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>Top UP</h2>
             <button onClick={() => setIsTopUpOpen(false)} className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl font-bold">Close</button>
          </div>
        </div>
      )}
    </>
  )
}
