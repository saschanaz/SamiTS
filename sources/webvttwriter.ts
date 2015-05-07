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

    export class WebVTTWriter {
        private webvttStyleSheet = new WebVTTStyleSheet();
        write(xsyncs: SAMICue[], options: WebVTTWriterOptions = {}) {
            var subHeader = "WEBVTT";
            var subDocument = '';
            var writeText = (i: number, text: string) => {
                subDocument += "\r\n\r\n";
                subDocument += this.getWebVTTTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getWebVTTTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            options = util.assign<any>(<DOMReadOptionBag>{ preventEmptyLine: true }, options);

            var text: string;
            if (xsyncs.length > 0) {
                let readElement = this.readElement.bind(this);
                
                for (var i = 0; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(xsyncs[i].readDOM(readElement, options));//prevents cues consists of a single &nbsp;
                    if (text.length > 0)
                        writeText(i, text);
                }
            }

            //WebVTT v2 http://blog.gingertech.net/2011/06/27/recent-developments-around-webvtt/
            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStylesheet(options);
            subDocument = subHeader + subDocument;

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

        /**
        Trim the input string if and only if its trimmed result is empty.
        */
        private absorbAir(target: string) {
            var trimmed = target.trim();
            return trimmed.length != 0 ? target : trimmed;
        }

        private readElement(element: SAMIContentElement, options: WebVTTWriterOptions): TagReadResult {
            var template = util.generateTagReadResultTemplate();
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
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
            if (options.enableLanguageTag && element.dataset.language && template.content.trim()) {
                template.start = "<lang " + element.dataset.language + ">" + template.start;
                template.end += "</lang>";
            }
            return template;
        }

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