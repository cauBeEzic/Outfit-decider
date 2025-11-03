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

## Appendix – W2 Onboarding Walkthrough Plan

- **Goal**: Introduce first-time users to the core wardrobe workflow (upload photo → add garments → generate → save) with contextual tooltips that appear only until onboarding completes.
- **Triggering logic**:
  - Gate the tour behind `onboardingCompleted` from `useAuth()`.
  - Auto-launch the first step when a signed-in user with incomplete onboarding lands on `WardrobeScreen`.
  - Persist completion with `markOnboardingComplete()` once the final step is acknowledged.
- **Tour behavior**:
  - Render a single `<OnboardingCoachmark>` overlay component that reads from `ONBOARDING_STEPS` (`src/utils/constants.ts:20`) and positions itself relative to `targetElement`.
  - Provide “Next” / “Back” actions, with “Skip tour” to immediately mark complete.
  - Use a focus trap or `aria-modal="true"` so screen readers describe the tooltip content; add `aria-describedby` pointing at the step copy.
  - When the referenced DOM node is absent (e.g., no saved outfits yet), skip that step gracefully and continue so the tour never blocks progress.
- **State shape**:
  ```ts
  type OnboardingState = {
    activeStepIndex: number;
    dismissed: boolean;
  };
  ```
  - Maintain locally in `WardrobeScreen` (React state) or via a dedicated hook (e.g., `useOnboardingCoachmarks`).
  - Store the current step index in `sessionStorage` to allow refresh continuity without persisting it cross-device.
- **Integration points**:
  1. `WardrobeScreen.tsx`: inject `OnboardingCoachmark` near the root so it can overlay the full screen; pass show/hide state.
  2. `FileMenu.tsx`, action buttons, and navigation controls: ensure they expose stable class names that match `ONBOARDING_STEPS.targetElement` (e.g., add `.generate-button` to the generate wrapper, `.save-rating-button` near save UI).
  3. `AuthContext.tsx`: after `markOnboardingComplete()` resolves, update local state so the tour never reappears.
- **Edge cases & fallback copy**:
  - When the user has not uploaded a photo, the “Generate” step should explain the prerequisite and keep the CTA disabled.
  - If the tour is skipped, show a lightweight reminder banner (“Need a refresher? Restart tour”) with a button that resets onboarding metadata.
- **Testing checklist**:
  - Tour mounts and unmounts cleanly without leaving scroll locks.
  - Keyboard navigation cycles within the coachmark actions.
  - `markOnboardingComplete()` called exactly once per completion/skipping path.
  - Sessions that complete onboarding never see the tour again unless manually reset.
