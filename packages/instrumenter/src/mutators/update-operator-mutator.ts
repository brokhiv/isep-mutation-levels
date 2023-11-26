import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const { types } = babel;

const UpdateReplacements = Object.assign({
  'Post++To--': { replacementOperator: '--', mutatorName: 'Post++To--' },
  'Post--To++': { replacementOperator: '++', mutatorName: 'Post--To++' },
  'Pre++To--': { replacementOperator: '--', mutatorName: 'Pre++To--' },
  'Pre--To++': { replacementOperator: '++', mutatorName: 'Pre--To++' },
  '++': { replacementOperator: '--', mutatorName: '++all' },
  '--': { replacementOperator: '++', mutatorName: '--all' },
} as const);

export const updateOperatorMutator: NodeMutator = {
  name: 'UpdateOperator',

  *mutate(path, operations) {
    if (path.isUpdateExpression() && operations === undefined) {
      yield types.updateExpression(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        UpdateReplacements[path.node.operator as keyof string].replacementOperator,
        deepCloneNode(path.node.argument),
        path.node.prefix,
      );
    } else if (path.isUpdateExpression() && operations !== undefined) {
      let replacement = undefined;
      if (path.node.prefix && path.node.operator == '++' && operations.includes(UpdateReplacements['Pre++To--'].mutatorName as string)) {
        replacement = UpdateReplacements['Pre++To--'].replacementOperator;
      } else if (path.node.prefix && path.node.operator == '--' && operations.includes(UpdateReplacements['Pre--To++'].mutatorName as string)) {
        replacement = UpdateReplacements['Pre--To++'].replacementOperator;
      } else if (!path.node.prefix && path.node.operator == '++' && operations.includes(UpdateReplacements['Post++To--'].mutatorName as string)) {
        replacement = UpdateReplacements['Post++To--'].replacementOperator;
      } else if (!path.node.prefix && path.node.operator == '--' && operations.includes(UpdateReplacements['Post--To++'].mutatorName as string)) {
        replacement = UpdateReplacements['Post--To++'].replacementOperator;
      }
      if (replacement !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        yield types.updateExpression(replacement, deepCloneNode(path.node.argument), path.node.prefix);
      }
    }
  },
};
