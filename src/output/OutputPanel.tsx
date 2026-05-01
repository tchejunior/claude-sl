import { useState, useMemo, useCallback } from 'react';
import {
  Card, CardContent, Typography, Tabs, Tab, Box,
  ToggleButtonGroup, ToggleButton, IconButton, Tooltip, Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStatuslineStore } from '../store/useStatuslineStore';
import { ansiToHtml } from './ansiToHtml';
import { runPreview } from './previewRender';
import { emitJs } from '../codegen/emitJs';
import { emitPython } from '../codegen/emitPython';
import { emitBash } from '../codegen/emitBash';
import { emitPowershell } from '../codegen/emitPowershell';
import { emitSettings } from '../codegen/emitSettings';
import type { ResolvedOptions } from '../schema/types';

const EXT: Record<string, string> = { sh: 'sh', py: 'py', js: 'js', ps: 'ps1' };
const LANG_LABEL: Record<string, string> = { sh: 'Bash', py: 'Python', js: 'Node.js', ps: 'PowerShell' };

export default function OutputPanel() {
  const { selected, global: g, subByParam, os, format, setOs, setFormat } = useStatuslineStore();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const opts: ResolvedOptions = useMemo(() => ({
    global: g,
    sub: subByParam[selected[0]] ?? {},
  }), [g, subByParam, selected]);

  const script = useMemo(() => {
    if (selected.length === 0) return '';
    if (format === 'js') return emitJs(selected, opts);
    if (format === 'py') return emitPython(selected, opts);
    if (format === 'ps') return emitPowershell(selected, opts);
    return emitBash(selected, opts);
  }, [selected, opts, format]);

  const settings = useMemo(() => emitSettings({ os, format, selected }, opts), [os, format, selected, opts]);
  const preview = useMemo(() => runPreview(selected, opts), [selected, opts]);
  // ansiToHtml escapes all raw text through escapeHtml before injecting HTML
  const previewHtml = useMemo(() => ansiToHtml(preview), [preview]);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  const download = useCallback((text: string, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = name;
    a.click();
  }, []);

  const current = tab === 0 ? settings : script;
  const filename = tab === 0 ? 'settings.json' : `statusline.${EXT[format]}`;
  const langTag = tab === 0 ? 'json' : format === 'sh' ? 'bash' : format === 'py' ? 'python' : format === 'js' ? 'javascript' : 'powershell';

  // previewHtml is produced by ansiToHtml which escapes all text via escapeHtml - safe to render
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">Output</Typography>
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup size="small" exclusive value={os} onChange={(_, v) => v && setOs(v)}>
              {(['mac','linux','win'] as const).map((o) => (
                <ToggleButton key={o} value={o}>{o}</ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup size="small" exclusive value={format} onChange={(_, v) => v && setFormat(v)}>
              {(['sh','py','js','ps'] as const).map((f) => (
                <ToggleButton key={f} value={f}>{LANG_LABEL[f]}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {/* Live preview - ansiToHtml escapes all raw text, safe from XSS */}
        <Box sx={{
          fontFamily: 'monospace', fontSize: 13, p: 1.5, mb: 2,
          bgcolor: '#0d1117', borderRadius: 1, minHeight: 36,
          whiteSpace: 'pre', overflowX: 'auto',
        }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: previewHtml || '<span style="color:#555">Select parameters to preview…</span>' }}
        />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
          <Tab label="settings.json" />
          <Tab label={`statusline.${EXT[format]}`} />
        </Tabs>

        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <Tooltip title={copied ? 'Copied!' : 'Copy'}>
              <IconButton size="small" onClick={() => copy(current)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => download(current, filename)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <SyntaxHighlighter
            language={langTag}
            style={vscDarkPlus}
            customStyle={{ margin: 0, borderRadius: 8, fontSize: 12, maxHeight: '60vh' }}
          >
            {current || '# Select parameters on the left…'}
          </SyntaxHighlighter>
        </Box>
      </CardContent>
    </Card>
  );
}
