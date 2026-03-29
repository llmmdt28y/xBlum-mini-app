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

// Grok 4 Mini smart throttle — se activa por uso pesado, no por tiempo fijo
export type ThrottleState = {
  active: boolean        // throttle activo ahora
  resetsAt: number       // timestamp Unix cuando se resetea (0 = no activo)
  heavyCount: number     // requests pesados en la sesión actual
}

export type AppState = {
  tokens: number          // moneda única — 25-30 por imagen
  isPremium: boolean
  language: Language
  selectedModel: ModelName
  userPreferences: UserPreferences
  currentView: View
  userId: number | null
  botUsername: string
  throttle: ThrottleState  // solo aplica a Grok 4 Mini
  missionTokensToday: number  // tokens ganados por misiones hoy (máx 20)
  missionResetDate: string    // "YYYY-MM-DD" para reseteo diario
}

export type AppContextType = AppState & {
  setTokens:          (n: number) => void
  addTokens:          (n: number) => void
  consumeTokens:      (n: number) => boolean
  setIsPremium:       (b: boolean) => void
  setLanguage:        (l: Language) => void
  setSelectedModel:   (m: ModelName) => void
  setUserPreferences: (p: UserPreferences) => void
  setCurrentView:     (v: View) => void
  sendToBot:          (text: string) => void
  recordHeavyUsage:   () => void   // llamar cuando el bot hace web/deep/image
  t:                  (key: string) => string
  isThrottled:        boolean
  minutesUntilReset:  number
  claimMissionTokens: (amount: number) => boolean  // false si ya alcanzó 20/día
}

// Umbral de requests pesados antes de throttle
const HEAVY_THRESHOLD = 8   // después de 8 requests pesados seguidos → throttle
// Horas de reset: elige aleatoriamente entre 1, 2 o 3 horas
const RESET_HOURS = [1, 2, 3]

/* ── Translations ─────────────────────────────────────────────────────── */
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
  x10Uses:"3-4x more requests", subscribe:"Subscribe Now",
  perMonth:"/month", selectModel:"Select Model",
  premium:"Premium", free:"Free", popular:"Popular",
  bestValue:"Best Value", back:"Back",
  locked:"Pro only", resetsIn:"resets in", min:"min",
  changeModel:"switch model", throttleActive:"Cooling down",
  throttleDesc:"Grok 4 Mini is resting after heavy use",
  perImage:"tokens per image",
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
  x10Uses:"В 3-4 раза больше запросов", subscribe:"Подписаться",
  perMonth:"/мес", selectModel:"Выбрать модель",
  premium:"Премиум", free:"Бесплатно", popular:"Популярное",
  bestValue:"Лучшая цена", back:"Назад",
  locked:"Только Pro", resetsIn:"сбросится через", min:"мин",
  changeModel:"сменить модель", throttleActive:"Отдыхает",
  throttleDesc:"Grok 4 Mini отдыхает после интенсивной работы",
  perImage:"токенов за изображение",
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
  gptModels:"GPT-5.2 y GPT-5.4 desbloqueados",
  x10Uses:"3-4x más requests", subscribe:"Suscribirse",
  perMonth:"/mes", selectModel:"Seleccionar modelo",
  premium:"Premium", free:"Gratis", popular:"Popular",
  bestValue:"Mejor valor", back:"Volver",
  locked:"Solo Pro", resetsIn:"se libera en", min:"min",
  changeModel:"cambiar modelo", throttleActive:"Descansando",
  throttleDesc:"Grok 4 Mini descansa tras uso intensivo",
  perImage:"tokens por imagen",
}

const LANG_MAP: Record<Language, TDict> = { en: EN, ru: RU, es: ES }

/* ── Context ──────────────────────────────────────────────────────────── */
const AppContext = createContext<AppContextType | undefined>(undefined)

type TgWebApp = {
  ready: () => void; expand: () => void
  sendData: (d: string) => void
  openTelegramLink: (url: string) => void
  switchInlineQuery: (query: string, types?: string[]) => void
  initDataUnsafe?: { user?: { id: number; language_code?: string } }
}

function getTg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TgWebApp | undefined
}

