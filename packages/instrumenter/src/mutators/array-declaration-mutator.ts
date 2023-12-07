import babel from '@babel/core';

import { ArrayDeclaration } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const arrayDeclarationMutator: NodeMutator<ArrayDeclaration> = {
  name: 'ArrayDeclaration',

  operators: {
    FilledArray: {
      replacement: types.arrayExpression([types.stringLiteral('Stryker was here')]),
      mutationName: 'ArrayDeclaration_ArrayLiteral_Fill',
    },
    FilledArrayConstructor: { replacement: [types.stringLiteral('Stryker was here')], mutationName: 'ArrayDeclaration_ArrayConstructor_Fill' },
    EmptyArray: { replacement: types.arrayExpression(), mutationName: 'ArrayDeclaration_ArrayLiteral_ItemsRemoval' },
    EmptyArrayConstructor: { replacement: [], mutationName: 'ArrayDeclaration_ArrayConstructor_ItemsRemoval' },
  },

  *mutate(path, levelMutations) {
    // The check of the [] construct in code
    if (path.isArrayExpression() && isArrayInLevel(path.node, levelMutations)) {
      const replacement = path.node.elements.length > 0 ? this.operators.EmptyArray.replacement : this.operators.FilledArray.replacement;
      yield replacement;
    }
    // Check for the new Array() construct in code
    if (
      (path.isCallExpression() || path.isNewExpression()) &&
      types.isIdentifier(path.node.callee) &&
      path.node.callee.name === 'Array' &&
      isArrayConstructorInLevel(path.node, levelMutations)
    ) {
      const mutatedCallArgs: babel.types.Expression[] =
        path.node.arguments.length > 0 ? this.operators.EmptyArrayConstructor.replacement : this.operators.FilledArrayConstructor.replacement;

      const replacement = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
        : types.callExpression(deepCloneNode(path.node.callee), mutatedCallArgs);
      yield replacement;
    }
  },
};

function isArrayInLevel(node: babel.types.ArrayExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(arrayDeclarationMutator.operators.EmptyArray.mutationName) && node.elements.length > 0) ||
    (levelMutations.includes(arrayDeclarationMutator.operators.FilledArray.mutationName) && node.elements.length === 0)
  );
}

function isArrayConstructorInLevel(node: babel.types.CallExpression | babel.types.NewExpression, levelMutations: string[] | undefined): boolean {
  // No mutation level specified, so allow everything
  if (levelMutations === undefined) {
    return true;
  }

  return (
    (levelMutations.includes(arrayDeclarationMutator.operators.EmptyArrayConstructor.mutationName) && node.arguments.length > 0) ||
    (levelMutations.includes(arrayDeclarationMutator.operators.FilledArrayConstructor.mutationName) && node.arguments.length === 0)
  );
}
