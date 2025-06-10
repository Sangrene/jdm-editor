import { type Variable } from '@gorules/zen-engine-wasm';
import { Button, DialogActions, Popover, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import type { CodeEditorRef } from '../../code-editor';
import { CodeEditor } from '../../code-editor';
import { CodeEditorPreview } from '../../code-editor/ce-preview';
import { ConfirmAction } from '../../confirm-action';
import { Stack } from '../../stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type InputFieldEditProps = {
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onRemove?: () => void;
  variableType?: unknown;
  inputData?: Variable;
  referenceData?: { field: string; value: unknown };
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>;

export const InputFieldEdit: React.FC<InputFieldEditProps> = ({
  value,
  onChange,
  onRemove,
  disabled,
  variableType,
  inputData,
  referenceData,
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const codeEditor = useRef<CodeEditorRef>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (anchorEl) {
      setInnerValue(value);
      if (!codeEditor.current) {
        return;
      }

      setTimeout(() => {
        codeEditor.current!.codeMirror?.focus();
        const content = codeEditor.current!.querySelector('.cm-content');
        const selection = window.getSelection();
        if (content && selection) {
          selection.selectAllChildren(content);
        }
      });
    }
  }, [anchorEl]);

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
          <Typography style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>Input Field</Typography>
          <CodeEditor
            ref={codeEditor}
            value={innerValue}
            onChange={setInnerValue}
            variableType={variableType}
            disabled={disabled}
          />
          <CodeEditorPreview
              expression={innerValue ?? ''}
              inputData={inputData}
              initial={referenceData ? { expression: referenceData.field, result: referenceData.value } : undefined}
            />
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
