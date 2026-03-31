"use client"

import { useApp } from "@/lib/app-context"
import {
  ChevronLeft, Gift, MessageCirclePlus,
  Share2, Users, Check, Zap,
} from "lucide-react"
import { useState } from "react"

// ── Paquetes — STARS_PACKAGES del bot ────────────────────────────────────────
// coins: cuántas monedas apiladas muestra (1, 2 o 3)
// discount: badge opcional de descuento
const TOKEN_PACKAGES = [
  { id:"tok_s",  tokens:100,  stars:80,   approxImgs:3,  coins:1, discount:null    },
  { id:"tok_m",  tokens:350,  stars:200,  approxImgs:12, coins:2, discount:"-17%"  },
  { id:"tok_l",  tokens:1000, stars:500,  approxImgs:35, coins:3, discount:"-25%"  },
  { id:"tok_xl", tokens:3000, stars:1200, approxImgs:100,coins:3, discount:"-35%"  },
]

const MISSIONS = [
  { id:"daily",  icon:Gift,              title:"Daily Reward",         tokens:5,  color:"bg-amber-500/20 text-amber-400"    },
  { id:"addChat",icon:MessageCirclePlus, title:"Add to a Group",       tokens:10, color:"bg-blue-500/20 text-blue-400"      },
  { id:"share",  icon:Share2,            title:"Share with a Friend",  tokens:8,  color:"bg-emerald-500/20 text-emerald-400"},
  { id:"ref",    icon:Users,             title:"Invite a Friend",      tokens:15, color:"bg-purple-500/20 text-purple-400"  },
]

const IMG_COST_AVG = 27  // (25+30)/2 para el cálculo de imágenes

// ── Estrellas decorativas alrededor del hero ──────────────────────────────────
// Cada estrella tiene posición, tamaño, opacidad inicial, rotación y delay de animación
const DECO_STARS = [
  { x:  8, y: 22, size:28, rot: 0,   delay:0.0, opacity:0.7 },
  { x: 14, y: 48, size:18, rot:20,   delay:0.4, opacity:0.5 },
  { x:  5, y: 68, size:14, rot:-15,  delay:0.8, opacity:0.4 },
  { x: 18, y: 80, size:10, rot:35,   delay:1.2, opacity:0.3 },
  { x: 72, y: 18, size:22, rot:10,   delay:0.2, opacity:0.6 },
  { x: 82, y: 42, size:30, rot:-20,  delay:0.6, opacity:0.7 },
  { x: 78, y: 70, size:16, rot:45,   delay:1.0, opacity:0.4 },
  { x: 88, y: 85, size:12, rot:-30,  delay:1.4, opacity:0.35},
  { x: 30, y: 10, size:12, rot:15,   delay:0.3, opacity:0.3 },
  { x: 62, y:  8, size:10, rot:-10,  delay:0.9, opacity:0.25},
  { x: 22, y: 90, size:14, rot:25,   delay:0.7, opacity:0.3 },
  { x: 68, y: 88, size:16, rot:-25,  delay:1.1, opacity:0.35},
]

// ── Stacked coin logos ────────────────────────────────────────────────────────
function CoinStack({ count }: { count: number }) {
  const offsets = [0, 8, 16]
  return (
    <div className="relative flex items-center" style={{ width: 24 + (count - 1) * 8 + "px", height: "32px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <img
          key={i}
          src="/icon-dark-32x32.png"
          alt=""
          className="absolute w-8 h-8 object-contain"
          style={{ left: offsets[i] + "px", zIndex: count - i }}
        />
      ))}
    </div>
  )
}

// ── Star price badge ──────────────────────────────────────────────────────────
function StarPrice({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {/* star-icon.png sube el usuario — fallback al SVG de telegram star */}
      <img
        src="/telegram-star-icon.png"
        alt="⭐"
        className="w-5 h-5 object-contain"
        onError={e => { e.currentTarget.style.display = "none" }}
      />
      <span className="text-amber-400 font-bold text-base">
        {stars.toLocaleString()}
      </span>
    </div>
  )
}

