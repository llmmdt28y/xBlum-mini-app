"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { 
  Loader2, Sparkles, Shield, Workflow, 
  ChevronRight, BarChart3, Check, MessageSquare, Bot, User, FileText, Book,
  Clock, MessageSquarePlus, Eye, Zap
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── DATOS DE LOS PRESETS CON COLORES TEMÁTICOS ──
const PRESETS_DATA = [
  { 
    id: 'max', name: 'Max', emoji: '🧊', theme: '#32ade6', tagline: 'Silent presence', 
    desc: 'Welcome & Away messages only. AI is off. Perfect when you just want automated greetings without any AI involvement.' 
  },
  { 
    id: 'ravage', name: 'Ravage', emoji: '⚡', theme: '#ffcc00', tagline: 'Smart replies, zero setup', 
    desc: 'AI autoreply on with a natural human feel. Spam protection active. Great default for personal or casual business use.' 
  },
  { 
    id: 'blaze', name: 'Blaze', emoji: '🔥', theme: '#ff9f0a', tagline: 'Sales mode', 
    desc: 'Sales persona, aggressive spam filter, automatic follow-ups, and daily activity digest. Built to convert leads.' 
  },
  { 
    id: 'beast', name: 'Beast', emoji: '💀', theme: '#ff453a', tagline: 'Full control, max automation', 
    desc: 'Every feature on. Ultra-natural replies, tight spam shield, 3-touch follow-up sequences, blacklist filtering, early morning digest.' 
  }
];

// ── COMPONENTE DE TEXTO CON AUTO-RESIZE Y LÍMITE ──
const MAX_CHARS = 4092;

const AutoResizeTextarea = ({ 
  defaultValue, 
  onBlurSave, 
  placeholder 
}: { 
  defaultValue: string; 
  onBlurSave: (val: string) => void; 
  placeholder: string;
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [val, setVal] = useState(defaultValue || "")

  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newVal = e.target.value
    if (newVal.length > MAX_CHARS) {
      newVal = newVal.slice(0, MAX_CHARS)
    }
    setVal(newVal)
    adjustHeight()
  }

  const charsLeft = MAX_CHARS - val.length
  const showCounter = charsLeft <= 500
  const counterColor = charsLeft <= 100 ? "#ef4444" : "#8e8e93"

  return (
    <div className="relative w-full h-full flex flex-col">
      <textarea
        ref={textRef}
        value={val}
        onChange={handleChange}
        onBlur={() => onBlurSave(val)}
        placeholder={placeholder}
        className="w-full p-5 text-white placeholder:text-[#636366] focus:outline-none resize-none transition-colors rounded-3xl"
        style={{ 
          background: "#1a1a1c", 
          fontFamily: SF, 
          fontSize: "16px", 
          minHeight: "220px",
          paddingBottom: showCounter ? "36px" : "20px",
          boxSizing: "border-box"
        }}
      />
      {showCounter && (
        <div 
          className="absolute bottom-4 right-5 font-medium" 
          style={{ fontSize: "12px", color: counterColor, fontFamily: SF }}
        >
          {charsLeft} remaining
        </div>
      )}
    </div>
  )
}

// ── COMPONENTES REUTILIZABLES (ESTILO iOS MODERNO PREMIUM) ──

const SubHeader = ({ title }: { title: string }) => (
  // Header ajustado
  <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-4 pt-8" style={{ background: "#000000" }}>
    <h2 className="font-semibold text-white tracking-tight" style={{ fontSize: "18px", fontFamily: SF }}>
      {title}
    </h2>
  </div>
)

const Section = ({ header, footer, children }: { header?: string, footer?: string, children: React.ReactNode }) => (
  <div className="mb-8 w-full">
    {header && <p className="px-5 mb-2 text-[#8e8e93] uppercase font-medium" style={{ fontSize: "13px", fontFamily: SF, letterSpacing: "0.03em" }}>{header}</p>}
    <div className="rounded-3xl overflow-hidden" style={{ background: "#121214" }}>
      {children}
    </div>
    {footer && <p className="px-5 mt-2.5 text-[#636366]" style={{ fontSize: "13px", fontFamily: SF }}>{footer}</p>}
  </div>
)

