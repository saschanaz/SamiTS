"use strict";
/*
Copyright (c) 2014 SaschaNaz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
*/
var SamiTS;
(function (SamiTS) {
    async function createWebVTT(input, options) {
        let sami;
        if (input instanceof SamiTS.SAMIDocument)
            sami = input;
        else
            sami = await createSAMIDocument(input);
        return (new SamiTS.WebVTTWriter()).write(sami.cues, options);
    }
    SamiTS.createWebVTT = createWebVTT;
    async function createSubRip(input, options) {
        let sami;
        if (input instanceof SamiTS.SAMIDocument)
            sami = input;
        else
            sami = await createSAMIDocument(input);
        return (new SamiTS.SubRipWriter()).write(sami.cues, options);
    }
    SamiTS.createSubRip = createSubRip;
    async function createSAMIDocument(input) {
        const samistr = await getString(input);
        return SamiTS.SAMIDocument.parse(samistr);
    }
    SamiTS.createSAMIDocument = createSAMIDocument;
    async function getString(input) {
        if (typeof input === "string")
            return input;
        else if (input instanceof Blob) {
            return readBlobAsText(input);
        }
    }
    function readBlobAsText(blob) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (ev) => {
                resolve(reader.result);
            };
            reader.readAsText(blob);
        });
    }
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class HTMLTagFinder {
        static FindStartTag(tagname, entirestr) {
            let tag;
            let position = 0;
            let startPosition = 0;
            while (!tag) {
                position = this.searchWithIndex(entirestr, new RegExp('<' + tagname, 'i'), position);
                if (position !== -1) {
                    startPosition = position;
                    position += tagname.length + 1;
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            tag = { element: xe, startPosition, endPosition: position };
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }
            return tag;
        }
        static FindStartTags(tagname, entirestr) {
            let list = [];
            let position = 0;
            let startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, new RegExp('<' + tagname, 'i'), position);
                if (position != -1) {
                    startPosition = position;
                    position += tagname.length + 1;
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition, endPosition: position });
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }
            return list;
        }
        static FindAllStartTags(entirestr) {
            let list = [];
            let position = 0;
            let startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, /<\w+/, position);
                if (position != -1) {
                    startPosition = position;
                    position++;
                    let tagname = '';
                    while (entirestr[position].search(/[A-z]/) === 0) {
                        tagname += entirestr[position];
                        position++;
                    }
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition, endPosition: position });
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }
            return list;
        }
        static getAttribute(entirestr, position) {
            while (true) {
                if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F'))
                    position++;
                else
                    break;
            }
            if (entirestr[position] == '>')
                return { attributeName: null, attributeValue: null, nextPosition: position };
            else {
                let namestr = '';
                let valuestr = '';
                var spaceparse = () => {
                    while (true) {
                        if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                            position++;
                        else
                            break;
                    }
                    if (entirestr[position] != '=')
                        return parsefinish();
                    else
                        while (entirestr[position] != '=')
                            position++;
                    return valueparse();
                };
                var valueparse = () => {
                    while (true) {
                        if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                            position++;
                        else
                            break;
                    }
                    if (this.charCompare(entirestr[position], '\'', '\"')) {
                        let b = entirestr[position];
                        while (true) {
                            position++;
                            if (entirestr[position] == b) {
                                position++;
                                return parsefinish();
                            }
                            else
                                valuestr += entirestr[position];
                        }
                    }
                    else if (entirestr[position] == '>')
                        return parsefinish();
                    else {
                        valuestr += entirestr[position];
                        position++;
                    }
                    while (true) {
                        if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u003E'))
                            return parsefinish();
                        else
                            valuestr += entirestr[position];
                        position++;
                    }
                };
                var parsefinish = () => {
                    if (namestr.length === 0)
                        return { attributeName: null, attributeValue: null, nextPosition: position };
                    else
                        return { attributeName: namestr, attributeValue: valuestr, nextPosition: position };
                };
                //attribute name parsing
                while (true) {
                    if (entirestr[position] == '=') {
                        position++;
                        return valueparse();
                    }
                    else if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                        return spaceparse();
                    else if (this.charCompare(entirestr[position], '/', '>'))
                        return parsefinish();
                    else if (entirestr[position] >= 'A' && entirestr[position] <= 'Z')
                        namestr += entirestr[position].toLowerCase();
                    else
                        namestr += entirestr[position];
                    position++;
                }
            }
        }
        static searchWithIndex(target, query, position = 0) {
            if (target.length > position) {
                let found = target.slice(position).search(query);
                return found != -1 ? position + found : -1;
            }
            else
                return -1;
        }
        static charCompare(a, ...b) {
            for (let item of b) {
                if (a === item)
                    return true;
            }
            return false;
        }
    }
    SamiTS.HTMLTagFinder = HTMLTagFinder;
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class SAMIDocument {
        constructor() {
            this.cues = [];
            this.languages = [];
        }
        clone() {
            let newDocument = new SAMIDocument();
            for (let cue of this.cues) {
                newDocument.cues.push(cue.clone());
            }
            newDocument.languages = this.languages.slice();
            return newDocument;
        }
        /**
        Split SAMI document by its languages. Result may not be strictly ordered by any ways.
        */
        splitByLanguage() {
            let samiDocuments = {};
            let languageCodes = [];
            // Dictionary initialization
            for (let language of this.languages) {
                languageCodes.push(language.code);
                let sami = new SAMIDocument();
                sami.languages.push({
                    cssClass: language.cssClass,
                    code: language.code,
                    displayName: language.displayName
                });
                samiDocuments[language.code] = sami;
            }
            // Cue splitting
            for (let cue of this.cues) {
                let filtered = cue.filter.apply(cue, languageCodes);
                for (let code of languageCodes) {
                    samiDocuments[code].cues.push(filtered[code]);
                }
                ;
            }
            return samiDocuments;
        }
        /**
        @param increment Delay in microseconds
        */
        delay(increment) {
            for (let cue of this.cues) {
                cue.syncElement.setAttribute("start", (parseInt(cue.syncElement.getAttribute("start")) + increment).toFixed());
            }
        }
    }
    SamiTS.SAMIDocument = SAMIDocument;
    (function (SAMIDocument) {
        function parse(samistr) {
            let samiDocument = new SAMIDocument();
            let domparser = new DOMParser();
            let bodystart = SamiTS.HTMLTagFinder.FindStartTag('body', samistr);
            let bodyendindex = lastIndexOfInsensitive(samistr, "</body>");
            const samiEndIndex = lastIndexOfInsensitive(samistr, "</sami>");
            if (samiEndIndex !== -1) {
                if (bodyendindex === -1) {
                    bodyendindex = samistr.length;
                    samistr = samistr.slice(0, samiEndIndex) + "</body></sami>";
                }
            }
            else {
                if (bodyendindex === -1) {
                    bodyendindex = samistr.length;
                    samistr += "</body></sami>";
                }
                else {
                    samistr += "</sami>";
                }
            }
            let samicontainer = domparser.parseFromString((samistr.slice(0, bodystart.endPosition) + samistr.slice(bodyendindex))
                .replace(/(<\/?)(\w+)[^<]+>/g, function (word) { return word.toLowerCase(); })
                .replace(/<!--(?:(?!-->)[\s\S])*-->/g, function (comment) { return comment.slice(0, 4) + comment.slice(4, -4).replace(/--+|-$/gm, '') + comment.slice(-4); }), "text/xml").firstChild;
            /*
            Delete double hyphens and line end single hyphens to prevent XML parser error
            regex: http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
            */
            let samihead = samicontainer.getElementsByTagName("head")[0];
            let stylestr = '';
            for (let text of samihead.getElementsByTagName("style")[0].childNodes) {
                if (text instanceof Text || text instanceof Comment) {
                    stylestr += text.data;
                }
            }
            samiDocument.languages = extractClassSelectors(stylestr);
            let samistyle = domparser.parseFromString("<style>" + stylestr + "</style>", "text/html").styleSheets[0];
            let samibody = samistr.slice(bodystart.endPosition, bodyendindex);
            let syncs = SamiTS.HTMLTagFinder.FindStartTags('sync', samibody);
            for (let i = 0; i < syncs.length - 1; i++) {
                syncs[i].element.innerHTML = syncs[i].element.dataset.originalString = samibody.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            }
            if (syncs.length > 0) {
                let sync = syncs[syncs.length - 1];
                sync.element.innerHTML = sync.element.dataset.originalString = samibody.slice(sync.endPosition, bodyendindex);
            }
            for (let sync of syncs) {
                let cue = new SamiTS.SAMICue(fixPotplayerCompatibility(minifyWhitespace(sync.element)));
                giveLanguageData(cue, samiDocument.languages);
                samiDocument.cues.push(cue);
            }
            return samiDocument;
        }
        SAMIDocument.parse = parse;
        function giveLanguageData(cue, languages) {
            for (let child of Array.from(cue.syncElement.children)) {
                for (let language of languages) {
                    if (child.className === language.cssClass) {
                        child.dataset.language = language.code; // for BCP47 WebVTT lang tag
                        break;
                    }
                }
            }
            ;
        }
        function extractClassSelectors(stylestr) {
            let classes = stylestr.replace(/\s/g, "").match(/\.\w+{[^{]+}/g);
            let languages = [];
            for (let classstr of classes) {
                let classselector = classstr.match(/\.\w+{/);
                let stylebody = classstr.slice(classselector[0].length).split(';');
                let name;
                let lang;
                for (let rule of stylebody) {
                    let stylename = rule.match(/\w+:/);
                    if (stylename.length === 1) {
                        let stylevalue = rule.slice(stylename[0].length);
                        if (!name && stylename[0].toLowerCase() === "name:")
                            name = stylevalue;
                        else if (!lang && stylename[0].toLowerCase() === "lang:")
                            lang = stylevalue;
                        if (name && lang)
                            break;
                    }
                }
                if (name && lang)
                    languages.push({
                        cssClass: classselector[0].slice(1, classselector[0].length - 1),
                        displayName: name,
                        code: lang
                    });
            }
            ;
            return languages;
        }
        function minifyWhitespace(root) {
            let walker = document.createTreeWalker(root, -1, null, false);
            let text = "";
            let lastTextNode;
            while (walker.nextNode()) {
                if (walker.currentNode.nodeType === 1) {
                    if (walker.currentNode instanceof HTMLBRElement) {
                        text += " ";
                        if (lastTextNode) {
                            lastTextNode.nodeValue = SamiTS.util.absorbSpaceEnding(lastTextNode.nodeValue);
                        }
                    }
                    continue;
                }
                // Shrink whitespaces into a single space
                let nodeText = walker.currentNode.nodeValue.replace(/[ \t\r\n\f]{1,}/g, ' ');
                // If cummulated text is empty or ends with whitespace, remove whitespace in front of nodeText
                if (SamiTS.util.isEmptyOrEndsWithSpace(text) && nodeText[0] === ' ') {
                    nodeText = nodeText.slice(1);
                }
                text += nodeText;
                walker.currentNode.nodeValue = nodeText;
                if (nodeText.length)
                    lastTextNode = walker.currentNode;
            }
            if (lastTextNode) {
                lastTextNode.nodeValue = SamiTS.util.absorbSpaceEnding(lastTextNode.nodeValue);
            }
            return root;
        }
        function fixPotplayerCompatibility(syncobject) {
            syncobject = fixIncorrectRubyNodes(syncobject);
            // TODO: remove Array.from when Edge 18 arrives
            for (const font of Array.from(syncobject.getElementsByTagName("font"))) {
                const color = font.getAttribute("color");
                if (color) {
                    font.setAttribute("color", fixColorAttribute(color));
                }
            }
            return syncobject;
        }
        function fixColorAttribute(colorstr) {
            colorstr = colorstr.toLowerCase();
            if (colorstr.length == 6 && colorstr.search(/^[0-9a-f]{6}/) == 0) {
                return '#' + colorstr;
            }
            const lengthCheck = colorstr.match(/#?([0-9a-f]{6}).+/);
            if (lengthCheck) {
                return `#${lengthCheck[1]}`;
            }
            return colorstr;
        }
        function fixIncorrectRubyNodes(syncobject) {
            let rubylist = syncobject.getElementsByTagName("ruby");
            let rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;
            if (Array.from(rtlist).every((rt) => isRubyParentExist(rt) && rt.textContent.length > 0))
                return syncobject;
            //rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱, 그 뒤에 font를 다시 적용한다
            return fixIncorrectRPs(fixIncorrectFontEnds(syncobject));
        }
        function fixIncorrectFontEnds(syncobject) {
            let fontdeleted = exchangeFontWithTemp(syncobject);
            let fontextracted = extractFontAndText(syncobject);
            let textsFromNoFont = extractReadableTextNodes(fontdeleted);
            let textsFromOnlyFont = extractReadableTextNodes(fontextracted);
            for (let i = 0; i < textsFromOnlyFont.length; i++) {
                let font = getFontFromNode(textsFromOnlyFont[i]);
                if (font)
                    wrapWith(textsFromNoFont[i], font);
            }
            return minifyWhitespace(stripTemp(fontdeleted));
        }
        function fixIncorrectRPs(syncobject) {
            let newsync = syncobject.cloneNode(true);
            for (let ruby of Array.from(newsync.getElementsByTagName("ruby"))) {
                let rt = ruby.getElementsByTagName("rt")[0];
                if (!rt || rt.innerHTML.length > 0 || rt === ruby.childNodes[ruby.childNodes.length - 1])
                    return syncobject;
                let firstRp = ruby.getElementsByTagName("rp")[0]; // First child RP that is in wrong place
                if (rt.nextElementSibling !== firstRp) // Wrong RP always sit next to its RT sibling
                    return syncobject;
                let repositionList = [];
                let sibling = firstRp.nextSibling;
                while (sibling && sibling.nodeName.toLowerCase() !== "rp") { // Catch all nodes that ran away
                    repositionList.push(sibling);
                    sibling = sibling.nextSibling;
                }
                firstRp.parentNode.removeChild(firstRp); // RP should be left, not right
                ruby.insertBefore(firstRp, rt);
                for (let node of repositionList) { // return nodes in their proper place
                    node.parentNode.removeChild(node);
                    rt.appendChild(node);
                }
            }
            ;
            return newsync;
        }
        function wrapWith(targetNode, newParentNode) {
            let currentParentNode = targetNode.parentNode; //shall have one
            let currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode); //will be inserted end of the list when .nextSibling is null
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        }
        function isRubyParentExist(rtelement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return isRubyParentExist(rtelement.parentElement);
            }
            else
                return false;
        }
        function getFontFromNode(text) {
            if (text.parentNode) {
                let parent = text.parentNode;
                if (parent.tagName.toLowerCase() === "font") {
                    if (parent.getAttribute("color"))
                        return parent.cloneNode(false);
                }
                return getFontFromNode(parent);
            }
            else
                return null;
        }
        /**
        Creates new element that replaces <font> start tags with <x-samits-temp></x-samits-temp> and deletes </font> end tags.
        */
        function exchangeFontWithTemp(syncobject) {
            let newsync = syncobject.cloneNode(false);
            let newsyncstr = newsync.dataset.originalString;
            for (let fonttag of SamiTS.HTMLTagFinder.FindStartTags('font', newsyncstr).reverse()) {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<x-samits-temp></x-samits-temp>" + newsyncstr.slice(fonttag.endPosition);
            }
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '<x-samits-temp></x-samits-temp>');
            return newsync;
        }
        /**
        Removes all <x-samits-temp> tags in the input element.
        */
        function stripTemp(syncobject) {
            let temps = syncobject.querySelectorAll("x-samits-temp");
            for (let temp of Array.from(temps)) {
                temp.parentNode.removeChild(temp);
            }
            ;
            return syncobject;
        }
        function extractFontAndText(syncobject) {
            let newsync = syncobject.cloneNode(false);
            let newsyncstr = newsync.dataset.originalString;
            let tags = SamiTS.HTMLTagFinder.FindAllStartTags(syncobject.dataset.originalString);
            let foundtags = tags.filter(foundtag => {
                switch (foundtag.element.tagName.toLowerCase()) {
                    case "font":
                    case "p": return false;
                    default: return true;
                }
            }).reverse();
            for (let foundtag of foundtags) {
                newsyncstr = newsyncstr.slice(0, foundtag.startPosition) + newsyncstr.slice(foundtag.endPosition);
            }
            for (let foundendtag of newsyncstr.match(/<\/\w+>/g)) {
                if (foundendtag !== "</font>")
                    newsyncstr = newsyncstr.replace(foundendtag, '');
            }
            newsync.innerHTML = newsyncstr;
            return newsync;
        }
        function extractReadableTextNodes(syncobject) {
            let walker = document.createTreeWalker(syncobject, NodeFilter.SHOW_TEXT, null, false);
            let node;
            let textNodes = [];
            node = walker.nextNode();
            while (node) {
                if (node.nodeValue.trim().length > 0)
                    textNodes.push(node);
                node = walker.nextNode();
            }
            return textNodes;
        }
        function lastIndexOfInsensitive(target, searchString, position = target.length - searchString.length) {
            if (!searchString)
                return -1;
            else if (searchString.length == 0)
                return 0;
            let lowersearch = searchString.toLowerCase();
            for (let i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if (target[i].toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        }
    })(SAMIDocument = SamiTS.SAMIDocument || (SamiTS.SAMIDocument = {}));
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class SAMICue {
        constructor(syncElement) {
            if (syncElement.tagName.toLowerCase() !== "sync")
                throw new Error("SamiCue can only accept sync element");
            else
                this.syncElement = syncElement;
        }
        clone() {
            return new SAMICue(this.syncElement.cloneNode(true));
        }
        filter(...languages) {
            // Dictionary initialization
            let cues = {};
            for (let i in languages)
                cues[languages[i]] = new SAMICue(this.syncElement.cloneNode());
            // Filter
            for (let child of this.syncElement.childNodes) {
                let language;
                if (child.nodeType === 1 /* Element */) {
                    language = child.dataset.language;
                    if (languages.indexOf(language) >= 0) {
                        cues[language].syncElement.appendChild(child.cloneNode(true));
                        return;
                    }
                }
                // Nodes with no language code, including text nodes
                // Add them to all cue objects
                if (!language)
                    for (let language in cues)
                        cues[language].syncElement.appendChild(child.cloneNode(true));
            }
            return cues;
        }
        readDOM(readNode, options = {}) {
            const stack = [];
            const walker = document.createTreeWalker(this.syncElement, -1, null, false);
            let isBlankNewLine = true;
            while (true) {
                if (walker.currentNode.nodeType === 1 /* Element */ ||
                    walker.currentNode.nodeType === 8 /* Comment */) {
                    const node = readNode(walker.currentNode, options);
                    stack.unshift(node);
                    // Read children if there are and if readElement understands current node
                    if (node && walker.firstChild())
                        continue;
                }
                else
                    stack.unshift({ start: '', end: '', content: walker.currentNode.nodeValue });
                do {
                    const zero = stack.shift();
                    if (!stack.length) {
                        return SamiTS.util.manageLastLine(zero.content, options.preventEmptyLine);
                    }
                    if (zero) {
                        const isEffectiveDivider = zero.linebreak || (zero.divides && stack[0].content);
                        if (isEffectiveDivider) {
                            // Ending space in a line should be removed
                            stack[0].content = SamiTS.util.manageLastLine(SamiTS.util.absorbSpaceEnding(stack[0].content), options.preventEmptyLine) + "\r\n";
                            isBlankNewLine = true;
                        }
                        if (zero.content) {
                            let content = zero.start + zero.content + zero.end;
                            // Starting space in a line should be removed
                            if (isBlankNewLine && content[0] === ' ')
                                content = content.slice(1);
                            // Concatenate the result to the top of the stack
                            stack[0].content += content;
                            isBlankNewLine = false;
                        }
                    }
                    if (walker.nextSibling())
                        break;
                    else
                        walker.parentNode();
                } while (true);
            }
        }
    }
    SamiTS.SAMICue = SAMICue;
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class SDPUSWriter {
        constructor() {
            this.xmlNamespaceURI = "http://www.w3.org/XML/1998/namespace";
            this.xmlnsNamespaceURI = "http://www.w3.org/2000/xmlns/";
            this.ttmlNamespaceURI = "http://www.w3.org/ns/ttml";
            this.ttmlStyleNamespaceURI = "http://www.w3.org/ns/ttml#styling";
            this.ttmlParameterNamespaceURI = "http://www.w3.org/ns/ttml#parameter";
            this.sdpusNamespaceURI = "http://www.w3.org/ns/ttml/profile/sdp-us";
        }
        write(xsyncs) {
            /*
            example using
            http://msmvps.com/blogs/martin_honnen/archive/2009/04/13/creating-xml-with-namespaces-with-javascript-and-the-w3c-dom.aspx
            var ttmlns = "http://www.w3.org/ns/ttml";
            var ttmlsns = "http://www.w3.org/ns/ttml#styling";
            var ttmlpns = "http://www.w3.org/ns/ttml#parameter";
            var doc = document.implementation.createDocument(ttmlns, "tt", null);
            doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:s", ttmlsns);
            doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:p", ttmlpns);
            (new XMLSerializer()).serializeToString(doc);
            이 다음엔 child node 추가 넣기
            */
            var ttdoc = document.implementation.createDocument(this.ttmlNamespaceURI, "tt", null);
            ttdoc.documentElement.setAttributeNS(this.xmlNamespaceURI, "xml:lang", "en-us");
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:s", this.ttmlStyleNamespaceURI);
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:p", this.ttmlParameterNamespaceURI);
            var head = ttdoc.createElementNS(this.ttmlNamespaceURI, "head");
            ttdoc.appendChild(head);
            var profile = ttdoc.createElementNS(this.ttmlParameterNamespaceURI, "profile");
            profile.setAttributeNS(this.ttmlParameterNamespaceURI, "use", this.sdpusNamespaceURI);
            head.appendChild(profile);
            this.stylingElement = ttdoc.createElementNS(this.ttmlNamespaceURI, "styling");
            head.appendChild(this.stylingElement);
            var regionStyle = ttdoc.createElementNS(this.ttmlNamespaceURI, "style");
            regionStyle.setAttributeNS(this.xmlNamespaceURI, "xml:id", "bottomMidStyle");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textAlign", "center");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textOutline", "#000000ff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:color", "#ffffffff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:origin", "20% 58%");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:extent", "60% 18%");
            this.stylingElement.appendChild(regionStyle);
            var layout = ttdoc.createElementNS(this.ttmlNamespaceURI, "layout");
            head.appendChild(layout);
            var region = ttdoc.createElementNS(this.ttmlNamespaceURI, "region");
            //region.setAttributeNS(this.xmlNamespaceURI
            //var layout = sdpusdoc.
            //var text: string;
            //if (xsyncs.length > 0) {
            //    text = this.getRichText(xsyncs[0].syncElement);
            //    if (text.length > 0) writeText(0, text);
            //    for (var i = 1; i < xsyncs.length - 1; i++) {
            //        text = this.absorbAir(this.getRichText(xsyncs[i].syncElement));//prevents cues consists of a single &nbsp;
            //        if (text.length > 0) {
            //            subDocument += "\r\n\r\n";
            //            writeText(i, text);
            //        }
            //    }
            //}
            return '<?xml version="1.0" encoding="utf-8"?>' +
                (new XMLSerializer()).serializeToString(ttdoc);
        }
    }
    SamiTS.SDPUSWriter = SDPUSWriter;
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class SubRipWriter {
        write(xsyncs, options = {}) {
            let subDocument = "";
            let writeText = (i, syncindex, text) => {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + this.getSubRipTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getSubRipTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            options = Object.assign({ preventEmptyLine: true }, options);
            var text;
            if (xsyncs.length > 0) {
                let syncindex = 1;
                let readElement = (options.useTextStyles ? this.readElementRich : this.readElementSimple).bind(this);
                for (let i = 0; i < xsyncs.length - 1; i++) {
                    text = SamiTS.util.absorbAir(xsyncs[i].readDOM(readElement, options));
                    if (text.length > 0) {
                        if (syncindex > 1)
                            subDocument += "\r\n\r\n";
                        writeText(i, syncindex, text);
                        syncindex++;
                    }
                }
            }
            return { subtitle: subDocument + "\r\n" };
        }
        getSubRipTime(ms) {
            let hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            let min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            let sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            let hourstr = hour.toString();
            if (hourstr.length < 2)
                hourstr = '0' + hourstr;
            let minstr = min.toString();
            if (minstr.length < 2)
                minstr = '0' + minstr;
            let secstr = sec.toString();
            if (secstr.length < 2)
                secstr = '0' + secstr;
            let msstr = ms.toString();
            while (msstr.length < 3)
                msstr = '0' + msstr;
            return `${hourstr}:${minstr}:${secstr},${msstr}`;
        }
        readElementSimple(element) {
            let template = SamiTS.util.generateTagReadResultTemplate();
            if (!(element instanceof Element)) {
                return template;
            }
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
                    break;
            }
            return template;
        }
        readElementRich(element) {
            let template = SamiTS.util.generateTagReadResultTemplate();
            if (!(element instanceof Element)) {
                return template;
            }
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
                    break;
                case "font":
                    let fontelement = document.createElement("font");
                    let color = element.getAttribute("color");
                    if (color)
                        fontelement.setAttribute("color", color);
                    if (fontelement.attributes.length > 0) {
                        template.start = fontelement.outerHTML.slice(0, -7);
                        template.end = "</font>";
                    }
                    break;
                case "b":
                case "i":
                case "u":
                    let tagname = element.tagName.toLowerCase();
                    template.start = `<${tagname}>`;
                    template.end = `</${tagname}>`;
                    break;
            }
            return template;
        }
    }
    SamiTS.SubRipWriter = SubRipWriter;
})(SamiTS || (SamiTS = {}));
/* @internal */
var SamiTS;
(function (SamiTS) {
    var util;
    (function (util) {
        function isEmptyOrEndsWithSpace(input) {
            return !input.length || input[input.length - 1] === ' ';
        }
        util.isEmptyOrEndsWithSpace = isEmptyOrEndsWithSpace;
        function isEmptyOrEndsWithLinefeed(input) {
            return !input.length || input[input.length - 1] === '\n';
        }
        util.isEmptyOrEndsWithLinefeed = isEmptyOrEndsWithLinefeed;
        function absorbSpaceEnding(input) {
            if (isEmptyOrEndsWithSpace(input))
                return input.slice(0, -1);
            else
                return input;
        }
        util.absorbSpaceEnding = absorbSpaceEnding;
        /** Fills the empty last line with a space for formats where the end of a cue is an empty line */
        function manageLastLine(input, preventEmptyLine) {
            if (isEmptyOrEndsWithLinefeed(input) && preventEmptyLine)
                return input + ' ';
            else
                return input;
        }
        util.manageLastLine = manageLastLine;
        function fillEmptyLines(input) {
            return input.replace(/\r?\n\r?\n/g, "\r\n \r\n");
        }
        util.fillEmptyLines = fillEmptyLines;
        function generateTagReadResultTemplate(content = '') {
            return { start: '', end: '', content };
        }
        util.generateTagReadResultTemplate = generateTagReadResultTemplate;
        /**
        Trim the input string if and only if its trimmed result is empty.
        */
        function absorbAir(input) {
            var trimmed = input.trim();
            return trimmed.length != 0 ? input : trimmed;
        }
        util.absorbAir = absorbAir;
        function isLastRelevantNodeInSync(node) {
            if (node.nextSibling && node.nextSibling.textContent.trim()) {
                return false;
            }
            if (node.nextElementSibling) {
                return false;
            }
            if (node.parentElement.tagName === "SYNC") {
                return true;
            }
            return isLastRelevantNodeInSync(node.parentElement);
        }
        util.isLastRelevantNodeInSync = isLastRelevantNodeInSync;
    })(util = SamiTS.util || (SamiTS.util = {}));
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    class WebVTTWriter {
        constructor() {
            this.webvttStyleSheet = new WebVTTStyleSheet();
        }
        write(xsyncs, options = {}) {
            let subHeader = "WEBVTT";
            let subDocument = '';
            let writeText = (i, text) => {
                subDocument += "\r\n\r\n";
                subDocument += this.getWebVTTTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getWebVTTTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            options = Object.assign({ preventEmptyLine: true }, options);
            let text;
            if (xsyncs.length > 0) {
                let readElement = this.readNode.bind(this);
                for (let i = 0; i < xsyncs.length - 1; i++) {
                    text = SamiTS.util.absorbAir(xsyncs[i].readDOM(readElement, options)); //prevents cues consists of a single &nbsp;
                    if (text.length > 0)
                        writeText(i, text);
                }
            }
            // WebVTT Styling https://w3c.github.io/webvtt/#styling
            subHeader += `\r\n\r\nSTYLE${options.legacyForceArrow ? " -->" : ""}\r\n` + this.webvttStyleSheet.getStylesheet(options);
            subDocument = subHeader + subDocument + "\r\n";
            let result = { subtitle: subDocument };
            if (options.createStyleElement)
                result.stylesheet = this.webvttStyleSheet.getStylesheetNode(options);
            this.webvttStyleSheet.clear();
            return result;
        }
        getWebVTTTime(ms) {
            let hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            let min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            let sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            let hourstr;
            let minstr = min.toString();
            if (minstr.length < 2)
                minstr = '0' + minstr;
            let secstr = sec.toString();
            if (secstr.length < 2)
                secstr = '0' + secstr;
            let msstr = ms.toString();
            while (msstr.length < 3)
                msstr = '0' + msstr;
            if (hour > 0) {
                hourstr = hour.toString();
                if (hourstr.length < 2)
                    hourstr = '0' + hourstr;
                return `${hourstr}:${minstr}:${secstr}.${msstr}`;
            }
            else
                return `${minstr}:${secstr}.${msstr}`;
        }
        readNode(node, options) {
            let template = SamiTS.util.generateTagReadResultTemplate();
            if (!(node instanceof Element)) {
                if (node instanceof Comment && SamiTS.util.isLastRelevantNodeInSync(node)) {
                    // no visible text or element after this
                    const text = SamiTS.util.fillEmptyLines(node.textContent.trim());
                    const note = `NOTE${options.legacyForceArrow ? " -->" : ""}`;
                    template.content = "\r\n\r\n" + (text.includes("\n") ? `${note}\r\n${text}` : `${note} ${text}`);
                }
                return template;
            }
            switch (node.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
                    break;
                case "font": {
                    let stylename = this.registerStyle(node);
                    if (stylename) {
                        template.start = `<c.${stylename}>`;
                        template.end = "</c>";
                    }
                    break;
                }
                case "rp":
                    template = null;
                    break;
                case "ruby":
                case "rt":
                case "b":
                case "i":
                case "u": {
                    let tagname = node.tagName.toLowerCase();
                    template.start = `<${tagname}>`;
                    template.end = `</${tagname}>`;
                    break;
                }
            }
            if (options.enableLanguageTag && node.dataset.language && template.content.trim()) {
                template.start = `<lang ${node.dataset.language}>` + template.start;
                template.end += "</lang>";
            }
            return template;
        }
        registerStyle(fontelement) {
            let styleName = '';
            let rule = '';
            let color = fontelement.getAttribute("color");
            if (color) {
                styleName += 'c' + color.replace('#', '').toLowerCase();
                rule += `color: ${color};`;
            }
            if (styleName.length != 0 && !this.webvttStyleSheet.hasRuleFor(styleName))
                this.webvttStyleSheet.insertRuleFor(styleName, rule);
            return styleName;
        }
    }
    SamiTS.WebVTTWriter = WebVTTWriter;
    class WebVTTStyleSheet {
        constructor() {
            this.ruledictionary = {};
            this.conventionalStyle = [
                "::cue { background: transparent; text-shadow: 0 0 0.2em black; text-outline: 2px 2px black; }",
                "::cue-region { font: 0.077vh sans-serif; line-height: 0.1vh; }"
            ];
        }
        hasRuleFor(targetname) {
            return !!this.ruledictionary[targetname];
        }
        insertRuleFor(targetname, rule) {
            this.ruledictionary[targetname] = `::cue(.${targetname}) { ${rule} }`;
        }
        getStylesheet(options) {
            let resultarray = [];
            if (!options.disableDefaultStyle) {
                for (let rule of this.conventionalStyle) {
                    resultarray.push(rule);
                }
            }
            for (let rule in this.ruledictionary)
                resultarray.push(this.ruledictionary[rule]);
            return resultarray.join('\r\n');
        }
        getStylesheetNode(options) {
            let selector = options.selector || "video";
            let styleSheet = document.createElement("style");
            let result = '';
            if (!options.disableDefaultStyle) {
                for (let rule of this.conventionalStyle) {
                    result += selector + rule;
                }
            }
            for (let rule in this.ruledictionary)
                result += selector + this.ruledictionary[rule];
            styleSheet.appendChild(document.createTextNode(result));
            return styleSheet;
        }
        clear() {
            this.ruledictionary = {};
        }
    }
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=sami.js.map