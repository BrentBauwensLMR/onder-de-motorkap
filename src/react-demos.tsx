import { useEffect, useState } from 'react'
import { Braces, Check, Code2, Download, Eye, Globe2, MousePointerClick, Server, X } from 'lucide-react'
import { motion } from 'motion/react'
import { BrowserPreview, CodePanel, PlayButton } from './visuals'

const counterCode = `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`

export function VirtualDOMDiff() {
  const [count, setCount] = useState(0)
  const [previous, setPrevious] = useState(0)
  const [updates, setUpdates] = useState(0)

  function increment(amount: number) {
    setPrevious(count)
    setUpdates(amount)
    for (let index = 0; index < amount; index++) setCount((value) => value + 1)
  }

  return <div className="demo-stack">
    <div className="triple diff-grid">
      {[{ label: 'Vorige React UI', value: previous }, { label: 'Nieuwe React UI', value: count }].map(({ label, value }, index) =>
        <div className="panel diff-card" key={label}>
          <h2><Braces size={17}/> {label}</h2>
          <code><span className="syntax-markup">&lt;button&gt;</span><span className="diff-text">Count: {
            index === 1 && updates > 0
              ? <motion.mark key={count} initial={{ opacity: .35 }} animate={{ opacity: 1 }}>{value}</motion.mark>
              : value
          }</span><span className="syntax-markup">&lt;/button&gt;</span></code>
        </div>)}
      <div className="panel diff-card actual-dom">
        <h2><Code2 size={17}/> Echte DOM</h2>
        <button type="button" className="button primary" onClick={() => increment(1)}>Count: {count}</button>
      </div>
    </div>
    <div className="paired">
      <CodePanel label="React · JSX" code={counterCode}/>
      <div className="panel react-explainer">
        <h2>Van render naar commit</h2>
        <ol className="react-flow" aria-label="Reconciliation">
          {['Bereken UI', 'Vergelijk', 'Werk DOM bij'].map((step, index) =>
            <motion.li key={`${step}-${count}`} initial={updates ? { opacity: .45 } : false} animate={{ opacity: 1 }}
              transition={{ delay: index * .16 }}><span>{index + 1}</span>{step}</motion.li>)}
        </ol>
        <button type="button" className="button" onClick={() => increment(3)}>3 updates batchen</button>
        <p className="demo-caption" role="status">{updates === 0
          ? 'Klik op Count om reconciliation te volgen.'
          : updates === 3
            ? `Drie state-updates in één event. De knoptekst gaat in één commit van ${previous} naar ${count}.`
            : `De bestaande button blijft staan. De tekst verandert van ${previous} naar ${count}.`}</p>
      </div>
    </div>
    <p className="demo-caption">React-batching beperkt tussenliggende commits. De browser plant zijn eigen Paint. Directe DOM-updates kunnen sneller zijn en sommige frameworks werken zonder Virtual DOM.</p>
  </div>
}

const hydrationSteps = [
  { label: 'Server-HTML', description: 'De server genereert HTML voor de knop.', icon: Server },
  { label: 'Ontvangst', description: 'De browser ontvangt de HTML en bouwt de DOM op.', icon: Download },
  { label: 'Zichtbaar', description: 'De browser toont de knop. De React-handler is nog niet beschikbaar.', icon: Eye },
  { label: 'JS laadt', description: 'De JavaScript voor React en de component wordt geladen.', icon: Braces },
  { label: 'Hydration', description: 'React koppelt zijn componenten en handlers aan de bestaande, passende markup.', icon: Globe2 },
  { label: 'Interactief', description: 'De klik-handler werkt. Probeer de teller.', icon: MousePointerClick },
]

