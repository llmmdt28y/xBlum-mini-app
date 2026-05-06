"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback, useRef } from "react"
import { ChevronRight, Loader2, Target, Tv, MessageCircle, Share2, Star, Box } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// --- Lógica de Niveles (12 Niveles Exponenciales) ---
const LEVEL_DATA = [
  { lv: 1,  name: "Novice",    bp: 0,       desc: "You understand the basics of AI", color: "#8e8e93" },
  { lv: 2,  name: "Initiate",  bp: 1000,    desc: "Starting to explore the xBlum ecosystem", color: "#3b82f6" },
  { lv: 3,  name: "Advanced",  bp: 2500,    desc: "You are proficient in using various AI applications", color: "#ec4899" }, // El de la imagen
  { lv: 4,  name: "Expert",    bp: 6000,    desc: "Mastering advanced prompt engineering", color: "#a855f7" },
  { lv: 5,  name: "Specialist",bp: 12000,   desc: "Optimizing AI workflows efficiently", color: "#10b981" },
  { lv: 6,  name: "Elite",     bp: 25000,   desc: "A key contributor to the xBlum network", color: "#f59e0b" },
  { lv: 7,  name: "Veteran",   bp: 50000,   desc: "Your AI knowledge is superior", color: "#f97316" },
  { lv: 8,  name: "Commander", bp: 100000,  desc: "Leading the AI revolution", color: "#ef4444" },
  { lv: 9,  name: "Legend",    bp: 200000,  desc: "Your profile is recognized by the system", color: "#ffffff" },
  { lv: 10, name: "Oracle",    bp: 400000,  desc: "Predicting the future of intelligence", color: "#6366f1" },
  { lv: 11, name: "Visionary", bp: 750000,  desc: "Reshaping the digital landscape", color: "#00d2ff" },
  { lv: 12, name: "Apex AI",   bp: 1500000, desc: "The ultimate form of xBlum evolution", color: "#d4af37" },
]

export function LevelsView() {
  const ctx = useApp() as any
  const { x_points: currentBP, ads_today, claimMissionTokens, setCurrentView } = ctx
  const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null

  // Encontrar nivel actual
  const currentLevelObj = [...LEVEL_DATA].reverse().find(l => currentBP >= l.bp) || LEVEL_DATA[0]
  const nextLevelObj    = LEVEL_DATA[currentLevelObj.lv] || currentLevelObj
  const progressPercent = Math.min(100, (currentBP / nextLevelObj.bp) * 100)

  return (
    <div className="flex-1 overflow-y-auto bg-black relative animate-in fade-in duration-500" style={{ minHeight: "100vh" }}>
      
      {/* --- HERO SECTION: Nivel Actual (Estilo Imagen 1) --- */}
      <div className="flex flex-col items-center pt-20 pb-10 px-6">
        <div className="relative mb-6">
          {/* Brillo de fondo dinámico */}
          <div className="absolute inset-0 blur-[60px] opacity-20 transition-colors duration-1000" 
               style={{ background: currentLevelObj.color }} />
          
          {/* Objeto Pixelado (Representación visual del nivel) */}
          <div className="relative z-10 w-24 h-24 flex items-center justify-center">
            <div className="w-16 h-16 rotate-45 border-4" 
                 style={{ 
                    borderColor: currentLevelObj.color, 
                    boxShadow: `0 0 20px ${currentLevelObj.color}44`,
                    background: "rgba(0,0,0,0.5)"
                 }}>
              {/* Aquí irían los patrones pixelados según el nivel */}
              <div className="absolute inset-2 bg-white/10" />
            </div>
          </div>
        </div>

        <h1 className="text-white font-bold text-[34px] tracking-tight mb-1" style={{ fontFamily: SFD }}>
          Level {currentLevelObj.lv}
        </h1>
        <p className="text-[#8e8e93] font-bold text-[13px] uppercase tracking-[0.1em]" style={{ fontFamily: SF }}>
          {currentLevelObj.name}
        </p>
      </div>

      {/* --- PROGRESS CARD (Barra de puntos de la imagen) --- */}
      <div className="px-4 mb-8">
        <div className="bg-[#111] border border-[#1c1c1e] rounded-[24px] p-5">
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rotate-45" style={{ background: currentLevelObj.color }} />
               <span className="text-white font-bold text-[15px]" style={{ fontFamily: SF }}>Level {currentLevelObj.lv}</span>
            </div>
            <span className="text-[#8e8e93] font-bold text-[14px]" style={{ fontFamily: SFD }}>
              {currentBP.toLocaleString()}/{nextLevelObj.bp.toLocaleString()} BP
            </span>
          </div>

          {/* Barra de progreso punteada exacta a la imagen */}
          <div className="flex gap-1 h-1.5 w-full mb-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-full transition-colors"
                   style={{ background: (i / 24) * 100 <= progressPercent ? currentLevelObj.color : "#1c1c1e" }} />
            ))}
          </div>
          
          <p className="text-[#8e8e93] text-[13px] leading-relaxed" style={{ fontFamily: SF }}>
            {currentLevelObj.desc}
          </p>
        </div>
      </div>

      {/* --- MISSIONS & REWARDS --- */}
      <div className="px-4 pb-32 space-y-6">
        
        {/* Mystery Box Banner */}
        <button 
          onClick={() => tg?.showAlert("Caskets coming soon! Unlock auras, hats and more.")}
          className="w-full flex items-center justify-between bg-[#111] border border-[#1c1c1e] rounded-[24px] px-5 py-4 active:scale-[0.98] transition-transform"
        >
          <div className="text-left">
            <p className="text-white font-bold text-[16px]" style={{ fontFamily: SFD }}>Mystery Caskets</p>
            <p className="text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>Spend BP to get rare profile items</p>
          </div>
          <Box className="w-8 h-8 text-amber-500" />
        </button>

        <div>
          <p className="px-2 mb-3 text-white font-bold text-[18px]" style={{ fontFamily: SFD }}>Daily Quests</p>
          <div className="rounded-[24px] overflow-hidden border border-[#1c1c1e] bg-[#111]">
            <MissionRow 
              icon={<Tv className="w-5 h-5 text-blue-400" />} 
              title="Watch Daily Ads" 
              reward="300 BP" 
              progress={`${ads_today || 0}/3`}
              onClick={() => setCurrentView("store")} 
            />
            <div className="h-px bg-[#1c1c1e] ml-14" />
            <MissionRow 
              icon={<MessageCircle className="w-5 h-5 text-green-400" />} 
              title="Join xBlum Channel" 
              reward="500 BP" 
              onClick={() => tg?.openTelegramLink("https://t.me/xBlumAI")}
            />
            <div className="h-px bg-[#1c1c1e] ml-14" />
            <MissionRow 
              icon={<Share2 className="w-5 h-5 text-purple-400" />} 
              title="Invite 1 Friend" 
              reward="1000 BP" 
              onClick={() => setCurrentView("referral")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MissionRow({ icon, title, reward, progress, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-white font-medium text-[15px]" style={{ fontFamily: SF }}>{title}</p>
          <p className="text-amber-500 font-bold text-[13px]" style={{ fontFamily: SFD }}>+{reward}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {progress && <span className="text-[#636366] text-xs font-bold">{progress}</span>}
        <ChevronRight className="w-4 h-4 text-[#48484a]" />
      </div>
    </button>
  )
}
