# AGENTS.md

## Project

Weather CLI app (learning/demo project). TypeScript + Bun, ESM (`"type": "module"`), single entrypoint `index.ts`. Data source: OpenMeteo (geocoding first, then forecast — see README.md for the exact URL pattern).

## Commands

- Run: `bun index.ts`
- Install: `bun install` (lockfile is `bun.lock` — never use npm/pnpm)
- Typecheck: `bun check` (aliased as `bun run typecheck`; NOT `tsc --noEmit`)
- Single file typecheck: `bun check <file.ts>`
- Tests: `bun test` (uses `bun:test`, image snapshot-free, no jest/vitest)

## Toolchain rules (see bun-instructions.md for full details)

- Always use Bun instead of Node tooling: `bun <file>`, `bun test`, `bunx`, `bun install`.
- Bun auto-loads `.env` — do not use dotenv.
- Use `bun:sqlite`, `Bun.file`, `Bun.serve()` / built-in APIs instead of express/better-sqlite3/ws/node:fs equivalents.
- TypeScript peer dep is `^7`; tsconfig is strict with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (import types with `import type`).

## Conventions

- Repo prose (README, UI labels) is in Spanish; keep user-facing CLI text in Spanish.
- Target UX is the menu mockup in README.md — match it when building the CLI.
- Puedes usar `@bun-instructions.md` para obtener instrucciones de Bum.
