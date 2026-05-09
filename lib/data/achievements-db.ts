export const ACHIEVEMENTS_DB: Record<string, any> = {
  robot: {
    id: 'robot', name: 'First Touch', category: 'Vanguard', serial: '#01,244',
    collection: 'Achievements', model: 'Pioneer Badge', modelPercent: '100%',
    symbol: 'Automata', symbolPercent: '100%', backdrop: 'Cosmic Void', backdropPercent: '',
    quantityIssued: 12500, quantityMax: null, reqLevel: 1, img: '/robot-achievement.png',
    desc: 'Complete your first task. The world has answered your touch. A mark of beginning in the xBlum network.',
    date: "MAY 7, 2026"
  },
  pepe: {
    id: 'pepe', name: 'Early Pepe', category: 'Void', serial: '#00,004',
    collection: 'Achievements', model: 'Meme Relic', modelPercent: '0.1%',
    symbol: 'Rare Artifact', symbolPercent: '0.1%', backdrop: 'Dark Matter', backdropPercent: '',
    quantityIssued: 4, quantityMax: 15, reqLevel: 2, img: '/pepe-achievement.png',
    desc: 'Assigned to the first 15 users who reached Level 2 on the platform during the Early Access phase. Your early belief is forever recognized.',
    date: "MAY 7, 2026"
  },
  pyramid: { 
    id: 'pyramid', name: 'The Architect', category: 'Illuminati', serial: '#00,001',
    collection: 'Achievements', model: 'Forbidden Cipher', modelPercent: '0.01%',
    symbol: 'All-Seeing Eye', symbolPercent: '0.01%', backdrop: 'Abyssal Space', backdropPercent: '',
    quantityIssued: 1, quantityMax: 10, reqLevel: 99, img: '/pyramid-achievement.png',
    desc: 'You have uncovered the deepest secrets of the platform. A truly mythic accomplishment reserved for the top elite.',
    date: "MAY 7, 2026"
  }
}
