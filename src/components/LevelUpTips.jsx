import { useState } from 'react'
import { LEVELS } from '../data/levels'

export default function LevelUpTips() {
  const [expanded, setExpanded] = useState('participating')

  return (
    <section className="level-up-tips">
      <header className="level-up-tips__header">
        <h2 className="level-up-tips__title">How to Level Up</h2>
        <p className="level-up-tips__sub">
          Tap a level to see tips for moving up the continuum
        </p>
      </header>

      <div className="level-up-tips__layout">
        <div className="level-up-tips__nav">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              className={`level-up-tips__tab ${expanded === level.id ? 'level-up-tips__tab--active' : ''}`}
              style={{ '--accent': level.accent }}
              onClick={() => setExpanded(level.id)}
            >
              <img src={level.image} alt="" />
              <span>{level.name}</span>
            </button>
          ))}
        </div>

        {LEVELS.filter((l) => l.id === expanded).map((level) => (
          <div key={level.id} className="level-up-tips__panel" style={{ '--accent': level.accent }}>
            <div className="level-up-tips__panel-hero">
              <img src={level.image} alt="" />
              <div>
                <h3>{level.name}</h3>
                <p>{level.tagline}</p>
              </div>
            </div>

            {level.moveUp.target ? (
              <p className="level-up-tips__target">
                Want to reach <strong>{level.moveUp.target}</strong>? Try these:
              </p>
            ) : (
              <p className="level-up-tips__target level-up-tips__target--top">
                You&apos;re at the top! 🌟 Keep doing what you&apos;re doing:
              </p>
            )}

            <ul className="level-up-tips__list">
              {level.moveUp.tips.map((tip, i) => (
                <li key={tip}>
                  <span className="level-up-tips__step">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
