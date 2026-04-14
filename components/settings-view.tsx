"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { ChevronLeft, ChevronRight, Check, Globe, Bot, User, Lock, Database, FileText, Shield, MessageSquare, ChevronDown, ImagePlus, X, ExternalLink, AlertCircle } from "lucide-react"
import { useState } from "react"

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
  { name:"Grok 4",      desc:"Most capable · no cooldown",         tag:"Popular", tagColor:"bg-orange-500/20 text-orange-400",  proOnly:false, initial:"G" },
  { name:"Grok 4 Mini", desc:"Fast · smart throttle on heavy use",  tag:"Free",    tagColor:"bg-emerald-500/20 text-emerald-400", proOnly:false, initial:"G" },
  { name:"GPT-5.4",     desc:"OpenAI latest · Pro only",            tag:"Pro",     tagColor:"bg-amber-500/20 text-amber-400",    proOnly:true,  initial:"4" },
  { name:"GPT-5.2",     desc:"Balanced performance",                tag:null,      tagColor:"",                                  proOnly:false, initial:"2" },
]

const LANGS = [
  { code:"en" as const, name:"English", flag:"🇬🇧" },
  { code:"ru" as const, name:"Русский", flag:"🇷🇺" },
  { code:"es" as const, name:"Español", flag:"🇪🇸" },
]

// ── iOS-style row item ────────────────────────────────────────────────
function Row({ icon, iconBg, label, sublabel, right, onClick, danger }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  sublabel?: string
  right?: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 active:opacity-60 transition-opacity"
      style={{ paddingTop: "10px", paddingBottom: "10px" }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-white"}`}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>{sublabel}</p>}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />}
    </button>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────
function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={"relative rounded-full transition-all duration-200 shrink-0 " + (disabled ? "opacity-50" : "")}
      style={{ width: "44px", height: "26px", background: on ? "white" : "rgba(255,255,255,0.2)" }}
    >
      <span
        className="absolute top-[2px] rounded-full shadow-md transition-transform duration-200"
        style={{
          width: "22px", height: "22px",
          background: "#1c1c1e",
          left: on ? "20px" : "2px",
        }}
      />
    </button>
  )
}

