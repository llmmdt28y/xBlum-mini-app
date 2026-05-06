"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Tv, MessageCircle, Share2, ChevronRight, Loader2 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Configuración de los 12 Niveles (Corregido para Strict Mode) ──
const LEVEL_CONFIG = [
  { lv: 1,  name: "Novice",    bp: 0,       color: "#82c3cd", pixels: [33, 23, 32, 34, 43] }, // Pequeña Cruz
  { lv: 2,  name: "Explorer",  bp: 1000,    color: "#a8e8a8", pixels: [22, 23, 24, 32, 33, 34, 42, 43, 44] }, // Cuadrado
  { lv: 3,  name: "Advanced",  bp: 2500,    color: "#e8a8c1", pixels: [30, 21, 31, 41, 12, 22, 32, 42, 52, 3, 13, 23, 33, 43, 53, 63, 14, 24, 34, 44, 54, 25, 35, 45, 36] }, // Rombo
  { lv: 4,  name: "Expert",    bp: 6000,    color: "#ffd9a8", pixels: [21, 31, 41, 12, 52, 13, 53, 14, 54, 25, 35, 45] }, // Hexágono Hueco
  { lv: 5,  name: "Specialist",bp: 12000,   color: "#a8c1e8", pixels: [30, 21, 41, 12, 32, 52, 3, 33, 63, 14, 34, 54, 25, 45, 36] }, // Estrella de 4 puntas
  { lv: 6,  name: "Elite",     bp: 25000,   color: "#d1a8e8", pixels: [21, 31, 41, 12, 32, 52, 13, 33, 53, 14, 34, 54, 25, 35, 45] }, // Core con órbita
  { lv: 7,  name: "Veteran",   bp: 50000,   color: "#e8a8a8", pixels: [0, 60, 11, 51, 22, 42, 33, 24, 44, 15, 55, 6, 66] }, // X de precisión
  { lv: 8,  name: "Commander", bp: 100000,  color: "#f4f4f4", pixels: [30, 21, 31, 41, 3, 13, 23, 33, 43, 53, 63, 25, 35, 45, 36] }, // Gran Diamante
  { lv: 9,  name: "Legend",    bp: 250000,  color: "#ffd700", pixels: [30, 11, 51, 2, 32, 62, 13, 53, 4, 34, 64, 15, 55, 36] }, // Átomo AI
  { lv: 10, name: "Oracle",    bp: 500000,  color: "#00ffcc", pixels: [11, 21, 31, 41, 51, 12, 52, 13, 53, 14, 54, 15, 25, 35, 45, 55] }, // Frame Tech
  { lv: 11, name: "Visionary", bp: 1000000, color: "#ff007f", pixels: [30, 21, 31, 41, 2, 12, 22, 42, 52, 62, 33, 4, 14, 24, 44, 54, 64, 25, 35, 45, 36] }, // Flor de Datos
  { lv: 12, name: "Apex AI",   bp: 2500000, color: "#ffffff", pixels: [0, 10, 20, 30, 40, 50, 60, 1, 61, 2, 22, 32, 42, 62, 3, 23, 33, 43, 63, 4, 24, 34, 44, 64, 5, 65, 6, 16, 26, 36, 46, 56, 66] } // Matriz Suprema
];

// ── Componente de Renderizado Pixel Art ──
const PixelObject = ({ pixels, color, size = 90 }: { pixels: number[], color: string, size?: number }) => {
  return (
    <svg viewBox="0 0 7 7" width={size} height={size} style={{ filter: `drop-shadow(0 0 12px ${color}66)` }}>
      {pixels.map(pos => {
        const x = Math.floor(pos / 10);
        const y = pos % 10;
        return <rect key={pos} x={x} y={y} width="1" height="1" fill={color} />;
      })}
      {/* Puntos blancos de brillo interno en posiciones clave */}
      <rect x="3" y="3" width="1" height="1" fill="white" opacity="0.4" />
    </svg>
  );
};

