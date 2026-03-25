import { render, screen, fireEvent } from '@testing-library/react'
import Results from './Results'
import type { Question, AnswerKey } from '../types'

const questions: Question[] = [
  { id: 'I-001', module: 'I', topic: 'Eligibility',     difficulty: 'easy',
    question: 'Min age?',    options: { A: '14', B: '16', C: '18' },  correct: 'B', explanation: 'x', regulation: '' },
  { id: 'I-002', module: 'I', topic: 'Eligibility',     difficulty: 'easy',
    question: 'Need medical?', options: { A: 'Yes', B: 'No', C: 'Sometimes' }, correct: 'B', explanation: 'y', regulation: '' },
  { id: 'V-001', module: 'V', topic: 'Operating Limits', difficulty: 'easy',
    question: 'Max altitude?', options: { A: '200ft', B: '400ft', C: '600ft' }, correct: 'B', explanation: 'z', regulation: '' },
]

describe('Results', () => {
  it('shows 100% and Passed when all correct', () => {
    const answers: Record<string, AnswerKey> = { 'I-001': 'B', 'I-002': 'B', 'V-001': 'B' }
    render(<Results questions={questions} answers={answers} quizMode="module" onRetry={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText(/Passed/i)).toBeInTheDocument()
  })

  it('shows 0% and Below threshold when all wrong', () => {
    const answers: Record<string, AnswerKey> = { 'I-001': 'A', 'I-002': 'A', 'V-001': 'A' }
    render(<Results questions={questions} answers={answers} quizMode="module" onRetry={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText(/threshold/i)).toBeInTheDocument()
  })

  it('shows weak area report when 2+ topics present', () => {
    const answers: Record<string, AnswerKey> = { 'I-001': 'A', 'I-002': 'B', 'V-001': 'A' }
    render(<Results questions={questions} answers={answers} quizMode="module" onRetry={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText('Weak Area Report')).toBeInTheDocument()
    expect(screen.getByText('Eligibility')).toBeInTheDocument()
    expect(screen.getByText('Operating Limits')).toBeInTheDocument()
  })

  it('does not show weak area report for single topic', () => {
    const singleTopicQs = [questions[0], questions[1]]
    const answers: Record<string, AnswerKey> = { 'I-001': 'A', 'I-002': 'B' }
    render(<Results questions={singleTopicQs} answers={answers} quizMode="module" onRetry={vi.fn()} onHome={vi.fn()} />)
    expect(screen.queryByText('Weak Area Report')).toBeNull()
  })

  it('clicking Back to lessons calls onHome', () => {
    const onHome = vi.fn()
    const answers: Record<string, AnswerKey> = { 'I-001': 'B', 'I-002': 'B', 'V-001': 'B' }
    render(<Results questions={questions} answers={answers} quizMode="module" onRetry={vi.fn()} onHome={onHome} />)
    fireEvent.click(screen.getByText(/Back to lessons/i))
    expect(onHome).toHaveBeenCalled()
  })

  it('does not show weak area report when quizMode is lesson', () => {
    const answers: Record<string, AnswerKey> = { 'I-001': 'A', 'I-002': 'B', 'V-001': 'A' }
    render(<Results questions={questions} answers={answers} quizMode="lesson" onRetry={vi.fn()} onHome={vi.fn()} />)
    expect(screen.queryByText('Weak Area Report')).toBeNull()
  })

  it('clicking Retry quiz calls onRetry', () => {
    const onRetry = vi.fn()
    const answers: Record<string, AnswerKey> = { 'I-001': 'B', 'I-002': 'B', 'V-001': 'B' }
    render(<Results questions={questions} answers={answers} quizMode="module" onRetry={onRetry} onHome={vi.fn()} />)
    fireEvent.click(screen.getByText('Retry quiz'))
    expect(onRetry).toHaveBeenCalled()
  })
})
