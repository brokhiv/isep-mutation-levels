import { expect } from 'chai';

import { booleanLiteralMutator as sut } from '../../../src/mutators/boolean-literal-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const booleanLiteralLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: ['TrueLiteralNegation', 'LogicalNotRemoval'],
};

const booleanLiteralUndefinedLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: [],
};

const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "BooleanLiteral"', () => {
    expect(sut.name).eq('BooleanLiteral');
  });

  it('should mutate `true` into `false`', () => {
    expectJSMutation(sut, 'true', 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectJSMutation(sut, 'false', 'true');
  });

  it('should mutate !a to a', () => {
    expectJSMutation(sut, '!a', 'a');
  });

  it('should only mutate what is defined in the mutation level', () => {
    expectJSMutationWithLevel(
      sut,
      booleanLiteralLevel.BooleanLiteral,
      'if (true) {}; if (false) {}; if (!value) {}',
      'if (false) {}; if (false) {}; if (!value) {}',
      'if (true) {}; if (false) {}; if (value) {}',
    );
  });

  it('should not mutate anything if there are no values in the mutation level', () => {
    expectJSMutationWithLevel(sut, booleanLiteralUndefinedLevel.BooleanLiteral, 'if (true) {}; if (false) {}; if (!value) {}');
  });

  it('should mutate everything if the mutation level is undefined', () => {
    expectJSMutationWithLevel(
      sut,
      noLevel,
      'if (true) {}; if (false) {}; if (!value) {}',
      'if (false) {}; if (false) {}; if (!value) {}',
      'if (true) {}; if (false) {}; if (value) {}',
      'if (true) {}; if (true) {}; if (!value) {}',
    );
  });
});
