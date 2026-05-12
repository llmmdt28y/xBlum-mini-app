"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Store, Plus, Star, ArrowUpRight, ChevronLeft, Info, Shield, Cpu, Sparkles, Loader2, Send, Tag, Gem, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, MoreHorizontal, BadgeCheck } from "lucide-react"

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

// ── Datos de Subastas y NFTs ──
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
        { name: 'Model', value: 'Genesis Drop', rarity: '2%', price: '4,350', rarityColor: 'text-[#3b82f6] bg-[#3b82f6]/10' },
        { name: 'Symbol', value: 'Bull Market Red', rarity: '1.5%', price: '4,210', rarityColor: 'text-[#c084fc] bg-[#c084fc]/10' }
    ],
    owned: true,
    gridPrice: '4,500'
  },
  { 
    id: 'bunny1', 
    title: 'Jelly Bunny', 
    tag: '#4512', 
    collection: 'Jelly Bunnies',
    imgSrc: '/1000010039.jpg', 
    estValue: '1.8', 
    fiatValue: '$12.40',
    attributes: [
        { name: 'Model', value: 'Deep Blue Sea', rarity: '0.8%', price: '1.8', rarityColor: 'text-[#eab308] bg-[#eab308]/10' },
        { name: 'Background', value: 'Mint Gray', rarity: '1.3%', price: '20.2', rarityColor: 'text-[#c084fc] bg-[#c084fc]/10' },
        { name: 'Symbol', value: 'Phoenix', rarity: '2%', price: '0.5', rarityColor: 'text-[#3b82f6] bg-[#3b82f6]/10' }
    ],
    owned: false,
    gridPrice: '1.8'
  },
  { 
    id: 'bunny2', 
    title: 'Jelly Bunny', 
    tag: '#25231', 
    collection: 'Jelly Bunnies',
    imgSrc: '/1000010037.png', 
    estValue: '0.5', 
    fiatValue: '$3.50',
    attributes: [
        { name: 'Model', value: 'Classic Stone', rarity: '15%', price: '0.5', rarityColor: 'text-[#8e8e93] bg-[#8e8e93]/10' },
        { name: 'Background', value: 'Dusty', rarity: '12%', price: '0.6', rarityColor: 'text-[#8e8e93] bg-[#8e8e93]/10' }
    ],
    owned: false,
    gridPrice: '0.5'
  },
  { 
    id: 'pepe2', 
    title: 'Plush Pepe', 
    tag: '#884', 
    collection: 'Plush Pepes',
    imgSrc: '/1000010040.jpg', 
    estValue: '2,100', 
    fiatValue: '$2,800.00',
    attributes: [
        { name: 'Model', value: 'Standard', rarity: '10%', price: '2,000', rarityColor: 'text-[#10b981] bg-[#10b981]/10' },
    ],
    owned: false,
    gridPrice: '2,100'
  },
]

