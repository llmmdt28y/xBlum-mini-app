"use client"

import { useApp } from "@/lib/app-context"
import { ChevronLeft, Gift, MessageCirclePlus, Share2, Users, Check, Zap, ImageIcon } from "lucide-react"
import { TelegramStar } from "./icons/telegram-star"
import { useState } from "react"

const IMAGE_PACKAGES = [
  { id: "img_s",  images: 5,   stars: 80,   bonus: null,  popular: false },
  { id: "img_m",  images: 15,  stars: 200,  bonus: null,  popular: true  },
  { id: "img_l",  images: 45,  stars: 500,  bonus: "+5",  popular: false },
  { id: "img_xl", images: 120, stars: 1200, bonus: "+20", popular: false },
]

export function StoreView() {
  const { t, setCurrentView, imageTokens } = useApp()
  const [claimed, setClaimed] = useState<string[]>([])

  const missions = [
    { id:"daily",  icon:Gift,             title:t("dailyTokens"),    imgs:2,  color:"bg-amber-500/20 text-amber-400" },
    { id:"chat",   icon:MessageCirclePlus, title:t("addToChat"),      imgs:5,  color:"bg-blue-500/20 text-blue-400" },
    { id:"share",  icon:Share2,            title:t("shareToFriend"),  imgs:3,  color:"bg-emerald-500/20 text-emerald-400" },
    { id:"ref",    icon:Users,             title:t("referral"),       imgs:5,  color:"bg-purple-500/20 text-purple-400" },
  ]

  const buyPackage = (pkgId: string) => {
    try {
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "buy_image_tokens", package_id: pkgId }))
    } catch {}
  }

  const claimMission = (id: string, imgs: number) => {
    if (claimed.includes(id)) return
    setClaimed(p => [...p, id])
    try {
      window.Telegram?.WebApp?.sendData(JSON.stringify({ action: "claim_mission", mission_id: id, image_amount: imgs }))
    } catch {}
  }

  return (
    <div className="flex-1 bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-neutral-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setCurrentView("home")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-semibold text-white">Store</h2>
      </div>

      <div className="p-4 space-y-6">

        {/* Balance */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-4 h-4 text-purple-200" />
            <p className="text-purple-100 text-sm font-medium">{t("imageTokens")}</p>
          </div>
          <p className="text-4xl font-bold">{imageTokens}</p>
          <p className="text-purple-200 text-xs mt-1">1 token = 1 AI-generated image</p>
        </div>

        {/* Chat is free notice */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-base">💬</span>
          </div>
          <div>
            <p className="text-blue-300 font-medium text-sm">Chat is always free</p>
            <p className="text-neutral-500 text-xs mt-0.5">
              AI chat has no token cost — just hourly limits. Tokens here are only for generating images.
            </p>
          </div>
        </div>

        {/* Image packages */}
        <div>
          <h3 className="font-semibold text-white mb-3">Buy Image Tokens</h3>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => buyPackage(pkg.id)}
                className={`relative p-4 rounded-2xl text-left transition-all active:scale-95 ${
                  pkg.popular
                    ? "bg-purple-500/10 border-2 border-purple-500"
                    : "bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2 right-3 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    {t("popular")}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-xl text-white">{pkg.images}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2.5">
                  images{pkg.bonus && <span className="text-emerald-400 font-medium"> {pkg.bonus}</span>}
                </p>
                <div className="flex items-center gap-1">
                  <TelegramStar className="w-4 h-4" />
                  <span className="text-amber-400 font-semibold text-sm">{pkg.stars}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Premium upsell */}
        <button
          onClick={() => setCurrentView("premium")}
          className="w-full p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-between hover:border-neutral-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{t("getXBlumPro")}</p>
              <p className="text-neutral-400 text-xs mt-0.5">From 800 ⭐ · includes image tokens monthly</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-neutral-500 rotate-180" />
        </button>

        {/* Missions */}
        <div>
          <h3 className="font-semibold text-white mb-3">{t("missions")}</h3>
          <div className="space-y-2">
            {missions.map(m => (
              <div key={m.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color}`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{m.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ImageIcon className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400 font-medium">+{m.imgs} image tokens</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => claimMission(m.id, m.imgs)}
                  disabled={claimed.includes(m.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    claimed.includes(m.id)
                      ? "bg-neutral-800 text-neutral-500"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {claimed.includes(m.id)
                    ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />{t("claimed")}</span>
                    : t("claim")}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
