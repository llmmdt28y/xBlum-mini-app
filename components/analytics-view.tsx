"use client"

import { useApp } from "@/lib/app-context"
import { useEffect, useState, useCallback } from "react"
import { 
  Loader2, MessageSquare, Shield, ChevronRight, RefreshCw, Save, Edit3,
  CheckCircle2, AlertCircle, X, Sparkles, Waves, Tag, Activity, ShieldAlert,
  Users, Settings, ChevronLeft
} from "lucide-react"

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
  const userId = tg?.initDataUnsafe?.user?.id ?? null
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData, userId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// --- Componentes UI Reutilizables Premium ---
function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${
      type==="success" ? "bg-[#1a2e1a] border-[#22c55e]/40 text-[#22c55e]" : "bg-[#2e1a1a] border-[#f43f5e]/40 text-[#f43f5e]"
    }`}>
      {type==="success" ? <CheckCircle2 className="w-4 h-4 shrink-0"/> : <AlertCircle className="w-4 h-4 shrink-0"/>}
      <span className="text-[13px] font-medium" style={{fontFamily:SF}}>{msg}</span>
    </div>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${checked ? 'bg-blue-500' : 'bg-[#3a3a3c]'}`}
    >
      <span className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
  )
}

function SegmentedControl({ options, selected, onChange }: { options: {label: string, value: string}[], selected: string, onChange: (v: string) => void }) {
  return (
    <div className="flex p-1 rounded-[14px] bg-[#0a0a0a] w-full border border-[#2c2c2e]">
      {options.map(opt => {
        const isSel = selected === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-[10px] transition-all duration-300 ${isSel ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#636366] hover:text-[#8e8e93]'}`}
            style={{ fontFamily: SF }}
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
  
  const [settings, setSettings] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [saving, setSaving] = useState(false)
  const [refreshingTags, setRefreshingTags] = useState(false)

  const [editingTag, setEditingTag] = useState<{uid: number, tag: string} | null>(null)
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null)

  const showToast = useCallback((msg:string,type:"success"|"error")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500)
  },[])

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
      if (editingTag) {
        setEditingTag(null)
      } else if (activeGroup) {
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
  }, [activeGroup, setCurrentView, loadGroupsList, editingTag])

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
      showToast("Settings saved successfully", "success")
    } catch (e) {
      console.error(e)
      showToast("Failed to save settings", "error")
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
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success")
      showToast("Tag refresh started in background", "success")
    } catch (e) {
      console.error(e)
      showToast("Error refreshing tags", "error")
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
      showToast("Custom tag applied", "success")
    } catch (e) {
      console.error(e)
      showToast("Error applying tag", "error")
    }
  }

  const handleAutoScan = async () => {
    setRegistering(true)
    try {
      const res = await apiPost("/api/group_auto_scan", {})
      if (res.found > 0) {
        getTg()?.HapticFeedback?.notificationOccurred("success")
        showToast(`Success! Found and linked ${res.found} group(s).`, "success")
        await loadGroupsList() 
      } else {
        getTg()?.HapticFeedback?.notificationOccurred("warning")
        showToast("No missing groups found.", "error")
      }
    } catch (e) {
      console.error(e)
      showToast("An error occurred while scanning.", "error")
    } finally {
      setRegistering(false)
    }
  }

  if (loading && !activeGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#48484a]" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative bg-[#000000] text-white min-h-screen no-scrollbar">
      
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex flex-col w-full pb-2" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div className="flex items-center gap-3">
             {activeGroup && (
               <button onClick={() => { setActiveGroup(null); setSettings(null); loadGroupsList(); }} className="active:scale-90 transition-transform">
                 <ChevronLeft className="w-7 h-7 text-blue-500" />
               </button>
             )}
             <div className="flex flex-col">
                <h2 className="font-bold text-white text-[24px] tracking-tight leading-none" style={{ fontFamily: SFD }}>
                  {activeGroup ? (stats?.chat_title || "Group Settings") : "My Groups"}
                </h2>
                <p className="text-[#8e8e93] text-[13px] mt-1" style={{ fontFamily: SF }}>
                  {activeGroup ? "Manage moderation & members" : "Manage your Telegram communities"}
                </p>
             </div>
          </div>
        </div>
        
        {/* Modern Tabs (Only visible when activeGroup is set) */}
        {activeGroup && (
          <div className="px-5 mt-3 animate-in fade-in duration-300">
            <div className="flex p-1 rounded-full w-full border border-[#2c2c2e] bg-[#1c1c1e]">
              <button onClick={() => setActiveTab("settings")} className={`flex flex-1 items-center justify-center gap-2 py-1.5 rounded-full text-[14px] font-medium transition-all ${activeTab === "settings" ? "bg-white text-black shadow-sm" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>
                <Settings className="w-4 h-4"/> Settings
              </button>
              <button onClick={() => setActiveTab("members")} className={`flex flex-1 items-center justify-center gap-2 py-1.5 rounded-full text-[14px] font-medium transition-all ${activeTab === "members" ? "bg-white text-black shadow-sm" : "text-[#8e8e93]"}`} style={{ fontFamily: SF }}>
                <Users className="w-4 h-4"/> Members
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 no-scrollbar">
        
        {/* ─── VISTA: LISTA DE GRUPOS ─── */}
        {!activeGroup && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {groups.length === 0 ? (
              <div className="bg-[#1c1c1e] rounded-[28px] p-8 flex flex-col items-center justify-center text-center shadow-inner mt-4">
                <div className="w-16 h-16 rounded-full bg-[#2c2c2e] flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-[#8e8e93]" />
                </div>
                <h3 className="text-white font-bold text-[18px] mb-2" style={{ fontFamily: SFD }}>No Groups Found</h3>
                <p className="text-[#8e8e93] text-[14px] leading-relaxed max-w-[240px]" style={{ fontFamily: SF }}>
                  Add xBlum as an admin to your Telegram group to configure it here.
                </p>
              </div>
            ) : (
              <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
                <div className="flex flex-col divide-y divide-[#2c2c2e]">
                  {groups.map((g) => (
                    <button 
                      key={g.chat_id}
                      onClick={() => loadGroupDetail(g.chat_id)}
                      className="w-full flex items-center gap-4 p-3 active:bg-[#2c2c2e] transition-colors rounded-2xl text-left"
                    >
                      <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-lg shrink-0">
                        {g.chat_title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-[16px] truncate" style={{ fontFamily: SFD }}>{g.chat_title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-[#8e8e93] text-[13px]" style={{ fontFamily: SF }}>
                            <MessageSquare className="w-3.5 h-3.5" /> {g.total_msgs.toLocaleString()}
                          </span>
                          {!g.updated_at && (
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">New</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#636366]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto Scan Box */}
            <div className="bg-[#1c1c1e] rounded-[28px] p-5 shadow-inner flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                 <Shield className="w-6 h-6 text-blue-400" />
               </div>
               <h3 className="text-white font-bold text-[18px] mb-1" style={{ fontFamily: SFD }}>Auto-Scan Groups</h3>
               <p className="text-[#8e8e93] text-[14px] mb-5 leading-relaxed px-2" style={{ fontFamily: SF }}>Missing a group? We can scan and link communities where you are the Creator and xBlum is admin.</p>
               <button 
                  onClick={handleAutoScan} 
                  disabled={registering} 
                  className="w-full py-3.5 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[15px] flex items-center justify-center gap-2"
                  style={{ fontFamily: SF }}
               >
                 {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                 {registering ? "Scanning databases..." : "Scan & Link My Groups"}
               </button>
            </div>

          </div>
        )}

        {/* ─── VISTA: DETALLES DEL GRUPO (AJUSTES) ─── */}
        {activeGroup && !loading && settings && activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* AI Natural Rules Section */}
            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
               <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                     <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-[18px]" style={{fontFamily:SFD}}>AI Moderation</h3>
               </div>
               
               <div className="flex flex-col divide-y divide-[#2c2c2e]">
                  <div className="p-4 flex flex-col gap-2">
                     <label className="text-[14px] text-[#8e8e93] font-medium" style={{ fontFamily: SF }}>Natural Rules Prompt</label>
                     <textarea 
                        value={settings.natural_rules}
                        onChange={e => setSettings({...settings, natural_rules: e.target.value})}
                        placeholder="E.g. No crypto links, keep it polite..."
                        className="w-full bg-[#0a0a0a] text-white text-[15px] rounded-[20px] p-4 outline-none resize-none h-24 placeholder-[#48484a] border border-[#2c2c2e] focus:border-[#636366] transition-colors"
                        style={{ fontFamily: SF }}
                     />
                  </div>

                  <div className="p-4 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[15px] text-white font-medium" style={{ fontFamily: SF }}>Sensitivity</span>
                        <span className="text-[12px] text-[#636366]" style={{ fontFamily: SF }}>How strict the AI analyzes</span>
                     </div>
                     <div className="w-[180px]">
                        <SegmentedControl 
                           options={[{label: "Soft", value: "soft"}, {label: "Bal", value: "balanced"}, {label: "Strict", value: "strict"}]} 
                           selected={settings.sensitivity} 
                           onChange={v => setSettings({...settings, sensitivity: v})} 
                        />
                     </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[15px] text-white font-medium" style={{ fontFamily: SF }}>Adapt to Context</span>
                           <span className="text-[12px] text-[#636366]" style={{ fontFamily: SF }}>Learn from group history</span>
                        </div>
                        <Switch checked={settings.adapt_to_group} onChange={c => setSettings({...settings, adapt_to_group: c})} />
                     </div>
                     {settings.adapt_to_group && (
                        <textarea 
                           value={settings.group_context}
                           onChange={e => setSettings({...settings, group_context: e.target.value})}
                           placeholder="Describe the group's normal tone to avoid false positives..."
                           className="w-full bg-[#0a0a0a] text-white text-[14px] rounded-[20px] p-4 outline-none resize-none h-20 placeholder-[#48484a] border border-[#2c2c2e] transition-colors mt-2"
                           style={{ fontFamily: SF }}
                        />
                     )}
                  </div>
               </div>
            </div>

            {/* Anti-Flood System */}
            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
               <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Waves className="w-4 h-4 text-blue-400" />
                     </div>
                     <h3 className="text-white font-bold text-[18px]" style={{fontFamily:SFD}}>Anti-Flood</h3>
                  </div>
                  <Switch checked={settings.flood_enabled} onChange={c => setSettings({...settings, flood_enabled: c})} />
               </div>
               
               {settings.flood_enabled && (
                  <div className="flex flex-col divide-y divide-[#2c2c2e] border-t border-[#2c2c2e]">
                     <div className="p-4 flex gap-3">
                        <div className="flex-1 bg-[#0a0a0a] rounded-[20px] p-3 border border-[#2c2c2e]">
                           <span className="text-[12px] text-[#8e8e93] block mb-1 text-center" style={{ fontFamily: SF }}>Window (sec)</span>
                           <input type="number" value={settings.flood_window_sec} onChange={e => setSettings({...settings, flood_window_sec: Number(e.target.value)})} className="w-full bg-transparent text-white text-[18px] font-bold text-center outline-none" style={{ fontFamily: SFD }}/>
                        </div>
                        <div className="flex-1 bg-[#0a0a0a] rounded-[20px] p-3 border border-[#2c2c2e]">
                           <span className="text-[12px] text-[#8e8e93] block mb-1 text-center" style={{ fontFamily: SF }}>Max Msgs</span>
                           <input type="number" value={settings.flood_max_msgs} onChange={e => setSettings({...settings, flood_max_msgs: Number(e.target.value)})} className="w-full bg-transparent text-white text-[18px] font-bold text-center outline-none" style={{ fontFamily: SFD }}/>
                        </div>
                     </div>
                     <div className="p-4 flex items-center justify-between">
                        <span className="text-[14px] text-[#8e8e93] font-medium" style={{ fontFamily: SF }}>Action</span>
                        <div className="w-[200px]">
                           <SegmentedControl 
                              options={[{label: "Warn", value: "warn"}, {label: "Mute", value: "mute"}, {label: "Delete", value: "delete"}]} 
                              selected={settings.flood_action} 
                              onChange={v => setSettings({...settings, flood_action: v})} 
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Auto-Tags */}
            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
               <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-emerald-400" />
                     </div>
                     <h3 className="text-white font-bold text-[18px]" style={{fontFamily:SFD}}>Auto-Tags</h3>
                  </div>
                  <Switch checked={settings.auto_tags_enabled} onChange={c => setSettings({...settings, auto_tags_enabled: c})} />
               </div>
               {settings.auto_tags_enabled && (
                  <div className="p-4 border-t border-[#2c2c2e]">
                     <span className="text-[14px] text-[#8e8e93] font-medium block mb-3" style={{ fontFamily: SF }}>Tag Mode</span>
                     <SegmentedControl 
                        options={[{label: "Activity", value: "activity"}, {label: "Join Date", value: "join_date"}, {label: "Custom", value: "custom"}]} 
                        selected={settings.tag_mode} 
                        onChange={v => setSettings({...settings, tag_mode: v})} 
                     />
                  </div>
               )}
            </div>

            {/* Save Button */}
            <div className="pt-2 pb-6">
               <button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                  className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ fontFamily: SF }}
               >
                  {saving && <Loader2 className="w-5 h-5 animate-spin"/>}
                  {saving ? "Saving Changes..." : "Save Settings"}
               </button>
            </div>
          </div>
        )}

        {/* ─── VISTA: DETALLES DEL GRUPO (MIEMBROS) ─── */}
        {activeGroup && !loading && activeTab === "members" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <button onClick={handleRefreshTags} disabled={refreshingTags} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[20px] bg-[#1c1c1e] text-white font-medium text-[15px] active:scale-[0.98] transition-all border border-[#2c2c2e] shadow-sm" style={{ fontFamily: SF }}>
              {refreshingTags ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <RefreshCw size={18} className="text-blue-400" />} 
              {refreshingTags ? "Refreshing..." : "Refresh Member Tags"}
            </button>
            
            <div className="bg-[#1c1c1e] rounded-[28px] p-2 shadow-inner">
               <div className="flex flex-col divide-y divide-[#2c2c2e]">
                 {members.map((m) => (
                   <div key={m.user_id} className="p-3 flex items-center gap-3 active:bg-[#2c2c2e] transition-colors rounded-2xl">
                     <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#2c2c2e] to-[#111] border border-[#3a3a3c] text-white font-bold shrink-0 shadow-sm text-[16px]">
                       {(m.first_name || m.username || "U").substring(0,2).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0 flex flex-col">
                       <p className="text-white text-[16px] font-medium truncate leading-tight" style={{ fontFamily: SFD }}>
                         {m.first_name} <span className="text-[#636366] font-normal text-[14px]">{m.username ? `@${m.username}` : ''}</span>
                       </p>
                       <div className="flex items-center gap-3 mt-1.5">
                         <div className="flex items-center gap-1 text-[12px] text-[#8e8e93]" style={{ fontFamily: SF }}>
                            <MessageSquare size={12}/> {m.msg_count}
                         </div>
                         {m.warn_count > 0 && (
                            <div className="flex items-center gap-1 text-[12px] text-red-400" style={{ fontFamily: SF }}>
                               <ShieldAlert size={12}/> {m.warn_count}
                            </div>
                         )}
                         {m.join_label && <span className="text-[12px] text-[#636366]" style={{ fontFamily: SF }}>• {m.join_label}</span>}
                       </div>
                     </div>
                     
                     <button 
                       onClick={() => setEditingTag({uid: m.user_id, tag: m.tag_text || ""})}
                       className="shrink-0 flex flex-col items-end pl-2 active:scale-95 transition-transform"
                     >
                       {m.tag_text ? (
                          <div className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] px-2.5 py-1.5 rounded-lg text-[12px] font-medium truncate max-w-[100px]" style={{ fontFamily: SF }}>
                             {m.tag_text}
                          </div>
                       ) : (
                          <div className="bg-[#0a0a0a] border border-[#2c2c2e] text-[#636366] px-2.5 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1" style={{ fontFamily: SF }}>
                             <Tag size={12} /> Add
                          </div>
                       )}
                       {m.tag_source === "admin_manual" && <span className="text-yellow-500 text-[10px] mt-1 mr-1 tracking-wide font-medium">MANUAL</span>}
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Edit Tag Modal */}
      {editingTag !== null && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingTag(null)} />
          <div className="relative w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-400 flex flex-col bg-[#111] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#2c2c2e]">
            
            <div className="w-10 h-1 rounded-full bg-[#3c3c3e] self-center mb-6"/>
            
            <div className="flex items-center justify-between mb-6 shrink-0">
               <h3 className="text-white font-bold text-[24px] tracking-tight" style={{fontFamily:SFD}}>Edit Custom Tag</h3>
               <button onClick={() => setEditingTag(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] active:opacity-70 transition-opacity">
                 <X className="w-5 h-5 text-[#8e8e93]" />
               </button>
            </div>

            <p className="text-[14px] text-[#8e8e93] mb-4" style={{ fontFamily: SF }}>Set a custom tag for this member (Max 16 characters).</p>
            
            <div className="bg-[#1c1c1e] rounded-[24px] p-2 shadow-inner mb-8">
               <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-[20px] px-5 py-4 border border-[#2c2c2e]">
                 <Tag className="w-5 h-5 text-[#636366] shrink-0" />
                 <input 
                   autoFocus
                   maxLength={16}
                   value={editingTag.tag}
                   onChange={e => setEditingTag({...editingTag, tag: e.target.value})}
                   className="bg-transparent text-white text-[16px] flex-1 outline-none placeholder-[#636366] font-medium"
                   placeholder="e.g. 👑 Legend"
                   style={{ fontFamily: SF }}
                 />
                 {editingTag.tag && <button onClick={() => setEditingTag({...editingTag, tag: ""})}><X className="w-4 h-4 text-[#636366]" /></button>}
               </div>
            </div>

            <div className="shrink-0 pb-4">
              <button onClick={handleSaveTag} className="w-full py-4 bg-white text-black font-bold rounded-[20px] active:scale-[0.98] transition-transform text-[16px]" style={{ fontFamily: SF }}>
                Apply Tag
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
