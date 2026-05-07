"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, ChevronDown, ChevronRight, Sparkles, Hexagon, Check, X } from "lucide-react"

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

// ── Componente Pixel Heart Outline (Icon Background) ──────────────────
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

// Restaurado: Tamaño, opacidad y distribución sutil y elegante.
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

// ── Telegram user helper ─────────────────────────────────────────────
type TgUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}
function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── Componente Fila de Información del Modal con Divisor Vertical ──────
const ModalInfoRow = ({ label, children, isLast }: any) => (
  <div className={`grid grid-cols-[100px_1fr] items-center gap-4 py-3.5 px-4 ${!isLast ? 'border-b border-[#2c2c2e]/50' : ''}`}>
    <span className="text-white font-bold text-[15px] capitalize" style={{ fontFamily: SF }}>{label}</span>
    <div className="flex items-center gap-4 text-[#e5e5ea] font-normal text-[15px]" style={{ fontFamily: SF }}>
       {/* Divisor Vertical */}
       <div className="w-[1px] h-5 bg-[#2c2c2e]" />
       <div className="flex-1 text-left">{children}</div>
    </div>
  </div>
)

// ── Main ProfileView ──────────────────────────────────────────────────
export function ProfileView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myBP = ctx.x_points ?? ctx.tokens ?? 0

  const [photoUrl,    setPhotoUrl]    = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username,    setUsername]    = useState("")
  
  const [isLevelsExpanded, setIsLevelsExpanded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null) // Estado del Modal

  // Determinar Nivel Actual
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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()
    const handleBack = () => {
      if(selectedItem) {
        setSelectedItem(null) // Cierra el modal si está abierto
      } else {
        setCurrentView("home")
        tg.BackButton.hide()
      }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView, selectedItem])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  // Vista previa específica para el modal de corazones (Vacío en medio)
  const PreviewPixelHeartsModal = (
    <div className="relative w-[180px] h-[180px] flex items-center justify-center overflow-hidden">
       <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)" }}>
         {BACKGROUND_HEARTS.map((h, i) => (
             <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${h.x * 0.7}px), calc(-50% + ${h.y * 0.7}px)) rotate(${h.rot}deg)` }}>
                <PixelHeartOutline color={h.color} opacity={h.op * 2} size={h.size} />
             </div>
         ))}
       </div>
       {/* Centro Vacío. Eliminado el círculo y el texto de AVATAR */}
    </div>
  )

  const openItemModal = (type: 'hearts' | 'sparkles' | 'achievement') => {
    if (type === 'hearts') {
      setSelectedItem({
        name: 'Pixel Hearts', serial: '#94,355', collection: 'Cosmetic Backgrounds',
        rarity: 'Exclusive', rarityPercent: '0.5%', type: 'Icon Background', typePercent: '0.4%',
        quantityIssued: 124, quantityMax: 500, reqLevel: 5, reqBP: 12000,
        isOwned: true, isEquipped: true, preview: PreviewPixelHeartsModal
      })
    } else if (type === 'sparkles') {
      setSelectedItem({
        name: 'Sparkle Title', serial: '#12,442', collection: 'Name Icons',
        rarity: 'Rare', rarityPercent: '2.5%', type: 'Name Icon', typePercent: '1.2%',
        quantityIssued: 3150, quantityMax: 10000, reqLevel: 8, reqBP: 50000,
        isOwned: false, isEquipped: false, preview: <Sparkles className="w-24 h-24 text-[#8e8e93]" />
      })
    } else if (type === 'achievement') {
      setSelectedItem({
        name: 'Novice Pioneer', serial: '#00,001', collection: 'Achievements',
        rarity: 'Common', rarityPercent: '50%', type: 'Badge', typePercent: '100%',
        quantityIssued: 85400, quantityMax: 100000, reqLevel: 1, reqBP: 0,
        isOwned: true, isEquipped: false, preview: <Hexagon className="w-24 h-24 text-white/50" />
      })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#000000" }}>

      {/* ── Header Profile ── */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)", background: "transparent" }}></div>

      <div className="px-5 pt-2 pb-28 space-y-8 relative overflow-x-hidden">
        
        <button onClick={() => setCurrentView("settings")} className="absolute right-5 top-0 active:opacity-60 transition-opacity z-20" style={{ marginTop: "12px" }}>
          <Settings className="w-[22px] h-[22px] text-white/60 hover:text-white transition-colors" />
        </button>

        {/* ── Avatar + Icon Backgrounds + Name Section ── */}
        <div className="flex flex-col items-center pt-2 animate-in fade-in zoom-in-95 duration-500 relative">
           
           <div className="absolute inset-0 pointer-events-none z-0" style={{ height: '240px', top: '-40px', maskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)" }}>
              {BACKGROUND_HEARTS.map((h, i) => (
                 <div key={i} className="absolute left-1/2 top-[40%]" style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}>
                    <PixelHeartOutline color={h.color} opacity={h.op} size={h.size} />
                 </div>
              ))}
           </div>

           <div className="relative flex justify-center items-center w-full mb-3 z-10">
                <div className="flex items-center justify-center overflow-hidden rounded-full border-2 border-black relative shadow-lg" style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}>
                  {photoUrl ? <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} /> : <span className="text-white font-bold" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>{initials || "?"}</span>}
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

        {/* ── Levels Section ── */}
        <div className="w-full relative z-10 mt-6">
           <div className="bg-[#141415] rounded-[22px] p-5 border border-[#1c1c1e] transition-all duration-300">
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
                 <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-300 ${isLevelsExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isLevelsExpanded && (
                <div className="mt-4 flex flex-col gap-2 relative animate-in fade-in slide-in-from-top-2 duration-300">
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
                   {lockedLevels.length > 3 && <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#141415] to-transparent pointer-events-none rounded-b-[14px]" />}
                </div>
              )}
           </div>
        </div>

        {/* ── Achievements Section ── */}
        <div className="w-full relative z-10">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                Achievements <span className="text-[#48484a] text-[16px] ml-1">1</span>
              </h3>
              <ChevronRight className="w-5 h-5 text-[#48484a]" />
           </div>
           
           <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
              <button 
                onClick={() => openItemModal('achievement')}
                className="w-[84px] h-[96px] bg-[#111111] flex flex-col items-center justify-center shrink-0 relative active:scale-95 transition-transform"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              >
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '6px 6px' }}></div>
                <Hexagon className="w-6 h-6 text-white/50 mb-1 z-10" />
              </button>
              
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="w-[84px] h-[96px] bg-[#0a0a0a] flex items-center justify-center shrink-0" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
              ))}
           </div>
        </div>

        {/* ── Inventory Section ── */}
        <div className="w-full pb-6 relative z-10">
           <h3 className="text-white font-bold text-[18px] mb-4" style={{ fontFamily: SFD }}>
             Inventory
           </h3>
           
           <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              
              <button onClick={() => openItemModal('hearts')} className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] border border-blue-500/30 p-4 flex flex-col justify-between shrink-0 relative overflow-hidden active:scale-[0.98] transition-transform text-left">
                 <div className="absolute -top-4 -right-4 w-20 h-20 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}></div>
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1e] relative z-10 border border-blue-500/50">
                    <PixelHeartOutline color="#ffffff" opacity={0.8} size={10} />
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px]">
                       <Check className="w-2 h-2 text-white" strokeWidth={4} />
                    </div>
                 </div>
                 <div className="relative z-10">
                    <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>Icon Backgrounds</p>
                    <p className="text-blue-400 text-[13px] mt-1 font-medium" style={{ fontFamily: SF }}>Pixel Hearts</p>
                 </div>
              </button>

              <button onClick={() => openItemModal('sparkles')} className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] p-4 flex flex-col justify-between shrink-0 active:scale-[0.98] transition-transform text-left">
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

      {/* ── Bottom Sheet Modal (Details) ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
           <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-300" onClick={() => setSelectedItem(null)} />

           <div className="relative bg-[#0a0a0b] w-full rounded-t-[24px] flex flex-col items-center animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto pb-12">
              
              {/* Header Icon - Reemplazado por X de cierre */}
              <div className="absolute top-5 right-5 active:opacity-60 cursor-pointer" onClick={() => setSelectedItem(null)}>
                 <X className="w-6 h-6 text-[#8e8e93]" />
              </div>

              {/* Preview */}
              <div className="w-full flex justify-center mt-12 mb-6">
                 {selectedItem.preview}
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD }}>
                 {selectedItem.name} <span className="text-[#8e8e93] font-normal">{selectedItem.serial}</span>
              </h2>
              <p className="text-[#8e8e93] text-[15px] mb-8" style={{ fontFamily: SF }}>{selectedItem.collection}</p>

              {/* Table Data */}
              <div className="px-5 w-full">
                 <div className="bg-[#141415] rounded-[16px] border border-[#1c1c1e] w-full flex flex-col mb-6 overflow-hidden">
                    <ModalInfoRow label="owner">
                       <div className="flex items-center gap-2">
                          {photoUrl ? <img src={photoUrl} className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-[#1c1c1e]" />}
                          {/* Eliminado emoji de cohete */}
                          <span className="text-[#3b82f6] font-medium">{displayName}</span>
                       </div>
                    </ModalInfoRow>
                    <ModalInfoRow label="model">
                       {selectedItem.collection} <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.rarityPercent}</span>
                    </ModalInfoRow>
                    <ModalInfoRow label="symbol">
                       {selectedItem.type} <span className="bg-[#2c2c2e] text-[#3b82f6] px-1.5 py-0.5 rounded-[6px] text-[12px] ml-2 font-bold">{selectedItem.typePercent}</span>
                    </ModalInfoRow>
                    <ModalInfoRow label="backdrop">
                       {selectedItem.rarity}
                    </ModalInfoRow>
                    <ModalInfoRow label="quantity" isLast>
                       {selectedItem.quantityIssued.toLocaleString()}/{selectedItem.quantityMax.toLocaleString()} issued
                    </ModalInfoRow>
                 </div>

                 {/* Action Button Logic */}
                 {selectedItem.isOwned ? (
                    selectedItem.isEquipped ? (
                       <button disabled className="w-full bg-[#2c2c2e] text-[#8e8e93] font-bold text-[17px] rounded-[16px] py-4">
                          Equipped
                       </button>
                    ) : (
                       <button className="w-full bg-[#3b82f6] active:bg-[#2563eb] transition-colors text-white font-bold text-[17px] rounded-[16px] py-4">
                          Use Profile Background
                       </button>
                    )
                 ) : (
                    currentLevel.lv >= selectedItem.reqLevel ? (
                       <button className="w-full bg-[#3b82f6] active:bg-[#2563eb] transition-colors text-white font-bold text-[17px] rounded-[16px] py-4">
                          Claim Item
                       </button>
                    ) : (
                       <button disabled className="w-full bg-[#2c2c2e] text-[#8e8e93] font-bold text-[17px] rounded-[16px] py-4 flex flex-col items-center justify-center leading-tight">
                          <span>Locked</span>
                          <span className="text-[12px] font-normal mt-0.5 text-[#636366]">Requires Level {selectedItem.reqLevel}</span>
                       </button>
                    )
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
