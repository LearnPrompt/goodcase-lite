# Contributing to GoodCase.ai Lite

Thanks for helping. This repository is the open-source site layer of
[goodcase.ai](https://goodcase.ai). If what you want to contribute is a
**case** (a prompt + result + creator), do not open a PR here: submit it at
<https://goodcase.ai/submit>. The production data supply, review pipeline and
automated collection are internal systems and live outside this repository.

## Local setup

The short version is in [README.md](./README.md) (中文) /
[README_EN.md](./README_EN.md) (English):

```bash
git clone https://github.com/LearnPrompt/goodcase-lite.git
cd goodcase-lite
npm ci
npm run dev
```

No environment variables are required. Without them the site falls back to
the built-in sample cases, which is enough for most UI work. If you want to
point the site at your own data, copy `.env.example` to `.env.local` and fill
in your own Supabase project; never point a local checkout at production.

## Generated / synced files — do not edit

The following are mirrored from a private repository by an automated sync
job. Any change made to them in a PR will be overwritten on the next sync and
the PR will be closed:

- `skills/generated/`
- `public/skill-packages/`
- `src/generated/installable-skills.json`

If something in these paths looks wrong, open an Issue describing the problem
instead of editing the files directly.

## Branches and pull requests

- Branch from `main`. Names follow `<type>/<short-topic>`:
  `feat/case-filter-tag`, `fix/header-320-overflow`, `chore/readme-typo`.
- Commit messages use the same `type(scope): summary` shape. Chinese or
  English is fine; keep the summary line short.
- One topic per PR. Describe what changed and how you verified it.
- Before opening a PR, both must pass locally:

  ```bash
  npm run lint
  npm run build
  ```

## Content and licensing

Code is MIT. The sample cases, prompts and media bundled with this
repository belong to their original creators and are not covered by MIT;
curation and metadata are CC BY 4.0. See the License section of the README.
If you are a creator and want a case removed or corrected, use
<https://goodcase.ai/connect#feedback> or open an Issue.
