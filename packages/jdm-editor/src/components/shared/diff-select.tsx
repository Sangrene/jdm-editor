import React from 'react';

import { InputLabel, FormControl, MenuItem, Select } from '@mui/material';
import { Box, type BoxProps, type SelectProps } from '@mui/material';

export type DiffSelectProps = Omit<SelectProps, 'direction'> & {
  previousValue?: string;
  displayDiff?: boolean;
  direction?: BoxProps['flexDirection'];
  gap?: BoxProps['gap'];
  options?: Array<{
    key: string;
    label: string;
    value: string;
  }>;
};

export const DiffSelect: React.FC<DiffSelectProps> = ({
  direction = 'column',
  previousValue,
  displayDiff,
  gap = 1,
  options,
  ...rest
}) => {
  return (
    <Box sx={{ display: 'flex', }} gap={gap} flexDirection={direction}>
      {displayDiff && (
        <>
        <FormControl>
        <InputLabel id="select-label-previous-">Previous value</InputLabel>
        <Select
          labelId="select-label-previous"
          id="select-previous"
          value={previousValue}
          label="Previous value"
          onChange={undefined}
          disabled
        >
          {options?.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        </>
      )}
    
      <FormControl>
        <InputLabel id="select-label">{rest.label}</InputLabel>
        <Select
          {...rest}
          disabled={rest.disabled || displayDiff}
          labelId="select-label"
          id="select"
          >
          {options?.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
