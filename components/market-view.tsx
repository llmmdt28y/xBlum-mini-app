"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Filter, Star, ArrowUpRight, ChevronLeft, Info, Shield, Cpu, Sparkles } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual ──
const MARKET_BOXES = [
  { id: 'secret', name: 'Secret', color: '#eab308', image: '/1000009369.png', isSoldOut: false, price: 150 },
  { id: 'toxic', name: 'Toxic Whisper', color: '#c084fc', image: '/1000009370.png', isSoldOut: false, price: 300 },
  { id: 'eternal', name: 'Eternal Beacon', color: '#a855f7', image: '/1000009371.png', isSoldOut: true, price: 500 },
  { id: 'aureus', name: 'Aureus', color: '#facc15', image: '/1000009361.png', isSoldOut: false, price: 1000 }
]

// ── Recompensas de Ejemplo (What's Inside) ──
const INSIDE_ITEMS = [
  { id: 1, name: "5,000 Stars", icon: Star, rarity: "Legendary", color: "#eab308", drop: "0.5%" },
  { id: 2, name: "Grok 3 API Trial", icon: Cpu, rarity: "Legendary", color: "#a855f7", drop: "1.2%" },
  { id: 3, name: "VortX VIP Badge", icon: Shield, rarity: "Rare", color: "#3b82f6", drop: "15.0%" },
  { id: 4, name: "100 Stars", icon: Star, rarity: "Rare", color: "#eab308", drop: "25.3%" },
  { id: 5, name: "Dark Theme UI", icon: Sparkles, rarity: "Common", color: "#c084fc", drop: "58.0%" },
]

// ── Paquetes de Estrellas ──
const STAR_PACKAGES = [
  { stars: "100", price: "$1.99", count: 1 },
  { stars: "250", price: "$4.99", count: 2 },
  { stars: "500", price: "$9.99", count: 3 },
  { stars: "1 000", price: "$19.99", count: 4 },
  { stars: "2 500", price: "$49.99", count: 5 },
  { stars: "10 000", price: "$199.99", count: 6 },
]

// ── Animaciones ──
const animationStyles = `
  @keyframes box-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .animate-box-float {
    animation: box-float 3.5s ease-in-out infinite;
  }
  @keyframes shake-error {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
  .animate-shake {
    animation: shake-error 0.4s ease-in-out;
  }
`;

