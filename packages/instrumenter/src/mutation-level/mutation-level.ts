import { Node } from '@babel/core';
import {
  ArithmeticOperator,
  ArrayDeclaration,
  ArrowFunction,
  AssignmentOperator,
  BlockStatement,
  BooleanLiteral,
  ConditionalExpression,
  EqualityOperator,
  LogicalOperator,
  MethodExpression,
  MutatorDefinition,
  ObjectLiteral,
  OptionalChaining,
  Regex,
  StringLiteral,
  UnaryOperator,
  UpdateOperator,
} from '@stryker-mutator/api/core';

export type NodeMutatorConfiguration<T> = Record<string, ReplacementConfiguration<T>>;

interface ReplacementConfiguration<T> {
  replacement?: Node | Node[] | boolean | string | null;
  mutationOperator: T;
}

export interface MutationLevel {
  /**
   * Name of the mutation level.
   */
  name: string;
  ArithmeticOperator?: ArithmeticOperator[];
  ArrayDeclaration?: ArrayDeclaration[];
  AssignmentOperator?: AssignmentOperator[];
  ArrowFunction?: ArrowFunction[];
  BlockStatement?: BlockStatement[];
  BooleanLiteral?: BooleanLiteral[];
  ConditionalExpression?: ConditionalExpression[];
  EqualityOperator?: EqualityOperator[];
  LogicalOperator?: LogicalOperator[];
  MethodExpression?: MethodExpression[];
  ObjectLiteral?: ObjectLiteral[];
  OptionalChaining?: OptionalChaining[];
  Regex?: Regex[];
  StringLiteral?: StringLiteral[];
  UnaryOperator?: UnaryOperator[];
  UpdateOperator?: UpdateOperator[];
  [k: string]: MutatorDefinition[] | string | undefined;
}