function pickResetHours(): number {
  return RESET_HOURS[Math.floor(Math.random() * RESET_HOURS.length)]
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/* ── Provider ─────────────────────────────────────────────────────────── */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0,
    isPremium: false,
    language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home",
    userId: null,
    botUsername: "xBlumAI",
    throttle: { active: false, resetsAt: 0, heavyCount: 0 },
    missionTokensToday: 0,
    missionResetDate: todayStr(),
  })

  // Tick cada minuto para actualizar resetsAt
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (!s.throttle.active) return s
        if (Date.now() >= s.throttle.resetsAt) {
          return { ...s, throttle: { active: false, resetsAt: 0, heavyCount: 0 } }
        }
        return s  // fuerza re-render para que minutesUntilReset se recalcule
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  // Init TG + cargar persistencia
  useEffect(() => {
    const tg = getTg()
    if (tg) { tg.ready(); tg.expand() }
    const user = tg?.initDataUnsafe?.user
    const code = user?.language_code ?? ""
    const lang: Language =
      code.startsWith("ru") ? "ru" :
      code.startsWith("es") ? "es" : "en"
    try {
      const raw   = localStorage.getItem("xblum-v2")
      const saved = raw ? JSON.parse(raw) : {}
      const today = todayStr()
      setState(s => ({
        ...s,
        userId:              user?.id ?? null,
        language:            saved.language            ?? lang,
        userPreferences:     saved.userPreferences     ?? s.userPreferences,
        selectedModel:       saved.selectedModel       ?? s.selectedModel,
        tokens:              saved.tokens              ?? 0,
        isPremium:           saved.isPremium           ?? false,
        // Reset misiones si es un nuevo día
        missionTokensToday:  saved.missionResetDate === today ? (saved.missionTokensToday ?? 0) : 0,
        missionResetDate:    today,
        // Throttle: si ya expiró, limpiarlo
        throttle: saved.throttle && saved.throttle.active && Date.now() < saved.throttle.resetsAt
          ? saved.throttle
          : { active: false, resetsAt: 0, heavyCount: 0 },
      }))
    } catch {
      setState(s => ({ ...s, userId: user?.id ?? null, language: lang }))
    }
  }, [])

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("xblum-v2", JSON.stringify({
        language:           state.language,
        userPreferences:    state.userPreferences,
        selectedModel:      state.selectedModel,
        tokens:             state.tokens,
        isPremium:          state.isPremium,
        throttle:           state.throttle,
        missionTokensToday: state.missionTokensToday,
        missionResetDate:   state.missionResetDate,
      }))
    } catch { /* ignore */ }
  }, [
    state.language, state.userPreferences, state.selectedModel,
    state.tokens, state.isPremium, state.throttle,
    state.missionTokensToday, state.missionResetDate,
  ])

  // Registrar un request pesado (web search / deep research / image analysis)
  // Solo afecta a Grok 4 Mini
  function recordHeavyUsage() {
    setState(s => {
      if (s.selectedModel !== "Grok 4 Mini") return s
      if (s.throttle.active) return s   // ya throttled
      const newCount = s.throttle.heavyCount + 1
      if (newCount >= HEAVY_THRESHOLD) {
        const hours     = pickResetHours()
        const resetsAt  = Date.now() + hours * 3_600_000
        console.log("[Throttle] Grok 4 Mini throttled for", hours, "h")
        return { ...s, throttle: { active: true, resetsAt, heavyCount: 0 } }
      }
      return { ...s, throttle: { ...s.throttle, heavyCount: newCount } }
    })
  }

  function claimMissionTokens(amount: number): boolean {
    let ok = false
    setState(s => {
      const today = todayStr()
      const base  = s.missionResetDate === today ? s.missionTokensToday : 0
      const space = 20 - base
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

  function addTokens(n: number) {
    setState(s => ({ ...s, tokens: s.tokens + n }))
  }

  function consumeTokens(n: number): boolean {
    let ok = false
    setState(s => {
      if (s.tokens < n) return s
      ok = true
      return { ...s, tokens: s.tokens - n }
    })
    return ok
  }

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

  // Derived — computar minutos restantes del throttle
  const minutesUntilReset = state.throttle.active
    ? Math.max(0, Math.ceil((state.throttle.resetsAt - Date.now()) / 60_000))
    : 0

  const value: AppContextType = {
    ...state,
    setTokens:          n => setState(s => ({ ...s, tokens: n })),
    addTokens,
    consumeTokens,
    setIsPremium:       b => setState(s => ({ ...s, isPremium: b })),
    setLanguage:        l => setState(s => ({ ...s, language: l })),
    setSelectedModel:   m => setState(s => ({ ...s, selectedModel: m })),
    setUserPreferences: p => setState(s => ({ ...s, userPreferences: p })),
    setCurrentView:     v => setState(s => ({ ...s, currentView: v })),
    sendToBot, recordHeavyUsage, claimMissionTokens, t,
    isThrottled:       state.throttle.active,
    minutesUntilReset,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
