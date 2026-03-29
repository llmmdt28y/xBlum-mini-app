"use client"

import { useApp } from "@/lib/app-context"
import { Zap } from "lucide-react"

export function Header() {
  const { tokens, setCurrentView, t, isPremium } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-800">

      {/* Logo + premium badge */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setCurrentView("settings")}
          className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all"
        >
          <img
            src="/xblum-logo-blue.png"
            alt="xBlum"
            className="w-full h-full object-cover"
          />
        </button>

        {isPremium ? (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-semibold">Pro</span>
          </div>
        ) : (
          <button
            onClick={() => setCurrentView("premium")}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full hover:border-amber-500/60 transition-all"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">{t("getXBlumPro")}</span>
          </button>
        )}
      </div>

      {/* Token balance */}
      <button
        onClick={() => setCurrentView("store")}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full transition-colors"
      >
        <img src="/icon-dark-32x32.png" alt="" className="w-4 h-4 object-contain" />
        <span className="text-sm font-semibold text-white">{tokens}</span>
      </button>

    </header>
  )
}
