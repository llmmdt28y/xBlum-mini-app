"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  ShoppingBag, Heart, GalleryHorizontalEnd, 
  Sparkles, Loader2, Lock, Hexagon, AlignRight,
  ListFilter, Grid, Clock, Gem
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Colores Corregidos a Degradados Vibrantes) ──
const AIRDROP_CAPSULES = [
  { id: 'weekly_bp', name: 'Community Cache', tag: '#001', currency: 'BP', price: 2500, supply: { current: '∞', max: '∞' }, color: 'radial-gradient(circle at 50% 30%, #3a3a3c 0%, #1c1c1e 100%)', imageSrc: '/1000009369.png' },
  { id: 'grok_node', name: 'Neural Node', tag: '#442', currency: 'STARS', price: 150, supply: { current: 142, max: 500 }, color: 'radial-gradient(circle at 50% 30%, #2563eb 0%, #0f172a 100%)', imageSrc: '/1000009370.png' },
]

const AUCTION_ITEMS = [
  { id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false, color: 'radial-gradient(circle at 50% 30%, #5E4018 0%, #1A130A 100%)' }, // Dorado vibrante
  { id: 'crystal_2', title: 'Crystal Ball', tag: '#14640', imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true, color: 'radial-gradient(circle at 50% 30%, #2B2B3D 0%, #111116 100%)' }, // Gris azulado
  { id: 'crystal_3', title: 'Crystal Ball', tag: '#8842', imgSrc: '/1000010037.png', price: '45', isSoldOut: false, color: 'radial-gradient(circle at 50% 30%, #4D214D 0%, #1A0B1A 100%)' }, // Púrpura intenso
  { id: 'crystal_4', title: 'Crystal Ball', tag: '#9921', imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false, color: 'radial-gradient(circle at 50% 30%, #3D1C1C 0%, #1A0A0A 100%)' }, // Rojo vino
]

