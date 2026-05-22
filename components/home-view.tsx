"use client"

import { useApp } from "@/lib/app-context"
import {
  ChevronRight,
  CalendarDays,
  Plus,
  Bot,
  Briefcase
} from "lucide-react"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useState } from "react"

const SF =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"

const SFD =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"

const CONNECTORS = [
  {
    name: "Gmail",
    src: "/gmail.png"
  },
  {
    name: "Google Drive",
    src: "/google-drive.png"
  },
  {
    name: "Google Calendar",
    src: "/google-calendar.png"
  }
]

function InteractiveNCoin() {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const glowX = useTransform(rotateY, [-45, 45], [-20, 20])
  const glowY = useTransform(rotateX, [-45, 45], [20, -20])

  function handleMove(e: any) {
    const rect = e.currentTarget.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    rotateY.set(((x - centerX) / centerX) * 18)
    rotateX.set(-((y - centerY) / centerY) * 18)
  }

  function reset() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div className="relative flex items-center justify-center pt-6 pb-10">

      {/* glow */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)",
        }}
      />

      {/* stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2 + "px",
              height: Math.random() * 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      {/* hand */}
      <img
        src="/hand-glow.png"
        alt=""
        draggable={false}
        className="absolute bottom-0 w-[220px] opacity-95 pointer-events-none"
        style={{
          filter:
            "drop-shadow(0 0 30px rgba(255,255,255,0.25))",
        }}
      />

      {/* coin */}
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onTouchEnd={reset}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="relative z-10 w-[180px] h-[180px]"
      >
        {/* glow */}
        <motion.div
          style={{
            x: glowX,
            y: glowY,
          }}
          className="absolute inset-0 rounded-full blur-2xl opacity-70"
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* coin */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(145deg, #1c1c1f 0%, #050505 100%)",
            border: "2px solid rgba(255,255,255,0.14)",
            boxShadow:
              `
              inset 0 1px 0 rgba(255,255,255,0.15),
              inset 0 -20px 30px rgba(0,0,0,0.8),
              0 20px 60px rgba(0,0,0,0.7),
              0 0 30px rgba(255,255,255,0.08)
              `,
          }}
        >
          <div className="absolute inset-[-6px] rounded-full border border-white/10" />
          <div className="absolute inset-[-12px] rounded-full border border-white/5" />

          <div
            className="text-white text-[92px] font-black"
            style={{
              fontFamily: "Georgia",
              textShadow:
                "0 0 15px rgba(255,255,255,0.35)",
            }}
          >
            N
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function GlassCard({
  children,
  className = "",
}: any) {
  return (
    <div
      className={`rounded-[30px] ${className}`}
      style={{
        background: "rgba(18,18,18,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 10px 50px rgba(0,0,0,0.55)",
      }}
    >
      {children}
    </div>
  )
}

export function HomeView() {
  const { setCurrentView } = useApp()

  const [businessOpen, setBusinessOpen] =
    useState(false)

  const [botOpen, setBotOpen] = useState(false)

  return (
    <div
      className="min-h-screen w-full px-4 pb-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, #161616 0%, #050505 35%, #000 100%)",
      }}
    >
      <div className="max-w-md mx-auto pt-10">

        {/* HERO */}
        <div className="relative mb-6">

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "url('/noise.png')",
              backgroundSize: "120px",
            }}
          />

          <div className="relative z-10">

            <div className="mb-5">
              <p
                className="text-[#8e8e93] text-sm"
                style={{ fontFamily: SF }}
              >
                Your AI ecosystem
              </p>

              <h1
                className="text-white text-[42px] font-bold leading-[1]"
                style={{
                  fontFamily: SFD,
                  letterSpacing: "-0.04em",
                }}
              >
                N Universe
              </h1>
            </div>

            <InteractiveNCoin />
          </div>
        </div>

        {/* SCHEDULE */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center gap-4">

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "rgba(255,255,255,0.05)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CalendarDays className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2
                  className="text-white text-[24px] font-bold"
                  style={{ fontFamily: SFD }}
                >
                  Schedules
                </h2>

                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </div>
              </div>

              <div
                className="mt-2 px-4 py-2 rounded-full inline-flex items-center gap-2"
                style={{
                  background:
                    "rgba(0,0,0,0.35)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />

                <span
                  className="text-white/85 text-[14px]"
                  style={{ fontFamily: SF }}
                >
                  Relax • No upcoming events
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CONNECTORS */}
        <GlassCard className="p-5 mb-4">

          <div className="mb-5">
            <h2
              className="text-white text-[24px] font-bold"
              style={{ fontFamily: SFD }}
            >
              Connectors
            </h2>

            <p
              className="text-[#8e8e93] text-[14px] mt-1"
              style={{ fontFamily: SF }}
            >
              Extend capabilities with your apps
            </p>
          </div>

          <div className="space-y-4">
            {CONNECTORS.map((connector) => (
              <div
                key={connector.name}
                className="flex items-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <img
                    src={connector.src}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                </div>

                <div className="flex-1">
                  <p
                    className="text-white text-[17px] font-medium"
                    style={{ fontFamily: SF }}
                  >
                    {connector.name}
                  </p>
                </div>

                <button
                  className="px-5 py-2 rounded-full text-white text-[14px]"
                  style={{
                    background:
                      "rgba(255,255,255,0.06)",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  View
                </button>
              </div>
            ))}
          </div>

          <button
            className="mt-6 w-full py-4 rounded-[22px] flex items-center justify-center gap-2 text-white"
            style={{
              background:
                "rgba(255,255,255,0.04)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Plus className="w-5 h-5" />
            Add connection
          </button>
        </GlassCard>

        {/* TOOLS */}
        <GlassCard className="p-5">

          <div className="mb-5">
            <h2
              className="text-white text-[24px] font-bold"
              style={{ fontFamily: SFD }}
            >
              AI Tools
            </h2>

            <p
              className="text-[#8e8e93] text-[14px] mt-1"
              style={{ fontFamily: SF }}
            >
              Automate your ecosystem
            </p>
          </div>

          <div className="space-y-4">

            <button
              onClick={() =>
                setBusinessOpen(true)
              }
              className="w-full p-4 rounded-[24px] flex items-center gap-4 text-left"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "rgba(59,130,246,0.12)",
                }}
              >
                <Briefcase className="w-6 h-6 text-[#3b82f6]" />
              </div>

              <div className="flex-1">
                <p
                  className="text-white text-[17px] font-semibold"
                  style={{ fontFamily: SF }}
                >
                  Business Agent
                </p>

                <p className="text-[#8e8e93] text-[13px] mt-1">
                  Auto reply & moderation
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

            <button
              onClick={() => setBotOpen(true)}
              className="w-full p-4 rounded-[24px] flex items-center gap-4 text-left"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "rgba(168,85,247,0.12)",
                }}
              >
                <Bot className="w-6 h-6 text-[#a855f7]" />
              </div>

              <div className="flex-1">
                <p
                  className="text-white text-[17px] font-semibold"
                  style={{ fontFamily: SF }}
                >
                  Group Agent
                </p>

                <p className="text-[#8e8e93] text-[13px] mt-1">
                  AI moderation system
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>

          </div>
        </GlassCard>

      </div>
    </div>
  )
}
