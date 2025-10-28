# Outfit Decider – Work Log & Backlog

This document tracks the outstanding work for the Outfit Decider frontend (`src/`) so it’s easy to see what’s left and what should be tackled next.

## 1. Product Backlog

| Item | Description | Priority | Estimate |
|------|-------------|----------|----------|
| W1 | Implement the Wardrobe “Describe” flow by calling `useNanoBanana.getSuggestion` and showing the recommendation in the UI (modal or inline panel). | High | 5 pts |
| W2 | Add onboarding walkthrough using `ONBOARDING_STEPS` (tooltip overlay that guides the first session). Persist completion with `markOnboardingComplete`. | High | 5 pts |
| W3 | Create outfit suggestion prompt builder UI (user vibe input form + tag picker) to feed into the Describe API. | Medium | 3 pts |
| U1 | Allow editing tags on existing clothing items from Storage (reuse `TagInput`). | Medium | 3 pts |
| U2 | Support additional clothing categories (e.g., shoes, outerwear) with flexible layout and filtering. Requires schema updates. | Medium | 8 pts |
| P1 | Add pagination or lazy loading for `StorageScreen` when wardrobe grows large. | Low | 2 pts |
| P2 | Add offline-friendly cache layer (IndexedDB or Supabase caching) for frequently accessed images. | Low | 5 pts |

_Estimates use Fibonacci-style points. Priorities are relative; adjust as plans change._

## 2. Bug Fix & Polish Queue

| Bug | Notes | Priority | Estimate |
|-----|-------|----------|----------|
| B1 | Replace mojibake icons (`�o"`, `�~.`, etc.) in `FilterTags`, `OutfitCard`, and `TagInput` with proper SVGs or characters. | High | 1 pt |
| B2 | Deduplicate `SavedOutfitWithItems` type in `src/types/index.ts` (currently declared twice). | Medium | 1 pt |
| B3 | Ensure `ClothingCard` delete logic removes the correct storage path when image URLs contain nested folders or query params. Consider storing the relative path explicitly. | Medium | 2 pts |
| B4 | Guard `StorageScreen` filtering against items without tags to avoid runtime errors on undefined arrays. | Low | 1 pt |
| B5 | Add error handling/UI feedback when Supabase queries fail (e.g., show toast instead of silent `console.error`). | Low | 2 pts |

## 3. Technical Debt & Tooling

- **State management audit (3 pts):** Evaluate whether context + hooks cover all needs or if Zustand/Redux would simplify cross-screen state (especially for outfit recommendations).
- **Testing (5 pts):** Set up component/unit tests (Vitest + React Testing Library) for hooks (`useNanoBanana`) and critical flows (upload, generate, save outfit).
- **Accessibility pass (2 pts):** Verify keyboard navigation, aria labels, and focus management on modals/menus (e.g., `FileMenu`, `RatingModal`).
- **CI setup (3 pts):** Add GitHub Actions for lint + type check + build so regressions are caught via PRs.

## 4. Nice-to-Have Ideas

- Outfit history timeline that shows generated looks chronologically with quick revert.
- Share/export functionality (download generated outfit, copy link).
- Smart wardrobe insights (most-used tags, favorite ratings, seasonal suggestions).

---

_Last updated: <fill in when you pick this up next>_
