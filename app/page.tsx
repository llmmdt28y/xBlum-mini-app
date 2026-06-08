"use client"

import React, { useEffect, useState } from "react"
import { Home, Store, Clock, Target, CircleUser } from "lucide-react"

// ─────────────────────────────────────────────────────────
// Types & helpers (mini stub — adáptalo a tu app-context)
// ─────────────────────────────────────────────────────────
type TgUser = { photo_url?: string }
function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

// ─────────────────────────────────────────────────────────
// SVG Liquid-Glass Filter  (feTurbulence + feDisplacementMap)
// Solo se renderiza UNA vez en el DOM, fuera del flujo visual.
// ─────────────────────────────────────────────────────────
function LiquidGlassDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ── Filtro para la píldora central ── */}
        <filter id="lg-pill" x="-5%" y="-5%" width="110%" height="110%"
          colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65 0.75"
            numOctaves="1"
            seed="2"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="grayNoise"
          />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="screen" result="lit" />
          <feComposite in="lit" in2="SourceGraphic" operator="in" result="clipped" />
          <feGaussianBlur in="clipped" stdDeviation="0.4" result="softLit" />
          <feBlend in="SourceGraphic" in2="softLit" mode="screen" />
        </filter>

        {/* ── Filtro de refracción para los botones laterales ── */}
        <filter id="lg-btn" x="-10%" y="-10%" width="120%" height="120%"
          colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 0.85"
            numOctaves="1"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.3" result="softDisp" />
          <feBlend in="SourceGraphic" in2="softDisp" mode="screen" />
        </filter>

        {/* ── Gradiente para specular highlight (borde superior brillante) ── */}
        <linearGradient id="lg-specular" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </linearGradient>

        {/* ── Gradiente para borde "lensing" inferior ── */}
        <linearGradient id="lg-lens-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// Estilos base
// ─────────────────────────────────────────────────────────

// Píldora central
const pillBase: React.CSSProperties = {
  position: "relative",
  backdropFilter: "blur(28px) saturate(220%) brightness(1.12)",
  WebkitBackdropFilter: "blur(28px) saturate(220%) brightness(1.12)",
  backgroundColor: "rgba(255,255,255,0.07)",
  borderRadius: 100,
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: [
    // Luz superior (specular)
    "inset 0 1.5px 1px rgba(255,255,255,0.40)",
    // Sombra interna inferior (profundidad)
    "inset 0 -1px 1px rgba(0,0,0,0.35)",
    // Rim light lateral izquierdo
    "inset 1.5px 0 1px rgba(255,255,255,0.10)",
    // Rim light lateral derecho (negativo)
    "inset -1.5px 0 1px rgba(0,0,0,0.20)",
    // Sombra proyectada
    "0 8px 32px rgba(0,0,0,0.55)",
    "0 2px 8px rgba(0,0,0,0.35)",
  ].join(", "),
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  overflow: "hidden",  // para el specular overlay
}

// Botón circular (izquierda / derecha)
const circleBase: React.CSSProperties = {
  position: "relative",
  width: 64,
  height: 64,
  borderRadius: "50%",
  backdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
  WebkitBackdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: [
    "inset 0 2px 1.5px rgba(255,255,255,0.45)",
    "inset 0 -1.5px 1px rgba(0,0,0,0.30)",
    "inset 1.5px 0 1px rgba(255,255,255,0.12)",
    "inset -1.5px 0 1px rgba(0,0,0,0.22)",
    "0 6px 24px rgba(0,0,0,0.50)",
    "0 2px 6px rgba(0,0,0,0.30)",
  ].join(", "),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
  flexShrink: 0,
  // Aplica el filtro SVG de refracción
  filter: "url(#lg-btn)",
  overflow: "hidden",
}

// Tab activo dentro de la píldora
const activeTabStyle: React.CSSProperties = {
  backdropFilter: "blur(20px) saturate(280%) brightness(1.25)",
  WebkitBackdropFilter: "blur(20px) saturate(280%) brightness(1.25)",
  backgroundColor: "rgba(255,255,255,0.13)",
  border: "1px solid rgba(255,255,255,0.20)",
  boxShadow: [
    "inset 0 2px 2px rgba(255,255,255,0.50)",
    "inset 0 -1px 1px rgba(0,0,0,0.25)",
    "0 2px 8px rgba(0,0,0,0.25)",
  ].join(", "),
}

// ─────────────────────────────────────────────────────────
// Componente NavBar
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
          { id: "market",  label: "Market",    icon: Store,  disabled: false },
          { id: "shop",    label: "Shop",      icon: Target, disabled: false },
          { id: "levels",  label: "BP Levels", icon: Target, disabled: false },
        ]
      : [
          { id: "home",     label: "Home",  icon: Home,  disabled: false },
          { id: "schedule", label: "Tasks", icon: Clock, disabled: false },
          { id: "none2",    label: "",      icon: null,  disabled: true  },
        ]

  const BLUE   = "#33b5f7"
  const DIM    = "rgba(255,255,255,0.55)"
  const SAFE_B = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom,0px)) + 18px)"

  // Specular overlay — franja brillante en la parte superior del cristal
  const specularOverlay = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.00) 42%)",
        zIndex: 10,
      }}
    />
  )

  // Lens bottom edge — efecto "lente" en borde inferior
  const lensEdge = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40%",
        pointerEvents: "none",
        borderRadius: "inherit",
        background: "linear-gradient(0deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
        zIndex: 10,
      }}
    />
  )

  return (
    <>
      {/* Filtros SVG ocultos */}
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
          {specularOverlay}
          {lensEdge}
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
          style={{
            ...pillBase,
            height: 64,
            padding: "0 6px",
          }}
        >
          {/* Specular strip */}
          {specularOverlay}
          {lensEdge}

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
                    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
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
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    />
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
          {specularOverlay}
          {lensEdge}
          <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {photoUrl ? (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                }}
              >
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
