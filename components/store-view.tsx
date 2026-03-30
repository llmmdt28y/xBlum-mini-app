"use client"

import { useApp } from "@/lib/app-context"
import {
  ChevronLeft, Gift, MessageCirclePlus,
  Share2, Users, Check, Zap,
} from "lucide-react"
import { TelegramStar } from "./icons/telegram-star"
import { useState } from "react"

/* ── Configuración de Estrellas Decorativas ─────────────────────────── */
const DECORATIVE_STARS = [
  { top: "-5%",  left: "20%", sz: "w-4 h-4", d: "0s",   op: 0.4 },
  { top: "15%",  right: "10%", sz: "w-3 h-3", d: "1.2s", op: 0.6 },
  { top: "45%",  left: "5%",  sz: "w-5 h-5", d: "0.5s", op: 0.3 },
  { top: "60%",  right: "15%", sz: "w-2 h-2", d: "2.1s", op: 0.5 },
  { top: "-10%", right: "25%", sz: "w-6 h-6", d: "0.8s", op: 0.4 },
  { top: "30%",  left: "15%", sz: "w-2 h-2", d: "3s",   op: 0.7 },
]

const TOKEN_PACKAGES = [
  { id: "tok_s",   tokens: 100,  stars: 80,   bonus: null,   popular: false, approxImgs: 3  },
  { id: "tok_m",   tokens: 350,  stars: 200,  bonus: "+50",  popular: true,  approxImgs: 12 },
  { id: "tok_l",   tokens: 1000, stars: 500,  bonus: "+150", popular: false, approxImgs: 35 },
  { id: "tok_xl",  tokens: 3000, stars: 1200, bonus: "+500", popular: false, approxImgs: 100},
]

const MISSIONS = [
  { id:"daily",  icon:Gift,              title:"Daily Reward",        tokens:5,  color:"bg-amber-500/20 text-amber-400" },
  { id:"chat",   icon:MessageCirclePlus, title:"Add to a Group",      tokens:10, color:"bg-blue-500/20 text-blue-400" },
  { id:"share",  icon:Share2,             title:"Share with a Friend", tokens:8,  color:"bg-emerald-500/20 text-emerald-400" },
  { id:"ref",    icon:Users,             title:"Invite a Friend",     tokens:15, color:"bg-purple-500/20 text-purple-400" },
]

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
      {/* Header Fijo */}
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-20">
        <button
          onClick={() => setCurrentView("home")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("store")}</h2>
      </div>

      <div className="p-4 space-y-8">

        {/* ── NUEVA SECCIÓN DE BALANCE (ESTILO MIRA) ─────────────────── */}
        <div className="flex flex-col items-center pt-6 pb-2 relative">
          
          {/* Contenedor de Logo y Estrellas */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            
            {/* Estrellas animadas rodeando el logo */}
            {DECORATIVE_STARS.map((s, i) => (
              <div
                key={i}
                className={`absolute animate-mira-star text-blue-400/40 ${s.sz}`}
                style={{ 
                  top: s.top, 
                  left: s.left, 
                  right: s.right, 
                  animationDelay: s.d,
                  opacity: s.op 
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z" />
                </svg>
              </div>
            ))}

            {/* Logo xBlum Blue */}
            <img 
              src="/xblum-logo-blue.png" 
              alt="xBlum" 
              className="w-28 h-28 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]"
            />
          </div>

          {/* Textos de Balance */}
          <div className="text-center">
            <p className="text-[10px] tracking-[0.25em] font-bold text-neutral-500 uppercase mb-2">
              MY BALANCE
            </p>
            <h2 className="text-4xl font-bold text-white mb-2">
              {tokens} tokens
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              25–30 tokens per AI image generated
            </p>
          </div>
        </div>

        {/* ── Chat free notice ── */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
          <span className="text-xl shrink-0">💬</span>
          <div>
            <p className="text-blue-300/80 font-medium text-sm">Chat is always free</p>
            <p className="text-neutral-600 text-xs mt-0.5">
              Tokens are only spent when generating images. AI chat has no token cost.
            </p>
          </div>
        </div>

        {/* ── Buy tokens ── */}
        <div>
          <h3 className="font-semibold text-white mb-3 px-1">{t("buyTokens")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => buyPackage(pkg.id, pkg.tokens)}
                className={
                  "relative p-4 rounded-2xl text-left transition-all active:scale-95 " +
                  (pkg.popular
                    ? "bg-blue-600/10 border-2 border-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                    : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")
                }
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 right-3 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {t("popular")}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <img src="/icon-dark-32x32.png" alt="" className="w-4 h-4 object-contain" />
                  <span className="font-bold text-xl text-white">{pkg.tokens}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mb-3">
                  tokens
                  {pkg.bonus && <span className="text-emerald-500 font-bold"> {pkg.bonus}</span>}
                  {" · ~"}{pkg.approxImgs} imgs
                </p>
                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800/50">
                  <TelegramStar className="w-4 h-4" />
                  <span className="text-amber-500 font-bold text-sm">{pkg.stars}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium upsell ── */}
        <button
          onClick={() => setCurrentView("premium")}
          className="w-full p-4 bg-gradient-to-r from-neutral-900 to-[#111] border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/10">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{t("getXBlumPro")}</p>
              <p className="text-neutral-500 text-xs mt-0.5">From 800 ⭐ · includes tokens monthly</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-neutral-600 rotate-180" />
        </button>

        {/* ── Missions ── */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold text-white">{t("missions")}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">Daily Limit:</span>
              <span className="text-xs text-amber-500 font-bold">
                {missionTokensToday}/{DAILY_MISSION_MAX}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {MISSIONS.map(m => {
              const isClaimed  = claimed.includes(m.id)
              const wouldExceed = missionTokensToday >= DAILY_MISSION_MAX
              const disabled   = isClaimed || wouldExceed

              return (
                <div
                  key={m.id}
                  className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + m.color}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{m.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img src="/icon-dark-32x32.png" alt="" className="w-3 h-3 object-contain" />
                        <span className="text-xs text-amber-500/80 font-bold">+{m.tokens} tokens</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(m.id, m.tokens)}
                    disabled={disabled}
                    className={
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all " +
                      (disabled
                        ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                        : "bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-500/10")
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
        </div>

      </div>
    </div>
  )
}
