"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { Play, Send, UserPlus, ChevronRight, Loader2, Lock, Check, MessageSquare, Camera, CalendarCheck, Users, Sparkles, Store, Package } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Adsgram Types ─────────────────────────────────────────────────────
interface ShowPromiseResult {
  done: boolean
  description: string
  state: "load" | "render" | "playing" | "destroy"
  error: boolean
}
interface AdController {
  show: () => Promise<ShowPromiseResult>
  destroy: () => void
}
declare global {
  interface Window {
    Adsgram?: { init: (params: { blockId: string; debug?: boolean; tgid?: string }) => AdController }
  }
}

// ── useAdsgram hook ───────────────────────────────────────────────────
function useAdsgram({
  blockId,
  onReward,
  onError,
}: {
  blockId: string
  onReward: () => void
  onError: (r: ShowPromiseResult) => void
}) {
  const adControllerRef = useRef<AdController | undefined>(undefined)

  useEffect(() => {
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    const userId = tg?.initDataUnsafe?.user?.id?.toString()

    adControllerRef.current = window.Adsgram?.init({ 
      blockId,
      tgid: userId 
    })
    
    return () => {
      adControllerRef.current?.destroy()
    }
  }, [blockId])

  return useCallback(() => {
    if (!adControllerRef.current) {
      onError({ done: false, description: "Adsgram not loaded", state: "load", error: true })
      return
    }
    adControllerRef.current
      .show()
      .then((result: ShowPromiseResult) => {
        if (result.done) onReward()
        else onError(result)
      })
      .catch((result: ShowPromiseResult) => onError(result))
  }, [onReward, onError])
}

// ── Configuración de los 12 Niveles ──
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

// ── Prompts Dinámicos ──
const DYNAMIC_PROMPTS = [
  "¿Cómo está el clima hoy?",
  "¿Qué se celebra hoy?",
  "Cuéntame un dato curioso sobre la IA.",
  "¿Cuál es el precio actual del Bitcoin?",
  "Resúmeme las noticias tecnológicas de hoy.",
  "Dame una frase motivadora para empezar el día.",
  "Dime un chiste corto de programadores.",
  "¿Quién nació un día como hoy en la historia?",
  "¿Cuál es el santoral de hoy?",
  "Recomiéndame una película de ciencia ficción.",
  "¿Qué eventos mundiales importantes hay hoy?",
  "¿Cómo cerró el mercado de valores ayer?",
  "¿Qué hay de nuevo en el ecosistema TON hoy?",
  "Dame un consejo de salud para el trabajo remoto.",
  "¿Cuál es la palabra del día y su significado?"
]

// ── Componente Pixel Art ──
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

