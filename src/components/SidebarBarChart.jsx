import { LEVELS } from '../data/levels'

export default function SidebarBarChart({ tally }) {
  const counts = LEVELS.map((l) => tally[l.id] || 0)
  const max = Math.max(...counts, 1)

  return (
    <div className="sidebar-chart" role="img" aria-label="Class tally bar chart">
      <div className="sidebar-chart__bars">
        {LEVELS.map((level, i) => {
          const count = counts[i]
          const heightPct = count === 0 ? 0 : Math.max((count / max) * 100, 12)

          return (
            <div key={level.id} className="sidebar-chart__col" title={`${level.name}: ${count}`}>
              <span className={`sidebar-chart__count ${count > 0 ? 'sidebar-chart__count--on' : ''}`}>
                {count}
              </span>
              <div className="sidebar-chart__track">
                <div
                  className="sidebar-chart__bar"
                  style={{
                    '--bar-height': `${heightPct}%`,
                    '--bar-color': level.accent,
                  }}
                />
              </div>
              <span className="sidebar-chart__label" style={{ color: level.accent }}>
                {level.name.slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
