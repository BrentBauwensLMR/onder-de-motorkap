import { ArrowRight, Braces, Code2, Clock3, Globe2, Layers3, Play, RotateCcw, Sparkles, SquareTerminal } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

const syntaxPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:function|const|return|let|useState|display|visibility|background|color|padding|width|border-radius)\b|\b\d+(?:px)?\b|#[a-fA-F0-9]{3,8}\b|<\/?[\w-]+|\/?>)/g

function highlight(source: string) {
  return source.split(syntaxPattern).map((token, index) => {
    if (index % 2 === 0) return token
    const kind = /^[<'"]/.test(token) || token.endsWith('>') ? 'markup'
      : /^(?:#|\d)/.test(token) ? 'number' : 'keyword'
    return <span key={index} className={`syntax-${kind}`}>{token}</span>
  })
}

export function CodePanel({ label, code }: { label: string; code: string }) {
  return <figure className="code-panel">
    <figcaption><Code2 size={15} /> {label}</figcaption>
    <pre tabIndex={0} aria-label={label}><code>{highlight(code)}</code></pre>
  </figure>
}

export function BrowserPreview({ children, address = 'localhost:5173', className = '' }: {
  children: ReactNode; address?: string; className?: string
}) {
  return <div className={`browser-preview ${className}`}>
    <div className="browser-bar">
      <div className="traffic-lights" aria-hidden="true"><i/><i/><i/></div>
      <span className="browser-address"><Globe2 size={12}/> {address}</span>
      <Layers3 size={15} className="browser-layers" aria-hidden="true"/>
    </div>
    {children}
  </div>
}

function PixelArtwork() {
  return <div className="pixel-art" aria-hidden="true">
    <div className="pixel-orbit pixel-orbit-outer"/><div className="pixel-orbit pixel-orbit-inner"/>
    <span className="pixel-stack"><i/><i/><i/></span>
    <span className="star star-one">+</span><span className="star star-two">+</span>
    <span className="star star-three">+</span><span className="star star-four">+</span>
  </div>
}

export function OpeningVisual() {
  const [replay, setReplay] = useState(0)
  return <div className="opening-visual" data-demo="">
    <div className="visual-grid" aria-hidden="true"/>
    <div className="visual-halo" aria-hidden="true"/>
    <div className="visual-stage">
      <BrowserPreview className="opening-browser">
        <div className="browser-content">
          <div className="source-pane">
            <div className="pane-label"><Code2 size={14}/> BRONCODE</div>
            <motion.div key={`source-${replay}`} initial={{ opacity: .5 }} animate={{ opacity: 1 }} transition={{ duration: .45 }}>
              <div><span className="source-ln">1</span><span className="syntax-markup">&lt;main&gt;</span></div>
              <div><span className="source-ln">2</span> <span className="syntax-markup">&lt;h1&gt;</span>Hello<span className="syntax-markup">&lt;/h1&gt;</span></div>
              <div><span className="source-ln">3</span><span className="syntax-markup">&lt;/main&gt;</span></div>
              <div className="mt-2"><span className="source-ln">4</span><span className="syntax-keyword">.ready</span> {'{'}</div>
              <div><span className="source-ln">5</span> color: <span className="syntax-number">#a78bfa</span>;</div>
              <div><span className="source-ln">6</span>{'}'}</div>
              <div className="mt-2"><span className="source-ln">7</span><span className="syntax-keyword">page</span>.classList</div>
              <div><span className="source-ln">8</span> .add(<span className="syntax-number">"ready"</span>);</div>
            </motion.div>
          </div>
          <div className="render-pane">
            <div className="pane-label"><Sparkles size={13}/> BROWSER</div>
            <motion.div className="sample-site" key={replay} initial={{ opacity: .25, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24, duration: .48 }}>
              <PixelArtwork/>
              <strong>Hello<span>.</span></strong>
              <div className="sample-lines" aria-hidden="true"><i/><i/></div>
            </motion.div>
          </div>
          <div className="render-arrow" aria-hidden="true"><ArrowRight size={16}/></div>
        </div>
      </BrowserPreview>
      <div className="opening-legend" aria-label="Bronbestanden">
        <span><Code2 size={15}/> HTML</span><span><Braces size={14}/> CSS</span><span><SquareTerminal size={14}/> JavaScript</span>
        <button className="replay" type="button" onClick={() => setReplay(replay + 1)} aria-label="Speel browseranimatie opnieuw af" title="Opnieuw afspelen"><RotateCcw size={15}/></button>
      </div>
    </div>
  </div>
}

export function PlayButton({ playing, onClick, label = 'Afspelen' }: { playing: boolean; onClick: () => void; label?: string }) {
  return <button type="button" className="button" onClick={onClick}>
    {playing ? <span aria-hidden="true">Ⅱ</span> : <Play size={15}/>} {playing ? 'Pauzeren' : label}
  </button>
}

export function OpeningSlide({ onNext }: { onNext: () => void }) {
  return <section className="opening-slide" aria-labelledby="slide-heading">
    <div className="opening-copy">
      <p className="eyebrow"><Clock3 size={15}/> 9 dia’s · 10 minuten</p>
      <h1 id="slide-heading" tabIndex={-1}>Layout, Paint &amp; <span>Virtual DOM</span></h1>
      <p className="opening-subtitle">Hoe wordt code omgezet naar pixels?</p>
      <p className="opening-question">Wat gebeurt er eigenlijk wanneer je een website opent?</p>
      <button type="button" className="button primary opening-start" onClick={onNext}><Play size={15} fill="currentColor"/> Start presentatie</button>
    </div>
    <OpeningVisual/>
  </section>
}
