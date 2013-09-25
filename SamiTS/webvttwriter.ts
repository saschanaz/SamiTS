"use strict";

module SamiTS {
    export class WebVTTWriter {
        private webvttStyleSheet = new WebVTTStyleSheet();
        private domparser = new DOMParser();
        write(xsyncs: HTMLElement[]) {
            this.getRichText(xsyncs[0]);
            var subHeader = "WEBVTT";
            var subDocument = '';
            var write = (i: number, text: string) => {
                subDocument += this.getWebVTTTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + this.getWebVTTTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text: string;
            var syncindex = 0;
            if (xsyncs.length > 0) {
                text = this.getRichText(xsyncs[0]);
                if (text.length > 0) write(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.cleanVacuum(this.getRichText(this.correctRubyNodes(xsyncs[i])));//prevents cues consists of a single &nbsp;
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        write(i, text);
                    }
                }
            }

            //WebVTT v2 http://blog.gingertech.net/2011/06/27/recent-developments-around-webvtt/
            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStyleSheetString();
            subDocument = subHeader + "\r\n\r\n" + subDocument;
            return subDocument;
        }

        private getWebVTTTime(ms: number) {
            var hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            var min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            var sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            var hourstr: string;
            var minstr = min.toString();
            if (minstr.length < 2) minstr = '0' + minstr;
            var secstr = sec.toString();
            if (secstr.length < 2) secstr = '0' + secstr;
            var msstr = ms.toString();
            while (msstr.length < 3) msstr = '0' + msstr;

            if (hour > 0) {
                hourstr = hour.toString();
                if (hourstr.length < 2) hourstr = '0' + hourstr;
                return hourstr + ':' + minstr + ':' + secstr + '.' + msstr;
            }
            else
                return minstr + ':' + secstr + '.' + msstr;
        }

        private cleanVacuum(uncleaned: string) {
            var result = uncleaned.trim();
            while (result.lastIndexOf('\r\n\r\n') > -1)
                result = result.replace('\r\n\r\n', '\r\n');
            return result;
        }

        private correctRubyNodes(syncobject: HTMLElement) {
            //수정하기: rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱하고, 그 뒤에 font를 다시 적용한다
            var rubylist = syncobject.getElementsByTagName("ruby");
            var rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;

            if (!this.isRubyParentExist(rtlist[0]) || rtlist[0].textContent.length == 0) {
                var fontdeleted = this.deleteFont(syncobject);
                var fontextracted = this.extractFontAndText(syncobject);
                var textsFromNoFont = this.extractReadableTextNodes(fontdeleted);
                var textsFromOnlyFont = this.extractReadableTextNodes(fontdeleted);
                return fontdeleted;
            }
            else
                return syncobject;

        }

        private isRubyParentExist(rtelement: HTMLElement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return this.isRubyParentExist(rtelement.parentElement);
            }
            else
                return false;
        }