export function LevelsView() {
  const ctx = useApp() as any
  const { 
    x_points: currentBP, 
    ads_today: serverAdsToday, 
    completed_missions, 
    setCurrentView, 
    claimMissionTokens, 
    referralLink, 
    refreshUserData,
    openExploreTopic 
  } = ctx

  const completed = completed_missions || []
  const [localAdsToday, setLocalAdsToday] = useState(serverAdsToday || 0)
  const [pendingTasks, setPendingTasks] = useState<Record<string, "started" | "verifying">>({})
  const [loadingAd, setLoadingAd] = useState(false)
  const [showAllOneTime, setShowAllOneTime] = useState(false)

  // Seleccionar prompt dinámico según el día
  const dailyPrompt = useMemo(() => {
    const day = new Date().getDate()
    return DYNAMIC_PROMPTS[day % DYNAMIC_PROMPTS.length]
  }, [])

  // Sincronizar anuncios
  useEffect(() => {
    setLocalAdsToday((prev: number) => (serverAdsToday > prev ? serverAdsToday : prev))
  }, [serverAdsToday])

  // Limpiar pending tasks
  useEffect(() => {
    setPendingTasks(prev => {
      const next = { ...prev }
      for (const mid of completed) delete next[mid]
      return next
    })
  }, [completed])

  const currentLevel = [...LEVEL_CONFIG].reverse().find(l => currentBP >= l.bp) || LEVEL_CONFIG[0]
  const nextLevel = LEVEL_CONFIG[currentLevel.lv] || currentLevel
  const progressPercent = Math.min(100, (currentBP / nextLevel.bp) * 100)

  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // ── Adsgram Logic ──
  const ADSGRAM_BLOCK_ID = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID ?? ""
  const onAdReward = useCallback(async () => {
    setLoadingAd(true)
    setLocalAdsToday((prev: number) => prev + 1)
    await new Promise(r => setTimeout(r, 2000))
    if (refreshUserData) await refreshUserData()
    tg?.showAlert(`✅ +300 BP earned!`)
    setLoadingAd(false)
  }, [tg, refreshUserData])

  const onAdError = useCallback((result: ShowPromiseResult) => {
    setLoadingAd(false)
    if (result.error) tg?.showAlert("Ad not available right now. Try again later.")
  }, [tg])

  const showAd = useAdsgram({ blockId: ADSGRAM_BLOCK_ID, onReward: onAdReward, onError: onAdError })

  const BOT     = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL_USERNAME ?? "xBlumAI"

  const handleAction = async (id: string, actionType: string, reward: number, extraData?: any) => {
    if (actionType === "ads") {
      if (localAdsToday >= 3 || loadingAd) {
        tg?.showAlert("Daily ad limit reached (3/3). Come back tomorrow!")
        return
      }
      showAd()
      return
    }

    if (actionType === "chatAI") {
      if (extraData?.prompt) {
        await openExploreTopic(null, extraData.prompt)
      } else {
        setCurrentView("home")
      }
      return
    }

    if (actionType === "invite") {
      const link = referralLink || `https://t.me/${BOT}?start=ref`
      tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Join xBlum AI and earn BP! 🚀`)
      return
    }

    const taskStatus = pendingTasks[id]

    if (!taskStatus) {
      if (actionType === "channel") tg?.openTelegramLink(`https://t.me/${CHANNEL}`)
      if (actionType === "addChat") tg?.openTelegramLink(`https://t.me/${BOT}?startgroup=true`)
      if (actionType === "story") {
        if (tg?.shareToStory) {
          tg.shareToStory(`https://t.me/${BOT}`, { text: "Join me on xBlum AI!", widget_link: { url: `https://t.me/${BOT}`, name: "Open xBlum" }})
        } else {
          tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${BOT}`)}&text=Join xBlum AI 🚀`)
        }
      }
      setPendingTasks(prev => ({ ...prev, [id]: "started" }))
    } else if (taskStatus === "started") {
      setPendingTasks(prev => ({ ...prev, [id]: "verifying" }))
      const ok = await claimMissionTokens(actionType, reward)
      if (ok) {
        tg?.showAlert(`✅ +${reward} BP earned!`)
      } else {
        tg?.showAlert(actionType === "channel" ? "❌ You haven't joined the channel yet. Please join and try again." : "Already claimed or not ready.")
      }
      setPendingTasks(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  useEffect(() => {
    if (tg?.BackButton) {
      tg.BackButton.show()
      const handleBack = () => setCurrentView("home")
      tg.BackButton.onClick(handleBack)
      return () => {
        tg.BackButton.offClick(handleBack)
        tg.BackButton.hide()
      }
    }
  }, [setCurrentView, tg])

  return (
    <div className="flex-1 bg-[#060606] min-h-[var(--tg-viewport-stable-height,100dvh)] relative overflow-x-hidden pb-32 select-none animate-in fade-in duration-500">
      
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      {/* Header Título */}
      <div className="sticky top-0 z-30 flex items-center justify-center w-full bg-black/80  border-b border-white/5"
           style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: SFD }}>Level {currentLevel.lv}</h2>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center mt-8 mb-10 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-[40px] opacity-20 rounded-full" style={{ background: currentLevel.color }} />
          <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} />
        </div>
        <h1 className="text-[36px] font-bold text-white tracking-tight mb-2" style={{ fontFamily: SFD }}>
          Level {currentLevel.lv}
        </h1>
        <p className="text-[12px] font-bold text-[#8e8e93] tracking-[0.2em] uppercase" style={{ fontFamily: SF }}>
          {currentLevel.name}
        </p>
      </div>

      {/* Tarjeta Progreso */}
      <div className="px-5 mb-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <div className="bg-[#141415] rounded-[22px] p-5 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={18} />
              <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level {currentLevel.lv}</span>
            </div>
            <span className="text-[14px] font-bold text-[#d1d1d6]" style={{ fontFamily: SF }}>
              {currentBP.toLocaleString()}/{nextLevel.bp.toLocaleString()} BP
            </span>
          </div>
          <div className="flex items-center justify-between w-full mb-4 gap-[4px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`h-[5px] flex-1 rounded-[1px] transition-all duration-700 ${i < (progressPercent / 100 * 24) ? 'bg-white' : 'bg-[#262626]'}`} />
            ))}
          </div>
          <p className="text-[13px] text-[#8e8e93] leading-relaxed" style={{ fontFamily: SF }}>
            You are currently at {currentLevel.name} rank. Accumulate more BP to evolve your AI core and unlock exclusive rewards.
          </p>
        </div>
      </div>

      {/* ── Banner: Acceso al Shop ── */}
      <div className="px-5 mb-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
         <button 
            onClick={() => setCurrentView("shop")}
            className="w-full relative overflow-hidden bg-[#111] border border-[#262626] rounded-[20px] p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-lg"
         >
            {/* Brillo de fondo */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle at 10% 50%, rgba(168,85,247,0.5), transparent 70%)" }} />
            
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <Package className="w-6 h-6 text-purple-400" />
               </div>
               <div className="text-left">
                  <p className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD }}>Marketplace & Drops</p>
                  <p className="text-[#8e8e93] text-[13px] mt-0.5" style={{ fontFamily: SF }}>Spend BP on exclusive cosmetics</p>
               </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 relative z-10">
               <ChevronRight className="w-4 h-4 text-white/50" />
            </div>
         </button>
      </div>

      {/* ── ONE-TIME / AI TASKS ── */}
      <div className="relative z-10 px-5 w-full flex flex-col mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-[18px] font-bold text-white" style={{ fontFamily: SFD }}>Tasks</h3>
          <button 
            onClick={() => setShowAllOneTime(!showAllOneTime)}
            className="text-[13px] font-bold text-blue-400 active:opacity-60 transition-all"
            style={{ fontFamily: SF }}
          >
            {showAllOneTime ? "Show Less" : "View All"}
          </button>
        </div>

        <MissionTimelineCard 
          id="dailyAI"
          title="Ask AI Today" 
          reward={300} 
          desc={dailyPrompt}
          icon={<Sparkles size={18} />}
          isDone={false} // Dynamic prompt siempre disponible para interactuar
          onClick={() => handleAction("dailyAI", "chatAI", 300, { prompt: dailyPrompt })}
        />

        <MissionTimelineCard 
          id="chatAI"
          title="Talk to xBlum AI" 
          reward={500} 
          desc="Send your first message to the AI and start exploring."
          icon={<MessageSquare size={18} />}
          isDone={completed.includes("chatAI")}
          status={pendingTasks["chatAI"]}
          onClick={() => handleAction("chatAI", "chatAI", 500)}
        />

        <MissionTimelineCard 
          id="channel"
          title="Join xBlum Channel" 
          reward={1000} 
          desc="Stay updated with the latest AI news and feature drops."
          icon={<Send size={18} />}
          isDone={completed.includes("channel")}
          status={pendingTasks["channel"]}
          onClick={() => handleAction("channel", "channel", 1000)}
        />

        {/* Tareas ocultas bajo View All */}
        {showAllOneTime && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-400">
            <MissionTimelineCard 
              id="addChat"
              title="Add xBlum to Group" 
              reward={1500} 
              desc="Bring the power of xBlum AI to your community chat."
              icon={<Users size={18} />}
              isDone={completed.includes("addChat")}
              status={pendingTasks["addChat"]}
              isLocked={!completed.includes("channel")}
              onClick={() => handleAction("addChat", "addChat", 1500)}
            />

            <MissionTimelineCard 
              id="story"
              title="Share to Story" 
              reward={500} 
              desc="Let your Telegram contacts know about xBlum AI."
              icon={<Camera size={18} />}
              isDone={completed.includes("story")}
              status={pendingTasks["story"]}
              onClick={() => handleAction("story", "story", 500)}
              isLast={true}
            />
          </div>
        )}
      </div>

      <div className="w-full border-t border-dashed border-[#262626] mb-8" />

      {/* ── DAILY MISSIONS ── */}
      <div className="relative z-10 px-5 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <h3 className="text-[18px] font-bold text-white mb-6 px-1" style={{ fontFamily: SFD }}>Daily Missions</h3>

        <MissionTimelineCard 
          id="dailyCheck"
          title="Daily Check-in" 
          reward={200} 
          desc="Open the app today and claim your free daily BP."
          icon={<CalendarCheck size={18} />}
          isDone={completed.includes("dailyCheck")}
          status={pendingTasks["dailyCheck"]}
          onClick={() => handleAction("dailyCheck", "dailyCheck", 200)}
        />

        <MissionTimelineCard 
          id="ads"
          title="Watch Ads" 
          reward={300} 
          desc="Support the project by watching short daily ads."
          progress={`${localAdsToday}/3`} 
          icon={<Play size={18} fill={localAdsToday >= 3 ? "none" : "currentColor"} />}
          isDone={localAdsToday >= 3}
          status={loadingAd ? "verifying" : undefined}
          onClick={() => handleAction("ads", "ads", 300)}
        />

        <MissionTimelineCard 
          id="invite"
          title="Invite 1 Friend" 
          reward={1000} 
          desc="Invite a friend to the xBlum ecosystem."
          icon={<UserPlus size={18} />}
          isDone={false}
          status={pendingTasks["invite"]}
          onClick={() => handleAction("invite", "invite", 1000)}
          isLast={true}
        />
      </div>
    </div>
  )
}

