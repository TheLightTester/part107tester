import { useState } from 'react'
import { styles } from '../styles'
import Icon from './ui/Icon'
import ProgressRing from './ui/ProgressRing'
import type { Lesson, Module, ModuleId, Progress } from '../types'

interface HomeProps {
  progress: Progress
  modules: Module[]
  lessons: Lesson[]
  questionCount: number
  onStartLesson: (lesson: Lesson) => void
  onStartQuiz: (moduleId: ModuleId) => void
  onStartFinalExam: () => void
}

export default function Home({ progress, modules, lessons, questionCount, onStartLesson, onStartQuiz, onStartFinalExam }: HomeProps) {
  const pct = Math.round((progress.lessonsRead.size / lessons.length) * 100)
  const answered = Object.keys(progress.quizScores).length
  const moduleColor = (id: ModuleId) => modules.find(m => m.id === id)?.color ?? '#ccc'

  const lastLesson = progress.lastLessonId ? lessons.find(l => l.id === progress.lastLessonId) : null
  const nextLesson = lessons.find(l => !progress.lessonsRead.has(l.id)) ?? null

  // First unread lesson across all modules (for "Next →" badge)
  const nextLessonId = nextLesson?.id ?? null

  const [showBanner, setShowBanner] = useState(() => !localStorage.getItem('part107_onboarded'))
  const dismissBanner = () => {
    localStorage.setItem('part107_onboarded', 'true')
    setShowBanner(false)
  }

  // TASK-07: which module quiz is pending confirmation
  const [pendingQuiz, setPendingQuiz] = useState<ModuleId | null>(null)

  // TASK-09: exam readiness score
  const lessonsReadPct = lessons.length > 0 ? progress.lessonsRead.size / lessons.length : 0
  const quizValues = Object.values(progress.quizScores)
  const avgQuizScore = quizValues.length > 0 ? quizValues.reduce((a, b) => a + b, 0) / quizValues.length / 100 : 0
  // Effective score treats untaken quizzes as 0 — prevents false positives from a single high score
  const nonExamScores = Object.entries(progress.quizScores).filter(([k]) => k !== 'exam').map(([, v]) => v)
  const totalQuizSlots = modules.length + lessons.length
  const effectiveQuizScore = nonExamScores.reduce((a, b) => a + b, 0) / (totalQuizSlots * 100)
  const readiness = Math.round((lessonsReadPct * 0.4 + effectiveQuizScore * 0.6) * 100)
  const readinessColor = readiness >= 70 ? '#5DB87A' : readiness >= 50 ? '#E8A838' : '#E86B4A'

  return (
    <div style={styles.content}>

      {/* ONBOARDING BANNER */}
      {showBanner && (
        <div style={{
          background: '#0f1a2e', border: '1px solid #1e3a5f', borderRadius: 10,
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A9EE8', marginBottom: 6 }}>
              Welcome to Part 107 Prep
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              This app prepares you for the FAA Remote Pilot Certificate exam.
              Suggested order: <strong style={{ color: '#e2e8f0' }}>read lessons → take module quiz → attempt the Final Exam.</strong>
            </div>
            <button
              style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: '#4A9EE8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => { dismissBanner(); onStartLesson(lessons[0]) }}>
              Start with Module I →
            </button>
          </div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, flexShrink: 0 }}
            onClick={dismissBanner}
            aria-label="Dismiss">
            <Icon name="x" size={14}/>
          </button>
        </div>
      )}

      {/* RESUME CARD */}
      {lastLesson && nextLesson && (
        <div style={{
          background: '#111827',
          border: '1px solid #2a3040', borderLeftWidth: 4, borderLeftColor: '#E8A838',
          borderRadius: 10, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E8A838', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Continue where you left off
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>
              {nextLesson.title}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {pct}% complete · last read: {lastLesson.title}
            </div>
          </div>
          <button style={{ ...styles.btnPrimary('#E8A838'), whiteSpace: 'nowrap' }}
            onClick={() => onStartLesson(nextLesson)}>
            Continue studying →
          </button>
        </div>
      )}

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroAccent}/>
        <div style={styles.heroTag}>
          <Icon name="plane" size={12}/> FAA Part 107 — Remote Pilot Certificate
        </div>
        <div style={styles.heroTitle}>Master the knowledge.<br/>Pass the test.</div>
        <div style={styles.heroSub}>
          {lessons.length} lessons and {questionCount} practice questions mapped directly to the FAA Airman Certification Standards. Everything you need — nothing you don't.
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{progress.lessonsRead.size}<span style={{ fontSize: 14, color: '#64748b' }}>/{lessons.length}</span></div>
            <div style={styles.heroStatLabel}>Lessons read</div>
          </div>
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{answered}<span style={{ fontSize: 14, color: '#64748b' }}>/{modules.length}</span></div>
            <div style={styles.heroStatLabel}>Modules quizzed</div>
          </div>
          <div style={styles.heroStat}>
            <div style={styles.heroStatNum}>{pct}<span style={{ fontSize: 14, color: '#64748b' }}>%</span></div>
            <div style={styles.heroStatLabel}>Overall progress</div>
          </div>
          <div style={styles.heroStat}>
            <div style={{ ...styles.heroStatNum, display: 'flex', alignItems: 'center', gap: 6, color: progress.streakDays > 0 ? '#E86B4A' : '#4a5568' }}>
              <Icon name="flame" size={22}/>
              {progress.streakDays}
            </div>
            <div style={styles.heroStatLabel}>Day streak</div>
          </div>
        </div>
      </div>

      {/* EXAM READINESS — TASK-09 */}
      <div style={{
        background: '#111827', border: '1px solid #1e2532', borderRadius: 10,
        padding: '20px 24px', marginBottom: 32,
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <ProgressRing pct={readiness} color={readinessColor} size={72}/>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
            Exam Readiness
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: readinessColor, lineHeight: 1 }}>
            {readiness}%
          </div>
          <div style={{ fontSize: 12, marginTop: 5, color: readiness >= 70 ? '#5DB87A' : '#64748b' }}>
            {readiness >= 70 ? 'You\'re exam-ready! ✓' : 'Pass threshold: 70%'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{Math.round(lessonsReadPct * 100)}%</div>
            <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Lessons</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{Math.round(avgQuizScore * 100)}%</div>
            <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Avg Quiz</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{nonExamScores.length}/{totalQuizSlots}</div>
            <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Quizzes</div>
          </div>
        </div>
      </div>

      {/* MODULE CARDS — TASK-05: quiz button directly on each card */}
      <div style={styles.sectionTitle}>Study Modules</div>
      <div style={styles.moduleGrid}>
        {modules.map(m => {
          const moduleLessons = lessons.filter(l => l.module === m.id)
          const doneCount = moduleLessons.filter(l => progress.lessonsRead.has(l.id)).length
          const score = progress.quizScores[m.id]
          return (
            <div key={m.id} style={styles.moduleCard(m.color)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${m.color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2532'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={styles.moduleCardAccent(m.color)}/>
              <div style={styles.moduleCardHeader}>
                <div style={styles.moduleId(m.color)}>{m.id}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={styles.moduleWeight}>{m.examWeight} of exam</div>
                  {score !== undefined && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: score >= 70 ? '#5DB87A' : '#E86B4A' }}>
                      Quiz: {score}%
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.moduleName}>{m.name}</div>
              <div style={styles.moduleStats}>
                <div style={styles.moduleStat}>
                  <span style={styles.moduleStatNum(m.color)}>{doneCount}</span>/{moduleLessons.length} lessons
                </div>
                <div style={styles.moduleStat}>
                  <span style={styles.moduleStatNum(m.color)}>{m.questions}</span> questions
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e2532' }}>
                <button
                  style={{ ...styles.btnPrimary(m.color), width: '100%', justifyContent: 'center', fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); setPendingQuiz(pendingQuiz === m.id ? null : m.id) }}>
                  <Icon name="quiz" size={12}/> Quiz · {m.questions} questions
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* GROUPED LESSONS — TASK-04 */}
      <div style={styles.sectionTitle}>Lessons</div>
      {modules.map((m: Module) => {
        const moduleLessons = lessons.filter(l => l.module === m.id)
        const doneCount = moduleLessons.filter(l => progress.lessonsRead.has(l.id)).length
        const allDone = doneCount === moduleLessons.length

        return (
          <div key={m.id} style={{ marginBottom: 36 }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12, paddingBottom: 12,
              borderBottom: `1px solid ${m.color}25`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 18, background: m.color, borderRadius: 2, flexShrink: 0 }}/>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
                  Module {m.id} — {m.name}
                </div>
                <div style={{ fontSize: 12, color: allDone ? '#5DB87A' : '#64748b' }}>
                  {doneCount}/{moduleLessons.length} complete
                </div>
              </div>
              <button
                style={{ ...styles.btnPrimary(m.color), fontSize: 12, padding: '7px 14px' }}
                onClick={() => setPendingQuiz(pendingQuiz === m.id ? null : m.id)}>
                <Icon name="quiz" size={12}/> Quiz · {m.questions} questions
              </button>
            </div>

            {/* TASK-07: inline quiz confirmation */}
            {pendingQuiz === m.id && (
              <div style={{
                background: '#0f1117', border: `1px solid ${m.color}40`, borderRadius: 8,
                padding: '14px 18px', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  <strong style={{ color: '#e2e8f0' }}>Module {m.id} Quiz</strong>
                  {' '}· {m.questions} questions · Are you ready?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={styles.btnPrimary(m.color)}
                    onClick={() => { setPendingQuiz(null); onStartQuiz(m.id) }}>
                    Start →
                  </button>
                  <button style={styles.btnSecondary} onClick={() => setPendingQuiz(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Lesson rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {moduleLessons.map(l => {
                const done = progress.lessonsRead.has(l.id)
                const color = moduleColor(l.module)
                const isNext = l.id === nextLessonId
                return (
                  <div key={l.id} style={styles.lessonRow(done)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = done ? '#2a5a3a' : '#2d3748' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = done ? '#1e3a2a' : '#1e2532' }}
                    onClick={() => onStartLesson(l)}
                  >
                    <div style={styles.lessonRowLeft}>
                      <div style={styles.lessonCheck(done, color)}>
                        {done ? <Icon name="check" size={12}/> : <Icon name="book" size={12}/>}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <div style={styles.lessonName}>{l.title}</div>
                          {isNext && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: m.color,
                              background: `${m.color}15`, border: `1px solid ${m.color}30`,
                              borderRadius: 3, padding: '2px 6px',
                              letterSpacing: '0.06em', textTransform: 'uppercase',
                            }}>
                              Next →
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                          {l.relatedQuestions?.length ?? 0} practice questions
                        </div>
                      </div>
                    </div>
                    <div style={styles.lessonMeta}>
                      {l.importance && <span style={styles.impBadge(l.importance)}>{l.importance}</span>}
                      <Icon name="arrow" size={14}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* FINAL EXAM — TASK-06: moved to bottom as capstone */}
      <div style={{ borderTop: '1px solid #1e2532', paddingTop: 32 }}>
        <div style={styles.sectionTitle}>Ready to test yourself?</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: -10 }}>
          Simulated 60-question exam · 2 hour time limit · ACS proportions across all 5 modules
        </div>
        <div style={{
          background: '#111827', border: '1px solid #1e2532', borderRadius: 10,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: '#E8A83818', border: '1px solid #E8A83830',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#E8A838',
            }}>
              <Icon name="trophy" size={20}/>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>60-Question Final Exam</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>All 5 modules · ACS proportions · 2 hour time limit</div>
            </div>
          </div>
          <button style={styles.btnPrimary('#E8A838')} onClick={onStartFinalExam}>
            <Icon name="quiz" size={14}/> Start Final Exam
          </button>
        </div>
      </div>

    </div>
  )
}
