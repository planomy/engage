import { useCallback, useState } from 'react'
import { LEVELS } from './data/levels'
import LevelCard from './components/LevelCard'
import IconPopup from './components/IconPopup'
import TeacherTally from './components/TeacherTally'
import ProgressChart from './components/ProgressChart'
import LevelUpTips from './components/LevelUpTips'
import SidebarBarChart from './components/SidebarBarChart'
import {
  addLessonRecord,
  calcEngagementScore,
  todayISO,
  loadHistory,
} from './utils/engagement'
import { pickCelebration, CELEBRATION_MS } from './utils/celebrations'
import './App.css'

const VIEWS = {
  welcome: 'welcome',
  continuum: 'continuum',
  tally: 'tally',
  progress: 'progress',
  tips: 'tips',
}

const NAV = [
  { id: VIEWS.continuum, label: 'Continuum', icon: '/images/nav-continuum.png' },
  { id: VIEWS.tally, label: 'Class Tally', icon: '/images/nav-tally.png' },
  { id: VIEWS.progress, label: 'Progress', icon: '/images/nav-progress.png' },
  { id: VIEWS.tips, label: 'Level Up Tips', icon: '/images/nav-tips.png' },
]

export default function App() {
  const [view, setView] = useState(VIEWS.welcome)
  const [tally, setTally] = useState({})
  const [tallyHistory, setTallyHistory] = useState([])
  const [popId, setPopId] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [iconPopup, setIconPopup] = useState(null)
  const [history, setHistory] = useState(loadHistory)
  const [savedFlash, setSavedFlash] = useState(false)

  const refreshHistory = useCallback(() => setHistory(loadHistory()), [])

  function handleTallyClick(level) {
    setTally((prev) => ({
      ...prev,
      [level.id]: (prev[level.id] || 0) + 1,
    }))
    setTallyHistory((prev) => [...prev, level.id])

    if (level.zone === 'engagement') {
      setCelebration({ levelId: level.id, anim: pickCelebration() })
      setTimeout(() => setCelebration(null), CELEBRATION_MS)
    } else {
      setPopId(level.id)
      setTimeout(() => setPopId(null), 450)
    }
  }

  function handleUndo() {
    setTallyHistory((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setTally((t) => ({
        ...t,
        [last]: Math.max(0, (t[last] || 0) - 1),
      }))
      return prev.slice(0, -1)
    })
  }

  function handleClearTally() {
    setTally({})
    setTallyHistory([])
  }

  function handleSaveTally() {
    const total = Object.values(tally).reduce((a, b) => a + b, 0)
    if (total === 0) return
    addLessonRecord({ label: '', date: todayISO(), tallies: tally })
    refreshHistory()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  function handleFullReset() {
    setTally({})
    setTallyHistory([])
    setView(VIEWS.welcome)
  }

  function navigate(id) {
    setView(id)
  }

  const totalStudents = Object.values(tally).reduce((a, b) => a + b, 0)
  const score = calcEngagementScore(tally)
  const todayRecords = history.filter((r) => r.date === todayISO())

  return (
    <div className="app">
      <aside className={`sidebar ${view === VIEWS.continuum ? 'sidebar--compact' : ''}`}>
        <div className="sidebar__brand">
          <img
            src="/images/engage-title.png"
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
            {view === VIEWS.continuum && (
              <p className="sidebar__hint">Ask each student — tap their level</p>
            )}
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
                Clear
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
              <p className="sidebar__saved">Saved to Progress!</p>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="sidebar__stats sidebar__stats--lessons">
            <p className="sidebar__stats-label">Lessons saved</p>
            <p className="sidebar__stats-value">{history.length}</p>
          </div>
        )}

        <button type="button" className="sidebar__reset" onClick={handleFullReset}>
          Start over
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
              <p className="welcome__sub">
                Ask each student, then tap their level to build today&apos;s class tally.
              </p>
              <button
                type="button"
                className="btn btn--primary btn--large welcome__cta"
                onClick={() => setView(VIEWS.continuum)}
              >
                Start tally →
              </button>
            </div>
          </section>
        )}

        {view === VIEWS.continuum && (
          <section className="continuum">
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
          <ProgressChart records={history} />
        )}

        {view === VIEWS.tips && (
          <LevelUpTips />
        )}
      </main>

      {iconPopup && (
        <IconPopup iconKey={iconPopup} onClose={() => setIconPopup(null)} />
      )}
    </div>
  )
}
