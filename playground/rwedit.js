var rwedit = function (node) {
    "use strict";
    var ww, hh;
    var rndid = Math.round (Math.random () * 32768);
    var ed = document.getElementById(node);
    
    var font = "8pt monospace";
    var colorText = "rgb(208,208,208)";
    var colorTextBack = "black";
    var colorKeyword = "rgb(104,104,104)";
    var colorBracketMatch = "white";
    var colorBracketMatchBack = "rgb(75,75,75)";
    var colorComment = "rgb(128,128,128)";
     
     ed.innerHTML = 
    `
    <div id="container${rndid}" style="position: relative; width: inherit; height: inherit;">
      <div id="backdrop${rndid}" style = "background-color: ${colorTextBack}; width: inherit; height: inherit; overflow: hidden;">
        <div id="hilights${rndid}" style="wrap: none; font: ${font}; padding:5px; white-space: pre; color: ${colorText}; width: inherit; height: inherit; overflow: hidden;">
        </div>
      </div>
      <textarea id="input${rndid}" spellcheck="false" wrap="off" oninput="" style="width: inherit; height: inherit; border-radius: 0; outline: none; box-sizing: border-box; resize: none; display: block; border-style: none; /*background-color: black;*/ background-color: transparent; color: transparent; caret-color: white; font: ${font}; margin: 0; padding:5px; position: absolute; top: 0; left: 0; z-index: 0;">
      </textarea>
    </div>
    `

    var input = document.getElementById(`input${rndid}`);
    var hilights = document.getElementById(`hilights${rndid}`);
    var backdrop = document.getElementById(`backdrop${rndid}`);
    var container = document.getElementById(`container${rndid}`);
    
    container.style.width = "inherit";
    container.style.height = "inherit";
    
    function hilightAll() {
        const activeElement = document.activeElement
        if (activeElement && activeElement.id === `input${rndid}`) {
            var text = input.value;

            text = prepareBraces (text);
            
            text = text
            .replaceAll(/&/g, '&amp;')
            .replaceAll(/</g, '&lt;')
            .replaceAll(/>/g, '&gt;');

            text = hilightContents (text);

            text = hilightBraces (text);
            
            // scroll fix
            text = text
            .replace(/\n$/g, '\n\n')
            .replace(/\n/g, '     \n');

            text += "<br/><br/><br/><br/><br/> ";

            hilights.innerHTML = text;

            hilights.style.height = hh + "px";
            backdrop.style.height = hh + "px";
            container.style.height = hh + "px";
            input.style.height = hh + "px";
          
            hilights.style.width = ww + "px";
            backdrop.style.width = ww + "px";
            container.style.width = ww + "px";
            input.style.width = ww + "px";
        }
        
        handleScroll ();
    }
    
    function hilightContents (text) {
        var reg = new RegExp("(\"([^\"\\\\\\n]|(\\\\.))*((\")|(\n)|($)))|(\\/\\/((.*\\n)|(.*$)))|(\\/\\*[\\S\\s]*?((\\*\\/)|$))", "g");///(\\/\\/((.*\\n)|(.*$)))|(\\/\\*[\\S\\s]*?\\*\\/)/g;
        var result;
        var text1 = "";
        var pos1 = 0;
        while((result = reg.exec(text)) !== null) {
            text1 += hilightKeywords (text.substring(pos1, result.index));
            text1 += `<span style="color:${colorComment}">` + result[0] + '</span>';
            pos1 = result.index + result[0].length;
        }
        text1 += hilightKeywords (text.substring(pos1, text.length));
        
        return text1;
    }
    
    function prepareBraces (text) {
        var st = input.selectionStart;
        var en = input.selectionEnd;
        var found, i1, i2;
        
        if (st === en) {
            if (text.substr(st, 1) !== "(" && text.substr(st, 1) !== ")")
                st--;
              
            if (text.substr(st, 1) === "(") {
                var i = st, nb = 0;
                do {
                    if (text.substr(i, 1) == "(")
                        nb++;
                    else if (text.substr(i, 1) == ")")
                        nb--;
                
                    i++;
                } while (i < text.length && nb !== 0);

                if (i <= text.length) {
                    found = true;
                    i1 = st;
                    i2 = i - 1;
                }
                
            } else if (text.substr(st, 1) === ")") {
                var i = st, nb = 0;
                do {
                    if (text.substr(i, 1) == "(")
                        nb--;
                    else if (text.substr(i, 1) == ")")
                        nb++;
                  
                    i--;
                } while (i > -1 && nb !== 0);
              
                if (i >= -1) {
                    found = true;
                    i1 = i + 1;
                    i2 = st;
                }
            }
        }
        

        if (found) {
            var p0 = text.substring(0, i1);
            var p1 = text.substring(i1 + 1, i2);
            var p2 = text.substring(i2 + 1, text.length)
            text = p0 + "(\0x0000 " + p1 + " \0x0000)" + p2;
        }
        
        return text;
    }
    
    function hilightBraces (text) {
        return text
        .replaceAll("(\0x0000 ", `<span style="color: ${colorBracketMatch}; background-color: ${colorBracketMatchBack};">(</span>`)
        .replaceAll(" \0x0000)", `<span style="color: ${colorBracketMatch}; background-color: ${colorBracketMatchBack};">)</span>`);
    }

    function hilightKeywords (text) {
        return text
        .replace(/\bREWRITE\b/g, `<span style="color: ${colorKeyword}; background-color: transparent; font-weight: bold;">REWRITE</span>`)
        .replace(/\bREAD\b/g, `<span style="color: ${colorKeyword}; background-color: transparent; font-weight: bold;">READ</span>`)
        .replace(/\bWRITE\b/g, `<span style="color: ${colorKeyword}; background-color: transparent; font-weight: bold;">WRITE</span>`)
        .replace(/\bVAR\b/g, `<span style="color: ${colorKeyword}; background-color: transparent; font-weight: bold;">VAR</span>`);
    }

    function handleScroll () {
        hilights.scrollTop = input.scrollTop;
        hilights.scrollLeft = input.scrollLeft;
    }
    
    function handleInput () {
        hilightAll ();
    }

    onresize = function () {
        container.style.width = "0px";
        container.style.height = "0px";
        
        setTimeout (function () {
            hh = ed.clientHeight;
            ww = ed.clientWidth;
            handleInput ();
        }, 0);
    }
    
    document.addEventListener('selectionchange', hilightAll);

    input.addEventListener('input', handleInput);

    input.onscroll = handleScroll;

    setTimeout (function () {
        handleInput();
    }, 0);
    
    ed.addEventListener('resize', onresize);
    onresize();
    
    return {
        getValue: function () {
            return input.value;
        },
        setValue: function (value) {
            input.value = value;
        },
        getSelectionStart () {
            return input.selectionStart;
        },
        getSelectionEnd () {
            return input.selectionEnd;
        },
        setSelectionStart (v) {
            input.selectionStart = v;
        },
        setSelectionEnd (v) {
            input.selectionEnd = v;
        },
        setFocus: function () {
            input.focus ();
        }
    }
}

