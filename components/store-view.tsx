"use client"

import { useApp } from "@/lib/app-context"
import {
  ChevronLeft, Gift, MessageCirclePlus,
  Share2, Users, Check, Zap,
} from "lucide-react"
import { TelegramStar } from "./icons/telegram-star"
import { useState } from "react"

// Paquetes en tokens (1 imagen ≈ 25-30 tokens)
// 100 tokens = ~3-4 imágenes
const TOKEN_PACKAGES = [
  { id: "tok_s",   tokens: 100,  stars: 80,   bonus: null,   popular: false, approxImgs: 3  },
  { id: "tok_m",   tokens: 350,  stars: 200,  bonus: "+50",  popular: true,  approxImgs: 12 },
  { id: "tok_l",   tokens: 1000, stars: 500,  bonus: "+150", popular: false, approxImgs: 35 },
  { id: "tok_xl",  tokens: 3000, stars: 1200, bonus: "+500", popular: false, approxImgs: 100},
]

// Misiones — recompensa en tokens, máx 20/día en total
const MISSIONS = [
  { id:"daily",  icon:Gift,              title:"Daily Reward",        tokens:5,  color:"bg-amber-500/20 text-amber-400" },
  { id:"chat",   icon:MessageCirclePlus, title:"Add to a Group",      tokens:10, color:"bg-blue-500/20 text-blue-400" },
  { id:"share",  icon:Share2,            title:"Share with a Friend", tokens:8,  color:"bg-emerald-500/20 text-emerald-400" },
  { id:"ref",    icon:Users,             title:"Invite a Friend",     tokens:15, color:"bg-purple-500/20 text-purple-400" },
]

const IMAGE_COST_MIN = 25
const IMAGE_COST_MAX = 30
const DAILY_MISSION_MAX = 20

export function StoreView() {
  const { t, setCurrentView, tokens, missionTokensToday, claimMissionTokens } = useApp()
  const [claimed, setClaimed] = useState<string[]>([])
  const [limitMsg, setLimitMsg] = useState("")

  const missionSpaceLeft = DAILY_MISSION_MAX - missionTokensToday

  function buyPackage(pkgId: string, amount: number) {
    try {
      window.Telegram?.WebApp?.sendData(
        JSON.stringify({ action: "buy_tokens", package_id: pkgId, amount })
      )
    } catch { /* no TG */ }
  }

  function handleClaim(id: string, amount: number) {
    if (claimed.includes(id)) return
    const ok = claimMissionTokens(amount)
    if (ok) {
      setClaimed(p => [...p, id])
      try {
        window.Telegram?.WebApp?.sendData(
          JSON.stringify({ action: "claim_mission", mission_id: id, amount })
        )
      } catch { /* no TG */ }
    } else {
      setLimitMsg("Daily mission limit reached (20 tokens/day)")
      setTimeout(() => setLimitMsg(""), 3000)
    }
  }

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => setCurrentView("home")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("store")}</h2>
      </div>

      <div className="p-4 space-y-6">

        {/* ── Token balance ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <img src="/icon-dark-32x32.png" alt="" className="w-10 h-10 object-contain brightness-200" />
            <p className="text-blue-100 text-sm font-medium">{t("tokens")}</p>
          </div>
          <p className="text-4xl font-bold">{tokens}</p>
          <p className="text-blue-200 text-xs mt-1">
            {IMAGE_COST_MIN}–{IMAGE_COST_MAX} tokens per AI image generated
          </p>
        </div>

        {/* ── Chat free notice ──────────────────────────────────────── */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
          <span className="text-xl shrink-0">💬</span>
          <div>
            <p className="text-blue-300 font-medium text-sm">Chat is always free</p>
            <p className="text-neutral-500 text-xs mt-0.5">
              Tokens are only spent when generating images. AI chat has no token cost.
            </p>
          </div>
        </div>

        {/* ── Buy tokens ────────────────────────────────────────────── */}
        <div>
          <h3 className="font-semibold text-white mb-3">{t("buyTokens")}</h3>
          <div className="grid grid-cols-2 gap-2">
            {TOKEN_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => buyPackage(pkg.id, pkg.tokens)}
                className={
                  "relative p-4 rounded-2xl text-left transition-all active:scale-95 " +
                  (pkg.popular
                    ? "bg-blue-500/10 border-2 border-blue-500"
                    : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")
                }
              >
                {pkg.popular && (
                  <span className="absolute -top-2 right-3 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {t("popular")}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <img src="/icon-dark-32x32.png" alt="" className="w-4 h-4 object-contain" />
                  <span className="font-bold text-xl text-white">{pkg.tokens}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2">
                  tokens
                  {pkg.bonus && <span className="text-emerald-400 font-medium"> {pkg.bonus}</span>}
                  {" · ~"}{pkg.approxImgs} imgs
                </p>
                <div className="flex items-center gap-1">
                  <TelegramStar className="w-4 h-4" />
                  <span className="text-amber-400 font-semibold text-sm">{pkg.stars}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium upsell ────────────────────────────────────────── */}
        <button
          onClick={() => setCurrentView("premium")}
          className="w-full p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-between hover:border-neutral-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{t("getXBlumPro")}</p>
              <p className="text-neutral-400 text-xs mt-0.5">From 800 ⭐ · includes tokens monthly</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-neutral-500 rotate-180" />
        </button>

        {/* ── Missions ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{t("missions")}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-500">Daily:</span>
              <span className="text-xs text-neutral-400 font-medium">
                {missionTokensToday}/{DAILY_MISSION_MAX}
              </span>
              {/* Mini progress bar */}
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: Math.min((missionTokensToday / DAILY_MISSION_MAX) * 100, 100) + "%" }}
                />
              </div>
            </div>
          </div>

          {limitMsg && (
            <div className="mb-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-center">
              {limitMsg}
            </div>
          )}

          <div className="space-y-2">
            {MISSIONS.map(m => {
              const isClaimed  = claimed.includes(m.id)
              const wouldExceed = missionTokensToday >= DAILY_MISSION_MAX
              const disabled   = isClaimed || wouldExceed

              return (
                <div
                  key={m.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + m.color}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{m.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img src="/icon-dark-32x32.png" alt="" className="w-3 h-3 object-contain" />
                        <span className="text-xs text-amber-400 font-medium">+{m.tokens} tokens</span>
                        {missionSpaceLeft > 0 && missionSpaceLeft < m.tokens && (
                          <span className="text-xs text-neutral-600">(only +{missionSpaceLeft} left)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(m.id, m.tokens)}
                    disabled={disabled}
                    className={
                      "px-3 py-2 rounded-xl text-xs font-medium transition-all " +
                      (disabled
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "bg-amber-500 text-white hover:bg-amber-600")
                    }
                  >
                    {isClaimed ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {t("claimed")}
                      </span>
                    ) : wouldExceed ? (
                      "Max reached"
                    ) : (
                      t("claim")
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-neutral-600 text-center mt-3">
            Max {DAILY_MISSION_MAX} tokens from missions per day · resets at midnight
          </p>
        </div>

      </div>
    </div>
  )
}
