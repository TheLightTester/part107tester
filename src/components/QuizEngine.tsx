import { useState, useEffect } from 'react'
import { styles } from '../styles'
import Icon from './ui/Icon'
import DiffBadge from './ui/DiffBadge'
import { useWindowWidth } from '../hooks/useWindowWidth'
import type { Question, AnswerKey, ModuleId, QuizMode, QuizState } from '../types'

interface QuizEngineProps {
  questions: Question[]
  quizState: QuizState
  quizMode: QuizMode
  moduleColor: (id: ModuleId) => string
  onAnswer: (questionId: string, choice: AnswerKey) => void
  onNext: () => void
  onSubmit: () => void
  onExit: () => void
  onRecordAnswer?: (questionId: string, correct: boolean) => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'reveal'

export default function QuizEngine({ questions, quizState, quizMode, moduleColor, onAnswer, onNext, onSubmit, onExit, onRecordAnswer }: QuizEngineProps) {
  const isMobile = useWindowWidth() <= 600
  const [timeLeft, setTimeLeft] = useState(7200)

  useEffect(() => {
    if (quizMode !== 'exam') return
    setTimeLeft(7200)
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          onSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [quizMode])

  const q = questions[quizState.qIdx]
  if (!q) return null

  const color = moduleColor(q.module)
  const selected = quizState.answers[q.id]
  const pct = Math.round(((quizState.qIdx + (selected ? 1 : 0)) / questions.length) * 100)
  const isLast = quizState.qIdx === questions.length - 1

  const getOptionState = (key: string): OptionState => {
    if (!selected) return 'default'
    if (key === selected && key === q.correct) return 'correct'
    if (key === selected && key !== q.correct) return 'wrong'
    if (key === q.correct) return 'reveal'
    return 'default'
  }

  const advance = () => {
    if (isLast) {
      onSubmit()
    } else {
      onNext()
    }
  }

  return (
    <div style={{ ...styles.content, maxWidth: 680 }}>
      <button style={styles.backBtn} onClick={onExit}>
        <Icon name="back" size={14}/> Exit quiz
      </button>

      <div style={styles.quizProgress}>
        <div style={styles.quizProgressBar}>
          <div style={styles.quizProgressFill(pct, color)}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {quizState.qIdx + 1} / {questions.length}
          </span>
          {quizMode === 'exam' && (
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
              color: timeLeft < 600 ? '#E86B4A' : '#94a3b8',
              whiteSpace: 'nowrap',
            }}>
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div style={styles.quizQuestion}>
        <div style={styles.quizQuestionNum}>
          Question {quizState.qIdx + 1} · <DiffBadge level={q.difficulty}/>
        </div>
        <div style={styles.quizQuestionText}>{q.question}</div>
        {q.regulation && <div style={styles.quizReg}>{q.regulation}</div>}
      </div>

      <div style={styles.quizOptions}>
        {(Object.entries(q.options) as [AnswerKey, string][]).map(([key, text]) => {
          const state = getOptionState(key)
          return (
            <div key={key} style={styles.quizOption(state, isMobile)} onClick={() => {
              if (!selected) {
                onAnswer(q.id, key)
                onRecordAnswer?.(q.id, key === q.correct)
              }
            }}>
              <div style={{
                ...styles.optionLetter,
                background: state === 'correct' ? '#5DB87A20' : state === 'wrong' ? '#E86B4A20' : state === 'reveal' ? '#5DB87A10' : state === 'selected' ? '#4A9EE820' : '#1e2532',
                color: state === 'correct' ? '#5DB87A' : state === 'wrong' ? '#E86B4A' : state === 'reveal' ? '#5DB87A' : state === 'selected' ? '#4A9EE8' : '#64748b',
              }}>
                {state === 'correct' ? <Icon name="check" size={10}/> : state === 'wrong' ? <Icon name="x" size={10}/> : key}
              </div>
              <span>{text}</span>
            </div>
          )
        })}
      </div>

      {selected && (
        <div style={styles.explanation}>
          {q.explanation}
          {q.regulation && <div style={styles.explanationReg}>{q.regulation}</div>}
        </div>
      )}

      {selected && (
        <div style={{ marginTop: 16 }}>
          <button style={styles.btnPrimary(color)} onClick={advance}>
            {isLast ? <><Icon name="trophy" size={14}/> Finish Quiz</> : <><Icon name="arrow" size={14}/> Next Question</>}
          </button>
        </div>
      )}
    </div>
  )
}
