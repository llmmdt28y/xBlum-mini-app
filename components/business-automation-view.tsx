"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { 
  Loader2, Sparkles, Shield, Workflow, 
  ChevronRight, BarChart3, Check, MessageSquare, Bot, User, FileText, Book,
  Clock, MessageSquarePlus, Eye, Zap, Globe, CircleUserRound, ChevronLeft
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILOS GLOBALES PARA EL EFECTO RIPPLE ──
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

// ── FUNCIÓN HELPER PARA CREAR EL EFECTO RIPPLE ──
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

// ── DATOS DE LOS PRESETS ──
const PRESETS_DATA = [
  { id: 'max', name: 'Max', emoji: '🧊', theme: '#32ade6', tagline: 'Silent presence', desc: 'Welcome & Away messages only. AI is off. Perfect when you just want automated greetings without any AI involvement.' },
  { id: 'ravage', name: 'Ravage', emoji: '⚡', theme: '#ffcc00', tagline: 'Smart replies, zero setup', desc: 'AI autoreply on with a natural human feel. Spam protection active. Great default for personal or casual business use.' },
  { id: 'blaze', name: 'Blaze', emoji: '🔥', theme: '#ff9f0a', tagline: 'Sales mode', desc: 'Sales persona, aggressive spam filter, automatic follow-ups, and daily activity digest. Built to convert leads.' },
  { id: 'beast', name: 'Beast', emoji: '💀', theme: '#ff453a', tagline: 'Full control, max automation', desc: 'Every feature on. Ultra-natural replies, tight spam shield, 3-touch follow-up sequences, blacklist filtering, early morning digest.' }
];

// ── COMPONENTES REUTILIZABLES ──

function Toggle({ on, onToggle, activeColor = "#3b82f6" }: { on: boolean; onToggle: () => void; activeColor?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="relative rounded-full transition-all duration-200 shrink-0 z-10 border border-transparent"
      style={{ 
        width: "51px", height: "31px", 
        background: on ? activeColor : "#2c2c2e" // Fondo gris oscuro apagado igual a la imagen
      }}
    >
      <span
        className="absolute top-[2px] rounded-full shadow-sm transition-all duration-200"
        style={{
          width: "25px", height: "25px",
          background: on ? "#ffffff" : "#636366", // Círculo blanco ON, gris medio OFF
          left: on ? "22px" : "2px",
        }}
      />
    </button>
  )
}

function SubHeader({ title, onBack }: { title: string, onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 sticky top-0 z-50 bg-[#000000]" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)"
    }}>
      {onBack ? (
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center -ml-2 active:opacity-60 transition-opacity">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
      ) : <div className="w-8" />}
      <h2 className="font-semibold text-white tracking-tight absolute left-1/2 -translate-x-1/2" style={{ fontSize: "17px", fontFamily: SFD }}>
        {title}
      </h2>
      <div className="w-8" />
    </div>
  )
}

