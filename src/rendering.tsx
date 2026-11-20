import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, Blocks, Box, Code2, Eye, GitBranch, Layers3, Monitor, Palette, Smartphone, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { BrowserPreview, CodePanel, PlayButton } from './visuals'

const pipeline = [
  { label: 'DOM / CSSOM', icon: Code2, output: 'HTML → DOM · CSS → CSSOM', detail: 'De browser parseert HTML tot een documentboom en CSS tot regels in de CSSOM.' },
  { label: 'Style', icon: GitBranch, output: 'DOM + CSSOM → Render Tree', detail: 'De browser matcht selectors, berekent styles en bepaalt welke elementen render boxes krijgen.' },
  { label: 'Layout', icon: Box, output: 'Afmetingen + posities', detail: 'Layout bepaalt de geometrie van de boxes op basis van styles en beschikbare ruimte.' },
  { label: 'Paint', icon: Palette, output: 'Tekeninstructies', detail: 'Paint legt vast wat getekend wordt en in welke volgorde, zoals achtergronden, tekst en borders.' },
  { label: 'Rasterization', icon: Blocks, output: 'Tekeninstructies → pixeldata', detail: 'Rasterization zet de tekeninstructies om in pixeldata.' },
  { label: 'Compositing', icon: Layers3, output: 'Lagen → frame', detail: 'Compositing combineert de gerasterde lagen tot het uiteindelijke beeld.' },
  { label: 'Pixels', icon: Sparkles, output: 'Het zichtbare frame', detail: 'Het samengestelde frame verschijnt op het scherm.' },
]

function PipelineArtifact({ step, text, accent }: { step: number; text: string; accent: boolean }) {
  const reduced = useReducedMotion()
  const tokens = [
    ['<main>', '<h3>', '.kaart'],
    ['main', '↳ h3', 'color'],
    ['x: 0', 'y: 0', 'w: 160'],
    ['fill', 'text', 'border'],
    [], [], [],
  ][step]
  return <div className={`pipeline-artifact artifact-${step}`} aria-hidden="true">
    {step < 4 && tokens.map((token, index) => <motion.span key={token} initial={reduced ? false : { opacity: .1, y: 5 }}
      animate={{ opacity: 1, y: 0 }} transition={{ duration: .26, delay: reduced ? 0 : index * .09 }}>{token}</motion.span>)}
    {step === 4 && Array.from({ length: 18 }, (_, index) => <motion.i key={index} initial={reduced ? false : { opacity: .08 }}
      animate={{ opacity: (index % 3 + 2) / 4 }} transition={{ duration: .18, delay: reduced ? 0 : index * .028 }}/>)}
    {step === 5 && [0, 1, 2].map((index) => <motion.i key={index} initial={reduced ? false : { opacity: .1, x: 12 }}
      animate={{ opacity: 1, x: 0 }} transition={{ duration: .24, delay: reduced ? 0 : index * .12 }}/>)}
    {step === 6 && <motion.strong initial={reduced ? false : { opacity: .25 }} animate={{ opacity: 1 }}
      style={{ color: accent ? '#67e8f9' : '#c4b5fd' }}>{text || ' '}</motion.strong>}
  </div>
}

export function AnimatedPipeline() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [accent, setAccent] = useState(false)
  const [text, setText] = useState('Hallo browser')
  useEffect(() => {
    if (!playing) return
    const timeout = window.setTimeout(() => {
      if (step === pipeline.length - 1) setPlaying(false)
      else setStep(step + 1)
    }, 1450)
    return () => window.clearTimeout(timeout)
  }, [step, playing])

  const current = pipeline[step]
  return <div className="demo-stack">
    <div className="pipeline-steps" role="group" aria-label="Rendering pipeline">
      {pipeline.map(({ label, icon: Icon }, index) => (
        <button type="button" className="pipeline-step" key={label} aria-pressed={step === index}
          onClick={() => { setPlaying(false); setStep(index) }}>
          <Icon size={21}/><span>{label}</span>
        </button>
      ))}
    </div>
    <div className="panel stage-summary" aria-live={playing ? 'off' : 'polite'}>
      <motion.div key={`symbol-${step}`} className="stage-symbol" initial={{ opacity: .4, scale: .85 }} animate={{ opacity: 1, scale: 1 }}>
        <current.icon size={27}/>
      </motion.div>
      <div><strong>{current.output}</strong><p>{current.detail}</p></div>
      <PipelineArtifact key={`artifact-${step}`} step={step} text={text} accent={accent}/>
      <PlayButton playing={playing} onClick={() => {
        if (!playing && step === pipeline.length - 1) setStep(0)
        setPlaying(!playing)
      }}/>
    </div>
    <div className="paired">
      <div className="paired code-pair">
        <CodePanel label="HTML" code={`<main class="kaart">\n  <h3>${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</h3>\n</main>`}/>
        <CodePanel label="CSS" code={`.kaart {\n  color: ${accent ? '#67e8f9' : '#c4b5fd'};\n  padding: 16px;\n}`}/>
      </div>
      <BrowserPreview address="browser · preview">
        <div className="mini-live" style={{ color: accent ? '#67e8f9' : '#c4b5fd' }}>{text || '\u00a0'}</div>
        <div className="preview-controls">
          <input type="text" value={text} maxLength={30} aria-label="Tekst van de HTML-preview" onChange={(event) => setText(event.target.value)}/>
          <button type="button" className="button" aria-pressed={accent} onClick={() => setAccent(!accent)}>Wissel kleur</button>
        </div>
      </BrowserPreview>
    </div>
    <p className="demo-caption">JavaScript kan de DOM en styles wijzigen. De browser kan tussenresultaten hergebruiken en stappen overslaan.</p>
  </div>
}

