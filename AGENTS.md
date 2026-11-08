# AGENTS.md

## Project

Weather CLI app (fully functional menu-driven CLI). TypeScript + Bun, ESM (`"type": "module"`). Entrypoint `src/index.ts`; code is organized per `Referencias/filesystem.md`: `actions/` (user flows: getWeather, addCity, removeCity, setDefaultCity, listCities, toggleUnit), `presentation/` (`menu.ts` loop, `output.ts` printers/spinner, `input.ts` stdin reader), `storage/` (`citiesStorage.ts` JSON persistence + cities store, `settingsStorage.ts` unit), `api/` (`geocoding.ts`, `weather.ts`, `http.ts` OpenMeteo calls), `types/` and `utils/` (format, constants, colors). State persists to `~/.config/weather-cli/cities.json` (resolved by `defaultStatePath()` in `citiesStorage.ts`, honors `XDG_CONFIG_HOME` with fallback to `~/.config`; a legacy cwd-relative `cities.json` is not migrated). Data source: OpenMeteo — geocoding first (`count=5` for disambiguation), then forecast; see README.md for the exact URL pattern.

## Commands

- Run: `bun src/index.ts`
- Install: `bun install` (lockfile is `bun.lock` — never use npm/pnpm)
- Typecheck: `bun check` (aliased as `bun run typecheck`; NOT `tsc --noEmit`)
- Single file typecheck: `bun check <file.ts>`
- Tests: `bun test` (uses `bun:test`, tests en `tests/` reflejando `src/`, no jest/vitest)
- Lint: `bun run lint` (ESLint 10 + typescript-eslint)
- Executable binary: `bun build --compile src/index.ts --outfile weather` (output is gitignored)

## Toolchain rules (see bun-instructions.md for full details)

- Always use Bun instead of Node tooling: `bun <file>`, `bun test`, `bunx`, `bun install`.
- Bun auto-loads `.env` — do not use dotenv.
- Use `bun:sqlite`, `Bun.file`, `Bun.serve()` / built-in APIs instead of express/better-sqlite3/ws/node:fs equivalents.
- TypeScript peer dep is `^6`; tsconfig is strict with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (import types with `import type`).

## Conventions

- Repo prose (README, UI labels) is in Spanish; keep user-facing CLI text in Spanish.
- Target UX is the menu mockup in README.md — match it when building the CLI (option keys 1/2/3/4/5/6/8/9, no 7).
- UI colors live in `src/utils/colors.ts` (`ANSI`) and are disabled when `NO_COLOR` is set; spinner only animates on a TTY.
- Last line of `@bun-instructions.md` has extra Bun API docs pointers.
