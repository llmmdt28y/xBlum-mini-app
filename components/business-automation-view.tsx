"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Loader2, Check,
  ChevronRight, Clock, MessageSquare,
  CircleUserRound, Plus, Pencil, Copy, Trash2, UserRoundPen
} from "lucide-react"

const SF    = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD   = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif"

// ── TELEGRAM USER ──────────────────────────────────────────────────────────────
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

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────────
const RIPPLE_STYLE = `
  .ripple {
    position: absolute; border-radius: 50%; transform: scale(0);
    animation: ripple-anim 600ms linear;
    background-color: rgba(150,150,150,0.25);
    pointer-events: none; z-index: 0;
  }
  @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  input[type="time"]::-webkit-calendar-picker-indicator {
    opacity: 0; width: 100%; height: 100%;
    position: absolute; top: 0; left: 0; cursor: pointer;
  }
  @keyframes toast-in  { from { opacity:0; transform:translateY(8px) scale(.95) } to   { opacity:1; transform:translateY(0)    scale(1)    } }
  @keyframes toast-out { from { opacity:1; transform:translateY(0)    scale(1)   } to   { opacity:0; transform:translateY(-6px)  scale(.95)  } }
  .toast-enter { animation: toast-in  280ms cubic-bezier(.34,1.56,.64,1) forwards }
  .toast-exit  { animation: toast-out 220ms ease-in forwards }
`

const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

const triggerVibration = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success') => {
  const tg = getTg()
  if (!tg?.HapticFeedback) return
  if (type === 'error' || type === 'success') tg.HapticFeedback.notificationOccurred(type)
  else tg.HapticFeedback.impactOccurred(type)
}

