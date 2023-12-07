import babel from '@babel/core';

import { MethodExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

// prettier-ignore
const operators: NodeMutatorConfiguration<MethodExpression> = {
  'charAt': { replacement: null, mutationName: 'MethodExpression_charAtMethodCall_Removal' },
  'endsWith': { replacement: 'startsWith', mutationName: 'MethodExpression_endsWithMethodCall_TostartsWithMethodCall' },
  'startsWith': { replacement: 'endsWith', mutationName: 'MethodExpression_startsWithMethodCall_ToendsWithMethodCall' },
  'every': { replacement: 'some', mutationName: 'MethodExpression_everyMethodCall_TosomeMethodCall' },
  'some': { replacement: 'every', mutationName: 'MethodExpression_someMethodCall_ToeveryMethodCall' },
  'filter': { replacement: null, mutationName: 'MethodExpression_filterMethodCall_Removal' },
  'reverse': { replacement: null, mutationName: 'MethodExpression_reverseMethodCall_Removal' },
  'slice': { replacement: null, mutationName: 'MethodExpression_sliceMethodCall_Removal' },
  'sort': { replacement: null, mutationName: 'MethodExpression_sortMethodCall_Removal' },
  'substr': { replacement: null, mutationName: 'MethodExpression_substrMethodCall_Removal' },
  'substring': { replacement: null, mutationName: 'MethodExpression_substringMethodCall_Removal' },
  'toLocaleLowerCase': { replacement: 'toLocaleUpperCase', mutationName: 'MethodExpression_toLocaleLowerCaseMethodCall_TotoLocaleUpperCaseMethodCall' },
  'toLocaleUpperCase': { replacement: 'toLocaleLowerCase', mutationName: 'MethodExpression_toLocaleUpperCaseMethodCall_TotoLocaleLowerCaseMethodCall' },
  'toLowerCase': { replacement: 'toUpperCase', mutationName: 'MethodExpression_toLowerCaseMethodCall_TotoUpperCaseMethodCall' },
  'toUpperCase': { replacement: 'toLowerCase', mutationName: 'MethodExpression_toUpperCaseMethodCall_TotoLowerCaseMethodCall' },
  'trim': { replacement: null, mutationName: 'MethodExpression_trimMethodCall_Removal' },
  'trimEnd': { replacement: 'trimStart', mutationName: 'MethodExpression_trimEndMethodCall_TotrimStartMethodCall' },
  'trimStart': { replacement: 'trimEnd', mutationName: 'MethodExpression_trimStartMethodCall_TotrimEndMutator' },
  'min': { replacement: 'max', mutationName: 'MethodExpression_minMethodCall_TomaxMethodCall' },
  'max': { replacement: 'min', mutationName: 'MethodExpression_maxMethodCall_toMinMethodCall' },
};

export const methodExpressionMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path, levelMutations) {
    // In case `operations` is undefined, any checks will short-circuit to true and allow the mutation

    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    const mutation = operators[callee.property.name];
    if (mutation === undefined) {
      // Function is not known in `operators`, so no mutations
      return;
    }

    if (levelMutations !== undefined && !levelMutations.includes(mutation.mutationName)) {
      // Mutator is blocked by mutation level, so no replacementOperator
      return;
    }

    // Replace the method expression. I.e. `foo.toLowerCase()` => `foo.toUpperCase`
    const nodeArguments = path.node.arguments.map((argumentNode) => deepCloneNode(argumentNode));

    let mutatedCallee = undefined;

    if (mutation.replacement != null) {
      mutatedCallee = types.isMemberExpression(callee)
        ? types.memberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional)
        : types.optionalMemberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional);
    } else if (typeof mutation.replacement == 'object' && mutation.replacement == null) {
      yield deepCloneNode(callee.object);
      return;
    }

    if (mutatedCallee != undefined) {
      yield types.isCallExpression(path.node)
        ? types.callExpression(mutatedCallee, nodeArguments)
        : types.optionalCallExpression(mutatedCallee, nodeArguments, path.node.optional);
    }
  },
};
