"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { ChevronLeft, Wallet, User, Image as ImageIcon, Sparkles, Shield, Hexagon, Component, Zap, X } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos y Datos de Prueba ──
interface Cosmetic {
  id: string
  name: string
  type: string
  price: number
  available: number
  icon: any
}

const COSMETICS_INVENTORY: Cosmetic[] = [
  { id: "OBJ-5431", name: "Cyan Halo", type: "Profile Border", price: 5000, available: 50, icon: User },
  { id: "OBJ-5432", name: "Dark Matrix", type: "Profile Bg", price: 7500, available: 20, icon: ImageIcon },
  { id: "OBJ-5433", name: "Star Badge", type: "Name Icon", price: 3000, available: 100, icon: Sparkles },
  { id: "OBJ-5434", name: "Hexa Core", type: "Badge", price: 2500, available: 75, icon: Hexagon },
  { id: "OBJ-5435", name: "Neon Shield", type: "Name Icon", price: 4000, available: 30, icon: Shield },
  { id: "OBJ-5436", name: "Ton Pixel", type: "Profile Bg", price: 8000, available: 15, icon: Component },
  { id: "OBJ-5437", name: "Volt Aura", type: "Profile Border", price: 6000, available: 45, icon: Zap },
  { id: "OBJ-5438", name: "Ghost UI", type: "Theme", price: 10000, available: 10, icon: ImageIcon },
  { id: "OBJ-5439", name: "Cyber Tag", type: "Name Icon", price: 3500, available: 60, icon: Sparkles },
]

// ── Componente de Patrón de Corazones Pixelados ──
const PixelHeartPattern = () => (
  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-20 z-0">
    <defs>
      <pattern id="hearts" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <g fill="#4a4a4c" transform="scale(1.5)">
          {/* Un corazón pixelado simple */}
          <rect x="2" y="2" width="2" height="2" />
          <rect x="6" y="2" width="2" height="2" />
          <rect x="1" y="4" width="4" height="2" />
          <rect x="5" y="4" width="4" height="2" />
          <rect x="1" y="6" width="8" height="2" />
          <rect x="2" y="8" width="6" height="2" />
          <rect x="3" y="10" width="4" height="2" />
          <rect x="4" y="12" width="2" height="2" />
        </g>
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#hearts)" />
  </svg>
)

