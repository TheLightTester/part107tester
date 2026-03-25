import { render, screen } from '@testing-library/react'
import DiffBadge from './DiffBadge'

describe('DiffBadge', () => {
  it('renders the difficulty level text', () => {
    render(<DiffBadge level="easy" />)
    expect(screen.getByText('easy')).toBeInTheDocument()
  })

  it('uses green color for easy', () => {
    const { container } = render(<DiffBadge level="easy" />)
    expect((container.firstChild as HTMLElement).style.color).toBe('rgb(93, 184, 122)')
  })

  it('uses gold color for medium', () => {
    const { container } = render(<DiffBadge level="medium" />)
    expect((container.firstChild as HTMLElement).style.color).toBe('rgb(232, 168, 56)')
  })

  it('uses red color for hard', () => {
    const { container } = render(<DiffBadge level="hard" />)
    expect((container.firstChild as HTMLElement).style.color).toBe('rgb(232, 107, 74)')
  })
})
