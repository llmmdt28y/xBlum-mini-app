"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, ChevronDown, ChevronUp, Paperclip,
  Droplets, Pill, Activity, Link as LinkIcon, RefreshCcw, CheckCircle2, AlertCircle, Globe, Zap,
  Lightbulb, Check
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

type NavTab = "tasks" | "edit" | "search" | "create"
type ListViewTab = "schedules" | "reminders"

function getTg() { return (window as any).Telegram?.WebApp }

async function apiPost(endpoint: string, body: Record<string, unknown>) {
  const tg       = getTg()
  const initData = tg?.initData ?? ""
  const userId   = tg?.initDataUnsafe?.user?.id ?? null
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

interface ScheduleItem {
  id: number;
  title: string; event_type: string; icon_name: string; color: string
  description: string; extra: string; email_to: string; files: {name:string;size:number}[]
  is_event: boolean;
  fire_at: string; alert_offset_min: number; status: string
}

const ICONS: Record<string, React.ElementType> = {
  CalendarDays, Clock, Bell, Mail, Folder, Dumbbell, Briefcase, Laptop, Utensils,
  MessageSquare, Send, Coffee, Droplets, Pill, Activity, TrendingUp, CheckSquare, Lightbulb
}

const ICON_COLORS: Record<string, string> = {
  CalendarDays:"#3b82f6", Clock:"#f97316", Bell:"#f43f5e", Mail:"#0ea5e9", Folder:"#eab308",
  Dumbbell:"#a855f7", Briefcase:"#d97706", Laptop:"#94a3b8", Utensils:"#ec4899",
  MessageSquare:"#22c55e", Send:"#14b8a6", Coffee:"#b45309", Droplets:"#38bdf8",
  Pill:"#fb7185", Activity:"#10b981", TrendingUp:"#22c55e", CheckSquare:"#3b82f6", Lightbulb:"#f59e0b"
}

const SCHEDULE_OPTIONS = ["Custom Schedule","Schedule Email","Drive Upload","Workout / Gym","Deep Work","Meal Time","Send Message"]
const REMINDER_OPTIONS = ["Personal Reminder","Drink Water","Stand Up / Stretch","Take Medication","Custom Reminder"]

const TZ_LIST: { label: string; value: string; offset: string }[] = [
  { label: "Pacific Time (US/Canada)", value: "America/Los_Angeles", offset: "UTC−8" },
  { label: "Mountain Time (US/Canada)",value: "America/Denver",      offset: "UTC−7" },
  { label: "Mexico City",              value: "America/Mexico_City", offset: "UTC−6" },
  { label: "Central Time (US/Canada)", value: "America/Chicago",     offset: "UTC−6" },
  { label: "Eastern Time (US/Canada)", value: "America/New_York",    offset: "UTC−5" },
  { label: "Buenos Aires",             value: "America/Argentina/Buenos_Aires", offset: "UTC−3" },
  { label: "São Paulo",                value: "America/Sao_Paulo",   offset: "UTC−3" },
  { label: "London / GMT",             value: "Europe/London",       offset: "UTC+0" },
  { label: "Central Europe",           value: "Europe/Paris",        offset: "UTC+1" },
  { label: "Dubai / GST",              value: "Asia/Dubai",          offset: "UTC+4" },
  { label: "India Standard",           value: "Asia/Kolkata",        offset: "UTC+5:30" },
  { label: "Hong Kong / Beijing",      value: "Asia/Hong_Kong",      offset: "UTC+8" },
  { label: "Tokyo",                    value: "Asia/Tokyo",          offset: "UTC+9" },
  { label: "Sydney",                   value: "Australia/Sydney",    offset: "UTC+10" },
]

const ONBOARDING_CARDS_DATA = [
  { 
    id: 1, title: "Smart Schedules", icon: CalendarDays, color: "#ffffff",
    bgGradient: "radial-gradient(circle at center, rgba(30,58,138,0.4) 0%, rgba(5,5,5,0) 70%)",
    cardGradient: "linear-gradient(145deg, #2563eb, #1e3a8a)",
    desc: "Schedule tasks seamlessly and keep your entire agenda perfectly organized."
  },
  { 
    id: 2, title: "Reminders", icon: Bell, color: "#ffffff", isReminder: true,
    bgGradient: "radial-gradient(circle at center, rgba(131,24,67,0.4) 0%, rgba(5,5,5,0) 70%)",
    cardGradient: "linear-gradient(145deg, #d946ef, #701a75)",
    desc: "Automatic reminders keep everyone on track. Less stress, more focus on your goals."
  },
  { 
    id: 3, title: "Automations", icon: Zap, color: "#ffffff",
    bgGradient: "radial-gradient(circle at center, rgba(20,83,45,0.4) 0%, rgba(5,5,5,0) 70%)",
    cardGradient: "linear-gradient(145deg, #22c55e, #14532d)",
    desc: "Trigger emails, messages, and drive uploads automatically right from your schedule."
  }
]

const SUGGESTIONS = [
  { id:"sug_tg",    title:"Order vitamin D", time:"Today",          iconName:"Lightbulb", color:"#fb7185", type:"reminder" },
  { id:"sug_email", title:"Read project brief", time:"30 min",      iconName:"Briefcase", color:"#3b82f6", type:"schedule" },
]

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${
      type==="success" ? "bg-[#1a2e1a] border-[#22c55e]/40 text-[#22c55e]" : "bg-[#2e1a1a] border-[#f43f5e]/40 text-[#f43f5e]"
    }`}>
      {type==="success" ? <CheckCircle2 className="w-4 h-4 shrink-0"/> : <AlertCircle className="w-4 h-4 shrink-0"/>}
      <span className="text-[13px] font-medium" style={{fontFamily:SF}}>{msg}</span>
    </div>
  )
}

function WheelPicker({ items, value, onChange, suffix="" }: {items:string[];value:string;onChange:(v:string)=>void;suffix?:string}) {
  const ref = useRef<HTMLDivElement>(null)
  const h   = 40
  return (
    <div ref={ref} onScroll={()=>{ if(!ref.current) return; const i=Math.round(ref.current.scrollTop/h); if(items[i]&&items[i]!==value) onChange(items[i]) }}
      className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center" style={{scrollBehavior:"smooth"}}>
      <div style={{minHeight:`${h}px`}} className="w-full shrink-0"/>
      {items.map((item,i)=>{
        const sel=item===value
        const isPlaceholder = item.startsWith("---")
        return <div key={i} className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all ${sel?'text-white text-[20px] font-bold':'text-[#636366] text-[18px] font-medium'} ${isPlaceholder ? 'opacity-50 text-[16px]' : ''}`} style={{fontFamily:SFD}}>
          {item}{suffix&&sel&&!isPlaceholder?<span className="text-[14px] ml-1 text-[#8e8e93]">{suffix}</span>:""}
        </div>
      })}
      <div style={{minHeight:`${h}px`}} className="w-full shrink-0"/>
    </div>
  )
}

