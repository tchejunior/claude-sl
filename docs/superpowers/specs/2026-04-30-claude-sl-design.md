# claude-sl — Status-Line Builder Design

**Date:** 2026-04-30
**Repo:** https://github.com/tchejunior/claude-sl
**Domain:** https://claudesl.tchejunior.dev
**Author:** Marcelo Brigato (tchejunior)
**Source of truth (upstream):** https://code.claude.com/docs/en/statusline

## 1. Goal

A single-page web tool that lets a user pick the fields they want in their Claude Code status line (with sub-options for bars, timestamps, paths, etc.), then generates a paste-ready `settings.json` snippet plus a runnable script in their preferred language for their OS. The tool is static (built with Vite, served by nginx), deployed via GitHub Actions to a Hetzner VPS at `claudesl.tchejunior.dev`. A daily cron job watches the upstream Claude docs and opens a PR when fields change.

## 2. Architecture

```
claude-sl/
├── src/
│   ├── App.tsx
│   ├── schema/
│   │   └── params.ts                  # single source of truth for params
│   ├── controls/
│   │   ├── GlobalControls.tsx
│   │   ├── ParamCheckbox.tsx
│   │   ├── ParamList.tsx              # accordion grouped + drag-reorder
│   │   └── GitCachingControls.tsx
│   ├── codegen/
│   │   ├── pack.ts                    # gen-time line packing
│   │   ├── fragment.ts                # CodeFragment type + dedup
│   │   ├── emitJs.ts
│   │   ├── emitPython.ts
│   │   ├── emitPowershell.ts
│   │   ├── emitBash.ts
│   │   └── emitSettings.ts
│   ├── output/
│   │   ├── OutputPanel.tsx            # OS tabs + format tabs
│   │   ├── PreviewBar.tsx             # ANSI-rendered preview
│   │   └── ansiToHtml.ts
│   ├── samples/
│   │   └── sampleStdin.ts             # canonical sample JSON
│   ├── theme.ts                       # MUI theme
│   └── main.tsx
├── schema/
│   └── upstream-snapshot.json         # canonical record diffed by sync script
├── scripts/
│   └── check_upstream_schema.py       # cron-driven sync script
├── docs/
│   ├── superpowers/specs/2026-04-30-claude-sl-design.md
│   └── vps-setup.md                   # one-time runbook (matches §10)
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .github/
│   ├── CODEOWNERS
│   └── workflows/
│       ├── ci.yml                     # typecheck + build on PR
│       ├── deploy.yml                 # build + rsync to VPS on main
│       └── upstream-sync.yml          # daily schema drift PR
└── README.md
```

**Stack:** Vite + React 18 + TypeScript (strict). MUI v5 for components. `@dnd-kit/sortable` for param reordering. `react-syntax-highlighter` (Prism, a dark theme) for the code panes. No router (single page). No backend at runtime — everything is client-side codegen. Build output is fully static.

**Why this shape:** the param schema (`src/schema/params.ts`) is the single source of truth driving both the UI (which checkboxes to render with which sub-options) and the codegen (which fragments to assemble per language). Adding a new param is one entry in that file plus four small render functions.

## 3. Param schema

`src/schema/params.ts` exports a `PARAMS: ParamDef[]` array. Each `ParamDef`:

