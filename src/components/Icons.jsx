const strokeColor = (active, color) => color || 'currentColor'
const fillColor = (active, color) => (active && color ? color : 'none')

export function IconCamera({ active, color }) {
  const stroke = strokeColor(active, color)
  const fill = fillColor(active, color)
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
      <path d="M23 7l-7 5 7 5V7z" fill={fill} />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

export function IconMic({ active, color }) {
  const stroke = strokeColor(active, color)
  const fill = fillColor(active, color)
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={fill} />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

export function IconChat({ active, color }) {
  const stroke = strokeColor(active, color)
  const fill = fillColor(active, color)
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={fill} />
      <circle cx="9" cy="10" r="1" fill={active ? stroke : 'none'} stroke={stroke} />
      <circle cx="12" cy="10" r="1" fill={active ? stroke : 'none'} stroke={stroke} />
      <circle cx="15" cy="10" r="1" fill={active ? stroke : 'none'} stroke={stroke} />
    </svg>
  )
}

export function IconHand({ active, color }) {
  const stroke = strokeColor(active, color)

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={active ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v6M10 10V5a2 2 0 0 0-4 0v9a8 8 0 0 0 16 0v-5a2 2 0 0 0-4 0" />
    </svg>
  )
}

export function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0l2.4 7.2L22 9.6l-7.2 2.4L12 19.2 9.6 12 2.4 9.6 9.6 7.2 12 0z" />
    </svg>
  )
}
