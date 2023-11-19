import babel, { types } from '@babel/core';

import { MutationLevel } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

const operators = {
  '<': [
    { replacement: '<=', mutatorName: '<To<=' },
    { replacement: '>=', mutatorName: '<To>=' },
  ],
  '<=': [
    { replacement: '<', mutatorName: '<=To<' },
    { replacement: '>', mutatorName: '<=To>' },
  ],
  '>': [
    { replacement: '>=', mutatorName: '>To>=' },
    { replacement: '<=', mutatorName: '>To<=' },
  ],
  '>=': [
    { replacement: '>', mutatorName: '>=To>' },
    { replacement: '<', mutatorName: '>=To<' },
  ],
  '==': [{ replacement: '!=', mutatorName: '==To!=' }],
  '!=': [{ replacement: '==', mutatorName: '!=To==' }],
  '===': [{ replacement: '!==', mutatorName: '===To!==' }],
  '!==': [{ replacement: '===', mutatorName: '!==To===' }],
} as const;

function isEqualityOperator(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}
export const equalityOperatorMutator: NodeMutator = {
  name: 'EqualityOperator',

  *mutate(path, options) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = filterMutationLevel(path.node, options);
      // throw new Error(allMutations.toString());
      for (const mutableOperator of allMutations) {
        const replacement = t.cloneNode(path.node, true);
        replacement.operator = mutableOperator.replacement;
        yield replacement;
      }
    }
  },
};

function filterMutationLevel(node: types.BinaryExpression, level?: MutationLevel) {
  const allMutations = operators[node.operator as keyof typeof operators];

  // No mutation level specified, so allow everything
  if (level === undefined) {
    return allMutations;
  }

  if (level.EqualityOperator === undefined) {
    return [];
  }

  return allMutations.filter((mut) => level.EqualityOperator!.some((op) => op === mut.mutatorName));
}
