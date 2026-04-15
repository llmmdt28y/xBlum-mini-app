"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { ChevronRight, Check, Globe, Bot, User, Lock, Database, FileText, Shield, MessageSquare, ChevronDown, ImagePlus, X, ExternalLink, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const MODEL_LOGO: Record<ModelName, string> = {
  "Grok 4":      "/grok.png",
  "Grok 4 Mini": "/grok.png",
  "GPT-5.4":     "/gpt.png",
  "GPT-5.2":     "/gpt.png",
}

const MODELS: {
  name: ModelName; desc: string
  tag: string | null; tagColor: string
  proOnly: boolean; initial: string
}[] = [
  { name:"Grok 4",      desc:"Most capable · no cooldown",         tag:"Popular", tagColor:"bg-[#1c1c1e] text-white",  proOnly:false, initial:"G" },
  { name:"Grok 4 Mini", desc:"Fast · smart throttle on heavy use",  tag:"Free",    tagColor:"bg-[#1c1c1e] text-white", proOnly:false, initial:"G" },
  { name:"GPT-5.4",     desc:"OpenAI latest · Pro only",            tag:"Pro",     tagColor:"bg-[#1c1c1e] text-[#f59e0b]",    proOnly:true,  initial:"4" },
  { name:"GPT-5.2",     desc:"Balanced performance",                tag:null,      tagColor:"",                                  proOnly:false, initial:"2" },
]

const LANGS = [
  { code:"en" as const, name:"English", flag:"🇬🇧" },
  { code:"ru" as const, name:"Русский", flag:"🇷🇺" },
  { code:"es" as const, name:"Español", flag:"🇪🇸" },
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
      className="w-full flex items-center gap-4 px-5 active:opacity-50 transition-opacity"
      style={{ paddingTop: "13px", paddingBottom: "13px" }}
    >
      {leftNode && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
          {leftNode}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className={`${danger ? "text-[#ef4444]" : "text-white"}`} style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>
          {label}
        </p>
        {sublabel && (
          <p className="mt-0.5" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
            {sublabel}
          </p>
        )}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#3a3a3c" }} />}
    </button>
  )
}

function Divider() {
  return <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "20px" }} />
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && (
        <p
          className="px-1 mb-2"
          style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}
        >
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111" }}>
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
      style={{ width: "44px", height: "26px", background: on ? "#34c759" : "#2c2c2e" }}
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

