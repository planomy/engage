import { ICON_GUIDES } from '../data/iconGuides'

export default function IconPopup({ iconKey, onClose }) {
  const guide = ICON_GUIDES[iconKey]
  if (!guide) return null

  const { Icon, title, short, description, tips, color } = guide

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
        <div className="icon-popup__glow" aria-hidden />
        <div className="icon-popup__accent-bar" aria-hidden />

        <button type="button" className="icon-popup__close" onClick={onClose} aria-label="Close">
          <span aria-hidden>×</span>
        </button>

        <header className="icon-popup__hero">
          <div className="icon-popup__icon-ring">
            <div className="icon-popup__icon-wrap">
              <Icon active color={color} />
            </div>
          </div>
          <p className="icon-popup__eyebrow">{short}</p>
          <h2 id="icon-popup-title" className="icon-popup__title">{title}</h2>
          <p className="icon-popup__desc">{description}</p>
        </header>

        <div className="icon-popup__tips-wrap">
          <h3 className="icon-popup__tips-heading">Try this</h3>
          <ul className="icon-popup__tips">
            {tips.map((tip, index) => (
              <li key={tip}>
                <span className="icon-popup__tip-num">{index + 1}</span>
                <span className="icon-popup__tip-text">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="btn btn--primary icon-popup__btn" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  )
}
