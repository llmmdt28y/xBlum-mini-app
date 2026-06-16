"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { 
  ChevronRight, Check, Earth, CircleUserRound, Lock,
  FileText, ShieldCheck, MessageCircle, ChevronDown, X, Trash2, 
  Loader2, Sparkles, UserPen, SmilePlus, WandSparkles, Settings2,
  CircleStar, ChartPie, Info, MessageCirclePlus, Users, Shield, RefreshCw, Save,
  Bot, Tags, MessageSquare
} from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import React from "react"
import { BusinessAutomationView } from "./business-automation-view"
import { GroupConfigView } from "./group-config-view"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// Global Styles for Ripple Effect
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
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

// Helper API & Telegram
const getTg = () => typeof window !== "undefined" ?
(window as any).Telegram?.WebApp : null

const triggerVibration = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success') => {
  const tg = getTg();
  if (!tg?.HapticFeedback) return;
  if (type === 'error' || type === 'success') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

// Helper Function to create Ripple Effect
const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
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

function getInitData(): string {
  if (typeof window === "undefined") return ""
  return (window as any).Telegram?.WebApp?.initData ?? ""
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData: getInitData() }),
  })
  if (!res.ok) return null
  return res.json()
}

// Real Time Format from ISO string
function formatResetTime(isoString: string | undefined): string {
  if (!isoString) return "—"
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    if (diffMs <= 0) return "Refreshed"
    
    const diffHours = diffMs / (1000 * 60 * 60)
    const roundedHours = Math.round(diffHours * 2) / 2
    
    if (roundedHours >= 1) {
      return `Refreshes in ${roundedHours} hour${roundedHours === 1 ? '' : 's'}`
    } else if (roundedHours === 0.5) {
      return `Refreshes in 30 mins`
    } else {
      return `Refreshes soon`
    }
  } catch {
    return "—"
  }
}

// Data
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

type TgUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

function getTgUser(): TgUser | undefined {
  if (typeof window === "undefined") return undefined
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user as TgUser | undefined
}

const MODEL_LOGO: Record<string, string> = {
  "Grok 4.3": "/grok.png",
  "Gemini 3.5 Flash": "/gemini.png",
}

interface ModelTokenInfo {
  used:      number
  limit:     number
  mins_left: number
  pct:       number
  reset_iso: string
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
    name: "Gemini 3.5 Flash",
    desc: "Fast and reliable for everyday use",
    tag: null,
    tagColor: "",
    proOnly: false,
    initial: "G",
  },
]

const LANGS = [
  { code: "en", name: "English", subName: "English" },
]

// UI Components

function IconFlat({ icon: Icon, color, spin }: { icon: any, color: string, spin?: boolean }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center relative z-10"
      style={{
        width: "28px",   
        height: "28px",
        borderRadius: "6.5px",
        backgroundColor: color,
        color: "white"
      }}
    >
      <Icon className={`w-[18px] h-[18px] ${spin ? "animate-spin" : ""}`} strokeWidth={2.2} />
    </div>
  )
}

function IconCircularLarge({ icon: Icon, color }: { icon: any, color: string }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center relative z-10"
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: color,
        color: "white"
      }}
    >
      <Icon className="w-[24px] h-[24px]" strokeWidth={2.2} />
    </div>
  )
}

function Toggle({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      disabled={disabled}
      className={"relative rounded-full transition-colors duration-100 shrink-0 z-10 " + (disabled ? "opacity-50" : "")}
      style={{ 
        width: "42px", height: "24px", 
        background: on ? activeColor : "#2c2c2e" 
      }}
    >
      <span
        className="absolute rounded-full transition-all duration-100"
        style={{
          width: "16px", height: "16px",
          top: "4px", 
          background: "#111111",
          left: on ? "22px" : "4px", 
        }}
      />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <div className="flex items-center">
      <div className="w-[1px] h-[22px] bg-[#2c2c2e] mr-3.5" />
      <Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor={activeColor} />
    </div>
  )
}

function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#60a5fa]' : 'border-[#555558]'}`}>
      {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#60a5fa]" />}
    </div>
  )
}

