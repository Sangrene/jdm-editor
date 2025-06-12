import { Switch, type SwitchProps } from '@mui/material';
import React from 'react';

import { ArrowDiffIcon } from '../arrow-diff-icon';

export type DiffSwitchProps = {
  previousChecked?: boolean;
  displayDiff?: boolean;
} & SwitchProps;

export const DiffSwitch: React.FC<DiffSwitchProps> = ({ displayDiff, previousChecked, ...rest }) => {
  return (
    <React.Fragment>
      {displayDiff && (
        <>
          <Switch disabled={rest.disabled} size={'small'} checked={previousChecked} />
          <ArrowDiffIcon />
        </>
      )}
      <Switch size={'small'} {...rest} />
    </React.Fragment>
  );
};
