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
    // Añadimos tgid a los parámetros aceptados
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
    // Obtenemos el ID de Telegram para pasarlo a Adsgram
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null
    const userId = tg?.initDataUnsafe?.user?.id?.toString()

    adControllerRef.current = window.Adsgram?.init({ 
      blockId,
      tgid: userId // CRÍTICO: Esto conecta al usuario con el webhook
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

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

function formatX(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

const REWARDS = { INVITE: 1000, CHANNEL: 500, AD: 300, ADD_CHAT: 500, STORY: 500, SHARE: 250 }

function RewardBadge({ amount, className = "" }: { amount: number, className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-[#f59e0b] font-bold" style={{ fontFamily: SFD }}>+{formatX(amount)}</span>
      <img src="/xblum2-icon.png" alt="$X" className="w-3.5 h-3.5 object-contain pointer-events-none select-none" />
    </div>
  )
}

export function StoreView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any
  const { setCurrentView, referralLink, claimMissionTokens } = ctx

  // Datos de misiones completadas y anuncios vienen de la API (via /api/status)
  const completed: string[] = ctx.completed_missions ?? []
  const adsToday: number    = ctx.ads_today ?? 0

  const [pendingTasks, setPendingTasks] = useState<Record<string, "started" | "verifying">>({})
  const [loadingAd, setLoadingAd]       = useState(false)

  const ADSGRAM_BLOCK_ID = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID ?? ""
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // ── onAdReward: refresca estado después del ad ──
  const onAdReward = useCallback(async () => {
    setLoadingAd(true)

    // Esperamos ~1.5s para que el webhook S2S de Adsgram llegue al servidor primero
    await new Promise(r => setTimeout(r, 1500))

    // Refrescamos: actualiza ads_today (contador 0/3), x_points y todo el estado
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

  // Limpiar pending si la misión ya está completada
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
      if (adsToday >= 3 || loadingAd) {
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

  const getButtonUI = (id: string, isDone: boolean, defaultText = "Start") => {
    if (isDone) return { text: "Done", bg: "bg-transparent text-[#636366]", disabled: true }
    const status = pendingTasks[id]
    if (status === "verifying") return { text: <Loader2 className="w-4 h-4 animate-spin text-black" />, bg: "bg-white", disabled: true }
    if (status === "started")   return { text: "Check", bg: "bg-[#34c759] text-white", disabled: false }
    if (loadingAd && id === "ads") return { text: <Loader2 className="w-4 h-4 animate-spin text-black" />, bg: "bg-white", disabled: true }
    return { text: defaultText, bg: "bg-white text-black", disabled: false }
  }

  const GridCard = ({ id, title, reward, progress, max, isDone, emoji, actionType }: any) => {
    const btn = getButtonUI(id, isDone, id === "invite" ? "Invite" : "Watch")
    return (
      <div className="flex-1 bg-[#111] border border-[#1c1c1e] rounded-[24px] p-4 relative overflow-hidden flex flex-col h-[150px]">
        <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.12] select-none pointer-events-none grayscale">{emoji}</div>
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

  const ListItem = ({ id, title, reward, icon: Icon, isDone, actionType }: any) => {
    const btn = getButtonUI(id, isDone)
    return (
      <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-0 bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1c1c1e" }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{title}</p>
            <RewardBadge amount={reward} className="mt-0.5" />
          </div>
        </div>
        <button onClick={() => handleAction(id, actionType)} disabled={btn.disabled}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center min-w-[72px] ${btn.bg}`}
        >{btn.text}</button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      <div className="px-5 pb-2" style={{ paddingTop: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" }}>
        <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Earn</h1>
      </div>

      <div className="px-4 pt-2 pb-28 space-y-6">
        <button onClick={() => setCurrentView("premium")}
          className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left"
          style={{ background: "#060606", border: "1px solid #1e1e1e", borderRadius: "20px", minHeight: "96px" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)" }} />
          <div className="relative z-10 px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>xBlum Pro</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500" style={{ background: "rgba(245,158,11,0.15)", fontFamily: SF }}>PRO</span>
            </div>
            <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>Upgrade your plan to enjoy full features</p>
            <div className="flex items-center justify-center mt-2 px-4 py-3 rounded-xl w-full" style={{ background: "#fff" }}>
              <span className="text-black font-bold" style={{ fontSize: "14px", fontFamily: SF }}>Upgrade →</span>
            </div>
          </div>
        </button>

        <div className="flex gap-3">
          <GridCard id="ads" title="Watch Ads" reward={REWARDS.AD} progress={adsToday} max={3} isDone={adsToday >= 3} emoji="👀" actionType="ads" />
          <GridCard id="invite" title="Invite Friends" reward={REWARDS.INVITE} isDone={false} emoji="👥" actionType="invite" />
        </div>

        <div>
          <p className="px-2 mb-3 text-white font-bold text-lg" style={{ fontFamily: SFD }}>Tasks</p>
          <div className="rounded-[24px] overflow-hidden border border-[#1c1c1e]" style={{ background: "#111" }}>
            <ListItem id="channel"     title="Join xBlum Channel"    reward={REWARDS.CHANNEL}  icon={Tv}               isDone={completed.includes("channel")}     actionType="channel" />
            <ListItem id="addChat"     title="Add xBlum to Group"    reward={REWARDS.ADD_CHAT} icon={MessageCirclePlus} isDone={completed.includes("addChat")}     actionType="addChat" />
            <ListItem id="story"       title="Share to Story"         reward={REWARDS.STORY}   icon={Camera}            isDone={completed.includes("story")}       actionType="story" />
            <ListItem id="shareFriend" title="Share with 1 Friend"   reward={REWARDS.SHARE}   icon={Forward}           isDone={completed.includes("shareFriend")} actionType="shareFriend" />
          </div>
        </div>
      </div>
    </div>
  )
}