```ts
type Lang = 'js' | 'py' | 'ps' | 'sh';
type ParamGroup = 'identity' | 'workspace' | 'cost' | 'context' | 'rate_limits' | 'misc' | 'git';

type SubOption =
  | { kind: 'bar'; defaultWidth: number }                    // progress bar with width control
  | { kind: 'timestamp'; default: TimestampFormat }          // resets_at fields
  | { kind: 'truncate'; defaultMaxChars: number; basenameOnly: boolean }
  | { kind: 'colorize'; defaultThresholds: [number, number] };

type TimestampFormat = 'until' | 'YYYY-MM-DD' | 'DD/MM/YY' | 'HH:mm';

interface ResolvedOptions {
  /* user-resolved values for this param's sub-options + global flags
     (useEmojis, separator, lineLength, hardLimit, tolerancePct) */
}

interface CodeFragment {
  helpers: string[];   // helper-function ids this fragment requires (deduped)
  expr: string;        // expression evaluating to the rendered string at runtime
}

interface ParamDef {
  id: ParamId;
  label: string;             // checkbox label
  group: ParamGroup;
  emoji?: string;            // shown only when "use emojis" is on
  jsonPath?: string;         // dot path into stdin JSON (informational; render owns extraction)
  subOptions?: SubOption[];
  estimateWidth(opts: ResolvedOptions): number;
  render: Record<Lang, (opts: ResolvedOptions) => CodeFragment>;
}
```

### 3.1 Param list (full)

Source: official "Available data" table at code.claude.com/docs/en/statusline (snapshot fetched 2026-04-30).

| `id` | Group | Default sub-options | Source |
|---|---|---|---|
| `model_display` | identity | — | `model.display_name` |
| `model_id` | identity | — | `model.id` |
| `version` | identity | — | `version` |
| `output_style` | identity | — | `output_style.name` |
| `effort` | identity | — | `effort.level` (`low`/`medium`/`high`/`xhigh`/`max`) |
| `thinking` | identity | — | `thinking.enabled` (renders `thinking` or empty) |
| `vim` | identity | — | `vim.mode` (`NORMAL`/`INSERT`/`VISUAL`/`VISUAL LINE`) |
| `agent` | identity | — | `agent.name` |
| `session_name` | identity | truncate | `session_name` |
| `cwd` | workspace | truncate (basename only, max 40) | `workspace.current_dir` |
| `workspace_project` | workspace | truncate (basename only, max 40) | `workspace.project_dir` |
| `workspace_added_count` | workspace | — | `workspace.added_dirs.length` |
| `workspace_git_worktree` | workspace | — | `workspace.git_worktree` |
| `worktree_name` | workspace | — | `worktree.name` |
| `worktree_branch` | workspace | — | `worktree.branch` |
| `worktree_original_branch` | workspace | — | `worktree.original_branch` |
| `cost_total_usd` | cost | — | `cost.total_cost_usd` |
| `cost_duration` | cost | — | `cost.total_duration_ms` (formatted `Xm Ys`) |
| `cost_api_duration` | cost | — | `cost.total_api_duration_ms` |
| `cost_lines` | cost | — | `cost.total_lines_added` / `_removed` (`+156 -23`) |
| `ctx_used_pct` | context | — | `context_window.used_percentage` |
| `ctx_remaining_pct` | context | — | `context_window.remaining_percentage` |
| `ctx_total_tokens` | context | — | `context_window.total_input_tokens + total_output_tokens` |
| `ctx_window_size` | context | — | `context_window.context_window_size` |
| `ctx_bar` | context | bar (width 10), colorize (75/90) | `context_window.used_percentage` |
| `ctx_current_input` | context | — | `context_window.current_usage.input_tokens` |
| `ctx_cache_read` | context | — | `context_window.current_usage.cache_read_input_tokens` |
| `ctx_cache_creation` | context | — | `context_window.current_usage.cache_creation_input_tokens` |
| `exceeds_200k` | context | — | `exceeds_200k_tokens` (renders `>200k` or empty) |
| `rate_5h_pct` | rate_limits | — | `rate_limits.five_hour.used_percentage` |
| `rate_5h_bar` | rate_limits | bar (width 10), colorize (75/90) | same |
| `rate_5h_resets` | rate_limits | timestamp (default `until`) | `rate_limits.five_hour.resets_at` |
| `rate_7d_pct` | rate_limits | — | `rate_limits.seven_day.used_percentage` |
| `rate_7d_bar` | rate_limits | bar, colorize | same |
| `rate_7d_resets` | rate_limits | timestamp | `rate_limits.seven_day.resets_at` |
| `git_branch` | git | — | shells `git branch --show-current` |
| `git_staged_count` | git | colorize (1/-) | `git diff --cached --numstat \| wc -l` |
| `git_modified_count` | git | colorize (1/-) | `git diff --numstat \| wc -l` |
| `git_remote_link` | git | — | `git remote get-url origin` (OSC 8 link) |
| `session_id` | misc | truncate (default 8) | `session_id` |
| `transcript_path` | misc | truncate (basename only) | `transcript_path` |

