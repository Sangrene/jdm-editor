import { Editor } from '@monaco-editor/react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import json5 from 'json5';
import React, { useEffect, useState } from 'react';
import toJsonSchema from 'to-json-schema';

import { copyToClipboard } from '../../../helpers/utility';

export type JsonToJsonSchemaDialogProps = {
  id?: string;
  onSuccess?: (payload: { schema: string; model: string }) => void;
  onDismiss?: () => void;
  isOpen?: boolean;
  model?: string;
};

export const JsonToJsonSchemaDialog: React.FC<JsonToJsonSchemaDialogProps> = (props) => {
  const { isOpen, onDismiss, onSuccess, model } = props;

  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen && model) {
      setValue(model);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={!!isOpen}
      onClose={onDismiss}
      onSubmit={() => {
        try {
          onSuccess?.({
            schema: JSON.stringify(toJsonSchema(json5.parse(value)), null, 2),
            model: value,
          });
        } catch {
          // message.error(e?.message);
        }
      }}
    >
      <DialogTitle>Convert to JSON Schema</DialogTitle>
      <DialogContent>
        <Typography>Type or paste JSON or JSON5 model here and covert it to JSON Schema</Typography>
        <Editor
          loading={<CircularProgress size='large' />}
          language='javascript'
          theme={'light'}
          height='400px'
          onChange={(val) => setValue(val || '')}
          value={value || ''}
          onMount={(editor, monaco) => {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSyntaxValidation: true,
            });

            monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
              codeActions: false,
              inlayHints: false,
            });

            editor.addAction({
              id: 'copy-json',
              label: 'Copy JSON',
              contextMenuGroupId: 'utils',
              run: async (editor) => {
                try {
                  await copyToClipboard(JSON.stringify(json5.parse(editor.getValue())));
                  // message.success('Copied to clipboard!');
                } catch {
                  // message.error('Failed to copy to clipboard.');
                }
              },
            });

            editor.addAction({
              id: 'format',
              label: 'Format',
              contextMenuGroupId: 'utils',
              precondition: '!editorReadonly',
              run: (editor) => {
                const formatted = JSON.stringify(json5.parse(editor.getValue()), null, 2);
                editor.setValue(formatted);
              },
            });
          }}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'var(--mono-font-family)',
            tabSize: 2,
            lineDecorationsWidth: 2,
            find: {
              addExtraSpaceOnTop: false,
              seedSearchStringFromSelection: 'never',
            },
            scrollbar: {
              verticalSliderSize: 4,
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              horizontalSliderSize: 4,
            },
            lineNumbersMinChars: 3,
          }}
        />
        <DialogActions>
          <Button onClick={onDismiss}>Cancel</Button>
          <Button
            onClick={() => {
              onSuccess?.({
                schema: JSON.stringify(toJsonSchema(json5.parse(value)), null, 2),
                model: value,
              });
            }}
          >
            Convert
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
