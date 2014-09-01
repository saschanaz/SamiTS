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
    export interface WebVTTWriterOptions {
        createStyleElement?: boolean;
        disableDefaultStyle?: boolean;
        enableLanguageTag?: boolean;
        /** The default value is "video". */
        selector?: string;
    }
    interface TagReadResult {
        start: string;
        end: string;
        content: string;
        language?: string;
        divides?: boolean;
    }

    export class WebVTTWriter {
        private webvttStyleSheet = new WebVTTStyleSheet();
        write(xsyncs: SAMICue[], options: WebVTTWriterOptions = {}) {
            var subHeader = "WEBVTT";
            var subDocument = '';
            var writeText = (i: number, text: string) => {
                subDocument += this.getWebVTTTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getWebVTTTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text: string;
            if (xsyncs.length > 0) {
                text = this.readSyncElement(xsyncs[0].syncElement, options).content;
                if (text.length > 0) writeText(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(this.readSyncElement(xsyncs[i].syncElement, options).content);//prevents cues consists of a single &nbsp;
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        writeText(i, text);
                    }
                }
            }

            //WebVTT v2 http://blog.gingertech.net/2011/06/27/recent-developments-around-webvtt/
            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStylesheet(options);
            subDocument = subHeader + "\r\n\r\n" + subDocument;

            var result: SamiTSResult = { subtitle: subDocument };
            if (options.createStyleElement)
                result.stylesheet = this.webvttStyleSheet.getStylesheetNode(options);

            this.webvttStyleSheet.clear();
            return result;
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

        private absorbAir(target: string) {
            var trimmed = target.trim();
            return trimmed.length != 0 ? target : trimmed;
        }

        private readSyncElement(syncobject: SAMISyncElement, options: WebVTTWriterOptions) {
            var clearWhitespace =
                (input: string) =>
                    input.replace(/[ \t\r\n\f]{1,}/g, ' ').replace(/^[ \t\r\n\f]{1,}|[ \t\r\n\f]{1,}$/g, '');

            var stack: TagReadResult[] = [];
            var walker = document.createTreeWalker(syncobject, -1, null, false);
            while (true) {
                if (walker.currentNode.nodeType === 1) {
                    var element = this.readElement(<SAMIContentElement>walker.currentNode, options);
                    stack.unshift(element);

                    if (element && walker.firstChild())
                        continue;
                }
                else
                    stack.unshift({ start: '', end: '', content: clearWhitespace(walker.currentNode.nodeValue) });
    
                do {
                    var zero = stack.shift();

                    if (!stack.length)
                        return zero;

                    if (zero) {
                        if (zero.divides && stack[0].content)
                            stack[0].content += "\r\n";

                        if (zero.content) {
                            var content = zero.start + zero.content + zero.end;
                            if (options.enableLanguageTag && zero.language && this.absorbAir(content))
                                stack[0].content += "<lang " + zero.language + ">" + content + "</lang>";
                            else
                                stack[0].content += content;
                        }
                    }

                    if (walker.nextSibling())
                        break;
                    else
                        walker.parentNode();
                } while (true)
            }
        }

        private readElement(element: SAMIContentElement, options: WebVTTWriterOptions): TagReadResult {
            var template: TagReadResult = { start: '', end: '', content: '' }
            if (options.enableLanguageTag && element.dataset.language)
                template.language = element.dataset.language;
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.content = "\r\n";
                    break;
                case "font":
                    var stylename = this.registerStyle(element);
                    if (stylename) {
                        template.start = "<c." + stylename + ">";
                        template.end = "</c>";
                    }
                    break;
                case "rp":
                    template = null;
                    break;
                case "ruby":
                case "rt":
                case "b":
                case "i":
                case "u":
                    var tagname = element.tagName.toLowerCase();
                    template.start = "<" + tagname + ">";
                    template.end = "</" + tagname + ">";
                    break;
            }
            return template;
        }
        
        //private getRichText(syncobject: Node, options: WebVTTWriterOptions) {
        //    var result = '';
        //    Array.prototype.forEach.call(syncobject.childNodes, (node: Node) => {
        //        if (node.nodeType === 1) { //element
        //            var contentNode = <SAMIContentElement>node;
        //            var tagname = contentNode.tagName.toLowerCase();
        //            var content = '';
        //            switch (tagname) {
        //                case "p":
        //                    if (result)
        //                        result += "\r\n";
        //                    //nobreak
        //                default: {
        //                    content += this.getRichText(contentNode, options);
        //                    break;
        //                }
        //                case "br": {
        //                    content += "\r\n";
        //                    break;
        //                }
        //                case "font": {
        //                    var stylename = this.registerStyle(contentNode);
        //                    if (stylename) {
        //                        content += "<c." + stylename + ">" + this.getRichText(contentNode, options) + "</c>";
        //                    }
        //                    else
        //                        content += this.getRichText(contentNode, options);
        //                    break;
        //                }
        //                case "rp": {
        //                    break;
        //                }
        //                case "ruby":
        //                case "rt":
        //                case "b":
        //                case "i":
        //                case "u": {
        //                    var innertext = this.getRichText(contentNode, options);
        //                    if (innertext.length > 0)
        //                        content += '<' + tagname + '>' + innertext + '</' + tagname + '>';
        //                    break;
        //                }
        //            }
        //            if (options.enableLanguageTag && contentNode.dataset.language && this.absorbAir(content))
        //                result += "<lang " + contentNode.dataset.language + ">" + content + "</lang>";
        //            else
        //                result += content;
        //        }
        //        else { //text
        //            result += node.nodeValue.replace(/[\r\n]/g, '');
        //        }
        //    });
        //    return result;
        //}

        private registerStyle(fontelement: HTMLElement) {
            var styleName = '';
            var rule = '';
            var color = fontelement.getAttribute("color");
            if (color) {
                styleName += 'c' + color.replace('#', '').toLowerCase();
                rule += "color: " + this.fixIncorrectColorAttribute(color) + ';';
            }
            if (styleName.length != 0 && !this.webvttStyleSheet.isRuleForNameExist(styleName))
                this.webvttStyleSheet.insertRuleForName(styleName, rule);
            return styleName;
        }

        private fixIncorrectColorAttribute(colorstr: string) {
            if (colorstr.length == 6 && colorstr.search(/^[0-9a-f]{6}/) == 0) {
                return '#' + colorstr;
            }
            else
                return colorstr;
        }
    }

    class WebVTTStyleSheet {
        private ruledictionary: any = {};
        private conventionalStyle: string[] = [
            "::cue { background: transparent; text-shadow: 0 0 0.2em black; text-outline: 2px 2px black; }",
            "::cue-region { font: 0.077vh sans-serif; line-height: 0.1vh; }"
        ];
        isRuleForNameExist(targetname: string) {
            return !!this.ruledictionary[targetname];
        }
        insertRuleForName(targetname: string, rule: string) {
            this.ruledictionary[targetname] = "::cue(." + targetname + ") { " + rule + " }";
        }
        getStylesheet(options: WebVTTWriterOptions) {
            var resultarray: string[] = [];
            if (!options.disableDefaultStyle)
                this.conventionalStyle.forEach((rule: string) => {
                    resultarray.push(rule);
                });
            for (var rule in this.ruledictionary)
                resultarray.push(<string>this.ruledictionary[rule]);
            return resultarray.join('\r\n');
        }
        getStylesheetNode(options: WebVTTWriterOptions) {
            var selector = options.selector || "video";

            var styleSheet = document.createElement("style");
            var result = '';
            if (!options.disableDefaultStyle)
                this.conventionalStyle.forEach((rule: string) => {
                    result += selector + rule;
                });
            for (var rule in this.ruledictionary)
                result += selector + <string>this.ruledictionary[rule];
            styleSheet.appendChild(document.createTextNode(result));
            return styleSheet;
        }
        clear() {
            this.ruledictionary = {};
        }
    }
}