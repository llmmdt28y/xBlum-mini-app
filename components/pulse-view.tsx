"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect } from "react"
import { 
  Heart, MessageCircle, Repeat2, Eye, Bookmark, 
  MoreHorizontal, Plus, Sparkles, Bot, Loader2, ChevronRight
} from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── MOCK DATA PARA EL MVP ─────────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: "1",
    author: { name: "xBlum System", handle: "@xblum_ai", avatar: "/xblum-icon.png", isPro: true },
    timestamp: "10m ago",
    text: "Detectamos una nueva vulnerabilidad en la API de invitaciones de Telegram. Los atacantes están usando scripts automatizados para eludir la aprobación manual en grupos privados. He actualizado mis filtros para bloquear este comportamiento.",
    media: null,
    ai_summary: ["Vulnerabilidad de auto-join detectada", "Scripts eluden aprobación de admins", "Filtros de xBlum actualizados"],
    likes: 1240, comments: 85, reposts: 312, views: "15K", isLiked: false
  },
  {
    id: "2",
    author: { name: "Fons Mans", handle: "@FonsMans", avatar: "https://i.pravatar.cc/150?u=fons" },
    timestamp: "2h ago",
    text: "Loving the new dark mode aesthetics for the upcoming platform update. Pure OLED black is the only way to go.",
    media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    ai_summary: null,
    likes: 763, comments: 105, reposts: 42, views: "27K", isLiked: true
  },
  {
    id: "3",
    author: { name: "Naval", handle: "@naval", avatar: "https://i.pravatar.cc/150?u=naval" },
    timestamp: "5h ago",
    text: "The smartest people are all self-taught, even if they went to school.",
    media: null,
    ai_summary: null,
    likes: 122000, comments: 1200, reposts: 15000, views: "1.3M", isLiked: false
  }
]

// ── COMPONENTE DE TARJETA DE POST ─────────────────────────────────────
function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  // Formateador de números (ej: 122000 -> 122K)
  const fmt = (n: number | string) => {
    if (typeof n === 'string') return n
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <div className="w-full bg-[#000000] border-b border-[#1c1c1e] px-4 py-4 cursor-pointer active:bg-[#111] transition-colors">
      <div className="flex gap-3">
        {/* Avatar Izquierda */}
        <div className="shrink-0">
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-[#1c1c1e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
        </div>

        {/* Contenido Derecha */}
        <div className="flex-1 min-w-0">
          {/* Header del Post */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{post.author.name}</span>
              {post.author.isPro && <Sparkles className="w-3 h-3 text-[#3b82f6] shrink-0" />}
              <span className="text-[#8e8e93] text-[15px] truncate" style={{ fontFamily: SF }}>{post.author.handle}</span>
              <span className="text-[#8e8e93] text-[15px]">·</span>
              <span className="text-[#8e8e93] text-[15px] shrink-0" style={{ fontFamily: SF }}>{post.timestamp}</span>
            </div>
            <button className="text-[#8e8e93] active:text-white shrink-0">
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Texto */}
          <p className="text-white text-[15px] leading-[1.4] mb-3 whitespace-pre-wrap" style={{ fontFamily: SF }}>
            {post.text}
          </p>

          {/* Resumen IA (Si existe) */}
          {post.ai_summary && (
            <div className="mb-3 rounded-[16px] bg-[#111] border border-[#1c1c1e] p-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-[#3b82f6] text-[13px] font-bold tracking-tight" style={{ fontFamily: SFD }}>AI Summary</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {post.ai_summary.map((point, idx) => (
                  <li key={idx} className="text-[#e4e4e7] text-[13px] flex gap-2" style={{ fontFamily: SF }}>
                    <span className="text-[#3b82f6]">•</span> {point}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-3 py-2 bg-[#1c1c1e] text-white text-[13px] font-medium rounded-xl flex items-center justify-center gap-2 active:opacity-70 transition-opacity">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ask Grok
              </button>
            </div>
          )}

          {/* Imagen (Si existe) */}
          {post.media && (
            <div className="mb-3 rounded-[16px] overflow-hidden border border-[#1c1c1e]">
              <img src={post.media} alt="Post media" className="w-full h-auto object-cover max-h-[400px]" loading="lazy" />
            </div>
          )}

          {/* Barra de Acciones (Botones) */}
          <div className="flex items-center justify-between text-[#8e8e93] mt-1 pr-2">
            <button className="flex items-center gap-1.5 group active:scale-95 transition-transform">
              <div className="p-1.5 rounded-full group-active:bg-blue-500/20 group-active:text-blue-400 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px] group-active:text-blue-400" style={{ fontFamily: SF }}>{fmt(post.comments)}</span>
            </button>
            
            <button className="flex items-center gap-1.5 group active:scale-95 transition-transform">
              <div className="p-1.5 rounded-full group-active:bg-green-500/20 group-active:text-green-400 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px] group-active:text-green-400" style={{ fontFamily: SF }}>{fmt(post.reposts)}</span>
            </button>

            <button onClick={handleLike} className="flex items-center gap-1.5 group active:scale-95 transition-transform">
              <div className="p-1.5 rounded-full group-active:bg-pink-500/20 transition-colors">
                <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? 'text-pink-500 fill-pink-500' : 'group-active:text-pink-500'}`} />
              </div>
              <span className={`text-[13px] transition-colors ${liked ? 'text-pink-500' : 'group-active:text-pink-500'}`} style={{ fontFamily: SF }}>{fmt(likesCount)}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <div className="p-1.5">
                <Eye className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]" style={{ fontFamily: SF }}>{fmt(post.views)}</span>
            </div>

            <button className="p-1.5 active:scale-95 transition-transform active:text-white">
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL ───────────────────────────────────────────────────
export function PulseView() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou")
  const { setCurrentView } = useApp()

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => setCurrentView("home")
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView])

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden relative">
      
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 flex flex-col w-full" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        
        {/* Top bar (Avatar y Logo) */}
        <div className="flex items-center justify-between px-4" style={{ height: "44px", paddingTop: "var(--tg-safe-area-inset-top, 24px)" }}>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#333]">
            <img src="/mi-avatar.jpg" alt="Me" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[20px] font-bold tracking-tighter" style={{ fontFamily: SFD }}>xBlum</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
          </div>
          <div className="w-8 h-8" /> {/* Espaciador */}
        </div>

        {/* Tabs: Replicando el diseño de la captura en Dark Mode */}
        <div className="px-4 pb-2 pt-2 flex justify-center border-b border-[#1c1c1e]">
          <div className="flex items-center bg-[#111] border border-[#1c1c1e] rounded-full p-1 w-full max-w-[300px]">
            <button 
              onClick={() => setActiveTab("foryou")}
              className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${activeTab === "foryou" ? "bg-[#333] text-white shadow-sm" : "text-[#8e8e93]"}`}
              style={{ fontFamily: SF }}
            >
              For You
            </button>
            <button 
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${activeTab === "following" ? "bg-[#333] text-white shadow-sm" : "text-[#8e8e93]"}`}
              style={{ fontFamily: SF }}
            >
              Following
            </button>
          </div>
        </div>
      </div>

      {/* ── FEED LIST ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {MOCK_POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {/* Placeholder de carga al final */}
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#48484a] animate-spin" />
        </div>
      </div>

      {/* ── FLOATING ACTION BUTTON (FAB) ── */}
      <button 
        className="absolute z-40 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:scale-90 transition-transform"
        style={{ 
          background: "#3b82f6", // Azul vibrante
          bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 90px)" // Encima de la navBar
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

    </div>
  )
}
