import { renderHook, act } from '@testing-library/react'
import { useProgress } from './useProgress'

beforeEach(() => {
  localStorage.clear()
})

describe('useProgress', () => {
  it('initializes with empty lessonsRead Set and empty quizScores', () => {
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.lessonsRead).toBeInstanceOf(Set)
    expect(result.current.progress.lessonsRead.size).toBe(0)
    expect(result.current.progress.quizScores).toEqual({})
  })

  it('markLessonRead adds lesson ID to lessonsRead Set', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    expect(result.current.progress.lessonsRead.has('I-L1')).toBe(true)
  })

  it('markLessonRead is idempotent — calling twice does not duplicate', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.markLessonRead('I-L1')
      result.current.markLessonRead('I-L1')
    })
    expect(result.current.progress.lessonsRead.size).toBe(1)
  })

  it('saveScore stores the score keyed by module ID', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.saveScore('I', 85))
    expect(result.current.progress.quizScores['I']).toBe(85)
  })

  it('persists to localStorage on change', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('II-L1'))
    const stored = JSON.parse(localStorage.getItem('part107_progress') ?? '{}') as { lessonsRead: string[] }
    expect(stored.lessonsRead).toContain('II-L1')
  })

  it('rehydrates from localStorage on mount', () => {
    localStorage.setItem('part107_progress', JSON.stringify({
      lessonsRead: ['I-L1', 'I-L2'],
      quizScores: { I: 90 },
    }))
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.lessonsRead.has('I-L1')).toBe(true)
    expect(result.current.progress.lessonsRead.has('I-L2')).toBe(true)
    expect(result.current.progress.quizScores['I']).toBe(90)
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('part107_progress', 'not-valid-json')
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.lessonsRead.size).toBe(0)
  })
})
