"use client"

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from "react"

// Se ha simplificado para dejar solo inglés
export type Language  = "en"
export type ModelName = "Grok 4" | "Grok 4 Mini" | "GPT-5.4" | "GPT-5.2"
export type View      = "home" | "settings" | "store" | "premium" | "referral" | "analytics" | "profile" | "x-rewards"

export type UserPreferences = {
  name: string; age: string; location: string; preferences: string
}

export type AppState = {
  tokens: number            
  x_points: number          
  isPremium: boolean
  language: Language
  selectedModel: ModelName
  userPreferences: UserPreferences
  currentView: View
  userId: number | null
  botUsername: string
  isThrottled: boolean
  throttleMinutes: number
  referralCode: string
  referralLink: string
  referralCount: number
  personalizeMemories: boolean
  isLoading: boolean
  apiError: string
  completed_missions: string[]
  ads_today: number
  ads_max_daily: number
  image_used_today: number
  image_daily_limit: number
  my_rank_global: { rank: number; tp: number }
  my_rank_weekly: { rank: number; tp: number }
}

export type AppContextType = AppState & {
  setTokens: (n: number) => void
  addTokens: (n: number) => void
  setIsPremium: (b: boolean) => void
  setLanguage: (l: Language) => void
  setSelectedModel: (m: ModelName) => void
  setUserPreferences: (p: UserPreferences) => void
  setCurrentView: (v: View) => void
  sendToBot: (text: string) => Promise<void>
  sendChatMessage: (text: string) => Promise<void>
  openExploreTopic: (topicKey: string, text?: string) => Promise<void>
  openInvoice: (packageId: string) => Promise<void>
  claimMissionTokens: (mId: string, amount: number) => Promise<boolean>
  setPersonalizeMemories: (enabled: boolean) => Promise<void>
  deleteAllMemories: () => Promise<void>
  deleteAllHistory: () => Promise<void>
  submitFeedback: (type: string, desc: string) => Promise<boolean>
  minutesUntilReset: number
  t: (key: string) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Mapa de traducciones simplificado (Solo Inglés)
const LANG_MAP: Record<Language, Record<string, string>> = {
  en: {
    poweredBy: "Powered by",
    howCanIHelp: "How can I help you today?",
    typeMessage: "Type a message...",
    createImage: "Create Image",
    getTokens: "Get $X",
    addToChat: "Add to Chat",
    throttleActive: "Cooldown Active",
    throttleDesc: "You are using Grok 4 Mini. High demand may limit speed.",
    min: "min",
    changeModel: "Change model",
    upgradePro: "Upgrade to Pro",
  }
}

function getTgUser() {
  if (typeof window === "undefined") return null
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0,
    x_points: 0,
    isPremium: false,
    language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home",
    userId: null,
    botUsername: "xBlumAI",
    isThrottled: false,
    throttleMinutes: 0,
    referralCode: "",
    referralLink: "",
    referralCount: 0,
    personalizeMemories: true,
    isLoading: true,
    apiError: "",
    completed_missions: [],
    ads_today: 0,
    ads_max_daily: 3,
    image_used_today: 0,
    image_daily_limit: 5,
    my_rank_global: { rank: 0, tp: 0 },
    my_rank_weekly: { rank: 0, tp: 0 },
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

  const apiCall = useCallback(async (endpoint: string, body: any) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      return await res.json()
    } catch (e) {
      console.error(`API Error [${endpoint}]:`, e)
      return { error: "Network error" }
    }
  }, [API_BASE])

  async function refreshUserData() {
    const user = getTgUser()
    if (!user) {
      setState(s => ({ ...s, isLoading: false }))
      return
    }
    try {
      const initData = (window as any).Telegram?.WebApp?.initData
      const data = await apiCall("/api/status", { initData }) as any
      if (data && !data.error) {
        setState(s => ({
          ...s,
          userId:          data.user_id,
          x_points:        data.x_points,
          isPremium:       data.is_premium,
          selectedModel:   data.selected_model,
          personalizeMemories: data.personalize_memories,
          isThrottled:     data.is_throttled,
          throttleMinutes: data.throttle_mins,
          referralCode:    data.referral_code,
          referralLink:    data.referral_link,
          referralCount:   data.referral_count,
          completed_missions: data.completed_missions,
          ads_today:       data.ads_today,
          image_used_today: data.image_used_today,
          image_daily_limit: data.image_daily_limit,
          my_rank_global:  data.my_rank_global,
          my_rank_weekly:  data.my_rank_weekly,
        }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setState(s => ({ ...s, isLoading: false }))
    }
  }

  useEffect(() => {
    refreshUserData()
  }, [])

  const setSelectedModel = async (m: ModelName) => {
    setState(s => ({ ...s, selectedModel: m }))
    await apiCall("/api/set_model", { initData: (window as any).Telegram?.WebApp?.initData, model: m })
  }

  const setPersonalizeMemories = async (enabled: boolean) => {
    setState(s => ({ ...s, personalizeMemories: enabled }))
    await apiCall("/api/set_personalize_memories", { initData: (window as any).Telegram?.WebApp?.initData, enabled })
  }

  const deleteAllMemories = async () => {
    await apiCall("/api/delete_memories", { initData: (window as any).Telegram?.WebApp?.initData })
  }

  const deleteAllHistory = async () => {
    await apiCall("/api/delete_history", { initData: (window as any).Telegram?.WebApp?.initData })
  }

  const claimMissionTokens = async (mission_id: string, amount: number) => {
    const data = await apiCall("/api/claim_mission", {
      initData: (window as any).Telegram?.WebApp?.initData,
      mission_id
    }) as any
    if (data.ok) {
      setState(s => ({
        ...s,
        x_points: data.x_points,
        completed_missions: [...s.completed_missions, mission_id]
      }))
      return true
    }
    return false
  }

  const openInvoice = async (package_id: string) => {
    const data = await apiCall("/api/get_invoice_link", {
      initData: (window as any).Telegram?.WebApp?.initData,
      package_id
    }) as any
    if (data.ok && data.invoice_link) {
      (window as any).Telegram?.WebApp?.openInvoice(data.invoice_link)
    }
  }

  const sendToBot = async (text: string) => {
    (window as any).Telegram?.WebApp?.sendData(text)
  }

  const sendChatMessage = async (text: string) => {
    await apiCall("/api/chat_message", { initData: (window as any).Telegram?.WebApp?.initData, text })
  }

  const openExploreTopic = async (topic_key: string, text?: string) => {
    await apiCall("/api/open_explore_topic", { initData: (window as any).Telegram?.WebApp?.initData, topic_key, text })
    try { (window as any).Telegram?.WebApp?.close() } catch (e) { console.error(e) }
  }

  async function submitFeedback(type: string, description: string): Promise<boolean> {
    try {
      const data = await apiCall("/api/submit_feedback", { feedback_type: type, description }) as { ok?: boolean }
      return data.ok !== false
    } catch (e) { console.error(e); return false }
  }

  function t(key: string): string {
    return LANG_MAP[state.language]?.[key] ?? key
  }

  const value: AppContextType = {
    ...state,
    setTokens:              n => setState(s => ({ ...s, tokens: n, x_points: n })),
    addTokens:              n => setState(s => ({ ...s, tokens: s.tokens + n, x_points: s.x_points + n })),
    setIsPremium:           b => setState(s => ({ ...s, isPremium: b })),
    setLanguage:            l => setState(s => ({ ...s, language: l })),
    setSelectedModel,
    setUserPreferences:     p => setState(s => ({ ...s, userPreferences: p })),
    setCurrentView:         v => setState(s => ({ ...s, currentView: v })),
    sendToBot,
    sendChatMessage,
    openExploreTopic,
    openInvoice,
    claimMissionTokens,
    setPersonalizeMemories,
    deleteAllMemories,
    deleteAllHistory,
    submitFeedback,
    minutesUntilReset: state.throttleMinutes,
    t,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
