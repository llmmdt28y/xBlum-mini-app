"use client"

import { useApp } from "@/lib/app-context"
import type { ModelName } from "@/lib/app-context"
import { Zap, User, ChevronDown, Check, Lock, MessageCircle, Users, Home } from "lucide-react"
import { useEffect, useState, useRef } from "react"

type TgUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

const MODEL_META: Record<ModelName, {
  label: string
  sub: string
  color: string
  premium: boolean
}> = {
  "Grok 4":      { label: "Grok 4",      sub: "Most capable",   color: "#3b82f6", premium: false },
  "Grok 4 Mini": { label: "Grok 4 Mini", sub: "Fast & free",    color: "#6366f1", premium: false },
  "GPT-5.4":     { label: "GPT-5.4",     sub: "Pro only",       color: "#f59e0b", premium: true  },
  "GPT-5.2":     { label: "GPT-5.2",     sub: "Pro — balanced", color: "#f59e0b", premium: true  },
}

const ALL_MODELS: ModelName[] = ["Grok 4", "Grok 4 Mini", "GPT-5.4", "GPT-5.2"]

// Views that show the header + tabs
type TabView = "home" | "groups" | "conversations"

const TABS: { id: TabView; label: string; icon: React.ReactNode }[] = [
  { id: "home",          label: "Home",           icon: <Home className="w-4 h-4" /> },
  { id: "groups",        label: "Groups",         icon: <Users className="w-4 h-4" /> },
  { id: "conversations", label: "Conversations",  icon: <MessageCircle className="w-4 h-4" /> },
]

export function Header() {
  const { tokens, setCurrentView, currentView, t, isPremium, selectedModel, setSelectedModel } = useApp()

  const [photoUrl, setPhotoUrl]         = useState<string | null>(null)
  const [initials, setInitials]         = useState("")
  const [selectorOpen, setSelectorOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const first = user.first_name?.[0] ?? ""
    const last  = user.last_name?.[0]  ?? ""
    setInitials((first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || "?")
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!selectorOpen) return
    function onOut(e: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false)
      }
    }
    document.addEventListener("mousedown", onOut)
    return () => document.removeEventListener("mousedown", onOut)
  }, [selectorOpen])

  async function handleSelectModel(model: ModelName) {
    const meta = MODEL_META[model]
    if (meta.premium && !isPremium) {
      setCurrentView("premium")
      setSelectorOpen(false)
      return
    }
    setSelectorOpen(false)
    await setSelectedModel(model)
  }

  const currentMeta = MODEL_META[selectedModel] ?? MODEL_META["Grok 4"]
  const activeTab   = (["home", "groups", "conversations"] as TabView[]).includes(currentView as TabView)
    ? currentView as TabView
    : null

  return (
    // ── fixed so it never scrolls away
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]">

      {/* ── Top bar: avatar | model selector | tokens ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">

        {/* Left */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView("settings")}
            className="relative w-10 h-10 rounded-full ring-2 ring-blue-500/40 hover:ring-blue-500/70 transition-all overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={() => setPhotoUrl(null)}
              />
            ) : initials ? (
              <span className="text-white font-semibold text-sm">{initials}</span>
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </button>

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
        </div>

        {/* Center — model selector */}
        <div className="relative" ref={selectorRef}>
          <button
            onClick={() => setSelectorOpen(v => !v)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all active:scale-95"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentMeta.color }}
            />
            <span className="text-white text-sm font-semibold leading-none">
              {currentMeta.label}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5 text-neutral-400 transition-transform duration-200"
              style={{ transform: selectorOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {selectorOpen && (
            <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
              <div className="px-3 pt-3 pb-1">
                <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-semibold">
                  Select model
                </p>
              </div>
              {ALL_MODELS.map(model => {
                const meta   = MODEL_META[model]
                const locked = meta.premium && !isPremium
                const active = model === selectedModel
                return (
                  <button
                    key={model}
                    onClick={() => handleSelectModel(model)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${active ? "bg-white/5" : "hover:bg-white/[0.03]"}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: locked ? "#555" : meta.color }}
                    />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className={`text-sm font-semibold leading-tight ${locked ? "text-neutral-500" : "text-white"}`}>
                        {meta.label}
                      </span>
                      <span className={`text-[11px] leading-tight ${locked ? "text-neutral-600" : "text-neutral-400"}`}>
                        {meta.sub}
                      </span>
                    </div>
                    {locked ? (
                      <Lock className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    ) : active ? (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                    ) : null}
                  </button>
                )
              })}
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* Right — tokens */}
        <button
          onClick={() => setCurrentView("store")}
          className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full transition-colors"
        >
          <img
            src="/token2-icon.png"
            alt="tokens"
            className="w-5 h-5 object-contain rounded-full"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
          <span className="text-base font-bold text-white">{tokens}</span>
        </button>
      </div>

      {/* ── Nav tabs (only shown in main views) ── */}
      {activeTab !== null && (
        <div className="flex items-center gap-0 px-4 pb-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold
                  border-b-2 transition-all duration-150
                  ${isActive
                    ? "text-white border-blue-500"
                    : "text-neutral-500 border-transparent hover:text-neutral-300"
                  }
                `}
              >
                <span className={isActive ? "text-blue-400" : "text-neutral-600"}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Thin separator only when tabs are visible ── */}
      {activeTab !== null && (
        <div className="h-px bg-neutral-800/60 mx-4" />
      )}
    </header>
  )
}
