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

    export class SAMIDocument {
        cues: SAMICue[] = [];
        languages: SAMILanguage[] = [];

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
            let samiDocuments: SAMIDocumentDictionary = {};
            let languageCodes: string[] = [];

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
                };
            }

            return samiDocuments;
        }

        /**
        @param increment Delay in microseconds
        */
        delay(increment: number) {
            for (let cue of this.cues) {
                cue.syncElement.setAttribute("start", (parseInt(cue.syncElement.getAttribute("start")) + increment).toFixed());
            }
        }
    }

    export module SAMIDocument {
        export function parse(samistr: string): SAMIDocument {
            let samiDocument = new SAMIDocument();
            let domparser = new DOMParser();

            let bodystart = HTMLTagFinder.FindStartTag('body', samistr);
            let bodyendindex = lastIndexOfInsensitive(samistr, "</body>");

            let samicontainer = <Element>domparser.parseFromString(
                (samistr.slice(0, bodystart.endPosition) + samistr.slice(bodyendindex))
                    .replace(/(<\/?)(\w+)[^<]+>/g, function (word) { return word.toLowerCase() })
                    .replace(/<!--(?:(?!-->)[\s\S])*-->/g, function (comment) { return comment.slice(0, 4) + comment.slice(4, -4).replace(/--+|-$/gm, '') + comment.slice(-4); })
                , "text/xml").firstChild;
            /*
            Delete double hyphens and line end single hyphens to prevent XML parser error
            regex: http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
            */
            let samihead = samicontainer.getElementsByTagName("head")[0];

            let stylestr = '';
            for (let text of <Node[]><any>samihead.getElementsByTagName("style")[0].childNodes) {
                if (text instanceof Text || text instanceof Comment) {
                    stylestr += text.data;
                }
            }
            samiDocument.languages = extractClassSelectors(stylestr);

            let samistyle = domparser.parseFromString("<style>" + stylestr + "</style>", "text/html").styleSheets[0];

            let samibody = samistr.slice(bodystart.endPosition, bodyendindex);

            let syncs = HTMLTagFinder.FindStartTags<SAMISyncElement>('sync', samibody);
            for (let i = 0; i < syncs.length - 1; i++) {
                syncs[i].element.innerHTML = syncs[i].element.dataset.originalString = samibody.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            }
            if (syncs.length > 0) {
                let sync = syncs[syncs.length - 1];
                sync.element.innerHTML = sync.element.dataset.originalString = samibody.slice(sync.endPosition, bodyendindex);
            }

            for (let sync of syncs) {
                let cue = new SAMICue(fixIncorrectRubyNodes(minifyWhitespace(sync.element)));
                giveLanguageData(cue, samiDocument.languages);
                samiDocument.cues.push(cue);
            }

            return samiDocument;
        }

        function giveLanguageData(cue: SAMICue, languages: SAMILanguage[]) {
            for (let child of <SAMIContentElement[]>util.arrayFrom(cue.syncElement.children)) {
                for (let language of languages) {
                    if (child.className === language.cssClass) {
                        child.dataset.language = language.code; // for BCP47 WebVTT lang tag
                        break;
                    }
                }
            };
        }

        function extractClassSelectors(stylestr: string) {
            let classes = stylestr.replace(/\s/g, "").match(/\.\w+{[^{]+}/g);
            let languages: SAMILanguage[] = [];
            for (let classstr of classes) {
                let classselector = classstr.match(/\.\w+{/);
                let stylebody = classstr.slice(classselector[0].length).split(';');
                let name: string;
                let lang: string;
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
            };
            return languages;
        }

        function minifyWhitespace<T extends Node>(root: T) {
            let walker = document.createTreeWalker(root, -1, null, false);
            let text = "";
            let lastTextNode: Node;
            while (walker.nextNode()) {
                if (walker.currentNode.nodeType === 1) {
                    if (walker.currentNode instanceof HTMLBRElement) {
                        text += " ";
                        if (lastTextNode) {
                            lastTextNode.nodeValue = util.absorbSpaceEnding(lastTextNode.nodeValue);
                        }
                    }
                    continue;
                }

                // Shrink whitespaces into a single space
                let nodeText = walker.currentNode.nodeValue.replace(/[ \t\r\n\f]{1,}/g, ' ');
                // If cummulated text is empty or ends with whitespace, remove whitespace in front of nodeText
                if (util.isEmptyOrEndsWithSpace(text) && nodeText[0] === ' ') {
                    nodeText = nodeText.slice(1);
                }

                text += nodeText;
                walker.currentNode.nodeValue = nodeText;

                if (nodeText.length)
                    lastTextNode = walker.currentNode;
            }
            if (lastTextNode) {
                lastTextNode.nodeValue = util.absorbSpaceEnding(lastTextNode.nodeValue);
            }

            return root;
        }

        function fixIncorrectRubyNodes(syncobject: SAMISyncElement) {
            let rubylist = syncobject.getElementsByTagName("ruby");
            let rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;

            if (util.arrayFrom(rtlist).every((rt: HTMLElement) => isRubyParentExist(rt) && rt.textContent.length > 0))
                return syncobject;

            //rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱, 그 뒤에 font를 다시 적용한다
            return fixIncorrectRPs(fixIncorrectFontEnds(syncobject));
        }

        function fixIncorrectFontEnds(syncobject: SAMISyncElement) {
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

        function fixIncorrectRPs(syncobject: SAMISyncElement) {
            let newsync = <SAMISyncElement>syncobject.cloneNode(true);
            for (let ruby of util.arrayFrom(newsync.getElementsByTagName("ruby"))) {
                let rt = ruby.getElementsByTagName("rt")[0];
                if (!rt || rt.innerHTML.length > 0 || rt === ruby.childNodes[ruby.childNodes.length - 1])
                    return syncobject;

                let firstRp = ruby.getElementsByTagName("rp")[0]; // First child RP that is in wrong place
                if (rt.nextElementSibling !== firstRp) // Wrong RP always sit next to its RT sibling
                    return syncobject;

                let repositionList: Node[] = [];
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
            };
            return newsync;
        }

        function wrapWith(targetNode: Node, newParentNode: Node) {
            let currentParentNode = targetNode.parentNode;//shall have one
            let currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode);//will be inserted end of the list when .nextSibling is null
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        }

        function isRubyParentExist(rtelement: HTMLElement): boolean {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return isRubyParentExist(rtelement.parentElement);
            }
            else
                return false;
        }

        function getFontFromNode(text: Node): HTMLElement {
            if (text.parentNode) {
                let parent = <HTMLElement>text.parentNode;
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
            let newsync = <SAMISyncElement>syncobject.cloneNode(false);
            let newsyncstr = newsync.dataset.originalString;
            for (let fonttag of HTMLTagFinder.FindStartTags('font', newsyncstr).reverse()) {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<x-samits-temp></x-samits-temp>" + newsyncstr.slice(fonttag.endPosition);
            }
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '<x-samits-temp></x-samits-temp>');
            return newsync;
        }

        /**
        Removes all <x-samits-temp> tags in the input element.
        */
        function stripTemp(syncobject: SAMISyncElement) {
            let temps = syncobject.querySelectorAll("x-samits-temp");
            for (let temp of util.arrayFrom(temps)) {
                temp.parentNode.removeChild(temp);
            };
            return syncobject;
        }

        function extractFontAndText(syncobject: SAMISyncElement) {
            let newsync = <SAMISyncElement>syncobject.cloneNode(false);
            let newsyncstr = newsync.dataset.originalString;
            let tags = HTMLTagFinder.FindAllStartTags(syncobject.dataset.originalString);
            let foundtags = tags.filter((foundtag) => {
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

        function extractReadableTextNodes(syncobject: HTMLElement) {
            let walker = document.createTreeWalker(syncobject, NodeFilter.SHOW_TEXT, null, false);
            let node: Text;
            let textNodes: Text[] = [];
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
            let lowersearch = searchString.toLowerCase();
            for (let i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if (target[i].toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        }
    }
}