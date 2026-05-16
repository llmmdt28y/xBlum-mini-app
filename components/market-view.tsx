"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { 
  Plus, Star, ArrowDown, X, Info, Shield, Cpu, Sparkles, Loader2, 
  Tag, Gem, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, 
  ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, 
  MoreHorizontal, BadgeCheck, Copy, ChevronRight, ChevronLeft, 
  Gift, Layers3, KeyRound, Users, Send
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (ACTUALIZADA CON TUS NUEVOS CASES) ──
const MARKET_BOXES = [
  { id: 'free', name: 'Free Case', subName: '', color: '#ef4444', image: '/free-gift-box.png', price: 'Open Free', type: 'hero' },
  // Tus 3 nuevos casos:
  { id: 'blum_rocket', name: 'xBlum Starship', subName: '', color: '#3b82f6', image: '/1000010769.png', price: '5.00', type: 'standard' },
  { id: 'purple_void', name: 'Violet Void', subName: '', color: '#a855f7', image: '/1000010760.png', price: '10.00', type: 'standard' },
  { id: 'crimson_core', name: 'Crimson Core', subName: '', color: '#ef4444', image: '/1000010761.png', price: '25.00', type: 'standard' }
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
    estValue: '100,000', 
    fiatValue: '$6,210.52',
    attributes: [
        { name: 'Model', value: 'Genesis Drop', rarity: '2%', price: '4,350', rarityColor: 'text-[#3b82f6] bg-[#3b82f6]/10' },
        { name: 'Symbol', value: 'Bull Market Red', rarity: '1.5%', price: '4,210', rarityColor: 'text-[#c084fc] bg-[#c084fc]/10' }
    ],
    owned: true,
    gridPrice: '100,000'
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

const FILTER_OPTIONS = {
   sale: ['All', 'Free', 'New', 'Popular'],
}

const animationStyles = `
  @keyframes box-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .animate-box-float { animation: box-float 3.5s ease-in-out infinite; }
  @keyframes shake-error { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
  .animate-shake { animation: shake-error 0.4s ease-in-out; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── COMPONENTE LootboxVisual (Se usa en la vista de UNBOXING, no en el grid) ──
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

  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'Explore' | 'Auctions' | 'Listed'>('Explore')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'All' | 'Free' | 'New' | 'Popular'>('All')

  const [openDropdown, setOpenDropdown] = useState<'sale' | null>(null)
  const [filters, setFilters] = useState({ sale: 'For sale' })
  const [boxViewMode, setBoxViewMode] = useState<'grid' | 'list'>('grid')

  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [addGiftStep, setAddGiftStep] = useState<'choose_type' | 'select_gift'>('choose_type')
  const [listingType, setListingType] = useState<'fixed' | 'auction' | 'falling' | null>(null)

  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false)
  const [offerInput, setOfferInput] = useState("")

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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
   
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if (isMakeOfferOpen) setIsMakeOfferOpen(false)
      else if (isAddGiftOpen) {
         if (addGiftStep === 'select_gift') setAddGiftStep('choose_type') 
         else setIsAddGiftOpen(false) 
      }
      else if (viewingBoxId) setViewingBoxId(null) 
      else if (viewingAuctionId) setViewingAuctionId(null) 
      else { setCurrentView("home"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView, viewingBoxId, viewingAuctionId, isAddGiftOpen, addGiftStep, isMakeOfferOpen])

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

  const closeRoulette = () => { setOpeningState('idle'); setTracks([]) }
  const toggleExpandAuction = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setExpandedAuctionId(prev => prev === id ? null : id) }
  const handleAddGiftSelection = (type: 'fixed' | 'auction' | 'falling') => { setListingType(type); setAddGiftStep('select_gift') }

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

  // ── COMPONENTE PÍLDORA TOP UP ──
  const TopUpPill = () => (
    <button 
       type="button" 
       onClick={() => setIsTopUpOpen(true)} 
       className="bg-[#000000]/60 backdrop-blur-md transform-gpu translate-z-0 will-change-transform rounded-full px-6 h-[36px] flex items-center justify-center gap-2 border border-white/[0.06] shadow-sm transition-transform active:scale-95"
    >
       <div className="flex items-center justify-center">
          <img 
            src="/telegram-star-icon.png" 
            alt="Stars" 
            className="w-[16px] h-[16px] object-contain pointer-events-none select-none" 
            style={{ WebkitTouchCallout: "none" }} 
          />
       </div>
       <span className="text-[#facc15] font-bold text-[14px] leading-none mt-[1px]" style={{ fontFamily: SFD }}>
          {myStars.toLocaleString('en-US')} Stars
       </span>
    </button>
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] relative overflow-hidden" ref={dropdownRef}>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* ── AMBIENT GLOWS OPTIMIZADOS (0% LAG) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(42,47,58,0.2) 0%, rgba(42,47,58,0) 70%)' }} />
      <div className="absolute top-[0%] right-[-10%] w-[60%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(74,56,48,0.2) 0%, rgba(74,56,48,0) 70%)' }} />
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(30,31,36,0.3) 0%, rgba(30,31,36,0) 70%)' }} />
      <div className="absolute bottom-[-10%] left-[10%] w-[70%] h-[40%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(43,38,51,0.2) 0%, rgba(43,38,51,0) 70%)' }} />

      {/* Ocultar Navbar Global en Vistas Detalladas */}
      {(viewingBoxId || viewingAuctionId) && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER iOS PREMIUM (FIXED) ── */}
      {!viewingBoxId && !viewingAuctionId && (
        <div className="fixed top-0 left-0 right-0 z-[100] px-5 pb-4 pt-8 bg-[#0a0a0b]/80 backdrop-blur-lg transform-gpu translate-z-0 will-change-transform border-b border-white/[0.04] shadow-[0_10px_30px_rgba(10,10,11,0.7)] pointer-events-auto">
           <div className="flex items-center justify-center mb-4 mt-2">
             <TopUpPill />
           </div>

           <div className="w-full">
              <div className="relative w-full h-[46px] bg-[#161618]/60 backdrop-blur-md transform-gpu translate-z-0 rounded-full border border-white/[0.04] flex items-center p-1.5 shadow-inner">
                 <div 
                    className="absolute h-[34px] bg-[#2c2c2e] rounded-full transition-transform duration-300 ease-out shadow-sm border border-white/[0.04] will-change-transform"
                    style={{ 
                       width: 'calc(33.33% - 4px)',
                       transform: `translateX(${activeTab === 'Explore' ? '4px' : activeTab === 'Auctions' ? 'calc(100% + 4px)' : 'calc(200% + 4px)'})`
                    }}
                 />
                 <button onClick={() => setActiveTab('Explore')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Explore' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Explore</button>
                 <button onClick={() => setActiveTab('Auctions')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Auctions' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Auctions</button>
                 <button onClick={() => setActiveTab('Listed')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Listed' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Listed</button>
              </div>
           </div>
        </div>
      )}

      {/* ── ÁREA DE SCROLL PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto relative z-10 w-full h-full pb-32">
        
        {!viewingBoxId && !viewingAuctionId && (
           <div className="w-full h-[140px] shrink-0 pointer-events-none" />
        )}
        
        {/* ── VISTA DETALLE DE LOOTBOX (UNBOXING) ── */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 min-h-screen pb-20 pt-8 px-5">
             <div className="flex items-center justify-between mb-8">
                <div className="w-8" />
                <h2 className="text-white font-bold text-[24px] text-center" style={{ fontFamily: SFD }}>{activeBoxData.name}</h2>
                <TopUpPill />
             </div>
             
             <div className="flex flex-col items-center pt-12">
                <div className="w-full flex flex-col items-center relative py-4 px-5">
                   <div className="absolute left-1/2 top-[24px] -translate-x-1/2 z-[60] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />
       
                    {openingState === 'idle' ? (
                      <div className="w-full h-[160px] relative flex justify-center items-center overflow-hidden animate-in fade-in duration-500 rounded-[24px]">
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
                        <div className="relative z-30 w-[110px] h-[110px] bg-[#141415] rounded-[28px] flex items-center justify-center border border-[#3b82f6]/40 shadow-lg">
                           <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size="large" />
                        </div>
                     </div>
                   ) : (
                      <div className="w-full flex flex-col gap-4 relative overflow-hidden py-2 animate-in fade-in duration-300 mt-2">
                        <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-[#0a0a0b] to-transparent z-40 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-[#0a0a0b] to-transparent z-40 pointer-events-none" />
                        {tracks.map((track, trackIdx) => (
                          <div key={trackIdx} className="w-full h-[110px] relative flex items-center overflow-visible">
                              <div
                                className="flex gap-3 absolute left-1/2 transform-gpu will-change-transform"
                                style={{
                                  transform: openingState === 'spinning' && isSpinningActive
                                    ? `translate3d(calc(-50px - ${25 * 112}px), 0, 0)`
                                    : openingState === 'result'
                                    ? `translate3d(calc(-50px - ${25 * 112}px), 0, 0)`
                                    : `translate3d(-50px, 0, 0)`,
                                  transition: isSpinningActive ? `transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)` : 'none',
                                }}
                              >
                                {track.items.map((item, idx) => {
                                   const isWinnerCard = idx === 25;
                                   const isResult = openingState === 'result';
                
                                   return (
                                     <div key={idx} className={`w-[100px] h-[100px] flex-shrink-0 flex flex-col items-center justify-center rounded-[24px] border transition-all duration-700 transform-gpu ${isResult && !isWinnerCard ? 'opacity-0 scale-50' : isResult && isWinnerCard ? 'opacity-100 scale-110 bg-[#111111] border border-[#3b82f6] shadow-lg z-50' : 'bg-[#0d0d0f] border border-[#2c2c2e] opacity-80 shadow-sm'}`}>
                                        {item.type === 'dummy' ? (
                                         <span className="text-white/30 font-bold text-4xl" style={{ fontFamily: SFD }}>?</span>
                                        ) : (
                                         <>
                                            <item.icon className="w-10 h-10 drop-shadow-sm" style={{ color: item.color }} />
                                            {isResult && <span className="text-[#8e8e93] font-bold text-[11px] text-center px-1 mt-2 leading-tight animate-in fade-in zoom-in duration-500 delay-300" style={{ fontFamily: SF }}>{item.name}</span>}
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
                
                <div className="w-full flex flex-col items-center min-h-[90px] justify-center px-5 mt-2 mb-10">
                  {openingState === 'idle' ? (
                     <>
                        <button type="button" onClick={() => startRoulette(1)} className="w-full bg-[#3b82f6] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-md mb-3" style={{ fontFamily: SF }}>
                           <span>Open for {activeBoxData.price}</span> 
                           {activeBoxData.type !== 'hero' && <img src="/telegram-star-icon.png" draggable={false} className="w-[18px] h-[18px] object-contain -mt-[2px] pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} alt="Star" />}
                        </button>
                        <button type="button" onClick={() => startRoulette(3)} className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 transition-opacity" style={{ fontFamily: SF }}>
                           Open 3x for {typeof activeBoxData.price === 'number' ? activeBoxData.price * 3 : 'Free'}
                        </button>
                     </>
                   ) : openingState === 'spinning' ? (
                     <button type="button" disabled className="w-full bg-[#ef4444] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 shadow-sm transition-colors animate-in fade-in zoom-in duration-300" style={{ fontFamily: SF }}>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Opening...
                      </button>
                  ) : (
                     <button type="button" onClick={closeRoulette} className="w-full bg-[#10b981] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300" style={{ fontFamily: SF }}>
                        Collect {tracks.length > 1 ? 'Items' : 'Item'}
                     </button>
                  )}
               </div>

               {/* SECCIÓN "WEAPON CASE" */}
               <div className="w-full flex flex-col px-5 border-t border-[#1c1c1e] pt-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[#8e8e93] text-[13px] font-medium mb-0.5" style={{ fontFamily: SF }}>What's Inside</span>
                        <h3 className="text-white font-bold text-[24px] tracking-tight" style={{ fontFamily: SFD }}>
                           {activeBoxData.name} Items
                        </h3>
                     </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setBoxViewMode(v => v === 'grid' ? 'list' : 'grid')} className="w-[38px] h-[38px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center text-white border border-[#2c2c2e] active:scale-95 transition-transform shadow-sm">
                           {boxViewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                        </button>
                        <button type="button" className="w-[38px] h-[38px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center text-[#8e8e93] border border-[#2c2c2e] active:scale-95 transition-transform">
                           <ArrowDownUp className="w-4 h-4" />
                        </button>
                     </div>
                  </div>

                  <div className="w-full bg-[#1c1c1e] rounded-[14px] flex items-center px-4 py-2.5 gap-2 border border-[#2c2c2e] mb-5">
                     <Search className="w-5 h-5 text-[#8e8e93]" />
                     <input type="text" placeholder="Search items..." className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#636366]" style={{ fontFamily: SF }} />
                  </div>

                  {boxViewMode === 'grid' ? (
                     <div className="grid grid-cols-2 gap-3 pb-8">
                        {INSIDE_ITEMS.map((item) => (
                           <div key={item.id} className="bg-[#111111] rounded-[16px] p-1 flex flex-col border border-[#1c1c1e] shadow-sm hover:bg-[#161618] transition-colors cursor-pointer relative overflow-hidden">
                               <div className="absolute top-1.5 right-1.5 bg-[#3b82f6] text-white font-bold text-[8px] px-1.5 py-[1px] rounded-full z-10 shadow-sm border border-white/10">
                                 {item.drop}
                              </div>
                              <div className="w-full aspect-square bg-[#1c1c1e] rounded-[12px] overflow-hidden relative flex items-center justify-center p-0.5```tsx
