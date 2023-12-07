import babel from '@babel/core';

import { UnaryOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const unaryOperatorMutator: NodeMutator<UnaryOperator> = {
  name: 'UnaryOperator',

  operators: {
    '+': { replacement: '-', mutationName: 'UnaryOperator_UnaryPlusOperator_ToUnaryMinusOperator' },
    '-': { replacement: '+', mutationName: 'UnaryOperator_UnaryMinusOperator_ToUnaryPlusOperator' },
    '~': { replacement: '', mutationName: 'UnaryOperator_BitwiseOrOperator_Removal' },
  },

  *mutate(path, levelMutations) {
    if (path.isUnaryExpression() && isSupported(path.node.operator) && path.node.prefix) {
      const mutation = this.operators[path.node.operator];

      if (levelMutations !== undefined && !levelMutations.includes(mutation.mutationName)) {
        // Mutator not allowed by MutationLevel
        return;
      }

      const replacementOperator = mutation.replacement.length
        ? types.unaryExpression(mutation.replacement as '-' | '+', deepCloneNode(path.node.argument))
        : deepCloneNode(path.node.argument);

      yield replacementOperator;
    }
  },
};

function isSupported(operator: string): operator is keyof typeof unaryOperatorMutator.operators {
  return operator in unaryOperatorMutator.operators;
}
