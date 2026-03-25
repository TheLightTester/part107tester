import type { Lesson, ModuleId, Importance, SummaryRow } from '../types'
import rawContent  from '../../reference files/part107_lesson_content.json'
import rawModuleIV from '../../reference files/part107_module_iv_content.json'
import rawGapClose from '../../reference files/part107_gap_closure.json'

// ─── Raw (snake_case) types from JSON sources ──────────────────────────────

interface RawSection {
  heading: string
  body: string
  key_facts?: string[]
  memory_aid?: string
  [key: string]: unknown
}

interface RawLesson {
  id: string
  module: ModuleId
  title: string
  intro: string
  exam_importance?: Importance
  lesson_number?: number
  module_name?: string
  acs_codes?: string[]
  summary_table?: SummaryRow[]
  common_mistakes?: string[]
  related_question_ids?: string[]
  read_time?: number
  sections?: RawSection[]
  [key: string]: unknown
}

interface RawLinkPatch {
  lesson_id: string
  field: string
  corrected_value: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Rename snake_case fields to camelCase on a single lesson object. */
function normalizeLesson(lesson: RawLesson): Lesson {
  const {
    key_facts: _kf,
    related_question_ids,
    exam_importance,
    lesson_number,
    acs_codes,
    module_name,
    summary_table,
    common_mistakes,
    memory_aid: _ma,
    read_time,
    sections,
    ...rest
  } = lesson

  return {
    ...rest,
    ...(lesson_number        !== undefined && { lessonNumber:     lesson_number }),
    ...(module_name          !== undefined && { moduleName:       module_name }),
    ...(acs_codes            !== undefined && { acsCodes:         acs_codes }),
    ...(exam_importance      !== undefined && { importance:       exam_importance }),
    ...(read_time            !== undefined && { readTime:         read_time }),
    ...(summary_table        !== undefined && { summaryTable:     summary_table }),
    ...(common_mistakes      !== undefined && { commonMistakes:   common_mistakes }),
    ...(related_question_ids !== undefined && { relatedQuestions: related_question_ids }),
    // Normalize sections — each section may also have key_facts / memory_aid
    ...(sections !== undefined && {
      sections: sections.map(section => {
        const { key_facts: kf, memory_aid: ma, ...sRest } = section
        return {
          ...sRest,
          ...(kf !== undefined && { keyFacts:  kf }),
          ...(ma !== undefined && { memoryAid: ma }),
        }
      }),
    }),
  } as Lesson
}

// ─── Step 1 & 2: Extract and flatten lessons from both content files ──────────

const rawContentData = rawContent as { modules: Array<{ lessons: RawLesson[] }> }
const rawModuleIVData = rawModuleIV as { module: { lessons: RawLesson[] } }
const rawGapCloseData = rawGapClose as {
  link_patches: { patches: RawLinkPatch[] }
  new_lessons: RawLesson[]
}

// part107_lesson_content.json  →  { modules: [ { lessons: [...] }, ... ] }
const contentLessons = rawContentData.modules.flatMap(m => m.lessons)

// part107_module_iv_content.json  →  { module: { lessons: [...] } }
const moduleIVLessons = rawModuleIVData.module.lessons

// 16 lessons combined
const baseLessons = [...contentLessons, ...moduleIVLessons]

// ─── Step 3: Apply link patches from gap closure file ─────────────────────────

const patches = rawGapCloseData.link_patches.patches

const patchedLessons = baseLessons.map(lesson => {
  const patch = patches.find(p => p.lesson_id === lesson.id)
  if (!patch) return lesson
  // patch.field is always "related_question_ids" — replace it
  return { ...lesson, [patch.field]: patch.corrected_value }
})

// ─── Step 4: Append the 4 new lessons from gap closure ────────────────────────

const allLessons = [...patchedLessons, ...rawGapCloseData.new_lessons]

// ─── Step 5: Normalize all 20 lessons ─────────────────────────────────────────

export const LESSONS: Lesson[] = allLessons.map(normalizeLesson)
