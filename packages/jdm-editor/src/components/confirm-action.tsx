import { Button, type ButtonProps, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState } from 'react';
import { P, match } from 'ts-pattern';

export type ConfirmActionProps = {
  iconOnly?: boolean;
  text?: string;
  confirmText?: string;
  onConfirm?: () => void;
  icon?: React.ReactNode;
} & Omit<ButtonProps, 'children'>;

export const ConfirmAction: React.FC<ConfirmActionProps> = ({
  iconOnly = false,
  text = 'Delete',
  confirmText = 'Really delete?',
  icon = <DeleteIcon />,
  onClick,
  onBlur,
  onConfirm,
  disabled,
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const tooltipOpen = match([iconOnly, disabled])
    .with([P._, true], () => false)
    .with([false, P._], () => false)
    .otherwise(() => undefined);

  return (
    <Tooltip open={tooltipOpen} title={isConfirming ? confirmText : text}>
      <Button
        variant='text'
        color={isConfirming ? 'error' : 'inherit'}
        startIcon={icon}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (isConfirming) {
            onConfirm?.();
            setIsConfirming(false);
            return;
          }

          setIsConfirming(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setIsConfirming(false);
        }}
        {...props}
      >
        {match([iconOnly, isConfirming])
          .with([false, true], () => confirmText)
          .with([false, false], () => text)
          .otherwise(() => undefined)}
      </Button>
    </Tooltip>
  );
};
