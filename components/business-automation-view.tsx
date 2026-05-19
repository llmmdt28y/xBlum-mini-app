"use client"

import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, Loader2, Save, Sparkles, Shield, Cpu, 
  HelpCircle, MessageSquare, ShieldAlert, Bot, Settings,
  Zap, Clock, Eye
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILO LIQUID GLASS REAL EXTRAÍDO DE TU MARKET-VIEW (PLACE BID / ITEM DETAIL) ──
const liquidGlassContainerStyle = {
  background: "rgba(30, 30, 30, 0.35)", 
  backdropFilter: "blur(24px) saturate(200%) brightness(1.1)", 
  WebkitBackdropFilter: "blur(24px) saturate(200%) brightness(1.1)",
  border: "1px solid rgba(255, 255, 255, 0.12)", 
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.2)",
  borderRadius: "16px",
  overflow: "hidden" as const,
}

const inputGlassStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
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
  
  // ── TODOS LOS PARAMETROS EXIGIDOS POR EL BACKEND (BUSINESS_AUTOMATION.PY) ──
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

  useEffect(() => {
    // Simulación de carga fluida de interfaz
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const tg = (window as any).Telegram?.WebApp
      const initData = tg?.initData ?? ""
      
      const res = await fetch(`${apiBaseUrl}/api/business_config_v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, config })
      })
      
      if (res.ok) {
        tg?.showAlert?.("¡Configuración guardada con éxito! 🤖")
        onClose()
      } else {
        tg?.showAlert?.("Error al guardar la configuración remota.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Helper Switch / Toggle Premium con diseño unificado
  const renderToggleRow = (label: string, subLabel: string, value: boolean, onChange: (val: boolean) => void) => (
    <div className="flex items-center justify-between p-4 border-b border-white/[0.04] last:border-b-0 cursor-pointer" onClick={() => onChange(!value)}>
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

  // Helper Radio Button para la cobertura exacta de chats
  const renderRadioRow = (label: string, uniqueKey: string, currentVal: string, onClick: () => void) => {
    const isSelected = currentVal === uniqueKey
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors text-left border-b border-white/[0.04] last:border-b-0"
      >
        <span className={`text-[16px] ${isSelected ? 'text-white font-medium' : 'text-[#8e8e93]'}`} style={{ fontFamily: SF }}>
          {label}
        </span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#33b5f7]' : 'border-[#545456]'}`}>
          {isSelected && <div className="w-2.5 h-2.5 bg-[#33b5f7] rounded-full" />}
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#33b5f7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="relative z-10 px-4 pt-6 pb-2 flex items-center justify-between border-b border-white/[0.03] bg-black/40 backdrop-blur-md">
        <button onClick={onClose} className="text-white active:opacity-50 transition-opacity flex items-center gap-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white text-[17px] font-bold" style={{ fontFamily: SFD }}>Configuración de Agente</h2>
        <button 
          onClick={handleSave} 
          className="text-[#33b5f7] font-bold text-[16px] active:opacity-50"
          style={{ fontFamily: SF }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar"}
        </button>
      </div>

      {/* ── CUERPO CON SCROLL ── */}
      <div className="flex-1 overflow-y-auto px-5 no-scrollbar pb-36 pt-2 space-y-6">
        
        {/* ── SECCIÓN ANIME GIF (Ajuste idéntico a captura) ── */}
        <div className="flex flex-col items-center mt-4 mb-2">
          <div className="w-[120px] h-[120px] flex items-center justify-center mb-4">
            <img 
              src={agentGifUrl} 
              alt="Chat Automation" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white Republic text-[22px] font-bold mb-1" style={{ fontFamily: SFD }}>
            Automatización de Chat
          </h1>
          <p className="text-[#8e8e93] text-[14px] text-center max-w-[300px] leading-snug" style={{ fontFamily: SF }}>
            Vincula un bot inteligente para delegar respuestas automáticas de Stage-1 y Stage-2.
          </p>
        </div>

        {/* ── BLOQUE 1: IDENTIFICACIÓN DEL BOT ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Credenciales de Conexión</label>
          <div className="p-4" style={liquidGlassContainerStyle}>
            <input 
              type="text" 
              placeholder="@UsernameDelBot o URL de Fragment" 
              value={config.bot_username}
              onChange={(e) => setConfig({...config, bot_username: e.target.value})}
              className="w-full p-3 text-[16px]"
              style={{ ...inputGlassStyle, fontFamily: SF }}
            />
            <p className="text-[#8e8e93] text-[12px] mt-2.5 px-1 leading-normal">
              Este agente responderá de manera autónoma usando el pipeline de dos etapas configurado en tu arquitectura.
            </p>
          </div>
        </div>

        {/* ── BLOQUE 2: COBERTURA DE CHATS (SELECTORES IGUAL A LA IMAGEN) ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Alcance del Bot</label>
          <div style={liquidGlassContainerStyle}>
            {renderRadioRow("Todos los chats privados excepto...", "everyone", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'everyone'}))}
            {renderRadioRow("Solo los chats seleccionados (Whitelist)", "whitelist", config.auto_reply_filter, () => setConfig({...config, auto_reply_filter: 'whitelist'}))}
          </div>
        </div>

        {/* ── BLOQUE 3: INTELIGENCIA Y RESPUESTAS REALS (AI PERSONA) ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Identidad de Inteligencia Artificial</label>
          <div style={liquidGlassContainerStyle} className="p-4 space-y-4">
            
            {renderToggleRow("Habilitar Auto-Piloto Global", "Activa Stage-2 para procesar respuestas de forma fluida", config.ai_autoreply_enabled, (val) => setConfig({...config, ai_autoreply_enabled: val}))}
            
            <div className="h-[1px] bg-white/[0.04]" />

            {/* Selector de Arquitectura de Cuenta */}
            <div className="space-y-2">
              <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Uso de Cuenta</span>
              <div className="grid grid-cols-2 gap-2">
                {['personal', 'sales', 'support', 'community'].map((uc) => (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => setConfig({...config, use_case: uc})}
                    className={`py-2.5 rounded-xl text-[13px] font-bold capitalize transition-all border ${config.use_case === uc ? 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#33b5f7]' : 'bg-white/[0.02] border-transparent text-[#8e8e93]'}`}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.04]" />

            {/* Selector de Registro de Tono Emocional */}
            <div className="space-y-2">
              <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Matriz de Tono</span>
              <div className="flex flex-wrap gap-1.5">
                {['adaptive', 'casual', 'formal', 'empathetic'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setConfig({...config, tone: t})}
                    className={`h-[32px] px-3.5 rounded-full text-[12px] font-bold capitalize transition-all ${config.tone === t ? 'bg-[#33b5f7] text-black' : 'bg-white/[0.04] text-[#8e8e93]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.04]" />

            {/* Instrucciones personalizadas */}
            <div className="space-y-2">
              <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Instrucciones de Personalidad (System Prompt)</span>
              <textarea 
                value={config.ai_persona_hint}
                onChange={(e) => setConfig({...config, ai_persona_hint: e.target.value})}
                placeholder="Ejemplo: Actúa como fundador técnico. Sé conciso y directo, evita usar exclamaciones..."
                className="w-full p-3 text-[14px] h-[80px] resize-none"
                style={{ ...inputGlassStyle, fontFamily: SF }}
              />
            </div>

            {/* Base de conocimiento */}
            <div className="space-y-2">
              <span className="text-white text-[14px] font-semibold block" style={{ fontFamily: SF }}>Base de Conocimiento Maestra (KB)</span>
              <textarea 
                value={config.kb_text}
                onChange={(e) => setConfig({...config, kb_text: e.target.value})}
                placeholder="Inyecta aquí enlaces de reuniones, precios, FAQ, datos operativos clave que la IA deba dominar para responder..."
                className="w-full p-3 text-[14px] h-[120px] resize-none"
                style={{ ...inputGlassStyle, fontFamily: SF }}
              />
            </div>

          </div>
        </div>

        {/* ── BLOQUE 4: SEGUIMIENTOS E INVOCACIONES AVANZADAS ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Bucles y Automatización Avanzada</label>
          <div style={liquidGlassContainerStyle} className="p-4 space-y-4">
            
            {renderToggleRow("Smart Follow-ups", "Re-engancha chats fríos automáticamente", config.followup_enabled, (val) => setConfig({...config, followup_enabled: val}))}
            
            {config.followup_enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[#8e8e93] text-[11px] font-bold block">Retraso (Horas)</span>
                  <input 
                    type="number" 
                    value={config.followup_delay_h}
                    onChange={(e) => setConfig({...config, followup_delay_h: parseInt(e.target.value) || 0})}
                    className="w-full p-2.5 text-center font-bold"
                    style={inputGlassStyle}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[#8e8e93] text-[11px] font-bold block">Intentos Máximos</span>
                  <input 
                    type="number" 
                    value={config.followup_max}
                    onChange={(e) => setConfig({...config, followup_max: parseInt(e.target.value) || 1})}
                    className="w-full p-2.5 text-center font-bold"
                    style={inputGlassStyle}
                  />
                </div>
              </div>
            )}

            <div className="h-[1px] bg-white/[0.04]" />

            {renderToggleRow("Disparador por Nombre (Inline)", "Permite invocar al agente mencionándolo en cualquier chat", config.invocation_enabled, (val) => setConfig({...config, invocation_enabled: val}))}
            
            {config.invocation_enabled && (
              <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                <span className="text-[#8e8e93] text-[11px] font-bold block">Palabras Clave / Nombres</span>
                <input 
                  type="text" 
                  value={config.bot_names}
                  onChange={(e) => setConfig({...config, bot_names: e.target.value})}
                  className="w-full p-2.5"
                  style={inputGlassStyle}
                />
              </div>
            )}

          </div>
        </div>

        {/* ── BLOQUE 5: SEGURIDAD Y FILTRO DE SPAM ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Filtros de Seguridad S2S</label>
          <div style={liquidGlassContainerStyle} className="p-4 space-y-4">
            
            {renderToggleRow("Filtro Anti-Spam Activo", "Detecta y elimina enlaces maliciosos y publicidad", config.spam_filter_enabled, (val) => setConfig({...config, spam_filter_enabled: val}))}
            
            {config.spam_filter_enabled && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <span className="text-white text-[13px] font-semibold block">Agresividad del Filtro</span>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfig({...config, spam_sensitivity: lvl})}
                      className={`py-2 rounded-lg text-[12px] font-bold capitalize transition-all ${config.spam_sensitivity === lvl ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-white/[0.02] text-[#8e8e93]'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-[1px] bg-white/[0.04]" />
            {renderToggleRow("Notificaciones de Emergencia", "Alertas en tu chat privado ante anomalías críticas", config.urgency_notify, (val) => setConfig({...config, urgency_notify: val}))}
            
            <div className="h-[1px] bg-white/[0.04]" />
            {renderToggleRow("Simular Escritura Humana", "Añade pausas realistas antes de lanzar la respuesta", config.humanize_enabled, (val) => setConfig({...config, humanize_enabled: val}))}

          </div>
        </div>

        {/* ── BLOQUE 6: REPORTES DIARIOS ── */}
        <div className="space-y-2">
          <label className="text-[#8e8e93] text-[12px] uppercase px-1 font-bold tracking-wider" style={{ fontFamily: SF }}>Métricas e Informes</label>
          <div style={liquidGlassContainerStyle} className="p-4 space-y-4">
            {renderToggleRow("Resumen Diario", "Recibe un reporte estructurado de rendimiento cada 24 horas", config.daily_digest, (val) => setConfig({...config, daily_digest: val}))}
          </div>
        </div>

      </div>

      {/* ── ACCIONES DE BASE FLOTANTES (ESTILO FIJO DE TU MARKET-VIEW) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#33b5f7] text-white font-bold h-[54px] rounded-[16px] text-[16px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: SF }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Aplicar Ajustes
          </button>
          <button 
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-[#1c1c1e] text-[#33b5f7] font-bold h-[54px] rounded-[16px] text-[16px] border border-[#2c2c2e] active:scale-95 transition-all"
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
