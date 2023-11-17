import babel from '@babel/core';

import { MutationLevel } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator = {
  name: 'BooleanLiteral',

  *mutate(path, level: MutationLevel | undefined) {
    if (isInMutationLevel(path, level)) {
      if (path.isBooleanLiteral()) {
        yield types.booleanLiteral(!path.node.value);
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        yield deepCloneNode(path.node.argument);
      }
    }
  },
};

function isInMutationLevel(node: any, level?: MutationLevel): boolean {
  // No mutation level selected, allow everything.
  if (level === undefined) {
    return true;
  }
  // Mutation level selected, BooleanLiteral not included, block everything.
  if (level.BooleanLiteral === undefined) {
    return false;
  }
  if (path.isBooleanLiteral()) {
    // Path is a boolean literal. If the value is true, check if TrueToFalse is included. Otherwise, check if
    //  FalseToTrue is included.
    const value: boolean = path.node.value;
    if (
      (value && level.BooleanLiteral.some((lit) => lit == 'TrueToFalse')) ||
      (level.BooleanLiteral.some((lit) => lit == 'FalseToTrue'))
    ) {
      return true;
    }
  }
  // Path is a unary expression, which would be negation (!) in our case. Check if RemoveNegation is included.
  if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix && level.BooleanLiteral.some((lit) => lit == 'RemoveNegation')) {
    return true;
  }
}
