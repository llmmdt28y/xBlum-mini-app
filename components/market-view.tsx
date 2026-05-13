"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  LayoutGrid, SlidersHorizontal, User, 
  Search, Sparkles, Loader2, Lock, Hexagon
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual ──
const AIRDROP_CAPSULES = [
  { id: 'weekly_bp', name: 'Community Cache', tag: '#001', currency: 'BP', price: 2500, supply: { current: '∞', max: '∞' }, color: '#3A3A3C', imageSrc: '/1000009369.png' },
  { id: 'grok_node', name: 'Neural Node', tag: '#442', currency: 'STARS', price: 150, supply: { current: 142, max: 500 }, color: '#1A233A', imageSrc: '/1000009370.png' },
  { id: 'vortx_vip', name: 'VortX Genesis', tag: '#089', currency: 'STARS', price: 1000, supply: { current: 0, max: 50 }, color: '#332714', imageSrc: '/1000009361.png' }
]

const AUCTION_ITEMS = [
  { id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false, bgColor: '#332714' },
  { id: 'crystal_2', title: 'Incubus', tag: '#14640', imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true, bgColor: '#1E1B2E' },
  { id: 'crystal_3', title: 'Fuschia', tag: '#8842', imgSrc: '/1000010037.png', price: '45', isSoldOut: false, bgColor: '#2D1B2E' },
  { id: 'crystal_4', title: 'Silver', tag: '#9921', imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false, bgColor: '#2C2C2E' },
]

// ── CSS INYECTADO (Animaciones Glitch & Float) ──
const animationStyles = `
  @keyframes box-float { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-6px); } 
  }
  .animate-box-float { animation: box-float 4s ease-in-out infinite; }
  
  /* Efecto de corrupción/pixelado rápido */
  @keyframes extreme-glitch {
    0% { transform: translate(0) scale(1) skewX(0deg); filter: blur(0px) contrast(1); opacity: 1; }
    10% { transform: translate(-4px, 2px) scale(1.05) skewX(-10deg); filter: blur(2px) contrast(2) hue-rotate(90deg); opacity: 0.8; }
    20% { transform: translate(4px, -2px) scale(0.95) skewX(10deg); filter: blur(0px) contrast(1.5); opacity: 1; }
    30% { transform: translate(-2px, 4px) scale(1.1) skewX(0deg); filter: blur(4px) contrast(3) invert(0.2); opacity: 0.6; }
    40% { transform: translate(2px, -4px) scale(1) skewX(-5deg); filter: blur(0px) contrast(1); opacity: 1; }
    50% { transform: translate(-5px, 0) scale(1.02) skewX(20deg); filter: blur(1px) contrast(2); opacity: 0.9; }
    100% { transform: translate(0) scale(1) skewX(0deg); filter: blur(0px) contrast(1); opacity: 1; }
  }
  .animate-extreme-glitch { animation: extreme-glitch 0.3s steps(2, end) infinite; }
`;

