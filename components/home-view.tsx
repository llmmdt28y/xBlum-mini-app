"use client"

import { useApp } from "@/lib/app-context"
import { Image, Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, Code, Sparkles, ChevronRight, Loader2, Bell, Mail, Send, RefreshCw } from "lucide-react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"

type ExploreModalType = "private" | "telegram" | "google" | "writing" | "coding" | null

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Datos Mock para las cápsulas del Schedule ──
const SCHEDULE_MOCK_ITEMS = [
  { id: 1, title: "Review Q4 Report", color: "#f59e0b", time: "In 30m" },
  { id: 2, title: "Meeting with Client", color: "#3b82f6", time: "2:00 PM" },
  { id: 3, title: "Workout Session", color: "#10b981", time: "6:00 PM" },
  { id: 4, title: "Read Project Brief", color: "#a855f7", time: "9:00 PM" },
]

export function HomeView() {
  const {
    t, selectedModel, setCurrentView, isPremium,
    isThrottled, minutesUntilReset, sendChatMessage, openExploreTopic,
  } = useApp()

  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [exploreModal, setExploreModal] = useState<ExploreModalType>(null)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [modalInput, setModalInput] = useState("")
  const [sending, setSending] = useState(false)
  const [openingTopic, setOpeningTopic] = useState<ExploreModalType>(null)
  
  // Carousel State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Schedule Dynamic Banner State
  const [activeScheduleColor, setActiveScheduleColor] = useState(SCHEDULE_MOCK_ITEMS[0].color)

  // ── Gestión del Botón Atrás Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return

    if (showAllTopics || exploreModal) {
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }

    const handleBack = () => {
      if (exploreModal) {
        setExploreModal(null)
        setModalInput("")
      } else if (showAllTopics) {
        setShowAllTopics(false)
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [showAllTopics, exploreModal])

  // ── Scroll Handlers ──
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return
    const width = carouselRef.current.offsetWidth
    const scrollLeft = carouselRef.current.scrollLeft
    const index = Math.round(scrollLeft / width)
    if (index !== currentBannerIndex) {
      setCurrentBannerIndex(index)
    }
  }, [currentBannerIndex])

  const handleScheduleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    // Altura aproximada de cada elemento (32px de alto + posibles márgenes)
    const index = Math.min(
      SCHEDULE_MOCK_ITEMS.length - 1,
      Math.max(0, Math.round(el.scrollTop / 32))
    )
    if (SCHEDULE_MOCK_ITEMS[index] && SCHEDULE_MOCK_ITEMS[index].color !== activeScheduleColor) {
      setActiveScheduleColor(SCHEDULE_MOCK_ITEMS[index].color)
    }
  }, [activeScheduleColor])

  async function handleSend() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setMessage("")
    await sendChatMessage(text)
    setSending(false)
  }

  async function handleQuickSend(topicKey: ExploreModalType, text: string) {
    if (sending || !topicKey) return
    setExploreModal(null)
    setModalInput("")
    setSending(true)
    await openExploreTopic(topicKey, text)
    setSending(false)
  }

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
    // Función para Telegram
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4.1"

  const TOPICS_DATA = [
    { id: "private", name: "Private Mode", desc: "Zero trace conversations", tag: "BETA", action: () => setExploreModal("private"), icon: <Lock className="w-5 h-5 text-amber-500" /> },
    { id: "telegram", name: "Telegram Search", desc: "Find channels, posts & more", action: () => setExploreModal("telegram"), isImage: true, src: "/telegram-icon.png" },
    { id: "google", name: "Google Tools", desc: "Mail, Drive, Docs & Sheets", action: () => setExploreModal("google"), isImage: true, src: "/gmail.png", contain: true },
    { id: "writing", name: "Writing Assistant", desc: "Translate and refine text", action: () => setExploreModal("writing"), icon: <Sparkles className="w-5 h-5 text-blue-400" /> },
    { id: "coding", name: "Coding & Tech", desc: "Debug and write code", action: () => setExploreModal("coding"), icon: <Code className="w-5 h-5 text-green-400" /> },
    { id: "ton", name: "TON Wallet", desc: "Manage your crypto assets", action: () => {}, tag: "SOON", disabled: true, isImage: true, src: "/TON-ICON.png" },
  ] as const;

  return (
    <div 
      className="flex-1 flex flex-col items-center px-4 pb-28 bg-black select-none"
      style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 20px)" }}
    >
      {/* Definición de Keyframes para las Estrellas */}
      <style>{`
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        @keyframes spin-slow-reverse { 100% { transform: rotate(-360deg); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
        
        .star-1 { animation: spin-slow 8s linear infinite, pulse-glow 3s ease-in-out infinite; }
        .star-2 { animation: spin-slow-reverse 6s linear infinite, pulse-glow 4s ease-in-out infinite 1s; }
        .star-3 { animation: spin-slow 10s linear infinite, pulse-glow 3.5s ease-in-out infinite 0.5s; }
        .star-4 { animation: spin-slow-reverse 7s linear infinite, pulse-glow 2.5s ease-in-out infinite 1.5s; }
      `}</style>

      <div className="flex flex-col items-center gap-5 w-full max-w-md">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="w-full pt-6 pb-2 animate-in fade-in duration-500">
          <p className="text-[#8e8e93] text-sm font-medium mb-1" style={{ fontFamily: SF }}>
            {t("poweredBy")} <button onClick={() => setCurrentView("settings")} className="text-white hover:text-neutral-300 transition-colors font-semibold">{selectedModel}</button>
          </p>
          <h1 className="text-[34px] font-bold text-white leading-tight tracking-tight" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>
            {t("howCanIHelp")}
          </h1>
        </div>

        {/* ── Throttle warning ────────────────────────────────────────── */}
        {showThrottle && (
          <div className="w-full p-3.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] text-orange-300 font-medium" style={{ fontFamily: SF }}>{t("throttleActive")}</p>
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px]" style={{ fontFamily: SFD }}>{minutesUntilReset} {t("min")}</span>
                </div>
              </div>
              <p className="text-[12px] text-orange-200/70 mt-0.5" style={{ fontFamily: SF }}>{t("throttleDesc")}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setCurrentView("settings")} className="text-[12px] text-blue-400 underline underline-offset-2" style={{ fontFamily: SF }}>
                  {t("changeModel")}
                </button>
                {!isPremium && (
                  <>
                    <span className="text-neutral-600 text-[12px]">·</span>
                    <button onClick={() => setCurrentView("premium")} className="text-[12px] text-amber-400 underline underline-offset-2" style={{ fontFamily: SF }}>
                      {t("upgradePro")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Input ───────────────────────────────────────────────────── */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="w-full pl-5 pr-14 py-4 rounded-[24px] text-white placeholder:text-[#636366] focus:outline-none transition-all text-[15px]"
              style={{ background: "#111", border: "1px solid #1c1c1e", fontFamily: SF }}
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
              style={!(message.trim() && !sending) ? { background: "#1c1c1e" } : {}}
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
        <div className="w-full flex flex-nowrap justify-start gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={handleCreateImage}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#111", border: "1px solid #1c1c1e" }}
          >
            <Image className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>{t("createImage")}</span>
          </button>
          <button
            onClick={handleGetTokens}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#111", border: "1px solid #1c1c1e" }}
          >
            <Coins className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>{t("getTokens")}</span>
          </button>
          <button
            onClick={handleAddToChat}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#111", border: "1px solid #1c1c1e" }}
          >
            <MessageCircle className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>{t("addToChat")}</span>
          </button>
        </div>

        {/* ── Swiper Banners (Carousel) ─────────────────────────────────── */}
        <div className="w-full flex flex-col gap-2.5 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full flex flex-nowrap snap-x snap-mandatory overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── Schedule Banner Dinámico (NUEVO DISEÑO) ── */}
            <div className="flex shrink-0 w-full max-w-md snap-center rounded-[24px] pr-2">
                <div
                  onClick={() => setCurrentView("schedule")}
                  className="w-full shrink-0 relative overflow-hidden active:opacity-80 transition-all text-left cursor-pointer flex items-center px-4 gap-4"
                  style={{
                      background: "#060606",
                      border: "1px solid #1e1e1e",
                      borderRadius: "24px",
                      height: "100px",
                  }}
                >
                  {/* Degradado de Fondo Dinámico */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-colors duration-500" 
                    style={{ background: `radial-gradient(ellipse at 50% 50%, ${activeScheduleColor}25 0%, transparent 70%)` }} 
                  />

                  {/* Estrellas Dinámicas */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <img src="/star-icon.png" alt="" className="star-1 absolute top-2 right-4 w-[22px] h-[22px]" style={{ filter: `drop-shadow(0 0 6px ${activeScheduleColor})` }}/>
                    <img src="/star-icon.png" alt="" className="star-2 absolute top-10 right-14 w-[14px] h-[14px]" style={{ filter: `drop-shadow(0 0 4px ${activeScheduleColor})` }}/>
                    <img src="/star-icon.png" alt="" className="star-3 absolute bottom-3 right-6 w-[18px] h-[18px]" style={{ filter: `drop-shadow(0 0 5px ${activeScheduleColor})` }}/>
                    <img src="/star-icon.png" alt="" className="star-4 absolute top-5 right-[85px] w-[10px] h-[10px]" style={{ filter: `drop-shadow(0 0 3px ${activeScheduleColor})` }}/>
                  </div>

                  {/* Contenido (Icono + Textos) */}
                  <div className="relative z-10 w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-white/5">
                    <Bell className="w-7 h-7 text-white" />
                    <div className="absolute top-0 right-0.5 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-[#060606]"></div>
                  </div>

                  <div className="relative z-10 flex flex-col flex-1 min-w-0 pr-16">
                    <h3 className="text-white font-bold text-[18px] leading-tight mb-1" style={{ fontFamily: SFD }}>Schedules</h3>
                    
                    {/* Contenedor Deslizable de Cápsulas */}
                    <div 
                      onScroll={handleScheduleScroll}
                      onClick={(e) => e.stopPropagation()} // Previene que al arrastrar/clicar se cambie de vista inmediatamente si querías deslizar
                      className="h-[32px] overflow-y-auto snap-y snap-mandatory no-scrollbar w-full"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      <div className="flex flex-col">
                        {SCHEDULE_MOCK_ITEMS.map((item) => (
                          <div key={item.id} className="h-[32px] snap-start flex items-center shrink-0">
                            <button
                              onClick={() => setCurrentView("schedule")}
                              className="flex items-center gap-2 px-3 py-1 rounded-full border max-w-full"
                              style={{ 
                                background: `${item.color}15`, 
                                borderColor: `${item.color}30`,
                              }}
                            >
                               <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                               <span className="text-[13px] font-medium truncate" style={{ color: item.color, fontFamily: SF }}>
                                 {item.time} • {item.title}
                               </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
            </div>

            {/* ── Referral Banner (SECOND POSITION) ── */}
            <div className="flex shrink-0 w-full max-w-md snap-center rounded-[24px]">
                <button
                onClick={() => setCurrentView("referral")}
                className="w-full shrink-0 relative overflow-hidden active:opacity-80 transition-opacity text-left"
                style={{
                    background: "#060606",
                    border: "1px solid #1e1e1e",
                    borderRadius: "24px",
                    height: "100px",
                }}
                >
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(255,255,255,0.03) 0%, transparent 55%)" }} />
                    <div className="relative z-10 flex items-center justify-between h-full px-5">
                        <div className="flex flex-col gap-2">
                        <p className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Invite a Friend & Get<br />Free Tokens</p>
                        <div
                            className="flex items-center gap-1 px-3 py-1 rounded-full w-fit relative overflow-hidden"
                            style={{
                            background: "rgba(255,255,255,0.07)",
                            backdropFilter: "blur(16px) saturate(180%)",
                            WebkitBackdropFilter: "blur(16px) saturate(180%)",
                            border: "1px solid rgba(255,255,255,0.13)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div className="absolute inset-x-2 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }} />
                            <span className="text-white text-[11px] font-medium relative z-10 tracking-wide" style={{ fontFamily: SF }}>share invite</span>
                            <span className="text-white text-[11px] relative z-10" style={{ opacity: 0.55 }}>›</span>
                        </div>
                        </div>
                        <div className="relative shrink-0 pointer-events-none select-none" style={{ width: "120px", height: "96px" }}>
                            <img src="/xblum-coin.png" alt="" draggable={false} className="absolute pointer-events-none select-none" style={{ width: "46px", height: "46px", top: "-10px", right: "4px", opacity: 0.55, transform: "rotate(18deg)", filter: "brightness(0.75)" }} />
                            <img src="/xblum-coin.png" alt="" draggable={false} className="absolute pointer-events-none select-none" style={{ width: "68px", height: "68px", top: "50%", left: "0px", transform: "translateY(-50%) rotate(-18deg)", opacity: 1, filter: "drop-shadow(0 4px 16px rgba(30,140,255,0.55))" }} />
                            <img src="/xblum-coin.png" alt="" draggable={false} className="absolute pointer-events-none select-none" style={{ width: "44px", height: "44px", bottom: "2px", right: "6px", opacity: 0.6, transform: "rotate(-8deg)", filter: "brightness(0.8)" }} />
                        </div>
                    </div>
                </button>
            </div>
            
          </div>

          {/* ── Pagination Dots Indicators (•) ── */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {[0, 1].map(index => (
                <div key={index} className={`w-1.5 h-1.5 rounded-full transition-colors ${currentBannerIndex === index ? 'bg-white' : 'bg-[#2c2c2e]'}`} />
            ))}
          </div>
        </div>

        {/* ── Explore Section (CARRUSEL HORIZONTAL) ───────────────────── */}
        <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-3 w-max px-1">
            
            {/* Tarjeta 1: Explore (Compacta) */}
            <div className="shrink-0 w-[85vw] max-w-[320px] rounded-[24px] snap-center p-4 flex flex-col" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              <button onClick={() => setShowAllTopics(true)} className="flex items-center gap-1 mb-4 active:opacity-70 w-fit">
                <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Explore</h3>
                <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
              </button>
              
              <div className="flex flex-col gap-4">
                {TOPICS_DATA.slice(0, 3).map((topic) => (
                  <button
                    key={topic.id}
                    onClick={topic.action}
                    disabled={openingTopic === topic.id}
                    className="w-full flex items-center gap-4 active:opacity-60 transition-opacity text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#1c1c1e" }}>
                      {openingTopic === topic.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#8e8e93]" />
                      ) : topic.isImage ? (
                        <img src={topic.src} alt={topic.name} draggable={false} className={`w-full h-full pointer-events-none select-none ${topic.contain ? 'object-contain p-2' : 'object-cover'}`} />
                      ) : (
                        topic.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[16px] font-medium truncate leading-tight" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{topic.name}</p>
                      <p className="text-[#8e8e93] text-[13px] truncate mt-0.5" style={{ fontFamily: SF }}>{topic.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tarjeta 2: My Tools */}
            <div className="shrink-0 w-[85vw] max-w-[320px] rounded-[24px] snap-center p-4 flex flex-col" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              <div className="flex items-center gap-1 mb-4">
                <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>My Tools</h3>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[140px]">
                <p className="text-[#48484a] text-[15px] font-medium" style={{ fontFamily: SF }}>Coming soon...</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── MODAL FULL SCREEN: ALL TOPICS (Con Blur y sin Header) ── */}
      {showAllTopics && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/65 backdrop-blur-xl animate-in fade-in duration-300">
          
          <div className="pt-16 pb-2" />

          <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-1">
            {TOPICS_DATA.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  if (!topic.disabled) {
                    topic.action();
                  }
                }}
                disabled={topic.disabled}
                className="w-full flex items-center gap-4 px-2 py-4 active:bg-white/5 transition-colors rounded-2xl text-left disabled:opacity-50"
              >
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#1c1c1e" }}>
                  {topic.isImage ? (
                    <img src={topic.src} alt={topic.name} draggable={false} className={`w-full h-full pointer-events-none select-none ${topic.contain ? 'object-contain p-2.5' : 'object-cover'}`} />
                  ) : (
                    <div className="scale-110">{topic.icon}</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-[17px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>{topic.name}</p>
                    {topic.tag && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${topic.tag === 'BETA' ? 'bg-[#1c1c1e] text-[#8e8e93]' : 'bg-amber-500/15 text-amber-500'}`} style={{ fontFamily: SF }}>
                        {topic.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[#8e8e93] text-[14px] truncate mt-0.5" style={{ fontFamily: SF }}>{topic.desc}</p>
                </div>
                
                <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#48484a" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-modales de Topic ────────── */}
      {exploreModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => { setExploreModal(null); setModalInput("") }}
          />

          <div className="relative w-full rounded-t-[24px] animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col" style={{ background: "#111", borderTop: "1px solid #1c1c1e" }}>
            
            <button
              onClick={() => { setExploreModal(null); setModalInput("") }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity active:opacity-70 z-10"
              style={{ background: "#1c1c1e" }}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pt-10 pb-4 overflow-y-auto flex-1">

              {/* Private Mode Modal */}
              {exploreModal === "private" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center">
                      <Lock className="w-16 h-16 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Private Mode</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "#1c1c1e", color: "#8e8e93", fontFamily: SF }}>beta</span>
                    </div>
                    <p className="text-[#8e8e93] text-[14px] text-center px-4" style={{ fontFamily: SF }}>
                      Opens a dedicated topic where nothing is saved — no history, no memory, no context. Ever.
                    </p>
                  </div>

                  <div className="mx-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-[20px] p-4 space-y-2">
                    {[
                      "🚫  No conversation history saved",
                      "🧠  No memory or profile updates",
                      "👤  No context from past chats",
                      "🔒  Each message treated as the first",
                    ].map((line, i) => (
                      <p key={i} className="text-amber-500/90 text-[13px] font-medium" style={{ fontFamily: SF }}>{line}</p>
                    ))}
                  </div>

                  <div className="mx-4 rounded-[20px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors disabled:opacity-50 text-left"
                        style={{ borderBottom: i < 3 ? "1px solid #2c2c2e" : "none" }}
                      >
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="text-white text-[15px]" style={{ fontFamily: SF }}>{item.text}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("private")}
                      disabled={sending}
                      className="w-full py-4 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold rounded-[20px] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontFamily: SF, fontSize: "16px" }}
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
                    <div className="w-20 h-20 mb-4 flex items-center justify-center pointer-events-none select-none">
                      <img src="/telegram-icon.png" alt="Telegram" draggable={false} className="w-20 h-20 pointer-events-none select-none" />
                    </div>
                    <h2 className="text-white font-bold text-[20px] mb-1" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Search on Telegram</h2>
                    <p className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>Opens a dedicated Telegram Search topic</p>
                  </div>
                  <div className="mx-4 rounded-[20px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors disabled:opacity-50 text-left"
                        style={{ borderBottom: i < 3 ? "1px solid #2c2c2e" : "none" }}
                      >
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="text-white text-[15px]" style={{ fontFamily: SF }}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("telegram")}
                      disabled={sending}
                      className="w-full py-4 bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold rounded-[20px] active:scale-[0.98] transition-transform disabled:opacity-50"
                      style={{ fontFamily: SF, fontSize: "16px" }}
                    >
                      {sending ? "Opening..." : "Open Telegram Search"}
                    </button>
                  </div>
                </>
              )}

              {/* Google Tools Modal */}
              {exploreModal === "google" && (
                <>
                  <div className="flex flex-col items-center px-4 mb-6">
                    <div className="w-20 h-20 mb-4 flex items-center justify-center pointer-events-none select-none">
                      <img src="/gmail.png" alt="Google" draggable={false} className="w-16 h-16 pointer-events-none select-none object-contain" />
                    </div>
                    <h2 className="text-white font-bold text-[20px] mb-1" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Google Tools</h2>
                    <p className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>Opens a dedicated Google Tools topic</p>
                  </div>
                  <div className="mx-4 mb-4 rounded-[20px] p-4" style={{ background: "#1c1c1e" }}>
                    <div className="flex items-center gap-3 mb-4 pointer-events-none select-none">
                      <img src="/gmail.png" alt="Gmail" draggable={false} className="w-8 h-8 pointer-events-none select-none object-contain" />
                      <div>
                        <p className="text-white font-semibold text-[15px]" style={{ fontFamily: SF }}>Gmail</p>
                        <p className="text-[13px]" style={{ color: "#8e8e93", fontFamily: SF }}>Read, send & manage emails with AI</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickSend("google", "Connect my Gmail account")}
                        disabled={sending}
                        className="flex-1 py-3 bg-white text-black text-[14px] font-bold rounded-[16px] active:opacity-70 transition-opacity disabled:opacity-50"
                        style={{ fontFamily: SF }}
                      >
                        Connect Gmail
                      </button>
                      <button
                        onClick={() => handleQuickSend("google", "Read my latest emails")}
                        disabled={sending}
                        className="flex-1 py-3 text-white text-[14px] font-medium rounded-[16px] active:opacity-70 transition-opacity disabled:opacity-50"
                        style={{ background: "#2c2c2e", fontFamily: SF }}
                      >
                        Read emails
                      </button>
                    </div>
                  </div>
                  <div className="mx-4 rounded-[20px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors disabled:opacity-50 text-left"
                        style={{ borderBottom: i < 3 ? "1px solid #2c2c2e" : "none" }}
                      >
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="text-white text-[15px]" style={{ fontFamily: SF }}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("google")}
                      disabled={sending}
                      className="w-full py-4 bg-white/10 border border-white/20 text-white font-bold rounded-[20px] active:scale-[0.98] transition-transform disabled:opacity-50"
                      style={{ fontFamily: SF, fontSize: "16px" }}
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
                    <h2 className="text-white font-bold text-[20px] mb-1" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Writing Assistant</h2>
                    <p className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>Opens a dedicated Writing topic</p>
                  </div>
                  <div className="mx-4 rounded-[20px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors disabled:opacity-50 text-left"
                        style={{ borderBottom: i < 4 ? "1px solid #2c2c2e" : "none" }}
                      >
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="text-white text-[15px]" style={{ fontFamily: SF }}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("writing")}
                      disabled={sending}
                      className="w-full py-4 bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold rounded-[20px] active:scale-[0.98] transition-transform disabled:opacity-50"
                      style={{ fontFamily: SF, fontSize: "16px" }}
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
                    <h2 className="text-white font-bold text-[20px] mb-1" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Coding & Tech</h2>
                    <p className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>Opens a dedicated Coding topic</p>
                  </div>
                  <div className="mx-4 rounded-[20px] overflow-hidden" style={{ background: "#1c1c1e" }}>
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
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors disabled:opacity-50 text-left"
                        style={{ borderBottom: i < 4 ? "1px solid #2c2c2e" : "none" }}
                      >
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="text-white text-[15px]" style={{ fontFamily: SF }}>{item.text}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mx-4 mt-4">
                    <button
                      onClick={() => handleOpenTopic("coding")}
                      disabled={sending}
                      className="w-full py-4 bg-green-500/20 border border-green-500/40 text-green-400 font-bold rounded-[20px] active:scale-[0.98] transition-transform disabled:opacity-50"
                      style={{ fontFamily: SF, fontSize: "16px" }}
                    >
                      {sending ? "Opening..." : "Open Coding Topic"}
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Ask anything input bar */}
            <div className="p-4" style={{ borderTop: "1px solid #1c1c1e", background: "#111" }}>
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
                  className="w-full pl-5 pr-14 py-4 rounded-full text-white placeholder:text-[#636366] focus:outline-none text-[15px] transition-all"
                  style={{ background: "#1c1c1e", border: "1px solid #2c2c2e", fontFamily: SF }}
                />
                <button
                  onClick={() => {
                    if (modalInput.trim() && exploreModal) handleQuickSend(exploreModal, modalInput.trim())
                  }}
                  disabled={sending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{ 
                    background: modalInput.trim() ? "#fff" : "#2c2c2e", 
                    color: modalInput.trim() ? "#000" : "#636366" 
                  }}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 12px)", background: "#111" }} />
          </div>
        </div>
      )}
    </div>
  )
}