export function ShopView() {
  const ctx = useApp() as any
  const { x_points: currentBP, setCurrentView } = ctx
  const [selectedItem, setSelectedItem] = useState<Cosmetic | null>(null)

  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  useEffect(() => {
    if (tg?.BackButton) {
      tg.BackButton.show()
      const handleBack = () => setCurrentView("levels") // O "home", según tu flujo
      tg.BackButton.onClick(handleBack)
      return () => {
        tg.BackButton.offClick(handleBack)
        tg.BackButton.hide()
      }
    }
  }, [setCurrentView, tg])

  const handleBuyClick = (item: Cosmetic) => {
    setSelectedItem(item)
    // Opcional: Vibración háptica al abrir el modal
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light')
  }

  const closeBuyModal = () => setSelectedItem(null)

  return (
    <div className="flex-1 bg-[#060606] min-h-[calc(var(--vh, 1dvh) * 100)] relative overflow-x-hidden pb-32 select-none animate-in fade-in duration-500">
      
      {/* Fondo global de puntos */}
      <div className="absolute inset-0 pointer-events-none opacity-40 fixed" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between w-full px-5 bg-black/80  border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <button onClick={() => setCurrentView("levels")} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full border border-white/10 active:scale-95 transition-transform">
           <ChevronLeft size={20} className="text-white" />
        </button>
        <h2 className="text-[19px] font-bold text-white absolute left-1/2 -translate-x-1/2" style={{ fontFamily: SFD }}>Store</h2>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
           <Wallet size={14} className="text-gray-400" />
           <span className="text-[13px] font-bold text-white" style={{ fontFamily: SF }}>{currentBP?.toLocaleString()}</span>
        </div>
      </div>

      {/* Grid de Cosméticos */}
      <div className="relative z-10 px-4 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {COSMETICS_INVENTORY.map((item) => (
            <div key={item.id} className="bg-[#141415] border border-[#262626] rounded-[16px] p-3 flex flex-col items-center shadow-lg relative overflow-hidden group">
              
              {/* Icono del objeto (Gris, estilo placeholder) */}
              <div className="w-16 h-16 bg-[#1c1c1e] rounded-[12px] flex items-center justify-center mb-3 border border-white/5 group-hover:border-white/10 transition-colors">
                <item.icon size={28} className="text-[#636366]" strokeWidth={1.5} />
              </div>

              {/* Títulos y Disponibilidad */}
              <div className="w-full text-left mb-3">
                 <h3 className="text-[10px] font-bold text-white uppercase tracking-wider truncate" style={{ fontFamily: SFD }}>
                   {item.type} <br/> {item.id.replace('OBJ-', '#')}
                 </h3>
                 <div className="flex justify-between items-center mt-1">
                   <span className="text-[9px] text-[#8e8e93]" style={{ fontFamily: SF }}>Avail: {item.available}</span>
                   <span className="text-[10px] font-bold text-white" style={{ fontFamily: SFD }}>{item.price.toLocaleString()} BP</span>
                 </div>
              </div>

              {/* Botón de Comprar (Gradiente cian/verde) */}
              <button 
                onClick={() => handleBuyClick(item)}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#4ade80] to-[#06b6d4] text-black font-bold text-[12px] active:scale-95 transition-transform"
                style={{ fontFamily: SFD }}
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal de Compra (BottomSheet / Center Modal) ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/80  animate-in fade-in duration-200">
          
          {/* Overlay para cerrar haciendo clic fuera */}
          <div className="absolute inset-0" onClick={closeBuyModal} />

          {/* Contenedor del Modal */}
          <div className="relative w-full max-w-[340px] bg-[#141415] rounded-[28px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Botón de Cerrar */}
            <button 
               onClick={closeBuyModal} 
               className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/40 rounded-full text-white/70 hover:text-white "
            >
              <X size={18} />
            </button>

            {/* Mitad Superior: Previsualización */}
            <div className="relative pt-10 pb-8 flex flex-col items-center border-b border-[#262626] overflow-hidden">
               {/* Patrón de corazones */}
               <PixelHeartPattern />
               
               {/* Avatar con borde gradiente */}
               <div className="relative z-10 w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#06b6d4] to-[#4ade80] shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-4">
                 <div className="w-full h-full bg-[#1c1c1e] rounded-full flex items-center justify-center overflow-hidden border-2 border-black">
                    <User size={40} className="text-[#636366]" />
                    {/* Aquí iría la foto real: <img src="user_pic.jpg" className="w-full h-full object-cover" /> */}
                 </div>
                 {/* Insignia online inspirada en la imagen */}
                 <div className="absolute bottom-0 right-1 w-6 h-6 bg-[#141415] rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#4ade80] flex items-center justify-center">
                       <Sparkles size={8} className="text-black" />
                    </div>
                 </div>
               </div>

               {/* Información del Usuario y Objeto */}
               <h3 className="relative z-10 text-[18px] font-bold text-white tracking-wide" style={{ fontFamily: SFD }}>
                 USERNAME.TON
               </h3>
               <div className="relative z-10 flex items-center gap-1.5 mt-1">
                 <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                 <span className="text-[13px] text-[#8e8e93]" style={{ fontFamily: SF }}>online</span>
               </div>
               
               <div className="relative z-10 mt-3 px-3 py-1 bg-black/40 rounded-full border border-white/5 ">
                 <span className="text-[11px] font-medium text-[#a1a1aa] tracking-widest uppercase" style={{ fontFamily: SF }}>
                   OBJECT ID: {selectedItem.id}
                 </span>
               </div>
            </div>

            {/* Mitad Inferior: Atributos y Compra */}
            <div className="p-6 bg-[#0f0f10]">
              
              {/* Lista de Atributos (Sin valores) */}
              <div className="flex flex-col gap-3.5 mb-8">
                 {['Owner', 'Model', 'Symbol', 'Backdrop', 'Quantity'].map((attr) => (
                    <div key={attr} className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#262626]" />
                       <span className="text-[14px] text-[#8e8e93]" style={{ fontFamily: SF }}>{attr}:</span>
                    </div>
                 ))}
              </div>

              {/* Botón de Compra Azul */}
              <button className="w-full py-4 rounded-[16px] bg-[#007aff] text-white font-bold text-[16px] active:scale-[0.98] transition-transform shadow-[0_4px_20px_rgba(0,122,255,0.3)]" style={{ fontFamily: SFD }}>
                Buy for {selectedItem.price.toLocaleString()} BP
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
