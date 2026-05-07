"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, ChevronDown, ChevronRight, Sparkles, Hexagon, Check } from "lucide-react"

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

// ── Componente Pixel Heart (Icon Background) ──────────────────────────
const PixelHeart = ({ color, opacity, size = 20 }: { color: string, opacity: number, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <rect x="2" y="2" width="2" height="2" fill={color}/>
    <rect x="7" y="2" width="2" height="2" fill={color}/>
    <rect x="1" y="4" width="9" height="2" fill={color}/>
    <rect x="2" y="6" width="7" height="2" fill={color}/>
    <rect x="4" y="8" width="3" height="2" fill={color}/>
  </svg>
)

// 18 corazones distribuidos orgánicamente alrededor del perfil
const BACKGROUND_HEARTS = [
  // Lado Izquierdo (9)
  { x: -125, y: -15, rot: -15, op: 0.15, size: 24, color: "#f43f5e" },
  { x: -95,  y: -40, rot: -25, op: 0.35, size: 20, color: "#fb7185" },
  { x: -75,  y: 10,  rot: 10,  op: 0.6,  size: 26, color: "#e11d48" },
  { x: -110, y: 35,  rot: -5,  op: 0.25, size: 18, color: "#fda4af" },
  { x: -145, y: 10,  rot: -30, op: 0.1,  size: 22, color: "#be123c" },
  { x: -55,  y: -50, rot: -10, op: 0.5,  size: 18, color: "#fb7185" },
  { x: -65,  y: 45,  rot: 20,  op: 0.45, size: 24, color: "#f43f5e" },
  { x: -95,  y: 65,  rot: 15,  op: 0.2,  size: 16, color: "#fda4af" },
  { x: -135, y: -45, rot: 5,   op: 0.12, size: 20, color: "#e11d48" },
  // Lado Derecho (9)
  { x: 125, y: -15, rot: 15,  op: 0.15, size: 24, color: "#f43f5e" },
  { x: 95,  y: -40, rot: 25,  op: 0.35, size: 20, color: "#fb7185" },
  { x: 75,  y: 10,  rot: -10, op: 0.6,  size: 26, color: "#e11d48" },
  { x: 110, y: 35,  rot: 5,   op: 0.25, size: 18, color: "#fda4af" },
  { x: 145, y: 10,  rot: 30,  op: 0.1,  size: 22, color: "#be123c" },
  { x: 55,  y: -50, rot: 10,  op: 0.5,  size: 18, color: "#fb7185" },
  { x: 65,  y: 45,  rot: -20, op: 0.45, size: 24, color: "#f43f5e" },
  { x: 95,  y: 65,  rot: -15, op: 0.2,  size: 16, color: "#fda4af" },
  { x: 135, y: -45, rot: -5,  op: 0.12, size: 20, color: "#e11d48" },
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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""
    fetch(`${API_BASE}/api/sync_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        photo_url: user.photo_url || ""
      })
    }).catch(console.error)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()
    const handleBack = () => {
      setCurrentView("home")
      tg.BackButton.hide()
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#000000" }}>

      {/* ── Header Profile ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "transparent",
        }}
      >
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
          Profile
        </h2>
      </div>

      <div className="px-5 pt-2 pb-28 space-y-8 relative overflow-x-hidden">
        
        {/* Ícono de Configuración */}
        <button 
          onClick={() => setCurrentView("settings")}
          className="absolute right-5 top-0 active:opacity-60 transition-opacity z-20"
          style={{ marginTop: "12px" }} 
        >
          <Settings className="w-[22px] h-[22px] text-white/60 hover:text-white transition-colors" />
        </button>

        {/* ── Avatar + Icon Backgrounds + Name Section ── */}
        <div className="flex flex-col items-center pt-2 animate-in fade-in zoom-in-95 duration-500">
           
           {/* Contenedor del Avatar y los Icon Backgrounds */}
           <div className="relative flex justify-center items-center w-full h-[150px] mb-3">
              
              {/* Capa de Icon Backgrounds con Gradient Fade-out (mask) */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)", 
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)" 
                }}
              >
                 {BACKGROUND_HEARTS.map((h, i) => (
                    <div 
                      key={i} 
                      className="absolute left-1/2 top-1/2" 
                      style={{ transform: `translate(calc(-50% + ${h.x}px), calc(-50% + ${h.y}px)) rotate(${h.rot}deg)` }}
                    >
                       <PixelHeart color={h.color} opacity={h.op} size={h.size} />
                    </div>
                 ))}
              </div>

              {/* Avatar Central */}
              <div
                className="flex items-center justify-center overflow-hidden rounded-full shadow-2xl relative z-10"
                style={{ width: 100, height: 100, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)", border: "2px solid rgba(255,255,255,0.05)" }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
                ) : (
                  <span className="text-white font-bold" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>
                    {initials || "?"}
                  </span>
                )}
              </div>
           </div>

          <div className="text-center flex flex-col items-center">
            {/* Contenedor del nombre y el icono perfectamente ajustado */}
            <div className="flex items-center justify-center gap-1.5">
               <p className="text-white font-bold" style={{ fontSize: "24px", letterSpacing: "-0.01em", fontFamily: SFD, lineHeight: "1" }}>
                 {displayName || "Your Name"}
               </p>
               <div className="flex items-center justify-center shrink-0">
                 <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={32} />
               </div>
            </div>
            <p className="mt-1" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
              {username}
            </p>
          </div>
        </div>

        {/* ── Levels Section (Contenedor Original Adaptado) ── */}
        <div className="w-full">
           <div className="bg-[#141415] rounded-[22px] p-5 shadow-2xl border border-[#1c1c1e] transition-all duration-300">
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

              <button 
                 onClick={() => setIsLevelsExpanded(!isLevelsExpanded)}
                 className="w-full flex items-center justify-center gap-1.5 pt-3 mt-2 active:opacity-70 transition-opacity"
              >
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
                   {lockedLevels.length > 3 && (
                     <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#141415] to-transparent pointer-events-none rounded-b-[14px]" />
                   )}
                </div>
              )}
           </div>
        </div>

        {/* ── Achievements Section ── */}
        <div className="w-full">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>
                Achievements <span className="text-[#48484a] text-[16px] ml-1">1</span>
              </h3>
              <ChevronRight className="w-5 h-5 text-[#48484a]" />
           </div>
           
           <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
              <div 
                className="w-[84px] h-[96px] bg-[#111111] flex flex-col items-center justify-center shrink-0 relative"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              >
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '6px 6px' }}></div>
                <Hexagon className="w-6 h-6 text-white/50 mb-1 z-10" />
              </div>
              
              {[1, 2, 3, 4].map((i) => (
                 <div 
                   key={i}
                   className="w-[84px] h-[96px] bg-[#0a0a0a] flex items-center justify-center shrink-0"
                   style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                 >
                 </div>
              ))}
           </div>
        </div>

        {/* ── Inventory Section ── */}
        <div className="w-full pb-6">
           <h3 className="text-white font-bold text-[18px] mb-4" style={{ fontFamily: SFD }}>
             Inventory
           </h3>
           
           <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              
              {/* Tarjeta de Inventario (Fondos de Perfil - Ahora con Pixel Hearts Equipado) */}
              <div className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] border border-blue-500/30 p-4 flex flex-col justify-between shrink-0 relative overflow-hidden">
                 {/* Mini vista previa de corazones en la tarjeta */}
                 <div className="absolute -top-4 -right-4 w-20 h-20 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #e11d48 0%, transparent 70%)" }}></div>
                 
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1e] relative z-10 border border-blue-500/50">
                    <PixelHeart color="#e11d48" opacity={1} size={14} />
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-[2px]">
                       <Check className="w-2 h-2 text-white" strokeWidth={4} />
                    </div>
                 </div>
                 <div className="relative z-10">
                    <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>Icon Backgrounds</p>
                    <p className="text-blue-400 text-[13px] mt-1 font-medium" style={{ fontFamily: SF }}>Pixel Hearts</p>
                 </div>
              </div>

              {/* Tarjeta de Inventario (Name Icons) */}
              <div className="w-[120px] h-[140px] rounded-[24px] bg-[#141415] p-4 flex flex-col justify-between shrink-0">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1c1c1e]">
                    <Sparkles className="w-4 h-4 text-[#8e8e93]" />
                 </div>
                 <div>
                    <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>Name Icons</p>
                    <p className="text-[#8e8e93] text-[13px] mt-1" style={{ fontFamily: SF }}>0 items</p>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  )
}
