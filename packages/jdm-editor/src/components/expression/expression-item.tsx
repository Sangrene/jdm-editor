import type { VariableType } from '@gorules/zen-engine-wasm';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Typography } from '@mui/material';
import type { Row } from '@tanstack/react-table';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { CodeEditorPreview } from '../code-editor/ce-preview';
import { ConfirmAction } from '../confirm-action';
import { DiffIcon } from '../diff-icon';
import { DiffAutosizeTextArea } from '../shared';
import { DiffCodeEditor } from '../shared/diff-ce';
import type { ExpressionEntry } from './context/expression-store.context';
import { useExpressionStore } from './context/expression-store.context';

export type ExpressionItemProps = {
  expression: ExpressionEntry;
  index: number;
  variableType?: VariableType;
};

export const ExpressionItem: React.FC<ExpressionItemProps> = ({ expression, index, variableType }) => {
  const [isFocused, setIsFocused] = useState(false);
  const expressionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { updateRow, removeRow, swapRows, disabled, configurable } = useExpressionStore(
    ({ updateRow, removeRow, swapRows, disabled, configurable }) => ({
      updateRow,
      removeRow,
      swapRows,
      disabled,
      configurable,
    }),
  );

  const onChange = (update: Partial<Omit<ExpressionEntry, 'id'>>) => {
    updateRow(index, update);
  };

  const onRemove = () => {
    removeRow(index);
  };

  const [{ isDropping, direction }, dropRef] = useDrop({
    accept: 'row',
    collect: (monitor) => ({
      isDropping: monitor.isOver({ shallow: true }),
      direction: (monitor.getDifferenceFromInitialOffset()?.y || 0) > 0 ? 'down' : 'up',
    }),
    drop: (draggedRow: Row<Record<string, string>>) => {
      swapRows(draggedRow.index, index);
    },
  });

  const [{ isDragging }, dragConnector, previewRef] = useDrag({
    canDrag: configurable && !disabled,
    item: () => ({ ...expression, index }),
    type: 'row',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  dragConnector(dragRef);
  previewRef(dropRef(expressionRef));

  return (
    <div
      ref={expressionRef}
      className={clsx(
        'expression-list-item',
        'expression-list__item',
        isDropping && direction === 'down' && 'dropping-down',
        isDropping && direction === 'up' && 'dropping-up',
        expression?._diff?.status && `expression-list__item--${expression?._diff?.status}`,
      )}
      style={{ opacity: !isDragging ? 1 : 0.5 }}
    >
      <div ref={dragRef} className='expression-list-item__drag' aria-disabled={!configurable || disabled}>
        <div className='expression-list-item__drag__inner'>
          {expression?._diff?.status ? (
            <DiffIcon
              status={expression?._diff?.status}
              style={{
                fontSize: 16,
              }}
            />
          ) : (
            <DragHandleIcon fontSize='small' />
          )}
        </div>
      </div>
      <div
        className='expression-list-item__key'
        onClick={(e) => {
          if (e.target instanceof HTMLTextAreaElement) {
            return;
          }

          const inputElement = e.currentTarget.querySelector<HTMLTextAreaElement>('textarea');
          if (!inputElement) {
            return;
          }

          inputElement.focus();
          const inputLength = inputElement.value.length;
          inputElement.setSelectionRange(inputLength, inputLength);
        }}
      >
        <DiffAutosizeTextArea
          noStyle
          placeholder='Key'
          maxRows={10}
          readOnly={!configurable || disabled}
          displayDiff={expression?._diff?.fields?.key?.status === 'modified'}
          previousValue={expression?._diff?.fields?.key?.previousValue}
          value={expression?.key}
          onChange={(e) => onChange({ key: e.target.value })}
          autoComplete='off'
        />
      </div>
      <div className='expression-list-item__code'>
        <DiffCodeEditor
          className='expression-list-item__value'
          placeholder='Expression'
          maxRows={9}
          disabled={disabled}
          value={expression?.value}
          displayDiff={expression?._diff?.fields?.value?.status === 'modified'}
          previousValue={expression?._diff?.fields?.value?.previousValue}
          onChange={(value) => onChange({ value })}
          variableType={variableType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          noStyle={true}
        />
        <ResultOverlay expression={expression} />
      </div>
      <div className='expression-list-item__action'>
        <ConfirmAction iconOnly disabled={!configurable || disabled} onConfirm={onRemove} />
        {isFocused && <LivePreview id={expression.id} value={expression.value} />}
      </div>
    </div>
  );
};

const LivePreview = React.memo<{ id: string; value: string }>(({ id, value }) => {
  const { inputData, initial } = useExpressionStore(({ debug }) => {
    const snapshot = (debug?.snapshot?.expressions ?? []).find((e) => e.id === id);
    const trace = snapshot?.key ? debug?.trace.traceData[snapshot.key] : undefined;

    return {
      inputData: debug?.inputData,
      initial: snapshot && trace ? { expression: snapshot.value, result: safeJson(trace.result) } : undefined,
    };
  });

  return (
    <div className='expression-list-item__livePreview'>
      <CodeEditorPreview expression={value} inputData={inputData} initial={initial} />
    </div>
  );
});

const ResultOverlay: React.FC<{ expression: ExpressionEntry }> = ({ expression }) => {
  const { trace } = useExpressionStore(({ debug }) => ({
    trace: debug?.trace?.traceData?.[expression.key]?.result,
  }));
  if (!trace) {
    return null;
  }

  return (
    <div className='expression-list-item__resultOverlay'>
      <Typography sx={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>= {trace as string}</Typography>
    </div>
  );
};

const safeJson = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (err: any) {
    return err.toString();
  }
};
