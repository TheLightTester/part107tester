import type { Module } from '../types'

export const MODULES: Module[] = [
  { id: 'I',   name: 'Regulations',           examWeight: '15–25%', color: '#E8A838', lessons: 5,  questions: 25 },
  { id: 'II',  name: 'Airspace & Charts',     examWeight: '15–25%', color: '#4A9EE8', lessons: 3,  questions: 25 },
  { id: 'III', name: 'Weather',               examWeight: '11–16%', color: '#5DB87A', lessons: 3,  questions: 23 },
  { id: 'IV',  name: 'Loading & Performance', examWeight: '7–11%',  color: '#B87AE8', lessons: 3,  questions: 13 },
  { id: 'V',   name: 'Operations',            examWeight: '35–45%', color: '#E86B4A', lessons: 6,  questions: 39 },
]
