"use client"
import { useState, useEffect, useRef } from "react"

// ─── Palette & Fonts ───────────────────────────────────────────────
const SF  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
const SFD = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"

// ─── Mock Data ─────────────────────────────────────────────────────
const CRYSTAL_BALLS = [
  {
    id: 'lady-death',
    name: 'Lady Death',
    tag: '#11179',
    status: 'listed',
    price: 20,
    bg: 'linear-gradient(135deg,#3a1060 0%,#6b21a8 60%,#a855f7 100%)',
    glow: '#a855f7',
    emoji: '💀',
    ballColor: '#c084fc',
    accent: '#e879f9',
  },
  {
    id: 'death-wish',
    name: 'Death Wish',
    tag: '#14640',
    status: 'sold_out',
    price: 80,
    bg: 'linear-gradient(135deg,#1a0a0a 0%,#7f1d1d 60%,#ef4444 100%)',
    glow: '#ef4444',
    emoji: '💫',
    ballColor: '#f87171',
    accent: '#fca5a5',
  },
  {
    id: 'fuschia',
    name: 'Fuschia',
    tag: '#7821',
    status: 'listed',
    price: 20,
    bg: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 50%,#ec4899 100%)',
    glow: '#ec4899',
    emoji: '✨',
    ballColor: '#f472b6',
    accent: '#fbcfe8',
  },
  {
    id: 'seeing-red',
    name: 'Seeing Red',
    tag: '#9302',
    status: 'listed',
    price: 35,
    bg: 'linear-gradient(135deg,#450a0a 0%,#991b1b 50%,#f97316 100%)',
    glow: '#f97316',
    emoji: '🔥',
    ballColor: '#fb923c',
    accent: '#fed7aa',
  },
  {
    id: 'silver',
    name: 'Silver',
    tag: '#3311',
    status: 'listed',
    price: 15,
    bg: 'linear-gradient(135deg,#111827 0%,#374151 50%,#9ca3af 100%)',
    glow: '#9ca3af',
    emoji: '⚡',
    ballColor: '#d1d5db',
    accent: '#f3f4f6',
  },
  {
    id: 'fortune',
    name: 'Fortune',
    tag: '#5541',
    status: 'listed',
    price: 45,
    bg: 'linear-gradient(135deg,#451a03 0%,#92400e 50%,#f59e0b 100%)',
    glow: '#f59e0b',
    emoji: '🔮',
    ballColor: '#fbbf24',
    accent: '#fef08a',
  },
  {
    id: 'teddy',
    name: 'Teddy Bear',
    tag: '#1122',
    status: 'listed',
    price: 25,
    bg: 'linear-gradient(135deg,#1c0a00 0%,#78350f 50%,#d97706 100%)',
    glow: '#d97706',
    emoji: '🧸',
    ballColor: '#c2410c',
    accent: '#fed7aa',
  },
  {
    id: 'incubus',
    name: 'Incubus',
    tag: '#8814',
    status: 'listed',
    price: 60,
    bg: 'linear-gradient(135deg,#0c0014 0%,#4c0080 50%,#7c3aed 100%)',
    glow: '#7c3aed',
    emoji: '👿',
    ballColor: '#8b5cf6',
    accent: '#c4b5fd',
  },
]

const NAV_TABS = ['Store', 'Saved', 'Activity']
const CONTENT_TABS = ['Collection', 'Sale']

// ─── Animated Crystal Ball SVG ─────────────────────────────────────
function CrystalBall({ item, size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        background: item.glow,
        opacity: 0.35,
        filter: `blur(${size * 0.25}px)`,
      }} />
      {/* Ball body */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.45) 0%, ${item.ballColor} 45%, ${item.accent}22 80%, #0a0010 100%)`,
        boxShadow: `inset 0 -4px 12px rgba(0,0,0,0.6), inset 2px 3px 8px rgba(255,255,255,0.25), 0 4px 16px ${item.glow}55`,
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        overflow: 'hidden',
      }}>
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>{item.emoji}</span>
        {/* Specular highlight */}
        <div style={{
          position: 'absolute',
          top: '12%',
          left: '18%',
          width: '32%',
          height: '22%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.55)',
          filter: 'blur(3px)',
          transform: 'rotate(-20deg)',
        }} />
      </div>
      {/* Base pedestal */}
      <div style={{
        position: 'absolute',
        bottom: -size * 0.08,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: size * 0.15,
        background: 'linear-gradient(180deg, rgba(120,60,180,0.6) 0%, rgba(40,20,80,0.9) 100%)',
        borderRadius: '0 0 6px 6px',
        clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
      }} />
    </div>
  )
}

