import { useEffect, useRef, useState } from 'react'
import { LEVELS } from '../data/levels'
import { getStudentLabel, STUDENT_SLOTS } from '../utils/students'

const levelAccent = Object.fromEntries(LEVELS.map((level) => [level.id, level.accent]))

export default function StudentPills({
  roster,
  selectedIndex = null,
  studentRatings = {},
  editable = true,
  showEmpty = true,
  classOption = false,
  classSelected = false,
  onSelectClass,
  onSelect,
  onRename,
  compact = false,
}) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingIndex !== null) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editingIndex])

  function startEdit(index) {
    if (!editable) return
    setEditingIndex(index)
    setDraft(roster[index] || '')
  }

  function commitEdit(index) {
    const next = draft.trim().slice(0, 24)
    onRename?.(index, next)
    setEditingIndex(null)
    setDraft('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setDraft('')
  }

  const indices = showEmpty
    ? Array.from({ length: STUDENT_SLOTS }, (_, index) => index)
    : roster.map((name, index) => (name.trim() ? index : -1)).filter((index) => index >= 0)

  return (
    <div
      className={`student-pills ${compact ? 'student-pills--compact' : ''}`}
      role={classOption ? 'tablist' : 'listbox'}
      aria-label="Students"
    >
      {classOption && (
        <button
          type="button"
          role="tab"
          className={`student-pill student-pill--class ${classSelected ? 'student-pill--selected' : ''}`}
          aria-selected={classSelected}
          onClick={() => onSelectClass?.()}
        >
          Whole class
        </button>
      )}
      {indices.map((index) => {
        const name = roster[index]?.trim()
        if (!showEmpty && !name) return null

        const label = getStudentLabel(roster, index)
        const isSelected = selectedIndex === index
        const levelId = studentRatings[index]
        const isEditing = editingIndex === index

        if (isEditing) {
          return (
            <span key={index} className="student-pill student-pill--editing">
              <input
                ref={inputRef}
                type="text"
                className="student-pill__input"
                value={draft}
                maxLength={24}
                placeholder="Name"
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitEdit(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitEdit(index)
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelEdit()
                  }
                }}
              />
            </span>
          )
        }

        return (
          <button
            key={index}
            type="button"
            role={classOption ? 'tab' : 'option'}
            className={[
              'student-pill',
              name ? 'student-pill--named' : 'student-pill--empty',
              isSelected ? 'student-pill--selected' : '',
              levelId ? 'student-pill--rated' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={levelId ? { '--rated-accent': levelAccent[levelId] } : undefined}
            aria-selected={isSelected}
            title={
              editable
                ? name
                  ? `${label} — click to select, double-click to rename`
                  : 'Add student name'
                : label
            }
            onClick={() => {
              if (!name && editable) {
                startEdit(index)
                return
              }
              onSelect?.(index)
            }}
            onDoubleClick={(e) => {
              if (!editable || !name) return
              e.preventDefault()
              startEdit(index)
            }}
          >
            <span className="student-pill__label">{name || (editable ? '+' : label)}</span>
          </button>
        )
      })}
    </div>
  )
}