function Section({ title, footer, children, rightAction }: { title?: string; footer?: React.ReactNode; children: React.ReactNode; rightAction?: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-4 w-full"> 
      {title && (
        <div className="px-4 mb-1.5 flex items-center justify-between">
          <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden shadow-lg bg-[#111111] relative">
        {children}
      </div>
      {footer && (
        <div className="px-4 mt-2 text-[#8e8e93] text-[13px] leading-snug" style={{ fontFamily: SF }}>
          {footer}
        </div>
      )}
    </div>
  )
}

interface RowProps {
  label: string | React.ReactNode;
  sublabel?: string | React.ReactNode;
  value?: string;
  leftNode?: React.ReactNode;
  rightNode?: React.ReactNode;
  onClick?: () => void;
  hideArrow?: boolean;
  last?: boolean;
  alignItems?: "center" | "start"; 
  danger?: boolean;
  isLink?: boolean;
  href?: string;
  selected?: boolean;
  selectedBlueText?: boolean;
}

function Row({ label, sublabel, value, leftNode, rightNode, onClick, hideArrow = false, last = false, alignItems = "center", danger, isLink, href, selected, selectedBlueText }: RowProps) {
  const content = (
    <>
      {leftNode}
      <div className={`flex flex-col flex-1 min-w-0 relative z-10 ${alignItems === "center" ? "py-0.5" : ""}`}>
        <span className={`text-[16px] font-medium leading-[1.2] ${danger ? "text-[#ef4444]" : (selected && selectedBlueText ? "text-[#60a5fa]" : "text-white")}`} style={{ fontFamily: SF }}>
          {label}
        </span>
        {sublabel && (
          <span className={`text-[13px] ${selected && selectedBlueText ? "text-[#60a5fa]" : "text-[#8e8e93]"} leading-[1.4] mt-[5px]`} style={{ fontFamily: SF }}>
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-2">
        {value && (
          <span className="text-[16px] font-normal text-[#8e8e93]" style={{ fontFamily: SF }}>
            {value}
          </span>
        )}
        {rightNode ? rightNode : (!hideArrow && !danger && (
          <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
        ))}
      </div>
    </>
  );

  const className = `relative overflow-hidden w-full flex gap-3.5 px-4 py-3.5 ${onClick || isLink ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left items-${alignItems}`;

  if (isLink && href) {
    return (
      <>
        <a href={href} target="_blank" rel="noopener noreferrer" onPointerDown={createRipple} className={className + " block"}>
          {content}
        </a>
        {!last && <div className={`h-[1px] bg-[#1c1c1e] relative z-20 ${leftNode ? 'ml-[52px]' : 'ml-4'}`} />}
      </>
    )
  }

  return (
    <>
      <button 
        onClick={onClick} 
        onPointerDown={onClick ? createRipple : undefined} 
        disabled={!onClick && !rightNode} 
        className={className}
      >
        {content}
      </button>
      {!last && <div className={`h-[1px] bg-[#1c1c1e] relative z-20 ${leftNode ? 'ml-[52px]' : 'ml-4'}`} />}
    </>
  )
}

function SubHeader({ title, rightNode }: { title: string, rightNode?: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center px-4 pb-3 z-10 w-full" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
    }}>
      <h2 className="font-semibold text-white relative z-10" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {rightNode && (
        <div className="absolute right-4 bottom-1.5 flex items-center z-20">
          {rightNode}
        </div>
      )}
    </div>
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
      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 relative z-10 bg-[#1c1c1e]">
        <Lock className="w-[16px] h-[16px] text-[#636366]" />
      </div>
    )

  return (
    <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0 relative z-10">
      <img
        src={MODEL_LOGO[name] || "/grok.png"}
        alt={name}
        className="w-full h-full object-contain pointer-events-none select-none"
        {...imageProps}
        onError={e => {
          const el = e.currentTarget
          el.style.display = "none"
          const p = el.parentElement
          if (p) {
            p.style.background = "#1c1c1e"
            p.style.borderRadius = "50%"
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

// Expandable Component with Limit and Vibration
const ExpandingInput = ({ label, maxLength, value, onChange, placeholder = "" }: { label: string, maxLength: number, value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [warningActive, setWarningActive] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const remaining = maxLength - value.length

  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }

  useEffect(() => { adjustHeight() }, [value])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value
    if (val.length > maxLength) {
      val = val.slice(0, maxLength)
      setWarningActive(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setWarningActive(false), 500)
      triggerVibration('error')
    }
    onChange(val)
  }

  let colorHex = "#555558"
  let labelHex = "#8e8e93"

  if (warningActive) {
    colorHex = "#ff453a"
    labelHex = "#ff453a"
  } else if (isFocused) {
    colorHex = "#60a5fa"
    labelHex = "#60a5fa"
  }

  return (
    <div className="relative w-full mb-4 mt-2 shrink-0">
      <label 
        className="absolute -top-2.5 left-3 px-1.5 text-[13px] bg-[#000000] z-10 font-medium transition-colors duration-200" 
        style={{ fontFamily: SF, color: labelHex }}
      >
        {label} • {remaining}
      </label>
      <textarea
        ref={textRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent border-[1.5px] rounded-[12px] px-4 py-3.5 text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#636366] transition-colors duration-200"
        style={{ fontFamily: SF, fontSize: "16px", minHeight: "56px", borderColor: colorHex }}
        rows={1}
      />
    </div>
  )
}

const TelegramInputGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#111111] rounded-[24px] overflow-hidden flex flex-col mb-4 shadow-lg">
    {children}
  </div>
)

const TelegramInput = ({ label, maxLength, value, onChange, placeholder = "", isLast = false }: { label: string, maxLength: number, value: string, onChange: (v: string) => void, placeholder?: string, isLast?: boolean }) => {
  const [isFocused, setIsFocused] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  
  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }
  useEffect(() => { adjustHeight() }, [value])

  let labelColor = isFocused ? "#60a5fa" : "#8e8e93"

  return (
    <div className="relative w-full px-4 pt-3 flex flex-col transition-colors duration-200 bg-transparent">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[13px] font-medium transition-colors duration-200" style={{ color: labelColor, fontFamily: SF }}>
          {label}
        </span>
      </div>
      <textarea
        ref={textRef}
        value={value}
        onChange={(e) => {
          let val = e.target.value
          if (val.length > maxLength) val = val.slice(0, maxLength)
          onChange(val)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#555558] pb-3"
        style={{ fontFamily: SF, fontSize: "16px", minHeight: "24px" }}
        rows={1}
      />
      {!isLast && (
        <div className="absolute bottom-0 left-4 right-0 h-[1px] bg-[#2c2c2e]" />
      )}
    </div>
  )
}

export type SettingsPage = "main" | "model" | "lang" | "prefs" | "basic_info" | "additional_details" | "gender_select" | "timezone_select" | "noir_personality" | "capabilities" | "usage_limits" | "business_automation" | "group_config";

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsView({ 
  initialPage = "main", 
  returnView = "profile",
  onPageChange
}: { 
  initialPage?: SettingsPage, 
  returnView?: string,
  onPageChange?: (isMain: boolean) => void 
}) {
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

  const [page, setPage] = useState<SettingsPage>(initialPage)

  // -----------------------------
  const [saving, setSaving] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    if (onPageChange) {
      onPageChange(page === "main" && !showReportModal)
    }
  }, [page, showReportModal, onPageChange])
  const [reportType, setReportType] = useState("General feedback")
  const [reportDescription, setReportDescription] = useState("")
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetTouchY = useRef<number | null>(null)

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    sheetTouchY.current = e.touches[0].clientY
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (sheetTouchY.current === null) return
    const diff = e.touches[0].clientY - sheetTouchY.current
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`
      e.stopPropagation()
    }
  }
  const handleSheetTouchEnd = (e: React.TouchEvent) => {
    if (sheetTouchY.current === null) return
    const diff = e.changedTouches[0].clientY - sheetTouchY.current
    if (diff > 100 && !submittingReport) {
      setShowReportModal(false)
      setReportSent(false)
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s ease-out'
      sheetRef.current.style.transform = `translateY(0px)`
    }
    sheetTouchY.current = null
  }

  // Viewport height to prevent keyboard jumps
  const [viewportHeight, setViewportHeight] = useState("100vh")

  const [toolAccess, setToolAccessLocal] = useState("Auto")
  const [savingToolAccess, setSavingToolAccess] = useState(false)

  const profileLoaded = useRef(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")

  const prefs = userPreferences || {}
  const [nameField, setNameField] = useState(prefs.name?.toString() || "")
  const [genderField, setGenderField] = useState(prefs.gender?.toString() || "")
  const [ageField, setAgeField] = useState(prefs.age?.toString() || "")
  const [cityField, setCityField] = useState(prefs.city?.toString() || "")
  const [timezoneField, setTimezoneField] = useState(prefs.timezone?.toString() || "")
  const [occupationField, setOccupationField] = useState(prefs.occupation?.toString() || "")
  const [interestsField, setInterestsField] = useState(prefs.interests?.toString() || "")
  const [favoriteEmojiField, setFavoriteEmojiField] = useState(prefs.favoriteEmoji?.toString() || "")
  const [personalityField, setPersonalityField] = useState(prefs.personality?.toString() || "")

  const [liveTokenStatus, setLiveTokenStatus] = useState<Record<string, ModelTokenInfo> | null>(null)

  const legacyModels = ["Grok 4.1", "Grok 4", "GPT-5.4", "GPT-5.2"]
  const displayModelName = legacyModels.includes(selectedModel)
    ? "Gemini 3.5 Flash"
    : selectedModel

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportHeight(`${window.innerHeight}px`)
    }
  }, [])

  useEffect(() => {
    if (profileLoaded.current) return
    profileLoaded.current = true

    apiPost("/api/user_profile", {}).then((data) => {
      if (!data?.ok) return

      const p = data.profile || {}
      if (p.name)          setNameField(p.name)
      if (p.gender)        setGenderField(p.gender)
      if (p.age)           setAgeField(p.age)
      if (p.city)          setCityField(p.city)
      if (p.timezone)      setTimezoneField(p.timezone)
      if (p.occupation)    setOccupationField(p.occupation)
      if (p.interests)     setInterestsField(p.interests)
      if (p.favoriteEmoji) setFavoriteEmojiField(p.favoriteEmoji)
      if (p.personality)   setPersonalityField(p.personality)

      if (data.tool_access) setToolAccessLocal(data.tool_access)
    })
  }, [])

  useEffect(() => {
    const user = getTgUser()
    if (!user) return
    if (user.photo_url) setPhotoUrl(user.photo_url)
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ")
    const defaultName = full || user.username || "User"
    setDisplayName(defaultName)
    if (!nameField && !prefs.name) setNameField(defaultName)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    apiPost("/api/get_model", {}).then((data) => {
      if (data?.ok && data.model && data.model !== selectedModel) {
        setSelectedModel(data.model as ModelName)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTokenStatus = useCallback(async () => {
    const data = await apiPost("/api/model_token_status", {})
    if (data?.ok && data.models) {
      setLiveTokenStatus(data.models)
    }
    refreshModelTokenStatus()
  }, [refreshModelTokenStatus])

  useEffect(() => {
    if (page === "model" || page === "usage_limits") {
      fetchTokenStatus()
    }
  }, [page, fetchTokenStatus])

  // Auto-refresh token status every 30s while viewing usage_limits
  useEffect(() => {
    if (page !== "usage_limits") return
    const interval = setInterval(fetchTokenStatus, 30_000)
    return () => clearInterval(interval)
  }, [page, fetchTokenStatus])

  async function handleToolAccessChange(value: string) {
    setToolAccessLocal(value)
    setSavingToolAccess(true)
    await apiPost("/api/set_tool_access", { tool_access: value })
    setSavingToolAccess(false)
  }

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const completionFields = [nameField, genderField, ageField, cityField, timezoneField, occupationField, interestsField, favoriteEmojiField, personalityField]
  const totalFields = 9
  const filledFields = completionFields.filter(field => field.trim().length > 0).length
  const completionPct = Math.round((filledFields / totalFields) * 100)
  const circleOffset = 295 - (295 * completionPct) / 100
  
  const isBasicInfoComplete = !!(nameField.trim() && genderField.trim() && ageField.trim() && cityField.trim())
  const isAdditionalDetailsComplete = !!(timezoneField.trim() && occupationField.trim() && interestsField.trim())
  const isNoirPersonalityComplete = !!(favoriteEmojiField.trim() && personalityField.trim())
  
  const revertUnsavedChanges = () => {
    if (page === "basic_info") {
      setNameField(prefs.name?.toString() || displayName)
      setGenderField(prefs.gender?.toString() || "")
      setAgeField(prefs.age?.toString() || "")
      setCityField(prefs.city?.toString() || "")
    } else if (page === "additional_details") {
      setTimezoneField(prefs.timezone?.toString() || "")
      setOccupationField(prefs.occupation?.toString() || "")
      setInterestsField(prefs.interests?.toString() || "")
    } else if (page === "noir_personality") {
      setFavoriteEmojiField(prefs.favoriteEmoji?.toString() || "")
      setPersonalityField(prefs.personality?.toString() || "")
    }
  }

  const checkUnsavedChangesAndNavigate = (targetPage: SettingsPage) => {
    let hasUnsaved = false;
    
    if (page === "basic_info") {
      if (nameField !== (prefs.name?.toString() || displayName) ||
          genderField !== (prefs.gender?.toString() || "") ||
          ageField !== (prefs.age?.toString() || "") ||
          cityField !== (prefs.city?.toString() || "")) {
        hasUnsaved = true;
      }
    } else if (page === "additional_details") {
      if (timezoneField !== (prefs.timezone?.toString() || "") ||
          occupationField !== (prefs.occupation?.toString() || "") ||
          interestsField !== (prefs.interests?.toString() || "")) {
        hasUnsaved = true;
      }
    } else if (page === "noir_personality") {
      if (favoriteEmojiField !== (prefs.favoriteEmoji?.toString() || "") ||
          personalityField !== (prefs.personality?.toString() || "")) {
        hasUnsaved = true;
      }
    }

    if (hasUnsaved && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showPopup({
        title: "Something went wrong",
        message: "You have unsaved changes. Do you want to exit without saving?",
        buttons: [{ id: "ok", type: "ok", text: "OK" }, { id: "cancel", type: "cancel" }]
      }, (buttonId: string) => {
        if (buttonId === "ok") {
          revertUnsavedChanges();
          setPage(targetPage);
        }
      });
    } else {
      revertUnsavedChanges();
      setPage(targetPage);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    if (page === "business_automation" || page === "group_config") {
      // Let BusinessAutomationView and GroupConfigView handle their own BackButton logic
      return
    }
    tg.BackButton.show()
    const handleBack = () => {
      if (page === "gender_select") setPage("basic_info")
      else if (page === "timezone_select") setPage("additional_details")
      else if (page === "basic_info" || page === "additional_details" || page === "noir_personality") checkUnsavedChangesAndNavigate("prefs")
      else if (page === "usage_limits") setPage("main")
      else if (page !== "main" && initialPage === "main") setPage("main")
      else { setCurrentView(returnView as any); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page, setCurrentView, initialPage, returnView,
    nameField, genderField, ageField, cityField,
    timezoneField, occupationField, interestsField,
    favoriteEmojiField, personalityField, userPreferences
  ])

  const saveBasicInfo = async () => {
    if (ageField) {
      const ageNum = parseInt(ageField, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
        triggerVibration('error');
        window.Telegram?.WebApp?.showPopup({
          title: "Something went wrong",
          message: "Age should be a number in range from 1 to 100.",
          buttons: [{ id: "ok", type: "ok", text: "OK" }]
        });
        return;
      }
    }
    const updated = { ...prefs, name: nameField, gender: genderField, age: ageField, city: cityField }
    setUserPreferences(updated)
    await apiPost("/api/save_user_profile", { profile: updated })
    setPage("prefs")
  }

  const saveAdditionalInfo = async () => {
    const updated = { ...prefs, timezone: timezoneField, occupation: occupationField, interests: interestsField }
    setUserPreferences(updated)
    await apiPost("/api/save_user_profile", { profile: updated })
    setPage("prefs")
  }

  const saveNoirInfo = async () => {
    const updated = { ...prefs, favoriteEmoji: favoriteEmojiField, personality: personalityField }
    setUserPreferences(updated)
    await apiPost("/api/save_user_profile", { profile: updated })
    setPage("prefs")
  }

  async function selectModel(m: string) {
    setSaving("model")
    await setSelectedModel(m as ModelName)
    setSaving("")
    setPage("main")
  }

  async function handlePersonalizeToggle() {
    setSaving("personalize")
    await setPersonalizeMemories(!personalizeMemories)
    setSaving("")
  }

  async function handleDeleteMemories() {
    if (!window.Telegram?.WebApp) return
    window.Telegram.WebApp.showConfirm(
      "Delete all memories?\nNoir will forget everything about you.",
      async (ok: boolean) => {
        if (!ok) return
        setSaving("del_mem")
        await deleteAllMemories()
        setSaving("")
        triggerVibration('success')
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
        triggerVibration('success')
        window.Telegram?.WebApp?.showAlert("History deleted.")
      }
    )
  }

  const mergedTokenStatus = liveTokenStatus ?? (modelTokenStatus as Record<string, ModelTokenInfo> | undefined)

  // ── Model page ─────────────────────────────────────────────────────────────
  if (page === "model") return (
    <div key="model" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Select Model" />
      <div className="px-4 pt-6 pb-10 space-y-4">
        <Section>
          {MODELS.map((m, idx, arr) => {
            const locked = m.proOnly && !isPremium
            const tokenInfo: ModelTokenInfo | undefined = mergedTokenStatus?.[m.name]
            const pct      = tokenInfo?.pct ?? 0
            const limitHit = !!tokenInfo && pct >= 100
            const minsLeft = limitHit ? tokenInfo.mins_left : 0
            const active = m.name === selectedModel || (m.name === "Gemini 3.5 Flash" && legacyModels.includes(selectedModel))
            const isDisabled = locked || saving === "model" || !!limitHit

            return (
              <div key={m.name}>
                <button
                  disabled={isDisabled}
                  onClick={() => !locked && !limitHit && selectModel(m.name)}
                  onPointerDown={createRipple}
                  className="relative overflow-hidden w-full px-4 py-3.5 flex items-center justify-between transition-colors active:bg-white/5 text-left"
                  style={{ opacity: locked || limitHit ? 0.5 : 1 }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                    <ModelLogo name={m.name} locked={locked} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-[1px]">
                        <span className="text-[16px] font-medium text-white leading-tight" style={{ fontFamily: SF }}>
                          {m.name}
                        </span>

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
                              LOCKED · {minsLeft > 0 ? `${minsLeft}min` : "resetting…"}
                          </span>
                        )}

                        {isThrottled && !limitHit && !locked && m.name !== "Grok 4.3" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500"
                            style={{ fontFamily: SF }}>
                              cooling {minutesUntilReset}min
                          </span>
                        )}
                      </div>

                      <span className="text-[#8e8e93] text-[13px] leading-tight mt-[3px]" style={{ fontFamily: SF }}>{m.desc}</span>

                      {!isPremium && tokenInfo && tokenInfo.limit > 0 && !locked && (
                        <TokenBar pct={pct} />
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-center ml-3 relative z-10">
                      {saving === "model" && active ? (
                      <Loader2 className="w-[22px] h-[22px] animate-spin" style={{ color: "#8e8e93" }} />
                    ) : (
                      <RadioButton selected={active && !isDisabled} />
                    )}
                  </div>
                </button>
                {idx !== arr.length - 1 && <div className="h-[1px] bg-[#1c1c1e] relative z-20 ml-[68px]" />}
              </div>
            )
          })}
        </Section>
      </div>
    </div>
  )

  // ── Lang page ──────────────────────────────────────────────────────────────
  if (page === "lang") return (
    <div key="lang" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Language" />
      <div className="px-4 pt-6 pb-10 space-y-6">
        <Section>
          {LANGS.map((lang, idx, arr) => (
            <div key={lang.code}>
              <button 
                onClick={() => { setLanguage(lang.code); setPage("main") }}
                onPointerDown={createRipple}
                className="relative overflow-hidden w-full px-4 py-3.5 flex items-center gap-3.5 active:bg-white/5 transition-colors text-left"
              >
                <RadioButton selected={language === lang.code} />
                <div className="flex flex-col relative z-10 flex-1">
                  <span className={`text-[16px] font-medium leading-tight text-white`} style={{ fontFamily: SF }}>{lang.name}</span>
                  <span className={`text-[13px] mt-[3px] text-[#8e8e93]`} style={{ fontFamily: SF }}>{lang.subName}</span>
                </div>
              </button>
              {idx !== arr.length - 1 && <div className="h-[1px] bg-[#1c1c1e] relative z-20 ml-4" />}
            </div>
          ))}
        </Section>
      </div>
    </div>
  )

  // ── Gender Select Sub-page ─────────────────────────────────────────────────
  if (page === "gender_select") return (
    <div key="gender_select" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Gender" />
      <div className="px-4 pt-6 pb-10 space-y-6">
        <Section>
          {GENDERS.map((g, idx, arr) => (
            <div key={g}>
              <button 
                onClick={() => { setGenderField(g); }} 
                onPointerDown={createRipple}
                className="relative overflow-hidden w-full px-4 py-3.5 flex items-center gap-3.5 active:bg-white/5 transition-colors text-left"
              >
                <RadioButton selected={genderField === g} />
                <span className={`text-[16px] font-medium relative z-10 flex-1 text-white`} style={{ fontFamily: SF }}>{g}</span>
              </button>
              {idx !== arr.length - 1 && <div className="h-[1px] bg-[#1c1c1e] relative z-20 ml-4" />}
            </div>
          ))}
        </Section>
      </div>
    </div>
  )

  // ── Timezone Select Sub-page ───────────────────────────────────────────────
  if (page === "timezone_select") return (
    <div key="timezone_select" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none scrollbar-native" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Time zone" />
      <div className="px-4 pt-6 pb-10 space-y-6">
        <Section>
          {TIMEZONES.map((tz, idx, arr) => {
            const displayVal = `${tz.name} (${tz.offset})`
            return (
              <div key={tz.name}>
                <button 
                  onClick={() => { setTimezoneField(displayVal); }} 
                  onPointerDown={createRipple}
                  className="relative overflow-hidden w-full px-4 py-3.5 flex items-center gap-3.5 active:bg-white/5 transition-colors text-left"
                >
                  <RadioButton selected={timezoneField === displayVal} />
                  <div className="flex flex-col relative z-10 pr-4 flex-1">
                    <span className={`text-[16px] font-medium leading-tight text-white`} style={{ fontFamily: SF }}>{tz.name}</span>
                    <span className={`text-[13px] mt-[3px] text-[#8e8e93]`} style={{ fontFamily: SF }}>{tz.offset}</span>
                  </div>
                </button>
                {idx !== arr.length - 1 && <div className="h-[1px] bg-[#1c1c1e] relative z-20 ml-4" />}
              </div>
            )
          })}
        </Section>
      </div>
    </div>
  )

  // ── Basic Information Sub-page ─────────────────────────────────────────────
  if (page === "basic_info") return (
    <div key="basic_info" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000]" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Basic Information" />
      
      <div className="px-5 pt-4 flex-1 w-full overflow-y-auto overscroll-none flex flex-col pb-8">
        
        <TelegramInputGroup>
          <TelegramInput label="Name" maxLength={64} value={nameField} onChange={setNameField} />
          <div 
            onClick={() => setPage("gender_select")}
            onPointerDown={createRipple}
            className="relative w-full px-4 pt-3 flex flex-col transition-colors duration-200 bg-transparent active:bg-white/5 cursor-pointer overflow-hidden"
          >
            <div className="flex justify-between items-center mb-0.5 relative z-10 pointer-events-none">
              <span className="text-[13px] font-medium text-[#8e8e93]" style={{ fontFamily: SF }}>
                Gender
              </span>
            </div>
            <div className="w-full flex items-center justify-between pb-3 relative z-10 pointer-events-none" style={{ minHeight: "24px" }}>
              <span className={genderField ? "text-white" : "text-[#555558]"} style={{ fontFamily: SF, fontSize: "16px" }}>
                {genderField || "Select gender"}
              </span>
              <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
            </div>
            <div className="absolute bottom-0 left-4 right-0 h-[1px] bg-[#2c2c2e]" />
          </div>
          <TelegramInput label="Age" maxLength={3} value={ageField} onChange={setAgeField} />
          <TelegramInput label="City" maxLength={64} value={cityField} onChange={setCityField} isLast />
        </TelegramInputGroup>

        <div className="mt-auto pt-8 flex items-center gap-4 w-full relative z-10 shrink-0">
            <button 
              onClick={() => checkUnsavedChangesAndNavigate("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full border border-[#2c2c2e] text-white font-medium active:bg-[#111111] transition-colors" 
              style={{ fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button 
              onClick={saveBasicInfo} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full text-white font-medium active:opacity-80 transition-opacity" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Update</span>
            </button>
        </div>
      </div>
    </div>
  )

  // ── Additional Details Sub-page ────────────────────────────────────────────
  if (page === "additional_details") return (
    <div key="additional_details" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000]" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Additional Details" />
      
      <div className="px-5 pt-4 flex-1 w-full overflow-y-auto overscroll-none flex flex-col pb-8">
        
        <TelegramInputGroup>
          <TelegramInput label="Occupation" maxLength={128} value={occupationField} onChange={setOccupationField} />
          <TelegramInput label="Interests" maxLength={256} value={interestsField} onChange={setInterestsField} isLast />
        </TelegramInputGroup>

        <div className="mb-4 mt-2 shrink-0">
          <Section title="Time zone">
            <Row 
              label={timezoneField || "Select time zone"} 
              onClick={() => setPage("timezone_select")} 
              last 
            />
          </Section>
        </div>

        <div className="mt-auto pt-8 flex items-center gap-4 w-full relative z-10 shrink-0">
            <button 
              onClick={() => checkUnsavedChangesAndNavigate("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full border border-[#2c2c2e] text-white font-medium active:bg-[#111111] transition-colors" 
              style={{ fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button 
              onClick={saveAdditionalInfo} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full text-white font-medium active:opacity-80 transition-opacity" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Update</span>
            </button>
        </div>
      </div>
    </div>
  )

  // ── Noir Personality Sub-page ──────────────────────────────────────────────
  if (page === "noir_personality") return (
    <div key="noir_personality" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000]" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Noir Personality" />
      
      <div className="px-5 pt-4 flex-1 w-full overflow-y-auto overscroll-none flex flex-col pb-8">
        
        <ExpandingInput label="Favorite emoji" maxLength={16} value={favoriteEmojiField} onChange={setFavoriteEmojiField} />
        
        <ExpandingInput label="Personality" maxLength={512} value={personalityField} onChange={setPersonalityField} placeholder="Curious, smart, beautiful..." />

        <div className="mt-auto pt-8 flex items-center gap-4 w-full relative z-10 shrink-0">
            <button 
              onClick={() => checkUnsavedChangesAndNavigate("prefs")} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full border border-[#2c2c2e] text-white font-medium active:bg-[#111111] transition-colors" 
              style={{ fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button 
              onClick={saveNoirInfo} 
              onPointerDown={createRipple}
              className="relative overflow-hidden flex-1 py-3.5 rounded-full text-white font-medium active:opacity-80 transition-opacity" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Update</span>
            </button>
        </div>
      </div>
    </div>
  )

  // ── Prefs page (Account Setup) ─────────────────────────────────────────────
  if (page === "prefs") return (
    <div key="prefs" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out overflow-y-auto overscroll-none scrollbar-native"
         style={{ background: "#000", minHeight: "100dvh" }}>
      <style>{RIPPLE_STYLE}</style>
      
      <SubHeader title="Account Setup" />

      <div className="flex flex-col items-center mt-2 mb-6 relative z-10">
        
        <div className="relative w-[130px] h-[130px] flex items-center justify-center rounded-full mb-6 mt-4">
          
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" stroke="#1c1c1e" strokeWidth="4" fill="none" />
            <circle 
               cx="50" cy="50" r="47" stroke="#60a5fa" strokeWidth="4" fill="none" 
               strokeDasharray="295" 
               strokeDashoffset={circleOffset} 
               strokeLinecap="round" 
               style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            />
          </svg>
          
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

          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#60a5fa] text-white text-[14px] font-bold px-3.5 py-0.5 rounded-full border-[4px] border-black z-30 shadow-sm transition-all" style={{ fontFamily: SF }}>
            {completionPct}%
          </div>
        </div>
        
        <h1 className="text-[24px] font-bold text-white mb-0.5 mt-2" style={{ fontFamily: SFD }}>Set Up Your Account</h1>
        <p className="text-[#60a5fa] font-bold text-[22px] mb-1.5" style={{ fontFamily: SF }}>
          {filledFields < totalFields ? `${totalFields - filledFields} steps left` : "Profile Complete!"}
        </p>
        <p className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>It will take less than 2 minutes.</p>
      </div>

      <div className="px-5 w-full pb-10 mt-2 space-y-4">
         <div className="space-y-4">
           <h3 className="text-[#8e8e93] text-[15px] font-medium mb-3 mt-4" style={{ fontFamily: SF }}>Profile Setup</h3>

           <div className="relative flex flex-col">
              <div className="absolute left-[20.5px] top-[30px] bottom-[30px] w-[3px] bg-[#3a3a3c] z-0 rounded-full" />
              
              <button 
                onClick={() => setPage("basic_info")} 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <IconCircularLarge icon={UserPen} color="#34c759" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Basic Information</p>
                    {isBasicInfoComplete ? (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                        <Check className="w-[14px] h-[14px] text-white stroke-[3px]" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
                    )}
                 </div>
              </button>
              
              <button 
                onClick={() => setPage("additional_details")} 
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
               >
                 <div className="py-2.5 flex items-center shrink-0">
                    <IconCircularLarge icon={FileText} color="#007aff" />
                 </div>
                 <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Additional Details</p>
                    {isAdditionalDetailsComplete ? (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                        <Check className="w-[14px] h-[14px] text-white stroke-[3px]" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
                    )}
                 </div>
              </button>
           </div>
         </div>

         <div className="space-y-4">
           <h3 className="text-[#8e8e93] text-[15px] font-medium mb-3 mt-8" style={{ fontFamily: SF }}>Noir Personality</h3>

           <div className="relative flex flex-col">
              <button 
                onClick={() => setPage("noir_personality")}
                onPointerDown={createRipple}
                className="w-full relative overflow-hidden z-10 flex items-stretch active:opacity-70 transition-opacity text-left rounded-xl bg-transparent"
              >
                 <div className="py-2.5 flex items-center shrink-0">
                    <IconCircularLarge icon={SmilePlus} color="#af52de" />
                  </div>
                  <div className="ml-4 flex-1 flex items-center justify-between relative z-10">
                    <p className="text-[17px] font-medium text-white" style={{ fontFamily: SF }}>Noir Personality</p>
                    {isNoirPersonalityComplete ? (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                        <Check className="w-[14px] h-[14px] text-white stroke-[3px]" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
                    )}
                 </div>
              </button>
           </div>
         </div>
      </div>
    </div>
  )

  // ── Capabilities Sub-page ──────────────────────────────────────────────────
  if (page === "capabilities") return (
    <div key="capabilities" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none" style={{ height: viewportHeight }}>
      <style>{RIPPLE_STYLE}</style>
      <SubHeader title="Capabilities" />
      <div className="px-4 pt-6 pb-40 space-y-6">

        <Section title="Memory">
          <Row 
            label="Generate memory from chat history"
            sublabel="Allow Noir to remember relevant context from your chats. This setting controls memory for both chats and projects."
            rightNode={<SwitchNode on={personalizeMemories} onToggle={handlePersonalizeToggle} disabled={saving === "personalize"} />}
            onClick={handlePersonalizeToggle}
            last
          />
        </Section>

        <Section title="Tool access">
          {[
            { id: "Auto", desc: "Noir chooses for you" },
            { id: "On demand", desc: "Load when needed. More messages, lower accuracy" },
            { id: "Always available", desc: "Ready from start. Fewer messages, better accuracy" },
            { id: "Off", desc: "Disabled. Saves usage — ideal for simple conversations" },
          ].map((t, idx, arr) => (
            <Row 
              key={t.id}
              label={t.id}
              sublabel={t.desc}
              selected={toolAccess === t.id}
              selectedBlueText={true}
              leftNode={savingToolAccess && toolAccess === t.id ? <Loader2 className="w-[18px] h-[18px] animate-spin text-[#60a5fa]" /> : <RadioButton selected={toolAccess === t.id} />}
              hideArrow={true}
              onClick={() => handleToolAccessChange(t.id)}
              alignItems="start"
              last={idx === arr.length - 1}
            />
          ))}
        </Section>

        <Section title="Danger Zone">
          <Row
            leftNode={<IconFlat icon={saving === "del_mem" ? Loader2 : Trash2} color="#ff3b30" spin={saving === "del_mem"} />}
            label={saving === "del_mem" ? "Deleting..." : "Delete All Memories"}
            onClick={handleDeleteMemories}
            danger
          />
          <Row
             leftNode={<IconFlat icon={saving === "del_hist" ? Loader2 : Trash2} color="#ff3b30" spin={saving === "del_hist"} />}
            label={saving === "del_hist" ? "Deleting..." : "Delete All History"}
            onClick={handleDeleteHistory}
            danger
            last
          />
        </Section>

      </div>
    </div>
  )

  // ── Usage Limits Sub-page ────────────────────────────────────────
  if (page === "usage_limits") {
    const grokInfo   = mergedTokenStatus?.["Grok 4.3"]
    const geminiInfo = mergedTokenStatus?.["Gemini 3.5 Flash"]

    return (
      <div key="usage_limits" className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out fixed top-0 left-0 w-full z-[70] bg-[#000000] overflow-y-auto overscroll-none" style={{ height: viewportHeight }}>
        <style>{RIPPLE_STYLE}</style>
        <SubHeader title="" />
        
        <div className="px-4 pt-10 pb-40 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[28px] font-bold text-white leading-none" style={{ fontFamily: SFD }}>Usage Limits</h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold text-[#8e8e93] bg-[#111111] border border-white/5" style={{ fontFamily: SF }}>
                {isPremium ? "PRO" : "Free"}
              </span>
            </div>
            <p className="text-[#8e8e93] text-[15px] leading-snug" style={{ fontFamily: SF }}>
              Your plan limits determine how much you can use Noir over time. Advanced models and features may consume more usage.
            </p>
            <p className="text-[#8e8e93] text-[14px] pt-2" style={{ fontFamily: SF }}>
              Updated just now
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Grok 4.3", info: grokInfo, logo: "/grok.png" },
              { label: "Gemini 3.5 Flash", info: geminiInfo, logo: "/gemini.png" },
            ].map(({ label, info, logo }) => {
              const pct     = info?.pct ?? 0
              const used    = info?.used ?? 0
              const limit   = info?.limit ?? 0
              const reset   = formatResetTime(info?.reset_iso)
              const mColor  = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "#3b82f6"

              return (
                <div key={label} className="rounded-[20px] bg-[#111111] p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={logo} alt={label} className="w-7 h-7 object-contain pointer-events-none select-none" draggable={false} onContextMenu={e => e.preventDefault()} style={{ WebkitTouchCallout: "none", userSelect: "none" }} />
                    <span className="text-[15px] font-semibold text-white flex-1" style={{ fontFamily: SF }}>{label}</span>
                    <span className="text-[13px] font-medium" style={{ fontFamily: SF, color: pct >= 90 ? "#ef4444" : "#8e8e93" }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-[4px] bg-[#1c1c1e] rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: mColor }}
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-[12px] text-[#555558]" style={{ fontFamily: SF }}>
                      {reset}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {!isPremium && (
            <button
               onClick={() => setCurrentView("premium")}
              onPointerDown={createRipple}
              className="relative overflow-hidden w-full py-4 rounded-[20px] text-white font-bold text-[16px] active:opacity-80 transition-opacity shadow-lg"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)", fontFamily: SF }}
            >
              <span className="relative z-10">✦ Upgrade to Pro — Get 5× more usage</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Business Automation Sub-page ──────────────────────────────────────
  if (page === "business_automation") return (
    <BusinessAutomationView onClose={() => setPage("main")} apiBaseUrl={process.env.NEXT_PUBLIC_API_URL ?? ""} />
  )

  // ── Group Config Sub-page ─────────────────────────────────────────────
  if (page === "group_config") return (
    <GroupConfigView onClose={() => setPage("main")} apiBaseUrl={process.env.NEXT_PUBLIC_API_URL ?? ""} />
  )



  // ── Main settings page ─────────────────────────────────────────────────────
  return (
    <>
    {/* This is the main screen wrapper, ensuring fixed top-0 is not present here */}
    <div key="main" className={`flex-1 ${showReportModal ? 'overflow-hidden' : 'overflow-y-auto overscroll-none'} animate-in fade-in duration-500 ease-out`} style={{ background: "#000000" }}>
       <style>{RIPPLE_STYLE}</style>
      
      <SubHeader title="Settings" />

      <div className="px-4 pt-4 pb-40 space-y-6" style={{ minHeight: "101dvh" }}>

        {/* ── Profile ── */}
        <Section title="Profile">
          <Row
            leftNode={<IconFlat icon={WandSparkles} color="#ff2d55" />}
            label="LLM Model"
            value={displayModelName + (isThrottled ? " · cooling" : "")}
            onClick={() => setPage("model")}
            last
          />
          <Row
            leftNode={<IconFlat icon={Earth} color="#af52de" />}
            label="Language"
            value={LANGS.find(l => l.code === language)?.name || "English"}
            onClick={() => setPage("lang")}
            last
          />
          <Row
            leftNode={<IconFlat icon={CircleUserRound} color="#007aff" />}
            label="Account Setup"
            value="Edit"
            onClick={() => { setPage("prefs") }}
            last
          />
        </Section>

        {/* ── Usage & Billing ── */}
        <Section title="Usage & Billing">
          <Row
            leftNode={<IconFlat icon={CircleStar} color="#f59e0b" />}
            label="Manage Subscription"
            onClick={() => setCurrentView("premium")}
            last
          />
          <Row
            leftNode={<IconFlat icon={ChartPie} color="#34c759" />}
            label="Usage Limits"
            onClick={() => setPage("usage_limits")}
            last
          />
        </Section>

        {/* ── Tools ── */}
        <Section title="Tools">
          <Row
            leftNode={<IconFlat icon={Settings2} color="#8e8e93" />}
            label="Capabilities"
            onClick={() => setPage("capabilities")}
            last
          />
          <Row
            leftNode={<IconFlat icon={MessageCirclePlus} color="#5e5ce6" />}
            label="Chat Automation"
            onClick={() => setPage("business_automation")}
            last
          />
          <Row
            leftNode={<IconFlat icon={Users} color="#34c759" />}
            label="Group Moderation"
            onClick={() => setPage("group_config")}
            last
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <Row
           isLink
            href="https://xblum.gitbook.io/home/xblum/terms"
            leftNode={<IconFlat icon={FileText} color="#8e8e93" />}
            label="Terms of Use"
            last
          />
          <Row
            isLink
            href="https://xblum.gitbook.io/home/xblum/privacy"
            leftNode={<IconFlat icon={ShieldCheck} color="#8e8e93" />}
            label="Privacy Policy"
            last
          />
          <Row
            onClick={() => setShowReportModal(true)}
            leftNode={<IconFlat icon={MessageCircle} color="#ff9500" />}
            label="Feedback & Support"
            last
          />
         </Section>
      </div>
    </div>

      {/* ── Feedback Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center touch-none">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500 ease-out touch-none"
            onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
            onTouchMove={(e) => { e.stopPropagation() }}
          />
          <div ref={sheetRef} className="relative w-full rounded-t-[24px] animate-in fade-in duration-500 ease-out flex flex-col"
               style={{ background: "#111111", borderTop: "1px solid #1c1c1e", transform: `translateY(0px)`, transition: 'transform 0.3s ease-out' }}>
            <div className="w-full shrink-0" onTouchStart={handleSheetTouchStart} onTouchMove={handleSheetTouchMove} onTouchEnd={handleSheetTouchEnd}>
              <div className="w-12 h-1.5 bg-[#2c2c2e] rounded-full mx-auto mt-4 mb-2 shrink-0" />
              <div className="flex items-center justify-between px-5 pb-4" style={{ borderBottom: "1px solid #1c1c1e" }}>
               <button
                onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
                onPointerDown={createRipple}
                className="relative overflow-hidden w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
                style={{ background: "#1c1c1e" }}>
                <X className="w-5 h-5 text-white relative z-10" />
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
                      triggerVibration('success')
                      setReportSent(true)
                      setTimeout(() => {
                        setShowReportModal(false); setReportSent(false)
                        setReportDescription(""); setReportType("General feedback")
                      }, 1800)
                    } else {
                      triggerVibration('error')
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
            </div>

            <div className="p-5 space-y-4 pb-12">
              {reportSent ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(52,199,89,0.1)" }}>
                    <Check className="w-8 h-8 text-[#34c759]" />
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
                        <MessageCircle className="w-5 h-5 relative z-10" style={{ color: "#8e8e93" }} />
                      <span className="flex-1 text-left text-white font-medium relative z-10" style={{ fontSize: "15px", fontFamily: SF }}>
                        {reportType}
                      </span>
                      <ChevronDown
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
                    Feedback is sent directly to the Noir team.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
