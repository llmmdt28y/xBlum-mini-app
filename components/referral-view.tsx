"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Copy, Users } from "lucide-react"
import { useState } from "react"

export function ReferralView() {
  const { t, setCurrentView, referralLink } = useApp()
  const [copied, setCopied] = useState(false)
  const [referrals] = useState<{ name: string; date: string }[]>([])

  const BOT = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "xBlumAI"
  const link = referralLink || `https://t.me/${BOT}?start=ref`

  function handleInvite() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    const shareText = "Join xBlum AI and get free tokens! Generate amazing AI images and chat with the smartest AI."
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`
    tg?.openTelegramLink(shareUrl)
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
    <div className="flex-1 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => setCurrentView("store")}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">Referral Program</h2>
      </div>

      <div className="px-4 pt-6 pb-8 space-y-6">
        {/* Sticker and Title */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/referral-sticker.webp"
            alt="Referral Program"
            className="w-32 h-32 object-contain mb-4 rounded-2xl"
          />
          <h1 className="text-2xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-neutral-400 text-sm">
            Invite friends and earn free rewards
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-neutral-900 rounded-2xl p-4 space-y-4">
          {/* Benefit 1 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <img
                src="/referral-commission.png"
                alt="Commission"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Earn commissions</p>
              <p className="text-sky-400 text-xs mt-0.5">
                Get 80% of the payments which will be added directly to your wallet
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <img
                src="/referral-pro.png"
                alt="Pro"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Get xBlum Pro Free</p>
              <p className="text-sky-400 text-xs mt-0.5">
                Get a 3-day Free subscription to xBlum Pro if your friend buys a subscription
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <img
                src="/referral-tokens.png"
                alt="Tokens"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Earn 20 tokens for each referred user</p>
              <p className="text-sky-400 text-xs mt-0.5">
                Tokens are added automatically when your friend joins
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleInvite}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              Invite Friend
            </button>
            <button
              onClick={handleCopyLink}
              className="w-14 h-12 bg-sky-500/30 hover:bg-sky-500/50 rounded-xl flex items-center justify-center transition-colors"
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
          <p className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-2">
            REFERRALS: {referrals.length}
          </p>
          <div className="bg-neutral-900 rounded-2xl p-4">
            {referrals.length === 0 ? (
              <p className="text-neutral-500 text-center text-sm py-4">
                No referral earnings yet
              </p>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{ref.name}</p>
                      <p className="text-neutral-500 text-xs">{ref.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
