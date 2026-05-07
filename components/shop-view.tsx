"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. ARTE SVG ──

const SpiralSVG = () => {
  const dots = Array.from({ length: 140 }).map((_, i) => {
    const angle = 0.20 * i
    const radius = 28 + 0.3 * i
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    const size = 0.4 + (i / 140) * 0.8
    const opacity = 0.15 + (i / 140) * 0.85
    if (radius > 48) return null
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">{dots}</svg>
}

const StardustSVG = () => {
  const stars = Array.from({ length: 70 }).map((_, i) => {
    let x, y, r;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      r = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
    } while (r < 28 || r > 46);
    const size = Math.random() * 0.8 + 0.3;
    const opacity = Math.random() * 0.8 + 0.2;
    return <circle key={i} cx={x} cy={y} r={size} fill="#ffffff" opacity={opacity} />
  })
  return <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{stars}</svg>
}

// NUEVO: Iconos distribuidos ampliamente, con tamaños variados y zona central vacía
const TreasuresSVG = () => {
  const elements = Array.from({ length: 40 }).map((_, i) => {
    let x, y, r;
    do {
      // Ampliamos el rango de x e y para que ocupen todas las esquinas (-15 a 115)
      x = -15 + Math.random() * 130; 
      y = -15 + Math.random() * 130;
      r = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
    } while (r < 32); // MARGEN EN MEDIO: Todo lo que esté a menos de 32 de radio se descarta

    // Tamaños muy variados (desde muy chicos hasta grandes)
    const scale = 0.3 + Math.random() * 1.3; 
    const rotate = Math.random() * 360; // Rotación total libre
    const opacity = 0.1 + Math.random() * 0.35; // Transparencias variadas

    // Paquete de iconos en vectores puros (Dólar, Destello, y un Hexágono/Moneda)
    const paths = [
      // Icono 1: Dólar clásico
      <path key="dollar" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
      // Icono 2: Dólar enmarcado (moneda)
      <path key="coin" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />,
      // Icono 3: Destello/Diamante de 4 puntas
      <path key="sparkle" d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z" />
    ];

    const path = paths[i % paths.length];

    return (
      <g 
        key={i} 
        // Primero nos movemos a x,y; luego escalamos; luego rotamos y centramos el viewBox 24x24 del icono
        transform={`translate(${x}, ${y}) scale(${scale * 0.25}) rotate(${rotate}) translate(-12, -12)`}
        stroke="#8e8e93" // Color gris
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" // Sin fondo
        opacity={opacity}
      >
        {path}
      </g>
    );
  });

  return (
    // SVG completamente transparente (sin fondos negros añadidos) para que se fusione con el fondo nativo
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-hidden">
      <g className="drop-shadow-[0_0_3px_rgba(142,142,147,0.3)]">
        {elements}
      </g>
    </svg>
  );
}

const PhantomSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[55%] h-[55%] drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 40 55 Q 50 65 60 55" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
  </svg>
)

const CoreSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] opacity-80">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 28 30 L 72 30 L 50 90" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="3" />
  </svg>
)

const ArtWrapper = ({ children, glowColor }: { children: React.ReactNode, glowColor: string }) => (
  <div className="w-full h-full relative flex items-center justify-center">
    <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
    <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
  </div>
)

// ── 2. BASE DE DATOS DE ÍTEMS ──
const NFT_ITEMS = [
  { id: '1', name: "Spiral", type: "SHADE", rarity: "Epic", price: 15000, issueNumber: "332", stock: 100, model: "Aura", symbol: "Core Ring", backdrop: "Void", art: <ArtWrapper glowColor="rgba(168,85,247,0.15)"><SpiralSVG /></ArtWrapper> },
  { id: '2', name: "Stardust", type: "SHADE", rarity: "Rare", price: 5000, issueNumber: "12", stock: 500, model: "Particle", symbol: "Nebula", backdrop: "Deep Space", art: <ArtWrapper glowColor="rgba(59,130,246,0.1)"><StardustSVG /></ArtWrapper> },
  { id: '3', name: "Treasures", type: "SHADE", rarity: "Epic", price: 20000, issueNumber: "7", stock: 250, model: "Relic", symbol: "Wealth", backdrop: "Grey Matrix", art: <TreasuresSVG /> },
  { id: '4', name: "Phantom", type: "GIFT", rarity: "Legendary", price: 45000, issueNumber: "9", stock: 10, model: "Spirit", symbol: "Ghost Face", backdrop: "Abyss", art: <PhantomSVG /> },
  { id: '5', name: "Core", type: "GIFT", rarity: "Mythic", price: 150000, issueNumber: "1", stock: 0, model: "Structure", symbol: "Prism", backdrop: "Black", art: <CoreSVG /> }
]

