import React from "react"
import { Sparkles } from "lucide-react"
import {
  PreviewPixelHearts, EquippedPixelHearts,
  PreviewAstralStars, EquippedAstralStars,
  PreviewMoneyBags, EquippedMoneyBags
} from "@/components/cosmetics/background-variants"

export const COSMETIC_ITEMS_DB: Record<string, any> = {
  hearts: {
    id: 'hearts', type: 'Profile Background', category: 'Icon Backgrounds', name: 'Pixel Hearts', serial: '#94,355', collection: 'Cosmetic Backgrounds',
    model: 'Pixel Pulse', modelPercent: '0.5%', symbol: 'Heart Aura', symbolPercent: '0.4%', backdrop: 'Retro Flow Grid', backdropPercent: '',
    quantityIssued: 124, quantityMax: 500, reqLevel: 3, reqBP: 2500, date: "MAY 7, 2026",
    desc: 'A premium pixel heart aura that surrounds your avatar, reserved for early supporters.',
    getPreview: () => <PreviewPixelHearts />,
    getEquipped: () => <EquippedPixelHearts />
  },
  astral_stars: {
    id: 'astral_stars', type: 'Profile Background', category: 'Icon Backgrounds', name: 'Astral Shadows', serial: '#42,108', collection: 'Cosmetic Backgrounds',
    model: 'Star Silhouette', modelPercent: '1.2%', symbol: 'White Star', symbolPercent: '0.8%', backdrop: 'Grainy Bronze Gradient', backdropPercent: '',
    quantityIssued: 312, quantityMax: 1000, reqLevel: 1, reqBP: 0, date: "MAY 8, 2026",
    desc: 'A rich, grainy gradient background featuring floating dark star silhouettes. Pure elegance.',
    getPreview: () => <PreviewAstralStars />,
    getEquipped: () => <EquippedAstralStars />
  },
  
  // ── MONEY BAGS ──
  money_bags: {
    id: 'money_bags',
    type: 'Profile Background',
    category: 'Icon Backgrounds',
    name: 'Money Bags',
    serial: '#14,281',
    collection: 'Cosmetic Backgrounds',
    model: 'Shadow Currency',
    modelPercent: '0.7%',
    symbol: 'Money Bag Aura',
    symbolPercent: '0.5%',
    backdrop: 'Blue Grain Gradient',
    backdropPercent: '',
    quantityIssued: 182,
    quantityMax: 600,
    reqLevel: 1, // Puesto en 1 para que lo pruebes
    reqBP: 0,
    date: 'MAY 8, 2026',
    desc: 'Dark floating money bag silhouettes over a soft grainy Telegram-style gradient.',
    getPreview: () => <PreviewMoneyBags />,
    getEquipped: () => <EquippedMoneyBags />
  },

  sparkles: {
    id: 'sparkles', type: 'Name Icon', category: 'Name Icons', name: 'Sparkle Title', serial: '#12,442', collection: 'Name Icons',
    model: 'Cosmetic Badge', modelPercent: '2.5%', symbol: 'Apex Mark', symbolPercent: '1.2%', backdrop: 'Rare', backdropPercent: '',
    quantityIssued: 3150, quantityMax: 10000, reqLevel: 8, reqBP: 50000, date: "MAY 7, 2026",
    desc: 'A sparkling icon that appears next to your username to signify your high rank.',
    getPreview: () => <Sparkles className="w-24 h-24 text-[#8e8e93]" />,
    getEquipped: () => null
  }
}
