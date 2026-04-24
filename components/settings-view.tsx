"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { ChevronRight, Check, Globe, Bot, User, Lock, Database, FileText, Shield, MessageSquare, ChevronDown, X, ExternalLink, AlertCircle, Trash2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const MODEL_LOGO: Record<string, string> = {
  "Grok 4.1":      "/grok.png",
  "GPT-5.4":       "/gpt.png",
  "GPT-5.2":       "/gpt.png",
}

const MODELS: {
  name: ModelName | string;
  desc: string
  tag: string | null; 
  tagColor: string
  proOnly: boolean;
  initial: string
  tagStyle?: string
}[] = [
  { 
    name:"Grok 4.1",      
    desc:"Most capable · no cooldown",         
    tag:"New", 
    tagColor:"bg-[#3b82f6] text-white", 
    tagStyle: "rounded-md", // Estilo más cuadrado como pediste
    proOnly:false, 
    initial:"G" 
  },
  { 
    name:"GPT-5.4",       
    desc:"OpenAI latest · Pro only",            
    tag:"Pro",     
    tagColor:"bg-[#2c2c2e] text-[#f59e0b]",    
    tagStyle: "rounded-full",
    proOnly:true,  
    initial:"4" 
  },
  { 
    name:"GPT-5.2",       
    desc:"Balanced performance",                
    tag:null,      
    tagColor:"",                                  
    proOnly:false, 
    initial:"2" 
  },
]

const LANGS = [
  { code:"en" as const, name:"English", flag:"🇬🇧" },
]

function Row({ label, sublabel, right, onClick, leftNode, danger }: {
  leftNode?: React.ReactNode
  label: string
  sublabel?: string
  right?: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 active:bg-white/5 transition-colors"
      style={{ paddingTop: "14px", paddingBottom: "14px" }}
    >
      {leftNode && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
          {leftNode}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className={`${danger ? "text-[#ef4444]" : "text-white"}`} style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
            {sublabel}
          </p>
        )}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
    </button>
  )
}

function Divider() {
  return <div style={{ height: "1px", background: "#2c2c2e", marginLeft: "56px" }} />
}

function Section({ title, children, rightAction }: { title?: string; children: React.ReactNode; rightAction?: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {title && (
        <div className="flex items-center justify-between px-4 mb-2">
          <p className="font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>{title}</p>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden" style={{ background: "#1c1c1e" }}>
        {children}
      </div>
    </div>
  )
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={"relative rounded-full transition-all duration-200 shrink-0 " + (disabled ? "opacity-50" : "")}
      style={{ width: "44px", height: "26px", background: on ? "#34c759" : "#3a3a3c" }}
    >
      <span
        className="absolute top-[2px] rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: "22px", height: "22px",
          background: "#ffffff",
          left: on ? "20px" : "2px",
        }}
      />
    </button>
  )
}

