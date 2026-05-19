"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Bot, Workflow, 
  ChevronRight, BarChart3, Check, AlertTriangle
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── NATIVE UNIFIED SETTINGS CONTAINERS ──
const settingsContainer = {
  background: "#111111",
  border: "1px solid #1c1c1e",
  borderRadius: "16px",
  overflow: "hidden" as const,
}

const inputSettingsStyle = {
  background: "transparent",
  color: "#ffffff",
  outline: "none",
  width: "100%",
  border: "none",
}

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
  const [activeView, setActiveView] = useState<'main' | 'integration' | 'persona' | 'workflows' | 'safety' | 'reports'>('main')

  // ── BACKEND CORE STATE STRUCTURE ──
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

  // ── AUTO-SAVE ENGINE CONNECTED TO WEBAPP INTERFACE ──
  const saveConfigToServer = useCallback(async (updatedConfig: typeof config) => {
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      
      await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config: updatedConfig })
      })
    } catch (err) {
      console.error("[AutoSave] Sync error:", err)
    }
  }, [apiBaseUrl])

  // Trigger server sync whenever structural parameters change
  const updateParam = (key: keyof typeof config, value: any) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value }
      saveConfigToServer(next)
      return next
    })
  }

  // Telegram BackButton system integration
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

  // Initial setup loading database state
  useEffect(() => {
    async function fetchCurrentConfig() {
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
    fetchCurrentConfig()
  }, [apiBaseUrl])

  // ── REUSABLE RENDERING COMPONENTS WITH SPECIFIC LAYOUT ADJUSTMENTS ──

  // Lowered down and significantly smaller header format
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-5 pt-3.5 pb-1 text-[#3b82f6] text-[11px] font-bold uppercase tracking-wider text-left" style={{ fontFamily: SF }}>
      {title}
    </div>
  )

  const renderMenuRow = (label: string, icon: React.ReactNode, targetView: typeof activeView, iconBg: string, last = false) => (
    <button
      type="button"
      onClick={() => setActiveView(targetView)}
      className="w-full flex items-center justify-between pl-4 pr-3 py-3.5 border-b border-[#1c1c1e] last:border-b-0 active:bg-white/5 transition-colors focus:outline-none"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm ${iconBg}`}>
          {icon}
        </div>
        <span className="text-white text-[16px] font-medium" style={{ fontFamily: SF }}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-[#48484a]" />
    </button>
  )

  const renderToggleRow = (label: string, sublabel: string, value: boolean, onChange: (val: boolean) => void, last = false) => (
    <>
      <div className="flex items-center justify-between px-5 py-3.5 transition-colors">
        <div className="flex flex-col pr-4 flex-1">
          <span className="text-white text-[16px]" style={{ fontFamily: SF }}>{label}</span>
          {sublabel && <span className="text-[#8e8e93] text-[12px] mt-0.5 leading-tight">{sublabel}</span>}
        </div>
        <button 
          type="button"
          onClick={() => onChange(!value)}
          className="shrink-0 w-[44px] h-[26px] rounded-full p-0.5 transition-all duration-200 relative focus:outline-none"
          style={{ background: value ? "#ffffff" : "#3a3a3c" }}
        >
          <span 
            className="absolute top-[2px] rounded-full shadow-sm transition-transform duration-200"
            style={{
              width: "22px",
              height: "22px",
              background: value ? "#000000" : "#ffffff",
              left: value ? "20px" : "2px",
            }}
          />
        </button>
      </div>
      {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />}
    </>
  )

  const renderRadioRow = (label: string, uniqueKey: string, currentVal: string, onClick: () => void, last = false) => (
    <>
      <button 
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-white/5 transition-colors text-left"
      >
        <span className="text-white text-[16px]" style={{ fontFamily: SF }}>{label}</span>
        {currentVal === uniqueKey && <Check className="w-5 h-5 text-[#3b82f6]" />}
      </button>
      {!last && <div style={{ height: "1px", background: "#1c1c1e", marginLeft: "20px" }} />}
    </>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Container Frame */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 no-scrollbar">
        
        {/* ── INDEX VIEW ── */}
        {activeView === 'main' && (
          <div className="animate-in fade-in duration-200 space-y-6">
            
            {/* Pushed down design without box outline wrappers */}
            <div className="flex flex-col items-center text-center pt-24 mb-4">
              <img 
                src={agentGifUrl} 
                alt="Agent Animation Matrix" 
                className="w-[120px] h-[120px] object-contain mb-4 select-none pointer-events-none" 
              />
              <h1 className="text-white font-bold mb-1" style={{ fontSize: "24px", fontFamily: SFD }}>Chat Automation</h1>
              <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, maxWidth: "270px", lineHeight: "1.3" }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            {/* Container Block A: Settings */}
            <div>
              <SectionHeader title="Settings" />
              <div style={settingsContainer}>
                {renderMenuRow("Bot Integration", <Bot className="w-4 h-4" />, 'integration', "bg-[#0a84ff]")}
                {renderMenuRow("AI Persona & Knowledge", <Sparkles className="w-4 h-4" />, 'persona', "bg-[#bf5af2]")}
                {renderMenuRow("Automated Workflows", <Workflow className="w-4 h-4" />, 'workflows', "bg-[#ff9f0a]")}
                {renderMenuRow("Safety & Protection", <ShieldCheck className="w-4 h-4" />, 'safety', "bg-[#ff453a]", true)}
              </div>
            </div>

            {/* Container Block B: Analytics */}
            <div>
              <SectionHeader title="Analytics" />
              <div style={settingsContainer}>
                {renderMenuRow("Performance Diagnostics", <BarChart3 className="w-4 h-4" />, 'reports', "bg-[#32ade6]", true)}
              </div>
            </div>

          </div>
        )}

        {/* ── PAGE VIEW: BOT INTEGRATION ── */}
        {activeView === 'integration' && (
          <div className="pt-8 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Bot Integration</h2>
            
            <div>
              <SectionHeader title="Connection" />
              <div style={settingsContainer} className="px-5 py-4">
                {/* Fixed Keyboard Bug using clean defaultValue/onBlur approach to stop rendering interruptions */}
                <input 
                  type="text" 
                  key="bot_username_input"
                  defaultValue={config.bot_username}
                  onBlur={(e) => updateParam("bot_username", e.target.value)}
                  placeholder="Bot @username or url"
                  className="placeholder:text-[#636366]"
                  style={{ ...inputSettingsStyle, fontSize: "16px", fontFamily: SF }}
                />
              </div>
              <p className="px-4 mt-2" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>Enter the identity username generated inside BotFather platform.</p>
            </div>

            <div className="mt-4">
              <SectionHeader title="Chat Access Scope" />
              <div style={settingsContainer}>
                {renderRadioRow("All private chats except exclusions", "everyone", config.auto_reply_filter, () => updateParam("auto_reply_filter", "everyone"))}
                {renderRadioRow("Only whitelisted conversations", "whitelist", config.auto_reply_filter, () => updateParam("auto_reply_filter", "whitelist"), true)}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE VIEW: AI PERSONA & KNOWLEDGE ── */}
        {activeView === 'persona' && (
          <div className="pt-8 animate-in slide-in-from-right duration-200 space-y-5">
            <h2 className="text-white font-bold tracking-tight px-1 mb-2" style={{ fontSize: "28px", fontFamily: SFD }}>AI Persona</h2>
            
            <div>
              <SectionHeader title="Intelligence Pipeline" />
              <div style={settingsContainer}>
                {renderToggleRow("AI Auto-Reply Processing", "Process incoming user conversations natively with Grok 4.1 system cores.", config.ai_autoreply_enabled, (v) => updateParam("ai_autoreply_enabled", v), true)}
              </div>
            </div>

            {/* Grayed-out overlay style logic when the main toggle is deactivated */}
            <div className={config.ai_autoreply_enabled ? "opacity-100 transition-opacity" : "opacity-40 pointer-events-none transition-opacity"}>
              <SectionHeader title="Identity Blueprint" />
              <div style={settingsContainer} className="divide-y divide-[#1c1c1e]">
                
                {/* Account Role Selector Grid */}
                <div className="px-5 py-4 space-y-3">
                  <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Account Target Profile</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['personal', 'sales', 'support', 'community'].map((role) => (
                      <button 
                        key={role} 
                        type="button"
                        onClick={() => updateParam("use_case", role)}
                        className="py-2.5 rounded-xl text-[14px] font-medium capitalize transition-colors"
                        style={{
                          background: config.use_case === role ? "#ffffff" : "#1c1c1e",
                          color: config.use_case === role ? "#000000" : "#8e8e93"
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selector array */}
                <div className="px-5 py-4 space-y-3">
                  <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Voice Tone Register</span>
                  <div className="flex flex-wrap gap-2">
                    {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => (
                      <button 
                        key={t}
                        type="button"
                        onClick={() => updateParam("tone", t)}
                        className="px-4 py-1.5 rounded-full text-[13px] font-medium capitalize transition-colors"
                        style={{
                          background: config.tone === t ? "#ffffff" : "#1c1c1e",
                          color: config.tone === t ? "#000000" : "#8e8e93"
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className={config.ai_autoreply_enabled ? "opacity-100 transition-opacity" : "opacity-40 pointer-events-none transition-opacity"}>
              <SectionHeader title="System Prompt Prompting" />
              <div style={settingsContainer} className="p-4">
                <textarea 
                  key="hint_textarea"
                  defaultValue={config.ai_persona_hint}
                  onBlur={(e) => updateParam("ai_persona_hint", e.target.value)}
                  placeholder="E.g., Act as a technical SaaS infrastructure engineer..."
                  className="w-full min-h-[90px] bg-transparent text-white outline-none resize-none placeholder:text-[#636366]"
                  style={{ fontSize: "15px", fontFamily: SF }}
                />
              </div>
            </div>

            <div className={config.ai_autoreply_enabled ? "opacity-100 transition-opacity" : "opacity-40 pointer-events-none transition-opacity"}>
              <SectionHeader title="Knowledge Base Injector" />
              <div style={settingsContainer} className="p-4">
                <textarea 
                  key="kb_textarea"
                  defaultValue={config.kb_text}
                  onBlur={(e) => updateParam("kb_text", e.target.value)}
                  placeholder="Inject pricing lists, URLs, meeting routines and enterprise matrixes here..."
                  className="w-full min-h-[110px] bg-transparent text-white outline-none resize-none placeholder:text-[#636366]"
                  style={{ fontSize: "15px", fontFamily: SF }}
                />
              </div>
            </div>

          </div>
        )}

        {/* ── PAGE VIEW: AUTOMATED WORKFLOWS ── */}
        {activeView === 'workflows' && (
          <div className="pt-8 animate-in slide-in-from-right duration-200 space-y-5">
            <h2 className="text-white font-bold tracking-tight px-1 mb-2" style={{ fontSize: "28px", fontFamily: SFD }}>Workflows</h2>
            
            <div>
              <SectionHeader title="Engagement Loop Sequences" />
              <div style={settingsContainer}>
                {renderToggleRow("Smart Follow-up Matrix", "Dynamically message cold status channels.", config.followup_enabled, (v) => updateParam("followup_enabled", v), true)}
                
                {/* Collapsible item inside container with clean execution background */}
                {config.followup_enabled && (
                  <div className="px-5 py-4 flex gap-4 border-t border-[#1c1c1e]" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <div className="flex-1">
                      <span className="text-[#8e8e93] text-[12px] block mb-1">Delay (Hours)</span>
                      <input 
                        type="number" 
                        defaultValue={config.followup_delay_h} 
                        onBlur={(e) => updateParam("followup_delay_h", parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent text-white border-b border-[#2c2c2e] pb-1 outline-none font-bold" 
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[#8e8e93] text-[12px] block mb-1">Max Retries</span>
                      <input 
                        type="number" 
                        defaultValue={config.followup_max} 
                        onBlur={(e) => updateParam("followup_max", parseInt(e.target.value) || 1)}
                        className="w-full bg-transparent text-white border-b border-[#2c2c2e] pb-1 outline-none font-bold" 
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionHeader title="Inline Interception Engine" />
              <div style={settingsContainer}>
                {renderToggleRow("Passive Group Mentions", "Scan name handles inside cross-group contexts.", config.invocation_enabled, (v) => updateParam("invocation_enabled", v), true)}
                
                {config.invocation_enabled && (
                  <div className="px-5 py-3.5 border-t border-[#1c1c1e]" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <input 
                      type="text" 
                      defaultValue={config.bot_names}
                      onBlur={(e) => updateParam("bot_names", e.target.value)}
                      placeholder="e.g., xblum, agent"
                      className="placeholder:text-[#636366]"
                      style={{ ...inputSettingsStyle, fontSize: "15px", fontFamily: SF }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE VIEW: SAFETY & SPAM PROTECTION ── */}
        {activeView === 'safety' && (
          <div className="pt-8 animate-in slide-in-from-right duration-200 space-y-5">
            <h2 className="text-white font-bold tracking-tight px-1 mb-2" style={{ fontSize: "28px", fontFamily: SFD }}>Safety</h2>
            
            <div>
              <SectionHeader title="Filters & Mitigations" />
              <div style={settingsContainer}>
                {renderToggleRow("Active Anti-Spam S2S", "Instantly wipe outbound advertisements or phishing links.", config.spam_filter_enabled, (v) => updateParam("spam_filter_enabled", v), true)}
                
                {config.spam_filter_enabled && (
                  <div className="px-5 py-4 border-t border-[#1c1c1e] space-y-3" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <span className="text-white text-[14px] block" style={{ fontFamily: SF }}>Aggressiveness Threshold</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((lvl) => (
                        <button 
                          key={lvl} 
                          type="button"
                          onClick={() => updateParam("spam_sensitivity", lvl)}
                          className="py-1.5 rounded-lg text-[13px] font-semibold capitalize transition-colors"
                          style={{
                            background: config.spam_sensitivity === lvl ? "#ff453a" : "#1c1c1e",
                            color: "#ffffff"
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionHeader title="System Realism Configuration" />
              <div style={settingsContainer}>
                {renderToggleRow("Humanized Typing Timing", "Simulate dynamic pause structures for authentic interactions.", config.humanize_enabled, (v) => updateParam("humanize_enabled", v))}
                {renderToggleRow("Emergency DM Dispatch", "Alert administrative log streams upon anomalies.", config.urgency_notify, (v) => updateParam("urgency_notify", v), true)}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE VIEW: ANALYTICS DIAGNOSTICS ── */}
        {activeView === 'reports' && (
          <div className="pt-8 animate-in slide-in-from-right duration-200">
            <h2 className="text-white font-bold tracking-tight px-1 mb-4" style={{ fontSize: "28px", fontFamily: SFD }}>Analytics</h2>
            
            <div>
              <SectionHeader title="Metrics Automated Dispatch" />
              <div style={settingsContainer}>
                {renderToggleRow("24-Hour Analytics Digest", "Deliver full operations summary tables straight to owner logs.", config.daily_digest, (v) => updateParam("daily_digest", v), true)}
                
                {config.daily_digest && (
                  <div className="px-5 py-4 border-t border-[#1c1c1e] flex items-center justify-between" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <span className="text-white text-[15px]" style={{ fontFamily: SF }}>Dispatch Delivery Hour</span>
                    <select 
                      value={config.daily_digest_hour}
                      onChange={(e) => updateParam("daily_digest_hour", parseInt(e.target.value) || 0)}
                      className="bg-transparent text-[#3b82f6] font-bold outline-none text-[15px]"
                    >
                      {Array.from({ length: 24 }).map((_, h) => (
                        <option key={h} value={h} className="bg-[#111] text-white">{h.toString().padStart(2, '0')}:00 UTC</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
