import { render } from '@testing-library/react'
import ProgressRing from './ProgressRing'

describe('ProgressRing', () => {
  it('renders two circles (track + fill)', () => {
    const { container } = render(<ProgressRing pct={50} color="#E8A838" />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
  })

  it('uses the provided color on the fill circle', () => {
    const { container } = render(<ProgressRing pct={75} color="#4A9EE8" />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    expect(fillCircle?.getAttribute('stroke')).toBe('#4A9EE8')
  })

  it('at 0% fill circle strokeDashoffset equals full circumference', () => {
    const size = 56
    const r = (size - 8) / 2
    const circ = 2 * Math.PI * r
    const { container } = render(<ProgressRing pct={0} color="#E8A838" size={size} />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    const offset = parseFloat(fillCircle?.getAttribute('stroke-dashoffset') ?? '0')
    expect(offset).toBeCloseTo(circ, 1)
  })

  it('at 100% fill circle strokeDashoffset is 0', () => {
    const { container } = render(<ProgressRing pct={100} color="#E8A838" />)
    const circles = container.querySelectorAll('circle')
    const fillCircle = circles[1]
    const offset = parseFloat(fillCircle?.getAttribute('stroke-dashoffset') ?? '1')
    expect(offset).toBeCloseTo(0, 1)
  })
})
