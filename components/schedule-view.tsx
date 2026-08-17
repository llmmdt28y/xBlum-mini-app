"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { 
  Clock, Plus, X, Loader2, CheckCircle2, AlertCircle, 
  Trash2, ChevronDown, Pause, Play
} from "lucide-react"
import React from "react"
import useSWR from 'swr'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// Generic fetcher for SWR
const fetcher = ([url, initData]: [string, string]) => fetch(url, {
  headers: { "x-init-data": initData }
}).then(res => res.json())

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
    to { transform: scale(2.5); opacity: 0; }
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

const triggerVibration = (type: 'light' | 'medium' | 'heavy' | 'error' | 'success') => {
  const tg = getTg();
  if (!tg?.HapticFeedback) return;
  if (type === 'error' || type === 'success') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

const showAlert = (msg: string) => {
  const tg = getTg()
  if (tg?.showAlert) {
    tg.showAlert(msg)
  } else {
    alert(msg)
  }
}

const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const element = event.currentTarget;
  if (element.disabled) return;

  let rippleContainer = element.querySelector('.ripple-container') as HTMLElement;
  if (!rippleContainer) {
    rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none isolate transform-gpu';
    rippleContainer.style.webkitMaskImage = '-webkit-radial-gradient(white, black)';
    rippleContainer.style.zIndex = '0';
    element.appendChild(rippleContainer);
  }

  const circle = document.createElement("span");
  const diameter = Math.max(element.clientWidth, element.clientHeight);
  const radius = diameter / 2;

  const rect = element.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const existingRipple = rippleContainer.querySelector(".ripple");
  if (existingRipple) existingRipple.remove();

  rippleContainer.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
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
  prompt: string;
  repeat_type: string; 
  fire_at: string; 
  extra: string;
  status: string;
  last_fired_at?: string;
  fire_count?: number;
  repeat_config?: string;
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
      style={{ width: "42px", height: "24px", background: on ? activeColor : "#262626" }}
    >
      <span className="absolute rounded-full transition-all duration-100 shadow-sm" style={{ width: "16px", height: "16px", top: "4px", background: on ? "#000000" : "#8e8e93", left: on ? "22px" : "4px" }} />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean; }) {
  return <div className="flex items-center"><Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor="#ffffff" /></div>
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-[2px] relative [&>*]:bg-[#111111] [&>*]:rounded-[4px] [&>*:first-child]:rounded-t-[16px] [&>*:last-child]:rounded-b-[16px] [&>*]:overflow-hidden w-full mb-6">{children}</div>
}

function Row({ label, rightNode, last = false }: { label: string; rightNode?: React.ReactNode; last?: boolean }) {
  return (
    <>
      <div className="relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5">
        <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF }}>{label}</span>
        {rightNode && <div className="flex items-center relative z-10 shrink-0 ml-2">{rightNode}</div>}
      </div>
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



// ── Main Component ──
export function ScheduleView() {
  const { setCurrentView, userPreferences, isPremium } = useApp()
  const [taskHistory, setTaskHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [suggestedTasks, setSuggestedTasks] = useState<typeof MOCK_TASKS>([])
  
  const [sheetTouchY, setSheetTouchY] = useState<number | null>(null)
  const [sheetTranslateY, setSheetTranslateY] = useState(0)

  const handleSheetTouchStart = (e: React.TouchEvent) => setSheetTouchY(e.touches[0].clientY)
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (sheetTouchY === null) return
    const diff = e.touches[0].clientY - sheetTouchY
    if (diff > 0) setSheetTranslateY(diff)
  }
  const handleSheetTouchEnd = () => {
    if (sheetTranslateY > 100) setSelectedTask(null)
    setSheetTranslateY(0)
    setSheetTouchY(null)
  }
  const [selectedTask, setSelectedTask] = useState<ScheduleItem | null>(null)

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

  const tgInitData = typeof window !== "undefined" ? getTg()?.initData || "" : ""
  
  const { data: scheduleData, isLoading: loadingItems, mutate: mutateTasks } = useSWR(
    tgInitData ? [`${API_BASE}/api/schedule_list`, tgInitData] : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: true }
  )
  
  const tasks: ScheduleItem[] = scheduleData?.items || []

  const filteredTasks = useMemo(()=>{
    if(selectedDate==="All") return tasks
    return tasks.filter(t => { try{ return new Date(t.fire_at).toDateString() === selectedDate }catch{return false} })
  }, [tasks, selectedDate])

  const isTaskDaily = (t: ScheduleItem) => {
    let rt = (t.repeat_type || "").trim().toLowerCase()
    if (!rt || rt === "undefined") {
      try {
        const ex = JSON.parse(t.extra || "{}")
        if (ex.frequency) rt = ex.frequency.trim().toLowerCase()
      } catch (e) {}
    }
    return rt === "daily"
  }

  const totalTasks = tasks.length
  const dailyTasksCount = tasks.filter(isTaskDaily).length
  const generalTasksCount = tasks.filter(t => !isTaskDaily(t)).length

  // Counters for the UI
  const limitGeneral = isPremium ? 10 : 5
  const limitDaily = isPremium ? 5 : 2
  const limitTotal = limitGeneral + limitDaily
  
  const remainingTotal = Math.max(0, limitGeneral - generalTasksCount) + Math.max(0, limitDaily - dailyTasksCount)
  const ringOffsetTotal = 88 - (totalTasks / limitTotal) * 88

  const dailyTasks = filteredTasks.filter(isTaskDaily)
  const generalTasks = filteredTasks.filter(t => !isTaskDaily(t))

  // States for Create Form
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [showAllHistory, setShowAllHistory] = useState(false)
  const { setIsNavHidden } = useApp()

  useEffect(() => {
    setIsNavHidden(!!selectedTask || isCreating)
    return () => setIsNavHidden(false)
  }, [selectedTask, isCreating, setIsNavHidden])

  // Refs for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null)
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
  const remainingForm = isDailyForm ? Math.max(0, limitDaily - dailyTasksCount) : Math.max(0, limitGeneral - generalTasksCount)
  const maxForm = isDailyForm ? limitDaily : limitGeneral
  const currentForm = isDailyForm ? dailyTasksCount : generalTasksCount
  const ringOffsetForm = 88 - (currentForm / maxForm) * 88

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    if (type === "error") {
      triggerVibration('error')
      showAlert(msg)
    }
  },[])

  useEffect(()=>{ 
    const shuffled = [...MOCK_TASKS].sort(() => 0.5 - Math.random())
    setSuggestedTasks(shuffled.slice(0, 2))
  }, [])

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

  const checkTimezoneAndOpen = (callback: () => void) => {
    if (!userPreferences?.timezone) {
      triggerVibration('error')
      const tg = getTg()
      if (tg?.showConfirm) {
        tg.showConfirm("You need to select a Time Zone to create tasks. Configure it now?", (ok: boolean) => {
          if (ok) setCurrentView("additional_details" as any)
        })
      } else {
        if (confirm("You need to select a Time Zone to create tasks. Configure it now?")) {
          setCurrentView("additional_details" as any)
        }
      }
      return
    }
    callback()
  }

  const openMockCard = (mock: typeof MOCK_TASKS[0]) => {
    checkTimezoneAndOpen(() => {
      setIsCreating(true)
      setTitle(mock.title)
      setFrequency(mock.frequency)
      setDayOfWeek(mock.dayOfWeek)
      setTime(mock.time)
      setPrompt(mock.prompt)
    })
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

    if (frequency === "Daily" && dailyTasksCount >= limitDaily) {
      triggerVibration('error');
      const tg = getTg();
      if (tg?.showConfirm) {
        tg.showConfirm(`You can only have ${limitDaily} daily tasks. Upgrade to Premium for more!`, (ok: boolean) => {
          if (ok) setCurrentView("premium" as any);
        });
      } else {
        if (confirm(`You can only have ${limitDaily} daily tasks. Upgrade to Premium for more!`)) {
          setCurrentView("premium" as any);
        }
      }
      return
    }
    if (frequency !== "Daily" && generalTasksCount >= limitGeneral) {
      triggerVibration('error');
      const tg = getTg();
      if (tg?.showConfirm) {
        tg.showConfirm(`You have reached the limit of ${limitGeneral} general tasks. Upgrade to Premium!`, (ok: boolean) => {
          if (ok) setCurrentView("premium" as any);
        });
      } else {
        if (confirm(`You have reached the limit of ${limitGeneral} general tasks. Upgrade to Premium!`)) {
          setCurrentView("premium" as any);
        }
      }
      return
    }

    setIsSaving(true)
    try {
      const repeatConfig = JSON.stringify({
        time,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        specific_date: specificDate,
        timezone: userPreferences?.timezone || "UTC",
      })
      const data = await apiPost("/api/schedule_create", {
        title,
        prompt,
        description: prompt,
        repeat_type: frequency.toLowerCase(),
        repeat_config: repeatConfig,
        event_type: "Custom Prompt",
        fire_at: new Date().toISOString(),
        push_enabled: pushEnabled,
        email_enabled: emailEnabled,
      })
      if(data.success){
        triggerVibration('success')
        mutateTasks()
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
        triggerVibration('success')
        mutateTasks(
          (prevData: any) => ({
            ...prevData,
            items: (prevData?.items || []).filter((t: ScheduleItem) => t.id !== id)
          }),
          { revalidate: false }
        )
        setSelectedTask(null)
      }
    } catch(e) { console.error(e) }
  }

  const handleTogglePause = async () => {
    if (!selectedTask) return;
    triggerVibration('light')
    const isPaused = selectedTask.status === "PAUSED"

    if (isPaused) {
      const isDaily = isTaskDaily(selectedTask);
      if (isDaily && dailyTasksCount >= limitDaily) {
        triggerVibration('error');
        const tg = getTg();
        if (tg?.showConfirm) {
          tg.showConfirm(`You can only have ${limitDaily} active daily tasks. Upgrade to Premium for more!`, (ok: boolean) => {
            if (ok) setCurrentView("premium" as any);
          });
        } else {
          if (confirm(`You can only have ${limitDaily} active daily tasks. Upgrade to Premium for more!`)) {
            setCurrentView("premium" as any);
          }
        }
        return;
      }
      if (!isDaily && generalTasksCount >= limitGeneral) {
        triggerVibration('error');
        const tg = getTg();
        if (tg?.showConfirm) {
          tg.showConfirm(`You can only have ${limitGeneral} active general tasks. Upgrade to Premium for more!`, (ok: boolean) => {
            if (ok) setCurrentView("premium" as any);
          });
        } else {
          if (confirm(`You can only have ${limitGeneral} active general tasks. Upgrade to Premium for more!`)) {
            setCurrentView("premium" as any);
          }
        }
        return;
      }
    }

    try {
      const data = await apiPost("/api/schedule_pause", {
        item_id: selectedTask.id,
        action: isPaused ? "resume" : "pause",
      })
      if (data.success) {
        triggerVibration('success')
        await fetchItems()
        setSelectedTask(prev => prev ? { ...prev, status: isPaused ? "ACTIVE" : "PAUSED" } : null)
      } else {
        showToast(data.message || "Could not complete action.", "error")
      }
    } catch (e) { console.error(e) }
  }

  const fetchHistory = useCallback(async (itemId: number) => {
    setLoadingHistory(true)
    setTaskHistory([])
    try {
      const tg = getTg(); const initData = tg?.initData ?? ""
      const res = await fetch(`${API_BASE}/api/schedule_history?item_id=${itemId}&limit=10`, {
        headers: { "x-init-data": initData }
      })
      if (res.ok) {
        const d = await res.json()
        if (d.success && Array.isArray(d.history)) setTaskHistory(d.history)
      }
    } catch (e) { console.error(e) }
    finally { setLoadingHistory(false) }
  }, [])

  // Fetch history when a task is selected
  useEffect(() => {
    if (selectedTask) fetchHistory(selectedTask.id)
  }, [selectedTask?.id, fetchHistory])

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

    let rt = (item.repeat_type || "").trim().toLowerCase()
    if (!rt || rt === "undefined") {
      try {
        const ex = JSON.parse(item.extra || "{}")
        if (ex.frequency) rt = ex.frequency.trim().toLowerCase()
      } catch (e) {}
    }

    switch (rt) {
      case "once": return `Once at ${timeStr}`
      case "daily": return `Daily at ${timeStr}`
      case "weekly": return `${day ? (DOW_OPTIONS.find(d=>d.value===day)?.label || day) + "s" : "Weekly"} at ${timeStr}`
      case "monthly": return `Monthly at ${timeStr}`
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
          <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="4.5" />
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
    <div className="fixed inset-0 flex flex-col animate-in fade-in duration-500 ease-out overflow-hidden bg-[#000000] text-white select-none" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
      <style>{RIPPLE_STYLE}</style>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
      `}</style>
      {(isCreating || !!selectedTask) && <style>{`.liquid-glass-panel { opacity: 0 !important; pointer-events: none !important; }`}</style>}

      {/* ── Top Calendar ── */}
      <div className="pt-[calc(var(--tg-safe-area-inset-top,24px)+20px)] relative z-10 flex flex-col shrink-0">
        <div className="flex justify-center items-end gap-1">
          <span className="text-white text-[22px] font-bold" style={{fontFamily:SFD}}>{monthStr}</span>
          <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{fontFamily:SFD}}>{yearStr}</span>
        </div>
        <div className="flex justify-between items-center px-6 mt-4 mb-2">
          <button onClick={()=>setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate==="All"?"text-white":"text-[#8e8e93]"}`} style={selectedDate==="All" ? greyGlowStyle : {}}>
            <span className="text-[14px] font-bold" style={{fontFamily:SF}}>All</span>
          </button>
          <div className="w-px h-8 bg-[#262626] mx-1 shrink-0"/>
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

      <div className="px-5 mt-4 flex items-center justify-between shrink-0">
        <h1 className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Tasks</h1>
        <button onClick={() => checkTimezoneAndOpen(() => {resetForm(); setIsCreating(true)})} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:scale-90 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Compact Mocks (Fixed) */}
      <div className="px-5 mt-3 shrink-0">
        <div className="grid grid-cols-2 gap-3">
           {suggestedTasks.map((mock, idx) => (
              <div key={idx} onClick={() => openMockCard(mock)} className="w-full bg-[#1c1c1e] rounded-[16px] p-3.5 flex flex-col gap-1 cursor-pointer active:bg-[#262626] transition-colors shadow-sm">
                 <span className="text-white text-[15px] font-bold tracking-tight leading-tight line-clamp-1" style={{ fontFamily: SFD }}>
                   {mock.title}
                 </span>
                 <p className="text-[#8e8e93] text-[12px] leading-snug line-clamp-2 mt-0.5" style={{ fontFamily: SF }}>
                   {mock.prompt}
                 </p>
              </div>
           ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative flex-1 w-full mt-4 z-10">
        <div className="absolute top-0 left-0 right-0 bottom-[calc(var(--tg-safe-area-inset-bottom,16px)+130px)] px-5 flex flex-col overflow-y-auto custom-scrollbar">

        {/* Real Tasks List */}
        {loadingItems ? (
           <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#555558]"/></div>
        ) : filteredTasks.length > 0 ? (
          <div className="flex flex-col gap-6">
            {dailyTasks.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white text-[15px] font-bold tracking-tight" style={{fontFamily: SFD}}>Daily Tasks</h3>
                  <div className="flex-1 h-[1px] bg-[#1c1c1e]" />
                </div>
                <div className="flex flex-col">
                  {dailyTasks.map((item, idx) => (
                    <div key={item.id} onClick={() => setSelectedTask(item)} className={`defer-render w-full flex items-center justify-between py-3.5 ${idx !== dailyTasks.length - 1 ? 'border-b border-[#1c1c1e]' : ''} active:opacity-60 transition-opacity cursor-pointer`}>
                       <div className="flex flex-col gap-1">
                          <span className="text-white text-[17px] font-medium tracking-tight" style={{ fontFamily: SFD }}>{item.title}</span>
                          <span className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>{formatFrequencyText(item)}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          {item.status === "PAUSED" ? (
                            <><Pause className="w-[14px] h-[14px] text-[#ff9f0a]" strokeWidth={2.5}/>
                            <span className="text-[13px] font-medium text-[#ff9f0a]" style={{ fontFamily: SF }}>Paused</span></>
                          ) : (
                            <><Clock className="w-[14px] h-[14px] text-[#636366]" strokeWidth={2.5}/>
                            <span className="text-[13px] font-medium text-[#636366]" style={{ fontFamily: SF }}>Scheduled</span></>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {generalTasks.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white text-[15px] font-bold tracking-tight" style={{fontFamily: SFD}}>General Tasks</h3>
                  <div className="flex-1 h-[1px] bg-[#1c1c1e]" />
                </div>
                <div className="flex flex-col">
                  {generalTasks.map((item, idx) => (
                    <div key={item.id} onClick={() => setSelectedTask(item)} className={`defer-render w-full flex items-center justify-between py-3.5 ${idx !== generalTasks.length - 1 ? 'border-b border-[#1c1c1e]' : ''} active:opacity-60 transition-opacity cursor-pointer`}>
                       <div className="flex flex-col gap-1">
                          <span className="text-white text-[17px] font-medium tracking-tight" style={{ fontFamily: SFD }}>{item.title}</span>
                          <span className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>{formatFrequencyText(item)}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          {item.status === "PAUSED" ? (
                            <><Pause className="w-[14px] h-[14px] text-[#ff9f0a]" strokeWidth={2.5}/>
                            <span className="text-[13px] font-medium text-[#ff9f0a]" style={{ fontFamily: SF }}>Paused</span></>
                          ) : (
                            <><Clock className="w-[14px] h-[14px] text-[#636366]" strokeWidth={2.5}/>
                            <span className="text-[13px] font-medium text-[#636366]" style={{ fontFamily: SF }}>Scheduled</span></>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
             <span className="text-[#8e8e93] text-[15px]" style={{fontFamily: SF}}>No active tasks</span>
          </div>
        )}
        
          <div className="h-6 w-full shrink-0" />
        </div>
        {/* Fade gradient positioned absolutely to end exactly where the list ends */}
        <div className="absolute left-0 right-0 h-16 pointer-events-none z-30" style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, 16px) + 130px)", background: "linear-gradient(to top, #000000 10%, rgba(0,0,0,0) 100%)" }} />
      </div>

      {/* ── Bottom Bar ── */}
      <div className="fixed left-4 right-4 z-40 p-2 rounded-full flex items-center justify-between shadow-2xl" 
           style={{ ...greyGlowStyle, bottom: "calc(var(--tg-safe-area-inset-bottom, 16px) + 115px)" }}>
        <div className="pl-2">
          <LimitsIndicator offset={ringOffsetTotal} remaining={remainingTotal} current={totalTasks} max={limitTotal} label="tasks" />
        </div>
        <button onClick={() => checkTimezoneAndOpen(() => {resetForm(); setIsCreating(true)})} className="bg-white text-black px-5 h-[38px] flex items-center justify-center rounded-full font-bold text-[14px] active:scale-95 transition-transform" style={{fontFamily: SF}}>
          Create task
        </button>
      </div>

      {/* ── View Task Bottom Sheet ── */}
      {selectedTask && (
        <div className="absolute inset-0 z-[70] flex flex-col justify-end animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/70 " onClick={() => setSelectedTask(null)} />
           <div 
             className="relative w-full bg-[#111111] rounded-t-[28px] p-6 pb-12 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#1c1c1e] animate-in slide-in-from-bottom duration-400"
             style={{ transform: `translateY(${sheetTranslateY}px)`, transition: sheetTouchY === null ? 'transform 0.3s ease-out' : 'none' }}
             onTouchStart={handleSheetTouchStart} onTouchMove={handleSheetTouchMove} onTouchEnd={handleSheetTouchEnd}
           >
              <div className="w-12 h-1.5 bg-[#262626] rounded-full self-center mb-6 shrink-0" />
              
              <h2 className="text-white text-center text-[22px] font-bold mb-8" style={{fontFamily: SFD}}>{selectedTask.title}</h2>

              <div className="flex flex-col gap-6">
                 <div>
                    <h3 className="text-white text-[17px] font-semibold mb-1" style={{fontFamily: SFD}}>Schedule</h3>
                    <p className="text-[#8e8e93] text-[15px]" style={{fontFamily: SF}}>{formatFrequencyText(selectedTask)}</p>
                    <p className="text-[#555558] text-[13px] mt-1" style={{fontFamily: SF}}>Next run: {getNextRunMock(selectedTask)}</p>
                 </div>

                 <div>
                    <h3 className="text-white text-[17px] font-semibold mb-1.5" style={{fontFamily: SFD}}>Instruction</h3>
                    <p className="text-[#8e8e93] text-[15px] leading-relaxed" style={{fontFamily: SF}}>{selectedTask.prompt || selectedTask.description}</p>
                    {(selectedTask.fire_count ?? 0) > 0 && (
                      <p className="text-[#555558] text-[13px] mt-2" style={{fontFamily: SF}}>Executed {selectedTask.fire_count} time{(selectedTask.fire_count ?? 0) !== 1 ? 's' : ''}</p>
                    )}
                 </div>

                 <div className="flex flex-col gap-3 mt-2">
                    <button onClick={handleTogglePause} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] bg-[#1c1c1e] active:scale-[0.98] transition-transform">
                       {selectedTask.status === "PAUSED" ? (
                         <Play className="w-5 h-5 text-white fill-white" />
                       ) : (
                         <Pause className="w-5 h-5 text-white fill-white" />
                       )}
                       <span className="text-white font-bold text-[16px]" style={{fontFamily: SF}}>
                         {selectedTask.status === "PAUSED" ? "Continue" : "Pause"}
                       </span>
                    </button>
                    <button onClick={() => handleDelete(selectedTask.id)} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] bg-[#1c1c1e] active:scale-[0.98] transition-transform">
                       <Trash2 className="w-5 h-5 text-white" />
                       <span className="text-white font-bold text-[16px]" style={{fontFamily: SF}}>Archive</span>
                    </button>
                 </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                       <h3 className="text-white text-[17px] font-semibold" style={{fontFamily: SFD}}>History</h3>
                       {taskHistory.length > 3 && (
                          <button onClick={() => setShowAllHistory(!showAllHistory)} className="text-[#33b5f7] text-[13px] font-medium active:opacity-70 transition-opacity" style={{fontFamily: SF}}>
                             {showAllHistory ? "Hide" : "View All"}
                          </button>
                       )}
                    </div>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#555558]"/></div>
                    ) : taskHistory.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {taskHistory.slice(0, showAllHistory ? undefined : 3).map((h, idx) => {
                          const firedDate = new Date(h.fired_at)
                          const dateStr = firedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          const timeStr = firedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          return (
                            <div key={h.id || idx} className="bg-[#1c1c1e] rounded-[12px] p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#8e8e93] text-[12px]" style={{fontFamily: SF}}>{dateStr} at {timeStr}</span>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${h.status === 'OK' ? 'bg-[#30d158]/20 text-[#30d158]' : 'bg-[#ff453a]/20 text-[#ff453a]'}`} style={{fontFamily: SF}}>{h.status}</span>
                              </div>
                              <p className="text-white text-[13px] leading-snug line-clamp-3" style={{fontFamily: SF}}>{(h.result || '').slice(0, 200)}</p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[#555558] text-[14px]" style={{fontFamily: SF}}>No records yet</p>
                    )}
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
