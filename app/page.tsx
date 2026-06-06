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
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
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
        <h1
          className="text-white text-[24px] font-bold tracking-tight"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
        >
          Currently working
        </h1>
        <p
          className="text-[#8e8e93] text-[17px] font-medium"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          come back later 🚀
        </p>
      </div>
    </div>
  )
}

// ── Floating Liquid NavBar ────────────────────────────────────────────
//
// FIXES aplicados:
//
// 1. Navbar SIEMPRE visible — se eliminó el scroll hide/show (translate-y).
//    Era la causa directa de la desaparición combinada con el reveal:"fade".
//
// 2. reveal: "none" en lugar de "fade" — con "fade" el canvas de liquidGL
//    arranca en opacity:0 y depende de que el snapshot asíncrono complete
//    para subir a opacity:1. Si algo falla (elementos fixed ignorados por
//    html2canvas, timeout, CORS) el navbar queda invisible forever.
//    Con "none" el canvas es visible desde el primer frame.
//
// 3. liquidReadyRef — init único de liquidGL, sin re-init por cambio de vista.
//
// 4. createPortal → hijos directos de <body> para que html2canvas
//    no atraviese stacking contexts fixed al tomar el snapshot.
//
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<'home' | 'market'>('home')

  // Navbar siempre visible — sin scroll hide/show.
  // El reveal:"fade" de liquidGL era el causante real de la desaparición:
  // el canvas WebGL arranca en opacity:0, toma el snapshot, y si algo falla
  // nunca sube a opacity:1. Al quitar el toggle de visibilidad el navbar
  // queda siempre renderizado independientemente del estado de liquidGL.
  const liquidReadyRef = useRef(false)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  // ── liquidGL: inicialización única ───────────────────────────────
  // Se ejecuta en cada render pero sale inmediatamente si ya inicializó
  // o si las condiciones no se cumplen. NO depende de currentView.
  useEffect(() => {
    if (liquidReadyRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === "undefined" || !(window as any).liquidGL) return

    const targets = ["#liquid-btn-left", "#liquid-btn-center", "#liquid-btn-right"]
    const allFound = targets.every(sel => !!document.querySelector(sel))
    if (!allFound) return

    try {
      targets.forEach(target => {
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
          reveal: "none", // "fade" causa que el canvas arranque en opacity:0 y nunca suba si el snapshot falla
        })
      })
      liquidReadyRef.current = true
      console.log("[liquidGL] ✅ Inicializado (único init)")
    } catch (err) {
      console.error("[liquidGL] Error:", err)
    }
  })

  // ── Nav mode logic ────────────────────────────────────────────────
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
        { id: "market", label: "Market",   icon: Store,  disabled: false },
        { id: "shop",   label: "Shop",     icon: Target, disabled: false },
        { id: "levels", label: "BP Levels",icon: Target, disabled: false },
      ]
    : [
        { id: "home",     label: "Home",  icon: Home,  disabled: false },
        { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
        { id: "none2",    label: "None",  icon: null,  disabled: true  },
      ]

  const neonBlue          = "#33b5f7"
  const inactiveGlassText = "rgba(255, 255, 255, 0.6)"

  // ── JSX del nav ──────────────────────────────────────────────────
  // FIX BUG #1 + #3:
  //   • createPortal() → renderizado como hijo directo de <body>
  //   • data-liquid-ignore en el wrapper → excluido del html2canvas snapshot
  //     (evita que el snapshot incluya el wrapper fixed que produciría artefactos)
  //   • Los botones target (#liquid-btn-*) NO tienen data-liquid-ignore
  //     → el renderer WebGL los procesa correctamente
  const navContent = (
    <div
      id="main-nav-bar"
      // FIX: data-liquid-ignore aquí para que liquidGL no intente snapshotear
      // este wrapper fixed. Los botones hijos siguen siendo targets válidos.
      data-liquid-ignore
      className="fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none"
      style={{
        bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 20px)",
      }}
    >

      {/* ── BOTÓN IZQUIERDO ── */}
      <button
        id="liquid-btn-left"
        onClick={handleLeftActionButton}
        className="pointer-events-auto relative flex flex-col items-center justify-center active:scale-95 shrink-0"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "100px",
          zIndex: 10,
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div
          className="relative flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 3 }}
        >
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
      <div
        id="liquid-btn-center"
        className="pointer-events-auto relative flex items-center justify-between flex-1 mx-3 px-1.5"
        style={{
          borderRadius: "100px",
          height: "64px",
          zIndex: 10,
        }}
      >
        <div className="flex items-center justify-between w-full" style={{ position: "relative", zIndex: 3 }}>
          {centerTabs.map((tab, idx) => {
            const isActive   = currentView === tab.id
            const isDisabled = !!tab.disabled
            const Icon       = tab.icon

            return (
              <button
                key={`${tab.id}-${idx}`}
                disabled={isDisabled}
                onClick={() => !isDisabled && setCurrentView(tab.id as any)}
                className="relative flex flex-col items-center justify-center rounded-[100px] flex-1 h-[54px] active:scale-95"
                style={{
                  pointerEvents: isDisabled ? "none" : "auto",
                  transition:    "all 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
                  background:    isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  boxShadow:     isActive
                    ? "0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2)"
                    : "none",
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
      <button
        id="liquid-btn-right"
        onClick={() => setCurrentView('profile')}
        className="pointer-events-auto relative flex flex-col items-center justify-center active:scale-95 shrink-0"
        style={{
          width:        "64px",
          height:       "64px",
          borderRadius: "100px",
          zIndex:       10,
          transition:   "transform 0.2s ease",
        }}
      >
        <div
          className="flex flex-col items-center justify-center w-full h-full pointer-events-none"
          style={{ position: "relative", zIndex: 3 }}
        >
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

  // FIX BUG #1: Portal → los botones son hijos directos de <body>.
  // html2canvas ya no atraviesa un stacking context fixed ignorado.
  // SSR-safe: createPortal solo corre en el cliente.
  if (typeof window === "undefined") return null
  return createPortal(navContent, document.body)
}

// ── App shell ──────────────────────────────────────────────────────────
function AppContent() {
  const { currentView, setCurrentView, isLoading } = useApp()
  const showNav = ["home", "levels", "market", "profile", "shop", "x-rewards", "schedule"].includes(currentView)

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showLoading,  setShowLoading]  = useState(true)
  const [fadeLoading,  setFadeLoading]  = useState(false)
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
      {/* data-liquid-ignore excluye el loading overlay del snapshot de liquidGL */}
      {showLoading && (
        <div
          data-liquid-ignore
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

        {/* NavBar se renderiza via portal en <body> — ver componente NavBar */}
        {showNav && <NavBar />}
      </div>

      {/*
        ── Scripts de liquidGL ─────────────────────────────────────────────
        IMPORTANTE:
        - html2canvas DEBE cargar antes que liquidGL → strategy="beforeInteractive"
        - liquidGL se carga con strategy="afterInteractive"
        - NO hay onLoad aquí: el componente NavBar maneja su propio init
          con liquidReadyRef para garantizar una sola inicialización.
        - El archivo liquidGL.js debe estar en /public/js/liquidGL.js
      */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/js/liquidGL.js"
        strategy="afterInteractive"
        // FIX BUG #2: Sin onLoad duplicado aquí.
        // NavBar.useEffect() detecta window.liquidGL en cada render
        // y se auto-inicializa la primera vez que la librería está disponible.
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
