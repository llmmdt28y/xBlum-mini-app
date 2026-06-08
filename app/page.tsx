"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { PremiumView } from "@/components/premium-view"
import { ReferralView } from "@/components/referral-view"
import { ProfileView } from "@/components/profile-view"
import { XRewardsView } from "@/components/x-rewards-view"
import { MarketView } from "@/components/market-view"
import { ScheduleView } from "@/components/schedule-view"
import { LevelsView } from "@/components/levels-view"
import { ShopView } from "@/components/shop-view"
import { GroupConfigView } from "@/components/group-config-view"
import { useEffect, useState } from "react"
import { Home, Target, Store, CircleUser, Loader2, Clock } from "lucide-react"
import React from "react"

// ── Telegram user helper ──────────────────────────────────────────────
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

// ── Maintenance Screen ────────────────────────────────────────────────
function MaintenanceScreen({ onUnlock }: { onUnlock: () => void }) {
  const [tapCount, setTapCount] = useState(0)

  const handleSecretTap = () => {
    setTapCount(prev => {
      if (prev + 1 >= 7) { onUnlock(); return 0 }
      return prev + 1
    })
  }

  useEffect(() => {
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 1500)
      return () => clearTimeout(timer)
    }
  }, [tapCount])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      <div onClick={handleSecretTap} className="absolute top-0 left-0 w-24 h-24 z-50" />
      <div className="relative mb-8 pointer-events-none select-none">
        <img
          src="/steampunkjulia_agadsqcaakb7raq.webp"
          alt="Maintenance"
          draggable={false}
          className="w-48 h-48 object-contain pointer-events-none select-none"
          style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none", userSelect: "none" }}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <h1
          className="text-white text-[24px] font-bold tracking-tight"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          Currently working
        </h1>
        <p
          className="text-[#8e8e93] text-[17px] font-medium"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          come back later 🚀
        </p>
      </div>
    </div>
  )
}

// ── SVG Liquid-Glass Filters ──────────────────────────────────────────
function LiquidGlassDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="lg-btn" x="-10%" y="-10%" width="120%" height="120%"
          colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 0.85"
            numOctaves="1"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.3" result="softDisp" />
          <feBlend in="SourceGraphic" in2="softDisp" mode="screen" />
        </filter>

        <filter id="lg-pill" x="-5%" y="-5%" width="110%" height="110%"
          colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65 0.75"
            numOctaves="1"
            seed="2"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="screen" result="lit" />
          <feComposite in="lit" in2="SourceGraphic" operator="in" result="clipped" />
          <feGaussianBlur in="clipped" stdDeviation="0.4" result="softLit" />
          <feBlend in="SourceGraphic" in2="softLit" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}

// ── Liquid Glass styles ───────────────────────────────────────────────

const pillBase: React.CSSProperties = {
  position: "relative",
  backdropFilter: "blur(28px) saturate(220%) brightness(1.12)",
  WebkitBackdropFilter: "blur(28px) saturate(220%) brightness(1.12)",
  backgroundColor: "rgba(255,255,255,0.07)",
  borderRadius: 100,
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: [
    "inset 0 1.5px 1px rgba(255,255,255,0.40)",
    "inset 0 -1px 1px rgba(0,0,0,0.35)",
    "inset 1.5px 0 1px rgba(255,255,255,0.10)",
    "inset -1.5px 0 1px rgba(0,0,0,0.20)",
    "0 8px 32px rgba(0,0,0,0.55)",
    "0 2px 8px rgba(0,0,0,0.35)",
  ].join(", "),
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  overflow: "hidden",
}

const circleBase: React.CSSProperties = {
  position: "relative",
  width: 64,
  height: 64,
  borderRadius: "50%",
  backdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
  WebkitBackdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: [
    "inset 0 2px 1.5px rgba(255,255,255,0.45)",
    "inset 0 -1.5px 1px rgba(0,0,0,0.30)",
    "inset 1.5px 0 1px rgba(255,255,255,0.12)",
    "inset -1.5px 0 1px rgba(0,0,0,0.22)",
    "0 6px 24px rgba(0,0,0,0.50)",
    "0 2px 6px rgba(0,0,0,0.30)",
  ].join(", "),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
  flexShrink: 0,
  filter: "url(#lg-btn)",
  overflow: "hidden",
}

