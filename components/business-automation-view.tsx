"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, Sparkles, ShieldCheck, Bot, 
  Workflow, ChevronDown, ChevronUp, ArrowLeft
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── SÓLID BASE STYLING (Based on Market-View) ──
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

  // ── English UI State based on business_automation.py ──
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

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    integration: true,
    persona: false,
    workflows: false,
    safety: false,
  })

  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // Native BackButton setup
  useEffect(() => {
    const tg = getTg()
    if (tg?.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(onClose)
    }

    const timer = setTimeout(() => setLoading(false), 500)

    return () => {
      if (tg?.BackButton) {
        tg.BackButton.offClick(onClose)
        tg.BackButton.hide()
      }
      clearTimeout(timer)
    }
  }, [onClose])

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
        tg?.showAlert?.("Configuration saved successfully! 🤖")
        onClose()
      } else {
        tg?.showAlert?.("Failed to save configuration.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Row Helpers
  const renderToggleRow = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-b-0 cursor-pointer active:bg-white/[0.02] transition-colors" onClick={() => onChange(!value)}>
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
          className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-out" 
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#33b5f7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar">
        
        {/* ── GIF + Title + Desc (No container, moved down) ── */}
        <div className="flex flex-col items-center text-center pt-16 mb-10">
          <img 
            src={agentGifUrl} 
            alt="Automation Agent" 
            className="w-[130px] h-[130px] object-contain mb-4" 
          />
          <h1 className="text-white text-[24px] font-bold mb-2" style={{ fontFamily: SFD }}>Chat Automation</h1>
          <p className="text-[#8e8e93] text-[14px] max-w-[280px] leading-snug" style={{ fontFamily: SF }}>
            Assign an intelligent agent to handle your interactions automatically.
          </p>
        </div>

        {/* ── Settings Header ── */}
        <div className="px-1 mb-4">
            <h2 className="text-white text-[22px] font-bold tracking-tight" style={{ fontFamily: SFD }}>Settings</h2>
        </div>

        {/* ── Collapsible Categories ── */}
        <div className="space-y-4">

            {/* 1. Bot Integration */}
            <div className="space-y-2">
                <button 
                  onClick={() => toggleSection('integration')}
                  className="w-full flex items-center justify-between px-2 py-1 text-[#8e8e93] active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    <span className="text-[15px] font-semibold" style={{fontFamily: SF}}>Bot Integration</span>
                  </div>
                  {expandedSections.integration ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.integration && (
                  <div style={solidBlockStyle} className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-[#1c1c1e]">
                          <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Bot Username</span>
                          <input 
                              type="text" 
                              placeholder="@username or url" 
                              value={config.bot_username}
                              onChange={(e) => setConfig({...config, bot_username: e.target.value})}
                              className="w-full p-3.5 text-[15px]"
                              style={{ ...inputSolidStyle, fontFamily: SF }}
                          />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-white text-[14px] font-medium px-4 pt-4 pb-2" style={{ fontFamily: SF }}>Chat Access</span>
                          {renderRadioRow("All private chats except exclusions", "everyone", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'everyone'}))}
                          {renderRadioRow("Only selected chats (Whitelist)", "whitelist", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'whitelist'}))}
                      </div>
                  </div>
                )}
            </div>

            {/* 2. AI Persona & Knowledge */}
            <div className="space-y-2">
                <button 
                  onClick={() => toggleSection('persona')}
                  className="w-full flex items-center justify-between px-2 py-1 text-[#8e8e93] active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[15px] font-semibold" style={{fontFamily: SF}}>AI Persona & Knowledge</span>
                  </div>
                  {expandedSections.persona ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.persona && (
                  <div style={solidBlockStyle} className="animate-in fade-in slide-in-from-top-2 duration-200">
                      {renderToggleRow("AI Auto-Reply", "Let the agent process messages automatically powered by Grok 4.1.", config.ai_autoreply_enabled, (val) => setConfig({...config, ai_autoreply_enabled: val}))}
                      
                      <div className="p-4 border-b border-[#1c1c1e]">
                          <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Account Type</span>
                          <div className="grid grid-cols-2 gap-2">
                              {['personal', 'sales', 'support', 'community'].map((uc) => (
                                  <button key={uc} onClick={() => setConfig({...config, use_case: uc})} className={`py-2.5 rounded-xl text-[13px] font-bold capitalize transition-all border ${config.use_case === uc ? 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#33b5f7]' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}>{uc}</button>
                              ))}
                          </div>
                      </div>

                      <div className="p-4 border-b border-[#1c1c1e]">
                          <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Voice & Tone</span>
                          <div className="flex flex-wrap gap-2">
                              {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => (
                                  <button key={t} onClick={() => setConfig({...config, tone: t})} className={`h-[34px] px-4 rounded-full text-[13px] font-medium capitalize transition-all border ${config.tone === t ? 'bg-[#33b5f7] border-transparent text-black' : 'bg-[#1c1c1e] border-[#2c2c2e] text-[#8e8e93]'}`}>{t}</button>
                              ))}
                          </div>
                      </div>

                      <div className="p-4 border-b border-[#1c1c1e]">
                          <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>System Prompt</span>
                          <textarea 
                            value={config.ai_persona_hint}
                            onChange={(e) => setConfig({...config, ai_persona_hint: e.target.value})}
                            placeholder="E.g., Act as a concise technical support agent..."
                            className="w-full p-3.5 text-[14px] h-[80px] resize-none"
                            style={{ ...inputSolidStyle, fontFamily: SF }}
                          />
                      </div>

                      <div className="p-4">
                          <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Knowledge Base Context</span>
                          <textarea 
                            value={config.kb_text}
                            onChange={(e) => setConfig({...config, kb_text: e.target.value})}
                            placeholder="Insert facts, pricing, scheduling links, and operational data..."
                            className="w-full p-3.5 text-[14px] h-[110px] resize-none"
                            style={{ ...inputSolidStyle, fontFamily: SF }}
                          />
                      </div>
                  </div>
                )}
            </div>

            {/* 3. Automated Workflows */}
            <div className="space-y-2">
                <button 
                  onClick={() => toggleSection('workflows')}
                  className="w-full flex items-center justify-between px-2 py-1 text-[#8e8e93] active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Workflow className="w-5 h-5" />
                    <span className="text-[15px] font-semibold" style={{fontFamily: SF}}>Automated Workflows</span>
                  </div>
                  {expandedSections.workflows ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.workflows && (
                  <div style={solidBlockStyle} className="animate-in fade-in slide-in-from-top-2 duration-200">
                      {renderToggleRow("Smart Follow-ups", "Automatically re-engage users who stop responding.", config.followup_enabled, (val) => setConfig({...config, followup_enabled: val}))}
                      
                      {config.followup_enabled && (
                          <div className="p-4 border-b border-[#1c1c1e] bg-[#161618]">
                              <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <span className="text-[#8e8e93] text-[12px] font-medium">Delay (Hours)</span>
                                      <input type="number" value={config.followup_delay_h} onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})} className="w-full p-3 text-center font-bold" style={inputSolidStyle} />
                                  </div>
                                  <div className="space-y-1.5">
                                      <span className="text-[#8e8e93] text-[12px] font-medium">Max Retries</span>
                                      <input type="number" value={config.followup_max} onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})} className="w-full p-3 text-center font-bold" style={inputSolidStyle} />
                                  </div>
                              </div>
                          </div>
                      )}

                      {renderToggleRow("Inline Invocation", "Allow agent to reply when its name is mentioned.", config.invocation_enabled, (val) => setConfig({...config, invocation_enabled: val}))}
                      
                      {config.invocation_enabled && (
                          <div className="p-4 bg-[#161618]">
                              <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Trigger Keywords</span>
                              <input 
                                type="text" 
                                value={config.bot_names}
                                onChange={(e) => setConfig({...config, bot_names: e.target.value})}
                                placeholder="E.g., xblum, assistant"
                                className="w-full p-3.5 text-[14px]"
                                style={inputSolidStyle}
                              />
                          </div>
                      )}
                  </div>
                )}
            </div>

            {/* 4. Safety & Spam Protection */}
            <div className="space-y-2">
                <button 
                  onClick={() => toggleSection('safety')}
                  className="w-full flex items-center justify-between px-2 py-1 text-[#8e8e93] active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[15px] font-semibold" style={{fontFamily: SF}}>Safety & Spam Protection</span>
                  </div>
                  {expandedSections.safety ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {expandedSections.safety && (
                  <div style={solidBlockStyle} className="animate-in fade-in slide-in-from-top-2 duration-200">
                      {renderToggleRow("Active Anti-Spam", "Identify and delete malicious links and ads.", config.spam_filter_enabled, (val) => setConfig({...config, spam_filter_enabled: val}))}
                      
                      {config.spam_filter_enabled && (
                          <div className="p-4 border-b border-[#1c1c1e] bg-[#161618]">
                              <span className="text-white text-[14px] font-medium mb-2 block" style={{ fontFamily: SF }}>Filter Aggressiveness</span>
                              <div className="grid grid-cols-3 gap-2">
                                  {['low', 'medium', 'high'].map((lvl) => (
                                  <button key={lvl} onClick={() => setConfig({...config, spam_sensitivity: lvl})} className={`py-2 rounded-xl text-[13px] font-bold capitalize transition-all border ${config.spam_sensitivity === lvl ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}>{lvl}</button>
                                  ))}
                              </div>
                          </div>
                      )}

                      {renderToggleRow("Emergency Alerts", "Receive DM notifications for critical issues.", config.urgency_notify, (val) => setConfig({...config, urgency_notify: val}))}
                      {renderToggleRow("Humanize Typing", "Simulate typing delays for natural responses.", config.humanize_enabled, (val) => setConfig({...config, humanize_enabled: val}))}
                      {renderToggleRow("Daily Digest", "Receive performance metrics every 24 hours.", config.daily_digest, (val) => setConfig({...config, daily_digest: val}))}
                  </div>
                )}
            </div>

        </div>

      </div>

      {/* ── Floating Action Buttons ── */}
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
            onClick={onClose} 
            className="flex-1 bg-[#1c1c1e] text-[#8e8e93] font-bold h-[52px] rounded-[14px] text-[16px] border border-[#2c2c2e] active:scale-95 transition-all"
            style={{ fontFamily: SF }}
          >
            Discard
          </button>
        </div>
      </div>

    </div>
  )
}
