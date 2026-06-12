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
  ChevronRight,
  PlusCircle,
  ArrowUp,
  ShoppingCart,
  Send,
  Flame,
  Zap
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
  const [activeTab, setActiveTab] = useState("Gifts")

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

  const handleComingSoon = () => {
    const tg = (window as any).Telegram?.WebApp
    if (tg?.showAlert) {
      tg.showAlert("Coming soon! Stay tuned.")
    } else {
      alert("Coming soon! Stay tuned.")
    }
  }

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  const tabs = ["Gifts", "Offers", "Transactions"]

  return (
    <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#000000] text-white animate-in fade-in duration-300 min-h-screen">
      
      {/* ESPACIO SUPERIOR SEGURO TELEGRAM */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full pointer-events-none" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 20px)", background: "transparent" }}></div>

      <div className="px-4 pb-8 relative z-10">

        {/* HEADER: BOTÓN SETTINGS */}
        <div className="absolute right-4 top-8 z-30 flex items-center">
          <button 
            onClick={() => setCurrentView("settings")} 
            className="w-[36px] h-[36px] flex items-center justify-center rounded-full active:opacity-80 transition-opacity"
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

        {/* FILA DE BOTONES DE ACCIÓN SUPERIOR (RESTAURADOS) */}
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

        {/* PANEL BANNER DE ACCIONES */}
        <div className="mt-8 w-full px-3">
          <div className="relative rounded-[20px] overflow-hidden mx-auto shadow-sm bg-gradient-to-r from-[#0047e1] via-[#0062eb] to-[#00a8ff]">
            
            {/* Polvo de estrellas (Stardust) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10%" cy="15%" r="0.5" fill="white" opacity="0.6" />
              <circle cx="25%" cy="8%" r="1" fill="white" opacity="0.8" />
              <circle cx="40%" cy="25%" r="0.5" fill="white" opacity="0.5" />
              <circle cx="60%" cy="10%" r="1" fill="white" opacity="0.9" />
              <circle cx="75%" cy="20%" r="0.5" fill="white" opacity="0.4" />
              <circle cx="90%" cy="12%" r="1.5" fill="white" opacity="0.8" />
              <circle cx="15%" cy="45%" r="0.5" fill="white" opacity="0.5" />
              <circle cx="35%" cy="55%" r="1" fill="white" opacity="0.7" />
              <circle cx="55%" cy="40%" r="0.5" fill="white" opacity="0.6" />
              <circle cx="85%" cy="50%" r="1" fill="white" opacity="0.8" />
              <circle cx="5%" cy="75%" r="1" fill="white" opacity="0.6" />
              <circle cx="20%" cy="85%" r="0.5" fill="white" opacity="0.5" />
              <circle cx="45%" cy="80%" r="1.5" fill="white" opacity="0.7" />
              <circle cx="65%" cy="70%" r="0.5" fill="white" opacity="0.4" />
              <circle cx="80%" cy="90%" r="1" fill="white" opacity="0.9" />
              <circle cx="95%" cy="65%" r="0.5" fill="white" opacity="0.5" />
              <circle cx="50%" cy="15%" r="0.5" fill="white" opacity="0.8" />
              <circle cx="70%" cy="35%" r="1" fill="white" opacity="0.6" />
              <circle cx="30%" cy="75%" r="0.5" fill="white" opacity="0.7" />
              <circle cx="12%" cy="30%" r="0.8" fill="white" opacity="0.5" />
              <circle cx="88%" cy="75%" r="0.8" fill="white" opacity="0.6" />
              <circle cx="58%" cy="85%" r="0.5" fill="white" opacity="0.4" />
            </svg>

            {/* Top part showing title and icons */}
            <div className="relative z-10 w-full h-[22px] flex items-center justify-between px-4 mt-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-[16px] h-[16px] bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Zap className="w-[9px] h-[9px] text-[#0062eb]" fill="currentColor" strokeWidth={0} />
                </div>
                <span className="text-white text-[13px] font-bold tracking-tight" style={{ fontFamily: SFD }}>Top Up</span>
              </div>
              
              {/* Imagen a la derecha que el usuario va a subir */}
              <div className="relative h-full flex items-center justify-end w-[80px]">
                <img 
                  src="/top-up-coins.png" 
                  alt="Coins" 
                  className="h-[26px] object-contain mr-[-8px]"
                />
              </div>
            </div>
            
            {/* Bottom Panel with Blur */}
            <div className="relative z-10 bg-[#000000]/30 backdrop-blur-xl border-t border-white/10 rounded-t-[14px] pt-2 pb-2 px-4 flex justify-between items-center">
              <button className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform w-[56px]">
                <PlusCircle className="w-[18px] h-[18px] text-white drop-shadow-md" strokeWidth={2.5} />
                <span className="text-white text-[11px] font-medium drop-shadow-md" style={{ fontFamily: SF }}>Top Up</span>
              </button>
              
              <button className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform w-[56px]">
                <ArrowUp className="w-[18px] h-[18px] text-white drop-shadow-md" strokeWidth={2.5} />
                <span className="text-white text-[11px] font-medium drop-shadow-md" style={{ fontFamily: SF }}>Withdraw</span>
              </button>
              
              <button className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform w-[56px]">
                <Send className="w-[18px] h-[18px] text-white drop-shadow-md" strokeWidth={2.5} />
                <span className="text-white text-[11px] font-medium drop-shadow-md" style={{ fontFamily: SF }}>Send</span>
              </button>
              
              <button className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform w-[56px]">
                <ShoppingCart className="w-[18px] h-[18px] text-white drop-shadow-md" strokeWidth={2.5} />
                <span className="text-white text-[11px] font-medium drop-shadow-md" style={{ fontFamily: SF }}>Sell</span>
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* CONTENEDOR INVENTARIO BORDES REDONDEADOS */}
      <div className="bg-[#121212] rounded-t-[32px] w-full flex-1 mt-8 pt-6 px-4 pb-10 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] border-t border-white/5">

        {/* NAVEGACIÓN (TABS) */}
        <div className="flex items-center gap-6 border-b border-[#2c2c2e] overflow-x-auto scrollbar-hide px-2">
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
          {activeTab !== "Transactions" && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <button 
                className="flex items-center justify-center w-[34px] h-[34px] rounded-full shrink-0 active:scale-95 transition-all"
                style={greyGlowStyle}
              >
                <Filter className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
              </button>

              <div className="w-[1px] h-[16px] bg-[#48484a] shrink-0 mx-1" />

              {activeTab === "Gifts" && (
                <>
                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    All Gifts
                  </button>

                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    Listed
                  </button>

                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    Unlisted
                  </button>
                </>
              )}

              {activeTab === "Offers" && (
                <>
                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    All
                  </button>

                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    Active
                  </button>

                  <button 
                    className="flex items-center justify-center px-5 h-[34px] rounded-full font-semibold text-[14px] text-white shrink-0 active:scale-95 transition-all"
                    style={{ ...greyGlowStyle, fontFamily: SF }}
                  >
                    Archived
                  </button>
                </>
              )}
            </div>
          )}

        </div>

        {/* ESTADO VACÍO (EMPTY STATE DINÁMICO) */}
        <div className="flex flex-col items-center justify-center text-center mt-6 px-6">
          <div className="w-[140px] h-[140px] relative mb-3 flex items-center justify-center">
            {activeTab === "Gifts" && (
              <img 
                src="/empty-gift.gif" 
                alt="Empty Gifts" 
                className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl grayscale" 
                draggable={false} 
                style={{ WebkitTouchCallout: "none" }}
              />
            )}
            {activeTab !== "Gifts" && (
              <img 
                src="/no-offers.gif" 
                alt="Empty State" 
                className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl"
                draggable={false} 
                style={{ WebkitTouchCallout: "none" }}
              />
            )}
          </div>
          
          <h2 className="text-[18px] font-bold text-white mb-1 tracking-tight" style={{ fontFamily: SFD }}>
            {activeTab === "Gifts" && "If there are no Gifts"}
            {activeTab === "Offers" && "No orders yet"}
            {activeTab === "Transactions" && "No transactions yet"}
          </h2>
          
          <p className="text-[#8e8e93] text-[14px] leading-relaxed max-w-[280px] mb-3" style={{ fontFamily: SF }}>
            {activeTab === "Gifts" && "You can buy in the marketplace"}
            {activeTab === "Offers" && "Once you place an order, it will appear here"}
            {activeTab === "Transactions" && "You haven't made any transactions yet"}
          </p>

          {activeTab === "Gifts" && (
            <button 
              onClick={handleComingSoon} 
              className="flex items-center justify-center gap-1.5 text-white px-3 h-[32px] rounded-full font-semibold text-[16px] active:scale-95 transition-transform shrink-0" 
              style={{ ...blueGlowStyle, fontFamily: SF }}
            >
              Go to Market <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
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
