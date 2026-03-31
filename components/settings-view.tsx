"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { ChevronLeft, ChevronRight, Check, Globe, Bot, User, Lock, Database } from "lucide-react"
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
  { name:"Grok 4",      desc:"Most capable · no cooldown",    tag:"Popular", tagColor:"bg-orange-500/20 text-orange-400",  proOnly:false, initial:"G" },
  { name:"Grok 4 Mini", desc:"Fast · smart throttle on heavy use", tag:"Free", tagColor:"bg-emerald-500/20 text-emerald-400", proOnly:false, initial:"G" },
  { name:"GPT-5.4",     desc:"OpenAI latest · Pro only",      tag:"Pro",     tagColor:"bg-amber-500/20 text-amber-400",    proOnly:true,  initial:"4" },
  { name:"GPT-5.2",     desc:"Balanced performance",          tag:null,      tagColor:"",                                  proOnly:false, initial:"2" },
]

const LANGS = [
  { code:"en" as const, name:"English", flag:"🇬🇧" },
  { code:"ru" as const, name:"Русский", flag:"🇷🇺" },
  { code:"es" as const, name:"Español", flag:"🇪🇸" },
]

function ModelLogo({ name, active, locked }: { name: ModelName; active: boolean; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  if (locked) return (
    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
      <Lock className="w-4 h-4 text-neutral-500" />
    </div>
  )
  return (
    <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden " + (active ? "ring-2 ring-blue-500" : "")}>
      <img src={MODEL_LOGO[name]} alt={name} className="w-full h-full object-contain"
        onError={e => {
          const el = e.currentTarget; el.style.display = "none"
          const p  = el.parentElement
          if (p) {
            p.style.background    = active ? "#3b82f6" : "#262626"
            p.style.display       = "flex"
            p.style.alignItems    = "center"
            p.style.justifyContent= "center"
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
  } = useApp()

  const [page, setPage]           = useState<"main"|"model"|"lang"|"prefs">("main")
  const [tempPrefs, setTempPrefs] = useState(userPreferences)
  const [improveModel, setImproveModel] = useState(false)
  const [saving, setSaving]       = useState("")   // feedback visual

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

  /* ── Model selector ───────────────────────────────────────────────── */
  if (page === "model") return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("selectModel")}</h2>
      </div>
      <div className="p-4 space-y-2">
        {MODELS.map(m => {
          const locked    = m.proOnly && !isPremium
          const active    = selectedModel === m.name
          const throttled = isThrottled && m.name === "Grok 4 Mini"
          return (
            <button key={m.name} disabled={locked || saving === "model"}
              onClick={() => !locked && selectModel(m.name)}
              className={"w-full p-4 rounded-2xl flex items-start justify-between transition-all " +
                (locked ? "opacity-60 bg-neutral-900/50 border-2 border-neutral-800"
                : active ? "bg-blue-500/10 border-2 border-blue-500"
                : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")}
            >
              <div className="flex items-start gap-3 flex-1">
                <ModelLogo name={m.name} active={active} locked={locked} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{m.name}</p>
                    {m.tag && <span className={"text-xs px-2 py-0.5 rounded-full " + m.tagColor}>{m.tag}</span>}
                    {locked && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{t("locked")}</span>}
                    {throttled && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">cooling {minutesUntilReset}min</span>}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p>
                </div>
              </div>
              {active && !locked && saving !== "model" && <Check className="w-5 h-5 text-blue-500 shrink-0" />}
              {saving === "model" && active && <span className="text-xs text-neutral-500">saving...</span>}
            </button>
          )
        })}
        {!isPremium && (
          <button onClick={() => { setPage("main"); setCurrentView("premium") }}
            className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center text-sm text-amber-400 font-medium hover:border-amber-500/50 transition-colors">
            {t("unlockGPT")}
          </button>
        )}
      </div>
    </div>
  )

  /* ── Language ─────────────────────────────────────────────────────── */
  if (page === "lang") return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("language")}</h2>
      </div>
      <div className="p-4 space-y-2">
        {LANGS.map(lang => (
          <button key={lang.code} onClick={() => { setLanguage(lang.code); setPage("main") }}
            className={"w-full p-4 rounded-2xl flex items-center justify-between transition-all " +
              (language === lang.code ? "bg-blue-500/10 border-2 border-blue-500" : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <p className="font-medium text-white">{lang.name}</p>
            </div>
            {language === lang.code && <Check className="w-5 h-5 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  )

  /* ── Preferences ──────────────────────────────────────────────────── */
  if (page === "prefs") return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("preferences")}</h2>
      </div>
      <div className="p-4 space-y-4">
        {(["name","age","location"] as const).map(field => (
          <div key={field} className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-400 capitalize">{field}</label>
            <input type="text" value={tempPrefs[field]}
              onChange={e => setTempPrefs({ ...tempPrefs, [field]: e.target.value })}
              className="w-full p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-400">{t("yourPreferences")}</label>
          <textarea value={tempPrefs.preferences}
            onChange={e => setTempPrefs({ ...tempPrefs, preferences: e.target.value })}
            className="w-full p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[90px] resize-none"
            placeholder="I prefer concise answers..."
          />
        </div>
        <button onClick={() => { setUserPreferences(tempPrefs); setPage("main") }}
          className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
          {t("save")}
        </button>
      </div>
    </div>
  )

  /* ── Main ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setCurrentView("home")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("settings")}</h2>
      </div>

      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* General */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{t("general")}</h3>
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">

            {/* Modelo */}
            <button onClick={() => setPage("model")}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img src={MODEL_LOGO[selectedModel]} alt={selectedModel} className="w-full h-full object-contain"
                  onError={e => {
                    const el = e.currentTarget; el.style.display = "none"
                    const p = el.parentElement
                    if (p) { p.style.background = "#262626"; p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center"
                      const sp = document.createElement("span"); sp.textContent = currentModelInfo?.initial ?? "?"; sp.style.color = "white"; sp.style.fontWeight = "700"; p.appendChild(sp) }
                  }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t("model")}</p>
                <p className="text-sm text-neutral-500">{selectedModel}{isThrottled && selectedModel === "Grok 4 Mini" ? " · cooling" : ""}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </button>

            {/* Idioma */}
            <button onClick={() => setPage("lang")}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t("language")}</p>
                <p className="text-sm text-neutral-500">{LANGS.find(l => l.code === language)?.name}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </button>

            {/* Preferencias */}
            <button onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t("preferences")}</p>
                <p className="text-sm text-neutral-500">{userPreferences.name || t("notSet")}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Data Control */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{t("dataControl")}</h3>
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">

            {/* Personalize with memories */}
            <div className="w-full flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t("personalizeMemories")}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {personalizeMemories ? "xBlum learns from your conversations" : "Minimal context only"}
                </p>
              </div>
              <button
                onClick={handlePersonalizeToggle}
                disabled={saving === "personalize"}
                className={"relative w-[51px] h-[31px] rounded-full transition-colors duration-200 " +
                  (personalizeMemories ? "bg-green-500" : "bg-neutral-600") +
                  (saving === "personalize" ? " opacity-50" : "")}
              >
                <span className={"absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform duration-200 " +
                  (personalizeMemories ? "left-[22px]" : "left-[2px]")} />
              </button>
            </div>

            {/* Improve the model (estático) */}
            <div className="w-full flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t("improveModel")}</p>
              </div>
              <button
                onClick={() => setImproveModel(v => !v)}
                className={"relative w-[51px] h-[31px] rounded-full transition-colors duration-200 " +
                  (improveModel ? "bg-green-500" : "bg-neutral-600")}
              >
                <span className={"absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform duration-200 " +
                  (improveModel ? "left-[22px]" : "left-[2px]")} />
              </button>
            </div>

            {/* Delete All Memories */}
            <button
              onClick={handleDeleteMemories}
              disabled={saving === "del_mem"}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
              <div className="flex-1 text-left pl-14">
                <p className={"font-medium " + (saving === "del_mem" ? "text-neutral-500" : "text-red-500")}>
                  {saving === "del_mem" ? "Deleting..." : t("deleteAllMemories")}
                </p>
              </div>
            </button>

            {/* Delete All History */}
            <button
              onClick={handleDeleteHistory}
              disabled={saving === "del_hist"}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 active:bg-neutral-700 transition-colors">
              <div className="flex-1 text-left pl-14">
                <p className={"font-medium " + (saving === "del_hist" ? "text-neutral-500" : "text-red-500")}>
                  {saving === "del_hist" ? "Deleting..." : t("deleteAllHistory")}
                </p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
