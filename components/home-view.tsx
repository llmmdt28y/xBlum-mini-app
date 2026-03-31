"use client"

import { useApp } from "@/lib/app-context"
import { Send, Image, Coins, MessageCircle, AlertTriangle, Clock, Sparkles } from "lucide-react"
import { useState, useRef } from "react"

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

  function handleCreateImage() {
    setMessage("Create an image of ")
    inputRef.current?.focus()
  }

  function handleGetTokens() {
    setCurrentView("store")
  }

  function handleAddToChat() {
    // Función para Telegram - se agregará después
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4 Mini"

  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-16 pb-8 bg-black">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">

        {/* ── Title ───────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">How can I help you today?</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-500 mt-2 hover:text-neutral-400 transition-colors"
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

        {/* ── Input ───────────────────────────────────────────────────── */}
        <div className="w-full">
          <div className="relative">
            <input 
              ref={inputRef} 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
              className="w-full pl-5 pr-14 py-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button 
              onClick={handleSend} 
              disabled={!message.trim()}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all " +
                (message.trim()
                  ? "bg-neutral-700 text-white hover:bg-neutral-600 active:bg-neutral-500"
                  : "bg-neutral-800 text-neutral-600 cursor-not-allowed")
              }
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────── */}
        <div className="w-full flex flex-col gap-3">
          {/* Row with two buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCreateImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
            >
              <Image className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium">Create image</span>
            </button>
            <button
              onClick={handleGetTokens}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Get Tokens</span>
            </button>
          </div>
          
          {/* Add to chat button */}
          <button
            onClick={handleAddToChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium">Add to chat</span>
          </button>
        </div>

        {/* ── Premium upsell ───────────────────────────────────────────── */}
        {!isPremium && (
          <button
            onClick={() => setCurrentView("premium")}
            className="w-full p-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl text-left hover:border-neutral-600 transition-all group mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t("getXBlumPro")}</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  More limits · GPT-5.4 · AI images · from 800 ⭐
                </p>
              </div>
            </div>
          </button>
        )}

      </div>
    </div>
  )
}
