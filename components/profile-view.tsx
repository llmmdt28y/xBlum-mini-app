"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { ChevronRight, Gift, Users, Shield, Zap, Trophy, Medal, Settings } from "lucide-react"

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

// ── Leaderboard data types ───────────────────────────────────────────
type LeaderboardPeriod = "this_week" | "last_week" | "all_time"
type LeaderboardEntry = {
  rank: number
  username: string
  tp: number 
  initials: string
  avatarColor: string
}

const MOCK_LEADERBOARD: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  this_week: [
    { rank: 1, username: "vertetigr",       tp: 118079, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 2, username: "some_dogs",        tp:  55438, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 3, username: "XHamsterx",        tp:  36400, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 4, username: "Anvar1982n",        tp:  33300, initials: "AN", avatarColor: "#10b981" },
    { rank: 5, username: "Tuvanta",          tp:  33000, initials: "TU", avatarColor: "#ec4899" },
    { rank: 6, username: "Shdioawhxueigo",   tp:  30750, initials: "SH", avatarColor: "#6366f1" },
    { rank: 7, username: "jstgcalchara",     tp:  28400, initials: "JG", avatarColor: "#14b8a6" },
    { rank: 8, username: "cryptowolf99",     tp:  24200, initials: "CW", avatarColor: "#f97316" },
    { rank: 9, username: "moon_tradr",       tp:  21100, initials: "MT", avatarColor: "#a855f7" },
    { rank: 10, username: "blainkz",         tp:  18900, initials: "BK", avatarColor: "#22c55e" },
  ],
  last_week: [
    { rank: 1, username: "cryptowolf99",     tp: 204310, initials: "CW", avatarColor: "#f97316" },
    { rank: 2, username: "vertetigr",        tp: 189022, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 3, username: "blainkz",          tp: 142700, initials: "BK", avatarColor: "#22c55e" },
    { rank: 4, username: "moon_tradr",       tp:  98400, initials: "MT", avatarColor: "#a855f7" },
    { rank: 5, username: "XHamsterx",        tp:  87200, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 6, username: "some_dogs",        tp:  74500, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 7, username: "Tuvanta",          tp:  61300, initials: "TU", avatarColor: "#ec4899" },
    { rank: 8, username: "Anvar1982n",        tp:  55100, initials: "AN", avatarColor: "#10b981" },
    { rank: 9, username: "jstgcalchara",     tp:  42000, initials: "JG", avatarColor: "#14b8a6" },
    { rank: 10, username: "niko_blm",        tp:  38750, initials: "NB", avatarColor: "#6366f1" },
  ],
  all_time: [
    { rank: 1, username: "cryptowolf99",     tp: 1204310, initials: "CW", avatarColor: "#f97316" },
    { rank: 2, username: "vertetigr",        tp:  998022, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 3, username: "some_dogs",        tp:  874500, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 4, username: "XHamsterx",        tp:  720400, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 5, username: "blainkz",          tp:  642700, initials: "BK", avatarColor: "#22c55e" },
    { rank: 6, username: "Anvar1982n",        tp:  598100, initials: "AN", avatarColor: "#10b981" },
    { rank: 7, username: "moon_tradr",       tp:  541200, initials: "MT", avatarColor: "#a855f7" },
    { rank: 8, username: "Tuvanta",          tp:  488900, initials: "TU", avatarColor: "#ec4899" },
    { rank: 9, username: "niko_blm",         tp:  412000, initials: "NB", avatarColor: "#6366f1" },
    { rank: 10, username: "jstgcalchara",    tp:  398750, initials: "JG", avatarColor: "#14b8a6" },
  ],
}

