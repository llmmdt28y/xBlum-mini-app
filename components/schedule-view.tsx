"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo } from "react"
import { 
  Mail, CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Star, Trash2, Folder, CheckCircle2, LayoutTemplate, Play, Tag, Users
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | null

// ── Opciones Predeterminadas de Creación (Modal) ──
const CREATE_TEMPLATES = [
    { 
        id: "email", 
        name: "Compose & Schedule Email", 
        desc: "Draft Gmail/Outlook sends with AI", 
        icon: <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain pointer-events-none select-none" />,
    },
    { 
        id: "drive", 
        name: "Schedule Drive Upload", 
        desc: "Automate file transfers to Drive", 
        icon: <img src="/drive.png" alt="Drive" className="w-6 h-6 object-contain pointer-events-none select-none" />,
    },
    { 
        id: "reminder", 
        name: "Personal AI Reminder", 
        desc: "Notifications for your future self", 
        icon: <Bell className="w-6 h-6 text-amber-400" />,
    },
    { 
        id: "telegram_channel", 
        name: "Schedule Telegram Post", 
        desc: "Send messages to your channels", 
        icon: <Send className="w-6 h-6 text-blue-400" />,
        soon: true
    },
] as const;

// ── Mock de Tareas Programadas ──
const INITIAL_TASKS = [
    { 
        id: 1, 
        date: new Date().toDateString(),
        type: "custom", 
        title: "Website Launch", 
        status: "PENDING",
        tags: [
          { text: "Jan 10 — 24", icon: <CalendarDays className="w-4 h-4 text-[#8e8e93]" /> },
          { text: "Marketing", icon: <Tag className="w-4 h-4 text-[#8e8e93]" /> },
          { text: "Team", icon: <Users className="w-4 h-4 text-[#8e8e93]" /> },
          { text: "12:00 — 14:00", icon: <Clock className="w-4 h-4 text-[#8e8e93]" /> },
        ] as const
    },
    { 
        id: 2, 
        date: new Date(Date.now() + 86400000).toDateString(), 
        type: "custom", 
        title: "Q3 Report Review", 
        status: "ACTIVE",
        tags: [
            { text: "Tomorrow", icon: <CalendarDays className="w-4 h-4 text-[#8e8e93]" /> },
            { text: "Finance", icon: <Tag className="w-4 h-4 text-[#8e8e93]" /> },
            { text: "09:00 AM", icon: <Clock className="w-4 h-4 text-[#8e8e93]" /> },
        ] as const
    },
]

// ── Elementos "Suggested" (Réplica exacta de la imagen) ──
const SUGGESTIONS = [
    { title: "Schedule an email", icon: <Mail className="w-5 h-5 text-white" />, bg: "bg-blue-500" },
    { title: "Publish a template", icon: <LayoutTemplate className="w-5 h-5 text-white" />, bg: "bg-purple-500" },
    { title: "Launch a campaign", icon: <Play className="w-5 h-5 text-white fill-white ml-1" />, bg: "bg-green-500" }, // ml-1 para centrar el icono play visualmente
]

export function ScheduleView() {
    const { setCurrentView } = useApp()
    const [tasks, setTasks] = useState(INITIAL_TASKS)
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    // Estados para modales de creación
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedTaskConfig, setSelectedTaskConfig] = useState<ScheduleType>(null)
    const [loading, setLoading] = useState(false)

    // ── Lógica del Calendario de la Semana ──
    const calendarDays = useMemo(() => {
        const days = []
        const startOfWeek = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(startOfWeek.getDate() + i)
            days.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // S, M, T...
                num: d.getDate(),
                isToday: d.toDateString() === new Date().toDateString()
            })
        }
        return days
    }, [])

    const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const filteredTasks = useMemo(() => {
        if (selectedDate === "All") return tasks
        return tasks.filter(t => t.date === selectedDate)
    }, [tasks, selectedDate])

    // ── Botón Atrás de Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        
        if (isEditingMode || showCreateModal || selectedTaskConfig) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (selectedTaskConfig) setSelectedTaskConfig(null)
            else if (showCreateModal) setShowCreateModal(false)
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, showCreateModal, selectedTaskConfig, setCurrentView])

    function handleNavTabClick(tab: NavTab) {
        if (tab === "search") return; 

        if (tab === "edit") {
            setIsEditingMode(!isEditingMode)
            setActiveNavTab(isEditingMode ? "tasks" : "edit")
        } else if (tab === "create") {
            setIsEditingMode(false) 
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

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-black text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            {/* ── Fondo Landscape con Blur ── */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
                style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(30px)" }} 
            />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.95) 100%)" }} />

            <div className="relative z-10 flex-1 flex flex-col">
                
                {/* ── Header: Month & Calendar ── */}
                <div className="pt-10 px-6">
                    <p className="text-[#8e8e93] text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: SF }}>{monthYear}</p>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        <button 
                            onClick={() => setSelectedDate("All")}
                            className={`shrink-0 w-[60px] h-[80px] rounded-[30px] font-bold text-[17px] flex items-center justify-center transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}
                        >
                            All
                        </button>
                        
                        <div className="w-px h-10 bg-[#1c1c1e] mx-2 shrink-0" />
                        
                        {calendarDays.map((day) => (
                            <button 
                                key={day.full}
                                onClick={() => setSelectedDate(day.full)}
                                className={`shrink-0 w-[60px] h-[80px] rounded-[30px] flex flex-col items-center justify-center gap-1 transition-all ${selectedDate === day.full ? "bg-blue-500 text-white" : "bg-[#1c1c1e] text-[#8e8e93]"}`}
                            >
                                <span className={`text-[11px] font-semibold ${selectedDate === day.full ? "opacity-80" : ""}`}>{day.label}</span>
                                <span className="text-[20px] font-bold">{day.num}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-10">
                    
                    {/* ── Title & Stats ── */}
                    <div className="animate-in fade-in duration-500">
                        <p className="text-blue-500 text-[11px] font-bold tracking-[0.2em] uppercase mb-2" style={{ fontFamily: SF }}>SCHEDULE</p>
                        <h1 className="text-white text-[42px] font-bold tracking-tight leading-none mb-6" style={{ fontFamily: SFD }}>My Plan</h1>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Folder className="w-4 h-4 text-blue-500 fill-blue-500" />
                                </div>
                                <span className="text-white text-[20px] font-bold">{tasks.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500" />
                                </div>
                                <span className="text-white text-[20px] font-bold">10</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Suggested Section ── */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            </div>
                            <p className="text-[#8e8e93] text-[11px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: SF }}>SUGGESTED</p>
                        </div>

                        <div className="space-y-3">
                            {SUGGESTIONS.map((sug, i) => (
                                <button key={i} className="w-full flex items-center justify-between bg-[#111] border border-[#1c1c1e] p-3.5 rounded-[24px] active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-full ${sug.bg} flex items-center justify-center`}>
                                            {sug.icon}
                                        </div>
                                        <span className="text-white text-[16px] font-medium" style={{ fontFamily: SF }}>{sug.title}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── For this day / Tasks Section ── */}
                    <div className="pb-10">
                        <p className="text-[#8e8e93] text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: SF }}>
                            {selectedDate === "All" ? "ALL ACTIVITY" : "FOR THIS DAY"}
                        </p>
                        
                        {filteredTasks.length === 0 ? (
                            <div className="p-10 text-center bg-[#111] rounded-[32px] border border-dashed border-[#1c1c1e]">
                                <p className="text-[#48484a] font-medium" style={{ fontFamily: SF }}>No events scheduled</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTasks.map(task => (
                                    <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                        
                                        <div className="bg-[#111] border border-[#1c1c1e] rounded-[32px] p-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-white text-[22px] font-bold tracking-tight" style={{ fontFamily: SFD }}>{task.title}</h3>
                                                <span className="bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider" style={{ fontFamily: SF }}>{task.status}</span>
                                            </div>

                                            {task.tags && (
                                                <div className="flex flex-wrap gap-2">
                                                    {task.tags.map((tag, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1e] rounded-[14px]">
                                                            {tag.icon}
                                                            <span className="text-white text-[12px] font-bold tracking-wide" style={{ fontFamily: SF }}>{tag.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {isEditingMode && (
                                            <button 
                                                onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                                className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform shadow-xl z-10"
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

            {/* ── Liquid Bottom NavBar ── */}
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
                    <button disabled className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed">
                        <Search className="w-6 h-6 text-[#8e8e93]" />
                    </button>

                    <button 
                        onClick={() => handleNavTabClick("tasks")}
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative"
                        style={{ background: activeNavTab === "tasks" ? "#ffffff" : "transparent" }}
                    >
                        <CalendarDays className={`w-6 h-6 transition-colors ${activeNavTab === "tasks" ? "text-black" : "text-white"}`} />
                        {activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />}
                    </button>

                    <button 
                        onClick={() => handleNavTabClick("edit")}
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative"
                        style={{ background: isEditingMode ? "#ffffff" : "transparent" }}
                    >
                        <Pencil className={`w-6 h-6 transition-colors ${isEditingMode ? "text-black" : "text-white"}`} />
                        {isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}
                    </button>

                    <div className="w-px h-10 bg-white/10" />

                    <button 
                        onClick={() => handleNavTabClick("create")}
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)" }}
                    >
                        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* ── MODAL: CREAR TAREA ── */}
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
                        
                        <p className="text-[#8e8e93] text-[15px]">Select a template to configure with AI</p>
                        
                        <div className="pt-2 space-y-4">
                            {CREATE_TEMPLATES.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => handleSelectTemplate(item.id, item.soon)}
                                    disabled={item.soon}
                                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-colors text-left bg-[#111] border border-[#2c2c2e] ${item.soon ? 'opacity-30 cursor-not-allowed' : 'active:bg-white/5'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        {item.soon ? <Lock className="w-5 h-5 text-[#8e8e93]" /> : item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white text-[16px] font-medium" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{item.name}</p>
                                            {item.soon && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1c1c1e] text-[#8e8e93]">SOON</span>}
                                        </div>
                                        <p className="text-[13px] opacity-70 mt-0.5 text-[#8e8e93]">{item.desc}</p>
                                    </div>
                                    {!item.soon && <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
                                </button>
                            ))}
                        </div>
                        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
                    </div>
                </div>
            )}

            {/* ── MODAL: CONFIGURACIÓN DETALLADA (Ejemplo Email) ── */}
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
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#111] border border-[#2c2c2e]">
                                    <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" />
                                </div>
                                <h3 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Configure AI Email</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[#8e8e93] px-1">Recipient</label>
                                    <input type="email" placeholder="client@example.com" className="w-full p-4 bg-[#111] border border-[#2c2c2e] rounded-[16px] text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[#8e8e93] px-1">AI Prompt</label>
                                    <textarea placeholder="Draft a polite follow-up..." rows={3} className="w-full p-4 bg-[#111] border border-[#2c2c2e] rounded-[16px] text-white focus:outline-none focus:border-blue-500/50 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-medium text-[#8e8e93] px-1">Time (HH:MM)</label>
                                        <div className="grid grid-cols-2 gap-2 p-1 rounded-[16px] bg-[#111] border border-[#2c2c2e]">
                                            <input type="number" placeholder="HH" className="w-full p-3 bg-black rounded-[12px] text-white text-center font-bold text-[18px] focus:outline-none tabular-nums" />
                                            <input type="number" placeholder="MM" className="w-full p-3 bg-black rounded-[12px] text-white text-center font-bold text-[18px] focus:outline-none tabular-nums" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col justify-end">
                                        <button className="w-full p-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-[16px] text-[14px]">ACTIVE</button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                                <button className="w-full py-4 bg-white text-black font-bold rounded-[16px] active:scale-[0.98] transition-transform text-[16px]">Schedule Task</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            )}
        </div>
    )
}
