import { useCallback, useEffect, useState } from 'react'
import { LEVELS } from './data/levels'
import LevelCard from './components/LevelCard'
import IconPopup from './components/IconPopup'
import TeacherTally from './components/TeacherTally'
import ProgressChart from './components/ProgressChart'
import LevelUpTips from './components/LevelUpTips'
import SidebarBarChart from './components/SidebarBarChart'
import SessionPrompt from './components/SessionPrompt'
import StudentPills from './components/StudentPills'
import {
  addLessonRecord,
  archiveTerm,
  buildStudentRatingEntries,
  calcEngagementScore,
  clearLiveSession,
  getArchivedTermLabels,
  hasUnsavedTally,
  loadArchives,
  loadHistory,
  loadSession,
  resetAllData,
  saveSession,
  todayISO,
} from './utils/engagement'
import { loadRoster, saveRoster } from './utils/students'
import { pickCelebration, CELEBRATION_MS } from './utils/celebrations'
import { asset } from './utils/assets'
import './App.css'

const VIEWS = {
  welcome: 'welcome',
  continuum: 'continuum',
  tally: 'tally',
  progress: 'progress',
  tips: 'tips',
}

const NAV = [
  { id: VIEWS.continuum, label: 'Continuum', icon: asset('images/nav-continuum.png') },
  { id: VIEWS.tally, label: 'Class Tally', icon: asset('images/nav-tally.png') },
  { id: VIEWS.progress, label: 'Progress', icon: asset('images/nav-progress.png') },
  { id: VIEWS.tips, label: 'Level Up Tips', icon: asset('images/nav-tips.png') },
]

