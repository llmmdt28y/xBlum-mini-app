"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect, useRef } from "react"
import { 
  Heart, MessageCircle, Repeat2, Eye, Bookmark, 
  MoreVertical, Plus, Sparkles, Bot, Loader2, X, Image as ImageIcon, 
  SendHorizonal, Download, Share2, Maximize2, Minimize2, Upload, Globe, ArrowLeft
} from "lucide-react"

const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── DATOS DE PRUEBA REFINADOS ──────────────────────────────────────────
const MOCK_POSTS_FORYOU = [
  {
    id: "p1",
    author: { name: "xBlum Assistant", handle: "@xblum_ai", avatar: "/xBlum-logo.png", isPro: true },
    timestamp: "5m",
    text: "Hemos detectado un incremento en los intentos de phishing mediante bots de imitación en TON. xBlum ya ha indexado estas firmas para proteger tus sesiones. Mantente seguro. #PulseUpdate",
    media: null,
    ai_summary: ["Incremento de phishing en TON", "Firmas indexadas para protección", "Actualización de seguridad activa"],
    likes: 1420, comments: 64, reposts: 210, views: "12K", isLiked: false
  },
  {
    id: "p2",
    author: { name: "Pulse News", handle: "@pulse_official", avatar: "https://i.pravatar.cc/150?u=pulse" },
    timestamp: "1h",
    text: "La nueva interfaz OLED está recibiendo un feedback increíble. Estamos optimizando el motor de IA para que los análisis en tiempo real sean aún más rápidos.",
    media: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000&auto=format&fit=crop",
    ai_summary: null,
    likes: 890, comments: 120, reposts: 55, views: "45K", isLiked: true
  }
]

const MOCK_POSTS_FOLLOWING = [
  {
    id: "fl1",
    author: { name: "Fons Mans", handle: "@FonsMans", avatar: "https://i.pravatar.cc/150?u=fons" },
    timestamp: "2h",
    text: "Amando la nueva estética minimalista. Las tarjetas separadas contra el negro puro OLED son el diseño definitivo. #Minimalism",
    media: "https://images.unsplash.com/photo-1618172193622-ae2d025f4158?q=80&w=2000&auto=format&fit=crop",
    ai_summary: null,
    likes: 415, comments: 22, reposts: 15, views: "3.2K", isLiked: false
  }
]

const MOCK_COMMENTS_DATA: { [key: string]: any[] } = {
  "p1": [
    { id: "c1", author: { name: "SecurityAnalyst", handle: "@sec_expert", avatar: "https://i.pravatar.cc/150?u=sec" }, text: "Excelentes filtros, acabo de integrarlos en mi grupo y bloquearon 5 intentos en la última hora.", timestamp: "1m" }
  ]
}

