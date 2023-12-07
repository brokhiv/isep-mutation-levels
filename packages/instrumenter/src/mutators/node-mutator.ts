import type { types, NodePath } from '@babel/core';

export interface NodeMutator {
  mutate(path: NodePath, levelMutations: string[] | undefined): Iterable<types.Node>;
  readonly name: string;
}
