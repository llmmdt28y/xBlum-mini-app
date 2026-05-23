"use client"

import { useApp } from "@/lib/app-context"
import { 
  Coins, MessageCircle, AlertTriangle, Clock, Lock, X, ArrowUp, 
  ChevronRight, Loader2, CalendarDays, Search, ShieldCheck, Github, 
  Mail, Calendar, HardDrive, Plus, Hexagon, ArrowLeft, Trash2, Sparkles,
  Briefcase, Bot, Settings2, Save, Power, Zap, Image as ImageIcon, ArrowRight
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

// --- Estilos de Liquid Glass originales ---
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

// --- Estilos de Protección de Imágenes ---
const imageProtectionStyle = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  userSelect: 'none' as any,
}

// --- Connectors Database Completo ---
const CONNECTORS_DB = [
  { 
    id: "gmail", name: "Gmail", category: "Featured", src: "/gmail.png", detailCategory: "Productivity",
    description: "Connect your Gmail to manage your inbox with AI.", isConnected: true, userEmail: "user@gmail.com",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search your emails", desc: "Search your inbox, summarize unread emails and find messages from specific people." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your personal data remains private and is never used for training purposes." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your emails stay in Gmail", desc: "We don't store your emails. Search is performed in real-time when you ask questions." }
    ]
  },
  { 
    id: "drive", name: "Google Drive", category: "Featured", src: "/google-drive.png", detailCategory: "Productivity",
    description: "Access and analyze your cloud documents seamlessly.", isConnected: false, userEmail: "",
    features: [
      { icon: <HardDrive className="w-5 h-5 text-[#8e8e93]" />, title: "Access your files", desc: "Search documents, summarize presentations and ask questions about your Google Drive files." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your files are accessed only when you request it, with zero training usage." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your files stay in Drive", desc: "Data is retrieved on-the-fly and never stored on our servers." }
    ]
  },
  { 
    id: "calendar", name: "Google Calendar", category: "Featured", src: "/google-calendar.png", detailCategory: "Productivity",
    description: "Keep track of your schedule and meetings.", isConnected: false, userEmail: "",
    features: [
      { icon: <Calendar className="w-5 h-5 text-[#8e8e93]" />, title: "Search your calendar", desc: "Check today's agenda, find upcoming events and get meeting details." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train models", desc: "Your schedule is private. We do not use event data for AI training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your events stay in Calendar", desc: "We only read your calendar data to provide real-time information." }
    ]
  },
  { 
    id: "outlook", name: "Outlook", category: "Productivity", src: "/outlook.png", detailCategory: "Microsoft 365",
    description: "Integrate your Microsoft outlook account.", isConnected: false, userEmail: "",
    features: [
      { icon: <Mail className="w-5 h-5 text-[#8e8e93]" />, title: "Search your emails", desc: "Search your inbox, find emails from specific people and summarize email threads." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Enterprise-grade privacy ensures your data is never used for training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your emails stay in Outlook", desc: "Secure real-time access without permanent data storage." }
    ]
  },
  { 
    id: "github", name: "GitHub", category: "Featured", src: "/github-icon.png", detailCategory: "Development",
    description: "Connect to your repositories and manage your code.", isConnected: false, userEmail: "",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search repositories", desc: "Find issues, pull requests, and analyze your codebase." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your code remains yours. We do not train on private repositories." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Secure access", desc: "Access is granted via secure OAuth tokens." }
    ]
  },
  { 
    id: "notion", name: "Notion", category: "Featured", src: "/notion-icon.png", detailCategory: "Productivity",
    description: "Access your workspaces and databases.", isConnected: false, userEmail: "",
    features: [
      { icon: <Search className="w-5 h-5 text-[#8e8e93]" />, title: "Search your workspaces", desc: "Find pages, summarize databases, and query your notes." },
      { icon: <Lock className="w-5 h-5 text-[#8e8e93]" />, title: "We never use your data to train our models", desc: "Your workspace content is entirely excluded from model training." },
      { icon: <ShieldCheck className="w-5 h-5 text-[#8e8e93]" />, title: "Your data stays in Notion", desc: "Real-time API queries mean we don't duplicate your databases." }
    ]
  }
];

function getTg() { return (window as any).Telegram?.WebApp }

