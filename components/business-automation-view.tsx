"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { 
  Briefcase, Save, X, Shield, Cpu, Sparkles, Loader2, 
  ChevronDown, ChevronUp, SlidersHorizontal, Info, 
  Sliders, MessageSquare, AlertTriangle, Clock, ShieldAlert,
  Zap, Volume2, UserCheck, Eye, EyeOff, Settings, ListFilter
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── CONSTANTES DE ESTILO LIQUID GLASS REAL (DE MARKET-VIEW) ──
const liquidGlassStyle = {
  background: "rgba(30, 30, 30, 0.35)", 
  backdropFilter: "blur(24px) saturate(200%) brightness(1.1)", 
  WebkitBackdropFilter: "blur(24px) saturate(200%) brightness(1.1)",
  border: "1px solid rgba(255, 255, 255, 0.12)", 
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.2)",
  transform: "translateZ(0)", 
  WebkitTransform: "translateZ(0)",
}

const cardLiquidGlassStyle = {
  background: "rgba(42, 42, 44, 0.45)", 
  backdropFilter: "blur(16px) saturate(160%) brightness(1.05)", 
  WebkitBackdropFilter: "blur(16px) saturate(160%) brightness(1.05)",
  border: "1px solid rgba(255, 255, 255, 0.08)", 
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)", 
  transform: "translateZ(0)", 
  WebkitTransform: "translateZ(0)",
  willChange: "transform", 
}

const activeAccentBlue = "#33b5f7"
const activeAccentPurple = "#a855f7"

interface BusinessAutomationViewProps {
  onClose: () => void
  apiBaseUrl?: string
}

