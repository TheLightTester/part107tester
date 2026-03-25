import { render, screen, fireEvent } from '@testing-library/react'
import LessonReader from './LessonReader'
import type { Lesson, Progress, ModuleId } from '../types'

const lesson: Lesson = {
  id: 'I-L1',
  module: 'I',
  title: 'Eligibility & the Remote Pilot Certificate',
  importance: 'high',
  intro: 'Before you can legally fly commercially under Part 107...',
  sections: [
    {
      heading: 'Who Is Eligible',
      body: 'To be eligible you must be at least 16 years old.',
      keyFacts: ['Minimum age: 16 years old'],
      memoryAid: 'Remember 16',
    },
  ],
  summaryTable: [{ item: 'Minimum age', value: '16 years old' }],
  commonMistakes: ['Thinking FAA medical is required'],
  relatedQuestions: ['I-001', 'I-002'],
}

const progress: Progress = { lessonsRead: new Set(), quizScores: {} }
const moduleColor = (_id: ModuleId) => '#E8A838'

describe('LessonReader', () => {
  it('renders the lesson title', () => {
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText('Eligibility & the Remote Pilot Certificate')).toBeInTheDocument()
  })

  it('renders the intro paragraph', () => {
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText(/Before you can legally fly/i)).toBeInTheDocument()
  })

  it('renders section headings', () => {
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText('Who Is Eligible')).toBeInTheDocument()
  })

  it('renders key facts', () => {
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText('Minimum age: 16 years old')).toBeInTheDocument()
  })

  it('clicking Mark Complete calls onMarkComplete with lesson id', () => {
    const onMarkComplete = vi.fn()
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={onMarkComplete} onStartQuiz={vi.fn()} />)
    fireEvent.click(screen.getByText(/Mark Complete/i))
    expect(onMarkComplete).toHaveBeenCalledWith('I-L1')
  })

  it('shows Completed text when lesson is already read', () => {
    const doneProgress: Progress = { lessonsRead: new Set(['I-L1']), quizScores: {} }
    render(<LessonReader lesson={lesson} progress={doneProgress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows practice questions button when relatedQuestions exist', () => {
    render(<LessonReader lesson={lesson} progress={progress} moduleColor={moduleColor}
      onBack={vi.fn()} onMarkComplete={vi.fn()} onStartQuiz={vi.fn()} />)
    expect(screen.getByText(/Practice 2 questions/i)).toBeInTheDocument()
  })
})
