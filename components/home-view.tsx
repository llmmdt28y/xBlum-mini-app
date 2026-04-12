"use client"

import { useApp } from "@/lib/app-context"
import { Send, Image, Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, Code, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"

type ExploreModalType = "private" | "telegram" | "google" | "writing" | "coding" | null

export function HomeView() {
  const {
    t, selectedModel, setCurrentView, isPremium,
    isThrottled, minutesUntilReset, sendChatMessage, openExploreTopic,
  } = useApp()

  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [exploreModal, setExploreModal] = useState<ExploreModalType>(null)
  const [modalInput, setModalInput] = useState("")
  const [sending, setSending] = useState(false)
  const [openingTopic, setOpeningTopic] = useState<ExploreModalType>(null)
  const [currentBanner, setCurrentBanner] = useState(0)
  const bannerContainerRef = useRef<HTMLDivElement>(null)

  // Main input bar → sends directly, AI responds in bot chat
  async function handleSend() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setMessage("")
    await sendChatMessage(text)
    setSending(false)
  }

  // Modal quick-send buttons → opens the corresponding topic + sends message inside it
  async function handleQuickSend(topicKey: ExploreModalType, text: string) {
    if (sending || !topicKey) return
    setExploreModal(null)
    setModalInput("")
    setSending(true)
    await openExploreTopic(topicKey, text)
    setSending(false)
  }

  // Explore card tap → opens/creates the topic (no first message)
  async function handleOpenTopic(topicKey: ExploreModalType) {
    if (openingTopic || !topicKey) return
    setOpeningTopic(topicKey)
    await openExploreTopic(topicKey)
    setOpeningTopic(null)
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

  // Banner carousel - only 1 banner for now, more coming soon
  const totalBanners = 1

  function handleBannerScroll(direction: "left" | "right") {
    if (direction === "left" && currentBanner > 0) {
      setCurrentBanner(currentBanner - 1)
    } else if (direction === "right" && currentBanner < totalBanners - 1) {
      setCurrentBanner(currentBanner + 1)
    }
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4 Mini"

  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-16 pb-8 relative overflow-hidden">
      {/* Gradient background: black to warm orange/red */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #000000 0%, #0a0a0a 30%, #1a0a05 50%, #3d1a0a 70%, #6b2810 85%, #8b3a1d 100%)"
        }}
      />
      
      {/* Subtle grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="flex flex-col items-center gap-6 w-full max-w-md relative z-10">

        {/* ── Title ───────────────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{t("howCanIHelp")}</h1>
          <button
            onClick={() => setCurrentView("settings")}
            className="text-xs text-neutral-400 mt-2 hover:text-neutral-300 transition-colors"
          >
            {t("poweredBy")} <span className="font-medium text-neutral-300">{selectedModel}</span>
          </button>
        </div>

        {/* ── Throttle warning ────────────────────────────────────────── */}
        {showThrottle && (
          <div className="w-full p-3.5 bg-orange-500/10 backdrop-blur-md border border-orange-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-orange-300 font-medium">{t("throttleActive")}</p>
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{minutesUntilReset} {t("min")}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{t("throttleDesc")}</p>
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

        {/* ── Input with liquid blur ─────────────────────────────────── */}
        <div className="w-full">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="w-full pl-5 pr-14 py-4 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all backdrop-blur-md " +
                (message.trim() && !sending
                  ? "bg-white/20 border border-white/30 text-white hover:bg-white/30 active:bg-white/40"
                  : "bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed")
              }
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-neutral-500 border-t-neutral-300 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* ── Action Buttons with liquid blur ─────────────────────────── */}
        <div className="w-full flex flex-wrap justify-center gap-3">
          <button
            onClick={handleCreateImage}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/10 hover:border-white/30 active:bg-white/15 transition-all"
          >
            <Image className="w-4 h-4 text-neutral-300" />
            <span className="text-sm">{t("createImage")}</span>
          </button>
          <button
            onClick={handleGetTokens}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/10 hover:border-white/30 active:bg-white/15 transition-all"
          >
            <Coins className="w-4 h-4 text-neutral-300" />
            <span className="text-sm">{t("getTokens")}</span>
          </button>
          <button
            onClick={handleAddToChat}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/10 hover:border-white/30 active:bg-white/15 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-neutral-300" />
            <span className="text-sm">{t("addToChat")}</span>
          </button>
        </div>

        {/* ── Native Telegram Banner ──────────────────────────────────── */}
        <div className="w-full -mt-1">
          <div 
            ref={bannerContainerRef}
            className="relative overflow-hidden"
          >
            {/* Banner Container - swipeable */}
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {/* Banner 1: Telegram */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                  {/* Banner background with subtle pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
                  </div>
                  
                  <div className="relative flex items-center p-4 gap-4">
                    {/* Phone mockup placeholder - you'll replace with actual PNG */}
                    <div className="relative flex-shrink-0 w-20 h-36">
                      <img 
                        src="/telegram-phone.png" 
                        alt="xBlum on Telegram"
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-1.5 mb-2">
                        <span className="px-2 py-0.5 bg-[#0088cc] rounded text-[10px] font-bold text-white uppercase tracking-wide">
                          Telegram
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-base leading-tight mb-1">
                        Chat with xBlum
                      </h3>
                      <p className="text-neutral-300 text-xs leading-relaxed">
                        Add xBlum to your Telegram chats and get AI assistance anywhere
                      </p>
                      <button className="mt-3 self-start px-4 py-1.5 bg-[#0088cc] hover:bg-[#0099dd] rounded-lg text-white text-xs font-semibold transition-colors">
                        Add to Telegram
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* More banners will be added here */}
            </div>

            {/* Navigation arrows (hidden when only 1 banner) */}
            {totalBanners > 1 && (
              <>
                <button
                  onClick={() => handleBannerScroll("left")}
                  disabled={currentBanner === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBannerScroll("right")}
                  disabled={currentBanner === totalBanners - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Carousel indicators and coming soon text */}
          <div className="flex flex-col items-center mt-3 gap-1.5">
            {/* Dots indicator */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.max(totalBanners, 3) }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i < totalBanners 
                      ? i === currentBanner 
                        ? "bg-white w-3" 
                        : "bg-white/40"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-white/50 text-[10px]">
              More banners coming soon
            </p>
          </div>
        </div>

        {/* ── Explore Section with liquid blur cards ──────────────────── */}
        <div className="w-full mt-4">
          <h2 className="text-white font-bold text-lg mb-3">Explore</h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Private Mode */}
            <button
              onClick={() => setExploreModal("private")}
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition-all"
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[10px] text-neutral-200 font-medium">
                beta
              </span>
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-white font-medium text-sm">Private Mode</p>
              <p className="text-cyan-400 text-xs mt-0.5">Zero trace</p>
            </button>

            {/* TON Wallet */}
            <button
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left opacity-70 cursor-not-allowed"
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[10px] text-neutral-200 font-medium">
                soon
              </span>
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <img src="/TON-ICON.png" alt="TON" className="w-8 h-8" />
              </div>
              <p className="text-white font-medium text-sm">TON Wallet</p>
            </button>

            {/* Search on Telegram */}
            <button
              onClick={() => setExploreModal("telegram")}
              disabled={openingTopic === "telegram"}
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition-all disabled:opacity-60"
            >
              {openingTopic === "telegram" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
              )}
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <img src="/telegram-icon.png" alt="Telegram" className="w-8 h-8" />
              </div>
              <p className="text-white font-medium text-sm">Search on Telegram</p>
            </button>

            {/* Google Tools */}
            <button
              onClick={() => setExploreModal("google")}
              disabled={openingTopic === "google"}
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition-all disabled:opacity-60"
            >
              {openingTopic === "google" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
              )}
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <img src="/gmail.png" alt="Google" className="w-8 h-8" />
              </div>
              <p className="text-white font-medium text-sm">Google Tools</p>
            </button>

            {/* Writing & Translation */}
            <button
              onClick={() => setExploreModal("writing")}
              disabled={openingTopic === "writing"}
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition-all disabled:opacity-60"
            >
              {openingTopic === "writing" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
              )}
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white font-medium text-sm">Writing Assistant</p>
            </button>

            {/* Coding & Tech */}
            <button
              onClick={() => setExploreModal("coding")}
              disabled={openingTopic === "coding"}
              className="relative bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition-all disabled:opacity-60"
            >
              {openingTopic === "coding" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
              )}
              <div className="w-10 h-10 mb-3 flex items-center justify-center">
                <Code className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-medium text-sm">Coding & Tech</p>
            </button>

          </div>
        </div>

      </div>

      {/* ── Explore Modals — shown before opening the topic ─────────────────── */}
      {exploreModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setExploreModal(null); setModalInput("") }}
          />

          <div className="relative w-full bg-[#1a1a1a] rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            <button
              onClick={() => { setExploreModal(null); setModalInput("") }}
              className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pt-6 pb-4 overflow-y-auto flex-1">

              {/* Private Mode Modal */}
              {exploreModal === "private" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <Lock className="w-16 h-16 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white font-bold text-xl">Private Mode</h2>
                      <span className="px-2 py-0.5 bg-neutral-700 rounded-full text-xs text-neutral-300 font-medium">beta</span>
                    </div>
                    <p className="text-neutral-500 text-sm text-center px-4">
                      Opens a dedicated topic where nothing is saved — no history, no memory, no context. Ever.
                    </p>
                  </div>

                  {/* Privacy guarantees */}
                  <div className="mx-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                    {[
                      "No conversation history saved",
                      "No memory or profile updates",
                      "No context from past chats",
                      "Each message treated as the first",
                    ].map((line, i) => (
                      <p key={i} className="text-amber-300/80 text-xs font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="mx-4 bg-neutral-800/50 rounded-2xl overflow-hidden">
                    {[
                      { icon: "📄", text: "Review a contract for hidden risks" },
                      { icon: "✉️", text: "Draft a sensitive message" },
                      { icon: "🤔", text: "Ask about a confusing situation" },
                      { icon: "🧘", text: "I need advice on something personal" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSend("private", item.text)}
                        disabled={sending}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 last:border-b-0 disabled:opacity-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Open topic button */}
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("private")}
                      disabled={sending}
                      className="w-full py-3.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-2xl hover:bg-amber-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {sending ? "Opening..." : "Open Private Topic"}
                    </button>
                  </div>
                </>
              )}

              {/* Telegram Search Modal */}
              {exploreModal === "telegram" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <img src="/telegram-icon.png" alt="Telegram" className="w-16 h-16" />
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">Search on Telegram</h2>
                    <p className="text-neutral-500 text-sm">Opens a dedicated Telegram Search topic</p>
                  </div>
                  <div className="mx-4 bg-neutral-800/50 rounded-2xl overflow-hidden">
                    {[
                      { icon: "🔍", text: "Find channels similar to @unofficialus" },
                      { icon: "📈", text: "How to grow followers on my channel" },
                      { icon: "🎨", text: "Create trending visuals for my post" },
                      { icon: "🚫", text: "My Telegram account was banned" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSend("telegram", item.text)}
                        disabled={sending}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 last:border-b-0 disabled:opacity-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("telegram")}
                      disabled={sending}
                      className="w-full py-3.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold rounded-2xl hover:bg-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {sending ? "Opening..." : "Open Telegram Search Topic"}
                    </button>
                  </div>
                </>
              )}

              {/* Google Tools Modal */}
              {exploreModal === "google" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <img src="/gmail.png" alt="Google" className="w-16 h-16" />
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">Google Tools</h2>
                    <p className="text-neutral-500 text-sm">Opens a dedicated Google Tools topic</p>
                  </div>
                  <div className="mx-4 mb-3 bg-neutral-800/60 border border-neutral-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img src="/gmail.png" alt="Gmail" className="w-8 h-8" />
                      <div>
                        <p className="text-white font-semibold text-sm">Gmail</p>
                        <p className="text-neutral-500 text-xs">Read, send & manage emails with AI</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickSend("google", "Connect my Gmail account")}
                        disabled={sending}
                        className="flex-1 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Connect Gmail
                      </button>
                      <button
                        onClick={() => handleQuickSend("google", "Read my latest emails")}
                        disabled={sending}
                        className="flex-1 py-2.5 bg-neutral-700 text-white text-sm font-medium rounded-xl hover:bg-neutral-600 active:scale-95 transition-all disabled:opacity-50"
                      >
                        Read emails
                      </button>
                    </div>
                  </div>
                  <div className="mx-4 bg-neutral-800/50 rounded-2xl overflow-hidden">
                    {[
                      { icon: "✉️", text: "Compose an email for me" },
                      { icon: "📁", text: "Connect Google Drive" },
                      { icon: "📝", text: "Connect Google Docs" },
                      { icon: "📊", text: "Connect Google Sheets" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSend("google", item.text)}
                        disabled={sending}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 last:border-b-0 disabled:opacity-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("google")}
                      disabled={sending}
                      className="w-full py-3.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold rounded-2xl hover:bg-yellow-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {sending ? "Opening..." : "Open Google Tools Topic"}
                    </button>
                  </div>
                </>
              )}

              {/* Writing Assistant Modal */}
              {exploreModal === "writing" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-blue-400" />
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">Writing Assistant</h2>
                    <p className="text-neutral-500 text-sm">Opens a dedicated Writing topic</p>
                  </div>
                  <div className="mx-4 bg-neutral-800/50 rounded-2xl overflow-hidden">
                    {[
                      { icon: "🌍", text: "Translate naturally to English" },
                      { icon: "✏️", text: "Fix grammar in my message" },
                      { icon: "📚", text: "Explain the difference between similar words" },
                      { icon: "💬", text: "Polite English phrases for business" },
                      { icon: "✨", text: "Rewrite this text more fluently" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSend("writing", item.text)}
                        disabled={sending}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 last:border-b-0 disabled:opacity-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("writing")}
                      disabled={sending}
                      className="w-full py-3.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold rounded-2xl hover:bg-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {sending ? "Opening..." : "Open Writing Topic"}
                    </button>
                  </div>
                </>
              )}

              {/* Coding & Tech Modal */}
              {exploreModal === "coding" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <Code className="w-16 h-16 text-green-400" />
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">Coding & Tech</h2>
                    <p className="text-neutral-500 text-sm">Opens a dedicated Coding topic</p>
                  </div>
                  <div className="mx-4 bg-neutral-800/50 rounded-2xl overflow-hidden">
                    {[
                      { icon: "💻", text: "Explain this code to me" },
                      { icon: "🐛", text: "Help me debug this error" },
                      { icon: "🚀", text: "Optimize my code for performance" },
                      { icon: "📱", text: "Create a simple app structure" },
                      { icon: "🔧", text: "Best practices for this technology" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickSend("coding", item.text)}
                        disabled={sending}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-700/50 transition-colors border-b border-neutral-700/50 last:border-b-0 disabled:opacity-50"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white text-sm text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("coding")}
                      disabled={sending}
                      className="w-full py-3.5 bg-green-500/20 border border-green-500/40 text-green-300 font-bold rounded-2xl hover:bg-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {sending ? "Opening..." : "Open Coding Topic"}
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Ask anything input bar */}
            <div className="p-4 border-t border-neutral-800">
              <div className="relative">
                <input
                  type="text"
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && modalInput.trim() && exploreModal) {
                      handleQuickSend(exploreModal, modalInput.trim())
                    }
                  }}
                  placeholder="Ask anything..."
                  className="w-full pl-4 pr-12 py-3 bg-neutral-800 rounded-full text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 text-sm"
                />
                <button
                  onClick={() => {
                    if (modalInput.trim() && exploreModal) handleQuickSend(exploreModal, modalInput.trim())
                  }}
                  disabled={sending}
                  className={"absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors " +
                    (modalInput.trim() ? "bg-neutral-600 text-white" : "bg-neutral-700 text-neutral-500")}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-6 bg-[#1a1a1a]" />
          </div>
        </div>
      )}
    </div>
  )
}
