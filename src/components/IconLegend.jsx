import { ICON_GUIDES, ICON_KEYS } from '../data/iconGuides'

export default function IconLegend({ onIconClick, variant = 'horizontal' }) {
  return (
    <div className={`icon-legend icon-legend--${variant}`}>
      {variant === 'horizontal' && (
        <p className="icon-legend__label">Class expectations — tap to learn more</p>
      )}
      {variant === 'sidebar' && (
        <p className="icon-legend__label">Class expectations</p>
      )}
      <div className="icon-legend__row">
        {ICON_KEYS.map((key) => {
          const guide = ICON_GUIDES[key]
          const { Icon, short, color } = guide
          return (
            <button
              key={key}
              type="button"
              className="icon-legend__btn"
              style={{ '--icon-color': color }}
              onClick={() => onIconClick(key)}
              aria-label={`Learn about: ${guide.title}`}
            >
              <span className="icon-legend__icon">
                <Icon active color={color} />
              </span>
              <span className="icon-legend__text">{short}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