function ModelLogo({ name, active, locked }: { name: string; active: boolean; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  const imageProps = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    style: { WebkitTouchCallout: "none" as const, userSelect: "none" as const }
  }

  if (locked) return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2c2c2e" }}>
      <Lock className="w-4 h-4" style={{ color: "#636366" }} />
    </div>
  )
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${active ? "ring-2 ring-white" : "ring-1 ring-[#3a3a3c]"}`} style={{ background: "#2c2c2e" }}>
      <img src={MODEL_LOGO[name]} alt={name} className="w-6 h-6 object-contain pointer-events-none select-none" {...imageProps}
        onError={e => {
          const el = e.currentTarget; el.style.display = "none"
          const p = el.parentElement
          if (p) {
            p.style.background = "#2c2c2e"
            const sp = document.createElement("span")
            sp.textContent = model?.initial ?? "?"
            sp.style.color = "#fff"; sp.style.fontWeight = "600"; sp.style.fontFamily = SFD
            p.appendChild(sp)
          }
        }}
      />
    </div>
  )
}

export function SettingsView() {
  const {
    t, setCurrentView, language, setLanguage,
    selectedModel, setSelectedModel,
    userPreferences, setUserPreferences,
    isPremium,
    personalizeMemories, setPersonalizeMemories,
    deleteAllMemories, deleteAllHistory,
    submitFeedback,
  } = useApp()

  const [page, setPage]           = useState<"main"|"model"|"lang"|"prefs">("main")
  const [tempPrefs, setTempPrefs] = useState(userPreferences)
  const [improveModel, setImproveModel] = useState(false)
  const [saving, setSaving]       = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState("General feedback")
  const [reportDescription, setReportDescription] = useState("")
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  const currentModelInfo = MODELS.find(m => m.name === selectedModel)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => {
      if (page !== "main") setPage("main")
      else { setCurrentView("profile"); tg.BackButton.hide() }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [page, setCurrentView])

  async function selectModel(m: string) {
    setSaving("model")
    await setSelectedModel(m as ModelName)
    setSaving("")
    setPage("main")
  }

  async function handlePersonalizeToggle() {
    setSaving("personalize")
    await setPersonalizeMemories(!personalizeMemories)
    setSaving("")
  }

  /* ── Model selector ─────────────────────────────────────────────── */
  if (page === "model") return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title="Select Model" />
      <div className="px-4 pt-6 space-y-3">
        {MODELS.map(m => {
          const locked = m.proOnly && !isPremium
          const active = selectedModel === m.name
          return (
            <button key={m.name} disabled={locked || saving === "model"}
              onClick={() => !locked && selectModel(m.name)}
              className="w-full p-4 rounded-[24px] flex items-center justify-between transition-all active:scale-[0.98]"
              style={{
                background: "#1c1c1e",
                border: `1px solid ${active ? "#fff" : "#2c2c2e"}`,
                opacity: locked ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <ModelLogo name={m.name} active={active} locked={locked} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white" style={{ fontFamily: SFD, fontSize: "16px", fontWeight: 600 }}>{m.name}</p>
                    {m.tag && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 ${m.tagStyle || 'rounded-full'} ${m.tagColor}`} style={{ fontFamily: SF }}>
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>{m.desc}</p>
                </div>
              </div>
              {active && !locked && saving !== "model" && <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-black" /></div>}
            </button>
          )
        })}
      </div>
    </div>
  )

  /* ── Main View ─────────────────────────────────────────────────── */
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>
      <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3" style={{
        paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
      }}>
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD }}>Settings</h2>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">
        <Section title="Profile">
          <Row
            leftNode={
              <div className="w-[24px] h-[24px] flex items-center justify-center rounded overflow-hidden" style={{ background: "#2c2c2e" }}>
                 <img src={MODEL_LOGO[selectedModel] || "/grok.png"} alt="" className="w-full h-full object-contain"
                   onError={e => { e.currentTarget.style.display="none"; const p=e.currentTarget.parentElement; if(p){p.style.background="#2c2c2e"; const s=document.createElement("span"); s.textContent=currentModelInfo?.initial??"?"; s.style.color="white"; s.style.fontWeight="700"; s.style.fontSize="12px"; p.appendChild(s)} }}
                 />
              </div>
            }
            label="LLM model"
            sublabel={selectedModel}
            onClick={() => setPage("model")}
          />
          <Divider />
          <Row
            leftNode={<Globe className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Language"
            sublabel="English"
            onClick={() => setPage("lang")}
          />
        </Section>

        <Section title="Danger Zone">
           <div className="px-4 py-4 flex flex-col gap-3">
              <button onClick={handleDeleteMemories} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.98]" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "15px", fontFamily: SF }}>
                <Trash2 className="w-5 h-5" /> Delete All Memories
              </button>
              <button onClick={handleDeleteHistory} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.98]" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "15px", fontFamily: SF }}>
                <Trash2 className="w-5 h-5" /> Delete All History
              </button>
           </div>
        </Section>
      </div>
    </div>
  )
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD }}>{title}</h2>
    </div>
  )
}
