# Outfit Decider

## 1) What it is
Outfit Decider is a full-stack web app that helps users manage a small digital wardrobe and preview outfit combinations with AI-generated try-on images.  
It combines a React frontend, Supabase (auth + database + storage), and an Express proxy that calls Google Gemini models.

## 2) Demo
Working on deploying.

For now, run it locally using the commands in section 7.

Current gaps:
- No public hosted demo yet.
- No automated tests in the repository yet (good next step: add Vitest/React Testing Library for frontend flows and API tests for `backend/server.js`).

## 3) Features
- Email/password auth with Supabase and protected routes (`/`, `/upload/:type`, `/storage`, `/saved-outfits`, `/user-photo`).
- Onboarding coachmark overlay (multi-step, skip/finish, persisted via user metadata + `sessionStorage`).
- Upload top or bottom images with file validation (JPEG/PNG, size limit) and client-side compression before storage.
- Tag clothing items during upload, then browse all items in Storage with multi-tag filtering.
- Delete clothing items from both Supabase storage and `clothing_items` table.
- Wardrobe carousel for tops/bottoms with previous/next and random selection.
- Persist last viewed top/bottom selection per user in `user_preferences`.
- Upload, replace, and delete user photo on the User Photo screen.
- AI virtual try-on generation via backend `/api/nano-banana/generate`; generated result is saved back as current user photo.
- "Describe outfit" modal that calls `/api/nano-banana/suggest` and applies suggested top/bottom IDs to the current selection.
- Save generated looks with optional 1-5 star rating into `saved_outfits` and `generated_photos`.
- Saved outfits gallery with photo navigation and delete action.
- XP-style UI theme (`xp.css`) across screens and modals.

## 4) Why I built this
I wanted to build a practical full-stack project that mixes CRUD workflows with an AI-assisted user flow.  
Fashion/wardrobe management was a good domain because it needs real app behavior: auth, storage, relational data, async state, and UX decisions around image handling.

## 5) What I learned
- How to coordinate React route transitions with long-running async work using `sessionStorage` flags and polling.
- How to integrate Supabase auth, storage buckets, and relational tables in one user flow.
- How to handle generated images in multiple formats (public URL and data URL) and persist them safely.
- How to build a backend proxy for Gemini image/text generation instead of exposing model calls directly in the client.
- How to implement guided onboarding with dynamic DOM targeting and portal-based overlays.

## 6) Tech stack
- React 19 + TypeScript: component-based UI with typed app/data contracts.
- Vite 7: fast frontend build and dev server.
- React Router: route-based screen architecture and auth-guarded pages.
- Supabase (`@supabase/supabase-js`): authentication, Postgres tables, and object storage.
- Express + CORS + dotenv: lightweight backend API proxy with environment-based config.
- Google Generative AI SDK (`@google/generative-ai`): model calls for try-on image generation and outfit suggestions.
- `browser-image-compression`: client-side image size reduction before upload.
- `xp.css` + custom CSS: retro Windows XP visual style.

## 7) How to run locally
```bash
# Prereq: Node.js 22 recommended (Vite 7 requires Node >= 20.19)

# 1) Frontend env file (create/edit)
# file: outfit-decider/.env.local
# required:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_NANO_BANANA_BASE_URL=http://localhost:3000/api/nano-banana
# optional:
# VITE_NANO_BANANA_API_KEY=...

# 2) Backend env file (create/edit)
# file: outfit-decider/backend/.env
# required:
# GEMINI_API_KEY=...
# optional:
# PORT=3000
# GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
# GEMINI_TEXT_MODEL=gemini-2.5-flash

# 3) Install dependencies
cd outfit-decider
npm install
cd backend
npm install

# 4) Start backend (terminal A)
npm run start

# 5) Start frontend (terminal B)
cd ..
npm run dev -- --host 127.0.0.1 --port 5173
```

## 8) Project structure
```text
.
├─ README.md
└─ outfit-decider/
   ├─ backend/
   │  ├─ server.js                # Express proxy for Gemini endpoints
   │  └─ package.json
   ├─ src/
   │  ├─ components/              # UI components (wardrobe, storage, shared, onboarding)
   │  ├─ contexts/                # Auth + onboarding providers
   │  ├─ hooks/                   # useNanoBanana hook
   │  ├─ lib/                     # Supabase client, API helpers, image utilities
   │  ├─ pages/                   # Auth, Wardrobe, Upload, Storage, User Photo, Saved Outfits
   │  ├─ types/                   # TypeScript interfaces/models
   │  └─ utils/                   # Constants
   ├─ package.json
   └─ vite.config.ts
```