// --- COMPONENTE MONEDA INTERACTIVA 3D ---
const InteractiveCoin = () => {
  // Estado inicial: inclinada de superior izquierda a inferior derecha
  const [rotation, setRotation] = useState({ x: -25, y: -35 }); 
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const coinRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (coinRef.current) {
      coinRef.current.style.transition = 'none'; // Quitar transición al arrastrar para más fluidez
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const sensitivity = 0.8; // Sensibilidad del giro del dedo
    
    setRotation(prev => ({
      x: prev.x - deltaY * sensitivity,
      y: prev.y + deltaX * sensitivity
    }));
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (coinRef.current) {
      coinRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'; // Suavizar al soltar
    }
  };

  return (
    <div
      className="flex items-center justify-center w-full relative z-0 -translate-y-2"
      style={{ height: '360px', touchAction: 'none', perspective: '1200px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Brillo de fondo sutil radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-white/5 rounded-full blur-[70px] pointer-events-none" />

      {/* Difuminado inferior con el fondo de la app */}
      <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

      {/* Contenedor principal de la moneda con Fake 3D */}
      <div
        ref={coinRef}
        className="relative w-[200px] h-[200px] cursor-grab active:cursor-grabbing"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        {/* Generar el "Cilindro" (El grosor de la moneda creado con capas apiladas) */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-black/30"
            style={{
              background: 'linear-gradient(135deg, #3a3a3c 0%, #161618 50%, #3a3a3c 100%)',
              transform: `translateZ(${i - 8}px)`, // Distribuye de -8px a +7px
              boxShadow: i === 8 ? '0 0 50px rgba(0,0,0,0.9)' : 'none'
            }}
          />
        ))}

        {/* Cara Frontal */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center bg-[#0e0e10] overflow-hidden border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(8.5px)', boxShadow: 'inset 0 0 25px rgba(255,255,255,0.05)' }}
        >
          <img src="/1000011073.png" alt="Coin Front" draggable={false} className="w-[85%] h-[85%] object-contain select-none pointer-events-none" style={imageProtectionStyle} />
        </div>

        {/* Cara Trasera */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center bg-[#0e0e10] overflow-hidden border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(8.5px)', boxShadow: 'inset 0 0 25px rgba(255,255,255,0.05)' }}
        >
          <img src="/1000011073.png" alt="Coin Back" draggable={false} className="w-[85%] h-[85%] object-contain select-none pointer-events-none" style={imageProtectionStyle} />
        </div>
      </div>
    </div>
  );
};

export function HomeView() {
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isBotIntModalOpen, setIsBotIntModalOpen] = useState(false)
  const [botIntConfig, setBotIntConfig] = useState({ enabled: true, moderation_react: true, auto_execute_mod: false, file_summarize: true })
  const [modalState, setModalState] = useState<{ view: "closed" | "list" | "detail", connectorId: string | null }>({ view: "closed", connectorId: null })
  const [searchQuery, setSearchQuery] = useState("")

  const { setCurrentView } = useApp()

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

  const filteredConnectors = CONNECTORS_DB.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const activeConnectorData = CONNECTORS_DB.find(c => c.id === modalState.connectorId)

  return (
    <div className="flex-1 flex flex-col bg-black min-h-screen text-white overflow-x-hidden font-sans pb-28">
      
      {/* ── ESTILOS PARA OCULTAR SCROLLBAR ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      {/* --- SECCIÓN HERO 3D (MONEDA INTERACTIVA) --- */}
      <InteractiveCoin />

      {/* --- CONTENIDO PRINCIPAL (Tarjetas) --- */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-4 px-4 relative z-30 -mt-20">
        
        {/* Tarjeta Schedules */}
        <div className="bg-[#111111] rounded-[24px] p-4 border border-white/5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-[46px] h-[46px] bg-[#1a1a1c] rounded-full flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-white leading-tight" style={{ fontFamily: SFD }}>Schedules</h2>
                <p className="text-[13px] text-[#8e8e93] flex items-center gap-1.5 mt-0.5" style={{ fontFamily: SF }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e93] opacity-60"></span> Relax
                  <span className="mx-0.5">•</span> 
                  No upcoming events
                </p>
              </div>
            </div>
            <button onClick={() => setCurrentView("schedule")} className="w-9 h-9 bg-[#1a1a1c] rounded-full flex items-center justify-center text-[#8e8e93] hover:bg-[#222] transition-colors relative z-10">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
          </div>
        </div>

        {/* Carrusel Horizontal */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 -mx-4 px-4">
          
          {/* Connectors Card */}
          <div className="min-w-[88%] snap-center bg-[#111111] rounded-[24px] p-4 border border-white/5 flex flex-col shadow-lg">
            <h2 className="text-[18px] font-bold text-white mb-0.5" style={{ fontFamily: SFD }}>Connectors</h2>
            <p className="text-[12px] text-[#8e8e93] mb-3" style={{ fontFamily: SF }}>Extend capabilities with your apps</p>

            <div className="flex flex-col gap-1">
              {CONNECTORS_DB.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <img src={c.src} alt={c.name} className="w-6 h-6 object-contain select-none pointer-events-none" draggable={false} style={imageProtectionStyle} />
                    <span className="text-[14px] font-medium text-white" style={{ fontFamily: SF }}>{c.name}</span>
                  </div>
                  <button 
                    onClick={() => setModalState({ view: "detail", connectorId: c.id })}
                    className="px-3.5 py-1.5 rounded-[14px] border border-transparent bg-[#1c1c1e] text-white text-[12px] font-medium hover:bg-[#2c2c2e] transition-colors" style={{ fontFamily: SF }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setModalState({ view: "list", connectorId: null })}
              className="mt-3 w-full py-3 bg-black border border-white/5 rounded-[16px] flex items-center justify-center gap-2 text-[14px] font-medium text-white hover:bg-[#0a0a0c] transition-colors" style={{ fontFamily: SF }}
            >
              <Plus className="w-4 h-4 text-[#8e8e93]" /> Add connection
            </button>
          </div>

          {/* My Tools Card */}
          <div className="min-w-[88%] snap-center bg-[#111111] rounded-[24px] p-4 border border-white/5 flex flex-col shadow-lg relative">
            <h2 className="text-[18px] font-bold text-white mb-0.5" style={{ fontFamily: SFD }}>My Tools</h2>
            <p className="text-[12px] text-[#8e8e93] mb-3" style={{ fontFamily: SF }}>Automate your workflow</p>
            
            <div className="flex flex-col gap-1">
                <button onClick={() => setIsBusinessModalOpen(true)} className="flex items-center gap-3 py-1.5 hover:opacity-70 transition-opacity text-left">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                    <Briefcase className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[14px] font-medium" style={{ fontFamily: SF }}>Business Agent</p>
                    <p className="text-[#8e8e93] text-[11px]">Auto-reply & spam filter</p>
                  </div>
                </button>

                <button onClick={() => setIsBotIntModalOpen(true)} className="flex items-center gap-3 py-1.5 hover:opacity-70 transition-opacity text-left mt-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#a855f7]/10 border border-[#a855f7]/20">
                    <Bot className="w-4 h-4 text-[#a855f7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[14px] font-medium" style={{ fontFamily: SF }}>Group Agent</p>
                    <p className="text-[#8e8e93] text-[11px]">AI bot interactions</p>
                  </div>
                </button>
            </div>

            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[12px] h-[90px] bg-[#1a1a1c] rounded-l-[24px] border border-white/5 p-2 flex flex-col gap-2 items-center justify-center">
              <span className="text-white text-[9px] font-bold select-none" style={imageProtectionStyle}>M</span>
              <span className="text-[#8e8e93] text-[7px] select-none" style={imageProtectionStyle}>Auto</span>
              <Settings2 className="w-2.5 h-2.5 text-[#333]" />
              <ImageIcon className="w-2.5 h-2.5 text-[#333]" />
            </div>
          </div>

        </div>
      </div>

      {/* --- EMERGENT MODALS --- */}
      {modalState.view !== "closed" && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModalState({ view: "closed", connectorId: null })} />

          <div className="relative w-full max-w-md rounded-t-[24px] animate-in slide-in-from-bottom duration-300 flex flex-col" style={{ background: "#111", borderTop: "1px solid #1c1c1e", maxHeight: "85vh" }}>
            
            {modalState.view === "list" && (
                <div className="flex flex-col p-4 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white font-bold text-[20px]" style={{ fontFamily: SFD }}>Add connection</h2>
                        <button onClick={() => setModalState({ view: "closed", connectorId: null })} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:opacity-70 transition-opacity"><X className="w-5 h-5 text-white" /></button>
                    </div>
                    
                    <div className="relative mb-6">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366]" />
                      <input 
                        type="text" placeholder="Search connectors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-[16px] text-white placeholder:text-[#636366] focus:outline-none text-[15px]"
                        style={{ background: "#1c1c1e", border: "1px solid transparent", fontFamily: SF }}
                      />
                    </div>

                    <div className="overflow-y-auto hide-scrollbar pb-8 space-y-2 flex-1">
                        {filteredConnectors.map(c => (
                            <button key={c.id} onClick={() => setModalState({ view: "detail", connectorId: c.id })} className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-white/5 transition-colors text-left" style={{ border: "1px solid #1c1c1e" }}>
                                <img src={c.src} alt={c.name} className="w-8 h-8 object-contain select-none pointer-events-none" draggable={false} style={imageProtectionStyle} />
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

            {modalState.view === "detail" && activeConnectorData && (
              <div className="flex flex-col overflow-hidden h-full">
                <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e]">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setModalState({ view: "list", connectorId: null })} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#1c1c1e] transition-colors"><ArrowLeft className="w-5 h-5 text-[#8e8e93]" /></button>
                    <img src={activeConnectorData.src} alt={activeConnectorData.name} className="w-7 h-7 object-contain select-none pointer-events-none" draggable={false} style={imageProtectionStyle} />
                    <h2 className="text-white font-bold text-[17px]">{activeConnectorData.name}</h2>
                  </div>
                  {activeConnectorData.isConnected ? (
                    <button className="px-4 py-1.5 bg-red-500/10 text-red-500 text-[13px] font-bold rounded-full flex items-center gap-2 active:opacity-70"><Trash2 className="w-3.5 h-3.5" /> Disconnect</button>
                  ) : (
                    <button className="px-5 py-1.5 bg-white text-black text-[13px] font-bold rounded-full active:opacity-70">Connect</button>
                  )}
                </div>
                
                <div className="p-4 overflow-y-auto hide-scrollbar space-y-5 pb-8">
                  <p className="text-[#e5e5ea] text-[14px]" style={{ fontFamily: SF }}>{activeConnectorData.description}</p>
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
      {isBusinessModalOpen && <BusinessAutomationView onClose={() => setIsBusinessModalOpen(false)} />}

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