type Visibility = 'display: none' | 'visibility: hidden' | 'visible'

function Tree({ title, kind, visibility, selected, onSelect }: {
  title: string; kind: 'dom' | 'css' | 'render'; visibility: Visibility; selected: string; onSelect: (node: string) => void
}) {
  const nodes = kind === 'css'
    ? [{ id: 'card', label: '.card' }, { id: 'heading', label: 'h1' }, { id: 'button', label: 'button' }, { id: 'paragraph', label: visibility === 'visible' ? 'p · visible' : `p · ${visibility}` }]
    : [{ id: 'card', label: kind === 'dom' ? 'div.card' : 'div.card · box' }, { id: 'heading', label: kind === 'dom' ? 'h1 → Hello!' : 'h1 · box' }, { id: 'button', label: kind === 'dom' ? 'button → Click me' : 'button · box' },
        ...(kind === 'render' && visibility === 'display: none' ? [] : [{ id: 'paragraph', label: kind === 'dom' ? 'p → Hidden text' : visibility === 'visible' ? 'p · box' : 'p · onzichtbare box' }])]
  const [root, ...branches] = nodes
  const renderNode = (node: typeof root) => <button type="button" className="tree-node" aria-pressed={selected === node.id} onClick={() => onSelect(node.id)}>{node.label}</button>
  return <div className="panel tree">
    <h2><GitBranch size={17}/> {title}</h2>
    <ul className="tree-root"><li>{renderNode(root)}
      <ul>{branches.map((node) => <li key={node.id}>{renderNode(node)}</li>)}</ul>
    </li></ul>
    {kind === 'render' && visibility === 'display: none' && <p className="tree-absent">↳ p genereert geen box</p>}
  </div>
}

export function DOMTreeVisualizer() {
  const [visibility, setVisibility] = useState<Visibility>('display: none')
  const [selected, setSelected] = useState('paragraph')
  const explanation = visibility === 'display: none'
    ? 'De p blijft in de DOM en genereert geen render box.'
    : visibility === 'visibility: hidden'
      ? 'De p blijft in de DOM. Zijn box neemt ruimte in en de tekst is onzichtbaar.'
      : 'De p genereert een box en de tekst is zichtbaar.'
  return <div className="demo-stack">
    <div className="control-row" role="group" aria-label="Zichtbaarheid van de paragraaf">
      {(['display: none', 'visibility: hidden', 'visible'] as const).map((value) => <button type="button" key={value} className="button mono" aria-pressed={visibility === value}
        onClick={() => { setVisibility(value); setSelected('paragraph') }}>{value === 'visible' ? 'Zichtbaar' : value}</button>)}
    </div>
    <div className="triple">
      <Tree title="DOM Tree" kind="dom" visibility={visibility} selected={selected} onSelect={setSelected}/>
      <Tree title="CSSOM / regels" kind="css" visibility={visibility} selected={selected} onSelect={setSelected}/>
      <Tree title="Render Tree" kind="render" visibility={visibility} selected={selected} onSelect={setSelected}/>
    </div>
    <div className="paired">
      <CodePanel label="HTML" code={`<div class="card">\n  <h1>Hello!</h1>\n  <button>Click me</button>\n  <p${visibility === 'visible' ? '' : ` style="${visibility}"`}>Hidden text</p>\n</div>`}/>
      <BrowserPreview address="browser · resultaat">
        <div className="tree-preview">
          <strong>Hello!</strong><button type="button" className="button" aria-disabled="true">Click me</button>
          <p style={{ display: visibility === 'display: none' ? 'none' : undefined, visibility: visibility === 'visibility: hidden' ? 'hidden' : undefined }}>Hidden text</p>
        </div>
      </BrowserPreview>
    </div>
    <p className="demo-caption" role="status">{explanation} CSSOM bevat regels. De browser berekent per element de computed style.</p>
  </div>
}

