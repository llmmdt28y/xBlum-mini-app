"use client"

import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, Loader2 
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── ESTILOS LIQUID GLASS ADAPTADOS A CONTENEDORES DE LISTA ──
const liquidGlassContainer = {
  background: "rgba(28, 28, 30, 0.7)", 
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  overflow: "hidden" as const,
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
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState({
    auto_reply_filter: "everyone",
    bot_username: "",
    excluded_count: 0
  })

  const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  useEffect(() => {
    // Simulación de carga / Fetch real
    setTimeout(() => setLoading(false), 800)
  }, [])

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
      <div className="relative z-10 px-4 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onClose} className="text-white active:opacity-50 transition-opacity">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => { /* Lógica de Guardado */ }} 
          className="text-[#33b5f7] font-bold text-[16px] active:opacity-50"
          style={{ fontFamily: SF }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 no-scrollbar pb-32">
        
        {/* ── SECCIÓN GIF & TÍTULO ── */}
        <div className="flex flex-col items-center mt-4 mb-8">
          <div className="w-[140px] h-[140px] flex items-center justify-center mb-6">
            <img 
              src={agentGifUrl} 
              alt="Chat Automation" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white text-[24px] font-bold mb-2" style={{ fontFamily: SFD }}>
            Chat Automation
          </h1>
          <p className="text-[#8e8e93] text-[15px] text-center max-w-[280px] leading-snug" style={{ fontFamily: SF }}>
            Add a bot to answer messages on your behalf.
          </p>
        </div>

        {/* ── INPUT BOT USERNAME ── */}
        <div className="mb-8">
          <div className="bg-[#1c1c1e] rounded-[12px] p-4 border border-white/[0.05]">
            <input 
              type="text" 
              placeholder="Bot username or url" 
              value={config.bot_username}
              onChange={(e) => setConfig({...config, bot_username: e.target.value})}
              className="bg-transparent w-full text-white outline-none text-[17px] placeholder:text-[#545456]"
              style={{ fontFamily: SF }}
            />
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <h2 className="text-[#8e8e93] text-[14px] uppercase px-1 mb-3 font-medium tracking-wide" style={{ fontFamily: SF }}>
          Choose a bot to manage your chats automatically.
        </h2>

        {/* ── CONTENEDOR DE SELECTORES (LIQUID GLASS) ── */}
        <div style={liquidGlassContainer} className="mb-4">
          
          <div className="text-[#33b5f7] text-[14px] font-bold px-4 pt-4 pb-2 uppercase" style={{ fontFamily: SF }}>
            Chats the bot can access
          </div>

          {/* Opción 1: All Private Except */}
          <button 
            onClick={() => setConfig({...config, auto_reply_filter: 'everyone'})}
            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
          >
            <span className={`text-[17px] ${config.auto_reply_filter === 'everyone' ? 'text-white' : 'text-[#8e8e93]'}`} style={{ fontFamily: SF }}>
              All private chats except...
            </span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.auto_reply_filter === 'everyone' ? 'border-[#33b5f7]' : 'border-[#545456]'}`}>
              {config.auto_reply_filter === 'everyone' && <div className="w-2.5 h-2.5 bg-[#33b5f7] rounded-full" />}
            </div>
          </button>

          <div className="h-[1px] bg-white/[0.05] mx-4" />

          {/* Opción 2: Only Selected */}
          <button 
            onClick={() => setConfig({...config, auto_reply_filter: 'whitelist'})}
            className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
          >
            <span className={`text-[17px] ${config.auto_reply_filter === 'whitelist' ? 'text-white' : 'text-[#8e8e93]'}`} style={{ fontFamily: SF }}>
              Only selected chats
            </span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${config.auto_reply_filter === 'whitelist' ? 'border-[#33b5f7]' : 'border-[#545456]'}`}>
              {config.auto_reply_filter === 'whitelist' && <div className="w-2.5 h-2.5 bg-[#33b5f7] rounded-full" />}
            </div>
          </button>
        </div>

        {/* ── EXCLUDED CHATS ROW ── */}
        <div style={liquidGlassContainer} className="mb-3">
          <button className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors">
            <span className="text-white text-[17px]" style={{ fontFamily: SF }}>excluded chats</span>
            <div className="flex items-center gap-1">
              <span className="text-[#33b5f7] text-[17px]">Add</span>
            </div>
          </button>
        </div>

        {/* ── FOOTER HINT ── */}
        <p className="text-[#8e8e93] text-[14px] px-1 mb-10" style={{ fontFamily: SF }}>
          Select the chats the bot won't access.
        </p>

      </div>

      {/* ── BOTONES DE ACCIÓN (ESTILO MARKET) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex gap-3 max-w-md mx-auto">
          <button 
            onClick={onClose}
            className="flex-1 bg-[#33b5f7] text-white font-bold h-[54px] rounded-[16px] text-[16px] shadow-lg active:scale-95 transition-all"
            style={{ fontFamily: SF }}
          >
            Apply Changes
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-[#1c1c1e] text-[#33b5f7] font-bold h-[54px] rounded-[16px] text-[16px] border border-[#2c2c2e] active:scale-95 transition-all"
            style={{ fontFamily: SF }}
          >
            Discard
          </button>
        </div>
        <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 5px)" }} />
      </div>

    </div>
  )
}
