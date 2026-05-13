"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  LayoutGrid, SlidersHorizontal, User, Package, 
  Search, Sparkles, Loader2, Lock
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Base de Datos Visual (Airdrops & Auctions) ──
const AIRDROP_CAPSULES = [
  { 
    id: 'weekly_bp', 
    name: 'Community Cache', 
    currency: 'BP', 
    price: 2500, 
    supply: { current: '∞', max: '∞' }, 
    color: '#8e8e93', 
    imageSrc: '/1000009369.png' 
  },
  { 
    id: 'grok_node', 
    name: 'Neural Node', 
    currency: 'STARS', 
    price: 150, 
    supply: { current: 142, max: 500 }, 
    color: '#3b82f6', 
    imageSrc: '/1000009370.png' 
  },
  { 
    id: 'vortx_vip', 
    name: 'VortX Genesis', 
    currency: 'STARS', 
    price: 1000, 
    supply: { current: 0, max: 50 }, 
    color: '#eab308', 
    imageSrc: '/1000009361.png' 
  }
]

const INSIDE_ITEMS = [
  { id: 1, name: "5,000 BP", rarity: "Legendary", color: "#eab308", drop: "0.5%" },
  { id: 2, name: "Grok 3 API Trial", rarity: "Legendary", color: "#a855f7", drop: "1.2%" },
  { id: 3, name: "VortX VIP Badge", rarity: "Rare", color: "#3b82f6", drop: "15.0%" },
  { id: 4, name: "100 Stars", rarity: "Rare", color: "#eab308", drop: "25.3%" },
  { id: 5, name: "Dark Theme UI", rarity: "Common", color: "#c084fc", drop: "58.0%" },
]

const AUCTION_ITEMS = [
  { 
    id: 'crystal_1', title: 'Crystal Ball', tag: '#11179', collection: 'Crystal Balls',
    imgSrc: '/1000010040.jpg', price: '20', isSoldOut: false, color: '#eab308'
  },
  { 
    id: 'crystal_2', title: 'Incubus', tag: '#14640', collection: 'Crystal Balls',
    imgSrc: '/1000010039.jpg', price: '80', isSoldOut: true, color: '#ef4444'
  },
  { 
    id: 'crystal_3', title: 'Fuschia', tag: '#8842', collection: 'Crystal Balls',
    imgSrc: '/1000010037.png', price: '45', isSoldOut: false, color: '#c084fc'
  },
  { 
    id: 'crystal_4', title: 'Silver', tag: '#9921', collection: 'Crystal Balls',
    imgSrc: '/1000010040.jpg', price: '15', isSoldOut: false, color: '#8e8e93'
  },
]

