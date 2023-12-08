import babel from '@babel/core';

import { OptionalChaining } from '@stryker-mutator/api/core';

import { NodeMutator } from './index.js';

const { types: t } = babel;

/**
 * Mutates optional chaining operators
 * Note that the AST for optional chaining might not be what you expect. Nodes of type `OptionalMemberExpression` can be either optional or not-optional
 *
 * For example: In this expression: `foo?.bar.baz` the `.baz` member expression is of type `OptionalMemberExpression`, because it is part of an optional chain, but is is _not_ optional.
 * Only the `.bar` optional member expression is optional.
 *
 * @example
 * foo?.bar -> foo.bar
 * foo?.[1] -> foo[1]
 * foo?.() -> foo()
 */

export const optionalChainingMutator: NodeMutator<OptionalChaining> = {
  name: 'OptionalChaining',

  operators: {
    OptionalCallExpression: { mutationName: 'OptionalCallExpressionOptionalRemoval' },
    OptionalMemberExpression: { mutationName: 'OptionalMemberExpressionOptionalRemoval' },
    OptionalComputedMemberExpression: { mutationName: 'OptionalComputedMemberExpressionOptionalRemoval' },
  },

  *mutate(path, levelMutations) {
    if (
      path.isOptionalMemberExpression() &&
      path.node.optional &&
      (levelMutations === undefined ||
        (!path.node.computed && levelMutations.includes(this.operators.OptionalMemberExpression.mutationName)) ||
        (path.node.computed && levelMutations.includes(this.operators.OptionalComputedMemberExpression.mutationName)))
    ) {
      yield t.optionalMemberExpression(
        t.cloneNode(path.node.object, true),
        t.cloneNode(path.node.property, true),
        path.node.computed,
        /*optional*/ false,
      );
    }
    if (
      path.isOptionalCallExpression() &&
      path.node.optional &&
      (levelMutations === undefined || levelMutations.includes(this.operators.OptionalCallExpression.mutationName))
    ) {
      yield t.optionalCallExpression(
        t.cloneNode(path.node.callee, true),
        path.node.arguments.map((arg) => t.cloneNode(arg, true)),
        /*optional*/ false,
      );
    }
  },
};
