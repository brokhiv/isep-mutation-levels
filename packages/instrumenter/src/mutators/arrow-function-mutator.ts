import babel from '@babel/core';

const { types } = babel;

import { ArrowFunction } from '@stryker-mutator/api/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const operators: NodeMutatorConfiguration<ArrowFunction> = {
  ArrowFunction: { mutationName: 'ArrowFunction_Removal' },
};

export const arrowFunctionMutator: NodeMutator = {
  name: 'ArrowFunction',

  *mutate(path, levelMutations) {
    if (
      path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(types.isIdentifier(path.node.body) && path.node.body.name === 'undefined') &&
      isInMutationLevel(levelMutations)
    ) {
      yield types.arrowFunctionExpression([], types.identifier('undefined'));
    }
  },
};

function isInMutationLevel(levelMutations: string[] | undefined): boolean {
  return levelMutations === undefined || levelMutations.includes(operators.ArrowFunction.mutationName);
}
