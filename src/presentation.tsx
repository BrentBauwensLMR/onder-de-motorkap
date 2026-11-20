import { BookOpen, ChevronLeft, ChevronRight, CircleHelp, Clock3, Code2, Maximize, Minimize, Pause, Play, RotateCcw, X } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { slides, targetSeconds } from './content'
import { AnimatedPipeline, BoxModelExplorer, DOMTreeVisualizer, DOMUpdateDemo, RenderingCostVisualizer } from './rendering'
import { HydrationTimeline, Quiz, VirtualDOMDiff } from './react-demos'
import { OpeningSlide } from './visuals'

const demos = [AnimatedPipeline, DOMTreeVisualizer, BoxModelExplorer, RenderingCostVisualizer, DOMUpdateDemo, VirtualDOMDiff, HydrationTimeline, Quiz]
const lastSlide = slides.length - 1
const slidePath = (index: number) => `#/slide/${index + 1}`

function readSlide() {
  const match = /^#\/slide\/([1-9]\d*)$/.exec(window.location.hash)
  const index = match ? Number(match[1]) - 1 : 0
  return index <= lastSlide ? index : 0
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function SlideLayout({ index, children }: { index: number; children: ReactNode }) {
  const { title, takeaway, section } = slides[index]
  return <section className="lesson-slide" aria-labelledby="slide-heading">
    <div className="lesson-heading">
      <p className="eyebrow"><span className="eyebrow-dot"/>{section}</p>
      <h1 id="slide-heading" tabIndex={-1}>{title}</h1>
      <p>{takeaway}</p>
    </div>
    {children}
  </section>
}

function PresenterNotes({ index, onClose }: { index: number; onClose: () => void }) {
  const slide = slides[index]
  return <aside className="presenter-notes" id="presenter-notes" aria-labelledby="notes-heading">
    <div className="notes-header"><h2 id="notes-heading"><BookOpen size={18}/> Sprekersnotities</h2>
      <button className="button icon-button" type="button" aria-label="Sprekersnotities sluiten" onClick={onClose}><X size={18}/></button>
    </div>
    <p className="model-label"><Clock3 size={15}/> {formatTime(slide.seconds)} spreektijd</p>
    <p>{slide.script}</p>
    <dl>
      <dt>Benadruk</dt><dd>{slide.emphasize}</dd>
      <dt>Demo</dt><dd>{slide.interaction}</dd>
      <dt>Overgang</dt><dd>{slide.transition}</dd>
    </dl>
  </aside>
}

function ProgressIndicator({ current, onGo }: { current: number; onGo: (index: number) => void }) {
  return <nav className="progress-indicator" aria-label="Diavoortgang">
    {slides.map(({ title }, index) => <button key={title} type="button" title={`${index + 1}. ${title}`}
      aria-label={`Dia ${index + 1}: ${title}`} aria-current={current === index ? 'step' : undefined}
      className={index < current ? 'past' : ''} onClick={() => onGo(index)}><span/></button>)}
  </nav>
}

function SlideNavigation({ current, onGo, onReset }: {
  current: number; onGo: (index: number) => void; onReset: () => void
}) {
  return <footer className="deck-footer">
    <div className="footer-inner">
      <div className="footer-status">
        <span className="slide-counter" aria-label={`Dia ${current + 1} van ${slides.length}`}><strong>{String(current + 1).padStart(2, '0')}</strong><span>/</span>{String(slides.length).padStart(2, '0')}</span>
        <ProgressIndicator current={current} onGo={onGo}/>
      </div>
      <div className="footer-controls">
        <button className="button footer-reset" type="button" onClick={onReset} title="Reset demo" aria-label="Reset demo"><RotateCcw size={16}/><span>Reset demo</span></button>
        <div className="nav-divider"/>
        <button className="button nav-prev" type="button" disabled={current === 0} onClick={() => onGo(current - 1)} aria-label="Vorige dia"><ChevronLeft size={18}/><span>Vorige</span></button>
        <button className="button primary nav-next" type="button" disabled={current === lastSlide} onClick={() => onGo(current + 1)} aria-label="Volgende dia"><span>Volgende</span><ChevronRight size={18}/></button>
      </div>
    </div>
  </footer>
}

function Timer({ startedAt, elapsed, onStart, onReset }: {
  startedAt: number | null; elapsed: number; onStart: () => void; onReset: () => void
}) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (startedAt === null) return
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [startedAt])
  const seconds = Math.floor((elapsed + (startedAt === null ? 0 : Math.max(0, now - startedAt))) / 1000)
  return <div className="timer" role="group" aria-label="Presentatietimer">
    <span className="timer-value"><Clock3 size={15}/> {formatTime(seconds)} / {formatTime(targetSeconds)}</span>
    <button type="button" className="button icon-button" onClick={onStart} aria-label={startedAt === null ? 'Timer starten' : 'Timer pauzeren'}>
      {startedAt === null ? <Play size={14}/> : <Pause size={14}/>}
    </button>
    <button type="button" className="button icon-button" aria-label="Timer resetten" onClick={onReset}><RotateCcw size={14}/></button>
  </div>
}

const shortcuts = [
  ['→ / Spatie', 'Volgende dia'],
  ['←', 'Vorige dia'],
  ['Home / End', 'Eerste / laatste dia'],
  ['F / Escape', 'Volledig scherm wisselen / verlaten'],
  ['N', 'Sprekersnotities wisselen'],
  ['?', 'Sneltoetsen openen'],
]

