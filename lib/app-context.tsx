"use client"

import {
  createContext, useContext, useState,
  useEffect, type ReactNode,
} from "react"

export type Language  = "en" | "ru" | "es"
export type ModelName = "Grok 4" | "Grok 4 Mini" | "GPT-5.4" | "GPT-5.2"
export type View      = "home" | "settings" | "store" | "premium"

export type UserPreferences = {
  name: string; age: string; location: string; preferences: string
}

export type HourlyUsage = {
  used: number; limit: number; resetsInMin: number
}

export type AppState = {
  tokens: number
  isPremium: boolean
  language: Language
  selectedModel: ModelName
  userPreferences: UserPreferences
  currentView: View
  userId: number | null
  botUsername: string
  isThrottled: boolean
  throttleMinutes: number
  missionTokensToday: number
  missionResetDate: string
  hourlyUsage: Record<ModelName, HourlyUsage>
  referralCode: string
}

export type AppContextType = AppState & {
  setTokens:          (n: number) => void
  addTokens:          (n: number) => void
  setIsPremium:       (b: boolean) => void
  setLanguage:        (l: Language) => void
  setSelectedModel:   (m: ModelName) => void
  setUserPreferences: (p: UserPreferences) => void
  setCurrentView:     (v: View) => void
  sendToBot:          (text: string) => void
  claimMissionTokens: (amount: number) => boolean
  t:                  (key: string) => string
}

export const DEFAULT_HOURLY: Record<ModelName, HourlyUsage> = {
  "Grok 4":      { used: 0, limit: 5,  resetsInMin: 0 },
  "Grok 4 Mini": { used: 0, limit: 12, resetsInMin: 0 },
  "GPT-5.4":     { used: 0, limit: 0,  resetsInMin: 0 },
  "GPT-5.2":     { used: 0, limit: 2,  resetsInMin: 0 },
}

const MISSION_DAILY_MAX = 20

type TDict = Record<string, string>

const EN: TDict = {
  howCanIHelp:"How can I help?", typeMessage:"Ask xBlum anything...",
  getXBlumPro:"Get xBlum Pro", settings:"Settings", store:"Store",
  tokens:"Tokens", buyTokens:"Buy Tokens", missions:"Earn free tokens",
  preferences:"Preferences", language:"Language", model:"AI Model",
  name:"Name", age:"Age", location:"Location",
  yourPreferences:"Your preferences", save:"Save",
  dailyTokens:"Daily Reward", addToChat:"Add to a Group",
  shareToFriend:"Share with a Friend", referral:"Invite a Friend",
  claim:"Claim", claimed:"Claimed",
  longerConversations:"Higher limits & priority",
  priorityAccess:"Priority access at peak",
  monthlyTokens:"Monthly tokens included",
  moreImages:"Generate AI images",
  gptModels:"Unlock GPT-5.2 & GPT-5.4",
  x10Uses:"More requests & faster resets",
  subscribe:"Subscribe Now", perMonth:"/month",
  selectModel:"Select Model", premium:"Premium",
  free:"Free", popular:"Popular", bestValue:"Best Value", back:"Back",
  locked:"Pro only", resetsIn:"resets in", min:"min",
  changeModel:"switch model", throttleActive:"Cooling down",
  throttleDesc:"Grok 4 Mini is resting after heavy use",
}

const RU: TDict = {
  howCanIHelp:"Чем могу помочь?", typeMessage:"Спросите xBlum...",
  getXBlumPro:"xBlum Pro", settings:"Настройки", store:"Магазин",
  tokens:"Токены", buyTokens:"Купить токены", missions:"Получить токены",
  preferences:"Предпочтения", language:"Язык", model:"Модель ИИ",
  name:"Имя", age:"Возраст", location:"Местоположение",
  yourPreferences:"Ваши предпочтения", save:"Сохранить",
  dailyTokens:"Ежедневная награда", addToChat:"Добавить в группу",
  shareToFriend:"Поделиться с другом", referral:"Пригласить друга",
  claim:"Получить", claimed:"Получено",
  longerConversations:"Повышенные лимиты",
  priorityAccess:"Приоритетный доступ",
  monthlyTokens:"Ежемесячные токены",
  moreImages:"Генерация изображений",
  gptModels:"GPT-5.2 и GPT-5.4",
  x10Uses:"Больше запросов и быстрее сброс",
  subscribe:"Подписаться", perMonth:"/мес",
  selectModel:"Выбрать модель", premium:"Премиум",
  free:"Бесплатно", popular:"Популярное", bestValue:"Лучшая цена", back:"Назад",
  locked:"Только Pro", resetsIn:"сбросится через", min:"мин",
  changeModel:"сменить модель", throttleActive:"Отдыхает",
  throttleDesc:"Grok 4 Mini отдыхает после интенсивной работы",
}

