import { FormControlLabel, Radio, RadioGroup, type RadioGroupProps, type RadioProps } from '@mui/material';
import React from 'react';

export type DiffRadioProps = {
  previousValue?: string;
  displayDiff?: boolean;
  options?: { label: string; value: string }[];
  radioOptions?: RadioProps;
} & RadioGroupProps;

export const DiffRadio: React.FC<DiffRadioProps> = ({ options, radioOptions, ...rest }) => {
  return (
    <RadioGroup {...rest}>
      {(options || []).map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio {...radioOptions} size='small' />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  );
};
