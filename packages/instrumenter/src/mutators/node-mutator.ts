import type { types, NodePath } from '@babel/core';

import { NodeMutatorConfiguration, MutationLevel } from '../mutation-level/mutation-level.js';

export interface NodeMutator<T extends keyof MutationLevel> {
  // It would be stricter for the type to be `MutatorDefinition` rather than `keyof MutationLevel` but that
  // prevents the definition of custom mutators from {@link babel.transformer.spec.ts}
  mutate(path: NodePath): Iterable<[types.Node, keyof MutationLevel]>;
  readonly name: string;
  operators: NodeMutatorConfiguration<T>;
}
