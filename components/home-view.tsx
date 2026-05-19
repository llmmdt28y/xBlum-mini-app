"use client"

import { useApp } from "@/lib/app-context"
import { 
  Image, Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, 
  ChevronRight, Loader2, CalendarDays, Search, ShieldCheck, Github, 
  Mail, Calendar, HardDrive, Plus, Hexagon, ArrowLeft, Trash2, Sparkles,
  Briefcase, Bot, Settings2, Save, Power, Zap
} from "lucide-react"

import { BusinessAutomationView } from "./business-automation-view"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

const ICON_COLORS: Record<string, string> = {
  CalendarDays:"#3b82f6", Clock:"#f97316", Bell:"#f43f5e", Mail:"#0ea5e9", Folder:"#eab308",
  Dumbbell:"#a855f7", Briefcase:"#d97706", Laptop:"#94a3b8", Utensils:"#ec4899",
  MessageSquare:"#22c55e", Send:"#14b8a6", Coffee:"#b45309", Droplets:"#38bdf8",
  Pill:"#fb7185", Activity:"#10b981", TrendingUp:"#22c55e", CheckSquare:"#3b82f6", Lightbulb:"#f59e0b"
}

// --- Connectors Database ---
const CONNECTORS_DB = [
  { 
    id: "gmail", 
    name: "Gmail", 
    category: "Featured", 
    src: "/gmail.png",
    detailCategory: "Productivity",
    description: "Connect your Gmail to manage your inbox with AI.",
    isConnected: true,
    userEmail: "user@gmail.com",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search your emails", desc: "Search your inbox, summarize unread emails and find messages from specific people." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your personal data remains private and is never used for training purposes." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your emails stay in Gmail", desc: "We don't store your emails. Search is performed in real-time when you ask questions." }
    ]
  },
  { 
    id: "drive", 
    name: "Google Drive", 
    category: "Featured", 
    src: "/google-drive.png",
    detailCategory: "Productivity",
    description: "Access and analyze your cloud documents seamlessly.",
    isConnected: false,
    userEmail: "",
    features: [
      { icon: <HardDrive className="w-5 h-5 text-[#8e8e93]" />, title: "Access your files", desc: "Search documents, summarize presentations and ask questions about your Google Drive files." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your files are accessed only when you request it, with zero training usage." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your files stay in Drive", desc: "Data is retrieved on-the-fly and never stored on our servers." }
    ]
  },
  { 
    id: "calendar", 
    name: "Google Calendar", 
    category: "Featured", 
    src: "/google-calendar.png",
    detailCategory: "Productivity",
    description: "Keep track of your schedule and meetings.",
    isConnected: false,
    userEmail: "",
    features: [
      { icon: <Calendar className="w-5 h-5 text-[#8e8e93]" />, title: "Search your calendar", desc: "Check today's agenda, find upcoming events and get meeting details." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your schedule is private. We do not use event data for AI training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your events stay in Calendar", desc: "We only read your calendar data to provide real-time information." }
    ]
  },
  { 
    id: "outlook", 
    name: "Outlook", 
    category: "Productivity", 
    src: "/outlook.png",
    detailCategory: "Microsoft 365",
    description: "Integrate your Microsoft outlook account.",
    isConnected: false,
    userEmail: "",
    features: [
      { icon: <Mail className="w-5 h-5 text-[#8e8e93]" />, title: "Search your emails", desc: "Search your inbox, find emails from specific people and summarize email threads." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Enterprise-grade privacy ensures your data is never used for training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your emails stay in Outlook", desc: "Secure real-time access without permanent data storage." }
    ]
  },
  { 
    id: "github", 
    name: "GitHub", 
    category: "Featured", 
    src: "/github-icon.png",
    detailCategory: "Development",
    description: "Connect to your repositories and manage your code.",
    isConnected: false,
    userEmail: "",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search repositories", desc: "Find issues, pull requests, and analyze your codebase." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your code remains yours. We do not train on private repositories." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Secure access", desc: "Access is granted via secure OAuth tokens." }
    ]
  },
  { 
    id: "notion", 
    name: "Notion", 
    category: "Featured", 
    src: "/notion-icon.png",
    detailCategory: "Productivity",
    description: "Access your workspaces and databases.",
    isConnected: false,
    userEmail: "",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search your workspaces", desc: "Find pages, summarize databases, and query your notes." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your workspace content is entirely excluded from model training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your data stays in Notion", desc: "Real-time API queries mean we don't duplicate your databases." }
    ]
  }
];

