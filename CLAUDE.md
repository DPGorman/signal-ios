# Signal iOS — Mobile Application

## Overview
Signal iOS is the mobile companion to the Signal web app. A creative idea capture and orchestration system for screenwriters and creative professionals. Built with Expo/React Native + TypeScript.

**API Backend:** signal-navy-five.vercel.app (shared with web app)
**Database:** Supabase PostgreSQL with RLS
**Status:** Phase 1 complete — core screens implemented, active bug fixes

## Tech Stack
- **Framework:** Expo 54 + React Native 0.81
- **Routing:** expo-router 6 (file-based, like Next.js)
- **State:** Zustand 4.5
- **Database:** Supabase with AsyncStorage persistence
- **Language:** TypeScript (strict mode)
- **AI:** Claude via Vercel proxy at /api/ai and /api/pulse

## Project Structure
- `app/_layout.tsx` — Root layout, startup data loading orchestration
- `app/(tabs)/` — Tab-based navigation:
  - `index.tsx` — Home/dashboard
  - `capture.tsx` — Idea capture with AI analysis
  - `library/index.tsx` — Searchable idea library
  - `library/[id].tsx` — Idea detail (analysis, actions, connections)
  - `canon/index.tsx` — Reference documents
  - `studio/index.tsx` — Studio hub with tool cards
  - `studio/actions.tsx` — AI-generated deliverables
  - `studio/tasks.tsx` — Task management
  - `studio/projects.tsx` — Project switcher
  - `studio/pulse.tsx` — AI creative nudge
  - `studio/insight.tsx` — Dramaturgical analysis
  - `studio/invitation.tsx` — Daily creative prompts
- `stores/` — 6 Zustand stores (useUser, useProjects, useIdeas, useDeliverables, useCanon, useConnections)
- `lib/constants.ts` — Design tokens, color palette, categories
- `lib/supabase.ts` — Supabase client with AsyncStorage
- `lib/ai.ts` — AI proxy fetch function

## Key Patterns
- Zustand stores for all state management (no Context API)
- Each store fetches its own data from Supabase
- Startup load order: user -> projects -> [ideas, deliverables, canon, connections]
- Dark theme throughout (bg: #0D0D0F)
- Haptic feedback on interactions (expo-haptics)
- @ alias for root imports (tsconfig paths)

## 8 Idea Categories
premise, character, scene, dialogue, arc, production, research, business

## Development
```bash
npm start      # Expo dev server
npm run ios    # Build/run on iOS simulator
```

## Unimplemented Features
- Connections mind map visualization
- Compose (freeform writing)
- Audit (library cleanup)
- Canon document detail screen (canon/[id].tsx)
- Push notifications (expo-notifications imported, not wired)
- Text-to-speech (expo-speech imported, not used)

## Known Issues / Refinement Areas
- Connections table has no user_id column — scoping via idea joins
- Recent bug fixes for project scoping and data leakage
- No error boundaries or fallback UI
- No loading skeleton states
- No offline mode handling
- No analytics or crash reporting
- No test suite
- Large lists (100+ ideas) need virtualization
