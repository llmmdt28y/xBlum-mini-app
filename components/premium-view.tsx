"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Rocket, Zap, Clock, Bot, Check } from "lucide-react"
import { TelegramStar } from "./icons/telegram-star"

const PLANS = [
  { id:"premium_1m", label:"1 Month",  stars:800,  tokens:1000, months:1, popular:false, perMonth:null },
  { id:"premium_3m", label:"3 Months", stars:1800, tokens:3000, months:3, popular:true,  perMonth:600  },
  { id:"premium_6m", label:"6 Months", stars:3000, tokens:6000, months:6, popular:false, perMonth:500  },
]

export function PremiumView() {
  const { t, setCurrentView, isPremium } = useApp()

  function subscribe(planId: string) {
    try {
      // 1. Enviamos la solicitud de factura al bot
      window.Telegram?.WebApp?.sendData(
        JSON.stringify({ action:"subscribe", plan_id:planId })
      )
      // 2. IMPORTANTE: No llamamos a setIsPremium(true). 
      // Cerramos la app para que el usuario pague en el chat principal.
      window.Telegram?.WebApp?.close()
    } catch {
      alert("Error connecting to Telegram")
    }
  }

  const benefits = [
    { icon:Clock, title:"Higher limits",        desc:"Grok 4 Mini throttle resets faster · less waiting",   color:"bg-blue-500/20 text-blue-400"    },
    { icon:Bot,   title:t("gptModels"),          desc:"GPT-5.2 & GPT-5.4 fully unlocked",                    color:"bg-purple-500/20 text-purple-400" },
    { icon:Rocket,title:t("monthlyTokens"),      desc:"Tokens refill every month · use them for AI images",  color:"bg-amber-500/20 text-amber-400"   },
    { icon:Zap,   title:t("priorityAccess"),     desc:"Skip the queue at peak hours",                        color:"bg-emerald-500/20 text-emerald-400"},
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
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900">
          <img src="/xblum-pro.png" alt="xBlum Pro" className="w-full object-cover" style={{ maxHeight: "180px" }} />
          <div className="p-5 text-center">
            <h1 className="text-xl font-bold text-white">xBlum Pro</h1>
            <p className="text-neutral-400 text-sm mt-1">More power, less waiting</p>
          </div>
        </div>

        <div className="space-y-2">
          {benefits.map((b, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-start gap-3">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + b.color}><b.icon className="w-5 h-5" /></div>
              <div>
                <p className="font-semibold text-white text-sm">{b.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-white">Choose a plan</h3>
          {PLANS.map(plan => (
            <button key={plan.id} onClick={() => subscribe(plan.id)} className={"w-full p-4 rounded-2xl text-left transition-all relative " + (plan.popular ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-2 border-amber-500" : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")}>
              {plan.popular && <span className="absolute -top-2 right-4 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 rounded-full font-medium">Best value</span>}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{plan.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src="/icon-dark-32x32.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-xs text-neutral-400">+{plan.tokens} tokens included</span>
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

        <p className="text-center text-xs text-neutral-600">Cancel anytime · paid via Telegram Stars</p>
      </div>
    </div>
  )
}
