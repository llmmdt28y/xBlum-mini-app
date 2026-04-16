"use client"

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from "react"

export type Language  = "en" | "ru" | "es"
export type ModelName = "Grok 4" | "Grok 4 Mini" | "GPT-5.4" | "GPT-5.2"
export type View      = "home" | "settings" | "store" | "premium" | "referral" | "analytics" | "profile" | "x-rewards"

export type UserPreferences = {
  name: string; age: string; location: string; preferences: string
}

export type AppState = {
  tokens: number            // image tokens (legacy, kept for compat)
  x_points: number          // $X reward points
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
  // Missions & daily
  completed_missions: string[]
  ads_today: number
  ads_max_daily: number
  image_used_today: number
  image_daily_limit: number
  // Leaderboard
  my_rank_global: { rank: number; tp: number }
  my_rank_weekly: { rank: number; tp: number }
}

export type AppContextType = AppState & {
  setTokens:              (n: number) => void
  addTokens:              (n: number) => void
  setIsPremium:           (b: boolean) => void
  setLanguage:            (l: Language) => void
  setSelectedModel:       (m: ModelName) => Promise<void>
  setUserPreferences:     (p: UserPreferences) => void
  setCurrentView:         (v: View) => void
  sendToBot:              (text: string) => void
  sendChatMessage:        (text: string) => Promise<void>
  openExploreTopic:       (topicKey: string, firstMsg?: string) => Promise<void>
  openInvoice:            (pkgId: string) => Promise<void>
  claimMissionTokens:     (missionId: string, amount: number) => Promise<boolean>
  setPersonalizeMemories: (v: boolean) => Promise<void>
  deleteAllMemories:      () => Promise<void>
  deleteAllHistory:       () => Promise<void>
  submitFeedback:         (type: string, description: string) => Promise<boolean>
  minutesUntilReset:      number
  t:                      (key: string) => string
}

type TDict = Record<string, string>

const EN: TDict = {
  howCanIHelp:"How can I help you today?", typeMessage:"Ask anything...",
  getXBlumPro:"Get xBlum Pro", settings:"Settings", store:"Store",
  tokens:"Tokens", buyTokens:"Buy Tokens", missions:"Earn free $X",
  preferences:"Preferences", language:"Language", model:"AI Model",
  name:"Name", age:"Age", location:"Location",
  yourPreferences:"Your preferences", save:"Save",
  dailyTokens:"Daily Reward", addToChat:"Add to chat",
  shareToFriend:"Share with a Friend", referral:"Invite a Friend",
  claim:"Claim", claimed:"Claimed",
  longerConversations:"Higher limits & priority",
  priorityAccess:"Priority access at peak",
  monthlyTokens:"20 AI images/day",
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
  createImage:"Create image",
  getTokens:"Earn $X",
  poweredBy:"Powered by",
  upgradePro:"Upgrade to Pro",
  throttle:"throttle",
  upgradeButton:"Upgrade to xBlum Pro",
}

const RU: TDict = {
  howCanIHelp:"Чем могу помочь?", typeMessage:"Спросите xBlum...",
  getXBlumPro:"xBlum Pro", settings:"Настройки", store:"Магазин",
  tokens:"Токены", buyTokens:"Купить токены", missions:"Получить $X",
  preferences:"Предпочтения", language:"Язык", model:"Модель ИИ",
  name:"Имя", age:"Возраст", location:"Местоположение",
  yourPreferences:"Ваши предпочтения", save:"Сохранить",
  dailyTokens:"Ежедневная награда", addToChat:"Добавить в группу",
  shareToFriend:"Поделиться с другом", referral:"Пригласить друга",
  claim:"Получить", claimed:"Получено",
  longerConversations:"Повышенные лимиты",
  priorityAccess:"Приоритетный доступ",
  monthlyTokens:"20 изображений/день",
  moreImages:"Генерация изображений",
  gptModels:"GPT-5.2 и GPT-5.4",
  x10Uses:"Больше запросов",
  subscribe:"Подписаться", perMonth:"/мес",
  selectModel:"Выбрать модель", premium:"Премиум",
  free:"Бесплатно", popular:"Популярное", bestValue:"Лучшая цена", back:"Назад",
  locked:"Только Pro", resetsIn:"сбросится через", min:"мин",
  changeModel:"сменить модель", throttleActive:"Отдыхает",
  throttleDesc:"Grok 4 Mini отдыхает",
  general:"Основные", dataControl:"Управление данными",
  personalizeMemories:"Персонализация с памятью",
  improveModel:"Улучшить модель",
  deleteAllMemories:"Удалить всю память",
  deleteAllHistory:"Удалить всю историю",
  notSet:"Не задано",
  unlockGPT:"Улучшить до Pro → GPT модели",
  loading:"Загрузка...", errorLoading:"Ошибка загрузки",
  saved:"Сохранено!", deleted:"Удалено.",
  createImage:"Создать изображение",
  getTokens:"Заработать $X",
  poweredBy:"Работает на",
  upgradePro:"Улучшить до Pro",
  throttle:"ограничение",
  upgradeButton:"Улучшить до xBlum Pro",
}

