import babel, { type NodePath } from '@babel/core';

import { ConditionalExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const booleanOperators = Object.freeze(['!=', '!==', '&&', '<', '<=', '==', '===', '>', '>=', '||']);

const { types } = babel;

export const conditionalExpressionMutator: NodeMutator<ConditionalExpression> = {
  name: 'ConditionalExpression',

  operators: {
    BooleanExpressionToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ConditionalExpression_BooleanExpression_ToFalseLiteral' },
    BooleanExpressionToTrue: { replacement: types.booleanLiteral(true), mutationName: 'ConditionalExpression_BooleanExpression_ToTrueLiteral' },
    DoWhileLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ConditionalExpression_DoWhileLoopCondition_ToFalseLiteral' },
    ForLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ConditionalExpression_ForLoopCondition_ToFalseLiteral' },
    IfToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ConditionalExpression_IfCondition_ToFalseLiteral' },
    IfToTrue: { replacement: types.booleanLiteral(true), mutationName: 'ConditionalExpression_IfCondition_ToTrueLiteral' },
    WhileLoopToFalse: { replacement: types.booleanLiteral(false), mutationName: 'ConditionalExpression_WhileLoopCondition_ToFalseLiteral' },
    SwitchToEmpty: { replacement: [], mutationName: 'ConditionalExpression_SwitchStatementBody_Removal' },
  },

  *mutate(path, levelMutations) {
    if (isTestOfLoop(path)) {
      if (isTestOfWhileLoop(path) && (levelMutations === undefined || levelMutations.includes(this.operators.WhileLoopToFalse.mutationName))) {
        yield this.operators.WhileLoopToFalse.replacement;
      }

      if (isTestOfDoWhileLoop(path) && (levelMutations === undefined || levelMutations.includes(this.operators.DoWhileLoopToFalse.mutationName))) {
        yield this.operators.DoWhileLoopToFalse.replacement;
      }
      if (isTestOfForLoop(path) && (levelMutations === undefined || levelMutations.includes(this.operators.ForLoopToFalse.mutationName))) {
        yield this.operators.ForLoopToFalse.replacement;
      }
    } else if (isTestOfCondition(path)) {
      if (levelMutations === undefined || levelMutations.includes(this.operators.IfToTrue.mutationName)) {
        yield this.operators.IfToTrue.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.IfToFalse.mutationName)) {
        yield this.operators.IfToFalse.replacement;
      }
    } else if (isBooleanExpression(path)) {
      if (path.parent?.type === 'LogicalExpression') {
        // For (x || y), do not generate the (true || y) mutation as it
        // has the same behavior as the (true) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '||') {
          if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToFalse.mutationName)) {
            yield this.operators.BooleanExpressionToFalse.replacement;
          }
          return;
        }
        // For (x && y), do not generate the (false && y) mutation as it
        // has the same behavior as the (false) mutator, handled in the
        // isTestOfCondition branch above
        if (path.parent.operator === '&&') {
          if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToTrue.mutationName)) {
            yield this.operators.BooleanExpressionToTrue.replacement;
          }
          return;
        }
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToTrue.mutationName)) {
        yield this.operators.BooleanExpressionToTrue.replacement;
      }
      if (levelMutations === undefined || levelMutations.includes(this.operators.BooleanExpressionToFalse.mutationName)) {
        yield this.operators.BooleanExpressionToFalse.replacement;
      }
    } else if (path.isForStatement() && !path.node.test) {
      if (levelMutations === undefined || levelMutations.includes(this.operators.ForLoopToFalse.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.test = this.operators.ForLoopToFalse.replacement;
        yield replacement;
      }
    } else if (path.isSwitchCase() && path.node.consequent.length > 0) {
      // if not a fallthrough case
      if (levelMutations === undefined || levelMutations.includes(this.operators.SwitchToEmpty.mutationName)) {
        const replacement = deepCloneNode(path.node);
        replacement.consequent = this.operators.SwitchToEmpty.replacement;
        yield replacement;
      }
    }
  },
};

function isTestOfLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return (parentPath.isForStatement() || parentPath.isWhileStatement() || parentPath.isDoWhileStatement()) && parentPath.node.test === path.node;
}

function isTestOfWhileLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isWhileStatement() && parentPath.node.test === path.node;
}

function isTestOfForLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isForStatement() && parentPath.node.test === path.node;
}

function isTestOfDoWhileLoop(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isDoWhileStatement() && parentPath.node.test === path.node;
}

function isTestOfCondition(path: NodePath): boolean {
  const { parentPath } = path;
  if (!parentPath) {
    return false;
  }
  return parentPath.isIfStatement() /*|| parentPath.isConditionalExpression()*/ && parentPath.node.test === path.node;
}

function isBooleanExpression(path: NodePath) {
  return (path.isBinaryExpression() || path.isLogicalExpression()) && booleanOperators.includes(path.node.operator);
}
