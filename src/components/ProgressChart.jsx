import { useState } from 'react'
import { LEVELS } from '../data/levels'
import {
  TERM_OPTIONS,
  formatShortDate,
  getTotalStudents,
  downloadExport,
} from '../utils/engagement'

const CHART = { w: 720, h: 280, pad: { t: 24, r: 24, b: 48, l: 44 } }

export default function ProgressChart({
  records,
  archivedTerms = [],
  onArchiveTerm,
  onResetAll,
}) {
  const [viewTerm, setViewTerm] = useState('current')
  const [archiveTarget, setArchiveTarget] = useState(TERM_OPTIONS[0])
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const isArchiveView = viewTerm !== 'current'
  const chartRecords = isArchiveView
    ? (archivedTerms.find((t) => t.label === viewTerm)?.records || [])
    : records

  if (chartRecords.length === 0) {
    return (
      <section className="progress-chart">
        <header className="progress-chart__header">
          <div>
            <h2 className="progress-chart__title">Our Progress</h2>
            <p className="progress-chart__sub">
              {isArchiveView ? `Archived lessons — ${viewTerm}` : 'Engagement across lessons — higher is better'}
            </p>
          </div>
        </header>
        <div className="progress-chart--empty">
          <p>
            {isArchiveView
              ? <>No lessons in <strong>{viewTerm}</strong>.</>
              : <>No lessons saved yet. Use <strong>Save lesson</strong> on the Continuum to record your first one!</>}
          </p>
        </div>
        <TermTools
          viewTerm={viewTerm}
          archivedTerms={archivedTerms}
          archiveTarget={archiveTarget}
          setArchiveTarget={setArchiveTarget}
          confirmArchive={confirmArchive}
          setConfirmArchive={setConfirmArchive}
          confirmReset={confirmReset}
          setConfirmReset={setConfirmReset}
          onViewTermChange={setViewTerm}
          onArchiveTerm={onArchiveTerm}
          onResetAll={onResetAll}
          canArchive={!isArchiveView && records.length > 0}
        />
      </section>
    )
  }

  const sorted = [...chartRecords].sort(
    (a, b) => a.date.localeCompare(b.date) || a.savedAt.localeCompare(b.savedAt)
  )
  const innerW = CHART.w - CHART.pad.l - CHART.pad.r
  const innerH = CHART.h - CHART.pad.t - CHART.pad.b
  const barGap = 12
  const barW = Math.min(64, (innerW - barGap * (sorted.length - 1)) / sorted.length)
  const totalBarW = sorted.length * barW + (sorted.length - 1) * barGap
  const startX = CHART.pad.l + (innerW - totalBarW) / 2

  const latest = sorted[sorted.length - 1]
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null
  const delta = previous ? latest.score - previous.score : null

  const linePoints = sorted.map((r, i) => {
    const x = startX + i * (barW + barGap) + barW / 2
    const y = CHART.pad.t + innerH - (r.score / 100) * innerH
    return `${x},${y}`
  }).join(' ')

  const viewLabel =
    viewTerm === 'current' ? 'Current term' : viewTerm

  return (
    <section className="progress-chart">
      <header className="progress-chart__header">
        <div>
          <h2 className="progress-chart__title">Our Progress</h2>
          <p className="progress-chart__sub">
            {isArchiveView
              ? `Archived lessons — ${viewTerm}`
              : 'Engagement across lessons — higher is better'}
          </p>
        </div>
        <div className="progress-chart__latest">
          <span className="progress-chart__latest-label">{viewLabel}</span>
          <span className="progress-chart__latest-value">{latest.score}%</span>
          {!isArchiveView && delta !== null && (
            <span className={`progress-chart__delta ${delta >= 0 ? 'progress-chart__delta--up' : 'progress-chart__delta--down'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last
            </span>
          )}
        </div>
      </header>

      <div className="progress-chart__wrap">
        <svg
          viewBox={`0 0 ${CHART.w} ${CHART.h}`}
          className="progress-chart__svg"
          role="img"
          aria-label="Engagement progress chart across saved lessons"
        >
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = CHART.pad.t + innerH - (pct / 100) * innerH
            return (
              <g key={pct}>
                <line
                  x1={CHART.pad.l}
                  y1={y}
                  x2={CHART.w - CHART.pad.r}
                  y2={y}
                  className="progress-chart__grid"
                />
                <text x={CHART.pad.l - 8} y={y + 4} className="progress-chart__ylabel" textAnchor="end">
                  {pct}
                </text>
              </g>
            )
          })}

          {sorted.map((record, i) => {
            const x = startX + i * (barW + barGap)
            const total = getTotalStudents(record.tallies)
            let yOffset = CHART.pad.t + innerH

            const segments = LEVELS.map((level) => {
              const count = record.tallies[level.id] || 0
              if (count === 0 || total === 0) return null
              const segH = (count / total) * innerH
              yOffset -= segH
              return (
                <rect
                  key={level.id}
                  x={x}
                  y={yOffset}
                  width={barW}
                  height={segH}
                  fill={level.accent}
                  rx={2}
                />
              )
            })

            return (
              <g key={record.id}>
                {segments}
                <text
                  x={x + barW / 2}
                  y={CHART.h - 28}
                  className="progress-chart__xlabel"
                  textAnchor="middle"
                >
                  {formatShortDate(record.date)}
                </text>
                <text
                  x={x + barW / 2}
                  y={CHART.h - 12}
                  className="progress-chart__xlabel progress-chart__xlabel--sub"
                  textAnchor="middle"
                >
                  {truncate(record.label, 10)}
                </text>
              </g>
            )
          })}

          <polyline
            points={linePoints}
            className="progress-chart__line"
            fill="none"
          />
          {sorted.map((record, i) => {
            const x = startX + i * (barW + barGap) + barW / 2
            const y = CHART.pad.t + innerH - (record.score / 100) * innerH
            return (
              <g key={`dot-${record.id}`}>
                <circle cx={x} cy={y} r={6} className="progress-chart__dot-glow" />
                <circle cx={x} cy={y} r={4} className="progress-chart__dot" />
                <text x={x} y={y - 12} className="progress-chart__score-label" textAnchor="middle">
                  {record.score}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="progress-chart__legend">
        {LEVELS.map((l) => (
          <span key={l.id} className="progress-chart__legend-item">
            <span className="progress-chart__legend-swatch" style={{ background: l.accent }} />
            {l.name}
          </span>
        ))}
        <span className="progress-chart__legend-item progress-chart__legend-item--line">
          <span className="progress-chart__legend-line" />
          Score
        </span>
      </div>

      <div className="progress-chart__history">
        <h3>All lessons</h3>
        <ul>
          {[...sorted].reverse().map((r) => (
            <li key={r.id} className="progress-chart__history-row">
              <span className="progress-chart__history-date">{formatShortDate(r.date)}</span>
              <span className="progress-chart__history-label">{r.label}</span>
              <span className="progress-chart__history-bar">
                {LEVELS.map((l) => {
                  const n = r.tallies[l.id] || 0
                  if (!n) return null
                  return (
                    <span
                      key={l.id}
                      style={{ flex: n, background: l.accent }}
                      title={`${l.name}: ${n}`}
                    />
                  )
                })}
              </span>
              <span className="progress-chart__history-score">{r.score}%</span>
            </li>
          ))}
        </ul>
      </div>

      <TermTools
        viewTerm={viewTerm}
        archivedTerms={archivedTerms}
        archiveTarget={archiveTarget}
        setArchiveTarget={setArchiveTarget}
        confirmArchive={confirmArchive}
        setConfirmArchive={setConfirmArchive}
        confirmReset={confirmReset}
        setConfirmReset={setConfirmReset}
        onViewTermChange={setViewTerm}
        onArchiveTerm={onArchiveTerm}
        onResetAll={onResetAll}
        canArchive={!isArchiveView && records.length > 0}
      />
    </section>
  )
}

function TermTools({
  viewTerm,
  archivedTerms,
  archiveTarget,
  setArchiveTarget,
  confirmArchive,
  setConfirmArchive,
  confirmReset,
  setConfirmReset,
  onViewTermChange,
  onArchiveTerm,
  onResetAll,
  canArchive,
}) {
  function handleArchive() {
    onArchiveTerm(archiveTarget)
    setConfirmArchive(false)
    onViewTermChange('current')
  }

  function handleReset() {
    onResetAll()
    setConfirmReset(false)
    onViewTermChange('current')
  }

  return (
    <div className="progress-chart__term-tools">
      <div className="progress-chart__term-row">
        <label className="progress-chart__term-label">
          View
          <select
            className="progress-chart__term-select"
            value={viewTerm}
            onChange={(e) => onViewTermChange(e.target.value)}
          >
            <option value="current">Current term</option>
            {archivedTerms.map(({ label, records }) => (
              <option key={label} value={label}>
                {label} ({records.length})
              </option>
            ))}
          </select>
        </label>

        {canArchive && (
          <>
            <label className="progress-chart__term-label">
              Archive to
              <select
                className="progress-chart__term-select"
                value={archiveTarget}
                onChange={(e) => setArchiveTarget(e.target.value)}
              >
                {TERM_OPTIONS.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </label>
            {!confirmArchive ? (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => setConfirmArchive(true)}
              >
                Archive term
              </button>
            ) : (
              <div className="progress-chart__term-confirm">
                <span>Move all lessons to {archiveTarget}?</span>
                <button type="button" className="btn btn--primary btn--small" onClick={handleArchive}>
                  Yes, archive
                </button>
                <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmArchive(false)}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="progress-chart__term-row progress-chart__term-row--secondary">
        <button type="button" className="btn btn--ghost btn--small" onClick={downloadExport}>
          Export data
        </button>
        {!confirmReset ? (
          <button
            type="button"
            className="btn btn--ghost btn--small progress-chart__reset-btn"
            onClick={() => setConfirmReset(true)}
          >
            Reset all data
          </button>
        ) : (
          <div className="progress-chart__term-confirm">
            <span>Delete all lessons, archives &amp; live tally?</span>
            <button type="button" className="btn btn--ghost btn--small progress-chart__reset-btn" onClick={handleReset}>
              Yes, delete all
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function truncate(str, len) {
  return str.length <= len ? str : str.slice(0, len - 1) + '…'
}
