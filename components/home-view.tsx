"use client"

import Image from "next/image"
import { useApp, type ModelName, APP_MODELS } from "@/lib/app-context"
import { 
  Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, 
  ChevronRight, ChevronDown, Loader2, CalendarDays, Search, ShieldCheck, Github, 
  Mail, Calendar, HardDrive, Plus, Hexagon, ArrowLeft, Trash2, Sparkles,
  Briefcase, Bot, Settings2, Save, Power, Zap, Image as ImageIcon, ArrowRight, Check, MessageCirclePlus, Users, BookOpen
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

// Liquid Glass Styles
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

// Image Protection Styles
const imageProtectionStyle = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  userSelect: 'none' as any,
}



const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const element = event.currentTarget
  if (element.disabled) return

  const circle = document.createElement("span")
  const diameter = Math.max(element.clientWidth, element.clientHeight)
  const radius = diameter / 2

  const rect = element.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top = `${event.clientY - rect.top - radius}px`
  circle.classList.add("ripple")

  const existingRipple = element.querySelector(".ripple")
  if (existingRipple) {
    existingRipple.remove()
  }

  element.appendChild(circle)

  setTimeout(() => {
    circle.remove()
  }, 600)
}

// --- Connectors static metadata (UI only, status loaded from API) ---
const CONNECTORS_DB = [
  { 
    id: "gmail", 
    name: "Gmail", 
    category: "Featured", 
    src: "/gmail.png",
    detailCategory: "Productivity",
    description: "Connect your Gmail to manage your inbox with Noir.",
    labelField: "email",
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
    labelField: "email",
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
    labelField: "email",
    features: [
      { icon: <Calendar className="w-5 h-5 text-[#8e8e93]" />, title: "Search your calendar", desc: "Check today's agenda, find upcoming events and get meeting details." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your schedule is private. We do not use event data for AI training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your events stay in Calendar", desc: "We only read your calendar data to provide real-time information." }
    ]
  },
  { 
    id: "github", 
    name: "GitHub", 
    category: "Featured", 
    src: "/github-icon.png",
    detailCategory: "Development",
    description: "Connect to your repositories and manage your code.",
    labelField: "username",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search repositories", desc: "Find issues, pull requests, and analyze your codebase." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your code remains yours. We do not train on private repositories." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Secure access", desc: "Access is granted via secure OAuth tokens." }
    ]
  },
  { 
    id: "outlook", 
    name: "Outlook", 
    category: "Productivity", 
    src: "/outlook.png",
    detailCategory: "Microsoft 365",
    description: "Integrate your Microsoft outlook account.",
    labelField: "email",
    features: [
      { icon: <Mail className="w-5 h-5 text-[#8e8e93]" />, title: "Search your emails", desc: "Search your inbox, find emails from specific people and summarize email threads." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Enterprise-grade privacy ensures your data is never used for training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your emails stay in Outlook", desc: "Secure real-time access without permanent data storage." }
    ]
  },
  { 
    id: "notion", 
    name: "Notion", 
    category: "Featured", 
    src: "/notion-icon.png",
    detailCategory: "Productivity",
    description: "Access your workspaces and databases.",
    labelField: "email",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search your workspaces", desc: "Find pages, summarize databases, and query your notes." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your workspace content is entirely excluded from model training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your data stays in Notion", desc: "Real-time API queries mean we don't duplicate your databases." }
    ]
  }
];

// Connector runtime status from API
type ConnectorStatus = { connected: boolean; label: string }
type ConnectorsState = Record<string, ConnectorStatus>



import useSWR from 'swr'

// Generic fetcher for SWR
const fetcher = ([url, initData]: [string, string]) => fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ initData })
}).then(res => res.json())

function getTg() { return (window as any).Telegram?.WebApp }

const SlidingNumber = ({ value }: { value: number }) => {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex">
      {str.split('').map((char, index) => (
        <span key={`${index}-${char}`} className="inline-block animate-[slideDownDigit_0.25s_ease-out]">
          {char}
        </span>
      ))}
    </div>
  );
};

