export default function ThankYou({ level, onReset }) {
  const isEngaged = level.zone === 'engagement'

  return (
    <div className={`thank-you ${isEngaged ? 'thank-you--celebrate' : ''}`} style={{ '--accent': level.accent }}>
      <div className="thank-you__burst" aria-hidden />
      <div className="thank-you__content">
        <span className="thank-you__emoji">{level.emoji}</span>
        <h2>Thanks for checking in!</h2>
        <p className="thank-you__level">
          You&apos;re at <strong>{level.name}</strong> right now.
        </p>
        <p className="thank-you__tip">{level.tip}</p>
        <button type="button" className="btn btn--primary btn--large" onClick={onReset}>
          Done — next person
        </button>
      </div>
    </div>
  )
}
