import AddIcon from '@mui/icons-material/Add';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import LaunchIcon from '@mui/icons-material/Launch';
import { Button, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import type { editor } from 'monaco-editor';
import React, { useMemo, useState } from 'react';
import { match } from 'ts-pattern';

import typeScriptIcon from '../../assets/typescript.svg?inline';
import type { SimulationTrace, SimulationTraceDataFunction } from '../decision-graph/simulator/simulation.types';
import { FunctionDebuggerLog } from './function-debugger-log';
import { type FunctionLibrary } from './helpers/libs';

enum TabKey {
  Console = 'Console',
  Libraries = 'Libraries',
}

export type FunctionDebuggerProps = {
  trace?: SimulationTrace<SimulationTraceDataFunction>;
  editor?: editor.IStandaloneCodeEditor;
  editorValue?: string;
  libraries: FunctionLibrary[];
};

export const FunctionDebugger: React.FC<FunctionDebuggerProps> = ({ trace, editor, libraries = [], editorValue }) => {
  const traceLog = trace?.traceData?.log || [];
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Console);

  return (
    <div className='grl-function__debugger'>
      <div className='grl-function__debugger__panel'>
        <div className='grl-function__debugger__header'>
          <Tabs value={activeTab} onChange={(_, t) => setActiveTab(t as TabKey)}>
            <Tab value={TabKey.Console} label='Console' />
            <Tab value={TabKey.Libraries} label='Libraries' />
          </Tabs>
          <Tooltip title='Format code'>
            <Button
              size='small'
              variant='text'
              startIcon={<FormatPaintIcon />}
              onClick={() => editor?.getAction?.('editor.action.formatDocument')?.run?.()}
            />
          </Tooltip>
        </div>
        <div className='grl-function__debugger__body'>
          {match(activeTab)
            .with(TabKey.Console, () => (
              <>
                {traceLog.length === 0 && (
                  <FunctionDebuggerLog
                    lines={['"Info: Use console.log and run simulation to debug your code."']}
                    msSinceRun={null}
                  />
                )}

                {traceLog.map((log, i) => (
                  <FunctionDebuggerLog key={i} lines={log.lines} msSinceRun={log.msSinceRun} />
                ))}
              </>
            ))
            .with(TabKey.Libraries, () => (
              <div className='grl-function__libraries'>
                {libraries.map((lib) => (
                  <FunctionLibraryItem
                    key={lib.name}
                    lib={lib}
                    editorValue={editorValue}
                    onImport={() => {
                      if (!editor) {
                        return;
                      }

                      const importStatement = `import ${lib.importName ?? lib.name} from '${lib.name}';`;
                      editor.setValue(importStatement + '\n' + editor.getValue());
                    }}
                  />
                ))}
              </div>
            ))
            .exhaustive()}
        </div>
      </div>
    </div>
  );
};

const FunctionLibraryItem: React.FC<{ lib: FunctionLibrary; onImport?: () => void; editorValue?: string }> = ({
  lib,
  onImport,
  editorValue,
}) => {
  const canImport = useMemo(() => {
    if (!editorValue) {
      return true;
    }

    return !editorValue.includes(`from "${lib.name}"`) && !editorValue.includes(`from '${lib.name}'`);
  }, [lib.name, editorValue]);

  return (
    <div key={lib.name} className='grl-function__libraries__item'>
      <img alt='TypeScript Library' src={typeScriptIcon} height={18} />
      <Typography variant='h6'>{lib.name}</Typography>
      <Typography variant='body2' color='text.secondary' style={{ fontSize: 12, marginTop: 1.5 }}>
        {lib.tagline}
      </Typography>
      <div className='grl-function__libraries__item__actions'>
        <Tooltip title='Import library' placement='bottom-start'>
          <Button variant='text' size='small' startIcon={<AddIcon />} disabled={!canImport} onClick={onImport} />
        </Tooltip>
        <Tooltip title='Go to documentation' placement='bottom-start'>
          <Button
            variant='text'
            size='small'
            startIcon={<LaunchIcon />}
            href={lib.documentationUrl}
            rel='noopener noreferrer'
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled={!lib.documentationUrl}
          />
        </Tooltip>
      </div>
    </div>
  );
};
