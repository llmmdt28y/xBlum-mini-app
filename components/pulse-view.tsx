"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect, useRef } from "react"
import { 
  Heart, MessageCircle, Repeat2, Eye, Bookmark, 
  MoreVertical, Plus, Sparkles, Bot, Loader2, X, Image as ImageIcon, SendHorizonal
} from "lucide-react"

// Estilos de fuente geométrica replicando tus archivos base
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── MOCK DATA ACTUALIZADA ─────────────────────────────────────────────
const MOCK_POSTS_FORYOU = [
  {
    id: "fy1",
    author: { name: "xBlum System", handle: "@xblum_ai", avatar: "/xblum-icon.png", isPro: true },
    timestamp: "5m ago",
    text: "Detectamos una nueva vulnerabilidad crítica en la API de Telegram que permite eludir la aprobación manual de miembros en grupos privados. He actualizado los filtros del bot para bloquear estos scripts automatizados. #SecurityUpdate",
    media: null,
    ai_summary: ["Vulnerabilidad de auto-join detectada", "Scripts eluden aprobación de admins", "Filtros de xBlum actualizados"],
    likes: 1240, comments: 85, reposts: 312, views: "15K", isLiked: false
  },
  {
    id: "fy2",
    author: { name: "CryptoAlerts TON", handle: "@alerts_ton", avatar: "https://i.pravatar.cc/150?u=tonalerts" },
    timestamp: "1h ago",
    text: "TON acaba de superar un nuevo máximo histórico en transacciones por segundo. La red se mantiene estable mientras los DEX principales registran volumen récord. Estética Dark OLED es el camino.",
    media: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2000&auto=format&fit=crop",
    ai_summary: null,
    likes: 763, comments: 105, reposts: 42, views: "27K", isLiked: true
  }
]

const MOCK_POSTS_FOLLOWING = [
  {
    id: "fl1",
    author: { name: "Fons Mans", handle: "@FonsMans", avatar: "https://i.pravatar.cc/150?u=fons" },
    timestamp: "2h ago",
    text: "Loving the new minimal aesthetics for the upcoming update. The separated card layout against pure OLED black is the final design. #Minimalism",
    media: "https://images.unsplash.com/photo-1618172193622-ae2d025f4158?q=80&w=2000&auto=format&fit=crop",
    ai_summary: null,
    likes: 415, comments: 22, reposts: 15, views: "3.2K", isLiked: false
  }
]

// Mock de comentarios iniciales
const MOCK_COMMENTS_DATA: { [key: string]: any[] } = {
  "fy1": [
    { id: "c1", author: { name: "TON Dev", avatar: "https://i.pravatar.cc/150?u=tondev" }, text: "Gran hallazgo. ¿Esto afecta también a canales?", timestamp: "3m ago" },
    { id: "c2", author: { name: "SecurityAnalyst", avatar: "https://i.pravatar.cc/150?u=sec" }, text: "Ya implementé tus filtros, funcionan perfecto.", timestamp: "1m ago" }
  ]
}

