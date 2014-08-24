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
    export interface SamiLanguage {
        className: string;
        languageName: string;
        languageCode: string;
    }
    interface SyncChildDataset extends DOMStringMap {
        language: string;
    }
    interface SyncDataset extends DOMStringMap {
        originalString: string;
    }
    interface SyncChildElement extends HTMLElement {
        dataset: SyncChildDataset
    }
    interface SyncElement extends HTMLElement {
        dataset: SyncDataset;
    }

    export class SamiCue {
        syncElement: HTMLElement;
        constructor(syncElement: HTMLElement) {
            if (syncElement.tagName.toLowerCase() !== "sync")
                throw new Error("SamiCue can only accept sync element");
            else
                this.syncElement = syncElement;

        }

        /*
        TODO: filter 말고 split으로 교체
        language 코드가 발견되면 그 노드의 language에 대응하는 syncElement를 만들어 {}에 추가하고, 그 syncElement에 노드를 넣음
        코드가 없으면 모든 노드에... 코드 없는 거 뒤에 코드 있는 게 나오면 안된다. 음
        먼저 스캔 싹 하고 language 목록 만듦?

        언어별로 자막 나눌 때 filter 세 번 날리는 것보단 split 한 번 날리는 게 빠르기 때문에...

        그런데 split보다는 filter에 targets: ...string[] 으로 하는 게 함수 재활용면에서 더 나을 것 같다
        작동은 split과 비슷하나 패러미터에 언어 목록이 미리 주어지므로 따로 매번 스캔할 필요가 없고 언어 코드가 하나도 없을 경우를 신경쓰지 않아도 된다
        (split하기 전에 그런 경우는 잡아서 split하지 않도록 할 수 있음, .languages.length <= 1 이라든가)

        이거 먼저 마치고 delay 넣자

        언어별 split하고 싶을 때 SamiDocument 써서 split해서 나온 SamiDocument들로 createWebVTT 쓰도록 유도
        */
        //splitByLanguageCode() {
        //    var languages = {};
        //    Array.prototype.filter.call(this.syncElement.children, (child: Node) => {
        //        if (child.nodeType == 1) {
        //            var langData = <string>(<HTMLElement>child).dataset["language"];
        //            if (langData)
        //                languages[langData] = <HTMLElement>this.syncElement.cloneNode();
        //        }
        //    });
        //    Array.prototype.filter.call(this.syncElement.children, (child: Node) => {
        //        if (child.nodeType == 1) {
        //            var langData = <string>(<HTMLElement>child).dataset["language"];
        //            if (!langData) {
        //                for (var newsync in languages)
        //                    (<HTMLElement>newsync).appendChild(child.cloneNode(true));
        //            }
        //            else
        //                (<HTMLElement>languages[langData]).appendChild(child.cloneNode(true));
        //        }
        //        else
        //            for (var newsync in languages)
        //                (<HTMLElement>newsync).appendChild(child.cloneNode(true));
        //    });
        //    return languages;
        //}

        filter(...languages: string[]) {
            // Dictionary initialization
            var cues = <any>{};
            for (var i in languages)
                cues[languages[i]] = new SamiCue(<HTMLElement>this.syncElement.cloneNode());

            // Filter
            Array.prototype.forEach.call(this.syncElement.childNodes, (child: Node) => {
                var language: string;
                if (child.nodeType == 1) {
                    language = (<SyncChildElement>child).dataset.language;
                    if (languages.indexOf(language) >= 0) {
                        (<SamiCue>cues[language]).syncElement.appendChild(child.cloneNode(true));
                        return;
                    }
                }

                // Nodes with no language code, including text nodes
                // Add them to all cue objects
                if (!language)
                    for (var language in cues)
                        (<SamiCue>cues[language]).syncElement.appendChild(child.cloneNode(true));
            });
            return cues;
        }
    }

    export class SamiDocument {
        cues: SamiCue[] = [];
        languages: SamiLanguage[] = [];

        static parse(samistr: string): SamiDocument {
            var samiDocument = new SamiDocument();
            var domparser = new DOMParser();

            var bodystart = HTMLTagFinder.FindStartTag('body', samistr);
            var bodyendindex = this.lastIndexOfInsensitive(samistr, "</body>");

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
            samiDocument.languages = this.extractClassSelectors(stylestr);

            var samistyle = <CSSStyleSheet>domparser.parseFromString("<style>" + stylestr + "</style>", "text/html").head.getElementsByTagName("style")[0].sheet;

            var samibody = samistr.slice(bodystart.endPosition, bodyendindex);

            var syncs = HTMLTagFinder.FindStartTags('sync', samibody);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = (<SyncElement>syncs[i].element).dataset.originalString = samibody.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = (<SyncElement>syncs[i].element).dataset.originalString = samibody.slice(syncs[i].endPosition, bodyendindex);

            syncs.forEach((sync) => {
                samiDocument.cues.push(new SamiCue(this.fixIncorrectRubyNodes(<SyncElement>sync.element)));
            });
            samiDocument.cues.forEach((cue: SamiCue) => {
                this.giveLanguageData(cue, samiDocument.languages);
            });

            return samiDocument;
        }

        splitByLanguage() {
            var samiDocuments = <any>{};
            var languageCodes: string[] = [];
            for (var i in this.languages) {
                var language = this.languages[i];
                languageCodes.push(language.languageCode);

                var sami = new SamiDocument();
                sami.languages.push({
                    className: language.className,
                    languageCode: language.languageCode,
                    languageName: language.languageName
                });
                samiDocuments[language.languageCode] = sami;
            }

            for (var i in this.cues) {
                var cue = this.cues[i];
                var filtered = cue.filter.apply(cue, languageCodes);
                languageCodes.forEach((code) => {
                    (<SamiDocument>samiDocuments[code]).cues.push(filtered[code]);
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

        private static giveLanguageData(cue: SamiCue, languages: SamiLanguage[]) {
            Array.prototype.forEach.call(cue.syncElement.children, (child: SyncChildElement) => {
                for (var i = 0; i < languages.length; i++) {
                    var classCode = child.className;
                    if (!classCode || classCode === languages[i].className)
                        child.dataset.language = languages[i].languageCode;//so that we can easily use it to convert to WebVTT lang tag which requires BCP47
                }
            });
        }

        private static extractClassSelectors(stylestr: string) {
            var classes = stylestr.replace(/\s/g, "").match(/\.\w+{[^{]+}/g);
            var languages: SamiLanguage[] = [];
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
                        className: classselector[0].slice(1, classselector[0].length - 1),
                        languageName: name,
                        languageCode: lang
                    });
            });
            return languages;
        }

        private static fixIncorrectRubyNodes(syncobject: SyncElement) {
            var rubylist = syncobject.getElementsByTagName("ruby");
            var rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;

            //rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱, 그 뒤에 font를 다시 적용한다
            if (!this.isRubyParentExist(rtlist[0]) || rtlist[0].textContent.length == 0) {
                var fontdeleted = this.exchangeFontWithTemp(syncobject);
                var fontextracted = this.extractFontAndText(syncobject);
                var textsFromNoFont = this.extractReadableTextNodes(fontdeleted);
                var textsFromOnlyFont = this.extractReadableTextNodes(fontextracted);
                for (var i = 0; i < textsFromOnlyFont.length; i++) {
                    var font = this.getFontFromNode(textsFromOnlyFont[i]);
                    if (font) 
                        this.wrapWith(textsFromNoFont[i], font);
                }

                return this.fixIncorrectRPs(this._stripTemp(fontdeleted));
            }
            else
                return syncobject;
        }

        private static fixIncorrectRPs(syncobject: HTMLElement) {
            var newsync = <HTMLElement>syncobject.cloneNode(true);
            Array.prototype.forEach.call(newsync.getElementsByTagName("ruby"), (ruby: HTMLElement) => {
                var rt = ruby.getElementsByTagName("rt")[0];
                if (rt && rt.innerHTML.length == 0 && rt !== ruby.childNodes[ruby.childNodes.length - 1]) {
                    var rtdetected = false;
                    var i = 0;
                    while (i < ruby.childNodes.length) {
                        var innernode = ruby.childNodes[i];
                        if (rtdetected === false) {
                            if (innernode.nodeType == 1 && (<HTMLElement>innernode).tagName.toLowerCase() === "rt") {
                                rtdetected = true;
                                i++;
                                continue;
                            }
                            i++;
                        }
                        else {
                            ruby.removeChild(innernode);
                            rt.appendChild(innernode);
                        }
                    }
                }
            });
            return newsync;
        }
        //private static deleteRPs(syncobject: HTMLElement) {
        //    var newsync = <HTMLElement>syncobject.cloneNode(false);
        //    var newsyncstr = <string>newsync.dataset['originalString'];
        //    HTMLTagFinder.FindStartTags('rp', newsyncstr).reverse().forEach((fonttag: FoundHTMLTag) => {
        //        newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + newsyncstr.slice(fonttag.endPosition);
        //    });
        //    newsync.dataset['originalString'] = newsyncstr.replace(/<\/rp>/g, '');
        //    return newsync;
        //}

        private static wrapWith(targetNode: Node, newParentNode: Node) {
            var currentParentNode = targetNode.parentNode;//shall have one
            var currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode);//will be inserted end of the list when .nextSibling is null
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        }

        private static isRubyParentExist(rtelement: HTMLElement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return this.isRubyParentExist(rtelement.parentElement);
            }
            else
                return false;
        }

        private static getFontFromNode(text: Node): HTMLElement {
            if (text.parentNode) {
                var parent = <HTMLElement>text.parentNode;
                if (parent.tagName.toLowerCase() === "font") {
                    if ((<HTMLElement>parent).getAttribute("color"))
                        return <HTMLElement>parent.cloneNode(false);
                }
                return this.getFontFromNode(parent);
            }
            else
                return null;
        }


        /**
        Creates new element that replaces <font> start tags with <x-samits-temp></x-samits-temp> and deletes </font> end tags.
        */
        private static exchangeFontWithTemp(syncobject: SyncElement) {
            var newsync = <SyncElement>syncobject.cloneNode(false);
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
        private static _stripTemp(syncobject: SyncElement) {
            var temps = syncobject.querySelectorAll("x-samits-temp");
            Array.prototype.forEach.call(temps, (temp: HTMLElement) => {
                temp.parentNode.removeChild(temp);
            });
            return syncobject;
        }

        private static extractFontAndText(syncobject: SyncElement) {
            var newsync = <SyncElement>syncobject.cloneNode(false);
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

        private static extractReadableTextNodes(syncobject: HTMLElement) {
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

        private static lastIndexOfInsensitive(target: string, searchString: string, position = target.length - searchString.length) {
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