import { VariableType } from '@gorules/zen-engine-wasm';
import { ArrowRight, Sync } from '@mui/icons-material';
import TagIcon from '@mui/icons-material/Tag';
import { Button, FormLabel } from '@mui/material';
import equal from 'fast-deep-equal/es6/react';
import { produce } from 'immer';
import _ from 'lodash';
import type { z } from 'zod';

import { useNodeType } from '../../../../helpers/node-type';
import type { expressionNodeSchema } from '../../../../helpers/schema';
import { DiffCodeEditor, DiffInput, DiffRadio, DiffSwitch } from '../../../shared';
import { useDecisionGraphActions, useDecisionGraphState, useNodeDiff } from '../../context/dg-store.context';
import { type Diff, type DiffMetadata } from '../../dg-types';
import { compareAndUnifyLists, compareStringFields } from '../../diff/comparison';
import { TabExpression } from '../../graph/tab-expression';
import { GraphNode } from '../graph-node';
import type { NodeDecisionTableData } from './decision-table.specification';
import type { NodeSpecification } from './specification-types';
import { NodeKind } from './specification-types';

export type Expression = {
  id: string;
  key?: string;
  value?: string;
};

type InferredContent = z.infer<typeof expressionNodeSchema>['content'];

export type NodeExpressionData = Omit<InferredContent, 'expressions'> &
  Diff & {
    expressions: (InferredContent['expressions'][0] & Diff)[];
  };

