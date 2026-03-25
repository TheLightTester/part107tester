import { useState } from 'react'
import { styles } from '../styles'
import Icon from './ui/Icon'
import type { Lesson, Module, ModuleId, Progress } from '../types'

interface HomeProps {
  progress: Progress
  modules: Module[]
  lessons: Lesson[]
  questionCount: number
  onStartLesson: (lesson: Lesson) => void
  onStartQuiz: (moduleId: ModuleId) => void
  onStartFinalExam: () => void
  activeModule: ModuleId | null
  onSetModule: (id: ModuleId | null) => void
}

export default function Home({ progress, modules, lessons, questionCount, onStartLesson, onStartQuiz, onStartFinalExam, activeModule, onSetModule }: HomeProps) {
  const pct = Math.round((progress.lessonsRead.size / lessons.length) * 100)
  const answered = Object.keys(progress.quizScores).length
  const moduleColor = (id: ModuleId) => modules.find(m => m.id === id)?.color ?? '#ccc'
  const displayedLessons = activeModule ? lessons.filter(l => l.module === activeModule) : lessons

  const lastLesson = progress.lastLessonId ? lessons.find(l => l.id === progress.lastLessonId) : null
  const nextLesson = lessons.find(l => !progress.lessonsRead.has(l.id)) ?? null

  const [showBanner, setShowBanner] = useState(() => !localStorage.getItem('part107_onboarded'))
  const dismissBanner = () => {
    localStorage.setItem('part107_onboarded', 'true')
    setShowBanner(false)
  }

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
          background: '#111827', borderLeft: '4px solid #E8A838',
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
        </div>
      </div>

      {/* MODULES */}
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
              onClick={() => onSetModule(activeModule === m.id ? null : m.id)}
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
            </div>
          )
        })}
      </div>

      {/* FINAL EXAM CARD */}
      <div style={{
        background: '#111827', border: '1px solid #1e2532', borderRadius: 10,
        padding: '20px 24px', marginBottom: 24,
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
            <div style={{ fontSize: 12, color: '#64748b' }}>2 hours · ACS proportions · All 5 modules</div>
          </div>
        </div>
        <button style={styles.btnPrimary('#E8A838')} onClick={onStartFinalExam}>
          <Icon name="quiz" size={14}/> Start Final Exam
        </button>
      </div>

      {/* LESSONS */}
      <div style={styles.sectionTitle}>
        {activeModule ? `${modules.find(m => m.id === activeModule)?.name} — Lessons` : 'All Lessons'}
      </div>
      <div style={styles.lessonList}>
        {displayedLessons.map(l => {
          const done = progress.lessonsRead.has(l.id)
          const color = moduleColor(l.module)
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
                  <div style={styles.lessonName}>{l.title}</div>
                  <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                    Module {l.module} · {l.relatedQuestions?.length ?? 0} practice questions
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

      {activeModule && (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button style={styles.btnPrimary(moduleColor(activeModule))}
            onClick={() => onStartQuiz(activeModule)}>
            <Icon name="quiz" size={14}/>
            Take {modules.find(m => m.id === activeModule)?.name} Quiz
          </button>
          <button style={styles.btnSecondary} onClick={() => onSetModule(null)}>
            Show all modules
          </button>
        </div>
      )}

    </div>
  )
}
