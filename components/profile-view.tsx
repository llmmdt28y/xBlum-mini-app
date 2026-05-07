"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, ChevronDown, ChevronRight, Sparkles, Check, X, ChevronLeft } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Configuración de Niveles ─────────────────────────────────────────
const LEVEL_CONFIG = [
  { lv: 1,  name: "Novice",    bp: 0,       color: "#82c3cd", pixels: [33, 23, 32, 34, 43] },
  { lv: 2,  name: "Explorer",  bp: 1000,    color: "#a8e8a8", pixels: [22, 23, 24, 32, 33, 34, 42, 43, 44] },
  { lv: 3,  name: "Advanced",  bp: 2500,    color: "#e8a8c1", pixels: [30, 21, 31, 41, 12, 22, 32, 42, 52, 3, 13, 23, 33, 43, 53, 63, 14, 24, 34, 44, 54, 25, 35, 45, 36] },
  { lv: 4,  name: "Expert",    bp: 6000,    color: "#ffd9a8", pixels: [21, 31, 41, 12, 52, 13, 53, 14, 54, 25, 35, 45] },
  { lv: 5,  name: "Specialist",bp: 12000,   color: "#a8c1e8", pixels: [30, 21, 41, 12, 32, 52, 3, 33, 63, 14, 34, 54, 25, 45, 36] },
  { lv: 6,  name: "Elite",     bp: 25000,   color: "#d1a8e8", pixels: [21, 31, 41, 12, 32, 52, 13, 33, 53, 14, 34, 54, 25, 35, 45] },
  { lv: 7,  name: "Veteran",   bp: 50000,   color: "#e8a8a8", pixels: [0, 60, 11, 51, 22, 42, 33, 24, 44, 15, 55, 6, 66] },
  { lv: 8,  name: "Commander", bp: 100000,  color: "#f4f4f4", pixels: [30, 21, 31, 41, 3, 13, 23, 33, 43, 53, 63, 25, 35, 45, 36] },
  { lv: 9,  name: "Legend",    bp: 250000,  color: "#ffd700", pixels: [30, 11, 51, 2, 32, 62, 13, 53, 4, 34, 64, 15, 55, 36] },
  { lv: 10, name: "Oracle",    bp: 500000,  color: "#00ffcc", pixels: [11, 21, 31, 41, 51, 12, 52, 13, 53, 14, 54, 15, 25, 35, 45, 55] },
  { lv: 11, name: "Visionary", bp: 1000000, color: "#ff007f", pixels: [30, 21, 31, 41, 2, 12, 22, 42, 52, 62, 33, 4, 14, 24, 44, 54, 64, 25, 35, 45, 36] },
  { lv: 12, name: "Apex AI",   bp: 2500000, color: "#ffffff", pixels: [0, 10, 20, 30, 40, 50, 60, 1, 61, 2, 22, 32, 42, 62, 3, 23, 33, 43, 63, 4, 24, 34, 44, 64, 5, 65, 6, 16, 26, 36, 46, 56, 66] }
]

// ── Base de Datos de Logros ──────────────────────────────────────────
const ACHIEVEMENTS_DB: Record<string, any> = {
  robot: {
    id: 'robot',
    name: 'First Touch',
    serial: '#01,244',
    collection: 'Achievements',
    rarity: 'Common',
    rarityPercent: '100%',
    type: 'Welcome Badge',
    typePercent: '100%',
    quantityIssued: 12500,
    quantityMax: null, 
    reqLevel: 1,
    img: '/robot-achievement.png',
    desc: 'Complete your first task. The world has answered your touch. A mark of beginning in the xBlum network.',
    date: "MAY 7, 2026"
  },
  pepe: {
    id: 'pepe',
    name: 'Early Pepe',
    serial: '#00,004',
    collection: 'Achievements',
    rarity: 'Exclusive',
    rarityPercent: '0.1%',
    type: 'Early Access',
    typePercent: '0.1%',
    quantityIssued: 4,
    quantityMax: 15,
    reqLevel: 2,
    img: '/pepe-achievement.png',
    desc: 'Assigned to the first 15 users who reached Level 2 on the platform during the Early Access phase. Your early belief is forever recognized.',
    date: "MAY 7, 2026"
  },
  pyramid: { 
    id: 'pyramid',
    name: 'The Architect',
    serial: '#00,001',
    collection: 'Achievements',
    rarity: 'Mythic',
    rarityPercent: '0.01%',
    type: 'Secret',
    typePercent: '0.01%',
    quantityIssued: 1,
    quantityMax: 10,
    reqLevel: 99, 
    img: '/pyramid-achievement.png',
    desc: 'You have uncovered the deepest secrets of the platform. A truly mythic accomplishment reserved for the top elite.',
    date: "MAY 7, 2026"
  }
}

