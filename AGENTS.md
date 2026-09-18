# Repository Guidelines

## Project Structure & Module Organization

Application code lives in `src/`. Use `src/views/` for route-level components, `src/components/` for reusable UI, `src/stores/` for Pinia stores, and `src/router/` for routes. Shared styles and bundled images belong in `src/assets/`; static files belong in `public/`. Unit tests are colocated under `src/**/__tests__/`, while browser tests and support code live in `cypress/`.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies. Use Node `^22.18.0` or `>=24.12.0`.
- `npm run dev` starts Vite with hot reload.
- `npm run build` runs `vue-tsc` and creates the production bundle in `dist/`.
- `npm run preview` serves the production build.
- `npm run test:unit` runs Vitest in watch mode; add `-- --run` for a single non-watch run.
- `npm run test:e2e:dev` opens Cypress against a development server.
- `npm run test:e2e` runs Cypress headlessly against `npm run preview`; build first.
- `npm run lint` applies Oxlint and ESLint fixes. `npm run format` formats `src/` with Prettier.

## Coding Style & Naming Conventions

Use TypeScript and Vue Single-File Components with `<script setup lang="ts">`. Follow the repository settings: two-space indentation, LF endings, single quotes, no semicolons, and a 100-character line width. Name Vue components in PascalCase (`WelcomeItem.vue`), stores and utilities in camelCase, and route views with a `View` suffix. Prefer the `@/` alias for imports from `src/`. Run lint and formatting before submitting changes.

## Testing Guidelines

Use Vitest, jsdom, and Vue Test Utils for component tests named `*.spec.ts` inside `__tests__`. Use Cypress specs named `*.cy.ts` under `cypress/e2e/` for user-visible flows. Add or update tests for changed behavior; no numeric coverage threshold is currently enforced. Before opening a pull request, run `npm run test:unit -- --run`, `npm run build`, and relevant end-to-end tests.

## Commit & Pull Request Guidelines

The limited history uses short, plain-language subjects without Conventional Commit prefixes. Keep subjects concise and imperative, and separate unrelated changes. Pull requests should explain the motivation, list verification commands, link relevant issues, and include screenshots or recordings for UI changes. Do not commit generated output such as `dist/`, coverage, or Cypress videos.

## Agent-Specific Instructions

Skills live in `.agents/skills/`. Agents must read a selected skill's `SKILL.md` before related changes. Use `frontend-design` when creating or substantially redesigning UI. Use `coss` for COSS primitives and `coss-particles` for copy-ready patterns. Invoke matching skills automatically; contributors may use `$skill-name` to guarantee selection.
