"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  Settings, 
  Gift, 
  Info, 
  BellDot, 
  Search, 
  Filter, 
  Sparkles,
  ChevronRight
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

type TgUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── ESTILOS DE BRILLO / GLASSMORPHISM ──
const blueGlowStyle = {
  backgroundColor: "#2b63eb",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.3)",
  transform: "translateZ(0)",
}

const greyGlowStyle = {
  backgroundColor: "#1c1c1e",
  border: "1px solid rgba(255, 255, 255, 0.10)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1.5px 1px rgba(255, 255, 255, 0.15)",
  transform: "translateZ(0)",
}

export function ProfileView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  
  // Estado para la navegación
  const [activeTab, setActiveTab] = useState("Collected")

  // Obtener datos del usuario de Telegram
  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    setDisplayName(full || user.username || "User")
    setUsername(user.username ? "@" + user.username : "")
  }, [])

  // Configuración del botón de retroceso de Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      setCurrentView("home");
      tg.BackButton.hide()
    }

    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  const tabs = ["Collected", "Offers", "Favorites", "Activity"]

  return (
    <div className="flex-1 overflow-y-auto relative bg-[#000000] text-white animate-in fade-in duration-300 min-h-screen">
      
      {/* ESPACIO SUPERIOR SEGURO TELEGRAM */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full pointer-events-none" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 20px)", background: "transparent" }}></div>

      <div className="px-4 pb-32 relative z-10">

        {/* HEADER: BOTÓN SETTINGS */}
        <div className="absolute right-4 top-8 z-30 flex items-center">
          <button 
            onClick={() => setCurrentView("settings")} 
            className="w-[56px] h-[32px] flex items-center justify-center rounded-full active:opacity-80 transition-opacity"
            style={greyGlowStyle}
          >
            <Settings className="w-[18px] h-[18px] text-white" />
          </button>
        </div>

        {/* SECCIÓN DE PERFIL */}
        <div className="flex flex-col items-center pt-10">
          <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center mb-3 border border-white/5 shadow-inner">
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-3xl" style={{ fontFamily: SFD }}>
                {initials || "?"}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-[22px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
              {displayName || "awesome"}
            </h1>
            <Sparkles className="w-[18px] h-[18px] text-[#60a5fa] fill-[#60a5fa]" />
          </div>
          
          <p className="text-[#8e8e93] text-[14px] mt-0.5" style={{ fontFamily: SF }}>
            {username || "@TCommunityReports"}
          </p>
        </div>

        {/* FILA DE BOTONES DE ACCIÓN SUPERIOR */}
        <div className="flex flex-wrap items-center justify-center mt-6 w-full">
          <div className="flex items-center justify-center gap-[8px]">
            
            <button 
              className="flex items-center justify-center gap-1.5 text-white px-3 h-[32px] rounded-full font-semibold text-[16px] active:scale-95 transition-all shrink-0" 
              style={{ ...blueGlowStyle, fontFamily: SF }}
            >
              <Gift className="w-[18px] h-[18px]" strokeWidth={2} />
              Add Gift
            </button>
            
            <button 
              className="flex items-center justify-center gap-1.5 text-white px-3 h-[32px] rounded-full font-semibold text-[16px] active:scale-95 transition-all shrink-0" 
              style={{ ...greyGlowStyle, fontFamily: SF }}
            >
              <Info className="w-[18px] h-[18px]" strokeWidth={2} />
              Info
            </button>
            
            <div className="w-[1px] h-[16px] bg-[#48484a] shrink-0 mx-0.5" />
            
            <button 
              className="flex items-center justify-center w-[32px] h-[32px] rounded-full shrink-0 active:scale-95 transition-all"
              style={greyGlowStyle}
            >
              <BellDot className="w-[18px] h-[18px] text-white" strokeWidth={2} />
            </button>

          </div>
        </div>

        {/* NAVEGACIÓN (TABS) */}
        <div className="flex items-center gap-6 mt-8 border-b border-[#2c2c2e] overflow-x-auto scrollbar-hide px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[15px] font-semibold whitespace-nowrap relative transition-colors ${
                  isActive ? "text-white" : "text-[#8e8e93] hover:text-[#d1d1d6]"
                }`}
                style={{ fontFamily: SF }}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="mt-5 space-y-2.5 px-1">
          
          {/* Fila 1: Barra de Búsqueda ampliada */}
          <div className="w-full">
            <div 
              className="w-full flex items-center px-4 h-[42px] rounded-full transition-opacity active:opacity-90"
              style={greyGlowStyle}
            >
              <Search className="w-[18px] h-[18px] text-[#8e8e93] shrink-0" strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Name or description" 
                className="bg-transparent border-none outline-none text-white w-full h-full px-2.5 text-[15px] placeholder:text-[#8e8e93]"
                style={{ fontFamily: SF }}
              />
            </div>
          </div>

          {/* Fila 2: Embudo y Botones de Filtro */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <button 
              className="flex items-center justify-center w-[34px] h-[34px] rounded-full shrink-0 active:scale-95 transition-all"
              style={greyGlowStyle}
            >
              <Filter className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
            </button>

            <div className="w-[1px] h-[16px] bg-[#48484a] shrink-0 mx-1" />

            <button 
              className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
              style={{ ...greyGlowStyle, fontFamily: SF }}
            >
              Type
            </button>

            <button 
              className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
              style={{ ...greyGlowStyle, fontFamily: SF }}
            >
              Price
            </button>

            <button 
              className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
              style={{ ...greyGlowStyle, fontFamily: SF }}
            >
              Date
            </button>
          </div>

        </div>

        {/* ESTADO VACÍO (EMPTY STATE ACTUALIZADO) */}
        <div className="flex flex-col items-center justify-center text-center mt-12 px-6">
          <div className="w-[140px] h-[140px] relative mb-6 flex items-center justify-center">
            {/* Solo la imagen WebP, sin círculos ni fondos detrás */}
            <img 
              src="/no-gifts.webp" 
              alt="No Gifts" 
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl" 
              draggable={false} 
              style={{ WebkitTouchCallout: "none" }}
              onError={(e) => {
                // Fallback limpio por si no carga la imagen
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl">🎁</span>';
              }}
            />
          </div>
          
          <h2 className="text-[18px] font-bold text-white mb-2 tracking-tight" style={{ fontFamily: SFD }}>
            You have no Gifts
          </h2>
          
          <p className="text-[#8e8e93] text-[14px] leading-relaxed max-w-[280px] mb-6" style={{ fontFamily: SF }}>
            You can buy in the marketplace
          </p>

          <button 
            onClick={() => setCurrentView("market")} 
            className="flex items-center justify-center gap-1.5 text-white px-8 py-2.5 rounded-xl font-semibold text-[15px] active:scale-95 transition-transform" 
            style={{ ...blueGlowStyle, fontFamily: SF }}
          >
            Go to Market <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

      </div>

      {/* Estilos para ocultar el scrollbar nativo en los contenedores horizontales */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
