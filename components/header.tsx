"use client"

import { useApp } from "@/lib/app-context"
import { Zap, ImageIcon } from "lucide-react"

export function Header() {
  const { imageTokens, setCurrentView, t, isPremium } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-800">
      {/* Logo + premium */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setCurrentView("settings")}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all"
        >
          <svg viewBox="0 0 100 100" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M50 10C50 10 32 30 32 50C32 62 40 72 50 78C60 72 68 62 68 50C68 30 50 10 50 10Z" />
          </svg>
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

      {/* Image token balance */}
      <button
        onClick={() => setCurrentView("store")}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full transition-colors"
      >
        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-sm font-semibold text-white">{imageTokens}</span>
        <span className="text-xs text-neutral-500">imgs</span>
      </button>
    </header>
  )
}
