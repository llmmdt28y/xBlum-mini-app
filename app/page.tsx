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
        className="fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none mx-auto w-full max-w-[480px]"
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
            width: "60px",
            height: "60px",
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
          style={{ borderRadius: "100px", height: "60px", zIndex: 51 }}
        >
          <div className="flex items-center justify-between w-full relative h-[54px]" style={{ zIndex: 10 }}>
            
            {/* Fondo deslizante interno */}
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
            width: "60px",
            height: "60px",
            borderRadius: "100px",
            zIndex: 51,
            transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none relative" style={{ zIndex: 10 }}>
            {photoUrl ? (
              <div className="w-[46px] h-[46px] rounded-full overflow-hidden border border-[1px] border-white/10 relative z-10">
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
      try { tg.expand() } catch {}
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
          img.addEventListener('load', checkDone, { once: true })
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
        className="flex flex-col relative mx-auto w-full max-w-[480px]"
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
  const [displacementMap, setDisplacementMap] = useState<string>("")

  // Generador matemático del mapa de desplazamiento "Squircle" (Técnica Kube.io)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const size = 128 // Tamaño optimizado para GPU
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            let nx = (x / size) * 2 - 1 
            let ny = (y / size) * 2 - 1 
            
            // Aproximación de forma convexa (Squircle) para suavizar la refracción
            let dist = Math.pow(nx, 4) + Math.pow(ny, 4)
            
            if (dist > 1) {
              ctx.fillStyle = 'rgb(128,128,128)' // Neutro (sin distorsión)
              ctx.fillRect(x, y, 1, 1)
              continue
            }
            
            // Calculo de vectores normalizados limitados por la intensidad
            let mag = Math.sqrt(dist) 
            let dispX = nx * mag
            let dispY = ny * mag
            
            // Conversión de Vectores a Canales de Color RGBA (Donde 128 = 0 píxeles de desplazamiento)
            let r = Math.floor(128 + (dispX * 127))
            let g = Math.floor(128 + (dispY * 127))
            
            ctx.fillStyle = `rgb(${r},${g},128)`
            ctx.fillRect(x, y, 1, 1)
          }
        }
        setDisplacementMap(canvas.toDataURL())
      }
    }
  }, [])

  return (
    <AppProvider>
      {/* ── Filtro SVG Kube.io (Liquid Glass Refraction) ── */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <filter id="liquid-glass-filter" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            {/* 1. Cargar el mapa vectorial de refracción generado en JS */}
            <feImage href={displacementMap} result="displacement_map" width="100%" height="100%" preserveAspectRatio="none" />
            
            {/* 2. Aplicar la Ley de Snell virtual usando los canales R y G */}
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="displacement_map" 
              scale="25" /* Escala ajustada para una refracción realista sin romper bordes */
              xChannelSelector="R" 
              yChannelSelector="G" 
              result="refracted"
            />
            
            {/* 3. Suavizar ligeros artefactos de los bordes del mapa de bits */}
            <feGaussianBlur in="refracted" stdDeviation="0.8" result="final_glass" />
          </filter>
        </defs>
      </svg>

      {/* ── Estilos CSS Híbridos (Liquid Glass + Fallback iOS) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #1a1a1a; overflow-x: hidden; }

        /* 1. BASE: Estilo Glassmorphism estándar (Lo que verán los usuarios de iOS) */
        .liquid-glass-panel {
          position: relative;
          background: rgba(40, 40, 45, 0.4);
          backdrop-filter: blur(15px) saturate(1.2);
          -webkit-backdrop-filter: blur(15px) saturate(1.2);
          /* Specular Highlight simulado mediante sombras para no cargar la GPU */
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.4), 
            inset 0 -1px 2px rgba(0, 0, 0, 0.2), 
            0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* 2. MEJORA PROGRESIVA: Kube.io Liquid Glass (Solo para Android / Chromium) */
        @supports (backdrop-filter: url(#liquid-glass-filter)) {
          .liquid-glass-panel {
            background: transparent;
            border: none;
            backdrop-filter: url(#liquid-glass-filter);
            box-shadow: 
              inset 0 2px 3px rgba(255, 255, 255, 0.5), /* Fuerte Specular Rim superior */
              inset 0 -2px 5px rgba(255, 255, 255, 0.1), /* Rim inferior */
              0 10px 30px rgba(0, 0, 0, 0.4);
          }
        }

        .sliding-pill {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 
            inset 0px 1.5px 1px rgba(255, 255, 255, 0.2), 
            inset 0px -1.5px 1px rgba(0, 0, 0, 0.1),
            0px 4px 10px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}} />

      <AppContent />
    </AppProvider>
  )
}
