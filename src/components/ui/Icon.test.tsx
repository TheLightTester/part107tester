import { render } from '@testing-library/react'
import Icon from './Icon'
import type { IconName } from './Icon'

describe('Icon', () => {
  it('renders an svg for known icon names', () => {
    const names: IconName[] = ['check', 'x', 'arrow', 'back', 'book', 'quiz', 'star', 'alert', 'plane', 'trophy', 'flame']
    names.forEach(name => {
      const { container } = render(<Icon name={name} />)
      expect(container.querySelector('svg')).not.toBeNull()
    })
  })

  it('applies the size prop to width and height', () => {
    const { container } = render(<Icon name="check" size={32} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })
})
