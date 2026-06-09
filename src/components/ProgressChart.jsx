import { LEVELS } from '../data/levels'
import { formatShortDate, getTotalStudents } from '../utils/engagement'

const CHART = { w: 720, h: 280, pad: { t: 24, r: 24, b: 48, l: 44 } }

export default function ProgressChart({ records }) {
  if (records.length === 0) {
    return (
      <div className="progress-chart progress-chart--empty">
        <p>No lessons saved yet. Use <strong>Class Tally</strong> to record your first one!</p>
      </div>
    )
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date) || a.savedAt.localeCompare(b.savedAt))
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

  return (
    <section className="progress-chart">
      <header className="progress-chart__header">
        <div>
          <h2 className="progress-chart__title">Our Progress</h2>
          <p className="progress-chart__sub">Engagement across lessons — higher is better</p>
        </div>
        <div className="progress-chart__latest">
          <span className="progress-chart__latest-label">Latest</span>
          <span className="progress-chart__latest-value">{latest.score}%</span>
          {delta !== null && (
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
          {/* grid lines */}
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

          {/* stacked bars */}
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

          {/* score line */}
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
    </section>
  )
}

function truncate(str, len) {
  return str.length <= len ? str : str.slice(0, len - 1) + '…'
}
