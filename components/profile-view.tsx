"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import {
  ChevronRight, Settings, Gift, Users, Star,
  Shield, Zap, Trophy
} from "lucide-react"

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

// ── xBlum Rewards icon (rocket in badge shape) ────────────────────────
function XBlumRewardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* badge shape */}
      <path
        d="M12 2C10.5 2 9.5 3 8.5 3.5C7.5 4 6 3.8 5 4.8C4 5.8 4.2 7.3 3.7 8.3C3.2 9.3 2 10.3 2 12C2 13.7 3.2 14.7 3.7 15.7C4.2 16.7 4 18.2 5 19.2C6 20.2 7.5 20 8.5 20.5C9.5 21 10.5 22 12 22C13.5 22 14.5 21 15.5 20.5C16.5 20 18 20.2 19 19.2C20 18.2 19.8 16.7 20.3 15.7C20.8 14.7 22 13.7 22 12C22 10.3 20.8 9.3 20.3 8.3C19.8 7.3 20 5.8 19 4.8C18 3.8 16.5 4 15.5 3.5C14.5 3 13.5 2 12 2Z"
        fill="rgba(59,130,246,0.25)"
        stroke="rgba(59,130,246,0.6)"
        strokeWidth="0.8"
      />
      {/* rocket */}
      <path
        d="M14.5 8C14.5 8 15.5 6.5 14.5 5.5C13.5 4.5 12 5.5 12 5.5L9 8.5L8 10L10 11L14.5 8Z"
        fill="#60a5fa"
      />
      <ellipse cx="11.5" cy="9.5" rx="1.2" ry="1.8" transform="rotate(-45 11.5 9.5)" fill="white" opacity="0.9" />
      <path d="M9 8.5L8 10L10 11L9 8.5Z" fill="#93c5fd" />
      <path d="M10 11L8.5 13L9.5 13.5L10 11Z" fill="#60a5fa" />
      <path d="M10 11L11.5 12.5L12.5 12L10 11Z" fill="#60a5fa" />
      <circle cx="12.8" cy="8.8" r="0.7" fill="#1d4ed8" />
    </svg>
  )
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
  icon,
  iconBg,
  label,
  sublabel,
  right,
  onClick,
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
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>
            {sublabel}
          </p>
        )}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
    </button>
  )
}

// ── Main ProfileView ──────────────────────────────────────────────────
export function ProfileView() {
  const { setCurrentView, tokens, isPremium, referralCount } = useApp()

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

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>
      {/* ── Sticky header: medal left, title center, settings right ── */}
      <div
        className="sticky top-0 z-10 flex items-center px-4 py-3"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Medal / Top icon */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
          style={{ background: "#1c1c1e" }}
          onClick={() => {/* top leaderboard — coming later */}}
        >
          <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
        </button>

        {/* Centered title */}
        <h2
          className="font-semibold text-white text-base absolute left-1/2 -translate-x-1/2"
        >
          Profile
        </h2>

        {/* Settings icon */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity ml-auto"
          style={{ background: "#1c1c1e" }}
          onClick={() => setCurrentView("settings")}
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="px-4 pt-6 pb-28 space-y-5">

        {/* ── Avatar + name block ── */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-4">
          {/* Avatar */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-full"
            style={{
              width: 82,
              height: 82,
              background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              boxShadow: "0 0 0 3px rgba(59,130,246,0.25), 0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={() => setPhotoUrl(null)}
              />
            ) : (
              <span
                className="text-white font-bold"
                style={{ fontSize: "28px", letterSpacing: "-0.02em" }}
              >
                {initials || "?"}
              </span>
            )}

            {/* Pro badge */}
            {isPremium && (
              <div
                className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  background: "linear-gradient(135deg,#f59e0b,#ea580c)",
                  border: "2px solid #000",
                }}
              >
                <Zap className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <p className="text-white font-semibold text-lg leading-tight">{displayName || "Your Name"}</p>
            {username && (
              <p className="text-sm mt-0.5" style={{ color: "#8e8e93" }}>{username}</p>
            )}
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3 mt-1">
            <div
              className="flex flex-col items-center px-4 py-2 rounded-2xl"
              style={{ background: "#1c1c1e", minWidth: 72 }}
            >
              <span className="text-white font-bold text-base">{tokens.toLocaleString()}</span>
              <span className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>Tokens</span>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-2xl"
              style={{ background: "#1c1c1e", minWidth: 72 }}
            >
              <span className="text-white font-bold text-base">{referralCount}</span>
              <span className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>Referrals</span>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-2xl"
              style={{ background: "#1c1c1e", minWidth: 72 }}
            >
              <span
                className="font-bold text-base"
                style={{ color: isPremium ? "#f59e0b" : "#636366" }}
              >
                {isPremium ? "Pro" : "Free"}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>Plan</span>
            </div>
          </div>
        </div>

        {/* ── xBlum Rewards ── */}
        <Section title="Rewards">
          <Row
            icon={<XBlumRewardIcon size={18} />}
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