// ── COMPONENTE POSTCARD REPETIBLE ─────────────────────────────────────
function PostCard({ post, onOpenImage, onOpenComments, onAskGrok, isDetailView = false }: { post: any, onOpenImage: (url: string) => void, onOpenComments?: (post: any) => void, onAskGrok: (postId: string) => void, isDetailView?: boolean }) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  return (
    <div 
      className={`${isDetailView ? 'bg-black mb-0 border-b border-[#1c1c1e] rounded-none' : 'mx-4 mb-4 bg-[#0F0F0F] border border-[#1c1c1e] rounded-[24px] shadow-lg active:scale-[0.98] cursor-pointer'} overflow-hidden transition-transform duration-200`}
      onClick={() => onOpenComments && !isDetailView ? onOpenComments(post) : undefined}
    >
      <div className={`p-3.5 flex gap-3 ${isDetailView ? 'px-4' : ''}`}>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full border border-[#1c1c1e] object-cover" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5 truncate" onClick={(e) => e.stopPropagation()}>
              <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{post.author.name}</span>
              {post.author.isPro && <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              <span className="text-[#8e8e93] text-[14px] truncate">{post.author.handle}</span>
              <span className="text-[#8e8e93] text-[14px]">· {post.timestamp}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 -mr-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onAskGrok(post.id)} className="p-1.5 active:opacity-70 transition-opacity bg-[#1c1c1e]/50 rounded-full">
                    <img src="/grok.png" alt="Ask Grok" className="w-3.5 h-3.5 object-contain opacity-90" onError={(e) => e.currentTarget.style.display='none'}/>
                </button>
                <button className="text-[#8e8e93] active:text-white p-1">
                  <MoreVertical className="w-[18px] h-[18px]" />
                </button>
            </div>
          </div>

          <p className={`text-[#e4e4e7] ${isDetailView ? 'text-[16px]' : 'text-[15px]'} leading-relaxed mb-3 whitespace-pre-wrap`}>
            {post.text}
          </p>

          {post.ai_summary && (
            <div className="mb-3 rounded-xl bg-[#080808] border border-dashed border-[#333] p-2.5 animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-blue-500 text-[12px] font-bold tracking-tight" style={{ fontFamily: SFD }}>xBlum AI Insight</span>
              </div>
              <ul className="space-y-0.5 pl-1 mb-1">
                {post.ai_summary.map((point: string, idx: number) => (
                  <li key={idx} className="text-[#a1a1aa] text-[12px] flex gap-2">
                    <span className="text-blue-500">•</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {post.media && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-[#1c1c1e] aspect-video bg-[#080808]" onClick={(e) => { e.stopPropagation(); onOpenImage(post.media); }}>
              <img src={post.media} alt="" className="w-full h-full object-cover cursor-pointer active:scale-105 transition-transform duration-300" loading="lazy" onContextMenu={(e) => e.preventDefault()} />
            </div>
          )}

          <div className="flex items-center justify-between text-[#8e8e93] -ml-1">
            <button className="flex items-center gap-1.5 p-1 rounded-full group active:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="text-[13px] tabular-nums font-medium">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 p-1 rounded-full group active:text-green-400 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Repeat2 className="w-[18px] h-[18px]" />
              <span className="text-[13px] tabular-nums font-medium">{post.reposts}</span>
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1.5 p-1 rounded-full group transition-colors ${liked ? 'text-pink-500' : 'active:text-pink-500'}`}>
              <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? 'fill-pink-500' : 'fill-none'}`} />
              <span className="text-[13px] tabular-nums font-medium">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5 p-1 text-[#333]" onClick={(e) => e.stopPropagation()}>
              <Eye className="w-[18px] h-[18px]" />
              <span className="text-[13px] tabular-nums font-medium">{post.views}</span>
            </div>
            <button className="p-1 rounded-full active:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MODALES PREMIUM (Cero fugas de scroll) ──────────────────────────

// Modal de Creación de Post (Cero scroll de fondo y alineado al Notch)
function CreatePostModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div 
      className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-200 flex flex-col overflow-hidden"
      style={{ height: "var(--tg-viewport-height, 100dvh)" }} // El secreto de Telegram para el teclado
    >
      {/* Cabecera posicionada EXACTAMENTE donde estarían las pestañas For You / Following */}
      <div 
        className="flex items-center justify-between px-4 pb-3 border-b border-[#1c1c1e] bg-black shrink-0" 
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 64px)" }}
      >
        <button onClick={onClose} className="text-white text-[15px] active:opacity-70 transition-opacity">Cancel</button>
        <button className="bg-blue-500 text-white text-[14px] font-bold px-4 py-1.5 rounded-full active:opacity-80 transition-opacity">Post</button>
      </div>
      
      {/* Caja de texto (overflow-hidden asegura que no se scrollee todo el modal, solo el texto) */}
      <div className="flex-1 p-4 flex gap-3 bg-[#080808] w-full overflow-hidden">
        <img src="/mi-avatar.jpg" className="w-10 h-10 rounded-full border border-[#1c1c1e] shrink-0 object-cover" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'}/>
        <textarea placeholder="¿Qué está pasando?" className="flex-1 bg-transparent text-white text-[17px] focus:outline-none resize-none h-full pt-1" autoFocus />
      </div>
      
      {/* Barra de herramientas siempre anclada al teclado/fondo */}
      <div 
        className="shrink-0 p-4 border-t border-[#1c1c1e] bg-[#080808] flex gap-5 text-blue-500 w-full"
        style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 16px)" }}
      >
        <ImageIcon className="w-6 h-6 active:text-white transition-colors cursor-pointer" />
        <Bot className="w-6 h-6 text-amber-400 active:text-white transition-colors cursor-pointer" />
      </div>
    </div>
  )
}

// Visor de Imágenes (Estático, centrado y sin scroll)
function FullscreenImageModal({ url, onClose }: { url: string | null, onClose: () => void }) {
  const [zoom, setZoom] = useState(1)

  if (!url) return null

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black animate-in fade-in duration-200 flex flex-col overflow-hidden" 
      style={{ height: "var(--tg-viewport-height, 100dvh)" }}
    >
      <div 
        className="absolute top-0 w-full flex items-center justify-between p-4 z-[120] bg-gradient-to-b from-black/60 to-transparent" 
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)" }}
      >
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white active:bg-black/60 backdrop-blur-md transition-colors">
          <X className="w-6 h-6"/>
        </button>
        <div className="flex gap-4">
          <button className="p-2 bg-black/40 rounded-full text-white active:bg-black/60 backdrop-blur-md transition-colors">
            <Download className="w-5 h-5"/>
          </button>
          <button className="p-2 bg-black/40 rounded-full text-white active:bg-black/60 backdrop-blur-md transition-colors">
            <Share2 className="w-5 h-5"/>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative" onClick={onClose}>
        <img 
          src={url} 
          alt="Media" 
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className="max-w-full max-h-full object-contain" 
          onContextMenu={(e) => e.preventDefault()} 
          onClick={(e) => e.stopPropagation()} 
          onDoubleClick={(e) => { e.stopPropagation(); setZoom(prev => prev === 1 ? 2 : 1) }}
        />
      </div>

      <div 
        className="absolute bottom-0 w-full flex flex-col gap-4 z-[120]" 
        style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 24px)" }}
      >
        <div className="flex justify-center w-full">
          <div className="flex gap-6 bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 items-center">
            <button onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}><Minimize2 className="w-5 h-5 text-white"/></button>
            <span className="text-white font-bold w-[40px] text-center text-sm">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(3, prev + 0.5))}><Maximize2 className="w-5 h-5 text-white"/></button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 text-white">
          <button className="p-2 active:text-blue-400 transition-colors"><MessageCircle className="w-6 h-6"/></button>
          <button className="p-2 active:text-green-400 transition-colors"><Repeat2 className="w-6 h-6"/></button>
          <button className="p-2 active:text-pink-500 transition-colors"><Heart className="w-6 h-6"/></button>
          <button className="p-2 active:text-white transition-colors"><Upload className="w-6 h-6"/></button>
        </div>
      </div>
    </div>
  )
}

