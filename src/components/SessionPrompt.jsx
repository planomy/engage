import { formatDefaultLabel } from '../utils/engagement'

export default function SessionPrompt({ date, onClear, onContinue }) {
  return (
    <div className="session-prompt" role="dialog" aria-modal="true" aria-labelledby="session-prompt-title">
      <div className="session-prompt__panel">
        <h2 id="session-prompt-title" className="session-prompt__title">New day</h2>
        <p className="session-prompt__text">
          You have an unsaved tally from{' '}
          <strong>{formatDefaultLabel(date)}</strong>. Start fresh for today, or keep going?
        </p>
        <div className="session-prompt__actions">
          <button type="button" className="btn btn--primary" onClick={onClear}>
            Start fresh
          </button>
          <button type="button" className="btn btn--ghost" onClick={onContinue}>
            Keep tally
          </button>
        </div>
      </div>
    </div>
  )
}
