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
import Script from "next/script"
import { useEffect, useState, useCallback } from "react"
import { Home, Target, Store, CircleUser, Loader2, Clock } from "lucide-react"

// ── Telegram user helper ──────────────────────────────────────────────
type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string
}

function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── Pantalla de Mantenimiento / Acceso Restringido ────────────────────
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

// ── Floating Liquid NavBar ────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<'home' | 'market'>('home')
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  // ── Scroll hide/show ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (Math.abs(currentScrollY - lastScrollY) < 10) return
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50)
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const isMarketSection = currentView === 'market' || currentView === 'shop' || currentView === 'levels'
  const isHomeSection = currentView === 'home' || currentView === 'schedule'
  const activeNavMode = isMarketSection ? 'market' : (isHomeSection ? 'home' : storedNavMode)

  useEffect(() => {
    if (activeNavMode !== storedNavMode) setStoredNavMode(activeNavMode)
  }, [activeNavMode, storedNavMode])

  const handleLeftActionButton = () => {
    setCurrentView(activeNavMode === 'market' ? 'home' as any : 'market' as any)
  }

  const centerTabs = activeNavMode === 'market'
    ? [
        { id: "market", label: "Market", icon: Store, disabled: false },
        { id: "shop",   label: "Shop",   icon: Target, disabled: false },
        { id: "levels", label: "BP Levels", icon: Target, disabled: false },
      ]
    : [
        { id: "home",     label: "Home",  icon: Home,  disabled: false },
        { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
        { id: "none2",    label: "None",  icon: null,  disabled: true  },
      ]

  const neonBlue = "#33b5f7"
  const inactiveGlassText = "rgba(255, 255, 255, 0.6)"

  // ── liquidGL init ──────────────────────────────────────────────────
  // FIXES aplicados según la documentación oficial:
  // 1. Usamos `target` en lugar de `selector` (API correcta)
  // 2. Los IDs están en los elementos raíz (button/div), no en hijos
  // 3. Los elementos NO son position:fixed (liquidGL los ignora por diseño)
  //    → el wrapper externo es fixed, los botones son relative dentro de él
  // 4. html2canvas se carga desde CDN con strategy="beforeInteractive"
  // 5. liquidGL se inicializa en el callback onLoad del <Script>
  //    para garantizar que ambas libs estén listas antes de llamar a liquidGL()
  // 6. Se usa data-liquid-ignore en el loading overlay para excluirlo del snapshot
  const initLiquidGL = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === "undefined" || !(window as any).liquidGL) return

    const targets = ["#liquid-btn-left", "#liquid-btn-center", "#liquid-btn-right"]
    const allFound = targets.every(sel => !!document.querySelector(sel))
    if (!allFound) return

    try {
      targets.forEach(target => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).liquidGL({
          target,           // ← "target", no "selector"
          snapshot: "body",
          resolution: 1.5,
          refraction: 0.01,
          bevelDepth: 0.08,
          bevelWidth: 0.15,
          frost: 2,
          shadow: true,
          specular: true,
          tilt: false,
          magnify: 1,
          reveal: "fade",
        })
      })
      console.log("[liquidGL] ✅ Inicializado correctamente")
    } catch (err) {
      console.error("[liquidGL] Error:", err)
    }
  }, [])

  // Re-inicializar cuando cambia la vista (el DOM se reescribe)
  useEffect(() => {
    // Esperamos 2 renders para que React haya pintado los botones
    const t = setTimeout(initLiquidGL, 500)
    return () => clearTimeout(t)
  }, [currentView, initLiquidGL])

  return (
    // ── WRAPPER FIXED ─────────────────────────────────────────────────
    // Este div es el que tiene position:fixed.
    // Los botones hijos son position:relative — liquidGL los puede procesar.
    <div
      id="main-nav-bar"
      className={`fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-[150px]"
      }`}
      style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 20px)" }}
    >

      {/* ── BOTÓN IZQUIERDO ── */}
      {/* position: relative (NO fixed) → liquidGL puede snapshotear este elemento */}
      <button
        id="liquid-btn-left"
        onClick={handleLeftActionButton}
        className="pointer-events-auto relative flex flex-col items-center justify-center active:scale-95 shrink-0"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "100px",
          // z-index alto para que el canvas de liquidGL quede sobre el contenido
          zIndex: 10,
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Contenido en z-index 3 para que quede sobre el canvas de liquidGL */}
        <div className="relative flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
          {activeNavMode === 'market' ? (
            <>
              <Home size={22} color={inactiveGlassText} strokeWidth={2} />
              <span className="text-[11px] mt-1 font-semibold tracking-tight" style={{ color: inactiveGlassText }}>Home</span>
            </>
          ) : (
            <>
              <Store size={22} color={inactiveGlassText} strokeWidth={2} />
              <span className="text-[11px] mt-1 font-semibold tracking-tight" style={{ color: inactiveGlassText }}>Market</span>
            </>
          )}
        </div>
      </button>

      {/* ── PÍLDORA CENTRAL ── */}
      {/* position: relative (NO fixed) → liquidGL puede snapshotear este elemento */}
      <div
        id="liquid-btn-center"
        className="pointer-events-auto relative flex items-center justify-between flex-1 mx-3 px-1.5"
        style={{
          borderRadius: "100px",
          height: "64px",
          zIndex: 10,
        }}
      >
        {/* Contenido en z-index 3 */}
        <div className="flex items-center justify-between w-full" style={{ position: "relative", zIndex: 3 }}>
          {centerTabs.map((tab, idx) => {
            const isActive = currentView === tab.id
            const isDisabled = !!tab.disabled
            const Icon = tab.icon

            return (
              <button
                key={`${tab.id}-${idx}`}
                disabled={isDisabled}
                onClick={() => !isDisabled && setCurrentView(tab.id as any)}
                className="relative flex flex-col items-center justify-center rounded-[100px] flex-1 h-[54px] active:scale-95"
                style={{
                  pointerEvents: isDisabled ? "none" : "auto",
                  transition: "all 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
                  background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2)" : "none",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
              >
                {Icon ? (
                  <>
                    <Icon
                      size={22}
                      color={isActive ? neonBlue : inactiveGlassText}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-colors duration-300 ${isActive ? "drop-shadow-md" : ""}`}
                    />
                    <span
                      className={`mt-1 tracking-tight text-[11px] transition-colors duration-300 ${isActive ? "font-bold" : "font-semibold"}`}
                      style={{ color: isActive ? neonBlue : inactiveGlassText }}
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
      {/* position: relative (NO fixed) → liquidGL puede snapshotear este elemento */}
      <button
        id="liquid-btn-right"
        onClick={() => setCurrentView('profile')}
        className="pointer-events-auto relative flex flex-col items-center justify-center active:scale-95 shrink-0"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "100px",
          zIndex: 10,
          transition: "transform 0.2s ease",
        }}
      >
        {/* Contenido en z-index 3 */}
        <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none" style={{ position: "relative", zIndex: 3 }}>
          {photoUrl ? (
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden shadow-inner border border-white/5">
              <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <CircleUser
                size={22}
                color={currentView === 'profile' ? neonBlue : inactiveGlassText}
                strokeWidth={currentView === 'profile' ? 2.5 : 2}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight ${currentView === 'profile' ? "font-bold" : "font-semibold"}`}
                style={{ color: currentView === 'profile' ? neonBlue : inactiveGlassText }}
              >
                Profile
              </span>
            </div>
          )}
        </div>
      </button>

    </div>
  )
}

// ── App shell ──────────────────────────────────────────
function AppContent() {
  const { currentView, isLoading } = useApp()
  const showNav = ["home", "levels", "market", "profile", "shop", "x-rewards", "schedule"].includes(currentView)

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeLoading, setFadeLoading] = useState(false)
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
          img.addEventListener('load', checkDone, { once: true })
          img.addEventListener('error', checkDone, { once: true })
        }
      })
    }
    const timer = setTimeout(checkImages, 50)
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
      {/* data-liquid-ignore excluye el loading overlay del snapshot de liquidGL */}
      {showLoading && (
        <div
          data-liquid-ignore
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-400 ease-in-out ${fadeLoading ? "opacity-0" : "opacity-100"}`}
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
        {currentView === "group_config"       && <GroupConfigView onClose={() => setCurrentView("home")} apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ""} />}

        {showNav && <NavBar />}
      </div>

      {/*
        ── Scripts de liquidGL ────────────────────────────────────────────
        IMPORTANTE:
        - html2canvas DEBE cargar antes que liquidGL (beforeInteractive)
        - liquidGL se inicializa en el onLoad callback cuando ambos están listos
        - El archivo liquidGL.js debe estar en /public/js/liquidGL.js
          (descargado desde https://github.com/naughtyduk/liquidGL/blob/main/scripts/liquidGL.js)
      */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/js/liquidGL.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Esperamos un tick para asegurar que el DOM de NavBar esté pintado
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(window as any).liquidGL) return
            const targets = ["#liquid-btn-left", "#liquid-btn-center", "#liquid-btn-right"]
            targets.forEach(target => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(window as any).liquidGL({
                  target,
                  snapshot: "body",
                  resolution: 1.5,
                  refraction: 0.01,
                  bevelDepth: 0.08,
                  bevelWidth: 0.15,
                  frost: 2,
                  shadow: true,
                  specular: true,
                  tilt: false,
                  magnify: 1,
                  reveal: "fade",
                })
              } catch (e) {
                console.error("[liquidGL] Error en target:", target, e)
              }
            })
          }, 800)
        }}
      />
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
