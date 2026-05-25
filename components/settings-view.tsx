"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { 
  IoChevronForward, IoCheckmark, IoGlobe, IoColorWand, IoPerson, 
  IoLockClosed, IoServer, IoDocumentText, IoShieldCheckmark, 
  IoChatbubble, IoChevronDown, IoClose, IoTrash, IoSync, IoSparkles,
  IoWalletOutline, IoCall, IoPersonOutline, IoLockClosedOutline,
  IoListOutline
} from "react-icons/io5"
import { useState, useEffect } from "react"
import React from "react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Estilos Globales para el Efecto Ripple (Restaurado a la versión original) ──
const RIPPLE_STYLE = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 600ms linear;
    background-color: rgba(150, 150, 150, 0.25);
    pointer-events: none;
    z-index: 0;
  }
  @keyframes ripple-anim {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`

// ── Función Helper para crear el Efecto Ripple ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createRipple = (event: React.PointerEvent<any>) => {
  const element = event.currentTarget
  if (element.disabled) return

  const circle = document.createElement("span")
  const diameter = Math.max(element.clientWidth, element.clientHeight)
  const radius = diameter / 2

  const rect = element.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top = `${event.clientY - rect.top - radius}px`
  circle.classList.add("ripple")

  const existingRipple = element.querySelector(".ripple")
  if (existingRipple) {
    existingRipple.remove()
  }

  element.appendChild(circle)

  setTimeout(() => {
    circle.remove()
  }, 600)
}

// ── Data ──
const GENDERS = ["Female", "Male"]

const TIMEZONES = [
  { name: "Baker Island", offset: "UTC-12" },
  { name: "Pago Pago (American Samoa)", offset: "UTC-11" },
  { name: "Honolulu", offset: "UTC-10" },
  { name: "Anchorage", offset: "UTC-9" },
  { name: "Los Angeles", offset: "UTC-8" },
  { name: "Denver", offset: "UTC-7" },
  { name: "Chicago", offset: "UTC-6" },
  { name: "New York", offset: "UTC-5" },
  { name: "Santiago", offset: "UTC-4" },
  { name: "Buenos Aires", offset: "UTC-3" },
  { name: "South Georgia", offset: "UTC-2" },
  { name: "Azores", offset: "UTC-1" },
  { name: "London", offset: "UTC+0" },
  { name: "Paris", offset: "UTC+1" },
  { name: "Cairo", offset: "UTC+2" },
  { name: "Moscow", offset: "UTC+3" },
  { name: "Dubai", offset: "UTC+4" },
  { name: "Karachi", offset: "UTC+5" },
  { name: "Dhaka", offset: "UTC+6" },
  { name: "Bangkok", offset: "UTC+7" },
  { name: "Beijing", offset: "UTC+8" },
  { name: "Tokyo", offset: "UTC+9" },
  { name: "Sydney", offset: "UTC+10" },
  { name: "Noumea", offset: "UTC+11" },
  { name: "Auckland", offset: "UTC+12" },
]

// ── Tipos y Helpers para Usuario de Telegram ──
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

const MODEL_LOGO: Record<string, string> = {
  "Grok 4.3": "/grok.png",
  "Grok 4.1": "/grok.png",
  "Grok 4":   "/grok.png",   // DB legacy alias
  "GPT-5.4":  "/gpt.png",
  "GPT-5.2":  "/gpt.png",
}

interface ModelTokenInfo {
  used:      number
  limit:     number
  mins_left: number
  pct:       number
}

const MODELS: {
  name: string
  desc: string
  tag: string | null
  tagColor: string
  tagStyle?: string
  proOnly: boolean
  initial: string
}[] = [
  {
    name: "Grok 4.3",
    desc: "Latest capabilities with advanced intelligence",
    tag: "New",
    tagColor: "bg-white text-[#111]",
    tagStyle: "rounded-md",
    proOnly: false,
    initial: "G",
  },
  {
    name: "Grok 4.1",
    desc: "Advanced reasoning and deep analysis",
    tag: null,
    tagColor: "",
    proOnly: false,
    initial: "G",
  },
  {
    name: "GPT-5.4",
    desc: "Maximum capability for complex tasks",
    tag: "PRO",
    tagColor: "bg-amber-500/15 text-amber-500",
    tagStyle: "rounded",
    proOnly: true,
    initial: "4",
  },
  {
    name: "GPT-5.2",
    desc: "Fast and reliable for everyday use",
    tag: null,
    tagColor: "",
    proOnly: false,
    initial: "2",
  },
]

// Dejando solo English
const LANGS = [
  { code: "en", name: "English", subName: "English" },
]

// ── Componentes UI para la Vista Principal ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Icon3D({ icon: Icon, bgFrom, bgTo, spin }: { icon: any, bgFrom: string, bgTo: string, spin?: boolean }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center shadow-sm relative z-10"
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "8px",
        background: `linear-gradient(180deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2), inset 0px 1.5px 1px rgba(255, 255, 255, 0.35), inset 0px -1px 1px rgba(0, 0, 0, 0.15)",
        color: "white"
      }}
    >
      <Icon className={`w-[16px] h-[16px] ${spin ? "animate-spin" : ""}`} />
    </div>
  )
}

