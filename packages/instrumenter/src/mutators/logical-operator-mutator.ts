import { LogicalOperator } from '@stryker-mutator/api/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';
import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const operators: NodeMutatorConfiguration<LogicalOperator> = {
  '&&': { replacement: '||', mutationName: 'LogicalOperator_LogicalAndOperator_ToLogicalOrOperator' },
  '||': { replacement: '&&', mutationName: 'LogicalOperator_LogicalOrOperator_ToLogicalAndOperator' },
  '??': { replacement: '&&', mutationName: 'LogicalOperator_NullishCoalescingOperator_ToLogicalAnd' },
};

export const logicalOperatorMutator: NodeMutator = {
  name: 'LogicalOperator',

  *mutate(path, levelMutations) {
    if (path.isLogicalExpression() && isSupported(path.node.operator) && isInMutationLevel(path.node.operator, levelMutations)) {
      const mutatedOperator = operators[path.node.operator].replacement;

      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}

function isInMutationLevel(operator: string, levelMutations: string[] | undefined): operator is keyof typeof operators {
  return levelMutations === undefined || levelMutations.includes(operators[operator].mutationName as string);
}
