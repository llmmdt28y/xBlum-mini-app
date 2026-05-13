"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  ShoppingBag, Heart, GalleryHorizontalEnd, 
  Sparkles, Loader2, Lock, Hexagon, AlignRight
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Colores basados en tu imagen) ──
const AIRDROP_CAPSULES = [
  { id: 'weekly_bp', name: 'Community Cache', tag: '#001', currency: 'BP', price: 2500, supply: { current: '∞', max: '∞' }, color: 'linear-gradient(135deg, #2A2A2E, #1A1A1C)', imageSrc: '/1000009369.png' },
  { id: 'grok_node', name: 'Neural Node', tag: '#442', currency: 'STARS', price: 150, supply: { current: 142, max: 500 }, color: 'linear-gradient(135deg, #1A233A, #0D1326)', imageSrc: '/1000009370.png' },
  { id: 'vortx_vip', name: 'VortX Genesis', tag: '#089', currency: 'STARS', price: 1000, supply: { current: 0, max: 50 }, color: 'linear-gradient(135deg, #332714, #1A130A)', imageSrc: '/1000009361.png' }
]

const AUCTION_ITEMS = [
  { id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false, color: 'linear-gradient(135deg, #332714, #1A130A)' }, // Dorado
  { id: 'crystal_2', title: 'Crystal Ball', tag: '#14640', imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true, color: 'linear-gradient(135deg, #1E1B2E, #0F0D17)' }, // Oscuro/Gris
  { id: 'crystal_3', title: 'Crystal Ball', tag: '#8842', imgSrc: '/1000010037.png', price: '45', isSoldOut: false, color: 'linear-gradient(135deg, #2D1B2E, #170D17)' }, // Púrpura
  { id: 'crystal_4', title: 'Crystal Ball', tag: '#9921', imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false, color: 'linear-gradient(135deg, #2A1A1A, #150D0D)' }, // Rojo sutil
]

