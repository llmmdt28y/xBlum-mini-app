"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { Shield, MessageSquare, ChevronRight, Loader2, AlertTriangle } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

type GroupData = {
  chat_id: number
  chat_title: string
  total_msgs: number
  updated_at: string
}

export function AnalyticsView() {
  const { setCurrentView, setSelectedGroupId } = useApp()
  const [groups, setGroups] = useState<GroupData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGroups() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initData = (window as any).Telegram?.WebApp?.initData || ""
        const res = await fetch(`${API_BASE}/api/group_admin_list`, {
          headers: { "x-init-data": initData }
        })
        if (res.ok) {
          const data = await res.json()
          setGroups(data.groups || [])
        }
      } catch (e) {
        console.error("Failed to fetch groups", e)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  const handleGroupClick = (chatId: number) => {
    setSelectedGroupId(chatId)
    setCurrentView("group-settings")
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <h2 className="font-semibold text-white" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
          My Groups
        </h2>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6 relative">
        <p className="text-sm mb-2 leading-relaxed" style={{ color: "#636366", fontFamily: SF }}>
          Manage xBlum AI moderation and settings for groups where you are an admin.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#48484a" }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
            <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#48484a" }} />
            <p style={{ color: "#8e8e93", fontSize: "14px", fontFamily: SF, padding: "0 20px" }}>
              No groups found. Add xBlum to a group as admin to configure it here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
            {groups.map((g, i) => {
              const initials = g.chat_title.substring(0, 2).toUpperCase()
              return (
                <div key={g.chat_id}>
                  <button
                    onClick={() => handleGroupClick(g.chat_id)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-white text-[16px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                        {g.chat_title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1" style={{ fontSize: "12px", color: "#636366", fontFamily: SF }}>
                          <MessageSquare size={12} /> {g.total_msgs.toLocaleString()} msgs
                        </span>
                        {!g.updated_at && (
                          <span className="flex items-center gap-1 text-amber-500" style={{ fontSize: "12px", fontFamily: SF }}>
                            <AlertTriangle size={12} /> Not configured
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#48484a" }} />
                  </button>
                  {i < groups.length - 1 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "76px" }} />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
