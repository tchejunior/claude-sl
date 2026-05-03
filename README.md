# claude-sl — Claude Code Status Line Builder

> A no-install web tool that lets you build a custom **Claude Code status line** by ticking boxes — and walks out with a paste-ready `settings.json` plus a runnable script in the language and OS of your choice.

**Live at:** https://claudesl.tchejunior.dev

---

## What is this?

Claude Code's status line is the customizable bar at the bottom of the CLI that shows whatever your script prints — context usage, cost, rate limits, git state, the current model, anything you can read from the JSON Claude pipes to stdin. The official docs ([code.claude.com/docs/en/statusline](https://code.claude.com/docs/en/statusline)) explain how to write that script, but writing one by hand is tedious: you wrangle ANSI colors, build progress bars, format Unix timestamps, deal with optional fields, and re-do all of it when you want a tweak.

**claude-sl skips the wrangling.** Pick the fields you want from a checklist, configure their sub-options (bar width, timestamp format, path truncation, color thresholds), set a target line length, and copy out:

1. The exact `settings.json` snippet to paste into `~/.claude/settings.json`
2. A working `statusline.sh` / `.py` / `.js` / `.ps1` for your OS

A live preview shows what the output will look like in your terminal — ANSI colors and all — before you ever touch a file.

---

## Why use it?

- **Saves an evening of fiddling.** Especially the math for percentage bars, "resets in 1h 23m" timers, and ANSI escape sequences across four shells.
- **Cross-platform out of the box.** Same UI generates idiomatic Bash (with `jq`), Python (stdlib), Node.js, and PowerShell. The Windows tab gives you both Git Bash and PowerShell variants with the matching `command:` field for `settings.json`.
- **Stays in sync with Claude Code.** A daily GitHub Action diffs the upstream docs against a snapshot in this repo — if Anthropic adds a new field, a PR opens automatically so claude-sl can expose it without you noticing the docs changed.
- **Static and private.** Pure client-side codegen — your selections never leave your browser. No telemetry, no accounts, no backend.

---

## Features

| | |
|---|---|
| 🧱 **Field picker** | Every field from Claude Code's stdin schema, grouped by category (identity, workspace, context, cost, rate limits, git, misc). |
| 🎚️ **Sub-options** | Progress-bar width and color thresholds, timestamp format (`until` / `YYYY-MM-DD` / `DD/MM/YY` / `HH:mm`), path truncation, basename-only mode. |
| 🌿 **Git extras** | Branch, staged/modified file counts, clickable repo link via OSC 8 — beyond what Claude Code supplies natively. |
| 🧠 **Smart line packing** | You set a target line length; the generator decides where to wrap. Soft tolerance (default ±10%) keeps a near-fit on one line; toggle hard limit when you need a strict cap. |
| 👀 **Live preview** | Real ANSI rendering of the output, updates as you click. |
| 💾 **Copy or download** | One-click copy of the snippet/script, or download as a properly-named file. |
| 🪄 **Caching toggle** | When git fields are selected, optionally wrap shell calls in a session-scoped cache (configurable TTL) so the status line stays snappy even in big repos. |
| 🔁 **Auto refreshInterval** | If you select time-based fields (resets-in, durations, git state), `refreshInterval` is auto-set so values stay live. |

---

## How it works

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  schema/params.ts    │  ──►   │  emitJs / emitPython │  ──►   │  statusline.{sh,py,  │
│  (single source of   │        │  emitBash / emitPs   │        │   js,ps1}            │
│   truth)             │        │  + emitSettings      │        │  settings.json       │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
         ▲
         │ drives both
         ▼
┌──────────────────────┐
│  React UI            │
│  (controls + live    │
│   preview)           │
└──────────────────────┘
```

A single `params.ts` file describes every field — its label, sub-options, an estimated visible width, and a per-language render function. Both the UI (which checkboxes to render) and the codegen (which fragments to assemble) read from it. **Adding a new field is one entry.**

Line packing is hybrid: the generator decides line breaks at *gen-time* using width estimates, and the emitted script does a runtime fallback when a real value (a long path, a long branch name) blows past the estimate.

---

## Tech stack

- **Frontend:** Vite + React + TypeScript, MUI, dnd-kit, react-syntax-highlighter, Zustand
- **Codegen targets:** Bash (with `jq`), Python (stdlib), Node.js (no deps), PowerShell (5.1+ and 7+)
- **Schema sync:** Python 3.12 stdlib script + GitHub Actions cron (PR on drift)
- **Hosting:** Static build → Hetzner VPS via GitHub Actions (rsync + atomic symlink swap), nginx + Let's Encrypt

---

## Roadmap

- [x] Phase 1 — Project scaffolding
- [x] Phase 2 — Data layer (types, sample, params catalog)
- [x] Phase 3 — Codegen core (line packing, ANSI→HTML, helpers)
- [x] Phase 4 — Per-language emitters (JS / Python / Bash / PowerShell)
- [x] Phase 5 — UI (controls, output panel, live preview)
- [x] Phase 6 — Upstream-schema sync (daily PR bot)
- [x] Phase 7 — CI/CD + VPS deploy
- [ ] Phase 8 — Integration tests for emitted scripts (Bash + PowerShell coverage)

Design spec: [`docs/superpowers/specs/2026-04-30-claude-sl-design.md`](docs/superpowers/specs/2026-04-30-claude-sl-design.md)
Implementation plan: [`docs/superpowers/plans/2026-05-01-claude-sl.md`](docs/superpowers/plans/2026-05-01-claude-sl.md)

---

## Local development

```bash
git clone https://github.com/tchejunior/claude-sl.git
cd claude-sl
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm test             # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production bundle into dist/
```

---

## Contributing

Pull requests welcome — write access is currently limited to maintainers, but anyone can fork and open a PR. CI will run typecheck, lint, tests, and build on every PR. See [`docs/superpowers/specs/2026-04-30-claude-sl-design.md`](docs/superpowers/specs/2026-04-30-claude-sl-design.md) for the architectural picture before making non-trivial changes.

If a Claude Code field appears in the upstream docs but isn't yet in claude-sl, the daily sync bot will open a snapshot-update PR. Wiring the field into the UI is then a one-entry addition to `src/schema/params/*.ts` plus a render function per target language.

---

## License

MIT

---

## Acknowledgements

- The official [Claude Code status line documentation](https://code.claude.com/docs/en/statusline) — the source of truth for the field schema.
- Community projects [ccstatusline](https://github.com/sirmalloc/ccstatusline) and [starship-claude](https://github.com/martinemde/starship-claude) for prior art on themed status lines.
