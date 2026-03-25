import { QUESTIONS } from './questions'
import type { ModuleId } from '../types'

describe('QUESTIONS', () => {
  it('contains 126 questions total', () => {
    expect(QUESTIONS).toHaveLength(126)
  })

  it('all questions have required fields', () => {
    QUESTIONS.forEach(q => {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('module')
      expect(q).toHaveProperty('topic')
      expect(q).toHaveProperty('difficulty')
      expect(q).toHaveProperty('question')
      expect(q).toHaveProperty('options')
      expect(q).toHaveProperty('correct')
      expect(q).toHaveProperty('explanation')
    })
  })

  it('all question IDs are unique', () => {
    const ids = QUESTIONS.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all modules are valid (I, II, III, IV, or V)', () => {
    const valid = new Set<ModuleId>(['I', 'II', 'III', 'IV', 'V'])
    QUESTIONS.forEach(q => expect(valid.has(q.module)).toBe(true))
  })

  it('all options have A, B, and C', () => {
    QUESTIONS.forEach(q => {
      expect(q.options).toHaveProperty('A')
      expect(q.options).toHaveProperty('B')
      expect(q.options).toHaveProperty('C')
    })
  })

  it('correct answer is always A, B, or C', () => {
    QUESTIONS.forEach(q => {
      expect(['A', 'B', 'C']).toContain(q.correct)
    })
  })

  it('question counts per module are correct', () => {
    const counts: Record<ModuleId, number> = { I: 0, II: 0, III: 0, IV: 0, V: 0 }
    QUESTIONS.forEach(q => counts[q.module]++)
    expect(counts.I).toBe(25)
    expect(counts.II).toBe(25)
    expect(counts.III).toBe(23)
    expect(counts.IV).toBe(13)
    expect(counts.V).toBe(40)
  })
})
