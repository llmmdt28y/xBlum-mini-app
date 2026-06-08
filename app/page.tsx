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
        <h1 className="text-white text-[24px] font-bold tracking-tight"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          Currently working
        </h1>
        <p className="text-[#8e8e93] text-[17px] font-medium"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          come back later 🚀
        </p>
      </div>
    </div>
  )
}

// ── Liquid Glass SVG Defs ─────────────────────────────────────────────
// FIX: feDisplacementMap con mapa radial (lente convexo real)
// vs. el feTurbulence anterior de alta frecuencia (ruido granular incorrecto)
// FIX 2: useState+useEffect en lugar de guard window===undefined para evitar
// que los filtros SVG sean null durante hydration y causen el parpadeo/desaparición
function LiquidGlassDefs() {
  const [uris, setUris] = useState<{ pill: string; circle: string } | null>(null)

  useEffect(() => {
    const pillMap   = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><defs><radialGradient id="g" cx="50%" cy="40%" r="58%"><stop offset="0%" stop-color="#8080ff"/><stop offset="55%" stop-color="#808080"/><stop offset="100%" stop-color="#3838b8"/></radialGradient></defs><rect width="200" height="80" fill="url(#g)"/></svg>`
    const circleMap = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><radialGradient id="g" cx="50%" cy="38%" r="60%"><stop offset="0%" stop-color="#8080ff"/><stop offset="52%" stop-color="#808080"/><stop offset="100%" stop-color="#3030a8"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>`
    setUris({
      pill:   `data:image/svg+xml;base64,${btoa(pillMap)}`,
      circle: `data:image/svg+xml;base64,${btoa(circleMap)}`,
    })
  }, [])

  if (!uris) return null

  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <filter id="lg-pill" x="-8%" y="-20%" width="116%" height="140%" colorInterpolationFilters="sRGB">
          <feImage href={uris.pill} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="20" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.6" />
        </filter>
        <filter id="lg-circle" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feImage href={uris.circle} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="15" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  )
}

// Specular highlight (franja brillante superior)
function SpecularTop() {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      borderRadius: "inherit", zIndex: 2,
      background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.00) 40%)",
    }} />
  )
}

// Acumulación de luz en borde inferior
function LensBottom() {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "38%", pointerEvents: "none",
      borderRadius: "inherit", zIndex: 2,
      background: "linear-gradient(0deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
    }} />
  )
}

// Capa de refracción — KEY FIX: filter en div interno + backdropFilter:blur(0.01px)
// blur(0.01px) garantiza stacking context en Chromium/WebView (blur(0px) es un no-op
// y no crea stacking context de forma fiable en el WebView de Telegram)
function RefractLayer({ filterId }: { filterId: string }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", inset: -1, pointerEvents: "none",
      borderRadius: "inherit", zIndex: 1,
      filter: `url(#${filterId})`,
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(0.01px)",
      WebkitBackdropFilter: "blur(0.01px)",
    }} />
  )
}

// ── Liquid Glass base styles ───────────────────────────────────────────
const BTN_BASE: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  backgroundColor: "rgba(15, 15, 25, 0.58)",
  backdropFilter: "blur(28px) saturate(210%) brightness(1.10)",
  WebkitBackdropFilter: "blur(28px) saturate(210%) brightness(1.10)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: [
    "inset 0 2px 1px rgba(255,255,255,0.40)",
    "inset 0 -1.5px 1px rgba(0,0,0,0.38)",
    "inset 1.5px 0 1px rgba(255,255,255,0.10)",
    "inset -1.5px 0 1px rgba(0,0,0,0.20)",
    "0 8px 32px rgba(0,0,0,0.58)",
    "0 2px 8px rgba(0,0,0,0.35)",
  ].join(", "),
  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
}

const PILL_STYLE: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  backgroundColor: "rgba(15, 15, 25, 0.58)",
  backdropFilter: "blur(26px) saturate(200%) brightness(1.08)",
  WebkitBackdropFilter: "blur(26px) saturate(200%) brightness(1.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: [
    "inset 0 1.5px 1px rgba(255,255,255,0.38)",
    "inset 0 -1px 1px rgba(0,0,0,0.42)",
    "inset 1.5px 0 1px rgba(255,255,255,0.08)",
    "inset -1.5px 0 1px rgba(0,0,0,0.18)",
    "0 8px 36px rgba(0,0,0,0.55)",
    "0 2px 8px rgba(0,0,0,0.35)",
  ].join(", "),
}

const activePillStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: [
    "inset 0 1.5px 1px rgba(255,255,255,0.40)",
    "inset 0 -1px 1px rgba(0,0,0,0.20)",
    "0 2px 10px rgba(0,0,0,0.25)",
  ].join(", "),
}

