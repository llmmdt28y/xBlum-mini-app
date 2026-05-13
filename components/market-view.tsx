"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  LayoutGrid, SlidersHorizontal, User, 
  Search, Sparkles, Loader2, Lock, Hexagon,
  ShoppingBag, Heart, Clock
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual ──
const AIRDROP_CAPSULES = [
  { id: 'weekly_bp', name: 'Community Cache', tag: '#001', currency: 'BP', price: 2500, supply: { current: '∞', max: '∞' }, imageSrc: '/1000009369.png' },
  { id: 'grok_node', name: 'Neural Node', tag: '#442', currency: 'STARS', price: 150, supply: { current: 142, max: 500 }, imageSrc: '/1000009370.png' },
  { id: 'vortx_vip', name: 'VortX Genesis', tag: '#089', currency: 'STARS', price: 1000, supply: { current: 0, max: 50 }, imageSrc: '/1000009361.png' }
]

const AUCTION_ITEMS = [
  { id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false },
  { id: 'crystal_2', title: 'Incubus', tag: '#14640', imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true },
  { id: 'crystal_3', title: 'Fuschia', tag: '#8842', imgSrc: '/1000010037.png', price: '45', isSoldOut: false },
  { id: 'crystal_4', title: 'Silver', tag: '#9921', imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false },
]