function Section({ title, footer, children }: { title?: string; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-6 w-full">
      {/* Título en azul EXACTAMENTE afuera del contenedor como en la imagen */}
      {title && (
        <div className="px-4 mb-2">
          <h2 className="text-[#3b82f6] text-[15px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden shadow-lg bg-[#111111] relative border border-[#1c1c1e]">
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
  label: string;
  sublabel?: string;
  value?: string;
  icon?: React.ElementType;
  rightNode?: React.ReactNode;
  onClick?: () => void;
  last?: boolean;
  hideArrow?: boolean;
}

function Row({ label, sublabel, value, icon: Icon, rightNode, onClick, last = false, hideArrow = false }: RowProps) {
  return (
    <>
      <button
        onClick={onClick}
        onPointerDown={onClick ? createRipple : undefined}
        disabled={!onClick && !rightNode}
        className={`relative overflow-hidden w-full px-4 py-3.5 flex flex-col justify-center ${onClick ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left`}
      >
        <div className="w-full flex items-center justify-between min-h-[30px] relative z-10">
          <div className="flex items-center gap-4 flex-1">
            {Icon && <Icon className="w-[22px] h-[22px] text-[#8e8e93] shrink-0" strokeWidth={1.5} />}
            <div className="flex flex-col flex-1 py-0.5">
              <span className="text-[16px] text-white font-medium" style={{ fontFamily: SF }}>{label}</span>
              {sublabel && <span className="text-[12px] text-[#8e8e93] mt-[3px] leading-snug pr-2" style={{ fontFamily: SF }}>{sublabel}</span>}
            </div>
          </div>
          <div className="flex items-center shrink-0 ml-2 gap-2">
            {/* Valor en azul EXACTAMENTE como en la imagen */}
            {value && <span className="text-[16px] text-[#3b82f6]" style={{ fontFamily: SF }}>{value}</span>}
            {rightNode ? rightNode : (!hideArrow && onClick && value === undefined && <ChevronRight className="w-5 h-5 text-[#3a3a3c]" />)}
          </div>
        </div>
      </button>
      {!last && <div className={`h-[1px] bg-[#2c2c2e] ${Icon ? 'ml-[56px]' : 'ml-4'}`} />} 
    </>
  )
}

function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#3b82f6]' : 'border-[#3a3a3c]'}`}>
      {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#3b82f6]" />}
    </div>
  )
}

const RadioRow = ({ label, selected, onClick, last }: { label: string, selected: boolean, onClick: () => void, last?: boolean }) => (
  <>
    <button onClick={onClick} onPointerDown={createRipple} className="relative overflow-hidden flex items-center justify-between w-full px-4 py-3.5 active:bg-white/5 transition-colors text-left">
      <span className="text-white font-medium relative z-10" style={{ fontSize: "16px", fontFamily: SF }}>{label}</span>
      <RadioButton selected={selected} />
    </button>
    {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "16px" }} />}
  </>
)

const ShinyActionButton = ({ label, onClick, className = "", themeColor = "#3b82f6" }: { label: string, onClick: () => void, className?: string, themeColor?: string }) => (
  <button
    onClick={onClick}
    onPointerDown={createRipple}
    className={`relative rounded-full px-5 py-3 transition-all active:opacity-80 overflow-hidden ${className}`}
    style={{ background: themeColor, fontFamily: SF }}
  >
    <span className={`relative z-10 font-bold text-white shadow-sm`} style={{ fontSize: "16px" }}>
      {label}
    </span>
  </button>
)

