"use client"

import {
  createContext, useContext, useState,
  useEffect, type ReactNode,
} from "react"

export type Language  = "en" | "ru" | "es"
export type ModelName = "Grok 4" | "Grok 4 Mini" | "GPT-5.4" | "GPT-5.2"
export type View      = "home" | "settings" | "store" | "premium"

export type UserPreferences = {
  name: string
  age: string
  location: string
  preferences: string
}

export type HourlyUsage = {
  used: number
  limit: number
  resetsInMin: number
}

export type AppState = {
  imageTokens: number
  isPremium: boolean
  language: Language
  selectedModel: ModelName
  userPreferences: UserPreferences
  currentView: View
  userId: number | null
  botUsername: string
  hourlyUsage: Record<ModelName, HourlyUsage>
}

export type AppContextType = AppState & {
  setImageTokens:     (n: number) => void
  setIsPremium:       (b: boolean) => void
  setLanguage:        (l: Language) => void
  setSelectedModel:   (m: ModelName) => void
  setUserPreferences: (p: UserPreferences) => void
  setCurrentView:     (v: View) => void
  sendToBot:          (text: string) => void
  t:                  (key: string) => string
}

export const DEFAULT_HOURLY: Record<ModelName, HourlyUsage> = {
  "Grok 4":      { used: 0, limit: 5,  resetsInMin: 0 },
  "Grok 4 Mini": { used: 0, limit: 12, resetsInMin: 0 },
  "GPT-5.4":     { used: 0, limit: 0,  resetsInMin: 0 },
  "GPT-5.2":     { used: 0, limit: 2,  resetsInMin: 0 },
}

/* ── Translations ─────────────────────────────────────────────────────── */
type Translations = Record<string, string>

const EN: Translations = {
  howCanIHelp: "How can I help?",
  typeMessage: "Ask xBlum anything...",
  sendMessage: "Send",
  getXBlumPro: "Get xBlum Pro",
  settings: "Settings",
  store: "Store",
  imageTokens: "Image tokens",
  buyImages: "Buy Images",
  missions: "Earn free tokens",
  preferences: "Preferences",
  language: "Language",
  model: "AI Model",
  name: "Name",
  age: "Age",
  location: "Location",
  yourPreferences: "Your preferences",
  save: "Save",
  dailyTokens: "Daily Reward",
  addToChat: "Add to a Group",
  shareToFriend: "Share with a Friend",
  referral: "Invite a Friend",
  claim: "Claim",
  claimed: "Claimed",
  longerConversations: "Higher hourly limits",
  priorityAccess: "Priority access at peak",
  monthlyTokens: "Image tokens included monthly",
  moreImages: "Generate AI images",
  gptModels: "Unlock GPT-5.2 & GPT-5.4",
  x10Uses: "3-4x more requests per hour",
  subscribe: "Subscribe Now",
  perMonth: "/month",
  selectModel: "Select Model",
  premium: "Premium",
  free: "Free",
  popular: "Popular",
  bestValue: "Best Value",
  back: "Back",
  hourlyLimit: "/ hour",
  locked: "Pro only",
  resetsIn: "resets in",
  min: "min",
  noLimit: "Unlimited",
  changeModel: "switch model",
}

const RU: Translations = {
  howCanIHelp: "Чем могу помочь?",
  typeMessage: "Спросите xBlum...",
  sendMessage: "Отправить",
  getXBlumPro: "xBlum Pro",
  settings: "Настройки",
  store: "Магазин",
  imageTokens: "Токены изображений",
  buyImages: "Купить токены",
  missions: "Получить токены",
  preferences: "Предпочтения",
  language: "Язык",
  model: "Модель ИИ",
  name: "Имя",
  age: "Возраст",
  location: "Местоположение",
  yourPreferences: "Ваши предпочтения",
  save: "Сохранить",
  dailyTokens: "Ежедневная награда",
  addToChat: "Добавить в группу",
  shareToFriend: "Поделиться с другом",
  referral: "Пригласить друга",
  claim: "Получить",
  claimed: "Получено",
  longerConversations: "Повышенные лимиты в час",
  priorityAccess: "Приоритетный доступ",
  monthlyTokens: "Токены изображений включены",
  moreImages: "Генерация изображений",
  gptModels: "GPT-5.2 и GPT-5.4 разблокированы",
  x10Uses: "В 3-4 раза больше запросов в час",
  subscribe: "Подписаться",
  perMonth: "/мес",
  selectModel: "Выбрать модель",
  premium: "Премиум",
  free: "Бесплатно",
  popular: "Популярное",
  bestValue: "Лучшая цена",
  back: "Назад",
  hourlyLimit: "/ час",
  locked: "Только Pro",
  resetsIn: "сбросится через",
  min: "мин",
  noLimit: "Без лимита",
  changeModel: "сменить модель",
}

