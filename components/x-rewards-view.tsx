"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback } from "react"
import { Info, History, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react"

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

export function XRewardsView() {
  const { setCurrentView } = useApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useApp() as any

  // Balance real desde el contexto (cargado por /api/status)
  const xBalance: number = ctx.x_points ?? ctx.tokens ?? 0
  const { integer } = formatBalance(xBalance)

  const [transactions, setTransactions]   = useState<Transaction[]>([])
  const [loadingTxns, setLoadingTxns]     = useState(true)
  const [showAll, setShowAll]             = useState(false)
  const [allLoaded, setAllLoaded]         = useState(false)
  const [total, setTotal]                 = useState(0)

  // Telegram back button
  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => { setCurrentView("profile"); tg.BackButton.hide() }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  // Cargar transacciones desde el backend
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
    if (!allLoaded) {
      loadTransactions(true)
    }
    setShowAll(true)
  }

  const imageProps = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    style: { WebkitTouchCallout: "none" as const, userSelect: "none" as const }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#000", minHeight: "100vh" }}>

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
          className="rounded-[24px] p-6 relative overflow-hidden"
          style={{ background: "#111", border: "1px solid #1c1c1e" }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, fontWeight: 500 }}>
              Total $X Points
            </p>
            <button className="active:opacity-60 transition-opacity">
              <Info size={18} style={{ color: "#48484a" }} />
            </button>
          </div>

          {/* Balance */}
          <div className="flex items-end gap-3 mb-6 relative z-10">
            <img
              src="/xblum2-icon.png"
              alt="$X"
              className="w-[52px] h-[52px] object-contain pointer-events-none select-none shrink-0"
              style={{ filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.08))" }}
              {...imageProps}
            />
            <div className="flex items-baseline gap-0.5">
              <span style={{ fontSize: "44px", fontWeight: 800, color: "#fff", fontFamily: SFD, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {integer}
              </span>
              <span style={{ fontSize: "20px", fontWeight: 600, color: "#fff", fontFamily: SF, marginLeft: "4px" }}>
                $X
              </span>
            </div>
          </div>

          {/* Info: $X para leaderboard */}
          <div
            className="relative z-10 rounded-[14px] px-4 py-3"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <p style={{ fontSize: "13px", color: "#f59e0b", fontFamily: SF, lineHeight: 1.4 }}>
              🏆 $X points are used in the weekly leaderboard. Top 3 each week win <b>7 days of xBlum Pro</b>!
            </p>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}>
              Recent Activity
            </p>
            {total > 5 && !showAll && (
              <button onClick={handleViewAll} className="flex items-center gap-1 active:opacity-60 transition-opacity">
                <History size={13} style={{ color: "#636366" }} />
                <span style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>View All ({total})</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
            {loadingTxns ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#48484a]" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 px-4">
                <History size={32} style={{ color: "#48484a" }} />
                <p style={{ fontSize: "14px", color: "#636366", fontFamily: SF, textAlign: "center" }}>
                  No transactions yet. Complete missions to earn $X!
                </p>
              </div>
            ) : (
              (showAll ? transactions : transactions.slice(0, 5)).map((tx, i, arr) => (
                <div key={i}>
                  <div className="flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors">
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
                      <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                        {tx.description}
                      </p>
                      <p className="mt-0.5" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-semibold" style={{ color: tx.is_out ? "#ef4444" : "#22c55e", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} $X
                      </p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "68px" }} />}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
