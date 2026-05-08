"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Star, ArrowUpRight, ChevronLeft, Info, Shield, Cpu, Sparkles } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual ──
const MARKET_BOXES = [
  { id: 'secret', name: 'Secret', color: '#eab308', image: '/1000009369.png', isSoldOut: false, price: 150 },
  { id: 'toxic', name: 'Toxic Whisper', color: '#c084fc', image: '/1000009370.png', isSoldOut: false, price: 300 },
  { id: 'eternal', name: 'Eternal Beacon', color: '#a855f7', image: '/1000009371.png', isSoldOut: true, price: 500 },
  { id: 'aureus', name: 'Aureus', color: '#facc15', image: '/1000009361.png', isSoldOut: false, price: 1000 }
]

const INSIDE_ITEMS = [
  { id: 1, name: "5,000 Stars", icon: Star, rarity: "Legendary", color: "#eab308", drop: "0.5%" },
  { id: 2, name: "Grok 3 API Trial", icon: Cpu, rarity: "Legendary", color: "#a855f7", drop: "1.2%" },
  { id: 3, name: "VortX VIP Badge", icon: Shield, rarity: "Rare", color: "#3b82f6", drop: "15.0%" },
  { id: 4, name: "100 Stars", icon: Star, rarity: "Rare", color: "#eab308", drop: "25.3%" },
  { id: 5, name: "Dark Theme UI", icon: Sparkles, rarity: "Common", color: "#c084fc", drop: "58.0%" },
]

const STAR_PACKAGES = [
  { stars: "100", price: "$1.99", count: 1 },
  { stars: "250", price: "$4.99", count: 2 },
  { stars: "500", price: "$9.99", count: 3 },
  { stars: "1 000", price: "$19.99", count: 4 },
  { stars: "2 500", price: "$49.99", count: 5 },
  { stars: "10 000", price: "$199.99", count: 6 },
]

const animationStyles = `
  @keyframes box-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .animate-box-float { animation: box-float 3.5s ease-in-out infinite; }
  @keyframes shake-error { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
  .animate-shake { animation: shake-error 0.4s ease-in-out; }
`;

