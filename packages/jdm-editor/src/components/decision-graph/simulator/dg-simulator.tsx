import clsx from 'clsx';
import json5 from 'json5';
import React, { useMemo, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { P, match } from 'ts-pattern';

import '../../../helpers/monaco';
import { usePersistentState } from '../../../helpers/use-persistent-state';
import { useDecisionGraphRaw, useDecisionGraphState } from '../context/dg-store.context';
import { NodeKind } from '../nodes/specifications/specification-types';
import type { SimulationTrace } from './simulation.types';
import { SimulatorEditor } from './simulator-editor';
import { SimulatorRequestPanel, type SimulatorRequestPanelProps } from './simulator-request-panel';
import { Typography, Tooltip, Button, Tabs, CircularProgress, Tab } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

enum SimulationSegment {
  Output = 'Output',
  Input = 'Input',
  Trace = 'Trace',
}

export type GraphSimulatorProps = {
  onClear?: () => void;
  loading?: boolean;
  defaultRequest?: SimulatorRequestPanelProps['defaultRequest'];
  onChange?: SimulatorRequestPanelProps['onChange'];
  onRun?: SimulatorRequestPanelProps['onRun'];
  leftPanel?: React.FC<SimulatorRequestPanelProps>;
};

export const GraphSimulator: React.FC<GraphSimulatorProps> = ({
  defaultRequest,
  onChange,
  onRun,
  onClear,
  loading = false,
  leftPanel: LeftPanel = SimulatorRequestPanel,
}) => {
  const [search, setSearch] = usePersistentState<string>('simulation.search', '');
  const [segment, setSegment] = usePersistentState<SimulationSegment>('simulation.segment', SimulationSegment.Output);

  const { actions } = useDecisionGraphRaw();
  const { nodeTypes, simulate, hasInputNode } = useDecisionGraphState(({ decisionGraph, simulate }) => ({
    simulate,
    hasInputNode: decisionGraph.nodes.some((n) => n.type === NodeKind.Input),
    nodeTypes: (decisionGraph.nodes ?? []).reduce<Record<string, string | undefined>>(
      (acc, curr) => ({
        ...acc,
        [curr.id]: curr.type,
      }),
      {},
    ),
  }));

  const [selectedNode, setSelectedNode] = useState<string>('graph');

  const traces = useMemo<Array<SimulationTrace & { nodeId: string }>>(() => {
    if (!simulate) {
      return [];
    }

    if (!('result' in simulate)) {
      return [];
    }

    return Object.entries(simulate.result?.trace ?? {})
      .map(([key, data]) => ({ ...data, nodeId: key }))
      .filter((t) => ![NodeKind.Input].includes(nodeTypes?.[t.nodeId] as NodeKind))
      .filter((t) => t.name.toLowerCase().includes(search?.toLowerCase() ?? ''))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [simulate, search]);

  return (
    <PanelGroup className='grl-dg__simulator' direction='horizontal' autoSaveId='jdm-editor:simulator:layout'>
      <Panel minSize={20} defaultSize={30} className='grl-dg__simulator__section grl-dg__simulator__request'>
        <LeftPanel
          defaultRequest={defaultRequest}
          loading={loading}
          hasInputNode={hasInputNode}
          onRun={onRun}
          onChange={onChange}
        />
      </Panel>
      <PanelResizeHandle />
      <Panel minSize={20} maxSize={20} className={'grl-dg__simulator__section grl-dg__simulator__nodes'}>
        <div className={'grl-dg__simulator__section__bar grl-dg__simulator__section__bar--nodes'}>
          <input
            className='grl-dg__simulator__search'
            type='text'
            placeholder='Search nodes...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={'grl-dg__simulator__section__bar__actions'}>
            {onClear && (
              <Tooltip title={'Clear'}>
                <Button
                  size='small'
                  variant='text'
                  startIcon={<BackspaceIcon />}
                  onClick={() => {
                    onClear?.();
                    setSelectedNode('graph');
                    setSearch('');
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>
        <div className={'grl-dg__simulator__section__content'}>
          {loading && <CircularProgress />}
            <div className={'grl-dg__simulator__nodes-list'}>
              {!simulate && (
                <Typography variant='body2' color='text.secondary' style={{ textAlign: 'center', marginTop: 60, fontSize: 13 }}>
                  Ready to simulate!
                  <br />
                  Run a request to see the node trace in action.
                  <br />
                  <Typography variant='body2' component='a'
                    href='https://docs.gorules.io/docs/simulator'
                    target='_blank'
                    style={{ fontSize: 13, marginTop: 4, display: 'inline-block' }}
                  >
                    Learn more
                  </Typography>
                </Typography>
              )}
              {'graph'.includes(search?.toLowerCase() ?? '') && simulate && (
                <div
                  className={clsx('grl-dg__simulator__nodes-list__node', selectedNode === 'graph' && 'active')}
                  onClick={() => setSelectedNode('graph')}
                >
                  <Typography variant='body2' data-role='name' sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    <StatusIcon
                      status={match(simulate)
                        .with({ error: P.nonNullable }, () => 'error' as const)
                        .with({ result: P.nonNullable }, () => 'success' as const)
                        .otherwise(() => 'not-run' as const)}
                    />
                    Graph
                  </Typography>
                  <Typography variant='body2' color='text.secondary' data-role='performance'>
                    {match(simulate)
                      .with({ result: P._ }, ({ result }) => result?.performance)
                      .otherwise(() => undefined)}
                  </Typography>
                </div>
              )}
              {traces.map((trace) => (
                <div
                  key={trace.nodeId}
                  className={clsx('grl-dg__simulator__nodes-list__node', trace.nodeId === selectedNode && 'active')}
                  onClick={() => setSelectedNode(trace.nodeId)}
                  onDoubleClick={() => actions.goToNode(trace.nodeId)}
                >
                  <Typography variant='body2' data-role='name' sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    <StatusIcon status={trace.nodeId === simulate?.error?.data?.nodeId ? 'error' : 'success'} />
                    {trace.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' data-role='performance'>
                    {trace.performance}
                  </Typography>
                </div>
              ))}
            </div>
        </div>
      </Panel>
      <PanelResizeHandle />
      <Panel minSize={30} defaultSize={50} className={'grl-dg__simulator__section grl-dg__simulator__response'}>
        <div className={'grl-dg__simulator__section__bar grl-dg__simulator__section__bar--response'}>
          <Tabs
            className='grl-inline-tabs'
            sx={{ width: '100%' }}
            onChange={(_, tab) => setSegment(tab as SimulationSegment)}
            value={segment}
          >
            {Object.values(SimulationSegment).map((s) => (
              <Tab key={s} label={s} value={s} />
            ))}
             
            <Tooltip title='Close panel'>
              <Button
                variant='text'
                size='small'
                startIcon={<CloseIcon style={{ fontSize: 12 }} />}
                onClick={() => actions.setActivePanel(undefined)}
              />
            </Tooltip>
          </Tabs>
        </div>
        <div className={'grl-dg__simulator__section__content'}>
          <SimulatorEditor
            readOnly
            value={match(simulate)
              .with({ result: P._ }, ({ result }) =>
                match(selectedNode)
                  .with('graph', () =>
                    displaySegment(
                      {
                        traceData: result?.trace,
                        output: result?.result,
                      },
                      segment ?? SimulationSegment.Output,
                    ),
                  )
                  .otherwise(() => displaySegment(result?.trace[selectedNode], segment ?? SimulationSegment.Output)),
              )
              .otherwise(() => '')}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
};

const displaySegment = (data: unknown, segment: SimulationSegment) => {
  const jsonData = match([segment, data])
    .with([SimulationSegment.Output, { output: P._ }], ([, { output }]) => output)
    .with([SimulationSegment.Input, { input: P._ }], ([, { input }]) => input)
    .with([SimulationSegment.Trace, { trace: P._ }], ([, { trace }]) => trace)
    .with([SimulationSegment.Trace, { traceData: P._ }], ([, { traceData }]) => traceData)
    .otherwise(() => ({}));

  return json5.stringify(jsonData, undefined, 2);
};

const StatusIcon: React.FC<{ status: 'success' | 'error' | 'not-run' }> = ({ status }) => {
  if (status === 'not-run') {
    return null;
  }

  if (status === 'success') {
    return (
      <CheckCircleIcon
        sx={{ marginRight: 6, fontSize: 12, opacity: 0.5 }}
      />
    );
  }

  return (
    <HighlightOffIcon
      sx={{ marginRight: 5, fontSize: 12 }}
    />
  );
};