// ── COMPONENTE: TARJETA EXACTA A LA IMAGEN ──
const ExactCard = ({ item, isAirdrop = false, onClick }: any) => {
  const isSoldOut = isAirdrop ? item.supply.current === 0 : item.isSoldOut;
  const title = isAirdrop ? item.name : item.title;
  const price = item.price;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-[24px] p-3 flex flex-col overflow-hidden cursor-pointer active:scale-95 transition-all"
      style={{ backgroundColor: isAirdrop ? item.color : item.bgColor }}
    >
      {/* Destellos decorativos (Sparkles) */}
      <Sparkles className="absolute top-3 left-3 w-4 h-4 text-white/50" />
      <Sparkles className="absolute top-8 right-4 w-3 h-3 text-white/30" />

      {/* Ítem Central */}
      <div className="w-full aspect-[4/3] flex items-center justify-center relative mb-2">
        <img 
           src={isAirdrop ? item.imageSrc : item.imgSrc} 
           alt={title} 
           draggable={false}
           className={`w-[75%] h-[75%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : 'animate-box-float'}`}
        />
      </div>

      {/* Título y Tag */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-white font-bold text-[14px] truncate flex-1 pr-2" style={{ fontFamily: SFD }}>
          {title}
        </span>
        <span className="text-white/60 text-[12px] font-medium shrink-0" style={{ fontFamily: SF }}>
          {item.tag}
        </span>
      </div>

      {/* Píldora Inferior (Estado / Precio) */}
      <div className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] backdrop-blur-md ${isSoldOut ? 'bg-black/30' : 'bg-black/20'}`}>
        {/* Left Side: Status */}
        <div className="flex items-center gap-1.5">
           {isSoldOut ? (
             <>
               <Lock className="w-3.5 h-3.5 text-white/60" />
               <span className="text-white/80 text-[12px] font-bold" style={{ fontFamily: SF }}>Sold out</span>
             </>
           ) : (
             <>
               <Hexagon className="w-3.5 h-3.5 text-white/90" />
               <span className="text-white font-bold text-[12px]" style={{ fontFamily: SF }}>Listed</span>
             </>
           )}
        </div>

        {/* Right Side: Price */}
        <div className="flex items-center gap-1">
           <span className="text-white font-bold text-[13px]" style={{ fontFamily: SF }}>{price}</span>
           {!isAirdrop || item.currency === 'STARS' ? (
              <img src="/telegram-star-icon.png" className="w-3.5 h-3.5 opacity-90" alt="Star" />
           ) : (
              <span className="text-white/80 text-[11px] font-bold">BP</span>
           )}
        </div>
      </div>
    </div>
  )
}

export function MarketView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const tonBalance = "988.52"

  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  // Estados de Desencriptación
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [glitchText, setGlitchText] = useState("AWAITING_INPUT")
  const [wonItems, setWonItems] = useState<any[]>([])

  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      if (viewingBoxId) {
         setViewingBoxId(null)
         setOpeningState('idle')
      } else {
         setCurrentView("home") 
         tg.BackButton.hide()
      }
    }
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView, viewingBoxId])

  // Lógica del Texto Glitch (# + códigos)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (openingState === 'spinning') {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      interval = setInterval(() => {
        // Genera secuencias tipo: # 0x4F2A_SYS_ERR
        const randStr = Array.from({length: 6}).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setGlitchText(`# 0x${randStr}_DATA`);
      }, 60);
    } else if (openingState === 'idle') {
      setGlitchText("AWAITING_INPUT");
    }
    return () => clearInterval(interval);
  }, [openingState]);

  const handleOpenBox = () => {
    setOpeningState('spinning')
    setTimeout(() => {
      setWonItems([{ name: "5,000 BP", rarity: "Legendary", color: "#eab308" }])
      setOpeningState('result')
    }, 2800) // 2.8s de animación de hackeo
  }

  const activeBoxData = AIRDROP_CAPSULES.find(b => b.id === viewingBoxId)

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111111] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {viewingBoxId && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER REPLICADO EXACTO ── */}
      {!viewingBoxId && (
        <div className="sticky top-0 z-[100] w-full bg-[#111111]/90 backdrop-blur-xl pb-4 px-5 pt-8">
          
          <div className="flex flex-col mb-6 mt-4">
             {/* Saldo TON */}
             <div className="flex items-center gap-2 mb-4">
                <div className="w-[22px] h-[22px] rounded-full bg-[#0098EA] flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px] text-white">
                     <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2.5"/>
                     <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                     <path d="M12 16V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
                <span className="text-white font-bold text-[28px] tracking-tight" style={{ fontFamily: SFD }}>
                   {tonBalance} <span className="text-white/60 text-[20px] font-semibold">TON</span>
                </span>
             </div>
             
             {/* Píldoras de Acción */}
             <div className="flex gap-2.5">
                <button className="bg-white/10 hover:bg-white/20 text-white/90 px-4 py-2 rounded-full text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-all">
                   <LayoutGrid size={16} /> Collection
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white/90 px-4 py-2 rounded-full text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-all">
                   <SlidersHorizontal size={16} /> Stats
                </button>
             </div>
          </div>

          {/* Segment Control (Auction / Drops) */}
          <div className="flex bg-white/5 p-1 rounded-full w-full max-w-[260px]">
             <button 
               onClick={() => setActiveTab('Play')}
               className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
             >
               Drops
             </button>
             <button 
               onClick={() => setActiveTab('Auctions')}
               className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
             >
               Auction
             </button>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* VISTA: UNBOXING (CON GLITCH) */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 min-h-screen flex flex-col bg-[#0A0A0C]">
             
             <div className="flex-1 flex flex-col items-center justify-center relative mt-[-10vh]">
                
                {/* Visual del Glitch o Resultado */}
                <div className="relative z-20 w-[240px] h-[240px] flex items-center justify-center">
                  {openingState !== 'result' ? (
                    <img 
                      src={activeBoxData.imageSrc} 
                      alt="Box" 
                      draggable={false}
                      /* Si está girando, aplicamos la animación extrema de distorsión */
                      className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${openingState === 'spinning' ? 'animate-extreme-glitch opacity-80' : 'animate-box-float drop-shadow-2xl'}`} 
                    />
                  ) : (
                    <div className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center">
                       <div className="w-[140px] h-[140px] rounded-[32px] bg-[#111] border-2 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-6" style={{ borderColor: wonItems[0].color }}>
                          <Sparkles className="w-16 h-16" style={{ color: wonItems[0].color }} />
                       </div>
                       <span className="text-white font-bold text-[28px] text-center" style={{ fontFamily: SFD }}>
                         {wonItems[0].name}
                       </span>
                       <span className="text-[14px] font-bold mt-2 px-3 py-1 rounded-full border backdrop-blur-md" style={{ color: wonItems[0].color, backgroundColor: `${wonItems[0].color}15`, borderColor: `${wonItems[0].color}40` }}>
                         {wonItems[0].rarity}
                       </span>
                    </div>
                  )}
                </div>

                {/* Código de Terminal (Matriz/Hackeo) */}
                {openingState !== 'result' && (
                  <div className="mt-10 h-[40px] flex flex-col items-center justify-center bg-black/50 px-6 py-2 rounded-lg border border-red-500/20">
                     <span className={`font-mono text-[16px] font-bold tracking-[0.2em] transition-colors ${openingState === 'spinning' ? 'text-red-500' : 'text-[#8e8e93]'}`}>
                        {glitchText}
                     </span>
                     {openingState === 'spinning' && (
                       <span className="text-red-500/50 text-[10px] font-mono mt-1 animate-pulse">BYPASSING SECURITY FIREWALL...</span>
                     )}
                  </div>
                )}
             </div>

             {/* Controles */}
             <div className="w-full px-5 pb-10">
                {openingState === 'idle' && (
                  <button onClick={handleOpenBox} className="w-full bg-[#3b82f6] text-white py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all">
                     <Lock size={18} /> Initiate Override
                  </button>
                )}
                {openingState === 'spinning' && (
                  <button disabled className="w-full bg-red-600/20 text-red-500 border border-red-500/50 py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 animate-pulse">
                     <Loader2 className="w-5 h-5 animate-spin" /> EXTRACTING...
                  </button>
                )}
                {openingState === 'result' && (
                  <button onClick={() => { setViewingBoxId(null); setOpeningState('idle'); }} className="w-full bg-[#10b981] text-white py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all animate-in slide-in-from-bottom-4">
                     Collect Data
                  </button>
                )}
             </div>
          </div>

        ) : activeTab === 'Play' ? (
          /* VISTA DROPS */
          <div className="animate-in fade-in duration-300 px-5 pt-4">
             <div className="grid grid-cols-2 gap-3 pb-10">
                {AIRDROP_CAPSULES.map((box) => (
                  <ExactCard 
                    key={box.id} 
                    item={box} 
                    isAirdrop={true} 
                    onClick={() => (!box.supply.current || box.supply.current !== 0) ? setViewingBoxId(box.id) : null} 
                  />
                ))}
             </div>
          </div>
        ) : (
          /* VISTA AUCTIONS */
          <div className="animate-in fade-in duration-300 px-5 pt-4">
              <div className="grid grid-cols-2 gap-3 pb-10">
                 {AUCTION_ITEMS.map((item) => (
                    <ExactCard key={item.id} item={item} />
                 ))}
              </div>
          </div>
        )}
      </div>
    </div>
  )
}
