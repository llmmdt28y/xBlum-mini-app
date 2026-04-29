"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, ChevronDown, ChevronUp, Paperclip,
  Droplets, Pill, Activity, Link as LinkIcon, RefreshCcw
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

type NavTab = "tasks" | "edit" | "search" | "create"
type ListViewTab = "events" | "reminders"

// ── Diccionarios de Íconos y Colores ──
const ICONS: Record<string, React.ElementType> = {
    CalendarDays, Clock, Bell, Mail, Folder, Dumbbell, Briefcase, 
    Laptop, Utensils, MessageSquare, Send, Coffee, Droplets, Pill, 
    Activity, TrendingUp, CheckSquare
}

const ICON_COLORS: Record<string, string> = {
    CalendarDays: "#3b82f6", // Blue
    Clock: "#f97316",        // Orange
    Bell: "#f43f5e",         // Rose
    Mail: "#0ea5e9",         // Sky
    Folder: "#eab308",       // Yellow
    Dumbbell: "#a855f7",     // Purple
    Briefcase: "#d97706",    // Amber
    Laptop: "#94a3b8",       // Slate
    Utensils: "#ec4899",     // Pink
    MessageSquare: "#22c55e",// Green
    Send: "#14b8a6",         // Teal
    Coffee: "#b45309",       // Brown
    Droplets: "#38bdf8",     // Light Blue
    Pill: "#fb7185",         // Light Rose
    Activity: "#10b981",     // Emerald
    TrendingUp: "#22c55e",   // Green
    CheckSquare: "#3b82f6"   // Blue
}

const EVENT_OPTIONS = [
    "Custom Event", "Schedule Email", "Drive Upload", "Workout / Gym", 
    "Deep Work", "Meal Time", "Send Message"
]

const REMINDER_OPTIONS = [
    "Personal Reminder", "Drink Water", "Stand Up / Stretch", 
    "Take Medication", "Custom Reminder"
]

const SUGGESTIONS = [
    { id: "sug_run", title: "Outdoor run", time: "1:30 – 2 PM", iconName: "TrendingUp", color: "#22c55e", type: "event" },
    { id: "sug_email", title: "Apply to YC", time: "2:30 – 3:30 PM", iconName: "CheckSquare", color: "#3b82f6", type: "event" },
    { id: "sug_tg", title: "Order vitamin D", time: "7 – 7:30 PM", iconName: "Pill", color: "#fb7185", type: "reminder" },
]

