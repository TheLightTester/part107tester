import { render, screen, fireEvent } from '@testing-library/react'
import Home from './Home'
import type { Module, Lesson, Progress } from '../types'

const modules: Module[] = [
  { id: 'I',   name: 'Regulations',           examWeight: '15-25%', color: '#E8A838', lessons: 2, questions: 25 },
  { id: 'II',  name: 'Airspace & Charts',     examWeight: '15-25%', color: '#4A9EE8', lessons: 1, questions: 25 },
  { id: 'III', name: 'Weather',               examWeight: '11-16%', color: '#5DB87A', lessons: 0, questions: 23 },
  { id: 'IV',  name: 'Loading & Performance', examWeight: '7-11%',  color: '#B87AE8', lessons: 0, questions: 13 },
  { id: 'V',   name: 'Operations',            examWeight: '35-45%', color: '#E86B4A', lessons: 0, questions: 39 },
]

const lessons: Lesson[] = [
  { id: 'I-L1',  module: 'I',  title: 'Eligibility',     importance: 'high',     intro: 'Intro', sections: [], relatedQuestions: ['I-001'], summaryTable: [], commonMistakes: [] },
  { id: 'I-L2',  module: 'I',  title: 'Registration',    importance: 'medium',   intro: 'Intro', sections: [], relatedQuestions: [],        summaryTable: [], commonMistakes: [] },
  { id: 'II-L1', module: 'II', title: 'Airspace Basics', importance: 'critical', intro: 'Intro', sections: [], relatedQuestions: [],        summaryTable: [], commonMistakes: [] },
]

const baseProgress: Progress = {
  lessonsRead: new Set(),
  quizScores: {},
  lastLessonId: null,
  streakDays: 0,
  lastStudiedDate: null,
}

