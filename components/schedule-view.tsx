"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, Globe
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

type NavTab = "tasks" | "edit" | "search" | "create"
type ScheduleType = "email" | "drive" | "reminder" | "telegram_channel" | "custom" | "suggested" | null

const ICON_MAP: Record<string, any> = {
    CalendarDays, Clock, Bell, Mail, Folder, Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Send, Coffee
}

const THEME_COLORS = [
    { name: "Blue", hex: "#3b82f6" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
]

const TIMEZONES = ["New York (GMT-5)", "London (GMT+0)", "Madrid (GMT+1)", "Mexico City (GMT-6)", "Tokyo (GMT+9)", "Dubai (GMT+4)"]

// ── Wheel Picker Component ──
function WheelPicker({ items, value, onChange, suffix = "" }: { items: string[], value: string, onChange: (v: string) => void, suffix?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const itemHeight = 40 
    const handleScroll = () => {
        if (!containerRef.current) return
        const index = Math.round(containerRef.current.scrollTop / itemHeight)
        if (items[index] && items[index] !== value) onChange(items[index])
    }
    return (
        <div ref={containerRef} onScroll={handleScroll} className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center wheel-mask">
            <div style={{ minHeight: "40px" }} className="w-full shrink-0" />
            {items.map((item, i) => (
                <div key={i} className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${item === value ? 'text-white text-[20px] font-bold' : 'text-[#636366] text-[18px]'}`} style={{ fontFamily: SFD }}>
                    {item}{suffix && item === value ? <span className="text-[14px] ml-1 text-[#8e8e93]">{suffix}</span> : ""}
                </div>
            ))}
            <div style={{ minHeight: "40px" }} className="w-full shrink-0" />
        </div>
    )
}

export function ScheduleView() {
    const { setCurrentView } = useApp()
    const [tasks, setTasks] = useState<any[]>([]) 
    const [selectedDate, setSelectedDate] = useState<string | "All">("All")
    const [activeNavTab, setActiveNavTab] = useState<NavTab>("tasks")
    const [isEditingMode, setIsEditingMode] = useState(false)
    
    // Modales
    const [showTZPicker, setShowTZPicker] = useState(true) // Empieza con zona horaria
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [activePicker, setActivePicker] = useState<string | null>(null)
    
    // Form States
    const [tz, setTz] = useState("Mexico City (GMT-6)")
    const [eventType, setEventType] = useState("Custom Event")
    const [taskIcon, setTaskIcon] = useState("CalendarDays")
    const [taskColor, setTaskColor] = useState("#3b82f6")
    const [taskTitle, setTaskTitle] = useState("")
    const [isPriority, setIsPriority] = useState(false)
    const [selHour, setSelHour] = useState("08"); const [selMin, setSelMin] = useState("00")

    // Calendario desde HOY
    const calendarDays = useMemo(() => {
        return Array.from({length: 7}, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() + i)
            return { full: d.toDateString(), label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), num: d.getDate().toString(), isToday: i === 0 }
        })
    }, [])

    const priorityTasks = useMemo(() => tasks.filter(t => t.isPriority).slice(0, 2), [tasks])

    function handleSaveConfig() {
        setTasks(prev => [{
            id: Date.now(),
            title: taskTitle || eventType,
            time: `${selHour}:${selMin}`,
            date: selectedDate === "All" ? new Date().toDateString() : selectedDate,
            icon: taskIcon,
            color: taskColor,
            isPriority,
            status: "ACTIVE"
        }, ...prev])
        setConfigModalOpen(false); setActivePicker(null);
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#000] text-white select-none overflow-hidden relative">
            <style>{`
                .wheel-mask { mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%); }
                .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
                @keyframes jiggle { 0% { transform: rotate(-0.5deg); } 50% { transform: rotate(0.5deg); } 100% { transform: rotate(-0.5deg); } }
            `}</style>

            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/landscape.jpg')", filter: "blur(50px)" }} />
            
            <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
                {/* Header */}
                <div className="pt-10 flex justify-center items-end gap-1">
                    <span className="text-white text-[22px] font-bold">{new Date().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-[#8e8e93] text-[22px] font-bold opacity-50">{new Date().getFullYear()}</span>
                </div>

                {/* Calendar */}
                <div className="flex justify-between items-center px-6 mt-8">
                    <button onClick={() => setSelectedDate("All")} className={`w-12 h-14 rounded-full transition-all ${selectedDate === "All" ? "bg-white text-black font-bold" : "bg-[#1c1c1e] text-[#8e8e93]"}`}>All</button>
                    <div className="w-px h-8 bg-[#2c2c2e]" />
                    {calendarDays.map((day, idx) => (
                        <button key={idx} onClick={() => setSelectedDate(day.full)} className={`flex flex-col items-center gap-1 w-10 transition-all ${selectedDate === day.full ? "opacity-100" : "opacity-50"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedDate === day.full ? "bg-blue-500" : day.isToday ? "bg-red-500" : "transparent"}`} />
                            <span className="text-[12px] font-medium">{day.label}</span>
                            <span className="text-[16px] font-bold">{day.num}</span>
                        </button>
                    ))}
                </div>

                {/* Highlights (Priority Tasks) */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    {priorityTasks.length > 0 ? priorityTasks.map(t => {
                        const Icon = ICON_MAP[t.icon] || CalendarDays
                        return (
                            <div key={t.id} className="flex items-center gap-3 bg-[#1c1c1e]/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5 animate-in zoom-in-95" style={{ boxShadow: `0 0 20px ${t.color}10` }}>
                                <Icon className="w-4 h-4" style={{ color: t.color }} />
                                <span className="text-[14px] font-medium" style={{ color: t.color }}>{t.title} <span className="opacity-50 font-normal">at {t.time}</span></span>
                            </div>
                        )
                    }) : (
                        <div className="flex items-center gap-3 bg-[#1c1c1e] px-5 py-2.5 rounded-full border border-[#2c2c2e]">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-[14px] font-medium">No priority tasks set</span>
                        </div>
                    )}
                </div>

                {/* Active Events */}
                <div className="px-5 mt-10">
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <CalendarDays className="w-5 h-5 text-[#8e8e93]" />
                        <span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase">Active Events</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {filteredTasks.map(task => {
                            const Icon = ICON_MAP[task.icon] || CalendarDays
                            return (
                                <div key={task.id} className={`relative ${isEditingMode ? 'jiggle-card' : ''}`}>
                                    <div className="flex items-center justify-between bg-[#1c1c1e]/40 backdrop-blur-xl p-4 rounded-full border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#000]/40" style={{ border: `1px solid ${task.color}30` }}>
                                                <Icon className="w-5 h-5" style={{ color: task.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-white text-[16px] font-bold">{task.title}</h3>
                                                <p className="text-[#8e8e93] text-[12px]">{task.time}</p>
                                            </div>
                                        </div>
                                        {task.isPriority && <div className="w-2 h-2 rounded-full mr-2" style={{ background: task.color, boxShadow: `0 0 10px ${task.color}` }} />}
                                    </div>
                                    {isEditingMode && (
                                        <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-black active:scale-90 transition-transform z-10"><Trash2 className="w-4 h-4 text-white" /></button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* NavBar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-8 pointer-events-none">
                <div className="pointer-events-auto flex items-center p-1.5 gap-1 bg-[#0f0f0f]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl">
                    <button onClick={() => { setIsEditingMode(false); setActiveNavTab("tasks") }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeNavTab === "tasks" ? "bg-white text-black" : "text-white"}`}><CalendarDays className="w-6 h-6" /></button>
                    <button onClick={() => { setIsEditingMode(true); setActiveNavTab("edit") }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isEditingMode ? "bg-white text-black" : "text-white"}`}><Pencil className="w-6 h-6" /></button>
                    <div className="w-px h-8 bg-white/10 mx-1" />
                    <button onClick={() => handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 border border-white/10"><Plus className="w-7 h-7 text-white" /></button>
                </div>
            </div>

            {/* TZ Initial Picker */}
            {showTZPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="w-[85%] bg-[#1c1c1e] rounded-[32px] p-6 border border-white/10 shadow-2xl">
                        <Globe className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-center text-xl font-bold mb-2">Select Time Zone</h3>
                        <p className="text-center text-[#8e8e93] text-sm mb-6">AI will sync tasks to your local time.</p>
                        <div className="bg-black/40 rounded-2xl p-2 mb-6"><WheelPicker items={TIMEZONES} value={tz} onChange={setTz} /></div>
                        <button onClick={() => setShowTZPicker(false)} className="w-full py-4 bg-white text-black font-bold rounded-2xl active:scale-95 transition-all">Set and Continue</button>
                    </div>
                </div>
            )}

            {/* Config Modal */}
            {configModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfigModalOpen(false)} />
                    <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 bg-[#111] max-h-[90vh] flex flex-col">
                        <div className="w-12 h-1.5 bg-[#333] rounded-full mx-auto mb-4 shrink-0" />
                        <div className="overflow-y-auto no-scrollbar pb-10 space-y-4">
                            <h3 className="text-2xl font-bold mb-4">New Event</h3>
                            <div className="bg-[#1c1c1e] rounded-[28px] divide-y divide-white/5 overflow-hidden">
                                <button onClick={() => togglePicker("type")} className="flex justify-between w-full p-4 items-center"><span>Type</span><span className="text-blue-500">{eventType}</span></button>
                                {activePicker === "type" && <div className="bg-black/20 p-2"><WheelPicker items={["Custom Event", "Personal Reminder", "Schedule Email", "Workout / Gym", "Meal Time"]} value={eventType} onChange={setEventType} /></div>}
                                
                                <div className="flex justify-between w-full p-4 items-center"><span>Title</span><input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="bg-transparent text-right text-blue-500 outline-none w-1/2" placeholder="Add title..." /></div>
                                
                                <button onClick={() => togglePicker("time")} className="flex justify-between w-full p-4 items-center"><span>Time</span><span className="text-blue-500">{selHour}:{selMin}</span></button>
                                {activePicker === "time" && <div className="flex gap-4 p-4 bg-black/20"><WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h" /><WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m" /></div>}

                                <div className="flex justify-between w-full p-4 items-center"><span>Priority</span><button onClick={() => setIsPriority(!isPriority)} className={`w-12 h-6 rounded-full relative transition-all ${isPriority ? 'bg-blue-500' : 'bg-[#333]'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPriority ? 'left-7' : 'left-1'}`} /></button></div>

                                <div className="p-4 space-y-3">
                                    <span>Theme Color</span>
                                    <div className="flex gap-4">
                                        {THEME_COLORS.map(c => (
                                            <button key={c.hex} onClick={() => setTaskColor(c.hex)} className={`w-8 h-8 rounded-full border-2 ${taskColor === c.hex ? 'border-white' : 'border-transparent'}`} style={{ background: c.hex }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSaveConfig} className="w-full py-4 bg-white text-black font-bold rounded-2xl mt-4 active:scale-95 transition-all">Save Schedule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
