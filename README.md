# Interview Room

A private, AI-assisted interview practice app for rehearsing spoken answers, reviewing feedback, and tracking progress. Practice history stays in your browser.

## Local setup

Use Node `^22.18.0` or `>=24.12.0`, then install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env.local` and provide:

- `OPENAI_API_KEY`: optional; enables transcription and AI coaching. Without it, the app
  automatically uses timed self-review with expected beats, sample responses, and confidence
  tracking.
- `APP_PASSWORD`: the password used to unlock the deployed app.
- `SESSION_SECRET`: a random value of at least 24 characters used to sign session cookies.

Run the complete app locally with `npm run dev`. Vite mounts the same `/api/session` and `/api/evaluate` handlers used by Vercel, and prints the configured room password in its startup output. If `APP_PASSWORD` is omitted locally, the temporary development password is `practice-room`. Production builds do not print or use this fallback.

## Vercel deployment

Import the repository as a Vite project and add all three environment variables in Vercel project settings. Do not use a `VITE_` prefix for secrets. Audio is processed in memory and discarded after transcription; transcripts and feedback are saved only in the browser's local storage.

## Verification

```sh
npm run test:unit -- --run
npm run build
```
