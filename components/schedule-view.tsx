"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, CheckSquare, Mail, RefreshCw, Folder, CheckCircle2, Video, MapPin, Users, Type, AlignLeft, AtSign
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | "custom" | "suggested" | null

// ── Opciones Predeterminadas de Creación ──
const CREATE_TEMPLATES = [
    { id: "custom", name: "Custom Schedule", desc: "Create a personalized event", icon: <CalendarDays className="w-6 h-6 text-white" /> },
    { id: "email", name: "Compose & Schedule Email", desc: "Draft Gmail/Outlook sends with AI", icon: <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" /> },
    { id: "drive", name: "Schedule Drive Upload", desc: "Automate file transfers to Drive", icon: <img src="/drive.png" alt="Drive" className="w-6 h-6 object-contain" /> },
    { id: "reminder", name: "Personal AI Reminder", desc: "Notifications for your future self", icon: <Bell className="w-6 h-6 text-amber-400" /> },
    { id: "telegram_channel", name: "Schedule Telegram Post", desc: "Send messages to your channels", icon: <Send className="w-6 h-6 text-blue-400" />, soon: true },
] as const;

// ── Elementos "Suggested" ──
const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor run", time: "1:30 – 2 PM", icon: <TrendingUp className="w-[22px] h-[22px] text-white" />, bg: "bg-[#22c55e]" },
    { id: "sug_email", title: "Review AI Emails", time: "2:30 – 3:30 PM", icon: <Mail className="w-[22px] h-[22px] text-white" />, bg: "bg-[#3b82f6]" },
    { id: "sug_tg", title: "Check Channels", time: "7 – 7:30 PM", icon: <CheckSquare className="w-[22px] h-[22px] text-white" />, bg: "bg-[#a855f7]" },
]

// ── Scroll Wheel Picker Component ──
function WheelPicker({ items, value, onChange }: { items: string[], value: string, onChange: (v: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 36 // px

    const handleScroll = () => {
        if (!containerRef.current) return
        const scrollY = containerRef.current.scrollTop
        const index = Math.round(scrollY / itemHeight)
        if (items[index] && items[index] !== value) {
            onChange(items[index])
        }
    }

    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[108px] w-16 overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center"
            style={{ scrollBehavior: "smooth" }}
        >
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
            {items.map((item, i) => {
                const isSelected = item === value
                return (
                    <div 
                        key={i} 
                        className={`h-[36px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${isSelected ? 'text-white text-xl font-bold' : 'text-[#636366] text-lg font-medium'}`}
                        style={{ fontFamily: SFD }}
                    >
                        {item}
                    </div>
                )
            })}
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
        </div>
    )
}

export function ScheduleView() {
    const { setCurrentView } = useApp()
    const [tasks, setTasks] = useState<any[]>([]) 
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    // Modales de Creación
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [configTask, setConfigTask] = useState<{type: ScheduleType, title: string} | null>(null)
    const [loading, setLoading] = useState(false)

    // Estados del formulario dinámico
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")
    const [selSec, setSelSec] = useState("00")

    // ── Generadores del Wheel ──
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const secs = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))

    // ── Lógica del Calendario ──
    const calendarDays = useMemo(() => {
        const days = []
        const today = new Date()
        const currentDayOfWeek = today.getDay() || 7 
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - currentDayOfWeek + 1)

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            days.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                num: d.getDate(),
                isToday: d.toDateString() === today.toDateString()
            })
        }
        return days
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

    // ── Botón Atrás Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        
        if (isEditingMode || showCreateModal || configTask) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (showTimePicker) setShowTimePicker(false)
            else if (configTask) setConfigTask(null)
            else if (showCreateModal) setShowCreateModal(false)
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, showCreateModal, configTask, showTimePicker, setCurrentView])

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

    function openConfig(type: ScheduleType, title: string, soon?: boolean) {
        if (soon) return
        setLoading(true)
        setTimeout(() => {
            setConfigTask({ type, title })
            setShowCreateModal(false)
            setLoading(false)
        }, 400)
    }

    function handleSaveConfig() {
        // Simulamos el guardado de la tarea configurada
        setLoading(true)
        setTimeout(() => {
            setTasks(prev => [{
                id: Date.now(),
                title: configTask?.title || "New Event",
                time: `${selHour}:${selMin}:${selSec}`,
                status: "ACTIVE"
            }, ...prev])
            setConfigTask(null)
            setLoading(false)
        }, 800)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                
                /* Máscaras para el wheel picker (efecto difuminado arriba y abajo) */
                .wheel-mask {
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(50px)" }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.95) 100%)" }} />

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                {/* ── Top Header ── */}
                <div className="pt-10 flex justify-center items-end gap-1">
                    <span className="text-white text-[22px] font-bold" style={{ fontFamily: SFD }}>{monthStr}</span>
                    <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{ fontFamily: SFD }}>{yearStr}</span>
                </div>

                {/* ── Calendar ── */}
                <div className="flex justify-between items-center px-8 mt-8">
                    {calendarDays.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 relative">
                            {day.isToday && <div className="absolute -top-3 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />}
                            <span className="text-[#8e8e93] text-[12px] font-medium" style={{ fontFamily: SF }}>{day.label}</span>
                            <span className={`text-[16px] ${day.isToday ? 'text-white font-bold' : 'text-[#8e8e93] font-medium'}`} style={{ fontFamily: SF }}>
                                {day.num}
                            </span>
                            {day.isToday && <div className="absolute -bottom-2 w-4 h-0.5 bg-white rounded-full" />}
                        </div>
                    ))}
                </div>

                {/* ── Stats ── */}
                <div className="mt-12 flex flex-col items-center">
                    <p className="text-[#8e8e93] text-[14px] font-medium mb-2" style={{ fontFamily: SF }}>Schedule</p>
                    <div className="flex items-center gap-4 text-[22px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-[22px] h-[22px] text-[#8e8e93] stroke-[2]" />
                            <span>{tasks.length} events</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bell className="w-[22px] h-[22px] text-[#8e8e93] stroke-[2]" />
                            <span>0 reminders</span>
                        </div>
                    </div>
                </div>

                {/* ── Highlights ── */}
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

                {/* ── Suggested / Tasks ── */}
                <div className="px-5 mt-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>Suggested</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {SUGGESTIONS.map((sug, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => openConfig("suggested", sug.title)}
                                className="flex items-center justify-between bg-[#111] border border-[#1c1c1e] p-4 rounded-[20px] active:scale-[0.98] transition-transform text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full ${sug.bg} flex items-center justify-center shadow-lg`}>
                                        {sug.icon}
                                    </div>
                                    <span className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>{sug.title}</span>
                                </div>
                                <span className="text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>{sug.time}</span>
                            </button>
                        ))}
                    </div>

                    {tasks.length > 0 && (
                        <div className="space-y-3 mt-8">
                            <p className="text-white text-[15px] font-medium mb-4 px-1" style={{ fontFamily: SF }}>Active Events</p>
                            {tasks.map(task => (
                                <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                    <div className="bg-[#111] border border-[#1c1c1e] rounded-[20px] p-5 flex items-center justify-between">
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
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)" }}>
                <div className="pointer-events-auto flex items-center" style={{
                    borderRadius: "100px", padding: "6px", gap: "4px", background: "rgba(15, 15, 15, 0.75)",
                    backdropFilter: "blur(40px) saturate(200%) brightness(1.1)", WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.1)",
                    border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
                }}>
                    <button disabled className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed">
                        <Search className="w-6 h-6 text-[#8e8e93]" />
                    </button>

                    <button onClick={() => handleNavTabClick("tasks")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}>
                        <CalendarDays className="w-6 h-6" />
                        {activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />}
                    </button>

                    <button onClick={() => handleNavTabClick("edit")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${isEditingMode ? "bg-white text-black" : "text-white"}`}>
                        <Pencil className="w-6 h-6" />
                        {isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}
                    </button>

                    <div className="w-px h-10 bg-white/10 mx-1" />

                    <button onClick={() => handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10">
                        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* ── MODAL: SELECCIONAR PLANTILLA ── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full rounded-t-[32px] p-6 space-y-4 animate-in slide-in-from-bottom duration-400 max-h-[85vh] overflow-y-auto" style={{ background: "#1c1c1e", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: SF }}>
                        <div className="w-12 h-1.5 bg-[#3a3a3c] rounded-full mx-auto mb-4" />
                        <h3 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>Create New</h3>
                        <div className="pt-2 space-y-3">
                            {CREATE_TEMPLATES.map(item => (
                                <button key={item.id} onClick={() => openConfig(item.id, item.name, item.soon)} disabled={item.soon} className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-colors text-left bg-[#111] border border-[#2c2c2e] ${item.soon ? 'opacity-30 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        {item.soon ? <Lock className="w-5 h-5 text-[#8e8e93]" /> : item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-[16px] font-medium">{item.name}</p>
                                        <p className="text-[13px] opacity-70 mt-0.5 text-[#8e8e93]">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
                    </div>
                </div>
            )}

            {/* ── MODAL: PANEL DE CONFIGURACIÓN DINÁMICO (Estilo iOS Reference) ── */}
            {configTask && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigTask(null); setShowTimePicker(false); }} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col" style={{ background: "#1c1c1e", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: SF }}>
                        <div className="w-12 h-1.5 bg-[#3a3a3c] rounded-full mx-auto mb-2 shrink-0" />
                        
                        <div className="flex items-center justify-between mb-6 pt-2">
                            <h3 className="text-white font-bold text-[28px] tracking-tight" style={{ fontFamily: SFD }}>{configTask.title.length > 15 ? "Setup Event" : configTask.title}</h3>
                            <button onClick={() => { setConfigTask(null); setShowTimePicker(false); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70">
                                <X className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 no-scrollbar pb-8">
                            <div className="bg-[#111] rounded-[24px] p-2 space-y-1">
                                
                                {/* ── Fila de Tiempo (Expansible con el Scroll Wheel) ── */}
                                <div className="flex flex-col border-b border-[#2c2c2e]">
                                    <button onClick={() => setShowTimePicker(!showTimePicker)} className="flex items-center justify-between w-full p-3 active:bg-[#1c1c1e] rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-[#8e8e93]" />
                                            <span className="text-white text-[16px] font-medium">Time</span>
                                        </div>
                                        <span className="text-[#8e8e93] text-[16px]">{selHour}:{selMin}:{selSec}</span>
                                    </button>

                                    {/* ── Scroll Wheel Animado ── */}
                                    {showTimePicker && (
                                        <div className="flex items-center justify-center gap-4 py-4 bg-[#0a0a0a] rounded-xl my-2 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                            <WheelPicker items={hours} value={selHour} onChange={setSelHour} />
                                            <span className="text-xl font-bold text-[#636366]">:</span>
                                            <WheelPicker items={mins} value={selMin} onChange={setSelMin} />
                                            <span className="text-xl font-bold text-[#636366]">:</span>
                                            <WheelPicker items={secs} value={selSec} onChange={setSelSec} />
                                        </div>
                                    )}
                                </div>

                                {/* ── Filas Dinámicas según el tipo ── */}
                                {configTask.type === "custom" || configTask.type === "suggested" ? (
                                    <>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><Type className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Title</span></div>
                                            <input type="text" placeholder="Add" className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><AlignLeft className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Description</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Optional</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><Users className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Participants</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Add</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><Video className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Conferencing</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Google Meet</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Location</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Remote</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><CalendarDays className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Calendar</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Personal</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3">
                                            <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Reminders</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">10 min</span>
                                        </div>
                                    </>
                                ) : configTask.type === "email" ? (
                                    <>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><AtSign className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Recipient</span></div>
                                            <input type="email" placeholder="client@ex.com" className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3">
                                            <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">AI Prompt</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Draft follow-up</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><CalendarDays className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Date</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Tomorrow</span>
                                        </div>
                                        <div className="flex items-center justify-between w-full p-3 border-b border-[#2c2c2e]">
                                            <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Repeat</span></div>
                                            <span className="text-[#8e8e93] text-[16px]">Never</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-6">
                                <button onClick={handleSaveConfig} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px]">
                                    Save Schedule
                                </button>
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
