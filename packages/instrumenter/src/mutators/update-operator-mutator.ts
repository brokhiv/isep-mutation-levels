import babel from '@babel/core';

import { UpdateOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

export const updateOperatorMutator: NodeMutator<UpdateOperator> = {
  name: 'UpdateOperator',

  operators: {
    PostfixIncrementOperatorNegation: {
      replacement: '--',
      mutationOperator: 'PostfixIncrementOperatorNegation',
    },
    PostfixDecrementOperatorNegation: {
      replacement: '++',
      mutationOperator: 'PostfixDecrementOperatorNegation',
    },
    PrefixIncrementOperatorNegation: {
      replacement: '--',
      mutationOperator: 'PrefixIncrementOperatorNegation',
    },
    PrefixDecrementOperatorNegation: {
      replacement: '++',
      mutationOperator: 'PrefixDecrementOperatorNegation',
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
          replacement = getReplacement(levelMutations, this.operators.PrefixIncrementOperatorNegation.mutationOperator);
        } else if (path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, this.operators.PrefixDecrementOperatorNegation.mutationOperator);
        } else if (!path.node.prefix && path.node.operator == '++') {
          replacement = getReplacement(levelMutations, this.operators.PostfixIncrementOperatorNegation.mutationOperator);
        } else if (!path.node.prefix && path.node.operator == '--') {
          replacement = getReplacement(levelMutations, this.operators.PostfixDecrementOperatorNegation.mutationOperator);
        }
        if (replacement !== undefined) {
          yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
        }
      }
    }
  },

  numberOfMutants(path): number {
    return path.isUpdateExpression() ? 1 : 0;
  },
};

function getReplacement(levelMutations: string[], mutationName: string): '--' | '++' | undefined {
  if (levelMutations.includes(mutationName)) {
    const { replacement } = updateOperatorMutator.operators[mutationName];
    return replacement;
  }
  return undefined;
}
