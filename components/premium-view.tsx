"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  // ── Botón Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      setCurrentView("home")
      tg.BackButton.hide()
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
  }, [setCurrentView])

  async function subscribe() {
    setIsLoading(true)
    try {
      await openInvoice("premium_1m")
    } catch (e) {
      console.error("[Subscribe]", e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-[#000000] relative overflow-hidden text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @keyframes shimmer-shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
          100% { transform: translateX(300%); }
        }
        @keyframes shimmer-border {
          0% { border-color: rgba(255,106,0,1); }
          25% { border-color: rgba(255,255,255,0.9); box-shadow: 0 0 10px rgba(255,255,255,0.5); }
          50% { border-color: rgba(255,106,0,1); box-shadow: 0 0 0px transparent; }
          100% { border-color: rgba(255,106,0,1); }
        }
        .shimmer-btn {
          border: 1.5px solid rgba(255,106,0,1);
          animation: shimmer-border 3.5s infinite linear;
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          animation: shimmer-shine 3.5s infinite linear;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="flex-1 flex flex-col items-center pt-[calc(var(--tg-safe-area-inset-top,24px)+48px)] px-4 relative z-10 overflow-y-auto no-scrollbar pb-8">
        
        {/* Título: SuperNoir */}
        <h1 
          className="text-[64px] font-extrabold tracking-tighter mb-8 pb-1 leading-none mt-4"
          style={{
            background: "linear-gradient(to right, #ffffff 0%, #d1d1d6 35%, #48484a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}
        >
          SuperNoir
        </h1>

        {/* Cuadros Comparativos (Estilo Mira Pro) */}
        <div className="w-full max-w-md grid grid-cols-2 gap-2 mb-10">
          
          {/* Columna Free */}
          <div className="flex flex-col pt-3">
            <div className="text-center pb-4 text-[#8e8e93] font-bold text-[17px] tracking-wide" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>
              Free
            </div>
            
            <div className="flex flex-col items-center text-center p-3 border-t border-[#1c1c1e] min-h-[140px]">
              <img src="/memo.webp" alt="Memo" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Basic AI models</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Standard access to Grok & Gemini Flash.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 border-t border-[#1c1c1e] min-h-[140px]">
              <img src="/search.webp" alt="Search" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Standard Search</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Basic web search for everyday questions.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 border-t border-[#1c1c1e] min-h-[140px]">
              <img src="/hourglass.webp" alt="Limits" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Standard Limits</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Fewer limits & up to 5 active tasks.</p>
            </div>
          </div>

          {/* Columna Premium (SuperNoir) */}
          <div className="flex flex-col border-[2px] border-[#ff6a00] rounded-[24px] bg-[#111111] shadow-[0_0_20px_rgba(255,106,0,0.15)] overflow-hidden">
            <div className="bg-[#ff6a00] text-center py-3">
              <span className="text-white font-bold text-[17px] tracking-wide" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>SuperNoir</span>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 min-h-[140px]">
              <img src="/robot.webp" alt="Autonomous AI" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Autonomous AI</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Guaranteed priority access during peak hours.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 border-t border-[#ff6a00]/30 min-h-[140px]">
              <img src="/lightning.webp" alt="Lightning" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>DeepSearch</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Advanced reasoning and deep thinking tools.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-3 border-t border-[#ff6a00]/30 min-h-[140px]">
              <img src="/rocket.webp" alt="Rocket" className="w-[36px] h-[36px] mb-2 object-contain drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Increased Limits</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Higher limits & up to 15 active tasks.</p>
            </div>
          </div>

        </div>

        <div className="flex-1" />

        {/* Upgrade Button */}
        <button
          onClick={subscribe}
          disabled={isLoading || isPremium}
          className="w-full max-w-sm py-[18px] shimmer-btn relative overflow-hidden bg-[#ff6a00] hover:bg-[#ff7a1a] text-white font-bold text-[17px] rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-[0_0_20px_rgba(255,106,0,0.3)] shrink-0"
        >
          {isPremium ? (
            <span className="relative z-10">SuperNoir Active</span>
          ) : isLoading ? (
            <span className="relative z-10">Processing...</span>
          ) : (
            <div className="flex items-center justify-center gap-1.5 relative z-10">
              <span className="leading-none mt-[1px]">Subscribe for</span>
              <img src="/telegram-star-icon.png" alt="Star" className="w-[18px] h-[18px] object-contain -mt-[1px]" style={{ filter: "brightness(0) invert(1)" }} />
              <span className="leading-none mt-[1px]">1,150</span>
            </div>
          )}
        </button>

        {/* Footer Links */}
        <div className="flex items-center gap-2 text-[11px] text-[#555558] font-medium shrink-0">
          <button className="hover:text-[#8e8e93]">Terms & Conditions</button>
          <span>|</span>
          <button className="hover:text-[#8e8e93]">Privacy Policy</button>
        </div>

      </div>
    </div>
  )
}
