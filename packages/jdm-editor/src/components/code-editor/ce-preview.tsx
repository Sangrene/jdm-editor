import { type Variable } from '@gorules/zen-engine-wasm';
import stringifyPretty from 'json-stringify-pretty-compact';
import React, { useMemo } from 'react';

import { isWasmAvailable } from '../../helpers/wasm';
import { CodeEditor } from './ce';

import { Typography } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
export type CodeEditorPreviewProps = {
  initial?: { expression: string; result: unknown };
  expression: string;
  inputData?: Variable;
  noPreviewText?: string;
};

export const CodeEditorPreview: React.FC<CodeEditorPreviewProps> = ({
  initial,
  expression,
  inputData,
  noPreviewText = 'Run simulation to see the results',
}) => {
  const preview = useMemo(() => {
    if (!inputData) {
      return undefined;
    }

    if (!isWasmAvailable() || expression === initial?.expression) {
      return { type: 'initial' as const, value: stringifyPretty(initial?.result, { maxLength: 30 }) };
    }

    if (!expression) {
      return { type: 'none' as const, value: '-' };
    }

    try {
      const value = inputData.evaluateExpression(expression);
      return { type: 'success' as const, value: stringifyPretty(value, { maxLength: 30 }) };
    } catch (err) {
      return { type: 'error' as const, value: (err as any).toString() };
    }
  }, [inputData, expression, initial]);

  return (
    <div>
      <Typography variant='body2'>
        Live Preview <BugReportIcon sx={{fontSize: '1em', opacity: 0.5}} />
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {preview?.type === 'initial' ? 'Based on simulation data' : 'Based on live calculation'}
      </Typography>
      <div className='grl-ce-preview'>
        {(preview?.type === 'success' || preview?.type === 'initial') && (
          <CodeEditor value={preview.value} disabled noStyle maxRows={3} />
        )}
        {preview?.type === 'none' && (
          <Typography variant='body2' color='text.secondary' sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {preview.value}
          </Typography>
        )}
        {preview?.type === 'error' && (
          <Typography variant='body2' color='error.main' sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {preview.value}
          </Typography>
        )}
        {!preview && (
          <Typography variant='body2' color='text.secondary' sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {noPreviewText}
          </Typography>
        )}
      </div>
    </div>
  );
};