function MissionTimelineCard({ id, title, reward, desc, progress, icon, onClick, status, isDone, isLocked, isLast }: any) {
  const loading = status === "verifying"
  const started = status === "started"

  let buttonUI = { text: "Start", bg: "bg-[#262626] text-white", icon: <ChevronRight size={14} /> }
  
  if (isLocked) {
    buttonUI = { text: "Locked", bg: "bg-transparent text-[#636366]", icon: <Lock size={12} /> }
  } else if (isDone) {
    buttonUI = { text: "Done", bg: "bg-transparent text-[#636366]", icon: <Check size={14} /> }
  } else if (loading) {
    buttonUI = { text: "Checking", bg: "bg-[#262626] text-white", icon: <Loader2 size={14} className="animate-spin" /> }
  } else if (started) {
    buttonUI = { text: "Check", bg: "bg-white text-black", icon: <Check size={14} /> }
  } else if (id === "chatAI" || id === "invite" || id === "ads" || id === "dailyAI") {
    buttonUI = { text: "Go", bg: "bg-white text-black", icon: <ChevronRight size={14} /> }
  }

  const opacityClass = isLocked || isDone ? "opacity-50" : "opacity-100"

  return (
    <div className={`flex w-full ${opacityClass} transition-all duration-500`}>
      <div className="w-[28px] flex-shrink-0 flex justify-center relative">
         {!isLast && <div className="absolute top-[28px] bottom-[-24px] w-[2px] bg-[#262626]" />}
         <div className={`absolute top-[28px] w-[7px] h-[7px] rounded-full z-10 transition-colors shadow-[0_0_8px_rgba(255,255,255,0.1)] 
            ${isDone ? 'bg-green-500 shadow-green-500/30' : isLocked ? 'bg-[#262626]' : 'bg-[#e8a8c1]'}`} 
         />
      </div>

      <button 
        onClick={onClick} 
        disabled={loading || isDone || isLocked} 
        className="flex-1 bg-[#141415] rounded-[22px] p-5 mb-5 text-left active:scale-[0.98] transition-all hover:bg-[#1c1c1e]/50"
      >
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
               <div className={`opacity-90 ${isDone ? 'text-green-500' : isLocked ? 'text-[#636366]' : 'text-white'}`}>
                  {isLocked ? <Lock size={18} /> : icon}
               </div>
               <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>{title}</span>
            </div>
            <span className="text-[13px] font-bold" style={{ fontFamily: SF, color: isDone ? '#636366' : '#ffffff' }}>
               +{reward} BP
            </span>
         </div>

         <p className="text-[13px] text-[#8e8e93] leading-[1.4] mb-4" style={{ fontFamily: SF }}>
           {isLocked ? "Complete previous missions to unlock this task." : desc}
         </p>

         <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-[#636366] uppercase tracking-wider" style={{ fontFamily: SF }}>
               {progress || (isDone ? "Completed" : isLocked ? "Locked" : "Pending")}
            </span>
            
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${buttonUI.bg} transition-all`}>
               <span className="text-[11px] font-bold uppercase tracking-wide" style={{ fontFamily: SFD }}>{buttonUI.text}</span>
               {buttonUI.icon}
            </div>
         </div>
      </button>
    </div>
  )
}
