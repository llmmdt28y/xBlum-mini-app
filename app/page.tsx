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
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAicAAACECAYAAABLR4u0AAAQAElEQVR4Aey9B5BlX9vVdd9+06dlWVqWlqVlaWlpqaWlllqGMpU555wzRswZUQyISs4555wzkiQICAjCJwiCyCeCCCICb27Wb/Vee569zz7n3tsz85/pmfNVr1nPs5619zn33O67Fz3z/nl4/NLl8fGLwhca/oAY/H7x72v4/8Xg94r/v4bfIwb/r/h3N/wuMfh/xL+z4f8W/46G3y4G/5f4tzX8n2LwDeLf2vB/iMFvEf/vDb9ZDH6T+H9r+I1i8BvE/2vDrxeDXyf+Xxq+Xgx+rRj8GvH/3PCrxeBXif+nhl8pBr9CDH65GPyP4l/W8EvF4JeIwf8gBr9Y/IsafqEY/AIx+O/F4OeLwc8Tg58rBj9HDH62GPx3YvCzxOBnisHPEIOfLgY/TQx+qhj8FDH4yWLhaz/p8vgV4UfCF37i5fH3C7/vJ1wef6/we3785fF3C7/rx10ef6fwO4Tf/mMvj79N+IYfc3n8rcJv+dGXx98s/CbhN/6oy+NvEH79j7w8/jrh64Vf+yMuj79G+NU//PL4q4RfKfyKH3Z5/OXCLxN+6Q+9PP4S4Rf/kMvjLxJ+ofALfvDl8ecLP0/4uT/o8vhzhJ8t/KwfeHn8mcLP+AGXx58u/DThp37/y+NPEX6y8JO+3+XxJwo/Qfjxwo/7vpfHHyv8GOFHf5/L448SfqTwI7735fGHCz8MfK/L4w8Vfojwg4Uf9D0vjz+w4Qd8j8vj9xe+X8P3/e6Xx+8jfO+G7/XdLo/fs+F7iL/7d708gu8m/q7gu1wev0vDdxZ/5+98efxOwnds+A7f6fIIvr0YfDvxt/uOl8dv2/BtxOBbf4fLY/CtVINv+e0vj+C/FQf/zbe7PIL/Whx8C9Xf4tteHsF/JQ6+uepv/m0uj8F/qTr4L7715bHiP1ff8a0uj//ZhG+m3viWl8dv1vCfimf8J9JmfFNpHdrnmwr/8YRvov6b6B6C/0h1xX+oew/+A9Udeo3/fsG/p9rQM/l3C/4d1eDf1rMM/i3V4N/U8wb/hjj41/W+gH9NDL6x+BvrvftXG/4VMfiX9T6Df0n8LwJ9D/wLDd9I/I30PfLPC/9cwz+r76F/puGfFv9T+j4D/6T4nxD+cX0fgn9M/I8K/4i+T8E/LP6H9L37Dwr/gPD3A31v/33C3yv8Pfqe/7uFv0v4O/Wz8HcIf7vwt+ln5G8V/hbhbxb+Jv0M/Y3C3yD89frZ+uuEv1b4a/Qz91cLf5V+Bv9K4a8Q/nL9bP5lwl8q/CX6mf2Lhb9I+Av1s/wXCH++frb/POHPFf4c/cz/2cKfJfyZ+iz4M4Q/XZ8Nf5rwpwp/ij4z/mThT9JnyJ8o/AnCH6/Plj9O+GP1WfPHCH+0Pnv+KOGPFP4IfSb94cIfps+oP1T4Q/SZ9Xnhs/oM+7TwKeGizzZDn3UXoM++C9Bn4QXos/EC9Fl5AfrsvAB9ll6APlsvQJ+1F6DP3gvQZ/EF6LP5AvRZfQH67L4AfZZfgD7bL0Cf9xegz/6LzgDjl1weL0BnxAXo3LgAnSGXX64Z+BVi8CvFQOfPBfwq9TqTLkDn1AXozLro7DK+XnOg8+0CdNZddOYZOgcvQGfiRWejofPyAnR2XnSGGjpXL0Bn7EVnraHz9wK+QfvrTL4AndMXoDP7orPb0Hl+ATrbLzrnDZ35F539hvLABSgbXJQRDOWGC1CGuChLGMoXF6CscfkDl0fjC2Lwxcvjw+XLl4vxlYnR34T2pvbJvaz2Ywbm2UqLZzVDC+KbOfPKt3iq/y3Xj1+9XL6ma3xF/CXxF8VfhAV6EO1LmqWHATM4M/jLzTewtC9rzz0NPXNq7geORv+Vtj66Ne27y1+7XHZnWvfVQL7UXym1NfVfq76p/1rpXatnHWvov6retfagN6gBM+FRwGNW3bl5eq9ZfHsa+hEu2iPzTf14uSxn0vUxMMz62jajB6yHjTZ7hHVda1f4U3iD5v1UY6/XDE/VqAH3CKgBftjQutrv1fbqenv8oPeE2UPxzJpn8pnl6ywta9FYZzSPa3k+XfpPq7dXmuvW40nvuszdy8ccfKbNqOvsM/LsQmt2Z23dZ/Xz+FnV4DOq8VNH7z0ezT1r9edg4XPRxbOWGTp1+PNtHVqvpX1ee/SeOtAML/fzIO1T6i/id47NWaBzdb6v2ZO++qKFmaWeeTVbaawD8+xNaW9qn3Z/D281mHARMN/0m9ay/96+6CC+MFoQLRx9xfGEV563qeUHsfAQRnRtAoYDiTwwAYPAYV0aNVqd0RtaP3DzEyDQO8vXa3mor8HBQh+S3afamtYTIq7W+BoIDAQFszTq7GFNe5vbjPmqJxx4Jr/r5id04EdzzRxoTt8x9yuPNIdGWGAth354rjn8Z81eHcjoHMRwR9Pp64yawz37udf18QFmRtMyN7On4DksD7rXUaPdAnk5wFlrtDUEEu+tuXVx98VTtVbXdfgB62FDa83N32fSCQWZ9Vr6RtPazAfWe00/4BateQgSXqueYEGN5hpN16Un1KBRG8xAm3uWXswh7cDCXL3nrfZM2sCa9X6n/qz0hA/2xp/+GhM67NFnROrOTaMnYAys+4xGMMmMgALqjB5PmBn3SFi5aB8HlZl1beufFOeMCB9dN55w9UYLX5vFNzPr3qY2700P5uveoD34jZqN80b04H3ycT9gdU/o4GjGHMRD/a4w/wBd63WfHHRfFXPIEzAcOtQTHkC0GkLwMIvWWdezDmsP9qSv3Os2p1+BcFF1+mBPz9ysD0Sz7iVBw710goJBLViXL8HCs7mXb5ir55C3Jm9qmBCC7hrfPC9a96BN4PBmPvPXdAjOGj3BIX76Xjc/GuCQhfEbuq57sWf4G9xLr3OCgNfJwzywB63APq2Px1zm7NUx+9Lf4HcomHyED3Rfs+1lLT5pzAN8mcPuq0fr0PEvZ/ISEpgD16wpujV66b1W3/2q0Q+h76fMCRyuZ631mSdk4EVL71rXHHqtrT0HNRi88iRoMNut8RU4aKiHvU41TB/MffTO+uwgbKRP3bnN6TuiNe5BRNcnjAy9tBpWuM6ntW74rYo8PvNuZa23/13w0dmUWbjeX7TwtVl8Yfypw+9Aewon7+DC/Q3Piw9zL8FKe91Z1r8O3/qNfauv3svOmhpGCA4JH5Wta300wgeBBDAzdC2zfJUJDvQrrtqX9YEYHzUzQ7pZ+yZUuF/oDhXSzfHPvXSHDekEBmrvSz/N2Ie5fYs5h33mruUhiPRaPWvpQeow2goc6ugc5GbtA4NZwwsSUKgH6NBjzaBpP2s7M8JBnXPw9vVawxx0j/bDA7pWfHgBe+ChnsG6rmW/xR72THMCgvXZLx+H/DzDH/h+mq9rbR/3bYbPvWYwe7L3gDZjPujskRn1hAdmTSMssNYsHQazlp7ZCgQH9HCtu6bv99QwASS+9GiudX/UBIXaW9OMMEJdZ3jRzbqWa7zUYKo59A3psNe1mr7+xiU1YWOotS9e66pXjDZAn13pHUpYJ811Y+Y1oGSGzvWGsKL1Podm1l7W4Xn2uj17vg28ybMye4W539ThT0B79dc6b+Ni7AnqC6IHKw0dPHfG2nux9832pvbZ27/q1AHXpRZzgPJvMggDBAzgWjPqAA3Qw/eAABG/a33ImHUP8AqEgarTG22tZ6qtaR+HChigg7lWTxgwWu11zWtdNSEDvfdoEwgHmbvWfjBAr1zrzNAMHTpm7Q9zaCdc0FdwaNPbEz/rBWbRYXrvwyxecWbMAw5b68zl57DNDF7NVx58VaeekevMOj3XAtSvAweC9jrmfTjIwazTD+v0LHg90WA8gJo9wNZzuRzN64zDnz3QHEp0z/QrHQ30ubz0FZ5JN+v++0xar6UTGujDtR40fU9nFh3eA4GjhpIECutcV/tlrWfqmRlznR4WEjo4/LsfvYA9ma+Q4PA53QdzelBr+ltAGImPukOfmejpqfk3Nfz1mYOI7rUzdaB1u39FhOdozuwe7O13zx5H3ueeq6t1R1qdpQ5zf6nDO9rTb06qCSN4HY31YLUH+usgb+DRHvHMfLRmns1rr/Wsv+apc+qgrX0Uc/hyuBM0BmhGiKgavxmJBgPm8C70AcD+zPnNh1n30bVW0zM3o7V17lUTEAgf9qi3Ll90Zq4129TxacbrJRQA+9uM3lBvxruC5oSCeFY1QYA5M+Bah4JZe6IZ0sxN47BmLYdy1bsmvz3xq88sOgy6Lg99B/0M7Xc059Ctcw5lwH0G9PhANNi6rhdGM3TNaDMzn7XX7Tn09/bgAGcOZg9awGsz9HqiwVlD7b14bYL7yZu5eZ7Rsy6gFxxWmkZAyFrrzDWL3rWie0YvsJa+Q1qvtQ+BgT3M6pm5ls8sDQaZ9Vo/G9S7KPMeKsp+hBnr0ggXBjXQ2tWMQGHIQ2jJGmrrWrdba0ZoiM+19jEzazX9CgSP6L3W5yZ1wLz/ZkV7RueavN5PyT+EEXncw/PsqD+a7e3FmlvxnD2y5tZr3OI7OuNXszu0p3BSb+LWxXXNm65veYjxhG+5h3jfBLPHDO4BbWa0GfL4r2qkc7ATKjo067XmBAgQjRp8UT+sMGAGD2hz9v+SajP7ldrhIlrTrU11AoZn8rMXdQ0Um1p7ZJ1n6gkEHdpnqcuH3n3qa01QSM+h3+vmQ4unsz7M8dF3SOu11rqWxmHsOprYGjPVmREQuBYzgI4Gqs7M0NrdWdubOYer/WgCPbD2tcsFpgfUAX3Fno5nM7vo/8q1lp5prhWvvu6ZNW/CAtcawK7XPJrvrY8OZ19qggA8aG0fNM/1HuGZQUDYm9cZASFro6MB1lvTNekrWMOsaq4nL0EDn1n3Gp4161oLA/aCVyBkzDoa4MCuM7QO/fz2WveSIGKtzeYgkpl1rSEUzHV+g4RH/A/8kXwzNMBwAAAABJRU5ErkJggg==" 
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            xChannelSelector="R" 
            yChannelSelector="G" 
            scale="89.44609085952717" 
          />
        </filter>
      </defs>
    </svg>

    {/* ── Estilos CSS Globales (Valores exactos del fragmento Aurora Gel) ── */}
    <style dangerouslySetInnerHTML={{ __html: `
      .liquid-glass-panel {
        position: relative;
        isolation: isolate;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 4px 8px;
        transform: translateZ(0);
        backdrop-filter: blur(5px) brightness(1.2) saturate(1.1);
        -webkit-backdrop-filter: blur(5px) brightness(1.2) saturate(1.1);
      }

      .liquid-glass-panel::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        box-shadow: rgba(0, 0, 0, 0.15) 0px -10px 25px inset, rgba(255, 255, 255, 0.1) 0px -1px 3px 1px inset;
        background-color: rgba(255, 255, 255, 0);
        pointer-events: none;
      }

      .liquid-glass-panel::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        backdrop-filter: blur(2px) brightness(1.1);
        -webkit-backdrop-filter: blur(2px) brightness(1.1);
        filter: url(#glass-distortion);
        -webkit-filter: url(#glass-distortion);
        pointer-events: none;
        mask-image: linear-gradient(to bottom, black 0%, transparent 20%, transparent 80%, black 100%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 20%, transparent 80%, black 100%);
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
