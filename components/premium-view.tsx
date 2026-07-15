"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Check, Gift, MessageCircle, Image as ImageIcon, Video, Sparkles, Bot, Blocks } from "lucide-react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<"pro" | "promax">("promax")
  const [selectedPlan, setSelectedPlan] = useState<"1m" | "3m" | "1y">("1m")

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

  const isProMax = selectedTier === "promax";
  const accentColor = isProMax ? "#f97316" : "#8b5cf6"; // Orange for ProMax, Purple for Pro

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
      `}</style>

      <div className="flex-1 flex flex-col pt-[calc(var(--tg-safe-area-inset-top,24px)+16px)] px-4">
        
        {/* TOP TOGGLE */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1c1c1e] p-1 rounded-full flex items-center gap-1">
            <button
              onClick={() => setSelectedTier("pro")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${!isProMax ? "bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/30" : "text-[#8e8e93]"}`}
            >
              <span>😎</span> Pro
            </button>
            <button
              onClick={() => setSelectedTier("promax")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[15px] font-semibold transition-all duration-300 ${isProMax ? "bg-gradient-to-r from-[#f97316] to-[#ff4500] text-white shadow-md shadow-[#f97316]/30" : "text-[#8e8e93]"}`}
            >
              <span>🔥</span> Pro Max
            </button>
          </div>
        </div>

        {/* 3 CARDS GRID */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="p-1 flex flex-col items-center text-center justify-start h-full pt-2">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shadow-md mb-2">
              <Blocks className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[12px] font-medium leading-[1.2] text-[#e5e5ea]" style={{ fontFamily: SF }}>1000+ app<br/>integrations</p>
          </div>
          
          <div className="p-1 flex flex-col items-center text-center justify-start h-full pt-2">
            <div className="text-[32px] leading-none mb-1.5 drop-shadow-lg">🤖</div>
            <p className="text-[12px] font-medium leading-[1.2] text-[#e5e5ea]" style={{ fontFamily: SF }}>Scheduled tasks,<br/>autonomous<br/>work 24/7</p>
          </div>

          <div className="p-1 flex flex-col items-center text-center justify-start h-full pt-2">
            <div className="text-[32px] leading-none mb-1.5 drop-shadow-lg text-yellow-400">✨</div>
            <p className="text-[12px] font-medium leading-[1.2] text-[#e5e5ea]" style={{ fontFamily: SF }}>No watermarks.<br/>Less content<br/>moderation</p>
          </div>
        </div>

        {/* AI MODELS */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex-1 pr-2">
            <h2 className="text-[17px] font-bold tracking-tight mb-0.5">Professional AI models</h2>
            <p className="text-[#8e8e93] text-[13px] font-medium" style={{ fontFamily: SF }}>Claude Opus 4.8, GPT 5.5, Seedance 2.0</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-colors" style={{ backgroundColor: accentColor }}>
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* TOKENS BLOCK */}
        <div className="bg-[#111111] rounded-[24px] p-5 mb-6 border border-white/5 shadow-md">
          <p className="text-[#8e8e93] text-[11px] font-bold tracking-widest uppercase mb-1">For everyday AI work</p>
          <h2 className="text-[23px] font-bold mb-5 tracking-tight">2,000 tokens per month</h2>
          
          <p className="text-[#8e8e93] text-[12px] font-bold tracking-wider uppercase mb-2">Up to</p>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <div className="flex items-center gap-1.5">
              <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: accentColor }}>
                <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-semibold text-[15px]">1,000 <span className="text-[#8e8e93] font-medium">messages</span></span>
            </div>
            <span className="text-[#8e8e93] text-[13px]">or</span>
            <div className="flex items-center gap-1.5">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 transition-colors" style={{ color: accentColor }} />
              </div>
              <span className="font-semibold text-[15px]">60 <span className="text-[#8e8e93] font-medium">images</span></span>
            </div>
            <span className="text-[#8e8e93] text-[13px]">or</span>
            <div className="flex items-center gap-1.5">
              <div className="w-[26px] h-[26px] rounded-[8px] bg-[#2c2c2e] flex items-center justify-center">
                <Video className="w-4 h-4 transition-colors" style={{ color: accentColor }} />
              </div>
              <span className="font-semibold text-[15px]">10 <span className="text-[#8e8e93] font-medium">videos</span></span>
            </div>
          </div>
        </div>

        {/* PRICING SELECTOR */}
        <div className="grid grid-cols-3 gap-2.5">
          
          {/* 1 Month */}
          <div 
            onClick={() => setSelectedPlan("1m")}
            className={`relative rounded-2xl p-3.5 cursor-pointer transition-all border-[1.5px] flex flex-col justify-end min-h-[120px] shadow-md ${selectedPlan === "1m" ? "active-plan-card" : "border-[#1c1c1e] bg-[#111111] hover:border-white/10"}`}
          >
            <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 px-2.5 py-[3px] rounded-full text-[9px] font-extrabold tracking-widest uppercase shadow-sm whitespace-nowrap" style={{ backgroundColor: accentColor, color: "#fff" }}>
              Best Choice
            </div>
            {selectedPlan === "1m" && (
              <div className="absolute top-2.5 right-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: accentColor }}>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
              </div>
            )}
            <h3 className="font-bold text-[15px] leading-tight mb-1" style={{ fontFamily: SF }}>1 month</h3>
            <p className="font-bold text-[22px] mb-0.5 leading-none tracking-tight">$27</p>
            <p className="text-[12px] font-medium text-[#8e8e93] flex items-center gap-0.5" style={{ fontFamily: SF }}><span className="text-[10px]">★</span> 1,499</p>
          </div>

          {/* 3 Months */}
          <div 
            onClick={() => setSelectedPlan("3m")}
            className={`relative rounded-2xl p-3.5 cursor-pointer transition-all border-[1.5px] overflow-hidden flex flex-col justify-end min-h-[120px] shadow-md ${selectedPlan === "3m" ? "active-plan-card" : "border-[#1c1c1e] bg-[#111111] hover:border-white/10"}`}
          >
            {selectedPlan === "3m" && (
              <div className="absolute top-2.5 right-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: accentColor }}>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
              </div>
            )}
            <h3 className="font-bold text-[15px] leading-tight mb-1" style={{ fontFamily: SF }}>3 months</h3>
            <p className="font-bold text-[22px] mb-0.5 leading-none tracking-tight">$54</p>
            <p className="text-[12px] font-medium text-[#8e8e93] flex items-center gap-0.5" style={{ fontFamily: SF }}><span className="text-[10px]">★</span> 2,999</p>
            <div className="absolute -right-7 bottom-3 bg-[#ff3b30] text-white text-[10px] font-bold px-8 py-[2px] rotate-[-45deg] shadow-lg tracking-wider">
              -33%
            </div>
          </div>

          {/* 1 Year */}
          <div 
            onClick={() => setSelectedPlan("1y")}
            className={`relative rounded-2xl p-3.5 cursor-pointer transition-all border-[1.5px] overflow-hidden flex flex-col justify-end min-h-[120px] shadow-md ${selectedPlan === "1y" ? "active-plan-card" : "border-[#1c1c1e] bg-[#111111] hover:border-white/10"}`}
          >
            {selectedPlan === "1y" && (
              <div className="absolute top-2.5 right-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: accentColor }}>
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
              </div>
            )}
            <h3 className="font-bold text-[15px] leading-tight mb-1" style={{ fontFamily: SF }}>1 year</h3>
            <p className="font-bold text-[22px] mb-0.5 leading-none tracking-tight">$162</p>
            <p className="text-[12px] font-medium text-[#8e8e93] flex items-center gap-0.5" style={{ fontFamily: SF }}><span className="text-[10px]">★</span> 8,999</p>
            <div className="absolute -right-7 bottom-3 bg-[#ff3b30] text-white text-[10px] font-bold px-8 py-[2px] rotate-[-45deg] shadow-lg tracking-wider">
              -50%
            </div>
          </div>
          
        </div>

      </div>

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 left-0 w-full px-4 pt-4 pb-[calc(var(--tg-safe-area-inset-bottom,24px)+12px)] bg-[#000000]/95 backdrop-blur-md border-t border-white/5 z-20">
        <div className="flex items-center gap-2.5 w-full mb-3">
          <button className="flex-1 py-[15px] rounded-[18px] bg-[#1c1c1e] active:bg-[#2c2c2e] transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Gift className="w-[18px] h-[18px]" />
            <span className="font-semibold text-[15px]" style={{ fontFamily: SF }}>Gift to Friends</span>
          </button>
          
          <button 
            onClick={subscribe}
            disabled={isLoading || isPremium}
            className="flex-[1.2] py-[15px] rounded-[18px] transition-all text-white font-bold text-[16px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            {isPremium ? "SuperNoir Active" : isLoading ? "Processing..." : "Subscribe Now"}
          </button>
        </div>
        <div className="flex justify-center items-center gap-1.5 text-[#8e8e93] text-[12px] font-medium pb-1" style={{ fontFamily: SF }}>
          <span>Pay with Stars or</span>
          <span className="flex items-center"><span className="text-[14px] mr-1">💳</span> card</span>
        </div>
      </div>

    </div>
  )
}
