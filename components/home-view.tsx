"use client"

import { useApp } from "@/lib/app-context"
import { Send, Sparkles, Code, FileText, Search, AlertTriangle, Clock, Zap } from "lucide-react"
import { useState, useRef } from "react"
 
/* ── Stars background ────────────────────────────────────────────────── */
const STAR_DATA = [
  { top:"12%", left:"6%",   sz:2,   op:0.5,  d:0   },
  { top:"22%", left:"14%",  sz:1.5, op:0.35, d:0.5 },
  { top:"38%", left:"4%",   sz:1,   op:0.25, d:1   },
  { top:"50%", left:"18%",  sz:1.5, op:0.4,  d:0.2 },
  { top:"18%", right:"8%",  sz:2,   op:0.5,  d:0.3 },
  { top:"32%", right:"5%",  sz:1,   op:0.25, d:0.7 },
  { top:"44%", right:"16%", sz:1.5, op:0.4,  d:0.1 },
  { top:"58%", right:"10%", sz:1,   op:0.3,  d:0.9 },
]

function StarsBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map((s, i) => (
        <div key={i} 
          /* CAMBIO 1: 
             - Restaurado el tamaño original (sz, no sz * 2).
             - Usamos animate-twinkle-sutil (sin movimiento).
             - Sombra muy sutil (shadow-white/30).
          */
          className="absolute rounded-full bg-white animate-twinkle-sutil shadow-[0_0_6px_1px_rgba(255,255,255,0.3)]"
          style={{
            top: s.top,
            left:  "left"  in s ? s.left  : undefined,
            right: "right" in s ? s.right : undefined,
            width: s.sz + "px",    // Tamaño original recuperado
            height: s.sz + "px",   // Tamaño original recuperado
            opacity: s.op, 
            animationDelay: s.d + "s", 
            animationDuration: "3s", // Parpadeo suave cada 3 segundos
          }}
        />
      ))}
    </div>
  )
}

// ... (El resto del código de SUGGESTIONS se mantiene igual) ...

/* ── Component ───────────────────────────────────────────────────────── */
export function HomeView() {
  const {
    t, selectedModel, setCurrentView, isPremium,
    isThrottled, minutesUntilReset, sendToBot,
  } = useApp()

  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSend() {
    const text = message.trim()
    if (!text) return
    sendToBot(text)
    setMessage("")
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) handleSend()
  }

  const showThrottle = isThrottled && selectedModel === "Grok 4 Mini"

  return (
    /* CAMBIO 2: 
       1. Se cambió 'justify-center' por 'justify-start' para subirlo.
       2. Se añadió 'pt-[10vh]' (un padding superior responsivo) para posicionarlo arriba. 
    */
    <div className="flex-1 flex flex-col items-center justify-start pt-[10vh] px-4 pb-8 relative">
      <StarsBg />
      
      {/* ... (El resto del código del logo, input, etc. se mantiene igual) ... */}
      
      <div className="flex flex-col items-center gap-5 w-full max-w-md relative z-10">
        {/* Logo, Título, Chips, Input irán aquí... */}
      </div>

      {/* Al usar justify-start arriba, ahora tienes espacio aquí abajo para agregar cosas */}
    </div>
  )
}
