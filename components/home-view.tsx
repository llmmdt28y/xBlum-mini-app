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
  Plus,
  Building
} from "lucide-react"

// Definición de tipos para el componente model-viewer (para evitar errores de TypeScript)
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
  const { t, setCurrentView } = useApp()
  const [activeTab, setActiveTab] = useState('Home')

  // Efecto para cargar el script de model-viewer dinámicamente si no está presente
  useEffect(() => {
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script")
      script.type = "module"
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
      document.head.appendChild(script)
    }
  }, [])

  // Datos mock para la UI
  const actionButtons = [
    { name: 'Recargar', icon: PlusCircle },
    { name: 'Enviar', icon: ArrowUpCircle },
    { name: 'Pagar', icon: ScanLine },
    { name: 'Retirar', icon: ArrowDownToLine },
  ]

  const recentActivity = [
    { id: 1, title: 'Pago de servicio', subtitle: 'Martes, 11 de Mayo', amount: '-$50.00', positive: false },
    { id: 2, title: 'Transferencia recibida', subtitle: 'Lunes, 10 de Mayo', amount: '+$100.00', positive: true },
    { id: 3, title: 'Compra Restaurante', subtitle: 'Lunes, 10 de Mayo', amount: '-$35.20', positive: false },
  ]

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Tarjetas', icon: CreditCard },
    { name: 'Actividad', icon: Clock },
    { name: 'Perfil', icon: User },
  ]

  return (
    // Contenedor principal con fondo oscuro
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white font-sans pb-[90px]">
      
      {/* --- Header --- */}
      <header className="flex justify-between items-center p-6 mt-2">
        <h1 className="text-3xl font-bold tracking-tight">Home1</h1>
        <button className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
          <Bell className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* --- Contenedor de Balance (Tarjeta Blanca) --- */}
      <div className="mx-6 relative bg-white rounded-3xl h-[190px] flex overflow-hidden shadow-xl shadow-black/20">
        
        {/* Sección de texto (Izquierda) */}
        <div className="flex-1 flex flex-col justify-center p-7 z-10 text-neutral-900">
          <p className="text-sm font-medium text-neutral-500">Total balance</p>
          <h2 className="text-5xl font-extrabold mt-1 tracking-tighter">$150</h2>
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="bg-emerald-100 text-emerald-600 rounded-full p-0.5">
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className="text-emerald-600 text-sm font-bold">
              $2.50 vs yesterday
            </span>
          </div>
        </div>

        {/* Sección Gráfica (Derecha) con Mano y Moneda 3D Giratoria */}
        <div className="w-[160px] relative bg-sky-500 flex items-center justify-center">
          {/* Imagen de fondo (Mano y puntos). Colocar en public/hand_graphic.png */}
          <div 
            className="absolute inset-0 z-0 bg-no-repeat bg-contain bg-center opacity-90"
            style={{ backgroundImage: "url('/hand_graphic.png')" }}
          />

          {/* --- Moneda 3D Interactiva --- */}
          {/* Requiere archivo en public/coin.glb. Auto-rota y permite control manual */}
          <div className="absolute w-[140px] h-[140px] z-10 -top-2">
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
      </div>

      {/* --- Botones de Acción Rápida (Circulares) --- */}
      <div className="flex justify-between px-6 mt-9 mb-6 gap-2">
        {actionButtons.map((btn, index) => (
          <button key={index} className="flex flex-col items-center gap-3 active:scale-95 transition-transform group">
            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center shadow-md group-hover:bg-neutral-100 transition-colors">
              <btn.icon className="w-8 h-8 text-sky-600" strokeWidth={2} />
            </div>
            <span className="text-white text-xs font-medium tracking-wide group-hover:text-sky-400 transition-colors">
              {btn.name}
            </span>
          </button>
        ))}
      </div>

      {/* --- Sección de Última Actividad --- */}
      <div className="flex-1 px-6 mt-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">Última actividad1</h3>
          <button className="text-sky-500 text-sm font-semibold hover:text-sky-400">
            Ver más
          </button>
        </div>

        {/* Lista de items de actividad */}
        <div className="space-y-3.5">
          {recentActivity.map(item => (
            <div key={item.id} className="flex items-center bg-white p-4.5 rounded-2xl shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6 text-neutral-600" />
              </div>
              
              <div className="flex-1 px-4 min-w-0">
                <p className="text-neutral-950 font-semibold text-base truncate">{item.title}</p>
                <p className="text-neutral-500 text-sm mt-0.5">{item.subtitle}</p>
              </div>
              
              <div className="shrink-0 text-right">
                <p className={`font-bold text-lg ${item.positive ? 'text-emerald-600' : 'text-neutral-950'}`}>
                  {item.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Barra de Navegación Inferior (Blanca, Fija) --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white h-[85px] rounded-t-[28px] flex justify-around items-start pt-3.5 px-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className="flex flex-col items-center gap-1.5 w-[70px] active:scale-95 transition-transform"
          >
            <item.icon 
              className={`w-6 h-6 ${activeTab === item.name ? 'text-sky-600' : 'text-neutral-400'}`} 
              strokeWidth={activeTab === item.name ? 2.5 : 2}
            />
            <span className={`text-[11px] font-semibold ${activeTab === item.name ? 'text-sky-600' : 'text-neutral-400'}`}>
              {item.name}
            </span>
          </button>
        ))}
      </nav>
      
    </div>
  )
}
