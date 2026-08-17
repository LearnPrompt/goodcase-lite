# GoodCase.ai Lite

English | [中文](README.md)

[![Site](https://img.shields.io/badge/site-goodcase.ai-orange)](https://goodcase.ai)

The open-source site of [goodcase.ai](https://goodcase.ai): clone and run the same UI, with a set of real sample cases (full prompts and media) built in.

```bash
git clone https://github.com/LearnPrompt/goodcase-lite.git
cd goodcase-lite
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables required — without a database the site automatically falls back to built-in sample data, and the homepage, case library, case details, and creator pages all work.

## What is this

GoodCase.ai tracks AI cases in circulation and brings the work, creator, method, original source, and retest evidence back onto one page. This repository is its site layer:

- The complete front-end UI: homepage, case library (filter/search), case details (prompts, stability score, cost band), creator pages, daily digest
- Built-in sample data: real cases with media, works out of the box after forking
- The public Agent API implementation (`/api/public/cases`)

The production data supply, review console, and automated collection are internal systems and are not part of this repository. To use the full live dataset, just call the public API — no API key needed:

```bash
curl -s "https://goodcase.ai/api/public/cases?take=3&locale=en"
```

See [goodcase.ai/connect](https://goodcase.ai/connect) for integration docs.

## Bring your own data (optional)

Copy `.env.example` to `.env.local` and fill in your own Supabase project URL and keys; the site switches to your database. Derive the table shape from the `/api/public` routes and the row types in `src/lib/cases.ts`.

## Deploy

A standard Next.js app — one-click deploy on Vercel or any Node.js-capable platform.

## License

MIT
