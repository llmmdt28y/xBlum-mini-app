"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { 
  Clock, X, Loader2, CheckCircle2, AlertCircle, 
  Trash2, ChevronDown
} from "lucide-react"
import React from "react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// ── Estilos Globales y Glow ──
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Tipos ──
interface ScheduleItem {
  id: number;
  title: string; 
  description: string; 
  repeat_type: string; 
  fire_at: string; 
  extra: string; 
}

// ── Tareas Prediseñadas (Rotativas) ──
const MOCK_TASKS = [
  {
    title: "Resumen Diario de Tecnología",
    frequency: "Daily", time: "08:00", dayOfWeek: "Mon",
    prompt: "Resume los desarrollos más importantes en IA y Tecnología de las últimas 24 horas, incluyendo nuevas herramientas, actualizaciones y anuncios. Prioriza lanzamientos de modelos, nuevos artículos y proyectos de código abierto e incluye enlaces a fuentes de búsquedas web. Organiza la información para que sea fácilmente digerible y legible."
  },
  {
    title: "Rendimiento de Acciones",
    frequency: "Daily", time: "16:00", dayOfWeek: "Mon",
    prompt: "Dame las últimas actualizaciones sobre $TON, $BTC, $NVDA, $PLTR, $ETH, incluyendo precio actual, cambios recientes y proyecciones. Analiza el sentimiento, indicadores de mercado y posibles razones de los movimientos. Organiza la información para que sea fácilmente digerible y legible."
  },
  {
    title: "Pronóstico del Clima y Ropa",
    frequency: "Daily", time: "07:00", dayOfWeek: "Mon",
    prompt: "Investiga el clima de hoy para mi ubicación, proporcionando probabilidad de lluvia, temperaturas máximas/mínimas y una recomendación práctica sobre cómo vestirme o qué llevar (paraguas, abrigo)."
  },
  {
    title: "Reflexión Estoica Nocturna",
    frequency: "Daily", time: "21:30", dayOfWeek: "Mon",
    prompt: "Proporciona una cita estoica poderosa para cerrar el día y una pregunta de introspección profunda de un párrafo para reflexionar antes de dormir."
  },
  {
    title: "Resumen Semanal Cripto",
    frequency: "Weekly", time: "18:00", dayOfWeek: "Fri",
    prompt: "Haz un análisis completo del movimiento semanal del top 10 criptomonedas. Señala cuáles subieron más, cuáles bajaron, y las noticias clave que definieron el mercado esta semana."
  },
  {
    title: "Coaching de Metas",
    frequency: "Weekly", time: "10:00", dayOfWeek: "Sun",
    prompt: "Genera 3 preguntas de coaching de alto rendimiento para evaluar mi productividad de la semana que termina y ayudarme a priorizar estratégicamente la que comienza."
  }
]

// ── Componentes UI ──
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
  return (
    <div className="flex items-center">
      <Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor="#ffffff" />
    </div>
  )
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

// ── Opciones para Dropdowns ──
const FREQ_OPTIONS = [
  { value: "Once", label: "Una vez" },
  { value: "Daily", label: "Diariamente" },
  { value: "Weekly", label: "Semanalmente" },
  { value: "Monthly", label: "Mensualmente" }
]

const DOW_OPTIONS = [
  { value: "Mon", label: "Lunes" },
  { value: "Tue", label: "Martes" },
  { value: "Wed", label: "Miércoles" },
  { value: "Thu", label: "Jueves" },
  { value: "Fri", label: "Viernes" },
  { value: "Sat", label: "Sábado" },
  { value: "Sun", label: "Domingo" }
]

