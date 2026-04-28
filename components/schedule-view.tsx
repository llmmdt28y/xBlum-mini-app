"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { 
  Mail, CalendarDays, Bell, Send, Clock, ChevronRight, 
  Plus, Loader2, RefreshCw, Video, UserCircle2 
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos de Automatización ──
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | null

const SCHEDULE_OPTIONS = [
  { 
    id: "reminder", 
    name: "Personal Reminder", 
    desc: "Set notify for your future self", 
    icon: <Bell className="w-5 h-5 text-amber-400" />,
  },
  { 
    id: "email", 
    name: "Send Email", 
    desc: "Schedule Gmail or Outlook sends", 
    icon: <img src="/gmail.png" alt="Gmail" className="w-5 h-5 object-contain pointer-events-none select-none" />,
  },
  { 
    id: "drive", 
    name: "Upload to Drive", 
    desc: "Automate file transfers to Google Drive", 
    icon: <img src="/drive.png" alt="Drive" className="w-5 h-5 object-contain pointer-events-none select-none" />,
  },
  { 
    id: "telegram_channel", 
    name: "Telegram Post", 
    desc: "Schedule messages in your channels", 
    icon: <Send className="w-5 h-5 text-blue-400" />,
    soon: true // Marcado como Soon
  },
] as const;

// ── Diccionario de colores para los Tags (Adaptados a Dark Mode Premium) ──
const TAG_COLORS = {
  blue:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  green:  "bg-green-500/15 text-green-400 border-green-500/20",
  sky:    "bg-sky-500/15 text-sky-400 border-sky-500/20",
  rose:   "bg-rose-500/15 text-rose-400 border-rose-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
} as const;

// ── Mock de Tareas Programadas (Con el nuevo diseño de etiquetas) ──
const MOCK_SCHEDULED_TASKS = [
  { 
    id: 1, 
    type: "telegram_channel", 
    title: "Weekly Community Update", 
    status: "Active",
    tags: [
      { text: "March 09 — 16", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "blue" },
      { text: "Weekly", icon: <RefreshCw className="w-3.5 h-3.5" />, color: "orange" },
      { text: "Zoom", icon: <Video className="w-3.5 h-3.5 fill-current" />, color: "green" },
      { text: "Herengracht 133, Amst...", icon: <Send className="w-3.5 h-3.5 fill-current" />, color: "sky" },
      { text: "Participants", icon: <UserCircle2 className="w-3.5 h-3.5 fill-current" />, color: "rose" },
      { text: "12:00 — 13:00", icon: <Clock className="w-3.5 h-3.5 fill-current" />, color: "purple" },
    ] as const
  }
]

