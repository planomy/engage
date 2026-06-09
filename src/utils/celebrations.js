export const CELEBRATION_ANIMS = [
  'bounce',
  'sparkle',
  'wiggle',
  'rocket',
  'pulse-glow',
  'starburst',
]

export function pickCelebration() {
  return CELEBRATION_ANIMS[Math.floor(Math.random() * CELEBRATION_ANIMS.length)]
}

export const CELEBRATION_MS = 750
