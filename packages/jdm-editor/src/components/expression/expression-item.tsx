import { DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import type { Row } from '@tanstack/react-table';
import { Button, Input, Popconfirm, Typography } from 'antd';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { get } from '../../helpers/utility';
import { CodeEditor } from '../code-editor';
import { type SimulationTraceDataExpression } from '../decision-graph';
import type { ExpressionEntry } from './context/expression-store.context';
import { useExpressionStore } from './context/expression-store.context';

export type ExpressionItemProps = {
  expression: ExpressionEntry;
  index: number;
};

export const ExpressionItem: React.FC<ExpressionItemProps> = ({ expression, index }) => {
  const expressionRef = useRef<HTMLDivElement>(null);
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

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    canDrag: configurable && !disabled,
    item: () => ({ ...expression, index }),
    type: 'row',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  previewRef(dropRef(expressionRef));

  return (
    <div
      ref={expressionRef}
      className={clsx(
        'expression-list-item',
        'expression-list__item',
        isDropping && direction === 'down' && 'dropping-down',
        isDropping && direction === 'up' && 'dropping-up',
      )}
      style={{ opacity: !isDragging ? 1 : 0.5 }}
    >
      <div ref={dragRef} className='expression-list-item__drag' aria-disabled={!configurable || disabled}>
        <MenuOutlined />
      </div>
      <div>
        <Input
          placeholder='Key'
          disabled={!configurable || disabled}
          value={expression?.key}
          onChange={(e) => onChange({ key: e.target.value })}
          autoComplete='off'
        />
      </div>
      <div className='expression-list-item__code'>
        <CodeEditor
          placeholder='Expression'
          maxRows={6}
          disabled={disabled}
          value={expression?.value}
          onChange={(value) => onChange({ value })}
        />
        <ResultOverlay expression={expression} />
      </div>
      <div>
        <Popconfirm
          title='Remove selected row?'
          okText='Remove'
          onConfirm={onRemove}
          disabled={!configurable || disabled}
        >
          <Button type='text' icon={<DeleteOutlined />} danger disabled={!configurable || disabled} />
        </Popconfirm>
      </div>
    </div>
  );
};

type ValueOf<T> = T[keyof T];

const ResultOverlay: React.FC<{ expression: ExpressionEntry }> = ({ expression }) => {
  const { trace } = useExpressionStore(({ traceData }) => ({
    trace: get<ValueOf<SimulationTraceDataExpression> | undefined>(traceData, expression.key, undefined)?.result,
  }));
  if (!trace) {
    return null;
  }

  return (
    <div className='expression-list-item__resultOverlay'>
      <Typography.Text>= {trace as string}</Typography.Text>
    </div>
  );
};
