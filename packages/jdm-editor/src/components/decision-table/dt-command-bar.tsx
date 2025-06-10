
import React, { useRef } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { DecisionNode } from '../decision-graph';
import { DiffSelect } from '../shared';
import { Stack } from '../stack';
import {
  type HitPolicy,
  useDecisionTableActions,
  useDecisionTableRaw,
  useDecisionTableState,
} from './context/dt-store.context';
import { exportDecisionTable, readDecisionTableFile } from './excel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Button, Divider, Tooltip } from '@mui/material';

export const DecisionTableCommandBar: React.FC = () => {
  const tableActions = useDecisionTableActions();
  const { disableHitPolicy, disabled, configurable, hitPolicy, diffHitPolicy, cursor } = useDecisionTableState(
    ({ disableHitPolicy, disabled, configurable, decisionTable, cursor }) => ({
      disableHitPolicy,
      disabled,
      configurable,
      cursor,
      hitPolicy: decisionTable.hitPolicy,
      diffHitPolicy: decisionTable?._diff?.fields?.hitPolicy,
    }),
  );

  const { listenerStore, stateStore } = useDecisionTableRaw();
  const fileInput = useRef<HTMLInputElement>(null);

  const exportExcel = async () => {
    try {
      const { decisionTable, name } = stateStore.getState();
      await exportDecisionTable(name ?? 'table', [
        { ...decisionTable, name: 'decision table', id: crypto.randomUUID() },
      ]);
      // message.success('Excel file has been downloaded successfully!');
    } catch (e) {
      console.error('Failed to download Excel file!', e);
      // message.error('Failed to download Excel file!');
    }
  };

  const importExcel = () => {
    fileInput?.current?.click?.();
  };

  const readExcelFile = async (event: any) => {
    const file = event?.target?.files[0];
    const reader = new FileReader();

    try {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const buffer = reader.result as ArrayBuffer;

        if (!buffer) return;

        const table = stateStore.getState().decisionTable;
        const nodes: DecisionNode[] = await readDecisionTableFile(buffer, table);
        const newTable = nodes[0].content;

        tableActions.setDecisionTable(newTable);
        listenerStore.getState().onChange?.(newTable);
      };
      // message.success('Excel file has been uploaded successfully!');
    } catch {
      // message.error('Failed to upload Excel!');
    }
  };

  return (
    <>
      <Stack horizontal horizontalAlign={'space-between'} verticalAlign={'center'} className={'grl-dt__command-bar'}>
        <Stack gap={8} horizontal className='full-width'>
          <Button variant='text' size={'small'} startIcon={<FileUploadIcon />} onClick={exportExcel}>
            Export Excel
          </Button>
          <Button
            variant='text'
            size={'small'}
            disabled={disabled}
            startIcon={<FileDownloadIcon />}
            onClick={() => importExcel()}
          >
            Import Excel
          </Button>
          {cursor && !disabled && (
            <>
              <Divider
                orientation='vertical'
                sx={{
                  height: 24,
                }}
              />
              <Tooltip title={'Add row below'}>
                <Button
                  variant='text'
                  size={'small'}
                  startIcon={<ArrowDownwardIcon />}
                  onClick={() => tableActions.addRowBelow(cursor?.y)}
                />
              </Tooltip>
              <Tooltip title={'Add row above'}>
                <Button
                  variant='text'
                  size={'small'}
                  startIcon={<ArrowUpwardIcon />}
                  onClick={() => tableActions.addRowAbove(cursor?.y)}
                />
              </Tooltip>
                  <Button variant='text' color='error' size={'small'} startIcon={<DeleteIcon />} onClick={() => tableActions.removeRow(cursor?.y)}/>
              <Button variant='text' size={'small'} startIcon={<CloseIcon />} onClick={() => tableActions.setCursor(null)}>
                Deselect
              </Button>
            </>
          )}
        </Stack>
        <DiffSelect
          displayDiff={diffHitPolicy?.status === 'modified'}
          style={{ width: 140 }}
          previousValue={diffHitPolicy?.previousValue}
          size={'small'}
          disabled={disabled || !configurable || disableHitPolicy}
          value={hitPolicy}
          onChange={(e) => tableActions.updateHitPolicy(e.target.value as HitPolicy)}
          options={[
            {
              key: 'first',
              label: 'First',
              value: 'first',
            },
            {
              key: 'collect',
              label: 'Collect',
              value: 'collect',
            },
          ]}
        />
      </Stack>
      <input
        multiple
        hidden
        accept='.xlsx'
        type='file'
        ref={fileInput}
        onChange={readExcelFile}
        onClick={(event) => {
          (event.target as any).value = null;
        }}
      />
    </>
  );
};
