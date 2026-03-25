import { useState, useRef, useEffect } from 'react'
import { MODULES } from './data/modules'
import { QUESTIONS } from './data/questions'
import { LESSONS } from './data/lessons'
import { useProgress } from './hooks/useProgress'
import { styles } from './styles'
import Icon from './components/ui/Icon'
import ProgressRing from './components/ui/ProgressRing'
import Home from './components/Home'
import LessonReader from './components/LessonReader'
import QuizEngine from './components/QuizEngine'
import Results from './components/Results'
import type { Screen, QuizMode, QuizState, Lesson, ModuleId, AnswerKey } from './types'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [quizState, setQuizState] = useState<QuizState>({ qIdx: 0, answers: {} })
  const [quizMode, setQuizMode] = useState<QuizMode>('module')
  const [quizQuestions, setQuizQuestions] = useState(QUESTIONS.slice(0, 0)) // typed as Question[]
  const { progress, markLessonRead, saveScore } = useProgress()
  const scrollRef = useRef<HTMLDivElement>(null)
  // Prevent the hash-update effect from overwriting the URL before the
  // restore effect has parsed and applied the initial hash on mount.
  const skipHashUpdate = useRef(true)

  // ── Hash routing: restore state from URL on mount ────────────────────────
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const parts = hash.split('/')

    if (parts[0] === 'lesson' && parts[1]) {
      const lesson = LESSONS.find(l => l.id === parts[1])
      if (lesson) { setActiveLesson(lesson); setScreen('lesson') }

    } else if (parts[0] === 'quiz' && parts[1] === 'module' && parts[2]) {
      const moduleId = parts[2] as ModuleId
      const pool = QUESTIONS.filter(q => q.module === moduleId)
      if (pool.length > 0) {
        setQuizQuestions(pool); setQuizState({ qIdx: 0, answers: {} })
        setQuizMode('module'); setActiveModule(moduleId); setScreen('quiz')
      }

    } else if (parts[0] === 'quiz' && parts[1] === 'lesson' && parts[2]) {
      const lesson = LESSONS.find(l => l.id === parts[2])
      if (lesson) {
        const pool = QUESTIONS.filter(q => lesson.relatedQuestions?.includes(q.id))
        if (pool.length > 0) {
          setActiveLesson(lesson); setQuizQuestions(pool)
          setQuizState({ qIdx: 0, answers: {} }); setQuizMode('lesson'); setScreen('quiz')
        }
      }
    }
    // 'exam' and 'results' are not restored — they require fresh state
    skipHashUpdate.current = false
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hash routing: update URL on every navigation ─────────────────────────
  useEffect(() => {
    if (skipHashUpdate.current) return
    let hash = 'home'
    if (screen === 'lesson' && activeLesson) {
      hash = `lesson/${activeLesson.id}`
    } else if (screen === 'quiz') {
      if (quizMode === 'exam') hash = 'exam'
      else if (quizMode === 'lesson' && activeLesson) hash = `quiz/lesson/${activeLesson.id}`
      else if (quizMode === 'module' && activeModule) hash = `quiz/module/${activeModule}`
    } else if (screen === 'results') {
      hash = 'results'
    }
    window.location.hash = hash
  }, [screen, activeLesson, activeModule, quizMode])

  const moduleColor = (id: ModuleId): string => MODULES.find(m => m.id === id)?.color ?? '#ccc'

  const totalProgress = () =>
    LESSONS.length > 0 ? Math.round((progress.lessonsRead.size / LESSONS.length) * 100) : 0

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goHome = () => {
    setScreen('home')
    setActiveLesson(null)
  }

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson)
    setScreen('lesson')
  }

  const finishLesson = (lessonId: string) => {
    markLessonRead(lessonId)
    goHome()
  }

  const startQuiz = (moduleId: ModuleId, lessonId: string | null = null) => {
    const pool = lessonId
      ? QUESTIONS.filter(q => activeLesson?.relatedQuestions?.includes(q.id))
      : QUESTIONS.filter(q => q.module === moduleId)
    if (pool.length === 0) return
    setQuizQuestions(pool)
    setQuizState({ qIdx: 0, answers: {} })
    setQuizMode(lessonId ? 'lesson' : 'module')
    setActiveModule(moduleId)
    setScreen('quiz')
  }

  const startFinalExam = () => {
    const proportions: Record<ModuleId, number> = { I: 12, II: 12, III: 9, IV: 6, V: 21 }
    const selected: typeof QUESTIONS = []
    ;(Object.entries(proportions) as [ModuleId, number][]).forEach(([mod, count]) => {
      const pool = QUESTIONS.filter(q => q.module === mod)
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      selected.push(...shuffled.slice(0, count))
    })
    selected.sort(() => Math.random() - 0.5)
    setQuizQuestions(selected)
    setQuizState({ qIdx: 0, answers: {} })
    setQuizMode('exam')
    setActiveModule(null)
    setScreen('quiz')
  }

  const handleAnswer = (questionId: string, choice: AnswerKey) => {
    setQuizState(s => ({ ...s, answers: { ...s.answers, [questionId]: choice } }))
  }

  const handleNext = () => {
    setQuizState(s => ({ ...s, qIdx: s.qIdx + 1 }))
  }

  const submitQuiz = () => {
    const correct = quizQuestions.filter(q => quizState.answers[q.id] === q.correct).length
    const pct = Math.round((correct / quizQuestions.length) * 100)
    const key = quizMode === 'exam' ? 'exam'
      : quizMode === 'lesson' ? (activeLesson?.id ?? 'lesson')
      : (activeModule ?? 'mixed')
    saveScore(key, pct)
    setScreen('results')
  }

  const retryQuiz = () => {
    setQuizState({ qIdx: 0, answers: {} })
    setScreen('quiz')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={styles.app} ref={scrollRef}>
      {/* NAV */}
      <div style={styles.nav}>
        <div style={styles.navLogo} onClick={goHome}>
          <Icon name="plane" size={18}/>
          <span style={styles.navLogoText}>Part 107 Prep</span>
        </div>
        <div style={styles.navProgress}>
          <ProgressRing pct={totalProgress()} color="#E8A838" size={32}/>
          <span>{totalProgress()}% complete</span>
        </div>
      </div>

      {/* SCREENS */}
      {screen === 'home' && (
        <Home
          progress={progress}
          modules={MODULES}
          lessons={LESSONS}
          questionCount={QUESTIONS.length}
          onStartLesson={startLesson}
          onStartQuiz={startQuiz}
          onStartFinalExam={startFinalExam}
        />
      )}

      {screen === 'lesson' && (
        <LessonReader
          lesson={activeLesson}
          progress={progress}
          moduleColor={moduleColor}
          onBack={goHome}
          onMarkComplete={finishLesson}
          onStartQuiz={startQuiz}
        />
      )}

      {screen === 'quiz' && (
        <QuizEngine
          questions={quizQuestions}
          quizState={quizState}
          quizMode={quizMode}
          moduleColor={moduleColor}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onSubmit={submitQuiz}
          onExit={goHome}
        />
      )}

      {screen === 'results' && (
        <Results
          questions={quizQuestions}
          answers={quizState.answers}
          quizMode={quizMode}
          onRetry={retryQuiz}
          onHome={goHome}
        />
      )}
    </div>
  )
}
