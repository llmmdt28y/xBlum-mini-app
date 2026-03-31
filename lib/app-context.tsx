"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipos base
export type Language = "en" | "ru" | "es"
export type ModelName = "Grok 4" | "Grok 4 Mini" | "GPT-5.4" | "GPT-5.2"
export type View = "home" | "settings" | "store" | "premium"

export interface AppState {
  tokens: number
  isPremium: boolean
  language: Language
  selectedModel: ModelName
  currentView: View
  userId: number | null
}

const AppContext = createContext<any>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    tokens: 0,
    isPremium: false,
    language: "es",
    selectedModel: "Grok 4 Mini",
    currentView: "home",
    userId: null,
  })

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      setState(s => ({ ...s, userId: tg.initDataUnsafe?.user?.id || null }))
    }
  }, [])

  const value = {
    ...state,
    setCurrentView: (v: View) => setState(s => ({ ...s, currentView: v })),
    setIsPremium: (b: boolean) => setState(s => ({ ...s, isPremium: b })),
    setSelectedModel: (m: ModelName) => setState(s => ({ ...s, selectedModel: m })),
    // Método para abrir facturas sin cerrar la app
    openStarsInvoice: (url: string) => {
      const tg = (window as any).Telegram?.WebApp
      tg?.openInvoice(url, (status: string) => {
        if (status === "paid") {
          setState(s => ({ ...s, isPremium: true }))
          tg.showAlert("¡Pago completado! Ahora eres xBlum Pro.")
        } else if (status === "failed") {
          tg.showAlert("El pago no pudo procesarse.")
        }
      })
    },
    t: (key: string) => key // Simplificado para el ejemplo
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
