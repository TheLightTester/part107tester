import { useState } from 'react'
import type { Question } from '../types'

interface QuestionRecord {
  lastSeen: string
  correct: boolean
  streak: number
  dueDate: string
}

type QuestionHistory = Record<string, QuestionRecord>

interface UseQuestionHistoryReturn {
  history: QuestionHistory
  recordAnswer: (questionId: string, correct: boolean) => void
  getDueQuestions: (allQuestions: Question[]) => Question[]
}

const STORAGE_KEY = 'part107_question_history'

function loadHistory(): QuestionHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QuestionHistory) : {}
  } catch {
    return {}
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function useQuestionHistory(): UseQuestionHistoryReturn {
  const [history, setHistory] = useState<QuestionHistory>(loadHistory)

  const recordAnswer = (questionId: string, correct: boolean) => {
    setHistory(prev => {
      const existing = prev[questionId]
      const newStreak = correct ? (existing ? existing.streak + 1 : 1) : 0
      const today = todayISO()
      let dueDays: number
      if (correct) {
        dueDays = newStreak >= 3 ? 7 : 3
      } else {
        dueDays = 1
      }
      const updated: QuestionHistory = {
        ...prev,
        [questionId]: {
          lastSeen: today,
          correct,
          streak: newStreak,
          dueDate: addDays(today, dueDays),
        },
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // storage unavailable
      }
      return updated
    })
  }

  const getDueQuestions = (allQuestions: Question[]): Question[] => {
    const today = todayISO()
    const due = allQuestions.filter(q => {
      const record = history[q.id]
      if (!record) return false
      return record.dueDate <= today
    })
    due.sort((a, b) => {
      const da = history[a.id]?.dueDate ?? today
      const db = history[b.id]?.dueDate ?? today
      if (da < db) return -1
      if (da > db) return 1
      return 0
    })
    return due.slice(0, 20)
  }

  return { history, recordAnswer, getDueQuestions }
}
