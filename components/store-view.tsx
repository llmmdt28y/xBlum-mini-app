"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Tv, Users, MessageCirclePlus, Camera, Forward } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

function formatX(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

type MissionsState = {
  joinedChannel: boolean
  storyShared: boolean
  friendShared: boolean
  addChatCount: number
  adCount: number
  lastAdDate: string
}

const DEFAULT_STATE: MissionsState = {
  joinedChannel: false,
  storyShared: false,
  friendShared: false,
  addChatCount: 0,
  adCount: 0,
  lastAdDate: "",
}

const REWARDS = {
  INVITE: 1000,
  CHANNEL: 500,
  AD: 100,
  ADD_CHAT: 500,
  STORY: 500,
  SHARE: 250,
}

// ── Componente auxiliar para mostrar el balance con el icono oficial ──
function RewardBadge({ amount, className = "" }: { amount: number, className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-[#f59e0b] font-bold" style={{ fontFamily: SFD }}>+{formatX(amount)}</span>
      <img src="/xblum2-icon.png" alt="$X" className="w-3.5 h-3.5 object-contain pointer-events-none select-none" />
    </div>
  )
}

export function StoreView() {
  const { setCurrentView, isPremium, referralLink, claimMissionTokens } = useApp()
  const [state, setState] = useState<MissionsState>(DEFAULT_STATE)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const BOT = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL_USERNAME ?? "xBlumAI"

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("xblum-earn-state") || "{}")
      const today = new Date().toISOString().split('T')[0]
      const loadedState = { ...DEFAULT_STATE, ...stored }
      if (loadedState.lastAdDate !== today) {
        loadedState.adCount = 0
        loadedState.lastAdDate = today
      }
      setState(loadedState)
    } catch (e) { console.error(e) }
  }, [])

  const saveState = (newState: MissionsState) => {
    setState(newState)
    localStorage.setItem("xblum-earn-state", JSON.stringify(newState))
  }

  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  const handleAction = async (action: string) => {
    if (loadingAction) return
    setLoadingAction(action)
    try {
      if (action === "invite") {
        const shareText = "Try xBlum AI on Telegram — earn $X and chat for free!"
        const link = referralLink || `https://t.me/${BOT}?start=ref`
        tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`)
      } else if (action === "ads") {
        if (state.adCount >= 3) return
        await new Promise(res => setTimeout(res, 2000)) 
        saveState({ ...state, adCount: state.adCount + 1 })
        claimMissionTokens("ad", REWARDS.AD)
        tg?.showAlert(`+${REWARDS.AD} $X earned!`)
      } else if (action === "channel") {
        tg?.openTelegramLink(`https://t.me/${CHANNEL}`)
        await new Promise(res => setTimeout(res, 3000))
        saveState({ ...state, joinedChannel: true })
        claimMissionTokens("channel", REWARDS.CHANNEL)
      } else if (action === "addChat") {
        if (state.addChatCount >= 2) return
        tg?.openTelegramLink(`https://t.me/${BOT}?startgroup=true`)
        await new Promise(res => setTimeout(res, 2000))
        saveState({ ...state, addChatCount: state.addChatCount + 1 })
        claimMissionTokens("addChat", REWARDS.ADD_CHAT)
      } else if (action === "story") {
        if (tg?.shareToStory) {
          tg.shareToStory("https://xblum.vercel.app/story-bg.jpg", {
            text: "Join me on xBlum AI and earn $X! 🚀",
            widget_link: { url: `https://t.me/${BOT}`, name: "Open xBlum" }
          })
          await new Promise(res => setTimeout(res, 2000))
          saveState({ ...state, storyShared: true })
          claimMissionTokens("story", REWARDS.STORY)
        } else {
          tg?.showAlert("Stories not supported.")
        }
      } else if (action === "shareFriend") {
        const link = `https://t.me/${BOT}`
        tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Check out xBlum AI!`)
        await new Promise(res => setTimeout(res, 2000))
        saveState({ ...state, friendShared: true })
        claimMissionTokens("share", REWARDS.SHARE)
      }
    } catch (e) { console.error(e) } finally { setLoadingAction(null) }
  }

  const GridCard = ({ id, title, reward, progress, max, isDone, emoji }: any) => (
    <div className="flex-1 bg-[#111] border border-[#1c1c1e] rounded-[24px] p-4 relative overflow-hidden flex flex-col h-[150px]">
      <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.12] select-none pointer-events-none grayscale">{emoji}</div>
      <div className="relative z-10">
        <p className="text-white font-bold text-[15px] leading-tight" style={{ fontFamily: SFD }}>{title}</p>
        <RewardBadge amount={reward} className="mt-1" />
      </div>
      <div className="relative z-10 mt-auto flex items-center justify-between">
        <span className="text-[#636366] font-bold text-xs">{progress !== undefined ? `${progress}/${max}` : "∞"}</span>
        <button 
          onClick={() => handleAction(id)}
          disabled={isDone || loadingAction === id}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${isDone ? "bg-[#1c1c1e] text-[#636366]" : "bg-white text-black"}`}
        >
          {loadingAction === id ? "..." : isDone ? "Done" : "Start"}
        </button>
      </div>
    </div>
  )

  const ListItem = ({ id, title, reward, icon: Icon, isDone, isMulti, progress, max }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-0 bg-[#111]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1c1c1e" }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <RewardBadge amount={reward} />
            {isMulti && <span className="text-[#636366] text-xs font-medium">· {progress}/{max}</span>}
          </div>
        </div>
      </div>
      <button 
        onClick={() => handleAction(id)}
        disabled={isDone || loadingAction === id}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${isDone ? "bg-transparent text-[#636366]" : "bg-white text-black"}`}
      >
        {loadingAction === id ? "..." : isDone ? "Claimed" : "Start"}
      </button>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      <div className="sticky top-0 z-20 flex items-center justify-center px-4 pb-3" style={{ paddingTop: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}>
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD }}>Earn</h2>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">
        {!isPremium && (
          <button onClick={() => setCurrentView("premium")} className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left" style={{ background: "#060606", border: "1px solid #1e1e1e", borderRadius: "20px", minHeight: "96px" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)" }} />
            <div className="relative z-10 px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-[16px]">xBlum Pro</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500" style={{ background: "rgba(245,158,11,0.15)" }}>PRO</span>
              </div>
              <p style={{ fontSize: "13px", color: "#8e8e93" }}>Upgrade your plan to enjoy full features</p>
              <div className="flex items-center justify-center mt-2 px-4 py-3 rounded-xl w-full bg-white">
                <span className="text-black font-bold text-sm">Upgrade →</span>
              </div>
            </div>
          </button>
        )}

        <div className="flex gap-3">
          <GridCard id="ads" title="Watch Ads" reward={REWARDS.AD} progress={state.adCount} max={3} isDone={state.adCount >= 3} emoji="👀" />
          <GridCard id="invite" title="Invite Friends" reward={REWARDS.INVITE} isDone={false} emoji="👥" />
        </div>

        <div>
          <p className="px-2 mb-3 text-white font-bold text-lg" style={{ fontFamily: SFD }}>Tasks</p>
          <div className="rounded-[24px] overflow-hidden border border-[#1c1c1e]" style={{ background: "#111" }}>
            <ListItem id="channel" title="Join xBlum Channel" reward={REWARDS.CHANNEL} icon={Tv} isDone={state.joinedChannel} />
            <ListItem id="addChat" title="Add to Group" reward={REWARDS.ADD_CHAT} icon={MessageCirclePlus} isDone={state.addChatCount >= 2} isMulti={true} progress={state.addChatCount} max={2} />
            <ListItem id="story" title="Share to Story" reward={REWARDS.STORY} icon={Camera} isDone={state.storyShared} />
            <ListItem id="shareFriend" title="Share with 1 Friend" reward={REWARDS.SHARE} icon={Forward} isDone={state.friendShared} />
          </div>
        </div>
      </div>
    </div>
  )
}
