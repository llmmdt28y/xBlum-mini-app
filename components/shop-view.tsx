"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
// La importación de 'Share' se mantiene pero no se usa en este ejemplo
// import { Share } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── 1. ICONOS PIXELADOS PERSONALIZADOS (en color gris) ──

// Icono de corazón pixelado similar al de la imagen de referencia
const PixelHeartIcon = ({ fill = "#d1d5db" }: { fill?: string }) => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill={fill}>
    <path d="M2 1h2v1H2zM6 1h2v1H6zM1 2h4v1H1zM5 2h4v1H5zM1 3h4v1H1zM5 3h4v1H5zM1 4h8v1H1zM2 5h6v1H2zM3 6h4v1H3zM4 7h2v1H4zM5 8h0" />
  </svg>
)

// Icono de espiral pixelada (para el ítem 'Spiral')
const PixelSpiralIcon = ({ fill = "#d1d5db" }: { fill?: string }) => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill={fill}>
    <path d="M4 1h4v1H4zM3 2h1v1H3zM7 2h1v1H7zM3 3h1v1H3zM6 3h1v1H6zM3 4h1v1H3zM5 4h1v1H5zM2 5h1v1H2zM4 5h1v1H4zM6 5h1v1H6zM2 6h1v1H2zM5 6h1v1H5zM3 7h1v1H3zM5 7h1v1H5zM4 8h2v1H4zM4 9h0" />
  </svg>
)

// Icono de estrella pixelada (para el ítem 'Stardust')
const PixelStarIcon = ({ fill = "#d1d5db" }: { fill?: string }) => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill={fill}>
    <path d="M5 1h1v1H5zM4 2h3v1H4zM3 3h5v1H3zM1 4h8v1H1zM2 5h7v1H2zM3 6h5v1H3zM4 7h3v1H4zM5 8h1v1H5zM5 9h0" />
  </svg>
)

// Icono de regalo pixelado (para el ítem 'Gifts')
const PixelGiftIcon = ({ fill = "#d1d5db" }: { fill?: string }) => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill={fill}>
    <path d="M4 1h2v1H4zM2 2h6v1H2zM2 3h6v1H2zM1 4h8v1H1zM1 5h1v4h1V5h1v4h1V5h1v4h1V5h1v4h1V5h1v4h0M5 5v4h0" />
  </svg>
)

// ── 2. COMPONENTE DE ARTE PARA SHADES (Auras con patrón de iconos pixelados) ──

