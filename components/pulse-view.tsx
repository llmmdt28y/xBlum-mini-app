"use client"

import { useApp } from "@/lib/app-context"
import { useState, useEffect, useCallback } from "react"
import { 
  Heart, MessageCircle, Repeat2, Eye, Bookmark, 
  MoreVertical, Plus, Sparkles, Bot, Loader2, X, Image as ImageIcon, 
  SendHorizonal, Download, Share2, Maximize2, Minimize2
} from "lucide-react"

// Estilos de fuente geométrica replicando tus archivos base
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── MOCK DATA ACTUALIZADA (FASE 1: TEXTO + IMÁGENES) ────────────────
const MOCK_POSTS_FORYOU = [
  {
    id: "fy1",
    author: { name: "xBlum System", handle: "@xblum_ai", avatar: "/xBlum-logo.png", isPro: true },
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

// Mock de comentarios interactivos
const MOCK_COMMENTS_DATA: { [key: string]: any[] } = {
  "fy1": [
    { id: "c1", author: { name: "TON Dev", handle: "@tondev", avatar: "https://i.pravatar.cc/150?u=tondev" }, text: "Gran hallazgo. ¿Esto afecta también a canales?", timestamp: "3m ago" },
    { id: "c2", author: { name: "SecurityAnalyst", handle: "@sec", avatar: "https://i.pravatar.cc/150?u=sec" }, text: "Ya implementé tus filtros, funcionan perfecto.", timestamp: "1m ago" }
  ]
}

// ── COMPONENTE POSTCARD REPETIBLE (Layout Compacto y Redondo) ───────
function PostCard({ post, onOpenImage, onOpenComments, onAskGrok }: { post: any, onOpenImage: (url: string) => void, onOpenComments: (postId: string) => void, onAskGrok: (postId: string) => void }) {
  // UI Optimista para reacciones instantáneas
  const [liked, setLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  return (
    // Contenedor Principal: Tarjeta individual, fondo oscuro (#0F0F0F), bordes muy suaves (rounded-[24px])
    <div 
      className="mx-4 mb-4 bg-[#0F0F0F] border border-[#1c1c1e] rounded-[24px] overflow-hidden shadow-xl active:bg-[#151515] transition-colors duration-200 cursor-pointer"
      onClick={() => onOpenComments(post.id)} // Abrir respuestas al clickear el cuerpo (UI Optimista)
    >
      <div className="p-3 pt-2.5 pb-2 flex gap-3">
        {/* Avatar Izquierda */}
        <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-[#1c1c1e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
        </div>

        {/* Contenido Derecha */}
        <div className="flex-1 min-w-0">
          {/* Header del Post */}
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5 truncate" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
              <span className="text-white font-bold text-[14px]" style={{ fontFamily: SFD }}>{post.author.name}</span>
              {post.author.isPro && <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              <span className="text-[#8e8e93] text-[13px] truncate">{post.author.handle}</span>
              <span className="text-[#8e8e93] text-[13px]">·</span>
              <span className="text-[#8e8e93] text-[13px] shrink-0">{post.timestamp}</span>
            </div>
            {/* Sección Derecha Header: Grok Icon + Vertical Dots */}
            <div className="flex items-center gap-1 shrink-0 -mr-1" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
                <button onClick={() => onAskGrok(post.id)} className="p-1 active:opacity-70 transition-opacity">
                    <img src="/grok.png" alt="Ask Grok" className="w-3.5 h-3.5 object-contain opacity-90" onError={(e) => e.currentTarget.style.display='none'}/>
                </button>
                <button className="text-[#8e8e93] active:text-white p-1">
                  <MoreVertical className="w-[17px] h-[17px]" />
                </button>
            </div>
          </div>

          {/* Texto del Post */}
          <p className="text-[#e4e4e7] text-[14px] leading-relaxed mb-2.5 whitespace-pre-wrap">
            {post.text}
          </p>

          {/* Resumen IA (Renombrado a xBlum AI Insight) */}
          {post.ai_summary && (
            <div className="mb-3 rounded-xl bg-[#080808] border border-dashed border-[#333] p-2.5 animate-in fade-in zoom-in-95 duration-300">
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

          {/* Imagen (Si existe) - Con protección y apertura centradat */}
          {post.media && (
            <div className="mb-2.5 rounded-xl overflow-hidden border border-[#1c1c1e] aspect-video bg-[#080808]" onClick={(e) => { e.stopPropagation(); onOpenImage(post.media); }}>
              <img 
                src={post.media} 
                alt="Media" 
                className="w-full h-full object-cover cursor-pointer active:scale-105 transition-transform duration-300" 
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()} // Protección de imagen estricta
              />
            </div>
          )}

          {/* Barra de Acciones */}
          <div className="flex items-center justify-between text-[#8e8e93] pt-0.5 pr-0.5 -ml-1">
            <button className="flex items-center gap-1.5 p-1 rounded-full group active:text-white transition-colors" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.comments}</span>
            </button>
            
            <button className="flex items-center gap-1.5 p-1 rounded-full group active:text-green-400 transition-colors" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
              <Repeat2 className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.reposts}</span>
            </button>

            <button onClick={handleLike} className={`flex items-center gap-1.5 p-1 rounded-full group transition-colors ${liked ? 'text-pink-500' : 'active:text-pink-500'}`}>
              <Heart className={`w-[18px] h-[18px] transition-colors ${liked ? 'fill-pink-500' : 'fill-none'}`} />
              <span className="text-[12px] tabular-nums font-medium">{likesCount}</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 text-[#333]" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
              <Eye className="w-[18px] h-[18px]" />
              <span className="text-[12px] tabular-nums font-medium">{post.views}</span>
            </div>

            <button className="p-1 rounded-full active:text-white transition-colors" onClick={(e) => e.stopPropagation()}> {/* Protección de stopPropagation */}
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MODALES PREMIUM (Create, Image Centrada con Zoom, Comments) ────────

// Modal de Creación de Post (Solución del espacio vacío y dimensioness)
function CreatePostModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-200 flex flex-col h-full w-full">
      {/* Cabecera del Modal rediseñada */}
      <div 
        className="flex items-center justify-between px-4 pb-2.5 border-b border-[#1c1c1e] bg-black" 
        style={{ 
          // Manejo dinámico del Safe Area Top (Notch) replicando diseño base
          paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)"
        }}
      >
        <button onClick={onClose} className="text-white text-[15px] active:opacity-70 transition-opacity">Cancel</button>
        <button className="bg-blue-500 text-white text-[14px] font-bold px-4 py-1.5 rounded-full active:opacity-80 transition-opacity">Post</button>
      </div>
      
      {/* Área de Texto principal: Expansión corregida eliminando hueco vacío */}
      <div className="flex-1 p-4 flex gap-3 bg-[#080808] w-full overflow-y-auto">
        <img src="/mi-avatar.jpg" className="w-10 h-10 rounded-full border border-[#1c1c1e] shrink-0 object-cover" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'}/>
        <textarea placeholder="¿Qué está pasando?" className="flex-1 bg-transparent text-white text-lg focus:outline-none resize-none h-full pt-1" autoFocus />
      </div>
      
      {/* Barra de herramientas inferior fija */}
      <div className="p-4 pb-[calc(var(--tg-safe-area-inset-bottom,0px)+16px)] border-t border-[#1c1c1e] bg-[#080808] flex gap-4 text-[#8e8e93] w-full">
        <ImageIcon className="w-6 h-6 active:text-blue-500 transition-colors" />
        <Bot className="w-6 h-6 active:text-amber-400 transition-colors" />
      </div>
    </div>
  )
}

// Modal de Visualización de Imagen Fullscreen (Centrado Automático y Estilo X)
function FullscreenImageModal({ url, onClose }: { url: string | null, onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black animate-in fade-in duration-200 flex flex-col h-full w-full" onClick={onClose}>
      {/* Botones Superiores */}
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-[120]" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 16px)" }}>
        <button onClick={onClose} className="p-2 bg-black/50 rounded-full text-white active:bg-black/80 backdrop-blur-md transition-colors"><X className="w-6 h-6"/></button>
        <button className="p-2 bg-black/50 rounded-full text-white active:bg-black/80 backdrop-blur-md transition-colors"><MoreVertical className="w-6 h-6"/></button>
      </div>

      {/* Contenedor de Imagen (Centrado AUTOMÁTICO total replicando diseño X)) */}
      <div 
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden" 
        onClick={onClose}
      >
        <img 
          src={url} 
          alt="Media" 
          // Soporte para Zoom con doble toque
          onDoubleClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()} // Protección de imagen estricta
          className={`transition-transform duration-300 ease-out object-contain w-full h-full ${zoomed ? 'scale-[1.8] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
        />
      </div>

      {/* Botones Inferiores (Replicando X/Telegram) */}
      <div className="absolute bottom-0 w-full pb-[calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 24px)] pt-4 px-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white z-[120] w-full">
        <button className="p-2 active:text-blue-400 transition-colors"><MessageCircle className="w-6 h-6"/></button>
        <button className="p-2 active:text-green-400 transition-colors"><Repeat2 className="w-6 h-6"/></button>
        <button className="p-2 active:text-pink-500 transition-colors"><Heart className="w-6 h-6"/></button>
        <button className="p-2 active:text-white transition-colors"><Download className="w-6 h-6"/></button>
        <button className="p-2 active:text-white transition-colors"><Share2 className="w-6 h-6"/></button>
      </div>
    </div>
  )
}

// Modal de Caja de Comentarios INTERACTIVO (Estilo X / Reply)
function CommentModal({ postId, onClose }: { postId: string | null, onClose: () => void }) {
  const [replyInput, setReplyInput] = useState('')
  const [localComments, setLocalComments] = useState<any[]>([])

  // Cargar comentarios mockeados cuando se abre el modal para un post
  useEffect(() => {
    if (postId && MOCK_COMMENTS_DATA[postId]) {
      setLocalComments(MOCK_COMMENTS_DATA[postId])
    } else {
      setLocalComments([])
    }
  }, [postId])

  // Función para manejar el envío de un nuevo comentario (UI Optimista Estilo X))
  const handleSendReply = () => {
    if (!replyInput.trim() || !postId) return

    // Crear objeto de comentario local simulado
    const newReply = {
      id: `lr-${Date.now()}`,
      author: { name: "You (Analyst)", avatar: "/mi-avatar.jpg", handle: "@you_ai" }, // Simulación de tu usuario
      text: replyInput.trim(),
      timestamp: "Now"
    }

    // Actualizar lista local de comentarios instantáneamente
    setLocalComments(prev => [...prev, newReply])
    // Limpiar input
    setReplyInput('')
  }

  if (!postId) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col justify-end animate-in fade-in duration-200 w-full h-full" onClick={onClose}>
      {/* Contenedor del Modal inferior animado (slide-in full h-full) */}
      <div 
        className="w-full h-[85vh] bg-[#0F0F0F] rounded-t-[28px] flex flex-col animate-in slide-in-from-bottom duration-300 border-t border-[#2c2c2e] overflow-hidden w-full" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Cabecera del modal de comentarios */}
        <div className="flex items-center justify-between p-4 border-b border-[#1c1c1e] shrink-0 w-full">
          <span className="font-bold text-[18px] text-center w-full" style={{ fontFamily: SFD }}>Reply</span>
          <button onClick={onClose} className="absolute right-4 p-1 active:bg-[#1c1c1e] rounded-full"><X className="w-6 h-6 text-gray-400"/></button>
        </div>

        {/* Lista de Comentarios Existentes (Interactiva y scrolleable)) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pr-2 w-full">
          {localComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
                <MessageCircle className="w-12 h-12" />
                <p className="text-center text-sm">Be the first to replyтехнического debatir vulnerabilidades.</p>
            </div>
          ) : (
            localComments.map(reply => (
              <div key={reply.id} className="flex gap-3 mb-5">
                <img src={reply.author.avatar} alt={reply.author.name} className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-white font-bold text-[14px]" style={{ fontFamily: SFD }}>{reply.author.name}</span>
                    <span className="text-[#8e8e93] text-[13px]">{reply.author.handle} · {reply.timestamp}</span>
                  </div>
                  <p className="text-[#e4e4e7] text-[14px] leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Fixed Bottom (Estilo X / Reply) - Solución del space bug */}
        <div 
          className="p-3 border-t border-[#1c1c1e] bg-[#0F0F0F] shrink-0 w-full"
          style={{ paddingBottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 12px)" }}
        >
          <div className="flex items-center gap-3 w-full">
            <img src="/mi-avatar.jpg" className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#2c2c2e]" onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/150'} />
            <input 
              type="text" 
              value={replyInput}
              onChange={e => setReplyInput(e.target.value)}
              placeholder="Post your reply" 
              className="flex-1 bg-transparent text-[14px] text-white focus:outline-none placeholder:text-gray-600" 
              onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} // Enviar con Enter
              autoFocus
            />
            <button 
              onClick={handleSendReply} 
              disabled={!replyInput.trim()}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all duration-200 ${replyInput.trim() ? 'bg-blue-500 text-white active:opacity-80' : 'bg-[#1c1c1e] text-gray-600'}`}
            >
              Reply
            </button>
          </div>
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

  // Función para manejar el "Ask Grok"
  const handleAskGrok = (postId: string) => {
    // Aquí integrarías la llamada directa a Grok API
    // Por ahora, solo simulación técnica
  }

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
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out h-full w-full">
      
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

        {/* Tabs: Replicando el diseño Dark OLED de tu referencia visual */}
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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-3 w-full">
        {activeTab === "foryou" ? (
            MOCK_POSTS_FORYOU.map(post => (
                <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPostId} onAskGrok={handleAskGrok}/>
            ))
        ) : (
            // Solución del Error: Renderizado de MOCK_POSTS_FOLLOWING
            MOCK_POSTS_FOLLOWING.map(post => (
                <PostCard key={post.id} post={post} onOpenImage={setFullscreenImageUrl} onOpenComments={setCommentPostId} onAskGrok={handleAskGrok}/>
            ))
        )}
        
        {/* Placeholder final de carga */}
        <div className="py-12 flex justify-center w-full">
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
          bottom: "calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 90px)" 
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