const LootboxVisual = ({ color, imgSrc, size = "normal" }: { color: string, imgSrc: string, size?: "normal" | "large" }) => {
  const containerClass = size === "large" ? "h-[120px]" : "h-[90px]"
  const imgClass = size === "large" ? "w-[100px] h-[100px]" : "w-[75px] h-[75px]"
  return (
    <div className={`relative w-full ${containerClass} flex flex-col items-center justify-center`}>
      <div className="absolute w-[60px] h-[60px] opacity-30 rounded-full z-0" style={{ backgroundColor: color, filter: 'blur(15px)' }}></div>
      <div className="relative z-10 animate-box-float">
        <img src={imgSrc} alt="Lootbox" className={`${imgClass} object-contain mix-blend-screen pointer-events-none select-none`} />
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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    if (viewingBoxId) {
       tg.BackButton.show(); const handleBack = () => setViewingBoxId(null)
       tg.BackButton.onClick(handleBack); return () => tg.BackButton.offClick(handleBack)
    } else {
       tg.BackButton.show(); const handleBack = () => { setCurrentView("home"); tg.BackButton.hide() }
       tg.BackButton.onClick(handleBack); return () => tg.BackButton.offClick(handleBack)
    }
  }, [setCurrentView, viewingBoxId])

  const handleStarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val === '') { setStarInput(''); return }
    const num = parseInt(val, 10)
    setStarInput(num > 150000 ? '150000' : num.toString())
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
      <style>{animationStyles}</style>

      {/* ── UNIFICADO: CONTENEDOR DE SALDO (Mismo nivel y tamaño siempre) ── */}
      <div className="fixed top-[85px] right-5 z-[60] bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all">
         <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain" />
         <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
         <button onClick={() => setIsTopUpOpen(true)} className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 ml-1 transition-transform">
            <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {viewingBoxId && activeBoxData ? (
          /* ── VISTA DETALLE ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="sticky top-0 z-40 flex items-center px-5 pt-14 pb-4 bg-black">
               <button onClick={() => setViewingBoxId(null)} className="flex items-center gap-1.5 text-white active:opacity-70">
                  <ChevronLeft className="w-6 h-6" />
                  <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>back</span>
               </button>
            </div>

            <div className="flex flex-col px-5 pt-6 items-center">
               <h2 className="text-white font-bold text-[28px] mb-8" style={{ fontFamily: SFD }}>{activeBoxData.name}</h2>

               {/* ── RULETA: MISMAS POSICIONES QUE INICIO (Reducidas y Derechas) ── */}
               <div className="w-full h-[160px] relative flex justify-center items-center overflow-hidden mb-8">
                  {/* Capa Z-10 (Más lejanas) */}
                  <div className="absolute z-10 w-[70px] h-[70px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[18px] -translate-x-[100px] rotate-[-5deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-3xl">?</span>
                  </div>
                  <div className="absolute z-10 w-[70px] h-[70px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[18px] translate-x-[100px] rotate-[5deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-3xl">?</span>
                  </div>

                  {/* Capa Z-20 (Intermedias) */}
                  <div className="absolute z-20 w-[85px] h-[85px] bg-[#0d0d0f] rounded-[22px] -translate-x-[55px] rotate-[-2deg] flex items-center justify-center border border-[#2c2c2e] shadow-xl">
                      <span className="text-white/50 font-bold text-4xl">?</span>
                  </div>
                  <div className="absolute z-20 w-[85px] h-[85px] bg-[#0d0d0f] rounded-[22px] translate-x-[55px] rotate-[2deg] flex items-center justify-center border border-[#2c2c2e] shadow-xl">
                      <span className="text-white/50 font-bold text-4xl">?</span>
                  </div>

                  {/* Capa Z-30 (Caja Activa Central) */}
                  <div className="relative z-30 w-[110px] h-[110px] bg-[#141415] rounded-[28px] flex items-center justify-center border border-[#3b82f6]/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                      <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size="large" />
                  </div>
                  
                  {/* Triángulo Indicador */}
                  <div className="absolute -top-1 z-40 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
               </div>

               <button className="w-full bg-[#3b82f6] text-white py-4 rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg mb-3">
                  Open for {activeBoxData.price} <img src="/telegram-star-icon.png" className="w-[18px] h-[18px]" />
               </button>
               <button className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 mb-10">Open 3x for {activeBoxData.price * 3} Stars</button>

               <div className="w-full flex flex-col">
                  <h3 className="text-white font-bold text-[22px] mb-4" style={{ fontFamily: SFD }}>What's inside</h3>
                  <div className="grid grid-cols-3 gap-3">
                     {INSIDE_ITEMS.map((item) => (
                        <div key={item.id} className="bg-[#111111] rounded-[18px] p-3 flex flex-col relative border border-[#1c1c1e]">
                           <Info className="absolute top-2 left-2 w-3.5 h-3.5 text-[#636366]" />
                           <div className="flex-1 flex flex-col items-center justify-center mt-4 mb-2">
                              <item.icon className="w-8 h-8 drop-shadow-lg mb-2" style={{ color: item.color }} />
                              <span className="text-white font-bold text-[13px] text-center leading-tight">{item.name}</span>
                           </div>
                           <div className="w-full flex justify-center mt-auto pt-2 border-t border-[#1c1c1e]">
                              <span className="text-[#8e8e93] font-medium text-[11px]">{item.drop}</span>
                           </div>
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[2px] rounded-t-full" style={{ backgroundColor: item.color }} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* ── VISTA PRINCIPAL ── */
          <div className="animate-in fade-in duration-300">
            <div className="sticky top-0 z-40 flex items-center px-5 pt-14 pb-4 bg-black">
               <div className="flex items-center gap-2">
                  <Store className="w-[22px] h-[22px] text-[#3b82f6]" strokeWidth={2.5} />
                  <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
               </div>
            </div>

            <div className="flex flex-col pt-4">
              <div className="w-full h-[180px] relative flex justify-center items-center overflow-hidden">
                  <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] -translate-x-[130px] rotate-[-15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-5xl">?</span>
                  </div>
                  <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] translate-x-[130px] rotate-[15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-5xl">?</span>
                  </div>
                  <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] -translate-x-[70px] rotate-[-8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                      <span className="text-white/50 font-bold text-6xl">?</span>
                  </div>
                  <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] translate-x-[70px] rotate-[8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                      <span className="text-white/50 font-bold text-6xl">?</span>
                  </div>
                  <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[32px] flex items-center justify-center border border-[#3a3a3c] shadow-2xl">
                      <span className="text-white/80 font-bold text-7xl">?</span>
                  </div>
              </div>

              <div className="w-full flex flex-col items-center mt-6">
                  <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Presale</h2>
                  <div className="flex gap-3 mt-4">
                      {['Play', 'Telegram', 'X'].map(t => (
                        <button key={t} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-[#3b82f6] font-semibold text-[13px] active:scale-95 transition-transform">
                          {t} <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                  </div>
              </div>

              <div className="mt-10 px-5">
                 <h3 className="text-white font-bold text-[24px] mb-5">Lootboxes <span className="text-[#8e8e93] font-medium">{MARKET_BOXES.length}</span></h3>
                 <div className="grid grid-cols-3 gap-3">
                    {MARKET_BOXES.map((box) => (
                       <div key={box.id} className="flex flex-col">
                          <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col relative border border-[#1c1c1e]">
                             {box.isSoldOut && <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">Sold out</div>}
                             <LootboxVisual color={box.color} imgSrc={box.image} />
                             <button onClick={() => setViewingBoxId(box.id)} className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform">Market</button>
                          </div>
                          <span className="mt-3 text-white font-bold text-[14px] text-center">{box.name}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="mt-12 px-5">
                 <h3 className="text-white font-bold text-[24px] mb-5">My Inventory <span className="text-[#8e8e93] font-medium">0</span></h3>
                 <div className="grid grid-cols-3 gap-3">
                    {MARKET_BOXES.map((box) => (
                       <div key={`inv-${box.id}`} className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col border border-[#1c1c1e] opacity-60">
                          <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-[6px] py-[2px] rounded text-[10px] font-bold">x0</div>
                          <LootboxVisual color={box.color} imgSrc={box.image} />
                          <button disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1">Unbox</button>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL TOP UP (Global) ── */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsTopUpOpen(false)} />
          <div className="relative w-full bg-black rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-center text-[22px] mb-8">Top UP</h2>
            <div className="flex flex-col items-center mb-8">
               <div className={`flex items-center justify-center gap-3 ${isError ? 'animate-shake' : ''}`}>
                 <img src="/telegram-star-icon.png" alt="Star" className="w-[42px] h-[42px]" />
                 <input type="text" inputMode="numeric" value={displayValue} onChange={handleStarInput} placeholder="0" style={{ width: displayValue ? `${displayValue.length}ch` : '1.2ch' }} className={`bg-transparent font-bold text-[56px] outline-none caret-[#3b82f6] ${isError ? 'text-[#ff3b30]' : 'text-white'}`} />
               </div>
               <span className={`text-[13px] mt-2 font-medium ${isError ? 'text-[#ff3b30]' : 'text-[#636366]'}`}>Buy between 15 and 150,000 stars</span>
               <button disabled={!isValid} className={`mt-5 w-full max-w-[300px] py-3.5 rounded-[14px] font-bold text-[17px] active:scale-95 ${isValid ? 'bg-[#3b82f6] text-white' : 'bg-[#1c1c1e] text-[#636366]'}`}>Buy {displayValue || '0'} Stars</button>
            </div>
            <p className="text-[#3b82f6] font-semibold text-[15px] mb-1 px-2">choose package</p>
            <div className="flex flex-col pb-6">
              {STAR_PACKAGES.map((pkg, i) => (
                <button key={i} className="flex items-center justify-between py-3 px-2 border-b border-[#1c1c1e] active:bg-[#111111] rounded-lg">
                   <div className="flex items-center gap-4">
                      <div className="relative flex items-center" style={{ width: `${22 + (pkg.count - 1) * 4.5}px`, height: '22px' }}>
                        {Array.from({ length: pkg.count }).map((_, idx) => (
                           <img key={idx} src="/telegram-star-icon.png" className="absolute top-0 h-[22px] w-[22px]" style={{ left: `${idx * 4.5}px`, zIndex: 20 - idx, filter: "drop-shadow(1.5px 0px 0px #000000)" }} alt="star" />
                        ))}
                      </div>
                      <span className="text-white font-bold text-[17px]">{pkg.stars} stars</span>
                   </div>
                   <span className="text-[#8e8e93] font-medium text-[16px]">{pkg.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