const boxSettings = [
  { key: 'width', label: 'Width', min: 100, max: 520 },
  { key: 'padding', label: 'Padding', min: 0, max: 28 },
  { key: 'border', label: 'Border', min: 0, max: 10 },
  { key: 'margin', label: 'Margin', min: 0, max: 32 },
] as const

export function BoxModelExplorer() {
  const [values, setValues] = useState({ width: 370, padding: 20, border: 4, margin: 16 })
  const [borderBox, setBorderBox] = useState(false)
  const [mobile, setMobile] = useState(false)
  const { width, padding, border, margin } = values
  const viewport = mobile ? 320 : 760
  const extras = 2 * (padding + border)
  const borderWidth = Math.min(borderBox ? width : width + extras, viewport - 2 * margin)
  const content = borderWidth - extras
  const total = borderWidth + 2 * margin
  return <div className="paired box-demo">
    <div className="panel box-controls">
      <h2>Box Model</h2>
      <div className="control-row" role="group" aria-label="Box sizing">
        <button type="button" className="button mono" aria-pressed={!borderBox} onClick={() => setBorderBox(false)}>content-box</button>
        <button type="button" className="button mono" aria-pressed={borderBox} onClick={() => setBorderBox(true)}>border-box</button>
      </div>
      {boxSettings.map(({ key, label, min, max }) => <label className={`range-row range-${key}`} key={key}>
        <span>{label} <output>{values[key]} px</output></span>
        <input type="range" min={min} max={max} value={values[key]} aria-label={label}
          onChange={(event) => setValues({ ...values, [key]: event.target.valueAsNumber })}/>
      </label>)}
    </div>
    <BrowserPreview address={`viewport · ${viewport} px`} className="box-browser">
      <div className="control-row box-view-switch" role="group" aria-label="Viewportgrootte">
        <button type="button" className="button" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={16}/> Desktop</button>
        <button type="button" className="button" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={16}/> Mobiel</button>
      </div>
      <div className="box-viewport" style={{ width: mobile ? `${100 * 320 / 760}%` : '100%' }}>
        <motion.div className="box-margin" layout style={{ width: `${100 * total / viewport}%`, padding: `${margin / 2}px ${100 * margin / viewport}%` }}>
          <div className="box-border" style={{ padding: `${border / 2}px ${100 * border / borderWidth}%` }}>
            <div className="box-padding" style={{ padding: `${padding / 2}px ${100 * padding / (borderWidth - 2 * border)}%` }}>
              <div className="box-content"><span>Content</span></div>
            </div>
          </div>
        </motion.div>
      </div>
      <dl className="box-measurements">
        <div><dt>Content</dt><dd>{content} px</dd></div>
        <div><dt>Border box</dt><dd>{borderWidth} px</dd></div>
        <div><dt>Met margin</dt><dd>{total} px</dd></div>
      </dl>
      <p className="demo-caption box-caption">{borderBox ? 'Width omvat content, padding en border.' : 'Width geldt voor content. Padding en border komen erbij.'}{borderWidth < (borderBox ? width : width + extras) && ' De box past zich aan het viewport aan.'}</p>
    </BrowserPreview>
  </div>
}

const mutations = [
  { label: 'Width', property: 'width', stages: [0, 1, 2], detail: 'Een nieuwe breedte verandert de geometrie. De browser moet doorgaans Layout, Paint en Compositing uitvoeren.' },
  { label: 'Height', property: 'height', stages: [0, 1, 2], detail: 'Een nieuwe hoogte verandert de geometrie. De browser moet doorgaans Layout, Paint en Compositing uitvoeren.' },
  { label: 'Background', property: 'background', stages: [1, 2], detail: 'Een andere kleur verandert de tekeninstructies. Geometrie kan worden hergebruikt.' },
  { label: 'Transform', property: 'transform', stages: [2], detail: 'Met een geschikte composited layer kan de browser bestaande pixels op een andere plek samenstellen.' },
  { label: 'Opacity', property: 'opacity', stages: [2], detail: 'Met een geschikte composited layer kan de browser de dekking bij het samenstellen aanpassen.' },
] as const

