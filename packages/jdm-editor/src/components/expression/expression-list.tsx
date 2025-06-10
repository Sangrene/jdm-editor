import AddIcon from '@mui/icons-material/Add';
import type { VariableType } from '@gorules/zen-engine-wasm';
import clsx from 'clsx';
import equal from 'fast-deep-equal/es6/react';
import React, { useEffect, useState } from 'react';

import { isWasmAvailable } from '../../helpers/wasm';
import { useExpressionStore } from './context/expression-store.context';
import { ExpressionItem } from './expression-item';
import { Typography } from '@mui/material';
import { Button } from '@mui/material';

export type ExpressionListProps = {
  //
};

export const ExpressionList: React.FC<ExpressionListProps> = ({}) => {
  const { expressions, addRowBelow, configurable, disabled, inputVariableType } = useExpressionStore(
    ({ expressions, addRowBelow, configurable, disabled, inputVariableType }) => ({
      expressions,
      addRowBelow,
      configurable,
      disabled,
      inputVariableType,
    }),
    equal,
  );

  const [variableType, setVariableType] = useState<VariableType>();

  useEffect(() => {
    if (!isWasmAvailable() || !inputVariableType) {
      return;
    }

    const resultingVariableType = inputVariableType.clone();
    expressions
      .filter((e) => e.key.length > 0)
      .forEach((expr) => {
        const calculatedType = resultingVariableType.calculateType(expr.value);
        resultingVariableType.set(`$.${expr.key}`, calculatedType);
      });

    setVariableType(resultingVariableType);
  }, [expressions, inputVariableType]);

  return (
    <>
      <div className={'expression-list'}>
        <div className={clsx('expression-list__item', 'expression-list__item--heading')}>
          <div className={'expression-list__item__th expression-list__item__th--order'} />
          <Typography className={'expression-list__item__th expression-list__item__th--key'}>
            Key
          </Typography>
          <Typography className={'expression-list__item__th'}>
            Expression
          </Typography>
          <div />
        </div>
        {(expressions || []).map((expression, index) => (
          <ExpressionItem key={expression.id} expression={expression} index={index} variableType={variableType} />
        ))}
      </div>
      {configurable && !disabled && (
        <div className={'expression-list__button-wrapper'}>
          <Button
            className='expression-list__button'
            startIcon={<AddIcon />}
            variant='text'
            onClick={() => addRowBelow()}
          >
            Add row
          </Button>
        </div>
      )}
    </>
  );
};
