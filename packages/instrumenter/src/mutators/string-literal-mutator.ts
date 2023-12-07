import babel, { type NodePath } from '@babel/core';

import { StringLiteral } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const stringLiteralMutator: NodeMutator<StringLiteral> = {
  name: 'StringLiteral',

  operators: {
    FillString: { replacement: types.stringLiteral('Stryker was here!'), mutationName: 'StringLiteral_EmptyStringLiteral_ToFilledStringLiteral' },
    EmptyString: { replacement: types.stringLiteral(''), mutationName: 'StringLiteral_FilledStringLiteral_ToEmptyStringLiteral' },
    EmptyInterpolation: {
      replacement: types.templateLiteral([types.templateElement({ raw: '' })], []),
      mutationName: 'StringLiteral_FilledInterpolatedString_ToEmptyInterpolatedString',
    },
    FillInterpolation: {
      replacement: types.templateLiteral([types.templateElement({ raw: 'Stryker was here!' })], []),
      mutationName: 'StringLiteral_EmptyInterpolatedString_ToFilledInterpolatedString',
    },
  },

  *mutate(path, levelMutations) {
    if (path.isTemplateLiteral()) {
      const stringIsEmpty = path.node.quasis.length === 1 && path.node.quasis[0].value.raw.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(this.operators.FillInterpolation.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(this.operators.EmptyInterpolation.mutationName))
      ) {
        yield stringIsEmpty ? this.operators.FillInterpolation.replacement : this.operators.EmptyInterpolation.replacement;
      }
    }
    if (path.isStringLiteral() && isValidParent(path)) {
      const stringIsEmpty = path.node.value.length === 0;
      if (
        levelMutations === undefined ||
        (stringIsEmpty && levelMutations.includes(this.operators.FillString.mutationName)) ||
        (!stringIsEmpty && levelMutations.includes(this.operators.EmptyString.mutationName))
      ) {
        yield stringIsEmpty ? this.operators.FillString.replacement : this.operators.EmptyString.replacement;
      }
    }
  },
};

function isValidParent(child: NodePath<babel.types.StringLiteral>): boolean {
  const { parent } = child;
  return !(
    types.isImportDeclaration(parent) ||
    types.isExportDeclaration(parent) ||
    types.isImportOrExportDeclaration(parent) ||
    types.isTSExternalModuleReference(parent) ||
    types.isJSXAttribute(parent) ||
    types.isExpressionStatement(parent) ||
    types.isTSLiteralType(parent) ||
    types.isObjectMethod(parent) ||
    (types.isObjectProperty(parent) && parent.key === child.node) ||
    (types.isClassProperty(parent) && parent.key === child.node) ||
    (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'require' })) ||
    (types.isCallExpression(parent) && types.isIdentifier(parent.callee, { name: 'Symbol' }))
  );
}
