import { Card, CardContent, TextField, FormControlLabel, Switch, Stack, Typography } from '@mui/material';
import { useStatuslineStore } from '../store/useStatuslineStore';

export default function GlobalControls() {
  const g = useStatuslineStore((s) => s.global);
  const set = useStatuslineStore((s) => s.setGlobal);
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Globals</Typography>
        <Stack spacing={2}>
          <TextField label="Line length" type="number" size="small" value={g.lineLength}
            onChange={(e) => set('lineLength', Number(e.target.value))} />
          <TextField label="Separator" size="small" value={g.separator}
            onChange={(e) => set('separator', e.target.value)} />
          <FormControlLabel control={<Switch checked={g.useEmojis}
            onChange={(e) => set('useEmojis', e.target.checked)} />} label="Use emojis" />
          <FormControlLabel control={<Switch checked={g.hardLimit}
            onChange={(e) => set('hardLimit', e.target.checked)} />} label="Hard line limit" />
          <TextField label="Tolerance %" type="number" size="small" value={g.tolerancePct}
            disabled={g.hardLimit}
            onChange={(e) => set('tolerancePct', Number(e.target.value))} />
          <TextField label="Padding" type="number" size="small" value={g.padding}
            onChange={(e) => set('padding', Number(e.target.value))} />
          <TextField label="refreshInterval (s; blank = auto)" type="number" size="small"
            value={g.refreshInterval ?? ''}
            onChange={(e) => set('refreshInterval', e.target.value === '' ? null : Number(e.target.value))} />
          <FormControlLabel control={<Switch checked={g.hideVimModeIndicator}
            onChange={(e) => set('hideVimModeIndicator', e.target.checked)} />} label="hideVimModeIndicator" />
        </Stack>
      </CardContent>
    </Card>
  );
}
