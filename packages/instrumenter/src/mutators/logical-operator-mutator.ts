import { LogicalOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

export const logicalOperatorMutator: NodeMutator<LogicalOperator> = {
  name: 'LogicalOperator',

  operators: {
    '&&': { replacement: '||', mutationName: 'LogicalAndOperatorNegation' },
    '||': { replacement: '&&', mutationName: 'LogicalOrOperatorNegation' },
    '??': { replacement: '&&', mutationName: 'NullishCoalescingOperatorToLogicalAndReplacement' },
  },

  *mutate(path, levelMutations) {
    if (path.isLogicalExpression() && isSupported(path.node.operator) && isInMutationLevel(path.node.operator, levelMutations)) {
      const mutatedOperator = this.operators[path.node.operator].replacement;

      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },

  isMutable(path): boolean {
    return path.isLogicalExpression() && isSupported(path.node.operator);
  },

  numberOfMutants(_): number {
    return 1;
  },
};

function isSupported(operator: string): operator is keyof typeof logicalOperatorMutator.operators {
  return Object.keys(logicalOperatorMutator.operators).includes(operator);
}

function isInMutationLevel(operator: string, levelMutations: string[] | undefined): boolean {
  return levelMutations === undefined || levelMutations.includes(logicalOperatorMutator.operators[operator].mutationName as string);
}
