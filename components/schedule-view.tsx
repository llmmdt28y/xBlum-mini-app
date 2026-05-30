"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { 
  Clock, Plus, X, Loader2, CheckCircle2, AlertCircle, 
  Trash2, ChevronDown, Pause, Play
} from "lucide-react"
import React from "react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// ── Styles ──
const RIPPLE_STYLE = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 600ms linear;
    background-color: rgba(255, 255, 255, 0.15);
    pointer-events: none;
    z-index: 0;
  }
  @keyframes ripple-anim {
    to { transform: scale(4); opacity: 0; }
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`

const greyGlowStyle = {
  backgroundColor: "#1c1c1e",
  border: "1px solid rgba(255, 255, 255, 0.10)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1.5px 1px rgba(255, 255, 255, 0.15)",
  transform: "translateZ(0)",
}

// ── Helpers ──
const getTg = () => typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const element = event.currentTarget
  if (element.disabled) return
  const circle = document.createElement("span")
  const diameter = Math.max(element.clientWidth, element.clientHeight)
  const radius = diameter / 2
  const rect = element.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top = `${event.clientY - rect.top - radius}px`
  circle.classList.add("ripple")
  const existingRipple = element.querySelector(".ripple")
  if (existingRipple) existingRipple.remove()
  element.appendChild(circle)
  setTimeout(() => circle.remove(), 600)
}

async function apiPost(endpoint: string, body: Record<string, unknown>) {
  const tg = getTg()
  const initData = tg?.initData ?? ""
  const userId = tg?.initDataUnsafe?.user?.id ?? null
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-init-data": initData
    },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`
    try {
      const errJson = await res.json()
      if (errJson.message) errorMsg = errJson.message
    } catch (_) {
      // Ignored
    }
    throw new Error(errorMsg)
  }
  return res.json()
}

// ── Types ──
interface ScheduleItem {
  id: number;
  title: string; 
  description: string; 
  repeat_type: string; 
  fire_at: string; 
  extra: string; 
}

// ── English Mocks ──
const MOCK_TASKS = [
  {
    title: "Tech Daily Brief",
    frequency: "Daily", time: "08:00", dayOfWeek: "Mon",
    prompt: "Summarize the most important developments in AI and Tech from the last 24 hours, including new tools, updates, and announcements. Prioritize model releases and open-source projects, including web search links. Organize the information to be easily digestible and readable."
  },
  {
    title: "Stock Performance",
    frequency: "Daily", time: "16:00", dayOfWeek: "Mon",
    prompt: "Give me the latest updates on $TON, $BTC, $NVDA, $PLTR, $ETH, including current price, recent changes, and projections. Analyze market sentiment and possible reasons for the movements. Organize the information to be easily digestible."
  },
  {
    title: "Weather & Wardrobe",
    frequency: "Daily", time: "07:00", dayOfWeek: "Mon",
    prompt: "Research today's weather for my location, providing rain probability, high/low temperatures, and a practical recommendation on how to dress or what to carry."
  },
  {
    title: "Stoic Reflection",
    frequency: "Daily", time: "21:30", dayOfWeek: "Mon",
    prompt: "Provide a powerful stoic quote to close the day and a deep introspection question for me to reflect on before going to sleep."
  },
  {
    title: "Weekly Crypto Recap",
    frequency: "Weekly", time: "18:00", dayOfWeek: "Fri",
    prompt: "Do a comprehensive analysis of the weekly movement of the top 10 cryptocurrencies. Point out which ones went up the most, which dropped, and the key news that defined the market this week."
  },
  {
    title: "Goal Coaching",
    frequency: "Weekly", time: "10:00", dayOfWeek: "Sun",
    prompt: "Generate 3 high-performance coaching questions to evaluate my productivity for the week ending today and help me strategically prioritize the one starting tomorrow."
  }
]

const FREQ_OPTIONS = [
  { value: "Once", label: "Once" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" }
]

const DOW_OPTIONS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" }
]

