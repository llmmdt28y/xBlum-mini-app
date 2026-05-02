"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback } from "react"
import { Loader2, MessageSquare, Shield, ChevronRight, RefreshCw, Save, Edit3 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// --- Helpers de Telegram y API ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTg(): any {
  if (typeof window === "undefined") return undefined
  return (window as any).Telegram?.WebApp
}

async function apiGet(endpoint: string) {
  const tg = getTg()
  const initData = tg?.initData ?? ""
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "x-init-data": initData },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function apiPost(endpoint: string, body: Record<string, unknown>) {
  const tg = getTg()
  const initData = tg?.initData ?? ""
  const userId = tg?.initDataUnsafe?.user?.id ?? null
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// --- Componentes UI Reutilizables ---

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-[44px] h-[24px] rounded-full p-[2px] cursor-pointer transition-colors duration-300 ease-in-out ${checked ? 'bg-white' : 'bg-[#39393d]'}`}
    >
      <div 
        className={`w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-[20px] bg-black' : 'translate-x-0 bg-white'}`} 
      />
    </div>
  )
}

function SegmentedControl({ options, selected, onChange }: { options: {label: string, value: string}[], selected: string, onChange: (v: string) => void }) {
  return (
    <div className="flex p-[3px] rounded-xl w-full" style={{ background: "#1c1c1e" }}>
      {options.map(opt => {
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 py-1.5 text-[13px] font-medium rounded-[9px] transition-all duration-200"
            style={{
              background: isActive ? "#3a3a3c" : "transparent",
              color: isActive ? "#fff" : "#8e8e93",
              boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              fontFamily: SF
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Tipos ---
type GroupInfo = {
  chat_id: number
  chat_title: string
  total_msgs: number
  updated_at: string
}

type GroupMember = {
  user_id: number
  username: string
  first_name: string
  msg_count: number
  warn_count: number
  join_label: string
  tag_text: string
  tag_source: string
}

export function AnalyticsView() {
  const { setCurrentView } = useApp()
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  
  const [activeGroup, setActiveGroup] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"settings" | "members">("settings")
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [saving, setSaving] = useState(false)
  const [refreshingTags, setRefreshingTags] = useState(false)

  const [editingTag, setEditingTag] = useState<{uid: number, tag: string} | null>(null)

  const loadGroupsList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet("/api/group_admin_list")
      setGroups(data.groups || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroupsList()
  }, [loadGroupsList])

  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    const handleBack = () => {
      if (activeGroup) {
        setActiveGroup(null)
        setSettings(null)
        loadGroupsList() 
      } else {
        setCurrentView("home")
        tg.BackButton.hide()
      }
    }

    tg.BackButton.show()
    tg.BackButton.onClick(handleBack)
    
    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [activeGroup, setCurrentView, loadGroupsList])

  const loadGroupDetail = useCallback(async (chatId: number) => {
    setLoading(true)
    setActiveGroup(chatId)
    try {
      const [setRes, statRes, memRes] = await Promise.all([
        apiGet(`/api/group_settings/${chatId}`),
        apiGet(`/api/group_stats/${chatId}`),
        apiGet(`/api/group_members/${chatId}`)
      ])
      setSettings(setRes)
      setStats(statRes)
      setMembers(memRes.members || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSaveSettings = async () => {
    if (!activeGroup || !settings) return
    setSaving(true)
    try {
      await apiPost("/api/group_settings", { chat_id: activeGroup, ...settings })
      const tg = getTg()
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success")
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleRefreshTags = async () => {
    if (!activeGroup) return
    setRefreshingTags(true)
    try {
      await apiPost("/api/group_tag_refresh", { chat_id: activeGroup })
      const tg = getTg()
      if (tg?.showAlert) tg.showAlert("Tag refresh started in background.")
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshingTags(false)
    }
  }

  const handleSaveTag = async () => {
    if (!editingTag || !activeGroup) return
    try {
      await apiPost("/api/group_tag", { chat_id: activeGroup, user_id: editingTag.uid, tag: editingTag.tag })
      setMembers(m => m.map(x => x.user_id === editingTag.uid ? { ...x, tag_text: editingTag.tag, tag_source: "admin_manual" } : x))
      setEditingTag(null)
      const tg = getTg()
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success")
    } catch (e) {
      console.error(e)
    }
  }

  const handleAutoScan = async () => {
    setRegistering(true)
    try {
      const res = await apiPost("/api/group_auto_scan", {})
      if (res.found > 0) {
        getTg()?.HapticFeedback?.notificationOccurred("success")
        alert(`Success! Found and linked ${res.found} group(s).`)
        await loadGroupsList() 
      } else {
        getTg()?.HapticFeedback?.notificationOccurred("warning")
        alert("No missing groups found. Make sure xBlum has seen at least one message in the group.")
      }
    } catch (e) {
      console.error(e)
      alert("An error occurred while scanning.")
    } finally {
      setRegistering(false)
    }
  }

  if (loading && !activeGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#48484a]" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative" style={{ background: "#000", minHeight: "100vh" }}>
      
      <div
        className="sticky top-0 z-30 flex items-center justify-center px-4"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <h2 className="font-bold text-white text-[16px] truncate" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>
          {activeGroup ? (stats?.chat_title || "Group Settings") : "My Groups"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        
        {!activeGroup && (
          <div className="space-y-6">
            <p className="text-[#636366] text-[14px] leading-snug px-1" style={{ fontFamily: SF }}>
              Manage AI moderation rules, anti-flood systems, and automatic member tags for your groups.
            </p>

            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-10 pb-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                  <Shield className="w-8 h-8 text-[#3a3a3c]" />
                </div>
                <p className="text-[#48484a] text-[15px] max-w-[240px]" style={{ fontFamily: SF }}>
                  No groups found. Add xBlum as an admin to your Telegram group to configure it here.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                {groups.map((g, idx) => (
                  <div key={g.chat_id}>
                    {idx > 0 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "64px" }} />}
                    <button 
                      onClick={() => loadGroupDetail(g.chat_id)}
                      className="w-full flex items-center gap-4 p-4 active:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] flex items-center justify-center font-bold text-white text-lg">
                        {g.chat_title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-[16px] truncate" style={{ fontFamily: SF }}>{g.chat_title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[#8e8e93] text-[12px]" style={{ fontFamily: SF }}>
                            <MessageSquare className="w-3 h-3" /> {g.total_msgs.toLocaleString()}
                          </span>
                          {!g.updated_at && (
                            <span className="text-amber-500 text-[11px] font-medium" style={{ fontFamily: SF }}>New group</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#3a3a3c]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#3b82f6]" />
                  <p className="text-[13px] font-medium text-white" style={{ fontFamily: SF }}>Auto-Scan Groups</p>
                </div>
                <p className="text-[11px] mb-4" style={{ color: "#636366", fontFamily: SF }}>
                  Missing a group? We can scan the database and auto-link groups where you are the Creator and xBlum is present.
                </p>
                <button
                  onClick={handleAutoScan}
                  disabled={registering}
                  className="w-full py-3 rounded-xl text-white font-medium text-[13px] active:opacity-70 flex items-center justify-center gap-2 transition-colors"
                  style={{ background: "#3b82f6", fontFamily: SF }}
                >
                  {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {registering ? "Scanning databases..." : "Scan & Link My Groups"}
                </button>
              </div>
            </div>

          </div>
        )}

        {activeGroup && !loading && settings && (
          <div className="space-y-6">
            <div className="flex p-1 rounded-xl" style={{ background: "#1c1c1e" }}>
              <button 
                onClick={() => setActiveTab("settings")}
                className="flex-1 py-2 text-[14px] font-semibold rounded-[10px] transition-all"
                style={{ 
                  background: activeTab === "settings" ? "#fff" : "transparent",
                  color: activeTab === "settings" ? "#000" : "#8e8e93",
                  fontFamily: SF 
                }}
              >
                Settings
              </button>
              <button 
                onClick={() => setActiveTab("members")}
                className="flex-1 py-2 text-[14px] font-semibold rounded-[10px] transition-all"
                style={{ 
                  background: activeTab === "members" ? "#fff" : "transparent",
                  color: activeTab === "members" ? "#000" : "#8e8e93",
                  fontFamily: SF 
                }}
              >
                Members
              </button>
            </div>

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[#48484a] text-[12px] font-bold uppercase tracking-wider px-1" style={{ fontFamily: SF }}>AI Moderation</h3>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                    <div className="p-4 space-y-3">
                      <p className="text-white text-[15px] font-medium" style={{ fontFamily: SF }}>Custom Rules (Natural Language)</p>
                      <textarea 
                        value={settings.natural_rules}
                        onChange={(e) => setSettings({...settings, natural_rules: e.target.value})}
                        placeholder="e.g. No crypto links, be polite, only English..."
                        className="w-full h-24 bg-[#1c1c1e] rounded-xl p-3 text-white text-[14px] outline-none resize-none placeholder-[#48484a]"
                        style={{ fontFamily: SF }}
                      />
                    </div>
                    <div style={{ height: "0.5px", background: "#1e1e1e" }} />
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Sensitivity</p>
                          <p className="text-[#636366] text-[12px]" style={{ fontFamily: SF }}>How strict the AI should be</p>
                        </div>
                      </div>
                      <SegmentedControl 
                        options={[
                          { label: "Soft", value: "soft" },
                          { label: "Balanced", value: "balanced" },
                          { label: "Strict", value: "strict" }
                        ]}
                        selected={settings.sensitivity}
                        onChange={v => setSettings({...settings, sensitivity: v})}
                      />
                    </div>
                    <div style={{ height: "0.5px", background: "#1e1e1e" }} />
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Adapt to Group Context</p>
                        <p className="text-[#636366] text-[12px]" style={{ fontFamily: SF }}>AI learns from chat history</p>
                      </div>
                      <Switch 
                        checked={settings.adapt_to_group} 
                        onChange={(v) => setSettings({...settings, adapt_to_group: v})} 
                      />
                    </div>
                    {settings.adapt_to_group && (
                      <div className="px-4 pb-4">
                        <textarea 
                          value={settings.group_context}
                          onChange={e => setSettings({...settings, group_context: e.target.value})}
                          placeholder="Describe the group's normal tone so the AI avoids false positives..."
                          className="w-full bg-[#1c1c1e] text-white text-[14px] rounded-xl p-3 outline-none resize-none h-20 placeholder-[#48484a]"
                          style={{ fontFamily: SF }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#48484a] text-[12px] font-bold uppercase tracking-wider px-1" style={{ fontFamily: SF }}>Anti-Flood</h3>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                    <div className="p-4 flex items-center justify-between">
                      <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Enable Anti-Flood</p>
                      <Switch 
                        checked={settings.flood_enabled} 
                        onChange={(v) => setSettings({...settings, flood_enabled: v})} 
                      />
                    </div>
                    {settings.flood_enabled && (
                      <>
                        <div style={{ height: "0.5px", background: "#1e1e1e" }} />
                        <div className="p-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[#8e8e93] text-[12px] mb-1.5" style={{ fontFamily: SF }}>Window (sec)</p>
                            <input 
                              type="number"
                              value={settings.flood_window_sec}
                              onChange={(e) => setSettings({...settings, flood_window_sec: parseInt(e.target.value)})}
                              className="w-full bg-[#1c1c1e] rounded-lg p-2.5 text-white text-[15px] outline-none text-center"
                            />
                          </div>
                          <div>
                            <p className="text-[#8e8e93] text-[12px] mb-1.5" style={{ fontFamily: SF }}>Max Messages</p>
                            <input 
                              type="number"
                              value={settings.flood_max_msgs}
                              onChange={(e) => setSettings({...settings, flood_max_msgs: parseInt(e.target.value)})}
                              className="w-full bg-[#1c1c1e] rounded-lg p-2.5 text-white text-[15px] outline-none text-center"
                            />
                          </div>
                        </div>
                        <div style={{ height: "0.5px", background: "#1e1e1e" }} />
                        <div className="p-4 flex flex-col gap-3">
                          <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Action</p>
                          <SegmentedControl 
                            options={[
                              { label: "Warn", value: "warn" },
                              { label: "Mute (2m)", value: "mute" },
                              { label: "Delete", value: "delete" }
                            ]}
                            selected={settings.flood_action}
                            onChange={v => setSettings({...settings, flood_action: v})}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[#48484a] text-[12px] font-bold uppercase tracking-wider px-1" style={{ fontFamily: SF }}>Member Tags</h3>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                    <div className="p-4 flex items-center justify-between">
                      <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Enable Auto-Tags</p>
                      <Switch 
                        checked={settings.auto_tags_enabled} 
                        onChange={(v) => setSettings({...settings, auto_tags_enabled: v})} 
                      />
                    </div>
                    {settings.auto_tags_enabled && (
                      <>
                        <div style={{ height: "0.5px", background: "#1e1e1e" }} />
                        <div className="p-4 flex flex-col gap-3">
                          <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Mode</p>
                          <SegmentedControl 
                            options={[
                              { label: "Activity", value: "activity" },
                              { label: "Join Date", value: "join_date" },
                              { label: "Custom", value: "custom" }
                            ]}
                            selected={settings.tag_mode}
                            onChange={v => setSettings({...settings, tag_mode: v})}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-[0.98] mt-4"
                  style={{ background: "#fff", color: "#000", fontFamily: SFD }}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                <button 
                  onClick={handleRefreshTags}
                  disabled={refreshingTags}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1c1c1e] text-white text-[14px] font-medium active:opacity-60 transition-opacity"
                  style={{ fontFamily: SF }}
                >
                  {refreshingTags ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Refresh All Tags
                </button>

                <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                  {members.map((m, idx) => (
                    <div key={m.user_id}>
                      {idx > 0 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "16px" }} />}
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center font-bold text-white/50 text-sm">
                          {m.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-[15px] truncate" style={{ fontFamily: SF }}>{m.first_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[#8e8e93] text-[12px]" style={{ fontFamily: SF }}>
                              {m.msg_count} msgs
                            </p>
                            <span className="text-[#48484a] text-[10px]">â€¢</span>
                            <p className="text-[#8e8e93] text-[12px]" style={{ fontFamily: SF }}>
                              {m.join_label}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEditingTag({uid: m.user_id, tag: m.tag_text || ""})}
                          className="shrink-0 flex flex-col items-end pl-2 active:opacity-60"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] font-medium px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.08)", color: "#e5e5ea", fontFamily: SF }}>
                              {m.tag_text || "No tag"}
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-[#636366]" />
                          </div>
                          {m.tag_source === "admin_manual" && <span className="text-[#f59e0b] text-[10px] mt-1 mr-1">Manual</span>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      
      {editingTag !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#1c1c1e] rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold text-[16px] mb-3" style={{ fontFamily: SFD }}>Edit Custom Tag</h3>
            <p className="text-[13px] text-[#8e8e93] mb-4" style={{ fontFamily: SF }}>Set a custom tag for this member (Max 16 characters).</p>
            <input 
              autoFocus
              maxLength={16}
              value={editingTag.tag}
              onChange={e => setEditingTag({...editingTag, tag: e.target.value})}
              className="w-full bg-[#1c1c1e] text-white px-4 py-3 rounded-xl outline-none border border-[#2c2c2e] focus:border-white transition-colors mb-5"
              placeholder="e.g. ðŸ‘‘ Legend"
              style={{ fontFamily: SF }}
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingTag(null)} className="flex-1 py-3 rounded-xl text-white font-medium bg-[#1c1c1e] active:bg-[#2c2c2e]" style={{ fontFamily: SF }}>Cancel</button>
              <button onClick={handleSaveTag} className="flex-1 py-3 rounded-xl text-black font-medium bg-white active:bg-gray-200" style={{ fontFamily: SF }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
