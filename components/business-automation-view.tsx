"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { 
  Loader2, Sparkles, Shield, Workflow, 
  ChevronRight, BarChart3, Check, MessageSquare, Bot, User, FileText, Book,
  Clock, MessageSquarePlus, Eye, Zap, Globe, CircleUserRound, Plus,
  Pencil, Copy, Trash2
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILOS GLOBALES PARA EL EFECTO RIPPLE Y SCROLLBAR ──
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

const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

const triggerVibration = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success') => {
  const tg = getTg();
  if (!tg?.HapticFeedback) return;
  if (type === 'error' || type === 'success') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

// ── FUNCIÓN HELPER PARA CREAR EL EFECTO RIPPLE ──
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

// ── DATOS DE LOS PRESETS Y ROLES ──
const PRESETS_DATA = [
  { id: 'max', name: 'Max', emoji: '🧊', theme: '#60a5fa', tagline: 'Silent presence', desc: 'Welcome & Away messages only. AI is off. Perfect when you just want automated greetings without any AI involvement.' },
  { id: 'ravage', name: 'Ravage', emoji: '⚡', theme: '#ffcc00', tagline: 'Smart replies, zero setup', desc: 'AI autoreply on with a natural human feel. Spam protection active. Great default for personal or casual business use.' },
  { id: 'blaze', name: 'Blaze', emoji: '🔥', theme: '#ff9f0a', tagline: 'Sales mode', desc: 'Sales persona, aggressive spam filter, automatic follow-ups, and daily activity digest. Built to convert leads.' },
  { id: 'beast', name: 'Beast', emoji: '💀', theme: '#ff453a', tagline: 'Full control, max automation', desc: 'Every feature on. Ultra-natural replies, tight spam shield, 3-touch follow-up sequences, blacklist filtering, early morning digest.' }
];

const ROLES_DATA = [
  {
    id: 'assistant',
    label: 'Assistant',
    desc: "The assistant is a personal assistant with a focus on adapting to the user's preferences.\n\nIt learns the user's style and preferences to provide responses that are in tune with how they would typically communicate and what their needs are.\n\nIt is flexible and can adapt to different tasks."
  },
  {
    id: 'summarizer',
    label: 'Summarizer',
    desc: "You are an expert at summarizing messages. You prefer to use clauses instead of complete sentences. Do not answer any question from the messages. Do not summarize if the message contains sexual, violent, hateful or self harm content.\n\nPlease keep your summary of the input within 3 sentences, fewer than 60 words."
  },
  {
    id: 'proofreader',
    label: 'Proofreader',
    desc: "The assistant is a meticulous proofreader.\n\nIt will carefully examine given texts for grammatical errors, typos, and style issues. It will also suggest improvements to the writing to make it more clear and effective.\n\nFocus on fixing grammar, spelling, punctuation, and syntax to enhance the readability of the text."
  }
];

// ── COMPONENTES REUTILIZABLES ──

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

function SubHeader({ title, rightNode }: { title: string, rightNode?: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center px-4 pb-3 sticky top-0 z-50 bg-[#000000]" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
    }}>
      <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      
      {rightNode && (
        <div className="absolute right-4 bottom-1.5 flex items-center">
          {rightNode}
        </div>
      )}
    </div>
  )
}

function Section({ title, footer, children }: { title?: string; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-4 w-full"> 
      {title && (
        <div className="px-4 mb-1.5 flex items-center justify-between">
          <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-1.5 pt-1.5 relative">
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
  onLongPress?: (x: number, y: number) => void;
  hideArrow?: boolean;
  last?: boolean;
  alignItems?: "center" | "start"; 
  preserveWhitespace?: boolean;
}

function Row({ label, sublabel, value, leftNode, rightNode, onClick, onLongPress, hideArrow = false, last = false, alignItems = "center", preserveWhitespace = false }: RowProps) {
  
  // Lógica avanzada para diferenciar tap y long press
  const touchRef = useRef({ startX: 0, startY: 0, timer: null as any, triggered: false });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (onClick && !onLongPress) createRipple(e);
    
    if (onLongPress) {
      touchRef.current.startX = e.clientX;
      touchRef.current.startY = e.clientY;
      touchRef.current.triggered = false;
      
      touchRef.current.timer = setTimeout(() => {
        touchRef.current.triggered = true;
        triggerVibration('medium');
        onLongPress(e.clientX, e.clientY);
      }, 500);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!onLongPress || !touchRef.current.timer) return;
    const dx = Math.abs(e.clientX - touchRef.current.startX);
    const dy = Math.abs(e.clientY - touchRef.current.startY);
    if (dx > 10 || dy > 10) {
      clearTimeout(touchRef.current.timer);
      touchRef.current.timer = null;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchRef.current.timer) {
      clearTimeout(touchRef.current.timer);
      touchRef.current.timer = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (touchRef.current.triggered) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick && onLongPress) createRipple(e as any);
    onClick?.();
  };

  const content = (
    <>
      {leftNode}
      <div className={`flex flex-col flex-1 min-w-0 relative z-10 ${alignItems === "center" ? "py-0.5" : ""}`}>
        <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF, lineHeight: "1.2" }}>
          {label}
        </span>
        {sublabel && (
          <span className={`text-[13px] text-[#8e8e93] leading-[1.4] mt-[5px] ${preserveWhitespace ? 'whitespace-pre-wrap' : ''}`} style={{ fontFamily: SF }}>
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-2">
        {value && (
          <span className="text-[16px] font-normal text-[#60a5fa]" style={{ fontFamily: SF }}>
            {value}
          </span>
        )}
        {rightNode ? rightNode : (!hideArrow && onClick && !value && (
          <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
        ))}
      </div>
    </>
  );

  return (
    <>
      <button 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        disabled={!onClick && !rightNode && !onLongPress} 
        className={`relative overflow-hidden w-full flex gap-3.5 px-4 py-3 ${onClick || onLongPress ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left items-${alignItems}`}
      >
        {content}
      </button>
      {!last && <div className={`h-[1px] bg-[#1c1c1e] ${leftNode ? 'ml-[52px]' : 'ml-4'}`} />}
    </>
  )
}

function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#60a5fa]' : 'border-[#555558]'}`}>
      {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#60a5fa]" />}
    </div>
  )
}

const RadioRow = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
  <button onClick={(e) => { createRipple(e); onClick(); }} className="relative overflow-hidden flex items-center justify-between w-full px-4 py-3 active:bg-white/5 transition-colors text-left">
    <span className="text-white font-medium relative z-10" style={{ fontSize: "16px", fontFamily: SF }}>{label}</span>
    <RadioButton selected={selected} />
  </button>
)

