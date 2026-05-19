"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { 
  Loader2, Sparkles, Shield, Workflow, 
  ChevronRight, BarChart3, Check, MessageSquare, Bot, User, FileText, Book
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

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
        className="w-full p-4 rounded-[10px] text-white placeholder:text-[#636366] focus:outline-none resize-none transition-colors"
        style={{ 
          background: "#1c1c1e", 
          fontFamily: SF, 
          fontSize: "16px", 
          minHeight: "200px",
          paddingBottom: showCounter ? "32px" : "16px",
          boxSizing: "border-box"
        }}
      />
      {showCounter && (
        <div 
          className="absolute bottom-3 right-4 font-medium" 
          style={{ fontSize: "12px", color: counterColor, fontFamily: SF }}
        >
          {charsLeft} restantes
        </div>
      )}
    </div>
  )
}

// ── COMPONENTES REUTILIZABLES (ESTILO TELEGRAM iOS NATIVO) ──

const SubHeader = ({ title }: { title: string }) => (
  <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3 pt-4" style={{ background: "#000000" }}>
    <h2 className="font-semibold text-white tracking-tight" style={{ fontSize: "17px", fontFamily: SF }}>
      {title}
    </h2>
  </div>
)

const Section = ({ header, footer, children }: { header?: string, footer?: string, children: React.ReactNode }) => (
  <div className="mb-6 w-full">
    {header && <p className="px-4 mb-1.5 text-[#636366] uppercase font-medium" style={{ fontSize: "13px", fontFamily: SF, letterSpacing: "0.03em" }}>{header}</p>}
    <div className="rounded-[10px] overflow-hidden" style={{ background: "#1c1c1e" }}>
      {children}
    </div>
    {footer && <p className="px-4 mt-2 text-[#636366]" style={{ fontSize: "13px", fontFamily: SF }}>{footer}</p>}
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
      className={`w-full flex items-center gap-[14px] px-4 py-[10px] transition-colors ${onClick ? 'active:bg-white/5 cursor-pointer' : ''}`}
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
    {!last && <div style={{ height: "1px", background: "#2c2c2e", marginLeft: icon ? "60px" : "16px" }} />}
  </>
)

const TelegramToggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className="relative rounded-full transition-colors duration-300 shrink-0"
    style={{ width: "51px", height: "31px", background: on ? "#3b82f6" : "#39393d" }}
  >
    <span
      className="absolute rounded-full shadow-sm transition-all duration-300 bg-white"
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
    <div onClick={onClick} className="flex items-center justify-between px-4 py-[14px] active:bg-white/5 transition-colors cursor-pointer">
      <span className="text-white tracking-tight" style={{ fontSize: "16px", fontFamily: SF }}>{label}</span>
      <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors ${selected ? 'border-[#3b82f6]' : 'border-[#48484a]'}`}>
        {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#3b82f6]" />}
      </div>
    </div>
    {!last && <div style={{ height: "1px", background: "#2c2c2e", marginLeft: "16px" }} />}
  </>
)

const BottomSheet = ({ isOpen, onClose, onSave, title, description, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative border-t border-[#2c2c2e] rounded-t-[20px] w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300" style={{ background: "#000000" }}>
        {/* Header (Cancel / Title / Save) */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} className="text-[#3b82f6] font-normal tracking-tight" style={{ fontSize: "17px", fontFamily: SF }}>Cancel</button>
          <h3 className="text-white font-semibold tracking-tight" style={{ fontSize: "17px", fontFamily: SF }}>{title}</h3>
          <button onClick={onSave} className="text-[#3b82f6] font-semibold tracking-tight" style={{ fontSize: "17px", fontFamily: SF }}>Save</button>
        </div>
        <div className="p-4 overflow-y-auto pb-8">
          {description && <p className="text-[#8e8e93] text-center mb-6 leading-snug" style={{ fontSize: "14px", fontFamily: SF }}>{description}</p>}
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
  const [activePage, setActivePage] = useState<'main' | 'chat_access' | 'persona' | 'workflows' | 'safety' | 'reports' | 'persona_prompt' | 'persona_kb'>('main')
  
  // Estados para Modales
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tempVal, setTempVal] = useState<any>("")

  const [config, setConfig] = useState({
    auto_reply_filter: "everyone", 
    ai_autoreply_enabled: true,
    use_case: "personal", 
    tone: "adaptive", 
    ai_persona_hint: "",
    kb_text: "",
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

  // ── CICLO DE VIDA ──
  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    tg.BackButton.show()
    const handleBackAction = () => {
      if (activePage === 'main') {
        onClose()
      } else if (activePage === 'persona_prompt' || activePage === 'persona_kb') {
        setActivePage('persona')
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

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-200">
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 w-full">
        
        {/* ── MENÚ PRINCIPAL ── */}
        {activePage === 'main' && (
          <div className="animate-in fade-in duration-200 w-full px-4">
            <SubHeader title="Chat Automation" />
            <div className="flex flex-col items-center text-center pt-8 mb-8">
              <img 
                src={agentGifUrl} 
                alt="Agent" 
                className="w-[140px] h-[140px] object-contain mb-6 pointer-events-none select-none" 
              />
              <p style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, maxWidth: "320px", lineHeight: "1.4" }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            <Section>
              <Row 
                icon={<MessageSquare className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                label="Chat Access Scope" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActivePage('chat_access')}
              />
              <Row 
                icon={<Bot className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#bf5af2]"
                label="AI Persona & Knowledge" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActivePage('persona')}
              />
              <Row 
                icon={<Workflow className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#ff9f0a]"
                label="Automated Workflows" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActivePage('workflows')}
              />
              <Row 
                icon={<Shield className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#ff453a]"
                label="Safety & Protection" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActivePage('safety')}
                last
              />
            </Section>

            <Section header="ANALYTICS">
              <Row 
                icon={<BarChart3 className="w-5 h-5 text-white" fill="currentColor" />} iconBg="bg-[#32ade6]"
                label="Performance Diagnostics" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActivePage('reports')}
                last
              />
            </Section>
          </div>
        )}

        {/* ── AI PERSONA & KNOWLEDGE ── */}
        {activePage === 'persona' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-4">
            <SubHeader title="Persona" />
            <p className="px-4 mt-2 mb-8 text-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, lineHeight: "1.4" }}>
              Define how your AI assistant represents your brand and communicates with your audience.
            </p>
            
            <Section>
              <Row 
                icon={<Sparkles className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                label="AI Auto-Reply Processing"
                sublabel="Process inbound messages using Grok 4.1."
                right={<TelegramToggle on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} />}
                last
              />
            </Section>

            {config.ai_autoreply_enabled && (
              <div className="animate-in fade-in duration-300 w-full">
                <Section header="IDENTITY">
                  <Row 
                    icon={<User className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                    label="Account Role"
                    sublabel="Define the main role your assistant plays."
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => { setTempVal(config.use_case); setActiveModal('role'); }}
                    last
                  />
                </Section>
                
                <Section header="TONE">
                  <Row 
                    icon={<MessageSquare className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#bf5af2]"
                    label="Tone Register"
                    sublabel="Set the default tone of your responses."
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => { setTempVal(config.tone); setActiveModal('tone'); }}
                    last
                  />
                </Section>

                <Section header="COMMUNICATION GUIDE">
                  <Row 
                    icon={<FileText className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#0a84ff]"
                    label="System Prompt"
                    sublabel="Guide how the AI should behave and respond."
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => setActivePage('persona_prompt')}
                    last
                  />
                </Section>

                <Section header="KNOWLEDGE BASE">
                  <Row 
                    icon={<Book className="w-[18px] h-[18px] text-white" fill="currentColor" />} iconBg="bg-[#34c759]"
                    label="Knowledge Base Context"
                    sublabel="Add the information your assistant should use."
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => setActivePage('persona_kb')}
                    last
                  />
                </Section>
              </div>
            )}
          </div>
        )}

        {/* ── TEXT EDITOR VIEWS (Prompt & KB) ── */}
        {activePage === 'persona_prompt' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-4">
            <SubHeader title="System Prompt" />
            <p className="px-2 mb-4 text-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
              Detailed instructions for behavior and character.
            </p>
            <AutoResizeTextarea
              defaultValue={config.ai_persona_hint}
              onBlurSave={(v) => setAndSave('ai_persona_hint', v)}
              placeholder="E.g., Act as concise tech support..."
            />
          </div>
        )}

        {activePage === 'persona_kb' && (
          <div className="animate-in slide-in-from-right duration-200 w-full h-[80vh] flex flex-col px-4">
            <SubHeader title="Knowledge Base Context" />
            <p className="px-2 mb-4 text-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
              Specific data, FAQs, URLs, and pricing info.
            </p>
            <AutoResizeTextarea
              defaultValue={config.kb_text}
              onBlurSave={(v) => setAndSave('kb_text', v)}
              placeholder="Store your business data here..."
            />
          </div>
        )}

        {/* ── OTRAS VISTAS (Convertidas a la nueva estética) ── */}
        {activePage === 'chat_access' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-4">
            <SubHeader title="Chat Access Scope" />
            <div className="pt-6">
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

        {activePage === 'workflows' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-4">
            <SubHeader title="Workflows" />
            <div className="pt-6">
              <Section header="ENGAGEMENT LOOPS">
                <Row 
                  label="Smart Follow-up Matrix"
                  sublabel="Trigger automated follow-ups if user drops engagement."
                  right={<TelegramToggle on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} />}
                  last={!config.followup_enabled}
                />
                {config.followup_enabled && (
                  <div className="px-4 py-3 flex gap-4 w-full border-t border-[#2c2c2e]">
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
                  <div className="w-full px-4 py-[14px] border-t border-[#2c2c2e]">
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

        {activePage === 'safety' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-4">
            <SubHeader title="Safety" />
            <div className="pt-6">
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
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => { setTempVal(config.spam_sensitivity); setActiveModal('spam_sens'); }}
                    last
                  />
                )}
              </Section>

              <Section header="EMULATION & ALERTS">
                <Row 
                  label="Humanized Typing"
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

        {activePage === 'reports' && (
          <div className="animate-in slide-in-from-right duration-200 w-full px-4">
            <SubHeader title="Analytics" />
            <div className="pt-6">
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
                    right={<ChevronRight className="w-5 h-5 text-[#48484a]" />}
                    onClick={() => { setTempVal(config.daily_digest_hour); setActiveModal('digest_hour'); }}
                    last
                  />
                )}
              </Section>
            </div>
          </div>
        )}

      </div>

      {/* ── MODALES INFERIORES (BOTTOM SHEETS) ── */}
      <BottomSheet
        isOpen={activeModal === 'role'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('use_case', tempVal); setActiveModal(null); }}
        title="Account Role"
        description="Choose which chats the bot can access and manage."
      >
        <p className="px-4 mb-2 text-[#3b82f6] uppercase font-medium" style={{ fontSize: "13px", fontFamily: SF, letterSpacing: "0.03em" }}>Chats the bot can access</p>
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
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
        <p className="px-4 mt-2 text-[#636366]" style={{ fontSize: "13px", fontFamily: SF }}>Select the primary persona role for your assistant.</p>
      </BottomSheet>

      <BottomSheet
        isOpen={activeModal === 'tone'}
        onClose={() => setActiveModal(null)}
        onSave={() => { setAndSave('tone', tempVal); setActiveModal(null); }}
        title="Tone Register"
      >
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
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
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
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
        <div className="bg-[#1c1c1e] rounded-[10px] overflow-hidden">
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