const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const el = event.currentTarget
  if ((el as any).disabled) return
  const circle = document.createElement("span")
  const diameter = Math.max(el.clientWidth, el.clientHeight)
  const radius = diameter / 2
  const rect = el.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top  = `${event.clientY - rect.top  - radius}px`
  circle.classList.add("ripple")
  el.querySelector(".ripple")?.remove()
  el.appendChild(circle)
  setTimeout(() => circle.remove(), 600)
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ""
  const [hours, minutes] = timeStr.split(":")
  let h = parseInt(hours, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h.toString().padStart(2, "0")}:${minutes} ${ampm}`
}

// ── DEFAULT ROLES ──────────────────────────────────────────────────────────────
const ROLES_DATA = [
  {
    id: "assistant",
    label: "Assistant",
    desc: "The assistant is a personal assistant with a focus on adapting to the user's preferences. It learns the user's style and preferences to provide responses that are in tune with how they would typically communicate and what their needs are. It is flexible and can adapt to different tasks."
  },
  {
    id: "summarizer",
    label: "Summarizer",
    desc: "You are an expert at summarizing messages. You prefer to use clauses instead of complete sentences. Do not answer any question from the messages. Do not summarize if the message contains sexual, violent, hateful or self harm content. Please keep your summary of the input within 3 sentences, fewer than 60 words."
  },
  {
    id: "proofreader",
    label: "Proofreader",
    desc: "The assistant is a meticulous proofreader. It will carefully examine given texts for grammatical errors, typos, and style issues. It will also suggest improvements to the writing to make it more clear and effective. Focus on fixing grammar, spelling, punctuation, and syntax to enhance the readability of the text."
  }
]

// ── REUSABLE COMPONENTS ────────────────────────────────────────────────────────

function Toggle({ on, onToggle, disabled, activeColor = "#60a5fa" }: {
  on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      disabled={disabled}
      className={"relative rounded-full transition-colors duration-100 shrink-0 z-10 " + (disabled ? "opacity-50" : "")}
      style={{ width: "42px", height: "24px", background: on ? activeColor : "#2c2c2e" }}
    >
      <span
        className="absolute rounded-full transition-all duration-100"
        style={{ width: "16px", height: "16px", top: "4px", background: "#111111", left: on ? "22px" : "4px" }}
      />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled, activeColor = "#60a5fa" }: {
  on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string
}) {
  return (
    <div className="flex items-center">
      <div className="w-[1px] h-[22px] bg-[#2c2c2e] mr-3.5" />
      <Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor={activeColor} />
    </div>
  )
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-center px-4 pb-3 z-10 w-full" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
    }}>
      <h2 className="font-semibold text-white relative z-10" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
    </div>
  )
}

function Section({ title, footer, titleColor = "#60a5fa", children }: {
  title?: string; footer?: React.ReactNode; titleColor?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-2 mb-4 w-full">
      {title && (
        <div className="px-4 mb-1.5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold" style={{ fontFamily: SF, color: titleColor }}>{title}</h2>
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] relative">
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
  label: string | React.ReactNode
  sublabel?: string | React.ReactNode
  value?: string | React.ReactNode
  leftNode?: React.ReactNode
  rightNode?: React.ReactNode
  onClick?: () => void
  onLongPress?: (x: number, y: number) => void
  hideArrow?: boolean
  last?: boolean
  alignItems?: "center" | "start"
  preserveWhitespace?: boolean
}

function Row({
  label, sublabel, value, leftNode, rightNode, onClick, onLongPress,
  hideArrow = false, last = false, alignItems = "center", preserveWhitespace = false
}: RowProps) {
  const touchRef = useRef({ startX: 0, startY: 0, timer: null as any, triggered: false })

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onClick && !onLongPress) createRipple(e)
    if (onLongPress) {
      touchRef.current = { startX: e.clientX, startY: e.clientY, triggered: false, timer: setTimeout(() => {
        touchRef.current.triggered = true
        triggerVibration("medium")
        onLongPress(e.clientX, e.clientY)
      }, 500) }
    }
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!onLongPress || !touchRef.current.timer) return
    if (Math.abs(e.clientX - touchRef.current.startX) > 10 || Math.abs(e.clientY - touchRef.current.startY) > 10) {
      clearTimeout(touchRef.current.timer); touchRef.current.timer = null
    }
  }
  const handlePointerUp = () => {
    if (touchRef.current.timer) { clearTimeout(touchRef.current.timer); touchRef.current.timer = null }
  }
  const handleClick = (e: React.MouseEvent) => {
    if (touchRef.current.triggered) { e.preventDefault(); e.stopPropagation(); return }
    if (onClick && onLongPress) createRipple(e as any)
    onClick?.()
  }

  return (
    <>
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        disabled={!onClick && !rightNode && !onLongPress}
        className={`relative overflow-hidden w-full flex gap-3.5 px-4 py-3.5 ${onClick || onLongPress ? "active:bg-white/5 transition-colors cursor-pointer" : ""} text-left items-${alignItems}`}
      >
        {leftNode}
        <div className={`flex flex-col flex-1 min-w-0 relative z-10 ${alignItems === "center" ? "py-0.5" : ""}`}>
          <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF, lineHeight: "1.2" }}>{label}</span>
          {sublabel && (
            <span className={`text-[13px] text-[#8e8e93] leading-[1.4] mt-[5px] ${preserveWhitespace ? "whitespace-pre-wrap" : ""}`} style={{ fontFamily: SF }}>
              {sublabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-2">
          {value && <span className="text-[16px] font-normal text-[#60a5fa]" style={{ fontFamily: SF }}>{value}</span>}
          {rightNode ? rightNode : (!hideArrow && onClick && !value && <ChevronRight className="w-5 h-5 text-[#8e8e93]" />)}
        </div>
      </button>
      {!last && <div className={`h-[1px] bg-[#1c1c1e] relative z-20 ${leftNode ? "ml-[52px]" : "ml-4"}`} />}
    </>
  )
}

function RadioButton({ selected, activeColor = "#60a5fa" }: { selected: boolean; activeColor?: string }) {
  return (
    <div className="shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10"
      style={{ borderColor: selected ? activeColor : "#555558" }}>
      {selected && <div className="w-[12px] h-[12px] rounded-full" style={{ backgroundColor: activeColor }} />}
    </div>
  )
}

const RadioRow = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button onClick={(e) => { createRipple(e); onClick() }}
    className="relative overflow-hidden flex items-center justify-between w-full px-4 py-3.5 active:bg-white/5 transition-colors text-left">
    <span className="text-white font-medium relative z-10" style={{ fontSize: "16px", fontFamily: SF }}>{label}</span>
    <RadioButton selected={selected} />
  </button>
)

