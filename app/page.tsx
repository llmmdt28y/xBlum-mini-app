"use client"

import React, { useEffect, useState } from "react"
import { Home, Store, Clock, Target, CircleUser } from "lucide-react"

// ─────────────────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────────────────
type TgUser = { photo_url?: string }
function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ─────────────────────────────────────────────────────────
// SVG Liquid-Glass Defs
// FIX: feDisplacementMap con mapa radial (lente convexo real)
//      en lugar de feTurbulence de alta frecuencia (ruido granular)
// ─────────────────────────────────────────────────────────
function LiquidGlassDefs() {
  // Mapa de displacement radial generado como SVG inline → data URI
  // El gradiente radial simula la curvatura del vidrio:
  //   centro (#8080ff) = neutral → sin desplazamiento
  //   bordes (#4040c0) = azul desviado → refracción en edges
  const pillMap = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><defs><radialGradient id="g" cx="50%" cy="40%" r="58%"><stop offset="0%" stop-color="#8080ff"/><stop offset="55%" stop-color="#808080"/><stop offset="100%" stop-color="#3838b8"/></radialGradient></defs><rect width="200" height="80" fill="url(#g)"/></svg>`
  const circleMap = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><radialGradient id="g" cx="50%" cy="38%" r="60%"><stop offset="0%" stop-color="#8080ff"/><stop offset="52%" stop-color="#808080"/><stop offset="100%" stop-color="#3030a8"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>`

  const pillUri   = `data:image/svg+xml;base64,${typeof window !== "undefined" ? btoa(pillMap)   : ""}`
  const circleUri = `data:image/svg+xml;base64,${typeof window !== "undefined" ? btoa(circleMap) : ""}`

  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {/* Filtro pill — lente convexo para el contenedor largo */}
        <filter id="lg-pill" x="-8%" y="-20%" width="116%" height="140%" colorInterpolationFilters="sRGB">
          <feImage href={pillUri} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="20" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.6" />
        </filter>

        {/* Filtro círculo — lente convexo para botones laterales */}
        <filter id="lg-circle" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feImage href={circleUri} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="15" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Capas visuales reutilizables
// ─────────────────────────────────────────────────────────

// Franja brillante superior (specular highlight)
const SpecularTop = () => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      borderRadius: "inherit", zIndex: 2,
      background: "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.00) 40%)",
    }}
  />
)

// Acumulación de luz en borde inferior (lens bottom)
const LensBottom = () => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "38%", pointerEvents: "none",
      borderRadius: "inherit", zIndex: 2,
      background: "linear-gradient(0deg, rgba(255,255,255,0.11) 0%, transparent 100%)",
    }}
  />
)

// Capa de refracción SVG (actúa sobre el borde del elemento)
// FIX CLAVE: filter:url() en un div interno con backdrop-filter:blur(0px)
// para forzar stacking context en Chromium → el filtro distorsiona el FONDO
const RefractLayer = ({ filterId }: { filterId: string }) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute", inset: -1, pointerEvents: "none",
      borderRadius: "inherit", zIndex: 1,
      filter: `url(#${filterId})`,
      background: "rgba(255,255,255,0.025)",
      // blur(0px) fuerza compositing layer → feDisplacementMap accede al backdrop
      backdropFilter: "blur(0px)",
      WebkitBackdropFilter: "blur(0px)",
    }}
  />
)

// ─────────────────────────────────────────────────────────
// Estilos base (sin filter:url — movido a RefractLayer)
// ─────────────────────────────────────────────────────────
const pillBase: React.CSSProperties = {
  position: "relative",
  backdropFilter: "blur(26px) saturate(200%) brightness(1.10)",
  WebkitBackdropFilter: "blur(26px) saturate(200%) brightness(1.10)",
  backgroundColor: "rgba(15, 15, 25, 0.58)",
  borderRadius: 100,
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: [
    "inset 0 1.5px 1px rgba(255,255,255,0.38)",
    "inset 0 -1px 1px rgba(0,0,0,0.42)",
    "inset 1.5px 0 1px rgba(255,255,255,0.08)",
    "inset -1.5px 0 1px rgba(0,0,0,0.18)",
    "0 8px 36px rgba(0,0,0,0.58)",
    "0 2px 8px rgba(0,0,0,0.38)",
  ].join(", "),
  overflow: "hidden",
  isolation: "isolate",
}

const circleBase: React.CSSProperties = {
  position: "relative",
  width: 64,
  height: 64,
  borderRadius: "50%",
  backdropFilter: "blur(30px) saturate(220%) brightness(1.12)",
  WebkitBackdropFilter: "blur(30px) saturate(220%) brightness(1.12)",
  backgroundColor: "rgba(15, 15, 25, 0.58)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: [
    "inset 0 2px 1.5px rgba(255,255,255,0.42)",
    "inset 0 -1.5px 1px rgba(0,0,0,0.38)",
    "inset 1.5px 0 1px rgba(255,255,255,0.10)",
    "inset -1.5px 0 1px rgba(0,0,0,0.20)",
    "0 6px 28px rgba(0,0,0,0.55)",
    "0 2px 6px rgba(0,0,0,0.32)",
  ].join(", "),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
  flexShrink: 0,
  overflow: "hidden",
  isolation: "isolate",
  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
}

const activeTabStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: [
    "inset 0 1.5px 1px rgba(255,255,255,0.40)",
    "inset 0 -1px 1px rgba(0,0,0,0.20)",
    "0 2px 10px rgba(0,0,0,0.25)",
  ].join(", "),
}

