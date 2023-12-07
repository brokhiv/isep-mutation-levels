import babel from '@babel/core';

import { UpdateOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const updateOperatorMutator: NodeMutator<UpdateOperator> = {
  name: 'UpdateOperator',

  operators: {
    UpdateOperator_PostfixIncrementOperator_ToPostfixDecrementOperator: {
      replacement: '--',
      mutationName: 'UpdateOperator_PostfixIncrementOperator_ToPostfixDecrementOperator',
    },
    UpdateOperator_PostfixDecrementOperator_ToPostfixIncrementOperator: {
      replacement: '++',
      mutationName: 'UpdateOperator_PostfixDecrementOperator_ToPostfixIncrementOperator',
    },
    UpdateOperator_PrefixIncrementOperator_ToPrefixDecrementOperator: {
      replacement: '--',
      mutationName: 'UpdateOperator_PrefixIncrementOperator_ToPrefixDecrementOperator',
    },
    UpdateOperator_PrefixDecrementOperator_ToPrefixIncrementOperator: {
      replacement: '++',
      mutationName: 'UpdateOperator_PrefixDecrementOperator_ToPrefixIncrementOperator',
    },
  },

  *mutate(path, levelMutations) {
    if (path.isUpdateExpression()) {
      if (levelMutations === undefined) {
        const replacement = path.node.operator === '++' ? '--' : '++';
        yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
      } else {
        let replacement = undefined;
        if (path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, this.operators.UpdateOperator_PrefixIncrementOperator_ToPrefixDecrementOperator.mutationName);
        } else if (path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, this.operators.UpdateOperator_PrefixDecrementOperator_ToPrefixIncrementOperator.mutationName);
        } else if (!path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(
            levelMutations,
            this.operators.UpdateOperator_PostfixIncrementOperator_ToPostfixDecrementOperator.mutationName,
          );
        } else if (!path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(
            levelMutations,
            this.operators.UpdateOperator_PostfixDecrementOperator_ToPostfixIncrementOperator.mutationName,
          );
        }
        if (replacement !== undefined) {
          yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
        }
      }
    }
  },
};

function getReplacement(levelMutations: string[], mutationName: string): '--' | '++' | undefined {
  if (levelMutations.includes(mutationName)) {
    const { replacement } = updateOperatorMutator.operators[mutationName];
    return replacement;
  }
  return undefined;
}
