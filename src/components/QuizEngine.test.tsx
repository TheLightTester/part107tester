import { render, screen, fireEvent } from '@testing-library/react'
import QuizEngine from './QuizEngine'
import type { Question, QuizState, ModuleId } from '../types'

const questions: Question[] = [
  {
    id: 'I-001', module: 'I', topic: 'Eligibility', difficulty: 'easy',
    question: 'What is the minimum age?',
    options: { A: '14 years old', B: '16 years old', C: '18 years old' },
    correct: 'B',
    explanation: 'Must be at least 16.',
    regulation: '14 CFR §107.61',
  },
  {
    id: 'I-002', module: 'I', topic: 'Eligibility', difficulty: 'medium',
    question: 'Which is NOT required?',
    options: { A: 'English proficiency', B: "Driver's license", C: 'Physical fitness' },
    correct: 'B',
    explanation: "Driver's license is not required.",
    regulation: '14 CFR §107.61',
  },
]

const quizState: QuizState = { qIdx: 0, answers: {} }
const moduleColor = (_id: ModuleId) => '#E8A838'

describe('QuizEngine', () => {
  it('renders the current question text', () => {
    render(<QuizEngine questions={questions} quizState={quizState} quizMode="module"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText('What is the minimum age?')).toBeInTheDocument()
  })

  it('renders all 3 option labels', () => {
    render(<QuizEngine questions={questions} quizState={quizState} quizMode="module"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText('14 years old')).toBeInTheDocument()
    expect(screen.getByText('16 years old')).toBeInTheDocument()
    expect(screen.getByText('18 years old')).toBeInTheDocument()
  })

  it('clicking an option calls onAnswer with question id and choice', () => {
    const onAnswer = vi.fn()
    render(<QuizEngine questions={questions} quizState={quizState} quizMode="module"
      moduleColor={moduleColor} onAnswer={onAnswer} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    fireEvent.click(screen.getByText('16 years old'))
    expect(onAnswer).toHaveBeenCalledWith('I-001', 'B')
  })

  it('shows explanation after an answer is selected', () => {
    const answeredState: QuizState = { qIdx: 0, answers: { 'I-001': 'B' } }
    render(<QuizEngine questions={questions} quizState={answeredState} quizMode="module"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText('Must be at least 16.')).toBeInTheDocument()
  })

  it('shows Next Question button after answering (non-last question)', () => {
    const answeredState: QuizState = { qIdx: 0, answers: { 'I-001': 'A' } }
    render(<QuizEngine questions={questions} quizState={answeredState} quizMode="module"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/Next Question/i)).toBeInTheDocument()
  })

  it('shows Finish Quiz button on last question', () => {
    const lastState: QuizState = { qIdx: 1, answers: { 'I-002': 'A' } }
    render(<QuizEngine questions={questions} quizState={lastState} quizMode="module"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/Finish Quiz/i)).toBeInTheDocument()
  })

  it('shows timer in exam mode', () => {
    render(<QuizEngine questions={questions} quizState={quizState} quizMode="exam"
      moduleColor={moduleColor} onAnswer={vi.fn()} onNext={vi.fn()} onSubmit={vi.fn()} onExit={vi.fn()} />)
    expect(screen.getByText(/02:00:00/i)).toBeInTheDocument()
  })
})
