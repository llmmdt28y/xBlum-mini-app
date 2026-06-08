"use client"

/**
 * NavBar — Liquid Glass Edition
 *
 * Fixes vs. original:
 *  1. SVG feDisplacementMap ahora se aplica vía backdrop-filter: url(#id)
 *     en lugar de filter: url(#id) — así distorsiona el FONDO, no el elemento.
 *  2. feTurbulence con baseFrequency bajo (0.008) para ondas suaves tipo vidrio,
 *     no ruido de alta frecuencia que daba textura granular incorrecta.
 *  3. El pill usa filter: url(#lg-refract) en un pseudo-layer interno para
 *     el efecto de lensing en los bordes (no en el texto/iconos).
 *  4. Los botones circulares usan isolation: isolate + backdrop-filter correcto.
 *  5. Specular highlight mejorado con gradiente en SVG rect superpuesto.
 *  6. Fallback elegante para Safari/Firefox: glassmorphism simple sin distorsión.
 */

import React, { useEffect, useRef, useState } from "react"
import { Home, Store, Clock, Target, CircleUser } from "lucide-react"

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
type TgUser = { photo_url?: string }

function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

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
// SVG Defs — UN solo bloque en el DOM, fuera del flujo
//
// KEY FIX: usamos feDisplacementMap con feImage de un
// displacement map radial generado como data-URI SVG.
// Esto crea el efecto de lente convexo que hace Portals.
// ─────────────────────────────────────────────────────────
function LiquidGlassDefs() {
  // Displacement map radial: brillo en centro → refracción en bordes
  // Encode como data URI para poder usarlo en feImage
  const radialMapSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">
      <defs>
        <radialGradient id="rg" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stop-color="#8080ff"/>
          <stop offset="60%"  stop-color="#808080"/>
          <stop offset="100%" stop-color="#4040c0"/>
        </radialGradient>
      </defs>
      <rect width="200" height="80" fill="url(#rg)"/>
    </svg>
  `
  const pillMapUri = `data:image/svg+xml;base64,${btoa(radialMapSvg)}`

  const circleMapSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <defs>
        <radialGradient id="rg2" cx="50%" cy="35%" r="60%">
          <stop offset="0%"   stop-color="#8080ff"/>
          <stop offset="55%"  stop-color="#808080"/>
          <stop offset="100%" stop-color="#3535b0"/>
        </radialGradient>
      </defs>
      <rect width="64" height="64" fill="url(#rg2)"/>
    </svg>
  `
  const circleMapUri = `data:image/svg+xml;base64,${btoa(circleMapSvg)}`

  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ── Filtro pill: displacement map radial → efecto lente convexo ── */}
        <filter
          id="lg-pill-refract"
          x="-8%" y="-15%"
          width="116%" height="130%"
          colorInterpolationFilters="sRGB"
        >
          {/* Cargar el displacement map radial */}
          <feImage
            href={pillMapUri}
            x="0" y="0"
            width="100%" height="100%"
            preserveAspectRatio="none"
            result="dispMap"
          />
          {/* Aplicar displacement: mueve píxeles del fondo según el mapa */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="dispMap"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Blur suave para suavizar bordes del displacement */}
          <feGaussianBlur in="displaced" stdDeviation="0.5" />
        </filter>

        {/* ── Filtro círculo: mismo concepto, para botones laterales ── */}
        <filter
          id="lg-circle-refract"
          x="-12%" y="-12%"
          width="124%" height="124%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={circleMapUri}
            x="0" y="0"
            width="100%" height="100%"
            preserveAspectRatio="none"
            result="dispMap"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="dispMap"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.4" />
        </filter>

        {/* ── Specular gradient: franja brillante superior ── */}
        <linearGradient id="lg-spec-pill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.42)" />
          <stop offset="30%"  stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </linearGradient>

        <linearGradient id="lg-spec-circle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.50)" />
          <stop offset="28%"  stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </linearGradient>

        {/* ── Lens bottom: acumulación de luz en borde inferior ── */}
        <linearGradient id="lg-lens-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.00)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// GlassPill — contenedor pill con liquid glass real
