"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"

const PLANS = [
  { id: "premium_1m", label: "Monthly", stars: 800, months: 1 },
  { id: "premium_6m", label: "6 Months", stars: 4000, months: 6, save: "17%" },
]

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <path d="M12 1.5L14.3 9.7L22.5 12L14.3 14.3L12 22.5L9.7 14.3L1.5 12L9.7 9.7L12 1.5Z" />
  </svg>
)

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
    "Guaranteed access during peak hours",
    "Unlock DeepSearch and Think",
    "Up to 10 active Scheduled Tasks",
    "Early access to new features",
    "17% discount compared to Monthly",
  ]

  const activePlanData = PLANS.find(p => p.id === selectedPlan) || PLANS[0]

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-[#050505] relative overflow-hidden text-white font-sans">
      
      {/* Botón Skip (Arriba a la derecha) */}
      <div 
        className="absolute right-4 z-20"
        style={{ top: "calc(var(--tg-safe-area-inset-top, 24px) + 16px)" }}
      >
        <button 
          onClick={() => setCurrentView("home")}
          className="px-4 py-1.5 bg-[#1c1c1e] text-[#8e8e93] text-sm font-semibold rounded-full active:scale-95 transition-transform"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center pt-24 px-6 relative z-10">
        
        {/* Título: SuperNoir */}
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Super<span className="text-[#8e8e93]">Noir</span>
        </h1>
        
        <p className="text-lg font-medium text-white mb-10">
          Unlock advanced capabilities
        </p>

        {/* Lista de beneficios */}
        <div className="w-full max-w-sm space-y-4 mb-10">
          {features.map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="shrink-0">
                <StarIcon />
              </div>
              <p className="text-[15px] font-medium leading-tight">{text}</p>
            </div>
          ))}
        </div>

        {/* Toggle de Planes */}
        <div className="w-full max-w-sm p-1 bg-[#111] border border-[#1c1c1e] rounded-full flex relative mb-4">
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2c2c2e] rounded-full transition-all duration-300 ease-out"
            style={{ left: selectedPlan === "premium_1m" ? "4px" : "calc(50%)" }}
          />
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`flex-1 py-3 text-sm font-semibold rounded-full relative z-10 transition-colors duration-200 ${
                selectedPlan === plan.id ? "text-white" : "text-[#8e8e93]"
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>

        {/* Pricing Info */}
        <p className="text-center text-[#636366] text-xs font-medium mb-6">
          {activePlanData.months === 1 
            ? `Billed monthly at ${activePlanData.stars} ⭐. Cancel anytime.` 
            : `Billed every 6 months at ${activePlanData.stars} ⭐. Cancel anytime.`}
        </p>

        {/* Upgrade Button */}
        <button
          onClick={subscribe}
          disabled={isLoading || isPremium}
          className="w-full max-w-sm py-4 bg-[#ff6a00] hover:bg-[#ff7a1a] text-white font-bold text-[17px] rounded-[18px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-[0_0_20px_rgba(255,106,0,0.3)]"
        >
          {isPremium ? "SuperNoir Active" : isLoading ? "Processing..." : "Upgrade to SuperNoir"}
        </button>

        {/* Footer Links */}
        <div className="flex flex-col items-center gap-2 mt-auto pb-8">
          <div className="flex items-center gap-2 text-[11px] text-[#555558] font-medium">
            <button className="hover:text-[#8e8e93]">Terms & Conditions</button>
            <span>|</span>
            <button className="hover:text-[#8e8e93]">Privacy Policy</button>
          </div>
          <button className="text-[11px] text-[#555558] font-medium hover:text-[#8e8e93]">
            Restore Purchases
          </button>
        </div>

      </div>
    </div>
  )
}
