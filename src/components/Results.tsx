import { styles } from '../styles'
import Icon from './ui/Icon'
import { LESSONS } from '../data/lessons'
import type { Question, AnswerKey, QuizMode, Lesson } from '../types'

interface ResultsProps {
  questions: Question[]
  answers: Partial<Record<string, AnswerKey>>
  quizMode: QuizMode
  onRetry: () => void
  onHome: () => void
  onStartLesson?: (lesson: Lesson) => void
}

// Build a best-effort map from question topic string → lesson id.
// Strategy: normalise strings to lowercase for comparison; try to match
// each topic against (1) lesson title, (2) any section heading.
function buildTopicToLessonId(): Record<string, string> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

  // Hand-tuned overrides for topics that don't match by text alone
  const overrides: Record<string, string> = {
    'adm': 'V-L1',
    'crm': 'V-L1',
    'hazardous attitudes': 'V-L1',
    'pave checklist': 'V-L1',
    'imsafe checklist': 'V-L1',
    'situational awareness': 'V-L1',
    'single-pilot resource management': 'V-L1',
    'nasa asrs': 'V-L1',
    'alcohol and drugs': 'V-L2',
    'alcohol effects': 'V-L2',
    'fatigue': 'V-L2',
    'stress': 'V-L2',
    'hyperventilation': 'V-L2',
    'dehydration': 'V-L2',
    'night vision': 'V-L2',
    'medical conditions': 'V-L2',
    'drugs   medication': 'V-L2',
    'preflight inspection': 'V-L3',
    'preflight inspection items': 'V-L3',
    'preflight planning': 'V-L3',
    'crew briefing': 'V-L3',
    'lost link procedures': 'V-L3',
    'lithium battery safety': 'V-L3',
    'battery safety': 'V-L3',
    'maintenance': 'V-L3',
    'emergency procedures': 'V-L3',
    'in-flight emergency': 'I-L4',
    'visual line of sight': 'V-L4',
    'visual observer': 'V-L4',
    'traffic scanning': 'V-L4',
    'operations over people': 'V-L5',
    'operations from moving vehicles': 'V-L5',
    'operations over moving vehicles': 'V-L5',
    'airport operations': 'V-L6',
    'traffic pattern': 'V-L6',
    'operations near airports': 'V-L6',
    'runway numbering': 'V-L6',
    'atis': 'V-L6',
    'weight and balance': 'IV-L1',
    'load factors': 'IV-L2',
    'load factor': 'IV-L2',
    'stability': 'IV-L2',
    'density altitude': 'IV-L3',
    'performance factors': 'IV-L3',
    'pressure altitude': 'IV-L3',
    'temperature effects': 'IV-L3',
    'effect of humidity on performance': 'IV-L3',
    'humidity and performance': 'IV-L3',
    'weight effects': 'IV-L3',
    'wind effects on performance': 'IV-L3',
    'airspace classes': 'II-L1',
    'airspace authorization': 'II-L1',
    'special use airspace': 'II-L2',
    'warning areas': 'II-L2',
    'alert areas': 'II-L2',
    'controlled firing areas': 'II-L2',
    'military training routes': 'II-L2',
    'moa': 'II-L2',
    'tfrs and notams': 'II-L2',
    'prohibited operations   tfrs': 'II-L2',
    'sectional charts': 'II-L3',
    'sectional charts   airports': 'II-L3',
    'latitude and longitude': 'II-L3',
    'magnetic variation': 'II-L3',
    'antenna towers': 'II-L3',
    '400-foot structure exception': 'II-L3',
    'metar': 'III-L1',
    'metar decoding': 'III-L1',
    'metar modifiers': 'III-L1',
    'metar sky condition': 'III-L1',
    'taf': 'III-L2',
    'sigmets and airmets': 'III-L2',
    'weather briefing sources': 'III-L2',
    'atmospheric stability': 'III-L3',
    'air masses and fronts': 'III-L3',
    'fronts': 'III-L3',
    'clouds and stability': 'III-L3',
    'thunderstorms': 'III-L3',
    'structural icing': 'III-L3',
    'wind shear': 'III-L3',
    'microbursts': 'III-L3',
    'temperature inversion': 'III-L3',
    'fog formation': 'III-L3',
    'mountain flying weather': 'III-L3',
    'eligibility': 'I-L1',
    'certificate recency': 'I-L1',
    'registration': 'I-L2',
    'operating limitations': 'I-L3',
    'daylight operations': 'I-L3',
    'right of way': 'I-L3',
    'falsification': 'I-L3',
    'hazardous operations': 'I-L3',
    'carriage of hazardous material': 'I-L3',
    'accident reporting': 'I-L4',
    'ntsb reporting   part 830': 'I-L4',
    'waivers': 'I-L4',
    'remote id': 'I-L5',
    'inspection by faa': 'I-L5',
    'operation of multiple uas': 'I-L5',
    'condition for safe operation': 'I-L3',
    'operation near other aircraft': 'V-L4',
    'remote pilot in command responsibility': 'I-L3',
  }

  const map: Record<string, string> = {}

  // First pass: text-based matching against lesson titles and section headings
  for (const lesson of LESSONS) {
    const titleNorm = norm(lesson.title)
    // We'll populate via overrides primarily; this loop is for future-proofing
    for (const section of lesson.sections ?? []) {
      const headNorm = norm(section.heading)
      // Store heading → lesson id (don't overwrite if already set)
      if (!map[headNorm]) map[headNorm] = lesson.id
    }
    if (!map[titleNorm]) map[titleNorm] = lesson.id
  }

  // Second pass: apply overrides (they win over text matching)
  for (const [topic, lessonId] of Object.entries(overrides)) {
    map[norm(topic)] = lessonId
  }

  return map
}

const TOPIC_TO_LESSON_ID = buildTopicToLessonId()

function findLessonForTopic(topic: string): Lesson | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const key = norm(topic)
  const id = TOPIC_TO_LESSON_ID[key]
  if (id) return LESSONS.find(l => l.id === id)
  return undefined
}

interface TopicStat {
  topic: string
  correct: number
  total: number
  pct: number
}

export default function Results({ questions, answers, quizMode, onRetry, onHome, onStartLesson }: ResultsProps) {
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
              const matchedLesson = findLessonForTopic(topic)
              return (
                <div key={topic} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderBottom: i < topics.length - 1 ? '1px solid #1e2532' : 'none',
                  background: i % 2 === 0 ? '#0d1117' : 'transparent',
                }}>
                  <span style={{ fontSize: 13, color: '#cbd5e1', flex: 1, marginRight: 8 }}>{topic}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tc, marginRight: matchedLesson ? 12 : 0 }}>
                    {c}/{total} ({p}%)
                  </span>
                  {matchedLesson && onStartLesson && (
                    <button style={styles.reviewBtn} onClick={() => onStartLesson(matchedLesson)}>
                      Review →
                    </button>
                  )}
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
