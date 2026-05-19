"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Bot, Workflow, 
  ChevronRight, BarChart3, Save, ArrowLeft, Check
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── SOLID DARK BLOCK STYLING (From Market-View Solid Collections) ──
const solidBlockStyle = {
  background: "#111111", 
  border: "1px solid #1c1c1e",
  borderRadius: "16px",
  overflow: "hidden" as const,
}

const inputSolidStyle = {
  background: "#1c1c1e",
  border: "1px solid #2c2c2e",
  borderRadius: "12px",
  color: "#ffffff",
  outline: "none",
}

const accentBlue = "#33b5f7"

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
  
  // View states: 'main' list view, or specific pages
  const [activeView, setActiveView] = useState<'main' | 'integration' | 'persona' | 'workflows' | 'safety' | 'reports'>('main')

  // ── Production AI English State mapping directly to business_automation.py ──
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

  // Native Telegram Back Button lifecycle routing
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

  // Row Switch Component
  const renderToggleRow = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-b-0 cursor-pointer active:bg-white/[0.01]" onClick={() => onChange(!value)}>
      <div className="flex flex-col pr-4 flex-1">
        <span className="text-white font-semibold text-[15px] tracking-tight" style={{ fontFamily: SF }}>{label}</span>
        {subLabel && <span className="text-[#8e8e93] text-[13px] mt-0.5 leading-snug">{subLabel}</span>}
      </div>
      <button 
        type="button"
        className="shrink-0 w-[46px] h-[26px] rounded-full p-0.5 transition-colors duration-200 relative focus:outline-none"
        style={{ backgroundColor: value ? accentBlue : "#2c2c2e" }}
      >
        <div 
          className="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-out" 
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )

  // Row Selector Component
  const renderRadioRow = (label: string, uniqueKey: string, currentVal: string, onClick: () => void) => {
    const isSelected = currentVal === uniqueKey
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 active:bg-white/[0.02] transition-colors text-left border-b border-[#1c1c1e] last:border-b-0"
      >
        <span className={`text-[15px] ${isSelected ? 'text-white font-medium' : 'text-[#8e8e93]'}`} style={{ fontFamily: SF }}>
          {label}
        </span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#33b5f7]' : 'border-[#2c2c2e]'}`}>
          {isSelected && <div className="w-2.5 h-2.5 bg-[#33b5f7] rounded-full" />}
        </div>
      </button>
    )
  }

  // Row Category Menu Link
  const renderMenuRow = (label: string, icon: React.ReactNode, targetView: typeof activeView) => (
    <button
      type="button"
      onClick={() => setActiveView(targetView)}
      className="w-full flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-b-0 active:bg-white/[0.02] transition-colors focus:outline-none"
    >
      <div className="flex items-center gap-3.5">
        <div className="text-[#8e8e93] flex items-center justify-center w-5 h-5">
          {icon}
        </div>
        <span className="text-white text-[16px] font-medium" style={{ fontFamily: SF }}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-[#3a3a3c]" />
    </button>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#33b5f7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Scrollable Frame */}
      <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar">
        
        {/* ── MAIN VIEWS / INDEX PAGE ── */}
        {activeView === 'main' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Centered Gif, Title, Small Description - Pushed Down */}
            <div className="flex flex-col items-center text-center pt-24 mb-6">
              <img 
                src={agentGifUrl} 
                alt="Automation Hub" 
                className="w-[130px] h-[130px] object-contain mb-5" 
              />
              <h1 className="text-white text-[24px] font-bold mb-1.5" style={{ fontFamily: SFD }}>Chat Automation</h1>
              <p className="text-[#8e8e93] text-[14px] max-w-[280px] leading-snug" style={{ fontFamily: SF }}>
                Assign an intelligent agent to handle your interactions automatically.
              </p>
            </div>

            {/* Container 1: Settings Block */}
            <div className="space-y-2.5">
              <h2 className="text-white text-[19px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Settings</h2>
              <div style={solidBlockStyle}>
                {renderMenuRow("Bot Integration", <Bot className="w-5 h-5" />, 'integration')}
                {renderMenuRow("AI Persona & Knowledge", <Sparkles className="w-5 h-5" />, 'persona')}
                {renderMenuRow("Automated Workflows", <Workflow className="w-5 h-5" />, 'workflows')}
                {renderMenuRow("Safety & Spam Protection", <ShieldCheck className="w-5 h-5" />, 'safety')}
              </div>
            </div>

            {/* Container 2: Reports Block (Created separate title + container for diagnostic/metrics) */}
            <div className="space-y-2.5 pt-2">
              <h2 className="text-white text-[19px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Analytics & Reports</h2>
              <div style={solidBlockStyle}>
                {renderMenuRow("Performance Diagnostics", <BarChart3 className="w-5 h-5" />, 'reports')}
              </div>
            </div>

          </div>
        )}

        {/* ── PAGE: BOT INTEGRATION ── */}
        {activeView === 'integration' && (
          <div className="space-y-6 pt-10 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[22px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Bot Integration</h2>
            <div style={solidBlockStyle} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>Bot Username</span>
                <input 
                  type="text" 
                  placeholder="@username or url" 
                  value={config.bot_username}
                  onChange={(e) => setConfig({...config, bot_username: e.target.value})}
                  className="w-full p-3.5 text-[15px]"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>
              <div className="flex flex-col border-t border-[#1c1c1e] pt-3">
                <span className="text-white text-[14px] font-medium pb-2 block" style={{ fontFamily: SF }}>Chat Scope Access</span>
                <div className="border border-[#1c1c1e] rounded-xl overflow-hidden bg-black/40">
                  {renderRadioRow("All private chats except exclusions", "everyone", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'everyone'}))}
                  {renderRadioRow("Only whitelisted conversations", "whitelist", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'whitelist'}))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE: AI PERSONA & KNOWLEDGE ── */}
        {activeView === 'persona' && (
          <div className="space-y-6 pt-10 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[22px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>AI Persona & Knowledge</h2>
            <div style={solidBlockStyle} className="p-4 space-y-4">
              {renderToggleRow("AI Auto-Reply Processing", "Let the neural network process inbound messages using Grok 4.1 pipelines.", config.ai_autoreply_enabled, (val) => setConfig({...config, ai_autoreply_enabled: val}))}
              
              <div className="h-[1px] bg-[#1c1c1e]" />
              <div className="space-y-2">
                <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>Account Architecture Blueprint</span>
                <div className="grid grid-cols-2 gap-2">
                  {['personal', 'sales', 'support', 'community'].map((uc) => (
                    <button key={uc} onClick={() => setConfig({...config, use_case: uc})} className={`py-2.5 rounded-xl text-[13px] font-bold capitalize transition-all border ${config.use_case === uc ? 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#33b5f7]' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}>{uc}</button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#1c1c1e]" />
              <div className="space-y-2">
                <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>Emotional Resonance Register</span>
                <div className="flex flex-wrap gap-2">
                  {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => (
                    <button key={t} onClick={() => setConfig({...config, tone: t})} className={`h-[34px] px-4 rounded-full text-[13px] font-medium capitalize transition-all border ${config.tone === t ? 'bg-[#33b5f7] border-transparent text-black' : 'bg-[#1c1c1e] border-[#2c2c2e] text-[#8e8e93]'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#1c1c1e]" />
              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>System Prompt Architecture</span>
                <textarea 
                  value={config.ai_persona_hint}
                  onChange={(e) => setConfig({...config, ai_persona_hint: e.target.value})}
                  placeholder="E.g., Act as a concise corporate representative..."
                  className="w-full p-3.5 text-[14px] h-[90px] resize-none"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>Master Knowledge Base Injector</span>
                <textarea 
                  value={config.kb_text}
                  onChange={(e) => setConfig({...config, kb_text: e.target.value})}
                  placeholder="Paste organizational operational details, calendars, URLs, pricing formulas..."
                  className="w-full p-3.5 text-[14px] h-[120px] resize-none"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE: AUTOMATED WORKFLOWS ── */}
        {activeView === 'workflows' && (
          <div className="space-y-6 pt-10 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[22px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Automated Workflows</h2>
            <div style={solidBlockStyle} className="p-4 space-y-4">
              {renderToggleRow("Smart Follow-up Matrix", "Trigger automated smart follow-ups dynamically if user drops engagement.", config.followup_enabled, (val) => setConfig({...config, followup_enabled: val}))}
              
              {config.followup_enabled && (
                <div className="p-4 rounded-xl bg-[#161618] border border-[#1c1c1e] space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[#8e8e93] text-[12px] font-medium uppercase">Delay (Hours)</span>
                      <input type="number" value={config.followup_delay_h} onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})} className="w-full p-3 text-center font-bold" style={inputSolidStyle} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[#8e8e93] text-[12px] font-medium uppercase">Max Retries</span>
                      <input type="number" value={config.followup_max} onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})} className="w-full p-3 text-center font-bold" style={inputSolidStyle} />
                    </div>
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Inline Bot Invocations", "Allow the automated agent to scan external conversations for quick responsive metrics.", config.invocation_enabled, (val) => setConfig({...config, invocation_enabled: val}))}
              
              {config.invocation_enabled && (
                <div className="p-4 rounded-xl bg-[#161618] border border-[#1c1c1e] space-y-1.5 animate-in fade-in">
                  <span className="text-white text-[14px] font-medium block" style={{ fontFamily: SF }}>Target Name Handlers</span>
                  <input 
                    type="text" 
                    value={config.bot_names}
                    onChange={(e) => setConfig({...config, bot_names: e.target.value})}
                    placeholder="E.g., xblum, agent"
                    className="w-full p-3.5 text-[14px]"
                    style={inputSolidStyle}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAGE: SAFETY & SPAM PROTECTION ── */}
        {activeView === 'safety' && (
          <div className="space-y-6 pt-10 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[22px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Safety & Protection</h2>
            <div style={solidBlockStyle} className="p-4 space-y-4">
              {renderToggleRow("Active Anti-Spam S2S", "Enforce instant scanning to drop harmful advertising or link injection vectors.", config.spam_filter_enabled, (val) => setConfig({...config, spam_filter_enabled: val}))}
              
              {config.spam_filter_enabled && (
                <div className="p-4 rounded-xl bg-[#161618] border border-[#1c1c1e] space-y-2 animate-in fade-in">
                  <span className="text-white text-[13px] font-medium block">Filter Threshold Matrix</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((lvl) => (
                      <button key={lvl} onClick={() => setConfig({...config, spam_sensitivity: lvl})} className={`py-2 rounded-xl text-[13px] font-bold capitalize transition-all border ${config.spam_sensitivity === lvl ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}>{lvl}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Real-time Emergency Dispatch", "Receive critical direct message logs on structural anomalies or lead spikes.", config.urgency_notify, (val) => setConfig({...config, urgency_notify: val}))}
              
              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Humanized Typing Emulation", "Infect artificial generation intervals for a highly organic response rhythm.", config.humanize_enabled, (val) => setConfig({...config, humanize_enabled: val}))}
            </div>
          </div>
        )}

        {/* ── PAGE: ANALYTICS & REPORTS ── */}
        {activeView === 'reports' && (
          <div className="space-y-6 pt-10 animate-in slide-in-from-right duration-200">
            <h2 className="text-white text-[22px] font-bold tracking-tight px-1" style={{ fontFamily: SFD }}>Analytics Diagnostics</h2>
            <div style={solidBlockStyle} className="p-4 space-y-4">
              {renderToggleRow("24-Hour Metrics Digest", "Receive structured performance reports summary delivered directly to your logs every cycle.", config.daily_digest, (val) => setConfig({...config, daily_digest: val}))}
              
              {config.daily_digest && (
                <div className="p-4 rounded-xl bg-[#161618] border border-[#1c1c1e] flex items-center justify-between animate-in fade-in">
                  <span className="text-white text-[14px] font-medium" style={{ fontFamily: SF }}>Dispatch Window (UTC)</span>
                  <select 
                    value={config.daily_digest_hour}
                    onChange={(e) => setConfig({...config, daily_digest_hour: parseInt(e.target.value) || 0})}
                    className="bg-[#1c1c1e] text-white font-bold px-3 py-2 rounded-xl border border-[#2c2c2e] outline-none text-[14px]"
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

      {/* ── PERSISTENT ACTIONS FLOORBAR (Only displayed inside sub-pages) ── */}
      {activeView !== 'main' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
          <div className="flex gap-3 max-w-md mx-auto pointer-events-auto">
            <button 
              type="button" 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-1 bg-[#33b5f7] text-white font-bold h-[52px] rounded-[14px] text-[16px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: SF }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Apply Changes
            </button>
            <button 
              type="button" 
              onClick={() => setActiveView('main')} 
              className="flex-1 bg-[#1c1c1e] text-[#8e8e93] font-bold h-[52px] rounded-[14px] text-[16px] border border-[#2c2c2e] active:scale-95 transition-all"
              style={{ fontFamily: SF }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
