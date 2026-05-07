"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Settings, Lock, Check, ChevronRight, Sparkles, Hexagon } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Configuración de Niveles (Importada de levels-view) ──────────────
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

// ── Componente Pixel Art ──────────────────────────────────────────────
const PixelObject = ({ pixels, color, size = 90 }: { pixels: number[], color: string, size?: number }) => {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ filter: `drop-shadow(0 0 12px ${color}66)` }}>
      {pixels.map(pos => {
        const x = Math.floor(pos / 10)
        const y = pos % 10
        return <rect key={pos} x={x} y={y} width="1" height="1" fill={color} />
      })}
      <rect x="3" y="3" width="1" height="1" fill="white" opacity="0.4" />
    </svg>
  )
}

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

// ── Componentes de UI Básicos ────────────────────────────────────────
function Row({
  label, sublabel, right, onClick, leftNode,
}: {
  leftNode?: React.ReactNode
  label: string
  sublabel?: string
  right?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-4 px-5 transition-colors ${onClick ? 'active:bg-white/5' : ''}`}
      style={{ paddingTop: "14px", paddingBottom: "14px" }}
    >
      {leftNode && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
          {leftNode}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
            {sublabel}
          </p>
        )}
      </div>
      {right ?? (onClick ? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} /> : null)}
    </button>
  )
}

function Divider() {
  return <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "56px" }} />
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
        {title && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-[#141415] border-b border-[#1c1c1e]">
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#8e8e93", fontFamily: SF, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {title}
            </p>
          </div>
        )}
        {children}
      </div>
    </div>
  )
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

  // Determinar Nivel Actual
  const currentLevel = [...LEVEL_CONFIG].reverse().find(l => myBP >= l.bp) || LEVEL_CONFIG[0]
  const nextLevel = LEVEL_CONFIG[currentLevel.lv] || currentLevel
  const progressPercent = Math.min(100, (myBP / nextLevel.bp) * 100)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    setDisplayName(full || user.username || "User")
    setUsername(user.username ? "@" + user.username : "")

    // Sincronizar perfil
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
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#060606" }}>

      {/* ── Header Profile ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(6,6,6,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
          Profile
        </h2>
      </div>

      <div className="px-5 pt-6 pb-28 space-y-6 relative">
        
        {/* Ícono de Configuración */}
        <button 
          onClick={() => setCurrentView("settings")}
          className="absolute right-5 top-0 active:opacity-60 transition-opacity z-20"
          style={{ marginTop: "24px" }} 
        >
          <Settings className="w-[22px] h-[22px] text-white/60 hover:text-white transition-colors" />
        </button>

        {/* ── Avatar + Name Section ── */}
        <div className="flex flex-col items-center gap-4 pt-6 pb-4 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Avatar Container (Más grande y con espacio para Icon Background) */}
          <div className="relative flex items-center justify-center p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
             {/* Simulación de Icon Background Equipado */}
             <div className="absolute inset-0 rounded-full border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] pointer-events-none" />
             
             <div
               className="flex items-center justify-center overflow-hidden rounded-full shadow-2xl relative z-10"
               style={{ width: 110, height: 110, background: "linear-gradient(135deg,#1e1e1e,#0a0a0a)" }}
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
            <div className="flex items-center justify-center gap-2">
               <p className="text-white font-bold" style={{ fontSize: "22px", letterSpacing: "-0.01em", fontFamily: SFD }}>
                 {displayName || "Your Name"}
               </p>
               {/* Icono de Nivel Conectado al Nombre */}
               <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={14} />
               </div>
            </div>
            
            <p className="mt-1 flex items-center gap-2 justify-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
              <span>{username}</span>
              <span className="w-1 h-1 rounded-full bg-[#48484a]"></span>
              <span style={{ color: currentLevel.color }}>Level {currentLevel.lv}</span>
            </p>
          </div>
        </div>

        {/* ── Achievements Section ── */}
        <Section title="Achievements & Progress">
           {/* Barra de Progreso BP */}
           <div className="px-5 py-5 border-b border-[#1c1c1e] bg-[#141415]">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[14px] text-white font-medium" style={{ fontFamily: SF }}>Level {currentLevel.lv}</span>
                 <span className="text-[13px] text-[#8e8e93]" style={{ fontFamily: SFD }}>
                   {myBP.toLocaleString()} / {nextLevel.bp.toLocaleString()} BP
                 </span>
              </div>
              <div className="flex items-center justify-between w-full gap-[3px]">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={`h-[4px] flex-1 rounded-[1px] transition-all duration-700 ${i < (progressPercent / 100 * 20) ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-[#2c2c2e]'}`} />
                ))}
              </div>
           </div>

           {/* Lista de Logros */}
           <Row
             leftNode={<PixelObject pixels={LEVEL_CONFIG[0].pixels} color={LEVEL_CONFIG[0].color} size={16} />}
             label="Novice AI"
             sublabel="Reached Level 1"
             right={<Check className="w-4 h-4 text-green-500" />}
           />
           <Divider />
           <Row
             leftNode={<PixelObject pixels={LEVEL_CONFIG[2].pixels} color={LEVEL_CONFIG[2].color} size={16} />}
             label="Advanced Logic"
             sublabel="Reach Level 3 to unlock"
             right={currentLevel.lv >= 3 ? <Check className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-[#48484a]" />}
           />
           <Divider />
           <Row
             leftNode={<PixelObject pixels={LEVEL_CONFIG[4].pixels} color={LEVEL_CONFIG[4].color} size={16} />}
             label="System Specialist"
             sublabel="Reach Level 5 to unlock"
             right={currentLevel.lv >= 5 ? <Check className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-[#48484a]" />}
           />
        </Section>

        {/* ── Inventory Section ── */}
        <Section title="Inventory (Cosmetics)">
           <div className="p-5 flex flex-col gap-6">
              
              {/* Category: Name Icons */}
              <div>
                 <p className="text-[13px] text-[#8e8e93] font-medium mb-3" style={{ fontFamily: SF }}>Name Icons</p>
                 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Item Equipado */}
                    <div className="w-[60px] h-[60px] rounded-[14px] bg-[#1a1a1c] border border-blue-500/50 flex flex-col items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)] relative">
                       <Sparkles className="w-6 h-6 text-blue-400" />
                       <div className="absolute -bottom-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#1a1a1c]">EQUIPPED</div>
                    </div>
                    {/* Item Bloqueado */}
                    <div className="w-[60px] h-[60px] rounded-[14px] bg-[#0a0a0b] border border-[#1c1c1e] flex flex-col items-center justify-center shrink-0 opacity-60">
                       <Hexagon className="w-6 h-6 text-[#48484a]" />
                    </div>
                    <div className="w-[60px] h-[60px] rounded-[14px] bg-[#0a0a0b] border border-[#1c1c1e] flex flex-col items-center justify-center shrink-0 opacity-60">
                       <Lock className="w-5 h-5 text-[#2c2c2e]" />
                    </div>
                 </div>
              </div>

              {/* Category: Icon Backgrounds */}
              <div>
                 <p className="text-[13px] text-[#8e8e93] font-medium mb-3" style={{ fontFamily: SF }}>Icon Backgrounds</p>
                 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Item Equipado */}
                    <div className="w-[60px] h-[60px] rounded-full bg-[#1a1a1c] border-2 border-blue-500/60 flex items-center justify-center shrink-0 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] relative">
                       <div className="w-8 h-8 rounded-full bg-[#2c2c2e]" />
                       <div className="absolute -bottom-1 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#1a1a1c] z-10">EQUIPPED</div>
                    </div>
                    {/* Items Desbloqueados / Bloqueados */}
                    <div className="w-[60px] h-[60px] rounded-full bg-[#0a0a0b] border-2 border-purple-500/40 flex items-center justify-center shrink-0">
                       <div className="w-8 h-8 rounded-full bg-[#1c1c1e]" />
                    </div>
                    <div className="w-[60px] h-[60px] rounded-full bg-[#0a0a0b] border border-[#1c1c1e] flex items-center justify-center shrink-0 opacity-50">
                       <Lock className="w-5 h-5 text-[#2c2c2e]" />
                    </div>
                 </div>
              </div>

           </div>
        </Section>

      </div>
    </div>
  )
}
