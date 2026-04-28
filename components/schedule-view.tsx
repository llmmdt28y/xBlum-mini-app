"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"

// ── Icon Dictionary ──
const ICON_MAP: Record<string, React.ReactNode> = {
    CalendarDays: <CalendarDays className="w-5 h-5" />,
    Clock: <Clock className="w-5 h-5" />,
    Bell: <Bell className="w-5 h-5" />,
    Mail: <Mail className="w-5 h-5" />,
    Folder: <Folder className="w-5 h-5" />,
    Dumbbell: <Dumbbell className="w-5 h-5" />,
    Briefcase: <Briefcase className="w-5 h-5" />,
    Laptop: <Laptop className="w-5 h-5" />,
    Utensils: <Utensils className="w-5 h-5" />,
    MessageSquare: <MessageSquare className="w-5 h-5" />,
    Send: <Send className="w-5 h-5" />,
    Coffee: <Coffee className="w-5 h-5" />
}

// ── Event Types para el Wheel Picker ──
const EVENT_TYPES = [
    "Custom Event", 
    "Personal Reminder", 
    "Schedule Email", 
    "Drive Upload", 
    "Workout / Gym", 
    "Deep Work", 
    "Meal Time", 
    "Send Message"
]

// ── Sugerencias (Réplica exacta de la lista) ──
const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor run", time: "1:30 – 2 PM", icon: <TrendingUp className="w-[18px] h-[18px] text-[#22c55e]" />, bg: "bg-[#22c55e]/20" },
    { id: "sug_email", title: "Apply to YC", time: "2:30 – 3:30 PM", icon: <CheckSquare className="w-[18px] h-[18px] text-[#3b82f6]" />, bg: "bg-[#3b82f6]/20" },
    { id: "sug_tg", title: "Order vitamin D", time: "7 – 7:30 PM", icon: <CheckSquare className="w-[18px] h-[18px] text-[#a855f7]" />, bg: "bg-[#a855f7]/20" },
]