export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [selectedTaskType, setSelectedTaskType] = useState<ScheduleType>(null)
  const [loading, setLoading] = useState(false)

  // ── Gestión del Botón Atrás Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return

    if (selectedTaskType) {
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }

    const handleBack = () => {
      if (selectedTaskType) {
        setSelectedTaskType(null)
      } else {
        setCurrentView("home")
        tg.BackButton.hide()
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [selectedTaskType, setCurrentView])

  function handleOpenTaskConfig(type: ScheduleType, soon?: boolean) {
    if (soon) return
    setLoading(true)
    setTimeout(() => {
      setSelectedTaskType(type)
      setLoading(false)
    }, 600)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-black select-none">
      
      {/* ── Imagen de Fondo con Blur Sutil ── */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/landscape.jpg')", // Requiere la imagen en public/landscape.jpg
          opacity: 0.45,
          filter: "blur(4px)",
        }}
      />
      <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%)" }} />

      {/* ── Contenido Principal ── */}
      <div className="relative z-10 flex-1 flex flex-col" style={{ fontFamily: SF }}>
        
        {/* ── Header ── */}
        <div className="sticky top-0 z-30 flex items-center justify-center px-4 pb-3" style={{
          paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
            Schedule & Automation
          </h2>
        </div>

        <div className="px-4 pt-6 pb-28 space-y-7 overflow-y-auto">

          {/* ── Hero Section ── */}
          <div className="w-full animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <p className="text-blue-300 text-sm font-medium" style={{ fontFamily: SF }}>
                    Powered by xBlum AI
                </p>
            </div>
            <h1 className="text-[34px] font-bold text-white leading-tight tracking-tight" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>
              Automate<br />Your Flows
            </h1>
            <p className="text-[#c7c7cc] text-[15px] mt-2 max-w-[90%]" style={{ fontFamily: SF }}>
              Schedule tasks, messages, and file uploads. Let AI handle the timing for maximum efficiency.
            </p>
          </div>

          {/* ── Create New Automation ── */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
            <div className="flex items-center justify-between px-2 mb-3">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#8e8e93", fontFamily: SF }}>
                    Create New Automation
                </p>
            </div>

            <div 
              className="rounded-[24px] overflow-hidden relative"
              style={{ 
                background: "rgba(28, 28, 30, 0.4)",
                backdropFilter: "blur(25px) saturate(190%)",
                WebkitBackdropFilter: "blur(25px) saturate(190%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)",
              }}
            >
              {SCHEDULE_OPTIONS.map((option, i) => (
                <div key={option.id}>
                  {i > 0 && <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginLeft: "68px" }} />}
                  <button
                    onClick={() => handleOpenTaskConfig(option.id, option.soon)}
                    disabled={option.soon || loading}
                    className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${option.soon ? 'opacity-50 cursor-not-allowed' : 'active:bg-white/5'}`}
                  >
                    <div 
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" 
                        style={{ 
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.03)"
                        }}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-[16px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{option.name}</p>
                        {option.soon && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1c1c1e] text-[#8e8e93]" style={{ fontFamily: SF }}>SOON</span>
                        )}
                      </div>
                      <p className="text-[#a1a1a6] text-[13px] truncate mt-0.5" style={{ fontFamily: SF }}>{option.desc}</p>
                    </div>
                    {!option.soon && (
                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Upcoming Tasks (Con los Tags Coloridos) ── */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <div className="flex items-center justify-between px-2 mb-3">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#8e8e93", fontFamily: SF }}>
                    Upcoming & Active
                </p>
                {MOCK_SCHEDULED_TASKS.length > 0 && (
                    <button className="text-[13px] text-blue-400 font-medium active:opacity-60" style={{ fontFamily: SF }}>View All</button>
                )}
            </div>

            {MOCK_SCHEDULED_TASKS.length === 0 ? (
                <div 
                    className="rounded-[24px] p-6 text-center flex flex-col items-center gap-3"
                    style={{ background: "rgba(28, 28, 30, 0.3)", border: "1px solid rgba(255, 255, 255, 0.05)" }}
                >
                    <Clock className="w-10 h-10 text-[#3a3a3c]" strokeWidth={1.5} />
                    <p className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>No tasks scheduled yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {MOCK_SCHEDULED_TASKS.map(task => (
                        <div 
                            key={task.id} 
                            className="w-full flex flex-col gap-3.5 p-5 rounded-[24px]"
                            style={{ 
                                background: "rgba(28, 28, 30, 0.4)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.02)"
                            }}
                        >
                            {/* Título y Status */}
                            <div className="flex items-center justify-between px-1">
                                <p className="text-white text-[17px] font-bold" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>{task.title}</p>
                                <span className="text-[11px] font-bold text-blue-400 px-2.5 py-0.5 rounded-md bg-blue-500/10 tracking-wide uppercase" style={{ fontFamily: SF }}>{task.status}</span>
                            </div>

                            {/* Contenedor de Etiquetas (Réplica de la imagen) */}
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border ${TAG_COLORS[tag.color]}`}
                                    >
                                      {tag.icon}
                                      <span className="font-semibold text-[13px]" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                                        {tag.text}
                                      </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Floating Action Button (FAB) ── */}
      <button 
        className="fixed bottom-28 right-5 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform z-30 shadow-2xl"
        style={{ 
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)"
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />

      {/* ── Modal de Configuración (Placeholder) ── */}
      {selectedTaskType && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTaskType(null)} />
            <div 
                className="relative w-full rounded-t-[28px] p-6 space-y-4 animate-in slide-in-from-bottom duration-400 max-h-[80vh] overflow-y-auto"
                style={{ 
                    background: "#1c1c1e",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: SF
                }}
            >
                <div className="w-12 h-1.5 bg-[#3a3a3c] rounded-full mx-auto mb-2" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)" }}>
                        {SCHEDULE_OPTIONS.find(o => o.id === selectedTaskType)?.icon}
                    </div>
                    <h3 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Configure {SCHEDULE_OPTIONS.find(o => o.id === selectedTaskType)?.name}</h3>
                </div>
                
                <p className="text-[#8e8e93]">Configuration details for <span className="text-white font-medium">{selectedTaskType}</span> will go here. Integrate date pickers, inputs, etc.</p>
                
                <div className="pt-4 flex flex-col gap-3">
                    <button className="w-full py-4 bg-white text-black font-bold rounded-[16px] active:scale-[0.98] transition-transform">Schedule Task</button>
                    <button onClick={() => setSelectedTaskType(null)} className="w-full py-4 text-white font-medium rounded-[16px] active:bg-white/5 transition-colors">Cancel</button>
                </div>
                
                <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
            </div>
        </div>
      )}

      {/* ── Loader Global ── */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

    </div>
  )
}
