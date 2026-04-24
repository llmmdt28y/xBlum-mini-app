"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback } from "react"
import { Info, History, ArrowDownRight, ArrowUpRight, Loader2, ChevronRight, Gift, Users, Shield, Zap, Trophy, Medal, Settings } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTg(): any {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp
}

async function apiPost(endpoint: string, body: Record<string, unknown>) {
  const tg       = getTg()
  const initData = tg?.initData ?? ""
  const userId   = tg?.initDataUnsafe?.user?.id ?? null
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

type Transaction = {
  amount:      number
  description: string
  timestamp:   string
  is_out:      boolean
}

function formatBalance(balance: number) {
  const rounded = Math.floor(balance).toString()
  return { integer: rounded }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    return d.toLocaleDateString([], { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return iso.slice(0, 16).replace("T", " ")
  }
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

// ── Leaderboard data types ───────────────────────────────────────────
type LeaderboardPeriod = "this_week" | "last_week" | "all_time"
type LeaderboardEntry = {
  rank: number
  userId?: number
  username: string
  tp: number 
  initials: string
  avatarColor: string
  photoUrl?: string
}

const MOCK_LEADERBOARD: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  this_week: [
    { rank: 1, username: "vertetigr",       tp: 2500000, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 2, username: "some_dogs",       tp: 1000000, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 3, username: "XHamsterx",       tp:  855000, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 4, username: "Anvar1982n",      tp:  150000, initials: "AN", avatarColor: "#10b981" },
    { rank: 5, username: "Tuvanta",         tp:   10500, initials: "TU", avatarColor: "#ec4899" },
    { rank: 6, username: "Shdioawhxueigo",  tp:    5000, initials: "SH", avatarColor: "#6366f1" },
    { rank: 7, username: "jstgcalchara",    tp:    2200, initials: "JG", avatarColor: "#14b8a6" },
    { rank: 8, username: "cryptowolf99",    tp:    1500, initials: "CW", avatarColor: "#f97316" },
    { rank: 9, username: "moon_tradr",      tp:    1000, initials: "MT", avatarColor: "#a855f7" },
    { rank: 10, username: "blainkz",        tp:     500, initials: "BK", avatarColor: "#22c55e" },
  ],
  last_week: [
    { rank: 1, username: "cryptowolf99",    tp: 2800000, initials: "CW", avatarColor: "#f97316" },
    { rank: 2, username: "vertetigr",       tp: 1200000, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 3, username: "blainkz",         tp:  900000, initials: "BK", avatarColor: "#22c55e" },
    { rank: 4, username: "moon_tradr",      tp:  250000, initials: "MT", avatarColor: "#a855f7" },
    { rank: 5, username: "XHamsterx",       tp:   87000, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 6, username: "some_dogs",       tp:   15500, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 7, username: "Tuvanta",         tp:   10000, initials: "TU", avatarColor: "#ec4899" },
    { rank: 8, username: "Anvar1982n",      tp:    5200, initials: "AN", avatarColor: "#10b981" },
    { rank: 9, username: "jstgcalchara",    tp:    3000, initials: "JG", avatarColor: "#14b8a6" },
    { rank: 10, username: "niko_blm",       tp:    1200, initials: "NB", avatarColor: "#6366f1" },
  ],
  all_time: [
    { rank: 1, username: "cryptowolf99",    tp: 12500000, initials: "CW", avatarColor: "#f97316" },
    { rank: 2, username: "vertetigr",       tp:  9980000, initials: "VT", avatarColor: "#3b82f6" },
    { rank: 3, username: "some_dogs",       tp:  4874000, initials: "SD", avatarColor: "#8b5cf6" },
    { rank: 4, username: "XHamsterx",       tp:  2720000, initials: "XH", avatarColor: "#f59e0b" },
    { rank: 5, username: "blainkz",         tp:  1642000, initials: "BK", avatarColor: "#22c55e" },
    { rank: 6, username: "Anvar1982n",      tp:   598000, initials: "AN", avatarColor: "#10b981" },
    { rank: 7, username: "moon_tradr",      tp:   254000, initials: "MT", avatarColor: "#a855f7" },
    { rank: 8, username: "Tuvanta",         tp:    88000, initials: "TU", avatarColor: "#ec4899" },
    { rank: 9, username: "niko_blm",        tp:    41000, initials: "NB", avatarColor: "#6366f1" },
    { rank: 10, username: "jstgcalchara",   tp:    12000, initials: "JG", avatarColor: "#14b8a6" },
  ],
}

function formatX(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return n.toLocaleString()
}

export function XRewardsView() {
  const { setCurrentView } = useApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any

  const xBalance: number = ctx.x_points ?? ctx.tokens ?? 0
  const { integer } = formatBalance(xBalance)

  const [transactions, setTransactions]   = useState<Transaction[]>([])
  const [loadingTxns, setLoadingTxns]     = useState(true)
  const [showAll, setShowAll]             = useState(false)
  const [allLoaded, setAllLoaded]         = useState(false)
  const [total, setTotal]                 = useState(0)

  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => { setCurrentView("profile"); tg.BackButton.hide() }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  const loadTransactions = useCallback(async (all = false) => {
    try {
      setLoadingTxns(true)
      const data = await apiPost("/api/x_ledger", { limit: all ? 50 : 5, offset: 0 }) as any
      setTransactions(data.transactions ?? [])
      setTotal(data.total ?? 0)
      if (all) setAllLoaded(true)
    } catch (e) {
      console.error("[XRewards] ledger error:", e)
    } finally {
      setLoadingTxns(false)
    }
  }, [])

  useEffect(() => { loadTransactions(false) }, [loadTransactions])

  const handleViewAll = () => {
    if (!allLoaded) loadTransactions(true)
    setShowAll(true)
  }

  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3"
        style={{
          paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
          $X Rewards
        </h2>
      </div>

      <div className="px-4 pt-6 pb-28 overflow-y-auto space-y-6">

        {/* ── Balance Card ── */}
        <div
          className="rounded-[24px] p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ background: "#1c1c1e" }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, fontWeight: 500 }}>
              Total $X Points
            </p>
            <button className="active:opacity-60 transition-opacity">
              <Info size={20} style={{ color: "#8e8e93" }} />
            </button>
          </div>

          <div className="flex items-baseline gap-2 mb-6 relative z-10">
            <span style={{ fontSize: "44px", fontWeight: 800, color: "#fff", fontFamily: SFD, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {integer}
            </span>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", fontFamily: SFD }}>
              $X
            </span>
          </div>

          <div
            className="relative z-10 rounded-[16px] px-4 py-3.5"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <p style={{ fontSize: "13px", color: "#f59e0b", fontFamily: SF, lineHeight: 1.4 }}>
              🏆 $X points are used in the weekly leaderboard. Top 3 each week win <b>7 days of xBlum Pro</b>!
            </p>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
              Recent Activity
            </p>
            {total > 5 && !showAll && (
              <button onClick={handleViewAll} className="flex items-center gap-1 active:opacity-60 transition-opacity">
                <History size={14} style={{ color: "#8e8e93" }} />
                <span style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>View All ({total})</span>
              </button>
            )}
          </div>

          <div className="rounded-[24px] overflow-hidden" style={{ background: "#1c1c1e" }}>
            {loadingTxns ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#8e8e93]" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3 px-4">
                <History size={32} style={{ color: "#48484a" }} />
                <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, textAlign: "center" }}>
                  No transactions yet. Complete missions to earn $X!
                </p>
              </div>
            ) : (
              (showAll ? transactions : transactions.slice(0, 5)).map((tx, i, arr) => (
                <div key={i}>
                  <div className="flex items-center gap-4 px-5 py-4 active:bg-white/5 transition-colors">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: tx.is_out ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)" }}
                    >
                      {tx.is_out
                        ? <ArrowUpRight size={20} style={{ color: "#ef4444" }} />
                        : <ArrowDownRight size={20} style={{ color: "#22c55e" }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[16px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                        {tx.description}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-semibold" style={{ color: tx.is_out ? "#ef4444" : "#22c55e", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} $X
                      </p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div style={{ height: "1px", background: "#2c2c2e", marginLeft: "76px" }} />}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Leaderboard sub-view ─────────────────────────────────────────────
const API_BASE_LB = process.env.NEXT_PUBLIC_API_URL ?? ""

async function fetchLeaderboard(scope: string) {
  const res = await fetch(`${API_BASE_LB}/api/leaderboard?scope=${scope}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.entries ?? []) as { rank: number; user_id: number; tp: number; username?: string; first_name?: string; last_name?: string; photo_url?: string }[]
}

const AVATAR_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ec4899","#6366f1","#14b8a6","#f97316","#a855f7","#22c55e"]

function LeaderboardView({ currentUser, myUserId }: { currentUser: string; myUserId?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any
  const { setCurrentView } = ctx
  const myBalance = ctx.x_points ?? ctx.tokens ?? 0

  const [period, setPeriod]   = useState<LeaderboardPeriod>("this_week")
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const scopeMap: Record<LeaderboardPeriod, string> = {
      this_week: "weekly", last_week: "last_week", all_time: "global"
    }
    fetchLeaderboard(scopeMap[period]).then(raw => {
      const mapped: LeaderboardEntry[] = raw.map((r, i) => {
        const fullName = [r.first_name, r.last_name].filter(Boolean).join(" ")
        const displayName = fullName ? fullName : r.username ? `@${r.username}` : `User #${String(r.user_id).slice(-6)}`
        const words = displayName.replace("@","").split(/\s+/)
        const initials = words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : displayName.replace("@","").slice(0, 2).toUpperCase()
        return {
          rank:        r.rank,
          userId:      r.user_id, 
          username:    displayName,
          tp:          r.tp,
          initials,
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          photoUrl:    r.photo_url,
        }
      })
      setEntries(mapped)
      setLoading(false)
    }).catch(() => {
      setEntries(MOCK_LEADERBOARD[period])
      setLoading(false)
    })
  }, [period])

  const myEntry = myUserId ? entries.find(e => e.userId === myUserId) : undefined

  const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
    this_week: "This week",
    last_week: "Last week",
    all_time:  "All time",
  }

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* ── Header Leaderboard ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h2 className="font-semibold text-white text-[16px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>
          Leaderboard
        </h2>
      </div>

      <div className="px-4 pt-5 pb-32">

        {/* Subtitle */}
        <p className="text-sm mb-5 leading-relaxed" style={{ color: "#8e8e93", fontFamily: SF }}>
          Earn $X and get in the Top of Weekly Leaderboard.{" "}
          Results every Sunday at <span className="text-white font-medium">00:00 UTC</span>.
        </p>

        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <Trophy className="w-5 h-5 shrink-0" style={{ color: "#f59e0b" }} />
          <p className="text-[13px] font-medium" style={{ color: "#f59e0b", fontFamily: SF }}>
            Top 3 winners receive xBlum Pro for one week
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex rounded-[16px] p-1.5 mb-6" style={{ background: "#1c1c1e" }}>
          {(["this_week", "last_week", "all_time"] as LeaderboardPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-200"
              style={{
                background: period === p ? "#3a3a3c" : "transparent",
                color: period === p ? "#fff" : "#8e8e93",
                fontFamily: SF,
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* My position */}
        <div
          className="flex items-center gap-4 px-5 py-4 rounded-[24px] mb-6 animate-in fade-in duration-500"
          style={{ background: "#1c1c1e" }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[15px] text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {(currentUser || "ME").replace("@","").slice(0,2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-[16px]" style={{ fontFamily: SF }}>
              {currentUser || "User"}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "#8e8e93", fontFamily: SFD }}>
              {myEntry ? `${formatX(myEntry.tp)} $X` : `${formatX(myBalance)} $X`}
            </p>
          </div>
          {myEntry ? (
            <span className="text-[16px] font-bold" style={{ color: "#f59e0b" }}>#{myEntry.rank}</span>
          ) : (
            <button
              onClick={() => setCurrentView("x-rewards")}
              className="px-5 py-2 rounded-full text-[13px] font-bold transition-opacity active:opacity-70"
              style={{ background: "#3b82f6", color: "#fff", fontFamily: SF }}
            >
              Rewards
            </button>
          )}
        </div>

        {/* Podium — top 3 */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8e8e93" }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: "#48484a" }} />
            <p style={{ color: "#8e8e93", fontSize: "14px", fontFamily: SF }}>
              No entries yet — complete missions to earn $X and appear here!
            </p>
          </div>
        ) : (
        <>
        <div className="flex items-end justify-center gap-3 mb-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ height: "160px" }}>
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            if (!entry) return null
            const isFirst = entry.rank === 1
            const medals = ["🥈", "🥇", "🥉"]
            const heights = [60, 80, 46]
            return (
              <div key={entry.rank} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden"
                  style={{
                    width: isFirst ? 48 : 40,
                    height: isFirst ? 48 : 40,
                    background: entry.avatarColor,
                    boxShadow: isFirst ? `0 0 0 2px #f59e0b` : "none",
                    fontSize: isFirst ? "16px" : "14px",
                  }}
                >
                  {entry.photoUrl
                    ? <img src={entry.photoUrl} alt={entry.username} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display="none" }} />
                    : entry.initials}
                </div>
                <p
                  className="text-[13px] font-medium truncate w-full text-center"
                  style={{ color: isFirst ? "#fff" : "#8e8e93", fontFamily: SF, marginBottom: "-2px" }}
                >
                  {entry.username}
                </p>
                <div className="flex items-center justify-center gap-1 mb-2 w-full">
                  <p 
                    className="text-[11px] font-bold truncate text-center"
                    style={{ color: isFirst ? "#f59e0b" : "#8e8e93", fontFamily: SFD }}
                  >
                    {formatX(entry.tp)} $X
                  </p>
                </div>
                <div
                  className="w-full rounded-t-2xl flex items-center justify-center"
                  style={{ background: "#1c1c1e", height: `${heights[i]}px` }}
                >
                  <span style={{ fontSize: isFirst ? "24px" : "18px" }}>{medals[i]}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ranks 4–10 */}
        <div className="rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both" style={{ background: "#1c1c1e" }}>
          {entries.slice(3).map((entry, i) => (
            <div key={entry.rank}>
              {i > 0 && <div className="h-px" style={{ background: "#2c2c2e", marginLeft: "68px" }} />}
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] text-white shrink-0 overflow-hidden"
                  style={{ background: entry.avatarColor }}
                >
                  {entry.photoUrl
                    ? <img src={entry.photoUrl} alt={entry.username} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display="none" }} />
                    : entry.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF }}>
                    {entry.username}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-[13px]" style={{ color: "#8e8e93", fontFamily: SFD }}>
                      {formatX(entry.tp)} $X
                    </p>
                  </div>
                </div>
                <span className="text-[15px] font-bold shrink-0" style={{ color: "#48484a" }}>
                  #{entry.rank}
                </span>
              </div>
            </div>
          ))}
        </div>
        </>
        )}

        <p className="text-center text-[13px] mt-6" style={{ color: "#48484a", fontFamily: SF }}>
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
      className="w-full flex items-center gap-4 px-5 active:bg-white/5 transition-colors"
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
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
    </button>
  )
}

