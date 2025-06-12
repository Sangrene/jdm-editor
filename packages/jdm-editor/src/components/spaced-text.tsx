import { Typography } from '@mui/material';
import React from 'react';

import { Stack } from './stack';

export type SpacedTextProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  gap?: number;
};

export const SpacedText: React.FC<SpacedTextProps> = ({ left, right, gap = 16 }) => {
  return (
    <Stack gap={gap} horizontal horizontalAlign='space-between'>
      <Typography style={{ color: 'inherit' }}>{left}</Typography>
      {right && <Typography style={{ color: 'inherit' }}>{right}</Typography>}
    </Stack>
  );
};
