"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee,
  Wallet, Activity, LineChart, PieChart, ArrowUpRight, ArrowDownRight, BadgeCheck, Copy,
  Zap, ShieldCheck, BarChart3, Coins
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

type NavTab = "tasks" | "edit" | "search" | "create"

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
    Coffee: <Coffee className="w-5 h-5" />,
    Activity: <Activity className="w-5 h-5" />,
    Wallet: <Wallet className="w-5 h-5" />,
    LineChart: <LineChart className="w-5 h-5" />,
    PieChart: <PieChart className="w-5 h-5" />,
    Zap: <Zap className="w-5 h-5" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5" />,
    Coins: <Coins className="w-5 h-5" />
}

// ── Event Types (Estándar + Crypto) ──
const EVENT_TYPES = [
    "Custom Event", 
    "Personal Reminder",
    "Schedule Email", 
    "Drive Upload", 
    "Workout / Gym", 
    "Deep Work",
    "Meal Time",
    "Send Message",
    "Market Watch",
    "Wallet Sentinel",
    "Wealth Insights",
    "Harvest Monitor"
]

const TOKENS = ["TON", "NOT", "DOGS", "FISH"]
const CONDITIONS = ["Price Pumps Above", "Price Dumps Below", "Flash Drop (>8%)", "Mooning (>10%)"]
const FREQUENCIES = ["Weekly Digest", "Monthly Insight"]
const TXN_TYPES = ["Heavy Inflow", "Large Outflow", "Any Jetton", "Smart Contracts"]

// ── Componente de Selección Estilo "Pill" ──
function PillSelector({ options, selected, onSelect }: { options: string[], selected: string, onSelect: (s: string) => void }) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${
                        selected === opt ? "bg-[#0098EA] text-white border-[#0098EA] shadow-[0_0_15px_rgba(0,152,234,0.3)]" : "bg-[#1c1c1e] text-[#8e8e93] border-[#2c2c2e]"
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    )
}