function formatX(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Leaderboard sub-view ─────────────────────────────────────────────
function LeaderboardView({ currentUser }: { currentUser: string }) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("this_week")
  const entries = MOCK_LEADERBOARD[period]
  const myEntry = entries.find(e => e.username.toLowerCase() === currentUser.replace("@","").toLowerCase())

  const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
    this_week: "This week",
    last_week: "Last week",
    all_time:  "All time",
  }

  return (
    // Contenedor principal con overflow-hidden para aislar el scroll
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* Header Leaderboard - Completamente estático */}
      <div
        className="shrink-0 z-10 flex items-center justify-center px-4 pb-3"
        style={{
          paddingTop: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)", 
          background: "#000", // Fondo negro sólido
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h2
          className="font-semibold text-white text-base"
          style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}
        >
          Leaderboard
        </h2>
      </div>

      {/* Contenedor escroleable independiente */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-32">

        {/* Subtitle */}
        <p className="text-sm mb-5 leading-relaxed" style={{ color: "#636366", fontFamily: SF }}>
          Earn $X and get in the Top of Weekly Leaderboard.{" "}
          Results every Sunday at <span className="text-white font-medium">00:00 UTC</span>.
        </p>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <Trophy className="w-4 h-4 shrink-0" style={{ color: "#f59e0b" }} />
          <p className="text-xs font-medium" style={{ color: "#f59e0b", fontFamily: SF }}>
            Top 3 winners receive xBlum Pro for one week
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: "#111" }}>
          {(["this_week", "last_week", "all_time"] as LeaderboardPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: period === p ? "#fff" : "transparent",
                color: period === p ? "#000" : "#636366",
                fontFamily: SF,
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* My position */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
          style={{ background: "#111" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {(currentUser || "ME").replace("@","").slice(0,2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm" style={{ fontFamily: SF }}>
              {currentUser || "Nickjjjj"}
            </p>
            <p className="text-xs" style={{ color: "#636366" }}>
              {myEntry ? `${formatX(myEntry.tp)} $X` : "0 $X"}
            </p>
          </div>
          {myEntry ? (
            <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>#{myEntry.rank}</span>
          ) : (
            <button
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: "#3b82f6", color: "#fff", fontFamily: SF }}
            >
              Start →
            </button>
          )}
        </div>

        {/* Podium — top 3 */}
        <div className="flex items-end justify-center gap-2 mb-4 px-2" style={{ height: "135px" }}>
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            if (!entry) return null
            const isFirst = entry.rank === 1
            const medals = ["🥈", "🥇", "🥉"]
            const heights = [56, 76, 42]
            return (
              <div key={entry.rank} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  style={{
                    width: isFirst ? 44 : 36,
                    height: isFirst ? 44 : 36,
                    background: entry.avatarColor,
                    boxShadow: isFirst ? `0 0 0 2px #f59e0b` : "none",
                    fontSize: isFirst ? "15px" : "13px",
                  }}
                >
                  {entry.initials}
                </div>
                <p
                  className="text-xs font-medium truncate w-full text-center"
                  style={{ color: isFirst ? "#fff" : "#8e8e93", fontFamily: SF, marginBottom: "-2px" }}
                >
                  {entry.username}
                </p>
                <p 
                  className="text-[10px] font-semibold truncate w-full text-center"
                  style={{ color: isFirst ? "#f59e0b" : "#636366", fontFamily: SFD }}
                >
                  {formatX(entry.tp)} $X
                </p>
                <div
                  className="w-full rounded-t-xl flex items-center justify-center"
                  style={{ background: "#111", height: `${heights[i]}px` }}
                >
                  <span style={{ fontSize: isFirst ? "22px" : "17px" }}>{medals[i]}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ranks 4–10 */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111" }}>
          {entries.slice(3).map((entry, i) => (
            <div key={entry.rank}>
              {i > 0 && <div className="h-px" style={{ background: "#1c1c1e", marginLeft: "60px" }} />}
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                  style={{ background: entry.avatarColor }}
                >
                  {entry.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate" style={{ fontFamily: SF }}>
                    {entry.username}
                  </p>
                  <p className="text-xs" style={{ color: "#636366" }}>{formatX(entry.tp)} $X</p>
                </div>
                <span className="text-sm font-semibold shrink-0" style={{ color: "#3a3a3c" }}>
                  #{entry.rank}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "#3a3a3c", fontFamily: SF }}>
          Resets every Sunday at 00:00 UTC
        </p>
      </div>
    </div>
  )
}

// ── Minimal row ───────────────────────────────────────────────────────
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
      className="w-full flex items-center gap-4 px-5 active:opacity-50 transition-opacity"
      style={{ paddingTop: "13px", paddingBottom: "13px" }}
    >
      {leftNode && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
          {leftNode}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-white" style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
            {sublabel}
          </p>
        )}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#3a3a3c" }} />}
    </button>
  )
}

function Divider() {
  return <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "20px" }} />
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && (
        <p
          className="px-1 mb-2"
          style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}
        >
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111" }}>
        {children}
      </div>
    </div>
  )
}

// ── Leaderboard Banner ──────────────────────────────────────────────
function LeaderboardBanner({ onLeaderboard }: { onLeaderboard: () => void }) {
  return (
    <button
      onClick={onLeaderboard}
      className="w-full flex items-center justify-between rounded-2xl px-5 py-4 active:opacity-70 transition-opacity"
      style={{ background: "#111", border: "1px solid #1c1c1e" }}
    >
      <div className="text-left flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <p className="text-white font-bold" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
            Weekly Leaderboard
          </p>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#fff" }} />
        </div>
        <p style={{ fontSize: "13px", color: "#636366", fontFamily: SF }}>
          Earn $X and get to the Top!
        </p>
      </div>
      
      <div className="text-4xl" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}>
        🏆
      </div>
    </button>
  )
}

