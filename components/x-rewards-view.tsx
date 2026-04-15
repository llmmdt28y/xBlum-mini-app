"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Info, History, ChevronRight, ArrowDownRight, ArrowUpRight } from "lucide-react"

// ── Tipografía idéntica a Profile View ────────────────────────────────
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// Formateador para separar enteros de decimales
function formatBalanceParts(balance: number) {
  const rounded = balance.toFixed(2)
  const [integer, decimal] = rounded.split(".")
  return { integer, decimal }
}

export function XRewardsView() {
  const { setCurrentView } = useApp()
  
  // ── ESTADO DE BALANCE ──
  // Cambia este valor a 0 para ver cómo el botón se vuelve gris e inactivo
  const [availableBalance, setAvailableBalance] = useState(1250.75) 

  const hasFunds = availableBalance > 0
  const { integer, decimal } = formatBalanceParts(availableBalance)

  // ── Botón Nativo de Telegram ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    
    tg.BackButton.show()

    const handleBack = () => {
      // Regresa al perfil ya que las recompensas suelen depender de ahí
      setCurrentView("profile") 
      tg.BackButton.hide()
    }
    
    tg.BackButton.onClick(handleBack)
    
    return () => { 
      tg.BackButton.offClick(handleBack) 
    }
  }, [setCurrentView])

  function handleWithdraw() {
    if (!hasFunds) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    tg?.showAlert("Opening withdrawal portal...")
  }

  // Propiedades de protección para imágenes
  const imageProps = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    style: { WebkitTouchCallout: "none" as const, userSelect: "none" as const }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* Header Profile Style */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center px-4 pb-3"
        style={{
          paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <h2
          className="font-semibold text-white"
          style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}
        >
          $X Rewards
        </h2>
      </div>

      <div className="px-4 pt-6 pb-28 overflow-y-auto space-y-6">
        
        {/* ── TARJETA DE BALANCE ── */}
        <div 
          className="rounded-[24px] p-6 relative overflow-hidden"
          style={{ background: "#111", border: "1px solid #1c1c1e" }}
        >
          {/* Resplandor sutil de fondo para dar estilo premium */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Info */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p style={{ fontSize: "14px", color: "#8e8e93", fontFamily: SF, fontWeight: 500 }}>
              Available Balance
            </p>
            <button className="active:opacity-60 transition-opacity">
              <Info size={18} style={{ color: "#48484a" }} />
            </button>
          </div>

          {/* Balance Display */}
          <div className="flex items-end gap-3 mb-6 relative z-10">
            {/* Asegúrate de ajustar el src de la imagen a como lo guardaste en public/ */}
            <img 
              src="/xblum2-icon.png" 
              alt="$X" 
              className="w-[52px] h-[52px] object-contain pointer-events-none select-none shrink-0"
              style={{ filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.08))" }}
              {...imageProps}
            />
            
            <div className="flex items-baseline gap-0.5">
              <span style={{ fontSize: "44px", fontWeight: 800, color: "#fff", fontFamily: SFD, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {integer}
              </span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                .{decimal}
              </span>
              <span style={{ fontSize: "20px", fontWeight: 600, color: "#fff", fontFamily: SF, marginLeft: "4px" }}>
                $X
              </span>
            </div>
          </div>

          {/* Botón Withdraw Condicional */}
          <button
            onClick={handleWithdraw}
            disabled={!hasFunds}
            className="w-full h-14 rounded-[16px] font-bold flex items-center justify-center transition-all duration-200 relative z-10 active:scale-[0.98]"
            style={{
              fontFamily: SF,
              fontSize: "16px",
              background: hasFunds ? "#ffffff" : "#1c1c1e", 
              color: hasFunds ? "#000000" : "#636366",
              opacity: hasFunds ? 1 : 0.7,
              boxShadow: hasFunds ? "0 4px 16px rgba(255,255,255,0.15)" : "none",
            }}
          >
            Withdraw to Wallet
          </button>
        </div>

        {/* ── RECENT ACTIVITY ── */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}>
              Recent Activity
            </p>
            <button className="flex items-center gap-1 active:opacity-60 transition-opacity">
              <History size={13} style={{ color: "#636366" }} />
              <span style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>View All</span>
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
            {[
              { title: "Daily Check-in Reward", date: "Today, 09:15", amount: "+5.00", isOut: false },
              { title: "Referral Bonus (vertetigr)", date: "Yesterday, 18:30", amount: "+50.00", isOut: false },
              { title: "Withdrawal to TON Wallet", date: "24 Mar, 11:02", amount: "-100.00", isOut: true },
            ].map((tx, i, arr) => (
              <div key={i}>
                <div className="flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors cursor-pointer">
                  {/* Icono de transacción */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                    style={{ background: tx.isOut ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)" }}
                  >
                    {tx.isOut ? (
                      <ArrowUpRight size={20} style={{ color: "#ef4444" }} />
                    ) : (
                      <ArrowDownRight size={20} style={{ color: "#22c55e" }} />
                    )}
                  </div>
                  
                  {/* Detalles */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                      {tx.title}
                    </p>
                    <p className="mt-0.5" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                      {tx.date}
                    </p>
                  </div>

                  {/* Cantidad */}
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold" style={{ color: tx.isOut ? "#ef4444" : "#22c55e", fontFamily: SFD, letterSpacing: "-0.01em" }}>
                      {tx.amount} $X
                    </p>
                  </div>
                </div>
                {/* Divisor interno idéntico a ProfileView */}
                {i < arr.length - 1 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "68px" }} />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
