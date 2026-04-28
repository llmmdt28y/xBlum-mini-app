"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, Globe,
  BookOpen, Music, Car, Plane, Wallet, LineChart, PieChart, Activity, Paperclip, ChevronDown
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Tipos ──
type NavTab = "tasks" | "edit" | "search" | "create"
type ItemType = "event" | "reminder"

// ── Icon Dictionary ──
const ICON_MAP: Record<string, React.ReactNode> = {
    CalendarDays: <CalendarDays />,
    Clock: <Clock />,
    Bell: <Bell />,
    Mail: <Mail />,
    Folder: <Folder />,
    Dumbbell: <Dumbbell />,
    Briefcase: <Briefcase />,
    Laptop: <Laptop />,
    Utensils: <Utensils />,
    MessageSquare: <MessageSquare />,
    Send: <Send />,
    Coffee: <Coffee />,
    BookOpen: <BookOpen />,
    Music: <Music />,
    Car: <Car />,
    Plane: <Plane />,
    Wallet: <Wallet />,
    LineChart: <LineChart />,
    PieChart: <PieChart />,
    Activity: <Activity />
}

// ── Event & Reminder Types definitions (for partitioning) ──
const EVENT_ITEMS = [
    { name: "Schedule Email", icon: "Mail", defaultTitle: "Send Email", color: "#f43f5e" },
    { name: "Drive Upload", icon: "Folder", defaultTitle: "Backup to Drive", color: "#10b981" },
    { name: "Telegram Post", icon: "Send", defaultTitle: "Channel Update", color: "#3b82f6" },
    { name: "Price Alerts", icon: "LineChart", defaultTitle: "Price Alert", color: "#10b981" },
    { name: "Wallet Actions", icon: "Wallet", defaultTitle: "Wallet Alert", color: "#f59e0b" },
    { name: "Automated Reports", icon: "PieChart", defaultTitle: "Weekly Summary", color: "#8b5cf6" },
    { name: "Custom Event", icon: "CalendarDays", defaultTitle: "New Event", color: "#3b82f6" }
]

const REMINDER_ITEMS = [
    { name: "Personal Reminder", icon: "Bell", defaultTitle: "Reminder", color: "#f59e0b" },
    { name: "Workout / Gym", icon: "Dumbbell", defaultTitle: "Workout", color: "#10b981" },
    { name: "Deep Work", icon: "Laptop", defaultTitle: "Deep Work Session", color: "#8b5cf6" },
    { name: "Meal Time", icon: "Utensils", defaultTitle: "Lunch Break", color: "#f59e0b" }
]

const ALL_ITEMS = [...EVENT_ITEMS, ...REMINDER_ITEMS];

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

const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor run", time: "1:30 – 2 PM", icon: <TrendingUp className="w-4 h-4 text-[#22c55e]" />, color: "#22c55e" },
    { id: "sug_email", title: "Apply to YC", time: "2:30 – 3:30 PM", icon: <Mail className="w-4 h-4 text-[#3b82f6]" />, color: "#3b82f6" },
    { id: "sug_tg", title: "Order vitamin D", time: "7 – 7:30 PM", icon: <CheckSquare className="w-4 h-4 text-[#a855f7]" />, color: "#a855f7" },
]

// ── Mock Initial Tasks (Partitioned example) ──
const INITIAL_TASKS = [
    { id: 1, date: new Date().toDateString(), title: "Website Launch", itemType: "event", status: "PENDING", time: "12:00 PM", iconName: "Laptop", color: "#3b82f6", desc: "Final review...", files: [], isPriority: false },
    { id: 2, date: new Date().toDateString(), title: "Meal Prep", itemType: "reminder", status: "ACTIVE", time: "11:00 AM", iconName: "Utensils", color: "#f59e0b", desc: "For the week.", files: [], isPriority: false },
    { id: 3, date: new Date().toDateString(), title: "Apply to YC", itemType: "event", status: "ACTIVE", time: "05:00 PM", iconName: "CheckSquare", color: "#3b82f6", desc: "", files: [], isPriority: true },
]

