"use client"

import React, { useState, useEffect } from "react"
import { 
  Briefcase, Save, X, Shield, Cpu, Sparkles, Loader2, 
  ChevronRight, ArrowLeft, Bot, Link2, Settings, Power, 
  MessageSquare, BellRing, History, ShieldAlert
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILOS LIQUID GLASS (MARKET VIEW) ──
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

const accentBlue = "#33b5f7"

interface BusinessAutomationViewProps {
  onClose: () => void
  apiBaseUrl?: string
  // La ruta ahora apunta a tu carpeta public por defecto
  agentGifUrl?: string 
}

export function BusinessAutomationView({ 
  onClose, 
  apiBaseUrl = "", 
  agentGifUrl = "/agent-robot.gif" 
}: BusinessAutomationViewProps) {
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeView, setActiveView] = useState<'main' | 'personal' | 'spam' | 'persona' | 'connection'>('main')
  const [personaSubTab, setPersonaSubTab] = useState<'core' | 'tone' | 'kb'>('core')

  const [config, setConfig] = useState({
    connected: true,
    connection_id: "7820194",
    greeting_enabled: false,
    greeting_text: "",
    ai_autoreply_enabled: false,
    ai_persona_hint: "",
    use_case: "personal",
    kb_text: "",
    tone: "adaptive",
    spam_filter_enabled: true,
    spam_sensitivity: "medium",
    followup_enabled: false,
    auto_reply_filter: "everyone"
  })

  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

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
        console.error(err) 
      } finally { 
        setLoading(false) 
      }
    }
    loadConfig()
  }, [apiBaseUrl])

  const handleSave = async () => {
    setSaving(true)
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      const res = await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config: config })
      })
      if (res.ok) {
        tg?.showAlert?.("Configuration saved successfully! 🤖")
        setActiveView('main')
      }
    } catch (err) { 
      console.error(err) 
    } finally { 
      setSaving(false) 
    }
  }

  const renderToggle = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between p-4 border-b border-white/[0.04] last:border-b-0 cursor-pointer transition-colors hover:bg-white/[0.02]" onClick={() => onChange(!value)}>
      <div className="flex flex-col pr-4 flex-1">
        <span className="text-white font-semibold text-[15px] tracking-tight" style={{ fontFamily: SF }}>{label}</span>
        {subLabel && <span className="text-[#8e8e93] text-[12px] mt-0.5 leading-normal">{subLabel}</span>}
      </div>
      <button 
        type="button"
        className="shrink-0 w-[50px] h-[28px] rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none"
        style={{ backgroundColor: value ? accentBlue : "rgba(255,255,255,0.1)" }}
      >
        <div 
          className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out" 
          style={{ transform: value ? "translateX(22px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )

  const renderCategoryButton = (label: string, icon: React.ReactNode, view: typeof activeView, stats?: string) => (
    <button 
      onClick={() => setActiveView(view)}
      className="w-full p-4 flex items-center justify-between border-b border-white/[0.04] active:bg-white/[0.03] transition-colors focus:outline-none"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ ...cardLiquidGlassStyle, border: "none" }}>
          {icon}
        </div>
        <span className="text-white font-semibold text-[16px]" style={{ fontFamily: SF }}>{label}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {stats && <span className="text-[#8e8e93] text-[14px] font-medium">{stats}</span>}
        <ChevronRight className="w-5 h-5 text-[#3c3c3e]" />
      </div>
    </button>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#33b5f7] animate-spin mb-3" />
        <p className="text-[#8e8e93] text-[14px] font-medium" style={{ fontFamily: SF }}>Building Neural Interface...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#0a0a0b] flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* ── HEADER SUPERIOR ── */}
      <div className="relative z-10 px-5 pt-6 pb-4 border-b border-white/[0.04] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeView !== 'main' && (
            <button onClick={() => setActiveView('main')} className="text-white/70 active:scale-95 transition-transform p-1 mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold text-white tracking-tight leading-none" style={{ fontFamily: SFD }}>
              {activeView === 'main' ? "Business Agent" : "Configuration"}
            </h1>
            {activeView === 'main' && <span className="text-[#8e8e93] text-[12px] font-medium mt-1">ID: {config.connection_id}</span>}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-white/[0.06] flex items-center justify-center text-white/70 active:scale-95">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── CUERPO PRINCIPAL / NAVEGACIÓN ── */}
      <div className="flex-1 overflow-y-auto relative z-10 no-scrollbar">

        {/* ── VISTA PRINCIPAL (GIF + LISTA) ── */}
        {activeView === 'main' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300 pb-10">
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 min-h-[300px]">
              <div className="relative">
                <div className="w-[190px] h-[190px] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)] border border-white/[0.08] overflow-hidden bg-[#0d0d0f]">
                    <img 
                        src={agentGifUrl} 
                        alt="Agent Animation" 
                        className="w-[85%] h-[85%] object-contain" 
                    />
                </div>
                <div className="absolute top-[5px] right-[5px] w-9 h-9 rounded-full flex items-center justify-center bg-[#10b981] border-[4px] border-[#0a0a0b] shadow-lg animate-pulse">
                    <Power className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-white font-medium text-[15px] text-center max-w-[240px]" style={{ fontFamily: SF }}>Neural agent monitoring your business 24/7</p>
            </div>

            <div className="border-y border-white/[0.04] bg-black/20">
              {renderCategoryButton("Smart Auto-Reply", <MessageSquare className="w-5 h-5 text-blue-400" />, 'personal', config.ai_autoreply_enabled ? "ON" : "OFF")}
              {renderCategoryButton("Shield & Security", <ShieldAlert className="w-5 h-5 text-red-400" />, 'spam', config.spam_sensitivity)}
              {renderCategoryButton("Identity & Tone", <Sparkles className="w-5 h-5 text-amber-400" />, 'persona', config.tone)}
              {renderCategoryButton("Account Status", <Settings className="w-5 h-5 text-neutral-400" />, 'connection')}
            </div>

            <div className="mt-5 border-y border-white/[0.04] bg-black/40">
                {renderToggle(
                    "Master Switch", 
                    "Agent is globally active across your business chats", 
                    config.ai_autoreply_enabled, 
                    (val) => setConfig({ ...config, ai_autoreply_enabled: val })
                )}
            </div>
          </div>
        )}

        {/* ── VISTA DETALLE: IDENTITY & TONE (Ejemplo) ── */}
        {activeView === 'persona' && (
          <div className="space-y-6 p-5 pb-32 animate-in slide-in-from-bottom duration-300">
            {/* Sub-Tabs */}
            <div className="w-full flex items-center p-1 overflow-x-auto no-scrollbar gap-1" style={{ ...liquidGlassStyle, borderRadius: "100px", height: "42px" }}>
              {(['core', 'tone', 'kb'] as const).map((tab) => {
                const isActive = personaSubTab === tab
                const labels = { core: 'Logic', tone: 'Emotional', kb: 'Knowledge' }
                return (
                  <button key={tab} onClick={() => setPersonaSubTab(tab)} className="relative flex items-center justify-center rounded-full flex-1 h-full px-3 transition-all duration-300 focus:outline-none">
                    <span className={`text-[13px] transition-colors ${isActive ? "font-bold text-[#33b5f7]" : "font-semibold text-white/60"}`}>{labels[tab]}</span>
                  </button>
                )
              })}
            </div>

            {/* Contenido: Core/Logic */}
            {personaSubTab === 'core' && (
                <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] flex flex-col overflow-hidden">
                    {renderToggle("Auto-Pilot", "AI handles all Stage-2 responses", config.ai_autoreply_enabled, (val) => setConfig({ ...config, ai_autoreply_enabled: val }))}
                    {renderToggle("Follow-ups", "Queue automatic re-engagement", config.followup_enabled, (val) => setConfig({ ...config, followup_enabled: val }))}
                </div>
            )}
            
            {/* Contenido: Tone */}
            {personaSubTab === 'tone' && (
                <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-5">
                  <label className="text-white font-semibold text-[15px] block mb-4" style={{ fontFamily: SF }}>Tone Matrix</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['adaptive', 'casual', 'formal', 'urgent', 'empathetic'].map((t) => (
                        <button 
                          key={t} 
                          onClick={() => setConfig({ ...config, tone: t })} 
                          className={`py-3 rounded-xl font-bold text-[13px] capitalize border transition-all ${config.tone === t ? 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#33b5f7]' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}
                        >
                          {t}
                        </button>
                    ))}
                  </div>
                </div>
            )}
            
            {/* Contenido: Knowledge Base */}
            {personaSubTab === 'kb' && (
                <div className="bg-[#111111]/90 border border-white/[0.04] rounded-[24px] p-5">
                  <label className="text-white font-semibold text-[15px] block mb-3" style={{ fontFamily: SF }}>Memory Input (KB)</label>
                  <textarea 
                    value={config.kb_text} 
                    onChange={(e) => setConfig({ ...config, kb_text: e.target.value })} 
                    placeholder="Inject pricing, links, or facts..." 
                    className="w-full bg-[#1c1c1e] border border-white/[0.04] rounded-xl p-4 text-white text-[14px] h-[220px] resize-none focus:outline-none" 
                  />
                </div>
            )}
          </div>
        )}

        {/* ── PLACEHOLDERS PARA OTRAS VISTAS (Personal, Spam, Connection) ── */}
        {['personal', 'spam', 'connection'].includes(activeView) && (
            <div className="p-12 text-center animate-in slide-in-from-bottom duration-300">
                <div className="w-16 h-16 bg-[#1c1c1e] rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Settings className="w-8 h-8 text-[#33b5f7]/40" />
                </div>
                <p className="text-white font-bold text-[18px] capitalize" style={{ fontFamily: SFD }}>{activeView} Matrix</p>
                <p className="text-[#8e8e93] text-[14px] mt-2 leading-relaxed" style={{ fontFamily: SF }}>
                  Secure module configuration encrypted in the cloud. Ready to sync with business_automation pipeline.
                </p>
            </div>
        )}

      </div>

      {/* ── BOTONES FLOTANTES MARKET-STYLE (SOLO EN DETALLES) ── */}
      {activeView !== 'main' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-5 bg-gradient-to-t from-black via-black/90 to-transparent pt-10">
          <div className="flex gap-3 max-w-md mx-auto">
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-1 bg-[#3b82f6] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-transform"
              style={{ fontFamily: SF }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
            <button 
              onClick={() => setActiveView('main')} 
              className="flex-1 bg-[#1c1c1e] text-[#33b5f7] font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 border border-[#2c2c2e] active:scale-95 transition-transform"
              style={{ fontFamily: SF }}
            >
              Cancel
            </button>
          </div>
          <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 5px)" }} />
        </div>
      )}

    </div>
  )
}