// ── Animaciones ──
const animationStyles = `
  @keyframes box-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .animate-box-float { animation: box-float 4s ease-in-out infinite; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── COMPONENTE: TARJETA EXACTA A LA REFERENCIA ──
const ImageCard = ({ item, isAirdrop = false, onClick }: any) => {
  const isSoldOut = isAirdrop ? item.supply.current === 0 : item.isSoldOut;
  const title = isAirdrop ? item.name : item.title;
  const price = item.price;

  return (
    <div 
      onClick={onClick}
      className="relative rounded-[24px] flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] transition-transform aspect-[4/5] shadow-lg"
      style={{ background: item.color }}
    >
      {/* Brillo Superior y Destellos */}
      {!isSoldOut && (
        <>
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <Sparkles className="absolute top-4 left-4 w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" />
          <Sparkles className="absolute top-1/3 right-4 w-3 h-3 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" fill="currentColor" />
        </>
      )}

      {/* Imagen Principal (Centrada en la parte superior/media) */}
      <div className="flex-1 w-full relative flex items-center justify-center p-4">
        {/* Usamos un div como placeholder si la imagen se rompe como en tu captura */}
        <div className="w-[75%] h-[75%] relative flex items-center justify-center">
            <img 
               src={isAirdrop ? item.imageSrc : item.imgSrc} 
               alt={title} 
               draggable={false}
               className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 ${isSoldOut ? 'grayscale opacity-50' : 'animate-box-float'}`}
               style={{ WebkitTouchCallout: "none" }}
            />
        </div>
      </div>

      {/* Contenedor Inferior (Textos y Píldora) */}
      <div className="w-full flex flex-col px-3 pb-3">
        {/* Textos: Título e ID */}
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-white font-bold text-[14px] tracking-tight" style={{ fontFamily: SFD }}>
            {title}
          </span>
          <span className="text-white/50 text-[12px] font-medium" style={{ fontFamily: SF }}>
            {item.tag}
          </span>
        </div>

        {/* Píldora Inferior (Estado y Precio) */}
        <div className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[14px] ${isSoldOut ? 'bg-[#1C1C1E]/80 backdrop-blur-md' : 'bg-[#18181A]/40 backdrop-blur-md'}`}>
          <div className="flex items-center gap-2">
             {isSoldOut ? (
               <>
                 <Clock className="w-3.5 h-3.5 text-white/50" />
                 <span className="text-white/70 text-[12px] font-bold" style={{ fontFamily: SF }}>Sold out</span>
               </>
             ) : (
               <>
                 <Hexagon className="w-3.5 h-3.5 text-white/90" />
                 <span className="text-white font-bold text-[12px]" style={{ fontFamily: SF }}>Listed</span>
               </>
             )}
          </div>

          <div className="flex items-center gap-1.5">
             <span className="text-white font-bold text-[14px]">{price}</span>
             {!isAirdrop || item.currency === 'STARS' ? (
                // Símbolo V / Diamante como en la referencia
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white">
                  <path d="M12 21L2 7L12 3L22 7L12 21Z" fill="currentColor" opacity="0.8"/>
                </svg>
             ) : (
                <span className="text-white/80 text-[10px] font-bold">BP</span>
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

  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
       setCurrentView("home") 
       tg.BackButton.hide()
    }
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView])

  return (
    // Color de fondo oscuro sólido (simulando Telegram app bg)
    <div className="flex-1 flex flex-col h-full bg-[#18181A] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* ── HEADER REPLICA EXACTA ── */}
      <div className="sticky top-0 z-40 w-full bg-[#18181A]/95 backdrop-blur-xl pb-4 px-5 pt-10 border-b border-white/[0.02]">
        
        {/* Saldo TON y Flecha Back implícita en nav nativo */}
        <div className="flex items-center gap-2 mb-5">
           {/* Diamante azul de TON */}
           <div className="w-[26px] h-[26px] rounded-full bg-[#0098EA] flex items-center justify-center">
              <Gem className="w-[14px] h-[14px] text-white" fill="currentColor" />
           </div>
           <span className="text-white font-bold text-[30px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
              {tonBalance} <span className="text-white/50 text-[18px] font-semibold">TON</span>
           </span>
        </div>
        
        {/* Píldoras Sub-Acciones (Collection / Filter) */}
        <div className="flex gap-2.5 mb-6">
           <button className="bg-[#2C2C2E] text-white px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
              <Grid size={15} className="text-white/70" /> Collection
           </button>
           <button className="bg-[#2C2C2E] text-white px-3.5 py-2 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-sm">
              <ListFilter size={16} className="text-white/70" />
           </button>
        </div>

        {/* Segment Control (Auction | Drops) */}
        <div className="flex bg-[#232325] p-1 rounded-full w-full max-w-[280px]">
           <button 
             onClick={() => setActiveTab('Auctions')}
             className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-[#3A3A3C] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white/70'}`}
           >
             Auction
           </button>
           <button 
             onClick={() => setActiveTab('Play')}
             className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-[#3A3A3C] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white/70'}`}
           >
             Drops
           </button>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL (GRID) ── */}
      <div className="flex-1 overflow-y-auto pb-48 pt-5">
        <div className="px-5">
           <div className="grid grid-cols-2 gap-3.5">
              {activeTab === 'Auctions' 
                ? AUCTION_ITEMS.map((item) => <ImageCard key={item.id} item={item} />)
                : AIRDROP_CAPSULES.map((box) => <ImageCard key={box.id} item={box} isAirdrop={true} />)
              }
           </div>
        </div>
      </div>

      {/* ── MENÚ FLOTANTE INFERIOR (Store/Saved/Activity) ── */}
      {/* Se añadió 'bottom-24' para no chocar con el nav principal de Market */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-50">
        <div className="bg-[#2C2C2E]/80 backdrop-blur-2xl border border-white/[0.05] rounded-[32px] p-1.5 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
           {/* Store (Activo) */}
           <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-[#EFEFF0] rounded-[28px] shadow-sm">
              <ShoppingBag size={20} className="text-[#1C1C1E]" fill="currentColor" fillOpacity={0.2} />
              <span className="text-[#1C1C1E] font-bold text-[11px] tracking-wide" style={{ fontFamily: SF }}>Store</span>
           </button>
           {/* Saved */}
           <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-white/50 hover:text-white/90 transition-colors">
              <Heart size={20} fill="currentColor" fillOpacity={0} />
              <span className="font-semibold text-[11px] tracking-wide" style={{ fontFamily: SF }}>Saved</span>
           </button>
           {/* Activity */}
           <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-white/50 hover:text-white/90 transition-colors">
              <GalleryHorizontalEnd size={20} />
              <span className="font-semibold text-[11px] tracking-wide" style={{ fontFamily: SF }}>Activity</span>
           </button>
        </div>
      </div>
    </div>
  )
}