const ES: TDict = {
  howCanIHelp:"¿En qué puedo ayudarte?", typeMessage:"Pregúntale a xBlum...",
  getXBlumPro:"xBlum Pro", settings:"Ajustes", store:"Tienda",
  tokens:"Tokens", buyTokens:"Comprar tokens", missions:"Ganar $X gratis",
  preferences:"Preferencias", language:"Idioma", model:"Modelo IA",
  name:"Nombre", age:"Edad", location:"Ubicación",
  yourPreferences:"Tus preferencias", save:"Guardar",
  dailyTokens:"Recompensa diaria", addToChat:"Añadir a un grupo",
  shareToFriend:"Compartir con amigo", referral:"Invitar amigo",
  claim:"Reclamar", claimed:"Reclamado",
  longerConversations:"Límites aumentados",
  priorityAccess:"Acceso prioritario",
  monthlyTokens:"20 imágenes/día",
  moreImages:"Genera imágenes con IA",
  gptModels:"GPT-5.2 y GPT-5.4",
  x10Uses:"Más requests y resets más rápidos",
  subscribe:"Suscribirse", perMonth:"/mes",
  selectModel:"Seleccionar modelo", premium:"Premium",
  free:"Gratis", popular:"Popular", bestValue:"Mejor valor", back:"Volver",
  locked:"Solo Pro", resetsIn:"se libera en", min:"min",
  changeModel:"cambiar modelo", throttleActive:"Descansando",
  throttleDesc:"Grok 4 Mini descansa",
  general:"General", dataControl:"Control de datos",
  personalizeMemories:"Personalizar con memorias",
  improveModel:"Mejorar el modelo",
  deleteAllMemories:"Eliminar toda la memoria",
  deleteAllHistory:"Eliminar todo el historial",
  notSet:"No establecido",
  unlockGPT:"Mejorar a Pro → modelos GPT",
  loading:"Cargando...", errorLoading:"Error al cargar",
  saved:"¡Guardado!", deleted:"Eliminado.",
  createImage:"Crear imagen",
  getTokens:"Ganar $X",
  poweredBy:"Impulsado por",
  upgradePro:"Mejorar a Pro",
  throttle:"limitación",
  upgradeButton:"Mejorar a xBlum Pro",
}

const LANG_MAP: Record<Language, TDict> = { en: EN, ru: RU, es: ES }
const AppContext = createContext<AppContextType | undefined>(undefined)

type TgWebApp = {
  ready:            () => void
  expand:           () => void
  close:            () => void
  openInvoice:      (url: string, cb?: (status: string) => void) => void
  openTelegramLink: (url: string) => void
  showAlert:        (msg: string, cb?: () => void) => void
  showConfirm:      (msg: string, cb: (ok: boolean) => void) => void
  initData:         string
  initDataUnsafe?:  { user?: { id: number; language_code?: string; first_name?: string } }
}

