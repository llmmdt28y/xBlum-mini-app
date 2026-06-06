"use client"

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from "react"

// Se ha simplificado para dejar solo inglés
export type Language  = "en"
export type ModelName = "Grok 4.3" | "Gemini 3.5 Flash" | "Grok 4.1" | "GPT-5.4" | "GPT-5.2"
export type View      = "home" | "settings" | "store" | "premium" | "referral" | "profile" | "x-rewards" | "schedule" | "account_setup" | "additional_details" | "levels" | "shop" | "market" | "group_config"

export type UserPreferences = {
  name?: string
  age?: string
  location?: string
  preferences?: string
  // Extended profile fields (Account Setup)
  gender?: string
  city?: string
  timezone?: string
  occupation?: string
  interests?: string
  favoriteEmoji?: string
  personality?: string
}

// Token budget status per model — populated from /api/user_profile → model_token_status
export type ModelTokenInfo = {
  used:      number   // estimated tokens consumed in last 3h
  limit:     number   // 3h budget for this tier (free/premium)
  mins_left: number   // minutes until enough tokens expire
  pct:       number   // used/limit * 100, capped at 100
  reset_iso: string   // ISO timestamp of next reset
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
  selectedGroupId: number | null
  modelTokenStatus: Record<string, ModelTokenInfo> | null
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
  setSelectedGroupId: (id: number | null) => void
  refreshModelTokenStatus: () => Promise<void>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initDataUnsafe?.user
}

// Normalize legacy DB model names → current UI model names.
// Users who had "Grok 4" stored before the rename will resolve to "Grok 4.1".
function _normalizeModel(raw: string | undefined | null): ModelName {
  if (!raw || raw === "Grok 4" || raw === "Grok 4 Mini") return "Grok 4.3"
  const valid: ModelName[] = ["Grok 4.3", "Gemini 3.5 Flash", "Grok 4.1", "GPT-5.4", "GPT-5.2"]
  return valid.includes(raw as ModelName) ? (raw as ModelName) : "Grok 4.3"
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0,
    x_points: 0,
    isPremium: false,
    language: "en",
    selectedModel: "Grok 4.3",  // overwritten by API on first load
    userPreferences: {},
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
    selectedGroupId: null,
    modelTokenStatus: null,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initData = (window as any).Telegram?.WebApp?.initData
      const data = await apiCall("/api/status", { initData }) as any

      // If initData was not yet available when the call was made,
      // the server returns 401 — silently skip rather than overwrite state.
      if (data?.detail === "Invalid or missing initData" || data?.status === 401) {
        setState(s => ({ ...s, isLoading: false }))
        return
      }

      if (data && !data.error) {
        setState(s => ({
          ...s,
          userId:          data.user_id,
          x_points:        data.x_points,
          isPremium:       data.is_premium,
          selectedModel:   _normalizeModel(data.selected_model),
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
          // model_token_status: populated by /api/user_profile (refreshModelTokenStatus)
          // /api/status may also include it if backend adds it — map opportunistically
          ...(data.model_token_status ? { modelTokenStatus: data.model_token_status } : {}),
        }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setState(s => ({ ...s, isLoading: false }))
    }
  }

  useEffect(() => {
    // Telegram WebApp may not have injected initData yet on first render.
    // Wait for it to be ready before fetching user data.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg?.initData && tg.initData.length > 10) {
      // initData already available — call immediately
      refreshUserData()
    } else if (tg) {
      // Wait for the ready event, then retry
      const onReady = () => refreshUserData()
      tg.ready()
      // Telegram fires onEvent("viewportChanged") when fully loaded
      // but the safest cross-platform pattern is a short poll
      let attempts = 0
      const poll = setInterval(() => {
        attempts++
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (window as any).Telegram?.WebApp?.initData
        if ((data && data.length > 10) || attempts >= 20) {
          clearInterval(poll)
          refreshUserData()
        }
      }, 150)
    } else {
      // Not in Telegram context (dev/browser) — call directly
      refreshUserData()
    }
  }, [])

  const setSelectedModel = async (m: ModelName) => {
    // Optimistic update immediately
    setState(s => ({ ...s, selectedModel: m }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tgApp = (window as any).Telegram?.WebApp
    const result = await apiCall("/api/set_model", {
      initData: tgApp?.initData,
      userId:   tgApp?.initDataUnsafe?.user?.id,  // fallback identifier
      model:    m,
    }) as any
    if (!result?.ok) {
      // Server rejected — log but keep optimistic state since bot already has it
      console.warn("[setSelectedModel] Server response:", result)
    }
  }

  const setPersonalizeMemories = async (enabled: boolean) => {
    setState(s => ({ ...s, personalizeMemories: enabled }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiCall("/api/set_personalize_memories", { initData: (window as any).Telegram?.WebApp?.initData, enabled })
  }

  const deleteAllMemories = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiCall("/api/delete_memories", { initData: (window as any).Telegram?.WebApp?.initData })
  }

  const deleteAllHistory = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiCall("/api/delete_history", { initData: (window as any).Telegram?.WebApp?.initData })
  }

  const claimMissionTokens = async (mission_id: string, amount: number) => {
    const data = await apiCall("/api/claim_mission", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initData: (window as any).Telegram?.WebApp?.initData,
      package_id
    }) as any
    if (data.ok && data.invoice_link) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Telegram?.WebApp?.openInvoice(data.invoice_link)
    }
  }

  const sendToBot = async (text: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Telegram?.WebApp?.sendData(text)
  }

  const sendChatMessage = async (text: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiCall("/api/chat_message", { initData: (window as any).Telegram?.WebApp?.initData, text })
  }

  const openExploreTopic = async (topic_key: string, text?: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiCall("/api/open_explore_topic", { initData: (window as any).Telegram?.WebApp?.initData, topic_key, text })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { (window as any).Telegram?.WebApp?.close() } catch (e) { console.error(e) }
  }

  // Fetches the per-model token budget from /api/user_profile and updates state.
  // Called when the settings model-selector page opens so status is always fresh.
  const refreshModelTokenStatus = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initData = (window as any).Telegram?.WebApp?.initData
      const data = await apiCall("/api/model_token_status", { initData }) as any
      if (data?.ok && data?.models) {
        setState(s => ({ ...s, modelTokenStatus: data.models }))
      }
    } catch (e) {
      console.error("[refreshModelTokenStatus]", e)
    }
  }, [apiCall])

  async function submitFeedback(type: string, description: string): Promise<boolean> {
    try {
      const data = await apiCall("/api/submit_feedback", { feedback_type: type, description, initData: (window as any).Telegram?.WebApp?.initData }) as { ok?: boolean }
      return data.ok !== false
    } catch (e) { 
      console.error(e); 
      return false 
    }
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
    setSelectedGroupId:     id => setState(s => ({ ...s, selectedGroupId: id })),
    refreshModelTokenStatus,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