const ES: Translations = {
  howCanIHelp: "¿En qué puedo ayudarte?",
  typeMessage: "Pregúntale a xBlum...",
  sendMessage: "Enviar",
  getXBlumPro: "xBlum Pro",
  settings: "Ajustes",
  store: "Tienda",
  imageTokens: "Tokens de imagen",
  buyImages: "Comprar tokens",
  missions: "Ganar tokens gratis",
  preferences: "Preferencias",
  language: "Idioma",
  model: "Modelo IA",
  name: "Nombre",
  age: "Edad",
  location: "Ubicación",
  yourPreferences: "Tus preferencias",
  save: "Guardar",
  dailyTokens: "Recompensa diaria",
  addToChat: "Añadir a un grupo",
  shareToFriend: "Compartir con amigo",
  referral: "Invitar amigo",
  claim: "Reclamar",
  claimed: "Reclamado",
  longerConversations: "Límites horarios aumentados",
  priorityAccess: "Acceso prioritario",
  monthlyTokens: "Tokens de imagen incluidos",
  moreImages: "Genera imágenes con IA",
  gptModels: "GPT-5.2 y GPT-5.4 desbloqueados",
  x10Uses: "3-4x más requests por hora",
  subscribe: "Suscribirse",
  perMonth: "/mes",
  selectModel: "Seleccionar modelo",
  premium: "Premium",
  free: "Gratis",
  popular: "Popular",
  bestValue: "Mejor valor",
  back: "Volver",
  hourlyLimit: "/ hora",
  locked: "Solo Pro",
  resetsIn: "se libera en",
  min: "min",
  noLimit: "Sin límite",
  changeModel: "cambiar modelo",
}

const LANG_MAP: Record<Language, Translations> = { en: EN, ru: RU, es: ES }

/* ── Context ──────────────────────────────────────────────────────────── */
const AppContext = createContext<AppContextType | undefined>(undefined)

/* ── Telegram type (window global) ───────────────────────────────────── */
type TgWebApp = {
  ready: () => void
  expand: () => void
  sendData: (d: string) => void
  openTelegramLink: (url: string) => void
  switchInlineQuery: (query: string, types?: string[]) => void
  initDataUnsafe?: {
    user?: { id: number; language_code?: string }
  }
}

function getTg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TgWebApp | undefined
}

/* ── Provider ─────────────────────────────────────────────────────────── */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    imageTokens: 0,
    isPremium: false,
    language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home",
    userId: null,
    botUsername: "xBlumAI",
    hourlyUsage: DEFAULT_HOURLY,
  })

  useEffect(() => {
    const tg = getTg()
    if (tg) {
      tg.ready()
      tg.expand()
    }

    const user   = tg?.initDataUnsafe?.user
    const code   = user?.language_code ?? ""
    const lang: Language =
      code.startsWith("ru") ? "ru" :
      code.startsWith("es") ? "es" :
      "en"

    try {
      const raw  = localStorage.getItem("xblum-local")
      const saved = raw ? JSON.parse(raw) : {}
      setState(s => ({
        ...s,
        userId:           user?.id ?? null,
        language:         saved.language         ?? lang,
        userPreferences:  saved.userPreferences  ?? s.userPreferences,
        selectedModel:    saved.selectedModel    ?? s.selectedModel,
      }))
    } catch {
      setState(s => ({ ...s, userId: user?.id ?? null, language: lang }))
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("xblum-local", JSON.stringify({
        language:        state.language,
        userPreferences: state.userPreferences,
        selectedModel:   state.selectedModel,
      }))
    } catch { /* ignore */ }
  }, [state.language, state.userPreferences, state.selectedModel])

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

  function t(key: string): string {
    return LANG_MAP[state.language]?.[key] ?? key
  }

  const value: AppContextType = {
    ...state,
    setImageTokens:     n => setState(s => ({ ...s, imageTokens: n })),
    setIsPremium:       b => setState(s => ({ ...s, isPremium: b })),
    setLanguage:        l => setState(s => ({ ...s, language: l })),
    setSelectedModel:   m => setState(s => ({ ...s, selectedModel: m })),
    setUserPreferences: p => setState(s => ({ ...s, userPreferences: p })),
    setCurrentView:     v => setState(s => ({ ...s, currentView: v })),
    sendToBot,
    t,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
