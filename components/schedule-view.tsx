"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { 
  CalendarDays, Bell, Send, Clock, ChevronRight, 
  Plus, Loader2, Pencil, Search, X, Trash2, TrendingUp, Sparkles, 
  Mail, AtSign, Folder, MessageSquare, ChevronDown, Paperclip,
  CheckCircle2, AlertCircle, Globe, Zap, Check, Pin
} from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Estilos Globales para el Efecto Ripple ──
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
`

const createRipple = (event: React.PointerEvent<any>) => {
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

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
  is_pinned?: boolean;
  is_high_priority?: boolean;
}

// ── 1. NUEVA ARQUITECTURA DE OPCIONES (AI AUTOMATIONS) ──
const AI_AUTOMATIONS = ["Deep Research", "Group Summary", "Trend Monitor", "Channel Auto-Post", "Schedule Email"]
const SMART_REMINDERS = ["AI Smart Alert", "Drive Backup", "Personal Reminder"]

const ICONS: Record<string, React.ElementType> = {
  Sparkles, MessageSquare, TrendingUp, Send, Mail, Bell, Folder, CalendarDays
}

const PREDEFINED_TYPES: Record<string, string> = {
  "Deep Research": "Sparkles",
  "Group Summary": "MessageSquare",
  "Trend Monitor": "TrendingUp",
  "Channel Auto-Post": "Send",
  "Schedule Email": "Mail",
  "AI Smart Alert": "Bell",
  "Drive Backup": "Folder",
  "Personal Reminder": "Bell"
}

const ICON_COLORS: Record<string, string> = {
  Sparkles: "#a855f7", MessageSquare: "#22c55e", TrendingUp: "#3b82f6", 
  Send: "#14b8a6", Mail: "#0ea5e9", Bell: "#f43f5e", Folder: "#eab308", CalendarDays: "#3b82f6"
}

// ── DATOS ESTÁTICOS ──
const TZ_LIST: { label: string; value: string; offset: string }[] = [
  { label: "Pacific Time (US)", value: "America/Los_Angeles", offset: "UTC−8" },
  { label: "Mexico City", value: "America/Mexico_City", offset: "UTC−6" },
  { label: "Eastern Time (US)", value: "America/New_York", offset: "UTC−5" },
  { label: "London / GMT", value: "Europe/London", offset: "UTC+0" },
  { label: "Central Europe", value: "Europe/Paris", offset: "UTC+1" },
  { label: "Tokyo", value: "Asia/Tokyo", offset: "UTC+9" },
]

const ONBOARDING_CARDS_DATA = [
  { id: 1, title: "AI Automations", icon: Sparkles, color: "#ffffff", bgGradient: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(5,5,5,0) 70%)", cardGradient: "linear-gradient(145deg, #9333ea, #581c87)", desc: "Trigger Deep Research, summaries and agents to work for you." },
  { id: 2, title: "Smart Alerts", icon: Bell, color: "#ffffff", bgGradient: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, rgba(5,5,5,0) 70%)", cardGradient: "linear-gradient(145deg, #e11d48, #881337)", desc: "Get notified contextually. Less noise, more important signals." },
]

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// ── COMPONENTES AUXILIARES ──

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

// IconFlat para la UI de Settings
function IconFlat({ icon: Icon, color }: { icon: any, color: string }) {
  return (
    <div className="shrink-0 flex items-center justify-center relative z-10" style={{ width: "28px", height: "28px", borderRadius: "6.5px", backgroundColor: color, color: "white" }}>
      <Icon className="w-[16px] h-[16px]" strokeWidth={2.2} />
    </div>
  )
}

function WheelPicker({ items, value, onChange, suffix="" }: {items:string[];value:string;onChange:(v:string)=>void;suffix?:string}) {
  const ref = useRef<HTMLDivElement>(null)
  const h = 40
  return (
    <div className="relative h-[120px] w-full flex-1">
      <div className="absolute top-1/2 left-0 right-0 h-[40px] -translate-y-1/2 bg-[#1c1c1e] rounded-xl pointer-events-none" />
      <div ref={ref} onScroll={()=>{ if(!ref.current) return; const i=Math.round(ref.current.scrollTop/h); if(items[i]&&items[i]!==value) onChange(items[i]) }}
        className="h-[120px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar flex flex-col items-center relative z-10" style={{scrollBehavior:"smooth"}}>
        <div style={{minHeight:`${h}px`}} className="w-full shrink-0"/>
        {items.map((item,i)=>{
          const sel=item===value
          return <div key={i} className={`h-[40px] shrink-0 w-full flex items-center justify-center snap-center transition-all duration-200 ${sel?'text-white text-[18px] font-bold':'text-[#636366] text-[16px] font-medium'}`} style={{fontFamily:SFD}}>
            {item}{suffix&&sel?<span className="text-[14px] ml-1 text-[#8e8e93] font-medium">{suffix}</span>:""}
          </div>
        })}
        <div style={{minHeight:`${h}px`}} className="w-full shrink-0"/>
      </div>
    </div>
  )
}

export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks, setTasks] = useState<ScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string|"All">("All")
  
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTZModal, setShowTZModal] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [activePicker, setActivePicker] = useState<string|null>(null)
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null)
  
  // States para el Modal (Settings Style)
  const [creationMode, setCreationMode] = useState<"automations"|"reminders">("automations")
  const [eventType, setEventType] = useState("Deep Research")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [extraConfig, setExtraConfig] = useState("") // Para "Target ID" o "Keyword"
  
  const _initNow = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000)
    return { h: d.getHours().toString().padStart(2,"0"), m: d.getMinutes().toString().padStart(2,"0"), mo: months[d.getMonth()], day: d.getDate().toString() }
  }, [])
  const [selHour, setSelHour] = useState(_initNow.h)
  const [selMin, setSelMin] = useState(_initNow.m)
  const [selMonth, setSelMonth] = useState(_initNow.mo)
  const [selDayNum, setSelDayNum] = useState(_initNow.day)

  const hours = Array.from({length:24},(_,i)=>i.toString().padStart(2,'0'))
  const mins  = Array.from({length:60},(_,i)=>i.toString().padStart(2,'0'))
  const days  = Array.from({length:31},(_,i)=>(i+1).toString())

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500)
  },[])

  useEffect(() => {
    const onboarded = localStorage.getItem("xblum_onboarded")
    if (!onboarded) setShowOnboarding(true)
  }, [])

  const fetchItems = useCallback(async()=>{
    setLoadingItems(true)
    try {
      const res = await fetch(`${API_BASE}/api/schedule_list`, {headers:{"x-init-data":getTg()?.initData??""}})
      if(res.ok){ const d = await res.json(); if(d.success&&Array.isArray(d.items)) setTasks(d.items) }
    } catch(e){} finally { setLoadingItems(false) }
  },[])

  useEffect(()=>{ fetchItems() },[fetchItems])

  // Comportamiento Dinámico del Modal
  useEffect(()=>{
    if(eventType==="Deep Research") setTaskTitle("Deep Research")
    else if(eventType==="Group Summary") setTaskTitle("Group Summary")
    else if(eventType==="Trend Monitor") setTaskTitle("Monitor Trend")
    else if(eventType==="Channel Auto-Post") setTaskTitle("Auto-Post")
    else if(eventType==="Schedule Email") setTaskTitle("Send Email")
    else setTaskTitle(eventType)
    
    setExtraConfig("")
    setTaskDesc("")
  },[eventType])

  const filteredTasks = useMemo(()=> {
    if(selectedDate==="All") return tasks
    return tasks.filter(t => { try{ return new Date(t.fire_at).toDateString()===selectedDate }catch{return false} })
  },[tasks,selectedDate])

  const activeAutomations = filteredTasks.filter(t=>t.is_event)
  const activeReminders = filteredTasks.filter(t=>!t.is_event)

  function togglePicker(p:string){ setActivePicker(ap=>ap===p?null:p) }

  function buildFireAt(){
    const mi = months.indexOf(selMonth)
    const now = new Date()
    const localStr = `${now.getFullYear()}-${(mi+1).toString().padStart(2,"0")}-${selDayNum.padStart(2,"0")}T${selHour.padStart(2,"0")}:${selMin.padStart(2,"0")}:00`
    let fireDate = new Date(localStr)
    if (fireDate.getTime() <= Date.now()) fireDate = new Date(fireDate.getTime() + 24 * 60 * 60 * 1000)
    return fireDate.toISOString() 
  }

  async function handleSaveConfig(){
    setLoading(true)
    try {
      const data=await apiPost("/api/schedule_create",{
        title: taskTitle || eventType, 
        event_type: eventType, 
        icon_name: PREDEFINED_TYPES[eventType] || "Sparkles",
        color: ICON_COLORS[PREDEFINED_TYPES[eventType]] || "#3b82f6", 
        description: taskDesc, 
        extra: extraConfig,
        is_event: creationMode==="automations",
        fire_at: buildFireAt(), 
        alert_offset_min: 0
      })
      if(data.success){
        showToast("Automation Scheduled ✅","success")
        await fetchItems(); setConfigModalOpen(false); setActivePicker(null)
      } else { showToast("Error scheduling","error") }
    } catch(e:any){ showToast(`Error: ${e.message}`,"error") }
    finally{ setLoading(false) }
  }

  // CALENDARIO (Screenshot Style)
  const calendarDays = useMemo(()=>{
    const arr=[]; const today=new Date(); const sow=new Date(today)
    sow.setDate(today.getDate()-(today.getDay()||7)+1)
    for(let i=0;i<7;i++){
      const d=new Date(sow); d.setDate(sow.getDate()+i)
      arr.push({full:d.toDateString(), label:d.toLocaleDateString('en-US',{weekday:'narrow'}), num:d.getDate().toString(), isToday:d.toDateString()===today.toDateString()})
    }
    return arr
  },[])

  const currentGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if(hr < 12) return "Good morning."
    if(hr < 18) return "Good afternoon."
    return "Good evening."
  }, [])

  // ── RENDER PRINCIPAL ──
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0a0a0a] text-white select-none overflow-hidden relative">
      <style>{RIPPLE_STYLE}</style>

      {/* FONDO BOKEH (Recreación del Screenshot) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute -top-[10%] -right-[15%] w-[80%] h-[50%] rounded-full opacity-[0.35] blur-[80px]" style={{ background: 'radial-gradient(circle, #a3e635 0%, #10b981 60%, transparent 80%)' }} />
         <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] rounded-full opacity-[0.2] blur-[90px]" style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }} />
      </div>

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      {/* CONTENIDO PRINCIPAL SCROLLABLE */}
      <div className="relative z-10 flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar pt-10 px-6">
        
        {/* Header Screenshot Style */}
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full border-[3.5px] border-[#22c55e] flex items-center justify-center text-[#22c55e] font-bold text-[14px]">68</div>
           <h1 className="text-[34px] font-bold text-white tracking-tight leading-none">
             <span>{new Date().getDate()}</span> <span className="text-[#a1a1aa] font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
           </h1>
        </div>

        {/* Calendario Semanal */}
        <div className="flex justify-between items-center mt-8 px-1">
          {calendarDays.map((day,idx)=>{
            const isSel = selectedDate === day.full || (selectedDate==="All" && day.isToday)
            return (
              <button key={idx} onClick={()=>setSelectedDate(day.full)} className={`flex flex-col items-center justify-center relative w-11 h-14 rounded-[14px] transition-all ${isSel ? "bg-[#1f2923] border border-[#22c55e]/20" : "bg-transparent"}`}>
                <span className={`text-[12px] font-medium mb-1 ${isSel?"text-[#a1a1aa]":"text-[#636366]"}`} style={{fontFamily:SF}}>{day.label}</span>
                <span className={`text-[16px] font-bold ${isSel?"text-white":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>{day.num}</span>
                {day.isToday && <div className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </button>
            )
          })}
        </div>

        {/* Greeting Text */}
        <div className="mt-8 text-[32px] font-medium leading-[1.2] tracking-[-0.02em]" style={{fontFamily: SFD}}>
          <span className="text-[#a1a1aa]">{currentGreeting}</span><br/>
          <span className="text-[#a1a1aa]">You have </span>
          <span className="text-white flex items-center gap-1.5 inline-flex"><Sparkles className="w-6 h-6 text-white"/> {activeAutomations.length} automations</span>,<br/>
          <span className="text-white flex items-center gap-1.5 inline-flex"><Bell className="w-6 h-6 text-white"/> {activeReminders.length} alerts</span> <span className="text-[#a1a1aa]">today.</span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 mt-6">
           <button onClick={()=>setSelectedDate("All")} className="px-4 py-1.5 rounded-full bg-[#1c1c1e] text-[#a1a1aa] text-[14px] font-medium flex items-center gap-2 border border-white/5 active:bg-white/10 transition-colors">
              <span className="text-[12px]">🌙</span> All
           </button>
           <button className="px-4 py-1.5 rounded-full bg-[#1c1c1e] text-[#a1a1aa] text-[14px] font-medium flex items-center gap-2 border border-white/5 active:bg-white/10 transition-colors">
              <span className="text-[12px]">✨</span> Automations
           </button>
        </div>

        {/* Task List (Screenshot Glassmorphism Cards) */}
        <div className="mt-8 flex flex-col gap-4">
          {loadingItems ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#8e8e93]"/></div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-[#636366] text-[15px] font-medium">No tasks found for this day.</div>
          ) : (
            filteredTasks.map(item => {
              const IconComp = ICONS[item.icon_name] || Sparkles
              return (
                <div key={item.id} className="relative flex items-center gap-4 bg-transparent p-1">
                   {/* Left Icon with small badge */}
                   <div className="relative shrink-0">
                      <div className="w-[46px] h-[46px] rounded-[14px] bg-[#1a211e] flex items-center justify-center">
                         <IconComp className="w-6 h-6 text-[#22c55e]" />
                      </div>
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-[#111111] rounded-full flex items-center justify-center border border-[#22c55e]/50">
                         <ChevronRight className="w-3 h-3 text-[#22c55e]" />
                      </div>
                   </div>
                   
                   {/* Text Block */}
                   <div className="flex flex-col flex-1 truncate">
                      <p className="text-[15px] text-white font-medium truncate" style={{fontFamily: SF}}>
                        {item.title} <span className="text-[#8e8e93] font-normal">{item.extra ? `for ${item.extra}` : ''}</span>
                      </p>
                      <p className="text-[#636366] text-[14px] truncate" style={{fontFamily: SF}}>
                        {item.description || (item.is_event ? "Scheduled automation" : "Reminder")}
                      </p>
                   </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* FAB Botón Flotante Inferior */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
         <button 
            onClick={() => { setConfigModalOpen(true); setCreationMode("automations"); }}
            className="w-14 h-14 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center shadow-[0_10px_30px_rgba(163,230,53,0.25)] active:scale-90 transition-transform"
         >
            <Plus className="w-6 h-6 text-white" />
         </button>
      </div>

      {/* ── MODAL DE CREACIÓN (Settings-view Style) ── */}
      {configModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          {/* Fondo oscuro con blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500 ease-out" 
            onClick={() => {setConfigModalOpen(false); setActivePicker(null)}}
          />
          
          {/* Contenedor principal del Modal */}
          <div className="relative w-full rounded-t-[24px] animate-in slide-in-from-bottom duration-400 max-h-[90vh] flex flex-col"
               style={{ background: "#111111", borderTop: "1px solid #1c1c1e" }}>
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1c1c1e" }}>
              <button
                onClick={() => {setConfigModalOpen(false); setActivePicker(null)}}
                onPointerDown={createRipple}
                className="relative overflow-hidden w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
                style={{ background: "#1c1c1e" }}>
                <X className="w-5 h-5 text-[#8e8e93] relative z-10" />
              </button>
              <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                New Automation
              </h2>
              
              <button
                onClick={handleSaveConfig}
                onPointerDown={createRipple}
                disabled={loading || !taskTitle.trim()}
                className="relative overflow-hidden px-4 py-1.5 bg-white disabled:opacity-40 rounded-full text-black font-bold active:scale-95 transition-transform"
                style={{ fontSize: "13px", fontFamily: SF }}>
                <span className="relative z-10">{loading ? "Saving..." : "Save"}</span>
              </button>
            </div>

            {/* Toggle Automations / Reminders */}
            <div className="px-5 pt-4 pb-2 shrink-0">
               <div className="flex bg-[#1c1c1e] p-1 rounded-full w-full border border-white/5 relative z-10">
                  <button onClick={()=>{setCreationMode("automations");setEventType(AI_AUTOMATIONS[0])}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="automations"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>✨ Automations</button>
                  <button onClick={()=>{setCreationMode("reminders");setEventType(SMART_REMINDERS[0])}} className={`flex-1 py-1.5 rounded-full text-[14px] font-medium transition-all ${creationMode==="reminders"?"bg-white text-black shadow-sm":"text-[#8e8e93]"}`} style={{fontFamily:SF}}>🔔 Reminders</button>
               </div>
            </div>

            {/* Cuerpo scrolleable del Modal */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar pb-32">
              
              {/* Título de la Tarea */}
              <input 
                autoFocus
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Automation title..."
                className="w-full bg-transparent text-[22px] font-bold text-white outline-none placeholder:text-[#555558] mb-2 pl-2"
                style={{ fontFamily: SFD }}
              />

              {/* Bloque de Opciones (Estilo Settings) */}
              <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] pb-2">
                
                {/* Fila: Action Type */}
                <button 
                  onClick={() => togglePicker("type")} 
                  onPointerDown={createRipple}
                  className="w-full relative overflow-hidden z-10 flex items-center justify-between px-4 py-3.5 active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <IconFlat icon={ICONS[PREDEFINED_TYPES[eventType]] || Sparkles} color="#60a5fa" />
                    <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF }}>Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>{eventType}</span>
                    <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
                  </div>
                </button>

                {activePicker === "type" && (
                   <div className="px-4 pb-3">
                      <div className="flex flex-col bg-[#1c1c1e] rounded-[16px] border border-white/5 overflow-hidden">
                         {(creationMode === "automations" ? AI_AUTOMATIONS : SMART_REMINDERS).map((opt) => (
                           <button key={opt} onClick={() => { setEventType(opt); setActivePicker(null); }} className="w-full flex items-center justify-between p-3.5 border-b border-[#2c2c2e] last:border-0 active:bg-white/5">
                              <span className="text-[15px] text-white" style={{fontFamily:SF}}>{opt}</span>
                              {eventType === opt && <Check className="w-4 h-4 text-[#60a5fa]" strokeWidth={3}/>}
                           </button>
                         ))}
                      </div>
                   </div>
                )}

                {/* Fila: Fecha */}
                <button 
                  onClick={() => togglePicker("date")} 
                  onPointerDown={createRipple}
                  className="w-full relative overflow-hidden z-10 flex items-center justify-between px-4 py-3.5 active:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                     <IconFlat icon={CalendarDays} color="#34c759" />
                     <span className="text-[16px] font-medium text-white" style={{ fontFamily: SF }}>Schedule Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8e8e93] text-[15px]" style={{ fontFamily: SF }}>{selMonth} {selDayNum} - {selHour}:{selMin}</span>
                    <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
                  </div>
                </button>

                {activePicker === "date" && (
                   <div className="flex items-center justify-center gap-4 py-4 px-4 bg-[#1c1c1e] mx-4 rounded-[16px] border border-white/5 mb-3">
                      <WheelPicker items={months} value={selMonth} onChange={setSelMonth}/>
                      <WheelPicker items={days} value={selDayNum} onChange={setSelDayNum}/>
                      <WheelPicker items={hours} value={selHour} onChange={setSelHour} suffix="h"/>
                      <WheelPicker items={mins} value={selMin} onChange={setSelMin} suffix="m"/>
                   </div>
                )}
              </div>

              {/* Dynamic Field (Extra Config) */}
              {(eventType === "Group Summary" || eventType === "Channel Auto-Post" || eventType === "Trend Monitor") && (
                 <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] mt-4 relative z-10">
                    <div className="flex flex-col w-full px-4 py-3 text-left">
                       <h2 className="text-[#60a5fa] text-[14px] font-medium mb-1" style={{ fontFamily: SF }}>
                          {eventType === "Trend Monitor" ? "Keyword / Token" : "Target Username"}
                       </h2>
                       <input 
                         value={extraConfig}
                         onChange={(e) => setExtraConfig(e.target.value)}
                         placeholder={eventType === "Trend Monitor" ? "e.g. $SOL, CVE-2026..." : "@channel_name"}
                         className="bg-transparent text-[16px] font-medium text-white w-full outline-none placeholder:text-[#555558]"
                         style={{ fontFamily: SF }}
                       />
                    </div>
                 </div>
              )}

              {/* Textarea Inteligente (Idéntico al de Feedback en Settings) */}
              {eventType !== "Trend Monitor" && (
                <div className="pt-2">
                  <h3 className="text-[#8e8e93] text-[14px] font-medium mb-2 ml-1" style={{ fontFamily: SF }}>
                    {eventType === "Group Summary" ? "Instructions" : eventType === "Deep Research" ? "Research Prompt" : "Details / Prompt"}
                  </h3>
                  <textarea
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    placeholder={
                      eventType === "Group Summary" ? "e.g. Resume el chat enfocado en decisiones técnicas..." :
                      eventType === "Deep Research" ? "e.g. Investiga vulnerabilidades del kernel Linux..." :
                      "Give instructions to the AI..."
                    }
                    className="w-full min-h-[140px] p-4 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none transition-colors"
                    style={{ background: "#1c1c1e", border: "1px solid #1c1c1e", fontSize: "15px", fontFamily: SF }}
                    onFocus={e => (e.target.style.borderColor = "#48484a")}
                    onBlur={e => (e.target.style.borderColor = "transparent")}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
