# Interview Room

A private, AI-assisted interview practice app for Apple Wallet, Payments & Commerce preparation. It includes 20 spoken-answer prompts, transcript-based coaching, confidence tracking, and local-only practice history.

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

Run the full Vercel environment locally with `vercel dev`, or run the client alone with `npm run dev`. The client-only server cannot execute `/api` routes.

## Vercel deployment

Import the repository as a Vite project and add all three environment variables in Vercel project settings. Do not use a `VITE_` prefix for secrets. Audio is processed in memory and discarded after transcription; transcripts and feedback are saved only in the browser's local storage.

## Verification

```sh
npm run test:unit -- --run
npm run build
```
