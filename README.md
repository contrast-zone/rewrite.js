# lissy.js

*lissy.js* is estimated to be a [Turing complete](https://en.wikipedia.org/wiki/Turing_completeness), [s-expression](https://en.wikipedia.org/wiki/S-expression) based [term rewriting](https://en.wikipedia.org/wiki/Rewriting) system. Its original intention is operating over s-expressions to expand asserted template occurrences while aiming to be intuitive enough to introduce code templating to non-technical users.

Nevertheless, its potential capabilities reach far beyond templating. *lissy.js* operates on s-expressions, and it can reshape any s-expression to any other s-expression using its rule based computing system. Although it has abilities to be used pretty much anywhere where any kind of computation is required (as long as slower performance on intensive computations doesn't go beyond limits of user patience), *lissy.js* will only establish its worth at tasks naturally involving formula applications such as proof construction for different kinds of logic, truth table calculations, or combinatorial problem solving.

---

To try *lissy.js* within browser, please refer to [lissy.js Playground](https://contrast-zone.github.io/lissy/playground/index.html). The playground may also be run locally, after downloading this package.

---

## table of contents

- [1. introductory examples](#1-introductory-examples)
- [2. further examples](#2-further-examples)
- [3. how does it work](#3-how-does-it-work)
- [4. speed performance](#4-speed-performance)
- [5. using lissy](#5-using-lissy)

## 1. introductory examples

*lissy.js* is designed as a creation with only one built-in construct: rewriting rules. *lissy.js* brings only five keywords for declaring rewriting rules: `REWRITE`, `RULE`, `READ`, `WRITE`, and `VAR`. Rules are declared and applied by the following patern:

    (
        (
            REWRITE
            (RULE (READ ...) (WRITE ...))
            (RULE (READ ...) (WRITE ...))
            ...
        )
        
        ...s-expression which rules operate on...
    )

`REWRITE` keyword declares a list of rules. `RULE` keyword announces a rule. `READ` keyword declares s-expression match for triggering rule rewriting. `WRITE` keyword declares s-expression replacement in rule rewriting. This is called *reduction*, even if it sometimes looks more like expansion than like reduction. For example, code:

    (
        (
            REWRITE
            (RULE (READ greet) (WRITE hello world))
        )
        
        greet
    )

evaluates to:

    (hello world)

We may also want to use rule variables, which we assert as a list of `VAR` tagged elements before `RULE` tagged element. For example, code:

    (
        (
            REWRITE
            ((VAR <x>) (RULE (READ greet <x>) (WRITE hello <x>)))
        )
        
        greet world
    )

also evaluates to:

    (hello world)

`REWRITE` rule definitions may be nested in deeper areas of the whole s-expression, scoping their operation to s-expression parts they belong to. *lissy.js* also supports recursive rule reduction, in which case we have to be careful, and take care of recursion stopping conditions if we don't want to form an infinite loop.

## 2. further examples

Please refer to the *lissy.js Playground* from the above link for more thorough examples exposure. Available examples include some basic term rewriting setups, as well as equality predicate, branching choice, Boolean operations, proof checking, SAT solver, and action planning use.

## 3. how does it work

*lissy.js* looks deep down the whole s-expression for nodes containing `REWRITE` keyword, and takes contained rules in noted order. Then it applies the ordered rules from the deepest nodes to the right towards the shallowest nodes to the left. During such node visiting, if the first available rule `READ` tag expression matches a node, then `WRITE` tag counterpart replacement is being made. When the replacement takes place, the rewriting procedure for the current node is triggered from the start (from deep to shallow), seeking to again apply the same set of rules. When there are no more rule matches, rewriting is considered done for the current node, and rewriting continues to the parent node, lifting the rewriting executiom to upper level, towards the top node. Finally, when the top node is done, the output expression is being reported to the calling system.

During rewriting, some helper parenthesis normalizations are being made. Firstly, all the `(a (b (c (...))))` expressions are considered equal to `(a b c ...)`. Secondly, if a pair of outer parenthesis contains only a single pair of inner parenthesis, the outer parenhesis pair is left out. Thirdly, if any parenthesis contain only a single identifier, the parenthesis are also being left out. These normalizations make the pattern matching flexible enough to tame the possible parenthesis accumulation that would otherwise appear on repeatable read-write cycles.

## 4. speed performance

Being such a minimalist creation with only one kind of built-in constructs, the complete *lissy.js* implementation takes about 400 Javascript lines of code. Despite the implementation small size, and since it covers Turing complete class of computations, worst case scenario time complexity for processing input may reach `O(∞)`. Nevertheless, further optimizations of the search-replace algorithm are possible, and once that the project reaches a stable state, beside possible optimizations, there may be future plans to target *lissy.js* to Webasssembly to gain better speed performance, depending on the final speed marks.

## 5. using rewrite

This package contains a naive Javascript implementation of *lissy.js*. Just include `src/lissy.js` in your HTML or js file, and call `lissy(...s-expression string..., ...timeout...)` function to return an output s-expression packed within an array.

In a case of any bugs, please open a new issue at the [project home page](https://github.com/contrast-zone/lissy).