// ── Scroll Wheel Picker Component ──
function WheelPicker({ items, value, onChange, suffix = "" }: { items: string[], value: string, onChange: (v: string) => void, suffix?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 40 

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
            className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center"
            style={{ scrollBehavior: "smooth" }}
        >
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
            {items.map((item, i) => {
                const isSelected = item === value
                return (
                    <div 
                        key={i} 
                        className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${isSelected ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px] font-medium'}`}
                        style={{ fontFamily: SFD }}
                    >
                        {item}{suffix && isSelected ? <span className="text-[14px] ml-1 text-[#8e8e93]">{suffix}</span> : ""}
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
    
    // Modal de Creación
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states
    const [activePicker, setActivePicker] = useState<string | null>(null) // "type", "time", "date", "reminder", "icon"
    
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")
    const [taskEmailRec, setTaskEmailRec] = useState("")
    
    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")
    const [selMonth, setSelMonth] = useState("Sep")
    const [selDayNum, setSelDayNum] = useState("23")
    const [selRemMin, setSelRemMin] = useState("10")
    const [selRemSec, setSelRemSec] = useState("00")

    // Generators
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const secs = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = Array.from({length: 31}, (_, i) => (i + 1).toString())

    // ── Update fields dynamically based on Event Type ──
    useEffect(() => {
        if(eventType === "Workout / Gym") { setTaskIcon("Dumbbell"); setTaskTitle("Workout") }
        else if(eventType === "Deep Work") { setTaskIcon("Laptop"); setTaskTitle("Deep Work Session") }
        else if(eventType === "Meal Time") { setTaskIcon("Utensils"); setTaskTitle("Lunch Break") }
        else if(eventType === "Schedule Email") { setTaskIcon("Mail"); setTaskTitle("Send Email") }
        else if(eventType === "Send Message") { setTaskIcon("MessageSquare"); setTaskTitle("Send Message") }
        else if(eventType === "Drive Upload") { setTaskIcon("Folder"); setTaskTitle("Backup to Drive") }
        else if(eventType === "Personal Reminder") { setTaskIcon("Bell"); setTaskTitle("Reminder") }
        else { setTaskIcon("CalendarDays"); setTaskTitle("") }
    }, [eventType])

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
        
        if (isEditingMode || configModalOpen) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (activePicker) setActivePicker(null)
            else if (configModalOpen) setConfigModalOpen(false)
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, configModalOpen, activePicker, setCurrentView])

    function handleNavTabClick(tab: NavTab) {
        if (tab === "search") return; 
        if (tab === "edit") {
            setIsEditingMode(!isEditingMode)
            setActiveNavTab(isEditingMode ? "tasks" : "edit")
        } else if (tab === "create") {
            setIsEditingMode(false) 
            setConfigModalOpen(true)
            setActiveNavTab("create")
        } else {
            setIsEditingMode(false)
            setConfigModalOpen(false)
            setActiveNavTab(tab)
        }
    }

    function togglePicker(picker: string) {
        if (activePicker === picker) setActivePicker(null)
        else setActivePicker(picker)
    }

    function handleSaveConfig() {
        setLoading(true)
        setTimeout(() => {
            setTasks(prev => [{
                id: Date.now(),
                title: taskTitle || eventType,
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                iconName: taskIcon,
                status: "ACTIVE"
            }, ...prev])
            setConfigModalOpen(false)
            setActivePicker(null)
            setLoading(false)
            setActiveNavTab("tasks")
        }, 600)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(60px)" }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(17,17,17,0.4) 0%, rgba(17,17,17,1) 100%)" }} />

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
                            <CalendarDays className="w-6 h-6 text-[#8e8e93] stroke-[2]" />
                            <span>{tasks.length} events</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bell className="w-6 h-6 text-[#8e8e93] stroke-[2]" />
                            <span>0 reminders</span>
                        </div>
                    </div>
                </div>

                {/* ── Highlights ── */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2 rounded-full border border-[#2c2c2e]">
                        <Moon className="w-4 h-4 text-[#f59e0b]" />
                        <span className="text-[#f59e0b] text-[14px] font-medium" style={{ fontFamily: SF }}>Morning grogginess <span className="opacity-60 font-normal">15m left</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2 rounded-full border border-[#2c2c2e]">
                        <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-[#22c55e] text-[14px] font-medium" style={{ fontFamily: SF }}>Alertness rise <span className="opacity-60 font-normal">in 45m</span></span>
                    </div>
                </div>

                {/* ── Dynamic Replace: Suggested vs Active Tasks ── */}
                <div className="px-5 mt-10">
                    {tasks.length === 0 ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#8e8e93]" />
                                    <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Suggested</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center"><ThumbsUp className="w-3.5 h-3.5 text-[#8e8e93]" /></div>
                                    <div className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center"><ThumbsDown className="w-3.5 h-3.5 text-[#8e8e93]" /></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => { setEventType("Custom Event"); setTaskTitle(sug.title.replace('\n',' ')); setConfigModalOpen(true); }}
                                        className="flex items-center justify-between w-full p-4 bg-[#1c1c1e] rounded-[20px] active:scale-[0.98] transition-transform text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-full ${sug.bg} flex items-center justify-center`}>
                                                {sug.icon}
                                            </div>
                                            <span className="text-white text-[16px] font-medium whitespace-pre-line leading-tight" style={{ fontFamily: SF }}>{sug.title}</span>
                                        </div>
                                        <span className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>{sug.time}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <CalendarDays className="w-5 h-5 text-blue-500" />
                                <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Active Events</span>
                            </div>
                            
                            {filteredTasks.length === 0 ? (
                                <div className="p-8 text-center bg-[#1c1c1e] rounded-[28px] border border-dashed border-[#2c2c2e]">
                                    <p className="text-[#636366] font-medium">No events for this selection</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                        <div className="bg-[#1c1c1e] rounded-[24px] p-5 flex items-center justify-between shadow-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center">
                                                    {ICON_MAP[task.iconName] || <CalendarDays className="w-5 h-5 text-white" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-white text-[17px] font-bold" style={{ fontFamily: SFD }}>{task.title}</h3>
                                                    <p className="text-[#8e8e93] text-[13px] mt-0.5">{task.time}</p>
                                                </div>
                                            </div>
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

            {/* ── MODAL: PANEL DE CONFIGURACIÓN ÚNICO ── */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        
                        <div className="flex items-center justify-between mb-4 pt-1">
                            <h3 className="text-white font-bold text-[26px] tracking-tight" style={{ fontFamily: SFD }}>
                                Setup Event
                            </h3>
                            <button onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70">
                                <X className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 no-scrollbar pb-8 space-y-4">
                            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
                                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                                    
                                    {/* ── Type Event Picker ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("type")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                <span className="text-white text-[16px] font-medium">Type</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{eventType}</span>
                                        </button>
                                        {activePicker === "type" && (
                                            <div className="flex items-center justify-center py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={EVENT_TYPES} value={eventType} onChange={setEventType} />
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Icon & Title Row ── */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between w-full p-4 border-b border-[#2c2c2e]">
                                            <button onClick={() => togglePicker("icon")} className="flex items-center gap-3 active:opacity-70">
                                                <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center">
                                                    {ICON_MAP[taskIcon] || <CalendarDays className="w-4 h-4 text-white" />}
                                                </div>
                                                <span className="text-white text-[16px] font-medium">Title</span>
                                            </button>
                                            <input type="text" placeholder="Add" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                        {activePicker === "icon" && (
                                            <div className="grid grid-cols-6 gap-3 py-4 px-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95">
                                                {Object.keys(ICON_MAP).map(key => (
                                                    <button key={key} onClick={() => { setTaskIcon(key); setActivePicker(null); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${taskIcon === key ? 'bg-blue-500 text-white' : 'bg-[#2c2c2e] text-[#8e8e93]'}`}>
                                                        {ICON_MAP[key]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Time Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("time")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                <span className="text-white text-[16px] font-medium">Time</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selHour}:{selMin}</span>
                                        </button>
                                        {activePicker === "time" && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h" />
                                                <span className="text-xl font-bold text-[#636366]">:</span>
                                                <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m" />
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Calendar Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("calendar")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                <span className="text-white text-[16px] font-medium">Calendar</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selMonth} {selDayNum}</span>
                                        </button>
                                        {activePicker === "calendar" && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={months} value={selMonth} onChange={setSelMonth} />
                                                <WheelPicker items={days} value={selDayNum} onChange={setSelDayNum} />
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Dynamic Config Rows ── */}
                                    {eventType === "Schedule Email" && (
                                        <div className="flex items-center justify-between w-full p-4">
                                            <div className="flex items-center gap-3"><AtSign className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Recipient</span></div>
                                            <input type="email" placeholder="client@ex.com" value={taskEmailRec} onChange={e=>setTaskEmailRec(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                    )}

                                    {/* ── Reminders Row ── */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("reminder")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                <span className="text-white text-[16px] font-medium">Reminders</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[16px]">{selRemMin}m {selRemSec}s</span>
                                        </button>
                                        {activePicker === "reminder" && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                                                <WheelPicker items={mins} value={selRemMin} onChange={setSelRemMin} suffix="m" />
                                                <WheelPicker items={secs} value={selRemSec} onChange={setSelRemSec} suffix="s" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Description (Textarea expandible) ── */}
                            <div className="bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-3 pl-2">
                                    <AlignLeft className="w-[20px] h-[20px] text-[#8e8e93]" />
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

                            <div className="mt-4 pb-4">
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

