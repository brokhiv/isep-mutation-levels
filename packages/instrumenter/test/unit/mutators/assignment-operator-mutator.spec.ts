import { expect } from 'chai';

import { MutationLevel } from '@stryker-mutator/api/core';

import { assignmentOperatorMutator as sut } from '../../../src/mutators/assignment-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';

const assignmentOperatorLevel: MutationLevel = { name: 'AssignmentOperatorLevel', AssignmentOperator: ['-=To+=', '<<=To>>=', '&&=To||='] };

describe(sut.name, () => {
  it('should have name "AssignmentOperator"', () => {
    expect(sut.name).eq('AssignmentOperator');
  });

  it('should mutate += and -=', () => {
    expectJSMutation(sut, 'a += b', 'a -= b');
    expectJSMutation(sut, 'a -= b', 'a += b');
  });

  it('should mutate *=, %= and /=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate *=, %= and /=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate <<=, >>=, &= and |=', () => {
    expectJSMutation(sut, 'a *= b', 'a /= b');
    expectJSMutation(sut, 'a /= b', 'a *= b');
    expectJSMutation(sut, 'a %= b', 'a *= b');
  });

  it('should mutate &&=, ||= and ??=', () => {
    expectJSMutation(sut, 'a &&= b', 'a ||= b');
    expectJSMutation(sut, 'a ||= b', 'a &&= b');
    expectJSMutation(sut, 'a ??= b', 'a &&= b');
  });

  it('should not mutate a string literal unless it is &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a += "b"');
    expectJSMutation(sut, 'a -= "b"');
    expectJSMutation(sut, 'a *= "b"');
    expectJSMutation(sut, 'a /= "b"');
    expectJSMutation(sut, 'a %= "b"');
    expectJSMutation(sut, 'a <<= "b"');
    expectJSMutation(sut, 'a >>= "b"');
    expectJSMutation(sut, 'a &= "b"');
    expectJSMutation(sut, 'a |= "b"');
  });

  it('should mutate a string literal using &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a &&= "b"', 'a ||= "b"');
    expectJSMutation(sut, 'a ||= "b"', 'a &&= "b"');
    expectJSMutation(sut, 'a ??= "b"', 'a &&= "b"');
  });

  it('should not mutate string template unless it is &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a += `b`');
    expectJSMutation(sut, 'a -= `b`');
    expectJSMutation(sut, 'a *= `b`');
    expectJSMutation(sut, 'a /= `b`');
    expectJSMutation(sut, 'a %= `b`');
    expectJSMutation(sut, 'a <<= `b`');
    expectJSMutation(sut, 'a >>= `b`');
    expectJSMutation(sut, 'a &= `b`');
    expectJSMutation(sut, 'a |= `b`');
  });

  it('should mutate string template using &&=, ||=, ??=', () => {
    expectJSMutation(sut, 'a &&= `b`', 'a ||= `b`');
    expectJSMutation(sut, 'a ||= `b`', 'a &&= `b`');
    expectJSMutation(sut, 'a ??= `b`', 'a &&= `b`');
  });

  it('should only mutate what is defined in the mutator level', () => {
    expectJSMutationWithLevel(
      sut,
      assignmentOperatorLevel.AssignmentOperator,
      'a += b; a -= b; a *= b; a /= b; a <<= b; a &&= b;',
      'a += b; a += b; a *= b; a /= b; a <<= b; a &&= b;',
      'a += b; a -= b; a *= b; a /= b; a >>= b; a &&= b;',
      'a += b; a -= b; a *= b; a /= b; a <<= b; a ||= b;',
    );
  });
});
