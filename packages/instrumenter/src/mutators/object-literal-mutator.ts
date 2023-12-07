import babel from '@babel/core';

import { ObjectLiteral } from '@stryker-mutator/api/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const operators: NodeMutatorConfiguration<ObjectLiteral> = {
  ObjectLiteral: { mutationName: 'ObjectLiteral_PropertiesRemoval' },
};

export const objectLiteralMutator: NodeMutator = {
  name: 'ObjectLiteral',

  *mutate(path, levelMutations) {
    if (path.isObjectExpression() && path.node.properties.length > 0 && isInMutationLevel(levelMutations)) {
      yield types.objectExpression([]);
    }
  },
};

function isInMutationLevel(levelMutations: string[] | undefined): boolean {
  return levelMutations === undefined || levelMutations.includes(operators.ObjectLiteral.mutationName as string);
}
