import { LESSONS } from './lessons'

describe('LESSONS', () => {
  it('contains 20 lessons total', () => {
    expect(LESSONS).toHaveLength(20)
  })

  it('all lessons have required camelCase fields', () => {
    LESSONS.forEach(l => {
      expect(l).toHaveProperty('id')
      expect(l).toHaveProperty('module')
      expect(l).toHaveProperty('title')
      expect(l).toHaveProperty('importance')
      expect(l).toHaveProperty('intro')
      expect(l).toHaveProperty('sections')
      expect(l).toHaveProperty('relatedQuestions')
    })
  })

  it('all lesson IDs are unique', () => {
    const ids = LESSONS.map(l => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sections use camelCase keyFacts (not key_facts)', () => {
    LESSONS.forEach(l => {
      l.sections?.forEach(sec => {
        expect(sec).not.toHaveProperty('key_facts')
        if (sec.keyFacts !== undefined) {
          expect(Array.isArray(sec.keyFacts)).toBe(true)
        }
      })
    })
  })

  it('relatedQuestions is an array (not related_question_ids)', () => {
    LESSONS.forEach(l => {
      expect(l).not.toHaveProperty('related_question_ids')
      expect(Array.isArray(l.relatedQuestions)).toBe(true)
    })
  })

  it('patched lesson I-L1 has correct relatedQuestions', () => {
    const lesson = LESSONS.find(l => l.id === 'I-L1')
    expect(lesson).toBeDefined()
    // After gap closure patch, I-L1 should include I-014 and I-016
    expect(lesson?.relatedQuestions).toContain('I-014')
    expect(lesson?.relatedQuestions).toContain('I-016')
  })

  it('all modules covered: I, II, III, IV, V', () => {
    const modules = new Set(LESSONS.map(l => l.module))
    expect(modules.has('I')).toBe(true)
    expect(modules.has('II')).toBe(true)
    expect(modules.has('III')).toBe(true)
    expect(modules.has('IV')).toBe(true)
    expect(modules.has('V')).toBe(true)
  })

  it('new lesson V-L4 exists (added by gap closure)', () => {
    const lesson = LESSONS.find(l => l.id === 'V-L4')
    expect(lesson).toBeDefined()
    expect(lesson?.module).toBe('V')
  })

  it('new lesson I-L5 exists (added by gap closure)', () => {
    const lesson = LESSONS.find(l => l.id === 'I-L5')
    expect(lesson).toBeDefined()
    expect(lesson?.module).toBe('I')
  })
})