function TZPickerModal({ onSave, onConfirm, selectedTZ, onClose }: { onSave: (tz: string) => void; onConfirm: () => void; selectedTZ: string, onClose: () => void }) {
  const [query, setQuery]     = useState("")
  const [picked, setPicked]   = useState(selectedTZ || "")

  useEffect(() => {
    if (!picked) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      const match = TZ_LIST.find(t => t.value === detected)
      if (match) { setPicked(match.value); onSave(match.value) }
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return q ? TZ_LIST.filter(t => t.label.toLowerCase().includes(q) || t.offset.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)) : TZ_LIST
  }, [query])

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#2c2c2e]">
        
        <div className="flex items-center justify-between mb-6 pt-1 shrink-0">
          <h3 className="text-white font-bold text-[24px] tracking-tight" style={{fontFamily:SFD}}>Time Zone</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70 transition-opacity">
            <X className="w-5 h-5 text-[#8e8e93]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-4">
          <div className="bg-[#1c1c1e] rounded-[24px] p-2 shadow-inner">
            <button
              onClick={() => {
                const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
                const match = TZ_LIST.find(t => t.value === detected)
                if (match) { setPicked(match.value); onSave(match.value); setQuery("") }
              }}
              className="w-full flex items-center justify-between p-4 active:bg-[#2c2c2e] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-[20px] h-[20px] text-yellow-400" />
                <span className="text-white text-[16px] font-medium" style={{fontFamily:SF}}>Auto-detect</span>
              </div>
              <span className="text-[#8e8e93] text-[14px] truncate max-w-[140px]" style={{fontFamily:SF}}>
                {Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace("_"," ")}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-[#1c1c1e] rounded-full px-5 py-3.5 border border-[#2c2c2e]">
            <Search className="w-[18px] h-[18px] text-[#636366] shrink-0" />
            <input type="text" placeholder="Search zone or UTC..." value={query} onChange={e => setQuery(e.target.value)} className="bg-transparent text-white text-[15px] flex-1 outline-none placeholder-[#636366]" style={{fontFamily:SF}}/>
            {query && <button onClick={() => setQuery("")}><X className="w-4 h-4 text-[#636366]" /></button>}
          </div>

          <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
            <div className="flex flex-col divide-y divide-[#2c2c2e]">
              {filtered.map(tz => {
                const isSelected = picked === tz.value
                return (
                  <button 
                    key={tz.value} 
                    onClick={() => { setPicked(tz.value); onSave(tz.value) }} 
                    className="w-full flex items-center justify-between p-4 active:bg-[#2c2c2e] rounded-xl transition-colors"
                  >
                    <span className={`text-[16px] font-medium ${isSelected ? "text-blue-400" : "text-white"}`} style={{fontFamily:SF}}>{tz.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8e8e93] text-[14px]" style={{fontFamily:SF}}>{tz.offset}</span>
                      {isSelected && <CheckCircle2 className="w-[18px] h-[18px] text-blue-400" />}
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="py-10 flex flex-col items-center justify-center text-[#636366]">
                   <Globe className="w-8 h-8 mb-2 opacity-50"/>
                   <span style={{fontFamily:SF}}>No zones found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 shrink-0">
          <button onClick={onConfirm} disabled={!picked} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px] disabled:opacity-40" style={{fontFamily:SF}}>
            Save Time Zone
          </button>
        </div>

      </div>
    </div>
  )
}

export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks,         setTasks]         = useState<ScheduleItem[]>([])
  const [loadingItems,  setLoadingItems]  = useState(true)
  const [selectedDate,  setSelectedDate]  = useState<string|"All">("All")
  const [activeNavTab,  setActiveNavTab]  = useState<NavTab>("tasks")
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [expandedIds,   setExpandedIds]   = useState<Record<string,boolean>>({})
  const [configModalOpen,setConfigModalOpen]=useState(false)
  
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const onboardingScrollRef = useRef<HTMLDivElement>(null)
  
  const [showTZModal,    setShowTZModal]    = useState(false)
  const [selectedTZ,     setSelectedTZ]     = useState(localStorage.getItem("xblum_tz_set") || "")

  const [loading,       setLoading]       = useState(false)
  const [activePicker,  setActivePicker]  = useState<string|null>(null)
  const [toast,         setToast]         = useState<{msg:string;type:"success"|"error"}|null>(null)
  const [creationMode,  setCreationMode]  = useState<ListViewTab>("schedules")
  const [eventType,     setEventType]     = useState("Custom Schedule")
  const [taskIcon,      setTaskIcon]      = useState("CalendarDays")
  const [taskTitle,     setTaskTitle]     = useState("")
  const [taskDesc,      setTaskDesc]      = useState("")
  const [taskEmailRec,  setTaskEmailRec]  = useState("")
  const [attachedFiles, setAttachedFiles] = useState<{name:string;size:number}[]>([])
  const [extraConfig,   setExtraConfig]   = useState("")

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const _initNow = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000)
    return {
      h: d.getHours().toString().padStart(2,"0"),
      m: d.getMinutes().toString().padStart(2,"0"),
      mo: months[d.getMonth()],
      day: d.getDate().toString(),
    }
  }, [])
  const [selHour,  setSelHour]  = useState(_initNow.h)
  const [selMin,   setSelMin]   = useState(_initNow.m)
  const [selMonth, setSelMonth] = useState(_initNow.mo)
  const [selDayNum,setSelDayNum]= useState(_initNow.day)
  
  const [selRemMin,setSelRemMin]= useState("00")
  const [selRemSec,setSelRemSec]= useState("00")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hours = Array.from({length:24},(_,i)=>i.toString().padStart(2,'0'))
  const mins  = Array.from({length:60},(_,i)=>i.toString().padStart(2,'0'))
  const secs  = Array.from({length:60},(_,i)=>i.toString().padStart(2,'0'))
  const days  = Array.from({length:31},(_,i)=>(i+1).toString())

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500)
  },[])

  useEffect(() => {
    const onboarded = localStorage.getItem("xblum_onboarded")
    const savedTZ = localStorage.getItem("xblum_tz_set")
    
    if (!onboarded) {
      setShowOnboarding(true)
      setTimeout(() => {
        if(onboardingScrollRef.current) {
          const cardWidth = 280 + 16
          onboardingScrollRef.current.scrollTo({ left: cardWidth * 1, behavior: 'smooth' })
        }
      }, 100)
    } else if (!savedTZ) {
      setShowTZModal(true)
    }
  }, [])

  const handleOnboardingScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 280 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    if (index !== activeIndex && index >= 0 && index < ONBOARDING_CARDS_DATA.length) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  function handleStartOnboarding() {
    localStorage.setItem("xblum_onboarded", "true")
    setShowOnboarding(false)
    if (!localStorage.getItem("xblum_tz_set")) {
      setShowTZModal(true)
    }
  }

  function handleSaveTZ() {
    if (!selectedTZ) return
    localStorage.setItem("xblum_tz_set", selectedTZ)
    setShowTZModal(false)
    showToast("Time Zone synced successfully 🌍", "success")
  }

  const fetchItems = useCallback(async()=>{
    setLoadingItems(true)
    try {
      const tg=getTg(); const initData=tg?.initData??""
      const res=await fetch(`${API_BASE}/api/schedule_list`,{headers:{"x-init-data":initData}})
      if(res.ok){ const d=await res.json(); if(d.success&&Array.isArray(d.items)) setTasks(d.items) }
    } catch(e){ console.error("[Schedule] fetch:",e) }
    finally { setLoadingItems(false) }
  },[])

  useEffect(()=>{ fetchItems() },[fetchItems])

  useEffect(()=>{
    setExtraConfig(""); setAttachedFiles([]); 
    setSelRemMin("00"); setSelRemSec("00");
    
    if(eventType==="Workout / Gym")          { setTaskIcon("Dumbbell"); setTaskTitle("Workout"); }
    else if(eventType==="Deep Work")         { setTaskIcon("Laptop"); setTaskTitle("Deep Work Session"); }
    else if(eventType==="Meal Time")         { setTaskIcon("Utensils"); setTaskTitle("Lunch Break"); }
    else if(eventType==="Schedule Email")    { setTaskIcon("Mail"); setTaskTitle("Send Email") }
    else if(eventType==="Send Message")      { setTaskIcon("MessageSquare"); setTaskTitle("Send Message") }
    else if(eventType==="Drive Upload")      { setTaskIcon("Folder"); setTaskTitle("Backup to Drive") }
    else if(eventType==="Drink Water")       { setTaskIcon("Droplets"); setTaskTitle("Drink Water") }
    else if(eventType==="Stand Up / Stretch"){ setTaskIcon("Activity"); setTaskTitle("Stretch Legs") }
    else if(eventType==="Take Medication")   { setTaskIcon("Pill"); setTaskTitle("Medication"); }
    else if(eventType==="Custom Schedule")   { setTaskIcon("CalendarDays");  setTaskTitle(""); }
    else if(eventType==="Personal Reminder"||eventType==="Custom Reminder"){ setTaskIcon("Bell"); setTaskTitle("Reminder") }
    else { setTaskIcon("CalendarDays"); setTaskTitle("") }
  },[eventType])

  const calendarDays = useMemo(()=>{
    const arr=[]; const today=new Date(); const sow=new Date(today)
    sow.setDate(today.getDate()-(today.getDay()||7)+1)
    for(let i=0;i<7;i++){
      const d=new Date(sow); d.setDate(sow.getDate()+i)
      arr.push({full:d.toDateString(),label:d.toLocaleDateString('en-US',{weekday:'narrow'}),num:d.getDate().toString(),isToday:d.toDateString()===today.toDateString()})
    }
    return arr
  },[])

  const monthStr=new Date().toLocaleDateString('en-US',{month:'short'}).toUpperCase()
  const yearStr =new Date().getFullYear().toString()

  const filteredTasks=useMemo(()=>{
    if(selectedDate==="All") return tasks
    return tasks.filter(t=>{ try{ return new Date(t.fire_at).toDateString()===selectedDate }catch{return false} })
  },[tasks,selectedDate])

  const activeSchedules = filteredTasks.filter(t=>t.is_event)
  const activeReminders = filteredTasks.filter(t=>!t.is_event)

  useEffect(()=>{
    const tg=(window as any).Telegram?.WebApp
    if(!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack=()=>{
      if (showOnboarding || showTZModal) { setCurrentView("home"); tg.BackButton.hide() } 
      else if (activePicker) setActivePicker(null)
      else if (configModalOpen) setConfigModalOpen(false)
      else if (isEditingMode){ setIsEditingMode(false); setActiveNavTab("tasks") } 
      else { setCurrentView("home"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return ()=>tg.BackButton.offClick(handleBack)
  },[isEditingMode, configModalOpen, activePicker, setCurrentView, showOnboarding, showTZModal])

  function handleNavTabClick(tab:NavTab){
    if(tab==="search") return
    if(tab==="edit"){ setIsEditingMode(!isEditingMode); setActiveNavTab(isEditingMode?"tasks":"edit") }
    else if(tab==="create"){ setIsEditingMode(false); setCreationMode("schedules"); setEventType(SCHEDULE_OPTIONS[0]); setConfigModalOpen(true); setActiveNavTab("create") }
    else { setIsEditingMode(false); setConfigModalOpen(false); setActiveNavTab(tab) }
  }

  function togglePicker(p:string){ setActivePicker(ap=>ap===p?null:p) }
  function toggleExpand(id:string|number){ setExpandedIds(p=>({...p,[id]:!p[id]})) }
  function toggleCompleted(id:string|number, e:React.MouseEvent) {
    e.stopPropagation()
    setCompletedTasks(prev => ({...prev, [id]: !prev[id]}))
  }

  function handleFileUpload(e:React.ChangeEvent<HTMLInputElement>){
    if(!e.target.files) return
    const nf=Array.from(e.target.files).slice(0,5-attachedFiles.length).map(f=>({name:f.name,size:f.size}))
    setAttachedFiles(p=>[...p,...nf].slice(0,5))
  }

  function buildFireAt(){
    const mi     = months.indexOf(selMonth)
    const now    = new Date()
    let   year   = now.getFullYear()
    const dayNum = parseInt(selDayNum, 10)
    const hour   = parseInt(selHour, 10)
    const min    = parseInt(selMin, 10)
   
    const pad = (n: number) => n.toString().padStart(2, "0")
    const localStr = `${year}-${pad(mi+1)}-${pad(dayNum)}T${pad(hour)}:${pad(min)}:00`
    let fireDate = new Date(localStr)

    if (fireDate.getTime() <= Date.now()) {
      fireDate = new Date(fireDate.getTime() + 24 * 60 * 60 * 1000)
    }
    const maxFuture = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    if (fireDate > maxFuture) {
      fireDate = maxFuture
    }
    return fireDate.toISOString() 
  }

  async function handleSaveConfig(){
    setLoading(true)
    const tg=getTg(); const chatId=tg?.initDataUnsafe?.user?.id
    try {
      const data=await apiPost("/api/schedule_create",{
        title:taskTitle||eventType, event_type:eventType, icon_name:taskIcon,
        color:ICON_COLORS[taskIcon]||"#3b82f6", description:taskDesc, extra:extraConfig,
        email_to:taskEmailRec, files:attachedFiles, is_event:creationMode==="schedules",
        fire_at:buildFireAt(), alert_offset_min:parseInt(selRemMin)||0, chat_id:chatId, thread_id:null,
      })
      if(data.success){
        showToast("Saved! Telegram will notify you 🔔","success")
        await fetchItems(); setConfigModalOpen(false); setActivePicker(null)
        setActiveNavTab("tasks")
      } else { showToast(data.message||"Could not save. Try again.","error") }
    } catch(e:any){ showToast(`Error: ${e.message}`,"error") }
    finally{ setLoading(false) }
  }

  async function handleDelete(itemId:number){
    try {
      const data=await apiPost("/api/schedule_delete",{item_id:itemId})
      if(data.success){ setTasks(p=>p.filter(t=>t.id!==itemId)); showToast("Removed.","success") }
    } catch(e:any){ showToast(`Error: ${e.message}`,"error") }
  }

  const TaskCard = ({item,isSuggestion=false, listType="reminder"}:{item:any;isSuggestion?:boolean; listType?:"reminder"|"schedule"})=>{
    const isExpanded=expandedIds[item.id]
    const color=item.color||ICON_COLORS[item.icon_name||item.iconName]||"#3b82f6"
    const isCompleted = completedTasks[item.id]
    
    let displayTime = "Today"
    if (item.fire_at) {
       try {
          const dt = new Date(item.fire_at);
          if (dt.toDateString() === new Date().toDateString()) {
             displayTime = dt.toLocaleTimeString("en-US",{hour:"numeric", hour12:true}).replace(" ", "");
          } else {
             displayTime = dt.toLocaleDateString("en-US",{month:"short", day:"numeric"});
          }
       } catch {}
    } else if (item.time) {
       displayTime = item.time;
    }

    if (listType === "schedule") {
      return (
        <div className={`relative w-full border-b border-[#2c2c2e] last:border-0 ${isEditingMode&&!isSuggestion?'jiggle-card':''}`}>
          <div 
            className="flex items-center justify-between py-3.5 cursor-pointer" 
            onClick={(e)=>{ if(isSuggestion){const mode=item.type==='reminder'?'reminders':'schedules';setCreationMode(mode);setEventType(mode==='reminders'?"Personal Reminder":"Custom Schedule");setTaskTitle(item.title.replace('\n',' '));setConfigModalOpen(true)} else toggleCompleted(item.id, e) }}
          >
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <div className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${isCompleted ? 'bg-[#3a3a3c] border-[#3a3a3c]' : 'border-[#636366]'}`}>
                 {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3}/>}
              </div>
              <span className={`text-[15px] font-medium truncate transition-colors ${isCompleted ? 'text-[#636366] line-through' : 'text-white'}`} style={{fontFamily:SF}}>{item.title}</span>
            </div>
            {isEditingMode&&!isSuggestion&&(
              <button onClick={(e)=>{e.stopPropagation(); handleDelete(item.id)}} className="shrink-0 p-1.5 active:scale-90 transition-transform">
                <Trash2 className="w-[16px] h-[16px] text-red-500"/>
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={`relative w-full ${isEditingMode&&!isSuggestion?'jiggle-card':''}`}>
        <div className="bg-[#2c2c2e] rounded-[16px] px-4 py-3.5 flex flex-col transition-all duration-200 cursor-pointer" onClick={()=>{ if(isSuggestion){const mode=item.type==='reminder'?'reminders':'schedules';setCreationMode(mode);setEventType(mode==='reminders'?"Personal Reminder":"Custom Schedule");setTaskTitle(item.title.replace('\n',' '));setConfigModalOpen(true)} else toggleExpand(item.id) }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <span className="text-[#8e8e93] text-[13px] font-medium w-[45px] shrink-0 truncate text-left" style={{fontFamily:SF}}>{displayTime}</span>
              <div className="w-[3px] h-[16px] rounded-full shrink-0" style={{backgroundColor: color}}/>
              <span className="text-[15px] font-medium text-white truncate" style={{fontFamily:SF}}>{item.title}</span>
            </div>
            
            {(item.extra || isSuggestion) && (
              <div className="shrink-0 ml-3">
                 <div className="bg-[#3a3a3c] px-3 py-1 rounded-full text-[#e4e4e7] text-[12px] font-medium tracking-wide">
                    {item.extra || "30 min"}
                 </div>
              </div>
            )}
          </div>
          
          {isExpanded&&!isSuggestion&&(
            <div className="mt-4 pt-4 border-t border-[#3a3a3c] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 pb-1 px-1">
              {item.description&&<div className="flex flex-col gap-1.5"><span className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Description</span><p className="text-[#e4e4e7] text-[14px] leading-relaxed" style={{fontFamily:SF}}>{item.description}</p></div>}
              {item.email_to&&<div className="flex flex-col gap-1.5"><span className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Email Recipient</span><div className="flex items-center gap-2 bg-[#1c1c1e] w-fit px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e]"><AtSign className="w-3.5 h-3.5 text-[#8e8e93]"/>{item.email_to}</div></div>}
              {item.files?.length>0&&<div className="flex flex-col gap-1.5"><span className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Attachments ({item.files.length})</span><div className="flex flex-col gap-1">{item.files.map((f:any,i:number)=><div key={i} className="flex items-center gap-2 bg-[#1c1c1e] w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden"><Paperclip className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/><span className="truncate">{f.name}</span></div>)}</div></div>}
              {item.extra&&<div className="flex flex-col gap-1.5"><span className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>{item.icon_name==='CalendarDays'?'Link':(item.icon_name==='Pill'?'Frequency':'Config')}</span><div className="flex items-center gap-2 bg-[#1c1c1e] w-fit max-w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden">{item.icon_name==='CalendarDays'?<LinkIcon className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>:(item.icon_name==='Pill'?<RefreshCcw className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>:<Sparkles className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>)}<span className="truncate">{item.extra}</span></div></div>}
              
              {item.event_type==="Schedule Email"&&item.email_to&&(
                <button onClick={async()=>{
                  try{ const r=await apiPost("/api/schedule_email",{recipient:item.email_to,subject:item.title,body:item.description||item.extra||""}); showToast(r.success?`Email sent to ${item.email_to} ✅`:(r.result||"Send failed"),r.success?"success":"error") }
                  catch(e:any){ showToast(`Error: ${e.message}`,"error") }
                }} className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-2xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[14px] font-medium active:scale-[0.98] transition-transform mt-2">
                  <Mail className="w-4 h-4"/> Send Email Now
                </button>
              )}
              {item.event_type==="Drive Upload"&&(
                <button onClick={async()=>{
                  const folder=item.extra||item.title||"xBlum Uploads"
                  try{ const r=await apiPost("/api/schedule_drive_upload",{folder_name:folder,file_names:(item.files||[]).map((f:any)=>f.name)}); showToast(r.success?`Drive folder "${folder}" ready ☁️`:(r.result||"Upload failed"),r.success?"success":"error") }
                  catch(e:any){ showToast(`Error: ${e.message}`,"error") }
                }} className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-2xl bg-[#eab308]/10 border border-[#eab308]/30 text-[#eab308] text-[14px] font-medium active:scale-[0.98] transition-transform mt-2">
                  <Folder className="w-4 h-4"/> Upload to Drive Now
                </button>
              )}
            </div>
          )}
        </div>
        {isEditingMode&&!isSuggestion&&(
          <button onClick={(e)=>{e.stopPropagation(); handleDelete(item.id)}} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-[#1c1c1e] active:scale-90 transition-transform z-10">
            <Trash2 className="w-[14px] h-[14px] text-white"/>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
      <style>{`
        @keyframes jiggle { 0%{transform:rotate(-1deg)} 50%{transform:rotate(1deg)} 100%{transform:rotate(-1deg)} }
        .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .wheel-mask { mask-image:linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%); -webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%); }
      `}</style>

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      {/* ── ONBOARDING AVANZADO ────────────────────── */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#050505] animate-in fade-in duration-500 overflow-hidden">
          <div className="absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none" style={{ background: ONBOARDING_CARDS_DATA[activeIndex].bgGradient, opacity: 1 }} />
          <div className="flex flex-col items-center flex-1 pt-12 pb-8 relative z-10">
            <div className="mb-6 opacity-90 h-10 flex items-center justify-center">
              <img src="/xblum-logo.png" alt="xBlum Logo" className="h-full object-contain" onError={(e)=>(e.currentTarget.style.display='none')}/>
            </div>
            <div ref={onboardingScrollRef} onScroll={handleOnboardingScroll} className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory px-[calc(50vw-148px)] no-scrollbar pb-10 pt-4" style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {ONBOARDING_CARDS_DATA.map((card, i) => {
                const Icon = card.icon;
                const isActive = i === activeIndex;
                return (
                  <div key={card.id} className="shrink-0 w-[280px] h-[380px] snap-center rounded-[36px] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden transition-all duration-300 ease-out" style={{ background: card.cardGradient, transform: isActive ? 'scale(1)' : 'scale(0.85)', opacity: isActive ? 1 : 0.5 }}>
                    <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/noise.png')", backgroundSize: "120px 120px" }} />
                    <div className="relative flex items-center justify-center mb-8 w-[110px] h-[110px]">
                      <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
                      <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md relative z-10 border border-white/30 shadow-lg">
                        <div className="relative">
                          <Icon className="w-9 h-9" style={{color: card.color}} strokeWidth={2.5} />
                          {card.isReminder && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-[#a21caf]" />}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-[24px] mb-3.5 relative z-10 tracking-tight" style={{fontFamily:SFD}}>{card.title}</h3>
                    <p className="text-white/90 text-[15px] leading-relaxed relative z-10 px-2" style={{fontFamily:SF}}>{card.desc}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2.5 mb-10">
              {ONBOARDING_CARDS_DATA.map((_, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/30'}`} />))}
            </div>
            <div className="flex flex-col items-center text-center mt-auto px-7 w-full max-w-sm relative z-10">
              <h1 className="text-white font-bold text-[28px] leading-[1.2] mb-3" style={{fontFamily:SFD, letterSpacing: "-0.03em"}}>Smart scheduling,<br/>reimagined for you</h1>
              <p className="text-[#8e8e93] text-[15px] mb-8" style={{fontFamily:SF}}>Join <span className="text-white font-medium">xBlum Assistant</span></p>
              <button onClick={handleStartOnboarding} className="w-full bg-white text-black py-4 rounded-[28px] font-bold text-[17px] active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 shadow-lg" style={{fontFamily:SF}}>
                Let's Get Started <span className="text-[19px] tracking-[-0.15em] ml-1 opacity-80" style={{fontFamily:SFD}}>›››</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TIME ZONE MODAL ────────────────────────────────────── */}
      {!showOnboarding && showTZModal && (
        <TZPickerModal
          onSave={(tz) => { setSelectedTZ(tz); localStorage.setItem("xblum_tz_set", tz) }}
          onConfirm={handleSaveTZ}
          selectedTZ={selectedTZ}
          onClose={() => setShowTZModal(false)}
        />
      )}

      <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar pt-6">
        
        {/* Cabecera del Mes/Año del Calendario - Restaurada a su posición original */}
        <div className="pt-2 flex justify-center items-end gap-1">
          <span className="text-white text-[22px] font-bold" style={{fontFamily:SFD}}>{monthStr}</span>
          <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{fontFamily:SFD}}>{yearStr}</span>
        </div>

        {/* Calendario Semanal Interactivo */}
        <div className="flex justify-between items-center px-6 mt-6">
          <button onClick={()=>setSelectedDate("All")} className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-full transition-all ${selectedDate==="All"?"bg-white text-black":"bg-[#1c1c1e] text-[#8e8e93]"}`}>
            <span className="text-[14px] font-bold" style={{fontFamily:SF}}>All</span>
          </button>
          <div className="w-px h-8 bg-[#2c2c2e] mx-1 shrink-0"/>
          {calendarDays.map((day,idx)=>{
            const isSel=selectedDate===day.full
            let dotClass=""
            if(isSel) dotClass="bg-blue-500"
            else if(day.isToday) dotClass="bg-[#ef4444]"
            return (
              <button key={idx} onClick={()=>setSelectedDate(day.full)} className={`flex flex-col items-center gap-1.5 relative w-10 transition-all ${isSel?"opacity-100":"opacity-60"}`}>
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${dotClass}`} style={{opacity:dotClass?1:0}}/>
                <span className={`text-[12px] font-medium ${isSel?"text-white":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>{day.label}</span>
                <span className={`text-[16px] font-bold ${isSel?"text-white":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>{day.num}</span>
              </button>
            )
          })}
        </div>

        {/* TEXTO DE CABECERA (You have...) DINAMICO */}
        <div className="px-6 mb-8 mt-10">
          <div className="flex flex-wrap items-center gap-x-1.5 text-[28px] font-medium leading-[1.3] tracking-tight" style={{fontFamily: SFD}}>
            <span className="text-[#8e8e93]">You have </span>
            <span className="text-white flex items-center gap-1.5"><Lightbulb className="w-6 h-6 text-[#f59e0b]" strokeWidth={2.5}/> {activeReminders.length} reminders</span>
            <span className="text-[#8e8e93]">and </span>
            <span className="text-white flex items-center gap-1.5"><CheckSquare className="w-6 h-6 text-[#3b82f6]" strokeWidth={2.5}/> {activeSchedules.length} schedules</span>
            <span className="text-[#8e8e93]">{selectedDate === "All" ? " today" : " on this day"}</span>
          </div>
        </div>

        {/* LISTA PRINCIPAL */}
        <div className="px-5 pb-10 flex flex-col gap-6">
          {loadingItems ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#8e8e93]"/></div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
               {/* Mostrar Sugerencias si no hay tareas (principalmente en la vista "All") */}
               <div className="bg-[#1c1c1e] rounded-[28px] p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white text-[18px] font-semibold" style={{fontFamily:SFD}}>Reminders</h3>
                      <p className="text-[#8e8e93] text-[14px]" style={{fontFamily:SF}}>You have no new reminders</p>
                    </div>
                  </div>
                  {selectedDate === "All" && (
                    <div className="flex flex-col gap-2.5">
                      {SUGGESTIONS.filter(s=>s.type==='reminder').map((sug,idx)=><TaskCard key={idx} item={sug} isSuggestion={true} listType="reminder"/>)}
                    </div>
                  )}
               </div>
               
               <div className="bg-[#1c1c1e] rounded-[28px] p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white text-[18px] font-semibold" style={{fontFamily:SFD}}>Schedules</h3>
                      <p className="text-[#8e8e93] text-[14px]" style={{fontFamily:SF}}>You have no schedules</p>
                    </div>
                  </div>
                  {selectedDate === "All" && (
                    <div className="flex flex-col">
                      {SUGGESTIONS.filter(s=>s.type==='schedule').map((sug,idx)=><TaskCard key={idx} item={sug} isSuggestion={true} listType="schedule"/>)}
                    </div>
                  )}
               </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              
              {/* REMINDERS BLOCK (Estilo Cápsulas Anidadas) */}
              {activeReminders.length > 0 && (
                <div className="bg-[#1c1c1e] rounded-[28px] p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white text-[18px] font-semibold" style={{fontFamily:SFD}}>Reminders</h3>
                      <p className="text-[#8e8e93] text-[14px]" style={{fontFamily:SF}}>You have {activeReminders.length} reminder{activeReminders.length!==1?'s':''} {selectedDate === "All" ? "today" : "on this day"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {activeReminders.map(task => <TaskCard key={task.id} item={task} listType="reminder" />)}
                  </div>
                </div>
              )}

              {/* SCHEDULES BLOCK (Estilo Lista de Checks) */}
              {activeSchedules.length > 0 && (
                <div className="bg-[#1c1c1e] rounded-[28px] p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white text-[18px] font-semibold" style={{fontFamily:SFD}}>Schedules</h3>
                      <p className="text-[#8e8e93] text-[14px]" style={{fontFamily:SF}}>You have {activeSchedules.length} schedule{activeSchedules.length!==1?'s':''} {selectedDate === "All" ? "today" : "on this day"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {activeSchedules.map(task => <TaskCard key={task.id} item={task} listType="schedule" />)}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* NavBar Inferior Fija */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{paddingBottom:"calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)"}}>
        <div className="pointer-events-auto flex items-center p-1.5 gap-1 bg-[#0f0f0f]/85 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl">
          <button disabled className="w-14 h-14 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed"><Search className="w-6 h-6 text-[#8e8e93]"/></button>
          <button onClick={()=>handleNavTabClick("tasks")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${activeNavTab==="tasks"?"bg-white text-black":"text-white"}`}>
            <CalendarDays className="w-6 h-6"/>
            {activeNavTab==="tasks"&&<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border border-black"/>}
          </button>
          <button onClick={()=>handleNavTabClick("edit")} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${isEditingMode?"bg-white text-black":"text-white"}`}>
            <Pencil className="w-6 h-6"/>
            {isEditingMode&&<div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-black"/>}
          </button>
          <div className="w-px h-8 bg-white/10 mx-1"/>
          <button onClick={()=>handleNavTabClick("create")} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10">
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5}/>
          </button>
        </div>
      </div>

      {/* ── MODAL DE CREACIÓN ESTILO SETTINGS ──────────────────── */}
      {configModalOpen&&(
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>{setConfigModalOpen(false);setActivePicker(null)}}/>
          <div className="relative w-full rounded-t-[32px] animate-in slide-in-from-bottom duration-400 max-h-[92vh] flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#2c2c2e]">

            <div className="flex flex-col px-6 pt-4 pb-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#3c3c3e] self-center mb-4"/>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-[24px] tracking-tight" style={{fontFamily:SFD}}>Create New</h3>
                <button onClick={()=>{setConfigModalOpen(false);setActivePicker(null)}} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70"><X className="w-5 h-5 text-[#8e8e93]"/></button>
              </div>

              <div className="flex bg-[#1c1c1e] p-1 rounded-full w-full mt-4 border border-[#2c2c2e]">
                <button onClick={()=>{setCreationMode("schedules");setEventType(SCHEDULE_OPTIONS[0]);setActivePicker(null)}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="schedules"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>📅 Schedule</button>
                <button onClick={()=>{setCreationMode("reminders");setEventType(REMINDER_OPTIONS[0]);setActivePicker(null)}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="reminders"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>🔔 Reminder</button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 no-scrollbar px-6 pb-8 space-y-4">
              <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                
                  {/* Type */}
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("type")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-[20px] h-[20px] text-[#8e8e93]"/>
                        <span className="text-white text-[16px] font-medium">Type</span>
                      </div>
                      <span className="text-[#8e8e93] text-[16px] truncate max-w-[150px]">{eventType}</span>
                    </button>
                    {activePicker==="type"&&(
                      <div className="flex items-center justify-center py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                        <WheelPicker items={creationMode==="schedules"?SCHEDULE_OPTIONS:REMINDER_OPTIONS} value={eventType} onChange={setEventType}/>
                      </div>
                    )}
                  </div>

                  {/* Title & Icon */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between w-full p-4">
                      <button onClick={()=>togglePicker("icon")} className="flex items-center gap-3 active:opacity-70 transition-opacity">
                        {(()=>{const I=ICONS[taskIcon]||CalendarDays;return <I className="w-5 h-5 shrink-0" style={{color:ICON_COLORS[taskIcon]||"#ffffff"}}/>})()}
                        <span className="text-white text-[16px] font-medium whitespace-nowrap">Title & Icon</span>
                      </button>
                      <input type="text" placeholder="Add title…" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-full ml-4 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                    </div>
                    {activePicker==="icon"&&(
                      <div className="grid grid-cols-6 gap-4 py-5 px-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95">
                        {Object.keys(ICONS).map(key=>{const IC=ICONS[key];const sel=taskIcon===key;return(
                          <button key={key} onClick={()=>{setTaskIcon(key);setActivePicker(null)}} className={`flex flex-col items-center justify-center transition-all ${sel?"scale-110":"opacity-70 hover:opacity-100"}`}>
                            <IC className="w-6 h-6" style={{color:ICON_COLORS[key]}}/>
                            {sel&&<div className="w-1.5 h-1.5 rounded-full mt-2" style={{backgroundColor:ICON_COLORS[key]}}/>}
                          </button>
                        )})}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("date")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-[20px] h-[20px] text-[#8e8e93]"/>
                        <span className="text-white text-[16px] font-medium">Date</span>
                      </div>
                      <span className="text-[#8e8e93] text-[16px]">{selMonth} {selDayNum}</span>
                    </button>
                    {activePicker==="date"&&(
                      <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                        <WheelPicker items={months} value={selMonth} onChange={setSelMonth}/>
                        <WheelPicker items={days} value={selDayNum} onChange={setSelDayNum}/>
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("time")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Clock className="w-[20px] h-[20px] text-[#8e8e93]"/>
                        <span className="text-white text-[16px] font-medium">Time</span>
                      </div>
                      <span className="text-[#8e8e93] text-[16px]">{parseInt(selHour)===0?"12":parseInt(selHour)>12?(parseInt(selHour)-12).toString():parseInt(selHour).toString()}:{selMin} {parseInt(selHour)>=12?"PM":"AM"}</span>
                    </button>
                    {activePicker==="time"&&(
                      <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                        <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h"/>
                        <span className="text-xl font-bold text-[#636366]">:</span>
                        <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m"/>
                      </div>
                    )}
                  </div>
                  
                  {/* Time Zone */}
                  <div className="flex flex-col">
                    <button onClick={()=>setShowTZModal(true)} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-[20px] h-[20px] text-[#8e8e93]"/>
                        <span className="text-white text-[16px] font-medium">Time Zone</span>
                      </div>
                      <span className="text-[#8e8e93] text-[16px] truncate max-w-[120px]">{selectedTZ ? selectedTZ.split('/').pop()?.replace('_', ' ') : 'Select...'}</span>
                    </button>
                  </div>

                  {/* Dynamic Fields */}
                  {eventType==="Schedule Email"&&(
                    <>
                      <div className="flex flex-col w-full p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3"><AtSign className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Recipient</span></div>
                          <input type="email" placeholder="client@ex.com" value={taskEmailRec} onChange={e=>setTaskEmailRec(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                        </div>
                      </div>
                      <div className="flex flex-col w-full p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3"><Paperclip className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Attachments</span></div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#8e8e93] text-[14px]">{attachedFiles.length} / 5</span>
                            <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden"/>
                            <button onClick={()=>fileInputRef.current?.click()} disabled={attachedFiles.length>=5} className="bg-[#2c2c2e] text-white px-3 py-1.5 rounded-full text-[13px] font-medium active:scale-95 disabled:opacity-50">+ Add</button>
                            {attachedFiles.length>0&&<button onClick={()=>setAttachedFiles([])} className="text-red-400 px-2 py-1.5 text-[13px]">Clear</button>}
                          </div>
                        </div>
                        {attachedFiles.length>0&&<div className="flex flex-wrap gap-2 mt-2">{attachedFiles.map((f,i)=><div key={i} className="flex items-center gap-1.5 bg-[#2c2c2e] px-2.5 py-1 rounded-md text-[11px] text-[#e4e4e7]"><span className="truncate max-w-[120px]">{f.name}</span><button onClick={()=>setAttachedFiles(p=>p.filter((_,j)=>j!==i))}><X className="w-3 h-3 text-[#8e8e93]"/></button></div>)}</div>}
                      </div>
                    </>
                  )}

                  {eventType==="Drive Upload"&&(
                    <div className="flex flex-col w-full p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3"><Folder className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Drive Folder</span></div>
                        <input type="text" placeholder="Folder name..." value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                      </div>
                      <div className="flex items-center justify-between mb-2 pt-3 border-t border-[#2c2c2e]">
                        <div className="flex items-center gap-3"><Paperclip className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Files</span></div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#8e8e93] text-[14px]">{attachedFiles.length} / 5</span>
                          <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden"/>
                          <button onClick={()=>fileInputRef.current?.click()} disabled={attachedFiles.length>=5} className="bg-[#2c2c2e] text-white px-3 py-1.5 rounded-full text-[13px] font-medium active:scale-95 disabled:opacity-50">+ Add</button>
                          {attachedFiles.length>0&&<button onClick={()=>setAttachedFiles([])} className="text-red-400 px-2 py-1.5 text-[13px]">Clear</button>}
                        </div>
                      </div>
                      {attachedFiles.length>0&&<div className="flex flex-wrap gap-2 mt-2">{attachedFiles.map((f,i)=><div key={i} className="flex items-center gap-1.5 bg-[#2c2c2e] px-2.5 py-1 rounded-md text-[11px] text-[#e4e4e7]"><span className="truncate max-w-[120px]">{f.name}</span><button onClick={()=>setAttachedFiles(p=>p.filter((_,j)=>j!==i))}><X className="w-3 h-3 text-[#8e8e93]"/></button></div>)}</div>}
                    </div>
                  )}

                  {eventType==="Custom Schedule"&&(
                    <div className="flex items-center justify-between w-full p-4">
                      <div className="flex items-center gap-3"><LinkIcon className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">URL</span></div>
                      <input type="text" placeholder="Optional meeting link..." value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                    </div>
                  )}

                  {eventType==="Take Medication"&&(
                    <div className="flex items-center justify-between w-full p-4">
                      <div className="flex items-center gap-3"><RefreshCcw className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Frequency</span></div>
                      <input type="text" placeholder="e.g. Every 8 hours" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                    </div>
                  )}

                  {(eventType==="Workout / Gym"||eventType==="Deep Work"||eventType==="Meal Time")&&(
                    <div className="flex items-center justify-between w-full p-4">
                      <div className="flex items-center gap-3"><Type className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Tag</span></div>
                      <input type="text" placeholder={eventType==="Workout / Gym"?"e.g. Chest Day":eventType==="Deep Work"?"e.g. Sprint planning":"e.g. Lunch"} value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white" style={{fontFamily:SF}}/>
                    </div>
                  )}

                  {/* Reminders / Alert Offset */}
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("reminder")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Bell className="w-[20px] h-[20px] text-[#8e8e93]"/>
                        <span className="text-white text-[16px] font-medium">Alert Offset</span>
                      </div>
                      <span className="text-[#8e8e93] text-[16px]">
                        {selRemMin === "00" && selRemSec === "00" ? "At time of event" : `${parseInt(selRemMin, 10)}m ${parseInt(selRemSec, 10)}s`}
                      </span>
                    </button>
                    {activePicker==="reminder"&&(
                      <div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                        <WheelPicker items={mins} value={selRemMin} onChange={setSelRemMin} suffix="m"/>
                        <WheelPicker items={secs} value={selRemSec} onChange={setSelRemSec} suffix="s"/>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ── DESCRIPTION ── */}
              <div className="bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-3 pl-2">
                  <AlignLeft className="w-[20px] h-[20px] text-[#8e8e93]"/>
                  <span className="text-white text-[16px] font-medium">Notes</span>
                </div>
                <textarea rows={3} placeholder="Optional notes or details…" value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-2 text-[15px] leading-relaxed" style={{fontFamily:SF}}/>
              </div>

              {/* ── SAVE ── */}
              <div className="pb-6 pt-2">
                <button onClick={handleSaveConfig} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px] disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading&&<Loader2 className="w-5 h-5 animate-spin"/>}
                  {loading ? "Saving…" : `Save ${creationMode==="schedules"?"Schedule":"Reminder"}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"><Loader2 className="w-8 h-8 animate-spin text-white"/></div>}
    </div>
  )
}