// Modal de Caja de Comentarios (Cero fuga de scroll)
function CommentModal({ post, onClose }: { post: any | null, onClose: () => void }) {
  const [replyInput, setReplyInput] = useState('')
  const [localComments, setLocalComments] = useState<any[]>([])

  useEffect(() => {
    if (post && MOCK_COMMENTS_DATA[post.id]) {
      setLocalComments(MOCK_COMMENTS_DATA[post.id])
    } else {
      setLocalComments([])
    }
  }, [post])

  const handleSendReply = () => {
    if (!replyInput.trim() || !post) return
    const newReply = {
      id: `lr-${Date.now()}`,
      author: { name: "You (Analyst)", avatar: "/mi-avatar.jpg", handle: "@you_ai" },
      text: replyInput.trim(),
      timestamp: "Now"
    }
    setLocalComments(prev => [newReply, ...prev])
    setReplyInput('')
  }

  if (!post) return null

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden" 
      style={{ height: "var(--tg-viewport-height, 100dvh)" }} 
    >
      <div 
        className="shrink-0 flex items-center justify-between px-4 pb-3 border-b border-[#1c1c1e] bg-black w-full"
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)" }}
      >
        <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-1 active:bg-[#1c1c1e] rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-white"/></button>
            <span className="font-bold text-[18px] text-white" style={{ fontFamily: SFD }}>Post</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar w-full bg-[#080808]">
          <PostCard post={post} onOpenImage={()=>{}} onAskGrok={()=>{}} isDetailView={true} />
          <div className="h-px bg-[#1c1c1e] w-full" />

          <div className="p-4 space-y-4 pr-2 w-full pb-10">
              {localComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-600 space-y-3 py-10">
                    <MessageCircle className="w-10 h-10 opacity-50" />
                    <p className="text-center text-sm">No replies yet.</p>
                </div>
              ) : (
                localComments.map(reply => (
                  <div key={reply.id} className="flex gap-3 mb-5">
                    <img src={reply.author.avatar} alt={reply.author.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#1c1c1e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{reply.author.name}</span>
                        <span className="text-[#8e8e93] text-[14px]">{reply.author.handle} · {reply.timestamp}</span>
                      </div>
                      <p className="text-[#e4e4e7] text-[15px] leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                      <div className="flex gap-6 mt-3 text-[#8e8e93]">
                          <button className="flex gap-1 items-center active:text-blue-400"><MessageCircle className="w-4 h-4"/></button>
                          <button className="flex gap-1 items-center active:text-green-400"><Repeat2 className="w-4 h-4"/></button>
                          <button className="flex gap-1 items-center active:text-pink-500"><Heart className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
          </div>
      </div>

      <div 
        className="shrink-0 p-3 border-t border-[#1c1c1e] bg-black w-full"
        style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 12px)" }}
      >
        <div className="flex items-center gap-3 w-full">
          <img src="/mi-avatar.jpg" className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#2c2c2e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
          <input 
            type="text" 
            value={replyInput}
            onChange={e => setReplyInput(e.target.value)}
            placeholder="Post your reply" 
            className="flex-1 bg-transparent text-[16px] text-white focus:outline-none placeholder:text-gray-600" 
            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
            autoFocus
          />
          <button 
            onClick={handleSendReply} 
            disabled={!replyInput.trim()}
            className={`px-5 py-1.5 rounded-full font-bold text-sm transition-all duration-200 ${replyInput.trim() ? 'bg-blue-500 text-white active:opacity-80' : 'bg-[#1c1c1e] text-gray-600'}`}
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL (PulseView FIJO - Previene Scroll Global) ──────────
export function PulseView() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou")
  const { setCurrentView } = useApp()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null)
  const [commentPost, setCommentPost] = useState<any | null>(null)

  // Motor de Scroll (Solo afecta a la cabecera y al botón FAB dentro del Feed)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const lastScrollY = useRef(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop
    if (currentY <= 0) {
      setIsScrollingDown(false)
      lastScrollY.current = currentY
      return
    }
    if (currentY > lastScrollY.current + 15) {
      setIsScrollingDown(true) 
    } else if (currentY < lastScrollY.current - 15) {
      setIsScrollingDown(false) 
    }
    lastScrollY.current = currentY
  }

  // Desaparecer NavBar global de page.tsx cuando entras a Modales
  useEffect(() => {
    const navBar = document.getElementById("main-nav-bar");
    if (navBar) {
      if (createModalOpen || fullscreenImageUrl || commentPost) {
        navBar.style.opacity = "0"; 
        navBar.style.pointerEvents = "none";
      } else {
        navBar.style.opacity = "1";
        navBar.style.pointerEvents = "auto";
      }
    }
    return () => { if (navBar) { navBar.style.opacity = "1"; } }
  }, [createModalOpen, fullscreenImageUrl, commentPost])

  const handleAskGrok = (postId: string) => {
    // Logica de Grok
  }

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
    // ¡LA CLAVE!: fixed inset-0 y z-30 para adueñarse de la pantalla y no dejar que el fondo scrollee.
    <div 
      className="fixed inset-0 z-30 bg-[#000000] text-white overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
      style={{ height: "var(--tg-viewport-height, 100dvh)" }}
    >
      
      {/* ── HEADER DINÁMICO (Animación Estilo X) ── */}
      <div 
        className={`absolute top-0 left-0 right-0 z-40 flex flex-col w-full border-b border-[#1c1c1e] bg-black/85 backdrop-blur-xl transition-transform duration-300 ease-in-out ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'}`}
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)" }}
      >
        <div className="flex items-center justify-center gap-2 px-4 mb-4 h-[32px]">
          <img src="/xBlum-logo.png" alt="xBlum" className="h-7 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
          <span className="text-[20px] font-bold tracking-tighter text-white" style={{ fontFamily: SFD }}>Pulse</span>
        </div>

        <div className="px-4 pb-2.5 flex justify-center w-full">
          <div className="flex items-center bg-[#0F0F0F] border border-[#1c1c1e] rounded-full p-0.5 w-full max-w-[320px]">
            <button 
              onClick={() => setActiveTab("foryou")}
              className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${activeTab === "foryou" ? "bg-[#333] text-white shadow-sm" : "text-[#8e8e93]"}`}
            >
              For You
            </button>
            <button 
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-1.5 rounded-full text-[14px] font-bold transition-all ${activeTab === "following" ? "bg-[#333] text-white shadow-sm" : "text-[#8e8e93]"}`}
            >
              Following
            </button>
          </div>
        </div>
      </div>

      {/* ── FEED LIST (Contenedor que SÍ scrollea) ── */}
      <div 
        className="w-full h-full overflow-y-auto no-scrollbar" 
        onScroll={handleScroll}
        style={{ 
          // Espacio por arriba para que los posts no queden ocultos debajo del Header
          paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 110px)", 
          // Espacio por abajo para que el último post se vea por encima de la NavBar global
          paddingBottom: "120px" 
        }}
      >
        {activeTab === "foryou" ? (
            MOCK_POSTS_FORYOU.map(post => (
                <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPost} onAskGrok={handleAskGrok}/>
            ))
        ) : (
            MOCK_POSTS_FOLLOWING.map(post => (
                <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPost} onAskGrok={handleAskGrok}/>
            ))
        )}
        
        <div className="py-12 flex justify-center w-full">
          <Loader2 className="w-6 h-6 text-[#1c1c1e] animate-spin" />
        </div>
      </div>

      {/* ── FAB DINÁMICO (Siempre visible y anclado a la pantalla) ── */}
      <button 
        onClick={() => setCreateModalOpen(true)}
        className={`absolute z-40 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-transform duration-300 ease-in-out ${isScrollingDown ? 'translate-y-[150px]' : 'translate-y-0'}`}
        style={{ 
          background: "#3b82f6", 
          bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 90px)" 
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* ── MODALES (Nivel superior) ── */}
      <CreatePostModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <FullscreenImageModal url={fullscreenImageUrl} onClose={() => setFullscreenImageUrl(null)} />
      <CommentModal post={commentPost} onClose={() => setCommentPost(null)} />

    </div>
  )
}
