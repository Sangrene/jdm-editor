import React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export const ArrowDiffIcon: React.FC<{ direction?: 'right' | 'down'; size?: 'small' | 'medium' }> = ({
  direction = 'right',
  size = 'small',
}) => {
  if (direction === 'down')
    return (
      <ArrowDownwardIcon
        className={'text-modified'}
        fontSize={size}
      />
    );
  return (
    <ArrowRightIcon
      className={'text-modified'}
      fontSize={size}
    />
  );
};
