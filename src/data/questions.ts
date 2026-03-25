import type { Question } from '../types'
import rawBank1 from '../../reference files/part107_question_bank.json?raw'
import rawBank2 from '../../reference files/part107_question_bank_expansion.json?raw'

function parseJsonWithComments(str: string): { questions: Question[] } {
  const stripped = str.replace(/\/\/[^\n]*/g, '')
  return JSON.parse(stripped) as { questions: Question[] }
}

const bank1 = parseJsonWithComments(rawBank1)
const bank2 = parseJsonWithComments(rawBank2)

export const QUESTIONS: Question[] = [...bank1.questions, ...bank2.questions]