// Componente Icon3D completamente redondo para Setup Account
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Icon3DCircular({ icon: Icon, bgFrom, bgTo }: { icon: any, bgFrom: string, bgTo: string }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center relative z-10"
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: `linear-gradient(180deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2), inset 0px 1.5px 1px rgba(255, 255, 255, 0.35), inset 0px -1px 1px rgba(0, 0, 0, 0.15)",
        border: "4px solid #000",
        color: "white"
      }}
    >
      <Icon className="w-[20px] h-[20px]" />
    </div>
  )
}

// ── Componente RadioButton para selecciones ──
function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#60a5fa]' : 'border-[#555558]'}`}>
      {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#60a5fa]" />}
    </div>
  )
}

interface RowProps {
  label: string | React.ReactNode;
  value?: string;
  onClick?: () => void;
  leftNode?: React.ReactNode;
  danger?: boolean;
  hideArrow?: boolean;
  rightNode?: React.ReactNode;
  isLink?: boolean;
  href?: string;
}

function Row({ label, value, onClick, leftNode, danger, hideArrow, rightNode, isLink, href }: RowProps) {
  const content = (
    <>
      {leftNode}
      <span className={`text-[16px] font-medium relative z-10 ${danger ? "text-[#ef4444]" : "text-white"}`} style={{ fontFamily: SF }}>
        {label}
      </span>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-1 relative z-10">
        {value && (
          <span className="text-[16px] font-medium" style={{ fontFamily: SF, color: "#8e8e93" }}>
            {value}
          </span>
        )}
        
        {rightNode ? rightNode : (!hideArrow && !danger && (
          <IoChevronForward className="w-5 h-5 text-[#555558]" />
        ))}
      </div>
    </>
  );

  if (isLink && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onPointerDown={createRipple} className="relative overflow-hidden w-full flex items-center gap-3.5 px-4 py-3 active:bg-white/5 transition-colors text-left block">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} onPointerDown={onClick ? createRipple : undefined} disabled={!onClick && !rightNode} className={`relative overflow-hidden w-full flex items-center gap-3.5 px-4 py-3 ${onClick ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left`}>
      {content}
    </button>
  )
}

function Section({ title, children, rightAction }: { title?: string; children: React.ReactNode; rightAction?: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
      <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 relative">
        {title && (
          <div className="flex items-center justify-between px-4 pt-4 pb-1 relative z-10">
            <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
            {rightAction && <div>{rightAction}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={"relative rounded-full transition-all duration-200 shrink-0 z-10 " + (disabled ? "opacity-50" : "")}
      style={{ width: "44px", height: "26px", background: on ? "#ffffff" : "#3a3a3c" }}
    >
      <span
        className="absolute top-[2px] rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: "22px", height: "22px",
          background: on ? "#000000" : "#ffffff",
          left: on ? "20px" : "2px",
        }}
      />
    </button>
  )
}

function ModelLogo({ name, locked }: { name: string; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  const imageProps = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    style: { WebkitTouchCallout: "none" as const, userSelect: "none" as const },
  }

  if (locked)
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10" style={{ background: "#1c1c1e" }}>
        <IoLockClosed className="w-5 h-5" style={{ color: "#636366" }} />
      </div>
    )

  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-[#1c1c1e] relative z-10" style={{ background: "#111111" }}>
      <img
        src={MODEL_LOGO[name] || "/grok.png"}
        alt={name}
        className="w-6 h-6 object-contain pointer-events-none select-none"
        {...imageProps}
        onError={e => {
          const el = e.currentTarget
          el.style.display = "none"
          const p = el.parentElement
          if (p) {
            p.style.background = "#1c1c1e"
            const sp = document.createElement("span")
            sp.textContent = model?.initial ?? "?"
            sp.style.color = "#fff"; sp.style.fontWeight = "600"; sp.style.fontFamily = SFD
            p.appendChild(sp)
          }
        }}
      />
    </div>
  )
}

function TokenBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const color = clamped >= 90 ? "#ef4444" : clamped >= 70 ? "#f97316" : "#3b82f6"
  return (
    <div className="w-full mt-1.5 rounded-full overflow-hidden relative z-10" style={{ height: "2px", background: "#2c2c2e" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  )
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center px-4 pb-3" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
    }}>
      <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsView() {
  const {
    setCurrentView, language, setLanguage,
    selectedModel, setSelectedModel,
    userPreferences, setUserPreferences,
    isPremium, isThrottled, minutesUntilReset,
    personalizeMemories, setPersonalizeMemories,
    deleteAllMemories, deleteAllHistory,
    submitFeedback,
    modelTokenStatus,
    refreshModelTokenStatus,
  } = useApp()

  const [page, setPage] = useState<"main" | "model" | "lang" | "prefs" | "basic_info" | "additional_details" | "gender_select" | "timezone_select">("main")
  const [tempPrefs, setTempPrefs] = useState(userPreferences)
  const [improveModel, setImproveModel] = useState(false)
  const [saving, setSaving] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("General feedback")
  const [reportDescription, setReportDescription] = useState("")
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  // Estados para el perfil del usuario
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")

  // Estados para los campos de Account Setup
  const [nameField, setNameField] = useState("")
  const [genderField, setGenderField] = useState("")
  const [ageField, setAgeField] = useState("")
  const [cityField, setCityField] = useState("")
  const [timezoneField, setTimezoneField] = useState("")
  const [occupationField, setOccupationField] = useState("")
  const [interestsField, setInterestsField] = useState("")

  const currentModelInfo = MODELS.find(m => m.name === selectedModel)
  const displayModelName = selectedModel === "Grok 4" ? "Grok 4.1" : selectedModel

  // Extraer información del usuario de Telegram
  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    const defaultName = full || user.username || "User"
    setDisplayName(defaultName)
    if (!nameField) setNameField(defaultName)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

  // Calculo de porcentaje de completado
  const completionFields = [nameField, genderField, ageField, cityField, timezoneField, occupationField, interestsField];
  const filledFields = completionFields.filter(field => field.trim().length > 0).length;
  const completionPct = Math.round((filledFields / 7) * 100);
  const circleOffset = 295 - (295 * completionPct) / 100;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if (page === "gender_select") setPage("basic_info")
      else if (page === "timezone_select") setPage("additional_details")
      else if (page === "basic_info" || page === "additional_details") setPage("prefs")
      else if (page !== "main") setPage("main")
      else { setCurrentView("profile"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [page, setCurrentView])

  async function selectModel(m: string) {
    setSaving("model")
    await setSelectedModel(m as ModelName)
    setSaving("")
    setPage("main")
  }

  useEffect(() => {
    if (page === "model") {
      refreshModelTokenStatus()
    }
  }, [page, refreshModelTokenStatus])

  async function handlePersonalizeToggle() {
    setSaving("personalize")
    await setPersonalizeMemories(!personalizeMemories)
    setSaving("")
  }

  async function handleDeleteMemories() {
    if (!window.Telegram?.WebApp) return
    window.Telegram.WebApp.showConfirm(
      "Delete all memories?\nxBlum will forget everything about you.",
      async (ok: boolean) => {
        if (!ok) return
        setSaving("del_mem")
        await deleteAllMemories()
        setSaving("")
        window.Telegram?.WebApp?.showAlert("All memories deleted.")
      }
    )
  }

  async function handleDeleteHistory() {
    if (!window.Telegram?.WebApp) return
    window.Telegram.WebApp.showConfirm(
      "Delete all conversation history?",
      async (ok: boolean) => {
        if (!ok) return
        setSaving("del_hist")
        await deleteAllHistory()
        setSaving("")
        window.Telegram?.WebApp?.showAlert("History deleted.")
      }
    )
  }

  // ── Model page ─────────────────────────────────────────────────────────────
  if (page === "model") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Select Model" />
      <div className="px-4 pt-6 space-y-4">
        <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 pt-2">
            
            {MODELS.map((m) => {
              const locked = m.proOnly && !isPremium

              const tokenKey = m.name === "Grok 4.1" ? "Grok 4" : m.name
              const tokenInfo: ModelTokenInfo | undefined = (modelTokenStatus as Record<string, ModelTokenInfo> | undefined)?.[tokenKey]

              const limitHit = !isPremium && tokenInfo && tokenInfo.limit > 0 && tokenInfo.used >= tokenInfo.limit
              const minsLeft = limitHit ? tokenInfo.mins_left : 0
              const pct      = tokenInfo?.pct ?? 0

              const active =
                m.name === selectedModel || (m.name === "Grok 4.1" && selectedModel === "Grok 4")

              const isDisabled = locked || saving === "model" || !!limitHit

              return (
                <div key={m.name}>
                  <button
                    disabled={isDisabled}
                    onClick={() => !locked && !limitHit && selectModel(m.name)}
                    onPointerDown={createRipple}
                    className="relative overflow-hidden w-full px-5 py-3.5 flex items-center justify-between transition-colors active:bg-white/5"
                    style={{ opacity: locked || limitHit ? 0.5 : 1 }}
                  >
                    <div className="flex items-center gap-4 flex-1 relative z-10">
                      <ModelLogo name={m.name} locked={locked} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-white" style={{ fontFamily: SFD, fontSize: "16px", fontWeight: 500 }}>
                            {m.name}
                          </p>

                          {m.tag && !locked && !limitHit && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 ${m.tagStyle || "rounded"} ${m.tagColor}`}
                              style={{ fontFamily: SF }}>
                              {m.tag}
                            </span>
                          )}

                          {locked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500"
                                  style={{ fontFamily: SF }}>
                              PRO
                            </span>
                          )}

                          {limitHit && !locked && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ef4444]/15 text-[#ef4444]"
                                  style={{ fontFamily: SF }}>
                              limit reached · {minsLeft > 0 ? `${minsLeft}min` : "resetting…"}
                            </span>
                          )}

                          {isThrottled && !limitHit && !locked && m.name !== "Grok 4.3" && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500"
                                  style={{ fontFamily: SF }}>
                              cooling {minutesUntilReset}min
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>{m.desc}</p>

                        {!isPremium && tokenInfo && tokenInfo.limit > 0 && !locked && (
                          <TokenBar pct={pct} />
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-6 h-6 ml-2 relative z-10">
                      {saving === "model" && active ? (
                        <IoSync className="w-5 h-5 animate-spin" style={{ color: "#8e8e93" }} />
                      ) : active && !isDisabled ? (
                        <IoCheckmark className="w-6 h-6 font-bold stroke-[2px] text-[#60a5fa]" />
                      ) : null}
                    </div>
                  </button>
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )

  // ── Lang page ──────────────────────────────────────────────────────────────
  if (page === "lang") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      {/* Espaciador invisible para igualar la altura de Basic Information */}
      <div className="flex items-center justify-center px-4 pb-3 invisible pointer-events-none" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}>
        <h2 className="font-semibold" style={{ fontSize: "16px", fontFamily: SFD }}>&nbsp;</h2>
      </div>
      <div className="px-4 pt-6 space-y-6">
        <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
              <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>Language</h2>
            </div>
            {LANGS.map((lang, i) => (
              <div key={lang.code}>
                <button 
                  onClick={() => { setLanguage(lang.code); setPage("main") }}
                  onPointerDown={createRipple}
                  className="relative overflow-hidden w-full px-4 py-2.5 flex items-center active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 relative z-10 w-full">
                    <RadioButton selected={language === lang.code} />
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium text-white leading-tight" style={{ fontFamily: SF }}>{lang.name}</span>
                      <span className="text-[#8e8e93] text-[13px] mt-[1px]" style={{ fontFamily: SF }}>{lang.subName}</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Gender Select Sub-page ─────────────────────────────────────────────────
  if (page === "gender_select") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out relative"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      {/* Espaciador invisible para igualar la altura de Basic Information */}
      <div className="flex items-center justify-center px-4 pb-3 invisible pointer-events-none" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}>
        <h2 className="font-semibold" style={{ fontSize: "16px", fontFamily: SFD }}>&nbsp;</h2>
      </div>
      <div className="px-4 pt-6 pb-28 space-y-6">
        <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
              <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>Gender</h2>
            </div>
            {GENDERS.map((g, i) => (
              <div key={g}>
                <button 
                  onClick={() => setGenderField(g)} 
                  onPointerDown={createRipple}
                  className="relative overflow-hidden w-full px-4 py-2.5 flex items-center active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 relative z-10 w-full">
                    <RadioButton selected={genderField === g} />
                    <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF }}>{g}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 left-4 right-4">
        <button 
          onClick={() => setPage("basic_info")} 
          onPointerDown={createRipple}
          className="relative overflow-hidden w-full py-3.5 rounded-full bg-[#3b82f6] text-white font-bold text-[16px] active:opacity-80 transition-opacity shadow-lg" 
          style={{ fontFamily: SF }}
        >
          <span className="relative z-10">Done</span>
        </button>
      </div>
    </div>
  )

  // ── Timezone Select Sub-page ───────────────────────────────────────────────
  if (page === "timezone_select") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out relative overflow-y-auto scrollbar-native"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      {/* Espaciador invisible para igualar la altura de Basic Information */}
      <div className="flex items-center justify-center px-4 pb-3 invisible pointer-events-none" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}>
        <h2 className="font-semibold" style={{ fontSize: "16px", fontFamily: SFD }}>&nbsp;</h2>
      </div>
      <div className="px-4 pt-6 pb-32 space-y-6">
        <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
              <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>Time zone</h2>
            </div>
            {TIMEZONES.map((tz, i) => {
              const displayVal = `${tz.name} (${tz.offset})`
              return (
                <div key={tz.name}>
                  <button 
                    onClick={() => setTimezoneField(displayVal)} 
                    onPointerDown={createRipple}
                    className="relative overflow-hidden w-full px-4 py-2.5 flex items-center active:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 relative z-10 w-full">
                      <RadioButton selected={timezoneField === displayVal} />
                      <div className="flex flex-col">
                        <span className="text-white text-[16px] font-medium leading-tight" style={{ fontFamily: SF }}>{tz.name}</span>
                        <span className="text-[#8e8e93] text-[13px] mt-[1px]" style={{ fontFamily: SF }}>{tz.offset}</span>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 left-4 right-4 pointer-events-none z-10">
        <button 
          onClick={() => setPage("additional_details")} 
          onPointerDown={createRipple}
          className="relative overflow-hidden w-full py-3.5 rounded-full bg-[#3b82f6] text-white font-bold text-[16px] active:opacity-80 transition-opacity pointer-events-auto shadow-lg" 
          style={{ fontFamily: SF }}
        >
          <span className="relative z-10">Done</span>
        </button>
      </div>
    </div>
  )

  // ── Basic Information Sub-page ─────────────────────────────────────────────
  if (page === "basic_info") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Basic Information" />
      <div className="px-4 pt-6 space-y-6">
        
        {/* Contenedor principal alineado con animaciones y estructura Section */}
        <div className="animate-in fade-in duration-300 ease-in-out space-y-2">
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 pt-2">
            
            {/* Item: Name */}
            <div className="flex items-center w-full px-4 py-3 relative z-10">
              <span className="w-[85px] text-[16px] font-medium text-white shrink-0" style={{ fontFamily: SF }}>Name<span className="text-[#ef4444]">*</span></span>
              <input 
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                placeholder="Enter name"
                className="bg-transparent text-[16px] font-medium text-white flex-1 outline-none placeholder:text-[#555558]"
                style={{ fontFamily: SF }}
              />
            </div>

            {/* Item: Gender */}
            <button 
              onClick={() => setPage("gender_select")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex items-center w-full px-4 py-3 active:bg-white/5 transition-colors text-left"
            >
              <span className="w-[85px] text-[16px] font-medium text-white shrink-0 relative z-10" style={{ fontFamily: SF }}>Gender</span>
              <span className={`text-[16px] font-medium flex-1 relative z-10 ${genderField ? "text-white" : "text-[#555558]"}`} style={{ fontFamily: SF }}>
                {genderField || "Select gender"}
              </span>
              <IoChevronForward className="w-5 h-5 text-[#555558] shrink-0 relative z-10" />
            </button>

            {/* Item: Age */}
            <div className="flex items-center w-full px-4 py-3 relative z-10">
              <span className="w-[85px] text-[16px] font-medium text-white shrink-0" style={{ fontFamily: SF }}>Age</span>
              <input 
                type="number"
                value={ageField}
                onChange={(e) => setAgeField(e.target.value)}
                placeholder="Enter age"
                className="bg-transparent text-[16px] font-medium text-white flex-1 outline-none placeholder:text-[#555558]"
                style={{ fontFamily: SF }}
              />
            </div>

            {/* Item: City */}
            <div className="flex items-center w-full px-4 py-3 relative z-10">
              <span className="w-[85px] text-[16px] font-medium text-white shrink-0" style={{ fontFamily: SF }}>City</span>
              <input 
                value={cityField}
                onChange={(e) => setCityField(e.target.value)}
                placeholder="Enter city"
                className="bg-transparent text-[16px] font-medium text-white flex-1 outline-none placeholder:text-[#555558]"
                style={{ fontFamily: SF }}
              />
            </div>

          </div>
        </div>

        {/* Action Buttons (Cancel / Update) */}
        <div className="flex items-center gap-4 mt-8 w-full animate-in fade-in duration-300 ease-in-out">
            <button 
              onClick={() => setPage("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full border border-[#2c2c2e] text-white font-medium active:bg-[#111111] transition-colors" 
              style={{ fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button 
              onClick={() => setPage("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full text-black font-medium active:opacity-80 transition-opacity" 
              style={{ background: "#ffffff", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Update</span>
            </button>
        </div>
      </div>
    </div>
  )

  // ── Additional Details Sub-page ────────────────────────────────────────────
  if (page === "additional_details") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Additional Details" />
      <div className="px-4 pt-6 space-y-6">
        
        <div className="animate-in fade-in duration-300 ease-in-out space-y-4">
          
          {/* Item: Time zone */}
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 pt-2">
            <button 
              onClick={() => setPage("timezone_select")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden w-full flex flex-col px-4 py-3 text-left active:bg-white/5 transition-colors"
            >
              <h2 className="text-[#60a5fa] text-[15px] font-semibold mb-2 relative z-10" style={{ fontFamily: SF }}>Time zone</h2>
              <div className="flex items-center justify-between w-full relative z-10">
                <span className={`text-[16px] font-medium flex-1 ${timezoneField ? "text-white" : "text-[#555558]"}`} style={{ fontFamily: SF }}>
                  {timezoneField || "Select time zone"}
                </span>
                <IoChevronForward className="w-5 h-5 text-[#555558]" />
              </div>
            </button>
          </div>

          {/* Item: Occupation */}
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 pt-2 relative z-10">
            <div className="flex flex-col w-full px-4 py-3 text-left">
              <h2 className="text-[#60a5fa] text-[15px] font-semibold mb-2" style={{ fontFamily: SF }}>Occupation</h2>
              <textarea 
                value={occupationField}
                onChange={(e) => setOccupationField(e.target.value)}
                placeholder="Enter occupation"
                rows={3}
                className="bg-transparent text-[16px] font-medium text-white w-full outline-none placeholder:text-[#555558] resize-none"
                style={{ fontFamily: SF }}
              />
            </div>
          </div>

          {/* Item: Interests */}
          <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2 pt-2 relative z-10">
            <div className="flex flex-col w-full px-4 py-3 text-left">
              <h2 className="text-[#60a5fa] text-[15px] font-semibold mb-2" style={{ fontFamily: SF }}>Interests</h2>
              <textarea 
                value={interestsField}
                onChange={(e) => setInterestsField(e.target.value)}
                placeholder="Enter interests"
                rows={3}
                className="bg-transparent text-[16px] font-medium text-white w-full outline-none placeholder:text-[#555558] resize-none"
                style={{ fontFamily: SF }}
              />
            </div>
          </div>

        </div>

        {/* Action Buttons (Cancel / Update) */}
        <div className="flex items-center gap-4 mt-8 w-full animate-in fade-in duration-300 ease-in-out">
            <button 
              onClick={() => setPage("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full border border-[#2c2c2e] text-white font-medium active:bg-[#111111] transition-colors" 
              style={{ fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button 
              onClick={() => setPage("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full text-black font-medium active:opacity-80 transition-opacity" 
              style={{ background: "#ffffff", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Update</span>
            </button>
        </div>
      </div>
    </div>
  )

  // ── Prefs page (Account Setup) ─────────────────────────────────────────────
  if (page === "prefs") return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300 ease-in-out overflow-y-auto scrollbar-native"
         style={{ background: "#000", minHeight: "100vh" }}>
      <style>{RIPPLE_STYLE}</style>
      
      {/* Espaciado superior dinámico de Telegram */}
      <div style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}></div>

      {/* Título Principal y Gráfico Circular */}
      <div className="flex flex-col items-center mt-2 mb-6 animate-in fade-in duration-300 ease-in-out relative z-10">
        
        {/* Gráfico circular con la foto de perfil en medio */}
        <div className="relative w-[130px] h-[130px] flex items-center justify-center rounded-full mb-6 mt-8">
          
          {/* Anillos SVG (Fondo y Progreso) */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100">
            {/* Círculo de fondo oscuro */}
            <circle cx="50" cy="50" r="47" stroke="#1c1c1e" strokeWidth="4" fill="none" />
            {/* Círculo de progreso azul dinámico */}
            <circle 
               cx="50" cy="50" r="47" stroke="#60a5fa" strokeWidth="4" fill="none" 
               strokeDasharray="295" 
               strokeDashoffset={circleOffset} 
               strokeLinecap="round" 
               style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            />
          </svg>
          
          {/* Foto de Perfil o Iniciales */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-[104px] h-[104px] rounded-full overflow-hidden bg-gradient-to-br from-[#1e1e1e] to-[#0a0a0a] flex items-center justify-center border-2 border-transparent relative shadow-lg">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={displayName} 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  draggable={false} 
                  style={{ WebkitTouchCallout: "none" }} 
                  onError={() => setPhotoUrl(null)} 
                />
              ) : (
                <span className="text-white font-bold select-none pointer-events-none" style={{ fontSize: "36px", letterSpacing: "-0.02em", fontFamily: SFD }}>
                  {initials || "?"}
                </span>
              )}
            </div>
          </div>

          {/* Etiqueta Porcentaje superpuesta */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#60a5fa] text-white text-[14px] font-bold px-3.5 py-0.5 rounded-full border-[4px] border-black z-30 shadow-sm transition-all" style={{ fontFamily: SF }}>
            {completionPct}%
          </div>
        </div>
        
        <h1 className="text-[24px] font-bold text-white mb-0.5 mt-2" style={{ fontFamily: SFD }}>Set Up Your Account</h1>
        <p className="text-[#60a5fa] font-bold text-[22px] mb-1.5" style={{ fontFamily: SF }}>
          {filledFields < 7 ? `${7 - filledFields} steps left` : "Profile Complete!"}
        </p>
        <p className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>It will take less than 2 minutes.</p>
      </div>

      <div className="px-5 w-full pb-10 mt-2 animate-in fade-in duration-300 ease-in-out space-y-4">
         <div className="space-y-4">
           <h3 className="text-[#8e8e93] text-[15px] font-medium mb-3 mt-4" style={{ fontFamily: SF }}>Profile Setup</h3>

           <div className="relative flex flex-col">
              {/* Línea vertical conectora central */}
              <div className="absolute left-[21px] top-[26px] bottom-[26px] w-[2px] bg-[#111111] z-0" />
              
              {/* Step 1: Basic Information */}
              <button 
                onClick={() => setPage("basic_info")} 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <Icon3DCircular icon={IoPersonOutline} bgFrom="#4ade80" bgTo="#16a34a" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Basic Information</p>
                    <div className="w-[22px] h-[22px] rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                      <IoCheckmark className="w-[14px] h-[14px] text-white font-bold stroke-[2px]" />
                    </div>
                 </div>
              </button>
              
              {/* Step 2: Additional Details */}
              <button 
                onClick={() => setPage("additional_details")} 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <Icon3DCircular icon={IoListOutline} bgFrom="#60a5fa" bgTo="#2563eb" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Additional Details</p>
                    <IoChevronForward className="w-5 h-5 text-[#555558]" />
                 </div>
              </button>

              {/* Step 3: Add Personal Data */}
              <button 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch text-left active:opacity-70 transition-opacity rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <Icon3DCircular icon={IoPersonOutline} bgFrom="#4b5563" bgTo="#374151" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-[#8e8e93]" style={{ fontFamily: SF }}>Add Personal Data</p>
                 </div>
              </button>
           </div>
         </div>

         <div className="space-y-4">
           <h3 className="text-[#8e8e93] text-[15px] font-medium mb-3 mt-8" style={{ fontFamily: SF }}>Account Security</h3>

           <div className="relative flex flex-col">
              {/* Step 1: Set Up Passcode */}
              <button 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <Icon3DCircular icon={IoLockClosedOutline} bgFrom="#c084fc" bgTo="#9333ea" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Set Up Passcode</p>
                    <IoChevronForward className="w-5 h-5 text-[#555558]" />
                 </div>
              </button>
           </div>
         </div>
      </div>
    </div>
  )

  // ── Main settings page ─────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in duration-300 ease-in-out" style={{ background: "#000" }}>
      <style>{RIPPLE_STYLE}</style>
      {/* Cabecera principal estática */}
      <div className="flex items-center justify-center px-4 pb-3" style={{
        paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
      }}>
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
          Settings
        </h2>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">

        {/* ── xBlum Pro card (non-premium only) ── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            onPointerDown={createRipple}
            className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left animate-in fade-in duration-300 ease-in-out"
            style={{ background: "#111111", border: "1px solid #1c1c1e", borderRadius: "20px", minHeight: "96px" }}
          >
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)" }} />
            <div className="absolute pointer-events-none"
                 style={{ width: "90px", height: "90px", borderRadius: "50%", top: "-30px", right: "-20px",
                          background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
                          border: "1px solid rgba(245,158,11,0.10)" }} />
            <div className="absolute pointer-events-none"
                 style={{ width: "55px", height: "55px", borderRadius: "50%", bottom: "-18px", right: "30px",
                          background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
                          border: "1px solid rgba(245,158,11,0.08)" }} />
            <div className="relative z-10 px-5 py-5 flex flex-col gap-2">
               <div className="flex items-center gap-2">
                <p className="text-white font-bold text-[18px] leading-tight"
                   style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>xBlum Pro</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500"
                   style={{ background: "rgba(245,158,11,0.15)", fontFamily: SF }}>PRO</span>
              </div>
              <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
                Upgrade your plan to enjoy full features
              </p>
              <div className="flex items-center justify-center mt-3 px-4 py-3 rounded-xl w-full"
                   style={{ background: "#fff" }}>
                <span className="text-black font-bold" style={{ fontSize: "15px", fontFamily: SF }}>
                  Upgrade →
                </span>
              </div>
            </div>
          </button>
        )}

        {/* ── Profile ── */}
        <Section title="Profile">
          <Row
            leftNode={<Icon3D icon={IoColorWand} bgFrom="#f9a8d4" bgTo="#ec4899" />}
            label="LLM Model"
            value={displayModelName + (isThrottled ? " · cooling" : "")}
            onClick={() => setPage("model")}
          />
          <Row
            leftNode={<Icon3D icon={IoGlobe} bgFrom="#d8b4fe" bgTo="#a855f7" />}
            label="Language"
            value={LANGS.find(l => l.code === language)?.name || "English"}
            onClick={() => setPage("lang")}
          />
          <Row
            leftNode={<Icon3D icon={IoPerson} bgFrom="#93c5fd" bgTo="#3b82f6" />}
            label="Account Setup"
            value="Edit"
            onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
          />
        </Section>

        {/* ── Data & Privacy ── */}
        <Section title="Data & Privacy">
          <Row
            leftNode={<Icon3D icon={IoServer} bgFrom="#fcd34d" bgTo="#f59e0b" />}
            label="Personalize Memories"
            rightNode={<Toggle on={personalizeMemories} onToggle={handlePersonalizeToggle} disabled={saving === "personalize"} />}
          />
          <Row
            leftNode={<Icon3D icon={IoSparkles} bgFrom="#6ee7b7" bgTo="#10b981" />}
            label="Improve Model"
            rightNode={<Toggle on={improveModel} onToggle={() => setImproveModel(v => !v)} />}
          />
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone">
          <Row
            leftNode={saving === "del_mem"
              ? <Icon3D icon={IoSync} bgFrom="#fca5a5" bgTo="#ef4444" spin />
              : <Icon3D icon={IoTrash} bgFrom="#fca5a5" bgTo="#ef4444" />}
            label={saving === "del_mem" ? "Deleting..." : "Delete All Memories"}
            onClick={handleDeleteMemories}
            danger
            hideArrow
          />
          <Row
            leftNode={saving === "del_hist"
              ? <Icon3D icon={IoSync} bgFrom="#fca5a5" bgTo="#ef4444" spin />
              : <Icon3D icon={IoTrash} bgFrom="#fca5a5" bgTo="#ef4444" />}
            label={saving === "del_hist" ? "Deleting..." : "Delete All History"}
            onClick={handleDeleteHistory}
            danger
            hideArrow
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <Row
            isLink
            href="https://xblum.gitbook.io/home/xblum/terms"
            leftNode={<Icon3D icon={IoDocumentText} bgFrom="#cbd5e1" bgTo="#64748b" />}
            label="Terms of Use"
          />
          <Row
            isLink
            href="https://xblum.gitbook.io/home/xblum/privacy"
            leftNode={<Icon3D icon={IoShieldCheckmark} bgFrom="#cbd5e1" bgTo="#64748b" />}
            label="Privacy Policy"
          />
          <Row
            onClick={() => setShowReportModal(true)}
            leftNode={<Icon3D icon={IoChatbubble} bgFrom="#c4b5fd" bgTo="#8b5cf6" />}
            label="Feedback & Support"
          />
        </Section>
      </div>

      {/* ── Feedback Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Fondo difuminado con desvanecimiento suave */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 ease-in-out"
            onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
          />
          {/* Sheet Modal */}
          <div className="relative w-full rounded-t-[24px] animate-in fade-in duration-300 ease-in-out max-h-[90vh] flex flex-col"
               style={{ background: "#111111", borderTop: "1px solid #1c1c1e" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1c1c1e" }}>
              <button
                onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
                onPointerDown={createRipple}
                className="relative overflow-hidden w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
                style={{ background: "#1c1c1e" }}>
                <IoClose className="w-5 h-5 text-white relative z-10" />
              </button>
              <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                Feedback & Support
              </h2>
              {reportSent ? (
                <div className="px-3 py-1.5 rounded-full text-[#34c759] font-bold text-xs" style={{ fontFamily: SF }}>
                  Sent ✓
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (!reportDescription.trim() || submittingReport) return
                    setSubmittingReport(true)
                    const ok = await submitFeedback(reportType, reportDescription.trim())
                    setSubmittingReport(false)
                    if (ok) {
                      setReportSent(true)
                      setTimeout(() => {
                        setShowReportModal(false); setReportSent(false)
                        setReportDescription(""); setReportType("General feedback")
                      }, 1800)
                    } else {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ;(window as any).Telegram?.WebApp?.showAlert("Could not send. Please try again.")
                    }
                  }}
                  onPointerDown={createRipple}
                  disabled={!reportDescription.trim() || submittingReport}
                  className="relative overflow-hidden px-4 py-1.5 bg-white disabled:opacity-40 rounded-full text-black font-bold active:scale-95 transition-transform"
                  style={{ fontSize: "13px", fontFamily: SF }}>
                  <span className="relative z-10">{submittingReport ? "Sending..." : "Submit"}</span>
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {reportSent ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(52,199,89,0.1)" }}>
                    <IoCheckmark className="w-8 h-8 text-[#34c759]" />
                  </div>
                  <p className="text-white font-bold" style={{ fontSize: "18px", fontFamily: SFD }}>Thank you!</p>
                  <p className="text-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
                    Your feedback has been received. We'll review it shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
                      onPointerDown={createRipple}
                      className="relative overflow-hidden w-full flex items-center gap-3 px-4 py-4 rounded-2xl active:scale-[0.98] transition-transform"
                      style={{ background: "#1c1c1e" }}>
                      <IoChatbubble className="w-5 h-5 relative z-10" style={{ color: "#8e8e93" }} />
                      <span className="flex-1 text-left text-white font-medium relative z-10" style={{ fontSize: "15px", fontFamily: SF }}>
                        {reportType}
                      </span>
                      <IoChevronDown
                        className={`w-5 h-5 transition-transform relative z-10 ${showReportTypeDropdown ? "rotate-180" : ""}`}
                        style={{ color: "#8e8e93" }} />
                    </button>
                    {showReportTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-10 border border-[#1c1c1e]"
                           style={{ background: "#111111" }}>
                        {["General feedback", "Bug report", "Feature request", "Performance issue", "Support request", "Other"].map(type => (
                          <button
                            key={type}
                            onClick={() => { setReportType(type); setShowReportTypeDropdown(false) }}
                            onPointerDown={createRipple}
                            className={`relative overflow-hidden w-full px-5 py-3.5 text-left text-[15px] font-medium active:bg-[#1c1c1e] transition-colors ${reportType === type ? "text-white" : "text-[#8e8e93]"}`}
                            style={{ fontFamily: SF }}>
                            <span className="relative z-10">{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    placeholder={
                      reportType === "Bug report" ? "Describe what went wrong..." :
                      reportType === "Feature request" ? "Describe the feature you'd like..." :
                      "Share your thoughts or issues..."
                    }
                    className="w-full min-h-[160px] p-5 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none transition-colors"
                    style={{ background: "#1c1c1e", border: "1px solid #1c1c1e", fontSize: "15px", fontFamily: SF }}
                    onFocus={e => (e.target.style.borderColor = "#48484a")}
                    onBlur={e => (e.target.style.borderColor = "transparent")}
                  />
                  <p className="text-center px-4" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                    Feedback is sent directly to the xBlum team.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