function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])
  return <dialog ref={dialogRef} aria-labelledby="shortcuts-heading" className="shortcut-dialog" onCancel={() => onClose()}>
    <div className="notes-header">
      <h2 id="shortcuts-heading"><CircleHelp size={19}/> Sneltoetsen</h2>
      <button type="button" className="button icon-button" onClick={onClose} aria-label="Sneltoetsen sluiten"><X size={18}/></button>
    </div>
    <dl>{shortcuts.map(([key, action]) => <div key={key}><dt><kbd>{key}</kbd></dt><dd>{action}</dd></div>)}</dl>
  </dialog>
}

export function PresentationShell() {
  const reduceMotion = useReducedMotion()
  const [current, setCurrent] = useState(readSlide)
  const [revision, setRevision] = useState(0)
  const [notes, setNotes] = useState(false)
  const [help, setHelp] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenMessage, setFullscreenMessage] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const notesButton = useRef<HTMLButtonElement>(null)
  const focusNext = useRef(false)

  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(lastSlide, index))
    if (next === current) return
    window.history.pushState(null, '', slidePath(next))
    focusNext.current = true
    setCurrent(next)
  }, [current])

  useEffect(() => {
    const sync = () => {
      const index = readSlide()
      if (window.location.hash && window.location.hash !== slidePath(index)) window.history.replaceState(null, '', slidePath(index))
      setCurrent(index)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const syncFullscreen = () => { setFullscreen(Boolean(document.fullscreenElement)); setFullscreenMessage('') }
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen()
      else setFullscreenMessage('Volledig scherm is hier niet beschikbaar.')
    } catch {
      setFullscreenMessage('Volledig scherm is hier niet beschikbaar.')
    }
  }, [])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || help) return
      const target = event.target
      if (event.key === 'Escape' && document.fullscreenElement) { void toggleFullscreen(); return }
      if (target instanceof Element) {
        const editing = target.closest('input, select, textarea, pre, [role="slider"], [role="textbox"]')
          || (target instanceof HTMLElement && target.isContentEditable)
        const control = target.closest('button, a')
        if (editing || (control && (event.key === ' ' || control.closest('[data-demo]')))) return
      }
      switch (event.key.toLowerCase()) {
        case 'arrowright': case ' ': event.preventDefault(); go(current + 1); break
        case 'arrowleft': event.preventDefault(); go(current - 1); break
        case 'home': event.preventDefault(); go(0); break
        case 'end': event.preventDefault(); go(lastSlide); break
        case 'f': void toggleFullscreen(); break
        case 'n': setNotes((shown) => !shown); break
        case '?': setHelp(true); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [current, go, help, toggleFullscreen])

  const slideRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !focusNext.current) return
    focusNext.current = false
    node.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
    document.documentElement.scrollTop = 0
  }, [])

  function toggleTimer() {
    const now = Date.now()
    if (startedAt === null) setStartedAt(now)
    else { setElapsed(elapsed + now - startedAt); setStartedAt(null) }
  }

  const Demo = demos[current - 1]
  return <MotionConfig reducedMotion="user">
    <div className="presentation-shell">
      <header className="deck-header">
        <div className="header-inner">
          <a className="brand" href={slidePath(0)} onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            go(0)
          }}><span className="brand-icon"><Code2 size={21}/></span><span>Onder de motorkap</span></a>
          <div className="header-controls">
            <button className="button notes-button" type="button" ref={notesButton} aria-pressed={notes} aria-expanded={notes} aria-controls={notes ? 'presenter-notes' : undefined}
              onClick={() => setNotes(!notes)} aria-label="Sprekersnotities" title="Sprekersnotities"><BookOpen size={17}/><span>Notities</span></button>
            <button className="button icon-button header-tool" type="button" onClick={() => setHelp(true)} aria-label="Sneltoetsen" title="Sneltoetsen"><CircleHelp size={19}/></button>
            <button className="button icon-button header-tool" type="button" onClick={() => void toggleFullscreen()}
              aria-label={fullscreen ? 'Volledig scherm verlaten' : 'Volledig scherm'} title={fullscreen ? 'Volledig scherm verlaten' : 'Volledig scherm'}>{fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}</button>
          </div>
        </div>
      </header>
      {fullscreenMessage && <div className="fullscreen-message" role="status">{fullscreenMessage}</div>}
      <div className={`deck-body ${notes ? 'with-notes' : ''}`}>
        <main className="slide-area" aria-label="Presentatie">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div ref={slideRef} className="slide-frame" key={current}
              initial={reduceMotion ? false : { opacity: .45, x: 12 }} animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -8 }} transition={{ duration: reduceMotion ? 0 : .17 }}>
              {Demo
                ? <SlideLayout index={current}><div data-demo=""><Demo key={revision}/></div></SlideLayout>
                : <OpeningSlide key={revision} onNext={() => {
                  if (startedAt === null && elapsed === 0) setStartedAt(Date.now())
                  go(1)
                }}/>}
            </motion.div>
          </AnimatePresence>
        </main>
        {notes && <div className="presenter-pane">
          <Timer startedAt={startedAt} elapsed={elapsed} onStart={toggleTimer} onReset={() => { setStartedAt(null); setElapsed(0) }}/>
          <PresenterNotes index={current} onClose={() => { setNotes(false); notesButton.current?.focus() }}/>
        </div>}
      </div>
      <SlideNavigation current={current} onGo={go} onReset={() => setRevision((value) => value + 1)}/>
      <ShortcutHelp open={help} onClose={() => setHelp(false)}/>
      <span className="sr-only" role="status">Dia {current + 1} van {slides.length}. {slides[current].title}</span>
    </div>
  </MotionConfig>
}
