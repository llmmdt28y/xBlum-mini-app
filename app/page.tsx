"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import Header from "@/components/header"        // Sin llaves si es export default
import HomeView from "@/components/home-view"    // Sin llaves
import SettingsView from "@/components/settings-view" // Sin llaves
import StoreView from "@/components/store-view"   // Sin llaves
import PremiumView from "@/components/premium-view" // Sin llaves
import { useEffect } from "react"

function AppContent() {
  const { currentView } = useApp()

  useEffect(() => {
    // Initialize Telegram WebApp if available
    if (typeof window !== "undefined" && (window as Window & { Telegram?: { WebApp?: { ready: () => void; expand: () => void } } }).Telegram?.WebApp) {
      const tg = (window as Window & { Telegram: { WebApp: { ready: () => void; expand: () => void } } }).Telegram.WebApp
      tg.ready()
      tg.expand()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {currentView === "home" && (
        <>
          <Header />
          <HomeView />
        </>
      )}
      {currentView === "settings" && <SettingsView />}
      {currentView === "store" && <StoreView />}
      {currentView === "premium" && <PremiumView />}
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
