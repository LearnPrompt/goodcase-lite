# Security Policy

## Reporting a vulnerability

Please do not open a public Issue for security problems.

Use one of these private channels:

1. **GitHub private vulnerability reporting** on this repository
   (Security tab → "Report a vulnerability"). This is the preferred route:
   the report is visible only to maintainers until a fix is out.
2. **The feedback form at <https://goodcase.ai/connect#feedback>.** Pick the
   "bug" type, start the message with `SECURITY`, and leave a contact so we
   can reply. Feedback goes to a private operator inbox, not to any public
   page.

Include what you found, how to reproduce it, and what impact you believe it
has. We will acknowledge within a few days and keep you posted until it is
resolved. Please give us reasonable time to fix before disclosing publicly.

## Scope

- The web app and API routes in this repository (`src/app/**`), as deployed
  at goodcase.ai.
- Anything else in this repository that runs client- or server-side code.

Out of scope: third-party sites the cases link to, and content questions
(wrong attribution, takedown requests). For those, use the same feedback form
with the "content" type, or open a regular Issue.

## Secrets

Never commit real credentials. `.env*` is gitignored except `.env.example`;
every variable there is either empty or a non-secret placeholder. If you
believe a secret has leaked through this repository, report it through the
channels above so it can be rotated.
