"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { Plus, Star, ArrowDown, X, Info, Shield, Cpu, Sparkles, Loader2, Send, Tag, Gem, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, MoreHorizontal, BadgeCheck, Copy, ChevronRight, ChevronLeft } from "lucide-react"

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
   collections: ['All collections', 'Plush Pepes', 'Jelly Bunnies', 'Ginger Cookies'],
   backdrop: ['All backdrops', 'Mint Gray', 'Dusty', 'Deep Blue Sea'],
   symbol: ['All symbols', 'Bull Market Red', 'Phoenix', 'Classic Stone']
}

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
  
  // ── ESTADOS DE PESTAÑAS Y VISTAS ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)

  // ── ESTADOS DE FILTROS ──
  const [openDropdown, setOpenDropdown] = useState<'sale' | 'collections' | 'backdrop' | 'symbol' | null>(null)
  const [filters, setFilters] = useState({ sale: 'For sale', collections: 'Collections', backdrop: 'Backdrop', symbol: 'Symbol' })

  // ── ESTADOS DE ADD GIFT (LISTING FLOW) ──
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [addGiftStep, setAddGiftStep] = useState<'choose_type' | 'select_gift'>('choose_type')
  const [listingType, setListingType] = useState<'fixed' | 'auction' | 'falling' | null>(null)

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
      if (isAddGiftOpen) {
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
  }, [setCurrentView, viewingBoxId, viewingAuctionId, activeTab, isAddGiftOpen, addGiftStep])

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

  const handleAddGiftSelection = (type: 'fixed' | 'auction' | 'falling') => {
    setListingType(type)
    setAddGiftStep('select_gift')
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""
  
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)
  const activeAuctionData = AUCTION_ITEMS.find(a => a.id === viewingAuctionId)

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden" ref={dropdownRef}>
      <style>{animationStyles}</style>

      {/* ── PÍLDORA DE TOP UP FLOTANTE ── */}
      {activeTab === 'Play' && !viewingBoxId && (
        <div className="fixed top-[85px] right-5 z-[60] bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all animate-in fade-in zoom-in duration-300">
           <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain -mt-[2px]" />
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
                                     <div key={idx} className={`w-[100px] h-[100px] flex-shrink-0 flex flex-col items-center justify-center rounded-[24px] border transition-all duration-700 ${isResult && !isWinnerCard```tsx
"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { Plus, Star, ArrowDown, X, Info, Shield, Cpu, Sparkles, Loader2, Send, Tag, Gem, ChevronDown, ChevronUp, ShoppingCart, Gavel, Search, ArrowDownUp, LayoutGrid, List, SlidersHorizontal, Heart, MoreHorizontal, BadgeCheck, Copy, ChevronRight, ChevronLeft } from "lucide-react"

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
   collections: ['All collections', 'Plush Pepes', 'Jelly Bunnies', 'Ginger Cookies'],
   backdrop: ['All backdrops', 'Mint Gray', 'Dusty', 'Deep Blue Sea'],
   symbol: ['All symbols', 'Bull Market Red', 'Phoenix', 'Classic Stone']
}

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
  
  // ── ESTADOS DE PESTAÑAS Y VISTAS ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingAuctionId, setViewingAuctionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedAuctionId, setExpandedAuctionId] = useState<string | null>(null)

  // ── ESTADOS DE FILTROS ──
  const [openDropdown, setOpenDropdown] = useState<'sale' | 'collections' | 'backdrop' | 'symbol' | null>(null)
  const [filters, setFilters] = useState({ sale: 'For sale', collections: 'Collections', backdrop: 'Backdrop', symbol: 'Symbol' })

  // ── ESTADOS DE ADD GIFT (LISTING FLOW) ──
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false)
  const [addGiftStep, setAddGiftStep] = useState<'choose_type' | 'select_gift'>('choose_type')
  const [listingType, setListingType] = useState<'fixed' | 'auction' | 'falling' | null>(null)

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
      if (isAddGiftOpen) {
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
  }, [setCurrentView, viewingBoxId, viewingAuctionId, activeTab, isAddGiftOpen, addGiftStep])

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

  const handleAddGiftSelection = (type: 'fixed' | 'auction' | 'falling') => {
    setListingType(type)
    setAddGiftStep('select_gift')
  }

  const numValue = starInput ? parseInt(starInput, 10) : 0
  const isError = starInput !== "" && numValue < 15
  const isValid = numValue >= 15 && numValue <= 150000
  const displayValue = starInput ? numValue.toLocaleString('en-US') : ""
  
  const activeBoxData = MARKET_BOXES.find(b => b.id === viewingBoxId)
  const activeAuctionData = AUCTION_ITEMS.find(a => a.id === viewingAuctionId)

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden" ref={dropdownRef}>
      <style>{animationStyles}</style>

      {/* ── PÍLDORA DE TOP UP FLOTANTE ── */}
      {activeTab === 'Play' && !viewingBoxId && (
        <div className="fixed top-[85px] right-5 z-[60] bg-[#1c1c1e]/85 backdrop-blur-md rounded-full p-1 pl-3 flex items-center gap-2 border border-[#2c2c2e] shadow-lg shadow-black/40 transition-all animate-in fade-in zoom-in duration-300">
           <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain -mt-[2px]" />
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
                        <button type="button" onClick={() => startRoulette(1)} className="w-full bg-[#3b82f6] text-white h-[54px] rounded-[16px] font-bold text-[18px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform shadow-lg mb-3" style={{ fontFamily: SF }}>
                           <span>Open for {activeBoxData.price}</span> 
                           <img src="/telegram-star-icon.png" className="w-[20px] h-[20px] object-contain -mt-[2px]" alt="Star" />
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
          /* ── VISTA DETALLE DE SUBASTA / NFT (Rediseñada estilo Imagen) ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 pb-10 pt-20 flex flex-col gap-6">
            
            {/* 1. Contenedor de Imagen Cuadrado Centrado (Más Grande) */}
            <div className="w-full max-w-[240px] aspect-square bg-[#111111] border border-[#1c1c1e] rounded-[32px] mx-auto relative flex items-center justify-center p-4 shadow-xl mb-2">
               <img src={activeAuctionData.imgSrc} alt={activeAuctionData.title} className="w-full h-full object-contain drop-shadow-xl" />
               {activeAuctionData.owned && (
                 <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-md">
                   <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] border border-white/20" />
                   <span className="text-white text-[11px] font-medium" style={{ fontFamily: SF }}>Owned by <span className="font-bold">you</span></span>
                 </div>
               )}
            </div>

            {/* 2. Información del NFT (Título/Colección) */}
            <div className="flex flex-col items-center text-center px-5 mb-2">
               <div className="flex items-center gap-1.5 text-[#8e8e93] text-[13px] mb-1 font-medium" style={{ fontFamily: SF }}>
                  <BadgeCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
                  {activeAuctionData.collection}
               </div>
               <h3 className="text-white font-bold text-[24px] leading-tight" style={{ fontFamily: SFD }}>
                  {activeAuctionData.title} <span className="text-[#8e8e93] font-semibold">{activeAuctionData.tag}</span>
               </h3>
            </div>

            {/* 3. Botones de Acción (Sin Contenedor de Fondo) */}
            <div className="flex gap-3 mx-5 mb-4 px-1">
               <button type="button" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[14px] py-2.5 rounded-[14px] flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)] active:scale-95" style={{ fontFamily: SF }}>
                  <ShoppingCart className="w-4 h-4" /> {activeAuctionData.owned ? 'Sell' : 'Buy Now'}
               </button>
               <button type="button" className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-bold text-[14px] py-2.5 rounded-[14px] flex items-center justify-center gap-1.5 transition-colors border border-[#2c2c2e] active:scale-95" style={{ fontFamily: SF }}>
                  <Gavel className="w-4 h-4 text-[#a1a1aa]" /> {activeAuctionData.owned ? 'Transfer' : 'Place Bid'}
               </button>
            </div>

            {/* 4. Valor Estimado (Ancho Más Reducido) */}
            <div className="bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-5 flex justify-between items-center mx-5 mb-1 shadow-lg self-center w-[calc(100%-40px)] max-w-[340px]">
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-[#8e8e93] text-[12px] font-medium mb-1">
                     Est. value <Info className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                     <Gem className="w-4 h-4 text-[#3b82f6]" /> {activeAuctionData.estValue}
                  </div>
               </div>
               <div className="flex flex-col text-right">
                  <span className="text-[#8e8e93] text-[12px] font-medium mb-1">Equal to</span>
                  <span className="text-white font-bold text-[16px]" style={{ fontFamily: SFD }}>{activeAuctionData.fiatValue}</span>
               </div>
            </div>

            {/* 5. Rarity & Attributes (Sin Contenedor Gris de Fondo) */}
            <div className="p-5 mx-5 flex flex-col gap-2">
               <h4 className="text-white font-bold text-[16px] mb-2" style={{ fontFamily: SFD }}>Rarity & Attributes</h4>
               {/* Tabla de Atributos (Solo la tabla, sin contenedor gris de fondo) */}
               <div className="w-full flex flex-col mt-3 gap-0">
                  {activeAuctionData.attributes.map((attr, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-2.5 ${idx !== activeAuctionData.attributes.length - 1 ? 'border-b border-[#1c1c1e]' : ''}`}>
                        <span className="text-[#8e8e93] text-[13px] w-[80px]" style={{ fontFamily: SF }}>{attr.name}</span>
                        <div className="flex-1 flex items-center gap-2">
                           <span className="text-white font-medium text-[13px]">{attr.value}</span>
                           <span className={`${attr.rarityColor} text-[10px] font-bold px-1.5 py-0.5 rounded-md`}>{attr.rarity}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 text-[#8e8e93] text-[11px] font-semibold px-2 py-1 rounded-lg">
                           <Gem className="w-3 h-3" /> {attr.price}
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
                 <div className="animate-in fade-in slide-in-from-left-4 duration-300 pt-4">
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
                                  <button type="button" onClick={() => setViewingBoxId(box.id)} className="w-full bg-[#2c2c2e] text-white font-bold text-[13px] py-2 rounded-[14px] mt-1 active:scale-95 transition-transform" style={{ fontFamily: SF }}>Market</button>
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
                               <LootboxVisual color={box.color} imgSrc={box.image} />
                               <button type="button" disabled className="w-full bg-[#161618] text-[#636366] font-bold text-[13px] py-2 rounded-[14px] mt-1" style={{ fontFamily: SF }}>Unbox</button>
                            </div>
                         ))}
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

                    {/* FILTROS FUNCIONALES */}
                    <div className="flex gap-2 w-full mb-4 relative">
                       <button type="button" className="w-[44px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-center text-white border border-[#2c2c2e] active:scale-95 transition-transform shrink-0">
                          <SlidersHorizontal className="w-5 h-5" />
                       </button>
                       
                       <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar relative">
                          
                          {/* Botón Filtro "Sale" */}
                          <div className="relative shrink-0">
                             <button type="button" onClick={() => setOpenDropdown(openDropdown === 'sale' ? null : 'sale')} className={`min-w-[120px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'sale' ? 'border-[#3b82f6] text-white' : 'border-[#2c2c2e] text-white'} transition-colors`} style={{ fontFamily: SF }}>
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
                          
                          {/* Botón Filtro "Collections" */}
                          <div className="relative shrink-0">
                             <button type="button" onClick={() => setOpenDropdown(openDropdown === 'collections' ? null : 'collections')} className={`min-w-[140px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'collections' ? 'border-[#3b82f6] text-white' : 'border-[#2c2c2e] text-white'} transition-colors`} style={{ fontFamily: SF }}>
                                {filters.collections} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                             </button>
                             {openDropdown === 'collections' && (
                               <div className="absolute top-[50px] left-0 bg-[#2c2c2e] border border-[#3a3a3c] rounded-[12px] shadow-xl w-[180px] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  {FILTER_OPTIONS.collections.map(opt => (
                                     <div key={opt} onClick={() => { setFilters({...filters, collections: opt}); setOpenDropdown(null) }} className="px-4 py-2.5 text-white text-[13px] font-medium hover:bg-[#3a3a3c] cursor-pointer">{opt}</div>
                                  ))}
                               </div>
                             )}
                          </div>

                          {/* Botón Filtro "Backdrop" */}
                          <div className="relative shrink-0">
                             <button type="button" onClick={() => setOpenDropdown(openDropdown === 'backdrop' ? null : 'backdrop')} className={`min-w-[130px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'backdrop' ? 'border-[#3b82f6] text-white' : 'border-[#2c2c2e] text-white'} transition-colors`} style={{ fontFamily: SF }}>
                                {filters.backdrop} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                             </button>
                             {openDropdown === 'backdrop' && (
                               <div className="absolute top-[50px] left-0 bg-[#2c2c2e] border border-[#3a3a3c] rounded-[12px] shadow-xl w-[160px] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  {FILTER_OPTIONS.backdrop.map(opt => (
                                     <div key={opt} onClick={() => { setFilters({...filters, backdrop: opt}); setOpenDropdown(null) }} className="px-4 py-2.5 text-white text-[13px] font-medium hover:bg-[#3a3a3c] cursor-pointer">{opt}</div>
                                  ))}
                               </div>
                             )}
                          </div>
                          
                          {/* Botón Filtro "Symbol" */}
                          <div className="relative shrink-0">
                             <button type="button" onClick={() => setOpenDropdown(openDropdown === 'symbol' ? null : 'symbol')} className={`min-w-[120px] h-[44px] bg-[#1c1c1e] rounded-[14px] flex items-center justify-between px-4 font-bold text-[14px] border ${openDropdown === 'symbol' ? 'border-[#3b82f6] text-white' : 'border-[#2c2c2e] text-white'} transition-colors`} style={{ fontFamily: SF }}>
                                {filters.symbol} <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                             </button>
                             {openDropdown === 'symbol' && (
                               <div className="absolute top-[50px] left-0 bg-[#2c2c2e] border border-[#3a3a3c] rounded-[12px] shadow-xl w-[150px] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                  {FILTER_OPTIONS.symbol.map(opt => (
                                     <div key={opt} onClick={() => { setFilters({...filters, symbol: opt}); setOpenDropdown(null) }} className="px-4 py-2.5 text-white text-[13px] font-medium hover:bg-[#3a3a3c] cursor-pointer">{opt}</div>
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

      {/* ── MODAL "ADD GIFT" (Estilo Lista Plana sin contenedores individuales) ── */}
      {isAddGiftOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsAddGiftOpen(false)} />
          <div className="relative w-full bg-black rounded-t-[28px] px-5 pt-4 pb-[60px] border-t border-[#1c1c1e] flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
             
             {addGiftStep === 'choose_type' ? (
                /* PASO 1: ELEGIR TIPO (Estilo Lista Plana sin contenedores individuales) */
                <>
                   <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex justify-center items-center mb-6 relative px-10">
                      <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>Choose a type</h2>
                   </div>
                   
                   <div className="flex flex-col gap-0">
                      <button type="button" onClick={() => handleAddGiftSelection('fixed')} className="w-full flex items-center justify-between py-4 border-b border-[#1c1c1e] active:bg-[#111111] transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                               <Tag className="w-6 h-6" />
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
                            <div className="w-12 h-12 rounded-[14px] bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] shrink-0">
                               <Gavel className="w-6 h-6" />
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
                            <div className="w-12 h-12 rounded-[14px] bg-[#14b8a6]/10 flex items-center justify-center text-[#14b8a6] shrink-0">
                               <ArrowDown className="w-6 h-6" />
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
                   <div className="w-10 h-1 bg-[#2c2c2e] rounded-full mx-auto mb-5 shrink-0" />
                   <div className="flex items-center justify-between mb-6">
                      <button type="button" onClick={() => setAddGiftStep('choose_type')} className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white active:scale-95 transition-transform">
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Select a Gift</h2>
                      <div className="w-8" /> {/* Spacer */}
                   </div>
                   
                   {/* EMPTY STATE */}
                   <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-[120px] h-[120px] mb-6 relative">
                         {/* Usa onError nulo para evitar bucles de carga si la imagen no existe */}
                         <img src="/empty-gift.webp" alt="Empty" className="w-full h-full object-contain filter grayscale opacity-60" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/telegram-star-icon.png'; }} />
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
                 <img src="/telegram-star-icon.png" alt="Star" className="w-[42px] h-[42px]" />
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