// ── Componente Visual de la Caja ──
const LootboxVisual = ({ color, imgSrc, size = "normal" }: { color: string, imgSrc: string, size?: "normal" | "large" }) => {
  const containerClass = size === "large" ? "h-[140px]" : "h-[110px]"
  const imgClass = size === "large" ? "w-[120px] h-[120px]" : "w-[90px] h-[90px]"
  const glowClass = size === "large" ? "w-[80px] h-[80px] bottom-6" : "w-[60px] h-[60px] bottom-4"

  return (
    <div className={`relative w-full ${containerClass} flex flex-col items-center justify-center mb-1 mt-3`}>
      <div className={`absolute ${glowClass} opacity-30 rounded-full z-0`} style={{ backgroundColor: color, filter: 'blur(20px)' }}></div>
      <div className="relative z-10 animate-box-float">
        <img src={imgSrc} alt="Lootbox" draggable={false} className={`${imgClass} object-contain mix-blend-screen pointer-events-none select-none`} style={{ WebkitTouchCallout: "none" }} />
      </div>
    </div>
  )
}

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myStars = 1500 // Saldo de ejemplo

  // ── Estados ──
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null) // Controla si estamos en la vista de detalle

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
 
    if (viewingBoxId) {
       tg.BackButton.show()
       const handleBoxBack = () => setViewingBoxId(null)
       tg.BackButton.onClick(handleBoxBack)
       return () => tg.BackButton.offClick(handleBoxBack)
    } else {
       tg.BackButton.show()
       const handleMainBack = () => { setCurrentView("home"); tg.BackButton.hide() }
       tg.BackButton.onClick(handleMainBack)
       return () => tg.BackButton.offClick(handleMainBack)
    }
  }, [setCurrentView, viewingBoxId])

  const handleStarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val === '') { setStarInput(''); return }
    const num = parseInt(val, 10)
    if (num > 150000) { setStarInput('150000') } 
    else { setStarInput(num.toString()) }
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""

  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)

  // ── VISTA DE DETALLE DEL LOOTBOX ──
  if (viewingBoxId && activeBoxData) {
    return (
      <div className="flex-1 overflow-y-auto relative animate-in slide-in-from-right-8 fade-in duration-300 bg-[#000000] pb-32">
        <style>{animationStyles}</style>

        {/* Header Detalle */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-14 pb-4 bg-black">
           <button onClick={() => setViewingBoxId(null)} className="flex items-center gap-1.5 text-white active:opacity-70 transition-opacity">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>back</span>
           </button>
           <div className="flex items-center gap-2 bg-[#1c1c1e] rounded-full p-1 pl-3 border border-[#2c2c2e]">
              <img src="/telegram-star-icon.png" alt="Stars" className="w-[16px] h-[16px] object-contain" />
              <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
              <button onClick={() => setIsTopUpOpen(true)} className="w-6 h-6 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 ml-1">
                 <Plus className="w-3.5 h-3.5 text-[#a78bfa]" strokeWidth={3} />
              </button>
           </div>
        </div>

        <div className="flex flex-col px-5 pt-6 items-center">
           <h2 className="text-white font-bold text-[28px] mb-8" style={{ fontFamily: SFD }}>
             {activeBoxData.name}
           </h2>

           {/* ── Carrusel y Flecha ── */}
           <div className="w-full flex flex-col items-center mb-8 relative">
              {/* Triángulo Blanco Apuntando Abajo */}
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white mb-3" />
              
              <div className="flex items-center justify-center w-full gap-4 overflow-hidden px-4">
                 {/* Caja Anterior (Simulada para el carrusel) */}
                 <div className="w-[100px] h-[120px] bg-[#0a0a0b] rounded-[22px] flex items-center justify-center opacity-40 scale-90 border border-[#1c1c1e]">
                    <LootboxVisual color={MARKET_BOXES[0].color} imgSrc={MARKET_BOXES[0].image} />
                 </div>
                 
                 {/* Caja Central Activa */}
                 <div className="w-[140px] h-[160px] bg-[#111111] rounded-[28px] flex flex-col items-center justify-center border border-[#3b82f6]/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
                    <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size="large" />
                    <div className="absolute bottom-3 w-10 h-1 rounded-full bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />
                 </div>

                 {/* Caja Siguiente (Simulada) */}
                 <div className="w-[100px] h-[120px] bg-[#0a0a0b] rounded-[22px] flex items-center justify-center opacity-40 scale-90 border border-[#1c1c1e]">
                    <LootboxVisual color={MARKET_BOXES[1].color} imgSrc={MARKET_BOXES[1].image} />
                 </div>
              </div>
           </div>

           {/* ── Botón de Apertura ── */}
           <button className="w-full bg-[#3b82f6] text-white py-4 rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(59,130,246,0.3)] mb-3" style={{ fontFamily: SF }}>
              Open for {activeBoxData.price} <img src="/telegram-star-icon.png" className="w-[18px] h-[18px]" />
           </button>
           
           {/* Multi-pull opcional */}
           <button className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 transition-opacity mb-10" style={{ fontFamily: SF }}>
              Open 10x for {activeBoxData.price * 10} Stars
           </button>

           {/* ── Sección What's Inside ── */}
           <div className="w-full flex flex-col">
              <h3 className="text-white font-bold text-[22px] mb-4" style={{ fontFamily: SFD }}>What's inside</h3>
              
              <div className="grid grid-cols-3 gap-3">
                 {INSIDE_ITEMS.map((item) => (
                    <div key={item.id} className="bg-[#111111] rounded-[18px] p-3 flex flex-col relative border border-[#1c1c1e]">
                       <Info className="absolute top-2 left-2 w-3.5 h-3.5 text-[#636366]" />
                       
                       <div className="flex-1 flex flex-col items-center justify-center mt-4 mb-2">
                          <item.icon className="w-8 h-8 drop-shadow-lg mb-2" style={{ color: item.color }} />
                          <span className="text-white font-bold text-[13px] text-center leading-tight" style={{ fontFamily: SF }}>{item.name}</span>
                       </div>

                       <div className="w-full flex justify-center mt-auto pt-2 border-t border-[#1c1c1e]">
                          <span className="text-[#8e8e93] font-medium text-[11px]" style={{ fontFamily: SF }}>
                             {item.drop}
                          </span>
                       </div>
                       
                       {/* Indicador de color en la base basado en rareza */}
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[2px] rounded-t-full" style={{ backgroundColor: item.color }} />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    )
  }

  // ── VISTA PRINCIPAL DEL MARKET ──
  return (
    <>
      <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 bg-[#000000] pb-32">
        <style>{animationStyles}</style>
        
        {/* Header Principal */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-14 pb-4 bg-black">
           <div className="flex items-center gap-2">
              <Store className="w-[22px] h-[22px] text-[#3b82f6]" strokeWidth={2.5} />
              <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
           </div>
        </div>

        {/* Caja de Saldo Flotante */}
        <div className="fixed top-[85px] right-5 z-40 bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all">
           <img src="/telegram-star-icon.png" alt="Stars" draggable={false} className="w-[18px] h-[18px] object-contain pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
           <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
           <button onClick={() => setIsTopUpOpen(true)} className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 transition-transform ml-1">
              <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
           </button>
        </div>

        <div className="flex flex-col relative overflow-x-hidden pt-4">
          
          {/* Tarjetas Superpuestas */}
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

          <div className="w-full flex flex-col items-center mt-6">
              <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Presale</h2>
              <div className="flex gap-3 mt-4">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>Play <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>Telegram <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>X <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
              </div>
          </div>

          {/* Sección Lootboxes */}
          <div className="mt-10 px-5">
             <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-[24px] flex items-center gap-2" style={{ fontFamily: SFD }}>
                   Lootboxes <span className="text-[#8e8e93] text-[22px] font-medium">{MARKET_BOXES.length}</span>
                </h3>
             </div>

             <div className="grid grid-cols-3 gap-3">
                {MARKET_BOXES.map((box) => (
                   <div key={box.id} className="flex flex-col w-full">
                      <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col relative border border-[#1c1c1e]">
                         {box.isSoldOut && <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">Sold out</div>}
                         <LootboxVisual color={box.color} imgSrc={box.image} />
                         
                         {/* El botón ahora abre la vista de detalle */}
                         <button onClick={() => setViewingBoxId(box.id)} className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform" style={{ fontFamily: SF }}>
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

          {/* Sección My Inventory */}
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
                         <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">x0</div>
                         <LootboxVisual color={box.color} imgSrc={box.image} />
                         <button disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1" style={{ fontFamily: SF }}>Unbox</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* ── MODAL TOP UP ── */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsTopUpOpen(false)} />
          <div className="relative w-full bg-[#000000] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>Top UP</h2>
            <div className="flex flex-col items-center mb-8">
               <div className={`flex items-center justify-center gap-3 ${isError ? 'animate-shake' : ''}`}>
                 <img src="/telegram-star-icon.png" alt="Star" className="w-[42px] h-[42px] object-contain pointer-events-none select-none drop-shadow-md" />
                 <input type="text" inputMode="numeric" value={displayValue} onChange={handleStarInput} placeholder="0" style={{ fontFamily: SFD, width: displayValue ? `${displayValue.length}ch` : '1.2ch' }} className={`bg-transparent font-bold text-[56px] min-w-[32px] outline-none placeholder:text-[#3a3a3c] caret-[#3b82f6] transition-colors ${isError ? 'text-[#ff3b30]' : 'text-white'}`} />
               </div>
               <span className={`text-[13px] mt-2 font-medium transition-colors ${isError ? 'text-[#ff3b30]' : 'text-[#636366]'}`} style={{ fontFamily: SF }}>Buy between 15 and 150,000 stars</span>
               <button disabled={!isValid} className={`mt-5 w-full max-w-[300px] py-3.5 rounded-[14px] font-bold text-[17px] transition-all duration-300 active:scale-95 ${isValid ? 'bg-[#3b82f6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)]' : 'bg-[#1c1c1e] text-[#636366]'}`} style={{ fontFamily: SF }}>Buy {displayValue ? displayValue : '0'} Stars</button>
            </div>
            <p className="text-[#3b82f6] font-semibold text-[15px] mb-1 px-2" style={{ fontFamily: SF }}>choose package</p>
            <div className="flex flex-col pb-6">
              {STAR_PACKAGES.map((pkg, i) => (
                <button key={i} className="flex items-center justify-between py-3 px-2 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors rounded-lg">
                   <div className="flex items-center gap-4">
                      <div className="relative flex items-center" style={{ width: `${22 + (pkg.count - 1) * 4.5}px`, height: '22px' }}>
                        {Array.from({ length: pkg.count }).map((_, idx) => (
                           <img key={idx} src="/telegram-star-icon.png" className="absolute top-0 h-[22px] w-[22px]" style={{ left: `${idx * 4.5}px`, zIndex: 20 - idx, filter: "drop-shadow(1.5px 0px 0px #000000)" }} alt="star" />
                        ))}
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
    </>
  )
}