// ── UI Components ──
function Toggle({ on, onToggle, disabled, activeColor = "#ffffff" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      disabled={disabled}
      className={"relative rounded-full transition-colors duration-100 shrink-0 z-10 " + (disabled ? "opacity-50" : "")}
      style={{ width: "42px", height: "24px", background: on ? activeColor : "#2c2c2e" }}
    >
      <span className="absolute rounded-full transition-all duration-100 shadow-sm" style={{ width: "16px", height: "16px", top: "4px", background: on ? "#000000" : "#8e8e93", left: on ? "22px" : "4px" }} />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean; }) {
  return <div className="flex items-center"><Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor="#ffffff" /></div>
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[20px] overflow-hidden bg-[#111111] w-full border border-white/5 shadow-lg">{children}</div>
}

function Row({ label, rightNode, last = false }: { label: string; rightNode?: React.ReactNode; last?: boolean }) {
  return (
    <>
      <div className="relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5">
        <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF }}>{label}</span>
        {rightNode && <div className="flex items-center relative z-10 shrink-0 ml-2">{rightNode}</div>}
      </div>
      {!last && <div className="h-[1px] bg-[#1c1c1e] relative z-20 ml-4" />}
    </>
  )
}

function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#ffffff]' : 'border-[#555558]'}`}>
      {selected && <div className="w-[10px] h-[10px] rounded-full bg-[#ffffff]" />}
    </div>
  )
}

const DropdownSelect = ({ label, value, options, onSelect, isOpen, onToggle }: { label: string; value: string; options: {value: string, label: string}[]; onSelect: (val: string) => void; isOpen: boolean; onToggle: () => void }) => {
  return (
    <div className="relative w-full shrink-0">
      <label className="absolute -top-2.5 left-3 px-1.5 text-[13px] bg-[#000000] z-10 font-medium text-[#8e8e93]" style={{ fontFamily: SF }}>{label}</label>
      <button 
         onClick={(e) => { e.preventDefault(); onToggle(); }}
         className="w-full flex items-center justify-between bg-transparent border-[1.5px] border-[#555558] rounded-[12px] px-4 py-3.5 text-white focus:outline-none transition-colors duration-200"
         style={{ borderColor: isOpen ? '#ffffff' : '#555558' }}
      >
         <span style={{ fontFamily: SF, fontSize: "16px" }}>{options.find(o => o.value === value)?.label || value}</span>
         <ChevronDown className={`w-5 h-5 text-[#8e8e93] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#111111] border border-white/10 rounded-[16px] overflow-hidden z-[70] shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200">
             <div className="max-h-[220px] overflow-y-auto no-scrollbar py-2">
               {options.map((opt, idx) => (
                 <button 
                   key={opt.value} 
                   onClick={(e) => { e.preventDefault(); onSelect(opt.value); onToggle(); }}
                   className={`w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-[#1c1c1e] transition-colors ${idx !== options.length - 1 ? 'border-b border-[#1c1c1e]' : ''}`}
                 >
                   <RadioButton selected={value === opt.value} />
                   <span className="text-white text-[16px] font-medium" style={{ fontFamily: SF }}>{opt.label}</span>
                 </button>
               ))}
             </div>
          </div>
        </>
      )}
    </div>
  )
}

