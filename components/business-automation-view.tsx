"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Bot, Workflow, 
  ChevronRight, BarChart3, Check
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

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
  const [saving, setSaving] = useState(false)
  const [activeView, setActiveView] = useState<'main' | 'integration' | 'persona' | 'workflows' | 'safety' | 'reports'>('main')

  const [config, setConfig] = useState({
    bot_username: "",
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

  // Native Telegram Back Button
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
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      const res = await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config })
      })
      if (res.ok) {
        tg?.showAlert?.("Changes saved successfully! 🤖")
        setActiveView('main')
      } else {
        tg?.showAlert?.("Failed to synchronize cloud setup.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // ── REUSABLE UI COMPONENTS EXACTLY LIKE SETTINGS-VIEW ──

  const Block = ({ title, children, footerHint }: { title?: string, children: React.ReactNode, footerHint?: string }) => (
    <div className="mb-6">
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
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
    icon, label, sublabel, right, onClick, last 
  }: { 
    icon?: React.ReactNode, label: string, sublabel?: React.ReactNode, right?: React.ReactNode, onClick?: () => void, last?: boolean 
  }) => (
    <>
      <div
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 transition-colors ${onClick ? 'active:bg-white/5 cursor-pointer' : ''}`}
        style={{ paddingTop: "14px", paddingBottom: "14px" }}
      >
        {icon && (
          <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
            {icon}
          </div>
        )}
        <div className="flex-1 text-left">
          <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
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

  const Toggle = ({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={"relative rounded-full transition-all duration-200 shrink-0 " + (disabled ? "opacity-50" : "")}
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

  const InputRow = ({ value, onChange, placeholder, last }: { value: string, onChange: (v: string) => void, placeholder: string, last?: boolean }) => (
    <>
      <div className="w-full px-5 py-3.5">
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white outline-none"
          style={{ fontSize: "16px", fontFamily: SF }}
        />
      </div>
      {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />}
    </>
  )

  const TextAreaBlock = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder: string }) => (
    <div className="px-5 pb-5 pt-2">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none min-h-[120px] resize-none transition-colors"
        style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF, fontSize: "16px" }}
        onFocus={e => (e.target.style.borderColor = "#3a3a3c")}
        onBlur={e => (e.target.style.borderColor = "1px solid #1c1c1e")}
      />
    </div>
  )

  const PillSelector = ({ options, selected, onSelect }: { options: string[], selected: string, onSelect: (v: string) => void }) => (
    <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="px-3 py-1.5 rounded-full capitalize transition-colors"
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#000] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#3b82f6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#000] flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      <div className="flex-1 overflow-y-auto px-4 pb-40" style={{ background: "#000" }}>
        
        {/* ── MAIN VIEWS / INDEX PAGE ── */}
        {activeView === 'main' && (
          <div className="animate-in fade-in duration-200">
            
            <div className="flex flex-col items-center text-center pt-16 mb-8">
              <img 
                src={agentGifUrl} 
                alt="Agent" 
                className="w-[120px] h-[120px] object-contain mb-4" 
              />
              <h1 className="text-white font-bold mb-1" style={{ fontSize: "24px", fontFamily: SFD }}>Chat Automation</h1>
              <p style={{ fontSize: "15px", color: "#8e8e93", fontFamily: SF, maxWidth: "280px", lineHeight: "1.3" }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            <Block title="SETTINGS">
              <Row 
                icon={<Bot className="text-[#3b82f6]" />} 
                label="Bot Integration" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('integration')}
              />
              <Row 
                icon={<Sparkles className="text-[#bf5af2]" />} 
                label="AI Persona & Knowledge" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('persona')}
              />
              <Row 
                icon={<Workflow className="text-[#ff9f0a]" />} 
                label="Automated Workflows" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('workflows')}
              />
              <Row 
                icon={<ShieldCheck className="text-[#ff453a]" />} 
                label="Safety & Protection" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('safety')}
                last
              />
            </Block>

            <Block title="ANALYTICS">
              <Row 
                icon={<BarChart3 className="text-[#32ade6]" />} 
                label="Performance Diagnostics" 
                right={<ChevronRight className="w-5 h-5 text-[#48484a]" />} 
                onClick={() => setActiveView('reports')}
                last
              />
            </Block>

          </div>
        )}

        {/* ── PAGE: BOT INTEGRATION ── */}
        {activeView === 'integration' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Bot Integration</h2>
            
            <Block title="CONNECTION" footerHint="Enter the username of the bot you created via BotFather.">
              <InputRow 
                value={config.bot_username}
                onChange={(v) => setConfig({...config, bot_username: v})}
                placeholder="Bot @username or url"
                last
              />
            </Block>

            <Block title="CHAT ACCESS SCOPE">
              <Row 
                label="All private chats except exclusions"
                onClick={() => setConfig({...config, auto_reply_filter: 'everyone'})}
                right={config.auto_reply_filter === 'everyone' ? <Check className="w-5 h-5 text-[#3b82f6]" /> : null}
              />
              <Row 
                label="Only whitelisted conversations"
                onClick={() => setConfig({...config, auto_reply_filter: 'whitelist'})}
                right={config.auto_reply_filter === 'whitelist' ? <Check className="w-5 h-5 text-[#3b82f6]" /> : null}
                last
              />
            </Block>
          </div>
        )}

        {/* ── PAGE: AI PERSONA & KNOWLEDGE ── */}
        {activeView === 'persona' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>AI Persona</h2>
            
            <Block title="INTELLIGENCE">
              <Row 
                label="AI Auto-Reply Processing"
                sublabel="Process inbound messages using Grok 4.1."
                right={<Toggle on={config.ai_autoreply_enabled} onToggle={() => setConfig({...config, ai_autoreply_enabled: !config.ai_autoreply_enabled})} />}
                last
              />
            </Block>

            <Block title="IDENTITY BLUEPRINT">
              <div className="px-5 pt-3 pb-1">
                <p className="text-white" style={{ fontSize: "16px", fontFamily: SF }}>Account Role</p>
              </div>
              <PillSelector 
                options={['personal', 'sales', 'support', 'community']}
                selected={config.use_case}
                onSelect={(v) => setConfig({...config, use_case: v})}
              />
              <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />
              <div className="px-5 pt-3 pb-1">
                <p className="text-white" style={{ fontSize: "16px", fontFamily: SF }}>Tone Register</p>
              </div>
              <PillSelector 
                options={['adaptive', 'casual', 'formal', 'empathetic']}
                selected={config.tone}
                onSelect={(v) => setConfig({...config, tone: v})}
              />
            </Block>

            <div className="mb-6">
              <div className="px-5 pt-3 pb-1">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", fontFamily: SF, textTransform: "uppercase" }}>SYSTEM PROMPT</p>
              </div>
              <TextAreaBlock 
                value={config.ai_persona_hint}
                onChange={(v) => setConfig({...config, ai_persona_hint: v})}
                placeholder="E.g., Act as concise tech support..."
              />
            </div>

            <div className="mb-6">
              <div className="px-5 pt-3 pb-1">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", fontFamily: SF, textTransform: "uppercase" }}>KNOWLEDGE BASE CONTEXT</p>
              </div>
              <TextAreaBlock 
                value={config.kb_text}
                onChange={(v) => setConfig({...config, kb_text: v})}
                placeholder="Pricing, URLs, operational data..."
              />
            </div>
          </div>
        )}

        {/* ── PAGE: AUTOMATED WORKFLOWS ── */}
        {activeView === 'workflows' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Workflows</h2>
            
            <Block title="ENGAGEMENT LOOPS">
              <Row 
                label="Smart Follow-up Matrix"
                sublabel="Trigger automated follow-ups if user drops engagement."
                right={<Toggle on={config.followup_enabled} onToggle={() => setConfig({...config, followup_enabled: !config.followup_enabled})} />}
                last={!config.followup_enabled}
              />
              {config.followup_enabled && (
                <div className="px-5 py-4 flex gap-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex-1">
                    <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Delay (Hours)</p>
                    <input type="number" value={config.followup_delay_h} onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})} className="w-full bg-transparent text-white outline-none border-b border-[#2c2c2e] pb-1" style={{ fontSize: "16px", fontFamily: SF }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF, marginBottom: "4px" }}>Max Retries</p>
                    <input type="number" value={config.followup_max} onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})} className="w-full bg-transparent text-white outline-none border-b border-[#2c2c2e] pb-1" style={{ fontSize: "16px", fontFamily: SF }} />
                  </div>
                </div>
              )}
            </Block>

            <Block title="INLINE AGENT">
              <Row 
                label="Passive Mentions"
                sublabel="Agent replies when its name is mentioned in groups."
                right={<Toggle on={config.invocation_enabled} onToggle={() => setConfig({...config, invocation_enabled: !config.invocation_enabled})} />}
                last={!config.invocation_enabled}
              />
              {config.invocation_enabled && (
                <InputRow 
                  value={config.bot_names}
                  onChange={(v) => setConfig({...config, bot_names: v})}
                  placeholder="Trigger keywords (e.g., agent, bot)"
                  last
                />
              )}
            </Block>
          </div>
        )}

        {/* ── PAGE: SAFETY & PROTECTION ── */}
        {activeView === 'safety' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Safety</h2>
            
            <Block title="SPAM FILTERING">
              <Row 
                label="Active Anti-Spam S2S"
                sublabel="Identify and delete malicious links and ads."
                right={<Toggle on={config.spam_filter_enabled} onToggle={() => setConfig({...config, spam_filter_enabled: !config.spam_filter_enabled})} />}
                last={!config.spam_filter_enabled}
              />
              {config.spam_filter_enabled && (
                <>
                  <div className="px-5 pt-3 pb-1">
                    <p className="text-white" style={{ fontSize: "16px", fontFamily: SF }}>Aggressiveness Threshold</p>
                  </div>
                  <PillSelector 
                    options={['low', 'medium', 'high']}
                    selected={config.spam_sensitivity}
                    onSelect={(v) => setConfig({...config, spam_sensitivity: v})}
                  />
                </>
              )}
            </Block>

            <Block title="EMULATION & ALERTS">
              <Row 
                label="Humanized Typing"
                sublabel="Inject artificial typing delays for organic rhythm."
                right={<Toggle on={config.humanize_enabled} onToggle={() => setConfig({...config, humanize_enabled: !config.humanize_enabled})} />}
              />
              <Row 
                label="Emergency Alerts"
                sublabel="Receive DM logs on structural anomalies."
                right={<Toggle on={config.urgency_notify} onToggle={() => setConfig({...config, urgency_notify: !config.urgency_notify})} />}
                last
              />
            </Block>
          </div>
        )}

        {/* ── PAGE: ANALYTICS ── */}
        {activeView === 'reports' && (
          <div className="pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Analytics</h2>
            
            <Block title="DIAGNOSTICS">
              <Row 
                label="24-Hour Metrics Digest"
                sublabel="Receive daily performance reports directly."
                right={<Toggle on={config.daily_digest} onToggle={() => setConfig({...config, daily_digest: !config.daily_digest})} />}
                last={!config.daily_digest}
              />
              {config.daily_digest && (
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-white" style={{ fontSize: "16px", fontFamily: SF }}>Dispatch Window</p>
                  <select 
                    value={config.daily_digest_hour}
                    onChange={(e) => setConfig({...config, daily_digest_hour: parseInt(e.target.value) || 0})}
                    className="bg-transparent text-[#3b82f6] font-semibold outline-none"
                    style={{ fontSize: "16px", fontFamily: SF }}
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

      {/* ── PERSISTENT ACTIONS (Only in sub-pages) ── */}
      {activeView !== 'main' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full bg-[#3b82f6] text-white h-[50px] rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ fontSize: "17px", fontWeight: 600, fontFamily: SF }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Save Settings
          </button>
        </div>
      )}

    </div>
  )
}
