import type { types } from '@babel/core';

import { AssignmentOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator<AssignmentOperator> = {
  name: 'AssignmentOperator',

  operators: {
    '+=': { replacement: '-=', mutationOperator: 'AdditionAssignmentNegation' },
    '-=': { replacement: '+=', mutationOperator: 'SubtractionAssignmentNegation' },
    '*=': { replacement: '/=', mutationOperator: 'MultiplicationAssignmentNegation' },
    '/=': { replacement: '*=', mutationOperator: 'DivisionAssignmentNegation' },
    '%=': { replacement: '*=', mutationOperator: 'RemainderAssignmentToMultiplicationReplacement' },
    '<<=': { replacement: '>>=', mutationOperator: 'LeftShiftAssignmentNegation' },
    '>>=': { replacement: '<<=', mutationOperator: 'RightShiftAssignmentNegation' },
    '&=': { replacement: '|=', mutationOperator: 'BitwiseAndAssignmentNegation' },
    '|=': { replacement: '&=', mutationOperator: 'BitwiseOrAssignmentNegation' },
    '&&=': { replacement: '||=', mutationOperator: 'LogicalAndAssignmentNegation' },
    '||=': { replacement: '&&=', mutationOperator: 'LogicalOrAssignmentNegation' },
    '??=': { replacement: '&&=', mutationOperator: 'NullishCoalescingAssignmentToLogicalAndReplacement' },
  },

  *mutate(path, levelMutations) {
    if (
      path.isAssignmentExpression() &&
      isSupportedAssignmentOperator(path.node.operator) &&
      isSupported(path.node) &&
      isInMutationLevel(path.node, levelMutations)
    ) {
      const mutatedOperator = this.operators[path.node.operator].replacement;
      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },

  numberOfMutants(path): number {
    return path.isAssignmentExpression() && isSupportedAssignmentOperator(path.node.operator) && isSupported(path.node) ? 1 : 0;
  },
};

function isInMutationLevel(node: types.AssignmentExpression, operations: string[] | undefined): boolean {
  if (operations === undefined) {
    return true;
  }
  const { mutationOperator: mutationName } = assignmentOperatorMutator.operators[node.operator];
  return operations.some((op) => op === mutationName);
}

function isSupportedAssignmentOperator(operator: string): boolean {
  return Object.keys(assignmentOperatorMutator.operators).includes(operator);
}

function isSupported(node: types.AssignmentExpression): boolean {
  // Excludes assignment operators that apply to strings.
  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
