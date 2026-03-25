import { styles } from '../styles'
import Icon from './ui/Icon'
import type { Lesson, ModuleId, Progress } from '../types'

interface LessonReaderProps {
  lesson: Lesson | null
  progress: Progress
  moduleColor: (id: ModuleId) => string
  onBack: () => void
  onMarkComplete: (id: string) => void
  onStartQuiz: (moduleId: ModuleId, lessonId: string) => void
}

export default function LessonReader({ lesson, progress, moduleColor, onBack, onMarkComplete, onStartQuiz }: LessonReaderProps) {
  if (!lesson) return null
  const color = moduleColor(lesson.module)
  const done = progress.lessonsRead.has(lesson.id)

  return (
    <div style={{ ...styles.content, maxWidth: 720 }}>
      <button style={styles.backBtn}
        onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}
        onClick={onBack}>
        <Icon name="back" size={14}/> Back to lessons
      </button>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color, border: `1px solid ${color}40`, borderRadius: 3, padding: '2px 7px',
          }}>Module {lesson.module}</div>
          {lesson.importance && <span style={styles.impBadge(lesson.importance)}>{lesson.importance}</span>}
          {lesson.readTime && <span style={styles.readTime}>{lesson.readTime} min read</span>}
        </div>
        <div style={styles.lessonTitle}>{lesson.title}</div>
      </div>

      {/* INTRO */}
      <div style={styles.lessonIntro}>{lesson.intro}</div>

      {/* SECTIONS */}
      {lesson.sections?.map((sec, i) => (
        <div key={i} style={styles.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: color, flexShrink: 0 }}/>
            <div style={styles.sectionHeading}>{sec.heading}</div>
          </div>
          <div style={styles.sectionBody}>{sec.body}</div>
          {sec.keyFacts && sec.keyFacts.length > 0 && (
            <div style={styles.keyFactsList}>
              {sec.keyFacts.map((f, j) => (
                <div key={j} style={styles.keyFact}>
                  <span style={styles.keyFactDot}>◆</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
          {sec.memoryAid && (
            <div style={styles.memAid}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 8 }}>Memory Aid</span>
              {sec.memoryAid}
            </div>
          )}
        </div>
      ))}

      {/* SUMMARY TABLE */}
      {lesson.summaryTable && lesson.summaryTable.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568', marginBottom: 12 }}>Quick Reference</div>
          <table style={styles.summaryTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Item</th>
                <th style={styles.tableTh}>Value</th>
              </tr>
            </thead>
            <tbody>
              {lesson.summaryTable.map((row, i) => (
                <tr key={i}>
                  <td style={styles.tableTd(i % 2 === 0)}>{row.item}</td>
                  <td style={{ ...styles.tableTd(i % 2 !== 0), fontWeight: 600, color: '#e2e8f0' }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COMMON MISTAKES */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div style={styles.mistakesBox}>
          <div style={styles.mistakesTitle}>
            <Icon name="alert" size={13}/> Common Exam Mistakes
          </div>
          {lesson.commonMistakes.map((m, i) => (
            <div key={i} style={styles.mistake}>
              <span style={{ position: 'absolute', left: 0, color: '#E86B4A' }}>–</span>
              {m}
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div style={styles.lessonActions}>
        {!done ? (
          <button style={styles.btnPrimary(color)} onClick={() => onMarkComplete(lesson.id)}>
            <Icon name="check" size={14}/> Mark Complete
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#5DB87A', fontWeight: 600 }}>
            <Icon name="check" size={14}/> Completed
          </div>
        )}
        {lesson.relatedQuestions && lesson.relatedQuestions.length > 0 && (
          <button style={styles.btnSecondary} onClick={() => onStartQuiz(lesson.module, lesson.id)}>
            <Icon name="quiz" size={14}/>
            Practice {lesson.relatedQuestions.length} questions
          </button>
        )}
      </div>
    </div>
  )
}
