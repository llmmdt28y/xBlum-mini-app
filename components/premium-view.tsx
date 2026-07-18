"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Check, Gift, Sparkles, Bot, Blocks, Zap, Shield, BarChart, Calendar } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const imageProtectionStyle = {
  WebkitTouchCallout: "none" as const,
  WebkitUserSelect: "none" as const,
  KhtmlUserSelect: "none" as const,
  MozUserSelect: "none" as const,
  msUserSelect: "none" as const,
  userSelect: "none" as const,
}

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<"lite" | "heavy">("heavy")
  const [selectedPlan, setSelectedPlan] = useState<"1m" | "3m" | "1y">("1m")

  const pricing = {
    lite: { "1m": 450, "3m": 1200, "1y": 4500 },
    heavy: { "1m": 950, "3m": 2500, "1y": 8900 }
  }

  const discount3m = Math.round(100 - (pricing[selectedTier]["3m"] / (pricing[selectedTier]["1m"] * 3)) * 100)
  const discount1y = Math.round(100 - (pricing[selectedTier]["1y"] / (pricing[selectedTier]["1m"] * 12)) * 100)

  // Telegram BackButton
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
    return () => { tg.BackButton.offClick(handleBack) }
  }, [setCurrentView])

  async function subscribe() {
    setIsLoading(true)
    try {
      await openInvoice(`premium_${selectedPlan}`)
    } catch (e) {
      console.error("[Subscribe]", e)
    } finally {
      setIsLoading(false)
    }
  }

  const isHeavy = selectedTier === "heavy";
  const accentColor = isHeavy ? "#f97316" : "#6a5acd"; // Orange for Heavy, Slate Blue for Lite

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-[#000000] fixed top-0 left-0 w-full h-full z-[70] overflow-y-auto overscroll-none text-white pb-32" style={{ fontFamily: SFD }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes border-glow {
          0% { box-shadow: 0 0 0px transparent; }
          50% { box-shadow: 0 0 15px ${accentColor}50; }
          100% { box-shadow: 0 0 0px transparent; }
        }
        .active-plan-card {
          border-color: ${accentColor};
          background: linear-gradient(180deg, ${accentColor}15 0%, transparent 100%);
          animation: border-glow 3s infinite;
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-150%) skewX(-15deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(150%) skewX(-15deg); opacity: 0; }
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 200%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer-sweep 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
          pointer-events: none;
          opacity: 0;
        }
        @keyframes btn-border-glow {
          0% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.4); border-color: rgba(255,255,255,0.8); }
          100% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.05); }
        }
        .btn-shimmer {
          animation: btn-border-glow 1.2s 0.5s forwards;
        }
        @keyframes icon-slide-out {
          0% { transform: translateX(14px); opacity: 0; }
          100% { transform: translateX(0); opacity: 0.9; }
        }
        .animate-icon-slide {
          animation: icon-slide-out 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        .check-enter {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
        }
      `}</style>

      <div className="flex-1 flex flex-col pt-[calc(var(--tg-safe-area-inset-top,24px)+16px)] px-4">
        
        {/* TOP TOGGLE */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1c1c1e] p-[2px] rounded-full flex items-center relative w-[180px]">
            {/* Sliding Pill Background */}
            <div 
               className="absolute top-[2px] bottom-[2px] w-[88px] rounded-full transition-all duration-500 shadow-sm"
               style={{
                 transform: isHeavy ? "translateX(88px)" : "translateX(0px)",
                 backgroundColor: isHeavy ? "rgba(249, 115, 22, 0.25)" : "rgba(106, 90, 205, 0.25)",
                 transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)"
               }}
            />
            <button
              onClick={() => setSelectedTier("lite")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[14px] font-semibold transition-colors duration-300 z-10 ${!isHeavy ? "text-[#a3b1ff]" : "text-[#8e8e93]"}`}
            >
              Lite
            </button>
            <button
              onClick={() => setSelectedTier("heavy")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-[14px] font-semibold transition-colors duration-300 z-10 ${isHeavy ? "text-[#ff964f]" : "text-[#8e8e93]"}`}
            >
              Heavy
            </button>
          </div>
        </div>

        {/* AI MODELS */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex-1 pr-2">
            <h2 className="text-[17px] font-bold tracking-tight mb-0.5">Unlock exclusive AI models</h2>
            <p className="text-[#8e8e93] text-[13px] font-medium" style={{ fontFamily: SF }}>Grok 4.5, Gpt 5, Deepseek V4 Pro</p>
          </div>
          <div className="flex shrink-0 items-center">
            {/* ChatGPT (Background, Left) */}
            <div className="w-10 h-10 rounded-[12px] bg-[#1c1c1e] flex items-center justify-center z-10 relative overflow-hidden border-[1.5px] border-[#2c2c2e] opacity-90 animate-icon-slide">
              <img src="/chatgpt-icon.png" alt="ChatGPT" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()} style={imageProtectionStyle} />
            </div>
            {/* Grok (Foreground, Right) */}
            <div className="w-11 h-11 rounded-[14px] bg-[#000] flex items-center justify-center shadow-[-4px_0_15px_rgba(0,0,0,0.6)] z-20 relative overflow-hidden border-[2px] border-black -ml-4">
              <img src="/grok-icon.png" alt="Grok" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()} style={imageProtectionStyle} />
            </div>
          </div>
        </div>

        {/* UNLIMITED MANAGEMENT BLOCK */}
        <div className="bg-[#111111] rounded-[20px] py-4 px-4 mb-5 shadow-md border border-white/5">
          <div className="flex items-center gap-1.5 mb-1.5 mt-[-2px]">
            <img src="/noir-originalogo.png" alt="Noir" className="w-[18px] h-[18px] object-contain select-none pointer-events-none drop-shadow-md" draggable={false} style={imageProtectionStyle} />
            <p className="text-[16px] font-bold tracking-tight text-white leading-none">Noir</p>
          </div>
          <p className="text-[13px] font-medium mb-4 tracking-tight text-[#8e8e93] leading-snug" style={{ fontFamily: SF }}>
            {isHeavy ? "Ultimate frontier models with uncompromised limits and maximum priority." : "Frontier models & smart workflows with extended benefits."}
          </p>
          <div className="flex flex-col gap-y-3.5">
            {!isHeavy ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <span className="text-[13px]">💬</span>
                  </div>
                  <span className="font-semibold text-[14px]">2x longer conversations in Chat</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Higher <span className="text-[#8e8e93] font-medium">skills limits</span></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Calendar className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Higher <span className="text-[#8e8e93] font-medium">schedules limits</span></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Bot className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Agent mode with deep research</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Blocks className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">1000+ app integrations</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-0.5 mt-[-4px]">
                  <span className="text-[13px] font-semibold text-[#8e8e93]" style={{ fontFamily: SF }}>Everything in Lite, plus:</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Zap className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Lightning-fast replies</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Access our latest, best models</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <Gift className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-[14px]">Early Access to advanced Noir features</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center shadow-sm">
                    <span className="text-[13px]">💬</span>
                  </div>
                  <span className="font-semibold text-[14px]">5x longer conversations in Chat</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PRICING SELECTOR */}
        <div className="grid grid-cols-3 gap-2.5">
          
          {/* 1 Month */}
          <div className="relative">
            <div 
              onClick={() => setSelectedPlan("1m")}
              className={`relative rounded-[20px] p-2.5 cursor-pointer transition-all flex flex-col justify-end min-h-[90px] shadow-md border-[1.5px] ${selectedPlan === "1m" ? "active-plan-card" : "border-transparent bg-[#111111]"}`}
            >
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 px-2.5 py-[3px] rounded-full text-[9px] font-extrabold tracking-widest uppercase shadow-sm whitespace-nowrap" style={{ backgroundColor: accentColor, color: "#fff" }}>
                Best Choice
              </div>
              <h3 className="font-bold text-[14px] leading-tight mb-2" style={{ fontFamily: SF }}>1 month</h3>
              <p className="font-bold text-[20px] mb-1 leading-none tracking-tight flex items-center gap-1">
                <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain brightness-0 invert select-none pointer-events-none mt-[-2px]" draggable={false} style={imageProtectionStyle} />
                {pricing[selectedTier]["1m"].toLocaleString()}
              </p>
            </div>
            <div className={`absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-md z-10 check-enter ${selectedPlan === "1m" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"}`} style={{ backgroundColor: accentColor }}>
              <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
            </div>
          </div>

          {/* 3 Months */}
          <div className="relative">
            <div 
              onClick={() => setSelectedPlan("3m")}
              className={`relative rounded-[20px] p-2.5 cursor-pointer transition-all overflow-hidden flex flex-col justify-end min-h-[90px] shadow-md border-[1.5px] ${selectedPlan === "3m" ? "active-plan-card" : "border-transparent bg-[#111111]"}`}
            >
              <h3 className="font-bold text-[14px] leading-tight mb-2" style={{ fontFamily: SF }}>3 months</h3>
              <p className="font-bold text-[20px] mb-1 leading-none tracking-tight flex items-center gap-1">
                <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain brightness-0 invert select-none pointer-events-none mt-[-2px]" draggable={false} style={imageProtectionStyle} />
                {pricing[selectedTier]["3m"].toLocaleString()}
              </p>
              <div className="absolute -right-7 bottom-2.5 bg-[#ff3b30] text-white text-[9px] font-bold px-8 py-[2px] rotate-[-45deg] shadow-lg tracking-wider">
                -{discount3m}%
              </div>
            </div>
            <div className={`absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-md z-10 check-enter ${selectedPlan === "3m" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"}`} style={{ backgroundColor: accentColor }}>
              <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
            </div>
          </div>

          {/* 1 Year */}
          <div className="relative">
            <div 
              onClick={() => setSelectedPlan("1y")}
              className={`relative rounded-[20px] p-2.5 cursor-pointer transition-all overflow-hidden flex flex-col justify-end min-h-[90px] shadow-md border-[1.5px] ${selectedPlan === "1y" ? "active-plan-card" : "border-transparent bg-[#111111]"}`}
            >
              <h3 className="font-bold text-[14px] leading-tight mb-2" style={{ fontFamily: SF }}>1 year</h3>
              <p className="font-bold text-[20px] mb-1 leading-none tracking-tight flex items-center gap-1">
                <img src="/telegram-star-icon.png" alt="Stars" className="w-[18px] h-[18px] object-contain brightness-0 invert select-none pointer-events-none mt-[-2px]" draggable={false} style={imageProtectionStyle} />
                {pricing[selectedTier]["1y"].toLocaleString()}
              </p>
              <div className="absolute -right-7 bottom-2.5 bg-[#ff3b30] text-white text-[9px] font-bold px-8 py-[2px] rotate-[-45deg] shadow-lg tracking-wider">
                -{discount1y}%
              </div>
            </div>
            <div className={`absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-md z-10 check-enter ${selectedPlan === "1y" ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"}`} style={{ backgroundColor: accentColor }}>
              <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
            </div>
          </div>
        </div>

      </div>

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 left-0 w-full px-4 pt-4 pb-[calc(var(--tg-safe-area-inset-bottom,24px)+12px)] bg-[#000000]/95 backdrop-blur-md border-t border-white/5 z-20">
        <div className="flex items-center gap-2.5 w-full mb-3">
          <button className="flex-1 py-[15px] rounded-full bg-[#1c1c1e] active:bg-[#2c2c2e] transition-colors flex items-center justify-center gap-2 shadow-sm border border-white/5">
            <Gift className="w-[18px] h-[18px]" />
            <span className="font-semibold text-[15px]" style={{ fontFamily: SF }}>Gift to Friends</span>
          </button>
          
          <button 
            onClick={subscribe}
            disabled={isLoading || isPremium}
            className="relative overflow-hidden flex-[1.2] py-[15px] rounded-full transition-all text-white font-bold text-[16px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] btn-shimmer border border-white/10"
            style={{ backgroundColor: accentColor }}
          >
            {isPremium ? "SuperNoir Active" : isLoading ? "Processing..." : "Subscribe Now"}
          </button>
        </div>
        <div className="flex justify-center items-center text-[#8e8e93] text-[12px] font-medium pb-1" style={{ fontFamily: SF }}>
          <img src="/telegram-star-icon.png" alt="Stars" className="w-[14px] h-[14px] object-contain select-none pointer-events-none opacity-80 mr-[3px] mt-[-2.5px]" draggable={false} style={imageProtectionStyle} />
          <span>Pay with Telegram Stars</span>
        </div>
      </div>

    </div>
  )
}
