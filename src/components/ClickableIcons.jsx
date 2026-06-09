import { ICON_GUIDES } from '../data/iconGuides'

export default function ClickableIcons({ icons, accent, onIconClick, size = 'sm' }) {
  const keys = ['camera', 'mic', 'chat', 'hand']

  return (
    <div className={`clickable-icons clickable-icons--${size}`} onClick={(e) => e.stopPropagation()}>
      {keys.map((key) => {
        const guide = ICON_GUIDES[key]
        const { Icon } = guide
        const expected = icons[key]
        return (
          <button
            key={key}
            type="button"
            className={`clickable-icons__btn ${expected ? 'clickable-icons__btn--on' : 'clickable-icons__btn--off'}`}
            style={{ '--accent': accent, '--icon-color': guide.color }}
            onClick={() => onIconClick(key)}
            aria-label={`${guide.title}${expected ? ' — expected at this level' : ''}. Tap for info.`}
            title={guide.short}
          >
            <Icon active={expected} color={guide.color} />
          </button>
        )
      })}
    </div>
  )
}
