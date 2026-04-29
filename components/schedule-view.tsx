"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, Lock, 
  Plus, Loader2, Pencil, Search, X, Trash2, Moon, TrendingUp, Sparkles, 
  CheckSquare, Mail, Type, AlignLeft, AtSign, Folder, ThumbsUp, ThumbsDown,
  Dumbbell, Briefcase, Laptop, Utensils, MessageSquare, Coffee, ChevronDown, ChevronUp, Paperclip,
  Droplets, Pill, Activity, Link as LinkIcon, RefreshCcw, CheckCircle2, AlertCircle, Globe, Zap, ChevronsRight
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

type NavTab = "tasks" | "edit" | "search" | "create"
type ListViewTab = "events" | "reminders"

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
  id: number; title: string; event_type: string; icon_name: string; color: string
  description: string; extra: string; email_to: string; files: {name:string;size:number}[]
  is_event: boolean; fire_at: string; alert_offset_min: number; status: string
}

const ICONS: Record<string, React.ElementType> = {
  CalendarDays, Clock, Bell, Mail, Folder, Dumbbell, Briefcase, Laptop, Utensils,
  MessageSquare, Send, Coffee, Droplets, Pill, Activity, TrendingUp, CheckSquare
}
const ICON_COLORS: Record<string, string> = {
  CalendarDays:"#3b82f6", Clock:"#f97316", Bell:"#f43f5e", Mail:"#0ea5e9", Folder:"#eab308",
  Dumbbell:"#a855f7", Briefcase:"#d97706", Laptop:"#94a3b8", Utensils:"#ec4899",
  MessageSquare:"#22c55e", Send:"#14b8a6", Coffee:"#b45309", Droplets:"#38bdf8",
  Pill:"#fb7185", Activity:"#10b981", TrendingUp:"#22c55e", CheckSquare:"#3b82f6"
}

const EVENT_OPTIONS    = ["Custom Event","Schedule Email","Drive Upload","Workout / Gym","Deep Work","Meal Time","Send Message"]
const REMINDER_OPTIONS = ["Personal Reminder","Drink Water","Stand Up / Stretch","Take Medication","Custom Reminder"]

const TIMEZONES = [
  "--- Select a Time Zone ---",
  "America/Los_Angeles", "America/Mexico_City", "America/Bogota", "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
  "Europe/London", "Europe/Madrid", "Europe/Paris", "Asia/Dubai", "Asia/Tokyo", "Australia/Sydney"
]

