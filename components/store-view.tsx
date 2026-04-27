"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback, useRef } from "react"
import { Tv, MessageCirclePlus, Camera, Forward, Loader2 } from "lucide-react"

// ── Adsgram types ─────────────────────────────────────────────────────
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

function formatX(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

const REWARDS = { INVITE: 1000, CHANNEL: 500, AD: 300, ADD_CHAT: 500, STORY: 500, SHARE: 250 }

function RewardBadge({ amount, className = "" }: { amount: number, className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Hacemos el texto un poco más vibrante */}
      <span className="text-[#fbbf24] font-bold tracking-tight text-[15px]" style={{ fontFamily: SFD, textShadow: "0 2px 8px rgba(245,158,11,0.2)" }}>
        +{formatX(amount)}
      </span>
      <img src="/xblum2-icon.png" alt="$X" className="w-3.5 h-3.5 object-contain pointer-events-none select-none drop-shadow-md" />
    </div>
  )
}

export function StoreView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any
  const { setCurrentView, referralLink, claimMissionTokens } = ctx

  const completed: string[] = ctx.completed_missions ?? []
  
  // 🔴 SOLUCIÓN CONTADOR ANUNCIOS: Estado local optimista
  const serverAdsToday: number = ctx.ads_today ?? 0
  const [localAdsToday, setLocalAdsToday] = useState(serverAdsToday)

  useEffect(() => {
    // Sincronizar si el servidor manda un valor nuevo
    setLocalAdsToday(serverAdsToday)
  }, [serverAdsToday])

  const [pendingTasks, setPendingTasks] = useState<Record<string, "started" | "verifying">>({})
  const [loadingAd, setLoadingAd]       = useState(false)

  const ADSGRAM_BLOCK_ID = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID ?? ""
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // ── onAdReward: refresca estado después del ad ──
  const onAdReward = useCallback(async () => {
    setLoadingAd(true)
    
    // Sumamos +1 instantáneamente para que el usuario vea el cambio ya
    setLocalAdsToday(prev => prev + 1)

    // Esperamos ~1.5s para que el webhook S2S de Adsgram llegue al servidor primero
    await new Promise(r => setTimeout(r, 1500))

    // Refrescamos en segundo plano
    if (ctx.refreshUserData) await ctx.refreshUserData()

    tg?.showAlert(`✅ +${REWARDS.AD} $X earned!`)
    setLoadingAd(false)
  }, [tg, ctx])

  const onAdError = useCallback((result: ShowPromiseResult) => {
    setLoadingAd(false)
    if (result.error) {
      tg?.showAlert("Ad not available right now. Try again later.")
    }
  }, [tg])

  const showAd = useAdsgram({
    blockId: ADSGRAM_BLOCK_ID,
    onReward: onAdReward,
    onError:  onAdError,
  })

  const BOT     = process.env.NEXT_PUBLIC_BOT_USERNAME    ?? "xBlumAI"
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL_USERNAME ?? "xBlumAI"

  useEffect(() => {
    setPendingTasks(prev => {
      const next = { ...prev }
      for (const mid of completed) delete next[mid]
      return next
    })
  }, [completed])

  const handleAction = async (
    id: string,
    actionType: "invite" | "ads" | "channel" | "addChat" | "story" | "shareFriend"
  ) => {

    if (actionType === "invite") {
      const shareText = "Try xBlum AI on Telegram — earn $X and chat for free!"
      const link = referralLink || `https://t.me/${BOT}?start=ref`
      tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`)
      return
    }

    if (actionType === "ads") {
      if (localAdsToday >= 3 || loadingAd) {
        tg?.showAlert("Daily ad limit reached (3/3). Come back tomorrow!")
        return
      }
      showAd()
      return
    }

    const taskStatus = pendingTasks[id]

    if (!taskStatus) {
      if (actionType === "channel")     tg?.openTelegramLink(`https://t.me/${CHANNEL}`)
      if (actionType === "addChat")     tg?.openTelegramLink(`https://t.me/${BOT}?startgroup=true`)
      if (actionType === "shareFriend") {
        tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${BOT}`)}&text=Check out xBlum AI! 🚀`)
      }
      if (actionType === "story") {
        if (tg?.shareToStory) {
          tg.shareToStory(`https://t.me/${BOT}`, {
            text: "Join me on xBlum AI and earn $X! 🚀",
            widget_link: { url: `https://t.me/${BOT}`, name: "Open xBlum" }
          })
        } else {
          tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${BOT}`)}&text=Join xBlum AI 🚀`)
        }
      }
      setPendingTasks(prev => ({ ...prev, [id]: "started" }))

    } else if (taskStatus === "started") {
      setPendingTasks(prev => ({ ...prev, [id]: "verifying" }))

      const rewardMap: Record<string, number> = {
        channel: REWARDS.CHANNEL, addChat: REWARDS.ADD_CHAT,
        story: REWARDS.STORY,     shareFriend: REWARDS.SHARE,
      }

      const ok = await claimMissionTokens(actionType, rewardMap[actionType] ?? 0)
      if (ok) {
        tg?.showAlert(`✅ +${formatX(rewardMap[actionType] ?? 0)} $X earned!`)
      } else {
        if (actionType === "channel") {
          tg?.showAlert("❌ You haven't joined the channel yet. Please join and try again.")
        } else {
          tg?.showAlert("Already claimed or limit reached.")
        }
      }
      setPendingTasks(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  // 🔴 SOLUCIÓN JERARQUÍA: Botones secundarios menos llamativos
  const getButtonUI = (id: string, isDone: boolean, defaultText = "Start") => {
    if (isDone) return { text: "Done", bg: "bg-transparent text-[#636366]", disabled: true }
    const status = pendingTasks[id]
    if (status === "verifying") return { text: <Loader2 className="w-4 h-4 animate-spin text-white" />, bg: "bg-[#2c2c2e]", disabled: true }
    if (status === "started")   return { text: "Check", bg: "bg-[#34c759] text-white", disabled: false }
    if (loadingAd && id === "ads") return { text: <Loader2 className="w-4 h-4 animate-spin text-white" />, bg: "bg-[#2c2c2e]", disabled: true }
    
    // Aquí cambiamos el "bg-white text-black" por uno sutil para acciones secundarias
    return { text: defaultText, bg: "bg-white/10 text-white hover:bg-white/15", disabled: false }
  }

  const GridCard = ({ id, title, reward, progress, max, isDone, emoji, actionType }: any) => {
    const btn = getButtonUI(id, isDone, id === "invite" ? "Invite" : "Watch")
    return (
      <div className="flex-1 bg-[#111] border border-[#1c1c1e] rounded-[24px] p-4 relative overflow-hidden flex flex-col h-[150px]">
        {/* Marca de agua / Emoji en la esquina mejorado */}
        <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.08] select-none pointer-events-none grayscale">{emoji}</div>
        
        <div className="relative z-10">
          <p className="text-white font-bold text-[15px] leading-tight" style={{ fontFamily: SFD }}>{title}</p>
          <RewardBadge amount={reward} className="mt-1" />
        </div>
        <div className="relative z-10 mt-auto flex items-center justify-between">
          <span className="text-[#636366] font-bold text-xs">{progress !== undefined ? `${progress}/${max}` : "∞"}</span>
          <button onClick={() => handleAction(id, actionType)} disabled={btn.disabled}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center min-w-[64px] ${isDone ? "bg-[#1c1c1e] text-[#636366]" : btn.bg}`}
          >{isDone && id !== "invite" ? "Done" : btn.text}</button>
        </div>
      </div>
    )
  }

  // 🔴 SOLUCIÓN ÍCONOS: Darles el pop de color a cada ícono según su tarea
  const ListItem = ({ id, title, reward, icon: Icon, isDone, actionType }: any) => {
    const btn = getButtonUI(id, isDone)
    
    // Mapeo de colores sutiles por ID para darle vida sin salir del dark mode
    const getIconColors = () => {
      switch(id) {
        case 'channel': return 'bg-blue-500/15 text-blue-400'
        case 'addChat': return 'bg-green-500/15 text-green-400'
        case 'story': return 'bg-purple-500/15 text-purple-400'
        case 'shareFriend': return 'bg-pink-500/15 text-pink-400'
        default: return 'bg-[#1c1c1e] text-white'
      }
    }
    const colors = getIconColors()

    return (
      <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-0 bg-[#111]">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors.split(' ')[0]}`}>
            <Icon className={`w-5 h-5 ${colors.split(' ')[1]}`} />
          </div>
          <div>
            <p className="text-white font-medium text-[15px] leading-tight" style={{ fontFamily: SF }}>{title}</p>
            <RewardBadge amount={reward} className="mt-0.5" />
          </div>
        </div>
        <button onClick={() => handleAction(id, actionType)} disabled={btn.disabled}
          className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all active:scale-95 flex items-center justify-center min-w-[72px] ${btn.bg}`}
          style={{ fontFamily: SF }}
        >{btn.text}</button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      {/* 🔴 ANIMACIÓN 1: Título */}
      <div className="px-5 pb-2 animate-in fade-in duration-500" style={{ paddingTop: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <h1 className="text-[34px] font-bold text-white tracking-tight" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>Earn</h1>
      </div>

      <div className="px-4 pt-2 pb-28 space-y-6">
        
        {/* 🔴 ANIMACIÓN 2: Pro Card mejorada */}
        <button onClick={() => setCurrentView("premium")}
          className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both"
          style={{ 
            background: "#060606", 
            border: "1px solid rgba(245,158,11,0.2)", // Borde más premium
            borderRadius: "20px", 
            minHeight: "96px",
            boxShadow: "0 4px 24px rgba(245,158,11,0.05)" // Glow exterior sutil
          }}
        >
          {/* Degradado interior más notorio */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 10% 30%, rgba(245,158,11,0.12) 0%, transparent 60%)" }} />
          <div className="relative z-10 px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-[17px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>xBlum Pro</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500" style={{ background: "rgba(245,158,11,0.15)", fontFamily: SF }}>PRO</span>
            </div>
            <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>Upgrade your plan to enjoy full features</p>
            
            {/* Botón Upgrade sí se queda en blanco (Acción Primaria) */}
            <div className="flex items-center justify-center mt-2 px-4 py-3 rounded-[14px] w-full" style={{ background: "#fff" }}>
              <span className="text-black font-bold" style={{ fontSize: "14px", fontFamily: SF }}>Upgrade →</span>
            </div>
          </div>
        </button>

        {/* 🔴 ANIMACIÓN 3: Tarjetas Grid */}
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          {/* Se usa localAdsToday para que se actualice la vista sin refrescar */}
          <GridCard id="ads" title="Watch Ads" reward={REWARDS.AD} progress={localAdsToday} max={3} isDone={localAdsToday >= 3} emoji="👀" actionType="ads" />
          <GridCard id="invite" title="Invite Friends" reward={REWARDS.INVITE} isDone={false} emoji="👥" actionType="invite" />
        </div>

        {/* 🔴 ANIMACIÓN 4: Lista de Tareas */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <p className="px-2 mb-3 text-white font-bold text-[18px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Tasks</p>
          <div className="rounded-[24px] overflow-hidden border border-[#1c1c1e]" style={{ background: "#111" }}>
            <ListItem id="channel"     title="Join xBlum Channel"    reward={REWARDS.CHANNEL}  icon={Tv}               isDone={completed.includes("channel")}     actionType="channel" />
            <ListItem id="addChat"     title="Add xBlum to Group"    reward={REWARDS.ADD_CHAT} icon={MessageCirclePlus} isDone={completed.includes("addChat")}     actionType="addChat" />
            <ListItem id="story"       title="Share to Story"         reward={REWARDS.STORY}   icon={Camera}           isDone={completed.includes("story")}       actionType="story" />
            <ListItem id="shareFriend" title="Share with 1 Friend"   reward={REWARDS.SHARE}   icon={Forward}           isDone={completed.includes("shareFriend")} actionType="shareFriend" />
          </div>
        </div>
      </div>
    </div>
  )
}
