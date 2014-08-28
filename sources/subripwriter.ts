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
    export interface SubRipWriterOptions {
        useTextStyles?: boolean
    }

    export class SubRipWriter {
        write(xsyncs: SAMICue[], options: SubRipWriterOptions = {}) {
            var subDocument = "";
            var writeText = (i: number, syncindex: number, text: string) => {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + this.getSubRipTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getSubRipTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text: string;
            var syncindex = 1;
            var getText = options.useTextStyles ? (xsync: Node) => { return this.getRichText(xsync) } : (xsync: Node) => { return this.getSimpleText(xsync) };
            if (xsyncs.length > 0) {
                text = this.absorbAir(getText(xsyncs[0].syncElement));
                if (text.length > 0) writeText(0, syncindex, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(getText(xsyncs[i].syncElement));
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        syncindex++;
                        writeText(i, syncindex, text);
                    }
                }
            }
            return <SamiTSResult>{ subtitle: subDocument };
        }

        private getSubRipTime(ms: number) {
            var hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            var min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            var sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            var hourstr = hour.toString();
            if (hourstr.length < 2) hourstr = '0' + hourstr;
            var minstr = min.toString();
            if (minstr.length < 2) minstr = '0' + minstr;
            var secstr = sec.toString();
            if (secstr.length < 2) secstr = '0' + secstr;
            var msstr = ms.toString();
            while (msstr.length < 3) msstr = '0' + msstr;
            return hourstr + ':' + minstr + ':' + secstr + ',' + msstr;
        }

        private absorbAir(target: string) {
            var trimmed = target.trim();
            return trimmed.length != 0 ? target : trimmed;
        }

        private getSimpleText(syncobject: Node) {
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, (node: Node) => {
                if (node.nodeType === 1)//element
                    switch ((<HTMLElement>node).tagName.toLowerCase()) {
                        case "p":
                            if (result)
                                result += "\r\n";
                            //nobreak
                        default: {
                            result += this.getSimpleText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                    }
                else //text
                    result += node.nodeValue.replace(/[\r\n]/g, '');
            });
            return result;
        }

        private getRichText(syncobject: Node) {
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, (node: Node) => {
                if (node.nodeType === 1) { //element
                    var tagname = (<HTMLElement>node).tagName.toLowerCase();
                    switch (tagname) {
                        case "p":
                            if (result)
                                result += "\r\n";
                            //nobreak
                        default: {
                            result += this.getRichText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                        case "font": {
                            var fontelement = document.createElement("font");
                            var color = (<HTMLElement>node).getAttribute("color");
                            if (color) fontelement.setAttribute("color", color);
                            if (fontelement.attributes.length > 0)
                                result += fontelement.outerHTML.replace("</font>", this.getRichText(node) + "</font>");
                            else
                                result += this.getRichText(node);
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
                else //text
                    result += node.nodeValue.replace(/[\r\n]/g, '');
            });
            return result;
        }
    }
}