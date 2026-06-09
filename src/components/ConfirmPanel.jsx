import { useState } from 'react'
import ClickableIcons from './ClickableIcons'
import { ICON_GUIDES } from '../data/iconGuides'

export default function ConfirmPanel({ level, onConfirm, onBack, onIconClick }) {
  const [reason, setReason] = useState(null)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="confirm-panel" style={{ '--accent': level.accent }}>
      <button type="button" className="confirm-panel__back" onClick={onBack}>
        ← Back
      </button>

      <div className="confirm-panel__hero">
        <div className="confirm-panel__image-wrap">
          {!imgError ? (
            <img
              src={level.image}
              alt=""
              className="confirm-panel__image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="confirm-panel__placeholder">{level.emoji}</div>
          )}
        </div>
        <div>
          <p className="confirm-panel__label">You picked</p>
          <h2 className="confirm-panel__name">{level.name}</h2>
          <p className="confirm-panel__tagline">{level.tagline}</p>
        </div>
      </div>

      <div className="confirm-panel__behaviors">
        <h3>This looks like…</h3>
        <ul>
          {level.behaviors.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="confirm-panel__icons-section">
        <h3>Expected behaviours <span className="optional">(tap icons for help)</span></h3>
        <ClickableIcons
          icons={level.icons}
          accent={level.accent}
          onIconClick={onIconClick}
          size="md"
        />
        <div className="confirm-panel__icon-labels">
          {['camera', 'mic', 'chat', 'hand'].map((key) => (
            <span
              key={key}
              style={level.icons[key] ? { color: ICON_GUIDES[key].color } : undefined}
              className={level.icons[key] ? 'confirm-panel__icon-label--on' : ''}
            >
              {ICON_GUIDES[key].short}
            </span>
          ))}
        </div>
      </div>

      {level.moveUp?.target && (
        <div className="confirm-panel__move-up">
          <h3>Want to level up to {level.moveUp.target}?</h3>
          <ul>
            {level.moveUp.tips.slice(0, 2).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="confirm-panel__reasons">
        <h3>What&apos;s going on? <span className="optional">(optional)</span></h3>
        <div className="reason-chips">
          {level.reasons.map((r) => (
            <button
              key={r}
              type="button"
              className={`reason-chip ${reason === r ? 'reason-chip--selected' : ''}`}
              onClick={() => setReason(reason === r ? null : r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--large confirm-panel__submit"
        onClick={() => onConfirm(level, reason)}
      >
        That&apos;s me right now ✓
      </button>
    </div>
  )
}
