import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Button, Tooltip } from '@mui/material';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import React from 'react';

import { DiffIcon } from '../../diff-icon';
import { Stack } from '../../stack';
import { TextEdit } from '../../text-edit';
import { InputFieldEdit } from '../components/input-field-edit';
import { OutputFieldEdit } from '../components/output-field-edit';
import { useDecisionTableDialog } from '../context/dt-dialog.context';
import { type TableSchemaItem, useDecisionTableActions, useDecisionTableState } from '../context/dt-store.context';
import { getReferenceMap } from '../util';

export type TableHeadCellProps = {
  configurable?: boolean;
  disabled?: boolean;
};

export type TableHeadCellFieldProps = {
  configurable?: boolean;
  disabled?: boolean;
  schema: TableSchemaItem;
};

export const TableHeadCellInput: React.FC<TableHeadCellProps> = ({ configurable, disabled }) => {
  const inputs = useDecisionTableState((store) => store.decisionTable?.inputs);
  const tableActions = useDecisionTableActions();
  const { setDialog } = useDecisionTableDialog();

  return (
    <div className={'head-cell'}>
      <Stack horizontal horizontalAlign='space-between' verticalAlign='center'>
        <Stack gap={0} className={'text-wrapper'} verticalAlign={'center'}>
          <Typography>Inputs</Typography>
        </Stack>
        {configurable && (
          <div className={'cta-wrapper'}>
            {inputs?.length > 1 && (
              <Tooltip title='Reorder fields'>
                <Button
                  startIcon={<SwapHorizIcon />}
                  size={'small'}
                  variant={'text'}
                  disabled={disabled}
                  onClick={() => {
                    setDialog({
                      type: 'reorder',
                      columnType: 'inputs',
                      item: null,
                    });
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title='Add input'>
              <Button
                size={'small'}
                variant={'text'}
                startIcon={<AddIcon />}
                disabled={disabled}
                onClick={() => {
                  tableActions.addColumn('inputs', {
                    id: crypto.randomUUID(),
                    name: 'New field',
                  });
                }}
              />
            </Tooltip>
          </div>
        )}
      </Stack>
    </div>
  );
};

export const TableHeadCellOutput: React.FC<TableHeadCellProps> = ({ configurable, disabled }) => {
  const outputs = useDecisionTableState((store) => store.decisionTable?.outputs);
  const tableActions = useDecisionTableActions();
  const { setDialog } = useDecisionTableDialog();

  return (
    <div className={'head-cell'}>
      <Stack horizontal horizontalAlign={'space-between'} verticalAlign={'center'}>
        <Stack gap={0} className={'text-wrapper'} verticalAlign={'center'}>
          <Typography className={'span-overflow grl-dt-text-primary'}>Outputs</Typography>
        </Stack>
        {configurable && (
          <div className={'cta-wrapper'}>
            {outputs?.length > 1 && (
              <Tooltip title='Reorder fields'>
                <Button
                  startIcon={<SwapHorizIcon />}
                  size={'small'}
                  variant={'text'}
                  disabled={disabled}
                  onClick={() => {
                    setDialog({
                      type: 'reorder',
                      columnType: 'outputs',
                      item: null,
                    });
                  }}
                />
              </Tooltip>
            )}
            <Tooltip title='Add output'>
              <Button
                size={'small'}
                variant={'text'}
                startIcon={<AddIcon />}
                disabled={disabled}
                onClick={() => {
                  tableActions.addColumn('outputs', { id: crypto.randomUUID(), name: 'Output', field: 'output' });
                }}
              />
            </Tooltip>
          </div>
        )}
      </Stack>
    </div>
  );
};

export const TableHeadCellInputField: React.FC<TableHeadCellFieldProps> = ({ configurable, disabled, schema }) => {
  const tableActions = useDecisionTableActions();
  const { inputData, inputVariableType } = useDecisionTableState(({ debug, inputVariableType }) => ({
    inputData: debug?.inputData,
    inputVariableType,
  }));

  const referenceData = useDecisionTableState(({ debug }) => {
    if (!debug) {
      return undefined;
    }

    const { trace, snapshot } = debug;
    const snapshotField = snapshot.inputs.find((i) => i.id === schema.id);
    if (!snapshotField?.field) {
      return undefined;
    }

    const referenceMap = getReferenceMap(trace);
    return {
      field: snapshotField.field,
      value: referenceMap?.[snapshotField.field],
    };
  });

  return (
    <div className={clsx(['head-cell'])}>
      <Stack horizontal horizontalAlign={'space-between'} verticalAlign={'center'}>
        <Stack gap={0} className={'text-wrapper'}>
          {schema?._diff?.fields?.name?.status === 'modified' && (
            <Typography className={clsx(['span-overflow', 'grl-dt-text-primary', 'text-removed'])}>
              {schema?._diff?.fields?.name?.previousValue}
            </Typography>
          )}
          <TextEdit
            className={clsx(['span-overflow', 'grl-dt-text-primary'])}
            value={schema.name}
            onChange={(name) => {
              tableActions.updateColumn('inputs', schema.id, { ...schema, name });
            }}
          />
          {schema?._diff?.fields?.field?.status && (
            <Typography
              className={clsx(['span-overflow', 'grl-dt-text-secondary', 'text-removed'])}
              style={{ fontSize: 12 }}
            >
              {schema?._diff?.fields?.field?.previousValue}
            </Typography>
          )}
          <InputFieldEdit
            value={schema.field}
            variableType={inputVariableType}
            inputData={inputData}
            referenceData={referenceData}
            disabled={disabled || !configurable}
            onRemove={() => {
              tableActions.removeColumn('inputs', schema.id);
            }}
            onChange={(field) => {
              tableActions.updateColumn('inputs', schema.id, { ...schema, field });
            }}
          />
        </Stack>
        <Stack horizontal gap={2} verticalAlign={'center'} style={{ width: 'auto' }}>
          <DiffIcon status={schema?._diff?.status} style={{ fontSize: 16 }} />
        </Stack>
      </Stack>
    </div>
  );
};

export const TableHeadCellOutputField: React.FC<TableHeadCellFieldProps> = ({ configurable, disabled, schema }) => {
  const tableActions = useDecisionTableActions();

  return (
    <div className={clsx(['head-cell'])}>
      <Stack horizontal horizontalAlign='space-between' verticalAlign={'center'}>
        <Stack gap={0} className={'text-wrapper'} verticalAlign={'center'}>
          {schema?._diff?.fields?.name?.status === 'modified' && (
            <Typography className={clsx(['span-overflow', 'grl-dt-text-primary', 'text-removed'])}>
              {schema?._diff?.fields?.name?.previousValue}
            </Typography>
          )}
          <TextEdit
            className={clsx(['span-overflow', 'grl-dt-text-primary'])}
            value={schema.name}
            onChange={(name) => {
              tableActions.updateColumn('outputs', schema.id, { ...schema, name });
            }}
          />
          {schema?._diff?.fields?.field?.status === 'modified' && (
            <Typography
              className={clsx(['span-overflow', 'grl-dt-text-secondary', 'text-removed'])}
              style={{ fontSize: 12 }}
            >
              {schema?._diff?.fields?.field?.previousValue}
            </Typography>
          )}
          <OutputFieldEdit
            value={schema.field}
            disabled={disabled || !configurable}
            onRemove={() => {
              tableActions.removeColumn('outputs', schema.id);
            }}
            onChange={(field) => {
              tableActions.updateColumn('outputs', schema.id, { ...schema, field });
            }}
          />
        </Stack>
        <Stack
          horizontal
          gap={2}
          verticalAlign={'center'}
          style={{
            width: 'auto',
          }}
        >
          <DiffIcon
            status={schema?._diff?.status}
            style={{
              fontSize: 16,
            }}
          />
        </Stack>
      </Stack>
    </div>
  );
};