export function RenderingCostVisualizer() {
  const [state, setState] = useState({ width: false, height: false, background: false, transform: false, opacity: false })
  const [active, setActive] = useState<(typeof mutations)[number]>()
  const [revision, setRevision] = useState(0)
  const stages = [{ name: 'Layout', icon: Box }, { name: 'Paint', icon: Palette }, { name: 'Composite', icon: Layers3 }]
  return <div className="paired rendering-demo">
    <BrowserPreview address="browser · verander een property">
      <div className="cost-canvas">
        <div className="cost-object" style={{
          width: state.width ? '70%' : '51%', height: state.height ? 138 : 101,
          background: state.background ? 'linear-gradient(135deg, #087983, #1752a2)' : undefined,
          transform: state.transform ? 'translate(13%, -8px) rotate(-7deg)' : undefined,
          opacity: state.opacity ? .48 : 1,
        }}><Box size={28}/> <span>.element</span></div>
      </div>
      <div className="control-row cost-controls" role="group" aria-label="CSS-properties">
        {mutations.map((mutation) => <button className="button mono" type="button" key={mutation.label} aria-pressed={state[mutation.property]}
          onClick={() => { setState({ ...state, [mutation.property]: !state[mutation.property] }); setActive(mutation); setRevision(revision + 1) }}>{mutation.label}</button>)}
      </div>
    </BrowserPreview>
    <div className="panel cost-results">
      <h2>Welke stappen zijn actief?</h2>
      <div className="cost-steps" key={revision}>
        {stages.map(({ name, icon: Icon }, index) => {
          const affected = active?.stages.some((stage) => stage === index)
          return <motion.div key={name} className={`cost-step cost-step-${index} ${affected ? 'affected' : ''}`}
            initial={affected ? { opacity: .55, x: -5 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: affected ? index * .12 : 0 }}>
            <Icon size={19}/><strong>{name}</strong><span>{affected ? 'Actief' : active ? 'Overgeslagen' : '—'}</span>
          </motion.div>
        })}
      </div>
      <p className="demo-caption" role="status">{active?.detail ?? 'Kies een CSS-property om de verwachte stappen te bekijken.'}</p>
      <p className="model-label">Conceptueel model · geen performancemeting</p>
    </div>
  </div>
}

const scenarios = [
  { label: 'A · Writes en reads afwisselen', code: 'for (const node of nodes) {\n  node.style.width = "160px";\n  widths.push(node.offsetWidth);\n}', events: ['Write 1', 'Read 1', 'Style', 'Layout', 'Write 2', 'Read 2', 'Style', 'Layout', 'Write 3', 'Read 3', 'Style', 'Layout', 'Paint'] },
  { label: 'B · Eerst lezen, dan schrijven', code: 'const widths = nodes.map(\n  node => node.offsetWidth\n);\nfor (const node of nodes) {\n  node.style.width = "160px";\n}', events: ['Read 1', 'Read 2', 'Read 3', 'Write 1', 'Write 2', 'Write 3', 'Style', 'Layout', 'Paint'] },
]

export function DOMUpdateDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [cursor, setCursor] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const scenario = scenarios[scenarioIndex]
  useEffect(() => {
    if (!playing) return
    const timeout = window.setTimeout(() => {
      if (cursor >= scenario.events.length - 1) setPlaying(false)
      else setCursor(cursor + 1)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [cursor, playing, scenario])

  return <div className="demo-stack">
    <div className="control-row scenario-control" role="group" aria-label="Update-scenario">
      {scenarios.map(({ label }, index) => <button type="button" key={label} className="button" aria-pressed={scenarioIndex === index}
        onClick={() => { setScenarioIndex(index); setCursor(-1); setPlaying(false) }}>{label}</button>)}
      <PlayButton playing={playing} label="Speel updates af" onClick={() => {
        if (playing) setPlaying(false)
        else { setCursor(cursor >= scenario.events.length - 1 ? 0 : Math.max(0, cursor)); setPlaying(true) }
      }}/>
    </div>
    <div className="paired">
      <CodePanel label="JavaScript" code={scenario.code}/>
      <div className="panel mutation-tree">
        <h2><GitBranch size={17}/> DOM Tree</h2>
        <code>&lt;main&gt;</code><ArrowDown size={15}/>
        <div>{[1, 2, 3].map((index) => <span key={index} className={scenario.events.slice(0, cursor + 1).includes(`Write ${index}`) ? 'written' : ''}>div {index}</span>)}</div>
      </div>
    </div>
    <div className="panel event-panel">
      <h2>Volgorde van het werk</h2>
      <ol className="events">
        {scenario.events.map((event, index) => <li key={index} aria-current={index === cursor ? 'step' : undefined}
          className={`event-${event.split(' ')[0].toLowerCase()} ${index <= cursor ? 'reached' : ''}`}>{event}</li>)}
      </ol>
      <p className="demo-caption"><strong>{scenarioIndex === 0 ? 'A · Tot 3 gedwongen Layout-stappen' : 'B · 1 geplande Layout-stap in dit model'}</strong><ArrowRight size={15}/>
        {scenarioIndex === 0 ? 'Na iedere write vraagt de read meteen de nieuwe afmeting op.' : 'De reads gebruiken bestaande afmetingen. Writes kunnen daarna samen verwerkt worden.'}</p>
    </div>
    <p className="model-label"><Eye size={14}/> Schematische tijdlijn. Invalidatie kan lokaal blijven en meerdere Layout-stappen kunnen aan één Paint voorafgaan.</p>
  </div>
}
