"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronRight, ChevronDown, Check, Shield, Zap, Users, MessageSquare, Save, Settings2, Trash2, Tags, BrickWall, PenOff, Plus } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

const Astroid = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203"/>
  </svg>
)

function Toggle({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} disabled={disabled} className={"relative rounded-full transition-colors duration-100 shrink-0 z-10 " + (disabled ? "opacity-50" : "")} style={{ width: "42px", height: "24px", background: on ? activeColor : "#262626" }}>
      <span className="absolute rounded-full transition-all duration-100" style={{ width: "16px", height: "16px", top: "4px", background: "#111111", left: on ? "22px" : "4px" }} />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <div className="flex items-center">
      <div className="w-[1px] h-[22px] bg-[#262626] mr-3.5" />
      <Toggle on={on} onToggle={onToggle} disabled={disabled} activeColor={activeColor} />
    </div>
  )
}

function RadioButton({ selected }: { selected: boolean }) {
  return (
    <div className={`shrink-0 w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center transition-colors relative z-10 ${selected ? 'border-[#60a5fa]' : 'border-[#555558]'}`}>
      {selected && <div className="w-[12px] h-[12px] rounded-full bg-[#60a5fa]" />}
    </div>
  )
}

function Section({ title, footer, children, rightAction }: { title?: string; footer?: React.ReactNode; children: React.ReactNode; rightAction?: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full mb-6"> 
      {title && (
        <div className="px-4 flex items-center justify-between mb-1.5">
          <h2 className="text-[#60a5fa] text-[14px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className="flex flex-col gap-[2px] relative [&>*]:bg-[#111111] [&>*]:rounded-[4px] [&>*:first-child]:rounded-t-[16px] [&>*:last-child]:rounded-b-[16px] [&>*]:overflow-hidden w-full">
        {children}
      </div>
      {footer && (
        <div className="px-4 mt-2 text-[#8e8e93] text-[13px] leading-snug" style={{ fontFamily: SF }}>
          {footer}
        </div>
      )}
    </div>
  )
}

function Row({ label, sublabel, value, leftNode, rightNode, onClick, hideArrow = false, last = false, alignItems = "center", danger, selected, selectedBlueText }: any) {
  const content = (
    <>
      {leftNode}
      <div className={`flex flex-col flex-1 min-w-0 relative z-10 ${alignItems === "center" ? "py-0.5" : ""}`}>
        <span className={`text-[16px] font-medium leading-[1.2] ${danger ? "text-[#ef4444]" : (selected && selectedBlueText ? "text-[#60a5fa]" : "text-white")}`} style={{ fontFamily: SF }}>
          {label}
        </span>
        {sublabel && (
          <span className={`text-[13px] ${selected && selectedBlueText ? "text-[#60a5fa]" : "text-[#8e8e93]"} leading-[1.4] mt-[5px]`} style={{ fontFamily: SF }}>
            {sublabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 relative z-10 shrink-0 ml-2">
        {value && <span className="text-[16px] font-normal text-[#8e8e93]" style={{ fontFamily: SF }}>{value}</span>}
        {rightNode ? rightNode : (!hideArrow && !danger && <ChevronRight className="w-5 h-5 text-[#8e8e93]" />)}
      </div>
    </>
  );

  const className = `relative w-full flex gap-3.5 px-4 py-3.5 ${onClick ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left items-${alignItems} overflow-hidden`;

  return (
    <>
      <button onClick={onClick} onPointerDown={onClick ? createRipple : undefined} disabled={!onClick && !rightNode} className={className}>
        {content}
      </button>
    </>
  )
}

function SubHeader({ title, rightNode, onBack }: { title: string, rightNode?: React.ReactNode, onBack?: () => void }) {
  return (
    <div className="relative flex items-center justify-center px-4 pb-3 z-10 w-full" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}>
      {onBack && (
        <button onClick={onBack} className="absolute left-4 bottom-1 w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:opacity-60 transition-opacity z-20">
          <ChevronRight className="w-5 h-5 text-white rotate-180 relative z-10" />
        </button>
      )}
      <h2 className="font-semibold text-white relative z-10" style={{ fontSize: "16px", fontFamily: SFD, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {rightNode && <div className="absolute right-4 bottom-1.5 flex items-center z-20">{rightNode}</div>}
    </div>
  )
}

const ExpandingInput = ({ label, maxLength, value, onChange, placeholder = "" }: any) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const remaining = maxLength - value.length

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = `${textRef.current.scrollHeight}px`
    }
  }, [value])

  const handleChange = (e: any) => {
    let val = e.target.value
    if (val.length > maxLength) val = val.slice(0, maxLength)
    onChange(val)
  }

  let colorHex = isFocused ? "#60a5fa" : "#555558"
  let labelHex = isFocused ? "#60a5fa" : "#8e8e93"

  return (
    <div className="relative w-full shrink-0">
      <label className="absolute -top-2.5 left-3 px-1.5 text-[13px] bg-[#111111] z-10 font-medium transition-colors duration-200" style={{ fontFamily: SF, color: labelHex }}>
        {label} • {remaining}
      </label>
      <textarea ref={textRef} value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className="w-full bg-transparent border-[1.5px] rounded-[12px] px-4 py-3.5 text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#636366] transition-colors duration-200" style={{ fontFamily: SF, fontSize: "16px", minHeight: "56px", borderColor: colorHex }} rows={1} />
    </div>
  )
}

const TelegramInputGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#111111] rounded-[24px] overflow-hidden flex flex-col mb-4 shadow-lg">
    {children}
  </div>
)

const TelegramInput = ({ label, maxLength, value, onChange, placeholder = "", isLast = false, type = "text" }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const labelColor = isFocused ? "#60a5fa" : "#8e8e93"

  return (
    <div className="relative w-full px-4 pt-3 flex flex-col transition-colors duration-200 bg-transparent">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[13px] font-medium transition-colors duration-200" style={{ color: labelColor, fontFamily: SF }}>{label}</span>
      </div>
      <input type={type} value={value} onChange={(e) => {
        let val = e.target.value
        if (maxLength && val.length > maxLength) val = val.slice(0, maxLength)
        onChange(val)
      }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className="w-full bg-transparent text-white focus:outline-none resize-none overflow-hidden placeholder:text-[#555558] pb-3" style={{ fontFamily: SF, fontSize: "16px", minHeight: "24px" }} />
      {!isLast && <div className="absolute bottom-0 left-4 right-0 h-[1px] bg-[#262626]" />}
    </div>
  )
}

const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const element = event.currentTarget;
  if (element.disabled) return;

  let rippleContainer = element.querySelector('.ripple-container') as HTMLElement;
  if (!rippleContainer) {
    rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none isolate transform-gpu';
    rippleContainer.style.webkitMaskImage = '-webkit-radial-gradient(white, black)';
    rippleContainer.style.zIndex = '0';
    element.appendChild(rippleContainer);
  }

  const circle = document.createElement("span");
  const diameter = Math.max(element.clientWidth, element.clientHeight);
  const radius = diameter / 2;

  const rect = element.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const existingRipple = rippleContainer.querySelector(".ripple");
  if (existingRipple) {
    existingRipple.remove();
  }

  rippleContainer.appendChild(circle);

  setTimeout(() => {
    circle.remove();
  }, 600);
}

export function GroupConfigView({ onClose, apiBaseUrl }: { onClose: () => void, apiBaseUrl: string }) {
  // Navigation state
  const [subPage, setSubPage] = useState<"main" | "noir_ai" | "auto_tags" | "anti_flood">("main")

  // Refs
  const pickerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Groups state
  const [groups, setGroups] = useState<{chat_id: number, chat_title: string}[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Config state
  const [noirAIEnabled, setNoirAIEnabled] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [adaptToGroup, setAdaptToGroup] = useState(false)
  
  const [floodEnabled, setFloodEnabled] = useState(true)
  const [floodWindowSec, setFloodWindowSec] = useState("30")
  const [floodMaxMsgs, setFloodMaxMsgs] = useState("5")
  const [floodDominancePct, setFloodDominancePct] = useState("40")
  
  const [autoTagsEnabled, setAutoTagsEnabled] = useState(false)
  const [tagMode, setTagMode] = useState("activity")
  
  const [antispamEnabled, setAntispamEnabled] = useState(true)

  useEffect(() => {
    async function fetchGroups() {
      try {
        const initData = typeof window !== "undefined" ? (window as any).Telegram?.WebApp?.initData : ""
        const url = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/api/group_admin_list` : "/api/group_admin_list"
        const res = await fetch(url, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "x-init-data": initData || ""
          }
        })
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        if (data.groups) {
          setGroups(data.groups)
          if (data.groups.length > 0) setSelectedGroupId(data.groups[0].chat_id)
        }
      } catch (e) {
        console.log("Error fetching groups", e)
      } finally {
        setLoadingGroups(false)
      }
    }
    fetchGroups()
  }, [apiBaseUrl])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGroupDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchSettings() {
      if (!selectedGroupId) return
      setLoadingSettings(true)
      try {
        const initData = typeof window !== "undefined" ? (window as any).Telegram?.WebApp?.initData : ""
        const url = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/api/group_settings/${selectedGroupId}` : `/api/group_settings/${selectedGroupId}`
        const res = await fetch(url, {
          headers: { "x-init-data": initData || "" }
        })
        if (res.ok) {
          const data = await res.json()
          setSystemPrompt(data.natural_rules || "")
          setNoirAIEnabled(!!data.natural_rules)
          setAdaptToGroup(!!data.adapt_to_group)
          setFloodEnabled(!!data.flood_enabled)
          setFloodWindowSec(String(data.flood_window_sec || 30))
          setFloodMaxMsgs(String(data.flood_max_msgs || 5))
          setFloodDominancePct(String(data.flood_dominance_pct || 40))
          setAutoTagsEnabled(!!data.auto_tags_enabled)
          setTagMode(data.tag_mode || "activity")
          setAntispamEnabled(!!data.antispam_enabled)
        }
      } catch (e) {
        console.log("Error fetching settings", e)
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [selectedGroupId, apiBaseUrl])

  const handleSave = async (overrides: any = {}) => {
    if (!selectedGroupId) return
    setIsSaving(true)
    try {
      const initData = typeof window !== "undefined" ? (window as any).Telegram?.WebApp?.initData : ""
      const url = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/api/group_settings` : `/api/group_settings`
      
      const payload = {
          initData,
          chat_id: selectedGroupId,
          natural_rules: ("noirAIEnabled" in overrides ? overrides.noirAIEnabled : noirAIEnabled) 
                          ? ("systemPrompt" in overrides ? overrides.systemPrompt : systemPrompt) 
                          : "",
          adapt_to_group: "adaptToGroup" in overrides ? overrides.adaptToGroup : adaptToGroup,
          flood_enabled: "floodEnabled" in overrides ? overrides.floodEnabled : floodEnabled,
          flood_window_sec: parseInt("floodWindowSec" in overrides ? overrides.floodWindowSec : floodWindowSec) || 30,
          flood_max_msgs: parseInt("floodMaxMsgs" in overrides ? overrides.floodMaxMsgs : floodMaxMsgs) || 5,
          flood_dominance_pct: parseInt("floodDominancePct" in overrides ? overrides.floodDominancePct : floodDominancePct) || 40,
          auto_tags_enabled: "autoTagsEnabled" in overrides ? overrides.autoTagsEnabled : autoTagsEnabled,
          tag_mode: "tagMode" in overrides ? overrides.tagMode : tagMode,
          antispam_enabled: "antispamEnabled" in overrides ? overrides.antispamEnabled : antispamEnabled
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        if (!overrides._silent) {
          setSubPage("main")
        }
      }
    } catch (e) {
      console.log("Error saving settings", e)
    } finally {
      setIsSaving(false)
    }
  }

  // Telegram Native BackButton Management
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      if (!tg.BackButton) return;
      
      tg.BackButton.show();
      const handleBack = () => {
        if (subPage !== "main") {
          setSubPage("main");
        } else {
          onClose();
        }
      };
      
      tg.onEvent('backButtonClicked', handleBack);
      return () => {
        tg.offEvent('backButtonClicked', handleBack);
        tg.BackButton.hide();
      };
    }
  }, [subPage, onClose]);

  if (loadingGroups) {
    return (
      <div key="loading" className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 bg-[#000] fixed top-0 left-0 w-full z-[70]" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#60a5fa] border-t-transparent animate-spin mb-4" />
        <span className="text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>Loading groups...</span>
      </div>
    )
  }

  const selectedGroup = groups.find(g => g.chat_id === selectedGroupId)
  const selectedGroupTitle = selectedGroup ? selectedGroup.chat_title : "No Group Selected"
  const initials = selectedGroupTitle.charAt(0).toUpperCase()

  if (subPage === "noir_ai") {
    return (
      <div key="noir_ai" className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 bg-[#000] fixed top-0 left-0 w-full z-[70]" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
        <SubHeader title="Noir AI" />
        
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-none px-4 pt-4 pb-4 space-y-6">
          <div className="flex flex-col items-center justify-center pt-4 pb-2 shrink-0">
            <PenOff className="w-[56px] h-[56px] text-[#8e8e93]" strokeWidth={1.5} />
            <p className="text-[#8e8e93] text-[14px] text-center mt-4 px-6 leading-relaxed" style={{ fontFamily: SF }}>
              Customize Noir AI's personality and system prompt specifically for this group.
            </p>
          </div>
          <Section>
            <Row 
              label="Enable Noir AI" 
              rightNode={<SwitchNode on={noirAIEnabled} onToggle={() => setNoirAIEnabled(!noirAIEnabled)} />} 
              onClick={() => setNoirAIEnabled(!noirAIEnabled)} 
              last={!noirAIEnabled} 
            />
            {noirAIEnabled && (
              <div className="px-4 py-5 bg-[#111111] border-t border-[#1c1c1e] flex flex-col gap-4">
                <ExpandingInput 
                  label="System Prompt" 
                  maxLength={1024} 
                  value={systemPrompt} 
                  onChange={setSystemPrompt} 
                  placeholder="Type your system prompt here..." 
                />
              </div>
            )}
          </Section>

          <div className="pt-2 flex items-center w-full relative z-10 shrink-0">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              onPointerDown={createRipple}
              className="w-full relative overflow-hidden flex items-center justify-center py-3.5 rounded-full text-white font-bold active:opacity-80 transition-opacity shadow-lg disabled:opacity-70" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              {isSaving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin relative z-10" />
              ) : (
                <span className="relative z-10">Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (subPage === "anti_flood") {
    return (
      <div key="anti_flood" className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 bg-[#000] fixed top-0 left-0 w-full z-[70]" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
        <SubHeader title="Anti-Flood" />
        
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-none px-4 pt-8 pb-4 space-y-6">
          <Section>
            <Row 
              label="Enable Anti-Flood" 
              rightNode={<SwitchNode on={floodEnabled} onToggle={() => setFloodEnabled(!floodEnabled)} />} 
              onClick={() => setFloodEnabled(!floodEnabled)} 
              last
            />
          </Section>

          {floodEnabled && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <h3 className="text-[#60a5fa] font-semibold text-[14px] mb-2 px-4" style={{ fontFamily: SF }}>Flood Limits</h3>
              <TelegramInputGroup>
                <TelegramInput label="Time Window (sec)" maxLength={3} value={floodWindowSec} onChange={setFloodWindowSec} type="number" />
                <TelegramInput label="Max Messages" maxLength={3} value={floodMaxMsgs} onChange={setFloodMaxMsgs} type="number" />
                <TelegramInput label="Dominance %" maxLength={3} value={floodDominancePct} onChange={setFloodDominancePct} type="number" isLast />
              </TelegramInputGroup>
              <p className="px-4 text-[#8e8e93] text-[13px] mt-2 leading-relaxed" style={{ fontFamily: SF }}>
                Define how many messages a user can send within a specific time window before being restricted.
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center w-full relative z-10 shrink-0">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full relative overflow-hidden flex items-center justify-center py-3.5 rounded-full text-white font-bold active:opacity-80 transition-opacity shadow-lg disabled:opacity-70" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              {isSaving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin relative z-10" />
              ) : (
                <span className="relative z-10">Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (subPage === "auto_tags") {
    return (
      <div key="auto_tags" className="flex-1 flex flex-col animate-in slide-in-from-right duration-300 bg-[#000] fixed top-0 left-0 w-full z-[70]" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
        <SubHeader title="Auto-Tags" />
        
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-none pb-6">
          <div className="flex flex-col items-center justify-center pt-6 pb-2 shrink-0">
            <Image 
              src="/member-title-tags.webp" 
              alt="Member Title Tags" 
              width={144}
              height={144}
              className="w-36 h-36 object-contain pointer-events-none select-none drop-shadow-2xl"
              draggable={false}
            />
            <p className="text-[#8e8e93] text-[14px] text-center mt-5 px-8 leading-relaxed" style={{ fontFamily: SF }}>
              Automatically assign custom titles to your group members based on their activity or time spent in the chat.
            </p>
          </div>

          <div className="px-4 pt-4 flex-1 flex flex-col space-y-6">
          <Section>
            <Row 
              label="Enable Auto-Tags" 
              rightNode={<SwitchNode on={autoTagsEnabled} onToggle={() => setAutoTagsEnabled(!autoTagsEnabled)} />} 
              onClick={() => setAutoTagsEnabled(!autoTagsEnabled)} 
              last
            />
          </Section>

          {/* New CSS Preview & Picker */}
          {autoTagsEnabled && (
            <div className="flex flex-col animate-in fade-in duration-300">
               <h3 className="text-[#60a5fa] font-semibold text-[15px] mb-2 px-4" style={{ fontFamily: SF }}>Appearance & Mode</h3>
               <div className="bg-[#111111] rounded-[20px] p-3 flex items-center shadow-lg relative overflow-hidden">
                 
                 {/* Left: Preview Card */}
                 <div className="flex-1 bg-[#1c1c1e] rounded-[14px] p-2 relative overflow-hidden flex items-center mr-2 h-[60px]">
                   <div className="w-[28px] h-[28px] rounded-full bg-white/5 shrink-0 mr-2 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white/20" />
                   </div>
                   <div className="flex-1 flex flex-col justify-center space-y-1">
                      <div className="w-[45px] h-[4px] bg-[#60a5fa]/60 rounded-full" />
                      <div className="w-[85%] h-[4px] bg-white/10 rounded-full mt-0.5" />
                      <div className="w-[60%] h-[4px] bg-white/10 rounded-full" />
                   </div>
                   {/* Tag Pill */}
                   <div className="absolute top-1.5 right-1.5 bg-white/10 px-1.5 py-[2px] rounded-[5px] flex items-center justify-center">
                      <span className="text-white/90 text-[8px] font-medium" style={{ fontFamily: SF }}>
                        {tagMode === "activity" ? "👑 OG Member" : tagMode === "join_date" ? "joined 1mo 3d" : "🛡️ Custom"}
                      </span>
                   </div>
                 </div>

                 {/* Right: Picker List */}
                 <div 
                   className="relative h-[90px] w-[110px] shrink-0"
                   style={{ 
                     WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                     maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)"
                   }}
                 >
                   <div className="absolute top-[30px] w-full h-[30px] border-y-[1.5px] border-[#60a5fa] pointer-events-none z-10" />
                   
                   <div 
                     ref={pickerRef}
                     className="h-full w-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
                     style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                     onScroll={(e) => {
                        const top = e.currentTarget.scrollTop;
                        const index = Math.round(top / 30);
                        const modes = ["activity", "join_date", "custom"];
                        if (modes[index] && tagMode !== modes[index]) {
                          setTagMode(modes[index]);
                        }
                     }}
                   >
                     <div className="h-[30px] shrink-0" />
                     {["Activity", "Join Date", "Custom"].map((m, idx) => {
                       const modeKey = m.toLowerCase().replace(' ', '_');
                       const isSelected = tagMode === modeKey;
                       return (
                         <div 
                           key={m} 
                           onClick={() => {
                             setTagMode(modeKey);
                             if (pickerRef.current) {
                               pickerRef.current.scrollTo({ top: idx * 30, behavior: "smooth" });
                             }
                           }}
                           className={`h-[30px] w-full flex items-center justify-center snap-center transition-all duration-200 cursor-pointer ${isSelected ? 'text-white text-[15px] font-medium' : 'text-[#8e8e93] text-[14px] opacity-60'}`}
                           style={{ fontFamily: SF }}
                         >
                           {m}
                         </div>
                       )
                     })}
                     <div className="h-[30px] shrink-0" />
                   </div>
                 </div>

               </div>
               <p className="px-4 text-[#8e8e93] text-[13px] mt-2 leading-relaxed" style={{ fontFamily: SF }}>
                 choose which action you want to perform when you swipe to the left in the chat list
               </p>
            </div>
          )}

          <div className="pt-2 flex items-center w-full relative z-10 shrink-0">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full relative overflow-hidden flex items-center justify-center py-3.5 rounded-full text-white font-bold active:opacity-80 transition-opacity shadow-lg disabled:opacity-70" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              {isSaving ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin relative z-10" />
              ) : (
                <span className="relative z-10">Save Changes</span>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div key="main" className="flex-1 flex flex-col animate-in fade-in zoom-in-[0.98] duration-200 ease-out bg-[#000] fixed top-0 left-0 w-full z-[70]" style={{ height: "var(--tg-viewport-height, 100dvh)" }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          20% { transform: translateX(300%); }
          100% { transform: translateX(300%); }
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          animation: shimmer 5s infinite linear;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-anim 600ms linear;
          background-color: rgba(150, 150, 150, 0.25);
          pointer-events: none;
          z-index: 0;
        }
        @keyframes ripple-anim {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
      <SubHeader title="Group Moderation" />
      
      <div className="flex-1 flex flex-col overflow-y-auto overscroll-none px-4 pt-2 pb-6 space-y-5">
        
        <div className="flex flex-col items-center justify-center pt-2 pb-0 shrink-0">
          <Image 
            src="/group-moderation-emoji.webp" 
            alt="Group Moderation Emoji" 
            width={128}
            height={128}
            className="w-32 h-32 object-contain pointer-events-none select-none drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* Top Profile and Group Selector */}
        <div ref={dropdownRef} className="relative pt-1 shrink-0">
          <button 
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
            onPointerDown={createRipple}
            className="w-full bg-[#111111] rounded-[20px] px-3 py-2 flex items-center gap-3 active:bg-[#1c1c1e] transition-colors shadow-md overflow-hidden relative"
          >
            <div className="w-[36px] h-[36px] shrink-0 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[#8e8e93] font-medium text-[15px]" style={{ fontFamily: SFD }}>
              {initials}
            </div>
            
            <div className="flex-1 flex flex-col text-left overflow-hidden relative z-10">
              <span className="text-[#8e8e93] text-[13px] font-medium leading-tight" style={{ fontFamily: SF }}>Selected Group</span>
              <span className="text-white text-[16px] font-semibold truncate leading-tight mt-0.5" style={{ fontFamily: SF }}>{selectedGroupTitle}</span>
            </div>
            
            <div className="flex items-center justify-center shrink-0 relative z-10">
              <ChevronDown className={`w-5 h-5 text-[#60a5fa] transition-transform duration-200 ${showGroupDropdown ? "rotate-180" : ""}`} strokeWidth={2.5} />
            </div>
          </button>

          {/* Group Dropdown */}
          {showGroupDropdown && (
            <div className="absolute top-1 left-0 w-full bg-[#111111] rounded-[20px] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/5">
              <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {groups.length === 0 ? (
                  <div className="p-4 text-center text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>
                    No groups found.
                  </div>
                ) : (
                  groups.map((g, i) => (
                    <button 
                      key={g.chat_id}
                      onClick={() => { setSelectedGroupId(g.chat_id); setShowGroupDropdown(false); }}
                      onPointerDown={createRipple}
                      className="w-full text-left px-5 py-4 text-white active:bg-white/5 transition-colors flex items-center justify-between relative overflow-hidden"
                      style={{ fontFamily: SF, fontSize: "16px", borderBottom: i === groups.length - 1 ? "none" : "1px solid #1c1c1e" }}
                    >
                      <span className="truncate relative z-10">{g.chat_title}</span>
                      {g.chat_id === selectedGroupId && <Check className="w-5 h-5 text-[#60a5fa] relative z-10" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* General Category */}
        <Section title="General" footer="Manage the core settings for moderating and interacting with your groups.">
          <Row 
            label="Noir AI" 
            leftNode={<Astroid className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{noirAIEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("noir_ai")} 
          />
          <Row 
            label="Auto-Tags" 
            leftNode={<Tags className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{autoTagsEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("auto_tags")} 
          />
          <Row 
            label="Anti-Flood" 
            leftNode={<BrickWall className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{floodEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("anti_flood")} 
            last
          />
        </Section>
        
        {/* Features Toggle Category */}
        <Section title="Features">
          <Row 
            label="Anti-Spam" 
            rightNode={<SwitchNode on={antispamEnabled} onToggle={() => {
              const newVal = !antispamEnabled;
              setAntispamEnabled(newVal);
              handleSave({ antispamEnabled: newVal, _silent: true });
            }} />} 
            onClick={() => {
              const newVal = !antispamEnabled;
              setAntispamEnabled(newVal);
              handleSave({ antispamEnabled: newVal, _silent: true });
            }} 
          />
          <Row 
            label="Adapt to Group" 
            rightNode={<SwitchNode on={adaptToGroup} onToggle={() => {
              const newVal = !adaptToGroup;
              setAdaptToGroup(newVal);
              handleSave({ adaptToGroup: newVal, _silent: true });
            }} />} 
            onClick={() => {
              const newVal = !adaptToGroup;
              setAdaptToGroup(newVal);
              handleSave({ adaptToGroup: newVal, _silent: true });
            }} 
            last 
          />
        </Section>

        {/* Add New Group Button */}
        <div className="pt-2 shrink-0">
          <a 
            href="https://t.me/NoirHereBot?startgroup=true" 
            target="_blank" 
            rel="noopener noreferrer" 
            onPointerDown={createRipple}
            className="w-full bg-[#111111] rounded-[20px] px-4 py-3 flex items-center justify-between active:bg-[#1c1c1e] transition-colors shadow-sm group relative overflow-hidden"
          >
            <span className="text-[#60a5fa] font-semibold text-[16px] relative z-10" style={{ fontFamily: SF }}>Add a new group</span>
            <div className="flex items-center justify-center shrink-0 group-active:scale-95 transition-transform relative z-10">
               <Plus className="w-5 h-5 text-[#60a5fa]" strokeWidth={2.5} />
            </div>
          </a>
          <div className="px-4 mt-2 text-[#8e8e93] text-[13px] leading-snug" style={{ fontFamily: SF }}>
            Add Noir to your Telegram group to automatically moderate members, manage permissions, and assign custom titles based on chat activity.
          </div>
        </div>

      </div>
    </div>
  )
}
