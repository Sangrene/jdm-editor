import { TextField, type TextFieldProps } from '@mui/material';
import clsx from 'clsx';
import React from 'react';

export type DiffInputProps = TextFieldProps & {
  previousValue?: string;
  displayDiff?: boolean;
};

export const DiffInput: React.FC<DiffInputProps> = ({ previousValue, displayDiff, ...rest }) => {
  if (displayDiff) {
    return (
      <div className={'diff-input-group'}>
        {(previousValue || '')?.length > 0 && (
          <TextField
            {...rest}
            value={previousValue}
            onChange={undefined}
            className={clsx(rest.className, 'previous-input')}
          />
        )}
        {((rest?.value || '') as string)?.length > 0 && (
          <TextField {...rest} className={clsx(rest.className, 'current-input')} />
        )}
      </div>
    );
  }
  return <TextField {...rest} />;
};