function ModelLogo({ name, active, locked }: { name: ModelName; active: boolean; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  const imageProps = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    style: { WebkitTouchCallout: "none" as const, userSelect: "none" as const }
  }

  if (locked) return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#1c1c1e" }}>
      <Lock className="w-4 h-4" style={{ color: "#636366" }} />
    </div>
  )
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${active ? "ring-2 ring-white" : "ring-1 ring-[#2c2c2e]"}`} style={{ background: "#111" }}>
      <img src={MODEL_LOGO[name]} alt={name} className="w-6 h-6 object-contain pointer-events-none select-none" {...imageProps}
        onError={e => {
          const el = e.currentTarget; el.style.display = "none"
          const p = el.parentElement
          if (p) {
            p.style.background = "#1c1c1e"
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

  // ── Botón Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      if (page !== "main") {
        setPage("main") // Si estamos en una subpágina, volvemos a main
      } else {
        setCurrentView("profile") // Si estamos en main, volvemos al perfil
        tg.BackButton.hide()
      }
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
  }, [page, setCurrentView])

  async function selectModel(m: ModelName) {
    setSaving("model")
    await setSelectedModel(m)
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

  /* ── Model selector ─────────────────────────────────────────────── */
  if (page === "model") return (
    <div className="flex-1 flex flex-col" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title={t("selectModel")} />
      <div className="px-4 pt-5 space-y-3">
        {MODELS.map(m => {
          const locked    = m.proOnly && !isPremium
          const active    = selectedModel === m.name
          const throttled = isThrottled && m.name === "Grok 4 Mini"
          return (
            <button key={m.name} disabled={locked || saving === "model"}
              onClick={() => !locked && selectModel(m.name)}
              className="w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98]"
              style={{
                background: "#111",
                border: `1px solid ${active ? "#fff" : "#1c1c1e"}`,
                opacity: locked ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <ModelLogo name={m.name} active={active} locked={locked} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-white" style={{ fontFamily: SFD, fontSize: "16px", fontWeight: 600 }}>{m.name}</p>
                    {m.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.tagColor}`} style={{ fontFamily: SF }}>{m.tag}</span>}
                    {locked && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500" style={{ fontFamily: SF }}>{t("locked")}</span>}
                    {throttled && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500" style={{ fontFamily: SF }}>cooling {minutesUntilReset}min</span>}
                  </div>
                  <p style={{ fontSize: "13px", color: "#636366", fontFamily: SF }}>{m.desc}</p>
                </div>
              </div>
              {active && !locked && saving !== "model" && <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-black" /></div>}
              {saving === "model" && active && <span style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>saving...</span>}
            </button>
          )
        })}
        {!isPremium && (
          <button onClick={() => { setPage("main"); setCurrentView("premium") }}
            className="w-full p-4 rounded-2xl text-center text-sm font-bold active:scale-[0.98] transition-transform mt-4"
            style={{ background: "#fff", color: "#000", fontFamily: SF }}>
            {t("unlockGPT")}
          </button>
        )}
      </div>
    </div>
  )

  /* ── Language ───────────────────────────────────────────────────── */
  if (page === "lang") return (
    <div className="flex-1 flex flex-col" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title={t("language")} />
      <div className="px-4 pt-5 space-y-2">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
          {LANGS.map((lang, i, arr) => (
            <div key={lang.code}>
              <button onClick={() => { setLanguage(lang.code); setPage("main") }}
                className="w-full p-4 flex items-center justify-between active:bg-[#1c1c1e] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <p className="text-white" style={{ fontFamily: SF, fontSize: "15px" }}>{lang.name}</p>
                </div>
                {language === lang.code && <Check className="w-4 h-4 text-white" />}
              </button>
              {i < arr.length - 1 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "48px" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── Preferences ────────────────────────────────────────────────── */
  if (page === "prefs") return (
    <div className="flex-1 flex flex-col" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title={t("preferences")} />
      <div className="px-4 pt-5 space-y-4">
        {(["name","age","location"] as const).map(field => (
          <div key={field} className="space-y-1.5">
            <label className="px-1" style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}>{field}</label>
            <input type="text" value={tempPrefs[field]}
              onChange={e => setTempPrefs({ ...tempPrefs, [field]: e.target.value })}
              className="w-full p-4 rounded-2xl text-white placeholder:text-[#48484a] focus:outline-none"
              style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF, fontSize: "15px" }}
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="px-1" style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}>{t("yourPreferences")}</label>
          <textarea value={tempPrefs.preferences}
            onChange={e => setTempPrefs({ ...tempPrefs, preferences: e.target.value })}
            className="w-full p-4 rounded-2xl text-white placeholder:text-[#48484a] focus:outline-none min-h-[120px] resize-none"
            style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF, fontSize: "15px" }}
            placeholder="I prefer concise answers..."
          />
        </div>
        <button onClick={() => { setUserPreferences(tempPrefs); setPage("main") }}
          className="w-full py-4 mt-2 bg-white text-black font-bold rounded-2xl active:scale-[0.98] transition-transform"
          style={{ fontFamily: SF, fontSize: "16px" }}>
          {t("save")}
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
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>{t("settings")}</h2>
      </div>

      <div className="px-4 pt-6 pb-28 space-y-6">

        {/* ── xBlum Pro card ── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full relative overflow-hidden active:scale-[0.98] transition-transform text-left"
            style={{ background: "#060606", border: "1px solid #1e1e1e", borderRadius: "20px", minHeight: "96px" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)" }} />
            <div className="absolute pointer-events-none" style={{ width: "90px", height: "90px", borderRadius: "50%", top: "-30px", right: "-20px", background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)", border: "1px solid rgba(245,158,11,0.10)" }} />
            <div className="absolute pointer-events-none" style={{ width: "55px", height: "55px", borderRadius: "50%", bottom: "-18px", right: "30px", background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)", border: "1px solid rgba(245,158,11,0.08)" }} />

            <div className="relative z-10 px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>xBlum Pro</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500" style={{ background: "rgba(245,158,11,0.15)", fontFamily: SF }}>PRO</span>
              </div>
              <p style={{ fontSize: "13px", color: "#8e8e93", fontFamily: SF }}>Upgrade your plan to enjoy full features</p>

              <div className="flex items-center justify-center mt-2 px-4 py-3 rounded-xl w-full" style={{ background: "#fff" }}>
                <span className="text-black font-bold" style={{ fontSize: "14px", fontFamily: SF }}>Upgrade →</span>
              </div>
            </div>
          </button>
        )}

        {/* ── General ── */}
        <Section title="General">
          <Row
            leftNode={
              <div className="w-5 h-5 flex items-center justify-center rounded overflow-hidden">
                 <img src={MODEL_LOGO[selectedModel]} alt="" className="w-full h-full object-contain pointer-events-none select-none" draggable={false}
                   onError={e => { e.currentTarget.style.display="none"; const p=e.currentTarget.parentElement; if(p){p.style.background="#1c1c1e"; const s=document.createElement("span"); s.textContent=currentModelInfo?.initial??"?"; s.style.color="white"; s.style.fontWeight="700"; s.style.fontSize="11px"; p.appendChild(s)} }}
                 />
              </div>
            }
            label={t("model")}
            sublabel={selectedModel + (isThrottled && selectedModel === "Grok 4 Mini" ? " · cooling" : "")}
            onClick={() => setPage("model")}
          />
          <Divider />
          <Row
            leftNode={<Globe className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label={t("language")}
            sublabel={LANGS.find(l => l.code === language)?.name}
            onClick={() => setPage("lang")}
          />
          <Divider />
          <Row
            leftNode={<User className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label={t("preferences")}
            sublabel={userPreferences.name || t("notSet")}
            onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
          />
        </Section>

        {/* ── Data & Privacy ── */}
        <Section title="Data & Privacy">
          <div className="flex items-center justify-between px-5" style={{ paddingTop: "13px", paddingBottom: "13px" }}>
            <div className="flex items-center gap-4">
              <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
                <Database className="w-[18px] h-[18px]" style={{ color: "#636366" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white" style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>{t("personalizeMemories")}</p>
                <p className="mt-0.5" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                  {personalizeMemories ? "xBlum learns from your chats" : "Minimal context only"}
                </p>
              </div>
            </div>
            <Toggle on={personalizeMemories} onToggle={handlePersonalizeToggle} disabled={saving === "personalize"} />
          </div>
          <Divider />
          <div className="flex items-center justify-between px-5" style={{ paddingTop: "13px", paddingBottom: "13px" }}>
             <div className="flex items-center gap-4">
              <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
                <Bot className="w-[18px] h-[18px]" style={{ color: "#636366" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white" style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>{t("improveModel")}</p>
              </div>
            </div>
            <Toggle on={improveModel} onToggle={() => setImproveModel(v => !v)} />
          </div>
          <Divider />
          <Row
            leftNode={<span className="text-[14px]">🗑</span>}
            label={saving === "del_mem" ? "Deleting..." : t("deleteAllMemories")}
            onClick={handleDeleteMemories}
            danger
            right={<span />}
          />
          <Divider />
          <Row
            leftNode={<span className="text-[14px]">🗑</span>}
            label={saving === "del_hist" ? "Deleting..." : t("deleteAllHistory")}
            onClick={handleDeleteHistory}
            danger
            right={<span />}
          />
        </Section>

        {/* ── Support ── */}
        <Section title="Support">
          <a href="https://xblum.gitbook.io/home/xblum/terms" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 active:opacity-50 transition-opacity" style={{ paddingTop: "13px", paddingBottom: "13px" }}>
            <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
              <FileText className="w-[18px] h-[18px]" style={{ color: "#636366" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white" style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Terms of Use</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#3a3a3c" }} />
          </a>
          <Divider />
          <a href="https://xblum.gitbook.io/home/xblum/privacy" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 active:opacity-50 transition-opacity" style={{ paddingTop: "13px", paddingBottom: "13px" }}>
            <div className="shrink-0 flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
              <Shield className="w-[18px] h-[18px]" style={{ color: "#636366" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white" style={{ fontSize: "15px", fontWeight: 400, fontFamily: SF, letterSpacing: "-0.01em" }}>Privacy Policy</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#3a3a3c" }} />
          </a>
          <Divider />
          <Row
            leftNode={<AlertCircle className="w-[18px] h-[18px]" style={{ color: "#636366" }} />}
            label="Feedback & Support"
            onClick={() => setShowReportModal(true)}
            right={<ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#3a3a3c" }} />}
          />
        </Section>

      </div>

      {/* ── Feedback Modal (Mantenido con colores adaptados) ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
          />
          <div className="relative w-full rounded-t-[24px] animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col" style={{ background: "#111", borderTop: "1px solid #1c1c1e" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1c1c1e" }}>
              <button onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
                className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity" style={{ background: "#1c1c1e" }}>
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
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl active:scale-[0.98] transition-transform" style={{ background: "#1c1c1e" }}>
                      <MessageSquare className="w-5 h-5" style={{ color: "#636366" }} />
                      <span className="flex-1 text-left text-white font-medium" style={{ fontSize: "15px", fontFamily: SF }}>{reportType}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showReportTypeDropdown ? "rotate-180" : ""}`} style={{ color: "#636366" }} />
                    </button>
                    {showReportTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-10 border border-[#2c2c2e]" style={{ background: "#1c1c1e" }}>
                        {["General feedback","Bug report","Feature request","Performance issue","Support request","Other"].map(type => (
                          <button key={type} onClick={() => { setReportType(type); setShowReportTypeDropdown(false) }}
                            className={`w-full px-5 py-3.5 text-left text-[15px] font-medium active:bg-[#2c2c2e] transition-colors ${reportType === type ? "text-white" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>
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
                    className="w-full min-h-[160px] p-5 rounded-2xl text-white placeholder:text-[#636366] focus:outline-none"
                    style={{ background: "#1c1c1e", border: "1px solid #2c2c2e", fontSize: "15px", fontFamily: SF }}
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
