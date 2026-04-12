"use client"

import { useApp } from "@/lib/app-context"
import { Zap, User } from "lucide-react"
import { useEffect, useState } from "react"

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

export function Header() {
  const { tokens, setCurrentView, t, isPremium } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("")

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    // photo_url viene en initDataUnsafe cuando el usuario tiene foto de perfil
    if (user.photo_url) setPhotoUrl(user.photo_url)
    // Fallback: iniciales del nombre
    const first  = user.first_name?.[0] ?? ""
    const last   = user.last_name?.[0]  ?? ""
    setInitials((first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || "?")
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black fixed top-0 left-0 right-0 z-50">

      {/* Left — avatar del usuario + badge Pro */}
      <div className="flex items-center gap-2.5">

        {/* Avatar circular — foto TG o iniciales */}
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

        {/* Pro badge / upgrade */}
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

      {/* Right — token balance, más visible */}
      <button
        onClick={() => setCurrentView("store")}
        className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full transition-colors"
      >
        {/* Icono de token — imagen más grande */}
        <img
          src="/token2-icon.png"
          alt="tokens"
          className="w-5 h-5 object-contain rounded-full"
          onError={e => { e.currentTarget.style.display = "none" }}
        />
        <span className="text-base font-bold text-white">{tokens}</span>
      </button>

    </header>
  )
}
