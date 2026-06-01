"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronRight, X, ChevronDown, Check, Shield, Zap, Users, MessageSquare, Save, Settings2, Trash2 } from "lucide-react"

const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// -- Copied UI Components --
const createRipple = (event: React.PointerEvent<any> | React.MouseEvent<any>) => {
  const element = event.currentTarget
  if (element.disabled) return
  const circle = document.createElement("span")
  const diameter = Math.max(element.clientWidth, element.clientHeight)
  const radius = diameter / 2
  const rect = element.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - rect.left - radius}px`
  circle.style.top = `${event.clientY - rect.top - radius}px`
  circle.classList.add("ripple")
  const existingRipple = element.querySelector(".ripple")
  if (existingRipple) existingRipple.remove()
  element.appendChild(circle)
  setTimeout(() => { circle.remove() }, 600)
}

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

  const className = `relative overflow-hidden w-full flex gap-3.5 px-4 py-3.5 ${onClick ? 'active:bg-white/5 transition-colors cursor-pointer' : ''} text-left items-${alignItems}`;

  return (
    <>
      <button onClick={onClick} onPointerDown={onClick ? createRipple : undefined} disabled={!onClick && !rightNode} className={className}>
        {content}
      </button>
      {!last && <div className={`h-[1px] bg-[#1c1c1e] relative z-20 ${leftNode ? 'ml-[52px]' : 'ml-4'}`} />}
    </>
  )
}

function SubHeader({ title, rightNode, onBack }: { title: string, rightNode?: React.ReactNode, onBack?: () => void }) {
  return (
    <div className="relative flex items-center justify-center px-4 pb-3 z-10 w-full" style={{ paddingTop: "calc(var(--tg-safe-area-inset-top, 24px) + 12px)" }}>
      {onBack && (
        <button onClick={onBack} onPointerDown={createRipple} className="absolute left-4 bottom-1 w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1e] active:opacity-60 transition-opacity z-20">
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

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500 ease-out overflow-y-auto" style={{ background: "#000", minHeight: "100vh" }}>
      <SubHeader title="Group Configuration" onBack={onClose} />
      
      <div className="px-4 pt-4 pb-28 space-y-6">
        
        {/* Top Emoji and Group Selector */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="text-[52px] mb-4">💬</div>
          
          <button 
            onPointerDown={createRipple} 
            className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full active:scale-95 transition-transform border border-white/10"
            style={{ background: "#1c1c1e" }}
          >
            <span className="text-white font-medium text-[15px]" style={{ fontFamily: SF }}>Selected: Dev Group</span>
            <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
          </button>
        </div>

        {/* Noir AI Category */}
        <Section title="Noir AI">
          <Row 
            label="Enable Noir AI" 
            sublabel="Activate AI moderation and intelligence"
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
              <button 
                onPointerDown={createRipple} 
                className="w-full relative overflow-hidden py-3.5 rounded-xl font-bold text-black shadow-md active:opacity-80 transition-opacity" 
                style={{ background: "#60a5fa", fontFamily: SF, fontSize: "15px" }}
              >
                Save Prompt
              </button>
            </div>
          )}
        </Section>
        
        {/* Features Category */}
        <Section title="Features">
          <Row 
            label="Adapt to Group" 
            sublabel="Let AI learn group's normal behavior" 
            rightNode={<SwitchNode on={adaptToGroup} onToggle={() => setAdaptToGroup(!adaptToGroup)} />} 
            onClick={() => setAdaptToGroup(!adaptToGroup)} 
            last 
          />
        </Section>

        {/* Auto-Tag Category */}
        <Section title="Auto-Tag">
          <Row 
            label="Enable Auto-Tags" 
            rightNode={<SwitchNode on={autoTagsEnabled} onToggle={() => setAutoTagsEnabled(!autoTagsEnabled)} />} 
            onClick={() => setAutoTagsEnabled(!autoTagsEnabled)} 
            last={!autoTagsEnabled} 
          />
          {autoTagsEnabled && (
            <>
              {["Activity", "Join Date", "Custom"].map((m, idx, arr) => (
                 <Row 
                   key={m} 
                   label={m} 
                   rightNode={<RadioButton selected={tagMode === m.toLowerCase().replace(' ', '_')} />} 
                   onClick={() => setTagMode(m.toLowerCase().replace(' ', '_'))} 
                   hideArrow 
                   last={idx === arr.length - 1} 
                 />
              ))}
            </>
          )}
        </Section>

        {/* Anti-Flood Category */}
        <Section title="Anti-Flood">
          <Row 
            label="Enable Anti-Flood" 
            rightNode={<SwitchNode on={floodEnabled} onToggle={() => setFloodEnabled(!floodEnabled)} />} 
            onClick={() => setFloodEnabled(!floodEnabled)} 
            last={!floodEnabled} 
          />
          {floodEnabled && (
            <div className="px-4 py-2 bg-[#111111] border-t border-[#1c1c1e]">
              <TelegramInputGroup>
                <TelegramInput label="Time Window (sec)" maxLength={3} value={floodWindowSec} onChange={setFloodWindowSec} type="number" />
                <TelegramInput label="Max Messages" maxLength={3} value={floodMaxMsgs} onChange={setFloodMaxMsgs} type="number" />
                <TelegramInput label="Dominance %" maxLength={3} value={floodDominancePct} onChange={setFloodDominancePct} type="number" isLast />
              </TelegramInputGroup>
            </div>
          )}
        </Section>

        {/* Add New Group Button */}
        <div className="pt-2">
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