// ─────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────
type View =
  | "home" | "schedule" | "market" | "shop" | "levels"
  | "profile" | "settings" | "premium" | "referral"
  | "x-rewards" | "account_setup" | "additional_details"
  | "group_config"

interface NavBarProps {
  currentView: View
  setCurrentView: (v: View) => void
}

// ─────────────────────────────────────────────────────────
// NavBar
// ─────────────────────────────────────────────────────────
export function NavBar({ currentView, setCurrentView }: NavBarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<"home" | "market">("home")
  const [pressedId, setPressedId] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  const isMarketSection =
    currentView === "market" || currentView === "shop" || currentView === "levels"
  const isHomeSection =
    currentView === "home" || currentView === "schedule"
  const activeNavMode =
    isMarketSection ? "market" : isHomeSection ? "home" : storedNavMode

  useEffect(() => {
    if (activeNavMode !== storedNavMode) setStoredNavMode(activeNavMode)
  }, [activeNavMode, storedNavMode])

  const handleLeftButton = () => {
    setCurrentView(activeNavMode === "market" ? "home" : "market")
  }

  const centerTabs =
    activeNavMode === "market"
      ? [
          { id: "market", label: "Market",    icon: Store,  disabled: false },
          { id: "shop",   label: "Shop",      icon: Target, disabled: false },
          { id: "levels", label: "BP Levels", icon: Target, disabled: false },
        ]
      : [
          { id: "home",     label: "Home",  icon: Home,  disabled: false },
          { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
          { id: "none2",    label: "",      icon: null,  disabled: true  },
        ]

  const BLUE   = "#33b5f7"
  const DIM    = "rgba(255,255,255,0.55)"
  const SAFE_B = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom,0px)) + 18px)"

  return (
    <>
      <LiquidGlassDefs />

      <div
        className="fixed left-0 right-0 z-50 flex justify-between items-center pointer-events-none"
        style={{ bottom: SAFE_B, padding: "0 14px" }}
      >
        {/* ── Botón izquierdo ── */}
        <button
          onClick={handleLeftButton}
          onPointerDown={() => setPressedId("left")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto"
          style={{
            ...circleBase,
            transform: pressedId === "left" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <RefractLayer filterId="lg-circle" />
          <SpecularTop />
          <LensBottom />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {activeNavMode === "market" ? (
              <>
                <Home size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>Home</span>
              </>
            ) : (
              <>
                <Store size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>Market</span>
              </>
            )}
          </div>
        </button>

        {/* ── Píldora central ── */}
        <div
          className="pointer-events-auto flex items-center flex-1 mx-3"
          style={{ ...pillBase, height: 64, padding: "0 6px" }}
        >
          <RefractLayer filterId="lg-pill" />
          <SpecularTop />
          <LensBottom />

          <div style={{ position: "relative", zIndex: 5, display: "flex", width: "100%" }}>
            {centerTabs.map((tab, idx) => {
              const isActive   = currentView === tab.id
              const isDisabled = !!tab.disabled
              const Icon       = tab.icon

              return (
                <button
                  key={`${tab.id}-${idx}`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setCurrentView(tab.id as View)}
                  onPointerDown={() => !isDisabled && setPressedId(tab.id)}
                  onPointerUp={() => setPressedId(null)}
                  onPointerLeave={() => setPressedId(null)}
                  className="relative flex flex-col items-center justify-center select-none"
                  style={{
                    flex: 1,
                    height: 54,
                    borderRadius: 100,
                    border: "none",
                    background: "transparent",
                    cursor: isDisabled ? "default" : "pointer",
                    pointerEvents: isDisabled ? "none" : "auto",
                    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease, box-shadow 0.25s ease",
                    transform: isActive
                      ? "scale(1.07)"
                      : pressedId === tab.id
                      ? "scale(0.93)"
                      : "scale(1)",
                    ...(isActive ? activeTabStyle : {}),
                  }}
                >
                  {Icon ? (
                    <>
                      <Icon
                        size={22}
                        color={isActive ? BLUE : DIM}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        style={{ transition: "color 0.25s ease" }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          marginTop: 3,
                          fontWeight: isActive ? 700 : 600,
                          letterSpacing: "-0.3px",
                          color: isActive ? BLUE : DIM,
                          transition: "color 0.25s ease",
                        }}
                      >
                        {tab.label}
                      </span>
                    </>
                  ) : (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Botón derecho: Profile ── */}
        <button
          onClick={() => setCurrentView("profile")}
          onPointerDown={() => setPressedId("right")}
          onPointerUp={() => setPressedId(null)}
          onPointerLeave={() => setPressedId(null)}
          className="pointer-events-auto"
          style={{
            ...circleBase,
            transform: pressedId === "right" ? "scale(0.91)" : "scale(1)",
          }}
        >
          <RefractLayer filterId="lg-circle" />
          <SpecularTop />
          <LensBottom />
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {photoUrl ? (
              <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.18)" }}>
                <img src={photoUrl} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <>
                <CircleUser
                  size={21}
                  color={currentView === "profile" ? BLUE : DIM}
                  strokeWidth={currentView === "profile" ? 2.5 : 1.8}
                />
                <span
                  style={{
                    fontSize: 10,
                    marginTop: 3,
                    fontWeight: currentView === "profile" ? 700 : 600,
                    letterSpacing: "-0.3px",
                    color: currentView === "profile" ? BLUE : DIM,
                  }}
                >
                  Profile
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </>
  )
}
