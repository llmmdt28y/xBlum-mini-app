"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import { 
  Mail, CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, FileText, Loader2, Database, AlertCircle, Pencil, Search, XCircle, Trash2, RefreshCw, Video, UserCircle2, X
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos y Configuraciones ──
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | null
type NavTab = "tasks" | "edit" | "search" | "create"

// ── Diccionario de colores para los Tags (Integrados) ──
const TAG_COLORS = {
    blue:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    green:  "bg-green-500/15 text-green-400 border-green-500/20",
    sky:    "bg-sky-500/15 text-sky-400 border-sky-500/20",
    rose:   "bg-rose-500/15 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  } as const;

// ── Opciones Predeterminadas de Creación ──
const CREATE_TEMPLATES = [
    { 
        id: "email", 
        name: "Compose & Schedule Email", 
        desc: "Draft Gmail/Outlook sends with AI", 
        icon: <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain pointer-events-none select-none" />,
        color: "red"
    },
    { 
        id: "drive", 
        name: "Schedule Drive Upload", 
        desc: "Automate file transfers to Drive", 
        icon: <img src="/drive.png" alt="Drive" className="w-6 h-6 object-contain pointer-events-none select-none" />,
        color: "green"
    },
    { 
        id: "reminder", 
        name: "Personal AI Reminder", 
        desc: "Notifications for your future self", 
        icon: <Bell className="w-6 h-6 text-amber-400" />,
        color: "amber"
    },
    { 
        id: "telegram_channel", 
        name: "Schedule Telegram Post", 
        desc: "Send messages to your channels", 
        icon: <Send className="w-6 h-6 text-blue-400" />,
        color: "blue",
        soon: true
    },
] as const;

// ── Mock de Tareas Programadas ──
const INITIAL_TASKS = [
    { 
        id: 1, 
        type: "telegram_channel", 
        title: "Weekly Community Update", 
        status: "Active",
        tags: [
          { text: "March 09 — 16", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "blue" },
          { text: "Weekly", icon: <RefreshCw className="w-3.5 h-3.5" />, color: "orange" },
          { text: "Zoom Meeting", icon: <Video className="w-3.5 h-3.5 fill-current" />, color: "green" },
          { text: "Channel Update", icon: <Send className="w-3.5 h-3.5 fill-current" />, color: "sky" },
          { text: "Moderators List", icon: <UserCircle2 className="w-3.5 h-3.5 fill-current" />, color: "rose" },
          { text: "12:00 — 13:00", icon: <Clock className="w-3.5 h-3.5 fill-current" />, color: "purple" },
        ] as const
    },
    { id: 2, type: "reminder", title: "Review Q3 Report with AI", status: "Pending", time: "Tomorrow, 09:00 AM" },
    { id: 3, type: "email", title: "Follow-up to Partnership", status: "Pending", time: "Oct 28, 02:00 PM" },
]

export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTaskConfig, setSelectedTaskConfig] = useState<ScheduleType>(null)
  const [loading, setLoading] = useState(false)

  // ── Gestión del Botón Atrás Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return

    // Mostrar atrás si hay un modal abierto o si estamos editando
    if (showCreateModal || selectedTaskConfig || isEditingMode) {
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }

    const handleBack = () => {
      if (selectedTaskConfig) {
        setSelectedTaskConfig(null)
      } else if (showCreateModal) {
        setShowCreateModal(false)
      } else if (isEditingMode) {
        setIsEditingMode(false)
        setActiveNavTab("tasks")
      } else {
        setCurrentView("home")
        tg.BackButton.hide()
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [showCreateModal, selectedTaskConfig, isEditingMode, setCurrentView])

  function handleNavTabClick(tab: NavTab) {
    if (tab === "search") return; // Disabled

    if (tab === "edit") {
        setIsEditingMode(!isEditingMode)
        setActiveNavTab("edit")
    } else if (tab === "create") {
        setIsEditingMode(false) // Cancel edit mode
        setShowCreateModal(true)
        setActiveNavTab("create")
    } else {
        setIsEditingMode(false)
        setShowCreateModal(false)
        setActiveNavTab(tab)
    }
  }

  function handleSelectTemplate(type: ScheduleType, soon?: boolean) {
    if (soon) return
    setLoading(true)
    setTimeout(() => {
        setSelectedTaskConfig(type)
        setShowCreateModal(false)
        setLoading(false)
    }, 600)
  }

  function handleDeleteTask(id: number) {
    setTasks(prev => prev.filter(task => task.id !== id))
    if (tasks.length === 1) { // If last task was deleted
        setIsEditingMode(false)
        setActiveNavTab("tasks")
    }
  }

  // ── CSS Jiggle Animation for Editing Mode ──
  const jiggleAnimation = `
    @keyframes jiggle {
      0% { transform: rotate(-0.5deg); }
      50% { transform: rotate(0.5deg); }
      100% { transform: rotate(-0.5deg); }
    }
    .jiggle-card {
      animation: jiggle 0.3s ease-in-out infinite;
    }
  `;

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-black">
      <style>{jiggleAnimation}</style>
      
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

        <div className="px-4 pt-6 pb-40 space-y-7 overflow-y-auto">

          {/* ── Hero Section ── */}
          <div className="w-full animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <p className="text-blue-300 text-sm font-medium" style={{ fontFamily: SF }}>Powered by xBlum AI</p>
            </div>
            <h1 className="text-[34px] font-bold text-white leading-tight tracking-tight" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>Automate<br />Your Flows</h1>
          </div>

          {/* ── Upcoming Tasks (Con Edición y Tags Coloridos) ── */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <div className="flex items-center justify-between px-2 mb-3 relative z-20">
                <p style={{ fontSize: "13px", fontWeight: 600, color: isEditingMode ? "#ef4444" : "#8e8e93", fontFamily: SF }}>
                    {isEditingMode ? "Delete Tasks Mode" : "Upcoming & Active"}
                </p>
            </div>

            {tasks.length === 0 ? (
                <div className="rounded-[24px] p-8 text-center flex flex-col items-center gap-3" style={{ background: "rgba(28, 28, 30, 0.3)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <Clock className="w-10 h-10 text-[#3a3a3c]" strokeWidth={1.5} />
                    <p className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>No tasks scheduled yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                            {/* Tarjeta de Tarea */}
                            <div 
                                className="w-full flex flex-col gap-3.5 p-5 rounded-[24px] relative"
                                style={{ 
                                    background: "rgba(28, 28, 30, 0.4)",
                                    backdropFilter: "blur(10px)",
                                    border: isEditingMode ? "1px solid #ef444450" : "1px solid rgba(255, 255, 255, 0.05)",
                                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.02)"
                                }}
                            >
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-white text-[17px] font-bold flex items-center gap-2" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>
                                        {task.type === "reminder" && <Bell className="w-4 h-4 text-amber-400" />}
                                        {task.type === "email" && <Mail className="w-4 h-4 text-red-400" />}
                                        {task.title}
                                    </p>
                                    <span className="text-[11px] font-bold text-blue-400 px-2.5 py-0.5 rounded-md bg-blue-500/10 tracking-wide uppercase" style={{ fontFamily: SF }}>{task.status}</span>
                                </div>

                                {/* Tags Coloridos (Réplica) */}
                                {task.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {task.tags.map((tag, idx) => (
                                            <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border ${TAG_COLORS[tag.color]}`}>
                                                {tag.icon}
                                                <span className="font-semibold text-[13px]" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{tag.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {task.time && <p className="text-[#8e8e93] text-[13px] px-1" style={{ fontFamily: SF }}>Target: <span className="text-white font-medium">{task.time}</span></p>}
                            </div>

                            {/* Botón de Eliminar (X Roja) en Modo Edición */}
                            {isEditingMode && (
                                <button 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-transform shadow-xl z-10"
                                    style={{ background: "#000", border: "2px solid #ef4444", color: "#ef4444" }}
                                >
                                    <Trash2 className="w-4 h-4 fill-current" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Nueva Bottom NavBar "Líquida" de Cristal (Réplica exacta de la referencia) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{
        paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)"
      }}>
        <div className="pointer-events-auto flex items-center" style={{
          borderRadius: "100px",
          padding: "6px",
          gap: "4px",
          background: "rgba(15, 15, 15, 0.75)",
          backdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
        }}>
          {/* Tab Buscar (Sin función) */}
          <button 
            disabled
            className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed"
          >
            <Search className="w-6 h-6 text-[#8e8e93]" />
          </button>

          {/* Tab Tareas (Calendario) */}
          <button 
            onClick={() => handleNavTabClick("tasks")}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative"
            style={{ background: activeNavTab === "tasks" ? "#ffffff" : "transparent" }}
          >
            <CalendarDays className={`w-6 h-6 transition-colors ${activeNavTab === "tasks" ? "text-black" : "text-white"}`} />
            {activeNavTab === "tasks" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />
            )}
          </button>

          {/* Tab Editar (Lápiz) */}
          <button 
            onClick={() => handleNavTabClick("edit")}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative"
            style={{ background: isEditingMode ? "#ffffff" : "transparent" }}
          >
            <Pencil className={`w-6 h-6 transition-colors ${isEditingMode ? "text-black" : "text-white"}`} />
            {isEditingMode && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-10 bg-white/10" />

          {/* Tab Crear (+) */}
          <button 
            onClick={() => handleNavTabClick("create")}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ 
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)"
            }}
          >
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </button>

        </div>
      </div>

      {/* Area de resguardo inferior */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />

      {/* ── MODAL: CREAR TAREA (Con Plantillas Predeterminadas) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div 
                className="relative w-full rounded-t-[28px] p-6 space-y-4 animate-in slide-in-from-bottom duration-400 max-h-[85vh] overflow-y-auto"
                style={{ background: "#1c1c1e", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: SF }}
            >
                <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 z-10">
                    <X className="w-5 h-5 text-white" />
                </button>
                <div className="w-12 h-1.5 bg-[#3a3a3c] rounded-full mx-auto mb-2" />
                <h3 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>Create New Schedule</h3>
                
                <p className="text-[#8e8e93] text-[15px]">Select a quick template to configure with AI</p>
                
                <div className="pt-2 space-y-4">
                    {CREATE_TEMPLATES.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => handleSelectTemplate(item.id, item.soon)}
                            disabled={item.soon}
                            className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-colors text-left border ${TAG_COLORS[item.color]} ${item.soon ? 'opacity-30 cursor-not-allowed' : 'active:bg-white/5'}`}
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                {item.soon ? <Lock className="w-5 h-5 text-[#8e8e93]" /> : item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white text-[16px] font-medium" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{item.name}</p>
                                    {item.soon && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1c1c1e] text-[#8e8e93]">SOON</span>}
                                </div>
                                <p className="text-[13px] opacity-70 mt-0.5">{item.desc}</p>
                            </div>
                            {!item.soon && <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
                        </button>
                    ))}
                </div>
                
                <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
            </div>
        </div>
      )}

      {/* ── MODAL: CONFIGURACIÓN DETALLADA (Ejemplo: Redactar Correo) ── */}
      {selectedTaskConfig === "email" && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTaskConfig(null)} />
            <div 
                className="relative w-full rounded-t-[28px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col"
                style={{ background: "#1c1c1e", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: SF }}
            >
                <button onClick={() => setSelectedTaskConfig(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 z-10">
                    <X className="w-5 h-5 text-white" />
                </button>
                <div className="w-12 h-1.5 bg-[#3a3a3c] rounded-full mx-auto mb-2 shrink-0" />
                
                <div className="overflow-y-auto flex-1 pr-1 space-y-5 pt-3 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" />
                        </div>
                        <h3 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Configure AI Email Flow</h3>
                    </div>

                    {/* Inputs de Configuración (Engagement Marketing) */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#8e8e93] px-1">Recipient Email</label>
                            <input type="email" placeholder="client@example.com" className="w-full p-4 bg-white/5 border border-white/10 rounded-[16px] text-white focus:outline-none focus:border-blue-500/50" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#8e8e93] px-1">AI Prompt (What is the email about?)</label>
                            <textarea placeholder="Ask AI to draft a polite follow-up to our partnership proposal, focusing on next steps." rows={3} className="w-full p-4 bg-white/5 border border-white/10 rounded-[16px] text-white focus:outline-none focus:border-blue-500/50 resize-none"></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-[#8e8e93] px-1">Schedule Time (AI Time)</label>
                                <div className="grid grid-cols-2 gap-2 p-1 rounded-[16px]" style={{ background: "rgba(0,0,0,0.2)" }}>
                                    <input type="number" placeholder="HH" max={23} min={0} className="w-full p-3 bg-black rounded-[12px] text-white text-center font-bold text-[18px] focus:outline-none" style={{ fontVariantNumeric: "tabular-nums" }} />
                                    <input type="number" placeholder="MM" max={59} min={0} className="w-full p-3 bg-black rounded-[12px] text-white text-center font-bold text-[18px] focus:outline-none" style={{ fontVariantNumeric: "tabular-nums" }} />
                                </div>
                            </div>
                            <div className="space-y-1.5 flex flex-col justify-end">
                                <label className="text-[13px] font-medium text-[#8e8e93] px-1">Status</label>
                                <button className="w-full p-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-[16px] text-[14px]">ACTIVE (AI Monitor)</button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-4 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-[20px] p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-blue-300 text-[13px]" style={{ fontFamily: SF }}>This task will consume tokens. AI will draft, monitor, and send based on parameters.</p>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button className="w-full py-4 bg-white text-black font-bold rounded-[16px] active:scale-[0.98] transition-transform text-[16px]">Schedule AI Email</button>
                        <button onClick={() => setSelectedTaskConfig(null)} className="w-full py-4 text-white font-medium rounded-[16px] active:bg-white/5 transition-colors">Cancel</button>
                    </div>
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
