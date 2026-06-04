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

// ── Helper para convertir HEX a RGBA dinámicamente ────────────────────
const hexToRgba = (hex: string, alpha = 1) => {
  if (!hex) return `rgba(255, 255, 255, ${alpha})`
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('')
  }
  const r = parseInt(cleanHex.slice(0, 2), 16)
  const g = parseInt(cleanHex.slice(2, 4), 16)
  const b = parseInt(cleanHex.slice(4, 6), 16)
  if (isNaN(r)) return `rgba(255, 255, 255, ${alpha})`
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ── Floating Liquid NavBar ────────────────────────────────────────────
function NavBar() {
  const { currentView, setCurrentView } = useApp()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  
  // Memoria del modo de navegación para cuando el usuario abra el Perfil
  const [storedNavMode, setStoredNavMode] = useState<'home' | 'market'>('home')

  // Estados para ocultar/mostrar la barra al hacer scroll
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Estado para el cristal dinámico realista
  const [glassStyles, setGlassStyles] = useState({
    background: "linear-gradient(135deg, rgba(30, 30, 30, 0.4) 0%, rgba(30, 30, 30, 0.15) 100%)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0,0,0,0.3)",
  })

  useEffect(() => {
    const user = getTgUser()
    if (user && user.photo_url) setPhotoUrl(user.photo_url)

    // Lógica dinámica de Telegram para el cristal líquido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tgParams = (window as any).Telegram?.WebApp?.themeParams || {}
    const bgColor = tgParams.bg_color || '#1e1e1e'
    
    // Chequeo de luminosidad para adaptar el cristal al tema (claro/oscuro)
    const r = parseInt(bgColor.replace('#','').slice(0, 2) || '1e', 16)
    const g = parseInt(bgColor.replace('#','').slice(2, 4) || '1e', 16)
    const b = parseInt(bgColor.replace('#','').slice(4, 6) || '1e', 16)
    const isDark = (r * 0.299 + g * 0.587 + b * 0.114) < 128

    const dynamicBgStart = hexToRgba(bgColor, isDark ? 0.35 : 0.6)
    const dynamicBgEnd = hexToRgba(bgColor, isDark ? 0.05 : 0.2)
    const dynamicBorderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'
    const topHighlight = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)'
    const shadowColor = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'

    setGlassStyles({
      background: `linear-gradient(135deg, ${dynamicBgStart} 0%, ${dynamicBgEnd} 100%)`,
      borderColor: dynamicBorderColor,
      boxShadow: `0 12px 40px ${shadowColor}, inset 0 1.5px 1px ${topHighlight}, inset 0 -1px 1px rgba(0,0,0,0.2)`,
    })
  }, [])

  // ── LÓGICA DE SCROLL PARA OCULTAR/MOSTRAR LA BARRA ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Umbral para ignorar pequeños rebotes (bounces) y no activar la animación por error
      if (Math.abs(currentScrollY - lastScrollY) < 10) return

      // Si hacemos scroll hacia abajo y hemos pasado un margen de 50px
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } else {
        // Si hacemos scroll hacia arriba o estamos en la cima
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Determinamos el modo síncronamente durante el render
  const isMarketSection = currentView === 'market' || currentView === 'shop' || currentView === 'levels'
  const isHomeSection = currentView === 'home'
  
  const activeNavMode = isMarketSection ? 'market' : (isHomeSection ? 'home' : storedNavMode)

  useEffect(() => {
    if (activeNavMode !== storedNavMode) {
      setStoredNavMode(activeNavMode)
    }
  }, [activeNavMode, storedNavMode])

  const handleLeftActionButton = () => {
    if (activeNavMode === 'market') {
      setCurrentView('home' as any)
    } else {
      setCurrentView('market' as any)
    }
  }

  // Pestañas dinámicas basadas en el MODO ACTIVO
  const centerTabs = activeNavMode === 'market' 
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

  // ── ESTILO CRISTAL ÓPTICO REALISTA (LIQUID GLASS) ──
  const liquidGlassStyle = {
    background: glassStyles.background, 
    backdropFilter: "blur(32px) saturate(250%) brightness(1.1) contrast(1.05)", 
    WebkitBackdropFilter: "blur(32px) saturate(250%) brightness(1.1) contrast(1.05)",
    border: `1px solid ${glassStyles.borderColor}`, 
    boxShadow: glassStyles.boxShadow,
    transform: "translateZ(0)", 
    WebkitTransform: "translateZ(0)",
  }

  // Colores de interfaz 
  const neonBlue = "#33b5f7" 
  const inactiveGlassText = "rgba(255, 255, 255, 0.6)" 

  return (
    <div
      id="main-nav-bar"
      className={`fixed left-0 right-0 z-50 flex justify-between items-center px-4 pointer-events-none transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-[150px]"
      }`}
      style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 20px)" }}
    >
      
      {/* ── BOTÓN IZQUIERDO: Market / Home ── */}
      <button
        onClick={handleLeftActionButton}
        className="pointer-events-auto flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
        style={{ ...liquidGlassStyle, width: "64px", height: "64px", borderRadius: "100px" }}
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
      </button>

      {/* ── PÍLDORA CENTRAL: Módulos Fijos ── */}
      <div
        className="pointer-events-auto flex items-center justify-between flex-1 mx-3 px-1.5"
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
              // Aumentamos el tiempo de transición para que el escalado sea fluido (ease-out)
              className="relative flex flex-col items-center justify-center transition-all duration-300 ease-out rounded-[100px] flex-1 h-[54px]"
              style={{
                pointerEvents: isDisabled ? "none" : "auto",
                // Fondo oscurecido transparente restaurado con la sombra interior del bisel blanco superior
                background: isActive ? "rgba(0, 0, 0, 0.4)" : "transparent",
                boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.2)" : "none",
                // Animación de crecimiento del botón (Gota/Lupa)
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
                <div className="w-[6px] h-[6px] rounded-full bg-white/10"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── BOTÓN DERECHO: Profile ── */}
      <button
        onClick={() => setCurrentView('profile')}
        className="pointer-events-auto flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
        style={{ ...liquidGlassStyle, width: "64px", height: "64px", borderRadius: "100px" }}
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
  const [isMaintenance, setIsMaintenance] = useState(false) // <-- Cambiar a true si necesitas activarlo

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
        {currentView === "account_setup" && <SettingsView initialPage="prefs" returnView="home" />}
        {currentView === "additional_details" && <SettingsView initialPage="additional_details" returnView="schedule" />}
        {currentView === "premium"   && <PremiumView />}
        {currentView === "referral"  && <ReferralView />}
        {currentView === "profile"   && <ProfileView />}
        {currentView === "x-rewards" && <XRewardsView />}
        {currentView === "market"    && <MarketView />}
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
