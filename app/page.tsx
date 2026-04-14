"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { StoreView } from "@/components/store-view"
import { PremiumView } from "@/components/premium-view"
import { ReferralView } from "@/components/referral-view"
import { useEffect, useState } from "react"

// ── Nav tab icons ────────────────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}
function StoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8h10M7 11h7" />
    </svg>
  )
}
function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 4-8" />
    </svg>
  )
}

type TgUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── Nav bar ──────────────────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("")

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const first = user.first_name?.[0] ?? ""
    const last  = user.last_name?.[0]  ?? ""
    setInitials((first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || "?")
  }, [])

  type Tab = { id: string; label: string; disabled?: boolean }
  const tabs: Tab[] = [
    { id: "home",      label: "Home" },
    { id: "store",     label: "Store" },
    { id: "analytics", label: "Analytics", disabled: true },
    { id: "profile",   label: "Profile" },
  ]

  // Only show nav on main views (not sub-views like premium/referral/settings)
  const mainViews = ["home", "store", "analytics", "profile"]
  const activeTab = mainViews.includes(currentView) ? currentView : "home"

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-3"
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        paddingTop: "8px",
        background: "rgba(18,18,20,0.72)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 -4px 32px rgba(0,0,0,0.5)",
      }}
    >
      {tabs.map(tab => {
        const isActive  = activeTab === tab.id
        const isDisabled = tab.disabled

        return (
          <button
            key={tab.id}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return
              if (tab.id === "profile") {
                // no-op for now — will be designed later
                return
              }
              setCurrentView(tab.id as "home" | "store" | "analytics")
            }}
            className="flex flex-col items-center justify-center transition-all active:scale-95"
            style={{
              minWidth: "64px",
              opacity: isDisabled ? 0.32 : 1,
              pointerEvents: isDisabled ? "none" : "auto",
            }}
          >
            {/* Active tab: pill with white bg */}
            {isActive ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.13)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                {/* Icon inside active pill */}
                <span className="text-white" style={{ display: "flex" }}>
                  {tab.id === "home"      && <HomeIcon active />}
                  {tab.id === "store"     && <StoreIcon active />}
                  {tab.id === "analytics" && <AnalyticsIcon active />}
                  {tab.id === "profile"   && (
                    <span className="w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 shrink-0 text-[10px] font-bold text-white">
                      {photoUrl ? (
                        <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
                      ) : initials || "?"}
                    </span>
                  )}
                </span>
                <span className="text-white text-[13px] font-semibold leading-none">{tab.label}</span>
              </div>
            ) : (
              /* Inactive tab: icon + label below */
              <div className="flex flex-col items-center gap-0.5 px-2 py-1">
                <span style={{ color: "rgba(255,255,255,0.45)", display: "flex" }}>
                  {tab.id === "home"      && <HomeIcon active={false} />}
                  {tab.id === "store"     && <StoreIcon active={false} />}
                  {tab.id === "analytics" && <AnalyticsIcon active={false} />}
                  {tab.id === "profile"   && (
                    <span className="w-[22px] h-[22px] rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-600/60 to-blue-700/60 shrink-0 text-[10px] font-bold text-white/60">
                      {photoUrl ? (
                        <img src={photoUrl} alt="avatar" className="w-full h-full object-cover opacity-60" onError={() => setPhotoUrl(null)} />
                      ) : initials || "?"}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium leading-none" style={{ color: "rgba(255,255,255,0.38)" }}>{tab.label}</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

function AppContent() {
  const { currentView } = useApp()
  const mainViews = ["home", "store", "analytics"]

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ paddingBottom: "80px" }}>
      {currentView === "home" && (
        <>
          <Header />
          <HomeView />
        </>
      )}
      {currentView === "settings"  && <SettingsView />}
      {currentView === "store"     && <StoreView />}
      {currentView === "premium"   && <PremiumView />}
      {currentView === "referral"  && <ReferralView />}
      {currentView === "analytics" && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">Analytics coming soon</p>
        </div>
      )}

      {/* Nav bar visible on main views + settings */}
      {(mainViews.includes(currentView) || currentView === "settings") && <NavBar />}
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
