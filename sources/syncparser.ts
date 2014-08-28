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

"use strict";

module SamiTS {
    export interface SAMILanguage {
        /** The CSS class name defined within SAMI markup. */
        cssClass: string;
        /** The display name */
        displayName: string;
        /** BCP47 language code */
        code: string;
    }
    /** A dictionary which is composed of SAMIDocument objects with BCP47 language code keys. */
    export interface SAMIDocumentDictionary {
        [key: string]: SAMIDocument
    }
    export interface SAMIContentDataset extends DOMStringMap {
        language: string;
    }
    export interface SAMISyncDataset extends DOMStringMap {
        originalString: string;
    }
    export interface SAMIContentElement extends HTMLElement {
        dataset: SAMIContentDataset
    }
    export interface SAMISyncElement extends HTMLElement {
        dataset: SAMISyncDataset;
    }

    export class SAMICue {
        syncElement: SAMISyncElement;
        constructor(syncElement: SAMISyncElement) {
            if (syncElement.tagName.toLowerCase() !== "sync")
                throw new Error("SamiCue can only accept sync element");
            else
                this.syncElement = syncElement;
        }

        filter(...languages: string[]) {
            // Dictionary initialization
            var cues: { [key: string]: SAMICue } = {};
            for (var i in languages)
                cues[languages[i]] = new SAMICue(<SAMISyncElement>this.syncElement.cloneNode());

            // Filter
            Array.prototype.forEach.call(this.syncElement.childNodes, (child: Node) => {
                var language: string;
                if (child.nodeType == 1) {
                    language = (<SAMIContentElement>child).dataset.language;
                    if (languages.indexOf(language) >= 0) {
                        cues[language].syncElement.appendChild(child.cloneNode(true));
                        return;
                    }
                }

                // Nodes with no language code, including text nodes
                // Add them to all cue objects
                if (!language)
                    for (var language in cues)
                        cues[language].syncElement.appendChild(child.cloneNode(true));
            });
            return cues;
        }
    }

    export class SAMIDocument {
        cues: SAMICue[] = [];
        languages: SAMILanguage[] = [];

        /**
        Split SAMI document by its languages. Result may not be strictly ordered by any ways.
        */
        splitByLanguage() {
            var samiDocuments: SAMIDocumentDictionary = {};
            var languageCodes: string[] = [];

            // Dictionary initialization
            for (var i in this.languages) {
                var language = this.languages[i];
                languageCodes.push(language.code);

                var sami = new SAMIDocument();
                sami.languages.push({
                    cssClass: language.cssClass,
                    code: language.code,
                    displayName: language.displayName
                });
                samiDocuments[language.code] = sami;
            }

            // Cue splitting
            for (var i in this.cues) {
                var cue = this.cues[i];
                var filtered = cue.filter.apply(cue, languageCodes);
                languageCodes.forEach((code) => {
                    samiDocuments[code].cues.push(filtered[code]);
                });
            }

            return samiDocuments;
        }

        /**
        @param increment Delay in microseconds
        */
        delay(increment: number) {
            for (var i in this.cues) {
                var cue = this.cues[i];
                cue.syncElement.setAttribute("start", (parseInt(cue.syncElement.getAttribute("start")) + increment).toFixed());
            }
        }
    }