function getTg() { return (window as any).Telegram?.WebApp }

function formatTimeRelative(fireAt: string) {
  if (!fireAt) return "Anytime"
  try {
    const d = new Date(fireAt)
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    
    if (diffMs < 0) return "Past"
    
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `In ${diffMins}m`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24 && d.getDate() === now.getDate()) {
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "")
    }
    
    if (diffHours < 48 && d.getDate() === now.getDate() + 1) {
        return `Tmrw, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "")}`
    }
    
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return "Scheduled"
  }
}

// Estilos añadidos de market-view
const liquidGlassStyle = {
  background: "rgba(30, 30, 30, 0.35)", 
  backdropFilter: "blur(24px) saturate(200%) brightness(1.1)", 
  WebkitBackdropFilter: "blur(24px) saturate(200%) brightness(1.1)",
  border: "1px solid rgba(255, 255, 255, 0.12)", 
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), inset 0 1.5px 1px rgba(255, 255, 255, 0.2)",
  transform: "translateZ(0)", 
  WebkitTransform: "translateZ(0)",
}

const cardLiquidGlassStyle = {
  background: "rgba(42, 42, 44, 0.85)", 
  backdropFilter: "blur(12px) saturate(150%)", 
  WebkitBackdropFilter: "blur(12px) saturate(150%)",
  border: "1px solid rgba(255, 255, 255, 0.12)", 
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.2)", 
  transform: "translateZ(0)", 
  WebkitTransform: "translateZ(0)",
  willChange: "transform", 
}

