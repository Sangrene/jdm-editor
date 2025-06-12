import { DiffEditor, Editor } from '@monaco-editor/react';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import InputIcon from '@mui/icons-material/Input';
import { Button, CircularProgress, Tab, Tabs, Tooltip } from '@mui/material';
import type { DragDropManager } from 'dnd-core';
import { type editor } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from 'react';
import { PanelGroup } from 'react-resizable-panels';
import { match } from 'ts-pattern';
import { useThrottledCallback } from 'use-debounce';

import { useDecisionGraphActions, useDecisionGraphState, useNodeDiff } from '../context/dg-store.context';
import { JsonToJsonSchemaDialog } from './json-to-json-schema-dialog';

const schemaTooltip = 'Provide JSON Schema format. If no JSON Schema is provided, validation will be skipped.';

const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  contextmenu: false,
  fontSize: 13,
  fontFamily: 'var(--mono-font-family)',
  tabSize: 2,
  minimap: { enabled: false },
  overviewRulerBorder: false,
  scrollbar: {
    verticalSliderSize: 4,
    verticalScrollbarSize: 4,
    horizontalScrollbarSize: 4,
    horizontalSliderSize: 4,
  },
};

export type TabJsonSchemaProps = {
  id: string;
  manager?: DragDropManager;
  type?: 'input' | 'output';
};

export const TabJsonSchema: React.FC<TabJsonSchemaProps> = ({ id, type = 'input' }) => {
  const graphActions = useDecisionGraphActions();

  const language = 'json';

  const [jsonToJsonSchemaOpen, setJsonToJsonSchemaOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('Schema');

  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();
  const [diffEditor, setDiffEditor] = useState<editor.IStandaloneDiffEditor>();
  const resizeEditor = useThrottledCallback(() => editor?.layout(), 100, { trailing: true });
  const resizeDiffEditor = useThrottledCallback(() => diffEditor?.layout(), 100, { trailing: true });

  const { disabled, content } = useDecisionGraphState(({ simulate, disabled, configurable, decisionGraph }) => ({
    nodeError: match(simulate)
      .with({ error: { data: { nodeId: id } } }, ({ error }) => error)
      .otherwise(() => null),
    disabled,
    configurable,
    content: (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content,
  }));

  const { contentDiff } = useNodeDiff(id);

  const previousValue = useMemo(() => {
    return contentDiff?.fields?.schema?.previousValue;
  }, [contentDiff]);

  useEffect(() => {
    window.addEventListener('resize', resizeEditor);
    return () => window.removeEventListener('resize', resizeEditor);
  }, [resizeEditor, editor]);

  useEffect(() => {
    window.addEventListener('resize', resizeDiffEditor);
    return () => window.removeEventListener('resize', resizeDiffEditor);
  }, [resizeDiffEditor, diffEditor]);

  return (
    <div
      className='grl-node-content'
      data-theme={'light'}
      style={
        {
          height: '100%',
        } as any
      }
    >
      <PanelGroup
        className='grl-node-content-main'
        direction='horizontal'
        autoSaveId={`jdm-editor:${type}:schema:layout`}
      >
        <div className='grl-node-content-side'>
          <div className='grl-node-content-side__panel'>
            <div className='grl-node-content-side__header'>
              <Tabs value={activeTab} onChange={(_, t) => setActiveTab(t)}>
                <Tooltip title={schemaTooltip} placement='bottom-start'>
                  <Tab label='Schema' value={'Schema'} />
                </Tooltip>
                <Tooltip title='Format code' placement='bottom-start'>
                  <Button
                    size='small'
                    variant='text'
                    disabled={disabled}
                    startIcon={<FormatPaintIcon />}
                    onClick={() => editor?.getAction?.('editor.action.formatDocument')?.run?.()}
                  />
                </Tooltip>
                <Tooltip title='Import from JSON' placement='bottom-start'>
                  <Button
                    variant='text'
                    size={'small'}
                    disabled={disabled}
                    startIcon={<InputIcon />}
                    onClick={() => {
                      setJsonToJsonSchemaOpen(true);
                    }}
                  />
                </Tooltip>
              </Tabs>
            </div>
            <div className='grl-node-content-side__body'>
              {previousValue !== undefined ? (
                <DiffEditor
                  loading={<CircularProgress size='large' />}
                  language={language}
                  original={previousValue}
                  modified={content?.schema}
                  onMount={(editor) => setDiffEditor(editor)}
                  theme={'light'}
                  height='100%'
                  options={{
                    ...monacoOptions,
                    readOnly: true,
                  }}
                />
              ) : (
                <Editor
                  loading={<CircularProgress size='large' />}
                  language={language}
                  value={content?.schema || ''}
                  onMount={(editor) => setEditor(editor)}
                  onChange={(value) => {
                    graphActions.updateNode(id, (draft) => {
                      draft.content = { schema: value };
                      return draft;
                    });
                  }}
                  theme={'light'}
                  height='100%'
                  options={{
                    ...monacoOptions,
                    readOnly: disabled,
                  }}
                />
              )}
            </div>
            <JsonToJsonSchemaDialog
              isOpen={jsonToJsonSchemaOpen}
              onDismiss={() => setJsonToJsonSchemaOpen(false)}
              onSuccess={({ schema, model }) => {
                localStorage.setItem(`${id}-model`, model);
                graphActions.updateNode(id, (draft) => {
                  draft.content = { schema };
                  return draft;
                });
                setJsonToJsonSchemaOpen(false);
              }}
              model={localStorage.getItem(`${id}-model`) || undefined}
            />
          </div>
        </div>
      </PanelGroup>
    </div>
  );
};
