"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useApp } from "@/lib/app-context"

const imageProtectionStyle = {
  WebkitTouchCallout: "none" as const,
  WebkitUserSelect: "none" as const,
  KhtmlUserSelect: "none" as const,
  MozUserSelect: "none" as const,
  msUserSelect: "none" as const,
  userSelect: "none" as const,
};

const AnimatedIcon = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (imgRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
             canvas.width = imgRef.current.naturalWidth;
             canvas.height = imgRef.current.naturalHeight;
             ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
          }
          setIsPlaying(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, key]);

  return (
    <div 
      onClick={() => { if (!isPlaying) { setKey(k => k + 1); setIsPlaying(true); } }} 
      className={`relative cursor-pointer transition-transform active:scale-90 ${className}`}
    >
      <img
        ref={imgRef}
        src={`${src}?t=${key}`}
        alt={alt}
        className={`w-full h-full object-contain pointer-events-none select-none ${!isPlaying ? 'opacity-0' : 'opacity-100'}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        crossOrigin="anonymous"
        style={imageProtectionStyle}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

const SlidingNumber = ({ value }: { value: number }) => {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex">
      {str.split('').map((char, index) => (
        <span key={`${index}-${char}`} className="inline-block animate-[slideDownDigit_0.25s_ease-out]">
          {char}
        </span>
      ))}
    </div>
  );
};

export function PremiumView() {
  const { setCurrentView, isPremium, openInvoice } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() => 4 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timerValues = {
    days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeLeft / 1000 / 60) % 60),
    seconds: Math.floor((timeLeft / 1000) % 60),
  };

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
    <div className="flex-1 min-h-screen flex flex-col bg-[#000000] fixed top-0 left-0 w-full h-full z-[70] overflow-hidden text-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>
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
        @keyframes slideDownDigit {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="flex-1 flex flex-col items-center pt-[calc(var(--tg-safe-area-inset-top,24px)+24px)] px-4 relative z-10 overflow-hidden pb-6">
        
        {/* Título: SuperNoir */}
        <div className="h-[64px] mb-8 mt-4 flex items-center justify-center relative w-full pointer-events-none z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120px]">
            <Image 
              src="/SuperNoir-subscription-banner.png" 
              alt="SuperNoir" 
              width={350}
              height={120}
              className="h-full w-auto pointer-events-none select-none" 
              style={{ maxWidth: "none", ...imageProtectionStyle }}
              draggable={false} 
              onContextMenu={(e) => e.preventDefault()} 
            />
          </div>
        </div>

        {/* Timer Container */}
        <div className="flex items-center justify-center mb-6 w-full max-w-md shrink-0">
          <div className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-[16px] border-[1.5px] border-dashed border-[#ff6a00]/60 bg-[#ff6a00]/5 text-[#ff6a00] font-bold tracking-widest text-[15px]" style={{ fontFamily: "SF Pro Display, -apple-system, sans-serif" }}>
            <span className="text-white/80 text-[13px] font-semibold mr-1 tracking-normal">Offer ends in:</span>
            <SlidingNumber value={timerValues.days} /><span className="text-[13px] text-[#ff6a00]/70 ml-[1px] -mr-[1px]">d</span><span className="mx-1 opacity-50 text-[#ff6a00]">:</span>
            <SlidingNumber value={timerValues.hours} /><span className="text-[13px] text-[#ff6a00]/70 ml-[1px] -mr-[1px]">h</span><span className="mx-1 opacity-50 text-[#ff6a00]">:</span>
            <SlidingNumber value={timerValues.minutes} /><span className="text-[13px] text-[#ff6a00]/70 ml-[1px] -mr-[1px]">m</span><span className="mx-1 opacity-50 text-[#ff6a00]">:</span>
            <SlidingNumber value={timerValues.seconds} /><span className="text-[13px] text-[#ff6a00]/70 ml-[1px] -mr-[1px]">s</span>
          </div>
        </div>

        {/* Cuadros Comparativos Scrollables */}
        <div className="w-full max-w-md flex-1 overflow-y-auto no-scrollbar relative z-10 mb-4 mask-image-bottom">
           <style>{`
             .mask-image-bottom {
               mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
               -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
             }
           `}</style>
          <div className="grid grid-cols-2 gap-2 pb-[30px]">
          
          {/* Columna Free */}
          <div className="flex flex-col mt-[2px]">
            <div className="flex items-center justify-center h-[50px] text-[#8e8e93] font-bold text-[17px] tracking-wide" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>
              Free
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-[#1c1c1e] h-[145px]">
              <AnimatedIcon src="/memo.webp" alt="Memo" className="w-[36px] h-[36px] mb-2 drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Basic Features</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Standard access to core tools and stable AI models.</p>
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-[#1c1c1e] h-[145px]">
              <AnimatedIcon src="/search.webp" alt="Search" className="w-[36px] h-[36px] mb-2 drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Standard Search</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Basic web search for everyday questions.</p>
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-[#1c1c1e] h-[145px]">
              <AnimatedIcon src="/hourglass.webp" alt="Limits" className="w-[36px] h-[36px] mb-2 drop-shadow-md" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Standard Limits</h3>
              <p className="text-[#8e8e93] text-[13px] leading-snug font-medium">Fewer limits & up to 5 active tasks.</p>
            </div>
          </div>

          {/* Columna Premium (SuperNoir) */}
          <div className="flex flex-col border-[2px] border-[#ff6a00] rounded-[24px] bg-[#111111] shadow-[0_0_20px_rgba(255,106,0,0.15)] overflow-hidden">
            <div className="bg-[#ff6a00] flex items-center justify-center h-[50px]">
              <span className="text-white font-bold text-[17px] tracking-wide" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>SuperNoir</span>
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-transparent h-[145px]">
              <AnimatedIcon src="/robot.webp" alt="Autonomous AI" className="w-[36px] h-[36px] mb-2 drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Beta Access</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Early access to experimental tools, beta features & latest models.</p>
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-[#ff6a00]/30 h-[145px]">
              <AnimatedIcon src="/lightning.webp" alt="Lightning" className="w-[36px] h-[36px] mb-2 drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>DeepSearch</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Advanced reasoning and deep thinking tools.</p>
            </div>
            
            <div className="flex flex-col items-center justify-start text-center p-3 border-t border-[#ff6a00]/30 h-[145px]">
              <AnimatedIcon src="/rocket.webp" alt="Rocket" className="w-[36px] h-[36px] mb-2 drop-shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <h3 className="text-white font-bold text-[15px] mb-1.5 leading-tight" style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif" }}>Increased Limits</h3>
              <p className="text-[#e5e5ea] text-[13px] leading-snug font-medium">Higher limits & up to 15 active tasks.</p>
            </div>
          </div>

          </div>
        </div>

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
          ) : timeLeft > 0 ? (
            <span className="relative z-10 text-[19px] font-extrabold tracking-tight">Claim 1 Month for Free</span>
          ) : (
            <div className="flex items-center justify-center gap-1.5 relative z-10">
              <span className="leading-none mt-[1px]">Subscribe for</span>
              <Image src="/telegram-star-icon.png" alt="Star" width={18} height={18} className="object-contain -mt-[1px] pointer-events-none select-none" style={{ filter: "brightness(0) invert(1)" }} draggable={false} onContextMenu={(e) => e.preventDefault()} />
              <span className="leading-none mt-[1px]">850</span>
            </div>
          )}
        </button>

      </div>
    </div>
  )
}