**Emoji map** (used when "Use emojis" is on):

| `id` | emoji |
|---|---|
| `model_display` / `model_id` | (none — wrapped in `[...]`) |
| `cwd` / `workspace_project` | 📁 |
| `git_branch` / `worktree_branch` / `worktree_original_branch` | 🌿 |
| `cost_total_usd` | 💰 |
| `cost_duration` / `cost_api_duration` | ⏱️ |
| `cost_lines` | 📝 |
| `ctx_*` | 🧠 |
| `rate_5h_*` | 5h |
| `rate_7d_*` | 7d |
| `*_resets` | ⏱️ |
| `git_remote_link` | 🔗 |
| `agent` | 🤖 |
| `vim` | (mode shown literally) |
| `thinking` | 💭 |

When `useEmojis` is OFF, render the emoji's text fallback (e.g. `dir` instead of 📁) or omit if redundant; documented per param in `params.ts`.

### 3.2 CodeFragment dedup

`CodeFragment.helpers: string[]` lists helper ids the fragment depends on (e.g. `__bar`, `__resetTime`, `__truncatePath`, `ANSI_COLORS`, `__pack`, `__cacheGit`). Each emitter has a `HELPERS: Record<string, string>` mapping id → source code in that language. The emitter walks all selected fragments, collects the union of helper ids, and prepends them once at the top of the script.

## 4. Layout / UI

Split layout (`Box display="grid" gridTemplateColumns="minmax(380px, 1fr) 1fr" gap={2}`). Single column on `< md` viewports.

### 4.1 Left column (controls)

1. **Globals card** (`<Card>`):
   - `lineLength` number (default `100`)
   - `separator` text (default `' | '`)
   - `useEmojis` switch (default ON)
   - `hardLimit` switch (default OFF)
   - `tolerancePct` number (default `10`, disabled when `hardLimit` is ON)
   - `padding` number (default `0`) — emitted to settings.json
   - `refreshInterval` number, optional, with auto-default logic (see §6.5)
   - `hideVimModeIndicator` switch (default OFF; auto-suggests ON when `vim` param is selected)
2. **Git caching card** (only enabled when at least one `git_*` param is selected):
   - `cacheGit` switch (default ON)
   - `cacheStalenessSec` number (default `5`, min `1`)