function renderHome(overrides: Partial<Progress> = {}, props: Record<string, unknown> = {}) {
  const progress: Progress = { ...baseProgress, ...overrides }
  return render(
    <Home
      progress={progress}
      modules={modules}
      lessons={lessons}
      questionCount={63}
      isPro={false}
      onUnlockPro={vi.fn()}
      onStartLesson={vi.fn()}
      onStartQuiz={vi.fn()}
      onStartFinalExam={vi.fn()}
      onStartSmartReview={vi.fn()}
      dueQuestionCount={0}
      allCaughtUp={false}
      {...props}
    />
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ── Basic rendering ───────────────────────────────────────────────────────────

describe('Home — basic rendering', () => {
  it('renders the hero title', () => {
    renderHome()
    expect(screen.getByText(/Master the knowledge/i)).toBeInTheDocument()
  })

  it('renders all 5 module cards', () => {
    renderHome()
    expect(screen.getByText('Regulations')).toBeInTheDocument()
    expect(screen.getByText('Airspace & Charts')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
  })

  it('renders all lesson rows', () => {
    renderHome()
    expect(screen.getByText('Eligibility')).toBeInTheDocument()
    expect(screen.getByText('Airspace Basics')).toBeInTheDocument()
  })

  it('renders the Final Exam card', () => {
    renderHome()
    expect(screen.getByText('60-Question Final Exam')).toBeInTheDocument()
  })

  it('clicking a lesson calls onStartLesson with the lesson object', () => {
    const onStartLesson = vi.fn()
    renderHome({}, { onStartLesson })
    fireEvent.click(screen.getByText('Eligibility'))
    expect(onStartLesson).toHaveBeenCalledWith(lessons[0])
  })

  it('clicking Start Final Exam calls onStartFinalExam', () => {
    localStorage.setItem('part107_email_shown', 'true')
    const onStartFinalExam = vi.fn()
    renderHome({}, { isPro: true, onStartFinalExam })
    fireEvent.click(screen.getByText('Start Final Exam'))
    expect(onStartFinalExam).toHaveBeenCalled()
  })
})

// ── Onboarding banner ─────────────────────────────────────────────────────────

describe('Home — onboarding banner', () => {
  it('shows banner on first visit when localStorage key is absent', () => {
    renderHome()
    expect(screen.getByText(/Welcome to Part 107 Prep/i)).toBeInTheDocument()
  })

  it('hides banner when already onboarded', () => {
    localStorage.setItem('part107_onboarded', 'true')
    renderHome()
    expect(screen.queryByText(/Welcome to Part 107 Prep/i)).toBeNull()
  })

  it('clicking Dismiss sets localStorage and hides the banner', () => {
    renderHome()
    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByText(/Welcome to Part 107 Prep/i)).toBeNull()
    expect(localStorage.getItem('part107_onboarded')).toBe('true')
  })

  it('clicking Start with Module I calls onStartLesson with the first lesson', () => {
    const onStartLesson = vi.fn()
    renderHome({}, { onStartLesson })
    fireEvent.click(screen.getByText(/Start with Module I/i))
    expect(onStartLesson).toHaveBeenCalledWith(lessons[0])
  })
})

// ── Resume card ───────────────────────────────────────────────────────────────

describe('Home — resume card', () => {
  it('does not show resume card when no lessons have been read', () => {
    renderHome()
    expect(screen.queryByText(/Continue where you left off/i)).toBeNull()
  })

  it('shows resume card when lastLessonId is set and unread lessons remain', () => {
    renderHome({ lastLessonId: 'I-L1', lessonsRead: new Set(['I-L1']) })
    expect(screen.getByText(/Continue where you left off/i)).toBeInTheDocument()
    expect(screen.getAllByText('Registration')[0]).toBeInTheDocument() // next unread lesson
  })

  it('resume card Continue button calls onStartLesson with the next unread lesson', () => {
    const onStartLesson = vi.fn()
    renderHome({ lastLessonId: 'I-L1', lessonsRead: new Set(['I-L1']) }, { onStartLesson })
    fireEvent.click(screen.getByText(/Continue studying/i))
    expect(onStartLesson).toHaveBeenCalledWith(lessons[1]) // Registration is the next unread
  })
})

// ── "Next →" badge ────────────────────────────────────────────────────────────

describe('Home — recommended next badge', () => {
  it('shows Next badge on the first unread lesson', () => {
    renderHome({ lessonsRead: new Set(['I-L1']) })
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('does not show Next badge when all lessons are complete', () => {
    renderHome({ lessonsRead: new Set(['I-L1', 'I-L2', 'II-L1']) })
    expect(screen.queryByText('Next →')).toBeNull()
  })
})

// ── Quiz confirmation dialog ──────────────────────────────────────────────────

describe('Home — quiz confirmation dialog', () => {
  it('clicking a quiz button shows the inline confirmation', () => {
    renderHome()
    // Each module section header has a quiz button; click Module I's
    const quizButtons = screen.getAllByText(/Quiz · 25 questions/i)
    fireEvent.click(quizButtons[0])
    expect(screen.getByText(/Are you ready/i)).toBeInTheDocument()
  })

  it('confirmation Start button calls onStartQuiz with the correct module id', () => {
    const onStartQuiz = vi.fn()
    renderHome({}, { onStartQuiz })
    const quizButtons = screen.getAllByText(/Quiz · 25 questions/i)
    fireEvent.click(quizButtons[0])
    fireEvent.click(screen.getByText('Start →'))
    expect(onStartQuiz).toHaveBeenCalledWith('I')
  })

  it('confirmation Cancel button hides the dialog', () => {
    renderHome()
    const quizButtons = screen.getAllByText(/Quiz · 25 questions/i)
    fireEvent.click(quizButtons[0])
    expect(screen.getByText(/Are you ready/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText(/Are you ready/i)).toBeNull()
  })

  it('clicking a module card quiz button a second time also toggles the dialog off', () => {
    renderHome()
    // Card button = index 0 (Module I, 25 questions)
    const cardBtn = () => screen.getAllByRole('button', { name: /Quiz · 25 questions/i })[0]
    fireEvent.click(cardBtn())
    expect(screen.getByText(/Are you ready/i)).toBeInTheDocument()
    fireEvent.click(cardBtn())
    expect(screen.queryByText(/Are you ready/i)).toBeNull()
  })

  it('clicking the same quiz button a second time toggles the dialog off', () => {
    renderHome()
    // Card buttons (indices 0-1 for 25q modules) always set pendingQuiz but don't toggle.
    // Section header buttons (index 2+) do toggle. Re-query on each click to avoid stale refs.
    // Index 2 = Module I section header (after Module I card [0] and Module II card [1]).
    const sectionHeaderBtn = () =>
      screen.getAllByRole('button', { name: /Quiz · 25 questions/i })[2]
    fireEvent.click(sectionHeaderBtn())
    expect(screen.getByText(/Are you ready/i)).toBeInTheDocument()
    fireEvent.click(sectionHeaderBtn())
    expect(screen.queryByText(/Are you ready/i)).toBeNull()
  })
})

// ── Exam readiness score ──────────────────────────────────────────────────────

describe('Home — exam readiness score', () => {
  it('shows the Exam Readiness label and pass threshold on a fresh start', () => {
    renderHome()
    // "0%" appears in both hero stats and readiness card — test the unique label instead
    expect(screen.getByText('Exam Readiness')).toBeInTheDocument()
    expect(screen.getByText(/Pass threshold: 70%/i)).toBeInTheDocument()
  })

  it('computes readiness from lessons (40%) and quiz scores (60%)', () => {
    // 3/3 lessons (100%) + one quiz score of 80% out of 8 total slots (5 modules + 3 lessons)
    // effectiveQuizScore = 80 / (8*100) = 0.1 → (1.0*0.4)+(0.1*0.6) = 0.4+0.06 = 46%
    renderHome({ lessonsRead: new Set(['I-L1', 'I-L2', 'II-L1']), quizScores: { I: 80 } })
    expect(screen.getByText('46%')).toBeInTheDocument()
  })

  it('shows exam-ready message when readiness reaches 70%', () => {
    // All 8 quiz slots at 80%: effectiveQuizScore = 640/800 = 0.8 → (1.0*0.4)+(0.8*0.6) = 88%
    renderHome({
      lessonsRead: new Set(['I-L1', 'I-L2', 'II-L1']),
      quizScores: { I: 80, II: 80, III: 80, IV: 80, V: 80, 'I-L1': 80, 'I-L2': 80, 'II-L1': 80 },
    })
    expect(screen.getByText(/exam-ready/i)).toBeInTheDocument()
  })

  it('shows pass threshold message when readiness is below 70%', () => {
    renderHome({ lessonsRead: new Set(['I-L1']), quizScores: {} })
    expect(screen.getByText(/Pass threshold: 70%/i)).toBeInTheDocument()
  })

  it('shows completed quiz count out of total quiz slots', () => {
    // 2 non-exam quiz scores out of 8 total slots (5 modules + 3 lessons in test fixture)
    renderHome({ quizScores: { I: 80, 'I-L1': 70 } })
    expect(screen.getByText('2/8')).toBeInTheDocument()
  })
})
