"use client"

import React, { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { 
  Bell, 
  PlusCircle, 
  ArrowUpCircle, 
  ScanLine, 
  ArrowDownToLine,
  Home, 
  CreditCard, 
  Clock, 
  User, 
  Landmark, 
  Plus 
} from "lucide-react"

// Declaración de TypeScript para evitar errores con la etiqueta personalizada de model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'rotation-per-second'?: string;
        'interaction-prompt'?: string;
      };
    }
  }
}

export function HomeView() {
  const { t, setCurrentView } = useApp() // Mantenemos tu contexto por si lo necesitas
  const [activeTab, setActiveTab] = useState('Home')

  // Inyectar el script de model-viewer dinámicamente para el modelo 3D
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script")
      script.type = "module"
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
      document.head.appendChild(script)
    }
  }, [])

  const actionButtons = [
    { name: 'Recargar', icon: PlusCircle },
    { name: 'Enviar', icon: ArrowUpCircle },
    { name: 'Pagar', icon: ScanLine },
    { name: 'Retirar', icon: ArrowDownToLine },
  ]

  const recentActivity = [
    { id: 1, title: 'Pago de servicio', subtitle: 'Martes, 11 de Mayo', amount: '-$50.00' },
    { id: 2, title: 'Transferencia recibida', subtitle: 'Lunes, 10 de Mayo', amount: '+$100.00' },
  ]

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Tarjetas', icon: CreditCard },
    { name: 'Actividad', icon: Clock },
    { name: 'Perfil', icon: User },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1D24] text-white font-sans pb-[100px] overflow-y-auto w-full relative">
      
      {/* --- Header --- */}
      <header className="flex justify-between items-center px-6 py-5 mt-4">
        <h1 className="text-[28px] font-bold tracking-tight">Home</h1>
        <button className="p-2 active:opacity-70 transition-opacity">
          <Bell className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* --- Main Balance Container --- */}
      <div className="mx-5 relative bg-[#D0E7FF] rounded-[28px] h-[240px] overflow-hidden shadow-lg">
        
        {/* Textos del balance */}
        <div className="relative z-10 p-7">
          <p className="text-[#555] text-[15px] font-medium">Total balance</p>
          <h2 className="text-black text-[42px] font-extrabold mt-1 leading-none tracking-tight">$150</h2>
          <div className="flex items-center gap-1 mt-2">
            <div className="bg-[#4CAF50]/20 rounded-full p-0.5">
              <Plus className="w-3 h-3 text-[#4CAF50]" strokeWidth={3} />
            </div>
            <span className="text-[#4CAF50] text-[13px] font-bold tracking-wide">
              $2.50 vs yesterday
            </span>
          </div>
        </div>

        {/* Fondo: Mano y Puntos (Asegúrate de tener esta imagen en public/) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-90"
          style={{
            backgroundImage: "url('/background_graphic.png')", 
            backgroundSize: '120%', 
            backgroundPosition: 'bottom -20px right -30px',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* --- Moneda 3D Interactiva --- */}
        <div className="absolute -top-4 right-0 w-[180px] h-[180px] z-20">
          <model-viewer
            src="/coin.glb"
            auto-rotate
            camera-controls
            disable-zoom
            shadow-intensity="1"
            environment-image="neutral"
            rotation-per-second="30deg"
            interaction-prompt="none"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent', outline: 'none' }}
          ></model-viewer>
        </div>
      </div>

      {/* --- Quick Action Buttons --- */}
      <div className="flex justify-between px-6 mt-8 mb-4">
        {actionButtons.map((btn, index) => (
          <button key={index} className="flex flex-col items-center gap-2.5 active:scale-95 transition-transform">
            <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center shadow-md">
              <btn.icon className="w-7 h-7 text-[#007AFF]" strokeWidth={2} />
            </div>
            <span className="text-white text-[13px] font-medium tracking-wide">{btn.name}</span>
          </button>
        ))}
      </div>

      {/* --- Recent Activity Section --- */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[19px] font-bold text-white tracking-wide">Última actividad</h3>
          <button className="text-[#007AFF] text-[15px] font-medium active:opacity-70 transition-opacity">
            Ver más
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {recentActivity.map(item => (
            <div key={item.id} className="flex items-center bg-white p-4 rounded-[20px] shadow-sm">
              <div className="w-[46px] h-[46px] rounded-full bg-[#F2F2F7] flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5 text-[#555]" strokeWidth={2} />
              </div>
              
              <div className="flex-1 px-4 min-w-0">
                <p className="text-black font-semibold text-[15px] truncate">{item.title}</p>
                <p className="text-[#8E8E93] text-[13px] mt-0.5">{item.subtitle}</p>
              </div>
              
              <div className="shrink-0 text-right">
                <p className={`font-bold text-[16px] ${item.amount.startsWith('+') ? 'text-[#4CAF50]' : 'text-black'}`}>
                  {item.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white h-[85px] rounded-t-[30px] flex justify-around items-start pt-4 px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className="flex flex-col items-center gap-1.5 w-[70px] active:scale-95 transition-transform"
          >
            <item.icon 
              className={`w-[26px] h-[26px] ${activeTab === item.name ? 'text-[#007AFF]' : 'text-[#A0A0A0]'}`} 
              strokeWidth={activeTab === item.name ? 2.5 : 2}
            />
            <span className={`text-[11px] font-medium ${activeTab === item.name ? 'text-[#007AFF]' : 'text-[#A0A0A0]'}`}>
              {item.name}
            </span>
          </button>
        ))}
      </nav>
      
    </div>
  )
}