3. **Params accordion** — one expansion panel per `ParamGroup` in this order: identity, workspace, git, context, cost, rate_limits, misc. Each row: drag handle, checkbox, label, emoji preview, ⚙ button that toggles a sub-options inline panel.
4. **Selected order list** — a separate card showing the currently-selected params in render order; user can drag to reorder. (Kept distinct from the accordion so reordering doesn't interfere with browsing/toggling.)

### 4.2 Right column (output)

1. **OS tabs** (top, MUI `Tabs`): `macOS | Linux | Windows`.
2. **Format tabs** (below): `Bash | Python | Node.js` for macOS/Linux; `Git Bash | PowerShell | Python | Node.js` for Windows. The "Git Bash" tab shows the same script as the Bash tab on macOS/Linux but with the Windows path advice; PowerShell is Windows-only.
3. **`settings.json` pane** (~30% height): code block with the snippet to paste. Above it, a hint line: *"Paste into `~/.claude/settings.json` (macOS/Linux) or `%USERPROFILE%\.claude\settings.json` (Windows)."* Copy button.
4. **Live preview strip**: rendered status line(s) as they would appear in a terminal, using the canonical sample JSON from §3 source. ANSI escapes converted to inline-styled HTML by `ansiToHtml.ts`. Updates reactively as the user toggles params.
5. **Script pane** (~70% height): generated script with syntax highlighting. Copy + Download buttons. Download filename matches the language: `statusline.sh`, `statusline.py`, `statusline.js`, `statusline.ps1`.

## 5. Packing logic (hybrid)

### 5.1 Gen-time (TS, `codegen/pack.ts`)

Input: ordered list of selected params + resolved options (separator, lineLength, hardLimit, tolerancePct).

Algorithm:
```
lines = [[]]; running = 0
for p in selected:
  w = p.estimateWidth(opts) + (running > 0 ? sepWidth : 0)
  limit = hardLimit ? lineLength : lineLength * (1 + tolerancePct/100)
  if running + w > limit and lines[-1] is non-empty:
    lines.append([p]); running = p.estimateWidth(opts)
  else:
    lines[-1].append(p); running += w
return lines
```

Output: `string[][]` — each inner array is the param ids on one line. Emitters turn each inner array into one literal `console.log(__pack([...frags], sep, lineLength, tolerancePct))` (or equivalent).

### 5.2 Runtime (in emitted script)

`__pack(parts, sep, max, tol)` helper:
1. Filter out empty/null fragments (so absent fields like `vim`/`agent` don't leave dangling separators).
2. Join with `sep`.
3. `visible = stripAnsi(joined).length` (helper `__stripAnsi` strips ANSI CSI and OSC 8 sequences).
4. If hardLimit OFF: if `visible <= max * (1 + tol/100)`, return as-is; else split at the last separator that fits into `max`, emit two lines (joined with `\n`).
5. If hardLimit ON: `tol = 0`; same split rule.

Emitted in all four languages with identical semantics.

### 5.3 Width estimation

In `params.ts`, each param's `estimateWidth(opts)`:

| Pattern | Estimate |
|---|---|
| Static label only | literal `.length` |
| Path (`cwd`, etc.) with truncate | `min(truncateMax, 40) + (emoji ? 2 : 0) + 1` |
| Bar | `barWidth + 6` (label + ` ` + `NN%`) |
| Bar + reset time (`rate_*` combined cases) | `barWidth + 16` |
| Timestamp | format-string char count + 2 |
| Token count | 8 (`123,456`) |
| Cost | 8 (`$0.0123`) |
| Duration | 8 (`12m 34s`) |
| Branch / agent / model | 16 (typical) |
| Emoji prefix | +2 visible cells (most terminals double-width) |

Estimates are intentionally a bit generous so the gen-time decisions are stable; runtime check handles outliers.

## 6. Codegen output (per language)

### 6.1 Common script shape

Every emitted script:
1. Reads stdin → parses JSON.
2. Defines color constants and only the helpers referenced by selected fragments.
3. Extracts each selected field with null-safe access (the JSON schema doc explicitly lists which fields can be absent or null — null-safety is mandatory).
4. Calls `__pack` once per planned line.
5. Prints lines.
6. Wraps the whole pipeline in a try/catch (or equivalent) so a script error never blanks the status line — falls back to printing `[<model_display> or "?"]`.

### 6.2 JavaScript (`emitJs.ts`)

```js
#!/usr/bin/env node
const path = require('path');
const fs = require('fs');               // only if cacheGit
const { execSync } = require('child_process'); // only if any git_* param

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(input);

    // === HELPERS (deduped) ===
    const G = '\x1b[32m', Y = '\x1b[33m', R = '\x1b[31m', C = '\x1b[36m', X = '\x1b[0m';
    const __stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\]8;;[^\x07]*\x07/g, '');
    const __bar = (pct, w, color) => { /* ... */ };
    const __resetTime = (epoch, fmt) => { /* ... */ };
    const __truncatePath = (p, max, basenameOnly) => { /* ... */ };
    const __pack = (parts, sep, max, tol) => { /* ... */ };
    const __cacheGit = (sessionId, ttl, run) => { /* ... */ };  // only if cacheGit
    const __git = () => { /* runs git commands or returns cached */ };

    // === EXTRACTION ===
    const model = d.model?.display_name ?? '?';
    const dir = __truncatePath(d.workspace?.current_dir ?? '', 40, true);
    const fhPct = Math.floor(d.rate_limits?.five_hour?.used_percentage ?? 0);
    const fhResets = d.rate_limits?.five_hour?.resets_at;
    // ... one line per selected param

    // === LINES ===
    console.log(__pack([`[${model}]`, `📁 ${dir}`, `5h ${__bar(fhPct, 10, true)} ${fhPct}% ⏱️ ${__resetTime(fhResets, 'until')}`], ' | ', 100, 10));
  } catch (e) {
    console.log(`[?]`);
  }
});
```

### 6.3 Python (`emitPython.ts`)

```python
#!/usr/bin/env python3
import json, sys, os, time, subprocess, re

def main():
    try:
        d = json.load(sys.stdin)
        # helpers + extraction + lines (mirroring the JS version)
        ...
    except Exception:
        print('[?]')

if __name__ == '__main__':
    main()
```

### 6.4 PowerShell (`emitPowershell.ts`)

```powershell
$ErrorActionPreference = 'Continue'
try {
    $d = $input | Out-String | ConvertFrom-Json

    function Strip-Ansi { param($s) ... }
    function Bar { param($pct, $w, $color) ... }
    function ResetTime { param($epoch, $fmt) ... }
    function Pack { param($parts, $sep, $max, $tol) ... }
    function GitInfo { ... }   # only if any git_* param

    $G = "`e[32m"; $Y = "`e[33m"; $R = "`e[31m"; $X = "`e[0m"

    $model = if ($d.model.display_name) { $d.model.display_name } else { '?' }
    # extraction...

    Write-Host (Pack @("[$model]", "...") ' | ' 100 10)
} catch {
    Write-Host '[?]'
}
```

PowerShell `` `e `` (ESC) requires PS 7+. For PS 5.1 (older Windows), emit `[char]27` instead. Detection logic in the emitter: emit a `$ESC = if ($PSVersionTable.PSVersion.Major -ge 7) { "`e" } else { [char]27 }` shim and reference `$ESC[32m`.

### 6.5 Bash (`emitBash.ts`)

```bash
#!/bin/bash
# Requires: jq
input=$(cat)

# helpers
__bar() { ... }
__reset_time() { ... }
__truncate_path() { ... }
__pack() { ... }
__cache_git() { ... }   # only if cacheGit

# extraction
MODEL=$(echo "$input" | jq -r '.model.display_name // "?"')
...

# lines
echo "$(__pack "[${MODEL}]" "📁 ${DIR}" ... | ...)"
```

`__pack` in bash is the trickiest helper — it takes `--` separated args, joins with `$SEP`, computes `__strip_ansi` length via `sed`, splits when over budget. Reference implementation goes in `emitBash.ts` as a static template string.

### 6.6 settings.json snippet

`emitSettings.ts` emits exactly the JSON the user pastes. Minimal form (no optional keys):

```json
{
  "statusLine": {
    "type": "command",
    "command": "<command-for-OS-and-format>"
  }
}
```

Optional keys are added conditionally:
- `padding`: included only if non-zero
- `refreshInterval`: included only if set (manually or via auto-default rule below)
- `hideVimModeIndicator`: included only if `true`

Example with all optional keys present:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 2,
    "refreshInterval": 5,
    "hideVimModeIndicator": true
  }
}
```

| OS | Format | `command` |
|---|---|---|
| macOS / Linux | Bash | `~/.claude/statusline.sh` |
| macOS / Linux | Python | `~/.claude/statusline.py` |
| macOS / Linux | Node | `~/.claude/statusline.js` |
| Windows | Git Bash | `~/.claude/statusline.sh` |
| Windows | PowerShell | `powershell -NoProfile -File C:/Users/<you>/.claude/statusline.ps1` |
| Windows | Python | `python C:/Users/<you>/.claude/statusline.py` |
| Windows | Node | `node C:/Users/<you>/.claude/statusline.js` |

The `<you>` placeholder is rendered literally — the user replaces it manually. Hint above the snippet says so.

**`refreshInterval` auto-default rule**: when the field is left blank in the UI, the emitter sets it to `5` if any of the following params are selected, else omits it entirely:
- any `*_resets` with `timestamp.format = 'until'`
- `cost_duration`, `cost_api_duration`
- any `git_*` param

User can override (set explicitly to a number, or check a "do not emit refreshInterval" box).

## 7. Live preview

`PreviewBar.tsx` renders the lines a user would see in the terminal. Implementation:
1. Use the canonical sample JSON from `samples/sampleStdin.ts` (same as the doc; embedded as a TS const).
2. Run the **TS** equivalents of the emitted helpers in-browser (a parallel `previewRender.ts` keeps these in sync). This avoids actually executing the emitted JS string. We are deliberately duplicating the helpers (TS for preview, JS-string for emitted output) — the param-tests in §11 keep both honest.
3. Convert the result through `ansiToHtml.ts` (handles 8-color foreground + reset; OSC 8 links rendered as `<a target="_blank">`).
4. Render in a `<pre>` styled to mimic terminal (monospace, dark background).

## 8. Upstream-schema sync

### 8.1 `schema/upstream-snapshot.json`

```json
{
  "fetched_at": "2026-04-30T00:00:00Z",
  "source_url": "https://code.claude.com/docs/en/statusline",
  "fields": [
    { "path": "cwd", "description": "Current working directory" },
    { "path": "model.id", "description": "Current model identifier" },
    { "path": "model.display_name", "description": "..." }
    /* ...full list from §3.1 */
  ],
  "enums": {
    "effort.level": ["low", "medium", "high", "xhigh", "max"],
    "vim.mode": ["NORMAL", "INSERT", "VISUAL", "VISUAL LINE"]
  }
}
```

The first commit of this file uses the snapshot fetched on 2026-04-30 (saved by the implementer; no manual editing).

### 8.2 `scripts/check_upstream_schema.py`

Stdlib-only Python script. Modes:

| Flag | Behavior |
|---|---|
| `--check` | exits 1 if upstream differs from snapshot, prints diff |
| `--update` | rewrites snapshot file, prints diff, exits 0 |
| `--json` | emits diff as JSON to stdout (for webhook / CI consumption) |
| `--webhook URL` | (deferred) POST diff JSON to URL when changes detected |

Pseudocode:

```python
def fetch():
    html = urlopen(SOURCE_URL).read().decode()
    fields = parse_table(html)        # regex over the "Available data" table rows
    schema = parse_schema_block(html) # regex-extract the "Full JSON schema" code block, json.loads
    enums = parse_enums(fields)       # scan descriptions for back-ticked lists
    cross_check(fields, schema)       # warn if a field in the table is missing from schema
    return {'fields': fields, 'enums': enums}

def diff(a, b):
    return {
        'added_fields':   [f for f in b if f.path not in a.paths],
        'removed_fields': [f for f in a if f.path not in b.paths],
        'changed_fields': [(p, a[p].desc, b[p].desc) for p in common if a[p].desc != b[p].desc],
        'enum_changes':   diff_enums(a.enums, b.enums),
    }
```

HTML parsing uses regex (no external deps). The "Available data" markdown table has a stable shape:
```
| `field.path` | description |
```
A regex like `r'^\|\s*`([^`]+)`\s*\|\s*([^\|]+?)\s*\|'` over each line works. The "Full JSON schema" block is matched with `r'```json\s*(\{.*?\})\s*```'` (DOTALL) inside the `<Accordion title="Full JSON schema">` section.

### 8.3 `.github/workflows/upstream-sync.yml`

```yaml
name: upstream-sync
on:
  schedule:
    - cron: '0 7 * * *'
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - id: drift
        run: python scripts/check_upstream_schema.py --check
        continue-on-error: true
      - if: steps.drift.outcome == 'failure'
        run: python scripts/check_upstream_schema.py --update
      - if: steps.drift.outcome == 'failure'
        uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/upstream-schema-drift
          title: 'chore(schema): upstream snapshot drift detected'
          body: |
            Upstream Claude Code status-line docs have changed.
            Please review the snapshot diff and, if applicable,
            update `src/schema/params.ts` to expose the new field(s).
          labels: schema-drift
          assignees: tchejunior
          add-paths: schema/upstream-snapshot.json
```

### 8.4 Future Jarvis hook (deferred)

`--webhook URL` flag posts diff JSON to a Jarvis endpoint on `j4rvis.com.br`. Out of scope for v1; the seam exists in the script.

## 9. CI/CD

### 9.1 `.github/workflows/ci.yml`

Runs on PRs and pushes to non-main branches:
```yaml
name: ci
on:
  pull_request:
  push:
    branches-ignore: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### 9.2 `.github/workflows/deploy.yml`

Runs on push to `main`:
```yaml
name: deploy
on:
  push:
    branches: [main]
concurrency:
  group: deploy
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: webfactory/ssh-agent@v0.9.0
        with: { ssh-private-key: ${{ secrets.VPS_SSH_KEY }} }
      - run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_KNOWN_HOSTS }}" >> ~/.ssh/known_hosts
      - name: Rsync to VPS
        run: |
          rsync -az --delete dist/ \
            ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/var/www/claudesl/releases/${{ github.sha }}/
      - name: Swap symlink + reload nginx
        run: |
          ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} '
            ln -sfn /var/www/claudesl/releases/${{ github.sha }} /var/www/claudesl/current &&
            sudo /usr/sbin/nginx -t &&
            sudo /bin/systemctl reload nginx &&
            ls -1dt /var/www/claudesl/releases/*/ | tail -n +6 | xargs -r rm -rf
          '
```

`concurrency` prevents overlapping deploys. Release pruning keeps the last 5.

## 10. One-time VPS setup runbook

(Reproduced verbatim in `docs/vps-setup.md`. Step numbering matches the conversation.)

### Step 1 — Generate deploy SSH key (local machine)
```bash
ssh-keygen -t ed25519 -C "github-actions-claudesl" -f ~/.ssh/claudesl_deploy -N ""
```

### Step 2 — Create `deploy` user on the VPS
```bash
ssh jarvis@j4rvis.com.br
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo tee /home/deploy/.ssh/authorized_keys > /dev/null <<'EOF'
<paste contents of ~/.ssh/claudesl_deploy.pub>
EOF
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```
Verify: `ssh -i ~/.ssh/claudesl_deploy deploy@j4rvis.com.br 'whoami'` → `deploy`.

### Step 3 — Web root
```bash
sudo mkdir -p /var/www/claudesl/releases
sudo chown -R deploy:deploy /var/www/claudesl
sudo -u deploy bash -c '
  mkdir -p /var/www/claudesl/releases/_placeholder &&
  echo "<h1>claudesl: pending first deploy</h1>" > /var/www/claudesl/releases/_placeholder/index.html
'
sudo -u deploy ln -sfn /var/www/claudesl/releases/_placeholder /var/www/claudesl/current
```

### Step 4 — Sudoers entry for nginx reload
```bash
sudo tee /etc/sudoers.d/deploy > /dev/null <<'EOF'
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t
deploy ALL=(root) NOPASSWD: /bin/systemctl reload nginx
EOF
sudo chmod 440 /etc/sudoers.d/deploy
sudo visudo -cf /etc/sudoers.d/deploy
```

### Step 5 — nginx site (HTTP-only first)
```bash
sudo tee /etc/nginx/sites-available/claudesl > /dev/null <<'EOF'
server {
    listen 80;
    server_name claudesl.tchejunior.dev;
    root /var/www/claudesl/current;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/claudesl /etc/nginx/sites-enabled/claudesl
sudo nginx -t && sudo systemctl reload nginx
curl -I http://claudesl.tchejunior.dev/   # expect 200
```

### Step 6 — TLS via certbot, then final nginx config
```bash
sudo certbot --nginx -d claudesl.tchejunior.dev \
  --non-interactive --agree-tos -m marcelobrigato@gmail.com --redirect

sudo tee /etc/nginx/sites-available/claudesl > /dev/null <<'EOF'
server {
    listen 80;
    server_name claudesl.tchejunior.dev;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name claudesl.tchejunior.dev;

    ssl_certificate /etc/letsencrypt/live/claudesl.tchejunior.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/claudesl.tchejunior.dev/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    server_tokens off;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/claudesl/current;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    location / { try_files $uri $uri/ /index.html; }

    access_log /var/log/nginx/claudesl_access.log;
    error_log  /var/log/nginx/claudesl_error.log warn;
}
EOF
sudo nginx -t && sudo systemctl reload nginx
curl -I https://claudesl.tchejunior.dev/   # expect 200
```

### Step 7 — GitHub Actions secrets
At https://github.com/tchejunior/claude-sl/settings/secrets/actions:

| Name | Value |
|---|---|
| `VPS_HOST` | `j4rvis.com.br` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | full contents of `~/.ssh/claudesl_deploy` (private key) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519,rsa j4rvis.com.br` |

### Step 8 — Collaborator + branch protection
- Settings → Collaborators → invite `rogeriosantos` with **Write**.
- Settings → Branches → protect `main`:
  - Require PR + 1 approval, dismiss stale approvals
  - Require Code Owners review
  - Require status checks: `ci`, `deploy`
  - Require linear history
  - Disallow bypass
- Add `.github/CODEOWNERS`:
  ```
  * @tchejunior @rogeriosantos
  ```

### Step 9 — Trigger first deploy
Push to `main`. Verify:
```bash
curl -s https://claudesl.tchejunior.dev/ | head -5
```

### Step 10 — Sanity checks
```bash
ssh jarvis@j4rvis.com.br '
  ls -la /var/www/claudesl/current
  ls /var/www/claudesl/releases/ | tail -5
  sudo certbot certificates 2>&1 | grep -A2 claudesl
  sudo systemctl status nginx --no-pager | head -5
'
```

## 11. Testing

- **Unit (Vitest):**
  - `pack.ts`: parametric tests for line-break decisions across param combos, hard-limit on/off, tolerance edge cases.
  - Each emitter: snapshot tests for representative selections (e.g. "all params on", "minimal: model + cwd", "rate limits only").
  - `ansiToHtml.ts`: known input/output pairs.
- **Integration (Vitest + child_process):**
  - For each emitted language available in CI (Bash + Python + Node — PowerShell skipped on Linux runner): write the generated script to a temp file, pipe the canonical sample JSON to it, assert the output matches the in-browser preview output (modulo trailing whitespace).
- **Schema sync:**
  - `scripts/check_upstream_schema.py` has its own pytest suite using a fixture HTML file (committed) to test parse and diff logic without hitting the network.
- **CI:** `ci.yml` runs `typecheck`, `lint`, `test`, `build`. Required for `main`.

## 12. Out of scope (v1)

- `subagentStatusLine` config (different schema, deferred).
- Themes / saved presets (no persistence — query-string state only, optional v1.1).
- Account auth, server-side state.
- Direct push to Jarvis on schema drift (script supports it via `--webhook` flag, no Jarvis endpoint built yet).
- Multi-language UI (English only).

## 13. Open items / nice-to-haves (post-v1)

- Encode the current selection into a URL query string so users can share configs.
- Per-param "show only when value present" toggle (e.g. only show `vim.mode` when vim mode is on — already implicit because `__pack` filters empties, but worth a UI toggle for "always show with N/A fallback").
- Switch packing helper to be width-aware of double-width characters beyond emoji (CJK).
- Webhook → Jarvis pipeline for schema drift alerts.