const ExpandingInput = ({ label, maxLength, value, onChange, placeholder = "", isTextArea = false, type = "text", min, max }: { label: string, maxLength?: number, value: string, onChange: (v: string) => void, placeholder?: string, isTextArea?: boolean, type?: string, min?: string, max?: string }) => {
  const textRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const remaining = maxLength ? maxLength - value.length : null

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    let val = e.target.value
    if (maxLength && val.length > maxLength) val = val.slice(0, maxLength)
    onChange(val)
  }

  const colorHex = isFocused ? "#ffffff" : "#555558"
  const labelHex = isFocused ? "#ffffff" : "#8e8e93"

  return (
    <div className="relative w-full shrink-0">
      <label className="absolute -top-2.5 left-3 px-1.5 text-[13px] bg-[#000000] z-10 font-medium transition-colors duration-200" style={{ fontFamily: SF, color: labelHex }}>
        {label} {isFocused && remaining !== null && `• ${remaining}`}
      </label>
      {isTextArea ? (
        <textarea
          ref={textRef as React.RefObject<HTMLTextAreaElement>}
          value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder}
          className="w-full bg-transparent border-[1.5px] rounded-[12px] px-4 py-3.5 text-white focus:outline-none resize-none placeholder:text-[#636366] transition-colors duration-200 no-scrollbar"
          style={{ fontFamily: SF, fontSize: "16px", minHeight: "120px", borderColor: colorHex }}
        />
      ) : (
        <input
          ref={textRef as React.RefObject<HTMLInputElement>}
          type={type} min={min} max={max} value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder}
          className="w-full bg-transparent border-[1.5px] rounded-[12px] px-4 py-3.5 text-white focus:outline-none placeholder:text-[#636366] transition-colors duration-200"
          style={{ fontFamily: SF, fontSize: "16px", borderColor: colorHex }}
        />
      )}
    </div>
  )
}

