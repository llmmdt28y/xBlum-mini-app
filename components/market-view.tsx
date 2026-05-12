"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { Plus, Star, ArrowDown, X, Info, Shield, Cpu, Sparkles, Loader2, Send, Tag, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, MoreHorizontal, BadgeCheck, Copy, ChevronRight, ChevronLeft, Bell, Gift } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual ──
const MARKET_BOXES = [
  { id: 'secret', name: 'Secret', color: '#eab308', image: '/1000009369.png', isSoldOut: false, price: 150, description: "Contains rare API access and VIP badges." },
  { id: 'toxic', name: 'Toxic Whisper', color: '#c084fc', image: '/1000009370.png', isSoldOut: false, price: 300, description: "Unlock exclusive themes and high-value stars." },
  { id: 'eternal', name: 'Eternal Beacon', color: '#a855f7', image: '/1000009371.png', isSoldOut: true, price: 500, description: "Highest drop rate for Legendary VortX items." },
  { id: 'aureus', name: 'Aureus', color: '#facc15', image: '/1000009361.png', isSoldOut: false, price: 1000, description: "The definitive collector's crate. Guaranteed rare." }
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

// ── Opciones para Dropdowns de Filtros ──
const FILTER_OPTIONS = {
   sale: ['All', 'For sale', 'Not for sale'],
}

// Estilos de animación inyectados de forma segura
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
        <img src={imgSrc} alt="Lootbox" draggable={false} className={`${imgClass} object-contain mix-blend-screen pointer-events-none select-none`} style={{ WebkitTouchCallout: "none" }} />
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
  
  // ── ESTADOS DE PESTAÑAS Y VISTAS ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)

  // ── ESTADOS DE FILTROS ──
  const [openDropdown, setOpenDropdown] = useState<'sale' | null>(null)
  const [filters, setFilters] = useState({ sale: 'For sale' })

  // ── ESTADOS DE ADD GIFT (LISTING FLOW) ──
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [addGiftStep, setAddGiftStep] = useState<'choose_type' | 'select_gift'>('choose_type')
  const [listingType, setListingType] = useState<'fixed' | 'auction' | 'falling' | null>(null)

  // ── ESTADOS DE MAKE OFFER (BIDS) ──
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false)
  const [offerInput, setOfferInput] = useState("")

  // ── ESTADOS DE LA RULETA EN LÍNEA ──
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [isSpinningActive, setIsSpinningActive] = useState(false)
  const [tracks, setTracks] = useState<Array<{ winner: any, items: any[] }>>([])

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ── NAVEGACIÓN NATIVA DE TELEGRAM (BACK BUTTON) ──
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      if (isMakeOfferOpen) {
         setIsMakeOfferOpen(false)
      } else if (isAddGiftOpen) {
         if (addGiftStep === 'select_gift') {
            setAddGiftStep('choose_type') 
         } else {
            setIsAddGiftOpen(false) 
         }
      } else if (viewingBoxId) {
         setViewingBoxId(null) 
      } else if (viewingAuctionId) {
         setViewingAuctionId(null) 
      } else if (activeTab === 'Auctions') {
         setActiveTab('Play') 
      } else {
         setCurrentView("home") 
         tg.BackButton.hide()
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView, viewingBoxId, viewingAuctionId, activeTab, isAddGiftOpen, addGiftStep, isMakeOfferOpen])

  const handleStarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val === '') { setStarInput(''); return }
    const num = parseInt(val, 10)
    setStarInput(num > 150000 ? '150000' : num.toString())
  }

  const handleOfferInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val === '') { setOfferInput(''); return }
    const num = parseInt(val, 10)
    setOfferInput(num > 100000 ? '100000' : num.toString())
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

  const handleAddGiftSelection = (type: 'fixed' | 'auction' | 'falling') => {
    setListingType(type)
    setAddGiftStep('select_gift')
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""

  const offerNumValue = offerInput ? parseInt(offerInput, 10) : 0
  const isOfferValid = offerNumValue > 0
  const serviceFee = offerNumValue ? (offerNumValue * 0.05).toFixed(1) : 0
  const sellerGets = offerNumValue ? (offerNumValue * 0.95).toFixed(1) : 0
  
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)
  const activeAuctionData = AUCTION_ITEMS.find(a => a.id === viewingAuctionId)

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden" ref={dropdownRef}>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* ── PÍLDORA DE TOP UP FLOTANTE ── */}
      {activeTab === 'Play' && !viewingBoxId && (
        <div className="fixed top-[85px] right-5 z-[60] bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all animate-in fade-in zoom-in duration-300">
           <img src="/telegram-star-icon.png" alt="Stars" draggable={false} className="w-[18px] h-[18px] object-contain -mt-[2px] pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
           <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>{myStars.toLocaleString('en-US')}</span>
           <button type="button" onClick={() => setIsTopUpOpen(true)} className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center active:scale-95 ml-1 transition-transform">
              <Plus className="w-4 h-4 text-[#a78bfa]" strokeWidth={3} />
           </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-32">
        {/* ── VISTA DETALLE DE LOOTBOX (UNBOXING) ── */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="flex flex-col px-5 pt-16 items-center">
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
                        <div className="relative z-30 w-[110px] h-[110px] bg-[#141415] rounded-[32px] flex items-center justify-center border border-[#3b82f6]/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
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
                        <button type="button" onClick={() => startRoulette(1)} className="w-full bg-[#3b82f6] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-lg mb-3" style={{ fontFamily: SF }}>
                           <span>Open for {activeBoxData.price}</span> 
                           <img src="/telegram-star-icon.png" draggable={false} className="w-[20px] h-[20px] object-contain -mt-[2px] pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} alt="Star" />
                        </button>
                        <button type="button" onClick={() => startRoulette(3)} className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 mb-5 transition-opacity" style={{ fontFamily: SF }}>
                           Open 3x for {activeBoxData.price * 3} Stars
                        </button>
                     </>
                  ) : openingState === 'spinning' ? (
                     <button type="button" disabled className="w-full bg-[#ef4444] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] mb-8 transition-colors animate-in fade-in zoom-in duration-300" style={{ fontFamily: SF }}>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Opening...
                     </button>
                  ) : (
                     <button type="button" onClick={closeRoulette} className="w-full bg-[#10b981] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300" style={{ fontFamily: SF }}>
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
          /* ── VISTA DETALLE DE SUBASTA / NFT (Rediseño Limpio y Compacto) ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 pb-10 pt-16 flex flex-col gap-6">
            
            {/* 1. Contenedor de Imagen Cuadrado Centrado */}
            <div className="w-full max-w-[260px] aspect-square bg-[#111111] border border-[#1c1c1e] rounded-[32px] mx-auto relative flex items-center justify-center p-4 shadow-2xl mb-2">
               <img src={activeAuctionData.imgSrc} alt={activeAuctionData.title} draggable={false} className="w-full h-full object-contain drop-shadow-xl pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
               {activeAuctionData.owned && (
                 <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-md z-10">
                   <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] border border-white/20" />
                   <span className="text-white text-[12px] font-medium" style={{ fontFamily: SF }}>Owned by <span className="font-bold">you</span></span>
                 </div>
               )}
            </div>

            {/* 2. Información del NFT (Título/Colección) */}
            <div className="flex flex-col items-center text-center px-5 mb-1">
               <div className="flex items-center gap-1.5 text-[#8e8e93] text-[14px] mb-1.5 font-medium" style={{ fontFamily: SF }}>
                  <BadgeCheck className="w-4 h-4 text-[#3b82f6]" />
                  {activeAuctionData.collection}
               </div>
               <h3 className="text-white font-bold text-[26px] leading-tight" style={{ fontFamily: SFD }}>
                  {activeAuctionData.title} <span className="text-[#8e8e93] font-semibold">{activeAuctionData.tag}</span>
               </h3>
            </div>

            {/* 3. Botones de Acción (Sin Contenedor Gris de Fondo) */}
            <div className="flex gap-3 mx-5 mb-2 px-1">
               <button type="button" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95" style={{ fontFamily: SF }}>
                  <ShoppingCart className="w-4 h-4" /> {activeAuctionData.owned ? 'Sell' : 'Buy Now'}
               </button>
               <button type="button" onClick={() => setIsMakeOfferOpen(true)} className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e] active:scale-95 shadow-sm" style={{ fontFamily: SF }}>
                  <Gavel className="w-4 h-4 text-[#a1a1aa]" /> {activeAuctionData.owned ? 'Transfer' : 'Place Bid'}
               </button>
            </div>

            {/* 4. Valor Estimado (Ancho Reducido) */}
            <div className="bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-5 flex justify-between items-center mx-auto shadow-lg w-[calc(100%-60px)] max-w-[340px] mb-2 border border-[#2c2c2e]">
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] font-medium mb-1">
                     Est. value <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                     <img src="/telegram-star-icon.png" className="w-4 h-4 pointer-events-none select-none" draggable={false} alt="Star" /> {activeAuctionData.estValue}
                  </div>
               </div>
               <div className="flex flex-col text-right">
                  <span className="text-[#8e8e93] text-[13px] font-medium mb-1">Equal to</span>
                  <span className="text-white font-bold text-[17px]" style={{ fontFamily: SFD }}>{activeAuctionData.fiatValue}</span>
               </div>
            </div>

            {/* 5. Rarity & Attributes (Título fuera, atributos dentro de un contenedor) */}
            <div className="px-5 flex flex-col gap-2 mb-8">
               <h4 className="text-[#8e8e93] font-semibold text-[15px] mb-1 px-1" style={{ fontFamily: SF }}>Rarity & Attributes</h4>
               {/* Contenedor Exclusivo para Model, Symbol, Backdrop */}
               <div className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-2 shadow-lg">
                  {activeAuctionData.attributes.map((attr, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-3 ${idx !== activeAuctionData.attributes.length - 1 ? 'border-b border-[#1c1c1e]' : ''}`}>
                        <span className="text-[#8e8e93] text-[14px] w-[90px]" style={{ fontFamily: SF }}>{attr.name}</span>
                        <div className="flex-1 flex items-center gap-2">
                           <span className="text-white font-medium text-[14px]">{attr.value}</span>
                           <span className={`${attr.rarityColor} text-[11px] font-bold px-2 py-0.5 rounded-md`}>{attr.rarity}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#111111] text-[#8e8e93] text-[12px] font-semibold px-2 py-1 rounded-lg border border-[#2c2c2e]">
                           <img src="/telegram-star-icon.png" className="w-3 h-3 pointer-events-none select-none grayscale opacity-70" draggable={false} alt="Star" /> {attr.price}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>

        ) : (
          /* ── VISTA PRINCIPAL & AUCTIONS ── */
          <div className="animate-in fade-in duration-300 flex flex-col h-full">
            
            <div className="sticky top-0 z-50 px-5 pt-8 pb-3 bg-black/95 backdrop-blur-md border-b border-transparent">
               <div className="w-full relative flex items-center justify-center min-h-[40px] mt-2">
                   {/* Pestañas Centradas */}
                   <div className="flex items-center bg-[#1c1c1e] rounded-full p-[3px] border border-[#2c2c2e]/50">
                       <button 
                         type="button"
                         onClick={() => setActiveTab('Play')}
                         className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${activeTab === 'Play' ? 'bg-[#22C55E]/15 text-[#4ade80] shadow-sm' : 'text-[#8e8e93] hover:text-white bg-transparent'}`} style={{ fontFamily: SF }}>
                           Play
                       </button>
                       <button 
                         type="button"
                         onClick={() => setActiveTab('Auctions')}
                         className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${activeTab === 'Auctions' ? 'bg-[#22C55E]/15 text-[#4ade80] shadow-sm' : 'text-[#8e8e93] hover:text-white bg-transparent'}`} style={{ fontFamily: SF }}>
                           Auctions
                       </button>
                   </div>
               </div>
            </div>

            <div className="flex flex-col flex-1 pb-10">
               {/* ── CONTENIDO: PLAY (LOOTBOXES) ── */}
               {activeTab === 'Play' && (
                 <div className="animate-in fade-in slide-in-from-left-4 duration-300 pt-4 px-5">
                   {/* Gráfico Superior Reemplazado - Stack de Lootboxes Premium */}
                   <div className="w-full h-[180px] relative flex justify-center items-center overflow-hidden mb-6 bg-[#0a0a0b] rounded-[32px] border border-[#1c1c1e] shadow-xl">
                       {/* Fondo Resplandor Dinámico */}
                       <div className="absolute inset-0 opacity-10 blur-[40px] rounded-[32px]" style={{ backgroundColor: MARKET_BOXES[0].color, transition: "background-color 0.5s ease" }}/>
                       
                       {/* Lootboxes Apilados Visuales */}
                       <div className="absolute z-10 w-[80px] h-[80px] bg-black rounded-[20px] -translate-x-[110px] rotate-[-20deg] flex items-center justify-center border border-[#1c1c1e] opacity-30 shadow-inner">
                           <LootboxVisual color={MARKET_BOXES[2].color} imgSrc={MARKET_BOXES[2].image} size="normal" />
                       </div>
                       <div className="absolute z-10 w-[80px] h-[80px] bg-black rounded-[20px] translate-x-[110px] rotate-[20deg] flex items-center justify-center border border-[#1c1c1e] opacity-30 shadow-inner">
                           <LootboxVisual color={MARKET_BOXES[3].color} imgSrc={MARKET_BOXES[3].image} size="normal" />
                       </div>
                       <div className="absolute z-20 w-[100px] h-[100px] bg-[#0d0d0f] rounded-[24px] -translate-x-[60px] rotate-[-10deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                           <LootboxVisual color={MARKET_BOXES[1].color} imgSrc={MARKET_BOXES[1].image} size="normal" />
                       </div>
                       <div className="absolute z-20 w-[100px] h-[100px] bg-[#0d0d0f] rounded-[24px] translate-x-[60px] rotate-[10deg] flex items-center justify-center border border-[#2c2c2e] shadow-2xl">
                           <LootboxVisual color={MARKET_BOXES[2].color} imgSrc={MARKET_BOXES[2].image} size="normal" />
                       </div>
                       <div className="relative z-30 w-[120px] h-[120px] bg-[#141415] rounded-[28px] flex items-center justify-center border border-[#3b82f6]/60 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                           <LootboxVisual color={MARKET_BOXES[0].color} imgSrc={MARKET_BOXES[0].image} size="large" />
                       </div>
                   </div>

                   {/* Featured Collection Heading */}
                   <div className="flex items-center gap-2 mb-5 px-1">
                      <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
                         <Star className="w-5 h-5 text-[#eab308]" />
                      </div>
                      <div className="flex flex-col">
                         <h3 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>Featured Collection</h3>
                         <p className="text-[#8e8e93] text-[13px] -mt-0.5" style={{ fontFamily: SF }}>VortX Premium Series Lootboxes</p>
                      </div>
                   </div>

                   {/* Featured Lootbox Card - Diseño Premium */}
                   <div className="w-full bg-[#111111] rounded-[28px] p-5 flex flex-col border border-[#2c2c2e] shadow-2xl mb-8 relative group active:scale-[0.99] transition-transform">
                       {/* verified y header */}
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] font-medium" style={{ fontFamily: SF }}>
                             <BadgeCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
                             VortX Certified
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Heart className="w-4 h-4 text-[#636366] hover:text-[#ff3b30] transition-colors" />
                             <MoreHorizontal className="w-4 h-4 text-[#636366]" />
                          </div>
                       </div>
                       {/* imagen y info */}
                       <div className="flex items-center gap-5 mb-5">
                          <div className="w-[110px] h-[110px] rounded-[22px] bg-[#0a0a0b] flex items-center justify-center border border-[#1c1c1e] shrink-0 p-1">
                              <LootboxVisual color={MARKET_BOXES[0].color} imgSrc={MARKET_BOXES[0].image} size="large" />
                          </div>
                          <div className="flex flex-col flex-1">
                             <h4 className="text-white font-bold text-[18px] mb-1" style={{ fontFamily: SFD }}>{MARKET_BOXES[0].name} Box</h4>
                             <p className="text-[#8e8e93] text-[13px] leading-relaxed line-clamp-2" style={{ fontFamily: SF }}>{MARKET_BOXES[0].description}</p>
                             <div className="flex items-center gap-1.5 mt-2 bg-[#1c1c1e] p-1.5 rounded-full border border-[#2c2c2e] w-fit">
                                <img src="/telegram-star-icon.png" draggable={false} className="w-3 h-3 pointer-events-none select-none" alt="Star" />
                                <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{MARKET_BOXES[0].price} Stars</span>
                             </div>
                          </div>
                       </div>
                       {/* boton market */}
                       <button type="button" onClick={() => setViewingBoxId(MARKET_BOXES[0].id)} className="w-full bg-[#1c1c1e] text-white font-bold text-[15px] py-3 rounded-[16px] flex justify-center items-center gap-2 active:scale-95 transition-all shadow-[0_0_10px_rgba(59,130,246,0.15)] border border-[#2c2c2e]" style={{ fontFamily: SF }}>
                          View Market
                       </button>
                   </div>

                   {/* Browse Heading */}
                   <div className="flex items-center justify-between gap-2 mb-5 px-1 pt-2 border-t border-[#1c1c1e]">
                      <h3 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>Browse Lootboxes <span className="text-[#8e8e93] font-medium text-[16px]">{MARKET_BOXES.length - 1}</span></h3>
                      <button type="button" className="text-[#3b82f6] text-[13px] font-bold" style={{ fontFamily: SF }}>See all</button>
                   </div>

                   {/* Main Lootboxes Grid - Estilo Auctions */}
                   <div className="grid grid-cols-2 gap-4 mt-2 mb-10">
                      {MARKET_BOXES.slice(1).map((box) => (
                         <div 
                            key={box.id} 
                            onClick={() => setViewingBoxId(box.id)}
                            className="bg-[#111111] rounded-[24px] p-3 flex flex-col border border-[#1c1c1e] shadow-lg cursor-pointer transition-all hover:bg-[#161618]"
                         >
                            {/*verified y header */}
                            <div className="flex justify-between items-center px-1 mb-3">
                               <div className="flex items-center gap-1 text-[#8e8e93] text-[11px] font-medium" style={{ fontFamily: SF }}>
                                  <BadgeCheck className="w-3 h-3 text-[#3b82f6]" />
                                  Certified
                               </div>
                               <Heart className="w-3.5 h-3.5 text-[#636366] hover:text-[#ff3b30] transition-colors" />
                            </div>

                            {/*imagen */}
                            <div className="w-full aspect-square bg-[#0a0a0b] rounded-[18px] overflow-hidden relative flex items-center justify-center border border-[#1c1c1e] p-1">
                               {box.isSoldOut && <div className="absolute top-2.5 left-2.5 bg-[#3a1a1a]/80 backdrop-blur-sm text-[#ff4d4d] px-[6px] py-[2px] rounded text-[10px] font-bold z-30 border border-[#4a1a1a]">Sold out</div>}
                               <LootboxVisual color={box.color} imgSrc={box.image} size="normal" />
                            </div>
                            
                            {/*info */}
                            <div className="flex flex-col flex-1 pt-3 mb-1.5">
                               <span className="text-white font-bold text-[14px] px-1 truncate leading-tight" style={{ fontFamily: SFD }}>
                                  {box.name} Box
                               </span>
                               <p className="text-[#8e8e93] text-[11px] px-1 line-clamp-1" style={{ fontFamily: SF }}>{box.collection}</p>
                               <div className="flex items-center gap-1.5 px-1.5 mt-2 bg-[#1c1c1e] p-1 rounded-full border border-[#2c2c2e] w-fit">
                                  <img src="/telegram-star-icon.png" className="w-3 h-3 pointer-events-none select-none" draggable={false} alt="Star" />
                                  <span className="text-white font-bold text-[13px]" style={{ fontFamily: SF }}>{box.price} Stars</span>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>

                   {/* Inventory Heading */}
                   <div className="flex items-center gap-2 mb-5 px-1 pt-2 border-t border-[#1c1c1e]">
                      <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
                         <Gift className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div className="flex flex-col">
                         <h3 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>My Inventory</h3>
                         <p className="text-[#8e8e93] text-[13px] -mt-0.5" style={{ fontFamily: SF }}>You currently have <span className="font-bold">0</span> unopened boxes</p>
                      </div>
                   </div>

                   {/* Stylized Inventory */}
                   <div className="w-full bg-[#111111] rounded-[28px] p-6 flex items-center gap-5 border border-[#1c1c1e] shadow-inner mb-12 opacity-60">
                      <div className="w-[100px] h-[100px] relative flex justify-center items-center shrink-0">
                         {/* Stack Visual */}
                         <div className="absolute z-10 w-[60px] h-[60px] bg-[#0d0d0f] rounded-[18px] -translate-x-[40px] rotate-[-15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40 shadow-inner">
                             <LootboxVisual color={MARKET_BOXES[1].color} imgSrc={MARKET_BOXES[1].image} size="normal" />
                         </div>
                         <div className="absolute z-10 w-[60px] h-[60px] bg-[#0d0d0f] rounded-[18px] translate-x-[40px] rotate-[15deg] flex items-center justify-center border border-[#1c1c1e] opacity-40 shadow-inner">
                             <LootboxVisual color={MARKET_BOXES[2].color} imgSrc={MARKET_BOXES[2].image} size="normal" />
                         </div>
                         <div className="relative z-20 w-[80px] h-[80px] bg-[#141415] rounded-[22px] flex items-center justify-center border border-[#2c2c2e] shadow-xl">
                             <LootboxVisual color={MARKET_BOXES[0].color} imgSrc={MARKET_BOXES[0].image} size="large" />
                         </div>
                      </div>
                      <div className="flex flex-col flex-1 items-start text-left">
                         <h4 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>Unopened Boxes</h4>
                         <p className="text-[#8e8e93] text-[13px] mb-3 leading-tight" style={{ fontFamily: SF }}>Contains high value digital gifts. Open now to unlock rewards.</p>
                         <button type="button" disabled className="w-full max-w-[140px] bg-[#1c1c1e] text-[#636366] font-bold text-[14px] py-2 rounded-[14px] transition-all border border-[#2c2c2e]" style={{ fontFamily: SF }}>Open Boxes</button>
                      </div>
                   </div>

                 </div>
               )}

               {/* ── CONTENIDO: AUCTIONS (Controles Funcionales y Vistas) ── */}
               {activeTab === 'Auctions' && (
                 <div className="flex flex-col w-full px-5 pt-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    <button type="button" onClick={() => setIsAddGiftOpen(true)} className="w-full bg-[#3b82f6] text-white py-3.5 rounded-[16px] font-bold text-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-6" style={{ fontFamily: SF }}>
                       <Plus className="w-5 h-5" /> Add Gift
                    </button>

                    {/* BARRA DE BÚSQUEDA Y CONTROLES (Estilo image 1000010068) */}
                    <div className="flex gap-2 w-full mb-3 relative">
                       <div className="flex-1 bg-[#1c1c1e] rounded-[16px] flex items-center px-4 gap-2 border border-[#2c2c2e]">
                          <Search className="w-5 h-5 text-[#8e8e93]" />
                          <input type="text" placeholder="Search" className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#8e8e93]" style={{ fontFamily: SF }} />
                       </div>
                       
                       <button type="button" className="w-[44px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-[#8e8e93] border border-[#2c2c2e] active:scale-95 transition-transform shrink-0">
                          <ArrowDownUp className="w-5 h-5" />
                       </button>

                       <button type="button" className="w-[44px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-[#8e8e93] border border-[#2c2c2e] active:scale-95 transition-transform shrink-0">
                          <Copy className="w-5 h-5" />
                       </button>

                       <button 
                          type="button"
                          onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                          className="w-[44px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-white border border-[#2c2c2e] active:scale-95 transition-transform shrink-0 shadow-sm"
                       >
                          {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                       </button>
                    </div>

                    {/* FILTROS SECUNDARIOS */}
                    <div className="flex gap-2 w-full mb-4 relative">
                       <button type="button" className="w-[44px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-white border border-[#2c2c2e] active:scale-95 transition-transform shrink-0">
                          <SlidersHorizontal className="w-5 h-5" />
                       </button>
                       
                       <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar relative">
                          <div className="relative shrink-0 w-full">
                             <button type="button" onClick={() => setOpenDropdown(openDropdown === 'sale' ? null : 'sale')} className={`w-full h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'sale' ? 'border-[#3b82f6] text-white' : 'border-[#2c2c2e] text-white'} transition-colors`} style={{ fontFamily: SF }}>
                                {filters.sale} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                             </button>
                             {openDropdown === 'sale' && (
                               <div className="absolute top-[50px] left-0 bg-[#2c2c2e] border border-[#3a3a3c] rounded-[12px] shadow-xl w-full py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  {FILTER_OPTIONS.sale.map(opt => (
                                     <div key={opt} onClick={() => { setFilters({...filters, sale: opt}); setOpenDropdown(null) }} className="px-4 py-2.5 text-white text-[13px] font-medium hover:bg-[#3a3a3c] cursor-pointer">{opt}</div>
                                  ))}
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* ── RENDERIZADO DEL GRID O LISTA ── */}
                    {viewMode === 'grid' ? (
                       <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in duration-300">
                          {AUCTION_ITEMS.map((item) => (
                             <div 
                                key={item.id} 
                                onClick={() => setViewingAuctionId(item.id)}
                                className="bg-[#111111] rounded-[20px] p-2 flex flex-col border border-[#1c1c1e] shadow-md cursor-pointer hover:bg-[#161618] transition-colors"
                             >
                                <div className="w-full aspect-square bg-[#1c1c1e] rounded-[16px] overflow-hidden relative flex items-center justify-center p-1">
                                   <img src={item.imgSrc} alt={item.title} draggable={false} className="w-full h-full object-cover rounded-[12px] pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
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
                                      <img src="/telegram-star-icon.png" className="w-2.5 h-2.5 pointer-events-none select-none" draggable={false} alt="Star" />
                                   </div>
                                   <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{item.gridPrice}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
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
                                            <img src={item.imgSrc} alt={item.title} draggable={false} className="w-full h-full object-cover pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
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
                                         type="button"
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
                                                  <img src="/telegram-star-icon.png" className="w-3 h-3 pointer-events-none select-none grayscale opacity-70" draggable={false} alt="Star" /> {attr.price}
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

      {/* ── MODAL "MAKE OFFER" (PLACE BID) ── */}
      {isMakeOfferOpen && activeAuctionData && (
         <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsMakeOfferOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#2c2c2e] flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
             
             <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
             
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD }}>Make Offer</h2>
                <button type="button" onClick={() => setIsMakeOfferOpen(false)} className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center text-white active:scale-95 transition-transform">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex items-center gap-3 bg-[#111111] border border-[#1c1c1e] p-3 rounded-[16px] mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-[#1c1c1e] overflow-hidden flex items-center justify-center shrink-0">
                   <img src={activeAuctionData.imgSrc} draggable={false} className="w-full h-full object-contain pointer-events-none select-none" style={{ WebkitTouchCallout: 'none' }} alt="NFT" />
                </div>
                <div className="flex flex-col">
                   <span className="text-white font-bold text-[15px] leading-tight" style={{ fontFamily: SF }}>{activeAuctionData.title} <span className="text-[#8e8e93] font-medium">{activeAuctionData.tag}</span></span>
                   <span className="text-[#8e8e93] text-[12px] font-medium" style={{ fontFamily: SF }}>{activeAuctionData.collection}</span>
                </div>
             </div>

             {/* Your Price Box */}
             <div className="bg-[#111111] border border-[#1c1c1e] rounded-[20px] p-4 flex flex-col gap-4 mb-4 relative">
                <div className="flex flex-col">
                   <span className="text-white font-bold text-[16px]" style={{ fontFamily: SFD }}>Your Price</span>
                   <span className="text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>Current price — {activeAuctionData.estValue} Stars</span>
                </div>
                
                <div className="bg-[#1c1c1e] rounded-[16px] p-4 flex items-center justify-between border border-[#2c2c2e] relative overflow-visible">
                   <div className="flex items-center gap-3 w-fit">
                      {/* Icono de Estrella Grande y Centrado (Sin Círculo) */}
                      <img src="/telegram-star-icon.png" draggable={false} className="w-8 h-8 pointer-events-none select-none" alt="Star" />
                      
                      <input 
                         type="text" 
                         inputMode="numeric" 
                         placeholder="0" 
                         value={offerInput}
                         onChange={handleOfferInput}
                         className="bg-transparent text-white font-bold text-[24px] outline-none placeholder:text-[#636366] -ml-0.5 flex-1"
                         style={{ fontFamily: SFD }}
                      />
                   </div>
                   <span className="text-[#8e8e93] font-medium text-[15px] pl-3" style={{ fontFamily: SF }}>≈ ${(offerNumValue * 0.013).toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                   <div className="flex items-center justify-between">
                      <span className="text-[#8e8e93] text-[14px] flex items-center gap-1" style={{ fontFamily: SF }}>Service Fee <Info className="w-3 h-3" /></span>
                      <span className="text-white font-bold text-[14px]">{serviceFee} Stars</span>
                   </div>
                   <div className="flex items-center justify-between pt-2 border-t border-[#1c1c1e]">
                      <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>Seller will get</span>
                      <span className="text-white font-bold text-[15px]">{sellerGets} Stars</span>
                   </div>
                </div>
             </div>

             {/* Offer Duration */}
             <div className="bg-[#111111] border border-[#1c1c1e] rounded-[20px] p-4 flex flex-col mb-4 border border-[#2c2c2e]">
                <span className="text-white font-bold text-[16px] mb-3" style={{ fontFamily: SFD }}>Offer Duration</span>
                <button type="button" className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] p-4 flex justify-between items-center text-white font-medium text-[15px] mb-3" style={{ fontFamily: SF }}>
                   7 days <ChevronDown className="w-5 h-5 text-[#8e8e93]" />
                </button>
                <p className="text-[#8e8e93] text-[13px] leading-relaxed" style={{ fontFamily: SF }}>
                   If the owner does not accept your offer within this period of time, the paid Stars will be sent back to your balance.
                </p>
             </div>

             <div className="flex gap-3 bg-[#111111] border border-[#1c1c1e] p-4 rounded-[20px] mb-6 border border-[#2c2c2e]">
                <Bell className="w-5 h-5 text-[#8e8e93] shrink-0 mt-0.5" />
                <span className="text-[#8e8e93] text-[14px] leading-relaxed" style={{ fontFamily: SF }}>
                   We will notify the NFT owner about your offer via a notification.
                </span>
             </div>

             <div className="flex flex-col gap-3 pt-4 border-t border-[#1c1c1e]">
                <div className="flex gap-3">
                   <button type="button" disabled={!isOfferValid} className={`flex-1 ${isOfferValid ? 'bg-[#3b82f6] text-white active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-[#1c1c1e] text-[#636366]'} font-bold text-[16px] py-4 rounded-[16px] transition-all`} style={{ fontFamily: SF }}>
                      Send
                   </button>
                   <button type="button" onClick={() => { setIsMakeOfferOpen(false); setIsTopUpOpen(true); }} className="w-[56px] h-[56px] bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center rounded-[16px] text-white active:scale-95 transition-transform shrink-0">
                      <img src="/telegram-star-icon.png" className="w-6 h-6 grayscale opacity-80 pointer-events-none select-none" draggable={false} alt="Top Up" />
                   </button>
                </div>
                <div className="flex justify-center items-center gap-3">
                   <span className="text-[#8e8e93] text-[13px] font-medium" style={{ fontFamily: SF }}>Balance: <img src="/telegram-star-icon.png" className="w-3 h-3 inline-block -mt-0.5 pointer-events-none select-none" draggable={false} /> {myStars.toLocaleString()}</span>
                   <button type="button" onClick={() => { setIsMakeOfferOpen(false); setIsTopUpOpen(true); }} className="text-white text-[13px] font-bold flex items-center gap-1 hover:text-[#3b82f6] transition-colors"><Plus className="w-3 h-3" /> Buy Stars</button>
                </div>
             </div>
          </div>
         </div>
      )}

      {/* ── MODAL "ADD GIFT" (Lista Limpia Original) ── */}
      {isAddGiftOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsAddGiftOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#2c2c2e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
             
             {addGiftStep === 'choose_type' ? (
                /* PASO 1: ELEGIR TIPO */
                <>
                   <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex justify-center items-center mb-6 relative">
                      <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>Choose a type</h2>
                   </div>
                   
                   <div className="flex flex-col gap-0 px-1">
                      <button type="button" onClick={() => handleAddGiftSelection('fixed')} className="w-full flex items-center justify-between py-4 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-md">
                               <Tag className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                               <span className="text-white font-bold text-[16px]" style={{ fontFamily: SF }}>Fixed Price</span>
                               <span className="text-[#8e8e93] text-[12px] leading-tight mt-1 pr-2" style={{ fontFamily: SF }}>Enter a price to allow users to purchase your NFT instantly</span>
                            </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-[#636366] shrink-0 group-hover:text-white transition-colors" />
                      </button>

                      <button type="button" onClick={() => handleAddGiftSelection('auction')} className="w-full flex items-center justify-between py-4 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-md">
                               <Gavel className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                               <span className="text-white font-bold text-[16px]" style={{ fontFamily: SF }}>Auction</span>
                               <span className="text-[#8e8e93] text-[12px] leading-tight mt-1 pr-2" style={{ fontFamily: SF }}>Allow other users to make bids on your NFT</span>
                            </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-[#636366] shrink-0 group-hover:text-white transition-colors" />
                      </button>

                      <button type="button" onClick={() => handleAddGiftSelection('falling')} className="w-full flex items-center justify-between py-4 active:bg-[#111111] transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#14b8a6] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-md">
                               <ArrowDown className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                               <span className="text-white font-bold text-[16px]" style={{ fontFamily: SF }}>Falling Price</span>
                               <span className="text-[#8e8e93] text-[12px] leading-tight mt-1 pr-2" style={{ fontFamily: SF }}>Price decreases over time until it reaches the minimum</span>
                            </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-[#636366] shrink-0 group-hover:text-white transition-colors" />
                      </button>
                   </div>
                </>
             ) : (
                /* PASO 2: SELECCIONAR GIFT */
                <>
                   <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex items-center justify-between mb-6">
                      <button type="button" onClick={() => setAddGiftStep('choose_type')} className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white active:scale-95 transition-transform">
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Select a Gift</h2>
                      <div className="w-8" /> {/* Spacer */}
                   </div>
                   
                   {/* EMPTY STATE - Con Filtro de Color Profile View */}
                   <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-[120px] h-[120px] mb-6 relative">
                         <img 
                           src="/empty-gift.gif" 
                           alt="Empty" 
                           draggable={false}
                           className="w-full h-full object-contain pointer-events-none select-none"
                           style={{ filter: "grayscale(100%) opacity(0.7)", WebkitTouchCallout: "none" }} 
                           onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/telegram-star-icon.png'; }}
                         />
                      </div>
                      <h3 className="text-white font-bold text-[20px] mb-2" style={{ fontFamily: SFD }}>No gifts found</h3>
                      <p className="text-[#8e8e93] text-[14px] max-w-[250px] mx-auto" style={{ fontFamily: SF }}>
                         You don't have any Gifts available to list right now. Open Lootboxes or buy them in the market.
                      </p>
                   </div>
                </>
             )}
          </div>
        </div>
      )}

      {/* ── MODAL TOP UP ── */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsTopUpOpen(false)} />
          <div className="relative w-full bg-black rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>Top UP</h2>
            <div className="flex flex-col items-center mb-8">
               <div className={`flex items-center justify-center gap-3 ${isError ? 'animate-shake' : ''}`}>
                 <img src="/telegram-star-icon.png" alt="Star" draggable={false} className="w-[42px] h-[42px] pointer-events-none select-none" style={{ WebkitTouchCallout: 'none' }} />
                 <input type="text" inputMode="numeric" value={displayValue} onChange={handleStarInput} placeholder="0" style={{ width: displayValue ? `${displayValue.length}ch` : '1.2ch', fontFamily: SFD }} className={`bg-transparent font-bold text-[56px] outline-none caret-[#3b82f6] ${isError ? 'text-[#ff3b30]' : 'text-white'}`} />
               </div>
               <span className={`text-[13px] mt-2 font-medium ${isError ? 'text-[#ff3b30]' : 'text-[#636366]'}`} style={{ fontFamily: SF }}>Buy between 15 and 150,000 stars</span>
               <button type="button" disabled={!isValid} className={`mt-5 w-full max-w-[300px] py-3.5 rounded-[14px] font-bold text-[17px] active:scale-95 transition-transform ${isValid ? 'bg-[#3b82f6] text-white shadow-lg' : 'bg-[#1c1c1e] text-[#636366]'}`} style={{ fontFamily: SF }}>Buy {displayValue || '0'} Stars</button>
            </div>
            <p className="text-[#3b82f6] font-semibold text-[15px] mb-1 px-2" style={{ fontFamily: SF }}>choose package</p>
            <div className="flex flex-col pb-6">
              {STAR_PACKAGES.map((pkg, i) => (
                <button type="button" key={i} className="flex items-center justify-between py-3 px-2 border-b border-[#1c1c1e] active:bg-[#111111] rounded-lg transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="relative flex items-center" style={{ width: `${22 + (pkg.count - 1) * 4.5}px`, height: '22px' }}>
                        {Array.from({ length: pkg.count }).map((_, idx) => (
                           <img key={idx} src="/telegram-star-icon.png" draggable={false} className="absolute top-0 h-[22px] w-[22px] pointer-events-none select-none" style={{ left: `${idx * 4.5}px`, zIndex: 20 - idx, filter: "drop-shadow(1.5px 0px 0px #000000)", WebkitTouchCallout: "none" }} alt="star" />
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
