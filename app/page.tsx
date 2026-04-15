"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { StoreView } from "@/components/store-view"
import { PremiumView } from "@/components/premium-view"
import { ReferralView } from "@/components/referral-view"
import { ProfileView } from "@/components/profile-view"
import { useEffect, useState } from "react"
// Importamos iconos más modernos y limpios
import { Sparkles, Coins, Activity, CircleUser } from "lucide-react"

// ── Telegram user helper ──────────────────────────────────────────────
type TgUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── Floating Liquid NavBar ────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl]   = useState<string | null>(null)
  const [initials, setInitials]   = useState("")

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const f = user.first_name?.[0] ?? ""
    const l = user.last_name?.[0]  ?? ""
    setInitials((f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || "?")
  }, [])

  type Tab = { id: string; label: string; icon: any; disabled?: boolean }
  const tabs: Tab[] = [
    { id: "home",      label: "AI",        icon: Sparkles },
    { id: "store",     label: "Store",     icon: Coins },
    { id: "analytics", label: "Analytics", icon: Activity, disabled: true },
    { id: "profile",   label: "Profile",   icon: CircleUser },
  ]

  const mainViews = ["home", "store", "analytics", "profile"]
  const activeTab = mainViews.includes(currentView) ? currentView : "home"

  function handleTab(id: string) {
    if (id === "analytics") return
    setCurrentView(id as "home" | "store" | "profile")
  }

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: "max(24px, env(safe-area-inset-bottom))" }}
    >
      <div
        className="pointer-events-auto flex items-center"
        style={{
          borderRadius: "100px",
          padding: "6px",
          gap: "4px",
          /* Liquid glass background más profundo */
          background: "rgba(15, 15, 15, 0.75)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
        }}
      >
        {tabs.map(tab => {
          const isActive   = activeTab === tab.id
          const isDisabled = !!tab.disabled
          const Icon       = tab.icon

          return (
            <button
              key={tab.id}
              disabled={isDisabled}
              onClick={() => handleTab(tab.id)}
              className="relative flex items-center justify-center transition-all duration-300 active:scale-95"
              style={{
                opacity: isDisabled ? 0.25 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
                minWidth: isActive ? "100px" : "56px",
                height: "48px",
              }}
            >
              {isActive ? (
                /* ESTADO ACTIVO: Fondo blanco, texto e iconos negros */
                <div
                  className="flex items-center gap-2 px-5 h-full w-full justify-center"
                  style={{
                    borderRadius: "100px",
                    background: "#ffffff",
                    boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
                  }}
                >
                  {tab.id === "profile" && photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="" 
                      className="w-5 h-5 rounded-full object-cover" 
                      style={{ opacity: 1 }} 
                    />
                  ) : (
                    <Icon size={18} color="#000000" strokeWidth={2.5} />
                  )}
                  <span
                    className="text-black font-bold"
                    style={{ fontSize: "14px", letterSpacing: "-0.02em" }}
                  >
                    {tab.label}
                  </span>
                </div>
              ) : (
                /* ESTADO INACTIVO: Iconos grises, foto sin opacidad */
                <div className="flex flex-col items-center justify-center">
                  {tab.id === "profile" && photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="" 
                      className="w-6 h-6 rounded-full object-cover" 
                      style={{ opacity: 1 }} // Foto siempre nítida como pediste
                    />
                  ) : (
                    <Icon size={22} color="rgba(255,255,255,0.45)" strokeWidth={1.8} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────
function AppContent() {
  const { currentView } = useApp()
  const showNav = ["home", "store", "analytics", "profile"].includes(currentView)

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ paddingBottom: showNav ? "100px" : "0" }}>
      {currentView === "home" && (<><Header /><HomeView /></>)}
      {currentView === "settings"  && <SettingsView />}
      {currentView === "store"     && <StoreView />}
      {currentView === "premium"   && <PremiumView />}
      {currentView === "referral"  && <ReferralView />}
      {currentView === "profile"   && <ProfileView />}
      {currentView === "analytics" && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">Analytics coming soon</p>
        </div>
      )}
      {showNav && <NavBar />}
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
