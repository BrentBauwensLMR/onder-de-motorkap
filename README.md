# Onder de motorkap

**Layout, Paint & Virtual DOM** is een interactieve Nederlandstalige presentatie van tien minuten. Negen dia’s volgen de weg van HTML en CSS naar pixels en laten zien hoe DOM-updates, React reconciliation en hydration in dat proces passen.

## Lokaal draaien

Gebruik Node.js 24 (dezelfde versie als CI) en npm.

```sh
npm ci
npm run dev
```

Open de URL die Vite toont. Voeg bijvoorbeeld `#/slide/4` toe om het Box Model rechtstreeks te openen.

| Toets | Actie |
| --- | --- |
| → of spatie | Volgende dia |
| ← | Vorige dia |
| Home / End | Eerste / laatste dia |
| F / Escape | Volledig scherm wisselen / verlaten |
| N | Sprekersnotities wisselen |
| ? | Sneltoetsen openen |

Open **Notities** voor een script, spreektijd, demo-aanwijzingen, overgang en timer. **Start presentatie** start de timer en opent de tweede dia. Start de timer in de notities als je de opening wilt meetellen. Met **Reset demo** herstel je de huidige dia. De renderingkosten en hydration-tijdlijn zijn conceptuele simulaties.

## Controleren

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

## Publiceren op GitHub Pages

1. Kies in de GitHub-repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push de wijzigingen naar `main`. De workflow controleert lint, types en tests, bouwt de site en publiceert `dist`.
3. Open de URL die de workflow in de deploymentomgeving `github-pages` toont. Na een wijziging aan de Pages-instelling kun je de workflow ook starten via **Actions → Deploy to GitHub Pages → Run workflow**.

Vite gebruikt een relatieve base (`./`), zodat de build werkt onder een repositorypad. De hashroute blijft lokaal in de browser, waardoor gedeelde links en refreshes op elke dia werken.

## Onderzoeksnotities

Naast de presentatie staan hier de notities bij ons onderzoek. Elk onderwerp heeft een eigen map met een `README.md`.

| Onderwerp | Kernvraag |
|---|---|
| [Layout, Paint & Virtual DOM](layout-paint-virtual-dom/) | Hoe worden boxes pixels, en waarom vermijden frameworks het aanraken van de DOM? |

In die map staan ook twee losse HTML-pagina's (open ze rechtstreeks in de browser, ze zitten niet in de Vite-build):

- [`slow-motion/`](layout-paint-virtual-dom/slow-motion/): de rendering pipeline stap per stap, met wat er na elke stap in de browser bestaat.
- [`slides/`](layout-paint-virtual-dom/slides/): korte reveal.js-slides voor het pipeline-deel: intro, link naar de slow-motion-app en wat je moet onthouden.

## Bronnen

- [Rendering performance en de pixel pipeline](https://web.dev/articles/rendering-performance)
- [Layout en layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- [React Render and Commit](https://react.dev/learn/render-and-commit)
- [React batching en de updatequeue](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)
