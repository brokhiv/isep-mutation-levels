import { expect } from 'chai';
import sinon from 'sinon';

import { regexMutator as sut } from '../../../src/mutators/regex-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const regexLevel: MutationLevel = { name: 'RegexLevel', Regex: ['Regex_Removal'] };
const regexUndefinedLevel: MutationLevel = { name: 'RegexLevel' };

describe(sut.name, () => {
  it('should have name "Regex"', () => {
    expect(sut.name).eq('Regex');
  });

  it('should not mutate normal string literals', () => {
    expectJSMutation(sut, '""');
  });

  it('should mutate a regex literal', () => {
    expectJSMutation(sut, '/\\d{4}/', '/\\d/', '/\\D{4}/');
  });

  it("should not crash if a regex couldn't be parsed", () => {
    // Arrange
    const errorStub = sinon.stub(console, 'error');

    // Act
    expectJSMutation(sut, 'new RegExp("*(a|$]")');

    // Assert
    expect(errorStub).calledWith(
      '[RegexMutator]: The Regex parser of weapon-regex couldn\'t parse this regex pattern: "*(a|$]". Please report this issue at https://github.com/stryker-mutator/weapon-regex/issues. Inner error: [Error] Parser: Position 1:1, found "*(a|$]"',
    );
  });

  it('should mutate obvious Regex string literals', () => {
    expectJSMutation(sut, 'new RegExp("\\\\d{4}")', 'new RegExp("\\\\d")', 'new RegExp("\\\\D{4}")');
  });

  it('should not mutate the flags of a new RegExp constructor', () => {
    expectJSMutation(sut, 'new RegExp("", "\\\\d{4}")');
  });

  it('should not pass flags if no flags are defined', () => {
    expectJSMutation(sut, '/\\u{20}/', '/\\u/');
  });

  it('should pass flags in regex literals', () => {
    expectJSMutation(sut, '/\\u{20}/u');
  });

  it('should pass flags in new RegExp constructors', () => {
    expectJSMutation(sut, 'new RegExp("\\\\u{20}", "u")');
  });

  it('should only pass flags in new RegExp constructors if it is a string literal', () => {
    expectJSMutation(sut, 'new RegExp("\\\\u{20}", foo)', 'new RegExp("\\\\u", foo)');
  });

  it('should only mutate what is defined in the mutator level', () => {
    expectJSMutationWithLevel(sut, regexLevel.Regex, 'new RegExp("\\\\u{20}", foo)', 'new RegExp("\\\\u", foo)');
  });

  it('should not mutate anything if there are no values in the mutation level', () => {
    expectJSMutationWithLevel(sut, [], 'new RegExp("\\\\u{20}", foo)');
  });

  it('should mutate everything if the mutation level is undefined', () => {
    expectJSMutationWithLevel(sut, regexUndefinedLevel.Regex, 'new RegExp("\\\\u{20}", foo)', 'new RegExp("\\\\u", foo)');
  });
});
