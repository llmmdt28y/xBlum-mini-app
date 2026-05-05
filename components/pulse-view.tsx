"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect, useRef } from "react"
import { 
  Heart, MessageCircle, Repeat2, Eye, Bookmark, 
  MoreVertical, Plus, Sparkles, Bot, Loader2, X, Image as ImageIcon, 
  SendHorizonal, Share2, Upload
} from "lucide-react"

const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── DATOS DE PRUEBA REFINADOS (PULSE / xBLUM) ────────────────────────
const MOCK_POSTS_FORYOU = [
  {
    id: "p1",
    author: { name: "xBlum Assistant", handle: "@xblum_ai", avatar: "/xBlum-logo.png", isPro: true },
    timestamp: "2m",
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

const MOCK_COMMENTS_DATA: { [key: string]: any[] } = {
  "p1": [
    { id: "c1", author: { name: "SecurityAnalyst", handle: "@sec", avatar: "https://i.pravatar.cc/150?u=sec" }, text: "Excelentes filtros, acabo de integrarlos en mi grupo y bloquearon 5 intentos.", timestamp: "1m" }
  ]
}

// ── COMPONENTE POSTCARD (INTERACTIVO ESTILO X) ────────────────────────
function PostCard({ post, onOpenImage, onOpenComments, onAskGrok }: { post: any, onOpenImage: (url: string) => void, onOpenComments: (postId: string) => void, onAskGrok: () => void }) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  return (
    // Click en cualquier parte de la tarjeta abre las respuestas (excepto en elementos con stopPropagation)
    <div 
      className="mx-4 mb-4 bg-[#0F0F0F] border border-[#1c1c1e] rounded-[24px] overflow-hidden shadow-lg active:bg-[#151515] transition-colors duration-200 cursor-pointer"
      onClick={() => onOpenComments(post.id)} 
    >
      <div className="p-3.5 flex gap-3">
        {/* Profile Picture */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full border border-[#1c1c1e] object-cover" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5 truncate" onClick={(e) => e.stopPropagation()}>
              <span className="text-white font-bold text-[15px]" style={{ fontFamily: SFD }}>{post.author.name}</span>
              {post.author.isPro && <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              <span className="text-[#8e8e93] text-[14px] truncate">{post.author.handle}</span>
              <span className="text-[#8e8e93] text-[14px]">· {post.timestamp}</span>
            </div>
            {/* Ask Grok & Opciones */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={onAskGrok} className="p-1.5 active:opacity-50 transition-opacity rounded-full bg-[#1c1c1e]/50">
                <img src="/grok.png" alt="Ask Grok" className="w-3.5 h-3.5 opacity-90 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
              </button>
              <button className="text-[#8e8e93] active:text-white p-1">
                <MoreVertical className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          <p className="text-[#e4e4e7] text-[15px] leading-relaxed mb-3">{post.text}</p>

          {/* AI Summary Refinado */}
          {post.ai_summary && (
            <div className="mb-3 rounded-xl bg-[#080808] border border-dashed border-[#333] p-2.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-blue-500 text-[12px] font-bold tracking-tight" style={{ fontFamily: SFD }}>xBlum AI Insight</span>
              </div>
              <ul className="space-y-0.5 pl-1">
                {post.ai_summary.map((point: string, idx: number) => (
                  <li key={idx} className="text-[#a1a1aa] text-[12px] flex gap-2">
                    <span className="text-blue-500">•</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {post.media && (
            <div 
              className="mb-3 rounded-2xl overflow-hidden border border-[#1c1c1e] bg-black"
              onClick={(e) => { e.stopPropagation(); onOpenImage(post.media); }}
            >
              <img src={post.media} alt="" className="w-full h-auto max-h-[350px] object-cover" onContextMenu={(e) => e.preventDefault()} />
            </div>
          )}

          {/* Barra de Acciones */}
          <div className="flex items-center justify-between text-[#8e8e93] -ml-1">
            <button className="flex items-center gap-1.5 p-1.5 rounded-full active:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="text-[13px]">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 p-1.5 rounded-full active:text-green-400 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Repeat2 className="w-[18px] h-[18px]" />
              <span className="text-[13px]">{post.reposts}</span>
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1.5 p-1.5 rounded-full transition-colors ${liked ? 'text-pink-500' : 'active:text-pink-500'}`}>
              <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-pink-500' : ''}`} />
              <span className="text-[13px]">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5 p-1.5 text-[#333]" onClick={(e) => e.stopPropagation()}>
              <Eye className="w-[18px] h-[18px]" />
              <span className="text-[13px]">{post.views}</span>
            </div>
            <button className="p-1.5 rounded-full active:text-white" onClick={(e) => e.stopPropagation()}>
              <Upload className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── VISOR DE IMÁGENES AVANZADO (Estilo X) ─────────────────────────────
function ImageModal({ url, onClose }: { url: string | null, onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false)
  if (!url) return null

  return (
    <div className="fixed inset-0 z-[110] bg-black animate-in fade-in duration-200 flex flex-col">
      {/* Botones Superiores */}
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-[120]" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 0px) + 16px)" }}>
        <button onClick={onClose} className="p-2 bg-black/50 rounded-full text-white active:bg-black/80 backdrop-blur-md transition-colors"><X className="w-6 h-6"/></button>
        <button className="p-2 bg-black/50 rounded-full text-white active:bg-black/80 backdrop-blur-md transition-colors"><MoreVertical className="w-6 h-6"/></button>
      </div>

      {/* Contenedor de Imagen (Doble click para Zoom) */}
      <div 
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden" 
        onClick={onClose}
      >
        <img 
          src={url} 
          alt="Media" 
          onDoubleClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className={`transition-transform duration-300 ease-out object-contain w-full h-full ${zoomed ? 'scale-[1.8] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
        />
      </div>

      {/* Botones Inferiores (Replicando X) */}
      <div className="absolute bottom-0 w-full pb-[calc(var(--tg-safe-area-inset-bottom,0px)+24px)] pt-4 px-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white z-[120]">
        <button className="p-2 active:text-blue-400"><MessageCircle className="w-6 h-6"/></button>
        <button className="p-2 active:text-green-400"><Repeat2 className="w-6 h-6"/></button>
        <button className="p-2 active:text-pink-500"><Heart className="w-6 h-6"/></button>
        <button className="p-2"><Upload className="w-6 h-6"/></button>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL PULSE ─────────────────────────────────────────────
export function PulseView() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou")
  const { setCurrentView } = useApp()
  
  // Estados de Modales
  const [createModal, setCreateModal] = useState(false)
  const [viewImage, setViewImage] = useState<string | null>(null)
  const [replyPost, setReplyPost] = useState<string | null>(null)
  const [replyInput, setReplyInput] = useState("")

  // Motor de Scroll (Animaciones de Header y FAB)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const lastScrollY = useRef(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop
    if (currentY <= 0) {
      setIsScrollingDown(false)
      lastScrollY.current = currentY
      return
    }
    if (currentY > lastScrollY.current + 10) {
      setIsScrollingDown(true)
    } else if (currentY < lastScrollY.current - 10) {
      setIsScrollingDown(false)
    }
    lastScrollY.current = currentY
  }

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg?.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(() => setCurrentView("home"))
    }
  }, [setCurrentView])

  return (
    <div className="flex-1 flex flex-col bg-black text-white relative animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ── HEADER CON ANIMACIÓN DE SCROLL ── */}
      <div 
        className={`fixed top-0 w-full z-40 bg-black/85 backdrop-blur-xl border-b border-[#1c1c1e] transition-transform duration-300 ease-in-out ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'}`}
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 12px)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-4 px-4">
          <img src="/xBlum-logo.png" alt="xBlum" className="h-[22px] w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'}/>
          <span className="text-[20px] font-bold tracking-tight" style={{ fontFamily: SFD }}>Pulse</span>
        </div>

        <div className="flex justify-center pb-2.5 px-4">
          <div className="flex bg-[#0F0F0F] border border-[#1c1c1e] rounded-full p-0.5 w-full max-w-[340px]">
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

      {/* ── FEED LIST ── */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar pb-32" 
        onScroll={handleScroll}
        style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 100px)" }} // Padding para el header flotante
      >
        {activeTab === "foryou" ? (
          MOCK_POSTS_FORYOU.map(post => <PostCard key={post.id} post={post} onOpenImage={setViewImage} onOpenComments={setReplyPost} onAskGrok={() => {}} />)
        ) : (
          MOCK_POSTS_FOLLOWING.map(post => <PostCard key={post.id} post={post} onOpenImage={setViewImage} onOpenComments={setReplyPost} onAskGrok={() => {}} />)
        )}
      </div>

      {/* ── FAB: CREATE POST CON ANIMACIÓN ── */}
      <button 
        onClick={() => setCreateModal(true)}
        className={`absolute z-40 right-5 w-[52px] h-[52px] rounded-full bg-blue-500 flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all duration-300 ease-in-out ${isScrollingDown ? 'translate-y-[150px] opacity-0' : 'translate-y-0 opacity-100'}`}
        style={{ bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 90px)" }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* ── MODAL CREATE POST (Alineado hacia abajo) ── */}
      {createModal && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-200">
          <div 
            className="flex items-center justify-between px-4 pb-3 border-b border-[#1c1c1e]"
            style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 50px)" }} // Empujado a la altura de las tabs
          >
            <button onClick={() => setCreateModal(false)} className="text-white text-[15px] active:opacity-70">Cancel</button>
            <button className="bg-blue-500 text-white px-5 py-1.5 rounded-full font-bold text-[14px] active:opacity-80">Post</button>
          </div>
          <div className="p-4 flex gap-3 h-[40vh]">
            <img src="/mi-avatar.jpg" className="w-10 h-10 rounded-full object-cover" onError={(e) => e.currentTarget.src='https://i.pravatar.cc/150'} />
            <textarea placeholder="¿Qué está pasando?" className="flex-1 bg-transparent text-white text-[17px] focus:outline-none resize-none pt-1" autoFocus />
          </div>
          <div className="w-full p-4 border-t border-[#1c1c1e] flex items-center gap-5 text-blue-500">
            <ImageIcon className="w-6 h-6 active:text-blue-400" />
            <Bot className="w-6 h-6 text-amber-400 active:opacity-70" />
          </div>
        </div>
      )}

      {/* ── MODAL DE RESPUESTAS (REPLY) ── */}
      {replyPost && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setReplyPost(null)}>
          <div 
            className="w-full h-[85vh] bg-[#0F0F0F] rounded-t-[28px] flex flex-col animate-in slide-in-from-bottom-full duration-300 border-t border-[#2c2c2e]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] shrink-0">
              <span className="font-bold text-[18px] text-center w-full" style={{ fontFamily: SFD }}>Reply</span>
              <button onClick={() => setReplyPost(null)} className="absolute right-4 p-1 active:bg-[#1c1c1e] rounded-full"><X className="w-6 h-6 text-gray-400"/></button>
            </div>
            
            {/* Lista de Comentarios Existentes */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {MOCK_COMMENTS_DATA[replyPost] ? (
                MOCK_COMMENTS_DATA[replyPost].map(comment => (
                  <div key={comment.id} className="flex gap-3 mb-5">
                    <img src={comment.author.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => e.currentTarget.src='https://i.pravatar.cc/150'}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-[14px] text-white">{comment.author.name}</span>
                        <span className="text-[#8e8e93] text-[13px]">{comment.author.handle} · {comment.timestamp}</span>
                      </div>
                      <p className="text-[#e4e4e7] text-[14px] leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#8e8e93] opacity-60">
                  <MessageCircle className="w-12 h-12 mb-3" />
                  <p>Be the first to reply.</p>
                </div>
              )}
            </div>

            {/* Input Fixed Bottom (Estilo X) */}
            <div 
              className="p-3 border-t border-[#1c1c1e] bg-[#0F0F0F] shrink-0"
              style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, 0px) + 12px)" }}
            >
              <div className="flex items-center gap-3">
                <img src="/mi-avatar.jpg" className="w-9 h-9 rounded-full object-cover border border-[#2c2c2e]" onError={(e) => e.currentTarget.src='https://i.pravatar.cc/150'}/>
                <input 
                  type="text" 
                  value={replyInput}
                  onChange={e => setReplyInput(e.target.value)}
                  placeholder="Post your reply" 
                  className="flex-1 bg-transparent text-[15px] text-white focus:outline-none placeholder:text-[#636366]" 
                  autoFocus
                />
                <button 
                  disabled={!replyInput.trim()}
                  className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${replyInput.trim() ? 'bg-blue-500 text-white' : 'bg-[#1c1c1e] text-[#636366]'}`}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renderizado del Visor de Imágenes */}
      <ImageModal url={viewImage} onClose={() => setViewImage(null)} />

    </div>
  )
}
