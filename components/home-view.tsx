"use client"

import { useApp } from "@/lib/app-context"
import { Send, Image, Coins, MessageCircle, AlertTriangle, Clock } from "lucide-react"
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

    // Generamos el enlace directo al bot con el texto prellenado (sin modo inline)
    const telegramUrl = `https://t.me/xBlum_ibot?text=${encodeURIComponent(text)}`

    // Si estamos dentro de la Mini App de Telegram usamos su método nativo, sino abrimos pestaña
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(telegramUrl)
    } else {
      window.open(telegramUrl, "_blank")
    }

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
          <h1 className="text-2xl font-bold text-white">{t("howCanIHelp")}</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-500 mt-2 hover:text-neutral-400 transition-colors"
          >
            {t("poweredBy")} <span className="font-medium text-neutral-400">{selectedModel}</span>
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
                      {t("upgradePro")}
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
              placeholder={t("typeMessage")}
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
        <div className="w-full flex flex-wrap justify-center gap-2">
          <button
            onClick={handleCreateImage}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <Image className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{t("createImage")}</span>
          </button>
          <button
            onClick={handleGetTokens}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <Coins className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{t("getTokens")}</span>
          </button>
          <button
            onClick={handleAddToChat}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{t("addToChat")}</span>
          </button>
        </div>

        {/* ── Telegram Banner ───────────────────────────────────────────── */}
        <div className="w-full flex justify-center -mt-2 overflow-visible">
          <img 
            src="/telegram-banner.png" 
            alt="Chat xBlum in Telegram" 
            className="w-[120%] h-auto rounded-2xl"
          />
        </div>

      </div>
    </div>
  )
}