const ES: TDict = {
  howCanIHelp:"¿En qué puedo ayudarte?", typeMessage:"Pregúntale a xBlum...",
  getXBlumPro:"xBlum Pro", settings:"Ajustes", store:"Tienda",
  tokens:"Tokens", buyTokens:"Comprar tokens", missions:"Ganar tokens gratis",
  preferences:"Preferencias", language:"Idioma", model:"Modelo IA",
  name:"Nombre", age:"Edad", location:"Ubicación",
  yourPreferences:"Tus preferencias", save:"Guardar",
  dailyTokens:"Recompensa diaria", addToChat:"Añadir a un grupo",
  shareToFriend:"Compartir con amigo", referral:"Invitar amigo",
  claim:"Reclamar", claimed:"Reclamado",
  longerConversations:"Límites aumentados",
  priorityAccess:"Acceso prioritario",
  monthlyTokens:"Tokens mensuales incluidos",
  moreImages:"Genera imágenes con IA",
  gptModels:"GPT-5.2 y GPT-5.4",
  x10Uses:"Más requests y resets más rápidos",
  subscribe:"Suscribirse", perMonth:"/mes",
  selectModel:"Seleccionar modelo", premium:"Premium",
  free:"Gratis", popular:"Popular", bestValue:"Mejor valor", back:"Volver",
  locked:"Solo Pro", resetsIn:"se libera en", min:"min",
  changeModel:"cambiar modelo", throttleActive:"Descansando",
  throttleDesc:"Grok 4 Mini descansa tras uso intensivo",
}

const LANG_MAP: Record<Language, TDict> = { en: EN, ru: RU, es: ES }
const AppContext = createContext<AppContextType | undefined>(undefined)

type TgWebApp = {
  ready: () => void; expand: () => void
  sendData: (d: string) => void
  openTelegramLink: (url: string) => void
  switchInlineQuery: (query: string, types?: string[]) => void
  initDataUnsafe?: { user?: { id: number; language_code?: string }; start_param?: string }
}

function getTg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TgWebApp | undefined
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0, isPremium: false, language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home", userId: null, botUsername: "xBlumAI",
    isThrottled: false, throttleMinutes: 0,
    missionTokensToday: 0, missionResetDate: todayStr(),
    hourlyUsage: DEFAULT_HOURLY, referralCode: "",
  })

  useEffect(() => {
    const tg = getTg()
    if (tg) { tg.ready(); tg.expand() }
    const user  = tg?.initDataUnsafe?.user
    const code  = user?.language_code ?? ""
    const lang: Language =
      code.startsWith("ru") ? "ru" : code.startsWith("es") ? "es" : "en"

    try {
      const raw   = localStorage.getItem("xblum-v3")
      const saved = raw ? JSON.parse(raw) : {}
      const today = todayStr()
      setState(s => ({
        ...s,
        userId:             user?.id ?? null,
        language:           saved.language           ?? lang,
        userPreferences:    saved.userPreferences    ?? s.userPreferences,
        selectedModel:      saved.selectedModel      ?? s.selectedModel,
        tokens:             saved.tokens             ?? 0,
        isPremium:          saved.isPremium          ?? false,
        missionTokensToday: saved.missionResetDate === today ? (saved.missionTokensToday ?? 0) : 0,
        missionResetDate:   today,
        referralCode:       saved.referralCode       ?? "",
      }))
    } catch {
      setState(s => ({ ...s, userId: user?.id ?? null, language: lang }))
    }

    // Pedir status real al bot al arrancar
    setTimeout(() => {
      try {
        getTg()?.sendData(JSON.stringify({ action: "get_status" }))
      } catch {}
    }, 800)
  }, [])

  // Tick para throttle countdown
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (!s.isThrottled) return s
        const newMins = Math.max(0, s.throttleMinutes - 1)
        if (newMins === 0) return { ...s, isThrottled: false, throttleMinutes: 0 }
        return { ...s, throttleMinutes: newMins }
      })
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // Persistir
  useEffect(() => {
    try {
      localStorage.setItem("xblum-v3", JSON.stringify({
        language:           state.language,
        userPreferences:    state.userPreferences,
        selectedModel:      state.selectedModel,
        tokens:             state.tokens,
        isPremium:          state.isPremium,
        missionTokensToday: state.missionTokensToday,
        missionResetDate:   state.missionResetDate,
        referralCode:       state.referralCode,
      }))
    } catch {}
  }, [
    state.language, state.userPreferences, state.selectedModel,
    state.tokens, state.isPremium, state.missionTokensToday,
    state.missionResetDate, state.referralCode,
  ])

  function sendToBot(text: string) {
    const tg = getTg()
    if (!tg) return
    try {
      tg.switchInlineQuery(text, [])
    } catch {
      tg.openTelegramLink(
        "https://t.me/" + state.botUsername + "?start=" + encodeURIComponent(text)
      )
    }
  }

  function claimMissionTokens(amount: number): boolean {
    const today = todayStr()
    let ok = false
    setState(s => {
      const base  = s.missionResetDate === today ? s.missionTokensToday : 0
      const space = MISSION_DAILY_MAX - base
      if (space <= 0) return s
      const actual = Math.min(amount, space)
      ok = true
      return {
        ...s,
        tokens:             s.tokens + actual,
        missionTokensToday: base + actual,
        missionResetDate:   today,
      }
    })
    return ok
  }

  function t(key: string): string {
    return LANG_MAP[state.language]?.[key] ?? key
  }

  const value: AppContextType = {
    ...state,
    setTokens:          n => setState(s => ({ ...s, tokens: n })),
    addTokens:          n => setState(s => ({ ...s, tokens: s.tokens + n })),
    setIsPremium:       b => setState(s => ({ ...s, isPremium: b })),
    setLanguage:        l => setState(s => ({ ...s, language: l })),
    setSelectedModel:   m => setState(s => ({ ...s, selectedModel: m })),
    setUserPreferences: p => setState(s => ({ ...s, userPreferences: p })),
    setCurrentView:     v => setState(s => ({ ...s, currentView: v })),
    sendToBot, claimMissionTokens, t,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
