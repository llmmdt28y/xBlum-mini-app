"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import dynamic from "next/dynamic"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { ProfileView } from "@/components/profile-view"
import { ScheduleView } from "@/components/schedule-view"
import { GroupConfigView } from "@/components/group-config-view"

const LoadingFallback = () => <div className="flex-1 min-h-[100dvh] w-full bg-[#121212]" />;
const PremiumView = dynamic(() => import("@/components/premium-view").then(mod => mod.PremiumView), { loading: LoadingFallback })
const ReferralView = dynamic(() => import("@/components/referral-view").then(mod => mod.ReferralView), { loading: LoadingFallback })
const XRewardsView = dynamic(() => import("@/components/x-rewards-view").then(mod => mod.XRewardsView), { loading: LoadingFallback })
const MarketView = dynamic(() => import("@/components/market-view").then(mod => mod.MarketView), { loading: LoadingFallback })
const LevelsView = dynamic(() => import("@/components/levels-view").then(mod => mod.LevelsView), { loading: LoadingFallback })
const ShopView = dynamic(() => import("@/components/shop-view").then(mod => mod.ShopView), { loading: LoadingFallback })
import { useEffect, useState } from "react"
import { Compass, Target, Store, CircleUser, Loader2, Clock, Settings } from "lucide-react"

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
        <Image
          src="/steampunkjulia_agadsqcaakb7raq.webp"
          alt="Maintenance"
          width={192}
          height={192}
          draggable={false}
          className="object-contain pointer-events-none select-none"
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
      { id: "home",     label: "Discover",  icon: Compass,  disabled: false },
      { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
      { id: "settings_nav", label: "Settings", icon: Settings, disabled: false },
    ]

  const activeIndex = centerTabs.findIndex(t => t.id === currentView)

  const neonBlue      = "#3390ec"
  const inactiveColor = "rgba(255,255,255,0.9)"
  const safeBottom    = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 10px)"

  return (
    <>
      <div
        className="fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none mx-auto w-full max-w-[480px]"
        style={{ bottom: safeBottom }}
      >
        {/* ── PÍLDORA CENTRAL ── */}
        <div
          className="bg-[#1c1c1e] shadow-lg pointer-events-auto flex items-center justify-between flex-1 max-w-[290px] mr-3 px-1"
          style={{ borderRadius: "100px", height: "58px", zIndex: 51 }}
        >
          <div className="flex items-center justify-between w-full relative h-[52px]" style={{ zIndex: 10 }}>
            
            <div 
              className="absolute top-0 bottom-0"
              style={{
                width: `${100 / centerTabs.length}%`,
                transform: `translate3d(${activeIndex * 100}%, 0, 0) ${pressedId === centerTabs[activeIndex]?.id ? 'scale3d(0.93, 0.93, 1)' : 'scale3d(1, 1, 1)'}`,
                opacity: activeIndex >= 0 ? 1 : 0,
                transition: "transform 0.4s cubic-bezier(0.25, 1.15, 0.5, 1), opacity 0.3s ease",
                willChange: "transform",
                pointerEvents: "none",
                zIndex: 0
              }}
            >
              <div className="w-full h-full p-[2px]">
                <div className="w-full h-full rounded-[100px] sliding-pill" />
              </div>
            </div>

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
                  className={`relative flex flex-col items-center justify-center rounded-[100px] flex-1 h-[52px] select-none`}
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
                        className={`mt-1 tracking-tight text-[11px] transition-colors duration-300 relative z-10 font-sans ${isActive ? "font-bold" : "font-semibold"}`}
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
          className="bg-[#1c1c1e] shadow-lg pointer-events-auto shrink-0 p-0 m-0 outline-none"
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "100px",
            zIndex: 51,
            transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)"
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none relative" style={{ zIndex: 10 }}>
            {photoUrl ? (
              <div className="w-[44px] h-[44px] rounded-full overflow-hidden border border-[1px] border-white/10 relative z-10">
                <Image src={photoUrl} alt="User" fill sizes="44px" className="object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center relative z-10">
                <CircleUser
                  size={22}
                  color={currentView === 'profile' ? neonBlue : inactiveColor}
                  strokeWidth={currentView === 'profile' ? 2.5 : 2}
                />
                <span
                  className={`text-[11px] mt-1 tracking-tight font-sans ${currentView === 'profile' ? "font-bold" : "font-semibold"}`}
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
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      
      // Damos tiempo al puente nativo de Telegram para procesar el expand()
      setTimeout(() => {
        try {
          const platform = (tg.platform || '').toLowerCase()
          const isWeb = platform === 'web' || platform === 'weba' || platform === 'webk'
          
          if (!isWeb && typeof tg.requestFullscreen === 'function') {
            tg.requestFullscreen()
          }
        } catch (e) {}
      }, 100)
    }
  }, [])

  useEffect(() => {
    let loadedCount = 0
    const criticalAssets = [
      "/SuperNoir-Free-Banner.png",
      "/steampunkjulia_agadsqcaakb7raq.webp",
      "/noir-originalogo.png"
    ]
    const domImages = Array.from(document.images)
    const totalAssets = criticalAssets.length + domImages.length

    let animationFrameId: number
    const startTime = Date.now()
    const MIN_DURATION = 2500

    const step = () => {
      const elapsed = Date.now() - startTime
      const timeProgress = Math.min((elapsed / MIN_DURATION) * 100, 100)
      const assetProgress = totalAssets > 0 ? (loadedCount / totalAssets) * 100 : 100
      
      const currentProgress = Math.min(timeProgress, assetProgress)
      setLoadingProgress(currentProgress)

      if (currentProgress >= 100) {
        setImagesLoaded(true)
      } else {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    const updateCount = () => { loadedCount++ }

    criticalAssets.forEach(src => {
      const img = new window.Image()
      img.onload = updateCount
      img.onerror = updateCount
      img.src = src
    })

    domImages.forEach(img => {
      if (img.complete) {
        updateCount()
      } else {
        img.addEventListener('load', updateCount, { once: true })
        img.addEventListener('error', updateCount, { once: true })
      }
    })

    animationFrameId = requestAnimationFrame(step)

    const fallback = setTimeout(() => {
      setLoadingProgress(100)
      setImagesLoaded(true)
    }, 6000)

    return () => { 
      cancelAnimationFrame(animationFrameId)
      clearTimeout(fallback) 
    }
  }, [currentView, isMaintenance])

  useEffect(() => {
    if (!isLoading && imagesLoaded && loadingProgress >= 100) {
      setFadeLoading(true)
      const t = setTimeout(() => setShowLoading(false), 400)
      return () => clearTimeout(t)
    }
  }, [isLoading, imagesLoaded, loadingProgress])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [currentView])

  if (isMaintenance) {
    return <MaintenanceScreen onUnlock={() => setIsMaintenance(false)} />
  }

  return (
    <>
      {showLoading && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#111111] transition-opacity duration-400 ease-in-out ${
            fadeLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Logo with Shine Effect */}
          <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-6">
            <Image 
              src="/noir-originalogo.png" 
              alt="Loading" 
              fill
              className="object-contain grayscale brightness-[0.4] pointer-events-none select-none"
              draggable={false}
              style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
            {/* The sweeping shine element clipped to the logo silhouette */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                WebkitMaskImage: 'url("/noir-originalogo.png")',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url("/noir-originalogo.png")',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center'
              }}
            >
              <div 
                className="absolute top-0 left-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/50 to-transparent mix-blend-overlay"
                style={{
                  animation: "shine-sweep 2.5s infinite ease-in-out",
                  transformOrigin: "center"
                }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-[180px] h-[4px] bg-[#262626] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-[70ms] ease-out" 
              style={{ width: `${loadingProgress}%`, background: '#60a5fa' }}
            />
          </div>
        </div>
      )}

      <div
        className="flex flex-col relative mx-auto w-full max-w-[480px] bg-[#121212]"
        style={{ minHeight: "var(--tg-viewport-height, 100dvh)", overflowX: "hidden" }}
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
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.012 0.012"
              numOctaves="2" 
              seed="92" 
              result="noise" 
            />
            <feGaussianBlur 
              in="noise" 
              stdDeviation="2" 
              result="blurred" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="blurred" 
              scale="16"
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #121212; overflow-x: hidden; }
        html, body { background-color: #121212 !important; overflow-x: hidden; }



        .sliding-pill {
          background: rgba(51, 144, 236, 0.15);
          box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
        }

        @keyframes shine-sweep {
          0% { transform: translate(-100%, 50%) rotate(45deg); }
          100% { transform: translate(50%, -100%) rotate(45deg); }
        }
      `}} />

      <AppContent />
    </AppProvider>
  )
}
