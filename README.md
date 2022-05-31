
    // under construction //

# scriptorium

*Scriptorium* is estimated to be a Turing complete alternative to lambda calculus. Its intention is operating over s-expressions to expand asserted template occurences while aiming to be intuitive enough to introduce code templating to non-technical users. *Scriptorium* is designed as a creation with only one kind of rules: templating rules. Being such a minimalistic creation, complete *Scriptorium* implementation takes less than XYZ Javascript lines of code.

## declaring and expanding templates

*Scriptorium* brings only four keywords for declaring templates: `TEMPL` (templates), `ASK` (asking), `ANS` (answering), and `VAR` (variable). Templates are declared by the following patern:

    (
        (
            TEMPL
            ((ASK ...) (ANS ...))
            ((ASK ...) (ANS ...))
            ...
        ) (
            ...s-expression which templates operate on...
        )
    )

`TEMPL` keyword declares a list of templates. `ASK` keyword declares expression for triggering template expansion within s-expression. `ANS` keyword declares template expansion contents within s-expression. For example, code:

    (
        (
            TEMPL
            ((ASK greet) (ANS hello world))
        ) (
            greet
        )
    )

evaluates to:

    (hello world)

If we want to use template variables, we assert them with keyword `VAR` under the `ASK` tag. For example, code:

    (
        (
            TEMPL
            ((ASK greet (VAR x)) (ANS hello (x)))
        ) (
            greet world
        )
    )

also evaluates to:

    (hello world)

`ASK` keyword, in fact takes a tree of parenthesis-structured constants and variables in any order. Later, in operating s-expression, every occurence of that tree is replaced with relevant `ANS` s-expression tree while *Scriptorium* takes care of hygienic variable shadowing. Templates may be even nested, scoping their operation to s-expressions they belong to. *Scriptorium* also supports recursive template expansions, in which case we have to take care of recursion stopping conditions.


## some examples

To get familiar with *Scriptorium* we bring a few illustrative examples:

- example 1 - constants
    
    input:
    
        (
            (
                TEMPL
                ((ASK x) (ANS Venus))
                ((ASK y) (ANS milk ))
            ) (
                (x) likes (y)
            )
        )
    
    output:
    
        (Venus likes milk)

- example 2 - variables
    
    input:
    
        (
            (
                TEMPL
                (
                    (ASK l (VAR a) (VAR b))
                    (ANS (a) likes (b)    )
                )
            ) (
                l Pluto bones
            )
        )
    
    output:
        
        (Pluto likes bones)

- example3 - composition
    
    input:
    
        (
            (
                TEMPL
                ((ASK x) (ANS Nikki ))
                ((ASK y) (ANS cheese))
                (
                    (ASK l (VAR a) (VAR b))
                    (ANS (a) likes (b)    )
                )
            ) (
                l (x) (y)
            )
        )

    output:
    
        (Nikki likes cheese)

Note how template occurences, to be recognized in s-expression, have to be enclosed within their own parenthesis.

## using scriptorium

This package contains a Javascript implementation of *Scriptorium*. Just include `src/scriptorium.js` in your HTML or js file, and call `scriptorium(...s-expression string...)` function to return an output s-expression packed within an array.

To try *Scriptorium* within browser, please refer to [Scriptorium Playground `// under construction //`](https://contrast-zone.github.io/scriptorium/playground/index.html).

    // under construction //

