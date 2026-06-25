export const STUDENT_SLOTS = 24

const ROSTER_KEY = 'engage-student-roster'

export function emptyRoster() {
  return Array(STUDENT_SLOTS).fill('')
}

export function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY)
    if (!raw) return emptyRoster()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return emptyRoster()
    const roster = emptyRoster()
    parsed.slice(0, STUDENT_SLOTS).forEach((name, index) => {
      roster[index] = typeof name === 'string' ? name : ''
    })
    return roster
  } catch {
    return emptyRoster()
  }
}

export function saveRoster(roster) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster.slice(0, STUDENT_SLOTS)))
}

export function getStudentLabel(roster, index) {
  const name = roster[index]?.trim()
  return name || `Student ${index + 1}`
}

export function getNamedStudentIndices(roster) {
  return roster
    .map((name, index) => (name.trim() ? index : -1))
    .filter((index) => index >= 0)
}
