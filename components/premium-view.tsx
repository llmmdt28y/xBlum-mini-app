"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Rocket, Zap, Clock, ImageIcon, Bot, Check, Sparkles } from "lucide-react"
import { TelegramStar } from "./icons/telegram-star"

const PLANS = [
  {
    id: "premium_1m", label: "1 Month", stars: 800,
    chatTokens: 200, imageTokens: 20, months: 1,
    popular: false,
  },
  {
    id: "premium_3m", label: "3 Months", stars: 1800,
    chatTokens: 700, imageTokens: 70, months: 3,
    popular: true, perMonth: 600,
  },
  {
    id: "premium_6m", label: "6 Months", stars: 3000,
    chatTokens: 1500, imageTokens: 150, months: 6,
    popular: false, perMonth: 500,
  },
]

export function PremiumView() {
  const { t, setCurrentView, setIsPremium, isPremium } = useApp()

  const subscribe = (planId: string) => {
    try {
      // En producción: window.Telegram?.WebApp?.openInvoice(invoiceLink)
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "subscribe", plan_id: planId }))
      setIsPremium(true)
      setCurrentView("home")
    } catch {
      setIsPremium(true)
      setCurrentView("home")
    }
  }

  const benefits = [
    { icon: Clock,    title: "Higher hourly limits",          desc: "3-4x more free requests per hour",          color: "bg-blue-500/20 text-blue-400" },
    { icon: Bot,      title: t("gptModels"),                  desc: "GPT-5.2 (15/hr) & GPT-5.4 (8/hr)",         color: "bg-purple-500/20 text-purple-400" },
    { icon: ImageIcon,title: t("moreImages"),                 desc: "Image tokens included monthly",             color: "bg-pink-500/20 text-pink-400" },
    { icon: Rocket,   title: t("monthlyTokens"),              desc: "Chat + image tokens refill every month",    color: "bg-amber-500/20 text-amber-400" },
    { icon: Zap,      title: t("priorityAccess"),             desc: "Skip the queue at peak hours",             color: "bg-emerald-500/20 text-emerald-400" },
  ]

  const comparison = [
    { feature: "Grok 4 / hour",      free: "5",        pro: "20"        },
    { feature: "Grok 4 Mini / hour", free: "12",       pro: "40"        },
    { feature: "GPT-5.2 / hour",     free: "2",        pro: "15"        },
    { feature: "GPT-5.4 / hour",     free: "🔒",       pro: "8"         },
    { feature: "Image generation",   free: "limited",        pro: "✅"        },
    { feature: "Chat tokens/month",  free: "—",        pro: "200–1500"  },
    { feature: "Image tokens/month", free: "—",        pro: "20–150"    },
  ]

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setCurrentView("home")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("getXBlumPro")}</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-6 text-center relative overflow-hidden border border-neutral-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-2xl shadow-orange-500/30">
              <svg viewBox="0 0 100 100" className="w-14 h-14 text-white" fill="currentColor">
                <path d="M50 5C50 5 28 28 28 52C28 64 34 75 43 82C34 72 32 58 38 46C46 32 50 25 50 25C50 25 54 32 62 46C68 58 66 72 57 82C66 75 72 64 72 52C72 28 50 5 50 5Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">xBlum Pro</h1>
            <p className="text-neutral-400 text-sm">More power, less waiting</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          {benefits.map((b, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{b.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 border-b border-neutral-800">
            <div className="p-3"><p className="text-xs text-neutral-500">Feature</p></div>
            <div className="p-3 text-center border-x border-neutral-800"><p className="text-xs text-neutral-500">{t("free")}</p></div>
            <div className="p-3 text-center bg-amber-500/10"><p className="text-xs font-medium text-amber-400">Pro</p></div>
          </div>
          {comparison.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-neutral-800 last:border-0">
              <div className="p-3"><p className="text-xs text-neutral-300">{row.feature}</p></div>
              <div className="p-3 text-center border-x border-neutral-800"><p className="text-xs text-neutral-500">{row.free}</p></div>
              <div className="p-3 text-center bg-amber-500/10"><p className="text-xs font-medium text-white">{row.pro}</p></div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Choose a plan</h3>
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => subscribe(plan.id)}
              className={`w-full p-4 rounded-2xl text-left transition-all relative ${
                plan.popular
                  ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-2 border-amber-500"
                  : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2 right-4 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 rounded-full font-medium">
                  Best value
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{plan.label}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                    <span>+{plan.chatTokens} chat</span>
                    <span>·</span>
                    <span>+{plan.imageTokens} images</span>
                    {plan.perMonth && <span className="text-emerald-400">({plan.perMonth} ⭐/mo)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TelegramStar className="w-5 h-5" />
                  <span className="text-xl font-bold text-white">{plan.stars}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {isPremium && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <Check className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 font-medium text-sm">xBlum Pro is active on your account</p>
          </div>
        )}

        <p className="text-center text-xs text-neutral-600">Cancel anytime · no commitments · paid via Telegram Stars</p>
      </div>
    </div>
  )
}
