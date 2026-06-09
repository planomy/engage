import { useState } from 'react'
import ClickableIcons from './ClickableIcons'

export default function LevelCard({
  level,
  count = 0,
  pop,
  celebration,
  onSelect,
  onIconClick,
  compact,
}) {
  const [imgError, setImgError] = useState(false)

  const celebrateClass = celebration ? `level-card--celebrate level-card--celebrate-${celebration}` : ''

  return (
    <button
      type="button"
      className={`level-card ${count > 0 ? 'level-card--has-tally' : ''} ${pop ? 'level-card--pop' : ''} ${celebrateClass} ${compact ? 'level-card--compact' : ''}`}
      style={{ '--accent': level.accent }}
      onClick={() => onSelect(level)}
      aria-label={`${level.name}: ${count} students. Tap to add one.`}
    >
      {celebration && <span className="level-card__fx" aria-hidden />}

      <div className={`level-card__tally ${count > 0 ? 'level-card__tally--active' : ''}`} aria-live="polite">
        <span className="level-card__tally-num">{count}</span>
        <span className="level-card__tally-label">{count === 1 ? 'student' : 'students'}</span>
      </div>

      <div className="level-card__image-wrap">
        {!imgError ? (
          <img
            src={level.image}
            alt=""
            className="level-card__image"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="level-card__placeholder" aria-hidden>
            <span className="level-card__emoji">{level.emoji}</span>
          </div>
        )}
      </div>

      <h3 className="level-card__name">{level.name}</h3>
      {!compact && <p className="level-card__tagline">{level.tagline}</p>}

      <ClickableIcons
        icons={level.icons}
        accent={level.accent}
        onIconClick={onIconClick}
        size="sm"
      />

      {!compact && (
        <ul className="level-card__behaviors">
          {level.behaviors.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </button>
  )
}