function buildArchivedTermsList() {
  const archives = loadArchives()
  return getArchivedTermLabels()
    .map((label) => ({ label, records: archives[label] || [] }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export default function App() {
  const initialSession = loadSession()
  const [view, setView] = useState(VIEWS.welcome)
  const [tally, setTally] = useState(initialSession.tally)
  const [tallyHistory, setTallyHistory] = useState(initialSession.tallyHistory)
  const [studentRatings, setStudentRatings] = useState(initialSession.studentRatings)
  const [selectedStudent, setSelectedStudent] = useState(initialSession.selectedStudent)
  const [roster, setRoster] = useState(loadRoster)
  const [sessionDate, setSessionDate] = useState(initialSession.date)
  const [popId, setPopId] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [iconPopup, setIconPopup] = useState(null)
  const [history, setHistory] = useState(loadHistory)
  const [archivedTerms, setArchivedTerms] = useState(buildArchivedTermsList)
  const [savedFlash, setSavedFlash] = useState(false)
  const [newDayPrompt, setNewDayPrompt] = useState(() => {
    const session = loadSession()
    const today = todayISO()
    return session.date !== today && hasUnsavedTally(session.tally)
      ? session.date
      : null
  })

  const refreshHistory = useCallback(() => {
    setHistory(loadHistory())
    setArchivedTerms(buildArchivedTermsList())
  }, [])

  useEffect(() => {
    saveSession({
      date: sessionDate,
      tally,
      tallyHistory,
      studentRatings,
      selectedStudent,
    })
  }, [sessionDate, tally, tallyHistory, studentRatings, selectedStudent])

  function clearLiveTally() {
    setTally({})
    setTallyHistory([])
    setStudentRatings({})
    setSelectedStudent(null)
    setSessionDate(todayISO())
    clearLiveSession()
  }

  function handleStudentRename(index, name) {
    setRoster((prev) => {
      const next = [...prev]
      next[index] = name
      saveRoster(next)
      return next
    })
  }

  function handleStudentSelect(index) {
    setSelectedStudent((prev) => (prev === index ? null : index))
  }

  function triggerLevelFeedback(level) {
    if (level.zone === 'engagement') {
      setCelebration({ levelId: level.id, anim: pickCelebration() })
      setTimeout(() => setCelebration(null), CELEBRATION_MS)
    } else {
      setPopId(level.id)
      setTimeout(() => setPopId(null), 450)
    }
  }

  function handleTallyClick(level) {
    const levelId = level.id

    if (selectedStudent !== null) {
      const prevLevelId = studentRatings[selectedStudent] || null
      setTally((prev) => {
        const next = { ...prev }
        if (prevLevelId) {
          next[prevLevelId] = Math.max(0, (next[prevLevelId] || 0) - 1)
        }
        next[levelId] = (next[levelId] || 0) + 1
        return next
      })
      setStudentRatings((prev) => ({ ...prev, [selectedStudent]: levelId }))
      setTallyHistory((prev) => [
        ...prev,
        { levelId, studentIndex: selectedStudent, prevLevelId },
      ])
      triggerLevelFeedback(level)
      return
    }

    setTally((prev) => ({
      ...prev,
      [levelId]: (prev[levelId] || 0) + 1,
    }))
    setTallyHistory((prev) => [...prev, { levelId }])
    triggerLevelFeedback(level)
  }

  function handleUndo() {
    setTallyHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setTally((t) => {
        const next = { ...t }
        next[last.levelId] = Math.max(0, (t[last.levelId] || 0) - 1)
        if (typeof last.studentIndex === 'number' && last.prevLevelId) {
          next[last.prevLevelId] = (next[last.prevLevelId] || 0) + 1
        }
        return next
      })
      if (typeof last.studentIndex === 'number') {
        setStudentRatings((ratings) => {
          const next = { ...ratings }
          if (last.prevLevelId) next[last.studentIndex] = last.prevLevelId
          else delete next[last.studentIndex]
          return next
        })
      }
      return prev.slice(0, -1)
    })
  }

  function handleClearTally() {
    clearLiveTally()
  }

  function handleSaveTally() {
    const total = Object.values(tally).reduce((a, b) => a + b, 0)
    if (total === 0) return
    addLessonRecord({
      label: '',
      date: todayISO(),
      tallies: tally,
      studentRatings: buildStudentRatingEntries(studentRatings, roster),
    })
    refreshHistory()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 8000)
  }

  function handleNewLesson() {
    clearLiveTally()
    setSavedFlash(false)
    setView(VIEWS.continuum)
  }

  function handleHome() {
    setView(VIEWS.welcome)
  }

  function handleNewDayClear() {
    clearLiveTally()
    setNewDayPrompt(null)
  }

  function handleNewDayContinue() {
    setNewDayPrompt(null)
  }

  function handleArchiveTerm(termLabel) {
    archiveTerm(termLabel)
    refreshHistory()
  }

  function handleResetAll() {
    resetAllData()
    clearLiveTally()
    refreshHistory()
    setView(VIEWS.welcome)
  }

  function navigate(id) {
    setView(id)
  }

  const totalStudents = Object.values(tally).reduce((a, b) => a + b, 0)
  const score = calcEngagementScore(tally)
  const today = todayISO()
  const todayRecords = history.filter((r) => r.date === today)
  const totalSavedLessons =
    history.length +
    archivedTerms.reduce((sum, term) => sum + term.records.length, 0)
  return (
    <div className="app">
      <aside className={`sidebar ${view === VIEWS.continuum ? 'sidebar--compact' : ''}`}>
        <div className="sidebar__brand">
          <img
            src={asset('images/engage-title.png')}
            alt="Engage"
            className="sidebar__title-img"
          />
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__link ${view === id ? 'sidebar__link--active' : ''}`}
              onClick={() => navigate(id)}
            >
              <img src={icon} alt="" className="sidebar__link-icon-img" />
              {label}
            </button>
          ))}
        </nav>

        {(view === VIEWS.continuum || totalStudents > 0) && (
          <div className="sidebar__session">
            <div className="sidebar__stats">
              <p className="sidebar__stats-label">Today&apos;s tally</p>
              <p className="sidebar__stats-value">{totalStudents}</p>
              {totalStudents > 0 && (
                <p className="sidebar__stats-score">{score}% engaged</p>
              )}
              <SidebarBarChart tally={tally} />
            </div>
            <div className="sidebar__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sidebar"
                onClick={handleUndo}
                disabled={tallyHistory.length === 0}
              >
                Undo last
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sidebar"
                onClick={handleClearTally}
                disabled={totalStudents === 0}
              >
                Clear lesson
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sidebar"
                onClick={handleSaveTally}
                disabled={totalStudents === 0}
              >
                Save lesson
              </button>
            </div>
            {savedFlash && (
              <div className="sidebar__saved">
                <p>Saved to Progress!</p>
                <button
                  type="button"
                  className="sidebar__new-lesson"
                  onClick={handleNewLesson}
                >
                  New lesson →
                </button>
              </div>
            )}
          </div>
        )}

        {totalSavedLessons > 0 && (
          <div className="sidebar__stats sidebar__stats--lessons">
            <p className="sidebar__stats-label">Lessons saved</p>
            <p className="sidebar__stats-value">{totalSavedLessons}</p>
          </div>
        )}

        <button type="button" className="sidebar__reset" onClick={handleHome}>
          Home
        </button>

        <footer className="sidebar__footer">Created by Mr C 2026</footer>
      </aside>

      <main className={`main ${view === VIEWS.continuum ? 'main--hero' : ''}`}>
        {view === VIEWS.welcome && (
          <section className="welcome">
            <div className="welcome__glow" aria-hidden />
            <div className="welcome__content">
              <p className="welcome__eyebrow">Student Engagement Continuum</p>
              <h2 className="welcome__heading">
                How is everyone<br />
                <span className="welcome__highlight">tracking today?</span>
              </h2>
              <button
                type="button"
                className="btn btn--primary btn--large welcome__cta"
                onClick={() => setView(VIEWS.continuum)}
              >
                Let&apos;s grow some minds
              </button>
            </div>
          </section>
        )}

        {view === VIEWS.continuum && (
          <section className="continuum">
            <div className="continuum__students">
              <StudentPills
                roster={roster}
                selectedIndex={selectedStudent}
                studentRatings={studentRatings}
                onSelect={handleStudentSelect}
                onRename={handleStudentRename}
              />
            </div>
            <div className="continuum__grid">
              {LEVELS.map((level) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  count={tally[level.id] || 0}
                  pop={popId === level.id}
                  celebration={
                    celebration?.levelId === level.id ? celebration.anim : null
                  }
                  onSelect={handleTallyClick}
                  onIconClick={setIconPopup}
                />
              ))}
            </div>
          </section>
        )}

        {view === VIEWS.tally && (
          <TeacherTally
            onSaved={refreshHistory}
            existingToday={todayRecords}
            initialTallies={tally}
          />
        )}

        {view === VIEWS.progress && (
          <ProgressChart
            records={history}
            archivedTerms={archivedTerms}
            roster={roster}
            onArchiveTerm={handleArchiveTerm}
            onResetAll={handleResetAll}
          />
        )}

        {view === VIEWS.tips && (
          <LevelUpTips />
        )}
      </main>

      {iconPopup && (
        <IconPopup iconKey={iconPopup} onClose={() => setIconPopup(null)} />
      )}

      {newDayPrompt && (
        <SessionPrompt
          date={newDayPrompt}
          onClear={handleNewDayClear}
          onContinue={handleNewDayContinue}
        />
      )}
    </div>
  )
}
