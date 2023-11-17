import { expect } from 'chai';
import { MutationLevel } from '@stryker-mutator/api/core';

import { arrayDeclarationMutator as sut } from '../../../src/mutators/array-declaration-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';

const arrayDeclarationLevel: MutationLevel = { name: 'arrayDeclarationLevel', ArrayDeclaration: ['EmptyArray', 'EmptyConstructor'] };

describe(sut.name, () => {
  it('should have name "ArrayDeclaration"', () => {
    expect(sut.name).eq('ArrayDeclaration');
  });

  it('should mutate filled array literals as empty arrays', () => {
    expectJSMutation(sut, '[a, 1 + 1]', '[]');
    expectJSMutation(sut, "['val']", '[]');
  });

  it('should mutate empty array literals as a filled array', () => {
    expectJSMutation(sut, '[]', '["Stryker was here"]');
  });

  it('should mutate filled Array constructor calls as empty arrays', () => {
    expectJSMutation(sut, 'new Array(a, 1 + 1)', 'new Array()');
    expectJSMutation(sut, "new Array('val')", 'new Array()');
    expectJSMutation(sut, "Array('val')", 'Array()');
    expectJSMutation(sut, 'Array(a, 1 + 1)', 'Array()');
  });

  it('should not mutate other new expressions', () => {
    expectJSMutation(sut, 'new Object(21, 2)');
    expectJSMutation(sut, 'new Arrays(21, 2)');
  });

  it('should mutate empty array constructor call as a filled array', () => {
    expectJSMutation(sut, 'new Array()', 'new Array([])');
    expectJSMutation(sut, 'Array()', 'Array([])');
  });

  it('should not mutate other function call expressions', () => {
    expectJSMutation(sut, 'window.Array(21, 2)');
    expectJSMutation(sut, 'window["Array"](21, 2)');
  });

  it('should only mutate [], new Array(), new Array(x,y) and [x,y] from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      arrayDeclarationLevel,
      '[]; new Array({x:"", y:""}); [{x:"", y:""}]',
      '["Stryker was here"]; new Array({x:"", y:""}); [{x:"", y:""}]', // mutates []
      '[]; new Array(); [{x:"", y:""}]', // mutates new Array(x,y)
      '[]; new Array({x:"", y:""}); []', // mutates [x,y]
    );
  });
});
