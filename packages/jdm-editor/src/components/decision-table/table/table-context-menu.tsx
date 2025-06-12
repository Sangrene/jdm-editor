import { Box, Menu, MenuItem } from '@mui/material';
import PopupState from 'material-ui-popup-state';
import { bindMenu } from 'material-ui-popup-state/hooks';
import React from 'react';

import { SpacedText } from '../../spaced-text';
import { useDecisionTableActions, useDecisionTableState } from '../context/dt-store.context';

const ContextMenu: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  const tableActions = useDecisionTableActions();
  const { cursor, disabled } = useDecisionTableState(({ cursor, disabled }) => ({
    cursor,
    disabled,
  }));
  const menuItems = [
    {
      key: 'addRowAbove',
      label: <SpacedText left='Add row above' />,
      onClick: () => {
        if (cursor) tableActions.addRowAbove(cursor?.y);
      },
    },
    {
      key: 'addRowBelow',
      label: <SpacedText left='Add row below' />,
      onClick: () => {
        if (cursor) tableActions.addRowBelow(cursor?.y);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'remove',
      label: <SpacedText left='Remove row' />,
      onClick: () => {
        if (cursor) tableActions.removeRow(cursor?.y);
      },
    },
  ];

  return (
    <PopupState variant='popover'>
      {(popupState) => (
        <>
          <Box
            sx={{ position: 'relative' }}
            onContextMenu={(e) => {
              if (!disabled) {
                e.preventDefault();
                popupState.open();
              }
            }}
          >
            {children}
          </Box>
          <Menu {...bindMenu(popupState)}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.key}
                onClick={() => {
                  item.onClick?.();
                  popupState.close();
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </PopupState>
  );
};

export const TableContextMenu = React.memo(ContextMenu);
