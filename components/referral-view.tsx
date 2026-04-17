"use client"

import { useApp } from "@/lib/app-context"
import { Copy, Users } from "lucide-react"
import { useState, useEffect } from "react"

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

export function ReferralView() {
  const { setCurrentView, referralLink, referralCount } = useApp()
  const [copied, setCopied] = useState(false)

  const BOT = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"
  const link = referralLink || `https://t.me/${BOT}?start=ref`

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

  function handleInvite() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    const shareText = "Join xBlum AI and get free tokens! Generate amazing AI images and chat with the smartest AI."
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl)
    } else {
      window.open(shareUrl, "_blank")
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tg = (window as any).Telegram?.WebApp
      tg?.showAlert("Link: " + link)
    })
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* ── Header Centrado Exacto ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <h2
          className="font-semibold text-white"
          style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}
        >
          Referral Program
        </h2>
      </div>

      {/* Contenedor principal */}
      <div className="px-4 pt-6 pb-28 space-y-6">
        
        {/* Sticker and Title */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/referral-icon.webp"
            alt="Referral Program"
            draggable={false}
            className="w-32 h-32 object-contain mb-4 rounded-2xl pointer-events-none select-none"
          />
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: SFD }}>
            Referral Program
          </h1>
          <p className="text-neutral-400 text-sm" style={{ fontFamily: SF }}>
            Invite friends and earn free rewards
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-[#111] rounded-2xl p-4 space-y-4" style={{ border: "1px solid #1c1c1e" }}>
          
          {/* Benefit 1 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <img
                src="/referral-comission.webp"
                alt="Commission"
                draggable={false}
                className="w-6 h-6 object-contain pointer-events-none select-none"
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm" style={{ fontFamily: SF }}>Earn commissions</p>
              <p className="text-sky-400 text-xs mt-0.5" style={{ fontFamily: SF }}>
                Get 80% of the payments which will be added directly to your wallet
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <img
                src="/token-icon.png"
                alt="Pro"
                draggable={false}
                className="w-6 h-6 object-contain pointer-events-none select-none"
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm" style={{ fontFamily: SF }}>Get xBlum Pro Free</p>
              <p className="text-sky-400 text-xs mt-0.5" style={{ fontFamily: SF }}>
                Get a 3-day Free subscription to xBlum Pro if your friend buys a subscription
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <img
                src="/xblum2-icon.png"
                alt="Partners"
                draggable={false}
                className="w-6 h-6 object-contain pointer-events-none select-none"
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm" style={{ fontFamily: SF }}>
                Earn 50% from your friends
              </p>
              <p className="text-sky-400 text-xs mt-0.5" style={{ fontFamily: SF }}>
                Receive half of all $X points that your referred friends earn
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleInvite}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm active:scale-95"
              style={{ fontFamily: SF }}
            >
              Invite Friend
            </button>
            <button
              onClick={handleCopyLink}
              className="w-14 h-[44px] bg-sky-500/20 hover:bg-sky-500/30 rounded-xl flex items-center justify-center transition-colors active:scale-95"
            >
              {copied ? (
                <span className="text-sky-400 text-xs font-bold">OK</span>
              ) : (
                <Copy className="w-5 h-5 text-sky-400" />
              )}
            </button>
          </div>
        </div>

        {/* Referrals Counter */}
        <div>
          <p className="text-[#636366] text-xs font-semibold tracking-wider uppercase mb-2" style={{ fontFamily: SF }}>
            FRIENDS INVITED: {referralCount}
          </p>
          <div className="bg-[#111] rounded-2xl p-4" style={{ border: "1px solid #1c1c1e" }}>
            {referralCount === 0 ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <Users className="w-8 h-8 text-[#48484a]" />
                <p className="text-[#636366] text-center text-sm" style={{ fontFamily: SF }}>
                  Your circle is empty — invite friends to grow together!
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: SF }}>
                    {referralCount} friend{referralCount !== 1 ? "s" : ""} active
                  </p>
                  <p className="text-[#636366] text-xs" style={{ fontFamily: SF }}>
                    joined via your network
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
