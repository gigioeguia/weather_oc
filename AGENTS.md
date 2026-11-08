# AGENTS.md

## Project

Weather CLI app (fully functional menu-driven CLI). TypeScript + Bun, ESM (`"type": "module"`). Entrypoint `index.ts`; logic lives in `lib/` (`api.ts` OpenMeteo calls, `cities.ts` store, `storage.ts` JSON persistence, `ui.ts` colors/spinner/input). State persists to `~/.config/weather-cli/cities.json` (resolved by `defaultStatePath()` in `storage.ts`, honors `XDG_CONFIG_HOME` with fallback to `~/.config`; a legacy cwd-relative `cities.json` is not migrated). Data source: OpenMeteo — geocoding first (`count=5` for disambiguation), then forecast; see README.md for the exact URL pattern.

## Commands

- Run: `bun index.ts`
- Install: `bun install` (lockfile is `bun.lock` — never use npm/pnpm)
- Typecheck: `bun check` (aliased as `bun run typecheck`; NOT `tsc --noEmit`)
- Single file typecheck: `bun check <file.ts>`
- Tests: `bun test` (uses `bun:test`, image snapshot-free, no jest/vitest)
- Executable binary: `bun build --compile index.ts --outfile weather` (output is gitignored)

## Toolchain rules (see bun-instructions.md for full details)

- Always use Bun instead of Node tooling: `bun <file>`, `bun test`, `bunx`, `bun install`.
- Bun auto-loads `.env` — do not use dotenv.
- Use `bun:sqlite`, `Bun.file`, `Bun.serve()` / built-in APIs instead of express/better-sqlite3/ws/node:fs equivalents.
- TypeScript peer dep is `^7`; tsconfig is strict with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (import types with `import type`).

## Conventions

- Repo prose (README, UI labels) is in Spanish; keep user-facing CLI text in Spanish.
- Target UX is the menu mockup in README.md — match it when building the CLI (option keys 1/2/3/4/5/6/8/9, no 7).
- UI colors live in `lib/ui.ts` (`ANSI`) and are disabled when `NO_COLOR` is set; spinner only animates on a TTY.
- Last line of `@bun-instructions.md` has extra Bun API docs pointers.
