"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, CheckSquare, Mail, RefreshCw
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | null

// ── Opciones Predeterminadas de Creación (Modal) ──
const CREATE_TEMPLATES = [
    { id: "email", name: "Compose & Schedule Email", desc: "Draft Gmail/Outlook sends with AI", icon: <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" /> },
    { id: "drive", name: "Schedule Drive Upload", desc: "Automate file transfers to Drive", icon: <img src="/drive.png" alt="Drive" className="w-6 h-6 object-contain" /> },
    { id: "reminder", name: "Personal AI Reminder", desc: "Notifications for your future self", icon: <Bell className="w-6 h-6 text-amber-400" /> },
    { id: "telegram_channel", name: "Schedule Telegram Post", desc: "Send messages to your channels", icon: <Send className="w-6 h-6 text-blue-400" />, soon: true },
] as const;

// ── Elementos "Suggested" (Réplica de la imagen) ──
const SUGGESTIONS = [
    { title: "Outdoor run", time: "1:30 – 2 PM", icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { title: "Review AI Emails", time: "2:30 – 3:30 PM", icon: <Mail className="w-4 h-4 text-emerald-400" /> },
    { title: "Check Telegram Channels", time: "7 – 7:30 PM", icon: <CheckSquare className="w-4 h-4 text-emerald-400" /> },
]

export function ScheduleView() {
    const { setCurrentView } = useApp()
    
    // Dejamos tasks vacío por defecto para mostrar la pantalla de "Suggested" según tu petición
    const [tasks, setTasks] = useState<any[]>([]) 
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedTaskConfig, setSelectedTaskConfig] = useState<ScheduleType>(null)
    const [loading, setLoading] = useState(false)

    // ── Lógica del Calendario de la Semana actual ──
    const calendarDays = useMemo(() => {
        const days = []
        const today = new Date()
        const currentDayOfWeek = today.getDay() || 7 // 1 (Mon) a 7 (Sun)
        
        // Empezar desde el Lunes de esta semana
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - currentDayOfWeek + 1)

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            days.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // M, T, W...
                num: d.getDate(),
                isToday: d.toDateString() === today.toDateString()
            })
        }
        return days
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

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
        <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                {/* ── Top Header: Month & Year ── */}
                <div className="pt-10 flex justify-center items-end gap-1">
                    <span className="text-white text-[22px] font-bold" style={{ fontFamily: SFD }}>{monthStr}</span>
                    <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{ fontFamily: SFD }}>{yearStr}</span>
                </div>

                {/* ── Calendar (M a S) ── */}
                <div className="flex justify-between items-center px-8 mt-8">
                    {calendarDays.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 relative">
                            {day.isToday && (
                                <div className="absolute -top-3 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
                            )}
                            <span className="text-[#8e8e93] text-[12px] font-medium" style={{ fontFamily: SF }}>{day.label}</span>
                            <span className={`text-[16px] ${day.isToday ? 'text-white font-bold' : 'text-[#8e8e93] font-medium'}`} style={{ fontFamily: SF }}>
                                {day.num}
                            </span>
                            {day.isToday && (
                                <div className="absolute -bottom-2 w-4 h-0.5 bg-white rounded-full" />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Schedule Stats ── */}
                <div className="mt-12 flex flex-col items-center">
                    <p className="text-[#8e8e93] text-[14px] font-medium mb-2" style={{ fontFamily: SF }}>Schedule</p>
                    <div className="flex items-center gap-4 text-[22px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-[22px] h-[22px] text-[#8e8e93] stroke-[2]" />
                            <span>1 event</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bell className="w-[22px] h-[22px] text-[#8e8e93] stroke-[2]" />
                            <span>3 reminders</span>
                        </div>
                    </div>
                </div>

                {/* ── Destacados (Highlighted Pills) ── */}
                <div className="mt-5 flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-1.5 rounded-full">
                        <Moon className="w-4 h-4 text-[#f59e0b]" />
                        <span className="text-[#f59e0b] text-[13px] font-medium" style={{ fontFamily: SF }}>Morning routine <span className="opacity-60 font-normal">15m left</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-1.5 rounded-full">
                        <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-[#22c55e] text-[13px] font-medium" style={{ fontFamily: SF }}>Alertness rise <span className="opacity-60 font-normal">in 45m</span></span>
                    </div>
                </div>

                {/* ── Suggested Section / Active Tasks ── */}
                <div className="px-5 mt-10">
                    {tasks.length === 0 ? (
                        <>
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>Suggested</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-[#111] p-4 rounded-[20px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-[#1c1c1e] flex items-center justify-center">
                                                {sug.icon}
                                            </div>
                                            <span className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>{sug.title}</span>
                                        </div>
                                        <span className="text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>{sug.time}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-white text-[15px] font-medium mb-4 px-1" style={{ fontFamily: SF }}>Active Reminders</p>
                            {tasks.map(task => (
                                <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                    <div className="bg-[#111] rounded-[20px] p-5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-white text-[16px] font-bold">{task.title}</h3>
                                            <p className="text-[#8e8e93] text-[13px] mt-1">{task.time}</p>
                                        </div>
                                    </div>
                                    {isEditingMode && (
                                        <button 
                                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}
                    >
                        <CalendarDays className="w-6 h-6" />
                        {activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />}
                    </button>

                    <button 
                        onClick={() => handleNavTabClick("edit")}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${isEditingMode ? "bg-white text-black" : "text-white"}`}
                    >
                        <Pencil className="w-6 h-6" />
                        {isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}
                    </button>

                    <div className="w-px h-10 bg-white/10 mx-1" />

                    <button 
                        onClick={() => handleNavTabClick("create")}
                        className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10"
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
