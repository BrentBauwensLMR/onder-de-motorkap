# Layout, Paint & Virtual DOM

> Hoe worden boxes pixels, en waarom vermijden frameworks het aanraken van de DOM?

## Opdracht

Uitleggen:

- Layout: het box model, de viewport, reflow
- Paint en compositing: wat triggert een repaint
- Waarom DOM-updates duur zijn en hoe een virtual DOM ze bundelt
- Hydration: server-rendered HTML interactief maken

Waarom het ertoe doet: haperend scrollen, layout shifts en trage UI's. Vind wat reflow en repaint forceert.

## Onderzoeksrichtingen

| # | Richting | Interessante vraag | Hoe onderzoeken |
|---|---|---|---|
| 1 | [De rendering pipeline](01-rendering-pipeline.md) | Wat gebeurt er tussen "DOM gewijzigd" en "pixel op scherm"? | Parse → Style → Layout → Paint → Composite uittekenen, en per stap tonen wat hem triggert |
| 2 | Box model en viewport | Waarom verandert de layout als de adresbalk op mobiel inklapt? | `vh` vs `dvh`/`svh`, containing blocks, formatting contexts |
| 3 | Forced reflow (layout thrashing) | Waarom kan één `offsetHeight` in een lus een pagina laten haperen? | Live demo met reads en writes door elkaar, daarna gebundeld |
| 4 | Paint vs composite | Waarom is `transform` goedkoop en `top`/`width` duur? | DevTools Rendering: paint flashing, layer borders. `will-change` en het geheugen dat te veel layers kosten |
| 5 | Main thread vs compositor thread | Waarom scrollt een pagina vlot terwijl JS bezig is, tot je een `wheel`-listener toevoegt? | Passive listeners, frame budget van 16,7 ms, long tasks, INP |
| 6 | Layout shifts (CLS) | Waar springt een UI tijdens het laden? | Afbeeldingen zonder afmetingen, webfonts, loading states, skeletons. "Layout shift regions" in DevTools |
| 7 | Reflow beperken | Kun je de browser vertellen dat een stuk DOM geen invloed heeft op de rest? | `contain`, `content-visibility: auto`, virtualisatie van lange lijsten |
| 8 | De virtual DOM-mythe | Is de DOM echt traag, of is het werk dat erop volgt traag? | VDOM is een programmeermodel, niet sneller dan optimale DOM-code. Vergelijken met Svelte/Solid (fine-grained, geen VDOM) |
| 9 | React: render vs commit | Wanneer raakt React de DOM echt aan? | Render phase vs commit phase, automatic batching, keys, `useLayoutEffect` vs `useEffect` (layout lezen vóór paint) |
| 10 | Hydration | Wat kost het om server-HTML interactief te maken? | Hydration mismatch, zichtbaar maar nog niet klikbaar, selective hydration, islands (Astro), resumability (Qwik), Server Components |

## Kern van de demo (#3 en #8)

```js
// Traag: elke read forceert een synchrone layout na de vorige write
for (const el of items) {
  el.style.width = box.offsetWidth + 'px';
}

// Snel: eerst alles lezen, dan alles schrijven (één layout)
const w = box.offsetWidth;
for (const el of items) el.style.width = w + 'px';
```

Dit is ook de ingang naar de virtual DOM: React bundelt writes in de commit phase. Thrashing ontstaat bij React vooral via eigen reads in `useLayoutEffect` of in event handlers.

## Toepassen op een eigen project

Hypotheses om na te kijken in een React SPA met formulieren en data fetching:

- **Formulieren**: hoeveel componenten rerenderen per toetsaanslag? React Profiler laat dat zien.
- **Data laden**: verschuift content als data binnenkomt? CLS meten op de belangrijkste flow.
- **Mobiel**: staat er ergens `100vh`? Dat geeft sprongen bij het in- en uitklappen van de adresbalk.
- **Hydration**: alleen als vergelijking. Wat zou SSR een SPA opleveren (snellere first paint) en kosten (hydration)?

## Aanpak

Van weinig naar veel werk:

1. **Alleen theorie**: pipeline en VDOM uitleggen met diagrammen (#1, #8, #10).
2. **Theorie en live demo's**: een losse HTML-pagina met thrashing, paint flashing en een passive listener (#3, #4, #5).
3. **Theorie, demo's en een audit van een eigen project**: een performance-trace van een echte flow, met CLS, long tasks en React Profiler (#6, #9).

Voorstel: optie 3, beperkt tot #1, #3, #4, #6, #8 en #9. Die volgen één lijn ("hoe worden boxes pixels, en wat maakt dat traag"), en de audit geeft echte cijfers in plaats van voorbeelden uit een boek. Hydration (#10) kort houden als het project geen SSR doet.

## Bronnen

- [Rendering performance](https://web.dev/articles/rendering-performance) (web.dev)
- [Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) (web.dev)
- [Stick to compositor-only properties and manage layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) (web.dev)
- [Cumulative Layout Shift](https://web.dev/articles/cls) (web.dev)
- [content-visibility](https://web.dev/articles/content-visibility) (web.dev)
- [What forces layout / reflow](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) (Paul Irish)
- [Inside look at modern web browser, part 3](https://developer.chrome.com/blog/inside-browser-part3) (Chrome)
- [RenderingNG](https://developer.chrome.com/docs/chromium/renderingng) (Chromium)
- [Render and Commit](https://react.dev/learn/render-and-commit) (React)
- [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) (React)
- [Virtual DOM is pure overhead](https://svelte.dev/blog/virtual-dom-is-pure-overhead) (Svelte)
