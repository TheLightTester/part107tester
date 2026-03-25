import { render, screen, fireEvent } from '@testing-library/react'
import Home from './Home'
import type { Module, Lesson, Progress } from '../types'

const modules: Module[] = [
  { id: 'I',   name: 'Regulations',           examWeight: '15-25%', color: '#E8A838', lessons: 5,  questions: 25 },
  { id: 'II',  name: 'Airspace & Charts',     examWeight: '15-25%', color: '#4A9EE8', lessons: 3,  questions: 25 },
  { id: 'III', name: 'Weather',               examWeight: '11-16%', color: '#5DB87A', lessons: 3,  questions: 23 },
  { id: 'IV',  name: 'Loading & Performance', examWeight: '7-11%',  color: '#B87AE8', lessons: 3,  questions: 13 },
  { id: 'V',   name: 'Operations',            examWeight: '35-45%', color: '#E86B4A', lessons: 6,  questions: 39 },
]

const lessons: Lesson[] = [
  { id: 'I-L1',  module: 'I',  title: 'Eligibility',    importance: 'high',     intro: 'Intro', sections: [], relatedQuestions: ['I-001'], summaryTable: [], commonMistakes: [] },
  { id: 'II-L1', module: 'II', title: 'Airspace Basics', importance: 'critical', intro: 'Intro', sections: [], relatedQuestions: [],        summaryTable: [], commonMistakes: [] },
]

const progress: Progress = { lessonsRead: new Set(), quizScores: {} }

describe('Home', () => {
  it('renders the hero title', () => {
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={vi.fn()} onStartQuiz={vi.fn()} onStartFinalExam={vi.fn()}
      activeModule={null} onSetModule={vi.fn()} />)
    expect(screen.getByText(/Master the knowledge/i)).toBeInTheDocument()
  })

  it('renders all 5 module cards', () => {
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={vi.fn()} onStartQuiz={vi.fn()} onStartFinalExam={vi.fn()}
      activeModule={null} onSetModule={vi.fn()} />)
    expect(screen.getByText('Regulations')).toBeInTheDocument()
    expect(screen.getByText('Airspace & Charts')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
  })

  it('renders all lesson rows', () => {
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={vi.fn()} onStartQuiz={vi.fn()} onStartFinalExam={vi.fn()}
      activeModule={null} onSetModule={vi.fn()} />)
    expect(screen.getByText('Eligibility')).toBeInTheDocument()
    expect(screen.getByText('Airspace Basics')).toBeInTheDocument()
  })

  it('renders the Final Exam card', () => {
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={vi.fn()} onStartQuiz={vi.fn()} onStartFinalExam={vi.fn()}
      activeModule={null} onSetModule={vi.fn()} />)
    expect(screen.getByText('60-Question Final Exam')).toBeInTheDocument()
  })

  it('clicking a lesson calls onStartLesson with the lesson object', () => {
    const onStartLesson = vi.fn()
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={onStartLesson} onStartQuiz={vi.fn()} onStartFinalExam={vi.fn()}
      activeModule={null} onSetModule={vi.fn()} />)
    fireEvent.click(screen.getByText('Eligibility'))
    expect(onStartLesson).toHaveBeenCalledWith(lessons[0])
  })

  it('clicking Start Final Exam calls onStartFinalExam', () => {
    const onStartFinalExam = vi.fn()
    render(<Home progress={progress} modules={modules} lessons={lessons}
      onStartLesson={vi.fn()} onStartQuiz={vi.fn()} onStartFinalExam={onStartFinalExam}
      activeModule={null} onSetModule={vi.fn()} />)
    fireEvent.click(screen.getByText('Start Final Exam'))
    expect(onStartFinalExam).toHaveBeenCalled()
  })
})
