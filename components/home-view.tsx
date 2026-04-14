"use client"

import { useApp } from "@/lib/app-context"
import { Image, Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, Code, Sparkles } from "lucide-react"
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

  const showThrottle = isThrottled && selectedModel === "Grok 4 Mini"

  return (
    <div className="flex-1 flex flex-col items-center px-4 pb-8 bg-black">
      <div className="flex flex-col items-center gap-5 w-full max-w-md">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="w-full pt-6 pb-2">
          <p className="text-neutral-500 text-sm font-medium mb-1">{t("poweredBy")} <button onClick={() => setCurrentView("settings")} className="text-neutral-400 hover:text-neutral-300 transition-colors font-semibold">{selectedModel}</button></p>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            {t("howCanIHelp")}
          </h1>
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
              className="w-full pl-5 pr-14 py-4 rounded-full text-white placeholder:text-[#636366] focus:outline-none transition-all text-sm"
              style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className={
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all " +
                (message.trim() && !sending
                  ? "bg-white text-black active:scale-95"
                  : "text-[#48484a] cursor-not-allowed")
              }
              style={!(message.trim() && !sending) ? { background: "#2c2c2e" } : {}}
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-[#48484a] border-t-neutral-300 rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────── */}
        <div className="w-full flex flex-nowrap justify-start gap-2">
          <button
            onClick={handleCreateImage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
          >
            <Image className="w-3.5 h-3.5 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-xs font-medium">{t("createImage")}</span>
          </button>
          <button
            onClick={handleGetTokens}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
          >
            <Coins className="w-3.5 h-3.5 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-xs font-medium">{t("getTokens")}</span>
          </button>
          <button
            onClick={handleAddToChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#1c1c1e", border: "1px solid #2c2c2e" }}
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-xs font-medium">{t("addToChat")}</span>
          </button>
        </div>

        {/* ── Referral Banner ─────────────────────────────────────────── */}
        <button
          onClick={() => setCurrentView("referral")}
          className="w-full relative overflow-hidden active:opacity-80 transition-opacity text-left"
          style={{
            background: "#060606",
            border: "1px solid #1e1e1e",
            borderRadius: "20px",
            height: "82px",
          }}
        >
          {/* Subtle left glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 10% 50%, rgba(255,255,255,0.03) 0%, transparent 55%)"
          }} />

          {/* Content row */}
          <div className="relative z-10 flex items-center justify-between h-full px-5">

            {/* Left: text + button */}
            <div className="flex flex-col gap-2">
              <p className="text-white font-bold text-[15px] leading-tight">
                Invite a Friend & Get<br />Free Tokens
              </p>

              {/* Liquid glass button — compact */}
              <div
                className="flex items-center gap-1 px-3 py-1 rounded-full w-fit relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.4)",
                }}
              >
                <div className="absolute inset-x-2 top-0 h-px" style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)"
                }} />
                <span className="text-white text-[10px] font-medium relative z-10 tracking-wide">share invite</span>
                <span className="text-white text-[10px] relative z-10" style={{ opacity: 0.55 }}>›</span>
              </div>
            </div>

            {/* Right: 3 coins dispersed like reference — diagonal top-right to bottom-right */}
            <div className="relative shrink-0" style={{ width: "130px", height: "82px" }}>
              {/* Top-left coin — smallest, most faded, partially clipped at top */}
              <img
                src="/ton-coin.png"
                alt=""
                className="absolute"
                style={{
                  width: "44px", height: "44px",
                  top: "-8px", left: "8px",
                  opacity: 0.35,
                  transform: "rotate(20deg)",
                  filter: "brightness(0.6)",
                }}
              />
              {/* Center coin — medium */}
              <img
                src="/ton-coin.png"
                alt=""
                className="absolute"
                style={{
                  width: "56px", height: "56px",
                  top: "10px", right: "44px",
                  opacity: 0.65,
                  transform: "rotate(-10deg)",
                  filter: "brightness(0.8)",
                }}
              />
              {/* Bottom-right coin — largest, sharpest, with blue glow */}
              <img
                src="/ton-coin.png"
                alt=""
                className="absolute"
                style={{
                  width: "70px", height: "70px",
                  bottom: "-4px", right: "0px",
                  opacity: 1,
                  transform: "rotate(6deg)",
                  filter: "drop-shadow(0 4px 14px rgba(30,140,255,0.5))",
                }}
              />
            </div>
          </div>
        </button>

        {/* ── Explore Section ─────────────────────────────────────────── */}
        <div className="w-full mt-4">
          <h2 className="text-white font-bold text-lg mb-3">Explore</h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Private Mode */}
            <button
              onClick={() => setExploreModal("private")}
              className="relative rounded-2xl p-4 text-left active:opacity-70 transition-opacity"
              style={{ background: "#1c1c1e" }}
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#2c2c2e", color: "#aeaeb2" }}>
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
              className="relative rounded-2xl p-4 text-left opacity-50 cursor-not-allowed"
              style={{ background: "#1c1c1e" }}
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#2c2c2e", color: "#aeaeb2" }}>
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
              className="relative rounded-2xl p-4 text-left active:opacity-70 transition-opacity disabled:opacity-50"
              style={{ background: "#1c1c1e" }}
            >
              {openingTopic === "telegram" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-[#48484a] border-t-white rounded-full animate-spin" />
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
              className="relative rounded-2xl p-4 text-left active:opacity-70 transition-opacity disabled:opacity-50"
              style={{ background: "#1c1c1e" }}
            >
              {openingTopic === "google" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-[#48484a] border-t-white rounded-full animate-spin" />
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
              className="relative rounded-2xl p-4 text-left active:opacity-70 transition-opacity disabled:opacity-50"
              style={{ background: "#1c1c1e" }}
            >
              {openingTopic === "writing" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-[#48484a] border-t-white rounded-full animate-spin" />
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
              className="relative rounded-2xl p-4 text-left active:opacity-70 transition-opacity disabled:opacity-50"
              style={{ background: "#1c1c1e" }}
            >
              {openingTopic === "coding" && (
                <span className="absolute top-3 right-3 w-4 h-4 border-2 border-[#48484a] border-t-white rounded-full animate-spin" />
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

          <div className="relative w-full rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col" style={{ background: "#1c1c1e" }}>
            <button
              onClick={() => { setExploreModal(null); setModalInput("") }}
              className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full transition-opacity active:opacity-70 z-10"
              style={{ background: "#2c2c2e" }}
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
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#2c2c2e", color: "#aeaeb2" }}>beta</span>
                    </div>
                    <p className="text-neutral-500 text-sm text-center px-4">
                      Opens a dedicated topic where nothing is saved — no history, no memory, no context. Ever.
                    </p>
                  </div>

                  {/* Privacy guarantees */}
                  <div className="mx-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                    {[
                      "🚫  No conversation history saved",
                      "🧠  No memory or profile updates",
                      "👤  No context from past chats",
                      "🔒  Each message treated as the first",
                    ].map((line, i) => (
                      <p key={i} className="text-amber-300/80 text-xs font-medium">{line}</p>
                    ))}
                  </div>

                  <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity disabled:opacity-50"
                        style={{ borderBottom: i < 3 ? "1px solid #3a3a3c" : "none" }}
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
                      {sending ? "Opening..." : "🔒 Open Private Topic"}
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
                  <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity disabled:opacity-50"
                        style={{ borderBottom: i < 3 ? "1px solid #3a3a3c" : "none" }}
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
                      {sending ? "Opening..." : "✈️ Open Telegram Search Topic"}
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
                  <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: "#2c2c2e" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src="/gmail.png" alt="Gmail" className="w-8 h-8" />
                      <div>
                        <p className="text-white font-semibold text-sm">Gmail</p>
                        <p className="text-xs" style={{ color: "#8e8e93" }}>Read, send & manage emails with AI</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickSend("google", "Connect my Gmail account")}
                        disabled={sending}
                        className="flex-1 py-2.5 bg-white text-black text-sm font-bold rounded-xl active:opacity-70 transition-opacity disabled:opacity-50"
                      >
                        Connect Gmail
                      </button>
                      <button
                        onClick={() => handleQuickSend("google", "Read my latest emails")}
                        disabled={sending}
                        className="flex-1 py-2.5 text-white text-sm font-medium rounded-xl active:opacity-70 transition-opacity disabled:opacity-50"
                        style={{ background: "#3a3a3c" }}
                      >
                        Read emails
                      </button>
                    </div>
                  </div>
                  <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity disabled:opacity-50"
                        style={{ borderBottom: i < 3 ? "1px solid #3a3a3c" : "none" }}
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
                      {sending ? "Opening..." : "📧 Open Google Tools Topic"}
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
                  <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity disabled:opacity-50"
                        style={{ borderBottom: i < 4 ? "1px solid #3a3a3c" : "none" }}
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
                      {sending ? "Opening..." : "✍️ Open Writing Topic"}
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
                  <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-60 transition-opacity disabled:opacity-50"
                        style={{ borderBottom: i < 4 ? "1px solid #3a3a3c" : "none" }}
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
                      {sending ? "Opening..." : "💻 Open Coding Topic"}
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Ask anything input bar */}
            <div className="p-4" style={{ borderTop: "1px solid #2c2c2e" }}>
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
                  className="w-full pl-4 pr-12 py-3 rounded-full text-white placeholder:text-[#636366] focus:outline-none text-sm"
                  style={{ background: "#2c2c2e" }}
                />
                <button
                  onClick={() => {
                    if (modalInput.trim() && exploreModal) handleQuickSend(exploreModal, modalInput.trim())
                  }}
                  disabled={sending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
                  style={{ background: modalInput.trim() ? "#3a3a3c" : "#2c2c2e", color: modalInput.trim() ? "#fff" : "#636366" }}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-6" style={{ background: "#1c1c1e" }} />
          </div>
        </div>
      )}
    </div>
  )
}