export function LevelsView() {
  const ctx = useApp() as any;
  const { x_points: currentBP, ads_today, setCurrentView, claimMissionTokens } = ctx;
  const [loadingMission, setLoadingMission] = useState<string | null>(null);

  // Determinar Nivel Actual
  const currentLevel = [...LEVEL_CONFIG].reverse().find(l => currentBP >= l.bp) || LEVEL_CONFIG[0];
  const nextLevel = LEVEL_CONFIG[currentLevel.lv] || currentLevel;
  const progressPercent = Math.min(100, (currentBP / nextLevel.bp) * 100);

  // ── Manejo de Flecha Nativa de Telegram ──
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      const handleBack = () => setCurrentView("home");
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
        tg.BackButton.hide();
      };
    }
  }, [setCurrentView]);

  const handleAction = async (id: string, type: string, reward: number) => {
    setLoadingMission(id);
    const tg = (window as any).Telegram?.WebApp;
    
    if (type === "ads") {
      setCurrentView("store");
    } else {
      const ok = await claimMissionTokens(type, reward);
      if (ok) tg?.showAlert(`✅ +${reward} BP earned!`);
      else tg?.showAlert("Mission already completed or not ready.");
    }
    setLoadingMission(null);
  };

  return (
    <div className="flex-1 bg-[#060606] min-h-screen relative overflow-x-hidden pb-32 select-none">
      
      {/* Fondo Stardust */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      {/* Header Título (Alineado con otras páginas) */}
      <div 
        className="sticky top-0 z-30 flex items-center justify-center w-full bg-black/80 backdrop-blur-md border-b border-white/5"
        style={{ 
          paddingTop: "var(--tg-safe-area-inset-top, 24px)", 
          height: "calc(max(var(--tg-safe-area-inset-top, 44px), 44px) + 24px)" 
        }}
      >
        <h2 className="text-[17px] font-bold text-white" style={{ fontFamily: SFD }}>
          Level {currentLevel.lv}
        </h2>
      </div>

      {/* Hero: Objeto Pixelado Central */}
      <div className="flex flex-col items-center mt-12 mb-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-[40px] opacity-20 rounded-full" style={{ background: currentLevel.color }} />
          <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} />
        </div>
        <h1 className="text-[36px] font-bold text-white tracking-tight mb-2" style={{ fontFamily: SFD }}>
          Level {currentLevel.lv}
        </h1>
        <p className="text-[12px] font-bold text-[#8e8e93] tracking-[0.2em] uppercase" style={{ fontFamily: SF }}>
          {currentLevel.name}
        </p>
      </div>

      {/* Tarjeta de Progreso Principal */}
      <div className="px-5 mb-8">
        <div className="bg-[#141415] border border-[#1c1c1e] rounded-[24px] p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={18} />
              <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level {currentLevel.lv}</span>
            </div>
            <span className="text-[14px] font-bold text-[#d1d1d6]" style={{ fontFamily: SFD }}>
              {currentBP.toLocaleString()}/{nextLevel.bp.toLocaleString()} BP
            </span>
          </div>

          {/* Barra punteada exacto a diseño */}
          <div className="flex items-center justify-between w-full mb-4 gap-[4px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`h-[5px] flex-1 rounded-[1px] transition-all duration-700 ${i < (progressPercent / 100 * 24) ? 'bg-white' : 'bg-[#2c2c2e]'}`} />
            ))}
          </div>

          <p className="text-[13px] text-[#8e8e93] leading-relaxed" style={{ fontFamily: SF }}>
            You are currently at {currentLevel.name} rank. Accumulate more BP to evolve your AI core and unlock exclusive rewards.
          </p>
        </div>
      </div>

      {/* Sección de Misiones Funcionales */}
      <div className="px-5 space-y-6">
        <p className="px-1 text-[18px] font-bold text-white" style={{ fontFamily: SFD }}>Missions</p>
        
        <div className="bg-[#141415] border border-[#1c1c1e] rounded-[24px] overflow-hidden">
          <MissionItem 
            id="ads" 
            title="Watch Ads" 
            reward={300} 
            progress={`${ads_today || 0}/3`} 
            icon={<Tv size={20} className="text-blue-400" />}
            onClick={() => handleAction("ads", "ads", 300)}
            loading={loadingMission === "ads"}
          />
          <div className="h-px bg-white/5 ml-14" />
          <MissionItem 
            id="channel" 
            title="Join xBlum Channel" 
            reward={500} 
            icon={<MessageCircle size={20} className="text-green-400" />}
            onClick={() => handleAction("channel", "channel", 500)}
            loading={loadingMission === "channel"}
          />
          <div className="h-px bg-white/5 ml-14" />
          <MissionItem 
            id="invite" 
            title="Refer 1 Friend" 
            reward={1000} 
            icon={<Share2 size={20} className="text-purple-400" />}
            onClick={() => handleAction("invite", "referral", 1000)}
            loading={loadingMission === "invite"}
          />
        </div>
      </div>
    </div>
  );
}

function MissionItem({ title, reward, progress, icon, onClick, loading }: any) {
  return (
    <button onClick={onClick} disabled={loading} className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-white font-medium text-[15px]" style={{ fontFamily: SF }}>{title}</p>
          <p className="text-amber-500 font-bold text-[13px]" style={{ fontFamily: SFD }}>+{reward} BP</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {progress && <span className="text-[#636366] text-[13px] font-bold" style={{ fontFamily: SFD }}>{progress}</span>}
        {loading ? <Loader2 size={16} className="animate-spin text-white/20" /> : <ChevronRight size={18} className="text-[#48484a]" />}
      </div>
    </button>
  );
}
