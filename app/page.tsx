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
import { Home, Target, Store, CircleUser, Loader2, Clock, Settings } from "lucide-react"

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
  const isHomeSection   = currentView === 'home'   || currentView === 'schedule' || currentView === 'settings_nav'
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
    { id: "settings_nav", label: "Settings", icon: Settings, disabled: false },
  ]

  const activeIndex = centerTabs.findIndex(t => t.id === currentView)

  const neonBlue      = "#33b5f7"
  const inactiveColor = "rgba(255,255,255,0.62)"
  const safeBottom    = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 10px)"

  return (
    <>
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
    className="liquid-glass-panel pointer-events-auto shrink-0"
    style={{
      width: "64px",
      height: "64px",
      borderRadius: "100px",
      zIndex: 51,
      transform: pressedId === "left" ? "scale(0.91)" : "scale(1)",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
    }}
    >
    <div className="flex flex-col items-center justify-center pointer-events-none select-none relative w-full h-full" style={{ zIndex: 10 }}>
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
    className="liquid-glass-panel pointer-events-auto flex items-center justify-between flex-1 mx-3 px-1.5"
    style={{ borderRadius: "100px", height: "64px", zIndex: 51 }}
    >
    <div className="flex items-center justify-between w-full relative h-[58px]" style={{ zIndex: 10 }}>
    
    {/* Fondo deslizante (Apple jelly effect) */}
    <div 
      className="absolute top-0 bottom-0 rounded-[100px] sliding-pill"
      style={{
        width: `${100 / centerTabs.length}%`,
        transform: `translate3d(${activeIndex * 100}%, 0, 0) ${pressedId === centerTabs[activeIndex]?.id ? 'scale3d(0.93, 0.93, 1)' : 'scale3d(1, 1, 1)'}`,
        opacity: activeIndex >= 0 ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.25, 1.15, 0.5, 1), opacity 0.3s ease",
        willChange: "transform",
        pointerEvents: "none",
        zIndex: 0
      }}
    />

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
        className={`relative flex flex-col items-center justify-center rounded-[100px] flex-1 h-[58px] select-none`}
        style={{
          pointerEvents: isDisabled ? "none" : "auto",
          transition: "transform 0.4s cubic-bezier(0.25, 1.15, 0.5, 1)",
          transform: pressedId === tab.id ? "scale3d(0.93, 0.93, 1)" : "translate3d(0, 0, 0)",
          willChange: "transform",
          zIndex: 10
        }}
        >
        {Icon ? (
          <>
          <Icon
          size={22}
          color={isActive ? neonBlue : inactiveColor}
          strokeWidth={isActive ? 2.5 : 2}
          className="transition-colors duration-300 relative z-10"
          />
          <span
          className={`mt-1 tracking-tight text-[11px] transition-colors duration-300 relative z-10 ${isActive ? "font-bold" : "font-semibold"}`}
          style={{ color: isActive ? neonBlue : inactiveColor }}
          >
          {tab.label}
          </span>
          </>
        ) : (
          <div className="w-[6px] h-[6px] rounded-full bg-white/10 relative z-10" />
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
    className="liquid-glass-panel pointer-events-auto shrink-0"
    style={{
      width: "64px",
      height: "64px",
      borderRadius: "100px",
      zIndex: 51,
      transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
    }}
    >
    <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none relative" style={{ zIndex: 10 }}>
    {photoUrl ? (
      <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-[1px] border-white/10 relative z-10">
      <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center relative z-10">
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
  const { currentView, setCurrentView, isLoading, isNavHidden } = useApp()
  const [isSettingsMain, setIsSettingsMain] = useState(true)
  const showNav = !isNavHidden && (["home", "levels", "market", "profile", "shop", "x-rewards", "schedule"].includes(currentView) || (currentView === "settings_nav" && isSettingsMain))

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
    {currentView === "settings_nav"       && <SettingsView returnView="home" onPageChange={(isMain) => setIsSettingsMain(isMain)} />}
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
    {/* ── Filtro SVG Global (Custom Liquid Glass) ── */}
    <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
      <defs>
        <filter id="glass-distortion" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feImage 
            width="100%" 
            height="100%" 
            preserveAspectRatio="none"
            xlinkHref="data:image/png;base64,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"
            result="glassMap"
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="glassMap"
            xChannelSelector="R" 
            yChannelSelector="G" 
            scale="48.700230958000276" 
          />
        </filter>
      </defs>
    </svg>

    {/* ── Estilos CSS Globales (Valores exactos del fragmento Aurora Gel) ── */}
    <style dangerouslySetInnerHTML={{ __html: `
      .liquid-glass-panel {
        position: relative;
        isolation: isolate;
        transform: translateZ(0);
        /* Exact user shadows and backdrop-filter */
        box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 8px, rgba(0, 0, 0, 0.15) 0px -10px 25px inset, rgba(255, 255, 255, 0.74) 0px -1px 4px 1px inset;
        backdrop-filter: url(#glass-distortion) blur(0.25px) brightness(1.5) saturate(1.1);
        -webkit-backdrop-filter: url(#glass-distortion) blur(0.25px) brightness(1.5) saturate(1.1);
        background-color: rgba(255, 255, 255, 0);
      }

      .sliding-pill {
        background: rgba(20, 20, 22, 0.35);
        box-shadow: 
          inset 0px 1.5px 1px rgba(255, 255, 255, 0.15), 
          inset 0px -1.5px 1px rgba(255, 255, 255, 0.05),
          0px 4px 10px rgba(0, 0, 0, 0.2);
      }
      `}} />


      <AppContent />
      </AppProvider>
  )
}
