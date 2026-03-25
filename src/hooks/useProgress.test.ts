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

  it('markLessonRead sets lastLessonId to the lesson just read', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('V-L3'))
    expect(result.current.progress.lastLessonId).toBe('V-L3')
  })

  it('markLessonRead overwrites lastLessonId on subsequent calls', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    act(() => result.current.markLessonRead('II-L1'))
    expect(result.current.progress.lastLessonId).toBe('II-L1')
  })
})

describe('streak tracking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes streakDays to 0 with no prior data', () => {
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.streakDays).toBe(0)
    expect(result.current.progress.lastStudiedDate).toBeNull()
  })

  it('markLessonRead starts streak at 1 on first activity', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    expect(result.current.progress.streakDays).toBe(1)
    expect(result.current.progress.lastStudiedDate).toBe('2026-03-25')
  })

  it('studying the same day a second time does not change streak count', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    act(() => result.current.markLessonRead('I-L2'))
    expect(result.current.progress.streakDays).toBe(1)
  })

  it('studying on consecutive days increments the streak', () => {
    vi.setSystemTime(new Date('2026-03-24T10:00:00Z'))
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    expect(result.current.progress.streakDays).toBe(1)

    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    act(() => result.current.markLessonRead('I-L2'))
    expect(result.current.progress.streakDays).toBe(2)
    expect(result.current.progress.lastStudiedDate).toBe('2026-03-25')
  })

  it('gap of 2+ days resets streak to 1', () => {
    vi.setSystemTime(new Date('2026-03-20T10:00:00Z'))
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    expect(result.current.progress.streakDays).toBe(1)

    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    act(() => result.current.markLessonRead('I-L2'))
    expect(result.current.progress.streakDays).toBe(1)
  })

  it('saveScore also updates the streak', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.saveScore('I', 90))
    expect(result.current.progress.streakDays).toBe(1)
    expect(result.current.progress.lastStudiedDate).toBe('2026-03-25')
  })

  it('streak persists to localStorage', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.markLessonRead('I-L1'))
    const stored = JSON.parse(localStorage.getItem('part107_progress') ?? '{}') as { streakDays: number; lastStudiedDate: string }
    expect(stored.streakDays).toBe(1)
    expect(stored.lastStudiedDate).toBe('2026-03-25')
  })
})
