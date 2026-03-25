import { useState, useEffect } from 'react'
import type { Progress } from '../types'

const STORAGE_KEY = 'part107_progress'

interface PersistedProgress {
  lessonsRead: string[]
  quizScores: Record<string, number>
  lastLessonId: string | null
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw) as PersistedProgress
        return {
          lessonsRead: new Set(p.lessonsRead || []),
          quizScores: p.quizScores || {},
          lastLessonId: p.lastLessonId ?? null,
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return { lessonsRead: new Set(), quizScores: {}, lastLessonId: null }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lessonsRead: [...progress.lessonsRead],
        quizScores: progress.quizScores,
        lastLessonId: progress.lastLessonId,
      }))
    } catch {
      // ignore storage errors
    }
  }, [progress])

  const markLessonRead = (id: string) =>
    setProgress(p => ({ ...p, lessonsRead: new Set([...p.lessonsRead, id]), lastLessonId: id }))

  const saveScore = (key: string, pct: number) =>
    setProgress(p => ({ ...p, quizScores: { ...p.quizScores, [key]: pct } }))

  return { progress, markLessonRead, saveScore }
}
