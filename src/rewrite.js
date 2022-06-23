// rewrite.js
// (c) contrast zone, 2022
// MIT License

var rewrite = (
    (function () {
        "use strict";
        var startTime, timeout;
        
        var parse = function (text, tmout) {
            var ret;
            
            startTime = new Date().getTime();
            timeout = tmout? tmout: Infinity;
            ret = deepParse (text, 0);

            //try {
                normalize (ret.arr);
                reduce (ret.arr, []);
                stripRules (ret.arr);
                normalize (ret.arr);
                ret.arr = flatten (ret.arr);
            //} catch (e) {
            //    ret = {err: e, pos: -1};
            //}
            
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
                
//                if (arr[0] === null & arr[1] === null) arr = [null];
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
        
        var matches = function (exp0, exp1, vars, fromVar) {
            var thisvar = -1;
            
            if (Array.isArray (exp0) && Array.isArray (exp0[0]) && exp0[0][0] === "REWRITE")
                return matches (exp0[1], exp1, vars, fromVar);

            if (Array.isArray (exp1) && Array.isArray (exp1[0]) && exp1[0][0] === "REWRITE")
                return matches (exp0, exp[1], vars, fromVar);
                        
            if ((new Date().getTime()) - startTime > timeout)
                throw "timeout of " + timeout + "ms expired";

            if (fromVar && exp0 === undefined)
                return true;

            if (exp1 === undefined)
                return true;
                
            for (var i = vars.length - 1; i >= 0; i--)
                if (vars[i][0][0] === exp1)
                    thisvar = i;
            
            if (thisvar >= 0) {
                if (vars[thisvar][1] !== undefined)
                    return matches (exp0, vars[thisvar][1], [], true);
                        
                vars[thisvar][1] = exp0;
                    
                return true;

            } else if (Array.isArray (exp0) && exp0[1] === null) {
                return matches (exp0[0], exp1, vars, fromVar);
                
            } else if (Array.isArray (exp1) && exp1[1] === null) {
                return matches (exp0, exp1[0], vars, fromVar);
            
            } else if (Array.isArray (exp0) && Array.isArray (exp1)) {
                if (exp0.length === 1 && exp1.length === 1)
                    return matches (exp0[0], exp1[0], vars, fromVar);
                
                else if (exp0.length === 2 && exp1.length === 2)
                    return matches (exp0[0], exp1[0], vars, fromVar) && matches (exp0[1], exp1[1], vars, fromVar);
                
                else
                    return false;

            } else if (isString (exp0) && isString (exp1)) {
                return exp0 === exp1;

            } else if (exp0 === null && exp1 === null) {
                return true;

            } else {
                return false;
            }
        }
        
        var reduce = function (node, rwrt) {
            var thisrwrt = rwrt, rules, nodearr = [], back, top = node, changed = false;

            if (Array.isArray (node)) {
                label1: while (true) {
                    if (!back && node) {
                        do {
                            rules = makeRules (node);
                            if (rules.length > 0) {
                                node = node[1];
                                thisrwrt = [...thisrwrt];
                                for (var i = rules.length - 1; i >= 0 ; i--)
                                    if (thisrwrt.indexOf (rules[i] === -1))
                                        thisrwrt.unshift (rules[i]);
                                
                            }
                        } while (rules.length > 0);
                            
                        if (Array.isArray (node[0]))
                            if (reduce (node[0], thisrwrt)) {
                                normalize (node[0]);
                                changed = true;
                                continue;
                            }

                        nodearr.push ([node, thisrwrt]);
                            
                        node = node[1];
                        if (node === null)
                             back = true;
                    
                    } else {
                        while (nodearr.length > 0) {
                            back = nodearr.pop ();
                            if (back[0] !== undefined && Array.isArray (back[0]) && back[0][0] !== undefined || back[0][1] !== null)
                                if (applyRules (back[0], JSON.parse(JSON.stringify(back[1])))) {
                                    normalize (back[0]);
                                    node = back[0];
                                    thisrwrt = back[1];
                                    back = false;
                                    changed = true;
                                    continue label1;
                                }
                        }
                        
                        break;
                    }
                };
            }

            return changed;
        }
        
        var makeRules = function (node) {
            var vars, tmprwrt, tmpvar, thisrwrt = [];

            if (Array.isArray (node)) {
                if (Array.isArray (node[0]) && node[0][0] === "REWRITE") {
                    tmprwrt = node[0][1];
                    while (tmprwrt[0][0][0] === "VAR" || tmprwrt[0][0][0] === "READ") {
                        tmpvar = tmprwrt[0];
                        vars = [];
                        while (tmpvar[0][0] === "VAR") {
                            vars.push (tmpvar[0][1]);
                            tmpvar = tmpvar[1];
                        }
                        
                        thisrwrt.push ([vars, tmpvar]);
                        tmprwrt = tmprwrt[1];
                    }

                    tmpvar = tmprwrt;
                    vars = [];
                    while (tmpvar[0][0] === "VAR") {
                        vars.push (tmpvar[0][1]);
                        tmpvar = tmpvar[1];
                    }
                    
                    if (tmpvar[0][0] === "READ")
                        thisrwrt.push ([vars, tmpvar]);
                }
            }

            return thisrwrt;
        }

        var applyRules = function (node, rwrt) {
            var vars;
            
            for (var i = 0; i < rwrt.length; i++) {                
                if (isString (node[0])) {
                    vars = makeVars (rwrt[i][0]);
                    if (matches (node[0], rwrt[i][1][0][1], vars)) {
                        applyVars (rwrt[i][1][1][1], vars);
                        node[0] = rwrt[i][1][1][1];
                        
                        return true;
                    }
                }

                vars = makeVars (rwrt[i][0]);
                if (matches (node, rwrt[i][1][0][1], vars)) {
                    applyVars (rwrt[i][1][1][1], vars);
                    node[0] = rwrt[i][1][1][1][0];
                    node[1] = rwrt[i][1][1][1][1];
                    
                    return true;
                }
            }
        }

        var makeVars = function (ruleVars) {
            var vars = [];
            
            for (var i = 0; i < ruleVars.length; i++)
                vars.push ([ruleVars[i], undefined]);
            
            return vars
        }

        var applyVars = function (range, vars) {
            while (Array.isArray (range)) {
                if (isString (range[0]))
                    for (var i = vars.length - 1; i >= 0; i--)
                        if (range[0] === vars[i][0][0])
                            if (vars[i][1] === undefined)
                                range[0] = undefined;
                            else
                                range[0] = JSON.parse(JSON.stringify(vars[i][1]));
                    
                if (Array.isArray (range[0])/* && range[0][0] !== "REWRITE"*/)
                    applyVars (range[0], vars);

                range = range[1];
            }
        }
        
        var stripRules  = function (node, parentNode) {
            while (Array.isArray (node)) {
                while (node && parentNode && Array.isArray (node) && node[0]=== "REWRITE") {
                    parentNode[0] = parentNode[1][0];
                    parentNode[1] = parentNode[1][1];
                    node = parentNode[0];
                }

                if (node && Array.isArray (node[0]))
                    stripRules (node[0], node);
                
                parentNode = null;
                if (Array.isArray (node))
                    node = node[1];
            }
        }
        
        var normalize = function (node, parentNode) {
            while (Array.isArray (node)) {
                while (node && parentNode && Array.isArray (node) && parentNode[1] === null) {
                    parentNode[0] = node[0];
                    parentNode[1] = node[1];
                    node = parentNode[0];
                }

                if (node && Array.isArray (node[0]))
                    normalize (node[0], node);
                
                if (node && parentNode && (isString (node[0]) || node[0] === null || node[0] === undefined) && node[1] === null) {
                    parentNode[0] = node[0];
                    node = parentNode[0];
                }

                parentNode = null;
                if (Array.isArray (node))
                    node = node[1];
            }
        }
        
        var flatten = function (node) {
            var flat = []
            while (Array.isArray (node)) {
                if (Array.isArray (node[0]))
                    flat.push (flatten (node[0]));
                    
                else
                    flat.push (node[0]);
                    
                node = node[1]
            }
            
            return flat
        }
        
        var isString = function (str) {
            return (typeof str === 'string' || str instanceof String)
        }

        return parse;
    }) ()
);