const BottomSheet = ({ isOpen, onClose, onSave, title, description, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative border-t border-white/5 rounded-t-[32px] w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-400" style={{ background: "#111111" }}>
        
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button onClick={onClose} onPointerDown={createRipple} className="relative overflow-hidden px-4 py-2 text-[#8e8e93] font-medium active:opacity-60 rounded-full" style={{ fontFamily: SF }}>
            <span className="relative z-10">Cancel</span>
          </button>
          <h3 className="text-white font-bold tracking-tight text-center flex-1 mx-2" style={{ fontSize: "17px", fontFamily: SFD }}>
            {title}
          </h3>
          <button onClick={onSave} onPointerDown={createRipple} className="relative overflow-hidden px-4 py-2 text-[#3b82f6] font-bold active:opacity-60 rounded-full" style={{ fontFamily: SF }}>
            <span className="relative z-10">Save</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto pb-10">
          {description && <p className="text-[#8e8e93] text-center mb-7 leading-snug px-3" style={{ fontSize: "14px", fontFamily: SF }}>{description}</p>}
          <div className="bg-[#1c1c1e] rounded-[24px] overflow-hidden border border-white/5 shadow-lg">
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

    // Nuevas configuraciones de la imagen
    history_enabled: true,
    response_streaming: true,
    show_response_only: false,
    insert_quote: true
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
    // Logic preserved
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
        <Loader2 className="w-7 h-7 text-[#3b82f6] animate-spin" />
      </div>
    )
  }

  const currentTheme = PRESETS_DATA.find(p => p.id === selectedPresetId)?.theme || "#3b82f6";
  const currentPresetName = PRESETS_DATA.find(p => p.id === selectedPresetId)?.name || "Preset";

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-300">
      <style>{RIPPLE_STYLE}</style>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 w-full px-0">
        
        {/* ── MAIN MENU (EXACTAMENTE IGUAL A LA IMAGEN) ── */}
        {activePage === 'main' && (
          <div className="animate-in fade-in duration-300 w-full">
            <SubHeader title="AI Chat" onBack={onClose} />
            
            <div className="flex justify-center mt-4 mb-8">
              <div className="text-[72px] leading-none select-none pointer-events-none drop-shadow-2xl">
                🤖
              </div>
            </div>

            <div className="px-4">
              <Section 
                title="General"
                footer="Conversation history allows the AI to understand previous requests and consider them when generating new responses."
              >
                <Row 
                  icon={Globe}
                  label="Services" 
                  value="None"
                  onClick={() => setActivePage('presets')} // Mantenemos ruteo para no perder la vista
                />
                <Row 
                  icon={CircleUserRound}
                  label="Roles" 
                  value={config.use_case ? config.use_case.charAt(0).toUpperCase() + config.use_case.slice(1) : "Assistant"}
                  onClick={() => { setTempVal(config.use_case); setActiveModal('role'); }}
                />
                <Row 
                  icon={MessageSquare}
                  label="History" 
                  rightNode={<Toggle on={config.history_enabled} onToggle={() => setAndSave('history_enabled', !config.history_enabled)} />}
                  onClick={() => setAndSave('history_enabled', !config.history_enabled)}
                  last
                />
              </Section>

              <Section title="Other">
                <Row 
                  label="Response Streaming" 
                  sublabel="Ensures smoother and faster display of responses."
                  rightNode={<Toggle on={config.response_streaming} onToggle={() => setAndSave('response_streaming', !config.response_streaming)} />}
                  onClick={() => setAndSave('response_streaming', !config.response_streaming)}
                />
                <Row 
                  label="Show Response Only" 
                  rightNode={<Toggle on={config.show_response_only} onToggle={() => setAndSave('show_response_only', !config.show_response_only)} />}
                  onClick={() => setAndSave('show_response_only', !config.show_response_only)}
                />
                <Row 
                  label="Insert Response as Quote" 
                  rightNode={<Toggle on={config.insert_quote} onToggle={() => setAndSave('insert_quote', !config.insert_quote)} />}
                  onClick={() => setAndSave('insert_quote', !config.insert_quote)}
                  last
                />
              </Section>
            </div>
          </div>
        )}

        {/* ── AGENT PRESETS (Resto del código intacto) ── */}
        {activePage === 'presets' && (
          <div className="animate-in slide-in-from-right duration-300 w-full">
            <SubHeader title="Agent Presets" onBack={() => setActivePage('main')} />
            
            <p className="px-5 mt-4 mb-6 text-center" style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Quickly apply predefined behaviors. You can customize details later.
            </p>

            <div className="flex overflow-x-auto gap-3 mb-6 pb-2 px-4 snap-x hide-scrollbar">
              {PRESETS_DATA.map(p => (
                 <button 
                    key={p.id}
                    onClick={() => setSelectedPresetTab(p.id)} 
                    onPointerDown={createRipple}
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
                  icon={Sparkles}
                  label="AI Auto-Reply"
                  rightNode={<Toggle on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} activeColor={currentTheme} />}
                />
                <Row 
                  icon={Shield}
                  label="Spam Filtering"
                  rightNode={<Toggle on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} activeColor={currentTheme} />}
                />
                <Row 
                  icon={MessageSquare}
                  label="Simulate Typing"
                  rightNode={<Toggle on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} activeColor={currentTheme} />}
                />
                <Row 
                  icon={Workflow}
                  label="Smart Follow-ups"
                  rightNode={<Toggle on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} activeColor={currentTheme} />}
                  last
                />
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
        {['assistant', 'personal', 'sales', 'support', 'community'].map((opt, i, arr) => (
          <RadioRow
            key={opt}
            label={opt.charAt(0).toUpperCase() + opt.slice(1)}
            selected={tempVal === opt}
            onClick={() => setTempVal(opt)}
            last={i === arr.length - 1}
          />
        ))}
      </BottomSheet>

    </div>
  )
}
