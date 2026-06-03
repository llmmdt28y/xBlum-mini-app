"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronRight, ChevronDown, Check, Shield, Zap, Users, MessageSquare, Save, Settings2, Trash2 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

function Toggle({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }} disabled={disabled} className={"relative rounded-full transition-colors duration-100 shrink-0 z-10 " + (disabled ? "opacity-50" : "")} style={{ width: "42px", height: "24px", background: on ? activeColor : "#2c2c2e" }}>
      <span className="absolute rounded-full transition-all duration-100" style={{ width: "16px", height: "16px", top: "4px", background: "#111111", left: on ? "22px" : "4px" }} />
    </button>
  )
}

function SwitchNode({ on, onToggle, disabled, activeColor = "#60a5fa" }: { on: boolean; onToggle: () => void; disabled?: boolean; activeColor?: string }) {
  return (
    <div className="flex items-center">
      <div className="w-[1px] h-[22px] bg-[#2c2c2e] mr-3.5" />
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
    <div className="space-y-2 mb-4 w-full"> 
      {title && (
        <div className="px-4 mb-1.5 flex items-center justify-between">
          <h2 className="text-[#60a5fa] text-[15px] font-semibold" style={{ fontFamily: SF }}>{title}</h2>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className="rounded-[24px] overflow-hidden shadow-lg border border-white/5 bg-[#111111] relative">
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

  const className = `relative w-full flex gap-3.5 px-4 py-3.5 ${onClick ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left items-${alignItems}`;

  return (
    <>
      <button onClick={onClick} disabled={!onClick && !rightNode} className={className}>
        {content}
      </button>
      {!last && <div className={`h-[1px] bg-[#1c1c1e] relative z-20 ${leftNode ? 'ml-[46px]' : 'ml-4'}`} />}
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
  <div className="bg-[#111111] rounded-[24px] overflow-hidden flex flex-col mb-4 border border-white/5 shadow-lg">
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
      {!isLast && <div className="absolute bottom-0 left-4 right-0 h-[1px] bg-[#2c2c2e]" />}
    </div>
  )
}

export function GroupConfigView({ onClose, apiBaseUrl }: { onClose: () => void, apiBaseUrl: string }) {
  // Navigation state
  const [subPage, setSubPage] = useState<"main" | "noir_ai" | "auto_tags" | "anti_flood">("main")

  // Refs
  const pickerRef = useRef<HTMLDivElement>(null)

  // Groups state
  const [groups, setGroups] = useState<{chat_id: number, chat_title: string}[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)

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
        const res = await fetch("/api/group_admin_list", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "x-init-data": initData || ""
          }
        })
        const data = await res.json()
        if (data.groups) {
          setGroups(data.groups)
          if (data.groups.length > 0) setSelectedGroupId(data.groups[0].chat_id)
        }
      } catch (e) {
        console.log("Error fetching groups", e)
      }
    }
    fetchGroups()
  }, [])

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
      
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [subPage, onClose]);

  const selectedGroup = groups.find(g => g.chat_id === selectedGroupId)
  const selectedGroupTitle = selectedGroup ? selectedGroup.chat_title : "No Group Selected"
  const initials = selectedGroupTitle.charAt(0).toUpperCase()

  if (subPage === "noir_ai") {
    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 ease-out bg-[#000] absolute inset-0 z-[70]" style={{ height: "var(--tg-viewport-height, 100vh)" }}>
        <SubHeader title="Noir AI" />
        
        <div className="flex-1 flex flex-col overflow-y-auto px-4 pt-8 pb-4 space-y-6">
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

          <div className="mt-auto pt-4 flex items-center w-full relative z-10 shrink-0">
            <button 
              onClick={() => setSubPage("main")} 
              className="w-full relative overflow-hidden py-3.5 rounded-full text-white font-bold active:opacity-80 transition-opacity shadow-lg" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (subPage === "anti_flood") {
    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 ease-out bg-[#000] absolute inset-0 z-[70]" style={{ height: "var(--tg-viewport-height, 100vh)" }}>
        <SubHeader title="Anti-Flood" />
        
        <div className="flex-1 flex flex-col overflow-y-auto px-4 pt-8 pb-4 space-y-6">
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

          <div className="mt-auto pt-4 flex items-center w-full relative z-10 shrink-0">
            <button 
              onClick={() => setSubPage("main")} 
              className="w-full relative overflow-hidden py-3.5 rounded-full text-white font-bold active:opacity-80 transition-opacity shadow-lg" 
              style={{ background: "#60a5fa", fontFamily: SF, fontSize: "16px" }}
            >
              <span className="relative z-10">Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (subPage === "auto_tags") {
    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 ease-out bg-[#000] absolute inset-0 z-[70]" style={{ height: "var(--tg-viewport-height, 100vh)" }}>
        <SubHeader title="Auto-Tags" />
        
        <div className="flex-1 flex flex-col overflow-y-auto pb-6">
          <div className="flex flex-col items-center justify-center pt-6 pb-2 shrink-0">
            <img 
              src="/member-title-tags.webp" 
              alt="Member Title Tags" 
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
               <div className="bg-[#111111] rounded-[20px] border border-white/5 p-3 flex items-center shadow-lg relative overflow-hidden">
                 
                 {/* Left: Preview Card */}
                 <div className="flex-1 bg-[#1c1c1e] rounded-[14px] p-2.5 relative overflow-hidden flex items-center mr-3 h-[74px]">
                   <div className="w-[32px] h-[32px] rounded-full bg-white/5 shrink-0 mr-2.5 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white/20" />
                   </div>
                   <div className="flex-1 flex flex-col justify-center space-y-1.5">
                      <div className="w-[45px] h-[5px] bg-[#60a5fa]/60 rounded-full" />
                      <div className="w-[85%] h-[5px] bg-white/10 rounded-full mt-0.5" />
                      <div className="w-[60%] h-[5px] bg-white/10 rounded-full" />
                   </div>
                   {/* Tag Pill */}
                   <div className="absolute top-2 right-2 bg-white/10 px-1.5 py-[2px] rounded-[5px] flex items-center justify-center">
                      <span className="text-white/90 text-[9px] font-medium" style={{ fontFamily: SF }}>
                        {tagMode === "activity" ? "👑 OG Member" : tagMode === "join_date" ? "joined 1mo 3d" : "🛡️ Custom"}
                      </span>
                   </div>
                 </div>

                 {/* Right: Picker List */}
                 <div 
                   className="relative h-[120px] w-[110px] shrink-0"
                   style={{ 
                     WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                     maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)"
                   }}
                 >
                   <div className="absolute top-[40px] w-full h-[40px] border-y-[1.5px] border-[#60a5fa] pointer-events-none z-10" />
                   
                   <div 
                     ref={pickerRef}
                     className="h-full w-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
                     style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                     onScroll={(e) => {
                        const top = e.currentTarget.scrollTop;
                        const index = Math.round(top / 40);
                        const modes = ["activity", "join_date", "custom"];
                        if (modes[index] && tagMode !== modes[index]) {
                          setTagMode(modes[index]);
                        }
                     }}
                   >
                     <div className="h-[40px] shrink-0" />
                     {["Activity", "Join Date", "Custom"].map((m, idx) => {
                       const modeKey = m.toLowerCase().replace(' ', '_');
                       const isSelected = tagMode === modeKey;
                       return (
                         <div 
                           key={m} 
                           onClick={() => {
                             setTagMode(modeKey);
                             if (pickerRef.current) {
                               pickerRef.current.scrollTo({ top: idx * 40, behavior: "smooth" });
                             }
                           }}
                           className={`h-[40px] w-full flex items-center justify-center snap-center transition-all duration-200 cursor-pointer ${isSelected ? 'text-white text-[15px] font-medium' : 'text-[#8e8e93] text-[14px] opacity-60'}`}
                           style={{ fontFamily: SF }}
                         >
                           {m}
                         </div>
                       )
                     })}
                     <div className="h-[40px] shrink-0" />
                   </div>
                 </div>

               </div>
               <p className="px-4 text-[#8e8e93] text-[13px] mt-2 leading-relaxed" style={{ fontFamily: SF }}>
                 choose which action you want to perform when you swipe to the left in the chat list
               </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out bg-[#000] absolute inset-0 z-[70]" style={{ height: "var(--tg-viewport-height, 100vh)" }}>
      <SubHeader title="Group Moderation" />
      
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pt-6 pb-6 space-y-6">
        
        {/* Top Profile and Group Selector */}
        <div className="flex flex-col items-center justify-center relative pt-2">
          <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-4 shadow-lg text-white font-bold text-[36px]" style={{ fontFamily: SFD }}>
            {initials}
          </div>
          
          <button 
            onClick={() => setShowGroupDropdown(!showGroupDropdown)}
            className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full active:bg-[#2c2c2e] transition-colors border border-white/10"
            style={{ background: "#1c1c1e" }}
          >
            <span className="text-white font-medium text-[15px]" style={{ fontFamily: SF }}>Selected: {selectedGroupTitle}</span>
            <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform ${showGroupDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* Group Dropdown */}
          {showGroupDropdown && (
            <div className="absolute top-full mt-2 w-full max-w-[280px] bg-[#111111] border border-[#1c1c1e] rounded-[20px] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {groups.length === 0 ? (
                <div className="p-4 text-center text-[#8e8e93] text-[14px]" style={{ fontFamily: SF }}>
                  No groups found.
                </div>
              ) : (
                groups.map((g, i) => (
                  <button 
                    key={g.chat_id}
                    onClick={() => { setSelectedGroupId(g.chat_id); setShowGroupDropdown(false); }}
                    className="w-full text-left px-4 py-3.5 text-white active:bg-white/5 transition-colors"
                    style={{ fontFamily: SF, fontSize: "15px", borderBottom: i === groups.length - 1 ? "none" : "1px solid #1c1c1e" }}
                  >
                    {g.chat_title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* General Category */}
        <Section title="General" footer="Manage the core settings for moderating and interacting with your groups.">
          <Row 
            label="Noir AI" 
            leftNode={<MessageSquare className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{noirAIEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("noir_ai")} 
          />
          <Row 
            label="Auto-Tags" 
            leftNode={<Zap className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{autoTagsEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("auto_tags")} 
          />
          <Row 
            label="Anti-Flood" 
            leftNode={<Shield className="w-[20px] h-[20px] text-[#8e8e93] shrink-0" />}
            rightNode={<span className="text-[#60a5fa] font-medium" style={{ fontFamily: SF, fontSize: "15px" }}>{floodEnabled ? "On" : "Off"}</span>}
            onClick={() => setSubPage("anti_flood")} 
            last
          />
        </Section>
        
        {/* Features Toggle Category */}
        <Section title="Features">
          <Row 
            label="Anti-Spam" 
            rightNode={<SwitchNode on={antispamEnabled} onToggle={() => setAntispamEnabled(!antispamEnabled)} />} 
            onClick={() => setAntispamEnabled(!antispamEnabled)} 
          />
          <Row 
            label="Adapt to Group" 
            rightNode={<SwitchNode on={adaptToGroup} onToggle={() => setAdaptToGroup(!adaptToGroup)} />} 
            onClick={() => setAdaptToGroup(!adaptToGroup)} 
            last 
          />
        </Section>

        {/* Add New Group Button */}
        <div className="pt-2 shrink-0">
          <a 
            href="https://t.me/NoirHereBot?startgroup=true" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-4 rounded-[20px] font-bold text-white shadow-lg active:scale-[0.98] transition-transform" 
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)", fontFamily: SF, fontSize: "16px" }}
          >
             <Users className="w-[22px] h-[22px]" strokeWidth={2.5} />
             <span className="relative z-10">Add New Group</span>
          </a>
        </div>

      </div>
    </div>
  )
}
