import { Card, CardContent, Typography, List, ListItem } from '@mui/material';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useStatuslineStore } from '../store/useStatuslineStore';
import { PARAMS_BY_ID } from '../schema/params';
import type { ParamId } from '../schema/types';

function Row({ id }: { id: ParamId }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <ListItem ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, cursor: 'grab' }}
      {...attributes} {...listeners}>
      <DragIndicatorIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
      <Typography variant="body2">{PARAMS_BY_ID[id]?.label ?? id}</Typography>
    </ListItem>
  );
}

export default function SelectedOrder() {
  const selected = useStatuslineStore((s) => s.selected);
  const reorder = useStatuslineStore((s) => s.reorder);
  if (selected.length === 0) return null;
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Selected (drag to reorder)</Typography>
        <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
          if (e.over && e.active.id !== e.over.id) {
            const from = selected.indexOf(e.active.id as ParamId);
            const to = selected.indexOf(e.over.id as ParamId);
            reorder(from, to);
          }
        }}>
          <SortableContext items={selected} strategy={verticalListSortingStrategy}>
            <List dense>{selected.map((id) => <Row key={id} id={id} />)}</List>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
