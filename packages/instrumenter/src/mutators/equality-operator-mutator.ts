import babel, { types } from '@babel/core';

import { EqualityOperator } from '@stryker-mutator/api/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

const operators: NodeMutatorConfiguration<EqualityOperator> = {
  '<To<=': { replacement: '<=', mutationName: 'EqualityOperator_LessThanOperator_Boundary' },
  '<To>=': { replacement: '>=', mutationName: 'EqualityOperator_LessThanOperator_ToGreatherThanEqualOperator' },

  '<=To<': { replacement: '<', mutationName: 'EqualityOperator_LessThanEqualOperator_Boundary' },
  '<=To>': { replacement: '>', mutationName: 'EqualityOperator_LessThanEqualOperator_ToGreatherThanOperator' },

  '>To>=': { replacement: '>=', mutationName: 'EqualityOperator_GreaterThanOperator_Boundary' },
  '>To<=': { replacement: '<=', mutationName: 'EqualityOperator_GreaterThanOperator_ToLessThanEqualOperator' },

  '>=To>': { replacement: '>', mutationName: 'EqualityOperator_GreatherThanEqualOperator_Boundary' },
  '>=To<': { replacement: '<', mutationName: 'EqualityOperator_GreatherThanEqualOperator_ToLessThanOperator' },

  '==': { replacement: '!=', mutationName: 'EqualityOperator_EqualityOperator_ToInequalityOperator' },
  '!=': { replacement: '==', mutationName: 'EqualityOperator_InequalityOperator_ToEqualityOperator' },
  '===': { replacement: '!==', mutationName: 'EqualityOperator_StrictEqualityOperator_ToStrictInequalityOperator' },
  '!==': { replacement: '===', mutationName: 'EqualityOperator_StrictInequalityOperator_ToStrictEqualityOperator' },
};

function isEqualityOperator(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}
export const equalityOperatorMutator: NodeMutator = {
  name: 'EqualityOperator',

  *mutate(path, operations) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = filterMutationLevel(path.node, operations);
      // throw new Error(allMutations.toString());
      for (const mutableOperator of allMutations) {
        const replacementOperator = t.cloneNode(path.node, true);
        replacementOperator.operator = mutableOperator.replacement;
        yield replacementOperator;
      }
    }
  },
};

function filterMutationLevel(node: types.BinaryExpression, levelMutations: string[] | undefined) {
  // Nothing allowed, so return an empty array
  if (levelMutations === undefined) {
    return [];
  }

  const allMutations = Object.keys(operators)
    .filter((k) => k.startsWith(node.operator))
    .map((k) => operators[k]);

  return allMutations.filter((mut) => levelMutations.some((op) => op === mut.mutationName));
}
