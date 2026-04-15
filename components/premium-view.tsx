"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Sparkles, ImagePlus, Bot, Zap, Check } from "lucide-react"

const PLANS = [
  { id: "premium_1m", label: "Monthly", stars: 800, months: 1 },
  { id: "premium_3m", label: "3 Months", stars: 1800, months: 3, save: "25%" },
]

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [selectedPlan, setSelectedPlan] = useState<string>("premium_1m")
  const [isLoading, setIsLoading] = useState(false)

  // ── Botón Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      setCurrentView("home")
      tg.BackButton.hide()
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
  }, [setCurrentView])

  async function subscribe() {
    if (!selectedPlan) return
    setIsLoading(true)
    try {
      await openInvoice(selectedPlan)
    } catch (e) {
      console.error("[Subscribe]", e)
    } finally {
      setIsLoading(false)
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
    <div className="flex-1 min-h-screen flex flex-col" style={{ background: "#000" }}>

      {/* Header with title (Respetando el safe area de Telegram) */}
      <div 
        className="pb-6 px-6 text-center"
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 24px)" }}
      >
        <h1 className="text-4xl font-bold text-white tracking-tight">xBlum Pro</h1>
        <p className="text-[#636366] text-base mt-2 font-medium">Access to premium intelligence</p>
      </div>

      {/* Features card */}
      <div className="px-4 flex-1">
        <div className="bg-[#111] border border-[#1c1c1e] rounded-3xl p-5 space-y-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1c1c1e] rounded-xl flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium text-[15px]">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-4 pb-6 pt-8 mt-auto space-y-4">
        {/* Plan selection */}
        <div className="flex gap-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`flex-1 p-4 rounded-2xl text-left transition-all border-2 active:scale-95 ${
                selectedPlan === plan.id
                  ? "bg-[#1c1c1e] border-white"
                  : "bg-[#111] border-[#1c1c1e] hover:border-[#2c2c2e]"
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">{plan.label}</p>
                {plan.save && (
                  <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-semibold">
                    Save {plan.save}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {/* SOLUCIÓN IMAGEN: pointer-events-none hace que la imagen sea intocable */}
                <img
                  src="/telegram-star-icon.png"
                  alt="star"
                  className="w-4 h-4 object-contain pointer-events-none select-none"
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <span className="text-xl font-black text-white">{plan.stars}</span>
              </div>
              {plan.months === 1 ? (
                <p className="text-[#636366] text-xs mt-1 font-medium">/month</p>
              ) : (
                <p className="text-[#636366] text-xs mt-1 font-medium">
                  {Math.round(plan.stars / plan.months)} ⭐/month
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Upgrade button */}
        <button
          onClick={subscribe}
          disabled={isLoading || isPremium}
          className="w-full py-4 bg-white text-black font-bold text-base rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPremium ? "xBlum Pro Active" : isLoading ? "Processing..." : "Upgrade to xBlum Pro"}
        </button>

        <p className="text-center text-xs text-[#636366] font-medium">
          Cancel anytime · Paid via Telegram Stars
        </p>
      </div>
    </div>
  )
}
