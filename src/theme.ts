import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#7aa2f7' },
    background: { default: '#1a1b26', paper: '#24283b' } },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'system-ui, -apple-system, sans-serif' },
});
