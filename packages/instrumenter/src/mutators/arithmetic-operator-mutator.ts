import type { types } from '@babel/core';

import { ArithmeticOperator } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

export const arithmeticOperatorMutator: NodeMutator<ArithmeticOperator> = {
  name: 'ArithmeticOperator',

  operators: {
    '+': { replacement: '-', mutationName: 'ArithmeticOperator_AdditionOperator_ToSubtractionOperator' },
    '-': { replacement: '+', mutationName: 'ArithmeticOperator_SubtractionOperator_ToAdditionOperator' },
    '*': { replacement: '/', mutationName: 'ArithmeticOperator_MultiplicationOperator_ToDivisionOperator' },
    '/': { replacement: '*', mutationName: 'ArithmeticOperator_DivisionOperator_ToMultiplicationOperator' },
    '%': { replacement: '*', mutationName: 'ArithmeticOperator_RemainderOperator_ToMultiplicationOperator' },
  },

  *mutate(path, levelMutations) {
    if (path.isBinaryExpression() && isSupported(path.node.operator, path.node) && isInMutationLevel(path.node, levelMutations)) {
      const mutatedOperator = this.operators[path.node.operator].replacement;
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isInMutationLevel(node: types.BinaryExpression, operations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (operations === undefined) {
    return true;
  }

  const mutatedOperator = arithmeticOperatorMutator.operators[node.operator].mutationName;
  return operations.some((op) => op === mutatedOperator) ?? false;
}

function isSupported(operator: string, node: types.BinaryExpression): boolean {
  if (!Object.keys(arithmeticOperatorMutator.operators).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];
  const leftType = node.left.type === 'BinaryExpression' ? node.left.right.type : node.left.type;

  if (stringTypes.includes(node.right.type) || stringTypes.includes(leftType)) {
    return false;
  }

  return true;
}
