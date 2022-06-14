// scriptorium.js
// (c) contrast zone, 2022
// MIT License

var rewrite = (
    (function () {
        "use strict";
        
        var parse = function (text) {
            var ret = deepParse (text, 0);

            reduce (ret.arr, []);
            normalize (ret.arr);
            
            if (ret.err)
                return ret;
            
            else if (ret.pos === text.length)
                return ret.arr;
            
            else
                return {err: "unexpected characters", pos: ret.pos};
        }

        var deepParse = function (text, pos) {
            var lastToken = pos;
            var arr = [null, null], array;
            var i = skipWhitespace (text, pos);
                        
            if (text.substr (i, 2) === "/*")
                return {err: "unterminated comment", pos: i};
            
            else if (text.charAt(i) === "(")
                i++;
            
            else
                return {err: "expected '('", pos: i};
            
            do {
                i = skipWhitespace (text, i);
                if (text.substr (i, 2) === "/*")
                    return {err: "unterminated comment", pos: i};
                
                lastToken = i;
                if (text.charAt (i) === "(") {
                    var ret = deepParse (text, i);
                    
                    if (ret.err)
                        return ret;
                    
                    arr = insert (arr, ret.arr);
                    i = ret.pos;
                    
                } else if (text.charAt (i) === '"') {
                    do {
                        if (text.charAt (i) === "\\")
                            i += 2;
                        
                        else
                            i++;
                        
                    } while ('"\n'.indexOf (text.charAt (i)) === -1 && i < text.length);
                    
                    if (text.charAt (i) === '"') {
                        try {
                            i++;
                            arr = insert (arr, JSON.parse(text.substring (lastToken, i)));
                            
                        } catch {
                            return {err: "bad escaped character in string", pos: lastToken}
                        }
                        
                    } else
                        return {err: "unterminated string", pos: lastToken};
                    
                } else {
                    while ('"() \t\n\r'.indexOf (text.charAt (i)) === -1 && text.substr(i, 2) !== "//" && i < text.length)
                        i++;
                    
                    if (i > lastToken)
                        arr = insert (arr, text.substring (lastToken, i));
                }
                
                if (arr[0] === null & arr[1] === null) arr = [null];
                if (!array)                            array = arr;

            } while (i > lastToken);
            
            if (text.charAt (i) === ")") {
                i = skipWhitespace (text, i + 1);
                if (text.substr (i, 2) === "/*")
                    return {err: "unterminated comment", pos: i};
                
                else
                    return {pos: i, arr: array};
                
            } else
                return {err: "expected ')'", pos: i};
        }
        
        var insert = function (arr, node) {
            arr[1] = [node, null];
            
            return arr[1];
        }
        
        var skipWhitespace = function (text, i) {
            do {
                var pos = i;
                
                while (i < text.length && " \t\n\r".indexOf(text.charAt(i)) > -1)
                    i++;

                if (text.substr(i, 2) == "//") {
                    for (var j = i + 2; j < text.length && text.charAt(j) !== "\n"; j++);
                    if (j < text.length)
                        i = j + 1;
                    
                    else
                        i = j;

                } else if (text.substr(i, 2) == "/*") {
                    for (var j = i + 2; j < text.length && text.substr(j, 2) !== "*/"; j++);
                    if (j < text.length)
                        i = j + 2;
                }
                
            } while (i > pos);
            
            return i;
        }
        
        var normalize = function (node) {
            while (Array.isArray (node)) {
                if (Array.isArray (node[0]) && isString (node[0][0]) && node[0][1] === null)
                    node[0] = node[0][0];
                    
                if (Array.isArray (node[0]))
                    normalize (node[0]);
                
                node = node[1];
            }
        }
        
        var reduce = function (node, rwrt) {
            var thisrwrt = rwrt, top = node, changed = false;
            
            while (Array.isArray (node)) {
                thisrwrt = thisrwrt.concat (pickRules (node));
                
                if (execute (node, thisrwrt)) {
                    changed = true;
                    node = top;
                    continue;
                }
                
                if (Array.isArray (node[0]))
                    if (reduce (node[0], thisrwrt)) {
                        node = top;
                        continue;
                    }
                
                node = node[1];
            }
            
            return changed;
        }
        
        var pickRules = function (node) {
            var thisrwrt = [], tmprwrt;

            if (Array.isArray (node)) {
                while (node[0] && node[0][0] === "REWRITE") {
                    if (node[1]) {
                        thisrwrt = [];
                        tmprwrt = node[0][1];
                        while (tmprwrt) {
                            thisrwrt.push (tmprwrt[0]);
                            tmprwrt = tmprwrt[1];
                        }
                        
                        node[0] = node[1][0];
                        node[1] = node[1][1];
                    
                    } else {
                        node[0] = null;
                        node.splice(1, 1);
                    }
                }
            }
            
            return thisrwrt;
        }
        
        var execute = function (node, rwrt) {
            for (var i = 0; i < rwrt.length; i++) {
                var vars = [];
                
                if (matches (node, rwrt[i][0][1], vars)) {
                    replaceVars (node, rwrt[i][1][0][1], vars);
                    return true;
                }

                if (isString (node[0])) {
                    if (matches (node[0], rwrt[i][0][1], vars)) {
                        node[0] = replaceVar (rwrt[i][1][0][1], vars);
                        return true;
                    }
                }
            }
        }
        
        var matches = function (exp0, exp1, vars) {
            if (Array.isArray (exp1) && exp1[0] === "VAR") {
                for (var i = 0; i < vars.length; i++)
                    if (vars[i][0][0] === exp1[1][0])
                        return matches (exp0, vars[i][1], vars);
                
                vars.push ([exp1[1][0], exp0]);
                    
                return true
                
            } else if (Array.isArray (exp0) && Array.isArray (exp1)) {
                return matches (exp0[0], exp1[0], vars) && matches (exp0[1], exp1[1], vars);
                
            } else if (isString (exp0) && isString (exp1[0]) && exp1[1] === null) {
                return exp0 === exp1[0];
                
            } else if (isString (exp0) && isString (exp1)) {
                return exp0 === exp1;
                
            } else if (exp0 === null && exp1 === null) {
                return true;
            
            } else {
                return false;
            }
        }
        
        var replaceVars = function (srch, repl, vars) {
            while (Array.isArray (repl)) {
                srch[0] = repl[0];
                srch[1] = repl[1];
                
                if (isString (srch[0]))
                    srch[0] = replaceVar (srch[0], vars);

                if (Array.isArray (srch[0]))
                    replaceVars (srch[0], repl[0], vars);
                    
                repl = repl[1];
                srch = srch[1];
            }
        }
        
        var replaceVar = function (exp, vars) {
            for (var i = vars.length - 1; i >= 0; i--)
                if (exp === vars[i][0])
                    return vars[i][1];
            
            return exp;
        }
        
        var isString = function (str) {
            return (typeof str === 'string' || str instanceof String)
        }
        
        return parse;
    }) ()
);
