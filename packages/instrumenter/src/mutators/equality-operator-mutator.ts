import babel, { types } from '@babel/core';

import { EqualityOperator } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

export const equalityOperatorMutator: NodeMutator<EqualityOperator> = {
  name: 'EqualityOperator',

  operators: {
    '<To<=': { replacement: '<=', mutationName: 'EqualityOperator_LessThanOperator_Boundary' },
    '<To>=': { replacement: '>=', mutationName: 'EqualityOperator_LessThanOperator_ToGreatherThanEqualOperator' },

    '<=To<': { replacement: '<', mutationName: 'EqualityOperator_LessThanEqualOperator_Boundary' },
    '<=To>': { replacement: '>', mutationName: 'EqualityOperator_LessThanEqualOperator_ToGreatherThanOperator' },

    '>To>=': { replacement: '>=', mutationName: 'EqualityOperator_GreaterThanOperator_Boundary' },
    '>To<=': { replacement: '<=', mutationName: 'EqualityOperator_GreaterThanOperator_ToLessThanEqualOperator' },

    '>=To>': { replacement: '>', mutationName: 'EqualityOperator_GreatherThanEqualOperator_Boundary' },
    '>=To<': { replacement: '<', mutationName: 'EqualityOperator_GreatherThanEqualOperator_ToLessThanOperator' },

    '==To!=': { replacement: '!=', mutationName: 'EqualityOperator_EqualityOperator_ToInequalityOperator' },
    '!=To==': { replacement: '==', mutationName: 'EqualityOperator_InequalityOperator_ToEqualityOperator' },
    '===To!==': { replacement: '!==', mutationName: 'EqualityOperator_StrictEqualityOperator_ToStrictInequalityOperator' },
    '!==To===': { replacement: '===', mutationName: 'EqualityOperator_StrictInequalityOperator_ToStrictEqualityOperator' },
  },

  *mutate(path, levelMutations) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = filterMutationLevel(path.node, levelMutations);
      // throw new Error(allMutations.toString());
      for (const mutableOperator of allMutations) {
        const replacementOperator = t.cloneNode(path.node, true);
        replacementOperator.operator = mutableOperator.replacement;
        yield replacementOperator;
      }
    }
  },
};

function isEqualityOperator(operator: string): operator is keyof typeof equalityOperatorMutator.operators {
  return Object.keys(equalityOperatorMutator.operators).some((k) => k.startsWith(operator + 'To'));
}

function filterMutationLevel(node: types.BinaryExpression, levelMutations: string[] | undefined) {
  // Nothing allowed, so return an empty array

  const allMutations = Object.keys(equalityOperatorMutator.operators)
    .filter((k) => k.startsWith(node.operator + 'To'))
    .map((k) => equalityOperatorMutator.operators[k]);

  if (levelMutations === undefined) {
    return allMutations;
  }

  return allMutations.filter((mut) => levelMutations.some((op) => op === mut.mutationName));
}
