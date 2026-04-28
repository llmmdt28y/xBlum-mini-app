"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, CheckSquare, Mail, Type, AlignLeft, AtSign, Folder
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | "custom" | "suggested" | null

// ── Plantillas de Creación ──
const CREATE_TEMPLATES = [
    { id: "custom", name: "Custom Schedule", desc: "Create a personalized event", icon: <CalendarDays className="w-6 h-6 text-white" /> },
    { id: "email", name: "Compose & Schedule Email", desc: "Draft Gmail/Outlook sends with AI", icon: <img src="/gmail.png" alt="Gmail" className="w-6 h-6 object-contain" /> },
    { id: "drive", name: "Schedule Drive Upload", desc: "Automate file transfers to Drive", icon: <img src="/drive.png" alt="Drive" className="w-6 h-6 object-contain" /> },
    { id: "reminder", name: "Personal AI Reminder", desc: "Notifications for your future self", icon: <Bell className="w-6 h-6 text-amber-400" /> },
    { id: "telegram_channel", name: "Schedule Telegram Post", desc: "Send messages to your channels", icon: <Send className="w-6 h-6 text-blue-400" />, soon: true },
] as const;

// ── Sugerencias Compactas ──
const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor\nrun", time: "1:30 – 2 PM", icon: <TrendingUp className="w-5 h-5 text-white" />, bg: "bg-[#22c55e]" },
    { id: "sug_email", title: "Review\nEmails", time: "2:30 – 3:30 PM", icon: <Mail className="w-5 h-5 text-white" />, bg: "bg-[#3b82f6]" },
    { id: "sug_tg", title: "Check\nChannels", time: "7 – 7:30 PM", icon: <CheckSquare className="w-5 h-5 text-white" />, bg: "bg-[#a855f7]" },
]

// ── Scroll Wheel Picker Component ──
function WheelPicker({ items, value, onChange, suffix = "" }: { items: string[], value: string, onChange: (v: string) => void, suffix?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 36 

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
                        className={`h-[36px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${isSelected ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px] font-medium'}`}
                        style={{ fontFamily: SFD }}
                    >
                        {item}{suffix && isSelected ? <span className="text-[14px] ml-0.5 text-[#8e8e93]">{suffix}</span> : ""}
                    </div>
                )
            })}
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
        </div>
    )
}

