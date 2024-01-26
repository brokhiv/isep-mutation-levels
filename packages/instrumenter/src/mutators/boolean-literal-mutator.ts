import babel from '@babel/core';

import { BooleanLiteral } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator<BooleanLiteral> = {
  name: 'BooleanLiteral',

  operators: {
    true: { replacement: false, mutationOperator: 'TrueLiteralNegation' },
    false: { replacement: true, mutationOperator: 'FalseLiteralNegation' },
    '!': { replacement: '', mutationOperator: 'LogicalNotRemoval' },
  },

  *mutate(path, levelMutations) {
    if (isInMutationLevel(path, levelMutations)) {
      if (path.isBooleanLiteral()) {
        yield types.booleanLiteral(!path.node.value);
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        yield deepCloneNode(path.node.argument);
      }
    }
  },

  numberOfMutants(path): number {
    return path.isBooleanLiteral() || (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) ? 1 : 0;
  },
};

function isInMutationLevel(path: any, levelMutations: string[] | undefined): boolean {
  if (levelMutations === undefined) {
    return true;
  }
  if (path.isBooleanLiteral()) {
    const { mutationOperator: mutatorName } = booleanLiteralMutator.operators[path.node.value];
    return levelMutations.some((lit) => lit === mutatorName);
  }
  return (
    path.isUnaryExpression() &&
    path.node.operator === '!' &&
    path.node.prefix &&
    levelMutations.some((lit: string) => lit === booleanLiteralMutator.operators['!'].mutationOperator)
  );
}
