import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PARAMS } from '../schema/params';
import type { ParamGroup } from '../schema/types';
import ParamCheckbox from './ParamCheckbox';

const ORDER: ParamGroup[] = ['identity','workspace','git','context','cost','rate_limits','misc'];

export default function ParamList() {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Parameters</Typography>
        {ORDER.map((g) => {
          const items = PARAMS.filter((p) => p.group === g);
          return (
            <Accordion key={g} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">{g}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {items.map((p) => <ParamCheckbox key={p.id} def={p} />)}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </CardContent>
    </Card>
  );
}
