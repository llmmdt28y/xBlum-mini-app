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

// ── Icons ─────────────────────────────────────────────────────────────
function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1v-10.5z" />
      <path d="M9 22V13h6v9" />
    </svg>
  )
}
function StoreIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 22h8M12 17v5" />
      <path d="M6 9h12M6 13h8" />
    </svg>
  )
}
function AnalyticsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

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

  type Tab = { id: string; label: string; disabled?: boolean }
  const tabs: Tab[] = [
    { id: "home",      label: "Home" },
    { id: "store",     label: "Store" },
    { id: "analytics", label: "Analytics", disabled: true },
    { id: "profile",   label: "Profile" },
  ]

  const mainViews = ["home", "store", "analytics", "profile"]
  const activeTab = mainViews.includes(currentView) ? currentView : "home"

  function handleTab(id: string) {
    if (id === "analytics") return  // disabled
    setCurrentView(id as "home" | "store" | "profile")
  }

  return (
    /* ── Outer wrapper: positions the pill above safe area ── */
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      {/* ── The floating pill ── */}
      <div
        className="pointer-events-auto flex items-center"
        style={{
          /* pill shape */
          borderRadius: "100px",
          padding: "6px 6px",
          gap: "2px",

          /* liquid glass background */
          background: "rgba(28,28,32,0.78)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.08)",

          /* border: subtle top highlight + full ring */
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: [
            "inset 0 1.5px 0 rgba(255,255,255,0.13)",   /* top shine */
            "inset 0 -1px 0 rgba(0,0,0,0.35)",           /* bottom depth */
            "0 8px 32px rgba(0,0,0,0.55)",               /* outer shadow */
            "0 2px 8px rgba(0,0,0,0.35)",                /* close shadow */
          ].join(", "),
        }}
      >
        {tabs.map(tab => {
          const isActive   = activeTab === tab.id
          const isDisabled = !!tab.disabled

          return (
            <button
              key={tab.id}
              disabled={isDisabled}
              onClick={() => handleTab(tab.id)}
              className="relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                opacity: isDisabled ? 0.30 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
                /* equal width slots so centering is perfect */
                width: isActive ? "auto" : "60px",
                minHeight: "52px",
                padding: "0",
              }}
            >
              {isActive ? (
                /* ── Active: horizontal pill ── */
                <div
                  className="flex items-center gap-2 px-4"
                  style={{
                    height: "44px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.14)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    boxShadow: [
                      "inset 0 1.5px 0 rgba(255,255,255,0.28)",
                      "inset 0 -1px 0 rgba(0,0,0,0.20)",
                      "0 2px 12px rgba(0,0,0,0.30)",
                    ].join(", "),
                    minWidth: "max-content",
                  }}
                >
                  {/* Icon */}
                  <span className="text-white flex items-center justify-center shrink-0">
                    {tab.id === "home"      && <HomeIcon size={19} />}
                    {tab.id === "store"     && <StoreIcon size={19} />}
                    {tab.id === "analytics" && <AnalyticsIcon size={19} />}
                    {tab.id === "profile"   && (
                      <span
                        className="flex items-center justify-center overflow-hidden rounded-full shrink-0 text-[9px] font-bold text-white"
                        style={{ width: 20, height: 20, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
                      >
                        {photoUrl
                          ? <img src={photoUrl} alt="" className="w-full h-full object-cover" onError={() => setPhotoUrl(null)} />
                          : initials || "?"}
                      </span>
                    )}
                  </span>
                  {/* Label */}
                  <span
                    className="text-white font-semibold leading-none"
                    style={{ fontSize: "13px", letterSpacing: "-0.01em" }}
                  >
                    {tab.label}
                  </span>
                </div>
              ) : (
                /* ── Inactive: icon + label stacked ── */
                <div
                  className="flex flex-col items-center justify-center gap-[5px]"
                  style={{ width: "60px", height: "44px" }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{ color: "rgba(255,255,255,0.42)" }}
                  >
                    {tab.id === "home"      && <HomeIcon size={20} />}
                    {tab.id === "store"     && <StoreIcon size={20} />}
                    {tab.id === "analytics" && <AnalyticsIcon size={20} />}
                    {tab.id === "profile"   && (
                      <span
                        className="flex items-center justify-center overflow-hidden rounded-full text-[9px] font-bold"
                        style={{
                          width: 22, height: 22,
                          background: "linear-gradient(135deg,rgba(59,130,246,0.5),rgba(29,78,216,0.5))",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {photoUrl
                          ? <img src={photoUrl} alt="" className="w-full h-full object-cover opacity-50" onError={() => setPhotoUrl(null)} />
                          : initials || "?"}
                      </span>
                    )}
                  </span>
                  <span
                    className="leading-none font-medium"
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.36)", letterSpacing: "0.01em" }}
                  >
                    {tab.label}
                  </span>
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
    <div className="min-h-screen bg-black flex flex-col" style={{ paddingBottom: showNav ? "96px" : "0" }}>
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
