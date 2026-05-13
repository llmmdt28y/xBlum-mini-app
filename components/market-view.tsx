"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  ShoppingBag, Heart, GalleryHorizontalEnd, 
  Sparkles, LayoutGrid, ListFilter, Hexagon, Clock,
  Loader2, Lock
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Degradados basados en tu imagen) ──
const AIRDROP_CAPSULES = [
  { id: 'weekly_bp', name: 'Community Cache', tag: '#001', currency: 'BP', price: 2500, supply: { current: '∞', max: '∞' }, color: 'linear-gradient(180deg, #3A3A3C 0%, #111111 100%)', imageSrc: '/1000009369.png' },
  { id: 'grok_node', name: 'Neural Node', tag: '#442', currency: 'STARS', price: 150, supply: { current: 142, max: 500 }, color: 'linear-gradient(180deg, #1E3A8A 0%, #020617 100%)', imageSrc: '/1000009370.png' },
]

const AUCTION_ITEMS = [
  { id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false, color: 'linear-gradient(180deg, #5A3E1B 0%, #1A1205 100%)' }, // Dorado
  { id: 'crystal_2', title: 'Crystal Ball', tag: '#14640', imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true,  color: 'linear-gradient(180deg, #2A2A3C 0%, #0F0F16 100%)' }, // Gris azulado oscuro
  { id: 'crystal_3', title: 'Crystal Ball', tag: '#8842',  imgSrc: '/1000010037.png', price: '45', isSoldOut: false, color: 'linear-gradient(180deg, #4A1D4A 0%, #1A0A1A 100%)' }, // Púrpura
  { id: 'crystal_4', title: 'Crystal Ball', tag: '#9921',  imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false, color: 'linear-gradient(180deg, #3D1C1C 0%, #140808 100%)' }, // Rojizo oscuro
]