export function HomeView() {
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isBotIntModalOpen, setIsBotIntModalOpen] = useState(false)
  
  const [botIntConfig, setBotIntConfig] = useState({
    enabled: true,
    moderation_react: true,
    auto_execute_mod: false,
    file_summarize: true
  })

  const {
    t, selectedModel, setCurrentView, isPremium,
    isThrottled, minutesUntilReset, sendChatMessage
  } = useApp()

  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  
  const [modalState, setModalState] = useState<{ view: "closed" | "list" | "detail", connectorId: string | null }>({ view: "closed", connectorId: null })
  const [searchQuery, setSearchQuery] = useState("")

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  const [scheduleItems, setScheduleItems] = useState<any[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0)

  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true)
    try {
      const tg = getTg()
      const initData = tg?.initData ?? ""
      const res = await fetch(`${API_BASE}/api/schedule_list`, { headers: { "x-init-data": initData } })
      if (res.ok) {
        const d = await res.json()
        if (d.success && Array.isArray(d.items)) {
          const now = new Date().getTime()
          const upcoming = d.items
            .filter((t: any) => new Date(t.fire_at).getTime() > now - 60000)
            .sort((a: any, b: any) => new Date(a.fire_at).getTime() - new Date(b.fire_at).getTime())
          setScheduleItems(upcoming)
        }
      }
    } catch (e) {
      console.error("[HomeView] fetch schedules error:", e)
    } finally {
      setLoadingSchedules(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    if (modalState.view !== "closed") {
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }

    const handleBack = () => {
      if (modalState.view === "detail") {
        setModalState({ view: "list", connectorId: null })
      } else if (modalState.view === "list") {
        setModalState({ view: "closed", connectorId: null })
      }
    }

    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [modalState.view])

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return
    const width = carouselRef.current.offsetWidth
    const scrollLeft = carouselRef.current.scrollLeft
    const index = Math.round(scrollLeft / width)
    if (index !== currentBannerIndex) {
      setCurrentBannerIndex(index)
    }
  }, [currentBannerIndex])

  const displayItems = useMemo(() => {
    if (loadingSchedules) return [{ id: 'loading', title: 'Syncing schedule...', color: '#636366', fire_at: '' }]
    if (scheduleItems.length === 0) return [{ id: 'empty', title: 'No upcoming events', color: '#8e8e93', fire_at: '' }]
    return scheduleItems
  }, [scheduleItems, loadingSchedules])

  const handleScheduleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const index = Math.min(
      displayItems.length - 1,
      Math.max(0, Math.round(el.scrollTop / 32))
    )
    if (index !== activeScheduleIndex) {
      setActiveScheduleIndex(index)
    }
  }, [displayItems.length, activeScheduleIndex])

  const activeItem = displayItems[activeScheduleIndex] || displayItems[0]
  const activeScheduleColor = activeItem?.color || ICON_COLORS[activeItem?.icon_name] || "#3b82f6"
  const hasNotifications = scheduleItems.length > 0

  async function handleSend() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setMessage("")
    await sendChatMessage(text)
    setSending(false)
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) handleSend()
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4.1"

  const filteredConnectors = CONNECTORS_DB.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConnectorData = CONNECTORS_DB.find(c => c.id === modalState.connectorId)

  return (
    <div className="flex-1 flex flex-col items-center px-4 pb-28 bg-black select-none" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 20px)" }}>
      <style>{`.snap-always { scroll-snap-stop: always; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      <div className="flex flex-col items-center gap-5 w-full max-w-md">

        {/* --- Header --- */}
        <div className="w-full pt-6 pb-2 animate-in fade-in duration-500">
          <p className="text-[#8e8e93] text-sm font-medium mb-1" style={{ fontFamily: SF }}>
            {t("poweredBy")} <button onClick={() => setCurrentView("settings")} className="text-white hover:text-neutral-300 transition-colors font-semibold">{selectedModel}</button>
          </p>
          <h1 className="text-[34px] font-bold text-white leading-tight tracking-tight" style={{ fontFamily: SFD, letterSpacing: "-0.02em" }}>
            {t("howCanIHelp")}
          </h1>
        </div>

        {/* --- Throttle Warning --- */}
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

        {/* --- Main Input --- */}
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

        {/* --- Action Buttons --- */}
        <div className="w-full flex flex-nowrap justify-start gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => { setMessage("Create an image of "); inputRef.current?.focus(); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#111", border: "1px solid #1c1c1e" }}
          >
            <Image className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>{t("createImage")}</span>
          </button>
          <button
            onClick={() => setCurrentView("store")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white active:opacity-70 transition-opacity whitespace-nowrap"
            style={{ background: "#111", border: "1px solid #1c1c1e" }}
          >
            <Coins className="w-4 h-4 shrink-0" style={{ color: "#8e8e93" }} />
            <span className="text-[13px] font-medium" style={{ fontFamily: SF }}>{t("getTokens")}</span>
          </button>
        </div>

        {/* --- Top Carousel (Schedules & Referral) --- */}
        <div className="w-full flex flex-col gap-2.5 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
          <div ref={carouselRef} onScroll={handleScroll} className="w-full flex flex-nowrap snap-x snap-mandatory overflow-x-auto no-scrollbar">
            
            {/* Schedule Banner */}
            <div className="flex shrink-0 w-full max-w-md snap-center rounded-[24px] pr-2">
                <div
                  onClick={() => setCurrentView("schedule")}
                  className="w-full shrink-0 relative overflow-hidden active:opacity-80 transition-all text-left cursor-pointer flex items-center px-4 gap-4 shadow-xl"
                  style={{
                      background: "linear-gradient(145deg, #1a1a1c, #080808)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "24px",
                      height: "105px",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none transition-colors duration-700 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle at 15% 50%, ${activeScheduleColor} 0%, transparent 60%)` }} />
                  <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/noise.png')", backgroundSize: "100px 100px" }} />

                  <div className="relative z-10 w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 ml-1" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div className="absolute inset-0 rounded-full border border-white/5 bg-white/5" />
                    <CalendarDays className="w-7 h-7 text-white drop-shadow-lg relative z-10" strokeWidth={1.5} />
                    {hasNotifications && <div className="absolute top-[2px] right-[2px] w-3.5 h-3.5 rounded-full bg-[#f43f5e] border-[2px] border-[#1a1a1c] shadow-sm z-20"></div>}
                  </div>

                  <div className="relative z-10 flex flex-col flex-1 min-w-0 pr-2 justify-center mt-0.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-white font-bold text-[19px] leading-tight tracking-tight" style={{ fontFamily: SFD }}>Schedules</h3>
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <ChevronRight className="w-4 h-4 text-white/50" />
                        </div>
                    </div>
                    <div onScroll={handleScheduleScroll} onClick={(e) => e.stopPropagation()} className="h-[32px] overflow-y-auto snap-y snap-mandatory no-scrollbar w-full" style={{ scrollBehavior: 'smooth' }}>
                      <div className="flex flex-col">
                        {displayItems.map((item, idx) => {
                          const isActive = idx === activeScheduleIndex;
                          const itemColor = item.color || ICON_COLORS[item.icon_name] || "#3b82f6";
                          const timeStr = item.fire_at ? formatTimeRelative(item.fire_at) : (item.id === 'loading' ? 'Loading' : 'Relax');
                          return (
                            <div key={item.id} className="h-[32px] snap-center snap-always flex items-center shrink-0 transition-all duration-300 ease-out" style={{ transform: isActive ? 'scale(1) translateX(0)' : 'scale(0.85) translateX(-4%)', opacity: isActive ? 1 : 0.35, transformOrigin: 'left center' }}>
                              <button onClick={(e) => { e.stopPropagation(); setCurrentView("schedule"); }} className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] max-w-full shadow-sm active:scale-95 transition-transform" style={{ background: `rgba(0,0,0,0.4)`, border: `1px solid rgba(255,255,255,0.08)` }}>
                                {item.id === 'loading' ? <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" style={{ color: itemColor }} /> : <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: itemColor, boxShadow: `0 0 8px ${itemColor}` }} />}
                                <span className="text-[13px] font-medium truncate text-white/90" style={{ fontFamily: SF }}>{timeStr} <span className="opacity-30 mx-1">•</span> {item.title}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Referral Banner */}
            <div className="flex shrink-0 w-full max-w-md snap-center rounded-[24px]">
                <button onClick={() => setCurrentView("referral")} className="w-full shrink-0 relative overflow-hidden active:opacity-80 transition-opacity text-left" style={{ background: "#060606", border: "1px solid #1c1c1e", borderRadius: "24px", height: "105px" }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(255,255,255,0.03) 0%, transparent 55%)" }} />
                    <div className="relative z-10 flex items-center justify-between h-full px-5">
                        <div className="flex flex-col gap-2.5">
                          <p className="text-white font-bold text-[16px] leading-tight" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Invite a Friend & Get<br />Free Tokens</p>
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full w-fit relative overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", border: "1px solid rgba(255,255,255,0.13)" }}>
                              <span className="text-white text-[11px] font-medium relative z-10 tracking-wide" style={{ fontFamily: SF }}>share invite</span>
                              <span className="text-white text-[11px] relative z-10" style={{ opacity: 0.55 }}>›</span>
                          </div>
                        </div>
                    </div>
                </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {[0, 1].map(index => <div key={index} className={`w-1.5 h-1.5 rounded-full transition-colors ${currentBannerIndex === index ? 'bg-white' : 'bg-[#2c2c2e]'}`} />)}
          </div>
        </div>

        {/* --- Horizontal Cards Carousel (Connectors & Tools) --- */}
        <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar">
          <div className="flex gap-3 w-max px-1">
            
            {/* Card 1: Connectors */}
            <div className="shrink-0 w-[85vw] max-w-[320px] rounded-[24px] snap-center p-4 flex flex-col" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>Connectors</h3>
                  <p className="text-[#8e8e93] text-[13px] mt-0.5" style={{ fontFamily: SF }}>Extend capabilities with your apps</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {CONNECTORS_DB.slice(0, 3).map((connector) => (
                  <div key={connector.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#1c1c1e] overflow-hidden">
                      <img src={connector.src} alt="" draggable={false} className="w-6 h-6 object-contain pointer-events-none select-none" />
                    </div>
                    <p className="text-white text-[15px] font-medium flex-1 truncate" style={{ fontFamily: SF }}>{connector.name}</p>
                    <button 
                      onClick={() => setModalState({ view: "detail", connectorId: connector.id })}
                      className="px-4 py-1.5 rounded-full text-[13px] font-bold transition-opacity active:opacity-70 text-black bg-white shrink-0"
                      style={{ fontFamily: SF }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setModalState({ view: "list", connectorId: null })}
                className="mt-5 w-full py-3.5 rounded-[16px] text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors active:bg-white/5"
                style={{ background: "#1c1c1e" }}
              >
                <Plus className="w-4 h-4 text-[#8e8e93]" />
                Add connection
              </button>
            </div>

            {/* Card 2: My Tools */}
            <div className="shrink-0 w-[85vw] max-w-[320px] rounded-[24px] snap-center p-4 flex flex-col" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>My Tools</h3>
                  <p className="text-[#8e8e93] text-[13px] mt-0.5" style={{ fontFamily: SF }}>Automate your workflow</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Botón Business Agent */}
                <button 
                  onClick={() => setIsBusinessModalOpen(true)} 
                  className="flex items-center gap-3 p-2 rounded-2xl active:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                    <Briefcase className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[15px] font-medium leading-tight" style={{ fontFamily: SF }}>Business Agent</p>
                    <p className="text-[#8e8e93] text-[12px] mt-0.5">Auto-reply & spam filter</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#48484a]" />
                </button>

                {/* Botón Bot Interaction */}
                <button 
                  onClick={() => setIsBotIntModalOpen(true)} 
                  className="flex items-center gap-3 p-2 rounded-2xl active:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#a855f7]/10 border border-[#a855f7]/20">
                    <Bot className="w-5 h-5 text-[#a855f7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[15px] font-medium leading-tight" style={{ fontFamily: SF }}>Bot Interaction</p>
                    <p className="text-[#8e8e93] text-[12px] mt-0.5">AI agent for groups</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#48484a]" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* --- EMERGENT MODALS --- */}
      {modalState.view !== "closed" && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModalState({ view: "closed", connectorId: null })} />

          <div className="relative w-full max-w-md rounded-t-[24px] animate-in slide-in-from-bottom duration-300 flex flex-col" style={{ background: "#111", borderTop: "1px solid #1c1c1e", maxHeight: "85vh" }}>
            
            {/* View List */}
            {modalState.view === "list" && (
                <div className="flex flex-col p-4 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Add connection</h2>
                        <button onClick={() => setModalState({ view: "closed", connectorId: null })} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:opacity-70 transition-opacity"><X className="w-5 h-5 text-white" /></button>
                    </div>
                    
                    <div className="relative mb-6">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366]" />
                      <input 
                        type="text" 
                        placeholder="Search connectors" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-[16px] text-white placeholder:text-[#636366] focus:outline-none text-[15px]"
                        style={{ background: "#1c1c1e", border: "1px solid transparent", fontFamily: SF }}
                      />
                    </div>

                    <div className="overflow-y-auto no-scrollbar pb-8 space-y-2 flex-1">
                        {filteredConnectors.map(c => (
                            <button key={c.id} onClick={() => setModalState({ view: "detail", connectorId: c.id })} className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-white/5 transition-colors text-left" style={{ border: "1px solid #1c1c1e" }}>
                                <img src={c.src} alt="" draggable={false} className="w-8 h-8 object-contain pointer-events-none select-none" />
                                <div className="flex-1">
                                    <p className="text-white font-medium">{c.name}</p>
                                    <p className="text-[#8e8e93] text-[12px]">{c.isConnected ? "Active" : "Tap to connect"}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#48484a]" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* View Detail */}
            {modalState.view === "detail" && activeConnectorData && (
              <div className="flex flex-col overflow-hidden h-full">
                <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e]">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setModalState({ view: "list", connectorId: null })} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#1c1c1e] transition-colors"><ArrowLeft className="w-5 h-5 text-[#8e8e93]" /></button>
                    <img src={activeConnectorData.src} alt="" draggable={false} className="w-7 h-7 object-contain pointer-events-none select-none" />
                    <h2 className="text-white font-bold text-[17px]">{activeConnectorData.name}</h2>
                  </div>
                  {activeConnectorData.isConnected ? (
                    <button className="px-4 py-1.5 bg-red-500/10 text-red-500 text-[13px] font-bold rounded-full flex items-center gap-2 active:opacity-70 transition-opacity"><Trash2 className="w-3.5 h-3.5" /> Disconnect</button>
                  ) : (
                    <button className="px-5 py-1.5 bg-white text-black text-[13px] font-bold rounded-full active:opacity-70 transition-opacity">Connect</button>
                  )}
                </div>
                
                <div className="p-4 overflow-y-auto no-scrollbar space-y-5 pb-8">
                  
                  <p className="text-[#e5e5ea] text-[14px]" style={{ fontFamily: SF }}>
                    {activeConnectorData.description}
                  </p>

                  {activeConnectorData.isConnected && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider">Linked account</p>
                            <p className="text-white text-[14px] font-medium">{activeConnectorData.userEmail}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-[#8e8e93] text-[13px] font-medium ml-1">About this connector</h3>
                    <div className="rounded-2xl border border-[#1c1c1e] overflow-hidden bg-black/20">
                      {activeConnectorData.features.map((feat, i, arr) => (
                        <div key={i} className="flex gap-4 p-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid #1c1c1e" : "none" }}>
                          <div className="shrink-0 mt-0.5">{feat.icon}</div>
                          <div>
                            <p className="text-white font-semibold text-[15px] mb-0.5">{feat.title}</p>
                            <p className="text-[#8e8e93] text-[13px] leading-relaxed">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }} />
          </div>
        </div>
      )}
    
      {/* ── VISTA EXTERNA: BUSINESS AUTOMATION ── */}
      {isBusinessModalOpen && (
        <BusinessAutomationView onClose={() => setIsBusinessModalOpen(false)} />
      )}

      {/* ── MODAL TEMPORAL: BOT INTERACTION ── */}
      {isBotIntModalOpen && (
         <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsBotIntModalOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[40px] border-t border-[#2c2c2e] flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 transform-gpu">
             <div className="w-10 h-1 bg-[#3a3a3c] rounded-full mx-auto mb-5 shrink-0" />
             
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 flex items-center justify-center border border-[#a855f7]/30">
                    <Bot className="w-4 h-4 text-[#a855f7]" />
                  </div>
                  <h2 className="text-white font-bold text-[24px]" style={{ fontFamily: SFD }}>Group Agent</h2>
                </div>
                <button type="button" onClick={() => setIsBotIntModalOpen(false)} className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center text-white active:scale-95 transition-transform">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="w-full h-[76px] rounded-[22px] px-4 flex items-center justify-between mb-6 shadow-lg" style={cardLiquidGlassStyle}>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-[16px]" style={{ fontFamily: SFD }}>Interaction Hub</span>
                  <span className="text-[#8e8e93] text-[13px] font-medium" style={{ fontFamily: SF }}>
                    {botIntConfig.enabled ? "Listening to other bots" : "Ignoring bots"}
                  </span>
                </div>
                <button 
                  onClick={() => setBotIntConfig({...botIntConfig, enabled: !botIntConfig.enabled})}
                  className={`w-[50px] h-[30px] rounded-full p-1 transition-colors duration-300 ${botIntConfig.enabled ? 'bg-[#a855f7]' : 'bg-[#3a3a3c]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${botIntConfig.enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </button>
             </div>

             <div className="bg-[#111111] border border-[#1c1c1e] rounded-[20px] p-2 flex flex-col gap-1 mb-6">
                <div className="flex items-center justify-between p-3 border-b border-[#1c1c1e]">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-[15px]" style={{ fontFamily: SF }}>Moderation React</span>
                    <span className="text-[#8e8e93] text-[12px]">Comments on bans/mutes</span>
                  </div>
                  <button onClick={() => setBotIntConfig({...botIntConfig, moderation_react: !botIntConfig.moderation_react})} className={`w-[44px] h-[26px] rounded-full p-1 transition-colors ${botIntConfig.moderation_react ? 'bg-[#a855f7]' : 'bg-[#3a3a3c]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${botIntConfig.moderation_react ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border-b border-[#1c1c1e]">
                  <div className="flex flex-col pr-4">
                    <span className="text-white font-semibold text-[15px]" style={{ fontFamily: SF }}>Auto-Execute Mod</span>
                    <span className="text-[#8e8e93] text-[12px]">Agent can run /ban /mute commands automatically</span>
                  </div>
                  <button onClick={() => setBotIntConfig({...botIntConfig, auto_execute_mod: !botIntConfig.auto_execute_mod})} className={`w-[44px] h-[26px] rounded-full p-1 transition-colors ${botIntConfig.auto_execute_mod ? 'bg-[#a855f7]' : 'bg-[#3a3a3c]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${botIntConfig.auto_execute_mod ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-[15px]" style={{ fontFamily: SF }}>File Summarize</span>
                    <span className="text-[#8e8e93] text-[12px]">Reads PDFs sent by bots</span>
                  </div>
                  <button onClick={() => setBotIntConfig({...botIntConfig, file_summarize: !botIntConfig.file_summarize})} className={`w-[44px] h-[26px] rounded-full p-1 transition-colors ${botIntConfig.file_summarize ? 'bg-[#a855f7]' : 'bg-[#3a3a3c]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${botIntConfig.file_summarize ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  </button>
                </div>
             </div>

             <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsBotIntModalOpen(false)} className="flex-1 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-95" style={{ fontFamily: SF }}>
                   <Save className="w-4 h-4" /> Apply to Group
                </button>
                <button type="button" onClick={() => setIsBotIntModalOpen(false)} className="flex-1 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#a855f7] font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#2c2c2e] active:scale-95 shadow-sm" style={{ fontFamily: SF }}>
                   Cancel
                </button>
             </div>
          </div>
         </div>
      )}
</div>
  )
}
