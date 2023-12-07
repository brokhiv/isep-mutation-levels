import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators: NodeMutatorConfiguration = {
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
  '++': { replacement: '--', mutationName: '++all' },
  '--': { replacement: '++', mutationName: '--all' },
};

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path, levelMutations) {
    if (path.isUpdateExpression()) {
      if (levelMutations === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        yield types.updateExpression(operators[path.node.operator].replacement, deepCloneNode(path.node.argument), path.node.prefix);
      } else {
        let replacement = undefined;
        if (path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, operators.UpdateOperator_PrefixIncrementOperator_ToPrefixDecrementOperator.mutationName);
        } else if (path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, operators.UpdateOperator_PrefixDecrementOperator_ToPrefixIncrementOperator.mutationName);
        } else if (!path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, operators.UpdateOperator_PostfixIncrementOperator_ToPostfixDecrementOperator.mutationName);
        } else if (!path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, operators.UpdateOperator_PostfixDecrementOperator_ToPostfixIncrementOperator.mutationName);
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
    const { replacement } = operators[mutationName];
    return replacement;
  }
  return undefined;
}