// ── Componente Pixel Art (Nivel) ──────────────────────────────────────
const PixelObject = ({ pixels, color, size = 90 }: { pixels: number[], color: string, size?: number }) => {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
      {pixels.map(pos => {
        const x = Math.floor(pos / 10)
        const y = pos % 10
        return <rect key={pos} x={x} y={y} width="1" height="1" fill={color} />
      })}
      <rect x="3" y="3" width="1" height="1" fill="white" opacity="0.4" />
    </svg>
  )
}

// ── Componente Pixel Heart Outline ────────────────────────────────────
const PixelHeartOutline = ({ color, opacity, size = 20 }: { color: string, opacity: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <rect x="2" y="1" width="2" height="1" />
    <rect x="7" y="1" width="2" height="1" />
    <rect x="1" y="2" width="1" height="1" />
    <rect x="4" y="2" width="1" height="1" />
    <rect x="6" y="2" width="1" height="1" />
    <rect x="9" y="2" width="1" height="1" />
    <rect x="0" y="3" width="1" height="3" />
    <rect x="5" y="3" width="1" height="1" />
    <rect x="10" y="3" width="1" height="3" />
    <rect x="1" y="6" width="1" height="1" />
    <rect x="9" y="6" width="1" height="1" />
    <rect x="2" y="7" width="1" height="1" />
    <rect x="8" y="7" width="1" height="1" />
    <rect x="3" y="8" width="1" height="1" />
    <rect x="7" y="8" width="1" height="1" />
    <rect x="4" y="9" width="1" height="1" />
    <rect x="6" y="9" width="1" height="1" />
    <rect x="5" y="10" width="1" height="1" />
  </svg>
)

const BACKGROUND_HEARTS = [
  { x: -90, y: -50, rot: -5, op: 0.15, size: 24, color: "#ffffff" },
  { x:  90, y: -50, rot:  5, op: 0.15, size: 24, color: "#ffffff" },
  { x: -110, y: 10, rot:  0, op: 0.20, size: 28, color: "#ffffff" },
  { x:  110, y: 10, rot:  0, op: 0.20, size: 28, color: "#ffffff" },
  { x: -160, y: -20, rot:  10, op: 0.08, size: 20, color: "#ffffff" },
  { x:  160, y: -20, rot: -10, op: 0.08, size: 20, color: "#ffffff" },
  { x: -140, y:  50, rot:  -5, op: 0.12, size: 22, color: "#ffffff" },
  { x:  140, y:  50, rot:   5, op: 0.12, size: 22, color: "#ffffff" },
  { x: -75,  y:  80, rot: -15, op: 0.10, size: 18, color: "#ffffff" },
  { x:  75,  y:  80, rot:  15, op: 0.10, size: 18, color: "#ffffff" },
  { x: -120, y: 110, rot:   0, op: 0.06, size: 16, color: "#ffffff" },
  { x:  120, y: 110, rot:   0, op: 0.06, size: 16, color: "#ffffff" },
  { x: -40,  y: -90, rot:  10, op: 0.08, size: 18, color: "#ffffff" },
  { x:  40,  y: -90, rot: -10, op: 0.08, size: 18, color: "#ffffff" },
]

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

// ── Fila de Info del Modal ──────
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
  
  const [equippedBackground, setEquippedBackground] = useState<string | null>(null)

  // ── ESTADOS DE LOGROS (ACHIEVEMENTS) ──
  const [unlockedAchKeys, setUnlockedAchKeys] = useState<string[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null)
  const [isAchievementsMenuOpen, setIsAchievementsMenuOpen] = useState(false);

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

    // Logro 1: Robot (Nivel 1) - Desbloqueado por defecto
    unlocked.push('robot');
    if (!localStorage.getItem('ach_robot_shown')) {
      newlyFound = 'robot';
      localStorage.setItem('ach_robot_shown', 'true');
    }

    // Logro 2: Pepe (Nivel 2)
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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if(newlyUnlocked) setNewlyUnlocked(null)
      else if(isAchievementsMenuOpen) setIsAchievementsMenuOpen(false) 
      else if(selectedItem) setSelectedItem(null)
      else { setCurrentView("home"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView, selectedItem, newlyUnlocked, isAchievementsMenuOpen])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  const PreviewPixelHeartsModal = (
    <div className="relative w-full h-[200px] flex items-center justify-center overflow-hidden">
       <div className="absolute inset-0 pointer-events-none z-0">
          {BACKGROUND_HEARTS.map((h, i) => (
             <div 
               key={i} 
               className="absolute left-1/2 top-1/2" 
               style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}
             >
                <PixelHeartOutline color={h.color} opacity={h.op} size={h.size} />
             </div>
          ))}
       </div>
    </div>
  )

  const openItemModal = (type: string) => {
    if (type === 'hearts') {
      setSelectedItem({
        id: 'hearts',
        name: 'Pixel Hearts', serial: '#94,355', collection: 'Cosmetic Backgrounds',
        rarity: 'Exclusive (Early Access)', rarityPercent: '0.5%', type: 'Icon Background', typePercent: '0.4%',
        quantityIssued: 124, quantityMax: 500, reqLevel: 3, reqBP: 2500,
        desc: 'A premium pixel heart aura that surrounds your avatar, reserved for early supporters.',
        date: "MAY 7, 2026",
        preview: PreviewPixelHeartsModal
      })
    } else if (type === 'sparkles') {
      setSelectedItem({
        id: 'sparkles',
        name: 'Sparkle Title', serial: '#12,442', collection: 'Name Icons',
        rarity: 'Rare', rarityPercent: '2.5%', type: 'Name Icon', typePercent: '1.2%',
        quantityIssued: 3150, quantityMax: 10000, reqLevel: 8, reqBP: 50000,
        desc: 'A sparkling icon that appears next to your username to signify your high rank.',
        date: "MAY 7, 2026",
        preview: <Sparkles className="w-24 h-24 text-[#8e8e93]" />
      })
    } else if (ACHIEVEMENTS_DB[type]) {
      const ach = ACHIEVEMENTS_DB[type];
      setSelectedItem({
        id: ach.id,
        name: ach.name, serial: ach.serial, collection: ach.collection,
        rarity: ach.rarity, rarityPercent: ach.rarityPercent, type: ach.type, typePercent: ach.typePercent,
        quantityIssued: ach.quantityIssued, quantityMax: ach.quantityMax, reqLevel: ach.reqLevel,
        desc: ach.desc,
        date: ach.date,
        preview: <img src={ach.img} draggable={false} className="w-[150px] h-[150px] object-contain pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} alt={ach.name} />
      })
    }
  }

  const handleEquipToggle = () => {
    if (equippedBackground === selectedItem?.id) {
       setEquippedBackground(null)
    } else {
       setEquippedBackground(selectedItem?.id)
    }
    setSelectedItem(null)
  }

  // Exactamente 4 espacios para la fila horizontal de logros en el perfil principal
  const TOTAL_PROFILE_ACH_SLOTS = 4;
  const profileAchievementSlots = Array.from({ length: TOTAL_PROFILE_ACH_SLOTS });

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#000000" }}>

      <div className="sticky top-0 z-30 flex items-center justify-center w-full" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)", background: "transparent" }}></div>

      <div className="px-5 pt-2 pb-28 space-y-8 relative overflow-x-hidden">
        
        <button onClick={() => setCurrentView("settings")} className="absolute right-5 top-0 active:opacity-60 transition-opacity z-20" style={{ marginTop: "12px" }}>
          <Settings className="w-[22px] h-[22px] text-white/60 hover:text-white transition-colors" />
        </button>

        {/* ── Avatar y Fondo Principal ── */}
        <div className="flex flex-col items-center pt-2 animate-in fade-in zoom-in-95 duration-500 relative">
           
           {equippedBackground === 'hearts' && (
             <div className="absolute inset-0 pointer-events-none z-0" style={{ height: '240px', top: '-40px', maskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)" }}>
                {BACKGROUND_HEARTS.map((h, i) => (
                   <div key={i} className="absolute left-1/2 top-[40%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
                      <PixelHeartOutline color={h.color} opacity={h.op} size={h.size} />
                   </div>
                ))}
             </div>
           )}

           <div className="relative flex justify-center items-center w-full mb-3 z-10">
                <div className="flex items-center justify-center overflow-hidden rounded-full border-2 border-black relative shadow-lg" style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}>
                  {photoUrl ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} onError={() => setPhotoUrl(null)} /> : <span className="text-white font-bold pointer-events-none select-none" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>{initials || "?"}</span>}
                </div>
           </div>
          <div className="text-center flex flex-col items-center relative z-10">
            <div className="flex items-center justify-center gap-1.5">
               <p className="text-white font-bold" style={{ fontSize: "24px", letterSpacing: "-0.01em", fontFamily: SFD, lineHeight: "1" }}>{displayName || "Your Name"}</p>
               <div className="flex items-center justify-center shrink-0">
                 <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={32} />
               </div>
            </div>
            <p className="mt-1.5" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>{username}</p>
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

        {/* ── Achievements (Fila Única Horizontal Exacta) ── */}
        <div className="w-full relative z-10">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                Achievements <span className="text-[#48484a] text-[16px] ml-1">{unlockedAchKeys.length}</span>
              </h3>
              {/* Botón Circular con flecha para ir al menú general de logros */}
              <button onClick={() => setIsAchievementsMenuOpen(true)} className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform">
                <ChevronRight className="w-4 h-4 text-[#8e8e93]" />
              </button>
           </div>
           
           {/* Fila única horizontal, items pegados sin gap visibles grandes */}
           <div className="flex items-center gap-[2px] overflow-x-hidden pb-2">
              {profileAchievementSlots.map((_, i) => {
                 const key = unlockedAchKeys[i];
                 if (key) {
                    const ach = ACHIEVEMENTS_DB[key];
                    return (
                      <button 
                        key={key}
                        onClick={() => openItemModal(key)}
                        className="w-[82px] h-[94px] shrink-0 active:scale-95 transition-transform flex items-center justify-center relative bg-transparent"
                        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                      >
                        <img src={ach.img} draggable={false} alt={ach.name} className="w-[125%] h-[125%] object-cover pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
                      </button>
                    )
                 } else {
                    return (
                      <div 
                         key={`empty-${i}`} 
                         className="w-[82px] h-[94px] shrink-0 flex items-center justify-center relative bg-[#111111]"
                         style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                      >
                      </div>
                    )
                 }
              })}
           </div>
        </div>

        {/* ── Inventory ── */}
        <div className="w-full pb-6 relative z-10">
           <h3 className="text-white font-bold text-[18px] mb-4" style={{ fontFamily: SFD }}>Inventory</h3>
           <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              
              <button onClick={() => openItemModal('hearts')} className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] border border-[#2c2c2e] p-4 flex flex-col justify-between shrink-0 relative overflow-hidden active:scale-[0.98] transition-transform text-left">
                 <div className="absolute -top-4 -right-4 w-20 h-20 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}></div>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1e] relative z-10 border border-[#2c2c2e]">
                    <PixelHeartOutline color="#ffffff" opacity={0.8} size={10} />
                    
                    {equippedBackground === 'hearts' && (
                       <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px]">
                          <Check className="w-2 h-2 text-white" strokeWidth={4} />
                       </div>
                    )}
                    {currentLevel.lv < 3 && ( 
                       <div className="absolute -bottom-1 -right-1 bg-[#1c1c1e] rounded-full p-[2px] border border-[#2c2c2e]">
                          <Lock className="w-2 h-2 text-[#8e8e93]" strokeWidth={3} />
                       </div>
                    )}
                 </div>
                 <div className="relative z-10">
                    <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>Icon Backgrounds</p>
                    <p className={`text-[13px] mt-1 font-medium ${currentLevel.lv >= 3 ? 'text-blue-400' : 'text-[#636366]'}`} style={{ fontFamily: SF }}>Pixel Hearts</p>
                 </div>
              </button>

              <button onClick={() => openItemModal('sparkles')} className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] p-4 flex flex-col justify-between shrink-0 active:scale-[0.98] transition-transform text-left border border-[#2c2c2e]">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1e]">
                    <Sparkles className="w-4 h-4 text-[#8e8e93]" />
                 </div>
                 <div>
                    <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>Name Icons</p>
                    <p className="text-[#8e8e93] text-[13px] mt-1" style={{ fontFamily: SF }}>0 items</p>
                 </div>
              </button>

           </div>
        </div>

      </div>

      {/* ── MODAL FULLSCREEN: NUEVO LOGRO DESBLOQUEADO (Animación Shake) ── */}
      {newlyUnlocked && ACHIEVEMENTS_DB[newlyUnlocked] && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setNewlyUnlocked(null)}
        >
          <div className="absolute top-5 left-5 text-white flex items-center gap-1 text-[16px] font-medium" style={{ fontFamily: SF }}>
            <ChevronLeft className="w-6 h-6" /> back
          </div>
          
          <img 
            src={ACHIEVEMENTS_DB[newlyUnlocked].img} 
            alt={ACHIEVEMENTS_DB[newlyUnlocked].name} 
            draggable={false}
            className="w-[200px] h-[200px] object-contain achievement-shake-animation pointer-events-none select-none" 
            style={{ WebkitTouchCallout: "none" }}
          />
          
          <h1 className="text-white text-[28px] font-bold mt-6 text-center" style={{ fontFamily: SFD }}>
             {ACHIEVEMENTS_DB[newlyUnlocked].name}
          </h1>
          <p className="text-[#8e8e93] text-[13px] font-bold mt-1 tracking-widest uppercase" style={{ fontFamily: SF }}>
             OBTAINED: {ACHIEVEMENTS_DB[newlyUnlocked].date}
          </p>
          <p className="text-[#8e8e93] text-center text-[15px] mt-6 max-w-[280px] leading-relaxed" style={{ fontFamily: SF }}>
             {ACHIEVEMENTS_DB[newlyUnlocked].desc}
          </p>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes achievementShake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-8px) rotate(-4deg); }
              40% { transform: translateX(8px) rotate(4deg); }
              60% { transform: translateX(-8px) rotate(-4deg); }
              80% { transform: translateX(8px) rotate(4deg); }
            }
            .achievement-shake-animation {
              animation: achievementShake 0.6s ease-in-out forwards;
            }
          `}} />
        </div>
      )}

      {/* ── MODAL FULLSCREEN: MENÚ DE DETALLE DE LOGROS (GRID) ── */}
      {isAchievementsMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-y-auto">
          
          {/* Header del menú Transparente */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-10 pb-5 bg-transparent">
            {/* Botón Circular Gris */}
            <button 
              className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center active:scale-95 transition-transform" 
              onClick={() => setIsAchievementsMenuOpen(false)}
            >
              <ChevronLeft className="w-6 h-6 text-[#8e8e93]" />
            </button>
            <h1 className="text-white text-[18px] font-bold text-center flex-1 pr-10" style={{ fontFamily: SFD }}>
              Achievements
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            {Object.keys(ACHIEVEMENTS_DB).map((key) => {
              const ach = ACHIEVEMENTS_DB[key];
              const isUnlocked = unlockedAchKeys.includes(key);

              return (
                <button 
                  key={key} 
                  onClick={() => isUnlocked && openItemModal(key)}
                  className={`aspect-[1/1.1] bg-[#0a0a0a] rounded-[24px] border-[3px] ${isUnlocked ? 'border-[#2c2c2e]' : 'border-[#1c1c1e]'} flex items-center justify-center relative transition-all active:scale-[0.97] p-2`}
                >
                   {/* Hexágono Interior que contiene la imagen o slot vacío */}
                   <div 
                      className={`w-full h-full flex items-center justify-center relative overflow-hidden ${isUnlocked ? 'bg-transparent' : 'bg-[#111111]'}`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                   >
                     {isUnlocked ? (
                        <img src={ach.img} draggable={false} className="w-[120%] h-[120%] object-cover pointer-events-none select-none" style={{ WebkitTouchCallout: "none" }} />
                     ) : (
                        // Slot vacío (Hexágono interior gris oscuro plano)
                        <div className="w-full h-full bg-[#111111]"></div>
                     )}
                   </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Sheet Modal (Detalles Inventario/Logros) - Z-Index subido para superponerse al menú ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)} />
           <div className="relative bg-[#0a0a0b] w-full rounded-t-[24px] flex flex-col items-center animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-5 right-5 active:opacity-60 cursor-pointer z-50" onClick={() => setSelectedItem(null)}><X className="w-6 h-6 text-[#8e8e93]" /></div>
              
              <div className="w-full flex justify-center mt-10 mb-2">{selectedItem.preview}</div>

              <h2 className="text-white font-bold text-[24px] mt-2" style={{ fontFamily: SFD }}>{selectedItem.name} <span className="text-[#8e8e93] font-normal">{selectedItem.serial}</span></h2>
              
              {selectedItem.date && (
                <p className="text-[#8e8e93] text-[12px] mt-1 tracking-widest uppercase font-bold" style={{ fontFamily: SF }}>OBTAINED: {selectedItem.date}</p>
              )}
              {selectedItem.desc && (
                <p className="text-[#8e8e93] text-[14px] mt-3 mb-6 px-6 text-center leading-relaxed" style={{ fontFamily: SF }}>{selectedItem.desc}</p>
              )}

              <div className="px-5 w-full">
                 <div className="bg-[#141415] rounded-[16px] border border-[#1c1c1e] w-full flex flex-col mb-8 overflow-hidden">
                    <ModalInfoRow label="owner">
                       <div className="flex items-center justify-start gap-2 w-full">
                          {photoUrl ? <img src={photoUrl} className="w-5 h-5 rounded-full pointer-events-none select-none" draggable={false} style={{ WebkitTouchCallout: "none" }} /> : <div className="w-5 h-5 rounded-full bg-[#1c1c1e]" />}
                          <span className="text-[#3b82f6] font-medium">{displayName}</span>
                       </div>
                    </ModalInfoRow>
                    <ModalInfoRow label="model">
                       <div className="flex items-center">
                          <span>{selectedItem.collection}</span>
                          <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.rarityPercent}</span>
                       </div>
                    </ModalInfoRow>
                    <ModalInfoRow label="symbol">
                       <div className="flex items-center">
                          <span>{selectedItem.type}</span>
                          <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.typePercent}</span>
                       </div>
                    </ModalInfoRow>
                    <ModalInfoRow label="backdrop">
                       {selectedItem.rarity}
                    </ModalInfoRow>
                    <ModalInfoRow label="quantity" isLast>
                       {selectedItem.quantityMax 
                         ? `${selectedItem.quantityIssued.toLocaleString()}/${selectedItem.quantityMax.toLocaleString()} issued`
                         : `${selectedItem.quantityIssued.toLocaleString()} issued`
                       }
                    </ModalInfoRow>
                 </div>

                 <div className="w-full mb-[120px]">
                   {currentLevel.lv >= selectedItem.reqLevel ? (
                      selectedItem.id === 'hearts' ? (
                        equippedBackground === selectedItem.id ? (
                           <button onClick={handleEquipToggle} className="w-full bg-[#1c1c1e] text-white font-bold text-[17px] rounded-[16px] py-4 border border-[#2c2c2e] active:bg-[#2c2c2e] transition-colors">
                              Unequip
                           </button>
                        ) : (
                           <button onClick={handleEquipToggle} className="w-full bg-[#3b82f6] active:bg-[#2563eb] transition-colors text-white font-bold text-[17px] rounded-[16px] py-4">
                              Equip Background
                           </button>
                        )
                      ) : (
                         <button disabled className="w-full bg-[#1c1c1e] text-[#636366] font-bold text-[17px] rounded-[16px] py-4">
                            Owned
                         </button>
                      )
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
