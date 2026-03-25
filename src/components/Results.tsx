import { styles } from '../styles'
import Icon from './ui/Icon'
import type { Question, AnswerKey, QuizMode } from '../types'

interface ResultsProps {
  questions: Question[]
  answers: Partial<Record<string, AnswerKey>>
  quizMode: QuizMode
  onRetry: () => void
  onHome: () => void
}

interface TopicStat {
  topic: string
  correct: number
  total: number
  pct: number
}

export default function Results({ questions, answers, quizMode, onRetry, onHome }: ResultsProps) {
  const correct = questions.filter(q => answers[q.id] === q.correct).length
  const pct = Math.round((correct / questions.length) * 100)
  const passed = pct >= 70
  const color = passed ? '#5DB87A' : '#E86B4A'

  // Weak area report: group by topic
  const topicMap: Record<string, { correct: number; total: number }> = {}
  questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 }
    topicMap[q.topic].total++
    if (answers[q.id] === q.correct) topicMap[q.topic].correct++
  })
  const topics: TopicStat[] = Object.entries(topicMap)
    .map(([topic, { correct: c, total }]) => ({ topic, correct: c, total, pct: Math.round(c / total * 100) }))
    .sort((a, b) => a.pct - b.pct)

  return (
    <div style={{ ...styles.content, maxWidth: 560 }}>
      <div style={styles.resultsCard}>
        <div style={{ marginBottom: 12, color }}>
          <Icon name="trophy" size={28}/>
        </div>
        <div style={{ ...styles.resultsScore, color }}>{pct}%</div>
        <div style={styles.resultsSub}>
          {passed ? 'Passed! Above the 70% threshold.' : 'Below the 70% threshold — review and retry.'}
        </div>
        <div style={styles.resultsGrid}>
          <div style={styles.resultsStat}>
            <div style={{ ...styles.resultsStatNum, color: '#5DB87A' }}>{correct}</div>
            <div style={styles.resultsStatLabel}>Correct</div>
          </div>
          <div style={styles.resultsStat}>
            <div style={{ ...styles.resultsStatNum, color: '#E86B4A' }}>{questions.length - correct}</div>
            <div style={styles.resultsStatLabel}>Incorrect</div>
          </div>
          <div style={styles.resultsStat}>
            <div style={{ ...styles.resultsStatNum, color: '#4A9EE8' }}>{questions.length}</div>
            <div style={styles.resultsStatLabel}>Total</div>
          </div>
        </div>
      </div>

      {/* WEAK AREA REPORT */}
      {topics.length >= 2 && quizMode !== 'lesson' && (
        <div style={{ marginBottom: 24 }}>
          <div style={styles.sectionTitle}>Weak Area Report</div>
          <div style={{
            background: '#111827', border: '1px solid #1e2532', borderRadius: 10,
            overflow: 'hidden',
          }}>
            {topics.map(({ topic, correct: c, total, pct: p }, i) => {
              const tc = p >= 80 ? '#5DB87A' : p >= 60 ? '#E8A838' : '#E86B4A'
              return (
                <div key={topic} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: i < topics.length - 1 ? '1px solid #1e2532' : 'none',
                  background: i % 2 === 0 ? '#0d1117' : 'transparent',
                }}>
                  <span style={{ fontSize: 13, color: '#cbd5e1' }}>{topic}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tc }}>
                    {c}/{total} ({p}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* REVIEW */}
      <div style={styles.sectionTitle}>Review Answers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {questions.map(q => {
          const given = answers[q.id]
          const ok = given === q.correct
          return (
            <div key={q.id} style={{
              background: ok ? '#0a1f0f' : '#1a0e0e',
              border: `1px solid ${ok ? '#1e3a2a' : '#3b1515'}`,
              borderRadius: 8, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: ok ? '#5DB87A20' : '#E86B4A20',
                  border: `1px solid ${ok ? '#5DB87A' : '#E86B4A'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: ok ? '#5DB87A' : '#E86B4A',
                }}>
                  {ok ? <Icon name="check" size={10}/> : <Icon name="x" size={10}/>}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>{q.question}</div>
                  {!ok && given && (
                    <div style={{ fontSize: 12, color: '#f4a6a6', marginBottom: 4 }}>
                      Your answer: {q.options[given]}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#7dd3a0' }}>
                    Correct: {q.options[q.correct]}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={styles.btnPrimary('#E8A838')} onClick={onHome}>
          <Icon name="book" size={14}/> Back to lessons
        </button>
        <button style={styles.btnSecondary} onClick={onRetry}>
          Retry quiz
        </button>
      </div>
    </div>
  )
}
