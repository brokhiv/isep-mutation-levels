import babel, { types } from '@babel/core';

import { EqualityOperator } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

export const equalityOperatorMutator: NodeMutator<EqualityOperator> = {
  name: 'EqualityOperator',

  operators: {
    '<To<=': { replacement: '<=', mutationOperator: 'LessThanOperatorBoundary' },
    '<To>=': { replacement: '>=', mutationOperator: 'LessThanOperatorNegation' },

    '<=To<': { replacement: '<', mutationOperator: 'LessThanEqualOperatorBoundary' },
    '<=To>': { replacement: '>', mutationOperator: 'LessThanEqualOperatorNegation' },

    '>To>=': { replacement: '>=', mutationOperator: 'GreaterThanOperatorBoundary' },
    '>To<=': { replacement: '<=', mutationOperator: 'GreaterThanOperatorNegation' },

    '>=To>': { replacement: '>', mutationOperator: 'GreaterThanEqualOperatorBoundary' },
    '>=To<': { replacement: '<', mutationOperator: 'GreaterThanEqualOperatorNegation' },

    '==To!=': { replacement: '!=', mutationOperator: 'EqualityOperatorNegation' },
    '!=To==': { replacement: '==', mutationOperator: 'InequalityOperatorNegation' },
    '===To!==': { replacement: '!==', mutationOperator: 'StrictEqualityOperatorNegation' },
    '!==To===': { replacement: '===', mutationOperator: 'StrictInequalityOperatorNegation' },
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

  numberOfMutants(path): number {
    // Necessary to use path.node.operator
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      return Object.keys(equalityOperatorMutator.operators).filter((k) => k.startsWith(path.node.operator + 'To')).length;
    }

    return 0;
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

  return allMutations.filter((mut) => levelMutations.some((op) => op === mut.mutationOperator));
}