const ExpandingInput = ({
  label, maxLength, value, onChange, onBlur, placeholder = "", labelBg = "#000000"
}: {
  label: string; maxLength: number; value: string; onChange: (v: string) => void
  onBlur?: () => void; placeholder?: string; labelBg?: string
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value
    if (val.length > maxLength) {
      val = val.slice(0, maxLength)
      setWarningActive(true)
      setTimeout(() => setWarningActive(false), 500)
      triggerVibration("error")
    }
    onChange(val)
  }

  let colorHex = "#555558"
  let labelHex = "#8e8e93"
  if (warningActive)     { colorHex = "#ff453a"; labelHex = "#ff453a" }
  else if (isFocused)    { colorHex = "#60a5fa"; labelHex = "#60a5fa" }

  return (
    <div className="relative w-full mb-2 mt-3">
      <label className="absolute -top-2.5 left-3 px-1.5 text-[13px] z-10 font-medium transition-colors duration-200"
        style={{ fontFamily: SF, color: labelHex, backgroundColor: labelBg }}>
        {label} • {remaining}
      </label>
      <textarea
        ref={textRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { setIsFocused(false); onBlur?.() }}
        placeholder={placeholder}
        className="w-full bg-transparent border-[1.5px] rounded-[12px] px-4 py-3.5 text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#636366] transition-colors duration-200"
        style={{
          fontFamily: `${SF}, ${EMOJI}`,
          fontSize: "16px", minHeight: "56px", borderColor: colorHex,
          unicodeBidi: "plaintext", whiteSpace: "pre-wrap"
        }}
        rows={1}
      />
    </div>
  )
}

// ── MAIN VIEW ──────────────────────────────────────────────────────────────────

interface BusinessAutomationViewProps {
  onClose: () => void
  apiBaseUrl?: string
}