// ── CSS INYECTADO (Animaciones Glitch & Float) ──
const animationStyles = `
  @keyframes box-float { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-6px); } 
  }
  .animate-box-float { animation: box-float 4s ease-in-out infinite; }
  
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
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── COMPONENTE: TARJETA LIMPIA (Sin contenedores de color de fondo) ──
const CleanCard = ({ item, isAirdrop = false, onClick }: any) => {
  const isSoldOut = isAirdrop ? item.supply.current === 0 : item.isSoldOut;
  const title = isAirdrop ? item.name : item.title;
  const price = item.price;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-[28px] bg-[#161618] flex flex-col overflow-hidden cursor-pointer active:scale-95 transition-all border border-white/5"
    >
      {/* Imagen Superior (Es la propia imagen la que da el color) */}
      <div className="w-full aspect-square relative bg-[#1A1A1C]">
        <img 
           src={isAirdrop ? item.imageSrc : item.imgSrc} 
           alt={title} 
           draggable={false}
           className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isSoldOut ? 'grayscale opacity-50' : ''}`}
           style={{ WebkitTouchCallout: "none" }}
        />
        {/* Destellos opcionales */}
        {!isSoldOut && <Sparkles className="absolute top-3 left-3 w-4 h-4 text-white/70 drop-shadow-md" />}
      </div>

      {/* Contenedor Inferior Oscuro */}
      <div className="flex flex-col p-3 bg-[#161618]">
        {/* Título y Tag */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-white font-bold text-[15px] truncate flex-1 pr-2 leading-tight" style={{ fontFamily: SFD }}>
            {title}
          </span>
          <span className="text-[#8e8e93] text-[12px] font-medium shrink-0" style={{ fontFamily: SF }}>
            {item.tag}
          </span>
        </div>

        {/* Botón/Píldora Inferior Integrada */}
        <div className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] border ${isSoldOut ? 'bg-[#1C1C1E]/60 border-transparent' : 'bg-[#2C2C2E]/50 border-white/5'}`}>
          <div className="flex items-center gap-1.5">
             {isSoldOut ? (
               <>
                 <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#8e8e93]">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                 <span className="text-[#8e8e93] text-[12px] font-bold" style={{ fontFamily: SF }}>Sold out</span>
               </>
             ) : (
               <>
                 <Hexagon className="w-3.5 h-3.5 text-[#8e8e93]" />
                 <span className="text-white font-bold text-[12px]" style={{ fontFamily: SF }}>Listed</span>
               </>
             )}
          </div>

          <div className="flex items-center gap-1">
             <span className="text-white font-bold text-[14px]" style={{ fontFamily: SF }}>{price}</span>
             {!isAirdrop || item.currency === 'STARS' ? (
                <img src="/telegram-star-icon.png" className="w-3.5 h-3.5 opacity-90" alt="Star" />
             ) : (
                <span className="text-white/80 text-[11px] font-bold">BP</span>
             )}
          </div>
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
        const randStr = Array.from({length: 8}).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setGlitchText(`# 0x${randStr}_SYS`);
      }, 50);
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
    }, 2800)
  }

  const activeBoxData = AIRDROP_CAPSULES.find(b => b.id === viewingBoxId)

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0E0E10] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {viewingBoxId && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER CON BOTONES LARGOS BLUR ── */}
      {!viewingBoxId && (
        <div className="sticky top-0 z-40 w-full bg-[#0E0E10]/80 backdrop-blur-xl pb-4 px-5 pt-8 border-b border-white/5">
          
          {/* Saldo TON */}
          <div className="flex items-center gap-2 mb-5">
             <div className="w-[28px] h-[28px] rounded-full bg-[#0098EA] flex items-center justify-center shadow-[0_0_15px_rgba(0,152,234,0.4)]">
                <svg viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px] text-white">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <span className="text-white font-bold text-[32px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
                {tonBalance} <span className="text-white/50 text-[20px] font-semibold">TON</span>
             </span>
          </div>
          
          {/* Botones Anchos y Esmerilados */}
          <div className="flex gap-3 mb-6">
             <button className="flex-1 bg-white/10 backdrop-blur-md hover:bg-white/15 text-white py-3.5 rounded-[20px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-white/5 shadow-sm">
                <LayoutGrid size={18} className="opacity-70" /> Collection
             </button>
             <button className="flex-1 bg-white/10 backdrop-blur-md hover:bg-white/15 text-white py-3.5 rounded-[20px] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-white/5 shadow-sm">
                <SlidersHorizontal size={18} className="opacity-70" /> Stats
             </button>
          </div>

          {/* Segment Control Oscuro */}
          <div className="flex bg-[#1C1C1E] p-1.5 rounded-full w-full">
             <button 
               onClick={() => setActiveTab('Play')}
               className={`flex-1 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'}`}
             >
               Drops
             </button>
             <button 
               onClick={() => setActiveTab('Auctions')}
               className={`flex-1 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'}`}
             >
               Auction
             </button>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto pb-40 pt-4">
        
        {/* VISTA: UNBOXING (CON GLITCH PIXELADO) */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 min-h-[80vh] flex flex-col bg-[#0E0E10]">
             
             <div className="flex-1 flex flex-col items-center justify-center relative mt-[-10vh]">
                
                {/* Contenedor Visual */}
                <div className="relative z-20 w-[240px] h-[240px] flex items-center justify-center">
                  {openingState !== 'result' ? (
                    <img 
                      src={activeBoxData.imageSrc} 
                      alt="Box" 
                      draggable={false}
                      className={`w-full h-full object-contain pointer-events-none transition-all duration-200 ${openingState === 'spinning' ? 'animate-extreme-glitch opacity-90' : 'animate-box-float drop-shadow-2xl'}`} 
                    />
                  ) : (
                    <div className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center">
                       <div className="w-[140px] h-[140px] rounded-[32px] bg-[#161618] border-2 flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.6)] mb-6" style={{ borderColor: wonItems[0].color }}>
                          <Sparkles className="w-16 h-16 drop-shadow-lg" style={{ color: wonItems[0].color }} />
                       </div>
                       <span className="text-white font-bold text-[28px] text-center" style={{ fontFamily: SFD }}>
                         {wonItems[0].name}
                       </span>
                       <span className="text-[14px] font-bold mt-2 px-4 py-1.5 rounded-full border backdrop-blur-md" style={{ color: wonItems[0].color, backgroundColor: `${wonItems[0].color}15`, borderColor: `${wonItems[0].color}40` }}>
                         {wonItems[0].rarity}
                       </span>
                    </div>
                  )}
                </div>

                {/* Código Hack/Terminal */}
                {openingState !== 'result' && (
                  <div className="mt-12 flex flex-col items-center justify-center bg-black/60 px-6 py-3 rounded-xl border border-[#3b82f6]/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                     <span className={`font-mono text-[18px] font-bold tracking-[0.2em] transition-colors ${openingState === 'spinning' ? 'text-[#3b82f6]' : 'text-[#8e8e93]'}`}>
                        {glitchText}
                     </span>
                     {openingState === 'spinning' && (
                       <span className="text-[#3b82f6]/60 text-[11px] font-mono mt-1.5 animate-pulse tracking-widest">DECRYPTING ARCHIVE...</span>
                     )}
                  </div>
                )}
             </div>

             {/* Controles de Unboxing */}
             <div className="w-full px-5 pb-10">
                {openingState === 'idle' && (
                  <button onClick={handleOpenBox} className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white py-4.5 rounded-[24px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all">
                     <Lock size={20} /> Initiate Override
                  </button>
                )}
                {openingState === 'spinning' && (
                  <button disabled className="w-full bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/50 py-4.5 rounded-[24px] font-bold text-[18px] flex items-center justify-center gap-2 animate-pulse">
                     <Loader2 className="w-5 h-5 animate-spin" /> RUNNING SEQUENCE
                  </button>
                )}
                {openingState === 'result' && (
                  <button onClick={() => { setViewingBoxId(null); setOpeningState('idle'); }} className="w-full bg-white text-black py-4.5 rounded-[24px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all animate-in slide-in-from-bottom-4">
                     Collect Data
                  </button>
                )}
             </div>
          </div>

        ) : activeTab === 'Play' ? (
          /* VISTA DROPS */
          <div className="animate-in fade-in duration-300 px-5">
             <div className="grid grid-cols-2 gap-4">
                {AIRDROP_CAPSULES.map((box) => (
                  <CleanCard 
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
          <div className="animate-in fade-in duration-300 px-5">
              <div className="grid grid-cols-2 gap-4">
                 {AUCTION_ITEMS.map((item) => (
                    <CleanCard key={item.id} item={item} />
                 ))}
              </div>
          </div>
        )}
      </div>

      {/* ── MENÚ INFERIOR FLOTANTE CON EFECTO BLUR ── */}
      {!viewingBoxId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-[340px] z-50">
          <div className="bg-[#2C2C2E]/70 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
             <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-white/10 rounded-[24px] shadow-sm">
                <ShoppingBag size={20} className="text-white" />
                <span className="text-white font-semibold text-[11px]">Store</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-[#8e8e93] hover:text-white transition-colors">
                <Heart size={20} />
                <span className="font-semibold text-[11px]">Saved</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-[#8e8e93] hover:text-white transition-colors">
                <Clock size={20} />
                <span className="font-semibold text-[11px]">Activity</span>
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
