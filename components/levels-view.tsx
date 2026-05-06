"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Play, Send, UserPlus, ChevronRight, Loader2 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ── Configuración de los 12 Niveles (Corregido para Strict Mode) ──
const LEVEL_CONFIG = [
  { lv: 1,  name: "Novice",    bp: 0,       color: "#82c3cd", pixels: [33, 23, 32, 34, 43] },
  { lv: 2,  name: "Explorer",  bp: 1000,    color: "#a8e8a8", pixels: [22, 23, 24, 32, 33, 34, 42, 43, 44] },
  { lv: 3,  name: "Advanced",  bp: 2500,    color: "#e8a8c1", pixels: [30, 21, 31, 41, 12, 22, 32, 42, 52, 3, 13, 23, 33, 43, 53, 63, 14, 24, 34, 44, 54, 25, 35, 45, 36] },
  { lv: 4,  name: "Expert",    bp: 6000,    color: "#ffd9a8", pixels: [21, 31, 41, 12, 52, 13, 53, 14, 54, 25, 35, 45] },
  { lv: 5,  name: "Specialist",bp: 12000,   color: "#a8c1e8", pixels: [30, 21, 41, 12, 32, 52, 3, 33, 63, 14, 34, 54, 25, 45, 36] },
  { lv: 6,  name: "Elite",     bp: 25000,   color: "#d1a8e8", pixels: [21, 31, 41, 12, 32, 52, 13, 33, 53, 14, 34, 54, 25, 35, 45] },
  { lv: 7,  name: "Veteran",   bp: 50000,   color: "#e8a8a8", pixels: [0, 60, 11, 51, 22, 42, 33, 24, 44, 15, 55, 6, 66] },
  { lv: 8,  name: "Commander", bp: 100000,  color: "#f4f4f4", pixels: [30, 21, 31, 41, 3, 13, 23, 33, 43, 53, 63, 25, 35, 45, 36] },
  { lv: 9,  name: "Legend",    bp: 250000,  color: "#ffd700", pixels: [30, 11, 51, 2, 32, 62, 13, 53, 4, 34, 64, 15, 55, 36] },
  { lv: 10, name: "Oracle",    bp: 500000,  color: "#00ffcc", pixels: [11, 21, 31, 41, 51, 12, 52, 13, 53, 14, 54, 15, 25, 35, 45, 55] },
  { lv: 11, name: "Visionary", bp: 1000000, color: "#ff007f", pixels: [30, 21, 31, 41, 2, 12, 22, 42, 52, 62, 33, 4, 14, 24, 44, 54, 64, 25, 35, 45, 36] },
  { lv: 12, name: "Apex AI",   bp: 2500000, color: "#ffffff", pixels: [0, 10, 20, 30, 40, 50, 60, 1, 61, 2, 22, 32, 42, 62, 3, 23, 33, 43, 63, 4, 24, 34, 44, 64, 5, 65, 6, 16, 26, 36, 46, 56, 66] }
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
        <div className="bg-[#141415] rounded-[22px] p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <PixelObject pixels={currentLevel.pixels} color={currentLevel.color} size={18} />
              <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>Level {currentLevel.lv}</span>
            </div>
            <span className="text-[14px] font-bold text-[#d1d1d6]" style={{ fontFamily: SF }}>
              {currentBP.toLocaleString()}/{nextLevel.bp.toLocaleString()} BP
            </span>
          </div>

          {/* Barra punteada exacta al diseño */}
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

      {/* ── Separador Horizontal Punteado ── */}
      <div className="w-full border-t border-dashed border-[#2c2c2e] mb-6" />

      {/* ── Misiones (Estilo Timeline Integrado) ── */}
      <div className="relative z-10 px-5 w-full flex flex-col">
        <h3 className="text-[18px] font-bold text-white mb-6" style={{ fontFamily: SFD }}>Daily Missions</h3>

        <MissionTimelineCard 
          title="Watch Ads" 
          reward={300} 
          desc="Support the project by watching short daily ads and earn points."
          progress={`${ads_today || 0}/3 Completed`} 
          icon={<Play size={18} className="text-white" fill="currentColor" />}
          onClick={() => handleAction("ads", "ads", 300)}
          loading={loadingMission === "ads"}
          isLast={false}
        />

        <MissionTimelineCard 
          title="Join xBlum Channel" 
          reward={500} 
          desc="Stay updated with the latest AI news and feature drops."
          progress="Pending" 
          icon={<Send size={18} className="text-white" />}
          onClick={() => handleAction("channel", "channel", 500)}
          loading={loadingMission === "channel"}
          isLast={false}
        />

        <MissionTimelineCard 
          title="Refer 1 Friend" 
          reward={1000} 
          desc="Invite a friend to the xBlum ecosystem and grow your rank faster."
          progress="Pending" 
          icon={<UserPlus size={18} className="text-white" />}
          onClick={() => handleAction("invite", "referral", 1000)}
          loading={loadingMission === "invite"}
          isLast={true}
        />

      </div>
    </div>
  );
}

// ── Componente de Tarjeta de Misión (Mismo Estilo que las Tarjetas de Nivel) ──
function MissionTimelineCard({ title, reward, desc, progress, icon, onClick, loading, isLast }: any) {
  return (
    <div className="flex w-full">
      {/* Timeline Vertical Track */}
      <div className="w-[28px] flex-shrink-0 flex justify-center relative">
         {/* Línea vertical sólida conectora */}
         {!isLast && <div className="absolute top-[28px] bottom-[-24px] w-[2px] bg-[#2c2c2e]" />}
         {/* Punto indicador */}
         <div className={`absolute top-[28px] w-[7px] h-[7px] rounded-full z-10 transition-colors shadow-[0_0_8px_rgba(255,255,255,0.1)] ${loading ? 'bg-white' : 'bg-[#48484a]'}`} />
      </div>

      {/* Mission Content Card */}
      <button onClick={onClick} disabled={loading} className="flex-1 bg-[#141415] rounded-[22px] p-5 mb-5 text-left active:scale-[0.98] transition-all">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
               <div className="opacity-90">
                  {loading ? <Loader2 size={18} className="animate-spin text-white" /> : icon}
               </div>
               <span className="text-[16px] font-bold text-white" style={{ fontFamily: SFD }}>{title}</span>
            </div>
            <span className="text-[13px] font-bold text-white" style={{ fontFamily: SF }}>+{reward} BP</span>
         </div>

         <p className="text-[13px] text-[#8e8e93] leading-[1.4] mb-4" style={{ fontFamily: SF }}>
           {desc}
         </p>

         <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-[#636366] uppercase tracking-wider" style={{ fontFamily: SF }}>
               {progress}
            </span>
            {loading ? <Loader2 size={16} className="animate-spin text-[#48484a]" /> : <ChevronRight size={16} className="text-[#48484a]" />}
         </div>
      </button>
    </div>
  );
}
