"use client"

import { useApp } from "@/lib/app-context"
import { Zap } from "lucide-react"

export function Header() {
  const { setCurrentView, t, isPremium } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black">

      {/* Left — xBlum wordmark or logo */}
      <div className="flex items-center gap-2">
        <span className="text-white font-bold text-lg tracking-tight">xBlum</span>
      </div>

      {/* Right — Pro badge / upgrade */}
      {isPremium ? (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
          <Zap className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-bold">Pro</span>
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
    </header>
  )
}
