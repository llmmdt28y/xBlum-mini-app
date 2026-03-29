"use client"

import { useApp, type ModelName } from "@/lib/app-context"
import { ChevronLeft, ChevronRight, Check, Globe, Bot, User, Lock, Clock, Coins } from "lucide-react"
import { useState } from "react"

const MODELS: { name: ModelName; desc: string; tag: string | null; tagColor: string; proOnly: boolean; tokenCost: number }[] = [
  { name: "Grok 4",      desc: "Most capable · 5/hr free",   tag: "Popular", tagColor: "bg-orange-500/20 text-orange-400", proOnly: false, tokenCost: 1 },
  { name: "Grok 4 Mini", desc: "Fast & free · 12/hr",        tag: "Free",    tagColor: "bg-emerald-500/20 text-emerald-400", proOnly: false, tokenCost: 1 },
  { name: "GPT-5.4",     desc: "OpenAI latest · 8/hr pro",   tag: "Pro",     tagColor: "bg-amber-500/20 text-amber-400", proOnly: true, tokenCost: 3 },
  { name: "GPT-5.2",     desc: "Balanced · 2/hr free",       tag: null,      tagColor: "", proOnly: false, tokenCost: 2 },
]

const LANGS = [
  { code: "en" as const, name: "English",  flag: "🇬🇧" },
  { code: "ru" as const, name: "Русский",  flag: "🇷🇺" },
  { code: "es" as const, name: "Español",  flag: "🇪🇸" },
]

export function SettingsView() {
  const { t, setCurrentView, language, setLanguage, selectedModel, setSelectedModel,
          userPreferences, setUserPreferences, isPremium, hourlyUsage } = useApp()

  const [page, setPage] = useState<"main" | "model" | "lang" | "prefs">("main")
  const [tempPrefs, setTempPrefs] = useState(userPreferences)

  const sendModelToBot = (model: ModelName) => {
    try { window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "set_model", model })) } catch {}
  }

  // ── Model selector ───────────────────────────────────────────────────────
  if (page === "model") {
    return (
      <div className="flex-1 bg-[#0a0a0a]">
        <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="font-semibold text-white">{t("selectModel")}</h2>
        </div>
        <div className="p-4 space-y-2">
          {MODELS.map((m) => {
            const usage   = hourlyUsage[m.name]
            const locked  = m.proOnly && !isPremium
            const pct     = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0
            const full    = usage.limit > 0 && usage.used >= usage.limit
            const active  = selectedModel === m.name

            return (
              <button
                key={m.name}
                disabled={locked}
                onClick={() => {
                  if (locked) return
                  setSelectedModel(m.name)
                  sendModelToBot(m.name)
                  setPage("main")
                }}
                className={`w-full p-4 rounded-2xl flex items-start justify-between transition-all ${
                  locked
                    ? "bg-neutral-900/50 border-2 border-neutral-800 opacity-60"
                    : active
                    ? "bg-blue-500/10 border-2 border-blue-500"
                    : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    locked ? "bg-neutral-800" : active ? "bg-blue-500" : "bg-neutral-800"
                  }`}>
                    {locked
                      ? <Lock className="w-4 h-4 text-neutral-500" />
                      : <Bot className={`w-5 h-5 ${active ? "text-white" : "text-neutral-400"}`} />
                    }
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white">{m.name}</p>
                      {m.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${m.tagColor}`}>{m.tag}</span>
                      )}
                      {locked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{t("locked")}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p>

                    {/* Hourly usage bar */}
                    {!locked && usage.limit > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-neutral-600">{usage.used}/{usage.limit} {t("hourlyLimit")}</span>
                          {full && usage.resetsInMin > 0 && (
                            <span className="text-xs text-amber-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{t("resetsIn")} {usage.resetsInMin}{t("min")}
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${full ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Token cost badge */}
                    {!locked && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-neutral-600" />
                        <span className="text-xs text-neutral-600">
                          {m.tokenCost} {m.tokenCost === 1 ? t("tokenCost") : t("tokensCost")} over limit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {active && !locked && <Check className="w-5 h-5 text-blue-500 shrink-0" />}
              </button>
            )
          })}

          {!isPremium && (
            <button
              onClick={() => { setPage("main"); setCurrentView("premium") }}
              className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl text-center text-sm text-amber-400 font-medium hover:border-amber-500/50 transition-colors"
            >
              Upgrade to Pro → unlock GPT models & higher limits
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Language selector ────────────────────────────────────────────────────
  if (page === "lang") {
    return (
      <div className="flex-1 bg-[#0a0a0a]">
        <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="font-semibold text-white">{t("language")}</h2>
        </div>
        <div className="p-4 space-y-2">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setPage("main") }}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                language === lang.code
                  ? "bg-blue-500/10 border-2 border-blue-500"
                  : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700"
              }`}
            >
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
  }

  // ── Preferences editor ───────────────────────────────────────────────────
  if (page === "prefs") {
    return (
      <div className="flex-1 bg-[#0a0a0a]">
        <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPage("main")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="font-semibold text-white">{t("preferences")}</h2>
        </div>
        <div className="p-4 space-y-4">
          {([["name","Name","Alex"], ["age","Age","25"], ["location","Location","Madrid"]] as [keyof typeof tempPrefs, string, string][]).map(([field, label, ph]) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-400">{label}</label>
              <input
                type="text" value={tempPrefs[field]}
                onChange={e => setTempPrefs({ ...tempPrefs, [field]: e.target.value })}
                className="w-full p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={ph}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-400">{t("yourPreferences")}</label>
            <textarea
              value={tempPrefs.preferences}
              onChange={e => setTempPrefs({ ...tempPrefs, preferences: e.target.value })}
              className="w-full p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[90px] resize-none"
              placeholder="I prefer concise answers..."
            />
          </div>
          <button
            onClick={() => { setUserPreferences(tempPrefs); setPage("main") }}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            {t("save")}
          </button>
        </div>
      </div>
    )
  }

  // ── Main settings ────────────────────────────────────────────────────────
  const usage = hourlyUsage[selectedModel]
  const pct   = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setCurrentView("home")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">{t("settings")}</h2>
      </div>

      <div className="p-4 space-y-3">
        {/* Model row con mini usage bar */}
        <button
          onClick={() => setPage("model")}
          className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-left">{t("model")}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-neutral-500">{selectedModel}</p>
                {usage.limit > 0 && (
                  <span className="text-xs text-neutral-600">{usage.used}/{usage.limit}/hr</span>
                )}
              </div>
              {usage.limit > 0 && (
                <div className="mt-1.5 h-1 bg-neutral-800 rounded-full overflow-hidden w-32">
                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-purple-500"}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 shrink-0" />
        </button>

        {/* Language */}
        <button
          onClick={() => setPage("lang")}
          className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">{t("language")}</p>
              <p className="text-sm text-neutral-500">{LANGS.find(l => l.code === language)?.name}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500" />
        </button>

        {/* Preferences */}
        <button
          onClick={() => { setTempPrefs(userPreferences); setPage("prefs") }}
          className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-white">{t("preferences")}</p>
              <p className="text-sm text-neutral-500">{userPreferences.name || "Not set"}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500" />
        </button>
      </div>
    </div>
  )
}
