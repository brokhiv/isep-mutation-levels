import babel from '@babel/core';

import { ObjectLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

const { types } = babel;

export const objectLiteralMutator: NodeMutator<ObjectLiteral> = {
  name: 'ObjectLiteral',

  operators: {
    ObjectLiteralPropertiesRemoval: { mutationName: 'ObjectLiteralPropertiesRemoval' },
  },

  *mutate(path, levelMutations) {
    if (this.isMutable(path) && isInMutationLevel(levelMutations)) {
      yield types.objectExpression([]);
    }
  },

  isMutable(path): boolean {
    return path.isObjectExpression() && path.node.properties.length > 0;
  },

  numberOfMutants(_): number {
    return 1;
  },
};

function isInMutationLevel(levelMutations: string[] | undefined): boolean {
  return (
    levelMutations === undefined || levelMutations.includes(objectLiteralMutator.operators.ObjectLiteralPropertiesRemoval.mutationName as string)
  );
}
