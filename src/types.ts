// ── Primitive unions ─────────────────────────────────────────────────────────

export type ModuleId = 'I' | 'II' | 'III' | 'IV' | 'V'
export type AnswerKey = 'A' | 'B' | 'C'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Importance = 'critical' | 'high' | 'medium'
export type QuizMode = 'module' | 'lesson' | 'exam'
export type Screen = 'home' | 'lesson' | 'quiz' | 'results'

// ── Data shapes ───────────────────────────────────────────────────────────────

export interface Question {
  id: string
  module: ModuleId
  topic: string
  difficulty: Difficulty
  question: string
  options: Record<AnswerKey, string>
  correct: AnswerKey
  explanation: string
  regulation: string
}

export interface Section {
  heading: string
  body: string
  keyFacts?: string[]
  memoryAid?: string
}

export interface SummaryRow {
  item: string
  value: string
}

export interface Lesson {
  id: string
  module: ModuleId
  title: string
  importance?: Importance
  intro: string
  sections?: Section[]
  summaryTable?: SummaryRow[]
  commonMistakes?: string[]
  relatedQuestions?: string[]
  lessonNumber?: number
  moduleName?: string
  acsCodes?: string[]
  readTime?: number
}

export interface Module {
  id: ModuleId
  name: string
  examWeight: string
  color: string
  lessons: number
  questions: number
}

// ── State shapes ──────────────────────────────────────────────────────────────

export interface Progress {
  lessonsRead: Set<string>
  quizScores: Record<string, number>
  lastLessonId: string | null
  streakDays: number
  lastStudiedDate: string | null  // ISO date string 'YYYY-MM-DD'
}

export interface QuizState {
  qIdx: number
  answers: Partial<Record<string, AnswerKey>>
}
