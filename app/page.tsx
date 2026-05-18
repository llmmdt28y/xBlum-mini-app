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
import { GroupSettingsView } from "@/components/group-settings-view"
import { ScheduleView } from "@/components/schedule-view"
import { LevelsView } from "@/components/levels-view" 
import { ShopView } from "@/components/shop-view" 
import { useEffect, useState } from "react"
import { Home, Target, Store, CircleUser, Loader2 } from "lucide-react" 

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

  // Función para desbloquear si se presiona 7 veces rápidamente en la esquina
  const handleSecretTap = () => {
    setTapCount(prev => {
      if (prev + 1 >= 7) {
        onUnlock()
        return 0
      }
      return prev + 1
    })
  }

  // Reiniciar los toques si pasan más de 1.5 segundos sin interacción
  useEffect(() => {
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 1500)
      return () => clearTimeout(timer)
    }
  }, [tapCount])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* Botón invisible en la esquina superior izquierda (Backdoor para Devs) */}
      <div 
        onClick={handleSecretTap} 
        className="absolute top-0 left-0 w-24 h-24 z-50"
      />

      {/* Contenedor protegido para la imagen */}
      <div className="relative mb-8 pointer-events-none select-none">
        <img 
          src="/steampunkjulia_agadsqcaakb7raq.webp" 
          alt="Maintenance" 
          draggable={false}
          className="w-48 h-48 object-contain pointer-events-none select-none"
          style={{ 
            WebkitUserSelect: "none", 
            WebkitTouchCallout: "none",
            userSelect: "none"
          }} 
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
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  // Verificamos si estamos en alguna de las vistas de Market para cambiar la lógica
  const isMarketView = currentView === 'market' || currentView === 'shop' || currentView === 'levels'

  const handleLeftActionButton = () => {
    if (isMarketView) {
      setCurrentView('home' as any)
    } else {
      setCurrentView('market' as any)
    }
  }

  // Pestañas dinámicas para la píldora central
  const centerTabs = isMarketView 
    ? [
        { id: "market", label: "Market", icon: Store, disabled: false },
        { id: "shop", label: "Shop", icon: Target, disabled: false },
        { id: "levels", label: "BP Levels", icon: Target, disabled: false },
      ]
    : [
        { id: "home", label: "Home", icon: Home, disabled: false },
        { id: "none1", label: "None", icon: null, disabled: true },
        { id: "none2", label: "None", icon: null, disabled: true },
      ]

  // Estilo Liquid Glass Premium (Más transparente, mate, optimizado nativamente con GPU)
  const liquidGlassStyle = {
    background: "rgba(20, 20, 20, 0.42)",
    backdropFilter: "blur(24px) saturate(170%) contrast(105%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%) contrast(105%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)",
    transform: "translateZ(0)", // Fuerza la renderización por GPU (Cero lag en Telegram Android)
    WebkitTransform: "translateZ(0)",
  }

  return (
    <div
      id="main-nav-bar"
      className="fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none transition-opacity duration-200"
      style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 20px)" }}
    >
      
      {/* ── BOTÓN IZQUIERDO: Market / Home (Estilo Vertical) ── */}
      <button
        onClick={handleLeftActionButton}
        className="pointer-events-auto flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
        style={{ ...liquidGlassStyle, width: "64px", height: "64px", borderRadius: "100px" }}
      >
        {isMarketView ? (
          <>
            <Home size={20} color="#24a1de" strokeWidth={2.2} />
            <span className="text-[#24a1de] text-[11px] mt-1 font-bold tracking-tight">Home</span>
          </>
        ) : (
          <>
            <Store size={20} color="rgba(255,255,255,0.85)" strokeWidth={1.8} />
            <span className="text-white text-[11px] mt-1 font-medium opacity-70 tracking-tight">Market</span>
          </>
        )}
      </button>

      {/* ── PÍLDORA CENTRAL: Módulos Fijos (Sin expansión, overlay azul transparente sin borde) ── */}
      <div
        className="pointer-events-auto flex items-center justify-between flex-1 mx-3 px-2"
        style={{ ...liquidGlassStyle, borderRadius: "100px", height: "64px" }}
      >
        {centerTabs.map((tab, idx) => {
          const isActive = currentView === tab.id || (tab.id === 'home' && currentView === 'home')
          const isDisabled = !!tab.disabled
          const Icon = tab.icon

          return (
            <button
              key={`${tab.id}-${idx}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && setCurrentView(tab.id as any)}
              className="relative flex flex-col items-center justify-center transition-all duration-200 rounded-[100px] flex-1 h-[52px]"
              style={{
                pointerEvents: isDisabled ? "none" : "auto",
                // Overlay azul más sutil y transparente, sin borde
                background: isActive ? "rgba(36, 161, 222, 0.12)" : "transparent",
              }}
            >
              {Icon ? (
                <>
                  <Icon 
                    size={20} 
                    color={isActive ? "#33b5f7" : "rgba(255,255,255,0.45)"} 
                    strokeWidth={isActive ? 2.3 : 1.8} 
                  />
                  <span 
                    className="mt-1 font-bold tracking-tight text-[11px]"
                    style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)" }}
                  >
                    {tab.label}
                  </span>
                </>
              ) : (
                // Indicador minimalista y elegante para los slots vacíos (None)
                <div className="w-[6px] h-[6px] rounded-full bg-white/15"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── BOTÓN DERECHO: Profile (Liquid Glass Frame) ── */}
      <button
        onClick={() => setCurrentView('profile')}
        className="pointer-events-auto flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
        style={{ ...liquidGlassStyle, width: "64px", height: "64px", borderRadius: "100px" }}
      >
        {photoUrl ? (
          <div 
            className="rounded-full overflow-hidden p-[2px]" 
            style={{ 
              background: currentView === 'profile' ? "rgba(36, 161, 222, 0.12)" : "rgba(255,255,255,0.1)",
            }}
          >
            <img src={photoUrl} alt="User" className="w-[46px] h-[46px] rounded-full object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <CircleUser 
              size={20} 
              color={currentView === 'profile' ? "#33b5f7" : "rgba(255,255,255,0.85)"} 
              strokeWidth={currentView === 'profile' ? 2.2 : 1.8} 
            />
            <span 
              className="text-[11px] mt-1 font-medium tracking-tight"
              style={{ color: currentView === 'profile' ? "#ffffff" : "rgba(255,255,255,0.7)" }}
            >
              Perfil
            </span>
          </div>
        )}
      </button>

    </div>
  )
}

// ── App shell ──────────────────────────────────────────
function AppContent() {
  const { currentView, isLoading } = useApp()
  const showNav = ["home", "levels", "market", "profile", "shop", "x-rewards"].includes(currentView)

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [fadeLoading, setFadeLoading] = useState(false)
  
  // Estado que controla si la pantalla de mantenimiento está activa
  const [isMaintenance, setIsMaintenance] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, [currentView, isMaintenance])

  useEffect(() => {
    if (!isLoading && imagesLoaded) {
      setFadeLoading(true) 
       const t = setTimeout(() => setShowLoading(false), 400) 
      return () => clearTimeout(t)
    }
  }, [isLoading, imagesLoaded])

  // Si está en mantenimiento, bloquear la app devolviendo solo la pantalla
  if (isMaintenance) {
    return <MaintenanceScreen onUnlock={() => setIsMaintenance(false)} />
  }

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
        {currentView === "levels" && <LevelsView />} 
        {currentView === "shop" && <ShopView />} 
        {currentView === "settings"  && <SettingsView />}
        {currentView === "premium"   && <PremiumView />}
        {currentView === "referral"  && <ReferralView />}
        {currentView === "profile"   && <ProfileView />}
        {currentView === "x-rewards" && <XRewardsView />}
        {currentView === "market"    && <MarketView />}
        {currentView === "group-settings" && <GroupSettingsView />}
        {currentView === "schedule"  && <ScheduleView />}
        
        {/* Renderizado de la NavBar */}
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
