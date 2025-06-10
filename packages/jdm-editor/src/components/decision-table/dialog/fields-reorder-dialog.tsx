import React, { useEffect, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';

import { Stack } from '../../stack';
import type { TableSchemaItem } from '../context/dt-store.context';
import { Button, Dialog, DialogActions, DialogTitle, List, ListItem, Typography } from '@mui/material';
import { HTML5Backend } from 'react-dnd-html5-backend';

export type FieldsReorderProps = {
  fields?: TableSchemaItem[];
  onSuccess?: (columns: TableSchemaItem[]) => void;
  onDismiss?: () => void;
  isOpen?: boolean;
  getContainer?: () => HTMLElement;
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const FieldCard: React.FC<{
  col: TableSchemaItem;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}> = ({ col, index, moveCard }) => {
  const ref = useRef<HTMLLIElement>(null);
  const [, drop] = useDrop<DragItem, void>({
    accept: 'col',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'col',
    item: () => {
      return { id: col.id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  return (
    <ListItem ref={ref} sx={{ opacity: isDragging ? 0 : 1, padding: '0.5rem', cursor: 'move' }}>
        <Stack horizontal verticalAlign='center'>
          <div className='grl-dt__fields-reorder__handle'>=</div>
          <Stack grow gap={0}>
            <Typography>{col.name}</Typography>
            <Typography sx={{ fontSize: 12 }}>
              {col.field}
            </Typography>
          </Stack>
        </Stack>
    </ListItem>
  );
};

export const FieldsReorder: React.FC<FieldsReorderProps> = (props) => {
  const { isOpen, onDismiss, onSuccess, fields } = props;

  const [columns, setColumns] = useState<TableSchemaItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setColumns([...(fields || [])]);
    }
  }, [isOpen, fields]);

  const moveCard = (from: number, to?: number) => {
    if (to === undefined) {
      return;
    }

    const tmpList = [...columns];
    const element = tmpList.splice(from, 1)[0];
    tmpList.splice(to, 0, element);
    setColumns(tmpList);
  };

  return (
    <Dialog
      open={!!isOpen}
      onClose={onDismiss}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>Reorder fields</DialogTitle>
      <DndProvider backend={HTML5Backend}>
        <form action={() => onSuccess?.(columns)}>
          <List sx={{ p: 1}}>
            {columns.map((column, index) => (
              <FieldCard key={column.id} col={column} index={index} moveCard={moveCard} />
            ))}
          </List>
          <DialogActions>
            <Button size='small' type='submit' variant='contained'>Update</Button>
            <Button size='small' variant='outlined' onClick={onDismiss}>Cancel</Button>
          </DialogActions>
        </form>
      </DndProvider>
    </Dialog>
  );
};
