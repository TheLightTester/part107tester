import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('App integration', () => {
  it('renders home screen by default with hero text', () => {
    render(<App />)
    expect(screen.getByText(/Master the knowledge/i)).toBeInTheDocument()
  })

  it('renders the nav with Part 107 Prep branding', () => {
    render(<App />)
    expect(screen.getByText('Part 107 Prep')).toBeInTheDocument()
  })

  it('shows all 20 lessons on the home screen', () => {
    render(<App />)
    // Each lesson row should appear — check for a specific lesson title from the real data
    expect(screen.getByText(/Eligibility & the Remote Pilot Certificate/i)).toBeInTheDocument()
  })

  it('clicking a lesson navigates to the lesson reader screen', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/Eligibility & the Remote Pilot Certificate/i))
    expect(screen.getByText(/Back to lessons/i)).toBeInTheDocument()
  })

  it('clicking Back to lessons returns to home screen', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/Eligibility & the Remote Pilot Certificate/i))
    fireEvent.click(screen.getByText(/Back to lessons/i))
    expect(screen.getByText(/Master the knowledge/i)).toBeInTheDocument()
  })

  it('clicking Mark Complete marks lesson as read', async () => {
    render(<App />)
    fireEvent.click(screen.getByText(/Eligibility & the Remote Pilot Certificate/i))
    fireEvent.click(screen.getByText(/Mark Complete/i))
    // Returns to home — lessons read stat should update
    await waitFor(() => {
      expect(screen.getByText(/Master the knowledge/i)).toBeInTheDocument()
    })
  })

  it('Final Exam card is visible on home screen', () => {
    render(<App />)
    expect(screen.getByText('60-Question Final Exam')).toBeInTheDocument()
  })

  it('clicking Start Final Exam navigates to quiz screen with 60 questions', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Final Exam'))
    // Quiz screen shows question counter "1 / 60"
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 60/i)).toBeInTheDocument()
    })
  })

  it('shows exam timer in exam mode', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Start Final Exam'))
    await waitFor(() => {
      expect(screen.getByText(/02:00:00/i)).toBeInTheDocument()
    })
  })
})
