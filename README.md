# RANT v1 alpha

Personal Visual Taste Engine experiment.

## What is real in this alpha

- Image upload and local preview.
- Browser-side image measurement using Canvas pixels.
- Heuristic visual report for edge density, micro-edge activity, surface noise proxy, highlights, warm pixels, dark-region ratio, and saturation.
- Accept / Reject events.
- Keyword-based feedback attribution.
- Per-attribute taste weights.
- Rejection signal based only on observed taste evidence.
- Local persistence with `localStorage`.

## What is NOT implemented

- No trained personal ML model.
- No multimodal AI observer/API.
- No cloud database or user account.
- No claim that heuristic metrics are scientific measurements of art style.
- No cross-device memory.

This is intentionally an experimental baseline. The first question is whether structured visual attributes + attributed user feedback can predict a user's rejection patterns better over time.

## Run

```bash
npm install
npm run dev
```

## Deploy

Import the repository into Vercel after placing these files in the repo. No environment variables are required for this alpha.
