"use client"

import { useApp } from "@/lib/app-context"
import { Send, Sparkles, Code, FileText, Search, AlertTriangle, Clock, Zap } from "lucide-react"
import { useState, useRef } from "react"
 
/* ── Stars background ────────────────────────────────────────────────── */
const STAR_DATA = [
  { top:"12%", left:"6%",   sz:2,   op:0.5,  d:0   },
  { top:"22%", left:"14%",  sz:1.5, op:0.35, d:0.5 },
  { top:"38%", left:"4%",   sz:1,   op:0.25, d:1   },
  { top:"50%", left:"18%",  sz:1.5, op:0.4,  d:0.2 },
  { top:"18%", right:"8%",  sz:2,   op:0.5,  d:0.3 },
  { top:"32%", right:"5%",  sz:1,   op:0.25, d:0.7 },
  { top:"44%", right:"16%", sz:1.5, op:0.4,  d:0.1 },
  { top:"58%", right:"10%", sz:1,   op:0.3,  d:0.9 },
]

function StarsBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map((s, i) => (
        <div key={i} 
          /* AJUSTE: Parpadeo sutil con brillo suave, sin movimiento */
          className="absolute rounded-full bg-white animate-twinkle-sutil shadow-[0_0_6px_1px_rgba(255,255,255,0.3)]"
          style={{
            top: s.top,
            left:  "left"  in s ? s.left  : undefined,
            right: "right" in s ? s.right : undefined,
            /* Mantenemos el tamaño original del archivo antiguo */
            width: s.sz * 2 + "px", 
            height: s.sz * 2 + "px",
            opacity: s.op, 
            animationDelay: s.d + "s", 
            animationDuration: "3s",
          }}
        />
      ))}
    </div>
  )
}

/* ── Suggestions ─────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon:Sparkles, text:"Creative writing", color:"text-purple-400",  query:"Help me write a creative story about" },
  { icon:Code,     text:"Code help",        color:"text-emerald-400", query:"Help me fix this code:" },
  { icon:Search,   text:"Web search",       color:"text-blue-400",    query:"Search the web for" },
  { icon:FileText, text:"Summarize",        color:"text-orange-400",  query:"Summarize this for me:" },
]

/* ── Component ───────────────────────────────────────────────────────── */
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
    /* AJUSTE: justify-start y pt-[10vh] para subir la interfaz y dejar espacio abajo */
    <div className="flex-1 flex flex-col items-center justify-start pt-[10vh] px-4 pb-8 relative">
      <StarsBg />
      <div className="flex flex-col items-center gap-5 w-full max-w-md relative z-10">

        {/* ── Logo principal ── */}
        <div className="relative inline-flex">
          <img
            src="/icon-dark-32x32.png"
            alt="xBlum"
            className="w-36 h-36 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          />
          {isPremium && (
            <div className="absolute top-1 right-1 w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/40 ring-2 ring-[#0a0a0a]">
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* ── Title ── */}
        <div className="text-center -mt-2">
          <h1 className="text-2xl font-bold text-white">{t("howCanIHelp")}</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-500 mt-1 hover:text-neutral-400 transition-colors"
          >
            Powered by <span className="font-semibold text-neutral-300">{selectedModel}</span>
          </button>
        </div>

        {/* ── Throttle warning ── */}
        {showThrottle && (
          <div className="w-full p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-orange-300 font-medium">{t("throttleActive")}</p>
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">{minutesUntilReset} {t("min")}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{t("throttleDesc")}</p>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setCurrentView("settings")}
                  className="text-xs text-blue-400 underline underline-offset-2"
                >
                  {t("changeModel")}
                </button>
                {!isPremium && (
                  <button
                    onClick={() => setCurrentView("premium")}
                    className="text-xs text-amber-400 underline underline-offset-2"
                  >
                    upgrade Pro
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Suggestion chips ── */}
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

        {/* ── Premium upsell (free users) ── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-amber-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <img
                src="/xblum-logo-blue.png"
                alt=""
                className="w-10 h-10 object-contain shrink-0 group-hover:drop-shadow-lg transition-all"
              />
              <div>
                <p className="text-white font-semibold text-sm">{t("getXBlumPro")}</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  More limits · GPT-5.4 · AI images · from 800 ⭐
                </p>
              </div>
            </div>
          </button>
        )}

        {/* ── Search input ── */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="w-full pl-11 pr-14 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all " +
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
              Tap to send to xBlum in chat
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
