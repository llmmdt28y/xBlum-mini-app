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
          20% { transform: translateX(300%); }
          100% { transform: translateX(300%); }
        }
        @keyframes shimmer-border {
          0% { border-color: rgba(255,106,0,1); }
          10% { border-color: rgba(255,255,255,0.9); box-shadow: 0 0 10px rgba(255,255,255,0.5); }
          20% { border-color: rgba(255,106,0,1); box-shadow: 0 0 0px transparent; }
          100% { border-color: rgba(255,106,0,1); }
        }
        .shimmer-btn {
          border: 1.5px solid rgba(255,106,0,1);
          animation: shimmer-border 6s infinite linear;
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
          animation: shimmer-shine 6s infinite linear;
        }
      `}</style>
      
      {/* Botón Skip (Arriba a la derecha) */}
      <div 
        className="absolute right-4 z-20"
        style={{ top: "calc(var(--tg-safe-area-inset-top, 24px) + 16px)" }}
      >
        <button 
          onClick={() => setCurrentView("home")}
          className="px-4 py-1.5 bg-[#1c1c1e] text-[#8e8e93] text-sm font-semibold rounded-full active:scale-95 transition-transform"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center pt-24 px-6 relative z-10">
        
        {/* Título: SuperNoir */}
        <h1 
          className="text-5xl font-extrabold tracking-tighter mb-2 pb-1"
          style={{
            background: "linear-gradient(to right, #ffffff 0%, #c7c7cc 40%, #3a3a3c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}
        >
          SuperNoir
        </h1>
        
        <p className="text-[17px] font-medium text-[#8e8e93] mb-10">
          Unlock advanced capabilities
        </p>

        {/* Cuadros Comparativos */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-10">
          
          {/* Tarjeta Free */}
          <div className="bg-[#111111] border border-[#1c1c1e] rounded-[24px] p-5 flex flex-col items-center text-center shadow-lg">
            <div className="text-[32px] mb-3 leading-none">🤍</div>
            <h3 className="text-white font-bold text-[17px] mb-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Basic</h3>
            <p className="text-[#8e8e93] text-[13px] leading-[1.4] font-medium">Standard limits, 2 daily tasks & basic models.</p>
          </div>

          {/* Tarjeta Premium */}
          <div className="bg-[#1c1c1e] border border-[#ff6a00]/40 rounded-[24px] p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(255,106,0,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#ff6a00]/10 to-transparent pointer-events-none" />
            <div className="text-[32px] mb-3 leading-none relative z-10">✦</div>
            <h3 className="text-white font-bold text-[17px] mb-2 relative z-10" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>SuperNoir</h3>
            <p className="text-[#e5e5ea] text-[13px] leading-[1.4] font-medium relative z-10">Noir 3, DeepSearch & up to 10 active tasks.</p>
          </div>

        </div>

        {/* Upgrade Button */}
        <button
          onClick={subscribe}
          disabled={isLoading || isPremium}
          className="w-full max-w-sm py-[18px] shimmer-btn relative overflow-hidden bg-[#ff6a00] hover:bg-[#ff7a1a] text-white font-bold text-[17px] rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-[0_0_20px_rgba(255,106,0,0.3)]"
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
        <div className="flex flex-col items-center gap-2 mt-auto pb-8">
          <div className="flex items-center gap-2 text-[11px] text-[#555558] font-medium">
            <button className="hover:text-[#8e8e93]">Terms & Conditions</button>
            <span>|</span>
            <button className="hover:text-[#8e8e93]">Privacy Policy</button>
          </div>
        </div>

      </div>
    </div>
  )
}