const ONBOARDING_CARDS_DATA = [
  { 
    id: 1, title: "Smart Events", icon: CalendarDays, color: "#ffffff",
    bgGradient: "radial-gradient(circle at center, rgba(30,58,138,0.4) 0%, rgba(5,5,5,0) 70%)",
    cardGradient: "linear-gradient(145deg, #2563eb, #1e3a8a)",
    desc: "Schedule events seamlessly and keep your entire agenda perfectly organized."
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
  { id:"sug_run",   title:"Outdoor run",     time:"1:30 – 2 PM",    iconName:"TrendingUp",  color:"#22c55e", type:"event" },
  { id:"sug_email", title:"Apply to YC",     time:"2:30 – 3:30 PM", iconName:"CheckSquare", color:"#3b82f6", type:"event" },
  { id:"sug_tg",    title:"Order vitamin D", time:"7 – 7:30 PM",    iconName:"Pill",        color:"#fb7185", type:"reminder" },
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

export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks,         setTasks]         = useState<ScheduleItem[]>([])
  const [loadingItems,  setLoadingItems]  = useState(true)
  const [selectedDate,  setSelectedDate]  = useState<string|"All">("All")
  const [activeNavTab,  setActiveNavTab]  = useState<NavTab>("tasks")
  const [listView,      setListView]      = useState<ListViewTab>("events")
  const [viewAll,       setViewAll]       = useState(false)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [expandedIds,   setExpandedIds]   = useState<Record<string,boolean>>({})
  const [configModalOpen,setConfigModalOpen]=useState(false)
  
  // States para Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const onboardingScrollRef = useRef<HTMLDivElement>(null)
  
  const [showTZModal,    setShowTZModal]    = useState(false)
  const [selectedTZ,     setSelectedTZ]     = useState(TIMEZONES[0])

  const [loading,       setLoading]       = useState(false)
  const [activePicker,  setActivePicker]  = useState<string|null>(null)
  const [toast,         setToast]         = useState<{msg:string;type:"success"|"error"}|null>(null)
  const [creationMode,  setCreationMode]  = useState<ListViewTab>("events")
  const [eventType,     setEventType]     = useState("Custom Event")
  const [taskIcon,      setTaskIcon]      = useState("CalendarDays")
  const [taskTitle,     setTaskTitle]     = useState("")
  const [taskDesc,      setTaskDesc]      = useState("")
  const [taskEmailRec,  setTaskEmailRec]  = useState("")
  const [attachedFiles, setAttachedFiles] = useState<{name:string;size:number}[]>([])
  const [extraConfig,   setExtraConfig]   = useState("")
  const [selHour,  setSelHour]  = useState("08")
  const [selMin,   setSelMin]   = useState("00")
  const [selMonth, setSelMonth] = useState(months[new Date().getMonth()])
  const [selDayNum,setSelDayNum]= useState(new Date().getDate().toString())
  const [selRemMin,setSelRemMin]= useState("10")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hours = Array.from({length:24},(_,i)=>i.toString().padStart(2,'0'))
  const mins  = Array.from({length:60},(_,i)=>i.toString().padStart(2,'0'))
  const days  = Array.from({length:31},(_,i)=>(i+1).toString())

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500)
  },[])

  // ── INIT CHECK Y CENTRADO DE ONBOARDING ──
  useEffect(() => {
    const onboarded = localStorage.getItem("xblum_onboarded")
    const savedTZ = localStorage.getItem("xblum_tz_set")
    
    if (!onboarded) {
      setShowOnboarding(true)
      // Centra suavemente en la tarjeta del medio al cargar la app
      setTimeout(() => {
        if(onboardingScrollRef.current) {
          const cardWidth = 280 + 16 // Ancho de la tarjeta (280px) + gap (16px)
          onboardingScrollRef.current.scrollTo({
            left: cardWidth * 1,
            behavior: 'smooth'
          });
        }
      }, 100)
    } else if (!savedTZ) {
      setShowTZModal(true)
    }
  }, [])

  // ── LÓGICA DE SCROLL ESTABLE (SIN BUGS) ──
  const handleOnboardingScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 280 + 16; // 280px de tarjeta + gap-4 (16px)
    
    // Simplemente determinamos qué tarjeta está más cerca del centro
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
    if (selectedTZ === TIMEZONES[0]) return
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
  useEffect(()=>{ setViewAll(false) },[listView])

  useEffect(()=>{
    setExtraConfig(""); setAttachedFiles([])
    if(eventType==="Workout / Gym")          { setTaskIcon("Dumbbell");      setTaskTitle("Workout");           setExtraConfig("Upper Body") }
    else if(eventType==="Deep Work")          { setTaskIcon("Laptop");        setTaskTitle("Deep Work Session"); setExtraConfig("DND Mode") }
    else if(eventType==="Meal Time")          { setTaskIcon("Utensils");      setTaskTitle("Lunch Break");       setExtraConfig("High Protein") }
    else if(eventType==="Schedule Email")     { setTaskIcon("Mail");          setTaskTitle("Send Email") }
    else if(eventType==="Send Message")       { setTaskIcon("MessageSquare"); setTaskTitle("Send Message") }
    else if(eventType==="Drive Upload")       { setTaskIcon("Folder");        setTaskTitle("Backup to Drive") }
    else if(eventType==="Drink Water")        { setTaskIcon("Droplets");      setTaskTitle("Drink Water") }
    else if(eventType==="Stand Up / Stretch") { setTaskIcon("Activity");      setTaskTitle("Stretch Legs") }
    else if(eventType==="Take Medication")    { setTaskIcon("Pill");          setTaskTitle("Medication");        setExtraConfig("Every 8h") }
    else if(eventType==="Custom Event")       { setTaskIcon("CalendarDays");  setTaskTitle("");                  setExtraConfig("https://meet.google.com/...") }
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

  const activeEvents    = filteredTasks.filter(t=>t.is_event)
  const activeReminders = filteredTasks.filter(t=>!t.is_event)
  const currentList     = listView==="events" ? activeEvents : activeReminders
  const showViewAllButton = currentList.length>3
  const displayedList   = viewAll ? currentList : currentList.slice(0,3)

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
    else if(tab==="create"){ setIsEditingMode(false); setCreationMode("events"); setEventType(EVENT_OPTIONS[0]); setConfigModalOpen(true); setActiveNavTab("create") }
    else { setIsEditingMode(false); setConfigModalOpen(false); setActiveNavTab(tab) }
  }

  function togglePicker(p:string){ setActivePicker(ap=>ap===p?null:p) }
  function toggleExpand(id:string|number){ setExpandedIds(p=>({...p,[id]:!p[id]})) }
  function handleFileUpload(e:React.ChangeEvent<HTMLInputElement>){
    if(!e.target.files) return
    const nf=Array.from(e.target.files).slice(0,5-attachedFiles.length).map(f=>({name:f.name,size:f.size}))
    setAttachedFiles(p=>[...p,...nf].slice(0,5))
  }
  function buildFireAt(){
    // Read the timezone the user configured during onboarding
    const userTZ = localStorage.getItem("xblum_tz_set") || Intl.DateTimeFormat().resolvedOptions().timeZone

    const mi      = months.indexOf(selMonth)
    const dayNum  = parseInt(selDayNum, 10)
    const hour    = parseInt(selHour, 10)
    const min     = parseInt(selMin, 10)

    // Determine year: if the selected month/day is already past this year, use next year
    const now       = new Date()
    let year        = now.getFullYear()
    const candidate = new Date(year, mi, dayNum, hour, min, 0)
    if (candidate < now) year += 1

    // Build an ISO-like string in the user's local timezone and convert to UTC
    // Using Intl to find the UTC offset for the target datetime in the user's TZ
    const localStr  = `${year}-${String(mi+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`
    // Parse as local wall-clock time in userTZ then emit as UTC ISO
    try {
      // Create a Date by interpreting the local string in the target timezone
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: userTZ,
        year:"numeric", month:"2-digit", day:"2-digit",
        hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false,
      }).formatToParts(new Date(localStr))
      // We need the INVERSE: local → UTC. Use the offset trick.
      // Format a reference UTC time in userTZ to compute the offset.
      const ref     = new Date(localStr + "Z") // treat as UTC temporarily
      const tzStr   = new Intl.DateTimeFormat("en-US",{timeZone:userTZ,hour:"numeric",minute:"numeric",hour12:false,timeZoneName:"shortOffset"}).format(ref)
      // Reliable cross-browser approach: iterate offset to find the correct UTC instant
      // whose wall-clock in userTZ equals our target.
      const target  = Date.UTC(year, mi, dayNum, hour, min, 0)
      const probe   = new Date(target)
      const probeLocal = new Intl.DateTimeFormat("en-US",{
        timeZone:userTZ, year:"numeric",month:"2-digit",day:"2-digit",
        hour:"2-digit",minute:"2-digit",hour12:false
      }).format(probe)
      // probeLocal is "MM/DD/YYYY, HH:MM" — parse it
      const [datePart, timePart] = probeLocal.split(", ")
      const [pm, pd, py] = datePart.split("/").map(Number)
      const [ph, pmin]   = timePart.split(":").map(Number)
      // Compute offset: how many ms probe's local display differs from target local
      const probeAsLocal = Date.UTC(py, pm-1, pd, ph, pmin, 0)
      const offsetMs     = target - probeAsLocal  // UTC = local + offsetMs... approx
      const utcMs        = target + offsetMs
      return new Date(utcMs).toISOString()
    } catch {
      // Fallback: assume UTC
      return new Date(Date.UTC(year, mi, dayNum, hour, min, 0)).toISOString()
    }
  }
  function formatFireAt(iso:string){ try{ const dt=new Date(iso); return dt.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true}) }catch{return iso} }

  async function handleSaveConfig(){
    setLoading(true)
    const tg=getTg(); const chatId=tg?.initDataUnsafe?.user?.id
    try {
      const data=await apiPost("/api/schedule_create",{
        title:taskTitle||eventType, event_type:eventType, icon_name:taskIcon,
        color:ICON_COLORS[taskIcon]||"#3b82f6", description:taskDesc, extra:extraConfig,
        email_to:taskEmailRec, files:attachedFiles, is_event:creationMode==="events",
        fire_at:buildFireAt(), alert_offset_min:parseInt(selRemMin)||0, chat_id:chatId, thread_id:null,
      })
      if(data.success){
        showToast("Saved! Telegram will notify you 🔔","success")
        await fetchItems(); setConfigModalOpen(false); setActivePicker(null)
        setListView(creationMode==="events"?"events":"reminders"); setActiveNavTab("tasks")
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

  const TaskCard = ({item,isSuggestion=false,isLastAndFaded=false}:{item:any;isSuggestion?:boolean;isLastAndFaded?:boolean})=>{
    const isExpanded=expandedIds[item.id]
    const TheIcon=ICONS[item.icon_name||item.iconName]||CalendarDays
    const color=item.color||ICON_COLORS[item.icon_name||item.iconName]||"#3b82f6"
    const displayTime=item.fire_at?formatFireAt(item.fire_at):(item.time||"")
    return (
      <div className={`relative w-full ${isEditingMode&&!isSuggestion?'jiggle-card':''}`}>
        <div className={`bg-[#1c1c1e] border border-[#2c2c2e] px-5 py-3.5 flex flex-col transition-all duration-200 ${isExpanded&&!isSuggestion?'rounded-[24px]':'rounded-full'} ${isLastAndFaded?'fade-out-bottom':''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <TheIcon className="w-5 h-5 shrink-0" style={{color}}/>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold leading-tight" style={{fontFamily:SFD,color}}>{item.title}</span>
                <span className="text-[#8e8e93] text-[13px] mt-0.5" style={{fontFamily:SF}}>{displayTime}</span>
              </div>
            </div>
            <button onClick={()=>{ if(isSuggestion){const mode=item.type==='reminder'?'reminders':'events';setCreationMode(mode);setEventType(mode==='reminders'?"Personal Reminder":"Custom Event");setTaskTitle(item.title.replace('\n',' '));setConfigModalOpen(true)} else toggleExpand(item.id) }}
              className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center shrink-0 active:scale-95 transition-transform">
              {isSuggestion?<Plus className="w-4 h-4 text-[#8e8e93]"/>:(isExpanded?<ChevronUp className="w-4 h-4 text-[#8e8e93]"/>:<ChevronDown className="w-4 h-4 text-[#8e8e93]"/>)}
            </button>
          </div>
          {isExpanded&&!isSuggestion&&(
            <div className="mt-4 pt-4 border-t border-[#2c2c2e] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 pb-1 px-1">
              {item.description&&<div className="flex flex-col gap-1.5"><span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Description</span><p className="text-[#e4e4e7] text-[14px] leading-relaxed" style={{fontFamily:SF}}>{item.description}</p></div>}
              {item.email_to&&<div className="flex flex-col gap-1.5"><span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Email Recipient</span><div className="flex items-center gap-2 bg-[#2c2c2e]/50 w-fit px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e]"><AtSign className="w-3.5 h-3.5 text-[#8e8e93]"/>{item.email_to}</div></div>}
              {item.files?.length>0&&<div className="flex flex-col gap-1.5"><span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>Attachments ({item.files.length})</span><div className="flex flex-col gap-1">{item.files.map((f:any,i:number)=><div key={i} className="flex items-center gap-2 bg-[#2c2c2e]/50 w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden"><Paperclip className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/><span className="truncate">{f.name}</span></div>)}</div></div>}
              {item.extra&&<div className="flex flex-col gap-1.5"><span className="text-[#636366] text-[11px] font-bold uppercase tracking-wider" style={{fontFamily:SF}}>{item.icon_name==='CalendarDays'?'Link':(item.icon_name==='Pill'?'Frequency':'Config')}</span><div className="flex items-center gap-2 bg-[#2c2c2e]/50 w-fit max-w-full px-3 py-1.5 rounded-lg text-[13px] text-[#e4e4e7] border border-[#2c2c2e] overflow-hidden">{item.icon_name==='CalendarDays'?<LinkIcon className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>:(item.icon_name==='Pill'?<RefreshCcw className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>:<Sparkles className="w-3.5 h-3.5 text-[#8e8e93] shrink-0"/>)}<span className="truncate">{item.extra}</span></div></div>}
              
              {item.event_type==="Schedule Email"&&item.email_to&&(
                <button onClick={async()=>{
                  try{ const r=await apiPost("/api/schedule_email",{recipient:item.email_to,subject:item.title,body:item.description||item.extra||""}); showToast(r.success?`Email sent to ${item.email_to} ✅`:(r.result||"Send failed"),r.success?"success":"error") }
                  catch(e:any){ showToast(`Error: ${e.message}`,"error") }
                }} className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-2xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[14px] font-medium active:scale-[0.98] transition-transform">
                  <Mail className="w-4 h-4"/> Send Email Now
                </button>
              )}
              {item.event_type==="Drive Upload"&&(
                <button onClick={async()=>{
                  const folder=item.extra||item.title||"xBlum Uploads"
                  try{ const r=await apiPost("/api/schedule_drive_upload",{folder_name:folder,file_names:(item.files||[]).map((f:any)=>f.name)}); showToast(r.success?`Drive folder "${folder}" ready ☁️`:(r.result||"Upload failed"),r.success?"success":"error") }
                  catch(e:any){ showToast(`Error: ${e.message}`,"error") }
                }} className="flex items-center gap-2 justify-center py-2.5 px-4 rounded-2xl bg-[#eab308]/10 border border-[#eab308]/30 text-[#eab308] text-[14px] font-medium active:scale-[0.98] transition-transform">
                  <Folder className="w-4 h-4"/> Upload to Drive Now
                </button>
              )}
            </div>
          )}
        </div>
        {isEditingMode&&!isSuggestion&&(
          <button onClick={()=>handleDelete(item.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-2 border-black active:scale-90 transition-transform z-10">
            <Trash2 className="w-[14px] h-[14px] text-white"/>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#111111] text-white select-none overflow-hidden relative">
      <style>{`
        @keyframes jiggle { 0%{transform:rotate(-1deg)} 50%{transform:rotate(1deg)} 100%{transform:rotate(-1deg)} }
        .jiggle-card { animation: jiggle 0.3s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .wheel-mask { mask-image:linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%); -webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 30%,black 70%,transparent 100%); }
        .fade-out-bottom { mask-image:linear-gradient(to bottom,black 40%,transparent 100%); opacity:0.8; pointer-events:none; }
      `}</style>

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      {/* ── ONBOARDING AVANZADO ────────────────────── */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#050505] animate-in fade-in duration-500 overflow-hidden">
          
          <div className="absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none" 
               style={{ background: ONBOARDING_CARDS_DATA[activeIndex].bgGradient, opacity: 1 }} />
          
          <div className="flex flex-col items-center flex-1 pt-12 pb-8 relative z-10">
            <div className="mb-6 opacity-90 h-10 flex items-center justify-center">
              <img src="/xblum-logo.png" alt="xBlum Logo" className="h-full object-contain" onError={(e)=>(e.currentTarget.style.display='none')}/>
            </div>

            <div ref={onboardingScrollRef} 
                 onScroll={handleOnboardingScroll}
                 className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory px-[calc(50vw-148px)] no-scrollbar pb-10 pt-4" 
                 style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}>
              
              {ONBOARDING_CARDS_DATA.map((card, i) => {
                const Icon = card.icon;
                const isActive = i === activeIndex;

                return (
                  <div key={card.id} 
                       className="shrink-0 w-[280px] h-[380px] snap-center rounded-[36px] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden transition-all duration-300 ease-out" 
                       style={{ 
                         background: card.cardGradient,
                         transform: isActive ? 'scale(1)' : 'scale(0.85)',
                         opacity: isActive ? 1 : 0.5,
                       }}>
                    
                    <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/noise.png')", backgroundSize: "120px 120px" }} />
                    
                    {/* Contenedor del Icono con UN SOLO anillo */}
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
                    <p className="text-white/90 text-[15px] leading-relaxed relative z-10 px-2" style={{fontFamily:SF}}>
                      {card.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2.5 mb-10">
              {ONBOARDING_CARDS_DATA.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/30'}`} />
              ))}
            </div>

            <div className="flex flex-col items-center text-center mt-auto px-7 w-full max-w-sm relative z-10">
              <h1 className="text-white font-bold text-[28px] leading-[1.2] mb-3" style={{fontFamily:SFD, letterSpacing: "-0.03em"}}>
                Smart scheduling,<br/>reimagined for you
              </h1>
              <p className="text-[#8e8e93] text-[15px] mb-8" style={{fontFamily:SF}}>
                Join <span className="text-white font-medium">xBlum Assistant</span>
              </p>

              <button 
                onClick={handleStartOnboarding}
                className="w-full bg-white text-black py-4 rounded-[28px] font-bold text-[17px] active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 shadow-lg"
                style={{fontFamily:SF}}
              >
                Let's Get Started <span className="text-[19px] tracking-[-0.15em] ml-1 opacity-80" style={{fontFamily:SFD}}>›››</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TIME ZONE MODAL ────────────────────────────────────── */}
      {!showOnboarding && showTZModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative w-full rounded-t-[32px] p-6 max-h-[90vh] flex flex-col bg-[#111] border-t border-[#2c2c2e]">
            <div className="flex flex-col items-center justify-center mb-6 pt-2">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4"><Globe className="w-8 h-8 text-blue-500" /></div>
              <h3 className="text-white font-bold text-[24px] tracking-tight text-center" style={{fontFamily:SFD}}>Set Time Zone</h3>
              <p className="text-[#8e8e93] text-[15px] text-center mt-2" style={{fontFamily:SF}}>Select your region to ensure schedules<br/> fire exactly when you need them.</p>
            </div>
            <div className="bg-[#1c1c1e] rounded-[24px] overflow-hidden mb-6 h-[160px] relative wheel-mask border border-[#2c2c2e]"><WheelPicker items={TIMEZONES} value={selectedTZ} onChange={setSelectedTZ} /></div>
            <div className="pb-4"><button onClick={handleSaveTZ} disabled={selectedTZ === TIMEZONES[0]} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100">Confirm & Continue</button></div>
          </div>
        </div>
      )}

      {/* Header Fecha */}
      <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
        <div className="pt-10 flex justify-center items-end gap-1">
          <span className="text-white text-[22px] font-bold" style={{fontFamily:SFD}}>{monthStr}</span>
          <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{fontFamily:SFD}}>{yearStr}</span>
        </div>

        {/* Calendario Semanal */}
        <div className="flex justify-between items-center px-6 mt-8">
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

        {/* Resumen Schedule */}
        <div className="mt-10 flex flex-col items-center">
          <p className="text-[#8e8e93] text-[14px] font-bold tracking-widest uppercase mb-3" style={{fontFamily:SF}}>Schedule</p>
          <div className="flex items-center gap-6 text-[26px] font-bold text-white tracking-tight" style={{fontFamily:SFD}}>
            <div className="flex items-center gap-2"><CalendarDays className="w-6 h-6 text-[#8e8e93] stroke-[2]"/><span>{activeEvents.length} events</span></div>
            <div className="flex items-center gap-2"><Bell className="w-6 h-6 text-[#8e8e93] stroke-[2]"/><span>{activeReminders.length} reminders</span></div>
          </div>
        </div>

        {/* Sugerencias Biométricas */}
        <div className="mt-6 flex flex-col items-center gap-3 px-5">
          <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2.5 rounded-full border border-[#2c2c2e] w-full max-w-sm justify-center">
            <Moon className="w-4 h-4 text-[#f59e0b]"/>
            <span className="text-[#f59e0b] text-[14px] font-medium" style={{fontFamily:SF}}>Morning grogginess <span className="opacity-60 font-normal">15m left</span></span>
          </div>
          <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2.5 rounded-full border border-[#2c2c2e] w-full max-w-sm justify-center">
            <TrendingUp className="w-4 h-4 text-[#22c55e]"/>
            <span className="text-[#22c55e] text-[14px] font-medium" style={{fontFamily:SF}}>Alertness rise <span className="opacity-60 font-normal">in 45m</span></span>
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="px-5 mt-10 pb-10">
          {loadingItems ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#8e8e93]"/></div>
          ) : filteredTasks.length===0 ? (
            <div className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#8e8e93]"/><span className="text-[#8e8e93] text-[13px] font-bold tracking-widest uppercase" style={{fontFamily:SF}}>Suggested</span></div>
              </div>
              <div className="flex flex-col gap-3">{SUGGESTIONS.map((sug,idx)=><TaskCard key={idx} item={sug} isSuggestion={true}/>)}</div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-[#1c1c1e] p-1 rounded-full w-[220px] border border-[#2c2c2e]">
                  <button onClick={()=>setListView("events")} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${listView==="events"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>Events</button>
                  <button onClick={()=>setListView("reminders")} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${listView==="reminders"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>Reminders</button>
                </div>
                {showViewAllButton&&<button onClick={()=>setViewAll(!viewAll)} className="text-[#3b82f6] text-[14px] font-medium px-2 py-1 active:opacity-70 transition-opacity">{viewAll?"Collapse":"View All"}</button>}
              </div>
              <div className="flex flex-col gap-3">
                {displayedList.map((task,idx)=>{
                  const isLast=idx===displayedList.length-1
                  return <TaskCard key={task.id} item={task} isLastAndFaded={isLast&&!viewAll&&showViewAllButton}/>
                })}
              </div>
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

      {/* ── MODAL DE CREACIÓN / CONFIGURACIÓN ──────────────────── */}
      {configModalOpen&&(
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>{setConfigModalOpen(false);setActivePicker(null)}}/>
          <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#2c2c2e]">
            
            <div className="flex items-center justify-between mb-4 pt-1">
              <h3 className="text-white font-bold text-[24px] tracking-tight" style={{fontFamily:SFD}}>Create New</h3>
              <button onClick={()=>{setConfigModalOpen(false);setActivePicker(null)}} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70"><X className="w-5 h-5 text-[#8e8e93]"/></button>
            </div>
            
            <div className="flex bg-[#1c1c1e] p-1 rounded-full w-full mb-5 border border-[#2c2c2e]">
              <button onClick={()=>{setCreationMode("events");setEventType(EVENT_OPTIONS[0]);setActivePicker(null)}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="events"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>Event</button>
              <button onClick={()=>{setCreationMode("reminders");setEventType(REMINDER_OPTIONS[0]);setActivePicker(null)}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="reminders"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>Reminder</button>
            </div>
            
            <div className="overflow-y-auto flex-1 no-scrollbar pb-8 space-y-4">
              <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner border border-[#2c2c2e]">
                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("type")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3"><Sparkles className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Type</span></div>
                      <span className="text-[#8e8e93] text-[16px]">{eventType}</span>
                    </button>
                    {activePicker==="type"&&<div className="flex items-center justify-center py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask"><WheelPicker items={creationMode==="events"?EVENT_OPTIONS:REMINDER_OPTIONS} value={eventType} onChange={setEventType}/></div>}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between w-full p-4 border-b border-[#2c2c2e]">
                      <button onClick={()=>togglePicker("icon")} className="flex items-center gap-3 active:opacity-70">
                        {(()=>{const I=ICONS[taskIcon]||CalendarDays;return <I className="w-5 h-5" style={{color:ICON_COLORS[taskIcon]||"#ffffff"}}/>})()}
                        <span className="text-white text-[16px] font-medium">Title & Icon</span>
                      </button>
                      <input type="text" placeholder="Add title..." value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white"/>
                    </div>
                    {activePicker==="icon"&&<div className="grid grid-cols-6 gap-4 py-5 px-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95">
                      {Object.keys(ICONS).map(key=>{const IC=ICONS[key];const sel=taskIcon===key;return(
                        <button key={key} onClick={()=>{setTaskIcon(key);setActivePicker(null)}} className={`flex flex-col items-center justify-center transition-all ${sel?'scale-110':'opacity-70'}`}>
                          <IC className="w-6 h-6" style={{color:ICON_COLORS[key]}}/>
                          {sel&&<div className="w-1.5 h-1.5 rounded-full mt-2" style={{backgroundColor:ICON_COLORS[key]}}/>}
                        </button>
                      )})}
                    </div>}
                  </div>

                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("date")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3"><CalendarDays className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Date</span></div>
                      <span className="text-[#8e8e93] text-[16px]">{selMonth} {selDayNum}</span>
                    </button>
                    {activePicker==="date"&&<div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                      <WheelPicker items={months} value={selMonth} onChange={setSelMonth}/>
                      <WheelPicker items={days}   value={selDayNum} onChange={setSelDayNum}/>
                    </div>}
                  </div>

                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("time")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3"><Clock className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Time</span></div>
                      <span className="text-[#8e8e93] text-[16px]">{selHour}:{selMin}</span>
                    </button>
                    {activePicker==="time"&&<div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask">
                      <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h"/>
                      <span className="text-xl font-bold text-[#636366]">:</span>
                      <WheelPicker items={mins}  value={selMin}  onChange={setSelMin}  suffix="m"/>
                    </div>}
                  </div>

                  {eventType==="Schedule Email"&&<>
                    <div className="flex items-center justify-between w-full p-4">
                      <div className="flex items-center gap-3"><AtSign className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Recipient</span></div>
                      <input type="email" placeholder="client@ex.com" value={taskEmailRec} onChange={e=>setTaskEmailRec(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white"/>
                    </div>
                    <div className="flex flex-col w-full p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3"><Paperclip className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Attachments</span></div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#8e8e93] text-[14px]">{attachedFiles.length}/5</span>
                          <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden"/>
                          <button onClick={()=>fileInputRef.current?.click()} disabled={attachedFiles.length>=5} className="bg-[#2c2c2e] text-white px-3 py-1.5 rounded-full text-[13px] font-medium active:scale-95 disabled:opacity-50">+ Add</button>
                          {attachedFiles.length>0&&<button onClick={()=>setAttachedFiles([])} className="text-red-400 px-2 py-1.5 text-[13px]">Clear</button>}
                        </div>
                      </div>
                      {attachedFiles.length>0&&<div className="flex flex-wrap gap-2 mt-2">{attachedFiles.map((f,i)=><div key={i} className="flex items-center gap-1.5 bg-[#2c2c2e] px-2.5 py-1 rounded-md text-[11px] text-[#e4e4e7]"><span className="truncate max-w-[120px]">{f.name}</span><button onClick={()=>setAttachedFiles(p=>p.filter((_,j)=>j!==i))}><X className="w-3 h-3 text-[#8e8e93]"/></button></div>)}</div>}
                    </div>
                    <div className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20"><Mail className="w-3.5 h-3.5 text-[#0ea5e9] shrink-0"/><span className="text-[#0ea5e9] text-[11px]" style={{fontFamily:SF}}>Sent via Composio Gmail at scheduled time</span></div>
                  </>}

                  {eventType==="Drive Upload"&&<>
                    <div className="flex items-center justify-between w-full p-4">
                      <div className="flex items-center gap-3"><Folder className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Drive Folder</span></div>
                      <input type="text" placeholder="My Uploads" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white"/>
                    </div>
                    <div className="flex flex-col w-full p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3"><Paperclip className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Files</span></div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#8e8e93] text-[14px]">{attachedFiles.length}/5</span>
                          <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden"/>
                          <button onClick={()=>fileInputRef.current?.click()} disabled={attachedFiles.length>=5} className="bg-[#2c2c2e] text-white px-3 py-1.5 rounded-full text-[13px] font-medium active:scale-95 disabled:opacity-50">+ Add</button>
                          {attachedFiles.length>0&&<button onClick={()=>setAttachedFiles([])} className="text-red-400 px-2 py-1.5 text-[13px]">Clear</button>}
                        </div>
                      </div>
                      {attachedFiles.length>0&&<div className="flex flex-wrap gap-2 mt-2">{attachedFiles.map((f,i)=><div key={i} className="flex items-center gap-1.5 bg-[#2c2c2e] px-2.5 py-1 rounded-md text-[11px] text-[#e4e4e7]"><span className="truncate max-w-[120px]">{f.name}</span><button onClick={()=>setAttachedFiles(p=>p.filter((_,j)=>j!==i))}><X className="w-3 h-3 text-[#8e8e93]"/></button></div>)}</div>}
                    </div>
                    <div className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 rounded-xl bg-[#eab308]/10 border border-[#eab308]/20"><Folder className="w-3.5 h-3.5 text-[#eab308] shrink-0"/><span className="text-[#eab308] text-[11px]" style={{fontFamily:SF}}>Folder created in Google Drive via Composio</span></div>
                  </>}

                  {eventType==="Custom Event"&&<div className="flex items-center justify-between w-full p-4"><div className="flex items-center gap-3"><LinkIcon className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Meeting URL</span></div><input type="text" placeholder="https://..." value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-36 focus:outline-none focus:text-white"/></div>}
                  
                  {eventType==="Take Medication"&&<div className="flex items-center justify-between w-full p-4"><div className="flex items-center gap-3"><RefreshCcw className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Frequency</span></div><input type="text" placeholder="Every 8h" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white"/></div>}
                  
                  {(eventType==="Workout / Gym"||eventType==="Deep Work"||eventType==="Meal Time")&&<div className="flex items-center justify-between w-full p-4"><div className="flex items-center gap-3"><Type className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Config / Tag</span></div><input type="text" placeholder="e.g. Chest Day" value={extraConfig} onChange={e=>setExtraConfig(e.target.value)} className="bg-transparent text-right text-[#8e8e93] w-32 focus:outline-none focus:text-white"/></div>}
                  
                  <div className="flex flex-col">
                    <button onClick={()=>togglePicker("reminder")} className="flex items-center justify-between w-full p-4 active:bg-[#2c2c2e] rounded-2xl transition-colors">
                      <div className="flex items-center gap-3"><Bell className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Alert Offset</span></div>
                      <span className="text-[#8e8e93] text-[16px]">{selRemMin}m before</span>
                    </button>
                    {activePicker==="reminder"&&<div className="flex items-center justify-center gap-6 py-4 bg-[#0a0a0a] rounded-[20px] my-1 mx-2 animate-in fade-in zoom-in-95 wheel-mask"><WheelPicker items={mins} value={selRemMin} onChange={setSelRemMin} suffix="m"/></div>}
                  </div>
                </div>
              </div>

              <div className="bg-[#1c1c1e] rounded-[28px] p-4 flex flex-col gap-2 border border-[#2c2c2e]">
                <div className="flex items-center gap-3 pl-2"><AlignLeft className="w-[20px] h-[20px] text-[#8e8e93]"/><span className="text-white text-[16px] font-medium">Description</span></div>
                <textarea rows={3} placeholder="Optional notes or details..." value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} className="w-full bg-transparent text-white placeholder:text-[#636366] resize-none focus:outline-none p-2 text-[15px] leading-relaxed" style={{fontFamily:SF}}/>
              </div>

              <div className="mt-4 pb-4">
                <button onClick={handleSaveConfig} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px] disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading&&<Loader2 className="w-5 h-5 animate-spin"/>}
                  Save {creationMode==="events"?"Event":"Reminder"}
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
