import { useState } from 'react'
import { LEVELS } from '../data/levels'
import {
  addLessonRecord,
  calcEngagementScore,
  emptyTallies,
  getTotalStudents,
  todayISO,
} from '../utils/engagement'

export default function TeacherTally({ onSaved, existingToday = [], initialTallies = {} }) {
  const [label, setLabel] = useState('')
  const [date, setDate] = useState(todayISO())
  const [tallies, setTallies] = useState(() => ({ ...emptyTallies(), ...initialTallies }))
  const [saved, setSaved] = useState(false)

  const total = getTotalStudents(tallies)
  const score = calcEngagementScore(tallies)

  function updateCount(levelId, delta) {
    setSaved(false)
    setTallies((prev) => ({
      ...prev,
      [levelId]: Math.max(0, (prev[levelId] || 0) + delta),
    }))
  }

  function setCount(levelId, value) {
    setSaved(false)
    const n = Math.max(0, parseInt(value, 10) || 0)
    setTallies((prev) => ({ ...prev, [levelId]: n }))
  }

  function handleSave() {
    if (total === 0) return
    const record = addLessonRecord({ label, date, tallies })
    setSaved(true)
    setTallies(emptyTallies())
    onSaved?.(record)
  }

  function handleClear() {
    setTallies(emptyTallies())
    setSaved(false)
  }

  return (
    <section className="teacher-tally">
      <header className="teacher-tally__header">
        <div>
          <h2 className="teacher-tally__title">Class Tally</h2>
          <p className="teacher-tally__sub">
            Enter how many students are at each level today
          </p>
        </div>
        <div className="teacher-tally__score" aria-live="polite">
          <span className="teacher-tally__score-label">Engagement score</span>
          <span className="teacher-tally__score-value">{score}%</span>
        </div>
      </header>

      <div className="teacher-tally__meta">
        <label className="teacher-tally__field">
          <span>Lesson name</span>
          <input
            type="text"
            placeholder="e.g. Morning literacy"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label className="teacher-tally__field">
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="teacher-tally__grid">
        {LEVELS.map((level) => {
          const count = tallies[level.id] || 0
          return (
            <div
              key={level.id}
              className="tally-card"
              style={{ '--accent': level.accent }}
            >
              <img src={level.image} alt="" className="tally-card__img" />
              <h3 className="tally-card__name">{level.name}</h3>
              <div className="tally-card__controls">
                <button
                  type="button"
                  className="tally-card__btn"
                  onClick={() => updateCount(level.id, -1)}
                  aria-label={`Remove one from ${level.name}`}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  className="tally-card__input"
                  value={count}
                  onChange={(e) => setCount(level.id, e.target.value)}
                  aria-label={`Students at ${level.name}`}
                />
                <button
                  type="button"
                  className="tally-card__btn"
                  onClick={() => updateCount(level.id, 1)}
                  aria-label={`Add one to ${level.name}`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="teacher-tally__footer">
        <p className="teacher-tally__total">
          Total students: <strong>{total}</strong>
        </p>
        <div className="teacher-tally__actions">
          <button type="button" className="btn btn--ghost" onClick={handleClear}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={handleSave}
            disabled={total === 0}
          >
            Save this lesson
          </button>
        </div>
        {saved && (
          <p className="teacher-tally__saved">Saved! Check Progress to see how you&apos;re tracking.</p>
        )}
      </div>

      {existingToday.length > 0 && (
        <div className="teacher-tally__today">
          <h3>Saved today ({existingToday.length})</h3>
          <ul>
            {existingToday.map((r) => (
              <li key={r.id}>
                <span>{r.label}</span>
                <span className="teacher-tally__today-score">{r.score}%</span>
                <span className="teacher-tally__today-total">{getTotalStudents(r.tallies)} students</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
