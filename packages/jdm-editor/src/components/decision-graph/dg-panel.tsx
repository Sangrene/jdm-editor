import CloseIcon from '@mui/icons-material/Close';
import { Button, Tooltip, Typography } from '@mui/material';
import { Resizable } from 're-resizable';
import React, { useMemo } from 'react';

import { useDecisionGraphActions, useDecisionGraphState } from './context/dg-store.context';

const heightKey = 'jdmEditor:graphPanel:height';

export const GraphPanel = () => {
  const graphActions = useDecisionGraphActions();
  const { panels, activePanel: activePanelId } = useDecisionGraphState(({ panels, activePanel }) => ({
    panels,
    activePanel,
  }));

  const activePanel = useMemo(() => {
    return activePanelId === undefined ? undefined : (panels || []).find((panel) => panel.id === activePanelId);
  }, [activePanelId, panels]);

  const defaultHeight = useMemo(() => {
    return Number.parseFloat(localStorage.getItem(heightKey) ?? '') ?? 300;
  }, [activePanel]);

  if (!activePanel) return null;

  return (
    <Resizable
      className={'grl-dg__panel'}
      defaultSize={{ height: defaultHeight }}
      handleStyles={{
        bottom: { display: 'none' },
        left: { display: 'none' },
        topLeft: { display: 'none' },
        topRight: { display: 'none' },
        right: { display: 'none' },
        bottomLeft: { display: 'none' },
        bottomRight: { display: 'none' },
      }}
      maxHeight={500}
      minHeight={150}
      onResize={(event, direction, elementRef) => {
        localStorage.setItem(heightKey, elementRef.clientHeight.toString());
      }}
    >
      {!activePanel.hideHeader && (
        <div className={'grl-dg__panel__toolbar'}>
          <div className={'grl-dg__panel__toolbar__content'}>
            <Typography style={{ fontSize: 13 }}>{activePanel.title}</Typography>
          </div>
          <div className={'grl-dg__panel__toolbar__actions'}>
            <Tooltip title={'Close panel'}>
              <Button
                size={'small'}
                variant='text'
                startIcon={<CloseIcon style={{ fontSize: 12 }} />}
                onClick={() => graphActions.setActivePanel(undefined)}
              />
            </Tooltip>
          </div>
        </div>
      )}
      <div className={'grl-dg__panel__content'}>{activePanel?.renderPanel?.({}) as React.ReactNode}</div>
    </Resizable>
  );
};
