
import React, { useState } from 'react';
import { Button, DialogActions, Popover, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConfirmAction } from '../../confirm-action';
import { Stack } from '../../stack';

type OutputFieldEditProps = {
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
};

export const OutputFieldEdit: React.FC<OutputFieldEditProps> = ({
  disabled,
  value,
  onChange,
  onRemove,
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);



  return (
    <>
    <Button
      size='small'
      color={!value ? "success" : "inherit"}
      sx={{textTransform: 'none'}}
      onClick={(e) => setAnchorEl(e.currentTarget)}
      endIcon={<ExpandMoreIcon fontSize={"small"} />}
      >
        {value}
      </Button>
    <Popover
      open={!!anchorEl} 
      onClose={() => setAnchorEl(null)}
      anchorEl={anchorEl}
    >
      <div
          style={{ width: 300, padding: 16 }}
          data-simulation='propagateWithTimeout'
          onKeyDownCapture={(e) => {
            const isSubmit = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
            const isCancel = e.key === 'Escape';
            if (!isSubmit && !isCancel) {
              return;
            }

            e.preventDefault();
            e.stopPropagation();
            setAnchorEl(null);
            if (!disabled && isSubmit && innerValue && innerValue.trim()) {
              onChange?.(innerValue.trim());
            }
          }}
        >
          <TextField label='Output Field' size='small' value={innerValue} onChange={(e) => setInnerValue(e.target.value)} disabled={disabled} />
          <DialogActions>
            <ConfirmAction iconOnly onConfirm={onRemove} disabled={disabled} />
            <Stack horizontal width='auto' verticalAlign='end'>
              <Button size='small' onClick={() => setAnchorEl(null)}>
                Cancel
              </Button>
              <Button
                variant='contained'
                disabled={disabled}
                size='small'
                onClick={() => {
                  onChange?.(innerValue ?? '');
                  setAnchorEl(null);
                }}
              >
                Set value
              </Button>
            </Stack>
          </DialogActions>
        </div>
      
    </Popover>
    </>
    
  );
};