export function BusinessAutomationView({ onClose, apiBaseUrl = "" }: BusinessAutomationViewProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<'core' | 'persona' | 'security' | 'advanced'>('core')
  
  // ── ESTADO INTEGRAL CONFIGURADO SEGÚN BUSINESS_AUTOMATION ITER-2 ──
  const [config, setConfig] = useState({
    connected: true,
    connection_id: "",
    greeting_enabled: false,
    greeting_text: "",
    away_enabled: false,
    away_text: "",
    away_schedule: "always",
    away_offline_only: true,
    away_start_ts: 0,
    away_end_ts: 0,
    weekly_schedule: "",
    ai_autoreply_enabled: false,
    ai_persona_hint: "",
    use_case: "personal",
    kb_text: "",
    tone: "adaptive",
    invocation_enabled: true,
    bot_names: "xblum, blum",
    humanize_enabled: true,
    humanize_speed: "normal",
    spam_filter_enabled: true,
    spam_sensitivity: "medium",
    // Iteration 2 Fields
    followup_enabled: false,
    followup_delay_h: 24,
    followup_max: 2,
    followup_text: "",
    daily_digest: false,
    daily_digest_hour: 9,
    auto_reply_filter: "everyone",
    urgency_notify: true
  })

  // Obtener instancia de Telegram WebApp
  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // Cargar datos desde el Servidor FastAPI
  useEffect(() => {
    async function loadConfig() {
      setLoading(true)
      try {
        const tg = getTg()
        const initData = tg?.initData ?? ""
        const url = `${apiBaseUrl}/api/business_config_v2?initData=${encodeURIComponent(initData)}`
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setConfig(prev => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error("[BusinessAutomation] Error loading config:", err)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [apiBaseUrl])

  // Manejo del Botón de Retroceso Nativo de Telegram
  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    tg.BackButton.show()
    const handleBack = () => {
      onClose()
    }
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [onClose])

  // Guardar datos en el backend seguro
  const handleSave = async () => {
    setSaving(true)
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      
      const res = await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          config: config
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          tg?.showAlert?.("Business automation config updated successfully! 🤖")
          onClose()
        }
      }
    } catch (err) {
      console.error("[BusinessAutomation] Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  // Helper para renderizar Toggles Premium con animación fluida
  const renderToggle = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void, accentColor = activeAccentBlue) => (
    <div className="flex items-center justify-between p-3.5 border-b border-white/[0.04] last:border-b-0">
      <div className="flex flex-col pr-4">
        <span className="text-white font-semibold text-[15px] tracking-tight" style={{ fontFamily: SF }}>{label}</span>
        <span className="text-[#8e8e93] text-[12px] mt-0.5 leading-normal">{subLabel}</span>
      </div>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className="shrink-0 w-[50px] h-[28px] rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none"
        style={{ backgroundColor: value ? accentColor : "rgba(255,255,255,0.1)" }}
      >
        <div 
          className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out" 
          style={{ transform: value ? "translateX(22px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#33b5f7] animate-spin mb-3" />
        <p className="text-[#8e8e93] text-[14px] font-medium" style={{ fontFamily: SF }}>Loading automation matrix...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0a0b] flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* Glows de Fondo Estilo Liquid Glass */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[40%] pointer-events-none z-0 bg-gradient-to-br from-[#3b82f6]/10 to-transparent blur-[60px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[40%] pointer-events-none z-0 bg-gradient-to-tr from-[#a855f7]/10 to-transparent blur-[60px]" />

      {/* ── HEADER SUPERIOR ── */}
      <div className="relative z-10 px-5 pt-6 pb-4 border-b border-white/[0.04] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20 shadow-inner">
            <Briefcase className="w-5 h-5 text-[#33b5f7]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold text-white tracking-tight leading-none" style={{ fontFamily: SFD }}>Business Agent</h1>
            <span className="text-[#8e8e93] text-[11px] font-medium mt-1 uppercase tracking-wider">Pipeline Stage 1 & 2</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/[0.06] flex items-center justify-center text-white/70 active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── SUB-BARRA DE NAVEGACIÓN SELECTORA (ESTILO LIQUID GLASS PILL) ── */}
      <div className="px-5 pt-4 pb-2 relative z-10 shrink-0">
        <div className="w-full flex items-center p-1 overflow-x-auto no-scrollbar gap-1" style={{ ...liquidGlassStyle, borderRadius: "100px", height: "42px" }}>
          {(['core', 'persona', 'security', 'advanced'] as const).map((tab) => {
            const isActive = activeSubTab === tab
            const labels = { core: 'Core', persona: 'AI Persona', security: 'Security', advanced: 'Advanced' }
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className="relative flex items-center justify-center rounded-full flex-1 h-full px-3 transition-all duration-300 focus:outline-none whitespace-nowrap"
                style={{
                  background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" : "none"
                }}
              >
                <span 
                  className={`text-[12px] transition-colors duration-200 ${isActive ? "font-bold text-[#33b5f7]" : "font-semibold text-white/60"}`}
                  style={{ fontFamily: SF }}
                >
                  {labels[tab]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CUERPO CENTRAL DE CONFIGURACIÓN ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-32 relative z-10 space-y-5 no-scrollbar">
        
        {/* PANEL: CORE CONFIG (PIPELINE, STATUS Y GESTIÓN) */}
        {activeSubTab === 'core' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Status Card */}
            <div className="p-4 rounded-[24px] flex items-center justify-between shadow-xl" style={cardLiquidGlassStyle}>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[16px] tracking-tight" style={{ fontFamily: SFD }}>Pipeline Routing</span>
                <span className="text-[#8e8e93] text-[12px] mt-0.5">Auto-Reply via Stage-2 Core Processing</span>
              </div>
              <button 
                type="button"
                onClick={() => setConfig({ ...config, ai_autoreply_enabled: !config.ai_autoreply_enabled })}
                className="px-5 py-2 rounded-full text-[13px] font-bold transition-all active:scale-95 shadow-md"
                style={{ 
                  background: config.ai_autoreply_enabled ? "linear-gradient(135deg, #0284c7, #0369a1)" : "#1c1c1e",
                  color: config.ai_autoreply_enabled ? "#ffffff" : "#8e8e93",
                  border: config.ai_autoreply_enabled ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                {config.ai_autoreply_enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            {/* Use Case Array Selector */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm">
              <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-3 ml-1" style={{ fontFamily: SF }}>Account Architecture (Use Case)</label>
              <div className="grid grid-cols-2 gap-2">
                {['personal', 'sales', 'assistant', 'community', 'support'].map((uc) => {
                  const isSelected = config.use_case === uc
                  return (
                    <button
                      key={uc}
                      type="button"
                      onClick={() => setConfig({ ...config, use_case: uc })}
                      className={`py-3 px-4 rounded-xl font-semibold text-[13px] text-center capitalize transition-all border ${
                        isSelected 
                          ? 'bg-[#3b82f6]/10 text-[#33b5f7] border-[#3b82f6]/40 shadow-[0_0_12px_rgba(59,130,246,0.1)]' 
                          : 'bg-[#1c1c1e]/60 border-transparent text-[#8e8e93]'
                      }`}
                      style={{ fontFamily: SF }}
                    >
                      {uc}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Routing Filter Select */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm">
              <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-2.5 ml-1" style={{ fontFamily: SF }}>Auto-Reply Filter Target</label>
              <div className="space-y-2">
                {[
                  { id: 'everyone', label: 'Everyone', desc: 'Trigger AI for all incoming business messages' },
                  { id: 'new_contacts', label: 'New Contacts Only', desc: 'Only reply to first-time interactions' },
                  { id: 'whitelist', label: 'Whitelist Mode', desc: 'Restrict replies to custom database whitelist' },
                  { id: 'blacklist_exclude', label: 'Blacklist Exclude', desc: 'Reply to all except blacklisted contacts' }
                ].map((item) => {
                  const isSelected = config.auto_reply_filter === item.id
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setConfig({ ...config, auto_reply_filter: item.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected ? 'bg-black/40 border-[#3b82f6]/40' : 'bg-[#1c1c1e]/40 border-transparent'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#33b5f7]' : 'border-neutral-600'}`}>
                        {isSelected && <div className="w-2 h-2 bg-[#33b5f7] rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[14px] font-semibold ${isSelected ? 'text-white' : 'text-neutral-400'}`} style={{ fontFamily: SF }}>{item.label}</span>
                        <span className="text-[#8e8e93] text-[11px] mt-0.5 leading-normal">{item.desc}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: AI PERSONA & KNOWLEDGE BASE */}
        {activeSubTab === 'persona' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Tone Selector Segmented Control */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm">
              <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-3 ml-1" style={{ fontFamily: SF }}>Emotional Tone Register</label>
              <div className="flex flex-wrap gap-1.5">
                {['adaptive', 'casual', 'formal', 'urgent', 'empathetic'].map((t) => {
                  const isSelected = config.tone === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setConfig({ ...config, tone: t })}
                      className={`h-[34px] rounded-full px-4 text-[12px] font-bold capitalize transition-all shrink-0 ${
                        isSelected 
                          ? 'bg-[#3b82f6] text-white shadow-sm' 
                          : 'bg-[#1c1c1e] text-[#8e8e93] border border-white/[0.02]'
                      }`}
                      style={{ fontFamily: SF }}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Persona Custom Hint */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 ml-1 text-[#8e8e93]">
                <Sparkles className="w-3.5 h-3.5 text-[#33b5f7]" />
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>AI Persona Instructions</label>
              </div>
              <textarea
                value={config.ai_persona_hint}
                onChange={(e) => setConfig({ ...config, ai_persona_hint: e.target.value })}
                placeholder="Example: Act as a startup founder. Be concise, never use exclamation marks, and emphasize engineering scaling."
                className="w-full bg-[#1c1c1e]/60 border border-white/[0.04] rounded-xl p-3 text-white text-[14px] placeholder:text-neutral-600 focus:outline-none focus:border-[#3b82f6]/40 transition-colors h-[90px] resize-none"
                style={{ fontFamily: SF }}
              />
            </div>

            {/* Knowledge Base Core Text */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 ml-1 text-[#8e8e93]">
                <Cpu className="w-3.5 h-3.5 text-[#33b5f7]" />
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>Knowledge Context (KB Text)</label>
              </div>
              <textarea
                value={config.kb_text}
                onChange={(e) => setConfig({ ...config, kb_text: e.target.value })}
                placeholder="Incorporate facts, pricing, scheduling logic, info or meeting links that the AI must master to answer customer requests accurately."
                className="w-full bg-[#1c1c1e]/60 border border-white/[0.04] rounded-xl p-3 text-white text-[14px] placeholder:text-neutral-600 focus:outline-none focus:border-[#3b82f6]/40 transition-colors h-[140px] resize-none no-scrollbar"
                style={{ fontFamily: SF }}
              />
            </div>
          </div>
        )}

        {/* PANEL: SECURITY & DELAYS (ANTI-SPAM) */}
        {activeSubTab === 'security' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Group Container for Toggles */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] flex flex-col overflow-hidden shadow-sm">
              {renderToggle(
                "Spam Filter S2S", 
                "Identify and delete unsolicited ads or phishing messages", 
                config.spam_filter_enabled, 
                (val) => setConfig({ ...config, spam_filter_enabled: val })
              )}
              {renderToggle(
                "Urgency Owner Notify", 
                "Get private alerts when critical requests are caught by Stage-1", 
                config.urgency_notify, 
                (val) => setConfig({ ...config, urgency_notify: val })
              )}
              {renderToggle(
                "Humanize Delays", 
                "Simulate natural typing actions before answering", 
                config.humanize_enabled, 
                (val) => setConfig({ ...config, humanize_enabled: val })
              )}
            </div>

            {/* Spam Sensitivity Control */}
            {config.spam_filter_enabled && (
              <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm animate-in fade-in duration-300">
                <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-2.5 ml-1" style={{ fontFamily: SF }}>Filter Aggression Matrix</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => {
                    const isSelected = config.spam_sensitivity === level
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfig({ ...config, spam_sensitivity: level })}
                        className={`py-2 px-3 rounded-xl font-bold text-[12px] text-center capitalize transition-all border ${
                          isSelected ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-[#1c1c1e]/60 border-transparent text-[#8e8e93]'
                        }`}
                        style={{ fontFamily: SF }}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Humanize Speed Matrix */}
            {config.humanize_enabled && (
              <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm animate-in fade-in duration-300">
                <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-2.5 ml-1" style={{ fontFamily: SF }}>Typing Simulation Velocity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['fast', 'normal', 'slow'].map((speed) => {
                    const isSelected = config.humanize_speed === speed
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setConfig({ ...config, humanize_speed: speed })}
                        className={`py-2 px-3 rounded-xl font-bold text-[12px] text-center capitalize transition-all border ${
                          isSelected ? 'bg-[#3b82f6]/10 text-[#33b5f7] border-[#3b82f6]/30' : 'bg-[#1c1c1e]/60 border-transparent text-[#8e8e93]'
                        }`}
                        style={{ fontFamily: SF }}
                      >
                        {speed}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL: ADVANCED INFRASTRUCTURE (FOLLOW-UPS & DIGESTS) */}
        {activeSubTab === 'advanced' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {/* Master Flags */}
            <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] flex flex-col overflow-hidden shadow-sm">
              {renderToggle(
                "Smart Follow-ups Queue", 
                "Re-engage cold conversations dynamically over hours", 
                config.followup_enabled, 
                (val) => setConfig({ ...config, followup_enabled: val }),
                activeAccentPurple
              )}
              {renderToggle(
                "Daily Performance Digest", 
                "Receive a structured summary report of the past 24 hours", 
                config.daily_digest, 
                (val) => setConfig({ ...config, daily_digest: val }),
                activeAccentPurple
              )}
              {renderToggle(
                "Inline Invocation Trigger", 
                "Enable 'xBlum' name triggers inside any third-party chat", 
                config.invocation_enabled, 
                (val) => setConfig({ ...config, invocation_enabled: val }),
                activeAccentPurple
              )}
            </div>

            {/* Follow-up Complex Inputs */}
            {config.followup_enabled && (
              <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 space-y-3 animate-in fade-in duration-300 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[#8e8e93] text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1" style={{ fontFamily: SF }}>Delay Loop (Hours)</label>
                    <input 
                      type="number"
                      value={config.followup_delay_h}
                      onChange={(e) => setConfig({ ...config, followup_delay_h: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="bg-[#1c1c1e] text-white font-bold p-3 rounded-xl outline-none text-[14px] border border-white/[0.02]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[#8e8e93] text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1" style={{ fontFamily: SF }}>Max Attempts Ring</label>
                    <input 
                      type="number"
                      value={config.followup_max}
                      onChange={(e) => setConfig({ ...config, followup_max: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="bg-[#1c1c1e] text-white font-bold p-3 rounded-xl outline-none text-[14px] border border-white/[0.02]"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[#8e8e93] text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1" style={{ fontFamily: SF }}>Custom Follow-up Prompt / Text</label>
                  <textarea 
                    value={config.followup_text}
                    onChange={(e) => setConfig({ ...config, followup_text: e.target.value })}
                    placeholder="Leave empty for AI context-aware smart follow-up generation."
                    className="w-full bg-[#1c1c1e]/60 border border-white/[0.04] rounded-xl p-3 text-white text-[13px] h-[70px] resize-none placeholder:text-neutral-600 focus:outline-none"
                    style={{ fontFamily: SF }}
                  />
                </div>
              </div>
            )}

            {/* Custom Bot Names Tag Line */}
            {config.invocation_enabled && (
              <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm animate-in fade-in duration-300">
                <label className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider block mb-2 ml-1" style={{ fontFamily: SF }}>Inline Bot Keywords (Names)</label>
                <input 
                  type="text"
                  value={config.bot_names}
                  onChange={(e) => setConfig({ ...config, bot_names: e.target.value })}
                  placeholder="xblum, blum, assistant (comma separated)"
                  className="w-full bg-[#1c1c1e] border border-white/[0.04] rounded-xl p-3 text-white text-[14px] font-medium outline-none focus:border-[#a855f7]/40 transition-colors"
                  style={{ fontFamily: SF }}
                />
              </div>
            )}

            {/* Daily Digest Execution Hour */}
            {config.daily_digest && (
              <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-4 shadow-sm animate-in fade-in duration-300 flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-white font-semibold text-[15px]" style={{ fontFamily: SF }}>Report Dispatch Hour</span>
                  <span className="text-[#8e8e93] text-[12px] mt-0.5">UTC hour for summary notification</span>
                </div>
                <select 
                  value={config.daily_digest_hour}
                  onChange={(e) => setConfig({ ...config, daily_digest_hour: parseInt(e.target.value) || 0 })}
                  className="bg-[#1c1c1e] text-white font-bold px-3 py-2 rounded-xl outline-none border border-white/[0.04] text-[14px]"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>{h.toString().padStart(2, '0')}:00 UTC</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTONES DE ACCIÓN FLOTANTES (ESTILO MARKET-VIEW ITEM DETALLE) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-5 bg-gradient-to-t from-black via-black/90 to-transparent pt-10">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            type="button" 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none" 
            style={{ fontFamily: SF }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
          <button 
            type="button" 
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#3b82f6] font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e] active:scale-95 shadow-sm focus:outline-none" 
            style={{ fontFamily: SF }}
          >
            Cancel
          </button>
        </div>
        <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 5px)" }} />
      </div>

    </div>
  )
}
