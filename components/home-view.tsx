"use client"

import { useApp } from "@/lib/app-context"
import { Send, Sparkles, Code, FileText, Search, AlertTriangle, Clock } from "lucide-react"
import { useState, useRef } from "react"

const STAR_DATA = [
  { top:"15%", left:"8%",   sz:2,   op:0.6,  d:0   },
  { top:"25%", left:"12%",  sz:1.5, op:0.4,  d:0.5 },
  { top:"35%", left:"5%",   sz:1,   op:0.3,  d:1   },
  { top:"45%", left:"15%",  sz:2,   op:0.5,  d:0.2 },
  { top:"55%", left:"8%",   sz:1.5, op:0.4,  d:0.8 },
  { top:"20%", right:"10%", sz:2,   op:0.6,  d:0.3 },
  { top:"30%", right:"6%",  sz:1,   op:0.3,  d:0.7 },
  { top:"40%", right:"14%", sz:1.5, op:0.5,  d:0.1 },
  { top:"60%", right:"12%", sz:1,   op:0.35, d:0.9 },
]

function StarsBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: s.top,
            left:  "left"  in s ? s.left  : undefined,
            right: "right" in s ? s.right : undefined,
            width: s.sz * 2 + "px", height: s.sz * 2 + "px",
            opacity: s.op, animationDelay: s.d + "s", animationDuration: "2.5s",
          }}
        />
      ))}
    </div>
  )
}

const SUGGESTIONS = [
  { icon:Sparkles, text:"Creative writing", color:"text-purple-400",  query:"Help me write a creative story about" },
  { icon:Code,     text:"Code help",        color:"text-emerald-400", query:"Help me fix this code:" },
  { icon:Search,   text:"Web search",       color:"text-blue-400",    query:"Search the web for" },
  { icon:FileText, text:"Summarize",        color:"text-orange-400",  query:"Summarize this for me:" },
]

export function HomeView() {
  const {
    t, selectedModel, setCurrentView, isPremium,
    isThrottled, minutesUntilReset, sendToBot,
  } = useApp()

  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSend() {
    const text = message.trim()
    if (!text) return
    sendToBot(text)
    setMessage("")
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) handleSend()
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4 Mini"

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative">
      <StarsBg />
      <div className="flex flex-col items-center gap-5 w-full max-w-md relative z-10">

        {/* ── Logo — solo PNG, sin contenedor con fondo ───────────────── */}
        <div className="relative">
          <img
            src="/xblum-logo-blue.png"
            alt="xBlum"
            className="w-50 h-50 object-contain drop-shadow-2xl"
          />
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* ── Title ───────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">{t("howCanIHelp")}</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-500 mt-1 hover:text-neutral-400 transition-colors"
          >
            Powered by <span className="font-medium text-neutral-400">{selectedModel}</span>
          </button>
        </div>

        {/* ── Throttle warning ────────────────────────────────────────── */}
        {showThrottle && (
          <div className="w-full p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-orange-300 font-medium">{t("throttleActive")}</p>
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{minutesUntilReset} {t("min")}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{t("throttleDesc")}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setCurrentView("settings")} className="text-xs text-blue-400 underline underline-offset-2">
                  {t("changeModel")}
                </button>
                {!isPremium && (
                  <>
                    <span className="text-neutral-600 text-xs">·</span>
                    <button onClick={() => setCurrentView("premium")} className="text-xs text-amber-400 underline underline-offset-2">
                      upgrade Pro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Suggestions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {SUGGESTIONS.map((item, i) => (
            <button key={i}
              onClick={() => { setMessage(item.query); inputRef.current?.focus() }}
              className="flex items-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-800 rounded-xl transition-colors text-left"
            >
              <item.icon className={"w-4 h-4 " + item.color + " shrink-0"} />
              <span className="text-sm text-neutral-300">{item.text}</span>
            </button>
          ))}
        </div>

        {/* ── Premium upsell — logo PNG sin contenedor ─────────────────── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full p-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-neutral-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <img
                src="/xblum-logo-blue.png"
                alt="xBlum Pro"
                className="w-9 h-9 object-contain shrink-0 group-hover:drop-shadow-lg transition-all"
              />
              <div>
                <p className="text-white font-medium text-sm">{t("getXBlumPro")}</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  More limits · GPT-5.4 · AI images · from 800 ⭐
                </p>
              </div>
            </div>
          </button>
        )}

        {/* ── Input ───────────────────────────────────────────────────── */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
            <input ref={inputRef} type="text" value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="w-full pl-10 pr-14 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button onClick={handleSend} disabled={!message.trim()}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all " +
                (message.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg shadow-blue-500/30"
                  : "bg-neutral-800 text-neutral-600 cursor-not-allowed")
              }
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {message.trim() && (
            <p className="text-xs text-neutral-600 mt-1.5 text-center">
              Tap to send this to xBlum in chat
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
