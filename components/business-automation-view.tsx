"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Bot, Workflow, 
  ChevronRight, BarChart3, Check
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── NATIVE SETTINGS STYLING (Basado exactamente en tu settings-view) ──
const settingsContainer = {
  background: "#1c1c1e",
  borderRadius: "12px",
  overflow: "hidden" as const,
}

const inputSettingsStyle = {
  background: "transparent",
  color: "#ffffff",
  outline: "none",
  width: "100%",
}

export function BusinessAutomationView({ 
  onClose, 
  apiBaseUrl = "", 
  agentGifUrl = "/agent-robot.gif" 
}: { onClose: () => void; apiBaseUrl?: string; agentGifUrl?: string }) {
  
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

  // Configuración del botón Back nativo de Telegram
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

  // ── REUSABLE UI COMPONENTS (NATIVE SETTINGS STYLE) ──

  // El título azul dentro del contenedor
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 pt-4 pb-1.5 text-[#3b82f6] text-[13px] font-semibold uppercase tracking-wide" style={{ fontFamily: SF }}>
      {title}
    </div>
  )

  const renderToggleRow = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2c2c2e]/50 last:border-b-0 cursor-pointer active:bg-white/5 transition-colors" onClick={() => onChange(!value)}>
      <div className="flex flex-col pr-4 flex-1">
        <span className="text-white text-[16px]" style={{ fontFamily: SF }}>{label}</span>
        {subLabel && <span className="text-[#8e8e93] text-[13px] mt-0.5 leading-snug">{subLabel}</span>}
      </div>
      <button 
        type="button"
        className="shrink-0 w-[50px] h-[30px] rounded-full p-0.5 transition-colors duration-200 relative focus:outline-none"
        style={{ backgroundColor: value ? "#34c759" : "#3a3a3c" }}
      >
        <div 
          className="w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-out" 
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )

  const renderRadioRow = (label: string, uniqueKey: string, currentVal: string, onClick: () => void) => {
    const isSelected = currentVal === uniqueKey
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-white/5 transition-colors text-left border-b border-[#2c2c2e]/50 last:border-b-0"
      >
        <span className="text-white text-[16px]" style={{ fontFamily: SF }}>{label}</span>
        {isSelected && <Check className="w-5 h-5 text-[#3b82f6]" />}
      </button>
    )
  }

  // Row para el menú principal con iconos a la izquierda y flechas a la derecha
  const renderMenuRow = (label: string, icon: React.ReactNode, targetView: typeof activeView, iconBg: string) => (
    <button
      type="button"
      onClick={() => setActiveView(targetView)}
      className="w-full flex items-center justify-between pl-4 pr-3 py-3 border-b border-[#2c2c2e]/50 last:border-b-0 active:bg-white/5 transition-colors focus:outline-none"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${iconBg}`}>
          {icon}
        </div>
        <span className="text-white text-[16px]" style={{ fontFamily: SF }}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-[#545458]" />
    </button>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#3b82f6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Scrollable Frame */}
      <div className="flex-1 overflow-y-auto px-4 pb-40 no-scrollbar">
        
        {/* ── MAIN VIEWS / INDEX PAGE ── */}
        {activeView === 'main' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Centered Gif, Title, Small Description */}
            <div className="flex flex-col items-center text-center pt-16 mb-4">
              <img 
                src={agentGifUrl} 
                alt="Automation Hub" 
                className="w-[120px] h-[120px] object-contain mb-4" 
              />
              <h1 className="text-white text-[22px] font-bold mb-1.5" style={{ fontFamily: SFD }}>Chat Automation</h1>
              <p className="text-[#8e8e93] text-[15px] max-w-[280px] leading-snug" style={{ fontFamily: SF }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            {/* Container 1: Settings Block */}
            <div style={settingsContainer}>
              <SectionHeader title="Settings" />
              {renderMenuRow("Bot Integration", <Bot className="w-4 h-4" />, 'integration', "bg-[#0a84ff]")}
              {renderMenuRow("AI Persona & Knowledge", <Sparkles className="w-4 h-4" />, 'persona', "bg-[#bf5af2]")}
              {renderMenuRow("Automated Workflows", <Workflow className="w-4 h-4" />, 'workflows', "bg-[#ff9f0a]")}
              {renderMenuRow("Safety & Spam Protection", <ShieldCheck className="w-4 h-4" />, 'safety', "bg-[#ff453a]")}
            </div>

            {/* Container 2: Reports Block */}
            <div style={settingsContainer}>
              <SectionHeader title="Analytics" />
              {renderMenuRow("Performance Diagnostics", <BarChart3 className="w-4 h-4" />, 'reports', "bg-[#32ade6]")}
            </div>

          </div>
        )}

        {/* ── PAGE: BOT INTEGRATION ── */}
        {activeView === 'integration' && (
          <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[28px] font-bold tracking-tight px-1 mb-2" style={{ fontFamily: SFD }}>Bot Integration</h2>
            
            <div style={settingsContainer}>
              <SectionHeader title="Connection" />
              <div className="px-4 py-3 border-t border-[#2c2c2e]/50">
                <input 
                  type="text" 
                  placeholder="Bot @username or url" 
                  value={config.bot_username}
                  onChange={(e) => setConfig({...config, bot_username: e.target.value})}
                  className="text-[16px] placeholder:text-[#636366]"
                  style={{ ...inputSettingsStyle, fontFamily: SF }}
                />
              </div>
            </div>

            <div style={settingsContainer}>
              <SectionHeader title="Chat Access Scope" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderRadioRow("All private chats except exclusions", "everyone", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'everyone'}))}
                {renderRadioRow("Only whitelisted conversations", "whitelist", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'whitelist'}))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE: AI PERSONA & KNOWLEDGE ── */}
        {activeView === 'persona' && (
          <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[28px] font-bold tracking-tight px-1 mb-2" style={{ fontFamily: SFD }}>AI Persona & Knowledge</h2>
            
            <div style={settingsContainer}>
              <SectionHeader title="Intelligence" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("AI Auto-Reply Processing", "Process inbound messages using Grok 4.1.", config.ai_autoreply_enabled, (val) => setConfig({...config, ai_autoreply_enabled: val}))}
              </div>
            </div>

            <div style={settingsContainer}>
              <SectionHeader title="Identity Blueprint" />
              <div className="px-4 py-3 border-t border-[#2c2c2e]/50 space-y-3">
                <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Account Role</span>
                <div className="grid grid-cols-2 gap-2">
                  {['personal', 'sales', 'support', 'community'].map((uc) => (
                    <button key={uc} onClick={() => setConfig({...config, use_case: uc})} className={`py-2 rounded-lg text-[14px] font-medium capitalize transition-colors ${config.use_case === uc ? 'bg-[#3b82f6] text-white' : 'bg-[#2c2c2e] text-[#8e8e93]'}`}>{uc}</button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-[#2c2c2e]/50 space-y-3">
                <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Tone Register</span>
                <div className="flex flex-wrap gap-2">
                  {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => (
                    <button key={t} onClick={() => setConfig({...config, tone: t})} className={`px-4 py-1.5 rounded-full text-[14px] font-medium capitalize transition-colors ${config.tone === t ? 'bg-[#3b82f6] text-white' : 'bg-[#2c2c2e] text-[#8e8e93]'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={settingsContainer}>
              <SectionHeader title="Instructions & Memory" />
              <div className="px-4 py-3 border-t border-[#2c2c2e]/50">
                <textarea 
                  value={config.ai_persona_hint}
                  onChange={(e) => setConfig({...config, ai_persona_hint: e.target.value})}
                  placeholder="System Prompt (e.g., Act as concise tech support...)"
                  className="text-[15px] placeholder:text-[#636366] min-h-[80px] resize-none py-1"
                  style={{ ...inputSettingsStyle, fontFamily: SF }}
                />
              </div>
              <div className="px-4 py-3 border-t border-[#2c2c2e]/50">
                <textarea 
                  value={config.kb_text}
                  onChange={(e) => setConfig({...config, kb_text: e.target.value})}
                  placeholder="Knowledge Base Context (Pricing, URLs, operational data...)"
                  className="text-[15px] placeholder:text-[#636366] min-h-[100px] resize-none py-1"
                  style={{ ...inputSettingsStyle, fontFamily: SF }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE: AUTOMATED WORKFLOWS ── */}
        {activeView === 'workflows' && (
          <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[28px] font-bold tracking-tight px-1 mb-2" style={{ fontFamily: SFD }}>Automated Workflows</h2>
            
            <div style={settingsContainer}>
              <SectionHeader title="Engagement Loops" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("Smart Follow-up Matrix", "Trigger automated follow-ups if user drops engagement.", config.followup_enabled, (val) => setConfig({...config, followup_enabled: val}))}
              </div>
              {config.followup_enabled && (
                <div className="px-4 py-3 border-t border-[#2c2c2e]/50 bg-[#161618]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#8e8e93] text-[13px] mb-1 block">Delay (Hours)</span>
                      <input type="number" value={config.followup_delay_h} onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})} className="text-[16px] w-full border-b border-[#2c2c2e] pb-1" style={inputSettingsStyle} />
                    </div>
                    <div>
                      <span className="text-[#8e8e93] text-[13px] mb-1 block">Max Retries</span>
                      <input type="number" value={config.followup_max} onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})} className="text-[16px] w-full border-b border-[#2c2c2e] pb-1" style={inputSettingsStyle} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={settingsContainer}>
              <SectionHeader title="Inline Agent" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("Passive Mentions", "Agent replies when its name is mentioned in groups.", config.invocation_enabled, (val) => setConfig({...config, invocation_enabled: val}))}
              </div>
              {config.invocation_enabled && (
                <div className="px-4 py-3 border-t border-[#2c2c2e]/50 bg-[#161618]">
                  <span className="text-[#8e8e93] text-[13px] mb-1 block">Trigger Keywords</span>
                  <input 
                    type="text" 
                    value={config.bot_names}
                    onChange={(e) => setConfig({...config, bot_names: e.target.value})}
                    placeholder="E.g., xblum, agent"
                    className="text-[16px]"
                    style={inputSettingsStyle}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAGE: SAFETY & SPAM PROTECTION ── */}
        {activeView === 'safety' && (
          <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[28px] font-bold tracking-tight px-1 mb-2" style={{ fontFamily: SFD }}>Safety & Protection</h2>
            
            <div style={settingsContainer}>
              <SectionHeader title="Spam Filtering" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("Active Anti-Spam S2S", "Identify and delete malicious links and ads.", config.spam_filter_enabled, (val) => setConfig({...config, spam_filter_enabled: val}))}
              </div>
              {config.spam_filter_enabled && (
                <div className="px-4 py-3 border-t border-[#2c2c2e]/50 bg-[#161618]">
                  <span className="text-white text-[14px] mb-3 block" style={{ fontFamily: SF }}>Aggressiveness Threshold</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((lvl) => (
                      <button key={lvl} onClick={() => setConfig({...config, spam_sensitivity: lvl})} className={`py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${config.spam_sensitivity === lvl ? 'bg-[#ff453a] text-white' : 'bg-[#2c2c2e] text-[#8e8e93]'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={settingsContainer}>
              <SectionHeader title="Emulation & Alerts" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("Humanized Typing", "Inject artificial typing delays for organic rhythm.", config.humanize_enabled, (val) => setConfig({...config, humanize_enabled: val}))}
              </div>
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("Emergency Alerts", "Receive DM logs on structural anomalies.", config.urgency_notify, (val) => setConfig({...config, urgency_notify: val}))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE: ANALYTICS & REPORTS ── */}
        {activeView === 'reports' && (
          <div className="space-y-6 pt-6 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[28px] font-bold tracking-tight px-1 mb-2" style={{ fontFamily: SFD }}>Analytics & Reports</h2>
            
            <div style={settingsContainer}>
              <SectionHeader title="Diagnostics" />
              <div className="border-t border-[#2c2c2e]/50">
                {renderToggleRow("24-Hour Metrics Digest", "Receive daily performance reports directly.", config.daily_digest, (val) => setConfig({...config, daily_digest: val}))}
              </div>
              {config.daily_digest && (
                <div className="px-4 py-3 border-t border-[#2c2c2e]/50 bg-[#161618] flex items-center justify-between">
                  <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Dispatch Window</span>
                  <select 
                    value={config.daily_digest_hour}
                    onChange={(e) => setConfig({...config, daily_digest_hour: parseInt(e.target.value) || 0})}
                    className="bg-[#2c2c2e] text-white font-medium px-3 py-1.5 rounded-lg outline-none text-[14px]"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}:00 UTC</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── PERSISTENT ACTIONS FLOORBAR (Only in sub-pages) ── */}
      {activeView !== 'main' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="flex gap-3 max-w-md mx-auto">
            <button 
              type="button" 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-1 bg-[#3b82f6] text-white font-bold h-[50px] rounded-[12px] text-[16px] active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ fontFamily: SF }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Save Settings
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
