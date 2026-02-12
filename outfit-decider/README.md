# Outfit Decider - Progress Tracker

This page tracks implementation progress for the app in `outfit-decider/src` and `outfit-decider/backend`.

Last updated: February 12, 2026

## 1. Progress Snapshot

- Product backlog: 2 done, 1 in progress, 4 not started.
- Bug/polish queue: 1 done, 4 open.
- Technical debt/tooling: 4 open.
- Current major gaps: no deployment, no automated tests, no CI pipeline.

## 2. Product Backlog

| Item | Description | Status | Priority | Estimate | Notes |
|------|-------------|--------|----------|----------|-------|
| W1 | Implement Wardrobe `Describe` flow using `useNanoBanana.getSuggestion` and show recommendation in UI. | Done | High | 5 pts | Implemented via `DescribeModal`, prompt submit, suggestion rendering, and apply flow in `WardrobeScreen`. |
| W2 | Add onboarding walkthrough using `ONBOARDING_STEPS` and persist completion with `markOnboardingComplete`. | Done | High | 5 pts | `OnboardingContext` + `OnboardingOverlay` implemented and wired at app root. |
| W3 | Create stronger outfit prompt builder UI (vibe input + tag picker controls). | In Progress | Medium | 3 pts | Current modal has free-text prompt + include-selected toggles; no dedicated tag picker UI yet. |
| U1 | Allow editing tags on existing clothing items from Storage (reuse `TagInput`). | Not Started | Medium | 3 pts | Storage supports filtering and delete only; no tag edit action yet. |
| U2 | Support additional clothing categories (e.g., shoes, outerwear). | Not Started | Medium | 8 pts | Data model and routes currently centered on `top` and `bottom`. |
| P1 | Add pagination or lazy loading for `StorageScreen`. | Not Started | Low | 2 pts | Items currently load in one query and render all at once. |
| P2 | Add offline-friendly cache layer (IndexedDB/local persistence). | Not Started | Low | 5 pts | Only session-based browser cache is used for generation workflow keys. |

## 3. Bug Fix & Polish Queue

| Bug | Notes | Status | Priority | Estimate |
|-----|-------|--------|----------|----------|
| B1 | Replace mojibake icons in `FilterTags`, `OutfitCard`, and `TagInput`. | Done | High | 1 pt |
| B2 | Deduplicate `SavedOutfitWithItems` type in `src/types/index.ts` (declared twice). | Open | Medium | 1 pt |
| B3 | Make `ClothingCard` delete path handling robust for nested/query URLs. | Open | Medium | 2 pts |
| B4 | Guard `StorageScreen` tag filtering for missing/undefined tag arrays. | Open | Low | 1 pt |
| B5 | Improve user-facing error handling (replace many `console.error`/`alert` paths with consistent UI feedback). | Open | Low | 2 pts |

## 4. Technical Debt & Tooling

| Item | Status | Estimate | Notes |
|------|--------|----------|-------|
| State management audit (Context/hooks vs Zustand/Redux) | Open | 3 pts | Current approach works but cross-screen async state is growing. |
| Testing setup (Vitest + React Testing Library + backend route tests) | Open | 5 pts | No test files are present in the repo yet. |
| Accessibility pass (keyboard/focus/labels) | Open | 2 pts | Some ARIA work exists, but no formal audit coverage yet. |
| CI setup (lint + typecheck + build) | Open | 3 pts | No GitHub Actions workflow checked in. |

## 5. Completed Since Previous Tracker

- Added working Describe suggestion flow in Wardrobe (modal input, request, suggestion preview, apply selection).
- Added full onboarding walkthrough system with step highlighting and persisted completion.
- Added/kept cross-screen generate state handling using `sessionStorage` (`generationPending`, `generationError`, generated image metadata).

## 6. New Missing Items to Track

- Deployment target and environment documentation for a hosted demo.
- Node version alignment documentation (`Vite 7` requires Node `>=20.19`, Node 22 recommended).
- Optional: create `.nvmrc` to reduce local environment mismatch.

## 7. Nice-to-Have Ideas

- Outfit history timeline with quick revert.
- Share/export generated outfit.
- Wardrobe analytics (most-used tags, favorite ratings, seasonal suggestions).

## 8. Next Suggested Sprint

1. Fix B2 + B3 + B4 (small, high-confidence cleanup).
2. Ship U1 (tag editing in Storage) to improve daily usability.
3. Add minimal test baseline (Auth flow smoke test + `useNanoBanana` hook tests).
4. Add CI for lint/typecheck/build.
