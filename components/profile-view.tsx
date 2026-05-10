"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, ChevronDown, ChevronRight, Hexagon, X, MoreVertical, Palette, Sparkles, Gift } from "lucide-react"

// Importamos la data externa y configuraciones
import { LEVEL_CONFIG } from "@/lib/data/levels-config"
import { ACHIEVEMENTS_DB } from "@/lib/data/achievements-db"
import { COSMETIC_ITEMS_DB } from "@/lib/data/cosmetics-db"

// Importamos componentes reutilizables
import { PixelObject } from "@/components/cosmetics/pixel-object"

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

// ── Fila de Info del Modal (Alineada a la izquierda y compacta) ──────
const ModalInfoRow = ({ label, children, isLast }: any) => (
  <div className={`flex items-center gap-3 py-3 px-4 ${!isLast ? 'border-b border-[#2c2c2e]/50' : ''}`}>
    <span className="text-[#8e8e93] font-bold text-[14px] capitalize w-[75px] shrink-0" style={{ fontFamily: SF }}>{label}</span>
    <div className="w-[1px] h-4 bg-[#2c2c2e] shrink-0" />
    <div className="text-white font-medium text-[14px] flex-1 text-left flex items-center" style={{ fontFamily: SF }}>
      {children}
    </div>
  </div>
)