// ── Componente Principal ──
export function ScheduleView() {
  const { setCurrentView } = useApp()
  const [tasks, setTasks] = useState<ScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null)
  const [suggestedTasks, setSuggestedTasks] = useState<typeof MOCK_TASKS>([])

  // ── Lógica del Calendario ──
  const monthStr = new Date().toLocaleDateString('en-US',{month:'short'}).toUpperCase()
  const yearStr  = new Date().getFullYear().toString()
  const [selectedDate, setSelectedDate] = useState<string|"All">("All")
  
  const calendarDays = useMemo(()=>{
    const arr=[]; const today=new Date(); const sow=new Date(today)
    sow.setDate(today.getDate()-(today.getDay()||7)+1)
    for(let i=0;i<7;i++){
      const d=new Date(sow); d.setDate(sow.getDate()+i)
      arr.push({full:d.toDateString(),label:d.toLocaleDateString('en-US',{weekday:'narrow'}),num:d.getDate().toString(),isToday:d.toDateString()===today.toDateString()})
    }
    return arr
  },[])

  const filteredTasks = useMemo(()=>{
    if(selectedDate==="All") return tasks
    return tasks.filter(t => { try{ return new Date(t.fire_at).toDateString() === selectedDate }catch{return false} })
  }, [tasks, selectedDate])

  // Contadores para la barra flotante
  const dailyTasksCount = tasks.filter(t => t.repeat_type === "Daily").length
  const remainingDaily = Math.max(0, 2 - dailyTasksCount)
  const ringOffset = 88 - (dailyTasksCount / 2) * 88

  // Estados del Formulario
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

  // Fetch Items & Mezclar Prompts Sugeridos
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
      if (activeDropdown) setActiveDropdown(null)
      else if (isCreating) setIsCreating(false)
      else { setCurrentView("home" as any); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return ()=>tg.BackButton.offClick(handleBack)
  },[isCreating, activeDropdown, setCurrentView])

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
      showToast("Título y Prompt son obligatorios.", "error")
      return
    }

    const totalTasks = tasks.length
    if (totalTasks >= 10) {
      showToast("Has alcanzado el límite de 10 tareas activas.", "error")
      return
    }
    if (frequency === "Daily" && dailyTasksCount >= 2) {
      showToast("Solo puedes tener 2 tareas diarias activas simultáneamente.", "error")
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
        showToast("Tarea programada exitosamente ✨","success")
        await fetchItems()
        setIsCreating(false)
        resetForm()
      } else { showToast(data.message||"No se pudo guardar.","error") }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(e:any){ showToast(`Error: ${e.message}`,"error") }
    finally{ setIsSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      const data = await apiPost("/api/schedule_delete",{item_id:id})
      if(data.success){ setTasks(p=>p.filter(t=>t.id!==id)); showToast("Tarea eliminada.","success") }
    } catch(e) { console.error(e) }
  }

  const formatFrequencyText = (item: ScheduleItem) => {
    let t = "00:00"; let day = ""
    try {
      const ex = JSON.parse(item.extra || "{}")
      if (ex.time) t = ex.time
      if (ex.dayOfWeek) day = ex.dayOfWeek
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {}

    const [h, m] = t.split(":")
    let hh = parseInt(h)
    const ampm = hh >= 12 ? "p.m." : "a.m."
    hh = hh % 12 || 12
    const timeStr = `${hh}:${m} ${ampm}`

    switch (item.repeat_type) {
      case "Once": return `Una vez a las ${timeStr}`
      case "Daily": return `Diariamente a las ${timeStr}`
      case "Weekly": return `Los ${DOW_OPTIONS.find(d=>d.value===day)?.label || day} a las ${timeStr}`
      case "Monthly": return `Mensualmente a las ${timeStr}`
      default: return `A las ${timeStr}`
    }
  }

  const GrokTaskCard = ({ item }: { item: ScheduleItem }) => {
    return (
      <div className="w-full bg-[#111111] rounded-[20px] p-4 flex flex-col gap-2.5 border border-white/5 relative group shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            <span className="text-white text-[16px] font-bold tracking-tight" style={{ fontFamily: SFD }}>
              {item.title}
            </span>
          </div>
          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#555558] hover:text-[#ff453a] transition-colors active:scale-90">
             <Trash2 className="w-[18px] h-[18px]"/>
          </button>
        </div>
        <span className="text-[#8e8e93] text-[14px] font-medium -mt-1" style={{ fontFamily: SF }}>
          {formatFrequencyText(item)}
        </span>
        <p className="text-[#636366] text-[14px] leading-relaxed line-clamp-2" style={{ fontFamily: SF }}>
          {item.description}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#000000] text-white select-none overflow-hidden relative">
      <style>{RIPPLE_STYLE}</style>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* ── Calendario Superior ── */}
      <div className="pt-[calc(var(--tg-safe-area-inset-top,24px)+20px)] relative z-10 flex flex-col">
        {/* Mes y Año */}
        <div className="flex justify-center items-end gap-1">
          <span className="text-white text-[22px] font-bold" style={{fontFamily:SFD}}>{monthStr}</span>
          <span className="text-[#8e8e93] text-[22px] font-bold opacity-70" style={{fontFamily:SFD}}>{yearStr}</span>
        </div>

        {/* Semanal */}
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

      {/* ── Título y Lista de Tareas ── */}
      <div className="px-5 mt-4">
        <h1 className="text-[28px] font-bold text-white tracking-tight" style={{ fontFamily: SFD }}>Tasks</h1>
      </div>

      <div className="px-5 mt-3 pb-32 flex flex-col gap-4 overflow-y-auto no-scrollbar relative z-10 flex-1">
        {loadingItems ? (
           <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#555558]"/></div>
        ) : filteredTasks.length === 0 ? (
          
          <div className="grid grid-cols-2 gap-3 mt-1">
             {suggestedTasks.map((mock, idx) => (
                <div key={idx} onClick={() => openMockCard(mock)} className="w-full bg-[#111111] rounded-[20px] p-4 flex flex-col gap-1.5 border border-white/5 cursor-pointer active:bg-white/5 transition-colors shadow-sm">
                   <Clock className="w-[16px] h-[16px] text-white shrink-0 mb-1" strokeWidth={2.5} />
                   <span className="text-white text-[14px] font-bold tracking-tight leading-tight line-clamp-2" style={{ fontFamily: SFD }}>
                     {mock.title}
                   </span>
                   <span className="text-[#8e8e93] text-[12px] font-medium" style={{ fontFamily: SF }}>
                     {mock.frequency === 'Daily' ? 'Diario' : 'Semanal'}
                   </span>
                   <p className="text-[#636366] text-[12px] leading-snug line-clamp-3 mt-1" style={{ fontFamily: SF }}>
                     {mock.prompt}
                   </p>
                </div>
             ))}
          </div>

        ) : (
          filteredTasks.map(t => <GrokTaskCard key={t.id} item={t} />)
        )}
      </div>

      {/* ── Barra Flotante Inferior (Bottom Bar) ── */}
      <div className="fixed left-4 right-4 z-40 p-2 rounded-full flex items-center justify-between" 
           style={{ ...greyGlowStyle, bottom: "calc(var(--tg-safe-area-inset-bottom, 16px) + 16px)" }}>
        
        <div className="flex items-center gap-3 pl-2">
          {/* Anillo de Progreso SVG */}
          <div className="relative w-[34px] h-[34px] flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#2c2c2e" strokeWidth="4.5" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeDasharray="88" strokeDashoffset={ringOffset} strokeLinecap="round" className="transition-all duration-700" />
            </svg>
          </div>
          <div className="flex flex-col -mt-0.5">
            <span className="text-white text-[14px] font-bold tracking-tight" style={{fontFamily: SF}}>
              Quedan {remainingDaily} tareas diarias
            </span>
            <span className="text-[#8e8e93] text-[12.5px]" style={{fontFamily: SF}}>
              Actual: {dailyTasksCount}/2 tareas diarias activas
            </span>
          </div>
        </div>

        <button 
          onClick={() => {resetForm(); setIsCreating(true)}} 
          className="bg-white text-black px-5 h-[38px] flex items-center justify-center rounded-full font-bold text-[14px] active:scale-95 transition-transform" 
          style={{fontFamily: SF}}
        >
          Crear tarea
        </button>
      </div>

      {/* ── Modal de Creación Plana ── */}
      {isCreating && (
        <div className="absolute inset-0 z-[60] bg-[#000000] flex flex-col animate-in slide-in-from-bottom duration-300">
          
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
            
            <ExpandingInput label="Title" maxLength={60} value={title} onChange={setTitle} placeholder="Ej. Resumen Diario" />

            <div className="flex flex-col gap-5">
               <DropdownSelect 
                 label="Frequency"
                 value={frequency}
                 options={FREQ_OPTIONS}
                 isOpen={activeDropdown === 'frequency'}
                 onToggle={() => setActiveDropdown(activeDropdown === 'frequency' ? null : 'frequency')}
                 onSelect={setFrequency}
               />

               {frequency === "Once" && (
                 <ExpandingInput label="Date" type="date" value={specificDate} onChange={setSpecificDate} />
               )}

               {frequency === "Weekly" && (
                 <DropdownSelect 
                   label="Day of Week"
                   value={dayOfWeek}
                   options={DOW_OPTIONS}
                   isOpen={activeDropdown === 'dayOfWeek'}
                   onToggle={() => setActiveDropdown(activeDropdown === 'dayOfWeek' ? null : 'dayOfWeek')}
                   onSelect={setDayOfWeek}
                 />
               )}

               {frequency === "Monthly" && (
                 <ExpandingInput label="Day of Month" type="number" min="1" max="31" value={dayOfMonth} onChange={setDayOfMonth} />
               )}

               <ExpandingInput label="Time" type="time" value={time} onChange={setTime} />
            </div>

            <ExpandingInput label="Prompt" maxLength={500} value={prompt} onChange={setPrompt} placeholder="Escribe las instrucciones exactas para la IA..." isTextArea />

            <Section>
               <Row label="Push notifications" rightNode={<SwitchNode on={pushEnabled} onToggle={()=>setPushEnabled(!pushEnabled)} />} />
               <Row label="Email notifications" rightNode={<SwitchNode on={emailEnabled} onToggle={()=>setEmailEnabled(!emailEnabled)} />} last />
            </Section>

          </div>
        </div>
      )}
    </div>
  )
}
