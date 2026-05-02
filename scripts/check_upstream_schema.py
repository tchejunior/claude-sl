#!/usr/bin/env python3
"""Detect drift between schema/upstream-snapshot.json and the live Claude Code statusline docs."""
import argparse, html as htmlmod, json, pathlib, re, sys, urllib.request, datetime

SOURCE_URL = 'https://code.claude.com/docs/en/statusline'
SNAPSHOT = pathlib.Path(__file__).resolve().parent.parent / 'schema' / 'upstream-snapshot.json'

TOP_LEVEL_OK = {'cwd', 'session_id', 'session_name', 'transcript_path', 'version', 'exceeds_200k_tokens'}

_TD_CODE = re.compile(r'<td><code>([\s\S]*?)</code>', re.IGNORECASE)
_TD_TEXT = re.compile(r'<td>([\s\S]*?)</td>', re.IGNORECASE)
_TR = re.compile(r'<tr>([\s\S]*?)</tr>', re.IGNORECASE)
_TAG = re.compile(r'<[^>]+>')
_CODE = re.compile(r'<code>([^<]+)</code>', re.IGNORECASE)


def _decode(s: str) -> str:
    return htmlmod.unescape(re.sub(_TAG, '', s)).strip()


def parse_field_table(html: str) -> list[dict]:
    # Find the field table by its header
    start = html.find('<th>Field</th>')
    if start < 0:
        return []
    end = html.find('</table>', start)
    table_html = html[start:end]

    out: list[dict] = []
    seen: set[str] = set()

    for tr in _TR.finditer(table_html):
        tds = _TD_TEXT.findall(tr.group(1))
        if len(tds) < 2:
            continue
        cell0, cell1 = tds[0], tds[1]
        # Skip header row
        if '<th>' in cell0.lower() or 'Field' in _decode(cell0):
            continue
        # Extract all <code> values from first cell
        codes = _CODE.findall(cell0)
        desc = _decode(cell1)
        for raw in codes:
            p = raw.strip()
            if not p:
                continue
            if '.' not in p and p not in TOP_LEVEL_OK:
                continue
            if p in seen:
                continue
            seen.add(p)
            out.append({'path': p, 'description': desc})

    return out


_PRE_CODE = re.compile(r'<pre[^>]*><code[^>]*>([\s\S]*?)</code></pre>', re.IGNORECASE)


def parse_schema_block(html: str) -> dict:
    blocks = _PRE_CODE.findall(html)
    candidates = []
    for b in blocks:
        text = _decode(b)
        if not text.startswith('{'):
            continue
        try:
            candidates.append(json.loads(text))
        except json.JSONDecodeError:
            continue
    if not candidates:
        raise RuntimeError('no JSON schema block found')
    # Return the largest one (most fields)
    return max(candidates, key=lambda d: len(json.dumps(d)))


_BACKTICK_CODE = re.compile(r'<code>([^<]+)</code>', re.IGNORECASE)


_EFFORT_VALS = {'low', 'medium', 'high', 'xhigh', 'max'}


def parse_enums(fields: list[dict]) -> dict[str, list[str]]:
    enums: dict[str, list[str]] = {}
    for f in fields:
        if f['path'] == 'effort.level':
            raw = f.get('_raw_cell', '') or f['description']
            vals = [v for v in _BACKTICK_CODE.findall(raw) if v in _EFFORT_VALS]
            if not vals:
                vals = [v for v in re.findall(r'\b(low|medium|high|xhigh|max)\b', f['description'])]
            enums['effort.level'] = list(dict.fromkeys(vals))
        if f['path'] == 'vim.mode':
            vals = re.findall(r'\b(NORMAL|INSERT|VISUAL LINE|VISUAL)\b', f['description'])
            enums['vim.mode'] = list(dict.fromkeys(vals))
    return enums


def _parse_field_table_with_raw(html: str) -> list[dict]:
    """Like parse_field_table but keeps raw cell HTML for enum extraction."""
    start = html.find('<th>Field</th>')
    if start < 0:
        return []
    end = html.find('</table>', start)
    table_html = html[start:end]

    out: list[dict] = []
    seen: set[str] = set()

    for tr in _TR.finditer(table_html):
        tds = _TD_TEXT.findall(tr.group(1))
        if len(tds) < 2:
            continue
        cell0, cell1 = tds[0], tds[1]
        if '<th>' in cell0.lower():
            continue
        codes = _CODE.findall(cell0)
        desc = _decode(cell1)
        for raw in codes:
            p = raw.strip()
            if not p:
                continue
            if '.' not in p and p not in TOP_LEVEL_OK:
                continue
            if p in seen:
                continue
            seen.add(p)
            out.append({'path': p, 'description': desc, '_raw_cell': cell1})

    return out


def diff(old: dict, new: dict) -> dict:
    old_paths = {f['path']: f for f in old['fields']}
    new_paths = {f['path']: f for f in new['fields']}
    added = [f for p, f in new_paths.items() if p not in old_paths]
    removed = [f for p, f in old_paths.items() if p not in new_paths]
    changed = [
        {'path': p, 'old': old_paths[p]['description'], 'new': new_paths[p]['description']}
        for p in old_paths if p in new_paths
        and old_paths[p]['description'] != new_paths[p]['description']
    ]
    enum_changes: dict[str, dict] = {}
    for k in set(list(old.get('enums', {}).keys()) + list(new.get('enums', {}).keys())):
        a = set(old.get('enums', {}).get(k, []))
        b = set(new.get('enums', {}).get(k, []))
        if a != b:
            enum_changes[k] = {'added': sorted(b - a), 'removed': sorted(a - b)}
    return {
        'added_fields': added,
        'removed_fields': removed,
        'changed_fields': changed,
        'enum_changes': enum_changes,
    }


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': 'claude-sl-schema-sync/1.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode('utf-8')


def build_snapshot(html: str) -> dict:
    fields_raw = _parse_field_table_with_raw(html)
    enums = parse_enums(fields_raw)
    fields = [{'path': f['path'], 'description': f['description']} for f in fields_raw]
    return {
        'fetched_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'source_url': SOURCE_URL,
        'fields': fields,
        'enums': enums,
    }


def is_empty(d: dict) -> bool:
    return all(not v for v in d.values())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--update', action='store_true')
    ap.add_argument('--json', action='store_true')
    ap.add_argument('--webhook', default=None)
    args = ap.parse_args()

    html = fetch(SOURCE_URL)
    fresh = build_snapshot(html)
    snap = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    d = diff(snap, fresh)

    if args.json:
        print(json.dumps(d, indent=2))
        return 0 if is_empty(d) else 1

    if args.update:
        SNAPSHOT.write_text(json.dumps(fresh, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(d, indent=2))
        return 0

    if is_empty(d):
        print('No drift.')
        return 0
    print('Drift detected:')
    print(json.dumps(d, indent=2))
    return 1


if __name__ == '__main__':
    sys.exit(main())