export function BusinessAutomationView({ onClose, apiBaseUrl = "" }: BusinessAutomationViewProps) {

  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState<
    'main' | 'roles' | 'new_role' | 'tone' | 'afk_msg'
  >('main')

  const [viewportHeight, setViewportHeight] = useState("100vh")
  const [newRoleName, setNewRoleName] = useState("")
  const [newRolePrompt, setNewRolePrompt] = useState("")
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; roleId: string } | null>(null)
  const [tgUser, setTgUser] = useState<TgUser | undefined>(undefined)
  const [localAfkText, setLocalAfkText] = useState("")
  const [saveToast, setSaveToast]     = useState<"idle"|"saving"|"saved"|"error">("idle")
  const [afkSaving, setAfkSaving]     = useState<"idle"|"saving"|"saved"|"error">("idle")
  const toastTimerRef = useRef<any>(null)

  const showToast = (state: "saved"|"error") => {
    setSaveToast(state)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setSaveToast("idle"), 1800)
  }

  const [config, setConfig] = useState({
    tone: "adaptive",
    use_case: "assistant",
    humanize_enabled: true,
    history_enabled: true,
    read_enabled: true,
    spam_filter_enabled: true,
    afk_enabled: false,
    afk_text: "",
    afk_schedule: "always",
    afk_offline_only: false,
    afk_start_time: "18:00",
    afk_end_time: "08:00",
    afk_business_days: [1, 2, 3, 4, 5] as number[],
    afk_business_start: "09:00",
    afk_business_end: "18:00",
    custom_roles: [] as { id: string; label: string; desc: string }[]
  })

  useEffect(() => {
    if (typeof window !== "undefined") setViewportHeight(`${window.innerHeight}px`)
    setTgUser(getTgUser())
  }, [])

  const saveConfigToServer = useCallback(async (
    currentConfig: typeof config,
    silent = false
  ): Promise<boolean> => {
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      const res = await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config: currentConfig })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!silent) showToast("saved")
      return true
    } catch (err) {
      console.error("[AutoSave] Error:", err)
      if (!silent) showToast("error")
      return false
    }
  }, [apiBaseUrl])  // eslint-disable-line react-hooks/exhaustive-deps

  const setAndSave = (key: keyof typeof config, value: any) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value }
      saveConfigToServer(next)
      return next
    })
  }

  // ── Role management ─────────────────────────────────────────────────────────
  const handleSaveRole = () => {
    if (!newRoleName.trim() || !newRolePrompt.trim()) return
    if (editingRoleId) {
      const updated = config.custom_roles.map(r =>
        r.id === editingRoleId ? { ...r, label: newRoleName, desc: newRolePrompt } : r
      )
      setAndSave("custom_roles", updated)
    } else {
      const newRole = { id: `custom_${Date.now()}`, label: newRoleName, desc: newRolePrompt }
      const updated = [...(config.custom_roles || []), newRole]
      setAndSave("custom_roles", updated)
      setAndSave("use_case", newRole.id)
    }
    setNewRoleName(""); setNewRolePrompt(""); setEditingRoleId(null)
    setActivePage("roles")
  }

  const openNewRoleView = () => {
    setNewRoleName(""); setNewRolePrompt(""); setEditingRoleId(null)
    setActivePage("new_role")
  }

  const handleEditRole = () => {
    if (!contextMenu) return
    const role = config.custom_roles.find(r => r.id === contextMenu.roleId)
    if (role) { setNewRoleName(role.label); setNewRolePrompt(role.desc); setEditingRoleId(role.id); setActivePage("new_role") }
    setContextMenu(null)
  }

  const handleCopyRole = () => {
    if (!contextMenu) return
    const role = config.custom_roles.find(r => r.id === contextMenu.roleId)
    if (role) { navigator.clipboard.writeText(role.desc); triggerVibration("success") }
    setContextMenu(null)
  }

  const handleDeleteRole = () => {
    if (!contextMenu) return
    const updated = config.custom_roles.filter(r => r.id !== contextMenu.roleId)
    setAndSave("custom_roles", updated)
    if (config.use_case === contextMenu.roleId) setAndSave("use_case", "assistant")
    triggerVibration("success")
    setContextMenu(null)
  }

  // ── Back button ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if (activePage === "main") onClose()
      else if (activePage === "new_role") setActivePage("roles")
      else setActivePage("main")
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [activePage, onClose])

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadInitial() {
      try {
        const tg = getTg()
        const initData = tg?.initData ?? ""
        const res = await fetch(`${apiBaseUrl}/api/business_config_v2?initData=${encodeURIComponent(initData)}`)
        if (res.ok) {
          const data = await res.json()
          setConfig(prev => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [apiBaseUrl])

  // Sync local AFK text with config
  useEffect(() => { setLocalAfkText(config.afk_text) }, [config.afk_text])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#000] flex items-center justify-center w-full h-full">
        <Loader2 className="w-7 h-7 text-[#60a5fa] animate-spin" />
      </div>
    )
  }

  const getRoleDisplayName = () => {
    const def = ROLES_DATA.find(r => r.id === config.use_case)
    if (def) return def.label
    const custom = config.custom_roles?.find(r => r.id === config.use_case)
    if (custom) return custom.label
    return "Assistant"
  }

  let menuStyle: any = {}
  if (contextMenu?.visible) {
    let top = contextMenu.y, left = contextMenu.x
    if (typeof window !== "undefined") {
      if (left > window.innerWidth  - 150) left = window.innerWidth  - 150
      if (top  > window.innerHeight - 150) top  = window.innerHeight - 150
    }
    menuStyle = { top, left }
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-300">
      <style>{RIPPLE_STYLE}</style>

      {/* ── SAVE TOAST ────────────────────────────────────────────────────── */}
      {saveToast !== "idle" && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-2xl border border-white/10 pointer-events-none ${saveToast === "error" ? "toast-exit" : "toast-enter"}`}
          style={{
            background: saveToast === "error" ? "rgba(255,69,58,0.92)" : "rgba(52,199,89,0.92)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)"
          }}
        >
          {saveToast === "saved"
            ? <Check  className="w-4 h-4 text-white" strokeWidth={3} />
            : <span   className="text-white text-[15px]" style={{fontFamily:SF}}>✕</span>}
          <span className="text-white font-semibold text-[14px]" style={{ fontFamily: SF }}>
            {saveToast === "saved" ? "Saved" : "Error saving"}
          </span>
        </div>
      )}

      {/* ── CONTEXT MENU ──────────────────────────────────────────────────── */}
      {contextMenu?.visible && (
        <>
          <div className="fixed inset-0 z-[150]" onPointerDown={(e) => { e.stopPropagation(); setContextMenu(null) }} />
          <div className="fixed z-[160] bg-[#212123] rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.9)] border border-white/5 overflow-hidden flex flex-col py-1.5 animate-in zoom-in-95 duration-150"
            style={{ ...menuStyle, minWidth: "145px" }}>
            <button className="flex items-center gap-3.5 px-4 py-2.5 text-white active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleEditRole() }}>
              <Pencil className="w-[16px] h-[16px] text-[#e5e5e7]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>Edit</span>
            </button>
            <button className="flex items-center gap-3.5 px-4 py-2.5 text-white active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleCopyRole() }}>
              <Copy className="w-[16px] h-[16px] text-[#e5e5e7]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>Copy</span>
            </button>
            <button className="flex items-center gap-3.5 px-4 py-2.5 text-[#ff453a] active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleDeleteRole() }}>
              <Trash2 className="w-[16px] h-[16px]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* ── NEW / EDIT ROLE ────────────────────────────────────────────────── */}
      {activePage === "new_role" && (
        <div className="animate-in slide-in-from-right duration-300 w-full absolute inset-0 z-[70] bg-[#000000] flex flex-col" style={{ height: viewportHeight }}>
          <SubHeader title={editingRoleId ? "Edit Role" : "New Role"} />
          <div className="px-5 pt-4 flex-1 w-full overflow-y-auto flex flex-col pb-8">
            <ExpandingInput label="Name"   maxLength={64}   value={newRoleName}   onChange={setNewRoleName} />
            <ExpandingInput label="Prompt" maxLength={1024} value={newRolePrompt} onChange={setNewRolePrompt} />
            <p className="text-[#8e8e93] text-[13px] leading-[1.4] mt-[-16px] mb-6 px-1" style={{ fontFamily: SF }}>
              A prompt is the initial text given to the model to start generating a response or continue a dialogue.
            </p>
            <div className="mt-auto pt-8 w-full">
              <button
                onClick={(e) => { createRipple(e as any); handleSaveRole() }}
                disabled={!newRoleName.trim() || !newRolePrompt.trim()}
                className="w-full bg-white text-black font-bold rounded-[14px] py-3.5 transition-opacity disabled:opacity-50 relative overflow-hidden"
                style={{ fontSize: "16px", fontFamily: SF }}
              >
                <span className="relative z-10">{editingRoleId ? "Save Changes" : "Create"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCROLL CONTAINER ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 w-full px-0 relative">

        {/* ── MAIN ──────────────────────────────────────────────────────────── */}
        {activePage === "main" && (
          <div className="animate-in fade-in duration-300 w-full">
            <SubHeader title="AI Chat" />

            <div className="flex justify-center mt-6 mb-10">
              <img
                src="/animatedemojies_agadmqiaasojkec.webp"
                alt="AI Chat Robot"
                className="w-[84px] h-[84px] object-contain drop-shadow-2xl pointer-events-none select-none"
                draggable={false}
              />
            </div>

            <div className="px-4">
              <Section
                title="General"
                footer="Conversation history allows the AI to understand previous requests and consider them when generating new responses."
              >
                <Row
                  leftNode={<UserRoundPen className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="Tone"
                  value={config.tone.charAt(0).toUpperCase() + config.tone.slice(1)}
                  onClick={() => setActivePage("tone")}
                />
                <Row
                  leftNode={<CircleUserRound className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="Roles"
                  value={getRoleDisplayName()}
                  onClick={() => setActivePage("roles")}
                />
                <Row
                  leftNode={<MessageSquare className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="AFK Message"
                  value={config.afk_enabled ? "On" : "Off"}
                  onClick={() => setActivePage("afk_msg")}
                />
                <Row
                  leftNode={<Clock className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="History"
                  rightNode={<SwitchNode on={config.history_enabled} onToggle={() => setAndSave("history_enabled", !config.history_enabled)} />}
                  onClick={() => setAndSave("history_enabled", !config.history_enabled)}
                  last
                />
              </Section>

              <Section title="Other">
                <Row
                  label="Mark as Read"
                  rightNode={<SwitchNode on={config.read_enabled} onToggle={() => setAndSave("read_enabled", !config.read_enabled)} />}
                  onClick={() => setAndSave("read_enabled", !config.read_enabled)}
                />
                <Row
                  label="Spam Filter"
                  rightNode={<SwitchNode on={config.spam_filter_enabled} onToggle={() => setAndSave("spam_filter_enabled", !config.spam_filter_enabled)} />}
                  onClick={() => setAndSave("spam_filter_enabled", !config.spam_filter_enabled)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── TONE ──────────────────────────────────────────────────────────── */}
        {activePage === "tone" && (
          <div className="animate-in slide-in-from-right duration-300 w-full pb-10 relative">
            <SubHeader title="Tone" />

            <div className="flex flex-col items-center mt-4 mb-8 px-4 text-center relative z-0">
              <UserRoundPen className="w-[64px] h-[64px] text-[#8e8e93] mb-4 drop-shadow-2xl" strokeWidth={1} />
              <p style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, maxWidth: "250px", lineHeight: "1.4" }}>
                Adjust the AI's communication style and overall behavior.
              </p>
            </div>

            <div className="px-4">
              <Section title="Communication Style">
                {(["adaptive", "casual", "formal", "empathetic"] as const).map((opt, idx, arr) => (
                  <Row
                    key={opt}
                    alignItems="center"
                    leftNode={<div className="mt-[1px]"><RadioButton selected={config.tone === opt} /></div>}
                    label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                    hideArrow
                    last={idx === arr.length - 1}
                    onClick={() => setAndSave("tone", opt)}
                  />
                ))}
              </Section>

              <Section title="Behavior">
                <Row
                  label="Simulate Typing"
                  sublabel="Inject artificial typing delays for a more organic rhythm."
                  rightNode={<SwitchNode on={config.humanize_enabled} onToggle={() => setAndSave("humanize_enabled", !config.humanize_enabled)} />}
                  onClick={() => setAndSave("humanize_enabled", !config.humanize_enabled)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── ROLES ─────────────────────────────────────────────────────────── */}
        {activePage === "roles" && (
          <div className="animate-in slide-in-from-right duration-300 w-full pb-10 relative">
            <SubHeader title="Roles" />

            <div className="flex flex-col items-center mt-2 mb-8 px-4 text-center relative z-0">
              <button
                onClick={(e) => { createRipple(e); openNewRoleView() }}
                className="absolute right-4 top-0 w-10 h-10 flex items-center justify-center active:opacity-60 transition-opacity rounded-full z-10 overflow-hidden"
              >
                <Plus className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
              </button>
              <img
                src="/animatedemojies_agadxamaajlb2uy.webp"
                alt="Roles"
                className="w-[84px] h-[84px] object-contain drop-shadow-2xl mb-4 pointer-events-none select-none"
                draggable={false}
              />
              <p style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, maxWidth: "250px", lineHeight: "1.4" }}>
                Create roles for your specific needs!
              </p>
            </div>

            <div className="px-4">
              <Section title="Suggestions">
                {ROLES_DATA.map((role, idx) => (
                  <Row
                    key={role.id}
                    alignItems="start"
                    preserveWhitespace
                    leftNode={<div className="mt-[1px]"><RadioButton selected={config.use_case === role.id} /></div>}
                    label={role.label}
                    sublabel={role.desc}
                    hideArrow
                    last={idx === ROLES_DATA.length - 1}
                    onClick={() => setAndSave("use_case", role.id)}
                  />
                ))}
              </Section>

              {config.custom_roles && config.custom_roles.length > 0 && (
                <div className="mt-6">
                  <Section title="Roles">
                    {config.custom_roles.map((role, idx) => (
                      <Row
                        key={role.id}
                        alignItems="start"
                        preserveWhitespace
                        leftNode={<div className="mt-[1px]"><RadioButton selected={config.use_case === role.id} /></div>}
                        label={role.label}
                        sublabel={role.desc}
                        hideArrow
                        last={idx === config.custom_roles.length - 1}
                        onClick={() => setAndSave("use_case", role.id)}
                        onLongPress={(x, y) => setContextMenu({ visible: true, x, y, roleId: role.id })}
                      />
                    ))}
                  </Section>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AFK MESSAGE ───────────────────────────────────────────────────── */}
        {activePage === "afk_msg" && (
          <div className="animate-in slide-in-from-right duration-300 w-full pb-10 relative">
            <SubHeader title="AFK Message" />

            <div className="flex flex-col items-center pt-2 pb-6 px-4 text-center relative z-0">
              <img
                src="/afk-zzz.webp"
                alt="AFK"
                className="w-[84px] h-[84px] object-contain drop-shadow-2xl mb-4 pointer-events-none select-none"
                draggable={false}
              />
              <p style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, maxWidth: "250px", lineHeight: "1.4" }}>
                Automatically reply with a message<br />when you are away.
              </p>
            </div>

            <div className="px-4">
              <Section>
                <Row
                  label="Send AFK Message"
                  rightNode={<SwitchNode on={config.afk_enabled} onToggle={() => setAndSave("afk_enabled", !config.afk_enabled)} />}
                  onClick={() => setAndSave("afk_enabled", !config.afk_enabled)}
                  last
                />
              </Section>

              {config.afk_enabled && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full">

                  {/* Message composer */}
                  <div className="bg-[#111111] border border-white/5 shadow-lg rounded-[24px] mb-4 p-4">
                    <div className="flex items-center mb-4 px-2">
                      <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                        {tgUser?.photo_url
                          ? <img src={tgUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
                          : <span className="text-white font-bold text-xl" style={{ fontFamily: SFD }}>
                              {(tgUser?.first_name?.[0] || tgUser?.username?.[0] || "L").toUpperCase()}
                            </span>
                        }
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 justify-center ml-4">
                        <span className="text-white text-[18px] mb-0.5 tracking-tight font-bold" style={{ fontFamily: SFD }}>
                          {tgUser
                            ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username
                            : "Lucas"
                          }
                        </span>
                      </div>
                    </div>

                    <ExpandingInput
                      label="Message text"
                      maxLength={1024}
                      value={localAfkText}
                      onChange={setLocalAfkText}
                      placeholder="E.g., I'm currently away..."
                      labelBg="#111111"
                    />

                    <button
                      onClick={async (e) => {
                        createRipple(e)
                        if (afkSaving === "saving") return
                        setAfkSaving("saving")
                        setConfig(prev => {
                          const next = { ...prev, afk_text: localAfkText }
                          saveConfigToServer(next, true).then(ok => {
                            setAfkSaving(ok ? "saved" : "error")
                            triggerVibration(ok ? "success" : "error")
                            setTimeout(() => setAfkSaving("idle"), 2000)
                          })
                          return next
                        })
                      }}
                      disabled={!localAfkText.trim() || afkSaving === "saving"}
                      className="w-full text-white font-bold rounded-[14px] py-3.5 mt-2 relative overflow-hidden flex items-center justify-center gap-2 transition-all duration-200"
                      style={{
                        fontSize: "16px", fontFamily: SF,
                        background: afkSaving === "saved"  ? "#34c759"
                                  : afkSaving === "error"  ? "#ff453a"
                                  : "#60a5fa",
                        opacity: !localAfkText.trim() ? 0.5 : 1
                      }}
                    >
                      {afkSaving === "saving" && <Loader2 className="w-4 h-4 animate-spin relative z-10" />}
                      {afkSaving === "saved"  && <Check   className="w-4 h-4 relative z-10" strokeWidth={3} />}
                      <span className="relative z-10">
                        {afkSaving === "saving" ? "Saving…"
                       : afkSaving === "saved"  ? "Saved"
                       : afkSaving === "error"  ? "Error — retry"
                       : "Save Message"}
                      </span>
                    </button>
                  </div>

                  {/* Schedule — dimmed when Only Offline is on */}
                  <div className={config.afk_offline_only ? "opacity-50 pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
                    <Section title="Schedule" titleColor="#60a5fa">
                      <Row
                        leftNode={<div className="mt-[1px]"><RadioButton selected={config.afk_schedule === "always"} /></div>}
                        label="Send Always"
                        hideArrow
                        onClick={() => setAndSave("afk_schedule", "always")}
                      />
                      <Row
                        leftNode={<div className="mt-[1px]"><RadioButton selected={config.afk_schedule === "outside"} /></div>}
                        label="Outside of Business Hours"
                        hideArrow
                        onClick={() => setAndSave("afk_schedule", "outside")}
                        last={config.afk_schedule !== "outside" && config.afk_schedule !== "custom"}
                      />

                      {/* Business Hours sub-panel */}
                      {config.afk_schedule === "outside" && (
                        <div className="animate-in fade-in duration-200 bg-[#151515] border-t border-white/5">
                          <div className="px-5 py-4 flex flex-col gap-3">
                            <span className="text-[14px] font-medium text-white" style={{ fontFamily: SF }}>Active Days</span>
                            <div className="flex items-center justify-between">
                              {[{id:1,l:"M"},{id:2,l:"T"},{id:3,l:"W"},{id:4,l:"T"},{id:5,l:"F"},{id:6,l:"S"},{id:7,l:"S"}].map((d, idx) => {
                                const selected = config.afk_business_days.includes(d.id)
                                return (
                                  <button
                                    key={`${d.id}-${idx}`}
                                    onClick={(e) => {
                                      createRipple(e)
                                      const newDays = selected
                                        ? config.afk_business_days.filter(day => day !== d.id)
                                        : [...config.afk_business_days, d.id]
                                      setAndSave("afk_business_days", newDays)
                                    }}
                                    className="relative overflow-hidden w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[15px] transition-colors"
                                    style={{
                                      fontFamily: SF,
                                      backgroundColor: selected ? "#60a5fa" : "#1c1c1e",
                                      color: selected ? "#ffffff" : "#8e8e93",
                                      border: selected ? "none" : "1px solid rgba(255,255,255,0.05)"
                                    }}
                                  >
                                    <span className="relative z-10">{d.l}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div className="h-[1px] bg-white/5 ml-5" />
                          <Row
                            label="Business Start"
                            rightNode={
                              <div className="relative flex items-center justify-end w-[100px] h-[30px]">
                                <input type="time" value={config.afk_business_start}
                                  onChange={(e) => setAndSave("afk_business_start", e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 z-20" />
                                <span className="text-[16px] relative z-10" style={{ color: "#60a5fa", fontFamily: SF }}>{formatTime(config.afk_business_start)}</span>
                              </div>
                            }
                            hideArrow
                          />
                          <Row
                            label="Business End"
                            rightNode={
                              <div className="relative flex items-center justify-end w-[100px] h-[30px]">
                                <input type="time" value={config.afk_business_end}
                                  onChange={(e) => setAndSave("afk_business_end", e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 z-20" />
                                <span className="text-[16px] relative z-10" style={{ color: "#60a5fa", fontFamily: SF }}>{formatTime(config.afk_business_end)}</span>
                              </div>
                            }
                            hideArrow
                            last
                          />
                        </div>
                      )}

                      <Row
                        leftNode={<div className="mt-[1px]"><RadioButton selected={config.afk_schedule === "custom"} /></div>}
                        label="Custom Schedule"
                        hideArrow
                        onClick={() => setAndSave("afk_schedule", "custom")}
                        last={config.afk_schedule !== "custom"}
                      />

                      {/* Custom time range */}
                      {config.afk_schedule === "custom" && (
                        <div className="animate-in fade-in duration-200 bg-[#151515] border-t border-white/5">
                          <Row
                            label="Start Time"
                            rightNode={
                              <div className="relative flex items-center justify-end w-[100px] h-[30px]">
                                <input type="time" value={config.afk_start_time}
                                  onChange={(e) => setAndSave("afk_start_time", e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 z-20" />
                                <span className="text-[16px] relative z-10" style={{ color: "#60a5fa", fontFamily: SF }}>{formatTime(config.afk_start_time)}</span>
                              </div>
                            }
                            hideArrow
                          />
                          <Row
                            label="End Time"
                            rightNode={
                              <div className="relative flex items-center justify-end w-[100px] h-[30px]">
                                <input type="time" value={config.afk_end_time}
                                  onChange={(e) => setAndSave("afk_end_time", e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 z-20" />
                                <span className="text-[16px] relative z-10" style={{ color: "#60a5fa", fontFamily: SF }}>{formatTime(config.afk_end_time)}</span>
                              </div>
                            }
                            hideArrow
                            last
                          />
                        </div>
                      )}
                    </Section>
                  </div>

                  <Section>
                    <Row
                      label="Only if Offline"
                      sublabel="Send AFK message only when you haven't been active for 10+ minutes."
                      rightNode={<SwitchNode on={config.afk_offline_only} onToggle={() => setAndSave("afk_offline_only", !config.afk_offline_only)} />}
                      onClick={() => setAndSave("afk_offline_only", !config.afk_offline_only)}
                      alignItems="start"
                      last
                    />
                  </Section>

                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
