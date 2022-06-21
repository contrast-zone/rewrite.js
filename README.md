
    // under construction //

# rewrite

*Rewrite* is estimated to be a Turing complete, s-expression based term rewriting system. Its original intention is operating over s-expressions to expand asserted template occurrences while aiming to be intuitive enough to introduce code templating to non-technical users.

Nevertheless, its potential capabilities reach far beyond templating. *Rewrite* operates on s-expressions, and it can transform any s-expression to any other s-expression using its rule based computing system. It may be used as a curiosity computing platform, problem solver, theorem prover, compiler compiler, and pretty much everywhere where any kind of computation is required, as long as its slower performance on intensive computations doesn't exceed user patience.

*Rewrite* is designed as a creation with only one kind of rules: substitution rules. Being such a minimalist creation, complete *Rewrite* implementation takes about 400 Javascript lines of code.

---

To try *Rewrite* within browser, please refer to [Rewrite Playground](https://contrast-zone.github.io/rewrite/playground/index.html). The playground also may be run locally, after downloading this package.

---

## basic template expansion

*Rewrite* brings only four keywords for declaring templates: `REWRITE`, `READ`, `WRITE`, and `VAR`. Templates are declared by the following patern:

    (
        (
            REWRITE
            ((READ ...) (WRITE ...))
            ((READ ...) (WRITE ...))
            ...
        )
        
        ...s-expression which templates operate on...
    )

`REWRITE` keyword declares a list of templates. `READ` keyword declares expression for triggering template expansion within s-expression. `WRITE` keyword declares template expansion contents within s-expression. For example, code:

    (
        (
            REWRITE
            ((READ greet) (WRITE hello world))
        )
        
        greet
    )

evaluates to:

    (hello world)

If we want to use template variables, we assert them as a list of elements each tagged `VAR` before `READ` and `WRITE` tagged elements. For example, code:

    (
        (
            REWRITE
            ((VAR <x>) (READ greet <x>) (WRITE hello <x>))
        )
        
        greet world
    )

also evaluates to:

    (hello world)

`REWRITE` templates may be nested in deeper areas of the whole s-expression, scoping their operation to s-expression parts they belong to. *Rewrite* also supports recursive template expansions, in which case we have to be careful, and to take care of recursion stopping conditions if we don't want to form an infinite loop.

## how does it work

*Rewrite* looks deep down the whole s-expression for nodes containing `REWRITE` keyword, and takes contained rules in noted order. Then it applies the ordered rules from the deepest nodes to the right towards the shallowest nodes to the left. During such node visiting, if the first available rule `READ` matches a node, then `WRITE` counterpart replacement is being made, and the rewriting procedure for the current node is triggered from the start (from deep to shallow), seeking to again apply the same set of rules. When there are no more rule matches, rewriting is done for the current node, and rewriting continues to the parent node, lifting the executiom up, towards the top node. When the top node is done, then rewriting is done, and the output expression is being reported.

During rewriting, some helper parenthesis normalizations are being made. Firstly, all the `(a (b (c (...))))` expressions are considered equal to `(a b c ...)`. Secondly, if there are parenthesis containing only a single pair of inner parenthesis, the outer parenhesis are left out. Thirdly, if any parenthesis contain only a single identifier, the parenthesis are also being left out. These normalizations make the pattern matching flexible enough to tame the possible parenthesis accumulation that would otherwise appear on repeatable read-write cycles.

## further examples

Please refer to the [Rewrite Playground](https://contrast-zone.github.io/rewrite/playground/index.html) for more thorough examples exposure. The examples contain equality predicate, Boolean operations, binary number addition, proof checking, and meta-rules.

## using rewrite

This package contains a Javascript implementation of *Rewrite*. Just include `src/rewrite.js` in your HTML or js file, and call `rewrite(...s-expression string..., ...timeout...)` function to return an output s-expression packed within an array.

    // under construction //