export function ProfileView() {
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myBP = ctx.x_points ?? ctx.tokens ?? 0

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")

  const [isLevelsExpanded, setIsLevelsExpanded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // ── ESTADOS DE UI Y NAVEGACIÓN ──
  const [equippedBackground, setEquippedBackground] = useState<string | null>(null)
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false)
  const [previewBg, setPreviewBg] = useState<string | null>(null)

  // Nuevo Estado para las Pestañas (Tabs) Principales
  const [activeMainTab, setActiveMainTab] = useState<"inventory" | "gifts">("inventory")

  // Nuevo Estado para las Pestañas Internas (Sub-tabs)
  const [activeInventorySubTab, setActiveInventorySubTab] = useState<"cosmetics" | "achievements">("cosmetics")
  const [activeGiftsSubTab, setActiveGiftsSubTab] = useState<"all gifts" | "vault">("all gifts")

  // Estado de Logros
  const [unlockedAchKeys, setUnlockedAchKeys] = useState<string[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null)

  const currentLevel = [...LEVEL_CONFIG].reverse().find(l => myBP >= l.bp) || LEVEL_CONFIG[0]
  const nextLevel = LEVEL_CONFIG[currentLevel.lv] || currentLevel
  const lockedLevels = LEVEL_CONFIG.filter(l => l.lv > currentLevel.lv)
  const progressPercent = Math.min(100, (myBP / nextLevel.bp) * 100)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    setDisplayName(full || user.username || "User")
    setUsername(user.username ? "@" + user.username : "")
  }, [])

  // Lógica para Desbloquear Logros Automáticamente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userLv = currentLevel.lv;

    let newlyFound = null;
    const unlocked = [];

    unlocked.push('robot');
    if (!localStorage.getItem('ach_robot_shown')) {
      newlyFound = 'robot';
      localStorage.setItem('ach_robot_shown', 'true');
    }

    if (userLv >= ACHIEVEMENTS_DB.pepe.reqLevel) {
      unlocked.push('pepe');
      if (!newlyFound && !localStorage.getItem('ach_pepe_shown')) {
        newlyFound = 'pepe';
        localStorage.setItem('ach_pepe_shown', 'true');
      }
    }

    setUnlockedAchKeys(unlocked);
    if (newlyFound) setNewlyUnlocked(newlyFound);
  }, [currentLevel.lv])

  // Manejo robusto del botón Back de Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()

    const handleBack = () => {
      if (newlyUnlocked) {
        setNewlyUnlocked(null)
      } else if (selectedItem) {
        setSelectedItem(null)
      } else if (isStylePickerOpen) {
        setIsStylePickerOpen(false)
      } else {
        setCurrentView("home");
        tg.BackButton.hide()
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView, selectedItem, newlyUnlocked, isStylePickerOpen])


  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  const openItemModal = (id: string, isAchievement = false) => {
    if (isAchievement) {
      const ach = ACHIEVEMENTS_DB[id];
      setSelectedItem({
        ...ach,
        preview: <img src={ach.img} draggable={false} className="w-[150px] h-[150px] object-contain pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} alt={ach.name} />
      })
    } else {
      const item = COSMETIC_ITEMS_DB[id];
      if (item) {
        setSelectedItem({
          ...item,
          preview: item.getPreview()
        })
      }
    }
  }

  const isItemOwned = selectedItem ? currentLevel.lv >= selectedItem.reqLevel : false;
  const previewItem = previewBg ? COSMETIC_ITEMS_DB[previewBg] : null;
  const isPreviewOwned = previewItem ? currentLevel.lv >= previewItem.reqLevel : true;

  // En este estado, simulamos que el usuario NO TIENE regalos
  const userHasGifts = false;

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300 scrollbar-native" style={{ background: "#000000" }}>

      {/* ── BACKGROUNDS GLOBALES DINÁMICOS ── */}
      {equippedBackground && COSMETIC_ITEMS_DB[equippedBackground]?.getEquipped && (
        COSMETIC_ITEMS_DB[equippedBackground].getEquipped()
      )}

      {/* Espacio invisible (Header) para absorber el Notch/Status Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full pointer-events-none" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)", background: "transparent" }}></div>

      <div className="px-5 pt-2 pb-32 space-y-8 relative overflow-x-hidden z-10">

        {/* ── PÍLDORA SUPERIOR DERECHA (NATIVA-STYLE SWAPPED) ── */}
        <div className="absolute right-5 top-0 z-30 flex items-center bg-transparent backdrop-blur-md rounded-[24px] border border-white/10 p-[2px] shadow-lg" style={{ marginTop: "12px" }}>
          <button onClick={() => setIsHamburgerOpen(!isHamburgerOpen)} className="w-[34px] h-[34px] flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
            <MoreVertical className="w-[20px] h-[20px] text-white" />
          </button>
          <button onClick={() => setCurrentView("settings")} className="w-[34px] h-[34px] flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
            <Settings className="w-[18px] h-[18px] text-white" />
          </button>

          {/* Dropdown Menu */}
          {isHamburgerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsHamburgerOpen(false)} />
              <div className="absolute top-[48px] right-0 bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] shadow-2xl overflow-hidden w-[220px] z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setPreviewBg(equippedBackground);
                    setIsStylePickerOpen(true);
                    setIsHamburgerOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-white hover:bg-[#2c2c2e] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0">
                    <Palette className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[14px] font-medium" style={{ fontFamily: SF }}>Change Profile Color</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Avatar Principal ── */}
        <div className="flex flex-col items-center pt-2 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="relative flex justify-center items-center w-full mb-3 z-10">
            <div className="flex items-center justify-center overflow-hidden rounded-full relative shadow-lg" style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}>
              {photoUrl ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} onError={() => setPhotoUrl(null)} /> : <span className="text-white font-bold pointer-events-none select-none" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>{initials || "?"}</span>}
            </div>
          </div>

          <div className="text-center flex flex-col items-center relative z-10">
            <div className="relative inline-flex items-center justify-center">
              <p className="text-white font-bold drop-shadow-md" style={{ fontSize: "24px", letterSpacing: "-0.01em", fontFamily: SFD, lineHeight: "1" }}>
                {displayName || "Your Name"}
              </p>
              {/* Icono de nivel centrado verticalmente con exactitud */}
              <div className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={28} />
              </div>
            </div>

            <p className="mt-1.5 drop-shadow-md" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontFamily: SF }}>{username}</p>
          </div>
        </div>

        {/* ── Niveles ── */}
        <div className="w-full relative z-10 mt-6 mb-2">
          <div className="bg-[#141415] rounded-[22px] p-5 border border-[#1c1c1e]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={18} />
                <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level {currentLevel.lv}</span>
              </div>
              <span className="text-[14px] font-bold text-[#d1d1d6]" style={{ fontFamily: SF }}>
                {myBP.toLocaleString()}/{nextLevel.bp.toLocaleString()} BP
              </span>
            </div>
            <div className="flex items-center justify-between w-full mb-2 gap-[4px]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`h-[5px] flex-1 rounded-[1px] transition-all duration-700 ${i < (progressPercent / 100 * 24) ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.4)]' : 'bg-[#2c2c2e]'}`} />
              ))}
            </div>
            <button onClick={() => setIsLevelsExpanded(!isLevelsExpanded)} className="w-full flex items-center justify-center gap-1.5 pt-3 mt-2 active:opacity-70 transition-opacity">
              <span className="text-[13px] text-[#8e8e93] font-medium" style={{ fontFamily: SF }}>Next levels</span>
              <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform ${isLevelsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isLevelsExpanded && (
              <div className="mt-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                {lockedLevels.slice(0, 3).map((lvl) => (
                  <div key={lvl.lv} className="flex items-center justify-between p-3 rounded-[14px] bg-[#0a0a0b] border border-[#1c1c1e]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center grayscale opacity-50 shrink-0">
                        <PixelObject pixels={lvl.pixels} color={lvl.color} size={20} />
                      </div>
                      <div>
                        <p className="text-[#8e8e93] font-medium text-[14px] leading-none mb-1" style={{ fontFamily: SF }}>Level {lvl.lv}</p>
                        <p className="text-[#48484a] text-[12px] leading-none" style={{ fontFamily: SFD }}>{lvl.name}</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-[#2c2c2e]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── NAVEGACIÓN PRINCIPAL (TABS) REFINADA ── */}
        <div className="w-full flex justify-center z-10 relative mb-4 mt-8">
          {/* Contenedor gris oscuro largo */}
          <div className="flex items-center bg-[#1c1c1e] rounded-full p-[3px]">

            <button
              onClick={() => setActiveMainTab("inventory")}
              className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all ${
                activeMainTab === "inventory" 
                ? "bg-[#1f2b3e] text-[#60a5fa] shadow-sm" // Píldora azul transparente
                : "text-[#8e8e93] hover:text-white bg-transparent"
              }`}
              style={{ fontFamily: SF }}
            >
              inventory
            </button>

            <button
              onClick={() => setActiveMainTab("gifts")}
              className={`px-4 py-1.5 rounded-full text-[14px] font-medium flex items-center gap-1.5 transition-all ${
                activeMainTab === "gifts" 
                ? "bg-[#1f2b3e] text-[#60a5fa] shadow-sm" // Píldora azul transparente
                : "text-[#8e8e93] hover:text-white bg-transparent"
              }`}
              style={{ fontFamily: SF }}
            >
              gifts <span className="text-[12px] tracking-tighter">🎂🍾🧸</span>
            </button>

          </div>
        </div>

        {/* ── CONTENIDO DINÁMICO DE PESTAÑAS ── */}
        <div className="w-full animate-in fade-in duration-300">

          {/* ── PESTAÑA PRINCIPAL: INVENTORY ── */}
          {activeMainTab === "inventory" && (
            <div className="w-full flex flex-col">
              {/* Sub-filtros Internos Reducidos ── */}
              <div className="flex items-center justify-center gap-2 mb-4 mt-1">
                <button
                  onClick={() => setActiveInventorySubTab("cosmetics")}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                    activeInventorySubTab === "cosmetics" 
                    ? "bg-[#2c2c2e] text-white" // Fondo activo
                    : "text-[#8e8e93] bg-transparent hover:text-white" // Sin fondo
                  }`}
                  style={{ fontFamily: SF }}
                >
                  cosmetics
                </button>
                <button
                  onClick={() => setActiveInventorySubTab("achievements")}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                    activeInventorySubTab === "achievements" 
                    ? "bg-[#2c2c2e] text-white" // Fondo activo
                    : "text-[#8e8e93] bg-transparent hover:text-white" // Sin fondo
                  }`}
                  style={{ fontFamily: SF }}
                >
                  achievements
                </button>
              </div>

              {/* Contenido Dinámico de Sub-pestañas ── */}
              {activeInventorySubTab === "cosmetics" && (
                <div className="grid grid-cols-3 gap-3">
                  {/* Grilla de Cosméticos (Filtrada para quitar Profile Backgrounds) ── */}
                  {Object.values(COSMETIC_ITEMS_DB)
                    .filter(item => item.type !== 'Profile Background')
                    .map((item) => {
                      const isOwned = currentLevel.lv >= item.reqLevel;
                      return (
                        <button
                          key={item.id}
                          onClick={() => openItemModal(item.id)}
                          className={`relative aspect-square rounded-[20px] overflow-hidden border border-[#2c2c2e] bg-[#141415] flex items-center justify-center active:scale-[0.96] transition-transform ${!isOwned ? 'grayscale opacity-60' : ''}`}
                        >
                          {/* Preview Wrapper */}
                          <div className="absolute inset-0 flex items-center justify-center [&>div]:!h-full [&>div]:!w-full [&>div]:!rounded-[20px] p-2">
                            {item.getPreview()}
                          </div>

                          {/* Etiqueta de cantidad si existe */}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-[6px] z-10">
                            <span className="text-white/80 text-[10px] font-bold">#1</span>
                          </div>

                          {!isOwned && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]">
                              <Lock className="w-6 h-6 text-white/70" strokeWidth={2} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                </div>
              )}

              {activeInventorySubTab === "achievements" && (
                <div className="flex flex-col gap-3">
                  {/* Lista Vertical de Logros ── */}
                  {unlockedAchKeys.map((key) => {
                    const ach = ACHIEVEMENTS_DB[key];
                    return (
                      <button
                        key={key}
                        onClick={() => openItemModal(key, true)}
                        className="flex items-center gap-4 bg-[#141415] rounded-[20px] p-4 border border-[#1c1c1e] active:scale-[0.98] transition-transform text-left"
                      >
                        {/* Hexagon Layout Fijo */}
                        <div className="w-[64px] h-[74px] shrink-0 relative bg-transparent flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                          <img src={ach.img} draggable={false} className="w-[125%] h-[125%] object-cover pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ WebkitTouchCallout: "none" }} />
                        </div>

                        <div className="flex-1 pr-2">
                          <h4 className="text-white font-bold text-[16px] mb-1" style={{ fontFamily: SFD }}>{ach.name}</h4>
                          <p className="text-[#8e8e93] text-[13px] leading-tight line-clamp-2" style={{ fontFamily: SF }}>{ach.desc}</p>
                          <p className="text-[#636366] text-[10px] mt-2 font-semibold uppercase tracking-wide" style={{ fontFamily: SF }}>OBTAINED: {ach.date}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PESTAÑA PRINCIPAL: GIFTS ── */}
          {activeMainTab === "gifts" && (
            <div className="w-full flex flex-col relative pb-[80px]">
              {/* Sub-filtros nativos de regalos Reducidos ── */}
              <div className="flex items-center justify-center gap-2 mb-4 mt-1">
                <button
                  onClick={() => setActiveGiftsSubTab("all gifts")}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                    activeGiftsSubTab === "all gifts" 
                    ? "bg-[#2c2c2e] text-white" 
                    : "text-[#8e8e93] bg-transparent hover:text-white"
                  }`}
                  style={{ fontFamily: SF }}
                >
                  all gifts
                </button>
                <button
                  onClick={() => setActiveGiftsSubTab("vault")}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
                    activeGiftsSubTab === "vault" 
                    ? "bg-[#2c2c2e] text-white" 
                    : "text-[#8e8e93] bg-transparent hover:text-white"
                  }`}
                  style={{ fontFamily: SF }}
                >
                  vault
                </button>
              </div>

              {/* Contenido Dinámico de Sub-pestañas de Gifts ── */}
              {activeGiftsSubTab === "all gifts" && (
                <>
                  {userHasGifts ? (
                     <div className="grid grid-cols-3 gap-3">
                       {/* Grilla de Regalos */}
                     </div>
                  ) : (
                     /* ESTADO VACÍO DE REGALOS (Como en la imagen de referencia) */
                     <div className="flex flex-col items-center justify-center pt-8 pb-10">
                        {/* Asegúrate de tener el gif en public/empty-gift.gif */}
                        <div className="relative w-[140px] h-[140px] mb-4">
                           <img 
                              src="/empty-gift.gif" 
                              alt="No gifts" 
                              className="w-full h-full object-contain pointer-events-none select-none" 
                              draggable={false} 
                              style={{ 
                                 WebkitTouchCallout: "none",
                                 filter: "grayscale(100%) opacity(0.7)" // Aplica filtro desaturado
                              }} 
                           />
                        </div>
                        <h3 className="text-white font-bold text-[20px] mb-2" style={{ fontFamily: SFD }}>If there are no Gifts</h3>
                        <p className="text-[#8e8e93] text-[15px] mb-6" style={{ fontFamily: SF }}>You can buy them in the marketplace</p>
                        
                        <button 
                           onClick={() => setCurrentView("market")}
                           className="bg-[#007aff] hover:bg-[#0062cc] active:scale-95 transition-all text-white font-semibold text-[15px] rounded-xl py-3 px-6 flex items-center justify-center gap-2"
                        >
                           Go to Market <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  )}
                </>
              )}

              {activeGiftsSubTab === "vault" && (
                 <div className="text-center py-20 bg-[#141415] rounded-[24px] border border-dashed border-white/10 mt-2">
                   <Lock className="w-12 h-12 text-[#48484a] mx-auto mb-4" />
                   <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>Your Vault</h3>
                   <p className="text-[#8e8e93] text-[14px] max-w-[220px] mx-auto mt-2" style={{ fontFamily: SF }}>Private collection hidden from others.</p>
                 </div>
              )}

              {/* Botón Flotante Inferior de Regalos ── */}
              <div className="fixed bottom-[calc(var(--tg-safe-area-inset-bottom,24px)+100px)] left-0 right-0 px-8 flex justify-center z-40 pointer-events-none">
                <button className="bg-[#007aff] hover:bg-[#0062cc] active:scale-95 transition-all text-white font-bold text-[16px] rounded-full py-3.5 px-6 shadow-[0_8px_25px_rgba(0,122,255,0.4)] flex items-center justify-center gap-2 w-full max-w-[280px] pointer-events-auto">
                  <Gift className="w-5 h-5" /> send gifts to friends
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL: SELECTOR DE ESTILOS (CHANGE PROFILE COLOR) FIX GENERAL ── */}
      {isStylePickerOpen && (
        <div
          className="fixed inset-0 z-[999] bg-[#0a0a0b] flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-hidden page-fija"
          style={{ height: "var(--tg-viewport-height, 100dvh)", position: "fixed", top: 0, left: 0, bottom: 0, right: 0 }}
        >

          {/* Ocultar la Navigation Bar global y BLOQUEAR SCROLL DE PÁGINA */}
          <style>{`#main-nav-bar { display: none !important; } body { overflow: hidden !important; } .page-fija { pointer-events: auto !important; }`}</style>

          {/* Profile Preview Block (Estático superior, NO SCROLL) ── */}
          <div className="relative w-full h-[320px] shrink-0 flex flex-col items-center justify-center pt-4 border-b border-white/5 bg-[#0a0a0b] z-10">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {previewBg && COSMETIC_ITEMS_DB[previewBg]?.getEquipped ? (
                COSMETIC_ITEMS_DB[previewBg].getEquipped()
              ) : (
                <div className="w-full h-full bg-[#0a0a0b]" />
              )}
              <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#0a0a0b] to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center mt-2 pointer-events-none">
              <div className="flex items-center justify-center overflow-hidden rounded-full relative shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white/5" style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}>
                {photoUrl ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} /> : <span className="text-white font-bold select-none" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>{initials || "?"}</span>}
              </div>
              <div className="text-center flex flex-col items-center mt-3">
                <div className="relative inline-flex items-center justify-center">
                  <p className="text-white font-bold drop-shadow-md" style={{ fontSize: "24px", letterSpacing: "-0.01em", fontFamily: SFD, lineHeight: "1" }}>{displayName || "Your Name"}</p>
                  <div className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                    <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={28} />
                  </div>
                </div>
                <p className="mt-1.5 drop-shadow-md" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontFamily: SF }}>{username}</p>
              </div>
            </div>
          </div>

          {/* Bottom Grid Container (Flex-1, min-h-0 previene el overflow excesivo) ── */}
          <div className="flex-1 min-h-0 bg-[#141415] overflow-y-auto relative z-20 pb-6 scrollbar-native">
            <div className="grid grid-cols-3 gap-3 p-4">

              <button onClick={() => setPreviewBg(null)} className={`relative aspect-square rounded-[20px] overflow-hidden border-[2px] transition-all ${previewBg === null ? 'border-[#007aff] ring-2 ring-[#007aff]/30' : 'border-white/5'} bg-[#1c1c1e] flex flex-col items-center justify-center group`}>
                <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform relative z-10">
                  <X className="w-5 h-5 text-[#8e8e93]" />
                </div>
                <span className="text-[#8e8e93] font-medium text-[11px] relative z-10">Default</span>
              </button>

              {Object.values(COSMETIC_ITEMS_DB).filter(i => i.type === 'Profile Background').map(item => {
                const isSelected = previewBg === item.id;
                const isOwned = currentLevel.lv >= item.reqLevel;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPreviewBg(item.id)}
                    className={`relative aspect-square rounded-[20px] overflow-hidden border-[2px] transition-all ${isSelected ? 'border-[#007aff] ring-2 ring-[#007aff]/30' : 'border-white/5'} ${!isOwned ? 'grayscale opacity-60' : ''} bg-[#111111]`}
                  >
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center [&>div]:!h-full [&>div]:!w-full [&>div]:!rounded-none">
                      {item.getPreview()}
                    </div>
                    <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-bl-[10px] z-10 border-b border-l border-white/5">
                      <span className="text-white/80 text-[9px] font-bold tracking-wide">{item.serial}</span>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-[8px] flex items-center justify-center gap-1 z-10 w-[85%] border border-white/10">
                      <Sparkles className="w-3 h-3 text-white shrink-0" />
                      <span className="text-white text-[9px] font-bold truncate" style={{ fontFamily: SF }}>{item.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Container (shrink-0, Estático abajo) ── */}
          <div className="shrink-0 px-5 pt-5 bg-[#141415] border-t border-white/5 z-50 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]" style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 24px)) + 48px)" }}>
            {isPreviewOwned ? (
              <button onClick={() => { setEquippedBackground(previewBg); setIsStylePickerOpen(false); }} className="w-full bg-[#007aff] hover:bg-[#0062cc] active:scale-[0.98] transition-all text-white font-bold text-[17px] rounded-[16px] py-4 shadow-[0_8px_30px_rgba(0,122,255,0.4)]">
                Apply style
              </button>
            ) : (
              <button disabled className="w-full bg-[#1c1c1e] text-[#636366] border border-[#2c2c2e] font-bold text-[17px] rounded-[16px] py-4 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <Lock className="w-5 h-5" /> Requires Level {previewItem.reqLevel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODALES DETALLADOS DE ITEMS EXISTENTES MANTENIDOS ── */}
      {newlyUnlocked && ACHIEVEMENTS_DB[newlyUnlocked] && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={() => setNewlyUnlocked(null)}>
          <img src={ACHIEVEMENTS_DB[newlyUnlocked].img} alt={ACHIEVEMENTS_DB[newlyUnlocked].name} draggable={false} className="w-[200px] h-[200px] object-contain achievement-shake-animation select-none" style={{ WebkitTouchCallout: "none" }} />
          <h1 className="text-white text-[28px] font-bold mt-6 text-center" style={{ fontFamily: SFD }}>{ACHIEVEMENTS_DB[newlyUnlocked].name}</h1>
          <p className="text-[#8e8e93] text-[13px] font-bold mt-1 tracking-widest uppercase" style={{ fontFamily: SF }}>OBTAINED: {ACHIEVEMENTS_DB[newlyUnlocked].date}</p>
          <p className="text-[#8e8e93] text-center text-[15px] mt-6 max-w-[280px] leading-relaxed" style={{ fontFamily: SF }}>{ACHIEVEMENTS_DB[newlyUnlocked].desc}</p>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes achievementShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px) rotate(-4deg); } 40% { transform: translateX(8px) rotate(4deg); } 60% { transform: translateX(-8px) rotate(-4deg); } 80% { transform: translateX(8px) rotate(4deg); } } .achievement-shake-animation { animation: achievementShake 0.6s ease-in-out forwards; }` }} />
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end overflow-hidden page-fija">
          <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-[#0a0a0b] w-full rounded-t-[24px] flex flex-col items-center animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto pb-[140px]">
            <div className="w-full flex justify-center mt-12 mb-2">{selectedItem.preview}</div>
            <h2 className="text-white font-bold text-[24px] mt-2" style={{ fontFamily: SFD }}>{selectedItem.name} <span className="text-[#8e8e93] font-normal">{selectedItem.serial}</span></h2>
            {selectedItem.date && isItemOwned && (<p className="text-[#8e8e93] text-[12px] mt-1 tracking-widest uppercase font-bold" style={{ fontFamily: SF }}>OBTAINED: {selectedItem.date}</p>)}
            {selectedItem.desc && (<p className="text-[#8e8e93] text-[14px] mt-3 mb-6 px-6 text-center leading-relaxed" style={{ fontFamily: SF }}>{selectedItem.desc}</p>)}

            <div className="px-5 w-full">
              <div className="bg-[#141415] rounded-[16px] border border-[#1c1c1e] w-full flex flex-col mb-8 overflow-hidden">
                <ModalInfoRow label="owner">
                  <div className="flex items-center justify-start gap-2 w-full">
                    {isItemOwned ? (
                      <>
                        {photoUrl ? <img src={photoUrl} className="w-5 h-5 rounded-full select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} /> : <div className="w-5 h-5 rounded-full bg-[#1c1c1e]" />}
                        <span className="text-[#3b82f6] font-medium">{displayName}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-[#1c1c1e] flex items-center justify-center overflow-hidden"><span className="text-[#8e8e93] text-[10px] font-bold">xB</span></div>
                        <span className="text-[#3b82f6] font-medium flex items-center gap-1.5">xBlum Market</span>
                      </>
                    )}
                  </div>
                </ModalInfoRow>
                <ModalInfoRow label="model"><div className="flex items-center"><span>{selectedItem.model}</span>{selectedItem.modelPercent && <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.modelPercent}</span>}</div></ModalInfoRow>
                <ModalInfoRow label="symbol"><div className="flex items-center"><span>{selectedItem.symbol}</span>{selectedItem.symbolPercent && <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.symbolPercent}</span>}</div></ModalInfoRow>
                <ModalInfoRow label="backdrop"><div className="flex items-center"><span>{selectedItem.backdrop}</span>{selectedItem.backdropPercent && <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.backdropPercent}</span>}</div></ModalInfoRow>
                <ModalInfoRow label="quantity" isLast>{selectedItem.quantityMax ? `${selectedItem.quantityIssued.toLocaleString()}/${selectedItem.quantityMax.toLocaleString()} issued` : `${selectedItem.quantityIssued.toLocaleString()} issued`}</ModalInfoRow>
              </div>

              <div className="w-full relative z-10">
                {isItemOwned ? (
                  <button disabled className="w-full bg-[#1c1c1e] text-[#636366] font-bold text-[17px] rounded-[16px] py-4">Owned</button>
                ) : (
                  <button disabled className="w-full bg-[#1c1c1e] text-[#636366] font-bold text-[17px] rounded-[16px] py-4 flex flex-col items-center justify-center leading-tight">
                    <span>Locked</span>
                    <span className="text-[12px] font-normal mt-0.5 text-[#48484a]">Requires Level {selectedItem.reqLevel}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
