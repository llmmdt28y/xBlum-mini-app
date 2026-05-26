"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  Settings, 
  Gift, 
  Info, 
  PenLine, 
  PlusCircle, 
  Search, 
  ArrowUpDown, 
  CheckSquare, 
  List, 
  SlidersHorizontal, 
  ChevronDown,
  Sparkles
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

  const tabs = ["Collected", "History", "Offers", "Favorites", "Soulbound"]

  return (
    <div className="flex-1 overflow-y-auto relative bg-[#000000] text-white animate-in fade-in duration-300 min-h-screen">
      
      {/* ESPACIO SUPERIOR SEGURO TELEGRAM */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full pointer-events-none" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 20px)", background: "transparent" }}></div>

      <div className="px-4 pb-32 relative z-10">

        {/* HEADER: BOTÓN SETTINGS (Píldora alargada horizontalmente con icono al centro) */}
        <div className="absolute right-4 top-8 z-30 flex items-center">
          <button 
            onClick={() => setCurrentView("settings")} 
            className="w-[56px] h-[34px] flex items-center justify-center rounded-full bg-[#000000] border border-white/20 shadow-md active:bg-white/10 transition-colors"
          >
            <Settings className="w-[18px] h-[18px] text-white" />
          </button>
        </div>

        {/* SECCIÓN DE PERFIL */}
        <div className="flex flex-col items-center pt-10">
          <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center mb-3">
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

        {/* FILA DE BOTONES DE ACCIÓN (Más alargados, menos altos, contenido más grande y píldoras separadas por línea) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 w-full">
          
          <button className="flex items-center justify-center gap-1.5 bg-[#2b63eb] text-white px-5 h-[34px] rounded-full font-bold text-[14px] active:opacity-80 transition-opacity" style={{ fontFamily: SF }}>
            <Gift className="w-[18px] h-[18px]" />
            Add Gift
          </button>
          
          <button className="flex items-center justify-center gap-1.5 bg-[#1c1c1e] text-white px-5 h-[34px] rounded-full font-bold text-[14px] active:opacity-80 transition-opacity" style={{ fontFamily: SF }}>
            <Info className="w-[18px] h-[18px]" />
            Info
          </button>
          
          {/* Píldora del Lápiz */}
          <button className="flex items-center justify-center w-[52px] h-[34px] bg-[#1c1c1e] rounded-full active:opacity-80 transition-opacity">
            <PenLine className="w-[18px] h-[18px] text-white" />
          </button>
          
          {/* Línea divisoria en el espacio libre */}
          <div className="w-[1px] h-[16px] bg-[#3a3a3c]" />
          
          {/* Píldora de Add Links */}
          <button className="flex items-center justify-center gap-1.5 bg-[#1c1c1e] text-white px-5 h-[34px] rounded-full font-bold text-[14px] active:opacity-80 transition-opacity" style={{ fontFamily: SF }}>
            <PlusCircle className="w-[18px] h-[18px]" />
            Add Links
          </button>
          
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
        <div className="mt-5 space-y-3 px-1">
          {/* Fila 1: Buscador y Botones Vista */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#1c1c1e] rounded-[12px] h-[40px] flex items-center px-3">
              <Search className="w-4 h-4 text-[#8e8e93] shrink-0" />
              <input 
                type="text" 
                placeholder="Name or description" 
                className="bg-transparent border-none outline-none text-white w-full h-full px-2 text-[15px] placeholder:text-[#8e8e93]"
                style={{ fontFamily: SF }}
              />
            </div>
            <button className="w-[40px] h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center shrink-0 active:opacity-80">
              <ArrowUpDown className="w-[18px] h-[18px] text-white" />
            </button>
            <button className="w-[40px] h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center shrink-0 active:opacity-80">
              <CheckSquare className="w-[18px] h-[18px] text-white" />
            </button>
            <button className="w-[40px] h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center shrink-0 active:opacity-80">
              <List className="w-[18px] h-[18px] text-white" />
            </button>
          </div>

          {/* Fila 2: Categorías y Ajustes */}
          <div className="flex items-center gap-2">
            <button className="w-[40px] h-[40px] bg-[#1c1c1e] rounded-[12px] flex items-center justify-center shrink-0 active:opacity-80">
              <SlidersHorizontal className="w-[18px] h-[18px] text-white" />
            </button>
            <button className="flex-1 bg-[#1c1c1e] rounded-[12px] h-[40px] flex items-center justify-between px-4 active:opacity-80 transition-opacity">
              <span className="text-[14px] font-medium text-white" style={{ fontFamily: SF }}>All Types</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
            <button className="flex-1 bg-[#1c1c1e] rounded-[12px] h-[40px] flex items-center justify-between px-4 active:opacity-80 transition-opacity">
              <span className="text-[14px] font-medium text-white" style={{ fontFamily: SF }}>Collections</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ESTADO VACÍO (EMPTY STATE) */}
        <div className="flex flex-col items-center justify-center text-center mt-12 px-6">
          <div className="w-[160px] h-[160px] relative mb-6">
            <img 
              src="/tu-imagen-aqui.png" 
              alt="Empty NFTs" 
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl" 
              draggable={false} 
              style={{ WebkitTouchCallout: "none" }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-[#1c1c1e] rounded-full flex items-center justify-center"><span class="text-4xl">👻</span></div>';
              }}
            />
          </div>
          
          <h2 className="text-[18px] font-bold text-white mb-2 tracking-tight" style={{ fontFamily: SFD }}>
            You have no NFTs.
          </h2>
          
          <p className="text-[#8e8e93] text-[14px] leading-relaxed max-w-[280px] mb-6" style={{ fontFamily: SF }}>
            After minting or buying, your NFTs will be displayed in this section and visible to other users.
          </p>

          <button className="bg-[#2b63eb] text-white px-8 py-2.5 rounded-xl font-semibold text-[15px] active:scale-95 transition-transform" style={{ fontFamily: SF }}>
            Add NFT
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
