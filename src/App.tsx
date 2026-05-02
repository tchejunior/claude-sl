import { Box, Typography } from '@mui/material';
import GlobalControls from './controls/GlobalControls';
import ParamList from './controls/ParamList';
import SelectedOrder from './controls/SelectedOrder';
import OutputPanel from './output/OutputPanel';

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Claude Code Status Line Builder</Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 3fr' },
        gap: 2,
        alignItems: 'start',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <GlobalControls />
          <ParamList />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SelectedOrder />
          <OutputPanel />
        </Box>
      </Box>
    </Box>
  );
}
