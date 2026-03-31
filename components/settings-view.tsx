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
  name: ModelName
  desc: string
  tag: string | null
  tagColor: string
  proOnly: boolean
  initial: string
}[] = [
  { name: "Grok 4", desc: "Most capable · no throttle", tag: "Popular", tagColor: "bg-orange-500/20 text-orange-400", proOnly: false, initial: "G" },
  { name: "Grok 4 Mini", desc: "Fast & free · smart throttle", tag: "Free", tagColor: "bg-emerald-500/20 text-emerald-400", proOnly: false, initial: "G" },
  { name: "GPT-5.4", desc: "OpenAI latest · Pro only", tag: "Pro", tagColor: "bg-amber-500/20 text-amber-400", proOnly: true, initial: "4" },
  { name: "GPT-5.2", desc: "Balanced performance", tag: null, tagColor: "", proOnly: false, initial: "2" },
]

const LANGS = [
  { code: "en" as const, name: "English", flag: "🇬🇧" },
  { code: "ru" as const, name: "Русский", flag: "🇷🇺" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
]

function ModelLogo({ name, active, locked }: { name: ModelName; active: boolean; locked: boolean }) {
  const model = MODELS.find(m => m.name === name)
  const src = MODEL_LOGO[name]
  if (locked) return <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0"><Lock className="w-4 h-4 text-neutral-500" /></div>
  return (
    <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden " + (active ? "ring-2 ring-blue-500" : "")}>
      <img src={src} alt={name} className="w-full h-full object-contain" />
    </div>
  )
}

export function SettingsView() {
  const { t, setCurrentView, language, setLanguage, selectedModel, setSelectedModel, userPreferences, setUserPreferences, isPremium, isThrottled, minutesUntilReset, personalizeMemories, setPersonalizeMemories } = useApp()
  const [page, setPage] = useState<"main" | "model" | "lang" | "prefs">("main")
  const [tempPrefs, setTempPrefs] = useState(userPreferences)
  const [improveModel, setImproveModel] = useState(false)
  const currentModelInfo = MODELS.find(m => m.name === selectedModel)

  function handleDeleteMemories() {
    try {
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "delete_all_memories" }))
      window.Telegram?.WebApp?.close()
    } catch {}
  }

  function handleDeleteHistory() {
    try {
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "delete_all_history" }))
      window.Telegram?.WebApp?.close()
    } catch {}
  }

  function selectModel(m: ModelName) {
    setSelectedModel(m)
    try {
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "set_model", model: m }))
      window.Telegram?.WebApp?.close() // Cerramos para asegurar sincronización
    } catch {}
  }

  if (page === "model") return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800"><ChevronLeft className="w-5 h-5 text-white" /></button>
        <h2 className="font-semibold text-white">{t("selectModel")}</h2>
      </div>
      <div className="p-4 space-y-2">
        {MODELS.map(m => {
          const locked = m.proOnly && !isPremium
          const active = selectedModel === m.name
          const throttled = isThrottled && m.name === "Grok 4 Mini"
          return (
            <button key={m.name} disabled={locked} onClick={() => !locked && selectModel(m.name)} className={"w-full p-4 rounded-2xl flex items-start justify-between transition-all " + (locked ? "opacity-60 bg-neutral-900/50 border-2 border-neutral-800" : active ? "bg-blue-500/10 border-2 border-blue-500" : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700")}>
              <div className="flex items-start gap-3 flex-1">
                <ModelLogo name={m.name} active={active} locked={locked} />
                <div className="flex-1 text-left text-white">
                  <p className="font-medium">{m.name}</p>
                  {m.tag && <span className={"text-xs px-2 py-0.5 rounded-full " + m.tagColor}>{m.tag}</span>}
                  {throttled && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 ml-2">cooling {minutesUntilReset}min</span>}
                  <p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p>
                </div>
              </div>
              {active && !locked && <Check className="w-5 h-5 text-blue-500 shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (page === "lang") return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800"><ChevronLeft className="w-5 h-5 text-white" /></button>
        <h2 className="font-semibold text-white">{t("language")}</h2>
      </div>
      <div className="p-4 space-y-2">
        {LANGS.map(lang => (
          <button key={lang.code} onClick={() => { setLanguage(lang.code); setPage("main") }} className={"w-full p-4 rounded-2xl flex items-center justify-between transition-all " + (language === lang.code ? "bg-blue-500/10 border-2 border-blue-500" : "bg-neutral-900 border-2 border-neutral-800")}>
            <div className="flex items-center gap-3"><span className="text-2xl">{lang.flag}</span><p className="font-medium text-white">{lang.name}</p></div>
            {language === lang.code && <Check className="w-5 h-5 text-blue-500" />}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setCurrentView("home")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"><ChevronLeft className="w-5 h-5 text-white" /></button>
        <h2 className="font-semibold text-white">{t("settings")}</h2>
      </div>
      <div className="px-4 pt-6 pb-8 space-y-6">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{t("general")}</h3>
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            <button onClick={() => setPage("model")} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800 transition-colors">
              <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-white font-bold">{currentModelInfo?.initial}</div>
              <div className="flex-1 text-left"><p className="font-medium text-white">{t("model")}</p><p className="text-sm text-neutral-500">{selectedModel}</p></div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </button>
            <button onClick={() => setPage("lang")} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-neutral-800">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-blue-400" /></div>
              <div className="flex-1 text-left"><p className="font-medium text-white">{t("language")}</p></div>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{t("dataControl")}</h3>
          <div className="bg-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            <div className="w-full flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center"><Database className="w-5 h-5 text-purple-400" /></div>
              <div className="flex-1 text-left"><p className="font-medium text-white">{t("personalizeMemories")}</p></div>
              <button onClick={() => setPersonalizeMemories(!personalizeMemories)} className={"relative w-[51px] h-[31px] rounded-full " + (personalizeMemories ? "bg-green-500" : "bg-neutral-600")}><span className={"absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white transition-all " + (personalizeMemories ? "left-[22px]" : "left-[2px]")} /></button>
            </div>
            <button onClick={handleDeleteMemories} className="w-full text-left px-4 py-4 text-red-500 font-medium">{t("deleteAllMemories")}</button>
            <button onClick={handleDeleteHistory} className="w-full text-left px-4 py-4 text-red-500 font-medium">{t("deleteAllHistory")}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
