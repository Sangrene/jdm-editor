import { ApartmentOutlined, ApiOutlined, LeftOutlined, PlayCircleOutlined, RightOutlined } from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Select } from 'antd';
import json5 from 'json5';
import React, { useRef, useState } from 'react';

import { type PanelType, useDecisionGraphActions } from './context/dg-store.context';
import { DecisionGraph } from './dg';
import { GraphSimulator } from './dg-simulator';
import { defaultGraph, defaultGraphCustomNode, defaultGraphUnknownNode } from './dg.stories-values';
import type { Tab } from './graph/common-tab';
import type { GraphRef } from './graph/graph';
import { createJdmNode } from './nodes/custom-node';
import { GraphNode } from './nodes/graph-node';
import type { NodeSpecification } from './nodes/specifications/specification-types';

const meta: Meta<typeof DecisionGraph> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Decision Graph',
  component: DecisionGraph,
  argTypes: {},
  args: {
    //
  },
};

export default meta;

type Story = StoryObj<typeof DecisionGraph>;

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<any>(defaultGraph);
    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          {...args}
          value={value}
          onChange={(val) => {
            setValue?.(val);
          }}
        />
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  render: (args) => {
    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          {...args}
          defaultValue={defaultGraph}
          onChange={(val) => {
            args?.onChange?.(val);
          }}
        />
      </div>
    );
  },
};

const components: NodeSpecification[] = [
  {
    type: 'decisionNode',
    displayName: 'Decision',
    shortDescription: 'Execute decisions',
    icon: <ApartmentOutlined />,
    generateNode: () => ({ name: 'myDecision' }),
    renderNode: ({ specification, id, selected, data }) => (
      <GraphNode id={id} specification={specification} name={data.name} isSelected={selected}>
        <Select placeholder='Select decision from list' />
      </GraphNode>
    ),
  },
];

export const Extended: Story = {
  render: (args) => {
    const ref = useRef<GraphRef>(null);
    const [value, setValue] = useState<any>();

    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph {...args} ref={ref} value={value} onChange={(val) => setValue(val)} components={components} />
      </div>
    );
  },
};

const customTabsComponents: NodeSpecification[] = [
  {
    type: 'decisionNode',
    displayName: 'Decision',
    shortDescription: 'Execute decisions',
    icon: <ApartmentOutlined />,
    generateNode: () => ({ name: 'myDecision' }),
    renderNode: ({ specification, id, selected, data }) => {
      const graphActions = useDecisionGraphActions();
      return (
        <GraphNode
          id={id}
          specification={specification}
          name={data.name}
          isSelected={selected}
          actions={[
            <Button key='edit-table' type='link' onClick={() => graphActions.openTab(id)}>
              Edit Table
            </Button>,
          ]}
        ></GraphNode>
      );
    },
  },
];

const customTabs: Tab[] = [
  {
    type: 'decisionNode',
    tab: ({ id }) => {
      const graphActions = useDecisionGraphActions();

      return (
        <input
          onChange={(e) =>
            graphActions.updateNode(id, (draft) => {
              draft.content = e.target.value;
              return draft;
            })
          }
        ></input>
      );
    },
  },
];

export const CustomTab: Story = {
  render: (args) => {
    const ref = useRef<GraphRef>(null);
    const [value, setValue] = useState<any>();

    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          {...args}
          ref={ref}
          value={value}
          onChange={(val) => setValue(val)}
          components={customTabsComponents}
          customTabs={customTabs}
        />
      </div>
    );
  },
};

const customNodes = [
  createJdmNode({
    kind: 'pingNode',
    displayName: 'Ping',
    group: 'ping',
    shortDescription: 'Used for ping',
  }),
  createJdmNode({
    kind: 'pongNode',
    displayName: 'Pong',
    group: 'ping',
    shortDescription: 'Used for pong',
  }),
  createJdmNode({
    kind: 'rightHandleNode',
    group: 'integrations',
    displayName: 'Right Handle',
    icon: <RightOutlined />,
    handleLeft: false,
  }),
  createJdmNode({
    kind: 'leftHandleNode',
    group: 'integrations',
    displayName: 'Left Handle',
    icon: <LeftOutlined />,
    handleRight: false,
  }),
  createJdmNode({
    kind: 'inputsNode',
    group: 'inputs',
    displayName: 'Inputs Form',
    shortDescription: 'With inputs map form',
    icon: <ApiOutlined />,
    inputs: [
      {
        control: 'text',
        name: 'hello.nested.something',
        label: 'First',
      },
      {
        control: 'text',
        name: 'second',
        label: 'Second',
      },
      {
        control: 'bool',
        name: 'checkbox',
        label: 'Checkbox',
      },
    ],
  }),
];

export const CustomNode: Story = {
  render: (args) => {
    const ref = useRef<GraphRef>(null);
    const [value, setValue] = useState<any>(defaultGraphCustomNode);

    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          customNodes={customNodes}
          {...args}
          ref={ref}
          value={value}
          onChange={(val) => setValue(val)}
          components={components}
        />
      </div>
    );
  },
};

const unknownCustomNodes = [
  createJdmNode({
    kind: 'pingNode',
    displayName: 'Ping',
    group: 'ping',
    shortDescription: 'Used for ping',
  }),
];

export const UnknownCustomNode: Story = {
  render: (args) => {
    const ref = useRef<GraphRef>(null);
    const [value, setValue] = useState<any>(defaultGraphUnknownNode);

    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          customNodes={unknownCustomNodes}
          {...args}
          ref={ref}
          value={value}
          onChange={(val) => setValue(val)}
          components={components}
        />
      </div>
    );
  },
};

const panels: PanelType[] = [
  {
    id: 'simulator',
    title: 'Simulator',
    icon: <PlayCircleOutlined />,
    renderPanel: () => (
      <GraphSimulator
        defaultRequest={json5.stringify(
          {
            age: 20,
          },
          null,
          2,
        )}
        onChange={(val) => {
          console.log(val);
        }}
        onRun={(payload) => {
          console.log(payload);
        }}
        onClear={() => {}}
      />
    ),
  },
];

export const Simulator: Story = {
  render: (args) => {
    const [value, setValue] = useState<any>(defaultGraph);
    return (
      <div
        style={{
          height: '100%',
        }}
      >
        <DecisionGraph
          {...args}
          value={value}
          onPanelsChange={(val) => {
            console.log(val);
          }}
          defaultActivePanel={'simulator'}
          panels={panels}
          onChange={(val) => {
            setValue?.(val);
          }}
        />
      </div>
    );
  },
};
