import { useState, useEffect } from 'react'
import type { Progress } from '../types'

const STORAGE_KEY = 'part107_progress'

interface PersistedProgress {
  lessonsRead: string[]
  quizScores: Record<string, number>
  lastLessonId: string | null
  streakDays: number
  lastStudiedDate: string | null
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function updateStreak(p: Progress): Pick<Progress, 'streakDays' | 'lastStudiedDate'> {
  const today = todayISO()
  if (p.lastStudiedDate === today) {
    // Already studied today — no change
    return { streakDays: p.streakDays, lastStudiedDate: p.lastStudiedDate }
  }
  if (p.lastStudiedDate === yesterdayISO()) {
    // Studied yesterday — extend streak
    return { streakDays: p.streakDays + 1, lastStudiedDate: today }
  }
  // Gap of 2+ days — reset
  return { streakDays: 1, lastStudiedDate: today }
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
          streakDays: p.streakDays ?? 0,
          lastStudiedDate: p.lastStudiedDate ?? null,
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return { lessonsRead: new Set(), quizScores: {}, lastLessonId: null, streakDays: 0, lastStudiedDate: null }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lessonsRead: [...progress.lessonsRead],
        quizScores: progress.quizScores,
        lastLessonId: progress.lastLessonId,
        streakDays: progress.streakDays,
        lastStudiedDate: progress.lastStudiedDate,
      }))
    } catch {
      // ignore storage errors
    }
  }, [progress])

  const markLessonRead = (id: string) =>
    setProgress(p => ({ ...p, lessonsRead: new Set([...p.lessonsRead, id]), lastLessonId: id, ...updateStreak(p) }))

  const saveScore = (key: string, pct: number) =>
    setProgress(p => ({ ...p, quizScores: { ...p.quizScores, [key]: pct }, ...updateStreak(p) }))

  return { progress, markLessonRead, saveScore }
}
