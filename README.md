# Portfolio

A portfolio that builds itself from GitHub. Point it at a username and it renders a home page (hero, pinned projects, a searchable list of every repo) and a detail page per project, all in a loud neobrutalist style: thick borders, hard shadows, flat colour.

Think of it as a shop window that restocks itself: push a repo, and within the hour it shows up.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it. No keys needed to look around.

## Make it yours

Copy `.env.example` to `.env.local` and set:

- `GITHUB_USER` to show someone else's repos (defaults to `Sarvesh246`).
- `GITHUB_TOKEN` is worth adding. GitHub allows only 60 anonymous requests an hour, and a token unlocks real commit counts.
- `NEXT_PUBLIC_CONTACT_EMAIL` to change the address behind the "Email me" button (defaults to sarveshvjagtap@gmail.com).

## Your own thumbnails

Put an image at `public/thumbnails/<repo-name>.png` (`.jpg`, `.webp`, `.gif` and `.avif` work too, 16:9 looks best) and push. It replaces that project's screenshot everywhere. There's no upload form on purpose: only someone who can push to the repo can change it, so there's nothing to secure and no storage to pay for.

## Refreshing a project (owner only)

The site re-scrapes GitHub on its own about once an hour. If you've just pushed a change and don't want to wait, visit `/admin`, sign in, and every project page gets a **Refresh this project** button that only you see. It re-scrapes GitHub immediately and asks Microlink to retake the screenshot.

To switch it on, set `ADMIN_PASSWORD` to something long (in `.env.local`, and in Vercel's env settings). Unset means no way in. The button works because the server checks a signed, HttpOnly cookie that only the password can create.

## Good to know

- **Curated vs live.** `src/lib/seed.ts` holds hand-written copy (descriptions, stack, README summaries) for the repos worth showing off. Live GitHub data fills in everything else and wins for anything that changes: language, last push, homepage, topics.
- **Pinned projects** come from the `pinned` flags in the seed file, because GitHub's REST API has no "pinned repos" endpoint.
- **If GitHub is unreachable or rate-limited**, the site falls back to the seed data and retries within ten minutes, rather than breaking.
- **Screenshots** come from Microlink's free tier, falling back to GitHub's social card. If cards show the social image instead of a screenshot, you've probably hit Microlink's daily limit.
- Data is cached for an hour (`"use cache"` in `src/lib/github.ts`). This project is on Next.js 16 with Cache Components, so route-level `revalidate` exports won't work; change `cacheLife` instead.

## Where things live

- `src/app` has the two routes: `/` and `/projects/[slug]`.
- `src/components` holds the home view, the motion helpers (`fx.tsx`: scroll reveal, count-up, text scramble), and the shared bits.
- `src/lib/github.ts` fetches and merges data, `src/lib/seed.ts` is the curated fallback.

Animations respect `prefers-reduced-motion`.
