"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, ChevronDown, ChevronRight, Sparkles, Hexagon, Check, X, ChevronLeft, MoreVertical, Palette, ArrowLeft } from "lucide-react"

// Importamos la data externa y configuraciones
import { LEVEL_CONFIG } from "@/lib/data/levels-config"
import { ACHIEVEMENTS_DB } from "@/lib/data/achievements-db"
import { COSMETIC_ITEMS_DB } from "@/lib/data/cosmetics-db"

// Importamos componentes reutilizables
import { PixelObject } from "@/components/cosmetics/pixel-object"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
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

  const [photoUrl,    setPhotoUrl]    = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username,    setUsername]    = useState("")
  
  const [isLevelsExpanded, setIsLevelsExpanded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  // Fondo activo y estados de UI para el Menu de Perfil
  const [equippedBackground, setEquippedBackground] = useState<string | null>(null)
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false)
  const [previewBg, setPreviewBg] = useState<string | null>(null)

  // ── ESTADOS DE MENÚS (ACHIEVEMENTS & INVENTORY) ──
  const [unlockedAchKeys, setUnlockedAchKeys] = useState<string[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null)
  const [isAchievementsMenuOpen, setIsAchievementsMenuOpen] = useState(false);
  const [isCosmeticInventoryMenuOpen, setIsCosmeticInventoryMenuOpen] = useState(false);

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
      } else if (isAchievementsMenuOpen) {
        setIsAchievementsMenuOpen(false) 
      } else if (isCosmeticInventoryMenuOpen) { 
        setIsCosmeticInventoryMenuOpen(false)
      } else { 
        setCurrentView("home");
        tg.BackButton.hide() 
      }
    }
    
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView, selectedItem, newlyUnlocked, isAchievementsMenuOpen, isCosmeticInventoryMenuOpen, isStylePickerOpen])

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

  const TOTAL_PROFILE_ACH_SLOTS = 4;
  const profileAchievementSlots = Array.from({ length: TOTAL_PROFILE_ACH_SLOTS });
  const isItemOwned = selectedItem ? currentLevel.lv >= selectedItem.reqLevel : false;
  const cosmeticCategories = Array.from(new Set(Object.values(COSMETIC_ITEMS_DB).map(item => item.category)));

  // Validadores para el Style Picker
  const previewItem = previewBg ? COSMETIC_ITEMS_DB[previewBg] : null;
  const isPreviewOwned = previewItem ? currentLevel.lv >= previewItem.reqLevel : true;

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#000000" }}>

      {/* ── BACKGROUNDS GLOBALES DINÁMICOS ── */}
      {equippedBackground && COSMETIC_ITEMS_DB[equippedBackground]?.getEquipped && (
        COSMETIC_ITEMS_DB[equippedBackground].getEquipped()
      )}

      {/* Espacio invisible (Header) para absorber el Notch/Status Bar en el modo Fullscreen */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full pointer-events-none" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)", background: "transparent" }}></div>

      <div className="px-5 pt-2 pb-28 space-y-8 relative overflow-x-hidden z-10">
        
        {/* ── MENÚ HAMBURGUESA (PUNTOS VERTICALES) ── */}
        <div className="absolute left-5 top-0 z-30" style={{ marginTop: "12px" }}>
           <button onClick={() => setIsHamburgerOpen(!isHamburgerOpen)} className="w-[32px] h-[32px] flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full border border-white/10 active:opacity-60 transition-opacity">
             <MoreVertical className="w-[18px] h-[18px] text-white" />
           </button>
           
           {/* Dropdown Menu */}
           {isHamburgerOpen && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setIsHamburgerOpen(false)} />
               <div className="absolute top-10 left-0 bg-[#1c1c1e] border border-[#2c2c2e] rounded-[16px] shadow-2xl overflow-hidden w-[220px] z-50 animate-in fade-in zoom-in-95 duration-200">
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

        {/* ── BOTÓN SETTINGS ── */}
        <button onClick={() => setCurrentView("settings")} className="absolute right-5 top-0 active:opacity-60 transition-opacity z-20 w-[32px] h-[32px] flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full border border-white/10" style={{ marginTop: "12px" }}>
          <Settings className="w-[16px] h-[16px] text-white" />
        </button>

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
               <div className="absolute left-full ml-1.5 flex items-center justify-center shrink-0">
                 <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={32} />
               </div>
            </div>
            
            <p className="mt-1.5 drop-shadow-md" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontFamily: SF }}>{username}</p>
          </div>
        </div>

        {/* ── Niveles ── */}
        <div className="w-full relative z-10 mt-6">
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

        {/* ── Achievements ── */}
        <div className="w-full relative z-10">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                Achievements <span className="text-[#48484a] text-[16px] ml-1">{unlockedAchKeys.length}</span>
              </h3>
              <button onClick={() => setIsAchievementsMenuOpen(true)} className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                <ChevronRight className="w-4 h-4 text-[#8e8e93]" />
              </button>
           </div>
             
           <div className="flex items-center gap-[2px] overflow-x-hidden pb-4 pt-2 pl-1">
              {profileAchievementSlots.map((_, i) => {
                 const key = unlockedAchKeys[i];
                 const zIndex = 10 - i; 
                 const marginLeft = i === 0 ? '0' : '-16px';
                 if (key) {
                    const ach = ACHIEVEMENTS_DB[key];
                    return (
                      <div key={key} style={{ zIndex, marginLeft }} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.08)]">
                         <button 
                           onClick={() => openItemModal(key, true)}
                           className="w-[82px] h-[94px] shrink-0 active:scale-95 transition-transform flex items-center justify-center relative bg-transparent hover:-translate-y-1"
                           style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                         >
                             <img src={ach.img} draggable={false} alt={ach.name} className="w-[125%] h-[125%] object-cover pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
                         </button>
                      </div>
                    )
                 } else {
                    return (
                      <div key={`empty-${i}`} className="w-[82px] h-[94px] shrink-0 flex items-center justify-center relative bg-[#111111]" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", zIndex: zIndex, marginLeft: marginLeft }}>
                      </div>
                    )
                 }
              })}
           </div>
        </div>

        {/* ── Inventory ── */}
        <div className="w-full pb-6 relative z-10">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>Inventory</h3>
              <button onClick={() => setIsCosmeticInventoryMenuOpen(true)} className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                <ChevronRight className="w-4 h-4 text-[#8e8e93]" />
               </button>
           </div>
           
           <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
              <button onClick={() => setIsCosmeticInventoryMenuOpen(true)} className="w-[140px] h-[160px] rounded-[24px] bg-[#141415] border border-[#2c2c2e] p-5 flex flex-col justify-between shrink-0 relative overflow-hidden active:scale-[0.98] transition-transform text-left group">
                 <div className="absolute inset-0 bg-blue-500 opacity-0 group-active:opacity-10 transition-opacity"></div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1c1c1e] relative z-10 border border-[#2c2c2e]">
                    <Hexagon className="w-5 h-5 text-[#8e8e93]" />
                 </div>
                 <div className="relative z-10">
                    <p className="text-white font-medium text-[16px] leading-tight" style={{ fontFamily: SF }}>Open</p>
                    <p className="text-blue-400 text-[14px] mt-1 font-medium" style={{ fontFamily: SF }}>Cosmetic Catalogue</p>
                 </div>
              </button>
           </div>
        </div>

      </div>

      {/* ── MODAL NUEVA: SELECTOR DE ESTILOS (CHANGE PROFILE COLOR) ── */}
      {isStylePickerOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0b] flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-hidden">
            
            {/* Header Navbar */}
            <div className="flex items-center justify-between px-5 pt-6 pb-2 relative z-50">
               <button onClick={() => setIsStylePickerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full active:scale-95 transition-transform border border-white/10">
                  <ArrowLeft className="w-4 h-4 text-white" />
               </button>
               <span className="text-white font-bold text-[17px]" style={{ fontFamily: SFD }}>Profile Color</span>
               <div className="w-8 h-8" />
            </div>

            {/* Profile Preview Block */}
            <div className="relative w-full h-[280px] shrink-0 flex flex-col items-center justify-center">
               <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                 {previewBg && COSMETIC_ITEMS_DB[previewBg]?.getEquipped ? (
                    COSMETIC_ITEMS_DB[previewBg].getEquipped()
                 ) : (
                    <div className="w-full h-full bg-[#000000]" /> 
                 )}
               </div>
               
               <div className="relative z-10 flex flex-col items-center mt-4">
                  <div className="flex items-center justify-center overflow-hidden rounded-full relative shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white/5" style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}>
                     {photoUrl ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} /> : <span className="text-white font-bold pointer-events-none select-none" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>{initials || "?"}</span>}
                  </div>
                  <div className="text-center flex flex-col items-center mt-3">
                    <div className="relative inline-flex items-center justify-center">
                       <p className="text-white font-bold drop-shadow-md" style={{ fontSize: "24px", letterSpacing: "-0.01em", fontFamily: SFD, lineHeight: "1" }}>{displayName || "Your Name"}</p>
                       <div className="absolute left-full ml-1.5 flex items-center justify-center shrink-0">
                         <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={32} />
                       </div>
                    </div>
                    <p className="mt-1.5 drop-shadow-md" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontFamily: SF }}>{username}</p>
                  </div>
               </div>
            </div>

            {/* Bottom Grid Container (3 Columnas) */}
            <div className="flex-1 bg-[#141415] rounded-t-[32px] border-t border-[#2c2c2e] overflow-y-auto relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-3 gap-2.5 p-4 pb-[120px]">
                   
                   {/* None/Unequip Card */}
                   <button onClick={() => setPreviewBg(null)} className={`relative aspect-square rounded-[16px] overflow-hidden border-2 transition-all ${previewBg === null ? 'border-[#3b82f6]' : 'border-transparent'} bg-[#1c1c1e] flex flex-col items-center justify-center group`}>
                      <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                         <X className="w-5 h-5 text-[#8e8e93]" />
                      </div>
                      <span className="text-[#8e8e93] font-medium text-[12px]">Default</span>
                   </button>
                   
                   {/* Background Cards */}
                   {Object.values(COSMETIC_ITEMS_DB).filter(i => i.type === 'Profile Background').map(item => {
                      const isSelected = previewBg === item.id;
                      const isOwned = currentLevel.lv >= item.reqLevel;
                      return (
                         <button 
                           key={item.id}
                           onClick={() => setPreviewBg(item.id)}
                           className={`relative aspect-square rounded-[16px] overflow-hidden border-2 transition-all ${isSelected ? 'border-[#3b82f6]' : 'border-transparent'} ${!isOwned ? 'grayscale opacity-60' : ''}`}
                         >
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-[#111111] [&>div]:!h-full [&>div]:!w-full [&>div]:!rounded-none">
                               {item.getPreview()}
                            </div>
                            
                            {/* Diagonal Ribbon (Top Right) */}
                            <div className="absolute top-[8px] -right-[24px] w-[80px] bg-black/40 backdrop-blur-md py-0.5 text-center rotate-45 z-10 border-y border-white/10 shadow-sm">
                               <span className="text-white/90 text-[8px] font-bold">{item.serial}</span>
                            </div>

                            {/* Bottom Pill */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-[8px] flex items-center justify-center gap-1 z-10 w-[85%] border border-white/10">
                               <Sparkles className="w-3 h-3 text-white shrink-0" />
                               <span className="text-white text-[9px] font-bold truncate">{item.name}</span>
                            </div>
                         </button>
                      )
                   })}
                </div>
            </div>

            {/* Fixed Bottom Apply Button */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#141415] via-[#141415] to-transparent pb-8 z-50 pointer-events-none">
               <div className="pointer-events-auto">
                 {isPreviewOwned ? (
                   <button onClick={() => { setEquippedBackground(previewBg); setIsStylePickerOpen(false); }} className="w-full bg-[#007aff] active:scale-[0.98] transition-transform text-white font-bold text-[17px] rounded-[16px] py-4 shadow-lg shadow-[#007aff]/30">
                      Apply style
                   </button>
                 ) : (
                   <button disabled className="w-full bg-[#1c1c1e] text-[#636366] border border-[#2c2c2e] font-bold text-[17px] rounded-[16px] py-4 flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" /> Requires Level {previewItem.reqLevel}
                   </button>
                 )}
               </div>
            </div>
        </div>
      )}

      {/* ── MODAL FULLSCREEN: MENÚ DE INVENTARIO COSMÉTICO GENERAL ── */}
      {isCosmeticInventoryMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-y-auto pb-10">
          <div className="px-5 pt-8 flex flex-col">
            <h1 className="text-white text-[32px] font-bold mb-8" style={{ fontFamily: SFD }}>Catalogue</h1>
            {cosmeticCategories.map((category) => {
               const categoryItems = Object.values(COSMETIC_ITEMS_DB).filter(item => item.category === category && item.type !== 'Profile Background');
               if (categoryItems.length === 0) return null;

               return (
                  <div key={category} className="mb-10 w-full">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                              <Hexagon className="w-3 h-3 text-[#8e8e93]" />
                           </div>
                           <span className="text-white font-bold text-[17px] uppercase tracking-wider" style={{ fontFamily: SFD }}>{category}</span>
                           <span className="text-[#48484a] text-[16px] font-semibold" style={{ fontFamily: SF }}>{categoryItems.length}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-x-4 gap-y-8 pl-1">
                        {categoryItems.map((item) => {
                         const isOwned = currentLevel.lv >= item.reqLevel;
                         return (
                           <div key={item.id} className={`flex flex-col items-center text-center w-full drop-shadow-[0_0_15px_rgba(255,255,255,0.06)] ${!isOwned ? 'grayscale opacity-60' : ''}`}>
                              <button onClick={() => openItemModal(item.id)} className="w-[140px] h-[140px] shrink-0 active:scale-95 transition-transform flex items-center justify-center relative bg-transparent hover:-translate-y-1 group" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                {item.getPreview()}
                                {!isOwned && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                       <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-[#2c2c2e]">
                                          <Lock className="w-6 h-6 text-[#8e8e93]" strokeWidth={2} />
                                       </div>
                                    </div>
                                )}
                              </button>
                              <h2 className="text-white font-bold text-[15px] mt-3" style={{ fontFamily: SFD }}>{item.name}</h2>
                              <p className="text-[#8e8e93] text-[11px] mt-1.5 leading-[1.3] px-1" style={{ fontFamily: SF }}>{item.desc}</p>
                              {isOwned ? (
                                 <p className="text-[#636366] text-[10px] mt-2 font-semibold uppercase tracking-wide" style={{ fontFamily: SF }}>{item.date}</p>
                              ) : (
                                 <p className="text-[#48484a] text-[10px] mt-2 font-semibold uppercase tracking-wide" style={{ fontFamily: SF }}>Requires Level {item.reqLevel}</p>
                              )}
                           </div>
                          )
                       })}
                     </div>
                  </div>
               )
            })}
           </div>
        </div>
      )}

      {/* ── MODALES EXISTENTES MANTENIDOS ── */}
      {newlyUnlocked && ACHIEVEMENTS_DB[newlyUnlocked] && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300" onClick={() => setNewlyUnlocked(null)}>
          <img src={ACHIEVEMENTS_DB[newlyUnlocked].img} alt={ACHIEVEMENTS_DB[newlyUnlocked].name} draggable={false} className="w-[200px] h-[200px] object-contain achievement-shake-animation pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
          <h1 className="text-white text-[28px] font-bold mt-6 text-center" style={{ fontFamily: SFD }}>{ACHIEVEMENTS_DB[newlyUnlocked].name}</h1>
          <p className="text-[#8e8e93] text-[13px] font-bold mt-1 tracking-widest uppercase" style={{ fontFamily: SF }}>OBTAINED: {ACHIEVEMENTS_DB[newlyUnlocked].date}</p>
          <p className="text-[#8e8e93] text-center text-[15px] mt-6 max-w-[280px] leading-relaxed" style={{ fontFamily: SF }}>{ACHIEVEMENTS_DB[newlyUnlocked].desc}</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes achievementShake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px) rotate(-4deg); } 40% { transform: translateX(8px) rotate(4deg); } 60% { transform: translateX(-8px) rotate(-4deg); } 80% { transform: translateX(8px) rotate(4deg); } } .achievement-shake-animation { animation: achievementShake 0.6s ease-in-out forwards; }`}} />
        </div>
      )}

      {isAchievementsMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-y-auto pb-10">
          <div className="px-5 pt-8 flex flex-col">
             <h1 className="text-white text-[32px] font-bold mb-8" style={{ fontFamily: SFD }}>Achievements</h1>
            {Array.from(new Set(unlockedAchKeys.map(key => ACHIEVEMENTS_DB[key].category || 'Secrets'))).map((category) => {
               const categoryKeys = unlockedAchKeys.filter(key => (ACHIEVEMENTS_DB[key].category || 'Secrets') === category);
                return (
                  <div key={category} className="mb-10 w-full">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1c1c1e] flex items-center justify-center"><Hexagon className="w-3 h-3 text-[#8e8e93]" /></div>
                           <span className="text-white font-bold text-[17px] uppercase tracking-wider" style={{ fontFamily: SFD }}>{category}</span>
                           <span className="text-[#48484a] text-[16px] font-semibold" style={{ fontFamily: SF }}>{categoryKeys.length}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-8 pl-1">
                       {categoryKeys.map((key) => {
                         const ach = ACHIEVEMENTS_DB[key];
                         return (
                           <div key={key} className="flex flex-col items-center text-center w-full drop-shadow-[0_0_15px_rgba(255,255,255,0.06)]">
                              <button onClick={() => openItemModal(key, true)} className="w-[140px] h-[140px] shrink-0 active:scale-95 transition-transform flex items-center justify-center relative bg-transparent hover:-translate-y-1" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                <img src={ach.img} draggable={false} className="w-[125%] h-[125%] object-cover pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
                              </button>
                              <h2 className="text-white font-bold text-[15px] mt-3" style={{ fontFamily: SFD }}>{ach.name}</h2>
                              <p className="text-[#8e8e93] text-[11px] mt-1.5 leading-[1.3] px-1" style={{ fontFamily: SF }}>{ach.desc}</p>
                              <p className="text-[#636366] text-[10px] mt-2 font-semibold uppercase tracking-wide" style={{ fontFamily: SF }}>{ach.date}</p>
                           </div>
                         )
                       })}
                     </div>
                  </div>
                )
            })}
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)} />
           <div className="relative bg-[#0a0a0b] w-full rounded-t-[24px] flex flex-col items-center animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
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
                               {photoUrl ? <img src={photoUrl} className="w-5 h-5 rounded-full pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} /> : <div className="w-5 h-5 rounded-full bg-[#1c1c1e]" />}
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
                 
                 <div className="w-full mb-[120px]">
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
