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
                    text = this.getRichText(xsyncs[i]);
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

        private getRichText(syncobject: Node) {
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, (node: Node) => {
                if (node.nodeType === 1)//element
                    switch ((<HTMLElement>node).tagName.toLowerCase()) {
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
                            var inner = this.getRichText(node);
                            var innerparsed = this.domparser.parseFromString(inner, "text/html").body;
                            var rt = innerparsed.getElementsByTagName("rt")[0];
                            if (rt.innerHTML.length == 0 && rt !== innerparsed.childNodes[innerparsed.childNodes.length - 1]) {
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
                            result += (<HTMLElement>node).outerHTML;
                            break;
                        }
                    }
                else //text
                    result += node.nodeValue.replace(/[\r\n]/g, '').trim();
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