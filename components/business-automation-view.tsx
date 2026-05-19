"use client"

import React, { useState, useEffect } from "react"
import { 
  Loader2, Save, Sparkles, Shield, Cpu, HelpCircle, 
  MessageSquare, ShieldAlert, Bot, Settings, Zap, Clock, 
  Eye, Check, ChevronDown, ChevronUp
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILOS BASE SÓLIDOS DE TU MARKET-VIEW (ESTILO SHEET DETAIL / PLACE BID) ──
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
  
  // Secciones colapsables para organizar de manera clara y no enredada
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    ai: true,
    advanced: false,
    security: false,
  })

  // ── CAMPOS DE CONFIGURACIÓN ORIGINALES PARA TU PIPELINE DE DOS ETAPAS ──
  const [config, setConfig] = useState({
    bot_username: "",
    auto_reply_filter: "everyone", // everyone | whitelist
    ai_autoreply_enabled: true,
    use_case: "personal", // personal | sales | support | community
    tone: "adaptive", // adaptive | casual | formal | empathetic
    ai_persona_hint: "",
    kb_text: "",
    spam_filter_enabled: true,
    spam_sensitivity: "medium", // low | medium | high
    urgency_notify: true,
    humanize_enabled: true,
    humanize_speed: "normal", // fast | normal | slow
    followup_enabled: false,
    followup_delay_h: 24,
    followup_max: 2,
    followup_text: "",
    invocation_enabled: true,
    bot_names: "xblum, blum",
    daily_digest: false,
    daily_digest_hour: 9
  })

  // Obtener la instancia nativa de Telegram WebApp
  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // Configuración del botón Back nativo de Telegram y carga de datos
  useEffect(() => {
    const tg = getTg()
    if (tg?.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(onClose)
    }

    // Simulación de carga fluida desde backend
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
        tg?.showAlert?.("¡Configuración del agente guardada correctamente! 🤖")
        onClose()
      } else {
        tg?.showAlert?.("Error al guardar la configuración.")
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

  // Row de Toggle con Estilo Sólido Dark (Market View Style)
  const renderToggleRow = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] last:border-b-0 cursor-pointer" onClick={() => onChange(!value)}>
      <div className="flex flex-col pr-4 flex-1">
        <span className="text-white font-semibold text-[15px] tracking-tight" style={{ fontFamily: SF }}>{label}</span>
        {subLabel && <span className="text-[#8e8e93] text-[12px] mt-1 leading-normal">{subLabel}</span>}
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

  // Selector de Radio Circular Nativo Sólido
  const renderRadioRow = (label: string, uniqueKey: string, currentVal: string, onClick: () => void) => {
    const isSelected = currentVal === uniqueKey
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 active:bg-white/[0.02] transition-colors text-left border-b border-[#1c1c1e] last:border-b-0"
      >
        <span className={`text-[16px] ${isSelected ? 'text-white font-medium' : 'text-[#8e8e93]'}`} style={{ fontFamily: SF }}>
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
      
      {/* CUERPO CON SCROLL (No hay header custom, se usa el back de Telegram) */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar pb-36 pt-6 space-y-5">
        
        {/* ── ILUSTRACIÓN GIF & RESUMEN DE ENTRADA ── */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-[110px] h-[110px] flex items-center justify-center mb-3">
            <img 
              src={agentGifUrl} 
              alt="Agent Workflow" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white text-[22px] font-bold mb-1" style={{ fontFamily: SFD }}>
            Automatización de Agente
          </h1>
          <p className="text-[#8e8e93] text-[14px] text-center max-w-[290px] leading-snug" style={{ fontFamily: SF }}>
            Asigna flujos automáticos de atención a tus conversaciones privadas de negocio.
          </p>
        </div>

        {/* ── CATEGORÍA 1: CORE INFRAESTRUCTURA Y VÍNCULO ── */}
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => toggleSection('core')}
            className="w-full flex items-center justify-between px-1 text-[#8e8e93] text-[12px] uppercase font-bold tracking-wider focus:outline-none"
            style={{ fontFamily: SF }}
          >
            <span>01 • Conexión & Cobertura</span>
            {expandedSections.core ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.core && (
            <div style={solidBlockStyle} className="p-4 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Bot Autorizado</span>
                <input 
                  type="text" 
                  placeholder="@UsernameDelBot o URL" 
                  value={config.bot_username}
                  onChange={(e) => setConfig({...config, bot_username: e.target.value})}
                  className="w-full p-3.5 text-[15px]"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>
              
              <div className="border-t border-[#1c1c1e] pt-3 space-y-2">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Filtro de Chats Entrantes</span>
                <div className="border border-[#1c1c1e] rounded-xl overflow-hidden bg-black/40">
                  {renderRadioRow("Todos los chats excepto excluidos", "everyone", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'everyone'}))}
                  {renderRadioRow("Solo chats seleccionados (Whitelist)", "whitelist", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'whitelist'}))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── CATEGORÍA 2: MOTOR DE IA Y PERSONALIDAD ── */}
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => toggleSection('ai')}
            className="w-full flex items-center justify-between px-1 text-[#8e8e93] text-[12px] uppercase font-bold tracking-wider focus:outline-none"
            style={{ fontFamily: SF }}
          >
            <span>02 • Inteligencia & Respuestas</span>
            {expandedSections.ai ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.ai && (
            <div style={solidBlockStyle} className="p-4 space-y-4 animate-in fade-in duration-200">
              {renderToggleRow("Auto-Piloto (Stage-2)", "Responde de forma autónoma usando LLMs premium", config.ai_autoreply_enabled, (val) => setConfig({...config, ai_autoreply_enabled: val}))}
              
              <div className="h-[1px] bg-[#1c1c1e]" />

              {/* Selector de Casilla de Arquitectura */}
              <div className="space-y-2">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Arquitectura del Canal</span>
                <div className="grid grid-cols-2 gap-2">
                  {['personal', 'sales', 'support', 'community'].map((uc) => {
                    const isSelected = config.use_case === uc
                    return (
                      <button
                        key={uc}
                        type="button"
                        onClick={() => setConfig({...config, use_case: uc})}
                        className={`py-2.5 rounded-xl text-[13px] font-bold capitalize border transition-all ${isSelected ? 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#33b5f7]' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}
                      >
                        {uc}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-[#1c1c1e]" />

              {/* Registro de Tono */}
              <div className="space-y-2">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Matriz de Tono Emocional</span>
                <div className="flex flex-wrap gap-1.5">
                  {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => {
                    const isSelected = config.tone === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setConfig({...config, tone: t})}
                        className={`h-[32px] px-4 rounded-full text-[12px] font-bold capitalize border transition-all ${isSelected ? 'bg-[#33b5f7] border-transparent text-black' : 'bg-[#1c1c1e] border-[#2c2c2e] text-[#8e8e93]'}`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-[#1c1c1e]" />

              {/* Campos de Entrada Extendida */}
              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Instrucciones del Sistema (Prompt)</span>
                <textarea 
                  value={config.ai_persona_hint}
                  onChange={(e) => setConfig({...config, ai_persona_hint: e.target.value})}
                  placeholder="Ej: Sé conciso, actúa como soporte técnico de la app..."
                  className="w-full p-3.5 text-[14px] h-[80px] resize-none"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Base de Conocimiento Maestra (KB Context)</span>
                <textarea 
                  value={config.kb_text}
                  onChange={(e) => setConfig({...config, kb_text: e.target.value})}
                  placeholder="Ingresa precios, links de agendamiento y datos operativos estables..."
                  className="w-full p-3.5 text-[14px] h-[110px] resize-none"
                  style={{ ...inputSolidStyle, fontFamily: SF }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── CATEGORÍA 3: AUTOMATIZACIÓN AVANZADA Y RE-ENGAGEMENT ── */}
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => toggleSection('advanced')}
            className="w-full flex items-center justify-between px-1 text-[#8e8e93] text-[12px] uppercase font-bold tracking-wider focus:outline-none"
            style={{ fontFamily: SF }}
          >
            <span>03 • Bucles & Automatización Fija</span>
            {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.advanced && (
            <div style={solidBlockStyle} className="p-4 space-y-4 animate-in fade-in duration-200">
              {renderToggleRow("Smart Follow-ups", "Lanza recordatorios inteligentes si el usuario se enfría", config.followup_enabled, (val) => setConfig({...config, followup_enabled: val}))}
              
              {config.followup_enabled && (
                <div className="grid grid-cols-2 gap-3 pt-1 border border-[#1c1c1e] p-3 rounded-xl bg-black/20 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <span className="text-[#8e8e93] text-[11px] font-bold block uppercase">Bucle (Horas)</span>
                    <input 
                      type="number" 
                      value={config.followup_delay_h}
                      onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})}
                      className="w-full p-2.5 text-center font-bold"
                      style={inputSolidStyle}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#8e8e93] text-[11px] font-bold block uppercase">Intentos Max</span>
                    <input 
                      type="number" 
                      value={config.followup_max}
                      onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})}
                      className="w-full p-2.5 text-center font-bold"
                      style={inputSolidStyle}
                    />
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[#1c1c1e]" />

              {renderToggleRow("Invocación por Nombre (Inline)", "Activa la escucha pasiva del bot con su nombre en chats ajenos", config.invocation_enabled, (val) => setConfig({...config, invocation_enabled: val}))}
              
              {config.invocation_enabled && (
                <div className="space-y-1.5 pt-1 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-white text-[13px] font-medium block">Nombres / Triggers válidos</span>
                  <input 
                    type="text" 
                    value={config.bot_names}
                    onChange={(e) => setConfig({...config, bot_names: e.target.value})}
                    className="w-full p-3 text-[14px]"
                    style={inputSolidStyle}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CATEGORÍA 4: FILTROS DE SEGURIDAD Y PRESTACIONES ── */}
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => toggleSection('security')}
            className="w-full flex items-center justify-between px-1 text-[#8e8e93] text-[12px] uppercase font-bold tracking-wider focus:outline-none"
            style={{ fontFamily: SF }}
          >
            <span>04 • Escudos, Reportes & Mitigación</span>
            {expandedSections.security ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.security && (
            <div style={solidBlockStyle} className="p-4 space-y-4 animate-in fade-in duration-200">
              {renderToggleRow("Filtro Activo Anti-Spam S2S", "Borra anuncios, enlaces sospechosos o estafas", config.spam_filter_enabled, (val) => setConfig({...config, spam_filter_enabled: val}))}
              
              {config.spam_filter_enabled && (
                <div className="space-y-2 border border-[#1c1c1e] p-3 rounded-xl bg-black/20 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[#8e8e93] text-[11px] font-bold block uppercase">Agresividad del Escudo</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setConfig({...config, spam_sensitivity: lvl})}
                        className={`py-2 rounded-lg text-[12px] font-bold capitalize border transition-all ${config.spam_sensitivity === lvl ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1c1c1e] border-transparent text-[#8e8e93]'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Notificación Inmediata por Riesgo", "Envía una alerta a tu canal de logs privado ante un mensaje crítico", config.urgency_notify, (val) => setConfig({...config, urgency_notify: val}))}
              
              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Humanización Dinámica de Ritmo", "Simula pausas de escritura para que la respuesta no sea instantánea", config.humanize_enabled, (val) => setConfig({...config, humanize_enabled: val}))}

              <div className="h-[1px] bg-[#1c1c1e]" />
              {renderToggleRow("Informes Estructurados Diarios", "Genera un reporte de métricas cada 24 horas", config.daily_digest, (val) => setConfig({...config, daily_digest: val}))}
            </div>
          )}
        </div>

      </div>

      {/* ── ACCIONES BASE DEL CUADRO (ESTILO MARKET-VIEW PLACE BID SHEET FIJO) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#33b5f7] text-white font-bold h-[52px] rounded-[14px] text-[16px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: SF }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Aplicar Cambios
          </button>
          <button 
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-[#1c1c1e] text-[#8e8e93] font-bold h-[52px] rounded-[14px] text-[16px] border border-[#2c2c2e] active:scale-95 transition-all"
            style={{ fontFamily: SF }}
          >
            Descartar
          </button>
        </div>
        <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 5px)" }} />
      </div>

    </div>
  )
}