    export module SAMIDocument {
        export function parse(samistr: string): SAMIDocument {
            var samiDocument = new SAMIDocument();
            var domparser = new DOMParser();

            var bodystart = HTMLTagFinder.FindStartTag('body', samistr);
            var bodyendindex = lastIndexOfInsensitive(samistr, "</body>");

            var samicontainer = <Element>domparser.parseFromString(
                (samistr.slice(0, bodystart.endPosition) + samistr.slice(bodyendindex))
                    .replace(/(<\/?)(\w+)[^<]+>/g, function (word) { return word.toLowerCase() })
                    .replace(/<!--(?:(?!-->)[\s\S])*-->/g, function (comment) { return comment.slice(0, 4) + comment.slice(4, -4).replace(/--+|-$/gm, '') + comment.slice(-4); })
                , "text/xml").firstChild;
            /*
            Delete double hyphens and line end single hyphens to prevent XML parser error
            regex: http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
            */
            var samihead = <Element>samicontainer.getElementsByTagName("head")[0];

            var stylestr = '';
            Array.prototype.forEach.call(samihead.getElementsByTagName("style")[0].childNodes, (text: Text) => {
                if (text.data) stylestr += text.data;
            });
            samiDocument.languages = extractClassSelectors(stylestr);

            var samistyle = <CSSStyleSheet>domparser.parseFromString("<style>" + stylestr + "</style>", "text/html").head.getElementsByTagName("style")[0].sheet;

            var samibody = samistr.slice(bodystart.endPosition, bodyendindex);

            var syncs = HTMLTagFinder.FindStartTags('sync', samibody);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = (<SAMISyncElement>syncs[i].element).dataset.originalString = samibody.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = (<SAMISyncElement>syncs[i].element).dataset.originalString = samibody.slice(syncs[i].endPosition, bodyendindex);

            syncs.forEach((sync) => {
                samiDocument.cues.push(new SAMICue(fixIncorrectRubyNodes(<SAMISyncElement>sync.element)));
            });
            samiDocument.cues.forEach((cue: SAMICue) => {
                giveLanguageData(cue, samiDocument.languages);
            });

            return samiDocument;
        }

        function giveLanguageData(cue: SAMICue, languages: SAMILanguage[]) {
            Array.prototype.forEach.call(cue.syncElement.children, (child: SAMIContentElement) => {
                for (var i = 0; i < languages.length; i++) {
                    var classCode = child.className;
                    if (!classCode || classCode === languages[i].cssClass)
                        child.dataset.language = languages[i].code;//so that we can easily use it to convert to WebVTT lang tag which requires BCP47
                }
            });
        }

