import React from 'react';
import { match } from 'ts-pattern';
import PanToolIcon from '@mui/icons-material/PanTool';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import AddBoxIcon from '@mui/icons-material/AddBox';

import type { DiffStatus } from './decision-graph/dg-types';
import type { SvgIconProps } from '@mui/material';

export const DiffIcon: React.FC<
  {
    status?: DiffStatus;
  } & SvgIconProps
> = ({ status, ...rest }) => {
  return match(status)
    .with('removed', () => (
      <IndeterminateCheckBoxIcon
        {...rest}
        sx={{
          color: 'var(--grl-color-error)',
          ...(rest?.sx || {}),
        }}
      />
    ))
    .with('added', () => (
      <AddBoxIcon
        {...rest}
        sx={{
          color: 'var(--grl-color-success)',
          ...(rest?.sx || {}),
        }}
      />
    ))
    .with('modified', () => (
      <span
        {...rest}
        style={{
          width: rest?.style?.fontSize ?? 14,
          height: rest?.style?.fontSize ?? 14,
          border: '1.5px solid var(--grl-color-warning)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxSizing: 'border-box',
          ...(rest?.style || {}),
        }}
      >
        <span
          style={{
            width: 3,
            height: 3,
            backgroundColor: 'var(--grl-color-warning)',
            borderRadius: '50%',
          }}
        />
      </span>
    ))
    .with('moved', () => (
      <PanToolIcon
        {...rest}
        sx={{
          color: 'var(--grl-color-info)',
          ...(rest?.style || {}),
        }}
      />
    ))
    .otherwise(() => null);
};