export const expressionSpecification: NodeSpecification<NodeExpressionData> = {
  type: NodeKind.Expression,
  icon: <TagIcon fontSize='small' />,
  displayName: 'Expression',
  documentationUrl: 'https://gorules.io/docs/user-manual/decision-modeling/decisions/expression',
  shortDescription: 'Mapping utility',
  renderTab: ({ id, manager }) => <TabExpression id={id} manager={manager} />,
  getDiffContent: (current, previous) => {
    const newContent = produce(current, (draft) => {
      const fields: DiffMetadata['fields'] = {};

      if ((current.executionMode || false) !== (previous.executionMode || false)) {
        _.set(fields, 'executionMode', {
          status: 'modified',
          previousValue: previous.executionMode,
        });
      }

      if (!compareStringFields(current.inputField, previous.inputField)) {
        _.set(fields, 'inputField', {
          status: 'modified',
          previousValue: previous.inputField,
        });
      }

      if (!compareStringFields(current.outputPath, previous.outputPath)) {
        _.set(fields, 'outputPath', {
          status: 'modified',
          previousValue: previous.outputPath,
        });
      }

      if ((current.passThrough || false) !== (previous.passThrough || false)) {
        _.set(fields, 'passThrough', {
          status: 'modified',
          previousValue: previous.passThrough,
        });
      }

      const expressions = compareAndUnifyLists(current?.expressions || [], previous?.expressions || [], {
        compareFields: (current, previous) => {
          const hasKeyChange = !compareStringFields(current.key, previous.key);
          const hasValueChange = !compareStringFields(current.value, previous.value);

          return {
            hasChanges: hasKeyChange || hasValueChange,
            fields: {
              ...(hasKeyChange && {
                key: {
                  status: 'modified',
                  previousValue: previous.key,
                },
              }),
              ...(hasValueChange && {
                value: {
                  status: 'modified',
                  previousValue: previous.value,
                },
              }),
            },
          };
        },
      });

      draft.expressions = expressions;

      if (
        expressions.find(
          (expr) =>
            expr?._diff?.status === 'modified' || expr?._diff?.status === 'added' || expr?._diff?.status === 'removed',
        )
      ) {
        _.set(fields, 'expressions', {
          status: 'modified',
        });
      }

      if (Object.keys(fields).length > 0) {
        draft._diff = {
          status: 'modified',
          fields,
        };
      }

      return draft;
    });
    return newContent;
  },
  inferTypes: {
    needsUpdate: (content, prevContent) => !equal(content, prevContent),
    determineOutputType: ({ input, content }) => {
      let nodeInput = input.clone();
      let determinedType = VariableType.fromJson({ Object: {} });
      if (content.inputField) {
        nodeInput = input.calculateType(content.inputField);
      }

      if (content.executionMode === 'loop') {
        nodeInput = nodeInput.arrayItem();
      }

      (content.expressions || []).forEach((expression) => {
        if (!expression.key || !expression.value) {
          return;
        }

        const calculatedType = nodeInput.calculateType(expression.value);

        nodeInput.set(`$.${expression.key}`, calculatedType);
        determinedType.set(expression.key, calculatedType);
      });

      if (content.executionMode === 'loop') {
        determinedType = determinedType.toArray();
      }

      if (content.outputPath) {
        const newType = VariableType.fromJson({ Object: {} });
        newType.set(content.outputPath, determinedType);
        determinedType = newType;
      }

      if (content.passThrough) {
        determinedType = input.merge(determinedType);
      }

      return determinedType;
    },
  },
  generateNode: ({ index }) => ({
    name: `expression${index}`,
    content: {
      inputField: null,
      outputPath: null,
      expressions: [],
      passThrough: true,
      executionMode: 'single',
    },
  }),
  renderNode: ({ id, data, selected, specification }) => {
    const graphActions = useDecisionGraphActions();
    const { passThrough, executionMode } = useDecisionGraphState(({ decisionGraph }) => {
      const content = (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content as NodeExpressionData;
      return {
        passThrough: content?.passThrough || false,
        executionMode: content?.executionMode,
      };
    });

    return (
      <GraphNode
        id={id}
        specification={specification}
        name={data.name as string}
        isSelected={selected}
        actions={[
          <Button key='edit-table' variant='text' onClick={() => graphActions.openTab(id)}>
            Edit Expression
          </Button>,
        ]}
        helper={[executionMode === 'loop' && <Sync />, passThrough && <ArrowRight />]}
      />
    );
  },
  renderSettings: ({ id }) => {
    const graphActions = useDecisionGraphActions();
    const { contentDiff } = useNodeDiff(id);
    const inputType = useNodeType(id);

    const { fields, disabled } = useDecisionGraphState(({ decisionGraph, disabled }) => {
      const content = (decisionGraph?.nodes ?? []).find((node) => node.id === id)?.content as NodeDecisionTableData;
      return {
        disabled,
        fields: {
          passThrough: content?.passThrough || false,
          inputField: content?.inputField,
          outputPath: content?.outputPath,
          executionMode: content?.executionMode || 'single',
        },
      };
    });

    const updateNode = (data: Partial<NodeExpressionData>) => {
      graphActions.updateNode(id, (draft) => {
        Object.assign(draft.content, data);
        return draft;
      });
    };

    return (
      <div className={'settings-form'}>
        <FormLabel>Passthrough</FormLabel>
        <DiffSwitch
          disabled={disabled}
          size={'small'}
          displayDiff={contentDiff?.fields?.passThrough?.status === 'modified'}
          checked={fields?.passThrough}
          previousChecked={contentDiff?.fields?.passThrough?.previousValue}
          onChange={(_, checked) => updateNode({ passThrough: checked })}
        />
        <FormLabel>Input field</FormLabel>
        <DiffCodeEditor
          variableType={inputType}
          disabled={disabled}
          displayDiff={contentDiff?.fields?.inputField?.status === 'modified'}
          previousValue={contentDiff?.fields?.inputField?.previousValue}
          style={{ fontSize: 12, lineHeight: '20px', width: '100%' }}
          expectedVariableType={fields?.executionMode === 'loop' ? { Array: 'Any' } : undefined}
          maxRows={4}
          value={fields?.inputField ?? ''}
          onChange={(val) => updateNode({ inputField: val?.trim() || null })}
        />

        <DiffInput
          label='Output path'
          sx={{ mt: 1 }}
          size={'small'}
          disabled={disabled}
          displayDiff={contentDiff?.fields?.outputPath?.status === 'modified'}
          previousValue={contentDiff?.fields?.outputPath?.previousValue}
          value={fields?.outputPath ?? ''}
          onChange={(e) => updateNode({ outputPath: e?.target?.value?.trim() || null })}
        />
        <FormLabel>Execution mode</FormLabel>
        <DiffRadio
          radioOptions={{ size: 'small', disabled: disabled }}
          displayDiff={contentDiff?.fields?.executionMode?.status === 'modified'}
          previousValue={contentDiff?.fields?.executionMode?.previousValue}
          value={fields?.executionMode}
          onChange={(e) => updateNode({ executionMode: e?.target?.value as 'single' | 'loop' })}
          options={[
            {
              value: 'single',
              label: 'Single',
            },
            {
              value: 'loop',
              label: 'Loop',
            },
          ]}
        />
      </div>
    );
  },
};
