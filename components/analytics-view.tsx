"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback } from "react"
import { Loader2, Users, Settings2, MessageSquare, Shield, ChevronRight, ArrowLeft, RefreshCw, Save, Edit3 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// --- Helpers de Telegram y API ---
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
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// --- Componentes UI Reutilizables ---
function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-[44px] h-[24px] rounded-full p-[2px] cursor-pointer transition-colors duration-300 ease-in-out ${checked ? 'bg-[#34c759]' : 'bg-[#39393d]'}`}
    >
      <div className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </div>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="px-1 mb-2" style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#48484a", fontFamily: SF }}>
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
        {children}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "20px" }} />
}

// --- Vista Principal ---
export function AnalyticsView() {
  const { setCurrentView } = useApp()
  const [viewState, setViewState] = useState<"list" | "settings" | "members">("list")
  const [activeGroup, setActiveGroup] = useState<any>(null)
  
  const [groups, setGroups] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Settings State
  const [settings, setSettings] = useState<any>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [saving, setSaving] = useState(false)

  // Members State
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Telegram Back Button Management
  useEffect(() => {
    const tg = getTg()
    if (!tg?.BackButton) return

    if (viewState !== "list") {
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }

    const handleBack = () => {
      if (viewState === "settings" || viewState === "members") {
        setViewState("list")
        setActiveGroup(null)
      } else {
        setCurrentView("home")
      }
    }
    tg.BackButton.onClick(handleBack)
    return () => { tg.BackButton.offClick(handleBack) }
  }, [viewState, setCurrentView])

  // Cargar lista de grupos
  useEffect(() => {
    if (viewState !== "list") return
    setLoadingList(true)
    apiGet("/api/group_admin_list")
      .then(res => setGroups(res.groups || []))
      .catch(console.error)
      .finally(() => setLoadingList(false))
  }, [viewState])

  // Abrir un grupo
  const openGroup = async (group: any) => {
    setActiveGroup(group)
    setViewState("settings")
    setLoadingSettings(true)
    try {
      const s = await apiGet(`/api/group_settings/${group.chat_id}`)
      setSettings(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSettings(false)
    }
  }

  // Cargar miembros
  const loadMembers = async () => {
    setViewState("members")
    setLoadingMembers(true)
    try {
      const res = await apiGet(`/api/group_members/${activeGroup.chat_id}`)
      setMembers(res.members || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMembers(false)
    }
  }

  // Guardar configuraciones
  const saveSettings = async () => {
    setSaving(true)
    try {
      await apiPost("/api/group_settings", {
        chat_id: activeGroup.chat_id,
        ...settings
      })
      getTg()?.HapticFeedback?.notificationOccurred("success")
    } catch (e) {
      console.error(e)
      getTg()?.HapticFeedback?.notificationOccurred("error")
    } finally {
      setSaving(false)
    }
  }

  // Refrescar tags
  const refreshAllTags = async () => {
    try {
      await apiPost("/api/group_tag_refresh", { chat_id: activeGroup.chat_id })
      getTg()?.HapticFeedback?.notificationOccurred("success")
      alert("Tag refresh started in background!")
    } catch (e) {
      console.error(e)
    }
  }

  // Editar Tag de un miembro individual
  const editMemberTag = async (user_id: number, currentTag: string) => {
    const newTag = prompt("Enter new tag (max 16 chars):", currentTag)
    if (newTag === null || newTag.trim() === currentTag) return
    
    try {
      await apiPost("/api/group_tag", {
        chat_id: activeGroup.chat_id,
        user_id,
        tag: newTag.trim()
      })
      setMembers(prev => prev.map(m => m.user_id === user_id ? { ...m, tag_text: newTag.trim(), tag_source: "admin_manual" } : m))
      getTg()?.HapticFeedback?.notificationOccurred("success")
    } catch (e) {
      alert("Failed to update tag. Check bot permissions.")
    }
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* --- Header --- */}
      <div
        className="sticky top-0 z-30 flex items-center justify-center w-full px-4"
        style={{
          paddingTop: "var(--tg-safe-area-inset-top, 24px)",
          height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h2 className="font-semibold text-white text-base" style={{ fontFamily: SFD, letterSpacing: "-0.01em" }}>
          {viewState === "list" ? "My Groups" : activeGroup?.chat_title || "Group Settings"}
        </h2>
      </div>

      <div className="px-4 pt-5 pb-32">
        
        {/* --- VISTA: LISTA DE GRUPOS --- */}
        {viewState === "list" && (
          <>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: "#636366", fontFamily: SF }}>
              Manage AI moderation rules, anti-flood systems, and automatic member tags for your groups.
            </p>

            {loadingList ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#48484a]" /></div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "#48484a" }} />
                <p style={{ color: "#636366", fontSize: "14px", fontFamily: SF }}>
                  No groups found. Add xBlum as an admin to your Telegram group to configure it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map(g => {
                  const initials = (g.chat_title || "G").substring(0, 2).toUpperCase()
                  return (
                    <button
                      key={g.chat_id}
                      onClick={() => openGroup(g)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl active:opacity-70 transition-opacity"
                      style={{ background: "#111", border: "1px solid #1c1c1e" }}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-white" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                        {initials}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF }}>{g.chat_title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#636366", fontFamily: SF }}>
                          {g.total_msgs.toLocaleString()} messages analyzed
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#48484a" }} />
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* --- VISTA: SETTINGS DEL GRUPO --- */}
        {viewState === "settings" && settings && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Nav Tabs dentro del grupo */}
            <div className="flex rounded-xl p-1" style={{ background: "#111" }}>
              <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-white text-black" style={{ fontFamily: SF }}>
                Rules & Config
              </button>
              <button onClick={loadMembers} className="flex-1 py-2 rounded-lg text-sm font-medium text-[#636366]" style={{ fontFamily: SF }}>
                Members
              </button>
            </div>

            <Section title="AI Natural Rules">
              <div className="p-4">
                <textarea 
                  value={settings.natural_rules}
                  onChange={e => setSettings({...settings, natural_rules: e.target.value})}
                  placeholder="e.g. No crypto links, English only, keep it friendly..."
                  className="w-full bg-[#1c1c1e] text-white text-[15px] rounded-xl p-3 outline-none resize-none h-24 placeholder-[#48484a]"
                  style={{ fontFamily: SF }}
                />
              </div>
              <Divider />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Sensitivity</p>
                  <p className="text-[#636366] text-[12px]" style={{ fontFamily: SF }}>How strict the AI should be</p>
                </div>
                <select 
                  value={settings.sensitivity}
                  onChange={e => setSettings({...settings, sensitivity: e.target.value})}
                  className="bg-[#1c1c1e] text-white text-sm rounded-lg px-3 py-1.5 outline-none"
                >
                  <option value="soft">Soft</option>
                  <option value="balanced">Balanced</option>
                  <option value="strict">Strict</option>
                </select>
              </div>
              <Divider />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Adapt to Group</p>
                  <p className="text-[#636366] text-[12px]" style={{ fontFamily: SF }}>AI learns context</p>
                </div>
                <Switch checked={settings.adapt_to_group} onChange={v => setSettings({...settings, adapt_to_group: v})} />
              </div>
              {settings.adapt_to_group && (
                <div className="px-4 pb-4">
                  <textarea 
                    value={settings.group_context}
                    onChange={e => setSettings({...settings, group_context: e.target.value})}
                    placeholder="Describe the group's culture or context..."
                    className="w-full bg-[#1c1c1e] text-white text-[14px] rounded-xl p-3 outline-none resize-none h-16 placeholder-[#48484a]"
                  />
                </div>
              )}
            </Section>

            <Section title="Intelligent Anti-Flood">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#3b82f6]" />
                  <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Enable Anti-Flood</p>
                </div>
                <Switch checked={settings.flood_enabled} onChange={v => setSettings({...settings, flood_enabled: v})} />
              </div>
              {settings.flood_enabled && (
                <>
                  <Divider />
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#636366] text-xs mb-1" style={{ fontFamily: SF }}>Window (sec)</p>
                      <input type="number" value={settings.flood_window_sec} onChange={e => setSettings({...settings, flood_window_sec: Number(e.target.value)})} className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <p className="text-[#636366] text-xs mb-1" style={{ fontFamily: SF }}>Max Msgs</p>
                      <input type="number" value={settings.flood_max_msgs} onChange={e => setSettings({...settings, flood_max_msgs: Number(e.target.value)})} className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 outline-none" />
                    </div>
                  </div>
                  <Divider />
                  <div className="p-4 flex items-center justify-between">
                    <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Action</p>
                    <select 
                      value={settings.flood_action}
                      onChange={e => setSettings({...settings, flood_action: e.target.value})}
                      className="bg-[#1c1c1e] text-white text-sm rounded-lg px-3 py-1.5 outline-none"
                    >
                      <option value="warn">Warn</option>
                      <option value="mute">Mute (2m)</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                </>
              )}
            </Section>

            <Section title="Member Tags">
              <div className="p-4 flex items-center justify-between">
                <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Auto-Tags Enabled</p>
                <Switch checked={settings.auto_tags_enabled} onChange={v => setSettings({...settings, auto_tags_enabled: v})} />
              </div>
              {settings.auto_tags_enabled && (
                <>
                  <Divider />
                  <div className="p-4 flex items-center justify-between">
                    <p className="text-white text-[15px]" style={{ fontFamily: SF }}>Mode</p>
                    <select 
                      value={settings.tag_mode}
                      onChange={e => setSettings({...settings, tag_mode: e.target.value})}
                      className="bg-[#1c1c1e] text-white text-sm rounded-lg px-3 py-1.5 outline-none"
                    >
                      <option value="activity">Activity (👑 Top)</option>
                      <option value="join_date">Join Date</option>
                      <option value="custom">Custom Rules</option>
                    </select>
                  </div>
                </>
              )}
            </Section>

            {/* Botón Guardar Flotante */}
            <div className="pt-4">
              <button 
                onClick={saveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[16px] transition-opacity active:opacity-70 disabled:opacity-50"
                style={{ background: "#3b82f6", color: "#fff", fontFamily: SFD }}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Settings
              </button>
            </div>

          </div>
        )}

        {/* --- VISTA: MIEMBROS DEL GRUPO --- */}
        {viewState === "members" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            
            <div className="flex rounded-xl p-1 mb-6" style={{ background: "#111" }}>
              <button onClick={() => setViewState("settings")} className="flex-1 py-2 rounded-lg text-sm font-medium text-[#636366]" style={{ fontFamily: SF }}>
                Rules & Config
              </button>
              <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-white text-black" style={{ fontFamily: SF }}>
                Members
              </button>
            </div>

            <button 
              onClick={refreshAllTags}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-4 transition-opacity active:opacity-70"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <RefreshCw className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[#3b82f6] font-medium text-[14px]" style={{ fontFamily: SF }}>Refresh All Auto-Tags</span>
            </button>

            {loadingMembers ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#48484a]" /></div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                {members.map((m, i) => (
                  <div key={m.user_id}>
                    {i > 0 && <Divider />}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                        {(m.first_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SFD }}>
                          {m.first_name} {m.username ? <span className="text-[#636366] text-[13px]">@{m.username}</span> : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[#8e8e93] text-[12px]" style={{ fontFamily: SF }}>
                            {m.msg_count} msgs
                          </p>
                          <span className="text-[#48484a] text-[10px]">•</span>
                          <p className="text-[#8e8e93] text-[12px]" style={{ fontFamily: SF }}>
                            {m.join_label}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => editMemberTag(m.user_id, m.tag_text)}
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
            )}
          </div>
        )}

      </div>
    </div>
  )
}