"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { 
  Plus, Star, ArrowDown, X, Info, Shield, Cpu, Sparkles, Loader2, 
  Tag, Gem, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, 
  ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, 
  MoreHorizontal, BadgeCheck, Copy, ChevronRight, ChevronLeft, 
  Gift, Layers3, KeyRound, Users, Send
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (ACTUALIZADA CON TUS NUEVOS CASES Y TEXTOS) ──
const MARKET_BOXES = [
  { id: 'free', name: 'Free Case', subName: '', color: '#ef4444', image: '/free-gift-box.png', price: 'Open Free', type: 'hero' },
  // Tus 3 nuevos casos remplazados, ajustados y renombrados:
  { id: 'blum_rocket', name: 'xBlum Starship', subName: '', color: '#3b82f6', image: '/1000010769.png', price: '5.00', type: 'standard' },
  { id: 'purple_void', name: 'Violet Void', subName: '', color: '#a855f7', image: '/1000010760.png', price: '10.00', type: 'standard' },
  { id: 'crimson_core', name: 'Crimson Core', subName: '', color: '#ef4444', image: '/1000010761.png', price: '25.00', type: 'standard' }
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
    estValue: '100,000', 
    fiatValue: '$6,210.52',
    attributes: [
        { name: 'Model', value: 'Genesis Drop', rarity: '2%', price: '4,350', rarityColor: 'text-[#3b82f6] bg-[#3b82f6]/10' },
        { name: 'Symbol', value: 'Bull Market Red', rarity: '1.5%', price: '4,210', rarityColor: 'text-[#c084fc] bg-[#c084fc]/10' }
    ],
    owned: true,
    gridPrice: '100,000'
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

const FILTER_OPTIONS = {
   sale: ['All', 'Free', 'New', 'Popular'],
}

const animationStyles = `
  @keyframes box-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .animate-box-float { animation: box-float 3.5s ease-in-out infinite; }
  @keyframes shake-error { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
  .animate-shake { animation: shake-error 0.4s ease-in-out; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── COMPONENTE LootboxVisual (Se usa en la vista de UNBOXING, mantiene flotación) ──
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

  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [starInput, setStarInput] = useState("")
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'Explore' | 'Auctions' | 'Listed'>('Explore')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'All' | 'Free' | 'New' | 'Popular'>('All')

  const [openDropdown, setOpenDropdown] = useState<'sale' | null>(null)
  const [filters, setFilters] = useState({ sale: 'For sale' })
  const [boxViewMode, setBoxViewMode] = useState<'grid' | 'list'>('grid')

  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [addGiftStep, setAddGiftStep] = useState<'choose_type' | 'select_gift'>('choose_type')
  const [listingType, setListingType] = useState<'fixed' | 'auction' | 'falling' | null>(null)

  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false)
  const [offerInput, setOfferInput] = useState("")

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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
   
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if (isMakeOfferOpen) setIsMakeOfferOpen(false)
      else if (isAddGiftOpen) {
         if (addGiftStep === 'select_gift') setAddGiftStep('choose_type') 
         else setIsAddGiftOpen(false) 
      }
      else if (viewingBoxId) setViewingBoxId(null) 
      else if (viewingAuctionId) setViewingAuctionId(null) 
      else { setCurrentView("home"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView, viewingBoxId, viewingAuctionId, isAddGiftOpen, addGiftStep, isMakeOfferOpen])

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

  const closeRoulette = () => { setOpeningState('idle'); setTracks([]) }
  const toggleExpandAuction = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setExpandedAuctionId(prev => prev === id ? null : id) }
  const handleAddGiftSelection = (type: 'fixed' | 'auction' | 'falling') => { setListingType(type); setAddGiftStep('select_gift') }

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

  // ── COMPONENTE PÍLDORA TOP UP ──
  const TopUpPill = () => (
    <button 
       type="button" 
       onClick={() => setIsTopUpOpen(true)} 
       className="bg-[#000000]/60 backdrop-blur-md transform-gpu translate-z-0 will-change-transform rounded-full px-6 h-[36px] flex items-center justify-center gap-2 border border-white/[0.06] shadow-sm transition-transform active:scale-95"
    >
       <div className="flex items-center justify-center">
          <img 
            src="/telegram-star-icon.png" 
            alt="Stars" 
            className="w-[16px] h-[16px] object-contain pointer-events-none select-none" 
            style={{ WebkitTouchCallout: "none" }} 
          />
       </div>
       <span className="text-[#facc15] font-bold text-[14px] leading-none mt-[1px]" style={{ fontFamily: SFD }}>
          {myStars.toLocaleString('en-US')} Stars
       </span>
    </button>
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] relative overflow-hidden" ref={dropdownRef}>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* ── AMBIENT GLOWS OPTIMIZADOS (0% LAG) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(42,47,58,0.2) 0%, rgba(42,47,58,0) 70%)' }} />
      <div className="absolute top-[0%] right-[-10%] w-[60%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(74,56,48,0.2) 0%, rgba(74,56,48,0) 70%)' }} />
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(30,31,36,0.3) 0%, rgba(30,31,36,0) 70%)' }} />
      <div className="absolute bottom-[-10%] left-[10%] w-[70%] h-[40%] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(43,38,51,0.2) 0%, rgba(43,38,51,0) 70%)' }} />

      {/* Ocultar Navbar Global en Vistas Detalladas */}
      {(viewingBoxId || viewingAuctionId) && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER iOS PREMIUM (FIXED) ── */}
      {!viewingBoxId && !viewingAuctionId && (
        <div className="fixed top-0 left-0 right-0 z-[100] px-5 pb-4 pt-8 bg-[#0a0a0b]/80 backdrop-blur-lg transform-gpu translate-z-0 will-change-transform border-b border-white/[0.04] shadow-[0_10px_30px_rgba(10,10,11,0.7)] pointer-events-auto">
           <div className="flex items-center justify-center mb-4 mt-2">
             <TopUpPill />
           </div>

           <div className="w-full">
              <div className="relative w-full h-[46px] bg-[#161618]/60 backdrop-blur-md transform-gpu translate-z-0 rounded-full border border-white/[0.04] flex items-center p-1.5 shadow-inner">
                 <div 
                    className="absolute h-[34px] bg-[#2c2c2e] rounded-full transition-transform duration-300 ease-out shadow-sm border border-white/[0.04] will-change-transform"
                    style={{ 
                       width: 'calc(33.33% - 4px)',
                       transform: `translateX(${activeTab === 'Explore' ? '4px' : activeTab === 'Auctions' ? 'calc(100% + 4px)' : 'calc(200% + 4px)'})`
                    }}
                 />
                 <button onClick={() => setActiveTab('Explore')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Explore' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Explore</button>
                 <button onClick={() => setActiveTab('Auctions')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Auctions' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Auctions</button>
                 <button onClick={() => setActiveTab('Listed')} className={`relative z-10 flex-1 text-center text-[14px] font-semibold transition-colors duration-300 ${activeTab === 'Listed' ? 'text-white' : 'text-[#8e8e93] hover:text-white/80'}`} style={{ fontFamily: SF }}>Listed</button>
              </div>
           </div>
        </div>
      )}

      {/* ── ÁREA DE SCROLL PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto relative z-10 w-full h-full pb-32">
        
        {!viewingBoxId && !viewingAuctionId && (
           <div className="w-full h-[140px] shrink-0 pointer-events-none" />
        )}
        
        {/* ── VISTA DETALLE DE LOOTBOX (UNBOXING) ── */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 min-h-screen pb-20 pt-8 px-5">
             <div className="flex items-center justify-between mb-8">
                <div className="w-8" />
                <h2 className="text-white font-bold text-[24px] text-center" style={{ fontFamily: SFD }}>{activeBoxData.name}</h2>
                <TopUpPill />
             </div>
             
             <div className="flex flex-col items-center pt-12">
                <div className="w-full flex flex-col items-center relative py-4 px-5">
                   <div className="absolute left-1/2 top-[24px] -translate-x-1/2 z-[60] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-white" />
       
                    {openingState === 'idle' ? (
                      <div className="w-full h-[160px] relative flex justify-center items-center overflow-hidden animate-in fade-in duration-500 rounded-[24px]">
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
                        <div className="relative z-30 w-[110px] h-[110px] bg-[#141415] rounded-[28px] flex items-center justify-center border border-[#3b82f6]/40 shadow-lg">
                           <LootboxVisual color={activeBoxData.color} imgSrc={activeBoxData.image} size="large" />
                        </div>
                     </div>
                   ) : (
                      <div className="w-full flex flex-col gap-4 relative overflow-hidden py-2 animate-in fade-in duration-300 mt-2">
                        <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-[#0a0a0b] to-transparent z-40 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-[#0a0a0b] to-transparent z-40 pointer-events-none" />
                        {tracks.map((track, trackIdx) => (
                          <div key={trackIdx} className="w-full h-[110px] relative flex items-center overflow-visible">
                              <div
                                className="flex gap-3 absolute left-1/2 transform-gpu will-change-transform"
                                style={{
                                  transform: openingState === 'spinning' && isSpinningActive
                                    ? `translate3d(calc(-50px - ${25 * 112}px), 0, 0)`
                                    : openingState === 'result'
                                    ? `translate3d(calc(-50px - ${25 * 112}px), 0, 0)`
                                    : `translate3d(-50px, 0, 0)`,
                                  transition: isSpinningActive ? `transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)` : 'none',
                                }}
                              >
                                {track.items.map((item, idx) => {
                                   const isWinnerCard = idx === 25;
                                   const isResult = openingState === 'result';
                
                                   return (
                                     <div key={idx} className={`w-[100px] h-[100px] flex-shrink-0 flex flex-col items-center justify-center rounded-[24px] border transition-all duration-700 transform-gpu ${isResult && !isWinnerCard ? 'opacity-0 scale-50' : isResult && isWinnerCard ? 'opacity-100 scale-110 bg-[#111111] border border-[#3b82f6] shadow-lg z-50' : 'bg-[#0d0d0f] border border-[#2c2c2e] opacity-80 shadow-sm'}`}>
                                        {item.type === 'dummy' ? (
                                         <span className="text-white/30 font-bold text-4xl" style={{ fontFamily: SFD }}>?</span>
                                        ) : (
                                         <>
                                            <item.icon className="w-10 h-10 drop-shadow-sm" style={{ color: item.color }} />
                                            {isResult && <span className="text-[#8e8e93] font-bold text-[11px] text-center px-1 mt-2 leading-tight animate-in fade-in zoom-in duration-500 delay-300" style={{ fontFamily: SF }}>{item.name}</span>}
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
                
                <div className="w-full flex flex-col items-center min-h-[90px] justify-center px-5 mt-2 mb-10">
                  {openingState === 'idle' ? (
                     <>
                        <button type="button" onClick={() => startRoulette(1)} className="w-full bg-[#3b82f6] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-md mb-3" style={{ fontFamily: SF }}>
                           <span>Open for {activeBoxData.price}</span> 
                           {activeBoxData.type !== 'hero' && <img src="/telegram-star-icon.png" draggable={false} className="w-[18px] h-[18px] object-contain -mt-[2px] pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} alt="Star" />}
                        </button>
                        <button type="button" onClick={() => startRoulette(3)} className="text-[#3b82f6] font-semibold text-[14px] active:opacity-70 transition-opacity" style={{ fontFamily: SF }}>
                           Open 3x for {typeof activeBoxData.price === 'number' ? activeBoxData.price * 3 : 'Free'}
                        </button>
                     </>
                   ) : openingState === 'spinning' ? (
                     <button type="button" disabled className="w-full bg-[#ef4444] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 shadow-sm transition-colors animate-in fade-in zoom-in duration-300" style={{ fontFamily: SF }}>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Opening...
                      </button>
                  ) : (
                     <button type="button" onClick={closeRoulette} className="w-full bg-[#10b981] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300" style={{ fontFamily: SF }}>
                        Collect {tracks.length > 1 ? 'Items' : 'Item'}
                     </button>
                  )}
               </div>

               {/* SECCIÓN "WEAPON CASE" */}
               <div className="w-full flex flex-col px-5 border-t border-[#1c1c1e] pt-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex flex-col">
                        <span className="text-[#8e8e93] text-[13px] font-medium mb-0.5" style={{ fontFamily: SF }}>What's Inside</span>
                        <h3 className="text-white font-bold text-[24px] tracking-tight" style={{ fontFamily: SFD }}>
                           {activeBoxData.name} Items
                        </h3>
                     </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setBoxViewMode(v => v === 'grid' ? 'list' : 'grid')} className="w-[38px] h-[38px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center text-white border border-[#2c2c2e] active:scale-95 transition-transform shadow-sm">
                           {boxViewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                        </button>
                        <button type="button" className="w-[38px] h-[38px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center text-[#8e8e93] border border-[#2c2c2e] active:scale-95 transition-transform">
                           <ArrowDownUp className="w-4 h-4" />
                        </button>
                     </div>
                  </div>

                  <div className="w-full bg-[#1c1c1e] rounded-[14px] flex items-center px-4 py-2.5 gap-2 border border-[#2c2c2e] mb-5">
                     <Search className="w-5 h-5 text-[#8e8e93]" />
                     <input type="text" placeholder="Search items..." className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#636366]" style={{ fontFamily: SF }} />
                  </div>

                  {boxViewMode === 'grid' ? (
                     <div className="grid grid-cols-2 gap-3 pb-8">
                        {INSIDE_ITEMS.map((item) => (
                           <div key={item.id} className="bg-[#111111] rounded-[16px] p-1 flex flex-col border border-[#1c1c1e] shadow-sm hover:bg-[#161618] transition-colors cursor-pointer relative overflow-hidden">
                               <div className="absolute top-1.5 right-1.5 bg-[#3b82f6] text-white font-bold text-[8px] px-1.5 py-[1px] rounded-full z-10 shadow-sm border border-white/10">
                                 {item.drop}
                              </div>
                              <div className="w-full aspect-square bg-[#1c1c1e] rounded-[12px] overflow-hidden relative flex items-center justify-center p-0.5">
                                 <item.icon className="w-10 h-10 drop-shadow-sm" style={{ color: item.color }} />
                              </div>
                              <div className="flex flex-col flex-1 pt-1.5 pb-0.5 items-center text-center px-1">
                                 <span className="text-white font-bold text-[11px] truncate leading-tight w-full" style={{ fontFamily: SFD }}>
                                    {item.name}
                                 </span>
                                 <span className="text-[9px] font-bold mt-1 px-2 py-[1px] rounded-full" style={{ color: item.color, backgroundColor: `${item.color}15`, border: `1px solid ${item.color}20` }}>{item.rarity}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex flex-col gap-2.5 pb-8">
                        {INSIDE_ITEMS.map((item) => (
                          <div key={item.id} className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[14px] p-1.5 flex items-center gap-3 shadow-sm hover:bg-[#161618] transition-colors cursor-pointer">
                              <div className="w-10 h-10 rounded-[10px] bg-[#1c1c1e] flex items-center justify-center shrink-0 border border-[#2c2c2e]">
                                 <item.icon className="w-5 h-5 drop-shadow-sm" style={{ color: item.color }} />
                              </div>
                              <div className="flex flex-col flex-1">
                                 <span className="text-white font-bold text-[14px] leading-tight" style={{ fontFamily: SFD }}>{item.name}</span>
                                 <span className="text-[10px] font-bold mt-0.5 w-fit px-1.5 rounded-full" style={{ color: item.color, backgroundColor: `${item.color}15`, border: `1px solid ${item.color}20` }}>{item.rarity}</span>
                              </div>
                              <div className="bg-[#3b82f6] border border-white/20 px-2 py-[2px] rounded-full shadow-sm">
                                 <span className="text-white font-bold text-[10px]">{item.drop}</span>
                              </div>
                          </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
          </div>
          
        ) : viewingAuctionId && activeAuctionData ? (
          /* ── VISTA DETALLE DE SUBASTA / NFT ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 pb-10 pt-16 flex flex-col gap-6">
            
            <div className="w-full max-w-[260px] aspect-square bg-[#111111] border border-[#1c1c1e] rounded-[32px] mx-auto relative flex items-center justify-center p-4 shadow-xl mb-2">
               <img src={activeAuctionData.imgSrc} alt={activeAuctionData.title} draggable={false} className="w-full h-full object-contain pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
               {activeAuctionData.owned && (
                 <div className="absolute bottom-4 left-4 bg-[#0a0a0b]/80 backdrop-blur-md transform-gpu translate-z-0 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-sm z-10">
                   <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] border border-white/20" />
                   <span className="text-white text-[12px] font-medium" style={{ fontFamily: SF }}>Owned by <span className="font-bold">you</span></span>
                 </div>
               )}
            </div>

            <div className="flex flex-col items-center text-center px-5 mb-1">
               <div className="flex items-center gap-1.5 text-[#8e8e93] text-[14px] mb-1.5 font-medium" style={{ fontFamily: SF }}>
                  <BadgeCheck className="w-4 h-4 text-[#3b82f6]" />
                  {activeAuctionData.collection}
               </div>
               <h3 className="text-white font-bold text-[26px] leading-tight" style={{ fontFamily: SFD }}>
                  {activeAuctionData.title} <span className="text-[#8e8e93] font-semibold">{activeAuctionData.tag}</span>
               </h3>
            </div>

            <div className="flex gap-3 mx-5 mb-2 px-1">
               <button type="button" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95" style={{ fontFamily: SF }}>
                  <ShoppingCart className="w-4 h-4" /> {activeAuctionData.owned ? 'Sell' : 'Buy Now'}
               </button>
               <button type="button" onClick={() => setIsMakeOfferOpen(true)} className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#3b82f6] font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e] active:scale-95 shadow-sm" style={{ fontFamily: SF }}>
                  <Gavel className="w-4 h-4" /> {activeAuctionData.owned ? 'Transfer' : 'Place Bid'}
               </button>
            </div>

            <div className="px-5 w-full mb-2">
               <div className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-5 flex justify-between items-center shadow-sm">
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
            </div>

            <div className="px-5 flex flex-col gap-2 mb-8">
               <h4 className="text-[#8e8e93] font-semibold text-[15px] mb-1 px-1" style={{ fontFamily: SF }}>Rarity & Attributes</h4>
               <div className="w-full bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-2 shadow-sm">
                  {activeAuctionData.attributes.map((attr, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-3 ${idx !== activeAuctionData.attributes.length - 1 ? 'border-b border-[#1c1c1e]' : ''}`}>
                        <span className="text-[#8e8e93] text-[14px] w-[90px]" style={{ fontFamily: SF }}>{attr.name}</span>
                        <div className="flex-1 flex items-center gap-2">
                           <span className="text-white font-medium text-[14px]">{attr.value}</span>
                           <span className={`${attr.rarityColor} text-[11px] font-bold px-2 py-0.5 rounded-md`}>{attr.rarity}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#1c1c1e] text-[#8e8e93] text-[12px] font-semibold px-2 py-1 rounded-lg border border-[#2c2c2e]">
                           <img src="/telegram-star-icon.png" className="w-3 h-3 pointer-events-none select-none grayscale opacity-70" draggable={false} alt="Star" /> {attr.price}
                        </div>
                     </div>
                  ))}
                </div>
            </div>
          </div>

        ) : (
          /* ── VISTAS PRINCIPALES DEL HEADER (Explore, Auctions) ── */
          <div className="flex-1 px-5 animate-in fade-in duration-500 relative z-10">
             
             {/* ── CONTENIDO: EXPLORE (NUEVO DISEÑO CON BANNERS Y CASES ACTUALIZADOS) ── */}
             {activeTab === 'Explore' && (
               <div className="pt-2 flex flex-col pb-10">
                 
                 {/* 0. INVENTORY/BUFF ITEMS HORIZONTAL SCROLL (Optimizado con padding lateral) */}
                 <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 px-5 -mx-5 py-1 relative z-20">
                    {[1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="w-[72px] h-[72px] shrink-0 bg-[#161618] rounded-[20px] border border-white/[0.04] flex items-center justify-center relative overflow-hidden shadow-sm hover:bg-[#1c1c1e] transition-colors cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                          <img src={`/item-icon-${i}.png`} className="w-[55%] h-[55%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" alt={`Item ${i}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/telegram-star-icon.png'; }} />
                       </div>
                    ))}
                    {/* Espaciador final para que el último item no pegue al borde al scrollear */}
                    <div className="w-1 shrink-0" />
                 </div>

                 {/* 1. BANNERS SUPERIORES (Referrals & Subscribe) */}
                 <div className="flex flex-col gap-3 mb-6">
                    {/* Referrals Banner */}
                    <div className="relative w-full h-[86px] rounded-[24px] bg-gradient-to-r from-[#84cc16] to-[#4d7c0f] overflow-hidden flex items-center px-5 shadow-lg cursor-pointer active:scale-[0.98] transition-transform border border-[#a3e635]/20">
                       <div className="flex flex-col z-10">
                          <span className="text-white font-black text-[22px] uppercase italic tracking-wide drop-shadow-sm" style={{ fontFamily: SFD }}>REFERRALS</span>
                          <span className="text-white/90 font-bold text-[12px] uppercase tracking-wider mt-0.5" style={{ fontFamily: SF }}>Earn 10% Cashbacks</span>
                       </div>
                       <div className="absolute right-[-10px] bottom-0 h-[110%] w-[130px] flex items-end pointer-events-none">
                          <img src="/pepe-green.png" className="w-full h-full object-contain object-bottom drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]" alt="Pepe Green" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                       </div>
                    </div>

                    {/* Subscribe Banner */}
                    <div className="relative w-full h-[86px] rounded-[24px] bg-gradient-to-r from-[#0ea5e9] to-[#0369a1] overflow-hidden flex items-center px-5 shadow-lg cursor-pointer active:scale-[0.98] transition-transform border border-[#38bdf8]/20">
                       <div className="flex flex-col z-10">
                          <span className="text-white font-black text-[22px] uppercase italic tracking-wide drop-shadow-sm" style={{ fontFamily: SFD }}>SUBSCRIBE</span>
                          <span className="text-white/90 font-bold text-[12px] uppercase tracking-wider mt-0.5" style={{ fontFamily: SF }}>To our TG Channel</span>
                       </div>
                       <div className="absolute right-[-10px] bottom-0 h-[110%] w-[130px] flex items-end pointer-events-none">
                          <img src="/pepe-blue.png" className="w-full h-full object-contain object-bottom drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]" alt="Pepe Blue" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                       </div>
                    </div>
                 </div>

                 {/* 2. SELECTOR DE PESTAÑAS (Píldoras Flotantes - Optimizado) */}
                 <div className="flex items-center gap-3 mb-5 overflow-x-auto no-scrollbar pb-2 px-5 -mx-5 relative z-20">
                    {FILTER_OPTIONS.sale.map(filter => (
                       <button 
                          key={filter} 
                          onClick={() => setActiveFilter(filter as any)}
                          className={`px-4 py-2 rounded-full font-bold text-[13px] whitespace-nowrap transition-all duration-300 transform-gpu ${
                             activeFilter === filter 
                             ? 'bg-white/10 backdrop-blur-md text-white shadow-sm border border-white/10 scale-105' 
                             : 'text-[#8e8e93] hover:text-white/80'
                          }`}
                          style={{ fontFamily: SF }}
                        >
                          {filter === 'All' && <img src="/telegram-star-icon.png" className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 opacity-80" alt="*" />}
                          {filter}
                        </button>
                    ))}
                    <div className="w-1 shrink-0" />
                 </div>

                 {/* 3. GRID DE CAJAS REDISEÑADO CON TUS NUEVOS CASES (ESTILO ESTÁTICO 3D) */}
                 <div className="grid grid-cols-2 gap-x-3 gap-y-8 mt-2 pb-6">
                    {MARKET_BOXES.map((box) => (
                       <div key={box.id} onClick={() => setViewingBoxId(box.id)} className="relative flex flex-col group cursor-pointer animate-in fade-in zoom-in-95 duration-300">
                          {box.id === 'free' ? (
                             <>
                                {/* TIPO HERO (Mantiene flotación para destacar) */}
                                <div className="w-full aspect-[8/9] rounded-[24px] bg-gradient-to-b from-[#ef4444] to-[#991b1b] p-4 flex flex-col relative overflow-hidden shadow-lg border border-white/10 transition-transform hover:brightness-110">
                                   <div className="absolute top-4 left-4 z-10">
                                      <span className="text-white font-black text-[26px] leading-[1.1] uppercase drop-shadow-md tracking-tight" style={{ fontFamily: SFD }}>FREE<br/>CASE</span>
                                   </div>
                                   <div className="flex-1 w-full relative z-10 flex items-center justify-center mt-6 animate-box-float">
                                      <img src="/free-gift-box.png" className="w-[120%] h-[120%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]" alt="Free Case" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = box.image; }} />
                                   </div>
                                </div>
                                {/* Botón flotante estilo Auctions */}
                                <div className="absolute -bottom-[20px] left-0 right-0 w-full h-[46px] bg-[#2563eb] transform-gpu will-change-transform rounded-[16px] px-3 flex items-center justify-center shadow-[0_4px_15px_rgba(37,99,235,0.4)] z-20 border border-white/10 hover:bg-[#3b82f6] transition-colors">
                                   <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{box.price}</span>
                                </div>
                             </>
                          ) : (
                             <>
                                {/* TIPO ESTÁNDAR (Estático, efecto 3D con sombras y glow de fondo) */}
                                <div className="w-full aspect-[8/9] rounded-[24px] bg-[#161618] p-3 flex flex-col relative overflow-hidden shadow-lg border border-white/[0.04] transition-all group-hover:bg-[#1c1c1e] group-hover:border-white/10">
                                   {/* Glow de fondo condicional mejorado (intensificado en hover) */}
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-none transition-all duration-300 group-hover:opacity-100 opacity-60 group-hover:scale-110" style={{ background: `radial-gradient(circle, ${box.color}25 0%, transparent 65%)` }} />
                                   
                                   {/* Nombre inglés en la parte superior */}
                                   <div className="w-full text-center relative z-20 mt-2 px-1">
                                      <span className="text-white font-bold text-[12px] uppercase tracking-widest truncate block w-full drop-shadow-sm" style={{ fontFamily: SFD }}>{box.name}</span>
                                   </div>

                                   {/* Imagen estática (sin animación flotante) con fuerte sombra 3D */}
                                   <div className="flex-1 w-full relative z-10 flex items-center justify-center pb-2">
                                      <img src={box.image} className="w-[90%] h-[90%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transform transition-transform duration-500" alt={box.name} />
                                   </div>
                                </div>
                                
                                {/* Botón estilo Auctions para los Cases Standard */}
                                <div className="absolute -bottom-[20px] left-0 right-0 w-full h-[46px] bg-[#0a0a0b]/90 backdrop-blur-md transform-gpu will-change-transform rounded-[16px] px-3.5 flex items-center justify-between shadow-lg border border-white/[0.08] z-20 transition-all group-hover:border-white/15 group-hover:bg-[#0a0a0b]">
                                   <div className="flex items-center gap-1.5 overflow-hidden">
                                      <div className="w-[20px] h-[20px] rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                         <Gift className="w-[10px] h-[10px] text-white" />
                                      </div>
                                      <span className="text-white/90 font-semibold text-[11px] uppercase tracking-wider" style={{ fontFamily: SF }}>Open</span>
                                   </div>
                                   <div className="flex items-center gap-1 shrink-0 pl-1">
                                      <span className="text-white font-bold text-[13px]" style={{ fontFamily: SFD }}>{box.price}</span>
                                      <img src="/telegram-star-icon.png" alt="Star" draggable={false} className="w-[14px] h-[14px] object-contain pointer-events-none select-none" />
                                   </div>
                                </div>
                             </>
                          )}

                          {/* Etiqueta de rareza/tipo */}
                          {box.id !== 'free' && (
                             <div className="absolute -top-2.5 left-3 z-40 bg-[#0a0a0b]/80 backdrop-blur-md transform-gpu px-2.5 py-[4px] rounded-md border border-white/10 shadow-lg flex items-center gap-1.5 transition-all group-hover:border-white/20">
                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: box.color, color: box.color }} />
                                <span className="text-white text-[9px] font-bold uppercase tracking-widest" style={{ fontFamily: SF }}>{box.id === 'blum_rocket' ? 'Featured' : 'High Tier'}</span>
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
               </div>
             )}

             {/* ── CONTENIDO: AUCTIONS & LISTED ── */}
             {(activeTab === 'Auctions' || activeTab === 'Listed') && (
                <div className="flex flex-col w-full pt-2 animate-in fade-in slide-in-from-right-4 duration-300">
                   
                  <button type="button" onClick={() => setIsAddGiftOpen(true)} className="w-full bg-[#3b82f6] text-white py-3.5 rounded-[16px] font-bold text-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-md mb-6" style={{ fontFamily: SF }}>
                     <Plus className="w-5 h-5" /> Add Gift
                  </button>

                  <div className="flex gap-2 w-full mb-3 relative">
                     <div className="flex-1 bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[16px] flex items-center px-4 gap-2 border border-white/[0.06]">
                        <Search className="w-5 h-5 text-[#8e8e93]" />
                        <input type="text" placeholder="Search" className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#8e8e93]" style={{ fontFamily: SF }} />
                     </div>
                     
                     <button type="button" className="w-[44px] h-[44px] bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[14px] flex items-center justify-center text-[#8e8e93] border border-white/[0.06] active:scale-95 transition-transform shrink-0">
                        <ArrowDownUp className="w-5 h-5" />
                     </button>

                     <button type="button" className="w-[44px] h-[44px] bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[14px] flex items-center justify-center text-[#8e8e93] border border-white/[0.06] active:scale-95 transition-transform shrink-0">
                         <Copy className="w-5 h-5" />
                     </button>

                     <button 
                        type="button"
                        onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                        className="w-[44px] h-[44px] bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[14px] flex items-center justify-center text-white border border-white/[0.06] active:scale-95 transition-transform shrink-0 shadow-sm"
                     >
                        {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                     </button>
                  </div>

                  <div className="flex gap-2 w-full mb-4 relative">
                     <button type="button" className="w-[44px] h-[44px] bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[14px] flex items-center justify-center text-white border border-white/[0.06] active:scale-95 transition-transform shrink-0">
                        <SlidersHorizontal className="w-5 h-5" />
                     </button>
                     
                     <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar relative">
                        <div className="relative shrink-0 w-full">
                           <button type="button" onClick={() => setOpenDropdown(openDropdown === 'sale' ? null : 'sale')} className={`w-full h-[44px] bg-[#161618]/80 backdrop-blur-md transform-gpu rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'sale' ? 'border-[#3b82f6] text-white' : 'border-white/[0.06] text-white'} transition-colors`} style={{ fontFamily: SF }}>
                              {filters.sale} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                           </button>
                           {openDropdown === 'sale' && (
                              <div className="absolute top-[50px] left-0 bg-[#2c2c2e] border border-[#3a3a3c] rounded-[12px] shadow-lg w-full py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                     <div className="grid grid-cols-2 gap-x-3 gap-y-8 mt-2 pb-10 animate-in fade-in duration-300">
                        {AUCTION_ITEMS.map((item) => (
                           <div key={item.id} onClick={() => setViewingAuctionId(item.id)} className="relative w-full mb-2 group cursor-pointer">
                               <div className="w-full aspect-[8/9] bg-[#161618] rounded-[16px] flex flex-col shadow-sm border border-white/[0.04] group-hover:bg-[#1c1c1e] transition-colors relative overflow-hidden">
                                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: `radial-gradient(circle at 10px 10px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
                                 <div className="flex-1 w-full relative z-10 flex items-center justify-center"></div>
                                 <div className="w-full px-4 pb-10 flex justify-between items-end relative z-10">
                                   <span className="text-white font-bold text-[15px] leading-tight tracking-wide truncate" style={{ fontFamily: SFD }}>{item.title}</span>
                                   <span className="text-white/60 font-medium text-[13px] leading-tight" style={{ fontFamily: SF }}>{item.tag}</span>
                                 </div>
                               </div>
                              <div className="absolute -bottom-[20px] left-0 right-0 w-full h-[46px] bg-[#0a0a0b]/80 backdrop-blur-md transform-gpu will-change-transform rounded-[16px] px-3 flex items-center justify-between shadow-sm border border-white/[0.08] z-20">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <div className="w-[20px] h-[20px] rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                     <div className="w-[12px] h-[12px] bg-white rounded-full flex items-center justify-center">
                                         <span className="text-black font-extrabold text-[8px] leading-none">$</span>
                                     </div>
                                   </div>
                                  <span className="text-white/90 font-semibold text-[11px] truncate" style={{ fontFamily: SF }}>{item.owned ? "Sold out" : "Listed"}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 pl-1">
                                  <span className="text-white font-bold text-[13px]" style={{ fontFamily: SFD }}>{item.gridPrice}</span>
                                  <img src="/telegram-star-icon.png" alt="Star" draggable={false} className="w-[14px] h-[14px] object-contain pointer-events-none select-none" />
                                </div>
                               </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex flex-col gap-3 mt-2 pb-10 animate-in fade-in duration-300">
                        {AUCTION_ITEMS.map((item) => {
                           const isExpanded = expandedAuctionId === item.id;
                            return (
                              <div 
                                 key={item.id} 
                                 onClick={() => setViewingAuctionId(item.id)}
                                 className="w-full bg-[#161618] border border-white/[0.04] rounded-[24px] p-2 flex flex-col shadow-sm cursor-pointer transition-all hover:bg-[#1c1c1e] relative overflow-hidden group"
                               >
                                 <div className="flex items-center gap-3">
                                    <div className="w-[88px] h-[88px] bg-[#111111] rounded-[18px] relative overflow-hidden flex-shrink-0 border border-white/[0.02]">
                                       <div 
                                         className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                         style={{
                                           background: `radial-gradient(circle at 8px 8px, white 1px, transparent 0)`,
                                           backgroundSize: '16px 16px'
                                         }}
                                       />
                                        <div className="w-full h-full relative z-10 flex items-center justify-center"></div>
                                    </div>

                                    <div className="flex flex-col flex-1 py-1 pr-1 h-full justify-between">
                                       <div className="flex justify-between items-start w-full">
                                          <div className="flex flex-col">
                                             <span className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD }}>
                                                {item.title}
                                              </span>
                                             <span className="text-white/60 font-medium text-[13px] mt-0.5" style={{ fontFamily: SF }}>
                                                 {item.tag}
                                             </span>
                                           </div>
                                          
                                           <button 
                                             type="button"
                                             onClick={(e) => toggleExpandAuction(item.id, e)} 
                                             className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-[#8e8e93] hover:text-white transition-colors border border-white/[0.08]"
                                           >
                                             {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                          </button>
                                       </div>

                                        <div className="mt-2 w-full h-[38px] bg-[#0a0a0b]/80 backdrop-blur-md transform-gpu will-change-transform rounded-[12px] px-3 flex items-center justify-between shadow-sm border border-white/[0.08]">
                                          <div className="flex items-center gap-1.5 overflow-hidden">
                                             <div className="w-[18px] h-[18px] rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                               <div className="w-[10px] h-[10px] bg-white rounded-full flex items-center justify-center">
                                                 <span className="text-black font-extrabold text-[7px] leading-none">$</span>
                                               </div>
                                             </div>
                                            <span className="text-white/90 font-semibold text-[11px] truncate" style={{ fontFamily: SF }}>
                                                {item.owned ? "Sold out" : "Listed"}
                                            </span>
                                          </div>

                                           <div className="flex items-center gap-1 shrink-0 pl-1">
                                            <span className="text-white font-bold text-[13px]" style={{ fontFamily: SFD }}>
                                               {item.gridPrice}
                                            </span>
                                             <img 
                                               src="/telegram-star-icon.png" 
                                               alt="Star" 
                                               draggable={false} 
                                               className="w-[13px] h-[13px] object-contain pointer-events-none select-none" 
                                            />
                                          </div>
                                       </div>
                                    </div>
                                  </div>

                                 {isExpanded && (
                                    <div 
                                        className="flex flex-col mt-3 pt-3 border-t border-white/[0.04] animate-in fade-in slide-in-from-top-2 duration-300 px-1 pb-1"
                                       onClick={(e) => e.stopPropagation()} 
                                     >
                                       <div className="flex justify-between text-[#8e8e93] text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ fontFamily: SF }}>
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
                                                <img src="/telegram-star-icon.png" className="w-[12px] h-[12px] pointer-events-none select-none" draggable={false} alt="Star" /> {attr.price}
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
        )}
      </div>

      {/* ── MODAL "MAKE OFFER" (PLACE BID) ── */}
      {isMakeOfferOpen && activeAuctionData && (
         <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsMakeOfferOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#2c2c2e] flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 transform-gpu">
             
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
                
                {/* Input y Precio Ajustado para evitar desborde */}
                <div className="bg-[#1c1c1e] rounded-[16px] p-4 flex items-center gap-2 border border-[#2c2c2e] relative overflow-hidden w-full">
                   <img src="/telegram-star-icon.png" draggable={false} className="w-6 h-6 shrink-0 pointer-events-none select-none" alt="Star" />
                   
                   <input 
                      type="text" 
                      inputMode="numeric" 
                      placeholder="0" 
                      value={offerInput}
                      onChange={handleOfferInput}
                      className="bg-transparent text-white font-bold text-[24px] outline-none placeholder:text-[#636366] flex-1 min-w-0"
                      style={{ fontFamily: SFD }}
                   />
                   <span className="text-[#8e8e93] font-medium text-[15px] shrink-0 pl-2" style={{ fontFamily: SF }}>≈ ${(offerNumValue * 0.013).toFixed(2)}</span>
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
             <div className="bg-[#111111] border border-[#1c1c1e] rounded-[20px] p-4 flex flex-col mb-6 border border-[#2c2c2e]">
                 <span className="text-white font-bold text-[16px] mb-3" style={{ fontFamily: SFD }}>Offer Duration</span>
                <button type="button" className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] p-4 flex justify-between items-center text-white font-medium text-[15px]" style={{ fontFamily: SF }}>
                   7 days <ChevronDown className="w-5 h-5 text-[#8e8e93]" />
                </button>
              </div>

             <div className="flex flex-col gap-3 pt-4 border-t border-[#1c1c1e]">
                <div className="flex gap-3">
                   <button type="button" disabled={!isOfferValid} className={`flex-1 ${isOfferValid ? 'bg-[#3b82f6] text-white active:scale-95 shadow-sm' : 'bg-[#1c1c1e] text-[#636366]'} font-bold text-[16px] py-4 rounded-[16px] transition-all`} style={{ fontFamily: SF }}>
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

      {/* ── MODAL "ADD GIFT" ── */}
      {isAddGiftOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsAddGiftOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#2c2c2e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 transform-gpu">
             
             {addGiftStep === 'choose_type' ? (
                <>
                    <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex justify-center items-center mb-6 relative">
                      <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>Choose a type</h2>
                   </div>
                    
                   <div className="flex flex-col gap-0 px-1">
                      <button type="button" onClick={() => handleAddGiftSelection('fixed')} className="w-full flex items-center justify-between py-4 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-sm">
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
                             <div className="w-12 h-12 rounded-full bg-[#a855f7] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-sm">
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
                             <div className="w-12 h-12 rounded-full bg-[#14b8a6] flex items-center justify-center text-white shrink-0 group-active:scale-95 transition-transform shadow-sm">
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
                <>
                   <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex items-center justify-between mb-6">
                      <button type="button" onClick={() => setAddGiftStep('choose_type')} className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white active:scale-95 transition-transform">
                         <ChevronLeft className="w-5 h-5" />
                       </button>
                      <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Select a Gift</h2>
                       <div className="w-8" /> {/* Spacer */}
                   </div>
                    
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
          <div className="relative w-full bg-[#0a0a0b] rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 transform-gpu">
            <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-center text-[22px] mb-8" style={{ fontFamily: SFD }}>Top UP</h2>
            <div className="flex flex-col items-center mb-8">
               <div className={`flex items-center justify-center gap-3 ${isError ? 'animate-shake' : ''}`}>
                 <img src="/telegram-star-icon.png" alt="Star" draggable={false} className="w-[42px] h-[42px] pointer-events-none select-none" style={{ WebkitTouchCallout: 'none' }} />
                 <input type="text" inputMode="numeric" value={displayValue} onChange={handleStarInput} placeholder="0" style={{ width: displayValue ? `${displayValue.length}ch` : '1.2ch', fontFamily: SFD }} className={`bg-transparent font-bold text-[56px] outline-none caret-[#3b82f6] ${isError ? 'text-[#ff3b30]' : 'text-white'}`} />
               </div>
               <span className={`text-[13px] mt-2 font-medium ${isError ? 'text-[#ff3b30]' : 'text-[#636366]'}`} style={{ fontFamily: SF }}>Buy between 15 and 150,000 stars</span>
               <button type="button" disabled={!isValid} className={`mt-5 w-full max-w-[300px] py-3.5 rounded-[14px] font-bold text-[17px] active:scale-95 transition-transform ${isValid ? 'bg-[#3b82f6] text-white shadow-sm' : 'bg-[#1c1c1e] text-[#636366]'}`} style={{ fontFamily: SF }}>Buy {displayValue || '0'} Stars</button>
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