// Wrapper de Gradiente Sutil para las Auras
const ArtWrapper = ({ children, glowColor }: { children: React.ReactNode, glowColor: string }) => (
  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
    {/* Gradiente radial de fondo sutil */}
    <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)` }} />
    
    {/* Resplandor lateral sutil (para "gradientes a los lados") */}
    <div className="absolute left-[-10%] top-[-10%] w-[120%] h-[120%] opacity-20" style={{ background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%)' }} />

    <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
  </div>
)

// Componente que genera el patrón disperso con centro vacío
const ProfileShadeArt = ({ icon, glowColor, numIcons = 35 }: { icon: React.ReactNode, glowColor: string, numIcons?: number }) => {
  const icons = Array.from({ length: numIcons }).map((_, i) => {
    let x, y, r;
    do {
        x = Math.random() * 100; // Coordenada X entre 0 y 100
        y = Math.random() * 100; // Coordenada Y entre 0 y 100
        r = Math.sqrt(Math.pow(x-50, 2) + Math.pow(y-50, 2)); // Distancia al centro (50, 50)
    } while (r < 28); // Asegura que el centro esté vacío (radio mínimo de 28)

    const size = 2 + Math.random() * 3; // Tamaño entre 2 y 5
    const opacity = 0.15 + Math.random() * 0.7; // Opacidad entre 0.15 y 0.85
    const rotation = Math.random() * 360; // Rotación aleatoria

    return (
      <g key={i} transform={`translate(${x} ${y}) scale(${size/10}) rotate(${rotation})`}>
        {icon}
        {/* Usamos un wrapper de grupo con transformaciones. El tamaño se divide por 10 porque el viewBox del icono es 10x10. */}
        {/* El fill se aplica en el icono individualmente. */}
      </g>
    )
  })

  return (
    <ArtWrapper glowColor={glowColor}>
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            {icons}
        </svg>
    </ArtWrapper>
  )
}


// ── 3. COMPONENTES DE ARTE PARA GIFTS (Icono central, sin patrón de fondo) ──

const PhantomSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
    <path d="M 20 50 C 20 20, 80 20, 80 50 L 80 90 C 75 80, 65 90, 50 80 C 35 90, 25 80, 20 90 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 40 55 Q 50 65 60 55" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const CoreSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[50%] h-[50%] opacity-80">
    <path d="M 50 10 L 90 40 L 50 90 L 10 40 Z" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
    <path d="M 28 30 L 72 30 L 50 90" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M 10 40 L 90 40" stroke="#ffffff" strokeWidth="3" />
  </svg>
)


// ── 4. BASE DE DATOS DE ÍTEMS ACTUALIZADA ──
const NFT_ITEMS = [
  // Los ítems de tipo 'SHADE' usan el nuevo patrón de auras `ProfileShadeArt` con sus iconos específicos
  { id: '1', name: "Spiral",   type: "SHADE", rarity: "Epic",   price: 15000,  issueNumber: "332", stock: 100, art: <ProfileShadeArt icon={<PixelSpiralIcon fill="#d1d5db" />} glowColor="rgba(168,85,247,0.15)" /> },
  { id: '2', name: "Stardust", type: "SHADE", rarity: "Rare",   price: 5000,   issueNumber: "12",  stock: 500, art: <ProfileShadeArt icon={<PixelStarIcon fill="#d1d5db" />} glowColor="rgba(59,130,246,0.1)" /> },
  { id: '3', name: "Gifts",    type: "SHADE", rarity: "Epic",   price: 20000,  issueNumber: "7",   stock: 250, art: <ProfileShadeArt icon={<PixelGiftIcon fill="#d1d5db" />} glowColor="rgba(249,115,22,0.1)" /> },
  
  // Los ítems de tipo 'GIFT' mantienen sus iconos centrales originales
  { id: '4', name: "Phantom",  type: "GIFT",  rarity: "Legendary", price: 45000, issueNumber: "9", stock: 10,  art: <ArtWrapper glowColor="rgba(255,255,255,0.05)"><PhantomSVG /></ArtWrapper> },
  { id: '5', name: "Core",     type: "GIFT",  rarity: "Mythic", price: 150000, issueNumber: "1",   stock: 0,   art: <ArtWrapper glowColor="rgba(255,255,255,0.05)"><CoreSVG /></ArtWrapper> }
]

// ── 5. VISTA PRINCIPAL (Marketplace + NFT Details) ──
export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Control nativo de botón atrás en Telegram
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

  // ── PANTALLA 2: DETALLE DEL NFT (Estilo 1000009106.png) ──
  if (selectedItem) {
    const isSoldOut = selectedItem.stock === 0
    return (
      <div className="flex-1 bg-black min-h-screen relative overflow-x-hidden animate-in slide-in-from-right-4 duration-300">
        
        {/* Espacio para la NavBar superior de Telegram */}
        <div className="pt-4" />

        <div className="px-4 pb-32 flex flex-col items-center">
     
          {/* NFT Card Gigante */}
          <div className="w-[85vw] max-w-[340px] aspect-square bg-[#0a0a0a] rounded-[32px] flex items-center justify-center mb-6 overflow-hidden">
             {selectedItem.art}
          </div>

          {/* Título y Share */}
          <h1 className="text-[26px] font-bold text-white mb-4 tracking-tight" style={{ fontFamily: SFD }}>
            {selectedItem.name} <span className="text-[#636366]">#{selectedItem.issueNumber}</span>
          </h1>
          <button className="flex items-center gap-2 bg-[#1c1c1e] px-5 py-2.5 rounded-full active:opacity-70 transition-opacity mb-8">
            {/* <Share size={14} className="text-white" /> */}
            {/* El icono Share se importó pero no se usó en el ejemplo original, se comenta para evitar "unused import" */}
            <span className="text-white font-semibold text-[13px]" style={{ fontFamily: SF }}>Share</span>
          </button>

          {/* Tabla de Atributos Alineada */}
          <div className="w-full bg-[#111] rounded-[24px] overflow-hidden flex flex-col">
             <AttributeRow label="Owner:" value="xBlum Market" icon="/xblum-profile.png" />
             <div className="h-px bg-[#1c1c1e] w-full" />
             <AttributeRow label="Game:" value="xBlum AI" icon="/xblum-logo.png" />
             <div className="h-px bg-[#1c1c1e] w-full" />
             <AttributeRow label="Collection:" value="xBlum Aura" />
             <div className="h-px bg-[#1c1c1e] w-full" />
             <AttributeRow label="Rarity:" value={selectedItem.rarity} />
             <div className="h-px bg-[#1c1c1e] w-full" />
             <AttributeRow label="Type:" value={selectedItem.type === "SHADE" ? "Profile Shade" : "Profile Gift"} />
             <div className="h-px bg-[#1c1c1e] w-full" />
             <AttributeRow label="Issued:" value={`${selectedItem.issueNumber} / 25,000`} />
          </div>
        </div>

        {/* Floating Buy Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-50">
          <button 
            disabled={isSoldOut || currentBP < selectedItem.price}
            className={`w-full py-[18px] rounded-[18px] text-[16px] font-bold transition-all active:scale-[0.98] ${
              isSoldOut ? 'bg-[#1c1c1e] text-[#636366]' : 'bg-white text-black'
            }`}
            style={{ fontFamily: SFD }}
          >
            {isSoldOut ? "Out of Stock" : `Buy for ${selectedItem.price.toLocaleString()} BP`}
          </button>
        </div>
      </div>
    )
  }

  // ── PANTALLA 1: GRID MARKETPLACE (Estilo 1000009108.png) ──
  return (
    <div className="flex-1 bg-black min-h-screen relative overflow-x-hidden animate-in fade-in duration-300">
      
      {/* Header Minimalista */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full bg-black/90 backdrop-blur-xl"
        style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)" }}>
        <h2 className="text-[17px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Market</h2>
      </div>

      <div className="px-3 pt-3 pb-8">
        {/* Grid de 3 Columnas Estricto */}
        <div className="grid grid-cols-3 gap-[10px]">
           {NFT_ITEMS.map((item) => {
              const isSoldOut = item.stock === 0
              const priceDisplay = item.price >= 1000 ? `${item.price/1000}k` : item.price

              return (
                <button 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-[#0a0a0a] rounded-[16px] p-2.5 flex flex-col aspect-[4/5] active:scale-[0.96] transition-transform overflow-hidden ${isSoldOut ? 'opacity-40 grayscale' : ''}`}
                >
                  {/* Encabezado de Tarjeta */}
                  <div className="flex items-center justify-between w-full opacity-60">
                    <span className="text-[9px] font-bold text-[#8e8e93] tracking-widest">{item.type}</span>
                    <span className="text-[9px] font-bold text-[#8e8e93]">#{item.issueNumber}</span>
                  </div>

                  {/* Arte Central */}
                  <div className="flex-1 w-full flex items-center justify-center pointer-events-none mt-2 mb-2">
                    <div className="w-[85%] aspect-square flex items-center justify-center">
                       {item.art}
                    </div>
                  </div>

                  {/* Footer de Tarjeta */}
                  <div className="w-full flex flex-col items-center justify-end mt-auto">
                    <p className="text-white text-[12px] font-bold tracking-wide" style={{ fontFamily: SFD }}>{item.name}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${isSoldOut ? 'text-[#636366]' : 'text-[#3b82f6]'}`} style={{ fontFamily: SF }}>
                      {isSoldOut ? 'SOLD' : `${priceDisplay} BP`}
                    </p>
                  </div>
                </button>
              )
           })}
        </div>
      </div>

    </div>
  )
}

// ── COMPONENTE DE TABLA (Atributos a la izquierda alineados) ──
function AttributeRow({ label, value, icon }: { label: string, value: string, icon?: string }) {
  return (
    <div className="flex items-center px-4 py-3.5 text-left w-full">
      {/* Columna Label Fija */}
      <span className="text-[#8e8e93] text-[14px] font-medium w-[90px] shrink-0" style={{ fontFamily: SF }}>
        {label}
      </span>
      
      {/* Columna Valor (con o sin ícono) */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && (
           <img src={icon} alt="" className={`w-5 h-5 object-cover ${icon.includes('profile') ? 'rounded-full' : 'rounded-sm'}`} />
        )}
        <span className="text-[14px] font-medium text-white truncate" style={{ fontFamily: SF }}>
          {value}
        </span>
      </div>
    </div>
  )
}