export function HomeView() {
  const { setCurrentView, userPreferences, selectedModel, setSelectedModel, accentColor } = useApp()

  const profileFields = ["name", "age", "location", "preferences", "gender", "city", "timezone", "occupation", "interests", "favoriteEmoji", "personality"];
  const filledCount = profileFields.filter(f => !!(userPreferences as any)?.[f]).length;
  const profileCompletionPct = Math.round((filledCount / profileFields.length) * 100);

  const [timeLeft, setTimeLeft] = useState(() => 4 * 24 * 60 * 60 * 1000);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isBotIntModalOpen, setIsBotIntModalOpen] = useState(false)
  const [botIntConfig, setBotIntConfig] = useState({ enabled: true, moderation_react: true, auto_execute_mod: false, file_summarize: true })
  const [modalState, setModalState] = useState<{ view: "closed" | "list" | "detail", connectorId: string | null }>({ view: "closed", connectorId: null })
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const [isInputActive, setIsInputActive] = useState(false)
  const [askQuery, setAskQuery] = useState("")
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [loadingModel, setLoadingModel] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const modelMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (isModelMenuOpen && modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false)
      }
    }
    if (isModelMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, { capture: true })
      document.addEventListener("touchstart", handleClickOutside, { capture: true })
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, { capture: true })
      document.removeEventListener("touchstart", handleClickOutside, { capture: true })
    }
  }, [isModelMenuOpen])

  const showcaseTabs = ["Mini-Apps / Bots Platform", "Gifts", "Usernames"]
  const [activeShowcase, setActiveShowcase] = useState("Mini-Apps / Bots Platform")

  useEffect(() => {
    const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
    if (user?.first_name) {
      setFirstName(user.first_name)
    } else if (user?.username) {
      setFirstName(user.username)
    }
  }, [])
  
  // Connector real-time state from API
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timerValues = {
    days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeLeft / 1000 / 60) % 60),
    seconds: Math.floor((timeLeft / 1000) % 60),
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true)
      const t = setTimeout(() => setIsSearching(false), 500)
      return () => clearTimeout(t)
    } else {
      setIsSearching(false)
    }
  }, [searchQuery])

  const tgInitData = typeof window !== "undefined" ? getTg()?.initData || "" : ""

  const { data: connectorsData, isLoading: connectorsLoading, mutate: mutateConnectors } = useSWR(
    tgInitData ? [`${API_BASE}/api/connectors/status`, tgInitData] : null,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: true }
  )

  const connectorsState: ConnectorsState = connectorsData?.connectors || {}

  // Connect: get link from backend → close mini-app → open bot message with link
  const handleConnect = useCallback(async (connectorId: string) => {
    setConnectingId(connectorId)
    try {
      const tg = getTg()
      const initData = tg?.initData || ""
      const res = await fetch(`${API_BASE}/api/connectors/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, connector_id: connectorId }),
      })
      const data = await res.json()
      if (data.ok && data.url) {
        // Close mini-app and open the OAuth URL in Telegram browser
        try {
          tg?.openLink?.(data.url)
        } catch {
          // Fallback: open inline URL
          window.open(data.url, "_blank")
        }
        // Close the mini-app so the user can see the link in the bot
        setTimeout(() => { try { tg?.close?.() } catch {} }, 300)
      } else {
        alert(data.error || "Could not generate connection link. Try again.")
      }
    } catch (e) {
      console.error("[Connectors] connect error:", e)
      alert("Network error. Please try again.")
    } finally {
      setConnectingId(null)
    }
  }, [API_BASE])

  // Disconnect: call backend, then reload status
  const handleDisconnect = useCallback(async (connectorId: string) => {
    setDisconnectingId(connectorId)
    try {
      const tg = getTg()
      const initData = tg?.initData || ""
      const res = await fetch(`${API_BASE}/api/connectors/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, connector_id: connectorId }),
      })
      const data = await res.json()
      if (data.ok) {
        // Optimistic update
        mutateConnectors(
          (prevData: any) => ({
            ...prevData,
            connectors: {
              ...(prevData?.connectors || {}),
              [connectorId]: { connected: false, label: "" }
            }
          }),
          { revalidate: false }
        )
        setModalState({ view: "closed", connectorId: null })
      } else {
        alert(data.error || "Could not disconnect. Try again.")
      }
    } catch (e) {
      console.error("[Connectors] disconnect error:", e)
    } finally {
      setDisconnectingId(null)
    }
  }, [API_BASE, mutateConnectors])

  const sheetRef = useRef<HTMLDivElement>(null)
  const sheetTouchY = useRef<number | null>(null)

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    sheetTouchY.current = e.touches[0].clientY
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (sheetTouchY.current === null) return
    const diff = e.touches[0].clientY - sheetTouchY.current
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`
      e.stopPropagation()
    }
  }
  const handleSheetTouchEnd = (e: React.TouchEvent) => {
    if (sheetTouchY.current === null) return
    const diff = e.changedTouches[0].clientY - sheetTouchY.current
    if (diff > 100) {
      setModalState({ view: "closed", connectorId: null })
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s ease-out'
      sheetRef.current.style.transform = `translateY(0px)`
    }
    sheetTouchY.current = null
  }

  // Dynamic Account Setup Progress
  const isBasicComplete = !!(userPreferences?.name?.trim() && userPreferences?.gender?.trim() && userPreferences?.age?.toString()?.trim() && userPreferences?.city?.trim())
  const isAdditionalComplete = !!(userPreferences?.timezone?.trim() && userPreferences?.occupation?.trim() && userPreferences?.interests?.trim())
  const isNoirComplete = !!(userPreferences?.favoriteEmoji?.trim() && userPreferences?.personality?.trim())
  
  const completedSections = [isBasicComplete, isAdditionalComplete, isNoirComplete].filter(Boolean).length
  const totalSections = 3
  
  // SVG Progress Ring Calculation
  const radius = 12 // Original narrow pill radius
  const circumference = 2 * Math.PI * radius // ~75.40
  const strokeDashoffset = circumference - (completedSections / totalSections) * circumference

  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    if (modalState.view !== "closed") tg.BackButton.show()
    else tg.BackButton.hide()

    const handleBack = () => {
      if (modalState.view === "detail") setModalState({ view: "list", connectorId: null })
      else if (modalState.view === "list") setModalState({ view: "closed", connectorId: null })
    }

    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [modalState.view])

  const filteredConnectors = useMemo(() => {
    if (!searchQuery) return CONNECTORS_DB;
    const q = searchQuery.toLowerCase();
    return CONNECTORS_DB.filter(c => {
      const nameParts = c.name.toLowerCase().split(' ');
      return nameParts.some(w => w.startsWith(q)) || c.name.toLowerCase().startsWith(q);
    });
  }, [searchQuery]);

  const activeConnectorData = CONNECTORS_DB.find(c => c.id === modalState.connectorId)

  return (
    <div className="flex-1 flex flex-col bg-[#1c1c1e] min-h-screen text-white overflow-x-hidden font-sans pb-24">
      
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-anim 600ms linear;
          background-color: rgba(150, 150, 150, 0.25);
          pointer-events: none;
          z-index: 0;
        }
        @keyframes ripple-anim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes slideDownDigit {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmerBorder {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background-color: #2c2c2e;
        }
        .skeleton-shimmer::after {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer 1.2s infinite;
        }
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 8%) scale(1.1); }
          66% { transform: translate(-4%, 5%) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-8%, -5%) scale(1.05); }
          66% { transform: translate(5%, -8%) scale(1.15); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, 10%) scale(1.2); }
        }
      `}} />



      {/* Hero Background Layer */}
      <div className="absolute top-0 left-0 w-full h-[520px] sm:h-[540px] bg-[#050505] z-0 overflow-hidden pointer-events-none -translate-y-2">
        <Image 
          src="/background-hero.png" 
          alt="Hero Background" 
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_60%] opacity-90" 
        />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/90 to-transparent"></div>
      </div>

      {/* Hero Content Section */}
      <div className="w-full relative z-40 -translate-y-2 h-[520px] sm:h-[540px] flex flex-col items-center justify-center overflow-visible pointer-events-none">
        
        {/* Content Layer */}
        <div className="relative z-40 flex flex-col items-center gap-2 w-full max-w-md px-6 text-center transform -translate-y-16 pointer-events-auto">
          
          {/* Object (Logo) */}
          <Image 
            src="/hero.png" 
            alt="Hero Object" 
            width={192}
            height={192}
            priority
            className="mx-auto object-contain select-none pointer-events-none drop-shadow-2xl transform translate-y-6"
            draggable={false}
            style={imageProtectionStyle}
          />
          
          <h1 
            className="text-white font-bold text-[28px] sm:text-[32px] leading-[1.1] tracking-tight drop-shadow-md" 
            style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}
          >
            Hi, {firstName || "there"}
          </h1>

          {/* Ask anything / Model Selector Row Wrapper */}
          <div ref={modelMenuRef} className="relative w-full mt-4 z-50">
            <div 
              className="w-full h-[46px] overflow-visible rounded-full flex items-center shadow-sm bg-white/5 pl-1.5 pr-1.5"
              style={{
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                transform: "translateZ(0)",
                willChange: "transform, backdrop-filter",
                backfaceVisibility: "hidden"
              }}
            >
              
              {/* Inner Model Selector */}
            <div className={`relative h-full flex items-center shrink-0 transition-all duration-300 ease-in-out whitespace-nowrap ${isInputActive ? 'max-w-0 opacity-0 overflow-hidden' : 'max-w-[175px] opacity-100'}`}>
               <button
                  onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                  className="flex items-center gap-1.5 h-[34px] px-3.5 rounded-full bg-white/10 hover:bg-white/[0.15] active:bg-white/20 transition-colors border border-white/5 max-w-full"
               >
                 <span className="font-semibold text-[13.5px] text-white truncate flex-1" style={{ fontFamily: SF }}>{selectedModel}</span>
                 <ChevronDown className={`w-3.5 h-3.5 text-white/70 shrink-0 transition-transform duration-300 ${isModelMenuOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
               </button>
              </div>


            {/* Input field */}
            <input 
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              onFocus={() => setIsInputActive(true)}
              onBlur={() => setIsInputActive(false)}
              placeholder="Ask, search, find..."
              className="flex-1 w-full bg-transparent border-none outline-none text-[#e5e5ea] text-[15px] font-medium tracking-wide pl-3 pr-2 placeholder:text-[#8e8e93] min-w-0"
              style={{ fontFamily: SF }}
            />

            {/* Submit Button */}
            <button className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${askQuery.trim().length > 0 ? 'bg-[#60a5fa] hover:bg-[#4b8ce1]' : 'bg-white/10 hover:bg-white/20'}`}>
               <ArrowUp className="w-[16px] h-[16px] text-white/90" strokeWidth={2} />
            </button>
          </div>

          {/* Model Menu Popover */}
          {isModelMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} />
              <div 
                className="cursor-default absolute left-[6px] top-[54px] w-[290px] rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50 animate-in fade-in slide-in-from-top-4 duration-300 bg-[#1c1c1e]/40 border border-white/[0.06] transform-gpu"
                style={{ backdropFilter: "blur(40px) saturate(150%)", WebkitBackdropFilter: "blur(40px) saturate(150%)", willChange: "transform, opacity", backfaceVisibility: "hidden" }}
              >
                <div className="flex flex-col py-2 relative overflow-y-auto overflow-x-hidden max-h-[350px] rounded-[32px] [&::-webkit-scrollbar]:hidden" style={{ zIndex: 10 }}>
                  {APP_MODELS.map((m, idx) => (
                    <div key={m.name} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (selectedModel === m.name) return;
                          setLoadingModel(m.name);
                          setTimeout(() => {
                            setSelectedModel(m.name as ModelName);
                            setLoadingModel(null);
                          }, 800);
                        }}
                        className={`flex items-center justify-between px-5 py-3 transition-colors text-left hover:bg-white/10 w-full`}
                      >
                        <div className="flex flex-col items-start gap-[2px] pr-4 min-w-0 flex-1">
                          <span className="text-[17px] font-medium text-white leading-tight flex items-center gap-2 whitespace-normal break-words" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                            {m.name}
                            {m.tag && <span className={`${m.tagColor} ${m.tagStyle} shrink-0`}>{m.tag}</span>}
                          </span>
                          <span className="text-[14px] font-normal text-[#8e8e93] leading-snug whitespace-normal break-words w-full" style={{ fontFamily: SF }}>{m.desc}</span>
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-[20px]">
                          {loadingModel === m.name ? (
                            <Loader2 className="w-[18px] h-[18px] text-[#8e8e93] animate-spin" />
                          ) : selectedModel === m.name ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[#60a5fa]">
                              <polyline points="22 4 9 17 4 12"></polyline>
                            </svg>
                          ) : null}
                        </div>
                      </button>
                      {idx < APP_MODELS.length - 1 && (
                        <div className="h-[1px] bg-white/[0.08] mx-5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 px-4 relative z-30 -mt-36">
        


        {/* Profile Completion Card */}
        <div className="w-full bg-[#2c2c2e] rounded-[16px] p-3 mt-2">
          <p className="text-white text-[14px] font-semibold leading-snug mb-2" style={{ fontFamily: SF }}>
            Complete your profile to receive personalized recommendations
          </p>
          {/* Progress bar container */}
          <div className="w-full h-[6px] bg-[#3a3a3c] rounded-full overflow-hidden mb-1">
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${profileCompletionPct}%`, background: '#60a5fa' }}></div>
          </div>
          <p className="text-white text-[13px] mb-3" style={{ fontFamily: SF }}>
            Profile completion: {profileCompletionPct}%
          </p>
          <button 
            onClick={() => setCurrentView("account_setup")}
            onPointerDown={createRipple}
            className="relative overflow-hidden w-full py-3 rounded-full text-white font-medium active:opacity-80 transition-opacity flex items-center justify-center shadow-sm"
            style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
          >
            <span className="relative z-10">Complete Account</span>
          </button>
        </div>

        {/* Showcase Section */}
        <div className="mt-2 w-full flex flex-col gap-3">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {showcaseTabs.map(tab => {
              const isActive = activeShowcase === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveShowcase(tab)}
                  className={`flex items-center justify-center px-4 h-[32px] rounded-full font-semibold text-[15px] active:scale-95 transition-all shrink-0 ${isActive ? 'text-black' : 'text-white'}`}
                  style={{
                    ...(isActive 
                      ? {
                          backgroundColor: "#ffffff",
                          border: "1px solid rgba(255, 255, 255, 0.8)",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1.5px 1px rgba(255, 255, 255, 1)",
                          transform: "translateZ(0)"
                        } 
                      : {
                          backgroundColor: "#1c1c1e",
                          border: "1px solid rgba(255, 255, 255, 0.10)",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1.5px 1px rgba(255, 255, 255, 0.15)",
                          transform: "translateZ(0)"
                        }),
                    fontFamily: SF
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Card Container */}
          <div 
            className="w-full bg-[#2c2c2e] rounded-[24px] overflow-hidden flex flex-col p-2 relative shadow-lg"
            style={{
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1.5px 1px rgba(255, 255, 255, 0.1)",
              transform: "translateZ(0)"
            }}
          >
            {/* Image Placeholder (Mockup/Video) */}
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-[16px] overflow-hidden relative mb-2 flex items-center justify-center border border-white/5">
              <span className="text-white/30 font-medium text-[13px]" style={{ fontFamily: SF }}>Placeholder</span>
            </div>

            {/* Description */}
            <div className="px-3 pb-2 text-center flex flex-col gap-1">
              <h3 className="text-white font-bold text-[18px] leading-tight" style={{ fontFamily: SFD }}>
                {activeShowcase}
              </h3>
              <p className="text-[#a0a0a0] text-[13px] leading-snug" style={{ fontFamily: SF }}>
                {activeShowcase === "Mini-Apps / Bots Platform" 
                  ? "Create bots and Mini-Apps natively integrated into Telegram and the TON blockchain."
                  : activeShowcase === "Gifts"
                  ? "Send and receive animated gifts powered by the TON blockchain."
                  : "Secure your unique identity with collectible TON-based Usernames."
                }
              </p>
            </div>
          </div>
        </div>



        {/* SuperNoir Banner */}
        <div 
          onClick={() => setCurrentView("premium")}
          className="hidden w-full mb-1 mt-0 relative overflow-hidden rounded-[16px] shadow-lg cursor-pointer"
        >
          {/* Background Gradient matching Premium View */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#e65c00] via-[#ff6a00] to-[#ff8c33]" />
          
          {/* Decorative subtle dots */}
          <div className="absolute top-[15px] left-[42%] w-1 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-[20px] left-[52%] w-1.5 h-1.5 bg-white/30 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute top-[40px] left-[58%] w-1 h-1 bg-white/25 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute top-[10px] left-[65%] w-1.5 h-1.5 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-[10px] left-[62%] w-1 h-1 bg-white/15 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute top-[25px] left-[38%] w-1 h-1 bg-white/30 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-[35px] left-[46%] w-1 h-1 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />
          <div className="absolute top-[50px] left-[70%] w-1.5 h-1.5 bg-white/25 rounded-full blur-[0.5px] pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between pl-5 pr-2 h-[96px]">
            {/* Left side content */}
            <div className="flex flex-col items-start justify-center pt-1 pointer-events-none relative">
              <h2 className="text-white font-extrabold text-[27px] leading-none mb-1 drop-shadow-md relative z-10" style={{ fontFamily: SFD, letterSpacing: "-0.03em" }}>
                SuperNoir Free
              </h2>
              <div className="bg-gradient-to-r from-[#ff8226] to-[#ff9f40] px-4 py-[4px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/20 -rotate-[3.5deg] origin-left -mt-[4px] ml-1 relative z-20">
                <span className="text-white font-extrabold text-[19px] leading-none drop-shadow-sm tracking-wide" style={{ fontFamily: SF }}>Try now</span>
              </div>
            </div>

            {/* Right side image */}
            <div className="w-[120px] h-full shrink-0 relative pointer-events-none">
              <img 
                src="/SuperNoir-Free-Banner.png" 
                alt="SuperNoir Free" 
                className="absolute right-[2px] top-1/2 -translate-y-1/2 w-[140px] h-auto object-contain drop-shadow-md" 
                draggable={false} 
                onContextMenu={(e) => e.preventDefault()}
                style={imageProtectionStyle}
              />
            </div>
          </div>
        </div>

        {/* Connectors Section */}
        <div className="w-full">
            <div className="mt-2 mb-3 pl-1">
              <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>
                Connectors
              </h2>
              <p className="text-[#a0a0a0] text-[13px] mt-0.5 leading-snug" style={{ fontFamily: SF }}>
                Link your apps and services to unlock powerful AI automations.
              </p>
            </div>

            <div 
              className="w-full bg-[#2c2c2e] rounded-[16px] overflow-hidden flex flex-col relative"
            >
              <div className="flex flex-col">
                {connectorsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5 first:pt-5 last:pb-5">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                        <div className="w-8 h-8 rounded-[12px] skeleton-shimmer shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                          <div className="h-3 w-24 skeleton-shimmer rounded-full" />
                          <div className="h-2.5 w-full skeleton-shimmer rounded-full" />
                        </div>
                      </div>
                      <div className="shrink-0 w-[70px] h-[28px] rounded-full skeleton-shimmer" />
                    </div>
                  ))
                  : CONNECTORS_DB.slice(0, 4).map((c, i, arr) => {
                    const status = connectorsState[c.id]
                    const isConn = status?.connected ?? false
                    return (
                      <button 
                        key={c.id}
                        onClick={() => setModalState({ view: "detail", connectorId: c.id })}
                        onPointerDown={createRipple}
                        className="relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5 first:pt-5 last:pb-5 active:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3.5 relative z-10 pointer-events-none flex-1 min-w-0 pr-3">
                          <div className="relative">
                            <img src={c.src} alt={c.name} className="w-8 h-8 object-contain shrink-0" draggable={false} style={imageProtectionStyle} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-white font-medium text-[16px] leading-[1.2] mb-0.5 truncate" style={{ fontFamily: SFD }}>{c.name}</span>
                            <span className="text-[#a0a0a0] text-[13px] leading-[1.3] line-clamp-1" style={{ fontFamily: SF }}>
                              {isConn && status?.label ? status.label : c.description}
                            </span>
                          </div>
                        </div>
                        <div className={`relative z-10 shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold pointer-events-none ${
                          isConn
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-[#60a5fa] text-white"
                        }`} style={{ fontFamily: SF }}>
                          {isConn ? "Connected" : "Connect"}
                        </div>
                      </button>
                    )
                  })
                }
              </div>
            </div>

            <div 
              onClick={() => setModalState({ view: "list", connectorId: null })}
              onPointerDown={createRipple}
              className="relative w-full mt-3 overflow-hidden rounded-full cursor-pointer active:scale-[0.98] transition-transform flex items-center shadow-sm bg-white/5"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-[#8e8e93] pointer-events-none z-10" />
              <input 
                type="text" 
                placeholder="Search connectors" 
                readOnly
                className="w-full pl-[36px] pr-4 py-2 bg-transparent text-[#e5e5ea] placeholder:text-[#8e8e93] focus:outline-none text-[15px] pointer-events-none"
                style={{ fontFamily: SF }}
              />
            </div>
        </div>
      </div>

      {/* Modals & Full Screen Views */}
      {modalState.view !== "closed" && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#1c1c1e] animate-in slide-in-from-right duration-300">
          
          {modalState.view === "list" && (
            <div className="flex flex-col h-full overflow-hidden" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 24px)" }}>
              {/* Header with Search Bar */}
              <div className="flex items-center gap-3 px-4 mb-3 mt-4 shrink-0">
                <div className="relative flex-1 overflow-hidden rounded-full flex items-center shadow-sm bg-white/5">
                  <div className="absolute left-3.5 z-10 flex items-center justify-center">
                    {isSearching ? <Loader2 className="w-4 h-4 text-[#8e8e93] animate-spin" /> : <Search className="w-4 h-4 text-[#8e8e93]" />}
                  </div>
                  <input 
                    type="text" placeholder="Search connectors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-[36px] pr-10 py-2 bg-transparent text-[#e5e5ea] placeholder:text-[#8e8e93] focus:outline-none text-[15px]"
                    style={{ fontFamily: SF }}
                  />
                  {searchQuery.length > 0 && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 z-10 p-0.5 rounded-full bg-[#2c2c2e] text-[#8e8e93] active:scale-95 transition-transform"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Explore Title */}
              <div className="px-4 mb-3 mt-2">
                <h2 className="text-white font-bold text-[22px]" style={{ fontFamily: SFD }}>
                  {searchQuery.length > 0 ? "Search results" : "Explore"}
                </h2>
              </div>

              {/* Connectors List using the exact style from menu */}
              <div className="overflow-y-auto overscroll-none hide-scrollbar pb-10 flex-1 px-4">
                <div className="w-full bg-[#2c2c2e] rounded-[16px] overflow-hidden flex flex-col shadow-lg relative min-h-[100px]">
                  <div className="flex flex-col">
                    {isSearching ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5 first:pt-5 last:pb-5">
                          <div className="flex items-center gap-3.5 relative z-10 flex-1 min-w-0 pr-3">
                            <div className="w-8 h-8 rounded-[12px] skeleton-shimmer shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                              <div className="h-3 w-24 skeleton-shimmer rounded-full" />
                              <div className="h-2.5 w-full skeleton-shimmer rounded-full mt-0.5" />
                              <div className="h-2.5 w-2/3 skeleton-shimmer rounded-full" />
                            </div>
                          </div>
                          <div className="relative z-10 shrink-0 w-[74px] h-[30px] rounded-full skeleton-shimmer" />
                        </div>
                      ))
                    ) : filteredConnectors.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 opacity-70">
                        <Search className="w-10 h-10 text-[#48484a] mb-3" />
                        <span className="text-white font-semibold text-[16px]" style={{ fontFamily: SF }}>No results found</span>
                        <span className="text-[#8e8e93] text-[13px] mt-1 text-center px-4" style={{ fontFamily: SF }}>Try searching for a different connector.</span>
                      </div>
                    ) : (
                      filteredConnectors.map(c => {
                          const status = connectorsState[c.id]
                          const isConn = status?.connected ?? false
                          return (
                            <button 
                              key={c.id} 
                              onClick={() => setModalState({ view: "detail", connectorId: c.id })}
                              onPointerDown={createRipple}
                              className="defer-render relative overflow-hidden w-full flex items-center justify-between px-4 py-3.5 first:pt-5 last:pb-5 active:bg-white/5 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3.5 relative z-10 pointer-events-none flex-1 min-w-0 pr-3">
                                <div className="relative">
                                  <img src={c.src} alt={c.name} className="w-8 h-8 object-contain shrink-0" draggable={false} style={imageProtectionStyle} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-white font-medium text-[16px] leading-[1.2] mb-0.5 truncate" style={{ fontFamily: SFD }}>{c.name}</span>
                                  <span className="text-[#a0a0a0] text-[13px] leading-[1.3] line-clamp-2" style={{ fontFamily: SF }}>{c.description}</span>
                                </div>
                              </div>
                              <div className={`relative z-10 shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold pointer-events-none ${
                                isConn ? "bg-orange-500/10 text-orange-400" : "bg-[#60a5fa] text-white"
                              }`} style={{ fontFamily: SF }}>
                                {isConn ? "Connected" : "Connect"}
                              </div>
                            </button>
                          )
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalState.view === "detail" && activeConnectorData && (() => {
            const status = connectorsState[activeConnectorData.id]
            const isConn = status?.connected ?? false
            const linkedLabel = status?.label || ""
            const isConnecting = connectingId === activeConnectorData.id
            const isDisconnecting = disconnectingId === activeConnectorData.id
            return (
            <div className="flex flex-col overflow-hidden h-full" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 24px)" }}>
              <div className="flex items-center justify-between px-4 mb-2 pb-4 border-b border-[#1c1c1e] shrink-0 mt-4">
                <div className="flex items-center gap-3">
                  <img src={activeConnectorData.src} alt={activeConnectorData.name} className="w-7 h-7 object-contain select-none pointer-events-none" draggable={false} style={imageProtectionStyle} />
                  <h2 className="text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>{activeConnectorData.name}</h2>
                </div>
                {isConn ? (
                  <button 
                    onClick={() => handleDisconnect(activeConnectorData.id)}
                    disabled={isDisconnecting}
                    className="px-4 py-1.5 bg-red-500/10 text-red-500 text-[13px] font-bold rounded-full flex items-center gap-2 active:opacity-70 disabled:opacity-50"
                  >
                    {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(activeConnectorData.id)}
                    disabled={isConnecting}
                    className="px-4 py-1.5 bg-[#60a5fa] text-white text-[13px] font-bold rounded-full active:opacity-70 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    style={{ fontFamily: SF }}
                  >
                    {isConnecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isConnecting ? "Opening…" : "Connect"}
                  </button>
                )}
              </div>
              
              <div className="p-4 overflow-y-auto overscroll-none hide-scrollbar space-y-5 pb-8 flex-1">
                <p className="text-[#e5e5ea] text-[14px]" style={{ fontFamily: SF }}>{activeConnectorData.description}</p>
                {isConn && (
                  <div className="px-5 py-3 rounded-[24px] bg-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[#8e8e93] text-[11px] font-bold uppercase tracking-wider">Linked account</p>
                      <p className="text-white text-[14px] font-medium mt-0.5">
                        {linkedLabel || "Connected"}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-[#8e8e93] text-[13px] font-medium ml-1">About this connector</h3>
                  <div className="rounded-[16px] overflow-hidden bg-[#2c2c2e]">
                    {activeConnectorData.features.map((feat, i, arr) => (
                      <div key={i}>
                        <div className="flex gap-4 p-4">
                          <div className="shrink-0 mt-0.5">{feat.icon}</div>
                          <div>
                            <p className="text-white font-medium text-[16px] mb-0.5" style={{ fontFamily: SFD }}>{feat.title}</p>
                            <p className="text-[#a0a0a0] text-[13px] leading-relaxed" style={{ fontFamily: SF }}>{feat.desc}</p>
                          </div>
                        </div>
                        {i !== arr.length - 1 && <div className="h-[1px] bg-[#3a3a3c] relative z-20 ml-4" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="-mt-2 pb-2">
                  <p className="text-[#636366] text-[11.5px] leading-relaxed text-center px-4" style={{ fontFamily: SF }}>
                    Connectors are not created or maintained by Noir. Review permissions before connecting. Usage is subject to the <a href="https://composio.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] underline decoration-[#60a5fa]/40 active:opacity-70 transition-opacity">Composio Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          )})()
          }
        </div>
      )}
    
      {/* External Views */}
      {isBusinessModalOpen && <BusinessAutomationView onClose={() => setIsBusinessModalOpen(false)} />}

      {/* Temporary Modals */}
      {isBotIntModalOpen && (
         <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" onClick={() => setIsBotIntModalOpen(false)} />
          <div className="relative w-full bg-[#161618] rounded-t-[28px] px-5 pt-4 pb-[40px] border-t border-[#2c2c2e] flex flex-col max-h-[90vh] overflow-y-auto overscroll-none animate-in slide-in-from-bottom duration-300 transform-gpu">
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
                <button type="button" onClick={() => setIsBotIntModalOpen(false)} className="flex-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#a855f7] font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-colors border border-[#3a3a3c] active:scale-95 shadow-sm" style={{ fontFamily: SF }}>
                    Cancel
                </button>
             </div>
          </div>
         </div>
      )}

    </div>
  )
}
