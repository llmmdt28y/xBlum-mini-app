"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Rocket, Zap, Clock, Bot, Check } from "lucide-react"

const PLANS = [
  { id:"premium_1m", label:"1 Month",  stars:800,  tokens:1000, months:1, popular:false, perMonth:null },
  { id:"premium_3m", label:"3 Months", stars:1800, tokens:3000, months:3, popular:true,  perMonth:600  },
  { id:"premium_6m", label:"6 Months", stars:3000, tokens:6000, months:6, popular:false, perMonth:500  },
]

export function PremiumView() {
  const { t, setCurrentView, setIsPremium, isPremium, openInvoice } = useApp()

  async function subscribe(planId: string) {
    try {
      await openInvoice(planId)
    } catch (e) {
      console.error("[Subscribe]", e)
    }
  }

  const benefits = [
    { icon:Clock, title:"No throttle",            desc:"Grok 4 Mini never slows down for Pro users",         color:"bg-blue-500/20 text-blue-400"    },
    { icon:Bot,   title:t("gptModels"),            desc:"GPT-5.2 & GPT-5.4 fully unlocked",                   color:"bg-purple-500/20 text-purple-400" },
    { icon:Rocket,title:"1,000 tokens/month",      desc:"Tokens auto-renewed every month for image generation",color:"bg-amber-500/20 text-amber-400"   },
    { icon:Zap,   title:t("priorityAccess"),       desc:"Skip the queue at peak hours",                       color:"bg-emerald-500/20 text-emerald-400"},
  ]

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setCurrentView("home")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("getXBlumPro")}</h2>
      </div>

      <div className="p-4 space-y-6">

        {/* Hero — solo texto, sin imagen */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-3xl p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/30">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">xBlum Pro</h1>
          <p className="text-neutral-400 text-sm mt-1">More power · 1,000 tokens/month · no waiting</p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          {benefits.map((b, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-start gap-3">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + b.color}>
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
            <button key={plan.id} onClick={() => subscribe(plan.id)}
              className={"w-full p-4 rounded-2xl text-left transition-all relative active:scale-[0.98] " +
                (plan.popular
                  ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-2 border-amber-500"
                  : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")}>
              {plan.popular && (
                <span className="absolute -top-2 right-4 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 rounded-full font-medium">
                  Best value
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{plan.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src="/icon-dark-32x32.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-xs text-neutral-400">
                      +{plan.tokens.toLocaleString()} tokens
                    </span>
                    {plan.perMonth && (
                      <span className="text-xs text-emerald-400">({plan.perMonth} ⭐/mo)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src="/telegram-star-icon.png" alt="⭐" className="w-5 h-5 object-contain"
                    onError={e => { e.currentTarget.style.display="none" }} />
                  <span className="text-xl font-black text-white">{plan.stars}</span>
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

        <p className="text-center text-xs text-neutral-600">
          Cancel anytime · paid via Telegram Stars · 1,000 tokens renewed every month
        </p>
      </div>
    </div>
  )
}
