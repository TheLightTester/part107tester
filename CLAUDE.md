# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server (http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # serve dist/ at http://localhost:4173
npm run test         # Vitest watch mode
npm run test:run     # Vitest one-shot (CI)
```

Run a single test file:
```bash
npm run test:run -- src/data/lessons.test.js
npm run test:run -- src/components/Home
```

## Architecture

Fully static React + Vite SPA — no backend, no routing library, no CSS framework. All styles are inline JS objects exported from `src/styles.js`.

**Screen navigation** is a single `screen` state string in `App.jsx`: `"home" | "lesson" | "quiz" | "results"`. `App.jsx` owns all state and passes handlers down as props — there is no context or global store.

**Data pipeline** (`src/data/`):
- `questions.js` — combines two JSON banks using `?raw` imports + comment-stripping (the JSON files contain JS `//` comments that break standard JSON parse). Exports `QUESTIONS` — 126 questions.
- `lessons.js` — merges three lesson JSON files, applies 6 link patches from `part107_gap_closure.json`, appends 4 new lessons, and normalizes all snake_case fields to camelCase (`key_facts→keyFacts`, `related_question_ids→relatedQuestions`, `exam_importance→importance`, etc.). Exports `LESSONS` — 20 lessons.
- `modules.js` — static `MODULES` array (5 modules with colors, weights).

**Progress persistence** (`src/hooks/useProgress.js`): `useProgress()` returns `{ progress, markLessonRead, saveScore }`. `progress.lessonsRead` is a `Set` (serialized as array under `localStorage` key `part107_progress`). `progress.quizScores` is keyed by module ID, lesson ID, or `"exam"`.

**Quiz modes**: `quizMode` in `App.jsx` is `"module" | "lesson" | "exam"`. The 60-question final exam draws from all modules at ACS proportions `{ I:12, II:12, III:9, IV:6, V:21 }` via `startFinalExam()`. `QuizEngine` shows a HH:MM:SS countdown (7200s) only in exam mode, auto-submitting at 0.

**Source data** lives in `reference files/` (not `src/`) and must not be modified — they are the canonical content. The processed JS exports in `src/data/` are the working data layer.

## Key Data Schemas

Question fields: `id, module, topic, difficulty, question, options {A,B,C}, correct, explanation, regulation`

Lesson fields (camelCase after normalization): `id, module, title, importance, intro, sections[], summaryTable[], commonMistakes[], relatedQuestions[]`

Section fields: `heading, body, keyFacts[], memoryAid`

## Design System

Dark aviation aesthetic — all colors are hardcoded constants, no CSS variables:
- Background `#0d1117`, cards `#111827`, borders `#1e2532`
- Module colors: I=`#E8A838`, II=`#4A9EE8`, III=`#5DB87A`, IV=`#B87AE8`, V=`#E86B4A`
- Pass threshold: 70%

Function-based styles in `styles.js` (e.g. `moduleCard(color)`, `quizOption(state)`, `lessonRow(done)`) accept runtime values and return style objects.
