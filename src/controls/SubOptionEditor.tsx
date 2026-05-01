import { Stack, TextField, FormControlLabel, Switch, MenuItem } from '@mui/material';
import type { ParamDef, TimestampFormat } from '../schema/types';
import { useStatuslineStore } from '../store/useStatuslineStore';

interface Props { def: ParamDef; }

export default function SubOptionEditor({ def }: Props) {
  const sub = useStatuslineStore((s) => s.subByParam[def.id]) ?? {};
  const setSub = useStatuslineStore((s) => s.setSub);
  if (!def.subOptions) return null;
  return (
    <Stack spacing={1} sx={{ pl: 4, py: 1 }}>
      {def.subOptions.map((so, i) => {
        if (so.kind === 'bar') return (
          <TextField key={i} label="Bar width" type="number" size="small"
            value={sub.bar?.width ?? so.defaultWidth}
            onChange={(e) => setSub(def.id, { bar: { width: Number(e.target.value) } })} />
        );
        if (so.kind === 'timestamp') return (
          <TextField key={i} select label="Timestamp format" size="small"
            value={sub.timestamp?.format ?? so.default}
            onChange={(e) => setSub(def.id, { timestamp: { format: e.target.value as TimestampFormat } })}>
            {(['until','YYYY-MM-DD','DD/MM/YY','HH:mm'] as TimestampFormat[]).map((f) =>
              <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
        );
        if (so.kind === 'truncate') return (
          <Stack key={i} direction="row" spacing={1}>
            <TextField label="Max chars" type="number" size="small"
              value={sub.truncate?.maxChars ?? so.defaultMaxChars}
              onChange={(e) => setSub(def.id, { truncate: {
                maxChars: Number(e.target.value),
                basenameOnly: sub.truncate?.basenameOnly ?? so.basenameOnly,
              } })} />
            <FormControlLabel control={<Switch
              checked={sub.truncate?.basenameOnly ?? so.basenameOnly}
              onChange={(e) => setSub(def.id, { truncate: {
                maxChars: sub.truncate?.maxChars ?? so.defaultMaxChars,
                basenameOnly: e.target.checked,
              } })} />} label="Basename only" />
          </Stack>
        );
        if (so.kind === 'colorize') return (
          <Stack key={i} direction="row" spacing={1}>
            <TextField label="Yellow ≥" type="number" size="small"
              value={sub.colorize?.thresholds[0] ?? so.defaultThresholds[0]}
              onChange={(e) => setSub(def.id, { colorize: { thresholds: [
                Number(e.target.value),
                sub.colorize?.thresholds[1] ?? so.defaultThresholds[1],
              ] } })} />
            <TextField label="Red ≥" type="number" size="small"
              value={sub.colorize?.thresholds[1] ?? so.defaultThresholds[1]}
              onChange={(e) => setSub(def.id, { colorize: { thresholds: [
                sub.colorize?.thresholds[0] ?? so.defaultThresholds[0],
                Number(e.target.value),
              ] } })} />
          </Stack>
        );
        return null;
      })}
    </Stack>
  );
}