// ─── NFT Card (Grid) ───────────────────────────────────────────────
function NFTCard({ item, onClick }) {
  const [liked, setLiked] = useState(false)
  const isSold = item.status === 'sold_out'

  return (
    <div
      onClick={onClick}
      style={{
        background: '#111118',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${item.glow}33, inset 0 1px 0 rgba(255,255,255,0.08)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      {/* Image area */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: item.bg,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '18px 18px 0 0',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)`,
        }} />
        {/* Skull/bat watermark bg icons */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          fontSize: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          alignItems: 'center',
          justifyItems: 'center',
          padding: 8,
          gap: 4,
          pointerEvents: 'none',
        }}>
          {Array(16).fill(0).map((_, i) => (
            <span key={i}>{i % 3 === 0 ? '💀' : i % 3 === 1 ? '🦇' : '⭐'}</span>
          ))}
        </div>

        <CrystalBall item={item} size={80} />

        {/* Sparkles */}
        {[[-10, -8], [16, 4], [-4, 18]].map(([x, y], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${30 + y}%`,
            left: `${55 + x}%`,
            width: i === 0 ? 6 : 4,
            height: i === 0 ? 6 : 4,
            background: '#fff',
            borderRadius: '50%',
            opacity: 0.7,
            boxShadow: '0 0 6px 2px rgba(255,255,255,0.6)',
          }} />
        ))}
      </div>

      {/* Info area */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: SFD, lineHeight: 1.2 }}>
              {item.name}
            </div>
            <div style={{ color: '#636366', fontSize: 11, fontFamily: SF, fontWeight: 500, marginTop: 1 }}>
              {item.tag}
            </div>
          </div>
        </div>

        {/* Status + Price row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isSold ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
          border: `1px solid ${isSold ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
          borderRadius: 10,
          padding: '6px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* Status dot */}
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: isSold ? '#ef4444' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                {isSold
                  ? <><line x1="2" y1="2" x2="6" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="2" x2="2" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></>
                  : <><circle cx="4" cy="4" r="1.5" fill="white"/></>
                }
              </svg>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: SF,
              color: isSold ? '#f87171' : '#60a5fa',
            }}>
              {isSold ? 'Sold out' : 'Listed'}
            </span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, fontFamily: SF }}>
              {item.price}
            </span>
            {/* TON triangle */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 20h20L12 2z" fill="#0088cc" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar Filter List Item ─────────────────────────────────────
function FilterListItem({ item, onRemove, showRemove }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      cursor: 'pointer',
      transition: 'background 0.12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <CrystalBall item={item} size={40} />
      <span style={{
        color: '#fff',
        fontWeight: 600,
        fontSize: 15,
        fontFamily: SF,
        flex: 1,
      }}>{item.name}</span>
      {showRemove && (
        <div style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="2" y1="2" x2="8" y2="8" stroke="#636366" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="2" y2="8" stroke="#636366" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Bottom Nav ────────────────────────────────────────────────────
function BottomNav({ activeNav, setActiveNav }) {
  const icons = {
    Store: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#636366'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    Saved: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#fff' : 'none'} stroke={active ? '#fff' : '#636366'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    Activity: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#636366'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      background: 'rgba(18,18,22,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 16px',
      zIndex: 100,
    }}>
      {NAV_TABS.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveNav(tab)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 20px',
            borderRadius: 14,
            background: activeNav === tab ? 'rgba(255,255,255,0.07)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          {icons[tab](activeNav === tab)}
          <span style={{
            fontSize: 11,
            fontWeight: activeNav === tab ? 700 : 500,
            color: activeNav === tab ? '#fff' : '#636366',
            fontFamily: SF,
          }}>{tab}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main MarketView ───────────────────────────────────────────────
export default function MarketView() {
  const [activeNav, setActiveNav] = useState('Store')
  const [activeTab, setActiveTab] = useState('Collection')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [isAuction, setIsAuction] = useState(false)

  const balance = '988.52'
  const displayItems = showAll ? CRYSTAL_BALLS : CRYSTAL_BALLS.slice(0, 4)

  return (
    <div style={{
      width: '100%',
      maxWidth: 390,
      height: 844,
      background: '#0d0d10',
      borderRadius: 54,
      overflow: 'hidden',
      position: 'relative',
      fontFamily: SF,
      boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .crystal-float { animation: float 3.5s ease-in-out infinite; }
        .tab-active-indicator {
          animation: shimmer 2s linear infinite;
          background-size: 200% auto;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── STATUS BAR ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 28px 4px',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: SFD }}>09:16</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* signal bars */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
            {[4, 6, 9, 12].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, background: '#fff', borderRadius: 2 }} />
            ))}
          </div>
          {/* wifi */}
          <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 7s5-6 11-6 11 6 11 6"/>
            <path d="M5 11s3-3 7-3 7 3 7 3"/>
            <circle cx="12" cy="15" r="1.5" fill="#fff" stroke="none"/>
          </svg>
          {/* battery */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <div style={{ width: 22, height: 11, border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 3, padding: 1.5 }}>
              <div style={{ width: '80%', height: '100%', background: '#fff', borderRadius: 1.5 }} />
            </div>
            <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div style={{
        padding: '8px 20px 0',
        flexShrink: 0,
      }}>
        {/* Balance row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {/* TON logo */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0088cc, #0050aa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,136,204,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 20h20L12 2z" fill="white"/>
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: SFD }}>
            {balance} <span style={{ color: '#0088cc' }}>TON</span>
          </span>
        </div>

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {/* Collection pill */}
          <button
            onClick={() => { setActiveTab('Collection'); setIsAuction(false) }}
            style={{
              background: activeTab === 'Collection' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTab === 'Collection' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20,
              padding: '6px 14px',
              color: activeTab === 'Collection' ? '#fff' : '#8e8e93',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: SF,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Collection
          </button>

          {/* Sale/Auction toggle */}
          <button
            onClick={() => { setActiveTab('Sale'); setIsAuction(false) }}
            style={{
              background: activeTab === 'Sale' && !isAuction ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTab === 'Sale' && !isAuction ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20,
              padding: '6px 14px',
              color: activeTab === 'Sale' && !isAuction ? '#fff' : '#8e8e93',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: SF,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sale
          </button>
        </div>

        {/* Auction toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 4,
        }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15, fontFamily: SF }}>Auction</span>
          {/* Toggle switch */}
          <div
            onClick={() => setIsAuction(v => !v)}
            style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              background: isAuction ? '#a855f7' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${isAuction ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: isAuction ? '0 0 12px rgba(168,85,247,0.5)' : 'none',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 3,
              left: isAuction ? 20 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'left 0.25s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: 80,
      }}>
        {activeNav === 'Store' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Filter list (sidebar style) */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              {/* Crystal Balls header item */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: 'rgba(168,85,247,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <CrystalBall item={CRYSTAL_BALLS[0]} size={38} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: SF, flex: 1 }}>
                  Crystal Balls
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>

              {/* Show first 4 items in list */}
              {CRYSTAL_BALLS.slice(0, showAll ? CRYSTAL_BALLS.length : 5).map((item, idx) => (
                <FilterListItem
                  key={item.id}
                  item={item}
                  showRemove={idx >= 4}
                />
              ))}

              {/* Show more */}
              {!showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                    fontFamily: SF,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  Show more
                </button>
              )}
            </div>

            {/* ── NFT GRID ── */}
            <div style={{ padding: '16px 16px 0' }}>
              {/* Grid header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <div>
                  <div style={{ color: '#8e8e93', fontSize: 12, fontWeight: 500, fontFamily: SF, marginBottom: 2 }}>
                    Crystal Balls
                  </div>
                  <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: SFD }}>
                    {CRYSTAL_BALLS.length} Items
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Sort */}
                  <button style={{
                    width: 36,
                    height: 36,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="15" y2="12"/>
                      <line x1="3" y1="18" x2="9" y2="18"/>
                    </svg>
                  </button>
                  {/* View toggle */}
                  <button
                    onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                    style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {viewMode === 'grid'
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? '1fr 1fr' : '1fr',
                gap: viewMode === 'grid' ? 12 : 8,
              }}>
                {CRYSTAL_BALLS.map(item => (
                  <NFTCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeNav === 'Saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12, padding: 32 }}>
            <div style={{ fontSize: 56, opacity: 0.3 }}>💜</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: SFD }}>No Saved Items</div>
            <div style={{ color: '#636366', fontSize: 14, fontFamily: SF, textAlign: 'center', lineHeight: 1.5 }}>Items you save will appear here. Tap the heart icon on any NFT.</div>
          </div>
        )}

        {activeNav === 'Activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {CRYSTAL_BALLS.slice(0, 5).map((item, i) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <CrystalBall item={item} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: SF }}>{item.name} {item.tag}</div>
                  <div style={{ color: '#636366', fontSize: 12, fontFamily: SF, marginTop: 2 }}>
                    {i % 2 === 0 ? '🟢 Listed' : '🔴 Sold'} · {Math.floor(Math.random() * 24 + 1)}h ago
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{item.price}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 20h20L12 2z" fill="#0088cc"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* ── DETAIL MODAL ── */}
      {selectedItem && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: '#111118',
              borderRadius: '28px 28px 0 0',
              padding: '20px 20px 40px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              maxHeight: '85%',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{
              width: 40,
              height: 4,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              margin: '0 auto 20px',
            }} />

            {/* Ball hero */}
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              maxWidth: 240,
              margin: '0 auto 20px',
              borderRadius: 28,
              background: selectedItem.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${selectedItem.glow}33`,
              boxShadow: `0 0 60px ${selectedItem.glow}33`,
            }}>
              {/* bg pattern */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, fontSize: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', alignItems:'center', justifyItems:'center', padding:12 }}>
                {Array(16).fill(0).map((_,i) => <span key={i}>{i%2===0?'💀':'🦇'}</span>)}
              </div>
              <div className="crystal-float">
                <CrystalBall item={selectedItem} size={140} />
              </div>
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ color: '#8e8e93', fontSize: 13, fontFamily: SF, marginBottom: 4 }}>Crystal Balls</div>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: SFD }}>
                {selectedItem.name} <span style={{ color: '#636366', fontSize: 18 }}>{selectedItem.tag}</span>
              </div>
            </div>

            {/* Status card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <div>
                <div style={{ color: '#636366', fontSize: 12, fontFamily: SF, marginBottom: 4 }}>Status</div>
                <div style={{
                  color: selectedItem.status === 'sold_out' ? '#f87171' : '#4ade80',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: SF,
                }}>
                  {selectedItem.status === 'sold_out' ? '● Sold Out' : '● Listed'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#636366', fontSize: 12, fontFamily: SF, marginBottom: 4 }}>Price</div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: SFD, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedItem.price}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 20h20L12 2z" fill="#0088cc"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                flex: 1,
                height: 52,
                background: selectedItem.status === 'sold_out' ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${selectedItem.glow}, ${selectedItem.ballColor})`,
                border: 'none',
                borderRadius: 16,
                color: selectedItem.status === 'sold_out' ? '#636366' : '#fff',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: SF,
                cursor: selectedItem.status === 'sold_out' ? 'not-allowed' : 'pointer',
                boxShadow: selectedItem.status !== 'sold_out' ? `0 4px 20px ${selectedItem.glow}44` : 'none',
                transition: 'all 0.2s',
              }}>
                {selectedItem.status === 'sold_out' ? 'Sold Out' : 'Buy Now'}
              </button>
              <button style={{
                flex: 1,
                height: 52,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: SF,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                Make Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