function Divider() {
  return <div style={{ height: "1px", background: "#2c2c2e", marginLeft: "56px" }} />
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {title && (
        <div className="flex items-center justify-between px-4 mb-2">
          <p className="font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
            {title}
          </p>
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
      className="w-full flex items-center justify-between rounded-[24px] px-5 py-4 active:bg-white/5 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ background: "#1c1c1e" }}
    >
      <div className="text-left flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <p className="text-white font-bold" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
            Weekly Leaderboard
          </p>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
        </div>
        <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
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
  const [userId,          setUserId]          = useState<number | undefined>(undefined)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    setDisplayName(full || user.username || "User")
    setUsername(user.username ? "@" + user.username : "")
    setUserId(user.id)

    // Sincronizar perfil con la base de datos
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
        myUserId={userId ?? undefined}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto relative animate-in fade-in duration-300" style={{ background: "#000" }}>

      {/* ── Header Profile ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
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

      <div className="px-4 pt-4 pb-28 space-y-6 relative">
        
        {/* Ícono de Configuración */}
        <button 
          onClick={() => setCurrentView("settings")}
          className="absolute right-6 top-0 active:opacity-60 transition-opacity z-20"
          style={{ marginTop: "6px" }} 
        >
          <Settings className="w-[24px] h-[24px] text-white/80" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-2 animate-in fade-in zoom-in-95 duration-500">
          <div
            className="flex items-center justify-center overflow-hidden rounded-full shadow-lg"
            style={{ width: 88, height: 88, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: "32px", letterSpacing: "-0.02em", fontFamily: SFD }}>
                {initials || "?"}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="text-white font-semibold" style={{ fontSize: "20px", letterSpacing: "-0.02em", fontFamily: SFD }}>
              {displayName || "Your Name"}
            </p>
            {username && (
              <p className="mt-1" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
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
            leftNode={<Users className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Referral Program"
            sublabel={referralCount > 0 ? `${referralCount} friends invited` : "Invite friends & earn tokens"}
            onClick={() => setCurrentView("referral")}
          />
          <Divider />
          <Row
            leftNode={<Medal className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Top Holders"
            sublabel="See the leaderboard"
            onClick={() => setShowLeaderboard(true)}
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row
            leftNode={<Zap className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label={isPremium ? "xBlum Pro · Active" : "Upgrade to Pro"}
            sublabel={isPremium ? "All features unlocked" : "Unlock full power of xBlum"}
            onClick={() => setCurrentView("premium")}
          />
          <Divider />
          <Row
            leftNode={<Gift className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Get $X"
            sublabel="Earn free $X from missions"
            onClick={() => setCurrentView("store")}
          />
          <Divider />
          <Row
            leftNode={<Shield className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Privacy & Data"
            sublabel="Manage your data & memories"
            onClick={() => setCurrentView("settings")}
          />
        </Section>

      </div>
    </div>
  )
}
