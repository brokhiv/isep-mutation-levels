---
title: Mutation Levels
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/mutation-levels.md
---

This page describes the concept of mutation levels and how to use them in your configuration.

## Terminology
The smallest unit in mutation testing is the **mutation operator**. This is a single type of mutation, like `AdditionOperatorNegation`, which changes a `+`-operator into a `-`-operator.

Every mutation operator belongs to a **mutator**, also referred to as a **mutator group**. This is a set of mutation operators that can be applied to the same node type. 
For example, the `AdditionOperatorNegation` mutation operator belongs to the `ArithmeticOperator` mutator group.

Finally, a **mutation level** is an artificial grouping of mutation operators with the purpose of striking a balance between performance and efficacy of a mutation run. 
Such a level is not necessarily in line with the previously mentioned mutator groups, but designed to work right away.
Currently, mutation levels are named from `level1` to `level3`, where `level1` has the best performance and `level3` has the best efficacy.

## Specifying included/excluded mutators
A **mutation operator** can be specified with its literal name. **Mutator groups** and **mutation levels** are specified with the `@` prefix, for example `@ArithmeticOperator` or `@level1`.
For most users, a single level should suffice without further tweaks. 
