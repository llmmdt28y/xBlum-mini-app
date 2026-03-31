"use client"

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
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
  referralCode: string
  referralLink: string
  personalizeMemories: boolean
  isLoading: boolean
  apiError: string
}

export type AppContextType = AppState & {
  setTokens:               (n: number) => void
  addTokens:               (n: number) => void
  setIsPremium:            (b: boolean) => void
  setLanguage:             (l: Language) => void
  setSelectedModel:        (m: ModelName) => Promise<void>
  setUserPreferences:      (p: UserPreferences) => void
  setCurrentView:          (v: View) => void
  sendToBot:               (text: string) => void
  openInvoice:             (pkgId: string) => Promise<void>
  claimMissionTokens:      (missionId: string, amount: number) => Promise<boolean>
  setPersonalizeMemories:  (v: boolean) => Promise<void>
  deleteAllMemories:       () => Promise<void>
  deleteAllHistory:        () => Promise<void>
  minutesUntilReset:       number
  t:                       (key: string) => string
}

export const DEFAULT_HOURLY: Record<ModelName, HourlyUsage> = {
  "Grok 4":      { used: 0, limit: 999, resetsInMin: 0 },
  "Grok 4 Mini": { used: 0, limit: 999, resetsInMin: 0 },
  "GPT-5.4":     { used: 0, limit: 999, resetsInMin: 0 },
  "GPT-5.2":     { used: 0, limit: 999, resetsInMin: 0 },
}

type TDict = Record<string, string>

const EN: TDict = {
  howCanIHelp:"How can I help you today?", typeMessage:"Ask anything...",
  getXBlumPro:"Get xBlum Pro", settings:"Settings", store:"Store",
  tokens:"Tokens", buyTokens:"Buy Tokens", missions:"Earn free tokens",
  preferences:"Preferences", language:"Language", model:"AI Model",
  name:"Name", age:"Age", location:"Location",
  yourPreferences:"Your preferences", save:"Save",
  dailyTokens:"Daily Reward", addToChat:"Add to chat",
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
  general:"General", dataControl:"Data Control",
  personalizeMemories:"Personalize with memories",
  improveModel:"Improve the model",
  deleteAllMemories:"Delete All Memories",
  deleteAllHistory:"Delete All History",
  notSet:"Not set",
  unlockGPT:"Upgrade to Pro → unlock GPT models",
  loading:"Loading...", errorLoading:"Could not load data",
  saved:"Saved!", deleted:"Deleted.",
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
  x10Uses:"Больше запросов",
  subscribe:"Подписаться", perMonth:"/мес",
  selectModel:"Выбрать модель", premium:"Премиум",
  free:"Бесплатно", popular:"Популярное", bestValue:"Лучшая цена", back:"Назад",
  locked:"Только Pro", resetsIn:"сбросится через", min:"мин",
  changeModel:"сменить модель", throttleActive:"Отдыхает",
  throttleDesc:"Grok 4 Mini отдыхает после интенсивной работы",
  general:"Основные", dataControl:"Управление данными",
  personalizeMemories:"Персонализация с памятью",
  improveModel:"Улучшить модель",
  deleteAllMemories:"Удалить всю память",
  deleteAllHistory:"Удалить всю историю",
  notSet:"Не задано",
  unlockGPT:"Улучшить до Pro → разблокировать GPT модели",
  loading:"Загрузка...", errorLoading:"Ошибка загрузки",
  saved:"Сохранено!", deleted:"Удалено.",
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
  general:"General", dataControl:"Control de datos",
  personalizeMemories:"Personalizar con memorias",
  improveModel:"Mejorar el modelo",
  deleteAllMemories:"Eliminar toda la memoria",
  deleteAllHistory:"Eliminar todo el historial",
  notSet:"No establecido",
  unlockGPT:"Mejorar a Pro → desbloquear modelos GPT",
  loading:"Cargando...", errorLoading:"Error al cargar",
  saved:"¡Guardado!", deleted:"Eliminado.",
}

const LANG_MAP: Record<Language, TDict> = { en: EN, ru: RU, es: ES }
const AppContext = createContext<AppContextType | undefined>(undefined)

type TgWebApp = {
  ready:              () => void
  expand:             () => void
  close:              () => void
  openInvoice:        (url: string, cb?: (status: string) => void) => void
  openTelegramLink:   (url: string) => void
  switchInlineQuery:  (query: string, types?: string[]) => void
  showAlert:          (msg: string, cb?: () => void) => void
  showConfirm:        (msg: string, cb: (ok: boolean) => void) => void
  initData:           string
  initDataUnsafe?:    { user?: { id: number; language_code?: string; first_name?: string } }
}

function getTg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TgWebApp | undefined
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// URL del servidor FastAPI — se pone en .env.local y en Vercel env vars
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

