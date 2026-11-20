import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PresentationShell } from './presentation'

function showSlide(index: number) {
  window.history.replaceState(null, '', `#/slide/${index}`)
  return render(<PresentationShell/>)
}

beforeEach(() => window.history.replaceState(null, '', '/'))

describe('presentatie', () => {
  it('opent een deep link en ondersteunt knoppen, voortgang en toetsen', async () => {
    const user = userEvent.setup()
    showSlide(4)
    expect(screen.getByRole('heading', { name: 'Layout & het CSS Box Model' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Volgende dia' }))
    expect(await screen.findByRole('heading', { name: 'Reflow, Repaint & Compositing' })).toBeVisible()
    expect(window.location.hash).toBe('#/slide/5')
    await user.keyboard('{End}')
    expect(await screen.findByRole('heading', { name: 'Van pixels naar praktijk' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Volgende dia' })).toBeDisabled()
    await user.keyboard('{Home}')
    expect(await screen.findByRole('heading', { name: 'Layout, Paint & Virtual DOM' })).toBeVisible()
    await user.keyboard(' ')
    expect(await screen.findByRole('heading', { name: 'Van broncode naar pixels' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Dia 7: Virtual DOM/ }))
    expect(await screen.findByRole('heading', { name: 'Virtual DOM & reconciliation' })).toBeVisible()
    await user.keyboard('{ArrowLeft}')
    expect(await screen.findByRole('heading', { name: 'Wat kosten DOM-updates?' })).toBeVisible()
  })

  it('biedt notities en de timer per presentatie', async () => {
    const user = userEvent.setup()
    showSlide(4)
    const control = screen.getByRole('button', { name: 'Sprekersnotities' })
    await user.click(control)
    const notes = screen.getByRole('complementary', { name: 'Sprekersnotities' })
    expect(within(notes).getByText('1:15 spreektijd')).toBeVisible()
    expect(within(notes).getByText('Overgang')).toBeVisible()
    expect(screen.getByText('0:00 / 10:00')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Timer starten' }))
    expect(screen.getByRole('button', { name: 'Timer pauzeren' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Timer resetten' }))
    expect(screen.getByRole('button', { name: 'Timer starten' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Sprekersnotities sluiten' }))
    expect(notes).not.toBeInTheDocument()
    expect(control).toHaveFocus()
  })

  it('laat code-invoer het toetsenbord gebruiken en reset alleen de demo', async () => {
    const user = userEvent.setup()
    showSlide(2)
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Hello world{ArrowLeft}{Home}{End}')
    expect(input).toHaveValue('Hello world')
    expect(screen.getByRole('heading', { name: 'Van broncode naar pixels' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Paint' }))
    expect(screen.getByText('Tekeninstructies', { exact: true })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.getByRole('textbox')).toHaveValue('Hallo browser')
    expect(screen.getByRole('button', { name: 'DOM / CSSOM' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toont het verschil tussen display none en visibility hidden', async () => {
    const user = userEvent.setup()
    showSlide(3)
    expect(screen.getByText('↳ p genereert geen box')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'visibility: hidden' }))
    expect(screen.getByText('p · onzichtbare box')).toBeVisible()
    expect(screen.getByText('Hidden text', { selector: 'p' })).not.toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Zichtbaar' }))
    expect(screen.getByText('Hidden text', { selector: 'p' })).toBeVisible()
  })

  it('berekent afmetingen voor beide boxmodellen en viewports', async () => {
    const user = userEvent.setup()
    showSlide(4)
    expect(screen.getByText('418 px')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'border-box' }))
    expect(screen.getByText('322 px')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Mobiel' }))
    expect(screen.getByText('288 px')).toBeVisible()
    expect(screen.getByText('240 px')).toBeVisible()
    fireEvent.change(screen.getByRole('slider', { name: 'Padding' }), { target: { value: '10' } })
    expect(screen.getByText('260 px')).toBeVisible()
  })

  it('toont alleen de toepasselijke renderingstappen in het conceptuele model', async () => {
    const user = userEvent.setup()
    showSlide(5)
    await user.click(screen.getByRole('button', { name: 'Width' }))
    expect(screen.getAllByText('Actief', { exact: true })).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Background' }))
    expect(screen.getAllByText('Actief', { exact: true })).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Transform' }))
    expect(screen.getAllByText('Actief', { exact: true })).toHaveLength(1)
  })

  it('vergelijkt beide updatevolgordes', async () => {
    const user = userEvent.setup()
    showSlide(6)
    expect(screen.getAllByText('Layout', { selector: 'li' })).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Eerst lezen/ }))
    expect(screen.getAllByText('Layout', { selector: 'li' })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Speel updates af' }))
    expect(screen.getByText('Read 1', { selector: 'li' })).toHaveAttribute('aria-current', 'step')
  })

  it('werkt dezelfde DOM-knop bij en toont een groep state-updates', async () => {
    const user = userEvent.setup()
    showSlide(7)
    const counter = screen.getByRole('button', { name: 'Count: 0' })
    await user.click(counter)
    expect(counter).toHaveAccessibleName('Count: 1')
    await user.click(screen.getByRole('button', { name: '3 updates batchen' }))
    expect(counter).toHaveAccessibleName('Count: 4')
    expect(screen.getByText(/één commit van 1 naar 4/)).toBeVisible()
  })

  it('activeert de zichtbare teller pas na de gesimuleerde hydration', async () => {
    const user = userEvent.setup()
    showSlide(8)
    expect(screen.queryByRole('button', { name: 'Count: 0' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zichtbaar' }))
    const counter = screen.getByRole('button', { name: 'Count: 0' })
    expect(counter).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Interactief' }))
    expect(counter).toBeEnabled()
    await user.click(counter)
    expect(counter).toHaveAccessibleName('Count: 1')
  })

  it('geeft quizfeedback en houdt de totaalscore bij', async () => {
    const user = userEvent.setup()
    showSlide(9)
    await user.click(screen.getByRole('button', { name: 'Layout' }))
    expect(screen.getByText(/^Juist\./)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Vraag 2' }))
    await user.click(screen.getByRole('button', { name: 'width' }))
    expect(screen.getByText(/^Bijna\./)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Vraag 3' }))
    await user.click(screen.getByRole('button', { name: /die knop gehydrateerd/ }))
    await waitFor(() => expect(screen.getByText(/Score: 2\/3/)).toBeVisible())
  })
})
