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
import { AnalyticsView } from "@/components/analytics-view"
import { GroupSettingsView } from "@/components/group-settings-view"
import { ScheduleView } from "@/components/schedule-view"
import { PulseView } from "@/components/pulse-view" // Nueva pestaña de Red Social AI
import { useEffect, useState } from "react"
import { Home, Globe, Activity, CircleUser, Loader2 } from "lucide-react"

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
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ── Floating Liquid NavBar ────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  type Tab = { id: string; label: string; icon: any; disabled?: boolean }
  
  // Replicando la estética de iconos minimalistas de Telegram/X
  const tabs: Tab[] = [
    { id: "home",      label: "Home",      icon: Home },
    { id: "pulse",     label: "Pulse",     icon: Globe }, // Nuevo Tab "Pulse"
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "profile",   label: "Profile",   icon: CircleUser },
  ]

  // Actualiza las vistas principales que muestran la NavBar flotante
  // NOTA: 'pulse' no está aquí porque se maneja con renderizado condicional en AppContent
  const mainViews = ["home", "store", "analytics", "profile"]
  const activeTab = mainViews.includes(currentView) ? currentView : "home"

  function handleTab(id: string) {
    setCurrentView(id as any)
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
          padding: "6px",
          gap: "4px",
          background: "rgba(15, 15, 15, 0.75)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
        }}
      >
        {tabs.map(tab => {
          const isActive   = activeTab === tab.id
          const isDisabled = !!tab.disabled
          const Icon       = tab.icon

          return (
            <button
              key={tab.id}
              disabled={isDisabled}
              onClick={() => handleTab(tab.id)}
              className="relative flex items-center justify-center transition-all duration-300 active:scale-95"
              style={{
                opacity: isDisabled ? 0.25 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
                minWidth: isActive ? "105px" : "56px",
                height: "48px",
              }}
            >
              {isActive ? (
                <div
                  className="flex items-center gap-2 px-5 h-full w-full justify-center"
                  style={{
                    borderRadius: "100px",
                    background: "#ffffff",
                    boxShadow: "0 4px 15px rgba(255,255,255,0.2)",
                  }}
                >
                  {tab.id === "profile" && photoUrl ? (
                    <img src={photoUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <Icon size={18} color="#000000" strokeWidth={2.5} />
                  )}
                  <span className="text-black font-bold" style={{ fontSize: "14px", letterSpacing: "-0.02em" }}>
                    {tab.label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {tab.id === "profile" && photoUrl ? (
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

// ── App shell ──────────────────────────────────────────
function AppContent() {
  const { currentView, isLoading } = useApp()

  // NUEVA LÓGICA DE NAVEGACIÓN INTELIGENTE PARA xBLUM AI PULSE
  // 1. Definimos las vistas principales que NO son de Pulse
  const nonPulseMainViewsNav = ["home", "analytics", "store", "profile"]
  
  // 2. Definimos si estamos en la vista PRINCIPAL de Pulse
  const isPulseMainView = currentView === "pulse";

  // 3. Ocultamos la NavBar si estamos en vistas "profundas" de Pulse (comments, create, image, etc.))
  // Asegúrate de que las acciones profundas usen nombres de vista como "pulse_create" o "pulse_comment"
  const shouldHideNav = currentView.includes("create") || currentView.includes("reply") || currentView.includes("comment");
  
  // 4. Lógica final: Mostramos si es una vista principal (Pulse o No-Pulse) Y no estamos en sección profunda
  const showNav = (nonPulseMainViewsNav.includes(currentView) || isPulseMainView) && !shouldHideNav;

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeLoading, setFadeLoading] = useState(false)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()    
      try {
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

  useEffect(() => {
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

      images.forEach(img => {
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

  useEffect(() => {
    if (!isLoading && imagesLoaded) {
      setFadeLoading(true) 
      const t = setTimeout(() => setShowLoading(false), 400) 
      return () => clearTimeout(t)
    }
  }, [isLoading, imagesLoaded])

  return (
    <>
      {showLoading && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-400 ease-in-out ${fadeLoading ? "opacity-0" : "opacity-100"}`}
        >
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      <div 
        className="bg-black flex flex-col relative" 
        style={{ minHeight: "var(--tg-viewport-height, 100dvh)" }}
      >
        {/* Renderizado de Vistas */}
        {currentView === "home" && (<><Header /><HomeView /></>)}
        {currentView === "pulse" && <PulseView />} {/* Nueva pestaña de Red Social AI */}
        {currentView === "settings"  && <SettingsView />}
        {currentView === "store"     && <StoreView />}
        {currentView === "premium"   && <PremiumView />}
        {currentView === "referral"  && <ReferralView />}
        {currentView === "profile"   && <ProfileView />}
        {currentView === "x-rewards" && <XRewardsView />}
        {currentView === "analytics" && <AnalyticsView />}
        {currentView === "group-settings" && <GroupSettingsView />}
        {currentView === "schedule"  && <ScheduleView />}
        
        {/* Renderizado Condicional de la NavBar Flotante Inteligente */}
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
