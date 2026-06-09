import { ICON_GUIDES } from '../data/iconGuides'

export default function IconPopup({ iconKey, onClose }) {
  const guide = ICON_GUIDES[iconKey]
  if (!guide) return null

  const { Icon, title, description, tips, color } = guide

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="icon-popup"
        style={{ '--popup-accent': color }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-popup-title"
      >
        <button type="button" className="icon-popup__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="icon-popup__icon-wrap">
          <Icon active color={color} />
        </div>

        <h2 id="icon-popup-title" className="icon-popup__title">{title}</h2>
        <p className="icon-popup__desc">{description}</p>

        <ul className="icon-popup__tips">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <button type="button" className="btn btn--primary icon-popup__btn" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}