const TextPreviewRow = ({ title, placeholder, value, leftNode, onClick }: any) => (
  <button 
    className="relative overflow-hidden px-4 py-3 w-full text-left active:bg-white/5 transition-colors flex flex-col" 
    onClick={(e) => { createRipple(e); onClick(); }} 
  >
    <div className="flex items-center gap-3.5 mb-2 w-full relative z-10">
      {leftNode}
      <div className="flex flex-1 items-center justify-between">
         <span className="text-[16px] text-white font-medium" style={{ fontFamily: SF }}>{title}</span>
         <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
      </div>
    </div>
    <p className="text-[14px] leading-snug relative z-10 line-clamp-3" style={{ fontFamily: SF, color: value ? "#8e8e93" : "#636366", marginLeft: leftNode ? "34px" : "0px" }}>
      {value || placeholder}
    </p>
  </button>
);

const ShinyActionButton = ({ label, onClick, className = "", themeColor = "#60a5fa" }: { label: string, onClick: () => void, className?: string, themeColor?: string }) => (
  <button
    onClick={(e) => { createRipple(e); onClick(); }}
    className={`relative rounded-full px-5 py-3 transition-all active:opacity-80 overflow-hidden ${className}`}
    style={{ background: themeColor, fontFamily: SF }}
  >
    <span className={`relative z-10 font-bold text-white shadow-sm`} style={{ fontSize: "16px" }}>
      {label}
    </span>
  </button>
)

const AutoResizeTextarea = ({ defaultValue, onBlurSave, placeholder }: { defaultValue: string; onBlurSave: (val: string) => void; placeholder: string; }) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [val, setVal] = useState(defaultValue || "")
  const MAX_CHARS = 4092;

  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }

  useEffect(() => { adjustHeight() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newVal = e.target.value
    if (newVal.length > MAX_CHARS) newVal = newVal.slice(0, MAX_CHARS)
    setVal(newVal)
    adjustHeight()
  }

  return (
    <div className="relative w-full h-full flex flex-col mt-2">
      <textarea
        ref={textRef}
        value={val}
        onChange={handleChange}
        onBlur={() => onBlurSave(val)}
        placeholder={placeholder}
        className="w-full p-5 text-white placeholder:text-[#636366] focus:outline-none resize-none transition-colors rounded-[24px] shadow-lg border border-white/5"
        style={{ 
          background: "#111111", 
          fontFamily: SF, 
          fontSize: "16px", 
          minHeight: "240px",
          boxSizing: "border-box"
        }}
      />
    </div>
  )
}