        function extractClassSelectors(stylestr: string) {
            var classes = stylestr.replace(/\s/g, "").match(/\.\w+{[^{]+}/g);
            var languages: SAMILanguage[] = [];
            classes.forEach((classstr) => {
                var classselector = classstr.match(/\.\w+{/);
                if (classselector.length != 1)
                    return;
                var stylebody = classstr.slice(classselector[0].length).split(';');
                var name: string;
                var lang: string;
                for (var i = 0; i < stylebody.length; i++) {
                    var stylename = stylebody[i].match(/\w+:/);
                    if (stylename.length == 1) {
                        var stylevalue = stylebody[i].slice(stylename[0].length);
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
            });
            return languages;
        }

        function fixIncorrectRubyNodes(syncobject: SAMISyncElement) {
            var rubylist = syncobject.getElementsByTagName("ruby");
            var rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;

            if (Array.prototype.every.call(rtlist, (rt: HTMLElement) => isRubyParentExist(rt) && rt.textContent.length > 0))
                return syncobject;

            //rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱, 그 뒤에 font를 다시 적용한다
            return fixIncorrectRPs(fixIncorrectFontEnds(syncobject));
        }

        function fixIncorrectFontEnds(syncobject: SAMISyncElement) {
            var fontdeleted = exchangeFontWithTemp(syncobject);
            var fontextracted = extractFontAndText(syncobject);
            var textsFromNoFont = extractReadableTextNodes(fontdeleted);
            var textsFromOnlyFont = extractReadableTextNodes(fontextracted);
            for (var i = 0; i < textsFromOnlyFont.length; i++) {
                var font = getFontFromNode(textsFromOnlyFont[i]);
                if (font)
                    wrapWith(textsFromNoFont[i], font);
            }
            return stripTemp(fontdeleted);
        }

        function fixIncorrectRPs(syncobject: SAMISyncElement) {
            var newsync = <SAMISyncElement>syncobject.cloneNode(true);
            Array.prototype.forEach.call(newsync.getElementsByTagName("ruby"), (ruby: HTMLElement) => {
                var rt = ruby.getElementsByTagName("rt")[0];
                if (!rt || rt.innerHTML.length > 0 || rt === ruby.childNodes[ruby.childNodes.length - 1])
                    return syncobject;

                var firstRp = ruby.getElementsByTagName("rp")[0]; // First child RP that is in wrong place
                if (rt.nextElementSibling !== firstRp) // Wrong RP always sit next to its RT sibling
                    return syncobject;

                var repositionList: Node[] = [];
                var sibling = firstRp.nextSibling;
                while (sibling && sibling.nodeName.toLowerCase() !== "rp") { // Catch all nodes that ran away
                    repositionList.push(sibling);
                    sibling = sibling.nextSibling;
                }
                firstRp.parentNode.removeChild(firstRp); // RP should be left, not right
                ruby.insertBefore(firstRp, rt);

                repositionList.forEach((node) => { // return nodes in their proper place
                    node.parentNode.removeChild(node);
                    rt.appendChild(node);
                });
            });
            return newsync;
        }

        function wrapWith(targetNode: Node, newParentNode: Node) {
            var currentParentNode = targetNode.parentNode;//shall have one
            var currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode);//will be inserted end of the list when .nextSibling is null
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        }

        function isRubyParentExist(rtelement: HTMLElement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return isRubyParentExist(rtelement.parentElement);
            }
            else
                return false;
        }

        function  getFontFromNode(text: Node): HTMLElement {
            if (text.parentNode) {
                var parent = <HTMLElement>text.parentNode;
                if (parent.tagName.toLowerCase() === "font") {
                    if ((<HTMLElement>parent).getAttribute("color"))
                        return <HTMLElement>parent.cloneNode(false);
                }
                return getFontFromNode(parent);
            }
            else
                return null;
        }


        /**
        Creates new element that replaces <font> start tags with <x-samits-temp></x-samits-temp> and deletes </font> end tags.
        */
        function exchangeFontWithTemp(syncobject: SAMISyncElement) {
            var newsync = <SAMISyncElement>syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset.originalString;
            HTMLTagFinder.FindStartTags('font', newsyncstr).reverse().forEach((fonttag: FoundHTMLTag) => {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<x-samits-temp></x-samits-temp>" + newsyncstr.slice(fonttag.endPosition);
            });
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '');
            return newsync;
        }

        /**
        Removes all <x-samits-temp> tags in the input element.
        */
        function stripTemp(syncobject: SAMISyncElement) {
            var temps = syncobject.querySelectorAll("x-samits-temp");
            Array.prototype.forEach.call(temps, (temp: HTMLElement) => {
                temp.parentNode.removeChild(temp);
            });
            return syncobject;
        }

        function extractFontAndText(syncobject: SAMISyncElement) {
            var newsync = <SAMISyncElement>syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset.originalString;
            var tags = HTMLTagFinder.FindAllStartTags(syncobject.dataset.originalString);
            tags.filter((foundtag: SamiTS.FoundHTMLTag) => {
                switch (foundtag.element.tagName.toLowerCase()) {
                    case "font":
                    case "p": return false;
                    default: return true;
                }
            }).reverse().forEach((foundtag: SamiTS.FoundHTMLTag) => {
                    newsyncstr = newsyncstr.slice(0, foundtag.startPosition) + newsyncstr.slice(foundtag.endPosition);
                });;
            newsyncstr.match(/<\/\w+>/g).forEach((foundendtag: string) => {
                if (foundendtag !== "</font>")
                    newsyncstr = newsyncstr.replace(foundendtag, '');
            });
            newsync.innerHTML = newsyncstr;
            return newsync;
        }

        function extractReadableTextNodes(syncobject: HTMLElement) {
            var walker = document.createTreeWalker(syncobject, NodeFilter.SHOW_TEXT, null, false);
            var node: Text;
            var textNodes: Text[] = [];
            node = <Text>walker.nextNode();
            while (node) {
                if (node.nodeValue.trim().length > 0)
                    textNodes.push(node);
                node = <Text>walker.nextNode();
            }
            return textNodes;
        }

        function lastIndexOfInsensitive(target: string, searchString: string, position = target.length - searchString.length) {
            if (!searchString)
                return -1;
            else if (searchString.length == 0)
                return 0;
            var lowersearch = searchString.toLowerCase();
            for (var i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if ((<string>target[i]).toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        }
    }
}