// ── NavBar ────────────────────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<'home' | 'market'>('home')
  const [pressedId, setPressedId] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  const isMarketSection = currentView === 'market' || currentView === 'shop' || currentView === 'levels'
  const isHomeSection   = currentView === 'home'   || currentView === 'schedule'
  const activeNavMode   = isMarketSection ? 'market' : (isHomeSection ? 'home' : storedNavMode)

  useEffect(() => {
    if (activeNavMode !== storedNavMode) setStoredNavMode(activeNavMode)
  }, [activeNavMode, storedNavMode])

  const handleLeftActionButton = () => {
    setCurrentView(activeNavMode === 'market' ? 'home' as any : 'market' as any)
  }

  const centerTabs = activeNavMode === 'market'
    ? [
        { id: "market", label: "Market",    icon: Store,  disabled: false },
        { id: "shop",   label: "Shop",      icon: Target, disabled: false },
        { id: "levels", label: "BP Levels", icon: Target, disabled: false },
      ]
    : [
        { id: "home",     label: "Home",  icon: Home,  disabled: false },
        { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
        { id: "none2",    label: "None",  icon: null,  disabled: true  },
      ]

  const neonBlue      = "#33b5f7"
  const inactiveColor = "rgba(255,255,255,0.62)"
  const safeBottom    = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 20px)"

  return (
    <>
      <LiquidGlassDefs />
      <div
        className="fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none"
        style={{ bottom: safeBottom }}
      >
        {/* ── BOTÓN IZQUIERDO ── */}
        <button
          onClick={handleLeftActionButton}
          onPointerDown={() => setPressedId("left")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto shrink-0"
          style={{
            ...BTN_BASE,
            width: "64px",
            height: "64px",
            borderRadius: "100px",
            zIndex: 51,
            transform: pressedId === "left" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <RefractLayer filterId="lg-circle" />
          <SpecularTop />
          <LensBottom />
          <div className="flex flex-col items-center justify-center pointer-events-none select-none" style={{ position: "relative", zIndex: 5 }}>
            {activeNavMode === 'market' ? (
              <>
                <Home size={22} color={inactiveColor} strokeWidth={2} />
                <span className="text-[11px] mt-1 font-semibold tracking-tight" style={{ color: inactiveColor }}>Home</span>
              </>
            ) : (
              <>
                <Store size={22} color={inactiveColor} strokeWidth={2} />
                <span className="text-[11px] mt-1 font-semibold tracking-tight" style={{ color: inactiveColor }}>Market</span>
              </>
            )}
          </div>
        </button>

        {/* ── PÍLDORA CENTRAL ── */}
        <div
          className="pointer-events-auto flex items-center justify-between flex-1 mx-3 px-1.5"
          style={{ ...PILL_STYLE, borderRadius: "100px", height: "64px", zIndex: 51 }}
        >
          <RefractLayer filterId="lg-pill" />
          <SpecularTop />
          <LensBottom />
          <div className="flex items-center justify-between w-full relative" style={{ zIndex: 5 }}>
            {centerTabs.map((tab, idx) => {
              const isActive   = currentView === tab.id
              const isDisabled = !!tab.disabled
              const Icon       = tab.icon
              return (
                <button
                  key={`${tab.id}-${idx}`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setCurrentView(tab.id as any)}
                  onPointerDown={() => !isDisabled && setPressedId(tab.id)}
                  onPointerUp={() => setPressedId(null)}
                  onPointerLeave={() => setPressedId(null)}
                  className="relative flex flex-col items-center justify-center rounded-[100px] flex-1 h-[54px] select-none"
                  style={{
                    pointerEvents: isDisabled ? "none" : "auto",
                    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isActive ? "scale(1.06)" : pressedId === tab.id ? "scale(0.93)" : "scale(1)",
                    ...(isActive ? activePillStyle : {}),
                  }}
                >
                  {Icon ? (
                    <>
                      <Icon
                        size={22}
                        color={isActive ? neonBlue : inactiveColor}
                        strokeWidth={isActive ? 2.5 : 2}
                        className="transition-colors duration-300"
                      />
                      <span
                        className={`mt-1 tracking-tight text-[11px] transition-colors duration-300 ${isActive ? "font-bold" : "font-semibold"}`}
                        style={{ color: isActive ? neonBlue : inactiveColor }}
                      >
                        {tab.label}
                      </span>
                    </>
                  ) : (
                    <div className="w-[6px] h-[6px] rounded-full bg-white/10" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── BOTÓN DERECHO: Profile ── */}
        <button
          onClick={() => setCurrentView('profile')}
          onPointerDown={() => setPressedId("right")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto shrink-0"
          style={{
            ...BTN_BASE,
            width: "64px",
            height: "64px",
            borderRadius: "100px",
            zIndex: 51,
            transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <RefractLayer filterId="lg-circle" />
          <SpecularTop />
          <LensBottom />
          <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none" style={{ position: "relative", zIndex: 5 }}>
            {photoUrl ? (
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-[1px] border-white/10">
                <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <CircleUser
                  size={22}
                  color={currentView === 'profile' ? neonBlue : inactiveColor}
                  strokeWidth={currentView === 'profile' ? 2.5 : 2}
                />
                <span
                  className={`text-[11px] mt-1 tracking-tight ${currentView === 'profile' ? "font-bold" : "font-semibold"}`}
                  style={{ color: currentView === 'profile' ? neonBlue : inactiveColor }}
                >
                  Profile
                </span>
              </div>
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
          img.addEventListener('load',  checkDone, { once: true })
          img.addEventListener('error', checkDone, { once: true })
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
