import { expect } from 'chai';

import { equalityOperatorMutator as sut } from '../../../src/mutators/equality-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const equalityLevelA: MutationLevel = {
  name: 'EqualityLevelA',
  EqualityOperator: [
    'EqualityOperator_LessThanOperator_Boundary',
    'EqualityOperator_LessThanOperator_ToGreatherThanEqualOperator',
    'EqualityOperator_GreatherThanEqualOperator_Boundary',
    'EqualityOperator_GreatherThanEqualOperator_ToLessThanOperator',
    'EqualityOperator_EqualityOperator_ToInequalityOperator',
  ],
};

const equalityLevelB: MutationLevel = {
  name: 'EqualityLevelB',
  EqualityOperator: [
    'EqualityOperator_LessThanEqualOperator_ToGreatherThanOperator',
    'EqualityOperator_GreaterThanOperator_ToLessThanEqualOperator',
    'EqualityOperator_StrictEqualityOperator_ToStrictInequalityOperator',
  ],
};

describe(sut.name, () => {
  it('should have name "EqualityOperator"', () => {
    expect(sut.name).eq('EqualityOperator');
  });

  it('should mutate < and >', () => {
    expectJSMutation(sut, 'a < b', 'a >= b', 'a <= b');
    expectJSMutation(sut, 'a > b', 'a <= b', 'a >= b');
  });

  it('should mutate <= and >=', () => {
    expectJSMutation(sut, 'a <= b', 'a < b', 'a > b');
    expectJSMutation(sut, 'a >= b', 'a < b', 'a > b');
  });

  it('should mutate == and ===', () => {
    expectJSMutation(sut, 'a == b', 'a != b');
    expectJSMutation(sut, 'a === b', 'a !== b');
  });

  it('should mutate != and !==', () => {
    expectJSMutation(sut, 'a != b', 'a == b');
    expectJSMutation(sut, 'a !== b', 'a === b');
  });

  it('should only mutate <, >=, == from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      equalityLevelA.EqualityOperator,
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
      'a <= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <
      'a >= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <
      'a < b; a <= b; a > b; a > b; a == b; a != b; a === b; a !== b', // mutates >=
      'a < b; a <= b; a > b; a < b; a == b; a != b; a === b; a !== b', // mutates >=
      'a < b; a <= b; a > b; a >= b; a != b; a != b; a === b; a !== b', // mutates ==
    );
  });

  it('should only mutate <= to >, > to <=, and === to !== from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      equalityLevelB.EqualityOperator,
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
      'a < b; a > b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <= to >
      'a < b; a <= b; a <= b; a >= b; a == b; a != b; a === b; a !== b', // mutates > to <=
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a !== b; a !== b', // mutates === to !==
    );
  });
});