// ── CSS INYECTADO (Animaciones Glitch & Float) ──
const animationStyles = `
  @keyframes box-float { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-8px); } 
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

// ── COMPONENTE: TARJETA RÉPLICA EXACTA ──
const ImageCard = ({ item, isAirdrop = false, onClick }: any) => {
  const isSoldOut = isAirdrop ? item.supply.current === 0 : item.isSoldOut;
  const title = isAirdrop ? item.name : item.title;
  const price = item.price;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-[28px] flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] transition-transform aspect-[4/5] border border-white/5"
      style={{ background: item.color }}
    >
      {/* Destellos */}
      {!isSoldOut && (
        <>
          <Sparkles className="absolute top-4 left-4 w-5 h-5 text-white/80 drop-shadow-md" fill="currentColor" />
          <Sparkles className="absolute top-10 right-6 w-3 h-3 text-yellow-300/80 drop-shadow-md" fill="currentColor" />
        </>
      )}

      {/* Imagen Principal (Flotando libremente) */}
      <div className="flex-1 w-full relative flex items-center justify-center p-6">
        <img 
           src={isAirdrop ? item.imageSrc : item.imgSrc} 
           alt={title} 
           draggable={false}
           className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : 'animate-box-float'}`}
           style={{ WebkitTouchCallout: "none" }}
        />
      </div>

      {/* Información integrada en la parte inferior */}
      <div className="w-full flex flex-col px-3 pb-3">
        {/* Textos directamente sobre el fondo */}
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-white font-bold text-[15px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
            {title}
          </span>
          <span className="text-white/60 text-[13px] font-medium leading-none" style={{ fontFamily: SF }}>
            {item.tag}
          </span>
        </div>

        {/* Píldora de Precio / Ancho Completo */}
        <div className="w-full flex items-center justify-between px-4 py-3 rounded-[20px] bg-black/40 backdrop-blur-md border border-white/5">
          <div className="flex items-center gap-1.5">
             {isSoldOut ? (
               <>
                 <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white/60">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
                 <span className="text-white/80 text-[13px] font-bold" style={{ fontFamily: SF }}>Sold out</span>
               </>
             ) : (
               <>
                 <Hexagon className="w-3.5 h-3.5 text-white/90" />
                 <span className="text-white font-bold text-[13px]" style={{ fontFamily: SF }}>Listed</span>
               </>
             )}
          </div>

          <div className="flex items-center gap-1">
             <span className="text-white font-bold text-[14px]">{price}</span>
             {!isAirdrop || item.currency === 'STARS' ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
             ) : (
                <span className="text-white/80 text-[12px] font-bold">BP</span>
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

  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Auctions')
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
    <div className="flex-1 flex flex-col h-full bg-[#1A1A1D] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {viewingBoxId && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER CON BLUR SEMI-BLANCO (Réplica de la imagen) ── */}
      {!viewingBoxId && (
        <div className="sticky top-0 z-40 w-full bg-white/[0.02] backdrop-blur-3xl pb-4 px-5 pt-12 border-b border-white/[0.05]">
          
          {/* Saldo TON */}
          <div className="flex items-center gap-2 mb-6">
             <div className="w-[26px] h-[26px] rounded-full bg-[#0098EA] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px] text-white">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <span className="text-white font-bold text-[32px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
                {tonBalance} <span className="text-white/60 text-[22px] font-semibold">TON</span>
             </span>
          </div>
          
          {/* Píldoras de Acción (Thin blur) */}
          <div className="flex gap-2.5 mb-8">
             <button className="bg-white/[0.08] backdrop-blur-xl text-white px-4 py-2 rounded-full text-[15px] font-semibold flex items-center gap-2 active:scale-95 transition-all">
                <div className="w-4 h-4 grid grid-cols-2 gap-[2px] opacity-80">
                   <div className="bg-current rounded-[3px]"></div><div className="bg-current rounded-[3px]"></div>
                   <div className="bg-current rounded-[3px]"></div><div className="bg-current rounded-[3px]"></div>
                </div>
                Collection
             </button>
             <button className="bg-white/[0.08] backdrop-blur-xl text-white px-3.5 py-2 rounded-full flex items-center justify-center active:scale-95 transition-all">
                <AlignRight size={18} className="opacity-80" />
             </button>
          </div>

          {/* Segment Control (Play | Auctions) */}
          <div className="flex bg-white/[0.08] backdrop-blur-2xl p-1 rounded-full w-full max-w-[300px]">
             <button 
               onClick={() => setActiveTab('Auctions')}
               className={`flex-1 py-1.5 rounded-full text-[15px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-white/[0.15] text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
             >
               Auction
             </button>
             <button 
               onClick={() => setActiveTab('Play')}
               className={`flex-1 py-1.5 rounded-full text-[15px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-white/[0.15] text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
             >
               Drops
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
          <div className="animate-in fade-in duration-300 px-4">
             <div className="grid grid-cols-2 gap-3">
                {AIRDROP_CAPSULES.map((box) => (
                  <ImageCard 
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
          <div className="animate-in fade-in duration-300 px-4">
              <div className="grid grid-cols-2 gap-3">
                 {AUCTION_ITEMS.map((item) => (
                    <ImageCard key={item.id} item={item} />
                 ))}
              </div>
          </div>
        )}
      </div>

      {/* ── MENÚ INFERIOR FLOTANTE (ESTILO BLUR IMAGEN) ── */}
      {!viewingBoxId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-50">
          <div className="bg-white/[0.12] backdrop-blur-3xl border border-white/[0.05] rounded-[32px] p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
             {/* Pestaña Activa (Store) */}
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 bg-white/[0.15] rounded-[28px] shadow-sm">
                <ShoppingBag size={22} className="text-white" fill="currentColor" fillOpacity={0.2} />
                <span className="text-white font-medium text-[12px] tracking-wide" style={{ fontFamily: SF }}>Store</span>
             </button>
             {/* Pestaña Inactiva */}
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-white/50 hover:text-white/80 transition-colors">
                <Heart size={22} fill="currentColor" fillOpacity={0} />
                <span className="font-medium text-[12px] tracking-wide" style={{ fontFamily: SF }}>Saved</span>
             </button>
             {/* Pestaña Inactiva */}
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-white/50 hover:text-white/80 transition-colors">
                <GalleryHorizontalEnd size={22} />
                <span className="font-medium text-[12px] tracking-wide" style={{ fontFamily: SF }}>Activity</span>
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