// ── Section group ─────────────────────────────────────────────────────
function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && (
        <p className="text-xs font-medium uppercase tracking-[0.08em] px-1 mb-1.5" style={{ color: "#636366", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif", letterSpacing: "0.06em" }}>
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1c1e" }}>
        {children}
      </div>
    </div>
  )
}

// ── Divider inside section ────────────────────────────────────────────
function Divider() {
  return <div className="ml-[52px] mr-0 h-px" style={{ background: "#2c2c2e" }} />
}

// ── Model logo ────────────────────────────────────────────────────────
function ModelLogo({ name, active, locked }: { name: ModelName; active: boolean; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  if (locked) return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2c2c2e" }}>
      <Lock className="w-4 h-4" style={{ color: "#48484a" }} />
    </div>
  )
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${active ? "ring-2 ring-blue-500" : ""}`}>
      <img src={MODEL_LOGO[name]} alt={name} className="w-full h-full object-contain"
        onError={e => {
          const el = e.currentTarget; el.style.display = "none"
          const p = el.parentElement
          if (p) {
            p.style.background = active ? "#3b82f6" : "#2c2c2e"
            p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center"
            const sp = document.createElement("span")
            sp.textContent = model?.initial ?? "?"; sp.style.color = "white"; sp.style.fontWeight = "700"
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

  // ── Sub-page header (with back arrow) ──────────────────────────────
  function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
      <div className="sticky top-0 z-10 flex items-center px-4 py-3" style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #1c1c1e",
      }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity mr-2" style={{ background: "#1c1c1e" }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <h2 className="font-semibold text-white text-base">{title}</h2>
      </div>
    )
  }

  /* ── Model selector ─────────────────────────────────────────────── */
  if (page === "model") return (
    <div className="flex-1" style={{ background: "#000" }}>
      <SubHeader title={t("selectModel")} onBack={() => setPage("main")} />
      <div className="p-4 space-y-2">
        {MODELS.map(m => {
          const locked    = m.proOnly && !isPremium
          const active    = selectedModel === m.name
          const throttled = isThrottled && m.name === "Grok 4 Mini"
          return (
            <button key={m.name} disabled={locked || saving === "model"}
              onClick={() => !locked && selectModel(m.name)}
              className="w-full p-3.5 rounded-2xl flex items-start justify-between transition-all active:opacity-70"
              style={{
                background: active ? "rgba(59,130,246,0.1)" : "#1c1c1e",
                border: `2px solid ${active ? "#3b82f6" : "#2c2c2e"}`,
                opacity: locked ? 0.6 : 1,
              }}
            >
              <div className="flex items-start gap-3 flex-1">
                <ModelLogo name={m.name} active={active} locked={locked} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white text-sm">{m.name}</p>
                    {m.tag && <span className={`text-xs px-2 py-0.5 rounded-full ${m.tagColor}`}>{m.tag}</span>}
                    {locked && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{t("locked")}</span>}
                    {throttled && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">cooling {minutesUntilReset}min</span>}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>{m.desc}</p>
                </div>
              </div>
              {active && !locked && saving !== "model" && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
              {saving === "model" && active && <span className="text-xs" style={{ color: "#8e8e93" }}>saving...</span>}
            </button>
          )
        })}
        {!isPremium && (
          <button onClick={() => { setPage("main"); setCurrentView("premium") }}
            className="w-full p-3.5 rounded-2xl text-center text-sm text-amber-400 font-medium active:opacity-70 transition-opacity"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
            {t("unlockGPT")}
          </button>
        )}
      </div>
    </div>
  )

  /* ── Language ───────────────────────────────────────────────────── */
  if (page === "lang") return (
    <div className="flex-1" style={{ background: "#000" }}>
      <SubHeader title={t("language")} onBack={() => setPage("main")} />
      <div className="p-4 space-y-2">
        {LANGS.map(lang => (
          <button key={lang.code} onClick={() => { setLanguage(lang.code); setPage("main") }}
            className="w-full p-3.5 rounded-2xl flex items-center justify-between active:opacity-70 transition-opacity"
            style={{
              background: language === lang.code ? "rgba(59,130,246,0.1)" : "#1c1c1e",
              border: `2px solid ${language === lang.code ? "#3b82f6" : "#2c2c2e"}`,
            }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{lang.flag}</span>
              <p className="font-medium text-white text-sm">{lang.name}</p>
            </div>
            {language === lang.code && <Check className="w-4 h-4 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  )

  /* ── Preferences ────────────────────────────────────────────────── */
  if (page === "prefs") return (
    <div className="flex-1" style={{ background: "#000" }}>
      <SubHeader title={t("preferences")} onBack={() => setPage("main")} />
      <div className="p-4 space-y-4">
        {(["name","age","location"] as const).map(field => (
          <div key={field} className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: "#636366" }}>{field}</label>
            <input type="text" value={tempPrefs[field]}
              onChange={e => setTempPrefs({ ...tempPrefs, [field]: e.target.value })}
              className="w-full p-3 rounded-xl text-white text-sm placeholder:text-[#48484a] focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: "#636366" }}>{t("yourPreferences")}</label>
          <textarea value={tempPrefs.preferences}
            onChange={e => setTempPrefs({ ...tempPrefs, preferences: e.target.value })}
            className="w-full p-3 rounded-xl text-white text-sm placeholder:text-[#48484a] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
            placeholder="I prefer concise answers..."
          />
        </div>
        <button onClick={() => { setUserPreferences(tempPrefs); setPage("main") }}
          className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl active:opacity-80 transition-opacity text-sm">
          {t("save")}
        </button>
      </div>
    </div>
  )

  /* ── Main ───────────────────────────────────────────────────────── */
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#000" }}>

      {/* Header — centered title, no back arrow, no bottom border */}
      <div className="sticky top-0 z-10 flex items-center justify-center px-4 py-3" style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <h2 className="font-semibold text-white text-base">{t("settings")}</h2>
      </div>

      <div className="px-4 pt-4 pb-10 space-y-5">

        {/* ── xBlum Pro card — hidden when isPremium ── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full relative overflow-hidden active:opacity-80 transition-opacity text-left"
            style={{
              background: "#060606",
              border: "1px solid #1e1e1e",
              borderRadius: "20px",
              minHeight: "96px",
            }}
          >
            {/* Subtle amber glow top-left */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at 8% 40%, rgba(245,158,11,0.07) 0%, transparent 55%)",
            }} />
            {/* Decorative circle top-right */}
            <div className="absolute pointer-events-none" style={{
              width: "90px", height: "90px",
              borderRadius: "50%",
              top: "-30px", right: "-20px",
              background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
              border: "1px solid rgba(245,158,11,0.10)",
            }} />
            <div className="absolute pointer-events-none" style={{
              width: "55px", height: "55px",
              borderRadius: "50%",
              bottom: "-18px", right: "30px",
              background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
              border: "1px solid rgba(245,158,11,0.08)",
            }} />

            {/* Content */}
            <div className="relative z-10 px-5 py-4 flex flex-col gap-2">
              {/* Title row */}
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-[15px] leading-tight">xBlum Pro</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400" style={{ background: "rgba(245,158,11,0.15)" }}>PRO</span>
              </div>
              <p className="text-xs" style={{ color: "#8e8e93" }}>Upgrade your plan to enjoy full features</p>

              {/* Upgrade button */}
              <div
                className="flex items-center justify-center mt-1 px-4 py-2.5 rounded-xl w-full"
                style={{ background: "rgba(255,255,255,0.93)" }}
              >
                <span className="text-black text-sm font-semibold">Upgrade →</span>
              </div>
            </div>
          </button>
        )}

        {/* ── General ── */}
        <Section title="General">
          <Row
            icon={<img src={MODEL_LOGO[selectedModel]} alt={selectedModel} className="w-5 h-5 object-contain"
              onError={e => { e.currentTarget.style.display="none"; const p=e.currentTarget.parentElement; if(p){p.style.background="#2c2c2e"; const s=document.createElement("span"); s.textContent=currentModelInfo?.initial??"?"; s.style.color="white"; s.style.fontWeight="700"; s.style.fontSize="12px"; p.appendChild(s)} }}
            />}
            iconBg="#2c2c2e"
            label={t("model")}
            sublabel={selectedModel + (isThrottled && selectedModel === "Grok 4 Mini" ? " · cooling" : "")}
            onClick={() => setPage("model")}
          />
          <Divider />
          <Row
            icon={<Globe className="w-4 h-4 text-blue-400" />}
            iconBg="rgba(59,130,246,0.2)"
            label={t("language")}
            sublabel={LANGS.find(l => l.code === language)?.name}
            onClick={() => setPage("lang")}
          />
          <Divider />
          <Row
            icon={<User className="w-4 h-4 text-emerald-400" />}
            iconBg="rgba(52,199,89,0.2)"
            label={t("preferences")}
            sublabel={userPreferences.name || t("notSet")}
            onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
          />
        </Section>

        {/* ── Data & Privacy ── */}
        <Section title="Data & Privacy">
          <div className="flex items-center gap-3 px-4" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(175,82,222,0.2)" }}>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">{t("personalizeMemories")}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8e8e93" }}>
                {personalizeMemories ? "xBlum learns from your chats" : "Minimal context only"}
              </p>
            </div>
            <Toggle on={personalizeMemories} onToggle={handlePersonalizeToggle} disabled={saving === "personalize"} />
          </div>
          <Divider />
          <div className="flex items-center gap-3 px-4" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.2)" }}>
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">{t("improveModel")}</p>
            </div>
            <Toggle on={improveModel} onToggle={() => setImproveModel(v => !v)} />
          </div>
          <Divider />
          <Row
            icon={<span className="text-xs">🗑</span>}
            iconBg="rgba(255,59,48,0.15)"
            label={saving === "del_mem" ? "Deleting..." : t("deleteAllMemories")}
            onClick={handleDeleteMemories}
            danger
            right={<span />}
          />
          <Divider />
          <Row
            icon={<span className="text-xs">🗑</span>}
            iconBg="rgba(255,59,48,0.15)"
            label={saving === "del_hist" ? "Deleting..." : t("deleteAllHistory")}
            onClick={handleDeleteHistory}
            danger
            right={<span />}
          />
        </Section>

        {/* ── Legal & Support ── */}
        <Section title="Support">
          <a href="https://xblum.gitbook.io/home/xblum/terms" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 active:opacity-60 transition-opacity" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2c2c2e" }}>
              <FileText className="w-4 h-4" style={{ color: "#8e8e93" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Terms of Use</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />
          </a>
          <Divider />
          <a href="https://xblum.gitbook.io/home/xblum/privacy" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 active:opacity-60 transition-opacity" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2c2c2e" }}>
              <Shield className="w-4 h-4" style={{ color: "#8e8e93" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Privacy Policy</p>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "#48484a" }} />
          </a>
          <Divider />
          <Row
            icon={<AlertCircle className="w-4 h-4" style={{ color: "#8e8e93" }} />}
            iconBg="#2c2c2e"
            label="Feedback & Support"
            onClick={() => setShowReportModal(true)}
          />
        </Section>

      </div>

      {/* ── Feedback Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
          />
          <div className="relative w-full rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col" style={{ background: "#1c1c1e" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2c2c2e" }}>
              <button onClick={() => { if (!submittingReport) { setShowReportModal(false); setReportSent(false) } }}
                className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-60 transition-opacity" style={{ background: "#2c2c2e" }}>
                <X className="w-4 h-4 text-white" />
              </button>
              <h2 className="font-semibold text-white text-base">Feedback & Support</h2>
              {reportSent ? (
                <div className="px-3 py-1 rounded-full text-emerald-400 font-medium text-xs">Sent ✓</div>
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
                  className="px-3 py-1.5 bg-blue-500 disabled:opacity-40 rounded-full text-white font-medium text-xs active:opacity-80 transition-opacity"
                >
                  {submittingReport ? "Sending..." : "Submit"}
                </button>
              )}
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {reportSent ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(52,199,89,0.2)" }}>
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-white font-semibold">Thank you!</p>
                  <p className="text-sm text-center" style={{ color: "#8e8e93" }}>Your feedback has been received. We'll review it shortly.</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <button onClick={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#2c2c2e" }}>
                      <MessageSquare className="w-4 h-4" style={{ color: "#8e8e93" }} />
                      <span className="flex-1 text-left text-white text-sm">{reportType}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showReportTypeDropdown ? "rotate-180" : ""}`} style={{ color: "#8e8e93" }} />
                    </button>
                    {showReportTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10" style={{ background: "#2c2c2e" }}>
                        {["General feedback","Bug report","Feature request","Performance issue","Support request","Other"].map(type => (
                          <button key={type} onClick={() => { setReportType(type); setShowReportTypeDropdown(false) }}
                            className={`w-full px-4 py-2.5 text-left text-sm active:opacity-60 transition-opacity ${reportType === type ? "text-blue-400" : "text-white"}`}>
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
                    className="w-full min-h-[140px] p-4 rounded-2xl text-white text-sm placeholder:text-[#48484a] focus:outline-none focus:ring-2 focus:ring-neutral-600 resize-none"
                    style={{ background: "transparent", border: "1px solid #2c2c2e" }}
                  />
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm active:opacity-60 transition-opacity" style={{ background: "#2c2c2e", color: "#aeaeb2" }}>
                    <ImagePlus className="w-4 h-4" />
                    <span className="font-medium">Attach images</span>
                  </button>
                  <p className="text-xs text-center px-4" style={{ color: "#48484a" }}>
                    Feedback is sent directly to the xBlum team.
                  </p>
                </>
              )}
            </div>
            <div className="h-6" style={{ background: "#1c1c1e" }} />
          </div>
        </div>
      )}
    </div>
  )
}