function WheelPicker({ items, value, onChange, suffix = "" }: { items: string[], value: string, onChange: (v: string) => void, suffix?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 40 

    const handleScroll = () => {
        if (!containerRef.current) return
        const scrollY = containerRef.current.scrollTop
        const index = Math.round(scrollY / itemHeight)
        if (items[index] && items[index] !== value) onChange(items[index])
    }

    return (
        <div ref={containerRef} onScroll={handleScroll} className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center" style={{ scrollBehavior: "smooth" }}>
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
            {items.map((item, i) => {
                const isSelected = item === value
                return (
                    <div key={i} className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${isSelected ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px] font-medium'}`} style={{ fontFamily: SFD }}>
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
    const [listView, setListView] = useState<ListViewTab>("events") 
    const [viewAll, setViewAll] = useState(false) 
    const [isEditingMode, setIsEditingMode] = useState(false)
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
    
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activePicker, setActivePicker] = useState<string | null>(null)
    
    const [creationMode, setCreationMode] = useState<ListViewTab>("events")
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")
    const [taskEmailRec, setTaskEmailRec] = useState("")
    const [attachedFiles, setAttachedFiles] = useState<{name: string, size: number}[]>([]) // File Info
    const [extraConfig, setExtraConfig] = useState("")
    
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

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { setViewAll(false) }, [listView])

    useEffect(() => {
        setExtraConfig("")
        setAttachedFiles([])
        
        // Defaults by Type
        if(eventType === "Workout / Gym") { setTaskIcon("Dumbbell"); setTaskTitle("Workout"); setExtraConfig("Upper Body") }
        else if(eventType === "Deep Work") { setTaskIcon("Laptop"); setTaskTitle("Deep Work Session"); setExtraConfig("DND Mode") }
        else if(eventType === "Meal Time") { setTaskIcon("Utensils"); setTaskTitle("Lunch Break"); setExtraConfig("High Protein") }
        else if(eventType === "Schedule Email") { setTaskIcon("Mail"); setTaskTitle("Send Email") }
        else if(eventType === "Send Message") { setTaskIcon("MessageSquare"); setTaskTitle("Send Message") }
        else if(eventType === "Drive Upload") { setTaskIcon("Folder"); setTaskTitle("Backup to Drive") }
        else if(eventType === "Drink Water") { setTaskIcon("Droplets"); setTaskTitle("Drink Water") }
        else if(eventType === "Stand Up / Stretch") { setTaskIcon("Activity"); setTaskTitle("Stretch Legs") }
        else if(eventType === "Take Medication") { setTaskIcon("Pill"); setTaskTitle("Medication"); setExtraConfig("Every 8h") }
        else if(eventType === "Custom Event") { setTaskIcon("CalendarDays"); setTaskTitle(""); setExtraConfig("https://meet.google.com/...") }
        else if(eventType === "Personal Reminder" || eventType === "Custom Reminder") { setTaskIcon("Bell"); setTaskTitle("Reminder") }
        else { setTaskIcon("CalendarDays"); setTaskTitle("") }
    }, [eventType])

    const calendarDays = useMemo(() => {
        const arr = []
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1)
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            arr.push({ full: d.toDateString(), label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), num: d.getDate().toString(), isToday: d.toDateString() === today.toDateString() })
        }
        return arr
    }, [])

    const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const yearStr = new Date().getFullYear().toString()

    const filteredTasks = useMemo(() => {
        if (selectedDate === "All") return tasks
        return tasks.filter(t => t.date === selectedDate)
    }, [tasks, selectedDate])

    const activeEvents = filteredTasks.filter(t => t.isEvent)
    const activeReminders = filteredTasks.filter(t => !t.isEvent)

    const currentList = listView === "events" ? activeEvents : activeReminders
    const showViewAllButton = currentList.length > 3
    const displayedList = viewAll ? currentList : currentList.slice(0, 3)

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
            setCreationMode("events")
            setEventType(EVENT_OPTIONS[0])
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

    function toggleExpand(id: string | number) {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
    }

    // ── File Upload Handler (Telegram WebApp Native integration) ──
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).slice(0, 5 - attachedFiles.length);
        const mappedFiles = newFiles.map(f => ({ name: f.name, size: f.size }));
        setAttachedFiles(prev => [...prev, ...mappedFiles].slice(0, 5));
    }

    function triggerFileSelect() {
        if (attachedFiles.length >= 5) return;
        fileInputRef.current?.click();
    }

    function handleSaveConfig() {
        setLoading(true)
        setTimeout(() => {
            const isEvent = creationMode === "events";
            setTasks(prev => [{
                id: Date.now(),
                title: taskTitle || eventType,
                isEvent: isEvent,
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                iconName: taskIcon,
                color: ICON_COLORS[taskIcon] || "#ffffff",
                description: taskDesc,
                email: taskEmailRec,
                files: attachedFiles,
                extra: extraConfig,
                status: "ACTIVE"
            }, ...prev])
            setConfigModalOpen(false)
            setActivePicker(null)
            setLoading(false)
            setListView(isEvent ? "events" : "reminders") 
            setActiveNavTab("tasks")
        }, 600)
    }

    const TaskCard = ({ item, isSuggestion = false, isLastAndFaded = false }: { item: any, isSuggestion?: boolean, isLastAndFaded?: boolean }) => {
        const isExpanded = expandedIds[item.id]
        const TheIcon = ICONS[item.iconName] || CalendarDays
        
        return (
            <div className={`relative w-full ${isEditingMode && !isSuggestion ? 'jiggle-card' : ''}`}>
                <div className={`bg-[#1c1c1e] border border-[#2c2c2e] px-5 py-3.5 flex flex-col transition-all duration-200 ${isExpanded && !isSuggestion ? 'rounded-[24px]' : 'rounded-full'} ${isLastAndFaded ? 'fade-out-bottom' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <TheIcon className="w-5 h-5 shrink-0" style={{ color: item.color }} />
                            <div className="flex flex-col">
                                <span className="text-[16px] font-bold leading-tight" style={{ fontFamily: SFD, color: item.color }}>{item.title}</span>
                                <span className="text-[#8e8e93] text-[13px] mt-0.5" style={{ fontFamily: SF }}>{item.time}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (isSuggestion) {
                                    const mode = item.type === 'reminder' ? 'reminders' : 'events';
                                    setCreationMode(mode);
                                    setEventType(mode === 'reminders' ? "Personal Reminder" : "Custom Event");
                                    setTaskTitle(item.title.replace('\n',' '));
                                    setConfigModalOpen(true);
                                } else {
                                    toggleExpand(item.id);
                                }
                            }} 
                            className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                        >
                            {isSuggestion ? <Plus className="w-4 h-4 text-[#8e8e93]" /> : (isExpanded ? <ChevronUp className="w-4 h-4 text-[#8e8e93]" /> : <ChevronDown className="w-4 h-4 text-[#8e8e93]" />)}
                        </button>
                    </div>

                    {isExpanded && !isSuggestion && (
                        <div className="mt-4 pt-4 border-t border-[#2c2c2e] flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200 pb-1 px-1">
                            {item.description && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>Description</span>
                                    <p className="text-[#e4e4e7] text-[14px] leading-relaxed" style={{ fontFamily: SF }}>{item.description}</p>
                                </div>
                            )}
                            {item.email && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>Email Recipient</span>
                                    <div className="flex items-center gap-2 bg-[#2c2c2e]/50 w-fit px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e]">
                                        <AtSign className="w-3.5 h-3.5 text-[#8e8e93]" />
                                        {item.email}
                                    </div>
                                </div>
                            )}
                            {item.files?.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>Attachments ({item.files.length})</span>
                                    <div className="flex flex-col gap-1">
                                        {item.files.map((f: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-[#2c2c2e]/50 w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden">
                                                <Paperclip className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                                                <span className="truncate">{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {item.extra && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: SF }}>{item.iconName === 'CalendarDays' ? 'Link' : (item.iconName === 'Pill' ? 'Frequency' : 'Configuration')}</span>
                                    <div className="flex items-center gap-2 bg-[#2c2c2e]/50 w-fit max-w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden">
                                        {item.iconName === 'CalendarDays' ? <LinkIcon className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" /> : (item.iconName === 'Pill' ? <RefreshCcw className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />)}
                                        <span className="truncate">{item.extra}</span>
                                    </div>
                                </div>
                            )}
                            {!item.description && !item.email && (!item.files || item.files.length === 0) && !item.extra && (
                                <div className="py-2 text-center">
                                    <span className="text-[#636366] text-[13px] italic" style={{ fontFamily: SF }}>No additional details</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isEditingMode && !isSuggestion && (
                    <button onClick={() => setTasks(tasks.filter(t => t.id !== item.id))} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-black active:scale-90 transition-transform z-10">
                        <Trash2 className="w-[14px] h-[14px] text-white" />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); }
                .fade-out-bottom { mask-image: linear-gradient(to bottom, black 40%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%); opacity: 0.8; pointer-events: none; }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(60px)" }} />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(17,17,17,0.4) 0%, rgba(17,17,17,1) 100%)" }} />

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                <div className="pt-10 flex justify-center items-end gap-1">
                    <span className="text-white text-[22px] font-bold" style={{ fontFamily: SFD }}>{monthStr}</span>
                    <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{ fontFamily: SFD }}>{yearStr}</span>
                </div>

                <div className="flex justify-between items-center px-6 mt-8">
                    <button onClick={() => setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}>
                        <span className="text-[14px] font-bold" style={{ fontFamily: SF }}>All</span>
                    </button>
                    <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0" />
                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.full
                        let dotClass = ""
                        if (isSelected) dotClass = "bg-blue-500"
                        else if (day.isToday) dotClass = "bg-[#ef4444]"

                        return (
                            <button key={idx} onClick={() => setSelectedDate(day.full)} className={`flex flex-col items-center gap-1.5 relative w-10 transition-all ${isSelected ? "opacity-100" : "opacity-60"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${dotClass}`} style={{ opacity: dotClass ? 1 : 0 }} />
                                <span className={`text-[12px] font-medium ${isSelected ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>{day.label}</span>
                                <span className={`text-[16px] font-bold ${isSelected ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>{day.num}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="mt-10 flex flex-col items-center">
                    <p className="text-[#8e8e93] text-[14px] font-bold tracking-widest uppercase mb-3" style={{ fontFamily: SF }}>Schedule</p>
                    <div className="flex items-center gap-6 text-[26px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-6 h-6 text-[#8e8e93] stroke-[2]" />
                            <span>{activeEvents.length} events</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bell className="w-6 h-6 text-[#8e8e93] stroke-[2]" />
                            <span>{activeReminders.length} reminders</span>
                        </div>
                    </div>
                </div>

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

                <div className="px-5 mt-10 pb-10">
                    {filteredTasks.length === 0 ? (
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
                            <div className="flex flex-col gap-3">
                                {SUGGESTIONS.map((sug, idx) => (
                                    <TaskCard key={idx} item={sug} isSuggestion={true} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-in fade-in duration-500">
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex bg-[#1c1c1e] p-1 rounded-full w-[220px] border border-[#2c2c2e]">
                                    <button
                                        onClick={() => setListView("events")}
                                        className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${listView === "events" ? "bg-white text-black shadow-sm" : "text-[#8e8e93] hover:text-white"}`}
                                        style={{ fontFamily: SF }}
                                    >
                                        Events
                                    </button>
                                    <button
                                        onClick={() => setListView("reminders")}
                                        className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${listView === "reminders" ? "bg-white text-black shadow-sm" : "text-[#8e8e93] hover:text-white"}`}
                                        style={{ fontFamily: SF }}
                                    >
                                        Reminders
                                    </button>
                                </div>
                                {showViewAllButton && (
                                    <button 
                                        onClick={() => setViewAll(!viewAll)} 
                                        className="text-[#3b82f6] text-[14px] font-medium px-2 py-1 active:opacity-70 transition-opacity"
                                    >
                                        {viewAll ? "Collapse" : "View All"}
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {currentList.length === 0 ? (
                                    <div className="py-6 text-center">
                                        <p className="text-[#636366] text-sm font-medium" style={{ fontFamily: SF }}>No {listView} scheduled</p>
                                    </div>
                                ) : (
                                    displayedList.map((task, idx) => {
                                        const isLastItem = idx === displayedList.length - 1;
                                        const shouldFade = isLastItem && !viewAll && showViewAllButton;
                                        return <TaskCard key={task.id} item={task} isLastAndFaded={shouldFade} />
                                    })
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* ── NavBar Bottom ── */}
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

            {/* ── MODAL DE CREACIÓN ── */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        
                        <div className="flex items-center justify-between mb-4 pt-1">
                            <h3 className="text-white font-bold text-[24px] tracking-tight" style={{ fontFamily: SFD }}>
                                Create New
                            </h3>
                            <button onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70">
                                <X className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        <div className="flex bg-[#1c1c1e] p-1 rounded-full w-full mb-5 border border-[#2c2c2e]">
                            <button
                                onClick={() => { setCreationMode("events"); setEventType(EVENT_OPTIONS[0]); setActivePicker(null); }}
                                className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode === "events" ? "bg-white text-black shadow-sm" : "text-[#8e8e93] hover:text-white"}`}
                                style={{ fontFamily: SF }}
                            >
                                Event
                            </button>
                            <button
                                onClick={() => { setCreationMode("reminders"); setEventType(REMINDER_OPTIONS[0]); setActivePicker(null); }}
                                className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode === "reminders" ? "bg-white text-black shadow-sm" : "text-[#8e8e93] hover:text-white"}`}
                                style={{ fontFamily: SF }}
                            >
                                Reminder
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 no-scrollbar pb-8 space-y-4">
                            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
                                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                                    
                                    {/* Type */}
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
                                                <WheelPicker items={creationMode === "events" ? EVENT_OPTIONS : REMINDER_OPTIONS} value={eventType} onChange={setEventType} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Title & Icon */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between w-full p-4 border-b border-[#2c2c2e]">
                                            <button onClick={() => togglePicker("icon")} className="flex items-center gap-3 active:opacity-70">
                                                {(() => {
                                                    const SelectedIcon = ICONS[taskIcon] || CalendarDays;
                                                    return <SelectedIcon className="w-5 h-5" style={{ color: ICON_COLORS[taskIcon] || "#ffffff" }} />
                                                })()}
                                                <span className="text-white text-[16px] font-medium">Title & Icon</span>
                                            </button>
                                            <input type="text" placeholder="Add title..." value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white" />
                                        </div>
                                        {activePicker === "icon" && (
                                            <div className="grid grid-cols-6 gap-4 py-5 px-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95">
                                                {Object.keys(ICONS).map(key => {
                                                    const IconComponent = ICONS[key];
                                                    const isSelected = taskIcon === key;
                                                    return (
                                                        <button 
                                                            key={key} 
                                                            onClick={() => { setTaskIcon(key); setActivePicker(null); }} 
                                                            className={`flex flex-col items-center justify-center transition-all ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                                                        >
                                                            <IconComponent className="w-6 h-6" style={{ color: ICON_COLORS[key] }} />
                                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: ICON_COLORS[key] }} />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Time */}
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

                                    {/* Event/Reminder Specific Configurations */}
                                    
                                    {(eventType === "Schedule Email" || eventType === "Drive Upload") && (
                                        <>
                                            {eventType === "Schedule Email" && (
                                                <div className="flex items-center justify-between w-full p-4">
                                                    <div className="flex items-center gap-3"><AtSign className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Recipient</span></div>
                                                    <input type="email" placeholder="client@ex.com" value={taskEmailRec} onChange={e=>setTaskEmailRec(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                                </div>
                                            )}
                                            
                                            {/* File Uploader via Native File System */}
                                            <div className="flex flex-col w-full p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3"><Paperclip className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Attachments</span></div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[#8e8e93] text-[14px]">{attachedFiles.length} / 5</span>
                                                        <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                                        <button onClick={triggerFileSelect} disabled={attachedFiles.length >= 5} className="bg-[#2c2c2e] text-white px-3 py-1.5 rounded-full text-[13px] font-medium active:scale-95 transition-transform disabled:opacity-50">+ Add</button>
                                                        {attachedFiles.length > 0 && <button onClick={() => setAttachedFiles([])} className="text-red-400 px-2 py-1.5 text-[13px]">Clear</button>}
                                                    </div>
                                                </div>
                                                {/* Mini list of attached files */}
                                                {attachedFiles.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {attachedFiles.map((f, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 bg-[#2c2c2e] px-2.5 py-1 rounded-md text-[11px] text-[#e4e4e7] max-w-full">
                                                                <span className="truncate max-w-[120px]">{f.name}</span>
                                                                <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3 text-[#8e8e93] hover:text-red-400" /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Config for Custom Events (Links) */}
                                    {eventType === "Custom Event" && (
                                        <div className="flex items-center justify-between w-full p-4">
                                            <div className="flex items-center gap-3"><LinkIcon className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Meeting URL</span></div>
                                            <input type="text" placeholder="https://..." value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white" />
                                        </div>
                                    )}

                                    {/* Config for Routine Reminders (Frequency) */}
                                    {eventType === "Take Medication" && (
                                        <div className="flex items-center justify-between w-full p-4">
                                            <div className="flex items-center gap-3"><RefreshCcw className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Frequency</span></div>
                                            <input type="text" placeholder="e.g. Every 8h" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                    )}

                                    {/* General Tag/Config */}
                                    {(eventType === "Workout / Gym" || eventType === "Deep Work" || eventType === "Meal Time") && (
                                        <div className="flex items-center justify-between w-full p-4">
                                            <div className="flex items-center gap-3"><Type className="w-[20px] h-[20px] text-[#8e8e93]" /><span className="text-white text-[16px] font-medium">Config / Tag</span></div>
                                            <input type="text" placeholder="e.g. Chest Day" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" />
                                        </div>
                                    )}

                                    {/* Alert / Reminder Time offset */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("reminder")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                <span className="text-white text-[16px] font-medium">Alert Offset</span>
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
                                    Save {creationMode === "events" ? "Event" : "Reminder"}
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