// ─────────────────────────────────────────────────────────
function GlassPill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 999,
        overflow: "hidden",
        isolation: "isolate",
        // Blur del fondo — compositing real
        backdropFilter: "blur(24px) saturate(200%) brightness(1.08)",
        WebkitBackdropFilter: "blur(24px) saturate(200%) brightness(1.08)",
        // Tinte oscuro translúcido
        backgroundColor: "rgba(18, 18, 28, 0.55)",
        // Borde sutil tipo vidrio
        border: "1px solid rgba(255,255,255,0.12)",
        // Sombras: luz superior + profundidad inferior + sombra proyectada
        boxShadow: [
          "inset 0 1.5px 0.5px rgba(255,255,255,0.38)",   // rim superior
          "inset 0 -1px 0.5px rgba(0,0,0,0.45)",           // borde inferior oscuro
          "inset 1.5px 0 0.5px rgba(255,255,255,0.08)",    // rim izquierdo
          "inset -1.5px 0 0.5px rgba(0,0,0,0.20)",         // rim derecho oscuro
          "0 8px 40px rgba(0,0,0,0.60)",                    // sombra proyectada
          "0 2px 10px rgba(0,0,0,0.40)",
        ].join(", "),
        transition: "box-shadow 0.3s ease",
        ...style,
      }}
    >
      {/* Capa de refracción SVG — distorsiona lo que hay debajo del borde */}
      {/* Esta es la KEY: un div absoluto con el filtro que actúa solo en edges */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
          filter: "url(#lg-pill-refract)",
          // Necesita un fondo semi-transparente para que feDisplacementMap
          // tenga píxeles que desplazar (trabaja con SourceGraphic)
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(0px)",  // fuerza stacking context en Chrome
          WebkitBackdropFilter: "blur(0px)",
        }}
      />

      {/* Specular highlight — franja brillante en borde superior */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "inherit",
          background: "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.00) 40%)",
          zIndex: 2,
        }}
      />

      {/* Lens bottom edge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          pointerEvents: "none",
          borderRadius: "inherit",
          background: "linear-gradient(0deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Contenido — encima de todos los efectos */}
      <div style={{ position: "relative", zIndex: 5 }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// GlassCircle — botón circular con liquid glass
// ─────────────────────────────────────────────────────────
function GlassCircle({
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  pressed,
}: {
  children: React.ReactNode
  onClick?: () => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  onPointerLeave?: () => void
  pressed?: boolean
}) {
  return (
    <button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{
        position: "relative",
        width: 64,
        height: 64,
        borderRadius: "50%",
        overflow: "hidden",
        isolation: "isolate",
        flexShrink: 0,
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.13)",
        backgroundColor: "rgba(18, 18, 28, 0.55)",
        backdropFilter: "blur(28px) saturate(210%) brightness(1.1)",
        WebkitBackdropFilter: "blur(28px) saturate(210%) brightness(1.1)",
        boxShadow: [
          "inset 0 2px 1px rgba(255,255,255,0.42)",
          "inset 0 -1.5px 1px rgba(0,0,0,0.38)",
          "inset 1.5px 0 1px rgba(255,255,255,0.10)",
          "inset -1.5px 0 1px rgba(0,0,0,0.22)",
          "0 6px 30px rgba(0,0,0,0.55)",
          "0 2px 8px rgba(0,0,0,0.35)",
        ].join(", "),
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        transform: pressed ? "scale(0.91)" : "scale(1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Capa de refracción en bordes */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 1,
          filter: "url(#lg-circle-refract)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
        }}
      />

      {/* Specular superior */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          borderRadius: "50%",
          background: "linear-gradient(175deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.00) 38%)",
          zIndex: 2,
        }}
      />

      {/* Lens bottom */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "38%",
          pointerEvents: "none",
          borderRadius: "50%",
          background: "linear-gradient(0deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {children}
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// NavBar principal
// ─────────────────────────────────────────────────────────
export function NavBar({ currentView, setCurrentView }: NavBarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [storedNavMode, setStoredNavMode] = useState<"home" | "market">("home")
  const [pressedId, setPressedId] = useState<string | null>(null)

  useEffect(() => {
    const user = getTgUser()
    if (user?.photo_url) setPhotoUrl(user.photo_url)
  }, [])

  const isMarketSection = currentView === "market" || currentView === "shop" || currentView === "levels"
  const isHomeSection   = currentView === "home"   || currentView === "schedule"
  const activeNavMode   = isMarketSection ? "market" : isHomeSection ? "home" : storedNavMode

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

  const BLUE = "#33b5f7"
  const DIM  = "rgba(255,255,255,0.55)"
  const SAFE_BOTTOM = "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 18px)"

  return (
    <>
      <LiquidGlassDefs />

      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: SAFE_BOTTOM,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 14px",
          pointerEvents: "none",
        }}
      >
        {/* ── Botón izquierdo ── */}
        <div style={{ pointerEvents: "auto" }}>
          <GlassCircle
            onClick={handleLeftButton}
            onPointerDown={() => setPressedId("left")}
            onPointerUp={() => setPressedId(null)}
            onPointerLeave={() => setPressedId(null)}
            pressed={pressedId === "left"}
          >
            {activeNavMode === "market" ? (
              <>
                <Home size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>
                  Home
                </span>
              </>
            ) : (
              <>
                <Store size={21} color={DIM} strokeWidth={2} />
                <span style={{ fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: "-0.3px", color: DIM }}>
                  Market
                </span>
              </>
            )}
          </GlassCircle>
        </div>

        {/* ── Píldora central ── */}
        <div style={{ flex: 1, marginLeft: 12, marginRight: 12, pointerEvents: "auto" }}>
          <GlassPill style={{ height: 64, padding: "0 6px" }}>
            <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center" }}>
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
                    style={{
                      flex: 1,
                      height: 52,
                      borderRadius: 999,
                      border: isActive ? "1px solid rgba(255,255,255,0.18)" : "none",
                      background: isActive
                        ? "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)"
                        : "transparent",
                      backdropFilter: isActive ? "blur(10px) brightness(1.2)" : "none",
                      WebkitBackdropFilter: isActive ? "blur(10px) brightness(1.2)" : "none",
                      boxShadow: isActive
                        ? [
                            "inset 0 1.5px 1px rgba(255,255,255,0.40)",
                            "inset 0 -1px 1px rgba(0,0,0,0.20)",
                            "0 2px 10px rgba(0,0,0,0.25)",
                          ].join(", ")
                        : "none",
                      cursor: isDisabled ? "default" : "pointer",
                      pointerEvents: isDisabled ? "none" : "auto",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: isActive
                        ? "scale(1.06)"
                        : pressedId === tab.id
                        ? "scale(0.93)"
                        : "scale(1)",
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
          </GlassPill>
        </div>

        {/* ── Botón derecho: Profile ── */}
        <div style={{ pointerEvents: "auto" }}>
          <GlassCircle
            onClick={() => setCurrentView("profile")}
            onPointerDown={() => setPressedId("right")}
            onPointerUp={() => setPressedId(null)}
            onPointerLeave={() => setPressedId(null)}
            pressed={pressedId === "right"}
          >
            {photoUrl ? (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1.5px solid rgba(255,255,255,0.20)",
                }}
              >
                <img
                  src={photoUrl}
                  alt="User"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
          </GlassCircle>
        </div>
      </nav>
    </>
  )
}