// ── Animaciones ──
const animationStyles = `
  @keyframes extreme-glitch {
    0% { transform: translate(0); filter: hue-rotate(0deg); opacity: 1; }
    20% { transform: translate(-4px, 2px) skewX(-5deg); filter: hue-rotate(90deg) contrast(1.5); opacity: 0.8; }
    40% { transform: translate(4px, -2px) skewX(5deg); filter: invert(0.2); opacity: 0.9; }
    60% { transform: translate(-2px, 4px) scale(1.05); filter: hue-rotate(180deg) brightness(1.5); opacity: 0.7; }
    80% { transform: translate(2px, -4px) scale(0.95); opacity: 1; }
    100% { transform: translate(0); filter: hue-rotate(0deg); opacity: 1; }
  }
  .animate-extreme-glitch { animation: extreme-glitch 0.15s infinite; }
  
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── ICONO DE MONEDA "V" EXACTO A LA IMAGEN ──
const VIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M4 4l8 16l8-16" />
  </svg>
)

// ── COMPONENTE: TARJETA RÉPLICA MILIMÉTRICA ──
const ReplicaCard = ({ item, isAirdrop = false, onClick }: any) => {
  const isSoldOut = isAirdrop ? item.supply.current === 0 : item.isSoldOut;
  const title = isAirdrop ? item.name : item.title;
  const price = item.price;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-[28px] flex flex-col overflow-hidden cursor-pointer active:scale-95 transition-transform aspect-[3/4] shadow-xl"
      style={{ background: item.color }}
    >
      {/* Destellos superiores */}
      {!isSoldOut && (
        <>
          <Sparkles className="absolute top-4 left-4 w-5 h-5 text-white drop-shadow-md" fill="currentColor" />
          <Sparkles className="absolute top-1/4 right-3 w-4 h-4 text-yellow-400 drop-shadow-md" fill="currentColor" />
        </>
      )}

      {/* Imagen Principal centrada */}
      <div className="flex-1 w-full relative flex items-center justify-center p-3 mt-4">
        <img 
           src={isAirdrop ? item.imageSrc : item.imgSrc} 
           alt={title} 
           draggable={false}
           className={`w-[85%] h-[85%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-110 ${isSoldOut ? 'grayscale opacity-60' : 'animate-float'}`}
        />
      </div>

      {/* Contenedor Inferior: Textos y Píldora (Sin fondo extra) */}
      <div className="w-full px-3 pb-3 flex flex-col gap-2">
        
        {/* Textos: Título a la izq, ID a la der */}
        <div className="flex justify-between items-center px-1">
           <span className="text-white font-bold text-[15px] tracking-tight" style={{ fontFamily: SFD }}>
             {title}
           </span>
           <span className="text-white/60 text-[13px] font-medium" style={{ fontFamily: SF }}>
             {item.tag}
           </span>
        </div>

        {/* Píldora de Precio bg-black/30 (ancho completo) */}
        <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] bg-black/30 backdrop-blur-sm">
           <div className="flex items-center gap-1.5">
              {isSoldOut ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-white/60 text-[13px] font-semibold" style={{ fontFamily: SF }}>Sold out</span>
                </>
              ) : (
                <>
                  <Hexagon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-bold text-[13px]" style={{ fontFamily: SF }}>Listed</span>
                </>
              )}
           </div>

           <div className="flex items-center gap-1">
              <span className="text-white font-bold text-[14px]">{price}</span>
              {/* Aquí usamos el icono V custom */}
              <VIcon />
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
  
  // Estados para Unboxing Glitch
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [glitchText, setGlitchText] = useState("SYSTEM_READY")
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

  // Lógica Glitch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (openingState === 'spinning') {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      interval = setInterval(() => {
        const randStr = Array.from({length: 8}).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setGlitchText(`# 0x${randStr}_DATA`);
      }, 50);
    } else if (openingState === 'idle') {
      setGlitchText("SYSTEM_READY");
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
    <div className="flex-1 flex flex-col h-full bg-[#18181A] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* ── HEADER (Réplica del Círculo Rojo Superior Izquierdo) ── */}
      {!viewingBoxId && (
        <div className="pt-12 px-5 pb-4 bg-gradient-to-b from-[#18181A] to-transparent z-40">
          
          {/* Saldo TON (Alineado a la izq) */}
          <div className="flex items-center gap-2 mb-5">
             {/* Squircle Azul TON */}
             <div className="w-[28px] h-[28px] rounded-[8px] bg-[#0098EA] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px] text-white">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <span className="text-white font-bold text-[28px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
                {tonBalance} <span className="text-white/60 text-[18px] font-semibold">TON</span>
             </span>
          </div>
          
          {/* Fila Botones: Collection (Píldora) + Filtro (Circular) */}
          <div className="flex gap-2.5 mb-6">
             <button className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-full text-[14px] font-semibold flex items-center gap-2 active:scale-95 transition-all">
                <LayoutGrid size={16} className="text-white/80" /> Collection
             </button>
             <button className="bg-white/10 hover:bg-white/15 text-white w-[38px] h-[38px] rounded-full flex items-center justify-center active:scale-95 transition-all">
                <ListFilter size={18} className="text-white/80" />
             </button>
          </div>

          {/* Segment Control Oscuro (Auction / Drops) */}
          <div className="flex bg-[#252528] p-1 rounded-full w-full max-w-[260px]">
             <button 
               onClick={() => setActiveTab('Auctions')}
               className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-[#3A3A3E] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white/80'}`}
             >
               Auction
             </button>
             <button 
               onClick={() => setActiveTab('Play')}
               className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-[#3A3A3E] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white/80'}`}
             >
               Drops
             </button>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* VISTA UNBOXING (GLITCH) */}
        {viewingBoxId && activeBoxData ? (
           <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 min-h-screen flex flex-col bg-[#0A0A0C] px-5">
             
             <div className="flex-1 flex flex-col items-center justify-center relative mt-[-5vh]">
                <div className="relative z-20 w-[260px] h-[260px] flex items-center justify-center">
                  {openingState !== 'result' ? (
                    <img 
                      src={activeBoxData.imageSrc} alt="Box" draggable={false}
                      className={`w-full h-full object-contain pointer-events-none transition-all duration-100 ${openingState === 'spinning' ? 'animate-extreme-glitch' : 'animate-float'}`} 
                    />
                  ) : (
                    <div className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center">
                       <div className="w-[140px] h-[140px] rounded-[32px] bg-[#161618] border-2 flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.6)] mb-6" style={{ borderColor: wonItems[0].color }}>
                          <Sparkles className="w-16 h-16 drop-shadow-lg" style={{ color: wonItems[0].color }} />
                       </div>
                       <span className="text-white font-bold text-[28px] text-center">{wonItems[0].name}</span>
                    </div>
                  )}
                </div>

                {/* Código Hack */}
                {openingState !== 'result' && (
                  <div className="mt-12 bg-black/60 px-6 py-3 rounded-xl border border-red-500/20 text-center">
                     <span className={`font-mono text-[18px] font-bold tracking-[0.2em] transition-colors ${openingState === 'spinning' ? 'text-red-500' : 'text-[#8e8e93]'}`}>
                        {glitchText}
                     </span>
                  </div>
                )}
             </div>

             <div className="w-full pb-10">
                {openingState === 'idle' && (
                  <button onClick={handleOpenBox} className="w-full bg-[#3b82f6] text-white py-4.5 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2">
                     <Lock size={20} /> Initiate Override
                  </button>
                )}
                {openingState === 'spinning' && (
                  <button disabled className="w-full bg-red-500/20 text-red-500 border border-red-500/50 py-4.5 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 animate-pulse">
                     <Loader2 className="w-5 h-5 animate-spin" /> CORRUPTING DATA...
                  </button>
                )}
                {openingState === 'result' && (
                  <button onClick={() => { setViewingBoxId(null); setOpeningState('idle'); }} className="w-full bg-white text-black py-4.5 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2">
                     Collect
                  </button>
                )}
             </div>
          </div>
        ) : (
          /* GRID DE TARJETAS */
          <div className="px-4 pt-2">
             <div className="grid grid-cols-2 gap-3.5">
                {activeTab === 'Auctions' 
                  ? AUCTION_ITEMS.map((item) => <ReplicaCard key={item.id} item={item} />)
                  : AIRDROP_CAPSULES.map((box) => <ReplicaCard key={box.id} item={box} isAirdrop={true} onClick={() => setViewingBoxId(box.id)} />)
                }
             </div>
          </div>
        )}
      </div>

      {/* ── MENÚ FLOTANTE ── */}
      {!viewingBoxId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-50">
          <div className="bg-[#2C2C2E]/90 backdrop-blur-2xl rounded-[32px] p-1.5 flex items-center justify-between shadow-2xl">
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 bg-white rounded-[28px]">
                <ShoppingBag size={22} className="text-black" />
                <span className="text-black font-bold text-[11px]">Store</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-white/50">
                <Heart size={22} />
                <span className="font-semibold text-[11px]">Saved</span>
             </button>
             <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-white/50">
                <GalleryHorizontalEnd size={22} />
                <span className="font-semibold text-[11px]">Activity</span>
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
