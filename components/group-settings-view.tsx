"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState } from "react"
import { ChevronLeft, Save, Loader2, RefreshCw, ShieldAlert, Tag, Activity } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

// --- Custom UI Components ---
function Switch({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-500' : 'bg-[#3a3a3c]'}`}
    >
      <span className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
  )
}

function SegmentedControl({ options, selected, onChange }: { options: string[], selected: string, onChange: (v: string) => void }) {
  return (
    <div className="flex p-1 rounded-[10px]" style={{ background: "#1c1c1e" }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all capitalize"
          style={{
            background: selected === opt ? "#636366" : "transparent",
            color: selected === opt ? "#fff" : "#8e8e93",
            fontFamily: SF
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function GroupSettingsView() {
  const { setCurrentView, selectedGroupId } = useApp()
  const [activeTab, setActiveTab] = useState<"settings" | "members">("settings")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Settings State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null)
  
  // Members State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [members, setMembers] = useState<any[]>([])
  const [editingTag, setEditingTag] = useState<{uid: number, tag: string} | null>(null)

  // Telegram Back Button logic
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (!tg?.BackButton) return
    tg.BackButton.show()
    const handleBack = () => setCurrentView("analytics")
    tg.BackButton.onClick(handleBack)
    return () => tg.BackButton.offClick(handleBack)
  }, [setCurrentView])

  // Fetch Data
  useEffect(() => {
    if (!selectedGroupId) return
    async function load() {
      setLoading(true)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initData = (window as any).Telegram?.WebApp?.initData || ""
        const headers = { "x-init-data": initData }
        
        const [setRes, statRes, memRes] = await Promise.all([
          fetch(`${API_BASE}/api/group_settings/${selectedGroupId}`, { headers }),
          fetch(`${API_BASE}/api/group_stats/${selectedGroupId}`, { headers }),
          fetch(`${API_BASE}/api/group_members/${selectedGroupId}`, { headers })
        ])

        if (setRes.ok) setSettings(await setRes.json())
        if (statRes.ok) setStats(await statRes.json())
        if (memRes.ok) setMembers((await memRes.json()).members || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedGroupId])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initData = (window as any).Telegram?.WebApp?.initData || ""
      await fetch(`${API_BASE}/api/group_settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, chat_id: selectedGroupId, ...settings })
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success")
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTag = async () => {
    if (!editingTag) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initData = (window as any).Telegram?.WebApp?.initData || ""
      await fetch(`${API_BASE}/api/group_tag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, chat_id: selectedGroupId, user_id: editingTag.uid, tag: editingTag.tag })
      })
      setMembers(m => m.map(x => x.user_id === editingTag.uid ? { ...x, tag_text: editingTag.tag, tag_source: "admin_manual" } : x))
      setEditingTag(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleRefreshTags = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initData = (window as any).Telegram?.WebApp?.initData || ""
    await fetch(`${API_BASE}/api/group_tag_refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, chat_id: selectedGroupId })
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Telegram?.WebApp?.showAlert("Tag refresh started in background.")
  }

  if (loading) {
    return <div className="flex-1 flex justify-center items-center bg-black min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#48484a]" /></div>
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#000", minHeight: "100vh" }}>
      
      {/* Header */}
      <div className="sticky top-0 z-30 flex flex-col w-full" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-4" style={{ paddingTop: "var(--tg-safe-area-inset-top, 24px)", height: "calc(var(--tg-safe-area-inset-top, 24px) + 44px)" }}>
          <button onClick={() => setCurrentView("analytics")} className="flex items-center gap-1 active:opacity-60 text-blue-500">
            <ChevronLeft size={22} />
          </button>
          <h2 className="font-semibold text-white text-[16px] truncate max-w-[200px]" style={{ fontFamily: SFD }}>
            {stats?.chat_title || "Group Settings"}
          </h2>
          <div className="w-8" /> {/* Spacer */}
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 pb-3 gap-2">
          <button onClick={() => setActiveTab("settings")} className="flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-colors" style={{ background: activeTab === "settings" ? "#fff" : "#1c1c1e", color: activeTab === "settings" ? "#000" : "#8e8e93", fontFamily: SF }}>Settings</button>
          <button onClick={() => setActiveTab("members")} className="flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-colors" style={{ background: activeTab === "members" ? "#fff" : "#1c1c1e", color: activeTab === "members" ? "#000" : "#8e8e93", fontFamily: SF }}>Members</button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-28">
        {activeTab === "settings" && settings && (
          <div className="space-y-6">
            
            {/* Stats Overview */}
            <div className="flex gap-2">
               <div className="flex-1 p-3 rounded-2xl" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                 <p className="text-[12px] text-[#8e8e93] font-medium" style={{ fontFamily: SF }}>Total Msgs</p>
                 <p className="text-[20px] font-bold text-white" style={{ fontFamily: SFD }}>{stats?.total_msgs?.toLocaleString() || 0}</p>
               </div>
               <div className="flex-1 p-3 rounded-2xl" style={{ background: "#111", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                 <p className="text-[12px] text-red-400 font-medium" style={{ fontFamily: SF }}>Spam Blocked</p>
                 <p className="text-[20px] font-bold text-white" style={{ fontFamily: SFD }}>{stats?.total_spam?.toLocaleString() || 0}</p>
               </div>
            </div>

            {/* AI Natural Rules */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#48484a] mb-2 px-1" style={{ fontFamily: SF }}>🧠 AI Natural Rules</p>
              <div className="rounded-2xl p-4 space-y-4" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                <div>
                  <label className="text-[13px] text-white block mb-1.5" style={{ fontFamily: SF }}>Group Rules Prompt</label>
                  <textarea 
                    value={settings.natural_rules}
                    onChange={e => setSettings({...settings, natural_rules: e.target.value})}
                    placeholder="E.g. No crypto links, English only..."
                    className="w-full bg-[#1c1c1e] text-white text-[14px] rounded-xl p-3 outline-none resize-none h-24"
                    style={{ fontFamily: SF }}
                  />
                </div>
                <div>
                  <label className="text-[13px] text-white block mb-1.5" style={{ fontFamily: SF }}>Sensitivity</label>
                  <SegmentedControl options={["soft", "balanced", "strict"]} selected={settings.sensitivity} onChange={v => setSettings({...settings, sensitivity: v})} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] text-white" style={{ fontFamily: SF }}>Adapt to group context</span>
                  <Switch checked={settings.adapt_to_group} onChange={c => setSettings({...settings, adapt_to_group: c})} />
                </div>
                {settings.adapt_to_group && (
                  <textarea 
                    value={settings.group_context}
                    onChange={e => setSettings({...settings, group_context: e.target.value})}
                    placeholder="Describe the group's normal tone so the AI avoids false positives..."
                    className="w-full bg-[#1c1c1e] text-[#8e8e93] text-[13px] rounded-xl p-3 outline-none resize-none h-16"
                    style={{ fontFamily: SF }}
                  />
                )}
              </div>
            </div>

            {/* Anti-Flood */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#48484a] mb-2 px-1" style={{ fontFamily: SF }}>🌊 Anti-Flood System</p>
              <div className="rounded-2xl p-4 space-y-4" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-white font-medium" style={{ fontFamily: SF }}>Enable Anti-Flood</span>
                  <Switch checked={settings.flood_enabled} onChange={c => setSettings({...settings, flood_enabled: c})} />
                </div>
                {settings.flood_enabled && (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[12px] text-[#8e8e93] block mb-1" style={{ fontFamily: SF }}>Window (sec)</label>
                        <input type="number" value={settings.flood_window_sec} onChange={e => setSettings({...settings, flood_window_sec: Number(e.target.value)})} className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 text-center outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[12px] text-[#8e8e93] block mb-1" style={{ fontFamily: SF }}>Max Msgs</label>
                        <input type="number" value={settings.flood_max_msgs} onChange={e => setSettings({...settings, flood_max_msgs: Number(e.target.value)})} className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 text-center outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[12px] text-[#8e8e93] block mb-1" style={{ fontFamily: SF }}>Dominance %</label>
                        <input type="number" value={settings.flood_dominance_pct} onChange={e => setSettings({...settings, flood_dominance_pct: Number(e.target.value)})} className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 text-center outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] text-white block mb-1.5" style={{ fontFamily: SF }}>Action</label>
                      <SegmentedControl options={["warn", "mute", "delete"]} selected={settings.flood_action} onChange={v => setSettings({...settings, flood_action: v})} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Anti-Spam */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#48484a] mb-2 px-1" style={{ fontFamily: SF }}>🛡 Anti-Spam System</p>
              <div className="rounded-2xl p-4 space-y-4" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-white font-medium" style={{ fontFamily: SF }}>Enable Anti-Spam</span>
                  <Switch checked={settings.antispam_enabled ?? true} onChange={c => setSettings({...settings, antispam_enabled: c})} />
                </div>
                {(settings.antispam_enabled ?? true) && (
                  <>
                    <div>
                      <label className="text-[13px] text-white block mb-1.5" style={{ fontFamily: SF }}>Action on detection</label>
                      <SegmentedControl
                        options={[
                          { label: "Warn", value: "warn" },
                          { label: "Mute", value: "mute" },
                          { label: "Captcha", value: "captcha" },
                          { label: "Ban", value: "ban" },
                        ]}
                        selected={settings.antispam_action ?? "captcha"}
                        onChange={v => setSettings({...settings, antispam_action: v})}
                      />
                    </div>
                    {(settings.antispam_action === "mute") && (
                      <div>
                        <label className="text-[12px] text-[#8e8e93] block mb-1" style={{ fontFamily: SF }}>
                          Mute duration (seconds) — current: {settings.antispam_mute_sec ?? 120}s ({Math.round((settings.antispam_mute_sec ?? 120) / 60)}m)
                        </label>
                        <input
                          type="number"
                          min={60}
                          max={86400}
                          value={settings.antispam_mute_sec ?? 120}
                          onChange={e => setSettings({...settings, antispam_mute_sec: Number(e.target.value)})}
                          className="w-full bg-[#1c1c1e] text-white rounded-lg p-2 text-center outline-none"
                        />
                        <p className="text-[11px] text-[#636366] mt-1" style={{ fontFamily: SF }}>Min: 60s — Max: 86400s (24h)</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Auto-Tags */}
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#48484a] mb-2 px-1" style={{ fontFamily: SF }}>🏷️ Auto Member Tags</p>
              <div className="rounded-2xl p-4 space-y-4" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-white font-medium" style={{ fontFamily: SF }}>Enable Auto-Tags</span>
                  <Switch checked={settings.auto_tags_enabled} onChange={c => setSettings({...settings, auto_tags_enabled: c})} />
                </div>
                {settings.auto_tags_enabled && (
                  <div>
                    <label className="text-[13px] text-white block mb-1.5" style={{ fontFamily: SF }}>Tag Mode</label>
                    <SegmentedControl options={["activity", "join_date", "custom"]} selected={settings.tag_mode} onChange={v => setSettings({...settings, tag_mode: v})} />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] active:opacity-70 transition-all mt-4" 
              style={{ background: saving ? "#1d4ed8" : "#3b82f6", color: "#fff", fontFamily: SF }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <button onClick={handleRefreshTags} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111] text-blue-500 font-medium text-[14px] border border-[#1c1c1e] active:bg-[#1c1c1e] transition-colors">
              <RefreshCw size={16} /> Refresh All Tags
            </button>
            
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #1c1c1e" }}>
              {members.map((m, i) => (
                <div key={m.user_id}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shrink-0">
                      {(m.first_name || m.username || "U").substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[15px] font-medium truncate" style={{ fontFamily: SF, letterSpacing: "-0.01em" }}>
                        {m.first_name} <span className="text-[#636366] font-normal">{m.username ? `@${m.username}` : ''}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-[#8e8e93]" style={{ fontFamily: SF }}><Activity size={10} className="inline mr-1"/>{m.msg_count}</span>
                        {m.warn_count > 0 && <span className="text-[12px] text-amber-500" style={{ fontFamily: SF }}><ShieldAlert size={10} className="inline mr-1"/>{m.warn_count}</span>}
                        {m.join_label && <span className="text-[12px] text-[#636366]" style={{ fontFamily: SF }}>• {m.join_label}</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setEditingTag({uid: m.user_id, tag: m.tag_text || ""})}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg active:opacity-60 transition-opacity max-w-[100px]"
                      style={{ background: m.tag_text ? "rgba(59,130,246,0.15)" : "#1c1c1e", border: `1px solid ${m.tag_text ? "rgba(59,130,246,0.3)" : "transparent"}`}}
                    >
                      {m.tag_text ? (
                        <span className="text-[11px] font-medium text-blue-400 truncate" style={{ fontFamily: SF }}>{m.tag_text}</span>
                      ) : (
                        <>
                          <Tag size={12} className="text-[#8e8e93]" />
                          <span className="text-[11px] text-[#8e8e93]" style={{ fontFamily: SF }}>Add tag</span>
                        </>
                      )}
                    </button>
                  </div>
                  {i < members.length - 1 && <div style={{ height: "0.5px", background: "#1e1e1e", marginLeft: "68px" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Edit Tag Modal */}
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
              className="w-full bg-[#1c1c1e] text-white px-4 py-3 rounded-xl outline-none border border-[#2c2c2e] focus:border-blue-500 transition-colors mb-5"
              placeholder="e.g. 👑 Legend"
              style={{ fontFamily: SF }}
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingTag(null)} className="flex-1 py-3 rounded-xl text-white font-medium bg-[#1c1c1e] active:bg-[#2c2c2e]">Cancel</button>
              <button onClick={handleSaveTag} className="flex-1 py-3 rounded-xl text-white font-medium bg-blue-600 active:bg-blue-700">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
