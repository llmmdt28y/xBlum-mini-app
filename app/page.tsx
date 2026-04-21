"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { StoreView } from "@/components/store-view"
import { PremiumView } from "@/components/premium-view"
import { ReferralView } from "@/components/referral-view"
import { ProfileView } from "@/components/profile-view"
import { XRewardsView } from "@/components/x-rewards-view" 
[span_0](start_span)import { AnalyticsView } from "@/components/analytics-view" // Nueva importación[span_0](end_span)
import { useEffect, useState } from "react"
import { Home, Coins, Activity, CircleUser, Loader2 } from "lucide-react"

// ── Telegram user helper ──
[span_1](start_span)type TgUser = { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }[span_1](end_span)
[span_2](start_span)function getTgUser(): TgUser | undefined {[span_2](end_span)
  if (typeof window === "undefined") return undefined
  [span_3](start_span)return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined[span_3](end_span)
}

// ── Floating Liquid NavBar ──
function NavBar() {
  [span_4](start_span)const { currentView, setCurrentView } = useApp()[span_4](end_span)
  [span_5](start_span)const [photoUrl, setPhotoUrl] = useState<string | null>(null)[span_5](end_span)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  [span_6](start_span)type Tab = { id: string; label: string; icon: any; disabled?: boolean }[span_6](end_span)
  const tabs: Tab[] = [
    { id: "home",      label: "Home",      icon: Home },
    { id: "store",     label: "Store",     icon: Coins },
    { id: "analytics", label: "Moderation", icon: Activity }, // Activado para moderación
    { id: "profile",   label: "Profile",   icon: CircleUser },
  ]

  const mainViews = ["home", "store", "analytics", "profile"]
  [span_7](start_span)const activeTab = mainViews.includes(currentView) ? currentView : "home"[span_7](end_span)

  function handleTab(id: string) {
    [span_8](start_span)setCurrentView(id as any)[span_8](end_span)
  }

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 24px)" }}
    >
      <div
        className="pointer-events-auto flex items-center"
        style={{
          borderRadius: "100px",
          [span_9](start_span)padding: "6px",[span_9](end_span)
          gap: "4px",
          background: "rgba(15, 15, 15, 0.75)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          border: "1px solid rgba(255,255,255,0.08)",
          [span_10](start_span)boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",[span_10](end_span)
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              [span_11](start_span)key={tab.id}[span_11](end_span)
              onClick={() => handleTab(tab.id)}
              className="relative flex items-center justify-center transition-all duration-300 active:scale-95"
              style={{
                minWidth: isActive ? [span_12](start_span)"105px" : "56px",[span_12](end_span)
                height: "48px",
              }}
            >
              {isActive ? [span_13](start_span)(
                <div
                  className="flex items-center gap-2 px-5 h-full w-full justify-center"
                  style={{
                    borderRadius: "100px",
                    background: "#ffffff",[span_13](end_span)
                    boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
                  }}
                >
                  {tab.id === "profile" && photoUrl ? (
                    [span_14](start_span)<img src={photoUrl} alt="" className="w-5 h-5 rounded-full object-cover" />[span_14](end_span)
                  ) : (
                    <Icon size={18} color="#000000" strokeWidth={2.5} />
                  )}
                  <span className="text-black font-bold" style={{ fontSize: "14px", letterSpacing: "-0.02em" }}>
                    [span_15](start_span){tab.label}[span_15](end_span)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  [span_16](start_span){tab.id === "profile" && photoUrl ? ([span_16](end_span)
                    <img src={photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <Icon size={22} color="rgba(255,255,255,0.45)" strokeWidth={1.8} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── App shell ──
function AppContent() {
  [span_17](start_span)const { currentView, isLoading } = useApp()[span_17](end_span)
  [span_18](start_span)const showNav = ["home", "store", "analytics", "profile"].includes(currentView)[span_18](end_span)

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeLoading, setFadeLoading] = useState(false)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      [span_19](start_span)try {[span_19](end_span)
        if (tg.requestFullscreen) {
          tg.requestFullscreen()
        } else {
          tg.expand()
        }
      } catch (e) {
        tg.expand()
      }
    }
  }, [])

  [span_20](start_span)useEffect(() => {[span_20](end_span)
    const checkImages = () => {
      const images = Array.from(document.images)
      if (images.length === 0) {
        setImagesLoaded(true)
        return
      }

      let loadedCount = 0
      const checkDone = () => {
        loadedCount++
        if (loadedCount === images.length) setImagesLoaded(true)
      }

      [span_21](start_span)images.forEach(img => {[span_21](end_span)
        if (img.complete) {
          checkDone()
        } else {
          img.addEventListener('load', checkDone, { once: true })
          img.addEventListener('error', checkDone, { once: true }) 
        }
      })
    }

    const timer = setTimeout(checkImages, 50)
    const fallback = setTimeout(() => setImagesLoaded(true), 3000) 

    return () => {
      clearTimeout(timer)
      clearTimeout(fallback)
    }
  }, [currentView])

  [span_22](start_span)useEffect(() => {[span_22](end_span)
    if (!isLoading && imagesLoaded) {
      setFadeLoading(true)
      const t = setTimeout(() => setShowLoading(false), 400) 
      return () => clearTimeout(t)
    }
  }, [isLoading, imagesLoaded])

  return (
    <>
      {/* ── Pantalla de Carga ── */}
      {showLoading && (
        <div 
          [span_23](start_span)className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-400 ease-in-out ${fadeLoading ? "opacity-0" : "opacity-100"}`}[span_23](end_span)
        >
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* ── Contenido Principal ── */}
      <div 
        className="bg-black flex flex-col relative" 
        [span_24](start_span)style={{ minHeight: "var(--tg-viewport-height, 100dvh)" }}[span_24](end_span)
      >
        {currentView === "home" && (<><Header /><HomeView /></>)}
        {currentView === "settings"  && <SettingsView />}
        {currentView === "store"     && <StoreView />}
        {currentView === "premium"   && <PremiumView />}
        [span_25](start_span){currentView === "referral"  && <ReferralView />}[span_25](end_span)
        {currentView === "profile"   && <ProfileView />}
        {currentView === "x-rewards" && <XRewardsView />}
        
        {/* Integración de la vista de Moderación/Analytics */}
        [span_26](start_span){currentView === "analytics" && <AnalyticsView />}[span_26](end_span)
        
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