// ── COMPONENTE POSTCARD REPETIBLE (Layout Compacto y Redondo) ───────
function PostCard({ post, onOpenImage, onOpenComments }: { post: any, onOpenImage: (url: string) => void, onOpenComments: (postId: string) => void }) {
  // UI Optimista para reacciones instantáneas
  const [liked, setLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    // Aquí iría la llamada asíncrona a tu webapp.py
  }

  return (
    // Contenedor del Post: Tarjeta individual, fondo oscuro (#0F0F0F), bordes muy suaves (rounded-3xl), layout compacto (p-3 pt-2.5 pb-2)
    <div className="mx-4 mb-4 bg-[#0F0F0F] border border-[#1c1c1e] rounded-3xl overflow-hidden shadow-xl active:border-[#333] transition-colors duration-200">
      <div className="p-3 pt-2.5 pb-2 flex gap-3">
        {/* Avatar Izquierda */}
        <div className="shrink-0 pt-0.5">
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-[#1c1c1e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
        </div>

        {/* Contenido Derecha */}
        <div className="flex-1 min-w-0">
          {/* Header del Post: Nombre, Handle, Tiempo + Grok Icon + Vertical Dots */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1 truncate">
              <span className="text-white font-bold text-[14px]" style={{ fontFamily: SFD }}>{post.author.name}</span>
              {post.author.isPro && <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              <span className="text-[#8e8e93] text-[13px] truncate">{post.author.handle}</span>
              <span className="text-[#8e8e93] text-[13px]">·</span>
              <span className="text-[#8e8e93] text-[13px] shrink-0">{post.timestamp}</span>
            </div>
            {/* Sección Derecha Header: Grok Icon + Vertical Dots */}
            <div className="flex items-center gap-1 shrink-0 -mr-1">
                <button className="p-1 active:opacity-70 transition-opacity">
                    <img src="/grok.png" alt="Ask Grok" className="w-3.5 h-3.5 object-contain" onError={(e) => e.currentTarget.style.display='none'}/>
                </button>
                <button className="text-[#8e8e93] active:text-white p-1">
                  <MoreVertical className="w-[17px] h-[17px]" />
                </button>
            </div>
          </div>

          {/* Texto del Post (Fuente más compacta text-[14px]) */}
          <p className="text-[#e4e4e7] text-[14px] leading-relaxed mb-2.5 whitespace-pre-wrap">
            {post.text}
          </p>

          {/* Resumen IA (Si existe) - Diseño compacto */}
          {post.ai_summary && (
            <div className="mb-3 rounded-xl bg-[#080808] border border-dashed border-[#333] p-2.5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-blue-500 text-[12px] font-bold tracking-tight" style={{ fontFamily: SFD }}>Vortex System Insight</span>
              </div>
              <ul className="space-y-0.5 pl-1 mb-2.5">
                {post.ai_summary.map((point: string, idx: number) => (
                  <li key={idx} className="text-[#a1a1aa] text-[12px] flex gap-2">
                    <span className="text-blue-500">•</span> {point}
                  </li>
                ))}
              </ul>
              <button className="w-full py-1.5 bg-[#1c1c1e] text-white text-[12px] font-medium rounded-lg flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity">
                <Sparkles className="w-3 h-3 text-amber-400" /> Ask Grok
              </button>
            </div>
          )}

          {/* Imagen (Si existe) - Con protección y apertura */}
          {post.media && (
            <div className="mb-2.5 rounded-xl overflow-hidden border border-[#1c1c1e] aspect-video bg-[#080808]" onClick={() => onOpenImage(post.media)}>
              <img 
                src={post.media} 
                alt="Media" 
                className="w-full h-full object-cover cursor-pointer active:scale-105 transition-transform duration-300" 
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()} // Protección de imagen
              />
            </div>
          )}

          {/* Barra de Acciones (Diseño compacto y minimalista) */}
          <div className="flex items-center justify-between text-[#8e8e93] pt-0.5 pr-0.5 -ml-1">
            <button onClick={() => onOpenComments(post.id)} className="flex items-center gap-1.5 p-1 rounded-full group active:text-white transition-colors">
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.comments}</span>
            </button>
            
            <button className="flex items-center gap-1.5 p-1 rounded-full group active:text-green-400 transition-colors">
              <Repeat2 className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.reposts}</span>
            </button>

            <button onClick={handleLike} className={`flex items-center gap-1.5 p-1 rounded-full group transition-colors ${liked ? 'text-pink-500' : 'active:text-pink-500'}`}>
              <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? 'fill-pink-500' : 'fill-none'}`} />
              <span className="text-[12px] tabular-nums font-medium">{likesCount}</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 text-[#333]">
              <Eye className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.views}</span>
            </div>

            <button className="p-1 rounded-full active:text-white transition-colors">
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MODALES PREMIUM (Create, Image, Comments Interactivo) ──────────────

// Modal de Creación de Post (Solución del Bug visual en Fullscreen)
function CreatePostModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-200 flex flex-col">
      {/* Cabecera del Modal rediseñada para manejar Safe Area sin superposición */}
      <div 
        className="flex items-center justify-between px-4 pb-2.5 border-b border-[#1c1c1e] bg-black" 
        style={{ 
          // Manejo dinámico del Safe Area Top (Notch) replicando diseño de referencias
          paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)"
        }}
      >
        <button onClick={onClose} className="text-white text-[15px] active:opacity-70 transition-opacity">Cancel</button>
        <span className="text-white font-bold text-[17px] tracking-tight" style={{ fontFamily: SFD }}>Draft Analysis</span>
        <button className="bg-blue-500 text-white text-[14px] font-bold px-4 py-1.5 rounded-full active:opacity-80 transition-opacity">Sync</button>
      </div>
      
      {/* Área de Texto principal: Fondo oscuro, expansión corregida con Flexbox */}
      <div className="flex-1 p-4 flex gap-3 bg-[#080808]">
        <img src="/mi-avatar.jpg" className="w-10 h-10 rounded-full border border-[#1c1c1e] shrink-0" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'}/>
        <textarea placeholder="¿Qué vulnerabilidad o tendencia detectaste hoy?" className="flex-1 bg-transparent text-white text-lg focus:outline-none resize-none pt-1" autoFocus />
      </div>
      
      {/* Barra de herramientas inferior (Iconos de Media e IA) */}
      <div className="p-4 pb-[calc(var(--tg-safe-area-inset-bottom,0px)+16px)] border-t border-[#1c1c1e] bg-[#080808] flex gap-4 text-[#8e8e93]">
        <ImageIcon className="w-6 h-6 active:text-blue-500 transition-colors" />
        <Bot className="w-6 h-6 active:text-amber-400 transition-colors" />
      </div>
    </div>
  )
}

// Modal de Visualización de Imagen Fullscreen con Protección Estricta
function FullscreenImageModal({ url, onClose }: { url: string | null, onClose: () => void }) {
  if (!url) return null
  return (
    <div className="fixed inset-0 z-[110] bg-black animate-in fade-in duration-200 flex flex-col" onClick={onClose}>
      <button className="absolute top-12 right-4 z-[120] bg-black/50 p-2 rounded-full backdrop-blur-smactive:opacity-70 transition-opacity">
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="flex-1 flex items-center justify-center p-2">
        <img 
          src={url} 
          alt="Full media" 
          className="max-w-full max-h-full rounded-lg animate-in zoom-in-95 duration-300 shadow-2xl" 
          onContextMenu={(e) => e.preventDefault()} // Protección de imagen estricta
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  )
}

// Modal de Caja de Comentarios INTERACTIVO (Solución de "Comentarios no funcionan")
function CommentModal({ postId, onClose }: { postId: string | null, onClose: () => void }) {
  const [commentInput, setCommentInput] = useState('')
  const [localComments, setLocalComments] = useState<any[]>([])

  // Cargar comentarios mockeados cuando se abre el modal para un post
  useEffect(() => {
    if (postId && MOCK_COMMENTS_DATA[postId]) {
      setLocalComments(MOCK_COMMENTS_DATA[postId])
    } else {
      setLocalComments([])
    }
  }, [postId])

  // Función para manejar el envío de un nuevo comentario (UI Optimista)
  const handleSendComment = () => {
    if (!commentInput.trim() || !postId) return

    // Crear objeto de comentario local simulado
    const newComment = {
      id: `lc-${Date.now()}`,
      author: { name: "You (Analyst)", avatar: "/mi-avatar.jpg" }, // Simulación de tu usuario
      text: commentInput.trim(),
      timestamp: "Now"
    }

    // Actualizar lista local de comentarios instantáneamente
    setLocalComments(prev => [...prev, newComment])
    // Limpiar input
    setCommentInput('')
  }

  if (!postId) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 animate-in fade-in duration-200 flex items-end" onClick={onClose}>
      {/* Contenedor del Modal inferior animado (slide-in) */}
      <div className="w-full bg-[#0F0F0F] border-t border-[#1c1c1e] rounded-t-3xl p-4 pb-[calc(var(--tg-safe-area-inset-bottom,0px)+12px)] animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera del modal de comentarios */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <span className="text-white font-bold text-[17px] tracking-tight" style={{ fontFamily: SFD }}>Análisis de Comunidad</span>
          <button onClick={onClose} className="p-1 active:opacity-70 transition-opacity"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Lista de Comentarios (Interactiva y scrolleable) */}
        <div className="space-y-4 max-h-[55dvh] overflow-y-auto no-scrollbar mb-4 pr-1">
          {localComments.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">Pronto podrás debatir vulnerabilidades aquí.</p>
          ) : (
            localComments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover shrink-0" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-white font-semibold text-[13px]">{comment.author.name}</span>
                    <span className="text-[#8e8e93] text-[12px]">{comment.timestamp}</span>
                  </div>
                  <p className="text-[#e4e4e7] text-[13px] leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Caja de Input (UI minimalista y funcional) */}
        <div className="flex items-center gap-2.5 p-2 bg-[#080808] border border-[#1c1c1e] rounded-full">
          <img src="/mi-avatar.jpg" className="w-8 h-8 rounded-full shrink-0" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
          <input 
            type="text" 
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Añade tu reporte técnico..." 
            className="flex-1 bg-transparent text-white text-[13px] focus:outline-none placeholder:text-gray-600" 
            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()} // Enviar con Enter
          />
          <button 
            onClick={handleSendComment} 
            disabled={!commentInput.trim()}
            className={`p-2 rounded-full transition-all duration-200 ${commentInput.trim() ? 'bg-blue-500 active:opacity-80' : 'bg-[#1c1c1e] text-gray-600'}`}
          >
            <SendHorizonal className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── VISTA PRINCIPAL (PulseView) ───────────────────────────────────────
export function PulseView() {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou")
  const { setCurrentView } = useApp()

  // Estados para Modales
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null)
  const [commentPostId, setCommentPostId] = useState<string | null>(null)

  // Integración nativa del BackButton de Telegram
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
    // Contenedor Principal: Fondo negro OLED y misma animación de home-view.tsx (fade-in slide-in)
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
      
      {/* ── HEADER REPOSICIONADO (Estilo profile-view.tsx, respetando Notch) ── */}
      <div 
        className="sticky top-0 z-30 flex flex-col w-full border-b border-[#1c1c1e]" 
        style={{ 
          background: "rgba(0,0,0,0.85)", 
          backdropFilter: "blur(20px)", 
          WebkitBackdropFilter: "blur(20px)",
          // Padding top respetando el Notch (safe area) + offset exacto de tus archivos base
          paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)"
        }}
      >
        {/* Top bar centrada: Logo xBlum y título "Pulse" */}
        <div className="flex items-center justify-center gap-2 px-4 mb-4 h-[32px]">
          <img src="/xBlum-logo.png" alt="xBlum" className="h-7 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
          <span className="text-[20px] font-bold tracking-tighter text-white" style={{ fontFamily: SFD }}>Pulse</span>
        </div>

        {/* Tabs: Diseño Dark OLED de tus referencias visuales */}
        <div className="px-4 pb-2.5 flex justify-center">
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

      {/* ── FEED LIST (Con padding inferior para NavBar flotante) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-3">
        {activeTab === "foryou" && MOCK_POSTS_FORYOU.map(post => (
          <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPostId} />
        ))}
        {activeTab === "following" && MOCK_POSTS_FOLLOWING.map(post => (
          <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPostId} />
        ))}
        {/* Placeholder final de carga */}
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#1c1c1e] animate-spin" />
        </div>
      </div>

      {/* ── FLOATING ACTION BUTTON (FAB) ── */}
      <button 
        onClick={() => setCreateModalOpen(true)}
        className="absolute z-40 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:scale-90 transition-transform duration-150"
        style={{ 
          background: "#3b82f6", // Azul vibrante
          // Posicionado encima de la navBar (calculando safe area + offset)
          bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 96px)" 
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      {/* ── RENDERIZADO DE MODALES PREMIUM ── */}
      <CreatePostModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <FullscreenImageModal url={fullscreenImageUrl} onClose={() => setFullscreenImageUrl(null)} />
      <CommentModal postId={commentPostId} onClose={() => setCommentPostId(null)} />

    </div>
  )
}
