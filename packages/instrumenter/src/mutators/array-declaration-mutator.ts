import babel, { type NodePath } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

const arrayDeclarationReplacements = Object.freeze({
  EmptyArray: { replacement: types.arrayExpression([types.stringLiteral('Stryker was here')]), mutatorName: 'EmptyArray' },
  EmptyArrayConstructor: { replacement: [types.stringLiteral('Stryker was here')], mutatorName: 'EmptyArrayConstructor' },
  FilledArray: { replacement: types.arrayExpression(), mutatorName: 'FilledArray' },
  FilledArrayConstructor: { replacement: [], mutatorName: 'FilledArrayConstructor' },
} as const);

// const arrayDeclarationReplacements = ['EmptyArray', 'EmptyConstructor'] as const;

export const arrayDeclarationMutator: NodeMutator = {
  name: 'ArrayDeclaration',

  *mutate(path: NodePath, operations: string[] | undefined): Iterable<babel.types.Node> {
    // The check of the [] in code
    if (
      path.isArrayExpression() &&
      (operations == undefined ||
        operations.includes(arrayDeclarationReplacements.EmptyArray.mutatorName) ||
        operations.includes(arrayDeclarationReplacements.FilledArray.mutatorName))
    ) {
      if (operations == undefined) {
        const replacement = path.node.elements.length
          ? arrayDeclarationReplacements.FilledArray.replacement
          : arrayDeclarationReplacements.EmptyArray.replacement;
        yield replacement;
      } else if (arrayDeclarationReplacements.FilledArray.mutatorName) {
        const { replacement } = arrayDeclarationReplacements.FilledArray;
        yield replacement;
      } else if (arrayDeclarationReplacements.EmptyArray.mutatorName) {
        const { replacement } = arrayDeclarationReplacements.EmptyArray;
        yield replacement;
      }
    }
    // Check for the new Array() construct
    if (
      (path.isCallExpression() || path.isNewExpression()) &&
      types.isIdentifier(path.node.callee) &&
      path.node.callee.name === 'Array' &&
      (operations == undefined ||
        operations.includes(arrayDeclarationReplacements.EmptyArrayConstructor.mutatorName) ||
        operations.includes(arrayDeclarationReplacements.FilledArrayConstructor.mutatorName))
    ) {
      const mutatedCallArgs = path.node.arguments.length ? [] : [types.stringLiteral('Stryker was here')];
      const replacement = types.isNewExpression(path.node)
        ? types.newExpression(deepCloneNode(path.node.callee), mutatedCallArgs)
        : types.callExpression(deepCloneNode(path.node.callee), mutatedCallArgs);
      yield replacement;
    }
  },
};
