import HubIcon from '@mui/icons-material/Hub';

import { useDecisionGraphActions, useDecisionGraphState } from '../context/dg-store.context';
import type { NodeKind } from '../nodes/specifications/specification-types';
import { nodeSpecification } from '../nodes/specifications/specifications';
import { Box, Tab, Tabs, Button, type SvgIconProps } from '@mui/material';
import { Close } from '@mui/icons-material';



export const GraphTabs = () => {
  const graphActions = useDecisionGraphActions();
  const { openNodes, activeNodeId } = useDecisionGraphState(({ decisionGraph, activeTab, openTabs }) => ({
    activeNodeId: (decisionGraph?.nodes ?? []).find((node) => node.id === activeTab)?.id,
    openNodes: (openTabs || [])
      .map((tab) => {
        const node = (decisionGraph?.nodes ?? []).find((node) => node.id === tab);
        if (!node) return undefined;
        return {
          id: node?.id,
          name: node.name,
          type: node.type,
          diff: node?._diff,
        };
      })
      .filter((node) => !!node),
  }));
  return(<Box >
    <Tabs sx={{maxHeight: "2em"}} value={activeNodeId || 'graph'} onChange={(e, val) => graphActions.openTab(val)}>
      <Tab sx={{minHeight: "1em"}} value='graph' label='Graph' iconPosition="start" icon={<HubIcon fontSize="small" />} />
      {openNodes.map((node,) => {
        const specification = nodeSpecification[node.type as NodeKind];
        return <Tab sx={{minHeight: "1em"}} key={node.id} value={node.id} label={<>{node.name}
        <Button size='small' variant='text' onClick={(e) => {
          e.stopPropagation();
          graphActions.closeTab(node.id);
        }}>
          <Close fontSize="small" />
        </Button>
          </>} 
          iconPosition="start" icon={specification?.icon as React.ReactElement<SvgIconProps>} />
      })}
    </Tabs>
  </Box>)
};