export function ScheduleView() {
    const { setCurrentView } = useApp()
    
    // Inicia vacío para mostrar Suggestions, cuando se agregue uno cambiará a Active Events
    const [tasks, setTasks] = useState<any[]>([]) 
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [configTask, setConfigTask] = useState<{type: ScheduleType, title: string} | null>(null)
    const [loading, setLoading] = useState(false)

    // Form states
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [showCalendarPicker, setShowCalendarPicker] = useState(false)
    const [showReminderPicker, setShowReminderPicker] = useState(false)

    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")
    
    const [selMonth, setSelMonth] = useState("Sep")
    const [selDayNum, setSelDayNum] = useState("23")
    
    const [selRemMin, setSelRemMin] = useState("10")
    const [selRemSec, setSelRemSec] = useState("00")

    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")

    // Generators
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = Array.from({length: 31}, (_, i) => (i + 1).toString())

    // ── Lógica del Calendario Superior ──
    const calendarDays = useMemo(() => {
        const arr = []
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1)

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            arr.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                num: d.getDate().toString(),
                isToday: d.toDateString() === today.toDateString()
            })
        }
        return arr
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

    const filteredTasks = useMemo(() => {
        if (selectedDate === "All") return tasks
        return tasks.filter(t => t.date === selectedDate)
    }, [tasks, selectedDate])

    // ── Botón Atrás Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        
        if (isEditingMode || showCreateModal || configTask) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (showTimePicker) setShowTimePicker(false)
            else if (showCalendarPicker) setShowCalendarPicker(false)
            else if (showReminderPicker) setShowReminderPicker(false)
            else if (configTask) setConfigTask(null)
            else if (showCreateModal) setShowCreateModal(false)
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, showCreateModal, configTask, showTimePicker, showCalendarPicker, showReminderPicker, setCurrentView])

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
        setTaskTitle(type === "custom" ? "" : title)
        setTimeout(() => {
            setConfigTask({ type, title })
            setShowCreateModal(false)
            setLoading(false)
        }, 400)
    }

    function handleSaveConfig() {
        setLoading(true)
        setTimeout(() => {
            setTasks(prev => [{
                id: Date.now(),
                title: taskTitle || configTask?.title || "New Event",
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                status: "PENDING"
            }, ...prev])
            setConfigTask(null)
            setLoading(false)
        }, 600)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(50px)" }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.95) 100%)" }} />

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                {/* ── Top Header ── */}
                <div className="pt-10 flex justify-center items-end gap-1">
                    <span className="text-white text-[22px] font-bold" style={{ fontFamily: SFD }}>{monthStr}</span>
                    <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{ fontFamily: SFD }}>{yearStr}</span>
                </div>

                {/* ── Calendar (M a S) ── */}
                <div className="flex justify-between items-center px-6 mt-8">
                    {/* ALL Button */}
                    <button 
                        onClick={() => setSelectedDate("All")}
                        className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}
                    >
                        <span className="text-[14px] font-bold" style={{ fontFamily: SF }}>All</span>
                    </button>

                    <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0" />

                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.full
                        let dotClass = ""
                        if (isSelected) dotClass = "bg-blue-500"
                        else if (day.isToday) dotClass = "bg-[#ef4444]"

                        return (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedDate(day.full)}
                                className={`flex flex-col items-center gap-1.5 relative w-10 transition-all ${isSelected ? "opacity-100" : "opacity-60"}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${dotClass}`} style={{ opacity: dotClass ? 1 : 0 }} />
                                <span className={`text-[12px] font-medium ${isSelected ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>{day.label}</span>
                                <span className={`text-[16px] font-bold ${isSelected ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>{day.num}</span>
                            </button>
                        )
                    })}
                </div>

                {/* ── Stats ── */}
                <div className="mt-10 flex flex-col items-center">
                    <p className="text-[#8e8e93] text-[14px] font-bold tracking-widest uppercase mb-3" style={{ fontFamily: SF }}>Schedule</p>
                    <div className="flex items-center gap-6 text-[26px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-6 h-6 text-white stroke-[2.5]" />
                            <span>{tasks.length} events</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bell className="w-6 h-6 text-white stroke-[2.5]" />
                            <span>0 reminders</span>
                        </div>
                    </div>
                </div>

                {/* ── Highlights ── */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-1.5 rounded-full border border-[#2c2c2e]">
                        <Moon className="w-4 h-4 text-[#f59e0b]" />
                        <span className="text-[#f59e0b] text-[14px] font-medium" style={{ fontFamily: SF }}>Morning grogginess <span className="opacity-60 font-normal">15m left</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-1.5 rounded-full border border-[#2c2c2e]">
                        <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-[#22c55e] text-[14px] font-medium" style={{ fontFamily: SF }}>Alertness rise <span className="opacity-60 font-normal">in 45m</span></span>
                    </div>
                </div>

                {/* ── Dynamic Replace: Suggested vs Active Tasks ── */}
                <div className="px-5 mt-10">
                    {tasks.length === 0 ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-white text-[16px] font-bold tracking-wide" style={{ fontFamily: SF }}>Suggested</span>
                            </div>

                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => openConfig("suggested", sug.title)}
                                        className="shrink-0 w-[115px] h-[110px] flex flex-col justify-between p-3.5 bg-[#111] border border-[#1c1c1e] rounded-[24px] active:scale-[0.96] transition-transform text-left"
                                    >
                                        <div className="flex items-start justify-between w-full">
                                            <div className={`w-9 h-9 rounded-full ${sug.bg} flex items-center justify-center shadow-lg`}>
                                                {sug.icon}
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <span className="text-white text-[14px] font-medium leading-tight whitespace-pre-line" style={{ fontFamily: SF }}>{sug.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <CalendarDays className="w-5 h-5 text-blue-500" />
                                <span className="text-white text-[18px] font-bold tracking-wide" style={{ fontFamily: SF }}>Active Events</span>
                            </div>
                            
                            {filteredTasks.length === 0 ? (
                                <div className="p-8 text-center bg-[#111] rounded-[28px] border border-dashed border-[#1c1c1e]">
                                    <p className="text-[#636366] font-medium">No events for this selection</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                        <div className="bg-[#111] border border-[#1c1c1e] rounded-[28px] p-5 flex items-center justify-between shadow-lg">
                                            <div>
                                                <h3 className="text-white text-[18px] font-bold" style={{ fontFamily: SFD }}>{task.title}</h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#8e8e93]" />
                                                    <p className="text-[#8e8e93] text-[14px]">{task.time}</p>
                                                </div>
                                            </div>
                                            <span className="bg-blue-500/15 text-blue-500 px-3 py-1 rounded-[10px] text-[10px] font-black tracking-wider uppercase">
                                                {task.status}
                                            </span>
                                        </div>
                                        {isEditingMode && (
                                            <button 
                                                onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-black active:scale-90 transition-transform z-10"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Liquid Bottom NavBar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)" }}>
                <div className="pointer-events-auto flex items-center p-1.5 gap-1 bg-[#0f0f0f]/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl">
                    <button disabled className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed">
                        <Search className="w-6 h-6 text-[#8e8e93]" />
                    </button>
                    <button onClick={() => handleNavTabClick("tasks")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}>
                        <CalendarDays className="w-6 h-6" />
                        {activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />}
                    </button>
                    <button onClick={() => handleNavTabClick("edit")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${isEditingMode ? "bg-white text-black" : "text-white"}`}>
                        <Pencil className="w-6 h-6" />
                        {isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    <button onClick={() => handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10">
                        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* ── MODAL: SELECCIONAR PLANTILLA ── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full rounded-t-[32px] p-6 space-y-4 animate-in slide-in-from-bottom duration-400 max-h-[85vh] overflow-y-auto bg-[#1c1c1e]">
                        <h3 className="text-white font-bold text-[24px] mt-2 mb-1" style={{ fontFamily: SFD }}>Create New</h3>
                        <div className="space-y-3 pb-8">
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
                    </div>
                </div>
            )}

            {/* ── MODAL: PANEL DE CONFIGURACIÓN (Estilo iOS) ── */}
            {configTask && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigTask(null); setShowTimePicker(false); setShowCalendarPicker(false); setShowReminderPicker(false); }} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col bg-[#1c1c1e]">
                        
                        <div className="flex items-center justify-between mb-4 pt-1">
                            <h3 className="text-white font-bold text-[26px] tracking-tight" style={{ fontFamily: SFD }}>
                                {configTask.type === "custom" || configTask.type === "suggested" ? "Custom Schedule" : configTask.title}
                            </h3>
                            <button onClick={() => { setConfigTask(null); setShowTimePicker(false); setShowCalendarPicker(false); setShowReminderPicker(false); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70">
                                <X className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 no-scrollbar pb-8 space-y-4">
                            <div className="bg-[#111] rounded-[28px] p-2">
                                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                                    
                                    {/* ── Time Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => { setShowTimePicker(!showTimePicker); setShowCalendarPicker(false); setShowReminderPicker(false); }} className="flex items-center justify-between w-full p-4 active:bg-[#1c1c1e] rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-[20px] h-[20px] text-white" />
                                                <span className="text-white text-[16px] font-medium">Time</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selHour}:{selMin}</span>
                                        </button>
                                        {showTimePicker && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h" />
                                                <span className="text-xl font-bold text-[#636366]">:</span>
                                                <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m" />
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Calendar Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => { setShowCalendarPicker(!showCalendarPicker); setShowTimePicker(false); setShowReminderPicker(false); }} className="flex items-center justify-between w-full p-4 active:bg-[#1c1c1e] rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="w-[20px] h-[20px] text-white" />
                                                <span className="text-white text-[16px] font-medium">Calendar</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selMonth} {selDayNum}</span>
                                        </button>
                                        {showCalendarPicker && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={months} value={selMonth} onChange={setSelMonth} />
                                                <WheelPicker items={days} value={selDayNum} onChange={setSelDayNum} />
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Dynamic Config Rows ── */}
                                    {(configTask.type === "custom" || configTask.type === "reminder" || configTask.type === "suggested") && (
                                        <div className="flex items-center justify-between w-full p-4">
                                            <div className="flex items-center gap-3"><Type className="w-[20px] h-[20px] text-white" /><span className="text-white text-[16px] font-medium">Title</span></div>
                                            <input type="text" placeholder="Add" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                    )}

                                    {configTask.type === "email" && (
                                        <>
                                            <div className="flex items-center justify-between w-full p-4">
                                                <div className="flex items-center gap-3"><AtSign className="w-[20px] h-[20px] text-white" /><span className="text-white text-[16px] font-medium">Recipient</span></div>
                                                <input type="email" placeholder="client@ex.com" className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                            </div>
                                            <div className="flex items-center justify-between w-full p-4">
                                                <div className="flex items-center gap-3"><Sparkles className="w-[20px] h-[20px] text-white" /><span className="text-white text-[16px] font-medium">AI Prompt</span></div>
                                                <span className="text-[#8e8e93] text-[16px]">Draft follow-up</span>
                                            </div>
                                        </>
                                    )}

                                    {/* ── Reminders Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => { setShowReminderPicker(!showReminderPicker); setShowTimePicker(false); setShowCalendarPicker(false); }} className="flex items-center justify-between w-full p-4 active:bg-[#1c1c1e] rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-[20px] h-[20px] text-white" />
                                                <span className="text-white text-[16px] font-medium">Reminders</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selRemMin}m {selRemSec}s</span>
                                        </button>
                                        {showReminderPicker && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={mins} value={selRemMin} onChange={setSelRemMin} suffix="m" />
                                                <WheelPicker items={secs} value={selRemSec} onChange={setSelRemSec} suffix="s" />
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            </div>

                            {/* ── Description (Textarea expandible) ── */}
                            <div className="bg-[#111] rounded-[28px] p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-3 pl-2">
                                    <AlignLeft className="w-[20px] h-[20px] text-white" />
                                    <span className="text-white text-[16px] font-medium">Description</span>
                                </div>
                                <textarea 
                                    rows={3}
                                    placeholder="Optional notes or details..."
                                    value={taskDesc}
                                    onChange={e=>setTaskDesc(e.target.value)}
                                    className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-2 text-[15px] leading-relaxed"
                                    style={{ fontFamily: SF }}
                                />
                            </div>

                            <div className="mt-4">
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
