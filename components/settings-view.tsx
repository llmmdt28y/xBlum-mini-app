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
  initial: string;
  tagStyle?: string;
}[] = [
  { 
    name:"Grok 4.1",      
    desc:"Most capable · no cooldown",         
    tag:"New", 
    tagColor:"bg-[#3b82f6] text-white", 
    tagStyle: "rounded-md", 
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

// ── Profile-style row item ────────────────────────────────────────────
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
          <p className="font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>
            {title}
          </p>
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
      style={{ width: "44px", height: "26px", background: on ? "#ffffff" : "#3a3a3c" }}
    >
      <span
        className="absolute top-[2px] rounded-full shadow-sm transition-transform duration-200"
        style={{
          width: "22px", height: "22px",
          background: on ? "#000000" : "#ffffff",
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
      <img src={MODEL_LOGO[name] || "/grok.png"} alt={name} className="w-6 h-6 object-contain pointer-events-none select-none" {...imageProps}
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

// ── Sub-page header ──
function SubHeader({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3" style={{
      paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>{title}</h2>
    </div>
  )
}

export function SettingsView() {
  const {
    setCurrentView, language, setLanguage,
    selectedModel, setSelectedModel,
    userPreferences, setUserPreferences,
    isPremium, isThrottled, minutesUntilReset,
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

  // ── Telegram Native Back Button ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      if (page !== "main") {
        setPage("main") 
      } else {
        setCurrentView("profile") 
        tg.BackButton.hide()
      }
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
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

  async function handleDeleteMemories() {
    if (!window.Telegram?.WebApp) return
    window.Telegram.WebApp.showConfirm(
      "Delete all memories? xBlum will forget everything about you.",
      async (ok: boolean) => {
        if (!ok) return
        setSaving("del_mem")
        await deleteAllMemories()
        setSaving("")
        window.Telegram?.WebApp?.showAlert("All memories deleted.")
      }
    )
  }

  async function handleDeleteHistory() {
    if (!window.Telegram?.WebApp) return
    window.Telegram.WebApp.showConfirm(
      "Delete all conversation history?",
      async (ok: boolean) => {
        if (!ok) return
        setSaving("del_hist")
        await deleteAllHistory()
        setSaving("")
        window.Telegram?.WebApp?.showAlert("History deleted.")
      }
    )
  }

  /* ── Model selector ─────────────────────────────────────────────── */
  if (page === "model") return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title="Select Model" />
      <div className="px-4 pt-6 space-y-3">
        {MODELS.map(m => {
          const locked    = m.proOnly && !isPremium
          const active    = selectedModel === m.name
          const throttled = isThrottled && m.name === "Grok 4.1"
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
                    {locked && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500" style={{ fontFamily: SF }}>Locked</span>}
                    {throttled && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500" style={{ fontFamily: SF }}>cooling {minutesUntilReset}min</span>}
                  </div>
                  <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>{m.desc}</p>
                </div>
              </div>
              {active && !locked && saving !== "model" && <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-black" /></div>}
              {saving === "model" && active && <span style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>saving...</span>}
            </button>
          )
        })}
        {!isPremium && (
          <button onClick={() => { setPage("main"); setCurrentView("premium") }}
            className="w-full p-4 rounded-[24px] text-center text-sm font-bold active:scale-[0.98] transition-transform mt-4"
            style={{ background: "#fff", color: "#000", fontFamily: SF }}>
            Unlock Pro Models
          </button>
        )}
      </div>
    </div>
  )

  /* ── Language ───────────────────────────────────────────────────── */
  if (page === "lang") return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title="Language" />
      <div className="px-4 pt-6 space-y-2">
        <div className="rounded-[24px] overflow-hidden" style={{ background: "#1c1c1e" }}>
          {LANGS.map((lang, i, arr) => (
            <div key={lang.code}>
              <button onClick={() => { setLanguage(lang.code); setPage("main") }}
                className="w-full p-4 flex items-center justify-between active:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[22px]">{lang.flag}</span>
                  <p className="text-white" style={{ fontFamily: SF, fontSize: "16px" }}>{lang.name}</p>
                </div>
                {language === lang.code && <Check className="w-5 h-5 text-white" />}
              </button>
              {i < arr.length - 1 && <div style={{ height: "1px", background: "#2c2c2e", marginLeft: "56px" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── Preferences ────────────────────────────────────────────────── */
  if (page === "prefs") return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title="Preferences" />
      <div className="px-4 pt-6 space-y-5">
        {(["name","age","location"] as const).map(field => (
          <div key={field} className="space-y-2">
            <label className="px-2 font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, textTransform: "capitalize" }}>{field}</label>
            <input type="text" value={tempPrefs[field]}
              onChange={e => setTempPrefs({ ...tempPrefs, [field]: e.target.value })}
              className="w-full p-4 rounded-[24px] text-white placeholder:text-[#636366] focus:outline-none transition-colors"
              style={{ background: "#1c1c1e", border: "1px solid transparent", fontFamily: SF, fontSize: "16px" }}
              onFocus={(e) => e.target.style.borderColor = "#3a3a3c"}
              onBlur={(e) => e.target.style.borderColor = "transparent"}
            />
          </div>
        ))}
        <div className="space-y-2">
          <label className="px-2 font-medium" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>Your Preferences</label>
          <textarea value={tempPrefs.preferences}
            onChange={e => setTempPrefs({ ...tempPrefs, preferences: e.target.value })}
            className="w-full p-4 rounded-[24px] text-white placeholder:text-[#636366] focus:outline-none min-h-[140px] resize-none transition-colors"
            style={{ background: "#1c1c1e", border: "1px solid transparent", fontFamily: SF, fontSize: "16px" }}
            placeholder="I prefer concise answers..."
            onFocus={(e) => e.target.style.borderColor = "#3a3a3c"}
            onBlur={(e) => e.target.style.borderColor = "transparent"}
          />
        </div>
        <button onClick={() => { setUserPreferences(tempPrefs); setPage("main") }}
          className="w-full py-4 mt-4 bg-white text-black font-bold rounded-[24px] active:scale-[0.98] transition-transform"
          style={{ fontFamily: SF, fontSize: "16px" }}>
          Save Preferences
        </button>
      </div>
    </div>
  )

  /* ── Main ───────────────────────────────────────────────────────── */
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>

      <div className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3" style={{
        paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>Settings</h2>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">

        {/* ── xBlum Pro card ── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ background: "#1c1c1e", borderRadius: "24px", minHeight: "96px" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)" }} />
            <div className="absolute pointer-events-none" style={{ width: "90px", height: "90px", borderRadius: "50%", top: "-30px", right: "-20px", background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)", border: "1px solid rgba(245,158,11,0.10)" }} />
            <div className="absolute pointer-events-none" style={{ width: "55px", height: "55px", borderRadius: "50%", bottom: "-18px", right: "30px", background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)", border: "1px solid rgba(245,158,11,0.08)" }} />

            <div className="relative z-10 px-5 py-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-[18px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>xBlum Pro</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500" style={{ background: "rgba(245,158,11,0.15)", fontFamily: SF }}>PRO</span>
              </div>
              <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>Upgrade your plan to enjoy full features</p>

              <div className="flex items-center justify-center mt-3 px-4 py-3 rounded-xl w-full" style={{ background: "#fff" }}>
                <span className="text-black font-bold" style={{ fontSize: "15px", fontFamily: SF }}>Upgrade →</span>
              </div>
            </div>
          </button>
        )}

        {/* ── Profile ── */}
        <Section title="Profile">
          <Row
            leftNode={
              <div className="w-[24px] h-[24px] flex items-center justify-center rounded overflow-hidden" style={{ background: "#2c2c2e" }}>
                 <img src={MODEL_LOGO[selectedModel] || "/grok.png"} alt="" className="w-full h-full object-contain pointer-events-none select-none" draggable={false}
                   onError={e => { e.currentTarget.style.display="none"; const p=e.currentTarget.parentElement; if(p){p.style.background="#2c2c2e"; const s=document.createElement("span"); s.textContent=currentModelInfo?.initial??"?"; s.style.color="white"; s.style.fontWeight="700"; s.style.fontSize="12px"; p.appendChild(s)} }}
                 />
              </div>
            }
            label="LLM model"
            sublabel={selectedModel + (isThrottled && selectedModel === "Grok 4.1" ? " · cooling" : "")}
            onClick={() => setPage("model")}
          />
          <Divider />
          <Row
            leftNode={<Globe className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Language"
            sublabel={LANGS.find(l => l.code === language)?.name || "English"}
            onClick={() => setPage("lang")}
          />
          <Divider />
          <Row
            leftNode={<User className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="About You"
            sublabel={userPreferences.name || "Edit preferences"}
            onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
          />
        </Section>

        {/* ── Data & Privacy ── */}
        <Section title="Data & Privacy">
          <div className="flex items-center justify-between px-5" style={{ paddingTop: "14px", paddingBottom: "14px" }}>
            <div className="flex items-center gap-4">
              <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
                <Database className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Personalize Memories</p>
                <p className="mt-0.5" style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>
                  {personalizeMemories ? "xBlum learns from your chats" : "Minimal context only"}
                </p>
              </div>
            </div>
            <Toggle on={personalizeMemories} onToggle={handlePersonalizeToggle} disabled={saving === "personalize"} />
          </div>
          <Divider />
          <div className="flex items-center justify-between px-5" style={{ paddingTop: "14px", paddingBottom: "14px" }}>
             <div className="flex items-center gap-4">
              <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
                <Bot className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Improve Model</p>
              </div>
            </div>
            <Toggle on={improveModel} onToggle={() => setImproveModel(v => !v)} />
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone">
          <Row
            leftNode={saving === "del_mem" ? <Loader2 className="w-[20px] h-[20px] animate-spin text-[#ef4444]" /> : <Trash2 className="w-[20px] h-[20px]" style={{ color: "#ef4444" }} />}
            label={saving === "del_mem" ? "Deleting..." : "Delete All Memories"}
            onClick={handleDeleteMemories}
            danger
            right={<span />} 
          />
          <Divider />
          <Row
            leftNode={saving === "del_hist" ? <Loader2 className="w-[20px] h-[20px] animate-spin text-[#ef4444]" /> : <Trash2 className="w-[20px] h-[20px]" style={{ color: "#ef4444" }} />}
            label={saving === "del_hist" ? "Deleting..." : "Delete All History"}
            onClick={handleDeleteHistory}
            danger
            right={<span />} 
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <a href="https://xblum.gitbook.io/home/xblum/terms" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 active:bg-white/5 transition-colors" style={{ paddingTop: "14px", paddingBottom: "14px" }}>
            <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
              <FileText className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Terms of Use</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />
          </a>
          <Divider />
          <a href="https://xblum.gitbook.io/home/xblum/privacy" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 active:bg-white/5 transition-colors" style={{ paddingTop: "14px", paddingBottom: "14px" }}>
            <div className="shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px" }}>
              <Shield className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white" style={{ fontSize: "16px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Privacy Policy</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />
          </a>
          <Divider />
          <Row
            leftNode={<AlertCircle className="w-[20px] h-[20px]" style={{ color: "#8e8e93" }} />}
            label="Feedback & Support"
            onClick={() => setShowReportModal(true)}
            right={<ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
          />
        </Section>

      </div>

      {/* ── Feedback Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
          />
          <div className="relative w-full rounded-t-[24px] animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col" style={{ background: "#1c1c1e" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #2c2c2e" }}>
              <button onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
                className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity" style={{ background: "#2c2c2e" }}>
                <X className="w-4 h-4 text-white" />
              </button>
              <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>Feedback & Support</h2>
              {reportSent ? (
                <div className="px-3 py-1.5 rounded-full text-[#34c759] font-bold text-xs" style={{ fontFamily: SF }}>Sent ✓</div>
              ) : (
                <button
                  onClick={async () => {
                    if (!reportDescription.trim() || submittingReport) return
                    setSubmittingReport(true)
                    const ok = await submitFeedback(reportType, reportDescription.trim())
                    setSubmittingReport(false)
                    if (ok) {
                      setReportSent(true)
                      setTimeout(() => { setShowReportModal(false); setReportSent(false); setReportDescription(""); setReportType("General feedback") }, 1800)
                    } else {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ;(window as any).Telegram?.WebApp?.showAlert("Could not send. Please try again.")
                    }
                  }}
                  disabled={!reportDescription.trim() || submittingReport}
                  className="px-4 py-1.5 bg-white disabled:opacity-40 rounded-full text-black font-bold active:scale-95 transition-transform"
                  style={{ fontSize: "13px", fontFamily: SF }}
                >
                  {submittingReport ? "Sending..." : "Submit"}
                </button>
              )}
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {reportSent ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.1)" }}>
                    <Check className="w-8 h-8 text-[#34c759]" />
                  </div>
                  <p className="text-white font-bold" style={{ fontSize: "18px", fontFamily: SFD }}>Thank you!</p>
                  <p className="text-center" style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF }}>Your feedback has been received. We'll review it shortly.</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <button onClick={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-[20px] active:scale-[0.98] transition-transform" style={{ background: "#2c2c2e" }}>
                      <MessageSquare className="w-5 h-5" style={{ color: "#8e8e93" }} />
                      <span className="flex-1 text-left text-white font-medium" style={{ fontSize: "15px", fontFamily: SF }}>{reportType}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showReportTypeDropdown ? "rotate-180" : ""}`} style={{ color: "#8e8e93" }} />
                    </button>
                    {showReportTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-[20px] overflow-hidden z-10 border border-[#3a3a3c]" style={{ background: "#2c2c2e" }}>
                        {["General feedback","Bug report","Feature request","Performance issue","Support request","Other"].map(type => (
                          <button key={type} onClick={() => { setReportType(type); setShowReportTypeDropdown(false) }}
                            className={`w-full px-5 py-3.5 text-left text-[15px] font-medium active:bg-[#3a3a3c] transition-colors ${reportType === type ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)}
                    placeholder={
                      reportType === "Bug report" ? "Describe what went wrong..." :
                      reportType === "Feature request" ? "Describe the feature you'd like..." :
                      "Share your thoughts or issues..."
                    }
                    className="w-full min-h-[160px] p-5 rounded-[20px] text-white placeholder:text-[#636366] focus:outline-none transition-colors"
                    style={{ background: "#2c2c2e", border: "1px solid transparent", fontSize: "15px", fontFamily: SF }}
                    onFocus={(e) => e.target.style.borderColor = "#48484a"}
                    onBlur={(e) => e.target.style.borderColor = "transparent"}
                  />
                  <p className="text-center px-4" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                    Feedback is sent directly to the xBlum team.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
