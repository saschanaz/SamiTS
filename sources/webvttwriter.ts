﻿"use strict";

module SamiTS {
    export interface WebVTTWriterOptions {
        createStyleElement?: boolean;
    }

    export class WebVTTWriter {
        private webvttStyleSheet = new WebVTTStyleSheet();
        write(xsyncs: SamiCue[], options?: WebVTTWriterOptions) {
            var subHeader = "WEBVTT";
            var subDocument = '';
            var writeText = (i: number, text: string) => {
                subDocument += this.getWebVTTTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getWebVTTTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text: string;
            if (xsyncs.length > 0) {
                text = this.getRichText(xsyncs[0].syncElement);
                if (text.length > 0) writeText(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(this.getRichText(xsyncs[i].syncElement));//prevents cues consists of a single &nbsp;
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        writeText(i, text);
                    }
                }
            }

            //WebVTT v2 http://blog.gingertech.net/2011/06/27/recent-developments-around-webvtt/
            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStyleSheetString();
            this.webvttStyleSheet.clear();
            subDocument = subHeader + "\r\n\r\n" + subDocument;

            var result: SamiTSResult = { subtitle: subDocument };
            if (options && options.createStyleElement)
                result.stylesheet = this.webvttStyleSheet.getCSSStyleSheetNode();

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
                            var stylename = this.registerStyle(<HTMLElement>node);
                            if (stylename) {
                                var voiceelement = document.createElement("c");
                                var outer = voiceelement.outerHTML.replace("<c", "<c." + stylename);
                                if (outer.substr(0, 5) === "<?XML") {
                                    outer = outer.substr(outer.indexOf("<c"));
                                }
                                result += outer.replace("</c>", this.getRichText(node) + "</c>");
                            }
                            else
                                result += this.getRichText(node);
                            break;
                        }
                        case "rp": {
                            break;
                        }
                        case "ruby":
                        case "rt":
                        case "b":
                        case "i":
                        case "u": {
                            var innertext = this.getRichText(node);
                            if (innertext.length > 0)
                                result += '<' + tagname + '>' + innertext + '</' + tagname + '>';
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
        getStyleSheetString() {
            var resultarray: string[] = [];
            this.conventionalStyle.forEach((rule: string) => {
                resultarray.push(rule);
            });
            for (var rule in this.ruledictionary)
                resultarray.push(<string>this.ruledictionary[rule]);
            return resultarray.join('\r\n');
        }
        getCSSStyleSheetNode() {
            var styleSheet = document.createElement("style");
            var result = '';
            this.conventionalStyle.forEach((rule: string) => {
                result += "video" + rule;
            });
            for (var rule in this.ruledictionary)
                result += "video" + <string>this.ruledictionary[rule];
            styleSheet.appendChild(document.createTextNode(result));
            return styleSheet;
        }
        clear() {
            this.ruledictionary = {};
        }
    }
}