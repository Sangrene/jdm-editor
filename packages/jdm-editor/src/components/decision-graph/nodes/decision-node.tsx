import { Button, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import clsx from 'clsx';
import React from 'react';
import { Transition } from 'transition-hook';
import { match } from 'ts-pattern';

import { DiffIcon } from '../../diff-icon';
import { TextEdit } from '../../text-edit';
import './decision-node.scss';
import { GraphCard } from './graph-card';
import { NodeColor } from './specifications/colors';
import { bindMenu, bindTrigger } from 'material-ui-popup-state';
import PopupState from 'material-ui-popup-state';
import { Close } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export type DecisionNodeProps = {
  name?: string;
  icon: React.ReactNode;
  type: React.ReactNode;
  helper?: (React.ReactNode | false)[];
  disabled?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode[];
  status?: 'error' | 'success' | 'warning';
  diffStatus?: 'removed' | 'added' | 'modified' | 'moved';
  noBodyPadding?: boolean;
  color?: 'primary' | 'secondary' | string;
  menuItems?: Array<{label: React.ReactNode, key: string, onClick?: () => void, disabled?: boolean, icon?: React.ReactNode}>;
  onNameChange?: (name: string) => void;
  compactMode?: boolean;
  listMode?: boolean;
  details?: React.ReactNode;
  detailsOpen?: boolean;
  detailsTitle?: string;
  onDetailsClose?: () => void;
};

export const DecisionNode: React.FC<DecisionNodeProps> = ({
  icon,
  name,
  children,
  actions = [],
  disabled = false,
  isSelected = false,
  noBodyPadding = false,
  color = 'primary',
  onNameChange,
  menuItems = [],
  status,
  diffStatus,
  compactMode,
  listMode,
  helper,
  details,
  detailsOpen = false,
  detailsTitle = 'Details',
  onDetailsClose,
}) => {
  const nodeColor = match(color)
    .with('primary', () => NodeColor.Blue)
    .otherwise((c) => c);

  return (
    <div
      className={clsx(
        'grl-dn',
        compactMode && 'grl-dn--compact',
        listMode && 'grl-dn--list',
        !diffStatus && isSelected && `grl-dn--selected`,
        status && `grl-dn--${status}`,
        diffStatus && `grl-dn--diff-${diffStatus}`,
      )}
      style={
        {
          '--node-color': nodeColor,
        } as any
      }
      onKeyDown={(e) => e.stopPropagation()}
    >
      <GraphCard>
        <div className={'grl-dn__status-bar'}>
          {Array.isArray(helper) &&
            helper
              .filter((h) => !!h)
              .map((h, i) => (
                <div key={i} className={clsx('grl-dn__status-icon')}>
                  {h}
                </div>
              ))}
          {status === 'error' && (
            <div className={clsx('grl-dn__status-icon', `grl-dn__status-icon--${status}`)}>
              <Close />
            </div>
          )}
          <DiffIcon status={diffStatus} style={{ fontSize: 16 }} />
        </div>
        <div className={clsx('grl-dn__header', compactMode && 'compact')}>
          {!!icon && <div className={clsx('grl-dn__header__icon', compactMode && 'compact')}>{icon}</div>}
          <TextEdit onChange={onNameChange} disabled={disabled} value={name} />
          {menuItems.length > 0 && (
            <div className={clsx('grl-dn__header__actions', 'nodrag')}>
              <PopupState variant="popover">
                {(popupState) => (
                  <React.Fragment>
                    <Button size='small' variant="text" {...bindTrigger(popupState)}>
                      <MoreVertIcon fontSize='small' />
                    </Button>
                    <Menu {...bindMenu(popupState)}>
                      {menuItems.filter((item) => !!item).map((item) => (
                        <MenuItem key={item.key} onClick={() => {
                          item.onClick?.();
                          popupState.close();
                        }}>
                          {!!item.icon && 
                            <ListItemIcon>
                              {item.icon}
                            </ListItemIcon>
                          }
                          <ListItemText>{item.label}</ListItemText>
                        </MenuItem>
                      ))}
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            </div>
          )}
        </div>
        {children && (
          <div
            className={clsx(
              'grl-dn__body',
              actions.length === 0 && 'grl-dn__body--no-footer',
              noBodyPadding && 'grl-dn__body--no-padding',
            )}
          >
            {children}
          </div>
        )}
        {actions.length > 0 && (
          <div className={clsx('grl-dn__footer', 'nodrag')}>
            <div className='grl-dn__footer__actions'>{actions}</div>
          </div>
        )}
      </GraphCard>
      <Transition state={detailsOpen} timeout={100}>
        {(stage, shouldMount) =>
          shouldMount && (
            <GraphCard
              className='nodrag'
              style={{
                transition: '0.1s ease-in-out',
                transform: stage === 'enter' ? 'translateY(0)' : 'translateY(-10px)',
                opacity: stage === 'enter' ? 1 : 0,
              }}
            >
              <div className='grl-dn__details'>
                <div className='grl-dn__details__header'>
                  <Typography className='grl-dn__details__header__text'>{detailsTitle}</Typography>
                  <Button
                    variant='text'
                    size='small'
                    className='grl-dn__details__header__close'
                    startIcon={<Close sx={{ fontSize: 8 }} />}
                    onClick={onDetailsClose}
                  />
                </div>
                <div className='grl-dn__details__body'>{details}</div>
              </div>
            </GraphCard>
          )
        }
      </Transition>
    </div>
  );
};