export function HydrationTimeline() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [count, setCount] = useState(0)
  const visible = step >= 2
  const hydrated = step === hydrationSteps.length - 1
  useEffect(() => {
    if (!playing) return
    const timeout = window.setTimeout(() => {
      if (hydrated) setPlaying(false)
      else setStep(step + 1)
    }, 1250)
    return () => window.clearTimeout(timeout)
  }, [step, playing, hydrated])

  return <div className="demo-stack">
    <div className="pipeline-steps hydration-steps" role="group" aria-label="Hydration-tijdlijn">
      {hydrationSteps.map(({ label, icon: Icon }, index) => <button type="button" className="pipeline-step" aria-pressed={index === step} key={label}
        onClick={() => { setStep(index); setPlaying(false); if (index < hydrationSteps.length - 1) setCount(0) }}><Icon size={21}/>{label}</button>)}
    </div>
    <div className="paired hydration-demo">
      <BrowserPreview address="browser · server-rendered pagina">
        <div className="hydration-canvas">
          {visible ? <motion.button type="button" className="button primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            disabled={!hydrated} onClick={() => setCount((value) => value + 1)}>Count: {count}</motion.button> : <span>De pagina is nog niet getekend.</span>}
        </div>
      </BrowserPreview>
      <div className="panel hydration-detail">
        <h2>{hydrationSteps[step].label}</h2>
        <p className="demo-caption" aria-live={playing ? 'off' : 'polite'}>{hydrationSteps[step].description}</p>
        <div className="control-row hydration-status">
          <span className={visible ? 'on' : ''}><Eye size={16}/> {visible ? 'Zichtbaar' : 'Nog niet zichtbaar'}</span>
          <span className={hydrated ? 'on' : ''}><MousePointerClick size={16}/> {hydrated ? 'Interactief' : 'Nog niet interactief'}</span>
        </div>
        <PlayButton playing={playing} label="Speel tijdlijn af" onClick={() => {
          if (!playing && hydrated) { setStep(0); setCount(0) }
          setPlaying(!playing)
        }}/>
      </div>
    </div>
    <p className="model-label">Conceptuele simulatie van SSR en hydration</p>
  </div>
}

const recap = [
  'HTML en CSS worden renderbare structuren.',
  'Layout bepaalt afmetingen en posities.',
  'Paint maakt tekeninstructies.',
  'Compositing combineert gerasterde lagen.',
  'DOM-updates kunnen renderingwerk veroorzaken.',
  'React coördineert updates met reconciliation en batching.',
  'Hydration koppelt React-interactie aan server-HTML.',
]

const questions = [
  { prompt: 'Welke stap bepaalt de positie van een element?', options: ['Layout', 'Paint', 'Rasterization'], correct: 0, rationale: 'Layout bepaalt de geometrie. Paint legt de tekeninstructies vast.' },
  { prompt: 'Welke wijziging kan op een geschikte laag alleen compositing vragen?', options: ['width', 'background-color', 'transform'], correct: 2, rationale: 'Transform kan bestaande laagpixels verplaatsen zonder nieuwe Layout of Paint.' },
  { prompt: 'Wanneer werkt een React-klik op server-HTML?', options: ['Zodra de HTML binnenkomt', 'Zodra die knop gehydrateerd is', 'Zodra de browser de knop tekent'], correct: 1, rationale: 'Hydration koppelt React aan de bestaande HTML zodat de event handler kan werken.' },
]

export function Quiz() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const question = questions[index]
  const answer = answers[index]
  const answered = Object.keys(answers).length
  const score = questions.filter((item, questionIndex) => answers[questionIndex] === item.correct).length
  return <div className="demo-stack">
    <div className="paired quiz-pair">
      <div className="panel recap">
        <h2>Dit neem je mee</h2>
        <ul>{recap.map((item) => <li key={item}><Check size={15}/>{item}</li>)}</ul>
      </div>
      <div className="panel quiz">
        <div className="quiz-header">
          <h2>Snelle quiz</h2>
          <div className="control-row" role="group" aria-label="Quizvragen">
            {questions.map((item, itemIndex) => <button type="button" key={item.prompt} className="button quiz-index"
              aria-label={`Vraag ${itemIndex + 1}`} aria-pressed={index === itemIndex} onClick={() => setIndex(itemIndex)}>{itemIndex + 1}</button>)}
          </div>
        </div>
        <p className="quiz-question">{question.prompt}</p>
        <div className="quiz-options" role="group" aria-label={question.prompt}>
          {question.options.map((option, optionIndex) =>
            <button type="button" key={option} className={`button ${answer === undefined ? '' : optionIndex === question.correct ? 'correct' : answer === optionIndex ? 'incorrect' : ''}`}
              aria-pressed={answer === optionIndex} onClick={() => setAnswers({ ...answers, [index]: optionIndex })}>
              {option}
              {answer !== undefined && optionIndex === question.correct && <Check size={16}/>}
              {answer === optionIndex && optionIndex !== question.correct && <X size={16}/>}
            </button>)}
        </div>
        <p role="status" className="demo-caption quiz-feedback">
          {answer === undefined ? `${answered} van 3 vragen beantwoord` : `${answer === question.correct ? 'Juist.' : 'Bijna.'} ${question.rationale}`}
          {answered === questions.length && ` Score: ${score}/3.`}
        </p>
      </div>
    </div>
    <blockquote>“Performance is not just about writing less JavaScript — it's about understanding what the browser has to do.”</blockquote>
  </div>
}