function getTg(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp as TgWebApp | undefined
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

async function apiCall(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg       = (window as any)?.Telegram?.WebApp
  const initData: string = tg?.initData ?? ""
  const userId   = tg?.initDataUnsafe?.user?.id ?? null

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ...body, initData, userId }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let detail = `HTTP ${res.status}`
    try { detail = JSON.parse(text).detail ?? detail } catch {}
    throw new Error(detail)
  }

  return res.json()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0, x_points: 0, isPremium: false, language: "en",
    selectedModel: "Grok 4",
    userPreferences: { name: "", age: "", location: "", preferences: "" },
    currentView: "home", userId: null, botUsername: "xBlumAI",
    isThrottled: false, throttleMinutes: 0,
    referralCode: "", referralLink: "", referralCount: 0,
    personalizeMemories: true,
    isLoading: true, apiError: "",
    completed_missions: [], ads_today: 0, ads_max_daily: 3,
    image_used_today: 0, image_daily_limit: 3,
    my_rank_global: { rank: 0, tp: 0 },
    my_rank_weekly: { rank: 0, tp: 0 },
  })

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiCall("/api/status", {}) as Record<string, unknown>
      setState(s => ({
        ...s,
        tokens:              Number(data.x_points)            ?? 0,
        x_points:            Number(data.x_points)            ?? 0,
        isPremium:           Boolean(data.is_premium),
        selectedModel:       (data.selected_model as ModelName) ?? "Grok 4",
        personalizeMemories: Boolean(data.personalize_memories ?? true),
        isThrottled:         Boolean(data.is_throttled),
        throttleMinutes:     Number(data.throttle_mins)       ?? 0,
        referralCode:        String(data.referral_code        ?? ""),
        referralLink:        String(data.referral_link        ?? ""),
        referralCount:       Number(data.referral_count       ?? 0),
        completed_missions:  (data.completed_missions as string[]) ?? [],
        ads_today:           Number(data.ads_today)           ?? 0,
        ads_max_daily:       Number(data.ads_max_daily)       ?? 3,
        image_used_today:    Number(data.image_used_today)    ?? 0,
        image_daily_limit:   Number(data.image_daily_limit)   ?? 3,
        my_rank_global:      (data.my_rank_global as { rank: number; tp: number }) ?? { rank: 0, tp: 0 },
        my_rank_weekly:      (data.my_rank_weekly as { rank: number; tp: number }) ?? { rank: 0, tp: 0 },
        isLoading:           false,
        apiError:            "",
      }))
    } catch (err) {
      console.error("[AppContext] loadStatus:", err)
      setState(s => ({ ...s, isLoading: false, apiError: String(err) }))
    }
  }, [])

  useEffect(() => {
    const tg = getTg()
    if (tg) { tg.ready(); tg.expand() }

    const user = tg?.initDataUnsafe?.user
    const code = user?.language_code ?? ""
    const lang: Language =
      code.startsWith("ru") ? "ru" : code.startsWith("es") ? "es" : "en"

    try {
      const raw   = localStorage.getItem("xblum-v4")
      const saved = raw ? JSON.parse(raw) : {}
      setState(s => ({
        ...s,
        userId:          user?.id ?? null,
        language:        saved.language        ?? lang,
        userPreferences: saved.userPreferences ?? s.userPreferences,
      }))
    } catch {
      setState(s => ({ ...s, userId: user?.id ?? null, language: lang }))
    }

    loadStatus()
  }, [loadStatus])

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

  useEffect(() => {
    try {
      localStorage.setItem("xblum-v4", JSON.stringify({
        language:        state.language,
        userPreferences: state.userPreferences,
      }))
    } catch {}
  }, [state.language, state.userPreferences])

  function sendToBot(text: string) {
    const tg = getTg()
    if (!tg) return
    try {
      tg.openTelegramLink("https://t.me/" + state.botUsername + "?text=" + encodeURIComponent(text))
    } catch (e) {
      console.error("[sendToBot]", e)
    }
  }

  async function openExploreTopic(topicKey: string, firstMsg?: string): Promise<void> {
    try {
      await apiCall("/api/open_explore_topic", { topic_key: topicKey, text: firstMsg ?? "" })
      const tg = getTg()
      if (tg) tg.close()
    } catch (e) {
      console.error("[openExploreTopic]", e)
      const tg = getTg()
      if (tg) tg.openTelegramLink("https://t.me/" + state.botUsername)
    }
  }

  async function sendChatMessage(text: string): Promise<void> {
    try {
      await apiCall("/api/chat_message", { text })
    } catch (e) {
      console.error("[sendChatMessage]", e)
      const tg = getTg()
      if (tg) tg.openTelegramLink("https://t.me/" + state.botUsername + "?text=" + encodeURIComponent(text))
    }
  }

  async function setSelectedModel(model: ModelName) {
    setState(s => ({ ...s, selectedModel: model }))
    try { await apiCall("/api/set_model", { model }) } catch (e) { console.error("[setModel]", e) }
  }

  async function openInvoice(pkgId: string) {
    try {
      const data = await apiCall("/api/get_invoice_link", { package_id: pkgId }) as { invoice_link: string }
      const tg   = getTg()
      if (!tg) return
      tg.openInvoice(data.invoice_link, (status: string) => {
        if (status === "paid") loadStatus()
      })
    } catch (e) { console.error("[openInvoice]", e) }
  }

  async function claimMissionTokens(missionId: string, amount: number): Promise<boolean> {
    try {
      const data = await apiCall("/api/claim_mission", { mission_id: missionId, amount }) as {
        ok?: boolean; x_points?: number; given?: number
      }

      if (data.ok !== false) {
        setState(s => ({
          ...s,
          x_points: typeof data.x_points === "number" ? data.x_points : s.x_points + (data.given ?? amount),
          tokens:   typeof data.x_points === "number" ? data.x_points : s.tokens,
          // Marcar misión como completada localmente (se re-sincronizará en loadStatus)
          completed_missions: missionId !== "ad"
            ? [...s.completed_missions.filter(m => m !== missionId), missionId]
            : s.completed_missions,
          ads_today: missionId === "ad" ? s.ads_today + 1 : s.ads_today,
        }))
        return true
      }
      return false
    } catch (e) {
      console.error("[claimMission]", e)
      return false
    }
  }

  async function setPersonalizeMemories(v: boolean) {
    setState(s => ({ ...s, personalizeMemories: v }))
    try { await apiCall("/api/set_personalize_memories", { enabled: v }) } catch (e) { console.error(e) }
  }

  async function deleteAllMemories() {
    try { await apiCall("/api/delete_memories", {}) } catch (e) { console.error(e) }
  }

  async function deleteAllHistory() {
    try { await apiCall("/api/delete_history", {}) } catch (e) { console.error(e) }
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

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
