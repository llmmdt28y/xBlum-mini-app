"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Workflow, 
  ChevronRight, BarChart3, Check, MessageSquare
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── COMPONENTES REUTILIZABLES (ESTILO SETTINGS-VIEW NATIVO) ──

const Block = ({ title, children, footerHint }: { title?: string, children: React.ReactNode, footerHint?: string }) => (
  <div className="mb-6">
    <div className="rounded-2xl overflow-hidden w-full" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", fontFamily: SF, textTransform: "uppercase" }}>{title}</p>
        </div>
      )}
      {children}
    </div>
    {footerHint && (
      <p className="px-4 mt-2" style={{ fontSize: "13px", color: "#636366", fontFamily: SF }}>{footerHint}</p>
    )}
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
      className={`w-full flex items-center gap-4 px-5 transition-colors ${onClick ? 'active:bg-white/5 cursor-pointer' : ''}`}
      style={{ paddingTop: "14px", paddingBottom: "14px" }}
    >
      {icon && (
        <div className={`shrink-0 flex items-center justify-center w-[28px] h-[28px] rounded-lg text-white ${iconBg}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 text-left min-w-0">
        <p className="text-white truncate" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
          {label}
        </p>
        {sublabel && (
          <div className="mt-0.5 leading-snug" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
            {sublabel}
          </div>
        )}
      </div>
      {right && <div className="shrink-0 ml-2">{right}</div>}
    </div>
    {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: icon ? "56px" : "20px" }} />}
  </>
)

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className="relative rounded-full transition-all duration-200 shrink-0"
    style={{ width: "44px", height: "26px", background: on ? "#34c759" : "#3a3a3c" }}
  >
    <span
      className="absolute top-[2px] rounded-full shadow-sm transition-transform duration-200"
      style={{
        width: "22px", height: "22px",
        background: "#ffffff",
        left: on ? "20px" : "2px",
      }}
    />
  </button>
)

const PillSelector = ({ options, selected, onSelect }: { options: string[], selected: string, onSelect: (v: string) => void }) => (
  <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className="px-3.5 py-1.5 rounded-full capitalize transition-colors shrink-0"
        style={{ 
          fontSize: "14px", 
          fontWeight: 500, 
          fontFamily: SF,
          background: selected === opt ? "#3b82f6" : "#1c1c1e",
          color: selected === opt ? "#fff" : "#8e8e93"
        }}
      >
        {opt}
      </button>
    ))}
  </div>
)

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
  const [activeView, setActiveView] = useState<'main' | 'chat_access' | 'persona' | 'workflows' | 'safety' | 'reports'>('main')

  // Estado limpio: se removió bot_username que no pertenece a telegram business
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

  // ── MOTOR DE AUTO-GUARDADO ──
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
      if (activeView === 'main') {
        onClose()
      } else {
        setActiveView('main')
      }
    }

    tg.BackButton.onClick(handleBackAction)
    return () => {
      tg.BackButton.offClick(handleBackAction)
    }
  }, [activeView, onClose])

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
    // overflow-hidden y max-w-full previenen el scroll horizontal
    <div className="fixed inset-0 z-[60] bg-[#000] flex flex-col overflow-hidden w-full max-w-full animate-in fade-in duration-200">
      
      {/* overflow-x-hidden mata el vacío hacia la derecha */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-20 w-full" style={{ background: "#000" }}>
        
        {/* ── MENÚ PRINCIPAL ── */}
        {activeView === 'main' && (
          <div className="animate-in fade-in duration-200 w-full">
            
            <div className="flex flex-col items-center text-center pt-16 mb-6">
              <img 
                src={agentGifUrl} 
                alt="Agent" 
                className="w-[120px] h-[120px] object-contain mb-4 pointer-events-none select-none" 
              />
              <h1 className="text-white font-bold mb-1" style={{ fontSize: "24px", fontFamily: SFD }}>Chat Automation</h1>
              <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, maxWidth: "280px", lineHeight: "1.3" }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            <Block title="Settings">
              <Row 
                icon={<MessageSquare className="w-4 h-4 text-white" />} iconBg="bg-[#0a84ff]"
                label="Chat Access Scope" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('chat_access')}
              />
              <Row 
                icon={<Sparkles className="w-4 h-4 text-white" />} iconBg="bg-[#bf5af2]"
                label="AI Persona & Knowledge" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('persona')}
              />
              <Row 
                icon={<Workflow className="w-4 h-4 text-white" />} iconBg="bg-[#ff9f0a]"
                label="Automated Workflows" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('workflows')}
              />
              <Row 
                icon={<ShieldCheck className="w-4 h-4 text-white" />} iconBg="bg-[#ff453a]"
                label="Safety & Protection" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('safety')}
                last
              />
            </Block>

            <Block title="Analytics">
              <Row 
                icon={<BarChart3 className="w-4 h-4 text-white" />} iconBg="bg-[#32ade6]"
                label="Performance Diagnostics" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('reports')}
                last
              />
            </Block>

          </div>
        )}

        {/* ── CHAT ACCESS SCOPE ── */}
        {activeView === 'chat_access' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200 w-full">
            <h2 className="text-white font-bold tracking-tight px-1 mb-6" style={{ fontSize: "28px", fontFamily: SFD }}>Chat Access Scope</h2>
            
            <Block title="Allowed Conversations" footerHint="You can configure your whitelists using the main xBlum bot interface.">
              <Row 
                label="All private chats except exclusions"
                onClick={() => setAndSave('auto_reply_filter', 'everyone')}
                right={config.auto_reply_filter === 'everyone' ? <Check className="w-5 h-5 text-[#3b82f6]" /> : null}
              />
              <Row 
                label="Only whitelisted conversations"
                onClick={() => setAndSave('auto_reply_filter', 'whitelist')}
                right={config.auto_reply_filter === 'whitelist' ? <Check className="w-5 h-5 text-[#3b82f6]" /> : null}
                last
              />
            </Block>
          </div>
        )}

        {/* ── AI PERSONA & KNOWLEDGE ── */}
        {activeView === 'persona' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200 w-full">
            <h2 className="text-white font-bold tracking-tight px-1 mb-6" style={{ fontSize: "28px", fontFamily: SFD }}>AI Persona</h2>
            
            <Block title="Intelligence">
              <Row 
                label="AI Auto-Reply Processing"
                sublabel="Process inbound messages using Grok 4.1."
                right={<Toggle on={config.ai_autoreply_enabled} onToggle={() => setAndSave('ai_autoreply_enabled', !config.ai_autoreply_enabled)} />}
                last
              />
            </Block>

            {/* SE DESAPARECE COMPLETAMENTE SI ESTÁ APAGADO */}
            {config.ai_autoreply_enabled && (
              <div className="animate-in fade-in duration-300 w-full">
                <Block title="Identity Blueprint">
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-white" style={{ fontSize: "15px", fontFamily: SF }}>Account Role</p>
                  </div>
                  <PillSelector 
                    options={['personal', 'sales', 'support', 'community']}
                    selected={config.use_case}
                    onSelect={(v) => setAndSave('use_case', v)}
                  />
                  <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-white" style={{ fontSize: "15px", fontFamily: SF }}>Tone Register</p>
                  </div>
                  <PillSelector 
                    options={['adaptive', 'casual', 'formal', 'empathetic']}
                    selected={config.tone}
                    onSelect={(v) => setAndSave('tone', v)}
                  />
                </Block>

                <Block title="System Prompt">
                  <div className="px-5 pb-5 pt-1">
                    <textarea
                      key="persona_hint"
                      defaultValue={config.ai_persona_hint}
                      onBlur={(e) => setAndSave('ai_persona_hint', e.target.value)}
                      placeholder="E.g., Act as concise tech support..."
                      className="w-full p-4 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none min-h-[100px] resize-none transition-colors"
                      style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF, fontSize: "15px" }}
                      onFocus={e => (e.target.style.borderColor = "#3a3a3c")}
                      onBlurCapture={e => (e.target.style.borderColor = "transparent")}
                    />
                  </div>
                </Block>

                <Block title="Knowledge Base Context">
                  <div className="px-5 pb-5 pt-1">
                    <textarea
                      key="kb_text"
                      defaultValue={config.kb_text}
                      onBlur={(e) => setAndSave('kb_text', e.target.value)}
                      placeholder="Pricing, URLs, operational data..."
                      className="w-full p-4 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none min-h-[120px] resize-none transition-colors"
                      style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF, fontSize: "15px" }}
                      onFocus={e => (e.target.style.borderColor = "#3a3a3c")}
                      onBlurCapture={e => (e.target.style.borderColor = "transparent")}
                    />
                  </div>
                </Block>
              </div>
            )}
          </div>
        )}

        {/* ── AUTOMATED WORKFLOWS ── */}
        {activeView === 'workflows' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200 w-full">
            <h2 className="text-white font-bold tracking-tight px-1 mb-6" style={{ fontSize: "28px", fontFamily: SFD }}>Workflows</h2>
            
            <Block title="Engagement Loops">
              <Row 
                label="Smart Follow-up Matrix"
                sublabel="Trigger automated follow-ups if user drops engagement."
                right={<Toggle on={config.followup_enabled} onToggle={() => setAndSave('followup_enabled', !config.followup_enabled)} />}
                last={!config.followup_enabled}
              />
              {/* DESAPARECE COMPLETAMENTE */}
              {config.followup_enabled && (
                <div className="px-5 py-4 flex gap-4 w-full" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "12px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Delay (Hours)</p>
                    <input 
                      type="number" 
                      key="delay_h"
                      defaultValue={config.followup_delay_h} 
                      onBlur={(e) => setAndSave('followup_delay_h', parseInt(e.target.value) || 0)} 
                      className="w-full bg-transparent text-white outline-none border-b border-[#2c2c2e] pb-1" 
                      style={{ fontSize: "16px", fontFamily: SF }} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "12px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Max Retries</p>
                    <input 
                      type="number" 
                      key="max_retries"
                      defaultValue={config.followup_max} 
                      onBlur={(e) => setAndSave('followup_max', parseInt(e.target.value) || 1)} 
                      className="w-full bg-transparent text-white outline-none border-b border-[#2c2c2e] pb-1" 
                      style={{ fontSize: "16px", fontFamily: SF }} 
                    />
                  </div>
                </div>
              )}
            </Block>

            <Block title="Inline Agent">
              <Row 
                label="Passive Mentions"
                sublabel="Agent replies when its name is mentioned in groups."
                right={<Toggle on={config.invocation_enabled} onToggle={() => setAndSave('invocation_enabled', !config.invocation_enabled)} />}
                last={!config.invocation_enabled}
              />
              {/* DESAPARECE COMPLETAMENTE */}
              {config.invocation_enabled && (
                <div className="w-full px-5 py-3.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <input 
                    type="text" 
                    key="bot_names"
                    defaultValue={config.bot_names}
                    onBlur={(e) => setAndSave('bot_names', e.target.value)}
                    placeholder="Trigger keywords (e.g., agent, bot)"
                    className="w-full bg-transparent text-white outline-none placeholder:text-[#636366]"
                    style={{ fontSize: "15px", fontFamily: SF }}
                  />
                </div>
              )}
            </Block>
          </div>
        )}

        {/* ── SAFETY & PROTECTION ── */}
        {activeView === 'safety' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200 w-full">
            <h2 className="text-white font-bold tracking-tight px-1 mb-6" style={{ fontSize: "28px", fontFamily: SFD }}>Safety</h2>
            
            <Block title="Spam Filtering">
              <Row 
                label="Active Anti-Spam S2S"
                sublabel="Identify and delete malicious links and ads."
                right={<Toggle on={config.spam_filter_enabled} onToggle={() => setAndSave('spam_filter_enabled', !config.spam_filter_enabled)} />}
                last={!config.spam_filter_enabled}
              />
              {/* DESAPARECE COMPLETAMENTE */}
              {config.spam_filter_enabled && (
                <div className="w-full animate-in fade-in duration-200">
                  <div className="px-5 pt-3 pb-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-white" style={{ fontSize: "15px", fontFamily: SF }}>Aggressiveness Threshold</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)" }}>
                    <PillSelector 
                      options={['low', 'medium', 'high']}
                      selected={config.spam_sensitivity}
                      onSelect={(v) => setAndSave('spam_sensitivity', v)}
                    />
                  </div>
                </div>
              )}
            </Block>

            <Block title="Emulation & Alerts">
              <Row 
                label="Humanized Typing"
                sublabel="Inject artificial typing delays for organic rhythm."
                right={<Toggle on={config.humanize_enabled} onToggle={() => setAndSave('humanize_enabled', !config.humanize_enabled)} />}
              />
              <Row 
                label="Emergency Alerts"
                sublabel="Receive DM logs on structural anomalies."
                right={<Toggle on={config.urgency_notify} onToggle={() => setAndSave('urgency_notify', !config.urgency_notify)} />}
                last
              />
            </Block>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeView === 'reports' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200 w-full">
            <h2 className="text-white font-bold tracking-tight px-1 mb-6" style={{ fontSize: "28px", fontFamily: SFD }}>Analytics</h2>
            
            <Block title="Diagnostics">
              <Row 
                label="24-Hour Metrics Digest"
                sublabel="Receive daily performance reports directly."
                right={<Toggle on={config.daily_digest} onToggle={() => setAndSave('daily_digest', !config.daily_digest)} />}
                last={!config.daily_digest}
              />
              {/* DESAPARECE COMPLETAMENTE */}
              {config.daily_digest && (
                <div className="px-5 py-4 flex items-center justify-between w-full animate-in fade-in duration-200" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-white" style={{ fontSize: "15px", fontFamily: SF }}>Dispatch Window</p>
                  <select 
                    value={config.daily_digest_hour}
                    onChange={(e) => setAndSave('daily_digest_hour', parseInt(e.target.value) || 0)}
                    className="bg-transparent text-[#3b82f6] font-medium outline-none"
                    style={{ fontSize: "15px", fontFamily: SF }}
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h} className="bg-[#111] text-white">{h.toString().padStart(2, '0')}:00 UTC</option>
                    ))}
                  </select>
                </div>
              )}
            </Block>
          </div>
        )}

      </div>
    </div>
  )
}