const animationStyles = `
  @keyframes box-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .animate-box-float { animation: box-float 3.5s ease-in-out infinite; }
  @keyframes shake-error { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
  .animate-shake { animation: shake-error 0.4s ease-in-out; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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

  // ── ESTADOS PRINCIPALES ──
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  // ── ESTADOS DE PESTAÑAS, SUBASTAS Y VISTA ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)

  // ── ESTADOS DE LA RULETA EN LÍNEA ──
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [isSpinningActive, setIsSpinningActive] = useState(false)
  const [tracks, setTracks] = useState<Array<{ winner: any, items: any[] }>>([])

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    if (viewingBoxId) {
       tg.BackButton.show(); 
       const handleBack = () => setViewingBoxId(null)
       tg.BackButton.onClick(handleBack); 
       return () => tg.BackButton.offClick(handleBack)
    } else if (viewingAuctionId) {
       tg.BackButton.show(); 
       const handleBack = () => setViewingAuctionId(null)
       tg.BackButton.onClick(handleBack); 
       return () => tg.BackButton.offClick(handleBack)
    } else {
       tg.BackButton.show(); 
       const handleBack = () => { setCurrentView("home"); tg.BackButton.hide() }
       tg.BackButton.onClick(handleBack); 
       return () => tg.BackButton.offClick(handleBack)
    }
  }, [setCurrentView, viewingBoxId, viewingAuctionId])

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

  const toggleExpandAuction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedAuctionId(prev => prev === id ? null : id)
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""
  
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)
  const activeAuctionData = AUCTION_ITEMS.find(a => a.id === viewingAuctionId)

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
        {/* ── VISTA DETALLE DE LOOTBOX ── */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="sticky top-0 z-40 flex items-center px-5 pt-14 pb-4 bg-black">
               <button onClick={() => { if (openingState === 'idle') setViewingBoxId(null) }} className={`flex items-center gap-1.5 text-white transition-opacity ${openingState !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'active:opacity-70'}`}>
                  <ChevronLeft className="w-6 h-6" />
                  <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>back</span>
               </button>
            </div>

            <div className="flex flex-col px-5 pt-6 items-center">
               <h2 className="text-white font-bold text-[28px] mb-8 transition-all" style={{ fontFamily: SFD }}>
                  {openingState === 'idle' ? activeBoxData.name : openingState === 'spinning' ? 'Opening...' : 'Rewards Drop!'}
               </h2>

               <div className="w-full flex flex-col items-center mb-8 relative">
                  {openingState === 'idle' ? (
                     <div className="w-full h-[160px] relative flex justify-center items-center overflow-hidden animate-in fade-in duration-500">
                        <div className="absolute z-10 w-[85px] h-[85px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[22px] -translate-x-[215px] flex items-center justify-center border border-[#1c1c1e] opacity-30">
                           <span className="text-white/30 font-bold text-3xl" style={{ fontFamily: SFD }}>?</span>
                        </div>
                        <div className="absolute z-10 w-[85px] h-[85px] bg-gradient-to-b from-[#0a0a0b] to-[#000000] rounded-[22px] translate-x-[215px] flex items-center justify-center border border-[#1c1c1e] opacity-30">
                           <span className="text-white/30 font-bold text-3xl" style={{ fontFamily: SFD }}>?</span>
                        </div>
                        <div className="absolute z-20 w-[95px] h-[95px] bg-[#0d0d0f] rounded-[24px] -translate-x-[115px] flex items-center justify-center border border-[#2c2c2e] shadow-xl opacity-70">
                           <span className="text-white/50 font-bold text-4xl" style={{ fontFamily: SFD }}>?</span>
                        </div>
                        <div className="absolute z-20 w-[95px] h-[95px] bg-[#0d0d0f] rounded-[24px] translate-x-[115px] flex items-center justify-center border border-[#2c2c2e] shadow-xl opacity-70">
                           <span className="text-white/50 font-bold text-4xl" style={{ fontFamily: SFD }}>?</span>
                        </div>
                        <div className="relative z-30 w-[110px] h-[110px] bg-[#141415] rounded-[28px] flex items-center justify-center border border-[#3b82f6]/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                           <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size="large" />
                        </div>
                        <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-40 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                     </div>
                  ) : (
                     <div className="w-full flex flex-col gap-4 relative overflow-hidden py-2 animate-in fade-in duration-300">
                        <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-black to-transparent z-40 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-black to-transparent z-40 pointer-events-none" />

                        {tracks.map((track, trackIdx) => (
                           <div key={trackIdx} className="w-full h-[110px] relative flex items-center overflow-visible">
                              <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-40 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                              <div
                                className="flex gap-3 absolute left-1/2"
                                style={{
                                  transform: openingState === 'spinning' && isSpinningActive
                                    ? `translateX(calc(-50px - ${25 * 112}px))`
                                    : openingState === 'result'
                                    ? `translateX(calc(-50px - ${25 * 112}px))`
                                    : `translateX(-50px)`,
                                  transition: isSpinningActive ? `transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)` : 'none',
                                }}
                              >
                                {track.items.map((item, idx) => {
                                   const isWinnerCard = idx === 25;
                                   const isResult = openingState === 'result';
                                   return (
                                     <div key={idx} className={`w-[100px] h-[100px] flex-shrink-0 flex flex-col items-center justify-center rounded-[24px] border transition-all duration-700 ${isResult && !isWinnerCard ? 'opacity-0 scale-50' : isResult && isWinnerCard ? 'opacity-100 scale-110 bg-[#111111] border-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.3)] z-50' : 'bg-[#0d0d0f] border-[#2c2c2e] opacity-80 shadow-md'}`}>
                                       {item.type === 'dummy' ? (
                                         <span className="text-white/30 font-bold text-4xl" style={{ fontFamily: SFD }}>?</span>
                                       ) : (
                                         <>
                                            <item.icon className="w-10 h-10 drop-shadow-lg" style={{ color: item.color }} />
                                            {isResult && <span className="text-white font-bold text-[11px] text-center px-1 mt-2 leading-tight animate-in fade-in zoom-in duration-500 delay-300" style={{ fontFamily: SF }}>{item.name}</span>}
                                         </>
                                       )}
                                     </div>
                                   )
                                })}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <div className="w-full flex flex-col items-center min-h-[110px] justify-center">
                  {openingState === 'idle' ? (
                     <>
                        <button onClick={() => startRoulette(1)} className="w-full bg-[#3b82f6] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-lg mb-3" style={{ fontFamily: SF }}>
                           <span>Open for {activeBoxData.price}</span> 
                           <img src="/telegram-star-icon.png" className="w-[20px] h-[20px] object-contain -mt-[2px]" alt="Star" />
                        </button>
                        <button onClick={() => startRoulette(3)} className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 mb-5 transition-opacity" style={{ fontFamily: SF }}>
                           Open 3x for {activeBoxData.price * 3} Stars
                        </button>
                     </>
                  ) : openingState === 'spinning' ? (
                     <button disabled className="w-full bg-[#ef4444] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] mb-8 transition-colors animate-in fade-in zoom-in duration-300" style={{ fontFamily: SF }}>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Opening...
                     </button>
                  ) : (
                     <button onClick={closeRoulette} className="w-full bg-[#10b981] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300" style={{ fontFamily: SF }}>
                        Collect {tracks.length > 1 ? 'Items' : 'Item'}
                     </button>
                  )}
               </div>

               <div className="w-full flex flex-col mt-2">
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
                              <span className="text-[#8e8e93] font-medium text-[11px]" style={{ fontFamily: SF }}>{item.drop}</span>
                           </div>
                           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[2px] rounded-t-full" style={{ backgroundColor: item.color }} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          
        ) : viewingAuctionId && activeAuctionData ? (
          /* ── VISTA DETALLE DE SUBASTA / NFT (Pantalla Completa) ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 pb-10">
            <div className="sticky top-0 z-40 flex items-center px-5 pt-14 pb-4 bg-black/90 backdrop-blur-md">
               <button onClick={() => setViewingAuctionId(null)} className="flex items-center gap-1.5 text-white active:opacity-70 transition-opacity">
                  <ChevronLeft className="w-6 h-6" />
                  <span className="font-semibold text-[17px]" style={{ fontFamily: SF }}>Marketplace</span>
               </button>
            </div>

            <div className="px-5 mt-2">
               <div className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[24px] overflow-hidden shadow-xl">
                  {/* Cabecera / Imagen */}
                  <div className="w-full h-[240px] bg-[#161618] relative flex items-center justify-center overflow-hidden p-4">
                     <img src={activeAuctionData.imgSrc} alt={activeAuctionData.title} className="w-full h-full object-contain drop-shadow-xl" />
                     {activeAuctionData.owned && (
                       <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                         <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] border border-white/20" />
                         <span className="text-white text-[12px] font-medium" style={{ fontFamily: SF }}>Owned by <span className="font-bold">you</span></span>
                       </div>
                     )}
                  </div>
                  
                  {/* Información Principal */}
                  <div className="p-5 flex flex-col">
                     <div className="flex items-center gap-1.5 text-[#8e8e93] text-[14px] mb-2 font-medium" style={{ fontFamily: SF }}>
                        <BadgeCheck className="w-4 h-4 text-[#3b82f6]" />
                        {activeAuctionData.collection}
                     </div>
                     <h3 className="text-white font-bold text-[26px] mb-6 leading-tight" style={{ fontFamily: SFD }}>
                        {activeAuctionData.title} <span className="text-[#8e8e93] font-semibold">{activeAuctionData.tag}</span>
                     </h3>

                     {/* Botones de Acción */}
                     <div className="w-full flex gap-3 mb-6">
                        <button className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ fontFamily: SF }}>
                           <ShoppingCart className="w-4 h-4" /> {activeAuctionData.owned ? 'Sell' : 'Buy Now'}
                        </button>
                        <button className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                           <Gavel className="w-4 h-4 text-[#a1a1aa]" /> {activeAuctionData.owned ? 'Transfer' : 'Place Bid'}
                        </button>
                     </div>

                     {/* Bloque de Valor Estimado */}
                     <div className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] p-4 flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] font-medium mb-1">
                              Est. value <Info className="w-3.5 h-3.5" />
                           </div>
                           <div className="flex items-center gap-1.5 text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>
                              <Gem className="w-5 h-5 text-[#3b82f6]" /> {activeAuctionData.estValue}
                           </div>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[#8e8e93] text-[13px] font-medium mb-1">Equal to</span>
                           <span className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>{activeAuctionData.fiatValue}</span>
                        </div>
                     </div>

                     {/* Rarity & Attributes Completos */}
                     <div className="w-full flex flex-col">
                        <h4 className="text-white font-bold text-[18px] mb-3" style={{ fontFamily: SFD }}>Rarity & Attributes</h4>
                        <div className="w-full bg-[#161618] border border-[#2c2c2e] rounded-[16px] p-1 flex flex-col">
                           {activeAuctionData.attributes.map((attr, idx) => (
                              <div key={idx} className={`flex items-center justify-between p-3 ${idx !== activeAuctionData.attributes.length - 1 ? 'border-b border-[#2c2c2e]' : ''}`}>
                                 <span className="text-[#8e8e93] text-[14px] w-[90px]" style={{ fontFamily: SF }}>{attr.name}</span>
                                 <div className="flex-1 flex items-center gap-2">
                                    <span className="text-white font-medium text-[14px]">{attr.value}</span>
                                    <span className={`${attr.rarityColor} text-[11px] font-bold px-2 py-0.5 rounded-full`}>{attr.rarity}</span>
                                 </div>
                                 <div className="flex items-center gap-1 bg-white/5 text-[#8e8e93] text-[12px] font-semibold px-2 py-1 rounded-lg">
                                    <Gem className="w-3 h-3" /> {attr.price}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        ) : (
          /* ── VISTA PRINCIPAL & AUCTIONS ── */
          <div className="animate-in fade-in duration-300 flex flex-col h-full">
            
            {/* Header Fijo con Pestañas (Diseño de Píldora Gris con Verde Militar) */}
            <div className="sticky top-0 z-40 flex flex-col px-5 pt-14 pb-2 bg-black/95 backdrop-blur-md">
               <div className="flex items-center gap-2 mb-4">
                  <Store className="w-[22px] h-[22px] text-[#3b82f6]" strokeWidth={2.5} />
                  <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>xBlum Market</h1>
               </div>
               
               {/* Contenedor Gris para unir las Pestañas */}
               <div className="w-full flex justify-center">
                  <div className="flex bg-[#1c1c1e] p-1 rounded-full gap-1 border border-[#2c2c2e]">
                     {['Play', 'Auctions'].map(t => (
                        <button 
                           key={t} 
                           onClick={() => setActiveTab(t as 'Play' | 'Auctions')}
                           className={`flex items-center justify-center gap-1.5 px-8 py-2 rounded-full font-bold text-[14px] transition-all duration-300 ${
                              activeTab === t 
                              ? 'bg-[#2d4a36] text-white shadow-sm' // Color Verde Militar seleccionado
                              : 'text-[#8e8e93] hover:text-white'
                           }`} 
                           style={{ fontFamily: SF }}
                        >
                          {t} 
                        </button>
                      ))}
                  </div>
               </div>
            </div>

            <div className="flex flex-col flex-1 pb-10">
               {/* ── CONTENIDO: PLAY (LOOTBOXES) ── */}
               {activeTab === 'Play' && (
                 <div className="animate-in fade-in slide-in-from-left-4 duration-300 pt-4">
                   {/* Decoración Cajas Flotantes */}
                   <div className="w-full h-[160px] relative flex justify-center items-center overflow-hidden mb-6">
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

                   <div className="px-5">
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

               {/* ── CONTENIDO: AUCTIONS (Pantalla completa simulada, Controles avanzados) ── */}
               {activeTab === 'Auctions' && (
                 <div className="flex flex-col w-full px-5 pt-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* Botón Principal: Add Gift */}
                    <button className="w-full bg-[#3b82f6] text-white py-3.5 rounded-[16px] font-bold text-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-5" style={{ fontFamily: SF }}>
                       <Plus className="w-5 h-5" /> Add Gift
                    </button>

                    {/* Fila de Búsqueda y Toggle de Vista */}
                    <div className="flex gap-2 w-full mb-4">
                       <div className="flex-1 bg-[#1c1c1e] rounded-[14px] flex items-center px-3 gap-2 border border-[#2c2c2e]">
                          <Search className="w-5 h-5 text-[#8e8e93]" />
                          <input type="text" placeholder="Name or description" className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#636366]" style={{ fontFamily: SF }} />
                       </div>
                       
                       <button className="w-[46px] h-[46px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-[#8e8e93] border border-[#2c2c2e] active:bg-[#2c2c2e] transition-colors">
                          <ArrowDownUp className="w-5 h-5" />
                       </button>

                       {/* Toggle entre Cuadrícula (2 columnas) y Lista (1 columna) */}
                       <button 
                          onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                          className="w-[46px] h-[46px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-white border border-[#2c2c2e] active:bg-[#2c2c2e] transition-colors shadow-sm"
                       >
                          {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                       </button>
                    </div>

                    {/* Fila de Filtros (Scroll Horizontal) */}
                    <div className="flex gap-2 w-full overflow-x-auto pb-2 no-scrollbar mb-2">
                       <button className="flex-shrink-0 w-10 h-10 bg-[#1c1c1e] rounded-[12px] flex items-center justify-center text-white border border-[#2c2c2e] active:bg-[#2c2c2e]">
                          <SlidersHorizontal className="w-4 h-4" />
                       </button>
                       {['Collections', 'Backdrop', 'Symbol'].map(filter => (
                         <button key={filter} className="flex-shrink-0 flex items-center gap-2 px-4 h-10 bg-[#1c1c1e] rounded-[12px] text-white font-medium text-[14px] border border-[#2c2c2e] active:bg-[#2c2c2e]" style={{ fontFamily: SF }}>
                           {filter} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                         </button>
                       ))}
                    </div>

                    {/* Renderizado Condicional del Modo de Vista */}
                    {viewMode === 'grid' ? (
                       /* ── VISTA DE 2 COLUMNAS (CUADRÍCULA) ── */
                       <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in duration-300">
                          {AUCTION_ITEMS.map((item) => (
                             <div 
                                key={item.id} 
                                onClick={() => setViewingAuctionId(item.id)}
                                className="bg-[#111111] rounded-[20px] p-2 flex flex-col border border-[#1c1c1e] shadow-md cursor-pointer hover:bg-[#161618] transition-colors"
                             >
                                <div className="w-full aspect-square bg-[#1c1c1e] rounded-[16px] overflow-hidden relative flex items-center justify-center p-1">
                                   <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover rounded-[12px]" />
                                </div>
                                <div className="flex justify-between items-center px-1 mt-3 mb-1.5">
                                   <Heart className="w-[18px] h-[18px] text-[#636366] hover:text-[#ff3b30] transition-colors" />
                                   <MoreHorizontal className="w-[18px] h-[18px] text-[#636366]" />
                                </div>
                                <span className="text-white text-[13px] font-bold px-1 truncate leading-tight" style={{ fontFamily: SFD }}>
                                   {item.title} <span className="text-[#8e8e93] font-medium">{item.tag}</span>
                                </span>
                                <div className="flex items-center gap-1.5 px-1 mt-1.5 pb-1">
                                   <div className="w-4 h-4 rounded-full bg-[#3b82f6] flex items-center justify-center">
                                      <Gem className="w-2.5 h-2.5 text-white" />
                                   </div>
                                   <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{item.gridPrice}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       /* ── VISTA DE 1 COLUMNA (LISTA CON ACORDEÓN) ── */
                       <div className="flex flex-col gap-4 mt-2 animate-in fade-in duration-300">
                          {AUCTION_ITEMS.map((item) => {
                             const isExpanded = expandedAuctionId === item.id;
                             return (
                                <div 
                                   key={item.id} 
                                   onClick={() => setViewingAuctionId(item.id)}
                                   className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[20px] p-4 flex flex-col shadow-lg cursor-pointer transition-all hover:bg-[#161618]"
                                >
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                         <div className="w-14 h-14 bg-[#1c1c1e] rounded-[14px] border border-[#2c2c2e] overflow-hidden flex-shrink-0">
                                            <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-white font-bold text-[17px] leading-tight" style={{ fontFamily: SFD }}>
                                               {item.title} <span className="text-[#8e8e93] font-semibold text-[14px]">{item.tag}</span>
                                            </span>
                                            <div className="flex items-center gap-1 text-[#8e8e93] text-[12px] font-medium mt-0.5" style={{ fontFamily: SF }}>
                                               <BadgeCheck className="w-3.5 h-3.5 text-[#3b82f6]" /> {item.collection}
                                            </div>
                                         </div>
                                      </div>
                                      
                                      <button 
                                         onClick={(e) => toggleExpandAuction(item.id, e)} 
                                         className="w-8 h-8 flex items-center justify-center bg-[#1c1c1e] rounded-full text-[#8e8e93] hover:text-white transition-colors border border-[#2c2c2e]"
                                      >
                                         {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                      </button>
                                   </div>

                                   {isExpanded && (
                                      <div 
                                         className="flex flex-col mt-4 pt-3 border-t border-[#1c1c1e] animate-in fade-in slide-in-from-top-2 duration-300"
                                         onClick={(e) => e.stopPropagation()} 
                                      >
                                         <div className="flex justify-between text-[#8e8e93] text-[12px] font-bold mb-2 uppercase tracking-wide" style={{ fontFamily: SF }}>
                                            <span>Attribute</span>
                                            <span>Floor price</span>
                                         </div>
                                         
                                         {item.attributes.map((attr, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-1.5">
                                               <div className="flex items-center gap-2">
                                                  <span className="text-[#8e8e93] text-[13px] w-[80px]" style={{ fontFamily: SF }}>{attr.name}:</span>
                                                  <span className="text-white text-[13px] font-medium" style={{ fontFamily: SF }}>{attr.value}</span>
                                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${attr.rarityColor}`}>{attr.rarity}</span>
                                               </div>
                                               <div className="flex items-center gap-1 text-[#a1a1aa] text-[13px] font-semibold" style={{ fontFamily: SF }}>
                                                  <Gem className="w-3 h-3" /> {attr.price}
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   )}
                                </div>
                             )
                          })}
                       </div>
                    )}
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
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>Top UP</h2>
            <div className="flex flex-col items-center mb-8">
               <div className={`flex items-center justify-center gap-3 ${isError ? 'animate-shake' : ''}`}>
                 <img src="/telegram-star-icon.png" alt="Star" className="w-[42px] h-[42px]" />
                 <input type="text" inputMode="numeric" value={displayValue} onChange={handleStarInput} placeholder="0" style={{ width: displayValue ? `${displayValue.length}ch` : '1.2ch', fontFamily: SFD }} className={`bg-transparent font-bold text-[56px] outline-none caret-[#3b82f6] ${isError ? 'text-[#ff3b30]' : 'text-white'}`} />
               </div>
               <span className={`text-[13px] mt-2 font-medium ${isError ? 'text-[#ff3b30]' : 'text-[#636366]'}`} style={{ fontFamily: SF }}>Buy between 15 and 150,000 stars</span>
               <button disabled={!isValid} className={`mt-5 w-full max-w-[300px] py-3.5 rounded-[14px] font-bold text-[17px] active:scale-95 transition-transform ${isValid ? 'bg-[#3b82f6] text-white shadow-lg' : 'bg-[#1c1c1e] text-[#636366]'}`} style={{ fontFamily: SF }}>Buy {displayValue || '0'} Stars</button>
            </div>
            <p className="text-[#3b82f6] font-semibold text-[15px] mb-1 px-2" style={{ fontFamily: SF }}>choose package</p>
            <div className="flex flex-col pb-6">
              {STAR_PACKAGES.map((pkg, i) => (
                <button key={i} className="flex items-center justify-between py-3 px-2 border-b border-[#1c1c1e] active:bg-[#111111] rounded-lg transition-colors">
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
    </div>
  )
}
