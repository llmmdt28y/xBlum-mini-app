"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { Header } from "@/components/header"
import { HomeView } from "@/components/home-view"
import { SettingsView } from "@/components/settings-view"
import { StoreView } from "@/components/store-view"
import { PremiumView } from "@/components/premium-view"

function AppContent() {
  const { currentView } = useApp()

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
