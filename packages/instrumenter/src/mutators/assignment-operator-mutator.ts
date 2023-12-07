import type { types } from '@babel/core';

import { AssignmentOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator<AssignmentOperator> = {
  name: 'AssignmentOperator',

  operators: {
    '+=': { replacement: '-=', mutationName: 'AssignmentOperator_AdditionAssignment_ToSubstractionAssignment' },
    '-=': { replacement: '+=', mutationName: 'AssignmentOperator_SubstractionAssignment_ToAdditionAssignment' },
    '*=': { replacement: '/=', mutationName: 'AssignmentOperator_MultiplicationAssignment_ToDivisionAssignment' },
    '/=': { replacement: '*=', mutationName: 'AssignmentOperator_DivisionAssignment_ToMultiplicationAssignment' },
    '%=': { replacement: '*=', mutationName: 'AssignmentOperator_RemainderAssignment_ToMultiplicationAssignment' },
    '<<=': { replacement: '>>=', mutationName: 'AssignmentOperator_LeftShiftAssignment_ToRightShiftAssignment' },
    '>>=': { replacement: '<<=', mutationName: 'AssignmentOperator_RightShiftAssignment_ToLeftShiftAssignment' },
    '&=': { replacement: '|=', mutationName: 'AssignmentOperator_BitwiseAndAssignment_ToBitwiseOrAssignment' },
    '|=': { replacement: '&=', mutationName: 'AssignmentOperator_BitwiseOrAssignment_ToBitwiseAndAssignment' },
    '&&=': { replacement: '||=', mutationName: 'AssignmentOperator_LogicalAndAssignment_ToLogicalOrAssignment' },
    '||=': { replacement: '&&=', mutationName: 'AssignmentOperator_LogicalOrAssignment_ToLogicalAndAssignment' },
    '??=': { replacement: '&&=', mutationName: 'AssignmentOperator_NullishCoalescingAssignment_ToLogicalAndAssignment' },
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
};

function isInMutationLevel(node: types.AssignmentExpression, operations: string[] | undefined): boolean {
  if (operations === undefined) {
    return true;
  }
  const { mutationName } = assignmentOperatorMutator.operators[node.operator];
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
