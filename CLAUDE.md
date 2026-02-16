# Spacetime Civilization Simulator

## Project Overview
Interactive spacetime visualization tool. X-axis = time (Big Bang → present → simulated future), Y-axis = world regions with era-appropriate names. Events plotted on this 2D grid. Post-2026 is "Cybernetics Simulation" mode with AI-powered projections.

## Tech Stack
- **Framework:** Next.js 16 + TypeScript + Tailwind v4
- **Visualization:** D3.js (SVG rendering, D3-geo for maps)
- **State:** Zustand (viewport at 60fps, selection, filters)
- **Search:** Fuse.js (fuzzy search across events)
- **AI:** Claude API (Anthropic) for simulation chat
- **Storage:** localStorage for chat history, cookies for settings

## Architecture Rules
1. **YBP coordinates** - All time stored as Years Before Present (2026). Negative = past, positive = future. Never use Date objects for historical time.
2. **D3 renders SVG, React manages state** - D3 owns `<g>` contents via `selectAll().data().join()`. React owns lifecycle + HTML overlays. Zustand bridges them.
3. **Static TS data files** - Event/region data in `src/data/`. Type-checked at build time.
4. **API key security** - Server-side API key in `.env` (ANTHROPIC_API_KEY). Users can set their own key in the UI (stored in localStorage, sent via header). Server key is fallback.
5. **No database** - All persistent state is client-side (localStorage/cookies). Server is stateless.

## Key Directories
```
src/
  app/              # Next.js app router pages + API routes
  components/       # React components
    layout/         # AppShell, Header, TabNav
    timeline/       # TimelineCanvas, Controls, Minimap, EventDetail
    chat/           # ChatPanel, ChatSettings, ChatHistory
    shared/         # Tooltip, FilterPanel, SearchBar, StubPage
    worldmap/       # D3-geo world map
    demographics/   # Population charts
    techtree/       # Tech dependency DAG
    chronicle/      # Vertical event feed
    economy/        # Economic charts
  lib/              # Core logic
    time/           # YBP constants, D3 scales, formatting
    events/         # Event types, dataset queries
    regions/        # Region types, era-name mapping
    store.ts        # Zustand global store
  data/             # Static data
    events/         # 7 event files (~175 events)
    regions/        # Region mappings with era names
    demographics/   # Population data
    techtree/       # Technology dependency data
    economy/        # Economic data
```

## Conventions
- All components are `'use client'` unless they need server-side rendering
- Dark theme: gray-950 background, indigo accents, gray-700 borders
- Event significance 1-5 controls visibility at different zoom levels
- 10 zoom levels from COSMIC (13.8B years) to DETAILED (individual years)
- Simulation boundary at year 2026 - future events have dotted borders and reduced opacity
- Category colors defined in `CATEGORY_COLORS` - always use these, never hardcode event colors

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build (must pass with zero type errors)
- `npm run lint` - ESLint

## Environment Variables
- `ANTHROPIC_API_KEY` - Server-side Claude API key (required for chat simulation)
- Users can override with their own key via the Settings panel (stored in localStorage)
