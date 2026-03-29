"use client"

import { useApp } from "@/lib/app-context"
import { Send, Sparkles, ImageIcon, Code, FileText, Clock, AlertCircle, Search } from "lucide-react"
import { useState, useRef } from "react"

function Stars() {
  const s = [
    {t:"15%",l:"8%",sz:2,op:.6,d:0},{t:"25%",l:"12%",sz:1.5,op:.4,d:.5},
    {t:"35%",l:"5%",sz:1,op:.3,d:1},{t:"45%",l:"15%",sz:2,op:.5,d:.2},
    {t:"55%",l:"8%",sz:1.5,op:.4,d:.8},{t:"20%",r:"10%",sz:2,op:.6,d:.3},
    {t:"30%",r:"6%",sz:1,op:.3,d:.7},{t:"40%",r:"14%",sz:1.5,op:.5,d:.1},
    {t:"60%",r:"12%",sz:1,op:.35,d:.9},
  ] as { t:string; l?:string; r?:string; sz:number; op:number; d:number }[]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {s.map((star, i) => (
        <div 
          key={i} 
          className="absolute rounded-full bg-white animate-pulse"
          style={{ 
            top: star.t, 
            left: star.l, 
            right: star.r,
            width: `${star.sz * 2}px`, 
            height: `${star.sz * 2}px`,
            opacity: star.op, 
            animationDelay: `${star.d}s`, 
            animationDuration: "2.5s" 
          }} 
        />
      ))}
    </div>
  )
}

const SUGGESTIONS = [
  { icon: Sparkles, text: "Creative writing", color: "text-purple-400", query: "Help me write a creative story about" },
  { icon: Code,     text: "Code help",        color: "text-emerald-400", query: "Help me fix this code:" },
  { icon: ImageIcon,text: "Image ideas",      color: "text-blue-400",   query: "Generate an image of" },
  { icon: FileText, text: "Summarize",        color: "text-orange-400", query: "Summarize this for me:" },
]

export default function HomeView() {
  const { t, selectedModel, setCurrentView, isPremium, hourlyUsage, sendToBot } = useApp()
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const usage = hourlyUsage[selectedModel]
  const full = usage.limit > 0 && usage.used >= usage.limit

  const handleSend = () => {
    const text = message.trim()
    if (!text) return
    sendToBot(text)
    setMessage("")
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend()
  }

  const handleSuggestion = (query: string) => {
    setMessage(query)
    inputRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative">
      <Stars />
      <div className="flex flex-col items-center gap-5 w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/30">
          <img
            src="/xblum-logo-blue.png"
            alt="xBlum"
            className="w-full h-full object-contain"
          />
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">{t("howCanIHelp")}</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-500 mt-1 hover:text-neutral-400 transition-colors"
          >
            Powered by <span className="font-medium text-neutral-400">{selectedModel}</span>
          </button>
        </div>

        {/* Hourly usage bar */}
        {usage.limit > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-neutral-600 mb-1.5">
              <span>{selectedModel} · {usage.used}/{usage.limit} {t("hourlyLimit")}</span>
              {full && usage.resetsInMin > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Clock className="w-3 h-3" />
                  {t("resetsIn")} {usage.resetsInMin}{t("min")}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usage.used >= usage.limit ? "bg-red-500" : usage.used / usage.limit > 0.7 ? "bg-amber-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Limit warning */}
        {full && (
          <div className="w-full p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-amber-300 font-medium">Hourly limit for {selectedModel}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {usage.resetsInMin > 0 ? `Free in \~${usage.resetsInMin} min · ` : ""}
                <button onClick={() => setCurrentView("settings")} className="text-blue-400 underline underline-offset-2">
                  {t("changeModel")}
                </button>
                {!isPremium && (
                  <> · <button onClick={() => setCurrentView("premium")} className="text-amber-400 underline underline-offset-2">upgrade Pro</button></>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {SUGGESTIONS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(item.query)}
              className="flex items-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-800 rounded-xl transition-colors text-left"
            >
              <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
              <span className="text-sm text-neutral-300">{item.text}</span>
            </button>
          ))}
        </div>

        {/* Premium upsell */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full p-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-neutral-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t("getXBlumPro")}</p>
                <p className="text-neutral-500 text-xs mt-0.5">3-4x limits · GPT-5.4 · AI images · from 800 ⭐</p>
              </div>
            </div>
          </button>
        )}

        {/* Input Area */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="w-full pl-10 pr-14 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                message.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg shadow-blue-500/30"
                  : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {message.trim() && (
            <p className="text-xs text-neutral-600 mt-1.5 text-center">
              Tap ↑ to send this to xBlum in chat
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