export function StoreView() {
  const {
    t, setCurrentView, tokens,
    missionTokensToday, claimMissionTokens, openInvoice,
  } = useApp()

  const [claimed, setClaimed] = useState<string[]>([])

  const approxImages = Math.floor(tokens / IMG_COST_AVG)

  const BOT = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"

  function handleInvite() {
    // Abrir el bot para que genere el link de referido
    window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${BOT}?start=invite`)
  }

  async function buyPackage(pkgId: string) {
    try {
      await openInvoice(pkgId)
    } catch (e) {
      console.error("[buyPackage]", e)
    }
  }

  async function handleClaim(id: string, amount: number) {
    if (id === "ref") { handleInvite(); return }
    if (claimed.includes(id)) return
    const ok = await claimMissionTokens(id, amount)
    if (ok) {
      setClaimed(p => [...p, id])
    }
  }

  const spaceLeft = (20 - (missionTokensToday || 0))

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

      <div className="px-4 pt-6 pb-8 space-y-8">

        {/* ── HERO — logo + estrellas flotantes + balance ───────────────── */}
        <div className="flex flex-col items-center">
          {/* Contenedor relativo para las estrellas decorativas */}
          <div className="relative w-full flex justify-center" style={{ height: "200px" }}>

            {/* Estrellas decorativas con animación fade */}
            {DECO_STARS.map((s, i) => (
              <img
                key={i}
                src="/star-icon.png"
                alt=""
                className="absolute object-contain pointer-events-none select-none"
                style={{
                  left:            s.x + "%",
                  top:             s.y + "%",
                  width:           s.size + "px",
                  height:          s.size + "px",
                  opacity:         s.opacity,
                  transform:       "rotate(" + s.rot + "deg)",
                  animation:       "starFade 3s ease-in-out infinite",
                  animationDelay:  s.delay + "s",
                }}
                onError={e => { e.currentTarget.style.display = "none" }}
              />
            ))}

            {/* Logo central en círculo azul */}
            <div
              className="absolute rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40"
              style={{
                width:"110px", height:"110px",
                top:"50%", left:"50%",
                transform:"translate(-50%,-60%)",
              }}
            >
              <img
                src="/icon-dark-32x32.png"
                alt="xBlum"
              />
            </div>
          </div>

          {/* Balance text */}
          <div className="text-center -mt-4">
            <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-1">
              My Balance
            </p>
            <p className="text-3xl font-black text-white leading-tight">
              {tokens} <span className="text-3xl font-bold">tokens</span>
            </p>
            <p className="text-neutral-400 text-sm mt-1.5">
              {approxImages > 0
                ? "That's enough for " + approxImages + " image" + (approxImages !== 1 ? "s" : "")
                : "Buy tokens to generate images"}
            </p>
          </div>
        </div>

        {/* ── TOP UP ────────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Top Up</h3>

          {/* Un solo contenedor con todas las filas */}
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {TOKEN_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => buyPackage(pkg.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
              >
                {/* Coin stack */}
                <CoinStack count={pkg.coins} />

                {/* Token info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">
                      {pkg.tokens.toLocaleString()} tokens
                    </span>
                    {pkg.discount && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-500 text-white">
                        {pkg.discount}
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    ~{pkg.approxImgs} images
                  </p>
                </div>

                {/* Star price */}
                <StarPrice stars={pkg.stars} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium upsell ────────────────────────────────────────────── */}
        <button
          onClick={() => setCurrentView("premium")}
          className="w-full p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-between hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{t("getXBlumPro")}</p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Monthly tokens + higher limits + GPT models
              </p>
            </div>
          </div>
          <span className="text-amber-400 text-xs font-semibold shrink-0">from 800 ⭐</span>
        </button>

        {/* ── Earn Tokens (Missions) ────────────────────────────────────── */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Earn Tokens</h3>



          <div className="space-y-2">
            {MISSIONS.map(m => {
              const isClaimed = claimed.includes(m.id)
              const isInvite  = m.id === "ref"

              return (
                <div
                  key={m.id}
                  className="bg-neutral-900 rounded-2xl px-4 py-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + m.color}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{m.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img src="/icon-dark-32x32.png" alt="" className="w-3 h-3 object-contain" />
                        <span className="text-xs text-amber-400 font-semibold">
                          +{isInvite ? "15 tokens + 10% commission" : m.tokens + " tokens"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(m.id, m.tokens)}
                    disabled={!isInvite && isClaimed}
                    className={
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 " +
                      (isInvite
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : isClaimed
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "bg-amber-500 text-black hover:bg-amber-400")
                    }
                  >
                    {isInvite ? "Invite" : isClaimed ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />Done
                      </span>
                    ) : "+" + m.tokens}
                  </button>
                </div>
              )
            })}
          </div>


        </div>

      </div>

      {/* ── CSS para animación de estrellas ──────────────────────────────── */}
      <style>{`
        @keyframes starFade {
          0%   { opacity: var(--star-op, 0.5); transform: scale(1) rotate(var(--star-rot, 0deg)); }
          45%  { opacity: 0.05; transform: scale(0.85) rotate(var(--star-rot, 0deg)); }
          55%  { opacity: 0.05; transform: scale(0.85) rotate(var(--star-rot, 0deg)); }
          100% { opacity: var(--star-op, 0.5); transform: scale(1) rotate(var(--star-rot, 0deg)); }
        }
      `}</style>

    </div>
  )
}
