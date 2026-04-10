"use client"

import { useApp } from "@/lib/app-context"
import {
  ChevronLeft, Gift, MessageCirclePlus,
  Share2, Users, Check, Zap, Tv,
} from "lucide-react"
import { useState, useEffect } from "react"

const TOKEN_PACKAGES = [
  { id:"tok_s",  tokens:100,  stars:80,   approxImgs:3,  coins:1, discount:null   },
  { id:"tok_m",  tokens:350,  stars:200,  approxImgs:12, coins:2, discount:"-17%" },
  { id:"tok_l",  tokens:1000, stars:500,  approxImgs:35, coins:3, discount:"-25%" },
  { id:"tok_xl", tokens:3000, stars:1200, approxImgs:100,coins:3, discount:"-35%" },
]

const MISSIONS = [
  { id:"daily",   icon:Gift,              title:"Daily Reward",        tokens:15, color:"bg-amber-500/20 text-amber-400",   once_only:false, cooldown_hours:24  },
  { id:"channel", icon:Tv,               title:"Join our channel",     tokens:20, color:"bg-sky-500/20 text-sky-400",       once_only:true,  cooldown_hours:0   },
  { id:"addChat", icon:MessageCirclePlus, title:"Add to a Group",       tokens:25, color:"bg-blue-500/20 text-blue-400",     once_only:true,  cooldown_hours:0   },
  { id:"share",   icon:Share2,            title:"Share with a Friend",  tokens:20, color:"bg-emerald-500/20 text-emerald-400",once_only:true, cooldown_hours:0   },
  { id:"ref",     icon:Users,             title:"Invite a Friend",      tokens:20, color:"bg-purple-500/20 text-purple-400", once_only:false, cooldown_hours:0   },
]

const DAILY_MAX    = 20
const IMG_COST_AVG = 27

const DECO_STARS = [
  { x:8,  y:22, size:28, rot:0,   delay:0.0, opacity:0.7 },
  { x:14, y:48, size:18, rot:20,  delay:0.4, opacity:0.5 },
  { x:5,  y:68, size:14, rot:-15, delay:0.8, opacity:0.4 },
  { x:18, y:80, size:10, rot:35,  delay:1.2, opacity:0.3 },
  { x:72, y:18, size:22, rot:10,  delay:0.2, opacity:0.6 },
  { x:82, y:42, size:30, rot:-20, delay:0.6, opacity:0.7 },
  { x:78, y:70, size:16, rot:45,  delay:1.0, opacity:0.4 },
  { x:88, y:85, size:12, rot:-30, delay:1.4, opacity:0.35},
  { x:30, y:10, size:12, rot:15,  delay:0.3, opacity:0.3 },
  { x:62, y:8,  size:10, rot:-10, delay:0.9, opacity:0.25},
]

function CoinStack({ count }: { count: number }) {
  const offsets = [0, 8, 16]
  return (
    <div className="relative flex items-center" style={{ width: 24 + (count-1)*8+"px", height:"32px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <img key={i} src="/icon-dark-32x32.png" alt=""
          className="absolute w-8 h-8 object-contain"
          style={{ left: offsets[i]+"px", zIndex: count - i }} />
      ))}
    </div>
  )
}