// ── COMPONENTE EXPANDIBLE CON LIMITE Y VIBRACIÓN ──
const ExpandingInput = ({ label, maxLength, value, onChange, placeholder = "" }: { label: string, maxLength: number, value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [warningActive, setWarningActive] = useState(false);
  
  const remaining = maxLength - value.length;

  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }

  useEffect(() => { adjustHeight() }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    
    // Si intenta sobrepasar
    if (val.length > maxLength) {
      val = val.slice(0, maxLength);
      
      // Activar advertencia visual
      setWarningActive(true);
      setTimeout(() => setWarningActive(false), 500);
      
      // Vibración
      triggerVibration('error');
    }
    
    onChange(val);
  }

  return (
    <div className="relative w-full mb-8 mt-3">
      <label 
        className={`absolute -top-2.5 left-3 px-1.5 text-[13px] bg-[#111111] z-10 font-medium transition-colors duration-200 ${warningActive ? 'text-[#ff453a]' : 'text-[#60a5fa]'}`} 
        style={{ fontFamily: SF }}
      >
        {label} • {remaining}
      </label>
      <textarea
        ref={textRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-[1.5px] border-[#60a5fa] rounded-[12px] px-4 py-3.5 text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#636366]"
        style={{ fontFamily: SF, fontSize: "16px", minHeight: "56px" }}
        rows={1}
      />
    </div>
  )
}

const BottomSheet = ({ isOpen, onClose, onSave, title, description, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative border-t border-white/5 rounded-t-[32px] w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-400" style={{ background: "#111111" }}>
        
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button onClick={(e) => { createRipple(e); onClose(); }} className="relative overflow-hidden px-4 py-2 text-[#8e8e93] font-medium active:opacity-60 rounded-full" style={{ fontFamily: SF }}>
            <span className="relative z-10">Cancel</span>
          </button>
          <h3 className="text-white font-bold tracking-tight text-center flex-1 mx-2" style={{ fontSize: "17px", fontFamily: SFD }}>
            {title}
          </h3>
          <button onClick={(e) => { createRipple(e); onSave(); }} className="relative overflow-hidden px-4 py-2 text-[#60a5fa] font-bold active:opacity-60 rounded-full" style={{ fontFamily: SF }}>
            <span className="relative z-10">Save</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto pb-10">
          {description && <p className="text-[#8e8e93] text-center mb-7 leading-snug px-3" style={{ fontSize: "14px", fontFamily: SF }}>{description}</p>}
          <div className="bg-[#1c1c1e] rounded-[24px] overflow-hidden border border-white/5 shadow-lg pb-2 pt-2">
             {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL ──

interface BusinessAutomationViewProps {
  onClose: () => void
  apiBaseUrl?: string
}

export function BusinessAutomationView({ 
  onClose, 
  apiBaseUrl = ""
}: BusinessAutomationViewProps) {
  
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState<
    'main' | 'presets' | 'chat_access' | 'agent_profile' | 'workflows' | 'safety' | 'reports' | 
    'system_instructions' | 'knowledge_base' | 'greeting_msg' | 'away_msg' | 'roles' | 'new_role'
  >('main')
  
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tempVal, setTempVal] = useState<any>("")
  const [selectedPresetId, setSelectedPresetTab] = useState<string>('ravage')

  // Estados para el nuevo rol y edición
  const [newRoleName, setNewRoleName] = useState("")
  const [newRolePrompt, setNewRolePrompt] = useState("")
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)

  // Estado para el menú contextual de Roles
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, roleId: string } | null>(null)

  const [config, setConfig] = useState({
    auto_reply_filter: "everyone", 
    ai_autoreply_enabled: true,
    use_case: "assistant", 
    tone: "adaptive", 
    ai_persona_hint: "",
    kb_text: "",
    greeting_enabled: false,
    greeting_text: "",
    away_enabled: false,
    away_text: "",
    read_enabled: true,
    spam_filter_enabled: true,
    spam_sensitivity: "medium", 
    urgency_notify: true,
    humanize_enabled: true,
    humanize_speed: "normal", 
    followup_enabled: false,
    followup_delay_h: 24,
    followup_max: 2,
    followup_text: "",
    invocation_enabled: true,
    bot_names: "xblum, blum",
    daily_digest: false,
    daily_digest_hour: 9,
    history_enabled: true,
    response_streaming: true,
    show_response_only: false,
    insert_quote: true,
    custom_roles: [] as { id: string, label: string, desc: string }[]
  })

  const saveConfigToServer = useCallback(async (currentConfig: typeof config) => {
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config: currentConfig })
      })
    } catch (err) {
      console.error("[AutoSave] Error:", err)
    }
  }, [apiBaseUrl])

  const setAndSave = (key: keyof typeof config, value: any) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value }
      saveConfigToServer(next)
      return next
    })
  }

  const applyPreset = () => triggerVibration('success')

  const handleSaveRole = () => {
    if (!newRoleName.trim() || !newRolePrompt.trim()) return;
    
    if (editingRoleId) {
      const updatedRoles = config.custom_roles.map(r => 
        r.id === editingRoleId ? { ...r, label: newRoleName, desc: newRolePrompt } : r
      );
      setAndSave('custom_roles', updatedRoles);
    } else {
      const newRole = {
        id: `custom_${Date.now()}`,
        label: newRoleName,
        desc: newRolePrompt
      }
      const updatedRoles = [...(config.custom_roles || []), newRole];
      setAndSave('custom_roles', updatedRoles);
      setAndSave('use_case', newRole.id);
    }
    
    setNewRoleName("");
    setNewRolePrompt("");
    setEditingRoleId(null);
    setActivePage('roles');
  }

  const openNewRoleView = () => {
    setNewRoleName("");
    setNewRolePrompt("");
    setEditingRoleId(null);
    setActivePage('new_role');
  }

  const handleEditRole = () => {
    if (!contextMenu) return;
    const role = config.custom_roles.find(r => r.id === contextMenu.roleId);
    if (role) {
      setNewRoleName(role.label);
      setNewRolePrompt(role.desc);
      setEditingRoleId(role.id);
      setActivePage('new_role');
    }
    setContextMenu(null);
  };

  const handleCopyRole = () => {
    if (!contextMenu) return;
    const role = config.custom_roles.find(r => r.id === contextMenu.roleId);
    if (role) {
      navigator.clipboard.writeText(role.desc);
      triggerVibration('success');
    }
    setContextMenu(null);
  };

  const handleDeleteRole = () => {
    if (!contextMenu) return;
    const updatedRoles = config.custom_roles.filter(r => r.id !== contextMenu.roleId);
    setAndSave('custom_roles', updatedRoles);
    
    if (config.use_case === contextMenu.roleId) {
      setAndSave('use_case', 'assistant');
    }
    triggerVibration('success');
    setContextMenu(null);
  };

  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    tg.BackButton.show()
    const handleBackAction = () => {
      if (activePage === 'main') {
        onClose()
      } else if (activePage === 'system_instructions' || activePage === 'knowledge_base') {
        setActivePage('agent_profile')
      } else if (activePage === 'greeting_msg' || activePage === 'away_msg') {
        setActivePage('workflows')
      } else if (activePage === 'new_role') {
        setActivePage('roles')
      } else if (activePage === 'roles') {
        setActivePage('main')
      } else {
        setActivePage('main')
      }
    }

    tg.BackButton.onClick(handleBackAction)
    return () => { tg.BackButton.offClick(handleBackAction) }
  }, [activePage, onClose])

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#000] flex items-center justify-center w-full h-full">
        <Loader2 className="w-7 h-7 text-[#60a5fa] animate-spin" />
      </div>
    )
  }

  const currentTheme = PRESETS_DATA.find(p => p.id === selectedPresetId)?.theme || "#60a5fa";
  const currentPresetName = PRESETS_DATA.find(p => p.id === selectedPresetId)?.name || "Preset";
  
  const getRoleDisplayName = () => {
    const defaultRole = ROLES_DATA.find(r => r.id === config.use_case);
    if (defaultRole) return defaultRole.label;
    const customRole = config.custom_roles?.find(r => r.id === config.use_case);
    if (customRole) return customRole.label;
    return "Assistant";
  }

  // Calcular estilo posicional del menú contextual asegurando que no se salga de la pantalla
  let menuStyle: any = {};
  if (contextMenu?.visible) {
    let top = contextMenu.y;
    let left = contextMenu.x;
    
    if (typeof window !== "undefined") {
      // Ajuste para evitar que el menú se salga del borde derecho o inferior
      if (left > window.innerWidth - 150) left = window.innerWidth - 150;
      if (top > window.innerHeight - 150) top = window.innerHeight - 150;
    }
    menuStyle = { top, left };
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-300">
      <style>{RIPPLE_STYLE}</style>

      {/* OVERLAY DEL MENÚ CONTEXTUAL MÁS COMPACTO */}
      {contextMenu?.visible && (
        <>
          <div 
            className="fixed inset-0 z-[150]" 
            onPointerDown={(e) => { e.stopPropagation(); setContextMenu(null); }}
          />
          <div 
            className="fixed z-[160] bg-[#212123] rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col py-1.5 animate-in zoom-in-95 duration-150"
            style={{ ...menuStyle, minWidth: '135px' }}
          >
            <button className="flex items-center gap-2.5 px-3 py-2 text-white active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleEditRole(); }}>
              <Pencil className="w-[17px] h-[17px] text-[#e5e5e7]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: '15px' }}>Edit</span>
            </button>
            <button className="flex items-center gap-2.5 px-3 py-2 text-white active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleCopyRole(); }}>
              <Copy className="w-[17px] h-[17px] text-[#e5e5e7]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: '15px' }}>Copy</span>
            </button>
            <button className="flex items-center gap-2.5 px-3 py-2 text-[#ff453a] active:bg-white/10 transition-colors text-left" onClick={(e) => { createRipple(e); handleDeleteRole(); }}>
              <Trash2 className="w-[17px] h-[17px]" strokeWidth={2.5} />
              <span className="font-medium" style={{ fontFamily: SF, fontSize: '15px' }}>Delete</span>
            </button>
          </div>
        </>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 w-full px-0">
        
        {/* ── MAIN MENU ── */}
        {activePage === 'main' && (
          <div className="animate-in fade-in duration-300 w-full">
            <SubHeader title="AI Chat" />
            
            <div className="flex justify-center mt-10 mb-10">
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
                  leftNode={<Globe className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="Services" 
                  value="None"
                  hideArrow
                  onClick={() => setActivePage('presets')} 
                />
                <Row 
                  leftNode={<CircleUserRound className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="Roles" 
                  value={getRoleDisplayName()}
                  hideArrow
                  onClick={() => setActivePage('roles')}
                />
                <Row 
                  leftNode={<MessageSquare className="w-[22px] h-[22px] text-[#8e8e93]" strokeWidth={1.5} />}
                  label="History" 
                  rightNode={<SwitchNode on={config.history_enabled} onToggle={() => setAndSave('history_enabled', !config.history_enabled)} activeColor="#60a5fa" />}
                  onClick={() => setAndSave('history_enabled', !config.history_enabled)}
                  last
                />
              </Section>

              <Section title="Other">
                <Row 
                  label="Response Streaming" 
                  sublabel="Ensures smoother and faster display of responses."
                  rightNode={<SwitchNode on={config.response_streaming} onToggle={() => setAndSave('response_streaming', !config.response_streaming)} activeColor="#60a5fa" />}
                  onClick={() => setAndSave('response_streaming', !config.response_streaming)}
                />
                <Row 
                  label="Show Response Only" 
                  rightNode={<SwitchNode on={config.show_response_only} onToggle={() => setAndSave('show_response_only', !config.show_response_only)} activeColor="#60a5fa" />}
                  onClick={() => setAndSave('show_response_only', !config.show_response_only)}
                />
                <Row 
                  label="Insert Response as Quote" 
                  rightNode={<SwitchNode on={config.insert_quote} onToggle={() => setAndSave('insert_quote', !config.insert_quote)} activeColor="#60a5fa" />}
                  onClick={() => setAndSave('insert_quote', !config.insert_quote)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── ROLES PAGE ── */}
        {activePage === 'roles' && (
          <div className="animate-in slide-in-from-right duration-300 w-full pb-10">
            
            <SubHeader 
              title="Roles" 
              rightNode={
                <button 
                  onClick={(e) => { createRipple(e); openNewRoleView(); }} 
                  className="w-10 h-10 flex items-center justify-center active:opacity-60 transition-opacity rounded-full translate-y-8 mr-1 relative overflow-hidden" 
                >
                  <Plus className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
                </button>
              } 
            />

            <div className="flex flex-col items-center mt-6 mb-8 px-4 text-center">
              <img 
                src="/animatedemojies_agadxamaajlb2uy.webp" 
                alt="Roles Masks" 
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
                    preserveWhitespace={true}
                    leftNode={
                      <div className="mt-[1px]">
                        <RadioButton selected={config.use_case === role.id} />
                      </div>
                    }
                    label={role.label}
                    sublabel={role.desc}
                    hideArrow
                    last={idx === ROLES_DATA.length - 1}
                    onClick={() => setAndSave('use_case', role.id)}
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
                        preserveWhitespace={true}
                        leftNode={
                          <div className="mt-[1px]">
                            <RadioButton selected={config.use_case === role.id} />
                          </div>
                        }
                        label={role.label}
                        sublabel={role.desc}
                        hideArrow
                        last={idx === config.custom_roles.length - 1}
                        onClick={() => setAndSave('use_case', role.id)}
                        onLongPress={(x, y) => setContextMenu({ visible: true, x, y, roleId: role.id })}
                      />
                    ))}
                  </Section>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NEW/EDIT ROLE PAGE ── */}
        {activePage === 'new_role' && (
          <div className="animate-in slide-in-from-right duration-300 w-full h-[100vh] flex flex-col bg-[#000000]">
            <SubHeader title={editingRoleId ? "Edit Role" : "New Role"} />
            <div className="px-5 pt-8 flex-1 flex flex-col bg-[#111111] mt-3">
              
              <ExpandingInput 
                label="Name"
                maxLength={64}
                value={newRoleName}
                onChange={setNewRoleName}
              />
              
              <ExpandingInput 
                label="Prompt"
                maxLength={1024}
                value={newRolePrompt}
                onChange={setNewRolePrompt}
              />
              
              <p className="text-[#8e8e93] text-[13px] leading-[1.4] mt-[-16px] mb-6 px-1" style={{ fontFamily: SF }}>
                A prompt is the initial text given to the model to start generating a response or continue a dialogue.
              </p>

              <div className="mt-auto pb-10 relative">
                <button
                  onClick={(e) => { createRipple(e as any); handleSaveRole(); }}
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

        {/* ── AGENT PRESETS ── */}
        {activePage === 'presets' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Agent Presets" />
            
            <p className="px-5 mt-4 mb-6 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Quickly apply predefined behaviors. You can customize details later.
            </p>

            <div className="flex overflow-x-auto gap-3 mb-6 pb-2 px-4 snap-x hide-scrollbar">
              {PRESETS_DATA.map(p => (
                 <button 
                    key={p.id}
                    onClick={(e) => { createRipple(e); setSelectedPresetTab(p.id); }} 
                    className="relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-[20px] border transition-all min-w-[110px] shrink-0 snap-center"
                    style={{
                      borderColor: selectedPresetId === p.id ? p.theme : 'rgba(255,255,255,0.05)',
                      backgroundColor: selectedPresetId === p.id ? `${p.theme}15` : '#111111'
                    }}
                 >
                    <div className="text-3xl mb-2 relative z-10">{p.emoji}</div>
                    <div className="text-white font-semibold tracking-tight relative z-10" style={{ fontFamily: SF, fontSize: "16px" }}>{p.name}</div>
                 </button>
              ))}
            </div>

            <div className="w-full flex flex-col items-center mb-8 px-5 text-center animate-in fade-in duration-300" key={selectedPresetId}>
               <h3 className="text-[#60a5fa] font-bold text-lg mb-1" style={{ fontFamily: SFD }}>
                 {PRESETS_DATA.find(p => p.id === selectedPresetId)?.tagline}
               </h3>
               <p className="text-[#8e8e93]" style={{ fontSize: "14px", fontFamily: SF, lineHeight: "1.4" }}>
                 {PRESETS_DATA.find(p => p.id === selectedPresetId)?.desc}
               </p>
               
               <div className="mt-6 w-full max-w-[250px]">
                 <ShinyActionButton 
                   label={`Apply Preset`} 
                   onClick={applyPreset} 
                   themeColor={currentTheme}
                   className="w-full"
                 />
               </div>
            </div>

            <div className="px-4">
               <Section title={`${currentPresetName} Configuration`} footer="Changes here override the preset automatically.">
                <Row 
                  leftNode={<Sparkles className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="AI Auto-Reply"
                  rightNode={<SwitchNode on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} activeColor={currentTheme} />}
                  onClick={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)}
                />
                <Row 
                  leftNode={<Shield className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Spam Filtering"
                  rightNode={<SwitchNode on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} activeColor={currentTheme} />}
                  onClick={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)}
                />
                <Row 
                  leftNode={<MessageSquare className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Simulate Typing"
                  rightNode={<SwitchNode on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} activeColor={currentTheme} />}
                  onClick={() => setAndSave('humanize_enabled', !config.humanize_enabled)}
                />
                <Row 
                  leftNode={<Workflow className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Smart Follow-ups"
                  rightNode={<SwitchNode on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} activeColor={currentTheme} />}
                  onClick={() => setAndSave('followup_enabled', !config.followup_enabled)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── AGENT PROFILE ── */}
        {activePage === 'agent_profile' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Agent Profile" />
            <p className="px-5 mt-4 mb-8 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Configure your agent's identity, behavior rules, and reference knowledge.
            </p>
            
            <div className="px-4">
              <Section>
                <Row 
                  leftNode={<Sparkles className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="AI Auto-Reply"
                  sublabel="Let the AI handle standard inbound messages."
                  rightNode={<SwitchNode on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} />}
                  onClick={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)}
                  last
                />
              </Section>

              {config.ai_autoreply_enabled && (
                <div className="animate-in fade-in duration-300 w-full space-y-6 mt-6">
                  <Section title="Agent Identity">
                    <Row 
                      leftNode={<User className="w-[20px] h-[20px] text-[#8e8e93]" />}
                      label="Account Role"
                      value={getRoleDisplayName()}
                      onClick={() => setActivePage('roles')}
                      last
                    />
                  </Section>
                  
                  <Section title="Tone & Style">
                    <Row 
                      leftNode={<MessageSquare className="w-[20px] h-[20px] text-[#8e8e93]" />}
                      label="Tone Register"
                      value={config.tone.charAt(0).toUpperCase() + config.tone.slice(1)}
                      onClick={() => { setTempVal(config.tone); setActiveModal('tone'); }}
                      last
                    />
                  </Section>

                  <Section title="System Instructions">
                    <TextPreviewRow 
                      title="System Instructions"
                      leftNode={<FileText className="w-[20px] h-[20px] text-[#8e8e93]" />}
                      placeholder="Click to set core behavior and guardrails..."
                      value={config.ai_persona_hint}
                      onClick={() => setActivePage('system_instructions')}
                    />
                  </Section>

                  <Section title="Knowledge Base">
                    <TextPreviewRow 
                      title="Knowledge Base"
                      leftNode={<Book className="w-[20px] h-[20px] text-[#8e8e93]" />}
                      placeholder="Click to add custom context or FAQs..."
                      value={config.kb_text}
                      onClick={() => setActivePage('knowledge_base')}
                    />
                  </Section>
                </div>
              )}
             </div>
          </div>
        )}

        {/* ── TEXT EDITOR VIEWS ── */}
        {activePage === 'system_instructions' && (
          <div className="animate-in slide-in-from-right duration-300 w-full h-[85vh] flex flex-col">
            <SubHeader title="System Instructions" />
            <div className="px-4 flex-1 flex flex-col">
              <p className="px-2 mb-4 mt-4 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
                Detailed instructions guiding the model's responses.
              </p>
              <AutoResizeTextarea
                defaultValue={config.ai_persona_hint}
                onBlurSave={(v) => setAndSave('ai_persona_hint', v)}
                placeholder="E.g., You are a strictly concise technical support assistant..."
              />
            </div>
          </div>
        )}

        {activePage === 'knowledge_base' && (
          <div className="animate-in slide-in-from-right duration-300 w-full h-[85vh] flex flex-col">
            <SubHeader title="Knowledge Base" />
            <div className="px-4 flex-1 flex flex-col">
              <p className="px-2 mb-4 mt-4 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
                Provide specific business data or FAQs to ground responses.
              </p>
              <AutoResizeTextarea
                defaultValue={config.kb_text}
                onBlurSave={(v) => setAndSave('kb_text', v)}
                placeholder="Store your business context data here..."
              />
            </div>
          </div>
        )}

        {activePage === 'greeting_msg' && (
          <div className="animate-in slide-in-from-right duration-300 w-full h-[85vh] flex flex-col">
            <SubHeader title="Welcome Message" />
            <div className="px-4 flex-1 flex flex-col">
              <p className="px-2 mb-4 mt-4 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
                Sent automatically to users contacting you for the first time.
              </p>
              <AutoResizeTextarea
                defaultValue={config.greeting_text}
                onBlurSave={(v) => setAndSave('greeting_text', v)}
                placeholder="E.g., Hi there! How can I help you today?"
              />
            </div>
          </div>
        )}

        {activePage === 'away_msg' && (
          <div className="animate-in slide-in-from-right duration-300 w-full h-[85vh] flex flex-col">
            <SubHeader title="Away Message" />
            <div className="px-4 flex-1 flex flex-col">
              <p className="px-2 mb-4 mt-4 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
                Sent automatically when you are scheduled as away.
              </p>
              <AutoResizeTextarea
                defaultValue={config.away_text}
                onBlurSave={(v) => setAndSave('away_text', v)}
                placeholder="E.g., I'm currently away but will reply as soon as possible."
              />
            </div>
          </div>
        )}

        {/* ── CHAT ACCESS SCOPE ── */}
        {activePage === 'chat_access' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Chat Access Scope" />
            <div className="pt-6 px-4">
              <Section title="Allowed Conversations" footer="Configure exclusions in the main bot interface.">
                <Row 
                  label="All private chats except..."
                  onClick={() => setAndSave('auto_reply_filter', 'everyone')}
                  rightNode={config.auto_reply_filter === 'everyone' ? <Check className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} /> : null}
                  hideArrow
                />
                <Row 
                  label="Only selected chats"
                  onClick={() => setAndSave('auto_reply_filter', 'whitelist')}
                  rightNode={config.auto_reply_filter === 'whitelist' ? <Check className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} /> : null}
                  hideArrow
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── MESSAGES & WORKFLOWS ── */}
        {activePage === 'workflows' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Messages & Workflows" />
            <div className="pt-6 px-4">

              <Section title="Basic Behaviors">
                <Row 
                  leftNode={<Eye className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Mark messages as read"
                  sublabel="Automatically mark inbound messages as read."
                  rightNode={<SwitchNode on={config.read_enabled} onToggle={() => setAndSave('read_enabled', !config.read_enabled)} />}
                  onClick={() => setAndSave('read_enabled', !config.read_enabled)}
                  last
                />
              </Section>

              <Section title="Auto-Replies">
                <Row 
                  leftNode={<MessageSquarePlus className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Welcome Message"
                  sublabel="Greet first-time contacts automatically."
                  rightNode={<SwitchNode on={config.greeting_enabled} onToggle={() => setAndSave('greeting_enabled', !config.greeting_enabled)} />}
                  onClick={() => setAndSave('greeting_enabled', !config.greeting_enabled)}
                  last={!config.greeting_enabled}
                />
                {config.greeting_enabled && (
                  <TextPreviewRow 
                    title="Edit Welcome Message"
                    placeholder="Click to write your greeting message..."
                    value={config.greeting_text}
                    onClick={() => setActivePage('greeting_msg')}
                  />
                )}
              </Section>

              <Section>
                <Row 
                  leftNode={<Clock className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Away Message"
                  sublabel="Reply when you are out of office."
                  rightNode={<SwitchNode on={config.away_enabled} onToggle={() => setAndSave('away_enabled', !config.away_enabled)} />}
                  onClick={() => setAndSave('away_enabled', !config.away_enabled)}
                  last={!config.away_enabled}
                />
                 {config.away_enabled && (
                  <TextPreviewRow 
                    title="Edit Away Message"
                    placeholder="Click to write your away message..."
                    value={config.away_text}
                    onClick={() => setActivePage('away_msg')}
                  />
                )}
              </Section>

              <Section title="Engagement Loops">
                <Row 
                  leftNode={<Workflow className="w-[20px] h-[20px] text-[#8e8e93]" />}
                  label="Smart Follow-ups"
                  sublabel="Trigger automated follow-ups if user drops engagement."
                  rightNode={<SwitchNode on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} />}
                  onClick={() => setAndSave('followup_enabled', !config.followup_enabled)}
                  last={!config.followup_enabled}
                />
                {config.followup_enabled && (
                  <div className="px-5 py-4 flex gap-5 w-full bg-[#111111]">
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "6px" }}>Delay (Hours)</p>
                      <input 
                        type="number" defaultValue={config.followup_delay_h} onBlur={(e) => setAndSave('followup_delay_h', parseInt(e.target.value) || 0)} 
                        className="w-full bg-[#1c1c1e] text-white outline-none rounded-xl px-4 py-2 border border-white/5" style={{ fontSize: "16px", fontFamily: SF }} 
                      />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "6px" }}>Max Retries</p>
                      <input 
                        type="number" defaultValue={config.followup_max} onBlur={(e) => setAndSave('followup_max', parseInt(e.target.value) || 1)} 
                        className="w-full bg-[#1c1c1e] text-white outline-none rounded-xl px-4 py-2 border border-white/5" style={{ fontSize: "16px", fontFamily: SF }} 
                      />
                    </div>
                  </div>
                )}
              </Section>

              <Section title="Inline Agent">
                <Row 
                  label="Passive Mentions"
                  sublabel="Replies when its name is mentioned in groups."
                  rightNode={<SwitchNode on={config.invocation_enabled} onToggle={() => setAndSave('invocation_enabled', !config.invocation_enabled)} />}
                  onClick={() => setAndSave('invocation_enabled', !config.invocation_enabled)}
                  last={!config.invocation_enabled}
                />
                {config.invocation_enabled && (
                  <div className="w-full px-5 pb-5 pt-2 bg-[#111111]">
                    <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "6px" }}>Trigger Keywords</p>
                    <input 
                      type="text" defaultValue={config.bot_names} onBlur={(e) => setAndSave('bot_names', e.target.value)}
                      placeholder="e.g., agent, bot"
                      className="w-full bg-[#1c1c1e] text-white outline-none placeholder:text-[#636366] rounded-xl px-4 py-2.5 border border-white/5"
                      style={{ fontSize: "16px", fontFamily: SF }}
                    />
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* ── SAFETY & GUARDRAILS ── */}
        {activePage === 'safety' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Safety & Guardrails" />
            <div className="pt-6 px-4">
              <Section title="Spam Filtering">
                <Row 
                  label="Active Anti-Spam S2S"
                  sublabel="Identify and delete malicious links and ads."
                  rightNode={<SwitchNode on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} />}
                  onClick={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)}
                  last={!config.spam_filter_enabled}
                />
                {config.spam_filter_enabled && (
                  <Row 
                    label="Sensitivity"
                    value={config.spam_sensitivity.charAt(0).toUpperCase() + config.spam_sensitivity.slice(1)}
                    onClick={() => { setTempVal(config.spam_sensitivity); setActiveModal('spam_sens'); }}
                    last
                  />
                )}
              </Section>

              <Section title="Emulation & Alerts">
                <Row 
                  label="Simulate Typing"
                  sublabel="Inject artificial typing delays for organic rhythm."
                  rightNode={<SwitchNode on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} />}
                  onClick={() => setAndSave('humanize_enabled', !config.humanize_enabled)}
                />
                <Row 
                  label="Emergency Alerts"
                  sublabel="Receive DM logs on structural anomalies."
                  rightNode={<SwitchNode on={config.urgency_notify} onToggle={() => setAndSave('urgency_notify', !config.urgency_notify)} />}
                  onClick={() => setAndSave('urgency_notify', !config.urgency_notify)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activePage === 'reports' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Analytics & Logs" />
            <div className="pt-6 px-4">
              <Section title="Diagnostics">
                <Row 
                  label="24-Hour Metrics Digest"
                  sublabel="Receive daily performance reports directly."
                  rightNode={<SwitchNode on={config.daily_digest} onToggle={() => setAndSave('daily_digest', !config.daily_digest)} />}
                  onClick={() => setAndSave('daily_digest', !config.daily_digest)}
                  last={!config.daily_digest}
                />
                {config.daily_digest && (
                  <Row 
                    label="Dispatch Window"
                    value={`${config.daily_digest_hour.toString().padStart(2, '0')}:00 UTC`}
                    onClick={() => { setTempVal(config.daily_digest_hour); setActiveModal('digest_hour'); }}
                    last
                  />
                )}
              </Section>
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM SHEETS (Para las opciones extra) ── */}
      <BottomSheet
        isOpen={activeModal === 'tone'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('tone', tempVal); setActiveModal(null); }}
        title="Tone Register"
      >
        {['adaptive', 'casual', 'formal', 'empathetic'].map((opt, i, arr) => (
          <RadioRow
            key={opt}
            label={opt.charAt(0).toUpperCase() + opt.slice(1)}
            selected={tempVal === opt}
            onClick={() => setTempVal(opt)}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'spam_sens'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('spam_sensitivity', tempVal); setActiveModal(null); }}
        title="Aggressiveness Threshold"
      >
        {['low', 'medium', 'high'].map((opt, i, arr) => (
          <RadioRow
            key={opt}
            label={opt.charAt(0).toUpperCase() + opt.slice(1)}
            selected={tempVal === opt}
            onClick={() => setTempVal(opt)}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'digest_hour'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('daily_digest_hour', tempVal); setActiveModal(null); }}
        title="Dispatch Window"
      >
        <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
          {Array.from({ length: 24 }).map((_, h) => (
            <RadioRow
              key={h}
              label={`${h.toString().padStart(2, '0')}:00 UTC`}
              selected={tempVal === h}
              onClick={() => setTempVal(h)}
            />
          ))}
        </div>
      </BottomSheet>

    </div>
  )
}