async function apiCall(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  const tg       = getTg()
  const initData = tg?.initData ?? ""

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ...body, initData }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0, isPremium: false, language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home", userId: null, botUsername: "xBlumAI",
    isThrottled: false, throttleMinutes: 0,
    missionTokensToday: 0, missionResetDate: todayStr(),
    referralCode: "", referralLink: "",
    personalizeMemories: true,
    isLoading: true, apiError: "",
  })

  // ── Cargar estado real desde el servidor ──────────────────────────────────
  const loadStatus = useCallback(async () => {
    try {
      const data = await apiCall("/api/status", {}) as Record<string, unknown>
      setState(s => ({
        ...s,
        tokens:              Number(data.tokens)              ?? 0,
        isPremium:           Boolean(data.is_premium),
        selectedModel:       (data.selected_model as ModelName) ?? "Grok 4",
        personalizeMemories: Boolean(data.personalize_memories ?? true),
        isThrottled:         Boolean(data.is_throttled),
        throttleMinutes:     Number(data.throttle_mins)       ?? 0,
        missionTokensToday:  Number(data.mission_today)       ?? 0,
        referralCode:        String(data.referral_code        ?? ""),
        referralLink:        String(data.referral_link        ?? ""),
        isLoading:           false,
        apiError:            "",
      }))
    } catch (err) {
      console.error("[AppContext] loadStatus:", err)
      setState(s => ({ ...s, isLoading: false, apiError: String(err) }))
    }
  }, [])

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tg = getTg()
    if (tg) { tg.ready(); tg.expand() }

    const user = tg?.initDataUnsafe?.user
    const code = user?.language_code ?? ""
    const lang: Language =
      code.startsWith("ru") ? "ru" : code.startsWith("es") ? "es" : "en"

    // Cargar prefs guardadas localmente (idioma, prefs de usuario — cosas no en DB)
    try {
      const raw   = localStorage.getItem("xblum-v4")
      const saved = raw ? JSON.parse(raw) : {}
      setState(s => ({
        ...s,
        userId:           user?.id ?? null,
        language:         saved.language        ?? lang,
        userPreferences:  saved.userPreferences ?? s.userPreferences,
      }))
    } catch {
      setState(s => ({ ...s, userId: user?.id ?? null, language: lang }))
    }

    // Cargar estado real del servidor
    if (tg?.initData) {
      loadStatus()
    } else {
      // Sin initData (dev/browser) — marcar como no loading
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [loadStatus])

  // ── Throttle countdown ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (!s.isThrottled) return s
        const newMins = Math.max(0, s.throttleMinutes - 1)
        return newMins === 0
          ? { ...s, isThrottled: false, throttleMinutes: 0 }
          : { ...s, throttleMinutes: newMins }
      })
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Persistir solo preferencias locales ──────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("xblum-v4", JSON.stringify({
        language:        state.language,
        userPreferences: state.userPreferences,
      }))
    } catch {}
  }, [state.language, state.userPreferences])

  // ── sendToBot — abre el bot en chat ───────────────────────────────────────
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

  // ── Cambiar modelo (llama al servidor) ────────────────────────────────────
  async function setSelectedModel(model: ModelName) {
    setState(s => ({ ...s, selectedModel: model }))
    try {
      await apiCall("/api/set_model", { model })
    } catch (e) {
      console.error("[setModel]", e)
    }
  }

  // ── Pago con Stars — openInvoice nativo ───────────────────────────────────
  async function openInvoice(pkgId: string) {
    try {
      const data = await apiCall("/api/get_invoice_link", { package_id: pkgId }) as { invoice_link: string }
      const tg   = getTg()
      if (!tg) return

      tg.openInvoice(data.invoice_link, (status: string) => {
        if (status === "paid") {
          // Recargar estado desde servidor para reflejar tokens/premium nuevos
          loadStatus()
        }
      })
    } catch (e) {
      console.error("[openInvoice]", e)
    }
  }

  // ── Claim misión ──────────────────────────────────────────────────────────
  async function claimMissionTokens(missionId: string, amount: number): Promise<boolean> {
    try {
      const data = await apiCall("/api/claim_mission", {
        mission_id: missionId, amount,
      }) as { ok: boolean; tokens: number; today: number }

      if (data.ok) {
        setState(s => ({
          ...s,
          tokens:             data.tokens,
          missionTokensToday: data.today,
          missionResetDate:   todayStr(),
        }))
      }
      return data.ok
    } catch (e) {
      console.error("[claimMission]", e)
      return false
    }
  }

  // ── Personalize memories ──────────────────────────────────────────────────
  async function setPersonalizeMemories(v: boolean) {
    setState(s => ({ ...s, personalizeMemories: v }))
    try {
      await apiCall("/api/set_personalize_memories", { enabled: v })
    } catch (e) {
      console.error("[setPersonalizeMemories]", e)
    }
  }

  // ── Delete memories ───────────────────────────────────────────────────────
  async function deleteAllMemories() {
    try {
      await apiCall("/api/delete_memories", {})
    } catch (e) {
      console.error("[deleteMemories]", e)
    }
  }

  // ── Delete history ────────────────────────────────────────────────────────
  async function deleteAllHistory() {
    try {
      await apiCall("/api/delete_history", {})
    } catch (e) {
      console.error("[deleteHistory]", e)
    }
  }

  function t(key: string): string {
    return LANG_MAP[state.language]?.[key] ?? key
  }

  const value: AppContextType = {
    ...state,
    setTokens:              n => setState(s => ({ ...s, tokens: n })),
    addTokens:              n => setState(s => ({ ...s, tokens: s.tokens + n })),
    setIsPremium:           b => setState(s => ({ ...s, isPremium: b })),
    setLanguage:            l => setState(s => ({ ...s, language: l })),
    setSelectedModel,
    setUserPreferences:     p => setState(s => ({ ...s, userPreferences: p })),
    setCurrentView:         v => setState(s => ({ ...s, currentView: v })),
    sendToBot,
    openInvoice,
    claimMissionTokens,
    setPersonalizeMemories,
    deleteAllMemories,
    deleteAllHistory,
    minutesUntilReset: state.throttleMinutes,
    t,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
