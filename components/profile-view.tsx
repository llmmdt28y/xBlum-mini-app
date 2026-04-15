"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { ChevronRight, Settings, Gift, Users, Star, Shield, Zap, Trophy } from "lucide-react"

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

// ── Section group (same as settings) ─────────────────────────────────
function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && (
        <p
          className="text-xs font-medium uppercase tracking-[0.08em] px-1 mb-1.5"
          style={{
            color: "#636366",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1c1e" }}>
        {children}
      </div>
    </div>
  )
}

// ── Divider (same as settings) ────────────────────────────────────────
function Divider() {
  return <div className="ml-[52px] mr-0 h-px" style={{ background: "#2c2c2e" }} />
}

// ── Row item ──────────────────────────────────────────────────────────
function Row({
  icon, iconBg, label, sublabel, right, onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  sublabel?: string
  right?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 active:opacity-60 transition-opacity"
      style={{ paddingTop: "10px", paddingBottom: "10px" }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>{sublabel}</p>}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
    </button>
  )
}

// ── Main ProfileView ──────────────────────────────────────────────────
export function ProfileView() {
  const { setCurrentView, isPremium, referralCount } = useApp()

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    setDisplayName(full || user.username || "User")
    setUsername(user.username ? "@" + user.username : "")
  }, [])

  // ── Telegram native BackButton → navigates to home ────────────────
  // Docs: https://core.telegram.org/bots/webapps#backbutton
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return

    tg.BackButton.show()

    const handleBack = () => setCurrentView("home")
    tg.BackButton.onClick(handleBack)

    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [setCurrentView])

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-10 flex items-center px-4 py-3"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
          style={{ background: "#1c1c1e" }}
          onClick={() => {/* top leaderboard — coming later */}}
        >
          <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
        </button>

        <h2 className="font-semibold text-white text-base absolute left-1/2 -translate-x-1/2">
          Profile
        </h2>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity ml-auto"
          style={{ background: "#1c1c1e" }}
          onClick={() => setCurrentView("settings")}
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="px-4 pt-6 pb-28 space-y-5">

        {/* ── Avatar + name — clean, no ring, no pro badge ── */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-4">
          <div
            className="flex items-center justify-center overflow-hidden rounded-full"
            style={{ width: 82, height: 82, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={() => setPhotoUrl(null)}
              />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: "28px", letterSpacing: "-0.02em" }}>
                {initials || "?"}
              </span>
            )}
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-lg leading-tight">{displayName || "Your Name"}</p>
            {username && <p className="text-sm mt-0.5" style={{ color: "#8e8e93" }}>{username}</p>}
          </div>
        </div>

        {/* ── xBlum Rewards ── */}
        <Section title="Rewards">
          <Row
            icon={
              <img
                src="/xblum2-icon.png"
                alt="xBlum Rewards"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  const p = e.currentTarget.parentElement
                  if (p) { p.textContent = "🚀"; p.style.fontSize = "16px" }
                }}
              />
            }
            iconBg="rgba(59,130,246,0.2)"
            label="xBlum Rewards"
            sublabel="Earn tokens & exclusive perks"
            onClick={() => {/* coming soon */}}
          />
        </Section>

        {/* ── Social ── */}
        <Section title="Social">
          <Row
            icon={<Users className="w-4 h-4 text-emerald-400" />}
            iconBg="rgba(52,199,89,0.2)"
            label="Referral Program"
            sublabel={referralCount > 0 ? `${referralCount} friends invited` : "Invite friends & earn tokens"}
            onClick={() => setCurrentView("referral")}
          />
          <Divider />
          <Row
            icon={<Star className="w-4 h-4 text-amber-400" />}
            iconBg="rgba(245,158,11,0.2)"
            label="Top Holders"
            sublabel="See the leaderboard"
            onClick={() => {/* coming soon */}}
          />
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <Row
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            iconBg="rgba(245,158,11,0.2)"
            label={isPremium ? "xBlum Pro · Active" : "Upgrade to Pro"}
            sublabel={isPremium ? "All features unlocked" : "Unlock full power of xBlum"}
            onClick={() => setCurrentView("premium")}
          />
          <Divider />
          <Row
            icon={<Gift className="w-4 h-4 text-pink-400" />}
            iconBg="rgba(236,72,153,0.2)"
            label="Get Tokens"
            sublabel="Earn free tokens from missions"
            onClick={() => setCurrentView("store")}
          />
          <Divider />
          <Row
            icon={<Shield className="w-4 h-4" style={{ color: "#8e8e93" }} />}
            iconBg="#2c2c2e"
            label="Privacy & Data"
            sublabel="Manage your data & memories"
            onClick={() => setCurrentView("settings")}
          />
        </Section>

      </div>
    </div>
  )
}