function WheelPicker({ items, value, onChange, suffix = "" }: { items: string[], value: string, onChange: (v: string) => void, suffix?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 40 
    const handleScroll = () => {
        if (!containerRef.current) return
        const index = Math.round(containerRef.current.scrollTop / itemHeight)
        if (items[index] && items[index] !== value) onChange(items[index])
    }
    return (
        <div ref={containerRef} onScroll={handleScroll} className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center relative z-10">
            <div style={{ minHeight: `${itemHeight}px` }} className="w-full shrink-0" />
            {items.map((item, i) => (
                <div key={i} className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${item === value ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px] font-medium'}`}>
                    {item}{suffix && item === value ? <span className="text-[14px] ml-1 text-[#8e8e93]">{suffix}</span> : ""}
                </div>
            ))}
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
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activePicker, setActivePicker] = useState<string | null>(null)
    
    // States Originales (Eventos Genéricos)
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDesc, setTaskDesc] = useState("")
    const [taskEmailRec, setTaskEmailRec] = useState("")
    
    // Date/Time Selectors
    const [selHour, setSelHour] = useState("08")
    const [selMin, setSelMin] = useState("00")
    const [selMonth, setSelMonth] = useState("Sep")
    const [selDayNum, setSelDayNum] = useState("23")
    const [selRemMin, setSelRemMin] = useState("10")
    const [selRemSec, setSelRemSec] = useState("00")

    // Crypto States
    const [cryptoToken, setCryptoToken] = useState("TON")
    const [alertCondition, setAlertCondition] = useState("Price Pumps Above")
    const [targetPrice, setTargetPrice] = useState("5.50")
    const [reportFreq, setReportFreq] = useState("Weekly Digest")
    const [txnType, setTxnType] = useState("Heavy Inflow")

    // Data Generators
    const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'))
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const secs = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'))
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = Array.from({length: 31}, (_, i) => (i + 1).toString())

    const isCryptoEvent = ["Market Watch", "Wallet Sentinel", "Wealth Insights", "Harvest Monitor"].includes(eventType)

    useEffect(() => {
        const mapping: Record<string, {icon: string, title: string}> = {
            "Workout / Gym": {icon: "Dumbbell", title: "Workout"},
            "Deep Work": {icon: "Laptop", title: "Deep Work Session"},
            "Meal Time": {icon: "Utensils", title: "Lunch Break"},
            "Schedule Email": {icon: "Mail", title: "Send Email"},
            "Send Message": {icon: "MessageSquare", title: "Send Message"},
            "Drive Upload": {icon: "Folder", title: "Backup to Drive"},
            "Personal Reminder": {icon: "Bell", title: "Reminder"},
            "Market Watch": {icon: "LineChart", title: "Price Alert"},
            "Wallet Sentinel": {icon: "ShieldCheck", title: "Security Alert"},
            "Wealth Insights": {icon: "PieChart", title: "Portfolio Report"},
            "Harvest Monitor": {icon: "Coins", title: "Staking Harvest"},
            "Custom Event": {icon: "CalendarDays", title: ""}
        }
        if(mapping[eventType]) {
            setTaskIcon(mapping[eventType].icon)
            setTaskTitle(mapping[eventType].title)
        }
    }, [eventType])

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

    const filteredTasks = useMemo(() => selectedDate === "All" ? tasks : tasks.filter(t => t.date === selectedDate), [tasks, selectedDate])

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
        setActivePicker(activePicker === picker ? null : picker)
    }

    function handleSaveConfig() {
        setLoading(true)
        setTimeout(() => {
            let finalTitle = taskTitle || eventType
            if (eventType === "Market Watch") finalTitle = `${cryptoToken} Target $${targetPrice}`
            else if (eventType === "Wallet Sentinel") finalTitle = `${txnType} Alert`
            else if (eventType === "Wealth Insights") finalTitle = `${reportFreq} Report`

            setTasks(prev => [{
                id: Date.now(),
                title: finalTitle,
                time: `${selHour}:${selMin} ${parseInt(selHour) >= 12 ? 'PM' : 'AM'}`,
                date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
                iconName: taskIcon
            }, ...prev])
            setConfigModalOpen(false)
            setActivePicker(null)
            setLoading(false)
            setActiveNavTab("tasks")
        }, 600)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-black text-white select-none overflow-hidden relative">
            <style>{`
                @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%); }
                .glass-card { background: rgba(28, 28, 30, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
            `}</style>

            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                
                {/* ── Top Header & Calendar ── */}
                <div className="pt-12 px-6 flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[#8e8e93] text-[12px] font-bold tracking-[2px] uppercase" style={{ fontFamily: SF }}>{monthStr} {yearStr}</span>
                        <h1 className="text-[32px] font-bold tracking-tight" style={{ fontFamily: SFD }}>Timeline</h1>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#1c1c1e] flex items-center justify-center border border-[#2c2c2e]">
                        <Activity className="w-5 h-5 text-[#0098EA]" />
                    </div>
                </div>

                <div className="flex justify-between items-center px-6 mb-8">
                    <button 
                        onClick={() => setSelectedDate("All")}
                        className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black" : "bg-[#1c1c1e] text-[#8e8e93]"}`}
                    >
                        <span className="text-[14px] font-bold" style={{ fontFamily: SF }}>All</span>
                    </button>
                    <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0" />
                    {calendarDays.map((day, idx) => {
                        const isSelected = selectedDate === day.full
                        let dotClass = isSelected ? "bg-[#0098EA]" : day.isToday ? "bg-[#ef4444]" : ""

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

                {/* ── Active Trackers Section ── */}
                <div className="px-5 mt-4 flex-1">
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase">Live Trackers</span>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="p-10 text-center rounded-[32px] border border-dashed border-[#2c2c2e] bg-[#0a0a0a]">
                            <p className="text-[#444] font-medium" style={{ fontFamily: SF }}>No events or alerts active</p>
                            <button onClick={() => setConfigModalOpen(true)} className="mt-4 text-[#0098EA] font-bold text-[14px]" style={{ fontFamily: SF }}>Create your first tracker</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTasks.map(task => (
                                <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                    <div className="glass-card rounded-[24px] p-5 flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                {ICON_MAP[task.iconName] || <CalendarDays className="w-5 h-5 text-white" />}
                                            </div>
                                            <div>
                                                <h3 className="text-white text-[17px] font-bold" style={{ fontFamily: SFD }}>{task.title}</h3>
                                                <p className="text-[#8e8e93] text-[13px] mt-0.5">{task.time} • Ready</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#444]" />
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
                            ))}
                        </div>
                    )}
                </div>

                {/* ── TON CHART SECTION (Footer visual) ── */}
                <div className="mx-5 mt-14 mb-6 glass-card rounded-[32px] overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-full bg-[#0098EA] flex items-center justify-center shadow-[0_0_20px_rgba(0,152,234,0.4)]">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-white text-[18px] font-bold" style={{ fontFamily: SFD }}>TON Mainnet</h2>
                                        <BadgeCheck className="w-4 h-4 text-[#0098EA]" fill="currentColor" />
                                    </div>
                                    <p className="text-[#8e8e93] text-[12px] font-medium tracking-wide">MARKET OVERVIEW</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-white text-[24px] font-bold leading-none" style={{ fontFamily: SFD }}>$5.42</h1>
                                <p className="text-[#22c55e] text-[12px] font-bold mt-1">+2.4%</p>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="relative h-32 w-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M0,80 L30,75 L50,85 L70,30 L100,25 L100,100 L0,100 Z" fill="rgba(34, 197, 94, 0.1)" />
                                <path d="M0,80 L30,75 L50,85 L70,30 L100,25" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </svg>
                        </div>

                        <button 
                            onClick={() => { setEventType("Market Watch"); setConfigModalOpen(true); }}
                            className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[15px]"
                        >
                            <Bell className="w-4 h-4" />
                            Set Price Reminder
                        </button>
                    </div>
                </div>
            </div>

            {/* ── NavBar (Liquid Style) ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-8">
                <div className="flex items-center p-2 gap-1 bg-[#1a1a1c]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
                    <button onClick={() => handleNavTabClick("tasks")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}>
                        <CalendarDays className="w-6 h-6" />
                        {activeNavTab === "tasks" && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0098EA] border border-black" />}
                    </button>
                    <button onClick={() => handleNavTabClick("edit")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${isEditingMode ? "bg-white text-black" : "text-white"}`}>
                        <Pencil className="w-6 h-6" />
                        {isEditingMode && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black" />}
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    <button onClick={() => handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-[#0098EA] flex items-center justify-center shadow-[0_0_20px_rgba(0,152,234,0.4)] active:scale-90 transition-transform">
                        <Plus className="w-7 h-7 text-white" strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* ── MODAL UNIFICADO (Soporta Eventos Clásicos y Crypto) ── */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} />
                    <div className="relative w-full rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-500 max-h-[92vh] flex flex-col bg-[#0f0f0f] border-t border-white/10">
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-[28px] tracking-tight" style={{ fontFamily: SFD }}>Configure</h3>
                            <button onClick={() => { setConfigModalOpen(false); setActivePicker(null); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1c1c1e] active:bg-[#2c2c2e] border border-[#2c2c2e]">
                                <X className="w-5 h-5 text-[#8e8e93]" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 no-scrollbar space-y-6 pb-6">
                            
                            {/* 1. CONTENEDOR PRINCIPAL: TIPO Y OPCIONES */}
                            <div className="bg-[#1c1c1e] rounded-[32px] p-2 border border-[#2c2c2e]">
                                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                                    
                                    {/* Action Type Picker */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("type")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-[24px] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-[20px] h-[20px] text-yellow-500 fill-yellow-500" />
                                                <span className="text-white text-[16px] font-bold">Action Type</span>
                                            </div>
                                            <span className="text-[#8e8e93] text-[15px] font-medium">{eventType}</span>
                                        </button>
                                        {activePicker === "type" && (
                                            <div className="flex items-center justify-center py-4 bg-black/40 rounded-[24px] my-1 mx-2 animate-in fade-in wheel-mask">
                                                <WheelPicker items={EVENT_TYPES} value={eventType} onChange={setEventType} />
                                            </div>
                                        )}
                                    </div>

                                    {/* --- RAMA A: OPCIONES CRYPTO / SMART TILES --- */}
                                    {isCryptoEvent && (
                                        <div className="p-4 space-y-5 animate-in fade-in duration-300">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#8e8e93] text-[12px] font-bold uppercase tracking-wider ml-1">Asset Selection</span>
                                                <PillSelector options={TOKENS} selected={cryptoToken} onSelect={setCryptoToken} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#8e8e93] text-[12px] font-bold uppercase tracking-wider ml-1">Trigger Condition</span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(eventType === "Market Watch" ? CONDITIONS : eventType === "Wealth Insights" ? FREQUENCIES : TXN_TYPES).map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => {
                                                                if(eventType === "Market Watch") setAlertCondition(opt)
                                                                else if(eventType === "Wealth Insights") setReportFreq(opt)
                                                                else setTxnType(opt)
                                                            }}
                                                            className={`p-3 rounded-[20px] text-left transition-all border ${
                                                                (alertCondition === opt || txnType === opt || reportFreq === opt) 
                                                                ? "bg-[#0098EA] border-[#0098EA] text-white shadow-[0_0_15px_rgba(0,152,234,0.3)]" 
                                                                : "bg-black/40 border-[#2c2c2e] text-[#8e8e93]"
                                                            }`}
                                                        >
                                                            <span className="text-[13px] font-bold leading-tight">{opt}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {eventType === "Market Watch" && (
                                                <div className="bg-black/40 p-4 rounded-[20px] flex items-center justify-between border border-[#2c2c2e]">
                                                    <span className="text-white font-bold text-[15px]">Target Price</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[#8e8e93] font-bold">$</span>
                                                        <input 
                                                            type="number" step="0.01"
                                                            value={targetPrice} onChange={e=>setTargetPrice(e.target.value)} 
                                                            className="bg-transparent text-white text-[20px] font-bold w-20 text-right focus:outline-none" 
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* --- RAMA B: OPCIONES ESTÁNDAR ORIGINALES --- */}
                                    {!isCryptoEvent && (
                                        <>
                                            {/* Icon & Title Row */}
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between w-full p-4">
                                                    <button onClick={() => togglePicker("icon")} className="flex items-center gap-3 active:opacity-70">
                                                        <div className="w-8 h-8 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
                                                            {ICON_MAP[taskIcon] || <CalendarDays className="w-4 h-4 text-white" />}
                                                        </div>
                                                        <span className="text-white text-[16px] font-bold">Title</span>
                                                    </button>
                                                    <input type="text" placeholder="Custom Name" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white font-medium" />
                                                </div>
                                                {activePicker === "icon" && (
                                                    <div className="grid grid-cols-6 gap-3 py-4 px-4 bg-black/40 rounded-[24px] my-1 mx-2 animate-in fade-in">
                                                        {Object.keys(ICON_MAP).map(key => (
                                                            <button key={key} onClick={() => { setTaskIcon(key); setActivePicker(null); }} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${taskIcon === key ? 'bg-[#0098EA] text-white shadow-[0_0_15px_rgba(0,152,234,0.3)]' : 'bg-[#2c2c2e] text-[#8e8e93]'}`}>
                                                                {ICON_MAP[key]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Calendar Row */}
                                            <div className="flex flex-col">
                                                <button onClick={() => togglePicker("calendar")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <CalendarDays className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                        <span className="text-white text-[16px] font-bold">Calendar</span>
                                                    </div>
                                                    <span className="text-[#8e8e93] text-[15px] font-medium">{selMonth} {selDayNum}</span>
                                                </button>
                                                {activePicker === "calendar" && (
                                                    <div className="flex items-center justify-center gap-6 py-4 bg-black/40 rounded-[24px] my-1 mx-2 animate-in fade-in wheel-mask">
                                                        <WheelPicker items={months} value={selMonth} onChange={setSelMonth} />
                                                        <WheelPicker items={days} value={selDayNum} onChange={setSelDayNum} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Schedule Email Input */}
                                            {eventType === "Schedule Email" && (
                                                <div className="flex items-center justify-between w-full p-4">
                                                    <div className="flex items-center gap-3">
                                                        <AtSign className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                        <span className="text-white text-[16px] font-bold">Recipient</span>
                                                    </div>
                                                    <input type="email" placeholder="client@ex.com" value={taskEmailRec} onChange={e=>setTaskEmailRec(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white font-medium" />
                                                </div>
                                            )}

                                            {/* Reminders Row */}
                                            <div className="flex flex-col">
                                                <button onClick={() => togglePicker("reminder")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-b-[24px] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Bell className="w-[20px] h-[20px] text-[#8e8e93]" />
                                                        <span className="text-white text-[16px] font-bold">Reminders</span>
                                                    </div>
                                                    <span className="text-[#8e8e93] text-[15px] font-medium">{selRemMin}m {selRemSec}s</span>
                                                </button>
                                                {activePicker === "reminder" && (
                                                    <div className="flex items-center justify-center gap-6 py-4 bg-black/40 rounded-[24px] mb-2 mx-2 animate-in fade-in wheel-mask">
                                                        <WheelPicker items={mins} value={selRemMin} onChange={setSelRemMin} suffix="m" />
                                                        <WheelPicker items={secs} value={selRemSec} onChange={setSelRemSec} suffix="s" />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* --- APLICA A AMBOS (Time) --- */}
                                    <div className="flex flex-col">
                                        <button onClick={() => togglePicker("time")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-b-[24px] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-[20px] h-[20px] text-blue-500" />
                                                <span className="text-white text-[16px] font-bold">Execution Time</span>
                                            </div>
                                            <span className="text-white text-[18px] font-bold">{selHour}:{selMin}</span>
                                        </button>
                                        {activePicker === "time" && (
                                            <div className="flex items-center justify-center gap-6 py-4 bg-black/40 rounded-[24px] mb-2 mx-2 animate-in fade-in wheel-mask">
                                                <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h" />
                                                <span className="text-xl font-bold text-[#636366]">:</span>
                                                <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m" />
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* 2. DESCRIPTION (Aplica a ambos) */}
                            <div className="bg-[#1c1c1e] rounded-[32px] p-5 flex flex-col gap-2 border border-[#2c2c2e]">
                                <div className="flex items-center gap-3 pl-1">
                                    <AlignLeft className="w-[18px] h-[18px] text-[#8e8e93]" />
                                    <span className="text-white text-[15px] font-bold">Extra Note / Payload</span>
                                </div>
                                <textarea 
                                    rows={3}
                                    placeholder="Add custom notes or instructions..."
                                    value={taskDesc}
                                    onChange={e=>setTaskDesc(e.target.value)}
                                    className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-1 text-[15px] leading-relaxed font-medium"
                                    style={{ fontFamily: SF }}
                                />
                            </div>

                            <button onClick={handleSaveConfig} className="w-full py-5 bg-[#0098EA] text-white font-bold rounded-[24px] text-[18px] shadow-[0_10px_30px_rgba(0,152,234,0.3)] active:scale-95 transition-all mt-4">
                                Deploy Tracker
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0098EA]" />
                        <span className="text-white font-bold tracking-widest text-[12px] uppercase">Syncing with System...</span>
                    </div>
                </div>
            )}
        </div>
    )
}
