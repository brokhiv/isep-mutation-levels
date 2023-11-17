import babel from '@babel/core';

import { MutationLevel } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

const { types } = babel;

import { NodeMutator } from './index.js';

export const booleanLiteralMutator: NodeMutator = {
  name: 'BooleanLiteral',

  *mutate(path, level: MutationLevel | undefined) {
    if (level === undefined) {
      // No mutation level selected, allow everything.
      if (path.isBooleanLiteral()) {
        yield types.booleanLiteral(!path.node.value);
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        yield deepCloneNode(path.node.argument);
      }
    } else if (level.BooleanLiteral !== undefined) {
      // Mutation level has been set and the included BooleanLiterals are defined
      if (path.isBooleanLiteral()) {
        const value: boolean = path.node.value;
        if (
          (value && level.BooleanLiteral.some((lit) => lit == 'TrueToFalse')) ||
          (!value && level.BooleanLiteral.some((lit) => lit == 'FalseToTrue'))
        ) {
          yield types.booleanLiteral(!path.node.value);
        }
      }
      if (path.isUnaryExpression() && path.node.operator === '!' && path.node.prefix) {
        if (level.BooleanLiteral.some((lit) => lit == 'RemoveNegation')) {
          yield deepCloneNode(path.node.argument);
        }
      }
    }
  },
};