// ── 3. VISTA PRINCIPAL ──
export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      if (selectedItem) setSelectedItem(null)
      else setCurrentView("levels")
    }

    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack); tg.BackButton.hide() }
  }, [setCurrentView, selectedItem])

  return (
    <div className="flex-1 bg-black min-h-screen relative overflow-x-hidden animate-in fade-in duration-300">
      
      {/* HEADER LIMPIO */}
      <div className="w-full pt-[max(env(safe-area-inset-top),20px)] px-4 bg-black">
        <h1 className="text-[32px] font-bold text-white mt-4 mb-4 tracking-tight" style={{ fontFamily: SFD }}>
          Market
        </h1>
        
        {/* Search Bar */}
        <div className="w-full bg-[#1c1c1e] rounded-[10px] flex items-center px-3 py-2 mb-6">
          <Search size={18} className="text-[#8e8e93] mr-2" />
          <input 
            type="text" 
            placeholder="Search In Market" 
            className="bg-transparent border-none outline-none text-[16px] text-white placeholder-[#8e8e93] w-full"
            style={{ fontFamily: SF }}
          />
        </div>
      </div>

      {/* GRID DE 2 COLUMNAS */}
      <div className="px-4 pb-12">
        <div className="grid grid-cols-2 gap-3">
          {NFT_ITEMS.map((item) => {
            const isSoldOut = item.stock === 0
            const priceDisplay = item.price >= 1000 ? `${item.price / 1000}k` : item.price

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-[#161616] rounded-[20px] p-3 flex flex-col aspect-[3/4] active:scale-[0.97] transition-transform overflow-hidden ${isSoldOut ? 'opacity-50 grayscale' : ''}`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <span className="text-[10px] font-bold text-[#636366] tracking-widest">{item.type}</span>
                  <span className="text-[10px] font-bold text-[#636366]">#{item.issueNumber}</span>
                </div>

                {/* Arte Central */}
                <div className="flex-1 w-full flex items-center justify-center my-2 relative rounded-[12px] overflow-hidden">
                  <div className="w-[90%] aspect-square flex items-center justify-center rounded-[12px] overflow-hidden">
                    {item.art}
                  </div>
                </div>

                {/* Footer de la tarjeta */}
                <div className="w-full flex flex-col items-center justify-end pb-1 relative z-10">
                  <p className="text-white text-[15px] font-semibold tracking-wide" style={{ fontFamily: SFD }}>{item.name}</p>
                  <p className={`text-[12px] font-bold mt-1 ${isSoldOut ? 'text-[#636366]' : 'text-[#3b82f6]'}`} style={{ fontFamily: SF }}>
                    {isSoldOut ? 'SOLD' : `${priceDisplay} BP`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PANEL DE DETALLE COMPACTO ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
          <div 
            className="w-full bg-[#101010] rounded-t-[24px] flex flex-col px-4 pt-2 pb-6 max-h-[85vh] animate-in slide-in-from-bottom-full duration-300 border-t border-[#1c1c1e]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indicador de arrastre */}
            <div className="w-10 h-1.5 bg-[#2c2c2e] rounded-full mx-auto mt-2 mb-6" />

            {/* Arte Principal Flotante (Llamando al mismo objeto SVG dinámico) */}
            <div className="w-[180px] h-[180px] mx-auto flex items-center justify-center mb-4 relative rounded-[16px] overflow-hidden">
              {selectedItem.art}
            </div>

            {/* Títulos Centrales */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-[22px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                {selectedItem.name} <span className="text-[#8e8e93] font-normal">#{selectedItem.issueNumber}</span>
              </h2>
              <span className="text-[#8e8e93] text-[14px] mt-1" style={{ fontFamily: SF }}>{selectedItem.type === "SHADE" ? "Profile Shade" : "Profile Gift"}</span>
            </div>

            {/* Tabla de Atributos */}
            <div className="w-full bg-[#1c1c1e] rounded-[16px] flex flex-col overflow-hidden mb-6">
              
              {/* Fila Owner modificada: Imagen circular y sin estrella */}
              <TableRow label="owner">
                <img src="/xblum-profile.png" alt="" className="w-5 h-5 rounded-full object-cover shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="text-[#4ea8e9] font-medium text-[14px]">xBlum Market</span>
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="model">
                <span className="text-white text-[14px]">{selectedItem.model}</span>
                <Tag text={selectedItem.rarity.toLowerCase()} />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="symbol">
                <span className="text-white text-[14px]">{selectedItem.symbol}</span>
                <Tag text="0.4%" />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="backdrop">
                <span className="text-white text-[14px]">{selectedItem.backdrop}</span>
                <Tag text="0.9%" />
              </TableRow>
              <div className="h-px bg-[#2c2c2e] ml-4" />
              
              <TableRow label="quantity">
                <span className="text-white text-[14px]">{selectedItem.issueNumber}/25,000 issued</span>
              </TableRow>

            </div>

            {/* Botón Flotante Azul */}
            <button
              disabled={selectedItem.stock === 0 || currentBP < selectedItem.price}
              className={`w-full py-3.5 rounded-2xl text-[16px] font-bold transition-all active:scale-[0.98] ${
                selectedItem.stock === 0 ? 'bg-[#2c2c2e] text-[#636366]' : 'bg-[#2aa1ff] text-white'
              }`}
              style={{ fontFamily: SFD }}
            >
              {selectedItem.stock === 0 ? "ok" : `Buy for ${selectedItem.price.toLocaleString()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTES DE TABLA AUXILIARES ──

function TableRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-3 w-full">
      <span className="text-[#8e8e93] text-[14px] font-bold w-24 shrink-0" style={{ fontFamily: SF }}>
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0" style={{ fontFamily: SF }}>
        {children}
      </div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return (
    <span className="bg-[#1c2c3e] text-[#4ea8e9] px-2 py-0.5 rounded-[6px] text-[11px] font-bold tracking-wide">
      {text}
    </span>
  )
}
