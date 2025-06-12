import React from 'react';
import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { match } from 'ts-pattern';

import { useDecisionGraphActions, useDecisionGraphState, useEdgeDiff } from './context/dg-store.context';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const graphActions = useDecisionGraphActions();
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
  const { isHovered, disabled } = useDecisionGraphState(({ hoveredEdgeId, disabled }) => ({
    isHovered: hoveredEdgeId === id,
    disabled,
  }));

  const { diff } = useEdgeDiff(id);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...(style || {}),
          stroke: match(diff)
            .with({ status: 'added' }, () => 'var(--grl-color-success)')
            .with({ status: 'removed' }, () => 'var(--grl-color-error)')
            .otherwise(() => undefined),
        }}
      />
      <EdgeLabelRenderer>
        <div
          className={'nodrag nopan edge-renderer'}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {!disabled && isHovered && (
            <IconButton
              color='error'
              size='small'
              onClick={() => graphActions.removeEdges([id])}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const edgeFunction = (outer: any) => (props: any) => <CustomEdge {...props} {...outer} />;
