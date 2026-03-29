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
            {/* ← AQUÍ VA TU IMAGEN (reemplaza el nombre si es diferente) */}
            <img
              src="/xblum-pro-logo.png"     {/* ← Cambia el nombre si subes otro archivo */}
              alt="xBlum Pro Logo"
              className="w-20 h-20 mx-auto rounded-3xl object-cover shadow-2xl shadow-orange-500/30 mb-4"
            />
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
