// scriptorium.js
// (c) contrast zone, 2022
// MIT License

var scriptorium = (
    (function () {
        "use strict";
        
        var parse = function (text) {
            var ret = deepParse (text, 0);
            
            if (ret.err)
                return ret;
            
            if (ret.pos === text.length)
                return ret.arr;
                
            if (text.substr(ret.pos, 2) === "/*")
                return {err: "unterminated comment", pos: ret.pos};
            
            else
                return {err: "unexpected characters", pos: ret.pos};
        }

        var deepParse = function (text, pos) {
            var lastToken = pos;
            var arr = [];
            var i = skipWhitespace (text, pos);
            
            if (text.charAt(i) === "(")
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
                        
                    arr.push (ret.arr);
                    i = ret.pos;

                } else if (text.charAt (i) === '"') {
                    do {
                        if (text.charAt (i) === "\\")
                            i += 2;
                        
                        else
                            i++;
                            
                    } while ('"\n'.indexOf (text.charAt (i)) === -1 && i < text.length);
                    
                    if (text.charAt (i) === '"') {
                        i++;
                        arr.push (text.substring (lastToken, i));
                    
                    } else
                        return {err: "unterminated string", pos: lastToken};
                    
                } else {
                    while ('"() \t\n\r'.indexOf (text.charAt (i)) === -1 && i < text.length)
                        i++;
                        
                    if (i > lastToken)
                        arr.push (text.substring (lastToken, i));
                }

            } while (i > lastToken);
                            
            if (text.charAt (i) === ")") {
                i = skipWhitespace (text, i + 1);
                return {pos: i, arr: arr};

            } else
                return {err: "Expected ')'", pos: i};
        }
        
        var skipWhitespace = function (text, i) {
            do {
                var pos = i;
                while (" \t\n\r".indexOf(text.charAt(i)) > -1 && i < text.length)
                    i++;

                if (text.substr(i, 2) == "//") {
                    for (var j = i + 2; j < text.length; j++)
                        if (text.charAt(j) === "\n" || j + 1 >= text.length) {
                            i = j + 1;
                            break;
                        }
                    
                    if (j == text.length)
                        i = j;

                } else if (text.substr(i, 2) == "/*") {
                    for (var j = i + 2; j < text.length; j++)
                        if (text.substr(j, 2) === "*/") {
                            i = j + 2;
                            break;
                        }
                }
                
            } while (i > pos);
            
            return i;
        }
        
        return parse;
    }) ()
);
