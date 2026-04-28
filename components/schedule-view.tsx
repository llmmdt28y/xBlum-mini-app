"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, Globe,
  BookOpen, Music, Car, Plane, Wallet, LineChart, PieChart, Activity, Paperclip
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | "custom" | "suggested" | null

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
    Coffee: <Coffee className="w-5 h-5" />,
    BookOpen: <BookOpen className="w-5 h-5" />,
    Music: <Music className="w-5 h-5" />,
    Car: <Car className="w-5 h-5" />,
    Plane: <Plane className="w-5 h-5" />,
    Wallet: <Wallet className="w-5 h-5" />,
    LineChart: <LineChart className="w-5 h-5" />,
    PieChart: <PieChart className="w-5 h-5" />,
    Activity: <Activity className="w-5 h-5" />
}

const THEME_COLORS = [
    { name: "Blue", hex: "#3b82f6" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
]

const TIMEZONES = [
    "Los Angeles (GMT-8)", "Mexico City (GMT-6)", "Bogota / Lima (GMT-5)",
    "New York (GMT-5)", "Caracas (GMT-4)", "Buenos Aires (GMT-3)",
    "London (GMT+0)", "Madrid / Paris (GMT+1)", "Moscow (GMT+3)",
    "Dubai (GMT+4)", "Mumbai (GMT+5:30)", "Tokyo (GMT+9)"
]

const EVENT_TYPES = [
    "Custom Event", "Personal Reminder", "Schedule Email", 
    "Drive Upload", "Telegram Post", "Price Alerts", 
    "Wallet Actions", "Automated Reports", "Workout / Gym", "Deep Work"
]

const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor run", time: "1:30 – 2 PM", icon: <TrendingUp className="w-4 h-4 text-[#22c55e]" />, color: "#22c55e" },
    { id: "sug_email", title: "Review Emails", time: "2:30 – 3:30 PM", icon: <Mail className="w-4 h-4 text-[#3b82f6]" />, color: "#3b82f6" },
    { id: "sug_tg", title: "Check Channels", time: "7 – 7:30 PM", icon: <CheckSquare className="w-4 h-4 text-[#a855f7]" />, color: "#a855f7" },
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
            className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center wheel-mask"
            style={{ scrollBehavior: "smooth" }}
        >
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
            {items.map((item, i) => {
                const isSelected = item === value
                return (
                    <div 
                        key={i} 
                        className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all duration-200 ${isSelected ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px] font-medium'}`}
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
    const [tasks, setTasks] = useState<any[]>([]) 
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    // Modales y Pickers
    const [showTZPicker, setShowTZPicker] = useState(true) 
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [activePicker, setActivePicker] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Form states generales
    const [tz, setTz] = useState("Mexico City (GMT-6)")
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskColor, setTaskColor] = useState("#3b82f6")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")
    const [isPriority, setIsPriority] = useState(false)
    const [attachedFile, setAttachedFile] = useState<File | null>(null) // Para adjuntos
    
    // Form states específicos
    const [emailRec, setEmailRec] = useState("")
    const [driveFolder, setDriveFolder] = useState("/")
    const [tgChannel, setTgChannel] = useState("@mychannel")
    
    // Form states Crypto
    const [cryptoAsset, setCryptoAsset] = useState("TON")
    const [cryptoCondition, setCryptoCondition] = useState("Rises above")
    const [cryptoTarget, setCryptoTarget] = useState("")
    const [walletAction, setWalletAction] = useState("Notify if I receive")
    const [walletAmount, setWalletAmount] = useState("5")
    const [reportType, setReportType] = useState("Weekly Summary")

    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")
    const [selMonth, setSelMonth] = useState("Sep")
    const [selDayNum, setSelDayNum] = useState("23")
    const [selRemMin, setSelRemMin] = useState("10")
    const [selRemSec, setSelRemSec] = useState("00")

    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const secs = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = Array.from({length: 31}, (_, i) => (i + 1).toString())

    // ── Efectos Dinámicos por Tipo de Evento ──
    useEffect(() => {
        if(eventType === "Workout / Gym") { setTaskIcon("Dumbbell"); setTaskTitle("Workout"); setTaskColor("#10b981") }
        else if(eventType === "Deep Work") { setTaskIcon("Laptop"); setTaskTitle("Deep Work Session"); setTaskColor("#8b5cf6") }
        else if(eventType === "Meal Time") { setTaskIcon("Utensils"); setTaskTitle("Lunch Break"); setTaskColor("#f59e0b") }
        else if(eventType === "Schedule Email") { setTaskIcon("Mail"); setTaskTitle("Send Email"); setTaskColor("#f43f5e") }
        else if(eventType === "Drive Upload") { setTaskIcon("Folder"); setTaskTitle("Backup to Drive"); setTaskColor("#10b981") }
        else if(eventType === "Telegram Post") { setTaskIcon("Send"); setTaskTitle("Channel Update"); setTaskColor("#3b82f6") }
        else if(eventType === "Personal Reminder") { setTaskIcon("Bell"); setTaskTitle("Reminder"); setTaskColor("#f59e0b") }
        else if(eventType === "Price Alerts") { setTaskIcon("LineChart"); setTaskTitle("Price Alert"); setTaskColor("#10b981") }
        else if(eventType === "Wallet Actions") { setTaskIcon("Wallet"); setTaskTitle("Wallet Alert"); setTaskColor("#f59e0b") }
        else if(eventType === "Automated Reports") { setTaskIcon("PieChart"); setTaskTitle("Weekly Summary"); setTaskColor("#8b5cf6") }
        else { setTaskIcon("CalendarDays"); setTaskTitle(""); setTaskColor("#3b82f6") }
    }, [eventType])

    // ── Lógica del Calendario Superior ──
    const calendarDays = useMemo(() => {
        const arr = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            arr.push({
                full: d.toDateString(),
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                num: d.getDate().toString(),
                isToday: i === 0
            })
        }
        return arr
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

    const filteredTasks = useMemo(() => {
        if (selectedDate === "All") return tasks.filter(t => !t.isPriority) 
        return tasks.filter(t => t.date === selectedDate && !t.isPriority)
    }, [tasks, selectedDate])

    const priorityTasks = useMemo(() => tasks.filter(t => t.isPriority).slice(0, 2), [tasks])

    // ── Botón Atrás Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        
        if (isEditingMode || configModalOpen || activePicker || showTZPicker) tg.BackButton.show()
        else tg.BackButton.hide()

        const handleBack = () => {
            if (showTZPicker) {
                setShowTZPicker(false)
                setCurrentView("home")
                tg.BackButton.hide()
            } else if (activePicker) {
                setActivePicker(null)
            } else if (configModalOpen) {
                setConfigModalOpen(false)
            } else if (isEditingMode) {
                setIsEditingMode(false); setActiveNavTab("tasks")
            } else {
                setCurrentView("home"); tg.BackButton.hide()
            }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, configModalOpen, activePicker, showTZPicker, setCurrentView])

    function handleNavTabClick(tab: NavTab) {
        if (tab === "search") return; 
        if (tab === "edit") {
            setIsEditingMode(!isEditingMode)
            setActiveNavTab(isEditingMode ? "tasks" : "edit")
        } else if (tab === "create") {
            setIsEditingMode(false) 
            setTaskTitle("")
            setTaskDesc("")
            setAttachedFile(null)
            setEventType("Custom Event")
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

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFile(e.target.files[0])
        }
    }

    function handleSaveConfig() {
        // En una app real, aquí construirías un FormData y harías fetch(backend_url)
        // const formData = new FormData();
        // formData.append("file", attachedFile);
        // formData.append("eventType", eventType);
        
        setLoading(true)
        setTimeout(() => {
            setTasks(prev => [{
                id: Date.now(),
                title: taskTitle || eventType,
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                iconName: taskIcon,
                color: taskColor,
                isPriority: isPriority,
                status: "ACTIVE"
            }, ...prev])
            setConfigModalOpen(false)
            setActivePicker(null)
            setTaskTitle("")
            setTaskDesc("")
            setAttachedFile(null)
            setIsPriority(false)
            setLoading(false)
            setActiveNavTab("tasks")
        }, 600)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-0.5deg); } 50% { transform: rotate(0.5deg); } 100% { transform: rotate(-0.5deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%); }
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
                    <button onClick={() => setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}>
                        <span className="text-[14px] font-bold" style={{ fontFamily: SF }}>All</span>
                    </button>
                    <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0" />
                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.full
                        let dotClass = isSelected ? "bg-blue-500" : day.isToday ? "bg-[#ef4444]" : ""
                        return (
                            <button key={idx} onClick={() => setSelectedDate(day.full)} className={`flex flex-col items-center gap-1.5 relative w-10 transition-all ${isSelected ? "opacity-100" : "opacity-60"}`}>
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

                {/* ── Highlights / Priority Tasks ── */}
                <div className="mt-6 flex flex-col items-center gap-3 px-5">
                    {priorityTasks.length > 0 ? (
                        priorityTasks.map(t => (
                            <div key={t.id} className={`flex items-center gap-3 bg-[#1c1c1e]/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 animate-in zoom-in-95 w-full max-w-[320px] ${isEditingMode ? 'jiggle-card' : ''}`} style={{ boxShadow: `0 0 20px ${t.color}15` }}>
                                <div style={{ color: t.color }}>{ICON_MAP[t.iconName] || <CalendarDays className="w-5 h-5" />}</div>
                                <span className="text-[15px] font-medium" style={{ color: t.color, fontFamily: SF }}>
                                    {t.title} <span className="opacity-60 font-normal ml-1">at {t.time}</span>
                                </span>
                                {isEditingMode && (
                                    <button onClick={() => setTasks(tasks.filter(task => task.id !== t.id))} className="ml-auto w-6 h-6 bg-red-500 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                                        <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="flex items-center gap-3 bg-[#1c1c1e] px-6 py-3 rounded-full border border-[#2c2c2e] w-full max-w-[320px]">
                                <Moon className="w-4 h-4 text-[#f59e0b]" />
                                <span className="text-[#f59e0b] text-[15px] font-medium" style={{ fontFamily: SF }}>Morning grogginess <span className="opacity-60 font-normal ml-1">15m left</span></span>
                            </div>
                            <div className="flex items-center gap-3 bg-[#1c1c1e] px-6 py-3 rounded-full border border-[#2c2c2e] w-full max-w-[320px]">
                                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                                <span className="text-[#22c55e] text-[15px] font-medium" style={{ fontFamily: SF }}>Alertness rise <span className="opacity-60 font-normal ml-1">in 45m</span></span>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Suggested vs Active Tasks ── */}
                <div className="px-5 mt-10 flex flex-col items-center">
                    {tasks.length === 0 ? (
                        <div className="animate-in fade-in duration-500 w-full max-w-[320px]">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <Sparkles className="w-4 h-4 text-[#8e8e93]" />
                                <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Suggested</span>
                            </div>

                            <div className="flex flex-col items-start gap-3 w-full">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => { setEventType("Custom Event"); setTaskTitle(sug.title); setConfigModalOpen(true); }}
                                        className="flex items-center gap-3 bg-[#1c1c1e] px-5 py-3.5 rounded-full border border-[#2c2c2e] w-full active:scale-95 transition-transform"
                                    >
                                        <div className="[&>svg]:w-4 [&>svg]:h-4" style={{ color: sug.color }}>{sug.icon}</div>
                                        <span className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>
                                            {sug.title} <span className="text-[#8e8e93] font-normal ml-1">• {sug.time}</span>
                                        </span>
                                        <Plus className="w-4 h-4 text-[#8e8e93] ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-[320px]">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Active Events</span>
                            </div>
                            
                            <div className="flex flex-col items-start gap-3 w-full">
                                {filteredTasks.length === 0 ? (
                                    <span className="text-[#636366] text-[14px] font-medium">No events for this selection</span>
                                ) : (
                                    filteredTasks.map(task => (
                                        <div key={task.id} className={`relative flex items-center w-full ${isEditingMode ? 'jiggle-card' : ''}`}>
                                            <div className="flex items-center gap-3 bg-[#1c1c1e] px-5 py-3.5 rounded-full border border-[#2c2c2e] w-full">
                                                <div className="[&>svg]:w-4 [&>svg]:h-4" style={{ color: task.color || '#3b82f6' }}>
                                                    {ICON_MAP[task.iconName] || <CalendarDays />}
                                                </div>
                                                <span className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF }}>
                                                    {task.title} <span className="text-[#8e8e93] font-normal ml-1">• {task.time}</span>
                                                </span>
                                            </div>
                                            {isEditingMode && (
                                                <button 
                                                    onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                                                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-xl border border-black active:scale-90 transition-transform z-10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── TON Crypto Card ── */}
                <div className="px-5 mt-12 mb-10 flex justify-center">
                    <div className="w-full max-w-[340px] bg-[#1c1c1e]/80 backdrop-blur-xl border border-[#2c2c2e] rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] rounded-full blur-[80px] opacity-10 pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#2c2c2e] bg-[#1c1c1e] flex items-center justify-center shadow-lg">
                                    <img src="/TON-ICON.png" alt="TON" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-white text-[20px] font-bold leading-none" style={{ fontFamily: SFD }}>TON <span className="text-[#8e8e93] text-[14px] font-medium ml-1">The Open Network</span></h3>
                                    <p className="text-white text-[24px] font-bold tracking-tight mt-1 leading-none">$6.42 <span className="text-[#22c55e] text-[14px] font-medium ml-1">+2.4%</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="h-24 w-full relative z-10 -mx-1 mb-4">
                            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                <path d="M0,40 L0,35 L20,36 L40,32 L60,34 L80,10 L100,5 L100,40 Z" fill="url(#gradChart)" opacity="0.2"/>
                                <path d="M0,35 L20,36 L40,32 L60,34 L80,10 L100,5" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="gradChart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10">
                            <button className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-95 transition-transform text-[16px]">
                                Connect Wallet
                            </button>
                        </div>
                    </div>
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

            {/* ── MODAL: Time Zone Picker (Inicial) ── */}
            {showTZPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-[85%] bg-[#1c1c1e] rounded-[32px] p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-center text-2xl font-bold mb-2" style={{ fontFamily: SFD }}>Set Time Zone</h3>
                        <p className="text-center text-[#8e8e93] text-[15px] mb-6" style={{ fontFamily: SF }}>AI needs your local time to sync tasks properly.</p>
                        
                        <div className="bg-black/40 rounded-[24px] p-2 mb-6 border border-[#2c2c2e]">
                            <WheelPicker items={TIMEZONES} value={tz} onChange={setTz} />
                        </div>
                        
                        <button onClick={() => setShowTZPicker(false)} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-95 transition-transform text-[16px]">
                            Confirm Zone
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODAL: PANEL DE CONFIGURACIÓN ÚNICO ── */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-300 bg-[#111] max-h-[90vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="w-12 h-1.5 bg-[#333] rounded-full mx-auto mb-4 shrink-0" />
                        
                        <div className="overflow-y-auto no-scrollbar pb-10 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: SFD }}>New Event</h3>
                                <button onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70">
                                    <X className="w-5 h-5 text-[#8e8e93]" />
                                </button>
                            </div>
                            
                            <div className="bg-[#1c1c1e] rounded-[28px] divide-y divide-white/5 overflow-hidden">
                                
                                {/* Type Picker */}
                                <div className="flex flex-col">
                                    <button onClick={() => togglePicker("type")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                        <span className="font-medium text-white">Type</span><span className="text-blue-500">{eventType}</span>
                                    </button>
                                    {activePicker === "type" && (
                                        <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out">
                                            <WheelPicker items={EVENT_TYPES} value={eventType} onChange={setEventType} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* ── CONDICIONALES ESPECÍFICAS DE EVENTO ── */}
                                
                                {/* CONFIGURACIÓN DE CORREO (Email) */}
                                {eventType === "Schedule Email" && (
                                    <>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <div className="flex items-center gap-3"><AtSign className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Recipient</span></div>
                                            <input type="email" placeholder="client@ex.com" value={emailRec} onChange={e=>setEmailRec(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" />
                                        </div>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <div className="flex items-center gap-3"><Type className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Subject</span></div>
                                            <input type="text" placeholder="Meeting update..." value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" />
                                        </div>
                                    </>
                                )}

                                {/* CONFIGURACIÓN DE GOOGLE DRIVE */}
                                {eventType === "Drive Upload" && (
                                    <>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <div className="flex items-center gap-3"><Folder className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Drive Folder</span></div>
                                            <input type="text" placeholder="/backups" value={driveFolder} onChange={e=>setDriveFolder(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" />
                                        </div>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <div className="flex items-center gap-3"><Type className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Task Name</span></div>
                                            <input type="text" placeholder="Upload logs..." value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" />
                                        </div>
                                    </>
                                )}

                                {/* CONFIGURACIÓN DE TELEGRAM POST */}
                                {eventType === "Telegram Post" && (
                                    <>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <div className="flex items-center gap-3"><Send className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Target Channel</span></div>
                                            <input type="text" placeholder="@channel" value={tgChannel} onChange={e=>setTgChannel(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" />
                                        </div>
                                    </>
                                )}

                                {/* ── CONFIGURACIÓN DE CRYPTO Y WALLET ── */}
                                {eventType === "Price Alerts" && (
                                    <>
                                        <div className="flex flex-col">
                                            <button onClick={() => togglePicker("cryptoAsset")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                                <span className="font-medium text-white">Asset</span><span className="text-blue-500">{cryptoAsset}</span>
                                            </button>
                                            {activePicker === "cryptoAsset" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["TON", "NOT", "DOGS", "USDT"]} value={cryptoAsset} onChange={setCryptoAsset} /></div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <button onClick={() => togglePicker("cryptoCondition")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                                <span className="font-medium text-white">Condition</span><span className="text-blue-500 truncate max-w-[150px]">{cryptoCondition}</span>
                                            </button>
                                            {activePicker === "cryptoCondition" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["Rises above", "Drops below", "Drops > 8% in 24h", "Rises > 5% in 1h"]} value={cryptoCondition} onChange={setCryptoCondition} /></div>}
                                        </div>
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <span className="font-medium text-white">Target Price</span>
                                            <input type="number" value={cryptoTarget} onChange={e => setCryptoTarget(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2 font-medium" placeholder="$0.00" />
                                        </div>
                                    </>
                                )}

                                {eventType === "Wallet Actions" && (
                                    <>
                                        <div className="flex flex-col">
                                            <button onClick={() => togglePicker("walletAction")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                                <span className="font-medium text-white">Rule</span><span className="text-blue-500 truncate max-w-[150px]">{walletAction}</span>
                                            </button>
                                            {activePicker === "walletAction" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["Notify if I receive", "Notify if I spend", "Any Jetton Receive", "NFT Transfer"]} value={walletAction} onChange={setWalletAction} /></div>}
                                        </div>
                                        {(walletAction === "Notify if I receive" || walletAction === "Notify if I spend") && (
                                            <div className="flex flex-col">
                                                <button onClick={() => togglePicker("walletAmount")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                                    <span className="font-medium text-white">Amount Threshold</span><span className="text-blue-500">&gt; {walletAmount} TON</span>
                                                </button>
                                                {activePicker === "walletAmount" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["1", "2", "5", "10", "20", "50", "100", "500"]} value={walletAmount} onChange={setWalletAmount} suffix="TON" /></div>}
                                            </div>
                                        )}
                                    </>
                                )}

                                {eventType === "Automated Reports" && (
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("reportType")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                            <span className="font-medium text-white">Report Frequency</span><span className="text-blue-500">{reportType}</span>
                                        </button>
                                        {activePicker === "reportType" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["Weekly Summary", "Monthly Summary", "Daily Recap"]} value={reportType} onChange={setReportType} /></div>}
                                    </div>
                                )}

                                {/* Title & Icon (Para eventos normales y generales) */}
                                {eventType !== "Price Alerts" && eventType !== "Wallet Actions" && eventType !== "Automated Reports" && eventType !== "Schedule Email" && eventType !== "Drive Upload" && (
                                    <div className="flex flex-col">
                                        <div className="flex justify-between w-full p-4 items-center">
                                            <button onClick={() => togglePicker("icon")} className="flex items-center gap-3 active:opacity-70">
                                                <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center">
                                                    <div style={{ color: taskColor }}>{ICON_MAP[taskIcon] || <CalendarDays className="w-4 h-4" />}</div>
                                                </div>
                                                <span className="font-medium text-white">Title</span>
                                            </button>
                                            <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2 font-medium" placeholder="Add title..." />
                                        </div>
                                        {activePicker === "icon" && (
                                            <div className="grid grid-cols-6 gap-3 py-4 px-4 bg-[#0a0a0a] rounded-[20px] m-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out">
                                                {Object.keys(ICON_MAP).map(key => (
                                                    <button key={key} onClick={() => { setTaskIcon(key); setActivePicker(null); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${taskIcon === key ? 'bg-[#333]' : 'bg-transparent text-[#8e8e93]'}`}>
                                                        <div style={{ color: taskIcon === key ? taskColor : undefined }}>{ICON_MAP[key]}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Subir Archivo Adjunto (Email, Drive, Telegram) ── */}
                                {(eventType === "Schedule Email" || eventType === "Drive Upload" || eventType === "Telegram Post" || eventType === "Custom Event") && (
                                    <div className="flex items-center justify-between w-full p-4 border-t border-[#2c2c2e]">
                                        <div className="flex items-center gap-3">
                                            <Paperclip className="w-5 h-5 text-[#8e8e93]" />
                                            <span className="text-white font-medium">Attachment</span>
                                        </div>
                                        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                                        <label htmlFor="file-upload" className="text-blue-500 font-medium truncate max-w-[140px] cursor-pointer bg-[#2c2c2e] px-3 py-1.5 rounded-full text-[13px]">
                                            {attachedFile ? attachedFile.name : "Add File"}
                                        </label>
                                    </div>
                                )}

                                {/* Time Picker */}
                                <div className="flex flex-col border-t border-[#2c2c2e]">
                                    <button onClick={() => togglePicker("time")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                        <span className="font-medium text-white">Time</span><span className="text-blue-500">{selHour}:{selMin}</span>
                                    </button>
                                    {activePicker === "time" && (
                                        <div className="flex gap-4 p-4 bg-black/20 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out">
                                            <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h" />
                                            <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m" />
                                        </div>
                                    )}
                                </div>

                                {/* Priority Toggle */}
                                <div className="flex justify-between w-full p-4 items-center">
                                    <span className="font-medium text-white">Set Priority</span>
                                    <button onClick={() => setIsPriority(!isPriority)} className={`w-12 h-6 rounded-full relative transition-all ${isPriority ? 'bg-blue-500' : 'bg-[#333]'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPriority ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Color Theme Picker */}
                                <div className="flex flex-col">
                                    <button onClick={() => togglePicker("color")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors">
                                        <span className="font-medium text-white">Theme Color</span>
                                        <div className="w-5 h-5 rounded-full" style={{ background: taskColor }} />
                                    </button>
                                    {activePicker === "color" && (
                                        <div className="flex justify-around p-4 bg-black/20 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out">
                                            {THEME_COLORS.map(c => (
                                                <button key={c.hex} onClick={() => { setTaskColor(c.hex); setActivePicker(null); }} className={`w-10 h-10 rounded-full border-4 transition-all ${taskColor === c.hex ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c.hex }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Textarea para descripción / Mensaje */}
                            <div className="bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col gap-2">
                                <span className="text-white text-[16px] font-medium pl-1">
                                    {eventType === "Schedule Email" ? "Email Body" : eventType === "Telegram Post" ? "Message Content" : "Description / Notes"}
                                </span>
                                <textarea 
                                    rows={3}
                                    placeholder={eventType === "Schedule Email" ? "Type your email here..." : "Optional notes or details..."}
                                    value={taskDesc}
                                    onChange={e=>setTaskDesc(e.target.value)}
                                    className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-1 text-[15px] leading-relaxed"
                                    style={{ fontFamily: SF }}
                                />
                            </div>

                            <button onClick={handleSaveConfig} className="w-full py-4 bg-white text-black font-bold rounded-2xl mt-4 active:scale-95 transition-all text-[16px]">Save Schedule</button>
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
