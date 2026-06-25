import { LEVELS } from '../data/levels'

const STORAGE_KEY = 'engage-lesson-history'
const ARCHIVES_KEY = 'engage-term-archives'
const SESSION_KEY = 'engage-live-session'

export const TERM_OPTIONS = ['Term 1', 'Term 2', 'Term 3', 'Term 4']

const LEVEL_SCORES = Object.fromEntries(
  LEVELS.map((level, index) => [level.id, index])
)

function normalizeTallyHistoryItem(item) {
  if (typeof item === 'string') return { levelId: item }
  if (item && typeof item.levelId === 'string') return item
  return null
}

export function normalizeStudentRatings(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const next = {}
  for (const [key, levelId] of Object.entries(raw)) {
    if (typeof levelId === 'string' && LEVEL_SCORES[levelId] !== undefined) {
      next[key] = levelId
    }
  }
  return next
}

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

export function hasUnsavedTally(tallies) {
  return getTotalStudents(tallies) > 0
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

export function loadArchives() {
  try {
    const raw = localStorage.getItem(ARCHIVES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveArchives(archives) {
  localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives))
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return {
        date: todayISO(),
        tally: {},
        tallyHistory: [],
        studentRatings: {},
        selectedStudent: null,
      }
    }
    const parsed = JSON.parse(raw)
    return {
      date: parsed.date || todayISO(),
      tally: parsed.tally || {},
      tallyHistory: Array.isArray(parsed.tallyHistory)
        ? parsed.tallyHistory.map(normalizeTallyHistoryItem).filter(Boolean)
        : [],
      studentRatings: normalizeStudentRatings(parsed.studentRatings),
      selectedStudent:
        typeof parsed.selectedStudent === 'number' ? parsed.selectedStudent : null,
    }
  } catch {
    return {
      date: todayISO(),
      tally: {},
      tallyHistory: [],
      studentRatings: {},
      selectedStudent: null,
    }
  }
}

export function saveSession({ date, tally, tallyHistory, studentRatings, selectedStudent }) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      date,
      tally,
      tallyHistory,
      studentRatings: normalizeStudentRatings(studentRatings),
      selectedStudent: typeof selectedStudent === 'number' ? selectedStudent : null,
    })
  )
}

export function clearLiveSession() {
  saveSession({
    date: todayISO(),
    tally: {},
    tallyHistory: [],
    studentRatings: {},
    selectedStudent: null,
  })
}

export function buildStudentRatingEntries(studentRatings, roster = []) {
  return Object.entries(normalizeStudentRatings(studentRatings))
    .map(([index, levelId]) => {
      const slot = Number(index)
      const name = (roster[slot] || '').trim() || `Student ${slot + 1}`
      return {
        index: slot,
        name,
        levelId,
        score: calcEngagementScore({ [levelId]: 1 }),
      }
    })
    .sort((a, b) => a.index - b.index)
}

export function getStudentScoreFromRecord(record, studentIndex) {
  const entries = record.studentRatings || []
  const match = entries.find((entry) => entry.index === studentIndex)
  return match?.score ?? null
}

export function addLessonRecord({ label, date, tallies, studentRatings = [] }) {
  const records = loadHistory()
  const record = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: label.trim() || formatDefaultLabel(date),
    date,
    tallies: { ...emptyTallies(), ...tallies },
    studentRatings: Array.isArray(studentRatings) ? studentRatings : [],
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

export function archiveTerm(termLabel) {
  const records = loadHistory()
  if (records.length === 0) return loadArchives()

  const archives = loadArchives()
  const existing = archives[termLabel] || []
  archives[termLabel] = [...existing, ...records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.savedAt.localeCompare(b.savedAt)
  )
  saveArchives(archives)
  saveHistory([])
  return archives
}

export function getArchivedTermLabels() {
  return Object.keys(loadArchives()).filter(
    (term) => (loadArchives()[term] || []).length > 0
  )
}

export function getArchivedLessons(termLabel) {
  return loadArchives()[termLabel] || []
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    activeLessons: loadHistory(),
    archivedTerms: loadArchives(),
    liveSession: loadSession(),
    studentRoster: JSON.parse(localStorage.getItem('engage-student-roster') || '[]'),
  }
}

export function downloadExport() {
  const data = exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `engage-export-${todayISO()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ARCHIVES_KEY)
  localStorage.removeItem(SESSION_KEY)
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