// ── Compact Pill Component (Ref Image Style) ──
function CompactPill({ Icon, title, metadata, metadataColor, color, isJiggling, onDelete }: { Icon: React.ReactNode, title: string, metadata: string, metadataColor?: string, color: string, isJiggling?: boolean, onDelete?: () => void }) {
    return (
        <div className={`relative flex items-center w-full bg-[#1c1c1e] px-4 py-2.5 rounded-[20px] border border-[#2c2c2e] ${isJiggling ? 'jiggle-card' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center p-1.5 shrink-0 mr-3" style={{ color: color, border: `1px solid ${color}20` }}>
                <div className="[&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[1.5]">{Icon}</div>
            </div>
            <div className="flex flex-col leading-tight truncate mr-2">
                <span className="text-white text-[15px] font-semibold tracking-tight truncate" style={{ fontFamily: SF }}>{title}</span>
                <span className="text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>{metadata}</span>
            </div>
            {metadataColor && <span className="text-[14px] font-medium ml-auto pr-1" style={{ color: metadataColor, fontFamily: SF }}>{metadata.split(' ')[0]}</span>}
            {!metadataColor && <ChevronRight className="w-5 h-5 text-[#333] ml-auto shrink-0" />}

            {onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-xl border border-black active:scale-90 transition-transform z-10"
                >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
            )}
        </div>
    )
}

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
    
    const [tasks, setTasks] = useState<any[]>(INITIAL_TASKS) 
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    // Modales de Creación
    const [showTZPicker, setShowTZPicker] = useState(true) 
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form states generales
    const [activePicker, setActivePicker] = useState<string | null>(null) 
    
    const [tz, setTz] = useState("Mexico City (GMT-6)")
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskColor, setTaskColor] = useState("#3b82f6")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")
    const [isPriority, setIsPriority] = useState(false)
    
    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")

    // Específico para backend integration
    const [ cryptoAsset, setCryptoAsset ] = useState("TON");
    const [ emailRec, setEmailRec ] = useState("");
    const [ tgChannel, setTgChannel ] = useState("");
    const [ attachedFiles, setAttachedFiles ] = useState<File[]>([]);

    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))

    // ── Update fields dynamically based on Event Type ──
    useEffect(() => {
        const matchingItem = ALL_ITEMS.find(item => item.name === eventType);
        if (matchingItem) {
            setTaskIcon(matchingItem.icon);
            setTaskTitle(matchingItem.defaultTitle);
            setTaskColor(matchingItem.color);
        } else {
            setTaskIcon("CalendarDays");
            setTaskTitle("");
            setTaskColor("#3b82f6");
        }
    }, [eventType])

    // ── Lógica del Calendario Superior ──
    const calendarDays = useMemo(() => {
        const arr = []
        const today = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            arr.push({ full: d.toDateString(), label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), num: d.getDate().toString(), isToday: i === 0 })
        }
        return arr
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

    // Partition tasks based on type
    const taskPartition = useMemo(() => {
        const filteredByDate = selectedDate === "All" ? tasks : tasks.filter(t => t.date === selectedDate);
        return {
            events: filteredByDate.filter(t => t.itemType === 'event' && !t.isPriority),
            reminders: filteredByDate.filter(t => t.itemType === 'reminder' && !t.isPriority),
            priority: tasks.filter(t => t.isPriority).slice(0, 2)
        }
    }, [tasks, selectedDate])

    // ── Botón Atrás Telegram ──
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp
        if (!tg?.BackButton) return
        if (isEditingMode || configModalOpen || activePicker || showTZPicker) tg.BackButton.show()
        else tg.BackButton.hide()
        const handleBack = () => {
            if (showTZPicker) { setShowTZPicker(false); setCurrentView("home"); tg.BackButton.hide() }
            else if (activePicker) { setActivePicker(null) }
            else if (configModalOpen) { setConfigModalOpen(false) }
            else if (isEditingMode) { setIsEditingMode(false); setActiveNavTab("tasks") }
            else { setCurrentView("home"); tg.BackButton.hide() }
        }
        tg.BackButton.onClick(handleBack)
        return () => tg.BackButton.offClick(handleBack)
    }, [isEditingMode, configModalOpen, activePicker, showTZPicker, setCurrentView])

    function handleNavTabClick(tab: NavTab) {
        if (tab === "search") return; 
        if (tab === "edit") { setIsEditingMode(!isEditingMode); setActiveNavTab(isEditingMode ? "tasks" : "edit") }
        else if (tab === "create") { setIsEditingMode(false); setTaskTitle(""); setTaskDesc(""); setIsPriority(false); setAttachedFiles([]); setEventType("Custom Event"); setConfigModalOpen(true); setActiveNavTab("create") }
        else { setIsEditingMode(false); setConfigModalOpen(false); setActiveNavTab(tab) }
    }

    function togglePicker(picker: string) { setActivePicker(activePicker === picker ? null : picker) }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) { if (e.target.files) { setAttachedFiles(Array.from(e.target.files)) } }

    function handleSaveConfig() {
        setLoading(true);
        // Identify item type for backend
        const itemType = EVENT_ITEMS.some(item => item.name === eventType) ? 'event' : 'reminder';
        setTimeout(() => {
            setTasks(prev => [{
                id: Date.now(),
                itemType,
                title: taskTitle || eventType,
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                iconName: taskIcon,
                color: taskColor,
                desc: taskDesc,
                files: attachedFiles.map(f => f.name),
                isPriority: isPriority,
                status: "ACTIVE"
            }, ...prev]);
            setConfigModalOpen(false); setActivePicker(null); setLoading(false); setActiveNavTab("tasks");
        }, 600);
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-0.5deg); } 50% { transform: rotate(0.5deg); } 100% { transform: rotate(-0.5deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); }
                .graph-tooltip { opacity: 0; transition: opacity 0.2s ease-out; pointer-events: none; }
                .graph-container:hover .graph-tooltip { opacity: 1; }
                .graph-point { opacity: 0; transition: opacity 0.2s ease-out; pointer-events: none; }
                .graph-container:hover .graph-point { opacity: 1; }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(60px)" }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(17,17,17,0.4) 0%, rgba(17,17,17,1) 100%)" }} />

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                {/* ── Top Header & Calendar ── */}
                <div className="pt-10 flex justify-center items-end gap-1"><span className="text-white text-[22px] font-bold" style={{ fontFamily: SFD }}>{monthStr}</span><span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{ fontFamily: SFD }}>{yearStr}</span></div>
                <div className="flex justify-between items-center px-6 mt-8">
                    <button onClick={() => setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}><span className="text-[14px] font-bold" style={{ fontFamily: SF }}>All</span></button>
                    <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0" />
                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.full;
                        let dotClass = isSelected ? "bg-blue-500" : day.isToday ? "bg-[#ef4444]" : "";
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
                <div className="mt-10 flex flex-col items-center"><p className="text-[#8e8e93] text-[14px] font-bold tracking-widest uppercase mb-3" style={{ fontFamily: SF }}>Schedule</p><div className="flex items-center gap-6 text-[26px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}><div className="flex items-center gap-2"><CalendarDays className="w-6 h-6 text-[#8e8e93] stroke-[2]" /><span>{tasks.length} events</span></div><div className="flex items-center gap-2"><Bell className="w-6 h-6 text-[#8e8e93] stroke-[2]" /><span>{tasks.filter(t=>t.itemType==='reminder').length} reminders</span></div></div></div>

                {/* ── Highlights (Compact) ── */}
                <div className="mt-6 flex flex-col items-start gap-2.5 px-6">
                    {taskPartition.priority.length > 0 ? (
                        taskPartition.priority.map(t => (
                            <CompactPill key={t.id} Icon={ICON_MAP[t.iconName]} title={t.title} metadata={`at ${t.time}`} color={t.color} isJiggling={isEditingMode} onDelete={isEditingMode ? () => setTasks(tasks.filter(task => task.id !== t.id)) : undefined} />
                        ))
                    ) : (
                        <>
                            <CompactPill Icon={<Moon />} title="Morning grogginess" metadata="15m left" color="#f59e0b" metadataColor="#f59e0b" />
                            <CompactPill Icon={<TrendingUp />} title="Alertness rise" metadata="in 45m" color="#22c55e" metadataColor="#22c55e" />
                        </>
                    )}
                </div>

                {/* ── Partitioned List ── */}
                <div className="px-6 mt-10">
                    {tasks.length === 0 ? (
                        <div className="animate-in fade-in duration-500"><div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-[#8e8e93]" /><span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Suggested</span></div><div className="flex flex-col items-start gap-2.5">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <button key={idx} onClick={() => { setEventType("Custom Event"); setTaskTitle(sug.title); setConfigModalOpen(true); }} className="flex items-center gap-3 bg-[#1c1c1e] px-4 py-2 rounded-full border border-[#2c2c2e] active:scale-95 transition-transform"><div className="[&>svg]:w-3.5 [&>svg]:h-3.5" style={{ color: sug.color }}>{sug.icon}</div><span className="text-white text-[13px] font-medium" style={{ fontFamily: SF }}>{sug.title} <span className="text-[#8e8e93] font-normal ml-1">• {sug.time}</span></span><Plus className="w-3.5 h-3.5 text-[#8e8e93] ml-1" /></button>
                                ))}
                            </div></div>
                    ) : (
                        <div className="animate-in fade-in duration-500 space-y-8">
                            {/* Events Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 px-1"><CalendarDays className="w-5 h-5 text-blue-500" /><span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Active Events</span></div>
                                <div className="flex flex-col gap-3">
                                    {taskPartition.events.length === 0 ? <span className="text-[#636366] text-[13px] italic pl-2">No events</span> : 
                                    taskPartition.events.map(t => <CompactPill key={t.id} Icon={ICON_MAP[t.iconName]} title={t.title} metadata={`• ${t.time}`} color={t.color} isJiggling={isEditingMode} onDelete={isEditingMode ? () => setTasks(tasks.filter(task => task.id !== t.id)) : undefined} />)}
                                </div>
                            </div>
                            {/* Reminders Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 px-1"><Bell className="w-5 h-5 text-amber-500" /><span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{ fontFamily: SF }}>Active Reminders</span></div>
                                <div className="flex flex-col gap-3">
                                    {taskPartition.reminders.length === 0 ? <span className="text-[#636366] text-[13px] italic pl-2">No reminders</span> : 
                                    taskPartition.reminders.map(t => <CompactPill key={t.id} Icon={ICON_MAP[t.iconName]} title={t.title} metadata={`• ${t.time}`} color={t.color} isJiggling={isEditingMode} onDelete={isEditingMode ? () => setTasks(tasks.filter(task => task.id !== t.id)) : undefined} />)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── TON Crypto Card & Quick Actions ── */}
                <div className="px-6 mt-12 mb-10 flex flex-col justify-center gap-5">
                    <div className="w-full bg-[#1c1c1e]/80 backdrop-blur-xl border border-[#2c2c2e] rounded-[32px] p-6 shadow-2xl relative overflow-hidden graph-container cursor-crosshair">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0098EA] rounded-full blur-[80px] opacity-10 pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10"><div className="flex gap-3 items-center"><div className="w-12 h-12 rounded-full border border-[#2c2c2e] bg-[#1c1c1e] flex items-center justify-center shadow-lg"><img src="/TON-ICON.png" alt="TON" className="w-full h-full object-cover rounded-full" /></div><div><h3 className="text-white text-[20px] font-bold leading-none" style={{ fontFamily: SFD }}>TON <span className="text-[#8e8e93] text-[14px] font-medium ml-1">The Open Network</span></h3><p className="text-white text-[24px] font-bold tracking-tight mt-1 leading-none">$6.42 <span className="text-[#22c55e] text-[14px] font-medium ml-1">+2.4%</span></p></div></div><button className="bg-[#1c1c1e] text-white px-3 py-1.5 rounded-[12px] text-[11px] font-bold tracking-wider uppercase border border-[#2c2c2e]">EQC...wvs</button></div>

                        {/* Detalled Line Chart with simulation hover */}
                        <div className="h-28 w-full relative z-10 -mx-1 mb-2">
                            <svg viewBox="0 0 100 45" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradChart" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient>
                                    <linearGradient id="tooltipGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0" /><stop offset="50%" stopColor="#22c55e" stopOpacity="0.5" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient>
                                </defs>
                                {/* Grid reference simulation */}
                                <line x1="0" y1="10" x2="100" y2="10" stroke="#2c2c2e" strokeWidth="0.1" strokeDasharray="1 1"/>
                                <line x1="0" y1="20" x2="100" y2="20" stroke="#2c2c2e" strokeWidth="0.1" strokeDasharray="1 1"/>
                                <line x1="0" y1="30" x2="100" y2="30" stroke="#2c2c2e" strokeWidth="0.1" strokeDasharray="1 1"/>

                                <path d="M0,45 L0,35 L10,34 L20,36 L30,32 L40,32 L50,34 L60,30 L70,32 L80,10 L90,12 L100,5 L100,45 Z" fill="url(#gradChart)" opacity="0.15"/>
                                <path d="M0,35 L10,34 L20,36 L30,32 L40,32 L50,34 L60,30 L70,32 L80,10 L90,12 L100,5" fill="none" stroke="#22c55e" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                                
                                {/* Hover effect simulation */}
                                <line x1="80" y1="0" x2="80" y2="45" stroke="url(#tooltipGrad)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" className="graph-tooltip" />
                                <circle cx="80" cy="10" r="1.5" fill="#22c55e" className="graph-point" />
                                <rect x="83" y="2" width="16" height="10" rx="1.5" fill="#1c1c1e" stroke="#2c2c2e" strokeWidth="0.2" className="graph-tooltip" />
                                <text x="91" y="8" fill="white" fontSize="2.5" textAnchor="middle" className="graph-tooltip" style={{fontFamily:SF}}>$6.42 / 10AM</text>
                            </svg>
                        </div>
                    </div>
                    {/* Quick Access Buttons */}
                    <div className="flex gap-2.5 px-1 relative z-10">
                        <button onClick={() => { handleNavTabClick('create'); setEventType('Price Alerts'); setCryptoAsset('TON'); setConfigModalOpen(true); }} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-[#1c1c1e] rounded-xl border border-[#2c2c2e] active:scale-95 transition-transform"><LineChart className="w-5 h-5 text-[#22c55e]" /><span className="text-white text-[11px] font-semibold text-center leading-tight">Price Alert</span></button>
                        <button onClick={() => { handleNavTabClick('create'); setEventType('Schedule Email'); setConfigModalOpen(true); }} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-[#1c1c1e] rounded-xl border border-[#2c2c2e] active:scale-95 transition-transform"><Mail className="w-5 h-5 text-[#f43f5e]" /><span className="text-white text-[11px] font-semibold text-center leading-tight">Send Email</span></button>
                        <button onClick={() => { handleNavTabClick('create'); setEventType('Personal Reminder'); setConfigModalOpen(true); }} className="flex-1 flex flex-col items-center gap-1.5 p-3 bg-[#1c1c1e] rounded-xl border border-[#2c2c2e] active:scale-95 transition-transform"><Bell className="w-5 h-5 text-[#f59e0b]" /><span className="text-white text-[11px] font-semibold text-center leading-tight">New Reminder</span></button>
                    </div>
                </div>
            </div>

            {/* ── Liquid Bottom NavBar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)" }}><div className="pointer-events-auto flex items-center p-1.5 gap-1 bg-[#0f0f0f]/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl"><button disabled className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed"><Search className="w-6 h-6 text-[#8e8e93]" /></button><button onClick={() => handleNavTabClick("tasks")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}><CalendarDays className="w-6 h-6" />{activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black" />}</button><button onClick={() => handleNavTabClick("edit")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${isEditingMode ? "bg-white text-black" : "text-white"}`}><Pencil className="w-6 h-6" />{isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}</button><div className="w-px h-8 bg-white/10 mx-1" /><button onClick={() => handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10"><Plus className="w-7 h-7 text-white" strokeWidth={2.5} /></button></div></div>

            {/* ── MODAL: Time Zone Picker (Inicial) ── */}
            {showTZPicker && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300"><div className="w-[85%] bg-[#1c1c1e] rounded-[32px] p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"><Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" /><h3 className="text-center text-2xl font-bold mb-2" style={{ fontFamily: SFD }}>Set Time Zone</h3><p className="text-center text-[#8e8e93] text-[15px] mb-6" style={{ fontFamily: SF }}>AI needs your local time to sync tasks properly.</p><div className="bg-black/40 rounded-[24px] p-2 mb-6 border border-[#2c2c2e]"><WheelPicker items={TIMEZONES} value={tz} onChange={setTz} /></div><button onClick={() => setShowTZPicker(false)} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-95 transition-transform text-[16px]">Confirm Zone</button></div></div>)}

            {/* ── MODAL: PANEL DE CONFIGURACIÓN ÚNICO ── */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200"><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} /><div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-300 bg-[#111] max-h-[90vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"><div className="w-12 h-1.5 bg-[#333] rounded-full mx-auto mb-4 shrink-0" /><div className="overflow-y-auto no-scrollbar pb-10 space-y-4"><div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: SFD }}>New Entry</h3><button onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70"><X className="w-5 h-5 text-[#8e8e93]" /></button></div>
                            
                            <div className="bg-[#1c1c1e] rounded-[28px] divide-y divide-white/5 overflow-hidden">
                                
                                {/* Partitioned Type Picker */}
                                <div className="flex flex-col border-none">
                                    <button onClick={() => togglePicker("type")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors"><span className="font-medium text-white">Entry Type</span><span className="text-blue-500 font-medium">{eventType}</span></button>
                                    {activePicker === "type" && (
                                        <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out space-y-3">
                                            <div className="px-2"><span className="text-[#8e8e93] text-[12px] font-semibold uppercase tracking-widest">Event Types</span></div>
                                            <WheelPicker items={EVENT_ITEMS.map(i=>i.name)} value={eventType} onChange={setEventType} />
                                            <div className="border-t border-[#2c2c2e] mt-3" />
                                            <div className="px-2 mt-3"><span className="text-[#8e8e93] text-[12px] font-semibold uppercase tracking-widest">Reminder Types</span></div>
                                            <WheelPicker items={REMINDER_ITEMS.map(i=>i.name)} value={eventType} onChange={setEventType} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* ── CONDICIONALES ESPECÍFICAS DE CONFIGURACIÓN (Backend Mapping) ── */}
                                
                                {/* CONFIGURACIÓN DE CORREO (Gmail Composio Integration) */}
                                {eventType === "Schedule Email" && (<>
                                    <div className="flex justify-between w-full p-4 items-center"><div className="flex items-center gap-3"><AtSign className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Recipient</span></div><input type="email" placeholder="client@ex.com" value={emailRec} onChange={e=>setEmailRec(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" /></div>
                                    <div className="flex justify-between w-full p-4 items-center"><div className="flex items-center gap-3"><Type className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Subject</span></div><input type="text" placeholder="Update..." value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" /></div>
                                </>)}

                                {/* CONFIGURACIÓN DE GOOGLE DRIVE */}
                                {eventType === "Drive Upload" && (<>
                                    <div className="flex justify-between w-full p-4 items-center"><div className="flex items-center gap-3"><Folder className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Drive Folder</span></div><input type="text" placeholder="/backups" value={driveFolder} onChange={e=>setDriveFolder(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" /></div>
                                </>)}

                                {/* CONFIGURACIÓN DE TELEGRAM POST */}
                                {eventType === "Telegram Post" && (<div className="flex justify-between w-full p-4 items-center"><div className="flex items-center gap-3"><Send className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Channel</span></div><input type="text" placeholder="@channel" value={tgChannel} onChange={e=>setTgChannel(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" /></div>)}

                                {/* ── CONFIGURACIÓN DE CRYPTO Y WALLET ── */}
                                {eventType === "Price Alerts" && (<>
                                    <div className="flex flex-col border-none"><button onClick={() => togglePicker("cryptoAsset")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors"><span className="font-medium text-white">Asset</span><span className="text-blue-500 font-medium">{cryptoAsset}</span></button>{activePicker === "cryptoAsset" && <div className="bg-black/20 p-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={["TON", "NOT", "USDT", "BTC"]} value={cryptoAsset} onChange={setCryptoAsset} /></div>}</div>
                                    <div className="flex justify-between w-full p-4 items-center"><span className="font-medium text-white">Target Price</span><input type="number" value={cryptoTarget} onChange={e => setCryptoTarget(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2 font-medium" placeholder="$0.00" /></div>
                                </>)}

                                {/* ── Subir Archivos Adjuntos Multiples ── */}
                                {(eventType === "Schedule Email" || eventType === "Drive Upload" || eventType === "Telegram Post") && (
                                    <div className="flex items-center justify-between w-full p-4 border-t border-[#2c2c2e]"><div className="flex items-center gap-3"><Paperclip className="w-5 h-5 text-[#8e8e93]" /><span className="text-white font-medium">Attachment</span></div><input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} /><label htmlFor="file-upload" className="text-blue-500 font-medium truncate max-w-[140px] cursor-pointer bg-[#2c2c2e] px-3 py-1.5 rounded-full text-[13px] active:scale-95 transition-transform text-center">{attachedFiles.length > 0 ? `${attachedFiles.length} files` : "Add Files"}</label></div>
                                )}

                                {/* Time Picker (General) */}
                                <div className="flex flex-col border-t border-[#2c2c2e]"><button onClick={() => togglePicker("time")} className="flex justify-between w-full p-4 items-center active:bg-[#2c2c2e] transition-colors"><span className="font-medium text-white">Time</span><span className="text-blue-500 font-medium">{selHour}:{selMin}</span></button>{activePicker === "time" && <div className="flex gap-4 p-4 bg-black/20 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out"><WheelPicker items={hours} value={selHour} suffix="h" onChange={setSelHour} /><WheelPicker items={mins} value={selMin} suffix="m" onChange={setSelMin} /></div>}</div>

                                {/* Title & Icon (Para eventos normales) */}
                                {ALL_ITEMS.filter(i=>['Dumbbell', 'Bell', 'UTensils', 'CalendarDays', 'Laptop'].includes(i.icon)).some(i=>i.name === eventType) && (
                                    <div className="flex flex-col"><div className="flex justify-between w-full p-4 items-center"><button onClick={() => togglePicker("icon")} className="flex items-center gap-3 active:opacity-70"><div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center"><div style={{ color: taskColor }}>{ICON_MAP[taskIcon] || <CalendarDays className="w-4 h-4" />}</div></div><span className="font-medium text-white">Title</span></button><input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2 font-medium" placeholder="Add title..." /></div>{activePicker === "icon" && <div className="grid grid-cols-6 gap-3 py-4 px-4 bg-[#0a0a0a] rounded-[20px] m-2 origin-top animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-200 ease-out">{Object.keys(ICON_MAP).map(key => <button key={key} onClick={() => { setTaskIcon(key); setActivePicker(null); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${taskIcon === key ? 'bg-[#333]' : 'bg-transparent text-[#8e8e93]'}`}><div style={{ color: taskIcon === key ? taskColor : undefined }}>{ICON_MAP[key]}</div></button>)}</div>}</div>
                                )}
                            </div>
                            
                            {/* Textarea para descripción / Mensaje */}
                            <div className="bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col gap-2"><span className="text-white text-[16px] font-medium pl-1">{eventType === "Schedule Email" ? "Email Body" : eventType === "Telegram Post" ? "Message Content" : "Notes / Description"}</span><textarea rows={3} placeholder={eventType === "Schedule Email" ? "Type email content..." : "Optional details..."} value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-1 text-[15px] leading-relaxed" style={{ fontFamily: SF }} /></div>

                            <button onClick={handleSaveConfig} className="w-full py-4 bg-white text-black font-bold rounded-2xl mt-4 active:scale-95 transition-all text-[16px]">Save Schedule</button>
                        </div></div></div>
            )}

            {loading && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>)}
        </div>
    )
}
