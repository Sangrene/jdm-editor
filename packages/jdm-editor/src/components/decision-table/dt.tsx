import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { DecisionTableDialogProvider } from './context/dt-dialog.context';
import type { DecisionTableContextProps } from './context/dt-store.context';
import { DecisionTableProvider } from './context/dt-store.context';
import { DecisionTableDialogs } from './dialog/dt-dialogs';
import { DecisionTableCommandBar } from './dt-command-bar';
import type { DecisionTableEmptyType } from './dt-empty';
import { DecisionTableEmpty } from './dt-empty';  
import './dt.scss';
import { Table } from './table/table';

export type DecisionTableProps = {
  id?: string;
  tableHeight: string | number;
} & DecisionTableContextProps &
  DecisionTableEmptyType;

export const DecisionTable: React.FC<DecisionTableProps> = ({
  id,
  tableHeight,
  ...props
}) => {

  const [_, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <div ref={ref} className={'grl-dt'}>
      {ref.current && (
        <DndProvider backend={HTML5Backend}>
          <DecisionTableProvider>
            <DecisionTableDialogProvider>
              <DecisionTableCommandBar />
              <Table id={id} maxHeight={tableHeight} />
              <DecisionTableDialogs />
              <DecisionTableEmpty {...props} />
            </DecisionTableDialogProvider>
          </DecisionTableProvider>
        </DndProvider>
      )}
    </div>
  );
};
