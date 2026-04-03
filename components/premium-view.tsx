"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { X, Sparkles, ImagePlus, Bot, Zap, Check } from "lucide-react"

const PLANS = [
  { id: "premium_1m", label: "Monthly", stars: 800, months: 1 },
  { id: "premium_3m", label: "3 Months", stars: 1800, months: 3, save: "25%" },
]

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function subscribe(planId: string) {
    if (loadingPlan) return
    setLoadingPlan(planId)
    try {
      await openInvoice(planId)
    } catch (e) {
      console.error("[Subscribe]", e)
    } finally {
      setLoadingPlan(null)
    }
  }

  const features = [
    { icon: Sparkles, text: "Unlock GPT-5.2 & GPT-5.4" },
    { icon: ImagePlus, text: "1,000 tokens/month" },
    { icon: Bot, text: "Group image creation" },
    { icon: Zap, text: "Agent mode with deep research" },
    { icon: Check, text: "Priority access at peak" },
  ]

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-screen flex flex-col">
      {/* Close button */}
      <button
        onClick={() => setCurrentView("home")}
        className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-800/50 transition-colors z-20"
      >
        <X className="w-6 h-6 text-white/70" />
      </button>

      {/* Header with title */}
      <div className="pt-16 pb-6 px-6 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">xBlum Pro</h1>
        <p className="text-neutral-400 text-base mt-2">Access to premium intelligence</p>
      </div>

      {/* Features card */}
      <div className="px-4 flex-1">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 space-y-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium text-[15px]">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-4 pb-6 pt-8 mt-auto space-y-3">

        {/* Plan cards — each with its own upgrade button */}
        {PLANS.map((plan) => {
          const isLoading = loadingPlan === plan.id
          return (
            <div
              key={plan.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-base">{plan.label}</p>
                  {plan.save && (
                    <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-semibold">
                      Save {plan.save}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <img
                    src="/telegram-star-icon.png"
                    alt="star"
                    className="w-4 h-4 object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none" }}
                  />
                  <span className="text-xl font-black text-white">{plan.stars}</span>
                  {plan.months === 1 ? (
                    <span className="text-neutral-500 text-xs">/mo</span>
                  ) : (
                    <span className="text-neutral-500 text-xs">total</span>
                  )}
                </div>
              </div>
              {plan.months > 1 && (
                <p className="text-neutral-500 text-xs mb-3">
                  {Math.round(plan.stars / plan.months)} ⭐/month · billed once
                </p>
              )}
              <button
                onClick={() => subscribe(plan.id)}
                disabled={isLoading || !!isPremium}
                className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPremium
                  ? "xBlum Pro Active"
                  : isLoading
                  ? "Processing..."
                  : `Upgrade to xBlum Pro`}
              </button>
            </div>
          )
        })}

        {isPremium && (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Check className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-400 font-medium text-sm">xBlum Pro is active</p>
          </div>
        )}

        <p className="text-center text-xs text-neutral-600">
          Cancel anytime · Paid via Telegram Stars
        </p>
      </div>
    </div>
  )
}