// ── Estilos de Animación ──
const animationStyles = `
  @keyframes box-float { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-8px); } 
  }
  .animate-box-float { animation: box-float 4s ease-in-out infinite; }
  
  @keyframes matrix-glitch {
    0% { opacity: 1; transform: scale(1); filter: hue-rotate(0deg); }
    20% { opacity: 0.8; transform: scale(1.02) translate(2px, -2px); filter: hue-rotate(90deg); }
    40% { opacity: 0.9; transform: scale(0.98) translate(-2px, 2px); filter: hue-rotate(180deg); }
    60% { opacity: 1; transform: scale(1.05) translate(1px, 1px); filter: hue-rotate(270deg); }
    80% { opacity: 0.8; transform: scale(0.95) translate(-1px, -1px); filter: hue-rotate(360deg); }
    100% { opacity: 1; transform: scale(1); filter: hue-rotate(0deg); }
  }
  .animate-matrix { animation: matrix-glitch 0.2s linear infinite; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ── COMPONENTE: AIRDROP CARD ──
const AirdropCard = ({ item, onClick }: { item: any, onClick: () => void }) => {
  const isSoldOut = item.supply.current === 0;

  return (
    <div 
      onClick={onClick}
      className="relative bg-[#0D0D0F] rounded-[28px] p-3 flex flex-col border border-white/5 overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-lg"
    >
      {/* Glow de fondo */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.15] blur-[40px] rounded-full pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: item.color }} 
      />

      {/* Imagen Central */}
      <div className="w-full aspect-square flex items-center justify-center relative z-10 mb-2">
        <img 
           src={item.imageSrc} 
           alt={item.name} 
           draggable={false}
           className={`w-[70%] h-[70%] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-40' : 'animate-box-float'}`}
           style={{ WebkitTouchCallout: "none" }}
        />
      </div>

      {/* Textos y Etiquetas */}
      <div className="relative z-10 flex items-end justify-between mt-auto px-1">
        <div className="flex flex-col">
          <span className="text-white font-bold text-[15px] leading-tight" style={{ fontFamily: SFD }}>
            {item.name}
          </span>
          {!isSoldOut && item.supply.current !== '∞' && (
            <span className="text-[#8e8e93] text-[11px] font-bold mt-0.5" style={{ fontFamily: SF }}>
              {item.supply.current} / {item.supply.max} left
            </span>
          )}
          {item.supply.current === '∞' && (
            <span className="text-[#8e8e93] text-[11px] font-bold mt-0.5" style={{ fontFamily: SF }}>
              Unlimited
            </span>
          )}
        </div>

        {/* Precio Pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${isSoldOut ? 'bg-[#1c1c1e] border-white/5' : 'bg-white/10 border-white/10'}`}>
          {isSoldOut ? (
             <span className="text-[#8e8e93] text-[11px] font-bold">Sold out</span>
          ) : (
             <>
               {item.currency === 'STARS' ? (
                 <img src="/telegram-star-icon.png" className="w-3 h-3 pointer-events-none select-none" alt="Star" />
               ) : (
                 <Sparkles className="w-3 h-3 text-[#eab308]" />
               )}
               <span className="text-white text-[12px] font-bold">{item.price}</span>
             </>
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

  // ── ESTADOS ──
  const [activeTab, setActiveTab] = useState<'Play' | 'Auctions'>('Play')
  const [viewingBoxId, setViewingBoxId] = useState<string | null>(null)
  
  // Estados de Desencriptación (Unboxing)
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'result'>('idle')
  const [glitchText, setGlitchText] = useState("DECRYPT")
  const [wonItems, setWonItems] = useState<any[]>([])

  // ── BACK BUTTON TELEGRAM ──
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

  // ── LÓGICA DE DESENCRIPTACIÓN ──
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (openingState === 'spinning') {
      interval = setInterval(() => {
        setGlitchText(`0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`);
      }, 50);
    } else if (openingState === 'idle') {
      setGlitchText("DECRYPT");
    }
    return () => clearInterval(interval);
  }, [openingState]);

  const handleOpenBox = () => {
    setOpeningState('spinning')
    
    // Simular el tiempo de hackeo/desencriptación
    setTimeout(() => {
      const randomItem = INSIDE_ITEMS[Math.floor(Math.random() * INSIDE_ITEMS.length)]
      setWonItems([randomItem])
      setOpeningState('result')
    }, 2500)
  }

  const activeBoxData = AIRDROP_CAPSULES.find(b => b.id === viewingBoxId)

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060606] relative overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Ocultar Navbar Global en Unboxing */}
      {viewingBoxId && (
        <style dangerouslySetInnerHTML={{ __html: `#main-nav-bar { display: none !important; }` }} />
      )}

      {/* ── HEADER PREMIUM (Balance & Tabs) ── */}
      {!viewingBoxId && (
        <div className="sticky top-0 z-[100] w-full bg-[#060606]/80 backdrop-blur-xl border-b border-white/5 pb-4 px-5 pt-8">
          
          <div className="flex items-center justify-between mb-6">
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                   </div>
                   <span className="text-white font-bold text-[24px] tracking-tight" style={{ fontFamily: SFD }}>
                      {tonBalance} <span className="text-[#8e8e93] text-[18px]">TON</span>
                   </span>
                </div>
                
                <div className="flex gap-2 mt-3">
                   <button className="bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white px-3.5 py-1.5 rounded-full border border-white/5 text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-all">
                      <LayoutGrid size={13} className="text-[#8e8e93]" /> Collection
                   </button>
                   <button className="bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white px-3.5 py-1.5 rounded-full border border-white/5 text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-all">
                      <SlidersHorizontal size={13} className="text-[#8e8e93]" /> Activity
                   </button>
                </div>
             </div>
             
             <button className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1c1c1e] to-[#2c2c2e] border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <User size={20} className="text-white" />
             </button>
          </div>

          <div className="flex justify-center w-full">
             <div className="flex bg-[#111111] p-1 rounded-[20px] w-full border border-white/5">
                <button 
                  onClick={() => setActiveTab('Play')}
                  className={`flex-1 py-2.5 rounded-[16px] text-[14px] font-bold transition-all duration-300 ${activeTab === 'Play' ? 'bg-[#2c2c2e] text-white shadow-md' : 'text-[#8e8e93] hover:text-white'}`}
                >
                  Drops
                </button>
                <button 
                  onClick={() => setActiveTab('Auctions')}
                  className={`flex-1 py-2.5 rounded-[16px] text-[14px] font-bold transition-all duration-300 ${activeTab === 'Auctions' ? 'bg-[#2c2c2e] text-white shadow-md' : 'text-[#8e8e93] hover:text-white'}`}
                >
                  Auctions
                </button>
             </div>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* VISTA: UNBOXING (DESENCRIPTACIÓN) */}
        {viewingBoxId && activeBoxData ? (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 min-h-screen flex flex-col">
             
             <div className="flex items-center justify-center px-5 pt-10 pb-4 relative z-50">
                <h2 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD }}>
                   System Extraction
                </h2>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center relative mt-[-10vh]">
                {/* Glow de fondo central */}
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] blur-[100px] opacity-30 rounded-full pointer-events-none transition-all duration-700"
                  style={{ 
                    backgroundColor: activeBoxData.color,
                    transform: openingState === 'spinning' ? 'translate(-50%, -50%) scale(1.5)' : 'translate(-50%, -50%) scale(1)'
                  }} 
                />

                {/* Contenedor Visual de la Caja o Resultado */}
                <div className="relative z-20 w-[220px] h-[220px] flex items-center justify-center">
                  {openingState !== 'result' ? (
                    <img 
                      src={activeBoxData.imageSrc} 
                      alt="Box" 
                      draggable={false}
                      className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${openingState === 'spinning' ? 'animate-matrix' : 'animate-box-float'}`} 
                      style={{ WebkitTouchCallout: "none" }}
                    />
                  ) : (
                    <div className="animate-in zoom-in-50 fade-in duration-500 flex flex-col items-center">
                       <div 
                         className="w-[140px] h-[140px] rounded-[32px] bg-[#111] border-2 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-6"
                         style={{ borderColor: wonItems[0].color, boxShadow: `0 0 40px ${wonItems[0].color}40` }}
                       >
                          <Sparkles className="w-16 h-16" style={{ color: wonItems[0].color }} />
                       </div>
                       <span className="text-white font-bold text-[28px] text-center leading-tight" style={{ fontFamily: SFD }}>
                         {wonItems[0].name}
                       </span>
                       <span 
                         className="text-[14px] font-bold mt-2 px-3 py-1 rounded-full border backdrop-blur-md" 
                         style={{ color: wonItems[0].color, backgroundColor: `${wonItems[0].color}15`, borderColor: `${wonItems[0].color}40` }}
                       >
                         {wonItems[0].rarity}
                       </span>
                    </div>
                  )}
                </div>

                {/* Terminal Glitch Text */}
                {openingState !== 'result' && (
                  <div className="mt-12 h-[30px] flex items-center justify-center">
                     <span 
                        className={`font-mono text-[20px] font-bold tracking-[0.3em] transition-colors ${openingState === 'spinning' ? 'text-red-500' : 'text-[#8e8e93]'}`}
                     >
                        {glitchText}
                     </span>
                  </div>
                )}
             </div>

             {/* Controles Inferiores */}
             <div className="w-full px-5 pb-10">
                {openingState === 'idle' && (
                  <button 
                    onClick={handleOpenBox} 
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    style={{ fontFamily: SF }}
                  >
                     <Lock size={18} /> Initiate Protocol
                  </button>
                )}
                {openingState === 'spinning' && (
                  <button 
                    disabled 
                    className="w-full bg-[#ef4444] text-white py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse"
                  >
                     <Loader2 className="w-5 h-5 animate-spin" /> Extracting Data...
                  </button>
                )}
                {openingState === 'result' && (
                  <button 
                    onClick={() => { setViewingBoxId(null); setOpeningState('idle'); }} 
                    className="w-full bg-[#10b981] text-white py-4 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-4 duration-500"
                  >
                     Accept to Inventory
                  </button>
                )}
             </div>
          </div>

        ) : activeTab === 'Play' ? (
          /* VISTA: PLAY / DROPS */
          <div className="animate-in fade-in duration-300">
            
            {/* FEATURED BANNER */}
            <div className="px-5 py-6">
               <div 
                 onClick={() => setViewingBoxId('grok_node')}
                 className="relative w-full h-[190px] rounded-[32px] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl active:scale-[0.98] transition-transform"
               >
                  <div className="absolute inset-0 bg-[#0A0A0C]" />
                  <div className="absolute -top-20 -right-10 w-72 h-72 bg-[#3b82f6]/20 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 h-full flex flex-col justify-center px-6">
                     <div className="bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#3b82f6] px-3 py-1 rounded-full w-fit mb-3 flex items-center gap-1.5">
                        <Sparkles size={12} />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Featured Drop</span>
                     </div>
                     <h3 className="text-white font-bold text-[28px] leading-tight max-w-[200px]" style={{ fontFamily: SFD }}>
                        Neural Node
                     </h3>
                     <p className="text-[#8e8e93] text-[13px] mt-1 font-medium">High-yield API access codes.</p>
                     
                     <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] animate-box-float pointer-events-none">
                        <img src="/1000009370.png" draggable={false} className="w-full h-full object-contain drop-shadow-2xl" alt="Box" style={{ WebkitTouchCallout: "none" }} />
                     </div>
                  </div>
               </div>
            </div>

            {/* AIRDROPS GRID */}
            <div className="px-5 mb-8">
               <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Available Drops</h4>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  {AIRDROP_CAPSULES.map((box) => (
                    <AirdropCard 
                      key={box.id} 
                      item={box} 
                      onClick={() => (!box.supply.current || box.supply.current !== 0) ? setViewingBoxId(box.id) : null} 
                    />
                  ))}
               </div>
            </div>

            {/* MY INVENTORY */}
            <div className="px-5 pb-10">
               <div className="flex items-center gap-2 mb-4 px-1">
                  <Package size={20} className="text-[#8e8e93]" />
                  <h4 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>My Inventory</h4>
               </div>
               
               <div className="flex flex-col gap-3">
                  <div className="bg-[#0D0D0F] border border-white/5 rounded-[24px] p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-md">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#111] rounded-[18px] flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0">
                           <div className="absolute inset-0 bg-[#8e8e93]/10 blur-xl" />
                           <img src="/1000009369.png" draggable={false} className="w-10 h-10 object-contain drop-shadow-md relative z-10 pointer-events-none" alt="Box" style={{ WebkitTouchCallout: "none" }} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-white font-bold text-[16px]" style={{ fontFamily: SFD }}>Community Cache</span>
                           <span className="text-[#8e8e93] text-[12px] font-medium">Unopened • 1x</span>
                        </div>
                     </div>
                     <button onClick={() => setViewingBoxId('weekly_bp')} className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-bold text-[12px] px-4 py-2 rounded-full transition-colors">
                        OPEN
                     </button>
                  </div>
               </div>
            </div>
          </div>

        ) : (
          /* VISTA: AUCTIONS */
          <div className="animate-in fade-in duration-300 px-5 pt-6">
             <div className="flex gap-2 w-full mb-6 relative">
                 <div className="flex-1 bg-[#111] rounded-[16px] flex items-center px-4 gap-2 border border-white/5 shadow-inner">
                    <Search className="w-5 h-5 text-[#8e8e93]" />
                    <input type="text" placeholder="Search collection..." className="w-full bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-[#636366]" style={{ fontFamily: SF }} />
                 </div>
                 <button className="w-[48px] h-[48px] bg-[#111] rounded-[16px] flex items-center justify-center text-[#8e8e93] border border-white/5 active:scale-95 transition-transform shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-10">
                 {AUCTION_ITEMS.map((item) => (
                    <div key={item.id} className="relative bg-[#0D0D0F] rounded-[28px] p-3 flex flex-col border border-white/5 overflow-hidden cursor-pointer active:scale-95 transition-all">
                       
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[100px] opacity-20 blur-[30px] rounded-full pointer-events-none" style={{ backgroundColor: item.color }} />

                       <div className="w-full aspect-square bg-[#111] rounded-[20px] overflow-hidden relative flex items-center justify-center p-2 mb-3 border border-white/5">
                          <img src={item.imgSrc} alt={item.title} draggable={false} className={`w-full h-full object-cover rounded-[16px] pointer-events-none ${item.isSoldOut ? 'grayscale opacity-50' : ''}`} style={{ WebkitTouchCallout: "none" }} />
                       </div>
                       
                       <div className="flex flex-col px-1 mb-1">
                          <span className="text-white font-bold text-[15px] truncate" style={{ fontFamily: SFD }}>
                             {item.title} <span className="text-[#8e8e93] text-[13px]">{item.tag}</span>
                          </span>
                       </div>

                       <div className="mt-auto px-1">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border w-fit ${item.isSoldOut ? 'bg-[#1c1c1e] border-white/5' : 'bg-white/10 border-white/10'}`}>
                            {item.isSoldOut ? (
                               <span className="text-[#8e8e93] text-[12px] font-bold">Sold out</span>
                            ) : (
                               <>
                                 <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-[#3b82f6]">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                                 </svg>
                                 <span className="text-white text-[13px] font-bold">{item.price}</span>
                               </>
                            )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
          </div>
        )}
      </div>
    </div>
  )
}
