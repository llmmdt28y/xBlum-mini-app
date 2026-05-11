"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Star, ArrowUpRight, ChevronLeft, Info, Shield, Cpu, Sparkles, Loader2, Send, Tag, Gem, ChevronDown } from "lucide-react"

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

// ── Datos de Subastas (Basado en tus prototipos) ──
const AUCTION_ITEMS = [
  { 
    id: 'pepe', 
    title: 'Plush Pepe', 
    tag: '#1208', 
    collection: 'Plush Pepes',
    imgSrc: '/1000010040.jpg', 
    estValue: '4,500', 
    fiatValue: '$6,210.52',
    attributes: [
        { name: 'Model', value: 'Genesis Drop', rarity: '2%', price: '4,350' },
        { name: 'Symbol', value: 'Bull Market Red', rarity: '1.5%', price: '4,210' }
    ],
    owned: true
  },
  { 
    id: 'bunny', 
    title: 'Jelly Bunny', 
    tag: '#827', 
    collection: 'Jelly Bunnies',
    imgSrc: '/1000010039.jpg', 
    estValue: '1.8', 
    fiatValue: '$12.40',
    attributes: [
        { name: 'Model', value: 'Deep Blue Sea', rarity: '0.8%', price: '1.8' },
        { name: 'Background', value: 'Mint Gray', rarity: '1.3%', price: '20.2' }
    ],
    owned: false
  },
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
  
  // ── ESTADO DE PESTAÑAS ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')

  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [isSpinningActive, setIsSpinningActive] = useState(false)
  const [tracks, setTracks] = useState<Array<{ winner: any, items: any[] }>>([])

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

  const startRoulette = (count: number) => {
    const newTracks = Array.from({ length: count }).map(() => {
      const winner = INSIDE_ITEMS[Math.floor(Math.random() * INSIDE_ITEMS.length)]
      const items = Array(35).fill({ type: 'dummy' })
      items[25] = { type: 'winner', ...winner }
      return { winner, items }
    })

    setTracks(newTracks)
    setOpeningState('spinning')
    setIsSpinningActive(false)

    setTimeout(() => { setIsSpinningActive(true) }, 50)
    setTimeout(() => { setOpeningState('result'); setIsSpinningActive(false) }, 6050)
  }

  const closeRoulette = () => {
    setOpeningState('idle')
    setTracks([])
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
      <style>{animationStyles}</style>

      {/* Contenedor Flotante Saldo */}
      <div className="fixed top-[85px] right-5 z-[60] bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all">
         <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain -mt-[2px]" />
         <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
         <button onClick={() => setIsTopUpOpen(true)} className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 ml-1 transition-transform">
            <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {viewingBoxId && activeBoxData ? (
          /* ── VISTA DETALLE LOOTBOX (Ocultada para brevedad, se mantiene igual a tu código) ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            {/* ... (Todo el código de la vista de unboxing se mantiene intacto) ... */}
            <div className="sticky top-0 z-40 flex items-center px-5 pt-14 pb-4 bg-black">
               <button onClick={() => { if (openingState === 'idle') setViewingBoxId(null) }} className={`flex items-center gap-1.5 text-white transition-opacity ${openingState !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'active:opacity-70'}`}>
                  <ChevronLeft className="w-6 h-6" />
                  <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>back</span>
               </button>
            </div>
            {/* ... Resto del unboxing ... */}
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
              {/* Cajas Flotantes Decorativas */}
              <div className="w-full h-[180px] relative flex justify-center items-center overflow-hidden">
                  <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] -translate-x-[130px] rotate-[-15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-5xl" style={{ fontFamily: SFD }}>?</span>
                  </div>
                  <div className="absolute z-10 w-[100px] h-[100px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[24px] translate-x-[130px] rotate-[15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40">
                      <span className="text-white/30 font-bold text-5xl" style={{ fontFamily: SFD }}>?</span>
                  </div>
                  <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] -translate-x-[70px] rotate-[-8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                      <span className="text-white/50 font-bold text-6xl" style={{ fontFamily: SFD }}>?</span>
                  </div>
                  <div className="absolute z-20 w-[120px] h-[120px] bg-[#0d0d0f] rounded-[28px] translate-x-[70px] rotate-[8deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                      <span className="text-white/50 font-bold text-6xl" style={{ fontFamily: SFD }}>?</span>
                  </div>
                  <div className="relative z-30 w-[140px] h-[140px] bg-[#141415] rounded-[32px] flex items-center justify-center border border-[#3a3a3c] shadow-2xl">
                      <span className="text-white/80 font-bold text-7xl" style={{ fontFamily: SFD }}>?</span>
                  </div>
              </div>

              {/* ── PÍLDORAS ORIGINALES CENTRADAS ── */}
              <div className="w-full flex flex-col items-center mt-6">
                  <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Presale</h2>
                  <div className="flex justify-center gap-3 mt-4">
                     {['Play', 'Auctions'].map(t => (
                        <button 
                           key={t} 
                           onClick={() => setActiveTab(t as 'Play' | 'Auctions')}
                           className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-[13px] active:scale-95 transition-all ${activeTab === t ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-blue-500/10 text-[#3b82f6]'}`} 
                           style={{ fontFamily: SF }}
                        >
                          {t} 
                          {activeTab !== t && <ArrowUpRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                  </div>
              </div>

              {/* ── CONTENIDO: PLAY (Lootboxes originales) ── */}
              {activeTab === 'Play' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="mt-10 px-5">
                     <h3 className="text-white font-bold text-[24px] mb-5" style={{ fontFamily: SFD }}>Lootboxes <span className="text-[#8e8e93] font-medium">{MARKET_BOXES.length}</span></h3>
                     <div className="grid grid-cols-3 gap-3">
                        {MARKET_BOXES.map((box) => (
                           <div key={box.id} className="flex flex-col">
                              <div className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col relative border border-[#1c1c1e]">
                                 {box.isSoldOut && <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a] text-[#ff4d4d] px-[6px] py-[2px] rounded text-[10px] font-bold z-30">Sold out</div>}
                                 <LootboxVisual color={box.color} imgSrc={box.image} />
                                 <button onClick={() => setViewingBoxId(box.id)} className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform" style={{ fontFamily: SF }}>Market</button>
                              </div>
                              <span className="mt-3 text-white font-bold text-[14px] text-center" style={{ fontFamily: SFD }}>{box.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="mt-12 px-5">
                     <h3 className="text-white font-bold text-[24px] mb-5" style={{ fontFamily: SFD }}>My Inventory <span className="text-[#8e8e93] font-medium">0</span></h3>
                     <div className="grid grid-cols-3 gap-3">
                        {MARKET_BOXES.map((box) => (
                           <div key={`inv-${box.id}`} className="w-full bg-[#111111] rounded-[22px] p-2 flex flex-col border border-[#1c1c1e] opacity-60">
                              <div className="absolute top-2.5 left-2.5 bg-[#2c2c2e] text-[#a1a1aa] px-[6px] py-[2px] rounded text-[10px] font-bold">x0</div>
                              <LootboxVisual color={box.color} imgSrc={box.image} />
                              <button disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1" style={{ fontFamily: SF }}>Unbox</button>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* ── CONTENIDO: AUCTIONS (Adaptado a tus imágenes) ── */}
              {activeTab === 'Auctions' && (
                <div className="mt-10 px-5 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                  <div className="flex flex-col gap-6">
                     {AUCTION_ITEMS.map((item) => (
                        <div key={item.id} className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[28px] overflow-hidden shadow-xl">
                           {/* Cabecera / Imagen */}
                           <div className="w-full h-[180px] bg-[#1c1c1e] relative flex items-center justify-center overflow-hidden">
                              <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover opacity-80" />
                              
                              {/* Badge de Propiedad */}
                              {item.owned && (
                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] border border-white/20" />
                                  <span className="text-white text-[12px] font-medium" style={{ fontFamily: SF }}>Owned by <span className="font-bold">you</span></span>
                                </div>
                              )}
                           </div>
                           
                           {/* Información Principal */}
                           <div className="p-5 flex flex-col items-center">
                              <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] mb-1 font-medium" style={{ fontFamily: SF }}>
                                 <img src="/telegram-star-icon.png" className="w-4 h-4 grayscale opacity-70" alt="Collection" />
                                 {item.collection}
                              </div>
                              <h3 className="text-white font-bold text-[22px] mb-5" style={{ fontFamily: SFD }}>
                                 {item.title} <span className="text-[#8e8e93]">{item.tag}</span>
                              </h3>

                              {/* Botones de Acción (Transfer / Sell) */}
                              <div className="w-full flex gap-3 mb-6">
                                 <button className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#3b82f6] font-semibold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                                    <Send className="w-4 h-4" /> Transfer
                                 </button>
                                 <button className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#3b82f6] font-semibold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                                    <Tag className="w-4 h-4" /> Sell
                                 </button>
                              </div>

                              {/* Bloque de Valor Estimado */}
                              <div className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] p-4 flex justify-between items-center mb-6">
                                 <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] font-medium mb-1">
                                       Est. value <Info className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>
                                       <Gem className="w-5 h-5 text-[#3b82f6]" /> {item.estValue}
                                    </div>
                                 </div>
                                 <div className="flex flex-col text-right">
                                    <span className="text-[#8e8e93] text-[13px] font-medium mb-1">Equal to</span>
                                    <span className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>{item.fiatValue}</span>
                                 </div>
                              </div>

                              {/* Rarity & Attributes (Estilo GetGems) */}
                              <div className="w-full flex flex-col">
                                 <h4 className="text-[#8e8e93] font-semibold text-[15px] mb-3" style={{ fontFamily: SF }}>Rarity & Attributes</h4>
                                 <div className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] p-1 flex flex-col">
                                    {item.attributes.map((attr, idx) => (
                                       <div key={idx} className={`flex items-center justify-between p-3 ${idx !== item.attributes.length - 1 ? 'border-b border-[#2c2c2e]' : ''}`}>
                                          <span className="text-[#8e8e93] text-[14px] w-[90px]" style={{ fontFamily: SF }}>{attr.name}</span>
                                          <div className="flex-1 flex items-center gap-2">
                                             <span className="text-white font-medium text-[14px]">{attr.value}</span>
                                             <span className="bg-blue-500/10 text-[#3b82f6] text-[11px] font-bold px-2 py-0.5 rounded-full">{attr.rarity}</span>
                                          </div>
                                          <div className="flex items-center gap-1 bg-blue-500/10 text-[#3b82f6] text-[11px] font-bold px-2 py-0.5 rounded-full">
                                             <Gem className="w-3 h-3" /> {attr.price}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL TOP UP ── */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsTopUpOpen(false)} />
          <div className="relative w-full bg-black rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* ... Modal content ... */}
          </div>
        </div>
      )}
    </div>
  )
}