// ── Main ProfileView ──────────────────────────────────────────────────
export function ProfileView() {
  const { setCurrentView, isPremium, referralCount } = useApp()

  const [photoUrl,        setPhotoUrl]        = useState<string | null>(null)
  const [displayName,     setDisplayName]     = useState("")
  const [username,        setUsername]        = useState("")
  const [showLeaderboard, setShowLeaderboard] = useState(false)

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
      if (showLeaderboard) {
        setShowLeaderboard(false)
      } else {
        setCurrentView("home")
        tg.BackButton.hide()
      }
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
  }, [setCurrentView, showLeaderboard])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  if (showLeaderboard) {
    return (
      <LeaderboardView
        currentUser={username || displayName}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>

      {/* Header Profile - Solucionado con función max() para Android */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3"
        style={{
          paddingTop: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 12px)", 
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <h2
          className="font-semibold text-white"
          style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}
        >
          Profile
        </h2>
      </div>

      <div className="px-4 pt-6 pb-28 space-y-6 relative">
        
        {/* Ícono de Configuración */}
        <button 
          onClick={() => setCurrentView("settings")}
          className="absolute right-6 top-0 active:opacity-60 transition-opacity z-20"
          style={{ marginTop: "10px" }} 
        >
          <Settings className="w-[22px] h-[22px] text-white/80" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-2">
          <div
            className="flex items-center justify-center overflow-hidden rounded-full"
            style={{ width: 82, height: 82, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: "28px", letterSpacing: "-0.02em", fontFamily: SFD }}>
                {initials || "?"}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="text-white font-semibold" style={{ fontSize: "18px", letterSpacing: "-0.02em", fontFamily: SFD }}>
              {displayName || "Your Name"}
            </p>
            {username && (
              <p className="mt-0.5" style={{ fontSize: "13px", color: "#48484a", fontFamily: SF }}>
                {username}
              </p>
            )}
          </div>
        </div>

        {/* Banner */}
        <LeaderboardBanner onLeaderboard={() => setShowLeaderboard(true)} />

        {/* Rewards */}
        <Section title="Rewards">
          <Row
            leftNode={
              <img
                src="/xblum2-icon.png"
                alt="$X Rewards"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
                onError={(e) => { e.currentTarget.style.display = "none"; const p = e.currentTarget.parentElement; if (p) p.textContent = "🚀" }}
              />
            }
            label="$X Rewards"
            sublabel="Earn tokens & exclusive perks"
            onClick={() => setCurrentView("x-rewards")}
          />
        </Section>

        {/* Social */}
        <Section title="Social">
          <Row
            leftNode={<Users className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label="Referral Program"
            sublabel={referralCount > 0 ? `${referralCount} friends invited` : "Invite friends & earn tokens"}
            onClick={() => setCurrentView("referral")}
          />
          <Divider />
          <Row
            leftNode={<Medal className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label="Top Holders"
            sublabel="See the leaderboard"
            onClick={() => setShowLeaderboard(true)}
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row
            leftNode={<Zap className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label={isPremium ? "xBlum Pro · Active" : "Upgrade to Pro"}
            sublabel={isPremium ? "All features unlocked" : "Unlock full power of xBlum"}
            onClick={() => setCurrentView("premium")}
          />
          <Divider />
          <Row
            leftNode={<Gift className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label="Get $X"
            sublabel="Earn free $X from missions"
            onClick={() => setCurrentView("store")}
          />
          <Divider />
          <Row
            leftNode={<Shield className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label="Privacy & Data"
            sublabel="Manage your data & memories"
            onClick={() => setCurrentView("settings")}
          />
        </Section>

      </div>
    </div>
  )
}