function StarPrice({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <img src="/telegram-star-icon.png" alt="⭐" className="w-5 h-5 object-contain"
        onError={e => { e.currentTarget.style.display="none" }} />
      <span className="text-amber-400 font-bold text-base">{stars.toLocaleString()}</span>
    </div>
  )
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function StoreView() {
  const {
    t, setCurrentView, tokens,
    claimMissionTokens, openInvoice,
    referralLink,
  } = useApp()

  const [completedOnce, setCompletedOnce] = useState<string[]>([])
  const [dailySecondsLeft, setDailySecondsLeft] = useState(0)

  const BOT = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL_USERNAME ?? "xBlumAI"

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("xblum-missions") ?? "{}")
      setCompletedOnce(stored.completedOnce ?? [])
      const lastDaily = stored.lastDaily ?? 0
      const now = Date.now()
      const elapsed = Math.floor((now - lastDaily) / 1000)
      const remaining = Math.max(0, 86400 - elapsed)
      setDailySecondsLeft(remaining > 0 ? remaining : 0)
    } catch {}
  }, [])

  useEffect(() => {
    if (dailySecondsLeft <= 0) return
    const id = setInterval(() => setDailySecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [dailySecondsLeft])

  const approxImages = Math.floor(tokens / IMG_COST_AVG)

  async function buyPackage(pkgId: string) {
    try { await openInvoice(pkgId) } catch (e) { console.error(e) }
  }

  function saveMissions(completed: string[], lastDaily?: number) {
    try {
      const stored = JSON.parse(localStorage.getItem("xblum-missions") ?? "{}")
      const payload: any = { ...stored, completedOnce: completed }
      if (lastDaily !== undefined) {
        payload.lastDaily = lastDaily
      }
      localStorage.setItem("xblum-missions", JSON.stringify(payload))
    } catch {}
  }

  async function handleClaim(id: string, amount: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp;

    const markAsDone = () => {
      const updated = [...completedOnce, id];
      setCompletedOnce(updated);
      saveMissions(updated); // Solo guarda el array, no toca el temporizador diario
    }

    // 1. INVITAR AMIGO (ref):
    if (id === "ref") {
      const shareText = "Try xBlum AI on Telegram — chat for free!";
      const link = referralLink || `https://t.me/${BOT}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
      tg?.openTelegramLink(shareUrl);
      return; // "ref" nunca se pone Claimed, siempre se puede invitar.
    }

    // 2. AÑADIR A GRUPO (addChat):
    if (id === "addChat") {
      tg?.openTelegramLink(`https://t.me/${BOT}?startgroup=true`);
      tg?.showAlert("Tokens will be added automatically once the bot is added to your group!");
      markAsDone(); // Forzamos que se marque como Claimed inmediatamente
      return;
    }

    // 3. UNIRSE AL CANAL (channel):
    if (id === "channel") {
      tg?.openTelegramLink(`https://t.me/${CHANNEL}`);
      setTimeout(() => {
        claimMissionTokens(id, amount); // Intenta backend
        markAsDone(); // Forzamos Claimed para que la UI responda rápido
      }, 3000);
      return;
    }

    // 4. RECOMPENSA DIARIA (daily):
    if (id === "daily") {
      if (dailySecondsLeft > 0) return;
      claimMissionTokens(id, amount); // Sube tokens
      const now = Date.now();
      setDailySecondsLeft(86400); // Forzamos el reloj en pantalla a 24h
      saveMissions(completedOnce, now); // Guardamos la hora actual
      return;
    }

    // 5. COMPARTIR (share):
    if (id === "share") {
      const shareText = "Check out xBlum AI on Telegram!";
      const link = `https://t.me/${BOT}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
      tg?.openTelegramLink(shareUrl);
      setTimeout(() => {
        claimMissionTokens(id, amount);
        markAsDone(); // Forzamos Claimed
      }, 2000);
      return;
    }
  }

  function getMissionState(m: typeof MISSIONS[0]): "done" | "cooldown" | "ready" {
    if (m.id === "daily") return dailySecondsLeft > 0 ? "cooldown" : "ready"
    if (m.id === "ref") return "ready" 
    if (completedOnce.includes(m.id)) return "done"
    return "ready"
  }

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setCurrentView("home")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("store")}</h2>
      </div>

      <div className="px-4 pt-6 pb-8 space-y-8">

        {/* ── Hero balance ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="relative w-full flex justify-center" style={{ height:"160px" }}>
            {DECO_STARS.map((s, i) => (
              <img key={i} src="/star-icon.png" alt=""
                className="absolute object-contain pointer-events-none select-none"
                style={{
                  left:s.x+"%", top:s.y+"%",
                  width:s.size+"px", height:s.size+"px",
                  opacity:s.opacity, transform:"rotate("+s.rot+"deg)",
                  animation:"starFade 3s ease-in-out infinite",
                  animationDelay:s.delay+"s",
                }}
                onError={e => { e.currentTarget.style.display="none" }}
              />
            ))}
            {/* Logo sin fondo */}
            <div className="absolute flex items-center justify-center"
              style={{ width:"120px", height:"120px", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}>
              <img src="/icon-dark-32x32.png" alt="xBlum" className="w-24 h-24 object-contain" />
            </div>
          </div>
          <div className="text-center -mt-8">
            <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-0">My Balance</p>
            <p className="text-3xl font-black text-white leading-tight">
              {tokens} <span className="text-3xl font-bold">tokens</span>
            </p>
            <p className="text-neutral-400 text-sm mt-0.5">
              {approxImages > 0
                ? `That's enough for ${approxImages} image${approxImages!==1?"s":""}`
                : "Buy tokens to generate images"}
            </p>
          </div>
        </div>

        {/* ── Top Up ────────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Top Up</h3>
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            {TOKEN_PACKAGES.map(pkg => (
              <button key={pkg.id} onClick={() => buyPackage(pkg.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
                <CoinStack count={pkg.coins} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">{pkg.tokens.toLocaleString()} tokens</span>
                    {pkg.discount && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-500 text-white">{pkg.discount}</span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">~{pkg.approxImgs} images</p>
                </div>
                <StarPrice stars={pkg.stars} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium upsell ────────────────────────────────────────────── */}
        <button onClick={() => setCurrentView("premium")}
          className="w-full p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-between hover:border-amber-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{t("getXBlumPro")}</p>
              <p className="text-amber-400/70 text-xs mt-0.5">1,000 tokens/month + GPT models</p>
            </div>
          </div>
          <span className="text-amber-400 text-xs font-semibold shrink-0">from 800 ⭐</span>
        </button>

        {/* Referral Program */}
        <button onClick={() => setCurrentView("referral")}
          className="w-full p-4 bg-gradient-to-r from-sky-600/20 to-blue-600/20 border border-sky-500/30 rounded-2xl flex items-center justify-between hover:border-sky-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">Referral Program</p>
              <p className="text-sky-400/70 text-xs mt-0.5">Invite friends & earn rewards</p>
            </div>
          </div>
          <span className="text-sky-400 text-xs font-semibold shrink-0">80% commission</span>
        </button>

        {/* ── Earn Tokens ───────────────────────────────────────────────── */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Earn Tokens</h3>

          <div className="space-y-2">
            {MISSIONS.map(m => {
              const state = getMissionState(m)
              const isDone     = state === "done"
              const isCooldown = state === "cooldown"
              const isReady    = state === "ready"

              return (
                <div key={m.id} className="bg-neutral-900 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + m.color}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{m.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img src="/icon-dark-32x32.png" alt="" className="w-3 h-3 object-contain" />
                        <span className="text-xs text-amber-400 font-semibold">
                          {m.id === "ref"
                            ? `+${m.tokens} tokens + 80% commission`
                            : `+${m.tokens} tokens`}
                        </span>
                        {m.once_only && isDone && (
                          <span className="text-xs text-neutral-600 ml-1">· one time</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => isReady && handleClaim(m.id, m.tokens)}
                    disabled={isDone || isCooldown}
                    className={
                      "px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-w-[64px] text-center " +
                      (isDone
                        ? "bg-neutral-800 text-neutral-500/60 cursor-not-allowed" // Gris/Opaco
                        : isCooldown
                        ? "bg-neutral-800 text-neutral-400 cursor-not-allowed" // Gris/Opaco para daily
                        : m.id === "ref" || m.id === "addChat"
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "bg-amber-500 text-black hover:bg-amber-400")
                    }
                  >
                    {isDone ? (
                      "Claimed"
                    ) : isCooldown ? (
                      <span className="font-mono text-xs">{formatCountdown(dailySecondsLeft)}</span>
                    ) : m.id === "ref" ? (
                      "Invite"
                    ) : m.id === "addChat" ? (
                      "Add"
                    ) : (
                      `+${m.tokens}`
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes starFade {
          0%,100% { opacity: var(--op, 0.5); transform: scale(1) rotate(var(--rot, 0deg)); }
          50%      { opacity: 0.05; transform: scale(0.85) rotate(var(--rot, 0deg)); }
        }
      `}</style>
    </div>
  )
}