const Row = ({ 
  icon, iconBg, label, sublabel, right, onClick, last 
}: { 
  icon?: React.ReactNode, iconBg?: string, label: string, sublabel?: React.ReactNode, right?: React.ReactNode, onClick?: () => void, last?: boolean 
}) => (
  <>
    <div
      onClick={onClick}
      className={`w-full flex items-center gap-[15px] px-5 py-[12px] transition-colors ${onClick ? 'active:bg-white/5 cursor-pointer' : ''}`}
    >
      {icon && (
        <div className={`shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-white ${iconBg || ''}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 text-left min-w-0 py-0.5">
        <p className="text-white truncate font-medium tracking-tight" style={{ fontSize: "16px", fontFamily: SF }}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-[1px] leading-snug truncate" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
            {sublabel}
          </p>
        )}
      </div>
      {right && <div className="shrink-0 ml-2">{right}</div>}
    </div>
    {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: icon ? "60px" : "20px" }} />}
  </>
)

const TextPreviewBubble = ({ title, icon, iconBg, placeholder, value, onClick }: any) => (
  <div className="px-5 py-[16px] w-full cursor-pointer active:bg-white/5 transition-colors" onClick={onClick}>
    <div className="flex items-center gap-[15px] mb-3">
      <div className={`shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-white ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0 py-0.5">
        <p className="text-white truncate font-medium tracking-tight" style={{ fontSize: "16px", fontFamily: SF }}>
          {title}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#3a3a3c] shrink-0" />
    </div>
    <div className="w-full bg-[#1a1a1c] rounded-2xl p-4 border border-[#2c2c2e] min-h-[90px] flex flex-col relative overflow-hidden shadow-inner">
        <p 
          className="text-[15px] leading-snug w-full" 
          style={{ 
            fontFamily: SF, 
            color: value ? "#ffffff" : "#636366",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {value || placeholder}
        </p>
        {value && <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#1a1a1c] to-transparent pointer-events-none" />}
    </div>
  </div>
);

const TelegramToggle = ({ on, onToggle, activeColor = "#3b82f6" }: { on: boolean; onToggle: () => void; activeColor?: string }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className="relative rounded-full transition-colors duration-300 shrink-0"
    style={{ width: "51px", height: "31px", background: on ? activeColor : "#2c2c2e" }}
  >
    <span
      className="absolute rounded-full shadow-md transition-all duration-300 bg-white"
      style={{
        width: "27px", height: "27px",
        top: "2px",
        left: on ? "22px" : "2px",
      }}
    />
  </button>
)

const RadioRow = ({ label, selected, onClick, last }: { label: string, selected: boolean, onClick: () => void, last?: boolean }) => (
  <>
    <div onClick={onClick} className="flex items-center justify-between px-5 py-[16px] active:bg-white/5 transition-colors cursor-pointer">
      <span className="text-white tracking-tight" style={{ fontSize: "16px", fontFamily: SF }}>{label}</span>
      <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors ${selected ? 'border-[#3b82f6]' : 'border-[#3a3a3c]'}`}>
        {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#3b82f6]" />}
      </div>
    </div>
    {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />}
  </>
)

// ── BOTÓN CON BRILLO SÓLO EN ESQUINAS OPUESTAS (Top-Left & Bottom-Right) ──
const ShinyActionButton = ({ label, onClick, className = "", secondary = false, themeColor = "#3b82f6" }: { label: string, onClick: () => void, className?: string, secondary?: boolean, themeColor?: string }) => (
  <button
    onClick={onClick}
    className={`relative rounded-full px-5 py-2.5 transition-all active:scale-[0.97] group overflow-hidden ${className}`}
    style={{ 
      background: "#2c2c2e", 
      fontFamily: SF,
    }}
  >
    {/* Brillo Top-Left */}
    <div className="absolute top-0 left-0 w-4 h-[1px] bg-gradient-to-r from-white/50 to-transparent pointer-events-none" />
    <div className="absolute top-0 left-0 w-[1px] h-4 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
    
    {/* Brillo Bottom-Right */}
    <div className="absolute bottom-0 right-0 w-4 h-[1px] bg-gradient-to-l from-white/50 to-transparent pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[1px] h-4 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />

    {/* Sombra activa interna central */}
    <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-100 transition-opacity duration-300 pointer-events-none" 
         style={{ background: `radial-gradient(circle at center, ${themeColor}30 0%, rgba(2c, 2c, 2e, 0) 70%)` }} />
    
    <span className={`relative z-10 font-semibold`} style={{ fontSize: "16px", color: secondary ? '#8e8e93' : themeColor }}>
      {label}
    </span>
  </button>
)

const BottomSheet = ({ isOpen, onClose, onSave, title, description, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative border-t border-[#1c1c1e] rounded-t-[32px] w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-400" style={{ background: "#000000" }}>
        
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <ShinyActionButton label="Cancel" onClick={onClose} secondary className="px-4 py-2" />
          <h3 className="text-white font-bold tracking-tight text-center flex-1 mx-2" style={{ fontSize: "18px", fontFamily: SFD }}>
            {title}
          </h3>
          <ShinyActionButton label="Save" onClick={onSave} className="px-5 py-2" />
        </div>

        <div className="p-5 overflow-y-auto pb-10">
          {description && <p className="text-[#8e8e93] text-center mb-7 leading-snug px-3" style={{ fontSize: "14px", fontFamily: SF }}>{description}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL ──

interface BusinessAutomationViewProps {
  onClose: () => void
  apiBaseUrl?: string
  agentGifUrl?: string 
}

export function BusinessAutomationView({ 
  onClose, 
  apiBaseUrl = "", 
  agentGifUrl = "/agent-robot.gif" 
}: BusinessAutomationViewProps) {
  
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState<
    'main' | 'presets' | 'chat_access' | 'agent_profile' | 'workflows' | 'safety' | 'reports' | 
    'system_instructions' | 'knowledge_base' | 'greeting_msg' | 'away_msg'
  >('main')
  
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tempVal, setTempVal] = useState<any>("")
  const [selectedPresetId, setSelectedPresetTab] = useState<string>('ravage')

  const [config, setConfig] = useState({
    auto_reply_filter: "everyone", 
    ai_autoreply_enabled: true,
    use_case: "personal", 
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
    daily_digest_hour: 9
  })

  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

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

  const applyPreset = () => {
    let updates = {};
    if (selectedPresetId === 'max') {
        updates = { ai_autoreply_enabled: false, greeting_enabled: true, away_enabled: true, read_enabled: true, humanize_enabled: false, spam_filter_enabled: false, followup_enabled: false, daily_digest: false, urgency_notify: false, use_case: 'personal', tone: 'casual' };
    } else if (selectedPresetId === 'ravage') {
        updates = { ai_autoreply_enabled: true, greeting_enabled: true, away_enabled: false, read_enabled: true, humanize_enabled: true, humanize_speed: 'normal', spam_filter_enabled: true, spam_sensitivity: 'medium', followup_enabled: false, daily_digest: false, urgency_notify: true, use_case: 'personal', tone: 'adaptive' };
    } else if (selectedPresetId === 'blaze') {
        updates = { ai_autoreply_enabled: true, greeting_enabled: true, away_enabled: true, read_enabled: true, humanize_enabled: true, spam_filter_enabled: true, spam_sensitivity: 'high', followup_enabled: true, followup_delay_h: 24, followup_max: 2, daily_digest: true, daily_digest_hour: 9, urgency_notify: true, use_case: 'sales', tone: 'formal' };
    } else if (selectedPresetId === 'beast') {
        updates = { ai_autoreply_enabled: true, greeting_enabled: true, away_enabled: true, read_enabled: true, humanize_enabled: true, humanize_speed: 'slow', spam_filter_enabled: true, spam_sensitivity: 'high', followup_enabled: true, followup_delay_h: 12, followup_max: 3, daily_digest: true, daily_digest_hour: 8, urgency_notify: true, auto_reply_filter: 'blacklist_exclude', use_case: 'assistant', tone: 'adaptive' };
    }
    
    setConfig(prev => {
        const next = { ...prev, ...updates };
        saveConfigToServer(next);
        return next;
    });
    
    const tg = getTg()
    tg?.HapticFeedback?.notificationOccurred('success')
  }

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
      } else {
        setActivePage('main')
      }
    }

    tg.BackButton.onClick(handleBackAction)
    return () => {
      tg.BackButton.offClick(handleBackAction)
    }
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
        <Loader2 className="w-7 h-7 text-[#3b82f6] animate-spin" />
      </div>
    )
  }

  const currentTheme = PRESETS_DATA.find(p => p.id === selectedPresetId)?.theme || "#3b82f6";
  const currentPresetName = PRESETS_DATA.find(p => p.id === selectedPresetId)?.name || "Preset";

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-200">
      
      {/* Ocultamos el scrollbar nativo mediante una etiqueta style global para este componente */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 w-full px-4">
        
        {/* ── MAIN MENU ── */}
        {activePage === 'main' && (
          <div className="animate-in fade-in duration-200 w-full px-1">
            <SubHeader title="Chat Automation" />
            <div className="flex flex-col items-center text-center pt-8 mb-9">
              <img 
                src={agentGifUrl} 
                alt="Agent" 
                className="w-[140px] h-[140px] object-contain mb-7 pointer-events-none select-none" 
              />
              <p style={{ fontSize: "16px", color: "#8e8e93", fontFamily: SF, maxWidth: "320px", lineHeight: "1.4" }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            <Section>
              <Row 
                icon={<Zap className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#ff9f0a]"
                label="Agent Presets" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('presets')}
              />
              <Row 
                icon={<MessageSquare className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                label="Chat Access Scope" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('chat_access')}
              />
              <Row 
                icon={<Bot className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#bf5af2]"
                label="Agent Profile" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('agent_profile')}
              />
              <Row 
                icon={<Workflow className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#34c759]"
                label="Messages & Workflows" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('workflows')}
              />
              <Row 
                icon={<Shield className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#ff453a]"
                label="Safety & Guardrails" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('safety')}
                last
              />
            </Section>

            <Section header="ANALYTICS & LOGS">
              <Row 
                icon={<BarChart3 className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#32ade6]"
                label="Performance Diagnostics" 
                right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />} 
                onClick={() => setActivePage('reports')}
                last
              />
            </Section>
          </div>
        )}

        {/* ── AGENT PRESETS ── */}
        {activePage === 'presets' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Agent Presets" />
            <p className="px-5 mt-4 mb-6 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Quickly apply predefined behaviors. You can customize details later.
            </p>

            {/* Scroll Horizontal de 4 contenedores */}
            <div className="flex overflow-x-auto gap-3 mb-6 pb-2 snap-x hide-scrollbar">
              {PRESETS_DATA.map(p => (
                 <button 
                    key={p.id}
                    onClick={() => setSelectedPresetTab(p.id)} 
                    className="flex flex-col items-center justify-center p-4 rounded-3xl border transition-all min-w-[110px] shrink-0 snap-center"
                    style={{
                      borderColor: selectedPresetId === p.id ? p.theme : '#1c1c1e',
                      backgroundColor: selectedPresetId === p.id ? `${p.theme}15` : '#121214'
                    }}
                 >
                    <div className="text-3xl mb-2">{p.emoji}</div>
                    <div className="text-white font-semibold tracking-tight" style={{ fontFamily: SF, fontSize: "16px" }}>{p.name}</div>
                 </button>
              ))}
            </div>

            <div className="w-full flex flex-col items-center mb-8 px-2 text-center animate-in fade-in duration-300" key={selectedPresetId}>
               <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: SFD }}>
                 {PRESETS_DATA.find(p => p.id === selectedPresetId)?.tagline}
               </h3>
               <p className="text-[#8e8e93]" style={{ fontSize: "14px", fontFamily: SF, lineHeight: "1.4" }}>
                 {PRESETS_DATA.find(p => p.id === selectedPresetId)?.desc}
               </p>
               
               <div className="mt-6">
                 <ShinyActionButton 
                   label={`Apply ${currentPresetName} Preset`} 
                   onClick={applyPreset} 
                   themeColor={currentTheme}
                 />
               </div>
            </div>

            {/* Tabla de configuraciones con colores de acuerdo al Preset seleccionado */}
            <Section header={`${currentPresetName.toUpperCase()} CONFIGURATION`} footer="Changes here override the preset automatically. Detailed settings are in the main menu.">
              <Row 
                icon={<Sparkles className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                label="AI Auto-Reply"
                right={<TelegramToggle on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} activeColor={currentTheme} />}
              />
              <Row 
                icon={<Shield className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#ff453a]"
                label="Spam Filtering"
                right={<TelegramToggle on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} activeColor={currentTheme} />}
              />
              <Row 
                icon={<MessageSquare className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#bf5af2]"
                label="Simulate Typing"
                right={<TelegramToggle on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} activeColor={currentTheme} />}
              />
              <Row 
                icon={<Workflow className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#34c759]"
                label="Smart Follow-ups"
                right={<TelegramToggle on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} activeColor={currentTheme} />}
                last
              />
            </Section>
          </div>
        )}

        {/* ── AGENT PROFILE ── */}
        {activePage === 'agent_profile' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Agent Profile" />
            <p className="px-5 mt-4 mb-10 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Configure your agent's identity, behavior rules, and reference knowledge.
            </p>
            
            <Section>
              <Row 
                icon={<Sparkles className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                label="AI Auto-Reply"
                sublabel="Let the AI handle standard inbound messages."
                right={<TelegramToggle on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} />}
                last
              />
            </Section>

            {config.ai_autoreply_enabled && (
              <div className="animate-in fade-in duration-300 w-full">
                <Section header="AGENT IDENTITY">
                  <Row 
                    icon={<User className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                    label="Account Role"
                    sublabel="Define the primary function of your assistant."
                    right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />}
                    onClick={() => { setTempVal(config.use_case); setActiveModal('role'); }}
                    last
                  />
                </Section>
                
                <Section header="TONE & STYLE">
                  <Row 
                    icon={<MessageSquare className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#bf5af2]"
                    label="Tone Register"
                    sublabel="Set the default communication tone."
                    right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />}
                    onClick={() => { setTempVal(config.tone); setActiveModal('tone'); }}
                    last
                  />
                </Section>

                <Section header="SYSTEM INSTRUCTIONS">
                  <TextPreviewBubble 
                    title="System Instructions"
                    icon={<FileText className="w-[18px] h-[18px] text-white" fill="currentColor" />}
                    iconBg="bg-[#0a84ff]"
                    placeholder="Click to set core behavior and guardrails. E.g., You are a helpful support agent..."
                    value={config.ai_persona_hint}
                    onClick={() => setActivePage('system_instructions')}
                  />
                </Section>

                <Section header="KNOWLEDGE BASE">
                  <TextPreviewBubble 
                    title="Knowledge Base"
                    icon={<Book className="w-[18px] h-[18px] text-white" fill="currentColor" />}
                    iconBg="bg-[#34c759]"
                    placeholder="Click to add custom context, FAQs, or pricing details."
                    value={config.kb_text}
                    onClick={() => setActivePage('knowledge_base')}
                  />
                </Section>
              </div>
            )}
          </div>
        )}

        {/* ── TEXT EDITOR VIEWS ── */}
        {activePage === 'system_instructions' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-1">
            <SubHeader title="System Instructions" />
            <p className="px-4 mb-6 mt-2 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
              Detailed instructions guiding the model's responses and constraints.
            </p>
            <AutoResizeTextarea
              defaultValue={config.ai_persona_hint}
              onBlurSave={(v) => setAndSave('ai_persona_hint', v)}
              placeholder="E.g., You are a strictly concise technical support assistant..."
            />
          </div>
        )}

        {activePage === 'knowledge_base' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-1">
            <SubHeader title="Knowledge Base" />
            <p className="px-4 mb-6 mt-2 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
              Provide specific business data, product specs, or FAQs to ground responses.
            </p>
            <AutoResizeTextarea
              defaultValue={config.kb_text}
              onBlurSave={(v) => setAndSave('kb_text', v)}
              placeholder="Store your business context data here..."
            />
          </div>
        )}

        {activePage === 'greeting_msg' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-1">
            <SubHeader title="Welcome Message" />
            <p className="px-4 mb-6 mt-2 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
              This message is sent automatically to users contacting you for the first time.
            </p>
            <AutoResizeTextarea
              defaultValue={config.greeting_text}
              onBlurSave={(v) => setAndSave('greeting_text', v)}
              placeholder="E.g., Hi there! How can I help you today?"
            />
          </div>
        )}

        {activePage === 'away_msg' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-1">
            <SubHeader title="Away Message" />
            <p className="px-4 mb-6 mt-2 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF }}>
              Sent automatically when you are scheduled as away or out of office.
            </p>
            <AutoResizeTextarea
              defaultValue={config.away_text}
              onBlurSave={(v) => setAndSave('away_text', v)}
              placeholder="E.g., I'm currently away but will reply as soon as possible."
            />
          </div>
        )}

        {/* ── CHAT ACCESS SCOPE ── */}
        {activePage === 'chat_access' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Chat Access Scope" />
            <div className="pt-8">
              <Section header="ALLOWED CONVERSATIONS" footer="Configure exclusions in the main bot interface.">
                <Row 
                  label="All private chats except..."
                  onClick={() => setAndSave('auto_reply_filter', 'everyone')}
                  right={config.auto_reply_filter === 'everyone' ? <Check className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} /> : null}
                />
                <Row 
                  label="Only selected chats"
                  onClick={() => setAndSave('auto_reply_filter', 'whitelist')}
                  right={config.auto_reply_filter === 'whitelist' ? <Check className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} /> : null}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── MESSAGES & WORKFLOWS ── */}
        {activePage === 'workflows' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Messages & Workflows" />
            <div className="pt-8">

              <Section header="BASIC BEHAVIORS">
                <Row 
                  icon={<Eye className="w-[18px] h-[18px] text-white" />} iconBg="bg-[#32ade6]"
                  label="Mark messages as read"
                  sublabel="Automatically mark inbound messages as read."
                  right={<TelegramToggle on={config.read_enabled} onToggle={() => setAndSave('read_enabled', !config.read_enabled)} />}
                  last
                />
              </Section>

              <Section header="AUTO-REPLIES">
                <Row 
                  icon={<MessageSquarePlus className="w-[18px] h-[18px] text-white" />} iconBg="bg-[#34c759]"
                  label="Welcome Message"
                  sublabel="Greet first-time contacts automatically."
                  right={<TelegramToggle on={config.greeting_enabled} onToggle={() => setAndSave('greeting_enabled', !config.greeting_enabled)} />}
                  last={!config.greeting_enabled}
                />
                {config.greeting_enabled && (
                  <TextPreviewBubble 
                    title="Edit Welcome Message"
                    icon={<FileText className="w-[18px] h-[18px] text-white" fill="currentColor" />}
                    iconBg="bg-[#34c759]"
                    placeholder="Click to write your greeting message..."
                    value={config.greeting_text}
                    onClick={() => setActivePage('greeting_msg')}
                  />
                )}

                <div className="h-[1px] w-full bg-[#1c1c1e] my-1" />

                <Row 
                  icon={<Clock className="w-[18px] h-[18px] text-white" />} iconBg="bg-[#ff9f0a]"
                  label="Away Message"
                  sublabel="Reply when you are out of office."
                  right={<TelegramToggle on={config.away_enabled} onToggle={() => setAndSave('away_enabled', !config.away_enabled)} />}
                  last={!config.away_enabled}
                />
                {config.away_enabled && (
                  <TextPreviewBubble 
                    title="Edit Away Message"
                    icon={<FileText className="w-[18px] h-[18px] text-white" fill="currentColor" />}
                    iconBg="bg-[#ff9f0a]"
                    placeholder="Click to write your away message..."
                    value={config.away_text}
                    onClick={() => setActivePage('away_msg')}
                  />
                )}
              </Section>

              <Section header="ENGAGEMENT LOOPS">
                <Row 
                  icon={<Workflow className="w-[18px] h-[18px] text-white" />} iconBg="bg-[#0a84ff]"
                  label="Smart Follow-ups"
                  sublabel="Trigger automated follow-ups if user drops engagement."
                  right={<TelegramToggle on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} />}
                  last={!config.followup_enabled}
                />
                {config.followup_enabled && (
                  <div className="px-5 py-3.5 flex gap-5 w-full border-t border-[#1c1c1e]">
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Delay (Hours)</p>
                      <input 
                        type="number" defaultValue={config.followup_delay_h} onBlur={(e) => setAndSave('followup_delay_h', parseInt(e.target.value) || 0)} 
                        className="w-full bg-transparent text-white outline-none" style={{ fontSize: "16px", fontFamily: SF }} 
                      />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Max Retries</p>
                      <input 
                        type="number" defaultValue={config.followup_max} onBlur={(e) => setAndSave('followup_max', parseInt(e.target.value) || 1)} 
                        className="w-full bg-transparent text-white outline-none" style={{ fontSize: "16px", fontFamily: SF }} 
                      />
                    </div>
                  </div>
                )}
              </Section>

              <Section header="INLINE AGENT">
                <Row 
                  label="Passive Mentions"
                  sublabel="Replies when its name is mentioned in groups."
                  right={<TelegramToggle on={config.invocation_enabled} onToggle={() => setAndSave('invocation_enabled', !config.invocation_enabled)} />}
                  last={!config.invocation_enabled}
                />
                {config.invocation_enabled && (
                  <div className="w-full px-5 py-[16px] border-t border-[#1c1c1e]">
                    <input 
                      type="text" defaultValue={config.bot_names} onBlur={(e) => setAndSave('bot_names', e.target.value)}
                      placeholder="Trigger keywords (e.g., agent, bot)"
                      className="w-full bg-transparent text-white outline-none placeholder:text-[#636366]"
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
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Safety & Guardrails" />
            <div className="pt-8">
              <Section header="SPAM FILTERING">
                <Row 
                  label="Active Anti-Spam S2S"
                  sublabel="Identify and delete malicious links and ads."
                  right={<TelegramToggle on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} />}
                  last={!config.spam_filter_enabled}
                />
                {config.spam_filter_enabled && (
                  <Row 
                    label="Sensitivity"
                    sublabel={config.spam_sensitivity.charAt(0).toUpperCase() + config.spam_sensitivity.slice(1)}
                    right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />}
                    onClick={() => { setTempVal(config.spam_sensitivity); setActiveModal('spam_sens'); }}
                    last
                  />
                )}
              </Section>

              <Section header="EMULATION & ALERTS">
                <Row 
                  label="Simulate Typing"
                  sublabel="Inject artificial typing delays for organic rhythm."
                  right={<TelegramToggle on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} />}
                />
                <Row 
                  label="Emergency Alerts"
                  sublabel="Receive DM logs on structural anomalies."
                  right={<TelegramToggle on={config.urgency_notify} onToggle={() => setAndSave('urgency_notify', !config.urgency_notify)} />}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activePage === 'reports' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-1">
            <SubHeader title="Analytics & Logs" />
            <div className="pt-8">
              <Section header="DIAGNOSTICS">
                <Row 
                  label="24-Hour Metrics Digest"
                  sublabel="Receive daily performance reports directly."
                  right={<TelegramToggle on={config.daily_digest} onToggle={() => setAndSave('daily_digest', !config.daily_digest)} />}
                  last={!config.daily_digest}
                />
                {config.daily_digest && (
                  <Row 
                    label="Dispatch Window"
                    sublabel={`${config.daily_digest_hour.toString().padStart(2, '0')}:00 UTC`}
                    right={<ChevronRight className="w-5 h-5 text-[#3a3a3c]" />}
                    onClick={() => { setTempVal(config.daily_digest_hour); setActiveModal('digest_hour'); }}
                    last
                  />
                )}
              </Section>
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM SHEETS ── */}
      <BottomSheet
        isOpen={activeModal === 'role'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('use_case', tempVal); setActiveModal(null); }}
        title="Account Role"
        description="Select the primary persona role for your assistant."
      >
        <div className="bg-[#121214] rounded-3xl overflow-hidden">
          {['personal', 'sales', 'support', 'community'].map((opt, i, arr) => (
            <RadioRow
              key={opt}
              label={opt.charAt(0).toUpperCase() + opt.slice(1)}
              selected={tempVal === opt}
              onClick={() => setTempVal(opt)}
              last={i === arr.length - 1}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'tone'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('tone', tempVal); setActiveModal(null); }}
        title="Tone Register"
      >
        <div className="bg-[#121214] rounded-3xl overflow-hidden">
          {['adaptive', 'casual', 'formal', 'empathetic'].map((opt, i, arr) => (
            <RadioRow
              key={opt}
              label={opt.charAt(0).toUpperCase() + opt.slice(1)}
              selected={tempVal === opt}
              onClick={() => setTempVal(opt)}
              last={i === arr.length - 1}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'spam_sens'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('spam_sensitivity', tempVal); setActiveModal(null); }}
        title="Aggressiveness Threshold"
      >
        <div className="bg-[#121214] rounded-3xl overflow-hidden">
          {['low', 'medium', 'high'].map((opt, i, arr) => (
            <RadioRow
              key={opt}
              label={opt.charAt(0).toUpperCase() + opt.slice(1)}
              selected={tempVal === opt}
              onClick={() => setTempVal(opt)}
              last={i === arr.length - 1}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'digest_hour'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('daily_digest_hour', tempVal); setActiveModal(null); }}
        title="Dispatch Window"
      >
        <div className="bg-[#121214] rounded-3xl overflow-hidden">
          {Array.from({ length: 24 }).map((_, h) => (
            <RadioRow
              key={h}
              label={`${h.toString().padStart(2, '0')}:00 UTC`}
              selected={tempVal === h}
              onClick={() => setTempVal(h)}
              last={h === 23}
            />
          ))}
        </div>
      </BottomSheet>

    </div>
  )
}