        private deleteFont(syncobject: HTMLElement) {
            var newsync = <HTMLElement>syncobject.cloneNode(true);
            var newsyncstr = <string>syncobject.dataset['originalstring'];
            HTMLTagFinder.FindStartTags('font', newsyncstr).reverse().forEach((fonttag: FoundHTMLTag) => {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + newsyncstr.slice(fonttag.endPosition);
            });
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '');
            return newsync;
        }

        private extractFontAndText(syncobject: HTMLElement) {
            var newsync = <HTMLElement>syncobject.cloneNode(true);
            var newsyncstr = <string>syncobject.dataset['originalstring'];
            var tags =HTMLTagFinder.FindAllStartTags(syncobject.dataset['originalstring']);
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

        private extractReadableTextNodes(syncobject: HTMLElement) {
            var walker = document.createTreeWalker(syncobject, NodeFilter.SHOW_TEXT, null, false);
            var node: Node;
            var textNodes: Node[] = [];
            node = walker.nextNode();
            while (node) {
                if ((<Text>node).nodeValue.trim().length > 0)
                    textNodes.push(node);
                node = walker.nextNode();
            }
            return textNodes;
        }

        private getRichText(syncobject: Node) {
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, (node: Node) => {
                if (node.nodeType === 1) { //element
                    var tagname = (<HTMLElement>node).tagName.toLowerCase();
                    switch (tagname) {
                        case "p":
                        default: {
                            result += this.getRichText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                        case "font": {
                            var voiceelement = document.createElement("v");
                            var stylename = this.registerStyle(<HTMLElement>node);
                            if (stylename) {
                                voiceelement.setAttribute(stylename, '');
                                var outer = voiceelement.outerHTML;
                                if (outer.substr(0, 5) === "<?XML") {
                                    outer = outer.substr(outer.indexOf("<v"));
                                }
                                outer = outer.replace(/=""/, '');
                                result += outer.replace("</v>", this.getRichText(node) + "</v>");
                            }
                            else
                                result += this.getRichText(node);
                            break;
                        }
                        case "ruby": {
                            var inner = (<HTMLElement>node).innerHTML;
                            var innerparsed = inner.length > 0 ? this.domparser.parseFromString((<HTMLElement>node).innerHTML, "text/html").body : undefined;
                            var rt = innerparsed ? innerparsed.getElementsByTagName("rt")[0] : undefined;
                            if (rt && rt.innerHTML.length == 0 && rt !== innerparsed.childNodes[innerparsed.childNodes.length - 1]) {
                                var rtdetected = false;
                                //Array.prototype.forEach.call(innerparsed.childNodes, (innernode: Node) => {
                                var i = 0;
                                while (i < innerparsed.childNodes.length) {
                                    var innernode = innerparsed.childNodes[i];
                                    if (rtdetected === false) {
                                        if (innernode.nodeType == 1 && (<HTMLElement>innernode).tagName.toLowerCase() === "rt") {
                                            rtdetected = true;
                                            i++;
                                            continue;
                                        }
                                        i++;
                                    }
                                    else {
                                        innerparsed.removeChild(innernode);
                                        rt.appendChild(innernode);
                                    }
                                }
                                result += "<ruby>" + this.getRichText(innerparsed) + "</ruby>";
                            }
                            else
                                result += "<ruby>" + this.getRichText(node) + "</ruby>";
                            break;
                        }
                        case "rt": {
                            result += "<rt>" + this.getRichText(node) + "</rt>";
                            break;
                        }
                        case "rp": {
                            break;
                        }
                        case "b":
                        case "i":
                        case "u": {
                            result += '<' + tagname + '>' + this.getRichText(node) + '</' + tagname + '>';
                            break;
                        }
                    }
                }
                else { //text
                    result += node.nodeValue.replace(/[\r\n]/g, '');
                }
            });
            return result;
        }

        private registerStyle(fontelement: HTMLElement) {
            var styleName = '';
            var rule = '';
            var color = fontelement.getAttribute("color");
            if (color) {
                styleName += 'C' + color.replace('#', '');
                rule += "color: " + color + ';';
            }
            if (styleName.length != 0 && !this.webvttStyleSheet.isRuleForNameExist(styleName))
                this.webvttStyleSheet.insertRuleForName(styleName, rule);
            return styleName;
        }
    }

    class WebVTTStyleSheet {
        private ruledictionary = {};
        isRuleForNameExist(targetname: string) {
            return !!this.ruledictionary[targetname];
        }
        insertRuleForName(targetname: string, rule: string) {
            this.ruledictionary[targetname] = "::cue(v[voice=\"" + targetname + "\"]) { " + rule + " }";
        }
        getStyleSheetString() {
            var resultarray: string[] = [];
            for (var rule in this.ruledictionary)
                resultarray.push(<string>this.ruledictionary[rule]);
            return resultarray.join('\r\n');
        }
    }
}