const activeTabStyle: React.CSSProperties = {
  backdropFilter: "blur(20px) saturate(280%) brightness(1.25)",
  WebkitBackdropFilter: "blur(20px) saturate(280%) brightness(1.25)",
  backgroundColor: "rgba(255,255,255,0.13)",
  border: "1px solid rgba(255,255,255,0.20)",
  boxShadow: [
    "inset 0 2px 2px rgba(255,255,255,0.50)",
    "inset 0 -1px 1px rgba(0,0,0,0.25)",
    "0 2px 8px rgba(0,0,0,0.25)",
  ].join(", "),
}

function SpecularOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.00) 42%)",
        zIndex: 10,
      }}
    />
  )
}

function LensEdge() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40%",
        pointerEvents: "none",
        borderRadius: "inherit",
        background: "linear-gradient(0deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
        zIndex: 10,
      }}
    />
  )
}

// ── NavBar ────────────────────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<"home" | "market">("home")
  const [pressedId, setPressedId] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  const isMarketSection = currentView === "market" || currentView === "shop" || currentView === "levels"
  const isHomeSection   = currentView === "home"   || currentView === "schedule"
  const activeNavMode   = isMarketSection ? "market" : (isHomeSection ? "home" : storedNavMode)

  useEffect(() => {
    if (activeNavMode !== storedNavMode) setStoredNavMode(activeNavMode)
  }, [activeNavMode, storedNavMode])

  const handleLeftButton = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCurrentView(activeNavMode === "market" ? "home" as any : "market" as any)
  }

  const centerTabs = activeNavMode === "market"
    ? [
        { id: "market", label: "Market",    icon: Store,  disabled: false },
        { id: "shop",   label: "Shop",      icon: Target, disabled: false },
        { id: "levels", label: "BP Levels", icon: Target, disabled: false },
      ]
    : [
        { id: "home",     label: "Home",  icon: Home,  disabled: false },
        { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
        { id: "none2",    label: "",      icon: null,  disabled: true  },
      ]

  const BLUE   = "#33b5f7"
  const DIM    = "rgba(255,255,255,0.55)"
  const SAFE_B = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom,0px)) + 18px)"

  return (
    <>
      <LiquidGlassDefs />

      <div
        className="fixed left-0 right-0 z-50 flex justify-between items-center pointer-events-none"
        style={{ bottom: SAFE_B, padding: "0 14px" }}
      >
        {/* ── Botón izquierdo ── */}
        <button
          onClick={handleLeftButton}
          onPointerDown={() => setPressedId("left")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto"
          style={{
            ...circleBase,
            transform: pressedId === "left" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <SpecularOverlay />
          <LensEdge />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {activeNavMode === "market" ? (
              <>
                <Home size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>Home</span>
              </>
            ) : (
              <>
                <Store size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>Market</span>
              </>
            )}
          </div>
        </button>

        {/* ── Píldora central ── */}
        <div
          className="pointer-events-auto flex items-center flex-1 mx-3"
          style={{ ...pillBase, height: 64, padding: "0 6px" }}
        >
          <SpecularOverlay />
          <LensEdge />

          <div style={{ position: "relative", zIndex: 5, display: "flex", width: "100%" }}>
            {centerTabs.map((tab, idx) => {
              const isActive   = currentView === tab.id
              const isDisabled = !!tab.disabled
              const Icon       = tab.icon

              return (
                <button
                  key={`${tab.id}-${idx}`}
                  disabled={isDisabled}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => !isDisabled && setCurrentView(tab.id as any)}
                  onPointerDown={() => !isDisabled && setPressedId(tab.id)}
                  onPointerUp={() => setPressedId(null)}
                  onPointerLeave={() => setPressedId(null)}
                  className="relative flex flex-col items-center justify-center select-none"
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 100,
                    border: "none",
                    background: "transparent",
                    cursor: isDisabled ? "default" : "pointer",
                    pointerEvents: isDisabled ? "none" : "auto",
                    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: isActive
                      ? "scale(1.07)"
                      : pressedId === tab.id
                      ? "scale(0.93)"
                      : "scale(1)",
                    ...(isActive ? activeTabStyle : {}),
                  }}
                >
                  {Icon ? (
                    <>
                      <Icon
                        size={22}
                        color={isActive ? BLUE : DIM}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        style={{ transition: "color 0.25s ease" }}
                      />
                      <span style={{
                        fontSize: 10,
                        marginTop: 3,
                        fontWeight: isActive ? 700 : 600,
                        letterSpacing: "-0.3px",
                        color: isActive ? BLUE : DIM,
                        transition: "color 0.25s ease",
                      }}>
                        {tab.label}
                      </span>
                    </>
                  ) : (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Botón derecho: Profile ── */}
        <button
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => setCurrentView("profile" as any)}
          onPointerDown={() => setPressedId("right")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto"
          style={{
            ...circleBase,
            transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <SpecularOverlay />
          <LensEdge />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {photoUrl ? (
              <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.18)" }}>
                <img src={photoUrl} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <>
                <CircleUser
                  size={21}
                  color={currentView === "profile" ? BLUE : DIM}
                  strokeWidth={currentView === "profile" ? 2.5 : 1.8}
                />
                <span style={{
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: currentView === "profile" ? 700 : 600,
                  letterSpacing: "-0.3px",
                  color: currentView === "profile" ? BLUE : DIM,
                }}>
                  Profile
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </>
  )
}

// ── App shell ──────────────────────────────────────────────────────────
function AppContent() {
  const { currentView, setCurrentView, isLoading } = useApp()
  const showNav = ["home", "levels", "market", "profile", "shop", "x-rewards", "schedule"].includes(currentView)

  const [imagesLoaded,  setImagesLoaded]  = useState(false)
  const [showLoading,   setShowLoading]   = useState(true)
  const [fadeLoading,   setFadeLoading]   = useState(false)
  const [isMaintenance, setIsMaintenance] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      try {
        if (tg.requestFullscreen) { tg.requestFullscreen() } else { tg.expand() }
      } catch { tg.expand() }
    }
  }, [])

  useEffect(() => {
    const checkImages = () => {
      const images = Array.from(document.images)
      if (images.length === 0) { setImagesLoaded(true); return }
      let loadedCount = 0
      const checkDone = () => { if (++loadedCount === images.length) setImagesLoaded(true) }
      images.forEach(img => {
        if (img.complete) { checkDone() }
        else {
          img.addEventListener("load",  checkDone, { once: true })
          img.addEventListener("error", checkDone, { once: true })
        }
      })
    }
    const timer    = setTimeout(checkImages, 50)
    const fallback = setTimeout(() => setImagesLoaded(true), 3000)
    return () => { clearTimeout(timer); clearTimeout(fallback) }
  }, [currentView, isMaintenance])

  useEffect(() => {
    if (!isLoading && imagesLoaded) {
      setFadeLoading(true)
      const t = setTimeout(() => setShowLoading(false), 400)
      return () => clearTimeout(t)
    }
  }, [isLoading, imagesLoaded])

  if (isMaintenance) {
    return <MaintenanceScreen onUnlock={() => setIsMaintenance(false)} />
  }

  return (
    <>
      {showLoading && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-400 ease-in-out ${
            fadeLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      <div
        className="bg-black flex flex-col relative"
        style={{ minHeight: "var(--tg-viewport-height, 100dvh)" }}
      >
        {currentView === "home"               && (<><Header /><HomeView /></>)}
        {currentView === "levels"             && <LevelsView />}
        {currentView === "shop"               && <ShopView />}
        {currentView === "settings"           && <SettingsView />}
        {currentView === "account_setup"      && <SettingsView initialPage="prefs" returnView="home" />}
        {currentView === "additional_details" && <SettingsView initialPage="additional_details" returnView="schedule" />}
        {currentView === "premium"            && <PremiumView />}
        {currentView === "referral"           && <ReferralView />}
        {currentView === "profile"            && <ProfileView />}
        {currentView === "x-rewards"          && <XRewardsView />}
        {currentView === "market"             && <MarketView />}
        {currentView === "schedule"           && <ScheduleView />}
        {currentView === "group_config"       && (
          <GroupConfigView
            onClose={() => setCurrentView("home")}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
          />
        )}

        {showNav && <NavBar />}
      </div>
    </>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
