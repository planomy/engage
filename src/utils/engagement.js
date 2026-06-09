import { LEVELS } from '../data/levels'

const STORAGE_KEY = 'engage-lesson-history'

const LEVEL_SCORES = Object.fromEntries(
  LEVELS.map((level, index) => [level.id, index])
)

export function getLevelScore(levelId) {
  return LEVEL_SCORES[levelId] ?? 0
}

export function calcEngagementScore(tallies) {
  const total = Object.values(tallies).reduce((sum, n) => sum + (n || 0), 0)
  if (total === 0) return 0

  const weighted = LEVELS.reduce(
    (sum, level) => sum + (tallies[level.id] || 0) * getLevelScore(level.id),
    0
  )

  return Math.round((weighted / total / (LEVELS.length - 1)) * 100)
}

export function getTotalStudents(tallies) {
  return Object.values(tallies).reduce((sum, n) => sum + (n || 0), 0)
}

export function emptyTallies() {
  return Object.fromEntries(LEVELS.map((l) => [l.id, 0]))
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function addLessonRecord({ label, date, tallies }) {
  const records = loadHistory()
  const record = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: label.trim() || formatDefaultLabel(date),
    date,
    tallies: { ...emptyTallies(), ...tallies },
    score: calcEngagementScore(tallies),
    savedAt: new Date().toISOString(),
  }
  records.push(record)
  saveHistory(records)
  return record
}

export function updateLessonRecord(id, updates) {
  const records = loadHistory().map((r) => {
    if (r.id !== id) return r
    const tallies = updates.tallies ?? r.tallies
    return {
      ...r,
      ...updates,
      tallies,
      score: calcEngagementScore(tallies),
    }
  })
  saveHistory(records)
  return records
}

export function deleteLessonRecord(id) {
  const records = loadHistory().filter((r) => r.id !== id)
  saveHistory(records)
  return records
}

export function getTodayRecord() {
  const today = todayISO()
  const records = loadHistory()
  return records.filter((r) => r.date === today)
}

export function formatDefaultLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
