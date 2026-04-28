"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo } from "react"
import { 
  Mail, CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, RefreshCw, Video, UserCircle2, Pencil, Search, X, Star, Trash2
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | null

// ── Estilos de Etiquetas (Tags) ──
const TAG_COLORS = {
    blue:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    green:  "bg-green-500/15 text-green-400 border-green-500/20",
    sky:    "bg-sky-500/15 text-sky-400 border-sky-500/20",
    rose:   "bg-rose-500/15 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
} as const;

// ── Mock de Tareas Programadas con Fechas ──
const INITIAL_TASKS = [
    { 
        id: 1, 
        date: new Date().toDateString(),
        type: "telegram_channel", 
        title: "Weekly Community Update", 
        status: "Active",
        tags: [
          { text: "March 09 — 16", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "blue" },
          { text: "Weekly", icon: <RefreshCw className="w-3.5 h-3.5" />, color: "orange" },
          { text: "Zoom Meeting", icon: <Video className="w-3.5 h-3.5 fill-current" />, color: "green" },
          { text: "Channel Update", icon: <Send className="w-3.5 h-3.5 fill-current" />, color: "sky" },
          { text: "12:00 — 13:00", icon: <Clock className="w-3.5 h-3.5 fill-current" />, color: "purple" },
        ] as const
    },
    { id: 2, date: new Date(Date.now() + 86400000).toDateString(), type: "reminder", title: "Review Q3 Report", status: "Pending", time: "Tomorrow, 09:00 AM" },
    { id: 3, date: new Date().toDateString(), type: "email", title: "Partnership Follow-up", status: "Pending", time: "Today, 02:00 PM" },
]

const SUGGESTIONS = [
    { title: "Schedule an AI Email flow", icon: <Mail className="w-4 h-4 text-red-400" /> },
    { title: "Set a morning briefing", icon: <Bell className="w-4 h-4 text-amber-400" /> },
    { title: "Automate weekly Drive backup", icon: <RefreshCw className="w-4 h-4 text-green-400" /> },
    { title: "Draft Telegram announcement", icon: <Send className="w-4 h-4 text-blue-400" /> },
]

export function ScheduleView() {
    const { setCurrentView } = useApp()
    const [tasks, setTasks] = useState(INITIAL_TASKS)
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    // ── Lógica del Calendario de la Semana ──
    const calendarDays = useMemo(() => {
        const days = []
        const startOfWeek = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(startOfWeek.getDate() + i)
            days.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), // M, T, W...
                num: d.getDate(),
                isToday: d.toDateString() === new Date().toDateString()
            })
        }
        return days
    }, [])

    const monthYear = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

    const filteredTasks = useMemo(() => {
        if (selectedDate === "All") return tasks
        return tasks.filter(t => t.date === selectedDate)
    }, [tasks, selectedDate])

    // ── Botón Atrás de Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        if (isEditingMode || showCreateModal) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (showCreateModal) setShowCreateModal(false)
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, showCreateModal, setCurrentView])

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-black text-white select-none overflow-hidden">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(50px)" }} />

            <div className="relative z-10 flex-1 flex flex-col">
                
                {/* ── Top Calendar Header ── */}
                <div className="pt-12 px-6 space-y-4">
                    <p className="text-[#8e8e93] font-bold text-sm tracking-widest uppercase" style={{ fontFamily: SF }}>{monthYear}</p>
                    
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        <button 
                            onClick={() => setSelectedDate("All")}
                            className={`shrink-0 w-12 h-14 rounded-2xl flex items-center justify-center font-bold transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#111] text-[#8e8e93] border border-[#1c1c1e]"}`}
                        >
                            All
                        </button>
                        <div className="w-px h-8 bg-[#1c1c1e] mx-1 shrink-0" />
                        {calendarDays.map((day) => (
                            <button 
                                key={day.full}
                                onClick={() => setSelectedDate(day.full)}
                                className={`shrink-0 w-12 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${selectedDate === day.full ? "bg-[#3b82f6] border-[#3b82f6] text-white" : "bg-[#111] border-[#1c1c1e] text-[#8e8e93]"}`}
                            >
                                <span className="text-[10px] uppercase font-bold">{day.label}</span>
                                <span className="text-lg font-bold">{day.num}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-8">
                    
                    {/* ── Main Schedule Title & Stats ── */}
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <p className="text-[#3b82f6] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: SF }}>Schedule</p>
                        <h1 className="text-[42px] font-bold leading-none tracking-tighter" style={{ fontFamily: SFD }}>My Plan</h1>
                        
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-[#8e8e93]" />
                                <span className="text-xl font-bold">{tasks.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-[#8e8e93]" />
                                <span className="text-xl font-bold">{tasks.filter(t => t.type === 'reminder').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Suggested Section ── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            </div>
                            <p className="text-sm font-bold text-[#8e8e93] uppercase tracking-wider">Suggested</p>
                        </div>

                        <div className="space-y-3">
                            {SUGGESTIONS.map((sug, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-4 bg-[#111] border border-[#1c1c1e] rounded-[24px] active:scale-[0.98] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                                            {sug.icon}
                                        </div>
                                        <p className="text-[15px] font-medium text-[#c7c7cc]">{sug.title}</p>
                                    </div>
                                    <Plus className="w-5 h-5 text-[#48484a]" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Tasks List ── */}
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-[#8e8e93] uppercase tracking-wider px-1">
                            {selectedDate === "All" ? "All Activity" : "For this day"}
                        </p>
                        
                        {filteredTasks.length === 0 ? (
                            <div className="p-10 text-center bg-[#111] rounded-[32px] border border-dashed border-[#1c1c1e]">
                                <p className="text-[#48484a] font-medium">No plans for this selection</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTasks.map(task => (
                                    <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                        <div className="p-6 bg-[#111] border border-[#1c1c1e] rounded-[32px] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold tracking-tight">{task.title}</h3>
                                                <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg uppercase">{task.status}</span>
                                            </div>

                                            {task.tags && (
                                                <div className="flex flex-wrap gap-2">
                                                    {task.tags.map((tag, idx) => (
                                                        <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${TAG_COLORS[tag.color]}`}>
                                                            {tag.icon}
                                                            <span className="font-bold text-[11px] tracking-tight">{tag.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {isEditingMode && (
                                            <button 
                                                onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-black"
                                            >
                                                <Trash2 className="w-4 h-4 text-white fill-current" />
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
            <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="pointer-events-auto flex items-center p-1.5 bg-[#0f0f0f]/80 backdrop-blur-3xl border border-white/5 rounded-full shadow-2xl">
                    <button className="w-14 h-14 rounded-full flex items-center justify-center opacity-20"><Search className="w-6 h-6" /></button>
                    <button 
                        onClick={() => { setIsEditingMode(false); setActiveNavTab("tasks") }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}
                    >
                        <CalendarDays className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => { setIsEditingMode(true); setActiveNavTab("edit") }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeNavTab === "edit" ? "bg-white text-black" : "text-white"}`}
                    >
                        <Pencil className="w-6 h-6" />
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10"
                    >
                        <Plus className="w-7 h-7 text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}