function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${type==="success" ? "bg-[#1a2e1a] border-[#22c55e]/40 text-[#22c55e]" : "bg-[#2e1a1a] border-[#f43f5e]/40 text-[#f43f5e]"}`}>
      {type==="success" ? <CheckCircle2 className="w-4 h-4 shrink-0"/> : <AlertCircle className="w-4 h-4 shrink-0"/>}
      <span className="text-[14px] font-medium" style={{fontFamily:SF}}>{msg}</span>
    </div>
  )
}

// ── Main Component ──
export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks, setTasks] = useState<ScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null)
  const [suggestedTasks, setSuggestedTasks] = useState<typeof MOCK_TASKS>([])
  const [selectedTask, setSelectedTask] = useState<ScheduleItem | null>(null)
  const [pausedTasks, setPausedTasks] = useState<Set<number>>(new Set())

  const monthStr = new Date().toLocaleDateString('en-US',{month:'short'}).toUpperCase()
  const yearStr  = new Date().getFullYear().toString()
  const [selectedDate, setSelectedDate] = useState<string|"All">("All")
  
  const todayStr = new Date().toDateString()
  const calendarDays = useMemo(()=>{
    const arr=[]; const today=new Date(); const sow=new Date(today)
    sow.setDate(today.getDate()-(today.getDay()||7)+1)
    for(let i=0;i<7;i++){
      const d=new Date(sow); d.setDate(sow.getDate()+i)
      arr.push({full:d.toDateString(),label:d.toLocaleDateString('en-US',{weekday:'narrow'}),num:d.getDate().toString(),isToday:d.toDateString()===todayStr})
    }
    return arr
  },[todayStr])

  const filteredTasks = useMemo(()=>{
    if(selectedDate==="All") return tasks
    return tasks.filter(t => { try{ return new Date(t.fire_at).toDateString() === selectedDate }catch{return false} })
  }, [tasks, selectedDate])

  const totalTasks = tasks.length
  const dailyTasksCount = tasks.filter(t => t.repeat_type === "Daily").length

  // Counters for the UI
  const limitTotal = 10
  const limitDaily = 2
  
  const remainingTotal = Math.max(0, limitTotal - totalTasks)
  const ringOffsetTotal = 88 - (totalTasks / limitTotal) * 88

  // States for Create Form
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [frequency, setFrequency] = useState("Daily")
  const [time, setTime] = useState("08:00")
  const [specificDate, setSpecificDate] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("Mon")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Dynamic counter inside the creation modal based on frequency
  const isDailyForm = frequency === "Daily"
  const remainingForm = isDailyForm ? Math.max(0, limitDaily - dailyTasksCount) : remainingTotal
  const maxForm = isDailyForm ? limitDaily : limitTotal
  const currentForm = isDailyForm ? dailyTasksCount : totalTasks
  const ringOffsetForm = 88 - (currentForm / maxForm) * 88

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500)
  },[])

  const fetchItems = useCallback(async()=>{
    setLoadingItems(true)
    try {
      const tg = getTg(); const initData = tg?.initData??""
      const res = await fetch(`${API_BASE}/api/schedule_list`,{headers:{"x-init-data":initData}})
      if(res.ok){ const d=await res.json(); if(d.success&&Array.isArray(d.items)) setTasks(d.items) }
    } catch(e){ console.error(e) }
    finally { setLoadingItems(false) }
  },[])

  useEffect(()=>{ 
    fetchItems() 
    const shuffled = [...MOCK_TASKS].sort(() => 0.5 - Math.random())
    setSuggestedTasks(shuffled.slice(0, 2))
  }, [fetchItems])

  useEffect(()=>{
    const tg = getTg()
    if(!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack=()=>{
      if (selectedTask) setSelectedTask(null)
      else if (activeDropdown) setActiveDropdown(null)
      else if (isCreating) setIsCreating(false)
      else { setCurrentView("home" as any); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return ()=>tg.BackButton.offClick(handleBack)
  },[isCreating, activeDropdown, selectedTask, setCurrentView])

  const openMockCard = (mock: typeof MOCK_TASKS[0]) => {
    setIsCreating(true)
    setTitle(mock.title)
    setFrequency(mock.frequency)
    setDayOfWeek(mock.dayOfWeek)
    setTime(mock.time)
    setPrompt(mock.prompt)
  }

  const resetForm = () => {
    setTitle(""); setPrompt(""); setFrequency("Daily"); setTime("08:00"); 
    setSpecificDate(""); setDayOfWeek("Mon"); setDayOfMonth("1");
    setPushEnabled(true); setEmailEnabled(false); setActiveDropdown(null);
  }

  const handleSaveTask = async () => {
    if (!title.trim() || !prompt.trim()) {
      showToast("Title and Prompt are required.", "error")
      return
    }

    if (totalTasks >= limitTotal) {
      showToast("You have reached the limit of 10 active tasks.", "error")
      return
    }
    if (frequency === "Daily" && dailyTasksCount >= limitDaily) {
      showToast("You can only have 2 daily tasks active simultaneously.", "error")
      return
    }

    setIsSaving(true)
    try {
      const extraData = JSON.stringify({ pushEnabled, emailEnabled, time, specificDate, dayOfWeek, dayOfMonth })
      const data = await apiPost("/api/schedule_create", {
        title, description: prompt, repeat_type: frequency, 
        extra: extraData, event_type: "Custom Prompt", fire_at: new Date().toISOString()
      })
      if(data.success){
        await fetchItems()
        setIsCreating(false)
        resetForm()
      } else { showToast(data.message||"Could not save.","error") }
    } catch (e) { 
      const msg = e instanceof Error ? e.message : String(e)
      showToast(`Error: ${msg}`, "error") 
    }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      const data = await apiPost("/api/schedule_delete",{item_id:id})
      if(data.success){ 
        setTasks(p=>p.filter(t=>t.id!==id))
        setSelectedTask(null)
      }
    } catch(e) { console.error(e) }
  }

  const handleTogglePause = () => {
    if (!selectedTask) return;
    setPausedTasks(prev => {
      const next = new Set(prev)
      if (next.has(selectedTask.id)) next.delete(selectedTask.id)
      else next.add(selectedTask.id)
      return next
    })
  }

  const formatFrequencyText = (item: ScheduleItem) => {
    let t = "00:00"; let day = ""
    try {
      const ex = JSON.parse(item.extra || "{}")
      if (ex.time) t = ex.time
      if (ex.dayOfWeek) day = ex.dayOfWeek
    } catch (e) {
      console.warn("Parse error:", e)
    }

    const parts = t.split(":")
    let hh = parseInt(parts[0] || "0")
    const m = parts[1] || "00"
    const ampm = hh >= 12 ? "PM" : "AM"
    hh = hh % 12 || 12
    const timeStr = `${hh}:${m} ${ampm}`

    switch (item.repeat_type) {
      case "Once": return `Once at ${timeStr}`
      case "Daily": return `Daily at ${timeStr}`
      case "Weekly": return `${DOW_OPTIONS.find(d=>d.value===day)?.label || day}s at ${timeStr}`
      case "Monthly": return `Monthly at ${timeStr}`
      default: return `At ${timeStr}`
    }
  }

  const getNextRunMock = (item: ScheduleItem) => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    const dtStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    let t = "00:00:00"
    try {
      const ex = JSON.parse(item.extra || "{}")
      if (ex.time) t = ex.time + ":00"
    } catch (e) {
      console.warn("Parse error:", e)
    }
    
    const parts = t.split(":")
    let hh = parseInt(parts[0] || "0")
    const m = parts[1] || "00"
    const s = parts[2] || "00"
    const ampm = hh >= 12 ? "PM" : "AM"
    hh = hh % 12 || 12
    return `${dtStr}, ${hh}:${m}:${s} ${ampm}`
  }

  const LimitsIndicator = ({ offset, remaining, current, max, label }: { offset: number, remaining: number, current: number, max: number, label: string }) => (
    <div className="flex items-center gap-3">
      <div className="relative w-[34px] h-[34px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#2c2c2e" strokeWidth="4.5" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeDasharray="88" strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
      </div>
      <div className="flex flex-col -mt-0.5">
        <span className="text-white text-[14px] font-bold tracking-tight" style={{fontFamily: SF}}>
          {remaining} {label} remaining
        </span>
        <span className="text-[#8e8e93] text-[12.5px]" style={{fontFamily: SF}}>
          Current: {current}/{max} active {label}
        </span>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
      <style>{RIPPLE_STYLE}</style>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* ── Top Calendar ── */}
      <div className="pt-[calc(var(--tg-safe-area-inset-top,24px)+20px)] relative z-10 flex flex-col">
        <div className="flex justify-center items-end gap-1">
          <span className="text-white text-[22px] font-bold" style={{fontFamily:SFD}}>{monthStr}</span>
          <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{fontFamily:SFD}}>{yearStr}</span>
        </div>
        <div className="flex justify-between items-center px-6 mt-4 mb-2">
          <button onClick={()=>setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate==="All"?"text-white":"text-[#8e8e93]"}`} style={selectedDate==="All" ? greyGlowStyle : {}}>
            <span className="text-[14px] font-bold" style={{fontFamily:SF}}>All</span>
          </button>
          <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0"/>
          {calendarDays.map((day,idx)=>{
            const isSel = selectedDate === day.full
            let dotClass = ""
            if(isSel) dotClass = "bg-white"
            else if(day.isToday) dotClass = "bg-[#ef4444]"
            return (
              <button key={idx} onClick={()=>setSelectedDate(day.full)} className={`flex flex-col items-center gap-1.5 relative w-10 transition-all ${isSel?"opacity-100":"opacity-60 hover:opacity-80"}`}>
                <div className={`w-[5px] h-[5px] rounded-full transition-colors ${dotClass}`} style={{opacity:dotClass?1:0}}/>
                <span className={`text-[12px] font-medium ${isSel?"text-white":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>{day.label}</span>
                <span className={`text-[16px] font-bold ${isSel?"text-white":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>{day.num}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Tasks</h1>
        <button onClick={() => {resetForm(); setIsCreating(true)}} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:scale-90 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-5 mt-3 pb-32 flex flex-col overflow-y-auto no-scrollbar relative z-10 flex-1">
        
        {/* Compact Mocks */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           {suggestedTasks.map((mock, idx) => (
              <div key={idx} onClick={() => openMockCard(mock)} className="w-full bg-[#1c1c1e] rounded-[16px] p-3.5 flex flex-col gap-1 cursor-pointer active:bg-[#2c2c2e] transition-colors shadow-sm">
                 <span className="text-white text-[15px] font-bold tracking-tight leading-tight line-clamp-1" style={{ fontFamily: SFD }}>
                   {mock.title}
                 </span>
                 <p className="text-[#8e8e93] text-[12px] leading-snug line-clamp-2 mt-0.5" style={{ fontFamily: SF }}>
                   {mock.prompt}
                 </p>
              </div>
           ))}
        </div>

        {/* Real Tasks List */}
        {loadingItems ? (
           <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#555558]"/></div>
        ) : filteredTasks.length > 0 ? (
          <div className="flex flex-col">
            {filteredTasks.map((item, idx) => (
              <div key={item.id} onClick={() => setSelectedTask(item)} className={`w-full flex items-center justify-between py-3.5 ${idx !== filteredTasks.length - 1 ? 'border-b border-[#1c1c1e]' : ''} active:opacity-60 transition-opacity cursor-pointer`}>
                 <div className="flex flex-col gap-1">
                    <span className="text-white text-[17px] font-medium tracking-tight" style={{ fontFamily: SFD }}>{item.title}</span>
                    <span className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>{formatFrequencyText(item)}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[#636366]">
                    <Clock className="w-[14px] h-[14px]" strokeWidth={2.5}/>
                    <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>Scheduled</span>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <span className="text-[#8e8e93] text-[15px]" style={{fontFamily: SF}}>No active tasks</span>
          </div>
        )}
      </div>

      {/* ── Bottom Bar ── */}
      <div className="fixed left-4 right-4 z-40 p-2 rounded-full flex items-center justify-between shadow-2xl" 
           style={{ ...greyGlowStyle, bottom: "calc(var(--tg-safe-area-inset-bottom, 16px) + 16px)" }}>
        <div className="pl-2">
          <LimitsIndicator offset={ringOffsetTotal} remaining={remainingTotal} current={totalTasks} max={limitTotal} label="tasks" />
        </div>
        <button onClick={() => {resetForm(); setIsCreating(true)}} className="bg-white text-black px-5 h-[38px] flex items-center justify-center rounded-full font-bold text-[14px] active:scale-95 transition-transform" style={{fontFamily: SF}}>
          Create task
        </button>
      </div>

      {/* ── View Task Bottom Sheet ── */}
      {selectedTask && (
        <div className="absolute inset-0 z-[70] flex flex-col justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
           <div className="relative w-full bg-[#111111] rounded-t-[28px] p-6 pb-12 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#1c1c1e] animate-in slide-in-from-bottom duration-400">
              <div className="w-10 h-1.5 bg-[#2c2c2e] rounded-full self-center mb-6" />
              
              <h2 className="text-white text-center text-[22px] font-bold mb-8" style={{fontFamily: SFD}}>{selectedTask.title}</h2>

              <div className="flex flex-col gap-6">
                 <div>
                    <h3 className="text-white text-[17px] font-semibold mb-1" style={{fontFamily: SFD}}>Schedule</h3>
                    <p className="text-[#8e8e93] text-[15px]" style={{fontFamily: SF}}>{formatFrequencyText(selectedTask)}</p>
                    <p className="text-[#555558] text-[13px] mt-1" style={{fontFamily: SF}}>Next run: {getNextRunMock(selectedTask)}</p>
                 </div>

                 <div>
                    <h3 className="text-white text-[17px] font-semibold mb-1.5" style={{fontFamily: SFD}}>Instruction</h3>
                    <p className="text-[#8e8e93] text-[15px] leading-relaxed" style={{fontFamily: SF}}>{selectedTask.description}</p>
                 </div>

                 <div className="flex flex-col gap-3 mt-2">
                    <button onClick={handleTogglePause} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] bg-[#1c1c1e] active:scale-[0.98] transition-transform">
                       {pausedTasks.has(selectedTask.id) ? (
                         <Play className="w-5 h-5 text-white fill-white" />
                       ) : (
                         <Pause className="w-5 h-5 text-white fill-white" />
                       )}
                       <span className="text-white font-bold text-[16px]" style={{fontFamily: SF}}>
                         {pausedTasks.has(selectedTask.id) ? "Continue" : "Pause"}
                       </span>
                    </button>
                    <button onClick={() => handleDelete(selectedTask.id)} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] bg-[#1c1c1e] active:scale-[0.98] transition-transform">
                       <Trash2 className="w-5 h-5 text-white" />
                       <span className="text-white font-bold text-[16px]" style={{fontFamily: SF}}>Archive</span>
                    </button>
                 </div>

                 <div className="mt-4">
                    <h3 className="text-white text-[17px] font-semibold mb-3" style={{fontFamily: SFD}}>History</h3>
                    <p className="text-[#555558] text-[14px]" style={{fontFamily: SF}}>No records yet</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {isCreating && (
        <div className="absolute inset-0 z-[80] bg-[#000000] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between px-5 pt-[calc(var(--tg-safe-area-inset-top,24px)+40px)] pb-6 shrink-0">
            <button onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center active:opacity-60 transition-opacity bg-[#1c1c1e] rounded-full">
              <X className="w-5 h-5 text-[#8e8e93]" strokeWidth={2.5} />
            </button>
            <h2 className="font-bold text-white tracking-tight" style={{ fontSize: "17px", fontFamily: SFD }}>Create Task</h2>
            <button onClick={handleSaveTask} disabled={isSaving} className="px-5 py-1.5 text-black font-bold text-[14px] rounded-full bg-white active:scale-95 transition-transform disabled:opacity-50" style={{ fontFamily: SF }}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 space-y-6 pt-2">
            
            <ExpandingInput label="Title" maxLength={60} value={title} onChange={setTitle} placeholder="e.g. Daily Recap" />

            <div className="flex flex-col gap-5">
               <DropdownSelect label="Frequency" value={frequency} options={FREQ_OPTIONS} isOpen={activeDropdown === 'frequency'} onToggle={() => setActiveDropdown(activeDropdown === 'frequency' ? null : 'frequency')} onSelect={setFrequency} />
               {frequency === "Once" && ( <ExpandingInput label="Date" type="date" value={specificDate} onChange={setSpecificDate} /> )}
               {frequency === "Weekly" && ( <DropdownSelect label="Day of Week" value={dayOfWeek} options={DOW_OPTIONS} isOpen={activeDropdown === 'dayOfWeek'} onToggle={() => setActiveDropdown(activeDropdown === 'dayOfWeek' ? null : 'dayOfWeek')} onSelect={setDayOfWeek} /> )}
               {frequency === "Monthly" && ( <ExpandingInput label="Day of Month" type="number" min="1" max="31" value={dayOfMonth} onChange={setDayOfMonth} /> )}
               <ExpandingInput label="Time" type="time" value={time} onChange={setTime} />
            </div>

            <ExpandingInput label="Prompt" maxLength={500} value={prompt} onChange={setPrompt} placeholder="Write the exact instructions for the AI..." isTextArea />

            <Section>
               <Row label="Push notifications" rightNode={<SwitchNode on={pushEnabled} onToggle={()=>setPushEnabled(!pushEnabled)} />} />
               <Row label="Email notifications" rightNode={<SwitchNode on={emailEnabled} onToggle={()=>setEmailEnabled(!emailEnabled)} />} last />
            </Section>

            {/* Modal limits counter */}
            <div className="pt-2 pb-6 flex items-center justify-center">
              <div className="p-2 pl-4 pr-5 rounded-full flex items-center shadow-2xl" style={greyGlowStyle}>
                 <LimitsIndicator offset={ringOffsetForm} remaining={remainingForm} current={currentForm} max={maxForm} label={isDailyForm ? "daily tasks" : "tasks"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
