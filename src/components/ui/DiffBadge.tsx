import type { Difficulty } from '../../types'

interface DiffBadgeProps {
  level: Difficulty
}

export default function DiffBadge({ level }: DiffBadgeProps) {
  const colors: Record<Difficulty, string> = { easy: '#5DB87A', medium: '#E8A838', hard: '#E86B4A' }
  const color = colors[level]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color,
      border: `1px solid ${color}40`, borderRadius: 3,
      padding: '2px 6px',
    }}>{level}</span>
  )
}
