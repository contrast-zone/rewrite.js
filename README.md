
    // under construction //

# rewrite

*Rewrite* is estimated to be a Turing complete, s-expression based term rewriting system. Its original intention is operating over s-expressions to expand asserted template occurrences while aiming to be intuitive enough to introduce code templating to non-technical users.

Nevertheless, its potential capabilities reach far beyond templating. *Rewrite* operates on s-expressions, and it can transform any s-expression to any other s-expression using its rule based computing system. It may be used as a curiosity computing platform, problem solver, theorem prover, compiler compiler, and pretty much everywhere where any kind of computation is required, as long as its slower performance on intensive computations doesn't exceed user patience.

*Rewrite* is designed as a creation with only one kind of rules: substitution rules. Being such a minimalist creation, complete *Rewrite* implementation takes about 400 Javascript lines of code.

---

To try *Rewrite* within browser, please refer to [Rewrite Playground](https://contrast-zone.github.io/rewrite/playground/index.html). The playground may also be run locally, after downloading this package.

---

## basic rewriting

*Rewrite* brings only four keywords for declaring rewriting rules: `REWRITE`, `READ`, `WRITE`, and `VAR`. Rules are declared and applied by the following patern:

    (
        (
            REWRITE
            ((READ ...) (WRITE ...))
            ((READ ...) (WRITE ...))
            ...
        )
        
        ...s-expression which rules operate on...
    )

`REWRITE` keyword declares a list of rules. `READ` keyword declares s-expression match for triggering rule rewriting. `WRITE` keyword declares s-expression replacement in rule rewriting. This is called *reduction*, even if it looks more like expansion than like reduction. For example, code:

    (
        (
            REWRITE
            ((READ greet) (WRITE hello world))
        )
        
        greet
    )

evaluates to:

    (hello world)

We may also want to use rule variables, which we assert as a list of `VAR` tagged elements before `READ` and `WRITE` tagged elements. For example, code:

    (
        (
            REWRITE
            ((VAR <x>) (READ greet <x>) (WRITE hello <x>))
        )
        
        greet world
    )

also evaluates to:

    (hello world)

`REWRITE` rule definitions may be nested in deeper areas of the whole s-expression, scoping their operation to s-expression parts they belong to. *Rewrite* also supports recursive rule reduction, in which case we have to be careful, and to take care of recursion stopping conditions if we don't want to form an infinite loop.

## how does it work

*Rewrite* looks deep down the whole s-expression for nodes containing `REWRITE` keyword, and takes contained rules in noted order. Then it applies the ordered rules from the deepest nodes to the right towards the shallowest nodes to the left. During such node visiting, if the first available rule `READ` tag expression matches a node, then `WRITE` tag counterpart replacement is being made. When the replacement takes place, the rewriting procedure for the current node is triggered from the start (from deep to shallow), seeking to again apply the same set of rules. When there are no more rule matches, rewriting is considered done for the current node, and rewriting continues to the parent node, lifting the rewriting executiom to upper level, towards the top node. Finally, when the top node is done, the output expression is being reported to the calling system.

During rewriting, some helper parenthesis normalizations are being made. Firstly, all the `(a (b (c (...))))` expressions are considered equal to `(a b c ...)`. Secondly, if a pair of parenthesis contain only a single pair of inner parenthesis, the outer parenhesis pair is left out. Thirdly, if any parenthesis contain only a single identifier, the parenthesis are also being left out. These normalizations make the pattern matching flexible enough to tame the possible parenthesis accumulation that would otherwise appear on repeatable read-write cycles.

## further examples

Please refer to the *Rewrite Playground* from the above link for more thorough examples exposure. Available examples contain equality predicate, Boolean operations, binary number addition, proof checking, and meta-rules.

## using rewrite

This package contains a Javascript implementation of *Rewrite*. Just include `src/rewrite.js` in your HTML or js file, and call `rewrite(...s-expression string..., ...timeout...)` function to return an output s-expression packed within an array.

    // under construction //

