import type { types, NodePath } from '@babel/core';

export interface NodeMutator {
  mutate(path: NodePath, operations: String[] | undefined): Iterable<types.Node>;
  readonly name: string;
}
