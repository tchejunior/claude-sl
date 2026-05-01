import { Box, Checkbox, IconButton, Collapse, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import type { ParamDef } from '../schema/types';
import { useStatuslineStore } from '../store/useStatuslineStore';
import SubOptionEditor from './SubOptionEditor';

export default function ParamCheckbox({ def }: { def: ParamDef }) {
  const selected = useStatuslineStore((s) => s.selected.includes(def.id));
  const useEmojis = useStatuslineStore((s) => s.global.useEmojis);
  const toggle = useStatuslineStore((s) => s.toggleParam);
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox checked={selected} onChange={() => toggle(def.id)} size="small" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {def.label} {useEmojis && def.emoji ? def.emoji : ''}
        </Typography>
        {def.subOptions && (
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {def.subOptions && <Collapse in={open}><SubOptionEditor def={def} /></Collapse>}
    </Box>
  );
}
