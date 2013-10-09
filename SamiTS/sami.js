"use strict";
var SamiTS;
(function (SamiTS) {
    var HTMLTagFinder = (function () {
        function HTMLTagFinder() {
        }
        HTMLTagFinder.FindStartTags = function (tagname, entirestr) {
            var list = [];
            var position = 0;
            var startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, new RegExp('<' + tagname, 'i'), position);
                if (position != -1) {
                    startPosition = position;
                    position += tagname.length + 1;
                    var xe = document.createElement(tagname);
                    while (true) {
                        var attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition: startPosition, endPosition: position });
                            break;
                        } else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                } else
                    break;
            }

            return list;
        };

        HTMLTagFinder.FindAllStartTags = function (entirestr) {
            var list = [];
            var position = 0;
            var startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, /<\w+/, position);
                if (position != -1) {
                    startPosition = position;
                    position++;
                    var tagname = '';
                    while ((entirestr[position]).search(/[A-z]/) === 0) {
                        tagname += entirestr[position];
                        position++;
                    }
                    var xe = document.createElement(tagname);
                    while (true) {
                        var attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition: startPosition, endPosition: position });
                            break;
                        } else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                } else
                    break;
            }

            return list;
            //return [];//RegExp로 모든 start tag의 시작부를 찾아낼 수 있다. /<\/?\w+/g
        };

        HTMLTagFinder.getAttribute = function (entirestr, position) {
            var _this = this;
            while (true) {
                if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F'))
                    position++;
else
                    break;
            }
            if (entirestr[position] == '>')
                return { attributeName: null, attributeValue: null, nextPosition: position };
else {
                var namestr = '';
                var valuestr = '';

                var spaceparse = function () {
                    while (true) {
                        if (_this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
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
                var valueparse = function () {
                    while (true) {
                        if (_this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                            position++;
else
                            break;
                    }
                    if (_this.charCompare(entirestr[position], '\'', '\"')) {
                        var b = entirestr[position];
                        while (true) {
                            position++;
                            if (entirestr[position] == b) {
                                position++;
                                return parsefinish();
                            } else
                                valuestr += entirestr[position];
                        }
                    } else if (entirestr[position] == '>')
                        return parsefinish();
else {
                        valuestr += entirestr[position];
                        position++;
                    }

                    while (true) {
                        if (_this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u003E'))
                            return parsefinish();
else
                            valuestr += entirestr[position];
                        position++;
                    }
                    return parsefinish();
                };
                var parsefinish = function () {
                    if (namestr.length === 0)
                        return { attributeName: null, attributeValue: null, nextPosition: position };
else
                        return { attributeName: namestr, attributeValue: valuestr, nextPosition: position };
                };

                while (true) {
                    if (entirestr[position] == '=') {
                        position++;
                        return valueparse();
                    } else if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                        return spaceparse();
else if (this.charCompare(entirestr[position], '/', '>'))
                        return parsefinish();
else if (entirestr[position] >= 'A' && entirestr[position] <= 'Z')
                        namestr += (entirestr[position]).toLowerCase();
else
                        namestr += entirestr[position];
                    position++;
                }
            }
        };

        HTMLTagFinder.searchWithIndex = function (target, query, position) {
            if (typeof position === "undefined") { position = 0; }
            if (target.length > position) {
                var found = target.slice(position).search(query);
                return found != -1 ? position + found : -1;
            } else
                return -1;
        };

        HTMLTagFinder.charCompare = function (a) {
            var b = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                b[_i] = arguments[_i + 1];
            }
            for (var i = 0; i < b.length; i++) {
                if (a === b[i])
                    return true;
            }
            return false;
        };
        return HTMLTagFinder;
    })();
    SamiTS.HTMLTagFinder = HTMLTagFinder;
})(SamiTS || (SamiTS = {}));
///<reference path='htmltagfinder.ts' />
"use strict";
var SamiTS;
(function (SamiTS) {
    var SamiParser = (function () {
        function SamiParser() {
        }
        SamiParser.Parse = function (samiDocument) {
            var _this = this;
            var bodyendindex = this.lastIndexOfInsensitive(samiDocument, "</body>");
            var syncs = SamiTS.HTMLTagFinder.FindStartTags('sync', samiDocument);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, bodyendindex);
            var syncElements = [];
            syncs.forEach(function (sync) {
                syncElements.push(_this.fixIncorrectRubyNodes(sync.element));
            });
            return syncElements;
        };

        SamiParser.fixIncorrectRubyNodes = function (syncobject) {
            //수정하기: rt가 ruby 바깥에 있거나 rt가 비어 있는 것을 체크. 해당 조건에 맞으면 font 태그를 모두 제거한 뒤 파싱하고, 그 뒤에 font를 다시 적용한다
            //WebVTTWriter에서 빼서 SamiParser로 옮기기
            var rubylist = syncobject.getElementsByTagName("ruby");
            var rtlist = rubylist.length > 0 ? syncobject.getElementsByTagName("rt") : undefined;
            if (!rtlist || rtlist.length == 0)
                return syncobject;

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

                return this.fixIncorrectRPs(fontdeleted);
            } else
                return syncobject;
        };

        SamiParser.fixIncorrectRPs = function (syncobject) {
            var newsync = syncobject.cloneNode(true);
            Array.prototype.forEach.call(newsync.getElementsByTagName("ruby"), function (ruby) {
                var rt = ruby.getElementsByTagName("rt")[0];
                if (rt && rt.innerHTML.length == 0 && rt !== ruby.childNodes[ruby.childNodes.length - 1]) {
                    var rtdetected = false;
                    var i = 0;
                    while (i < ruby.childNodes.length) {
                        var innernode = ruby.childNodes[i];
                        if (rtdetected === false) {
                            if (innernode.nodeType == 1 && (innernode).tagName.toLowerCase() === "rt") {
                                rtdetected = true;
                                i++;
                                continue;
                            }
                            i++;
                        } else {
                            ruby.removeChild(innernode);
                            rt.appendChild(innernode);
                        }
                    }
                }
            });
            return newsync;
        };

        SamiParser.wrapWith = //private static deleteRPs(syncobject: HTMLElement) {
        //    var newsync = <HTMLElement>syncobject.cloneNode(false);
        //    var newsyncstr = <string>newsync.dataset['originalstring'];
        //    HTMLTagFinder.FindStartTags('rp', newsyncstr).reverse().forEach((fonttag: FoundHTMLTag) => {
        //        newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + newsyncstr.slice(fonttag.endPosition);
        //    });
        //    newsync.dataset['originalstring'] = newsyncstr.replace(/<\/rp>/g, '');
        //    return newsync;
        //}
        function (targetNode, newParentNode) {
            var currentParentNode = targetNode.parentNode;
            var currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode);
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        };

        SamiParser.isRubyParentExist = function (rtelement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
else
                    return this.isRubyParentExist(rtelement.parentElement);
            } else
                return false;
        };

        SamiParser.getFontFromNode = function (text) {
            if (text.parentNode) {
                var parent = text.parentNode;
                if (parent.tagName.toLowerCase() === "font") {
                    if ((parent).getAttribute("color"))
                        return parent.cloneNode(false);
                }
                return this.getFontFromNode(parent);
            } else
                return null;
        };

        SamiParser.exchangeFontWithTemp = function (syncobject) {
            var newsync = syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset['originalstring'];
            SamiTS.HTMLTagFinder.FindStartTags('font', newsyncstr).reverse().forEach(function (fonttag) {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<temp />" + newsyncstr.slice(fonttag.endPosition);
            });
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '');
            return newsync;
        };

        SamiParser.extractFontAndText = function (syncobject) {
            var newsync = syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset['originalstring'];
            var tags = SamiTS.HTMLTagFinder.FindAllStartTags(syncobject.dataset['originalstring']);
            tags.filter(function (foundtag) {
                switch (foundtag.element.tagName.toLowerCase()) {
                    case "font":
                    case "p":
                        return false;
                    default:
                        return true;
                }
            }).reverse().forEach(function (foundtag) {
                newsyncstr = newsyncstr.slice(0, foundtag.startPosition) + newsyncstr.slice(foundtag.endPosition);
            });
            ;
            newsyncstr.match(/<\/\w+>/g).forEach(function (foundendtag) {
                if (foundendtag !== "</font>")
                    newsyncstr = newsyncstr.replace(foundendtag, '');
            });
            newsync.innerHTML = newsyncstr;
            return newsync;
        };

        SamiParser.extractReadableTextNodes = function (syncobject) {
            var walker = document.createTreeWalker(syncobject, NodeFilter.SHOW_TEXT, null, false);
            var node;
            var textNodes = [];
            node = walker.nextNode();
            while (node) {
                if (node.nodeValue.trim().length > 0)
                    textNodes.push(node);
                node = walker.nextNode();
            }
            return textNodes;
        };

        SamiParser.lastIndexOfInsensitive = function (target, searchString, position) {
            if (typeof position === "undefined") { position = target.length - searchString.length; }
            if (!searchString)
                return -1;
else if (searchString.length == 0)
                return 0;
            var lowersearch = searchString.toLowerCase();
            for (var i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if ((target[i]).toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        };
        return SamiParser;
    })();
    SamiTS.SamiParser = SamiParser;
})(SamiTS || (SamiTS = {}));
"use strict";
var SamiTS;
(function (SamiTS) {
    var WebVTTWriter = (function () {
        function WebVTTWriter() {
            this.webvttStyleSheet = new WebVTTStyleSheet();
            this.domparser = new DOMParser();
        }
        WebVTTWriter.prototype.write = function (xsyncs, styleOutput) {
            if (typeof styleOutput === "undefined") { styleOutput = null; }
            var _this = this;
            this.getRichText(xsyncs[0]);
            var subHeader = "WEBVTT";
            var subDocument = '';
            var write = function (i, text) {
                subDocument += _this.getWebVTTTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + _this.getWebVTTTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text;
            var syncindex = 0;
            if (xsyncs.length > 0) {
                text = this.getRichText(xsyncs[0]);
                if (text.length > 0)
                    write(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.cleanVacuum(this.getRichText(xsyncs[i]));
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        write(i, text);
                    }
                }
            }

            if (styleOutput)
                styleOutput(this.webvttStyleSheet.getCSSStyleSheetNode());

            //WebVTT v2 http://blog.gingertech.net/2011/06/27/recent-developments-around-webvtt/
            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStyleSheetString();
            subDocument = subHeader + "\r\n\r\n" + subDocument;
            return subDocument;
        };

        WebVTTWriter.prototype.getWebVTTTime = function (ms) {
            var hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            var min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            var sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            var hourstr;
            var minstr = min.toString();
            if (minstr.length < 2)
                minstr = '0' + minstr;
            var secstr = sec.toString();
            if (secstr.length < 2)
                secstr = '0' + secstr;
            var msstr = ms.toString();
            while (msstr.length < 3)
                msstr = '0' + msstr;

            if (hour > 0) {
                hourstr = hour.toString();
                if (hourstr.length < 2)
                    hourstr = '0' + hourstr;
                return hourstr + ':' + minstr + ':' + secstr + '.' + msstr;
            } else
                return minstr + ':' + secstr + '.' + msstr;
        };

        WebVTTWriter.prototype.cleanVacuum = function (uncleaned) {
            var result = uncleaned.trim();
            while (result.lastIndexOf('\r\n\r\n') > -1)
                result = result.replace('\r\n\r\n', '\r\n');
            return result;
        };

        WebVTTWriter.prototype.getRichText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1) {
                    var tagname = (node).tagName.toLowerCase();
                    switch (tagname) {
                        case "p":
                        default: {
                            result += _this.getRichText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                        case "font": {
                            var stylename = _this.registerStyle(node);
                            if (stylename) {
                                var voiceelement = document.createElement("c");
                                var outer = voiceelement.outerHTML.replace("<c", "<c." + stylename);
                                if (outer.substr(0, 5) === "<?XML") {
                                    outer = outer.substr(outer.indexOf("<c"));
                                }
                                result += outer.replace("</c>", _this.getRichText(node) + "</c>");
                            } else
                                result += _this.getRichText(node);
                            break;
                        }
                        case "ruby": {
                            result += "<ruby>" + _this.getRichText(node) + "</ruby>";
                            break;
                        }
                        case "rt": {
                            result += "<rt>" + _this.getRichText(node) + "</rt>";
                            break;
                        }
                        case "rp": {
                            break;
                        }
                        case "b":
                        case "i":
                        case "u": {
                            result += '<' + tagname + '>' + _this.getRichText(node) + '</' + tagname + '>';
                            break;
                        }
                    }
                } else {
                    result += node.nodeValue.replace(/[\r\n]/g, '');
                }
            });
            return result;
        };

        WebVTTWriter.prototype.registerStyle = function (fontelement) {
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
        };

        WebVTTWriter.prototype.fixIncorrectColorAttribute = function (colorstr) {
            if (colorstr.length == 6 && colorstr.search(/^[0-9a-f]{6}/) == 0) {
                return '#' + colorstr;
            } else
                return colorstr;
        };
        return WebVTTWriter;
    })();
    SamiTS.WebVTTWriter = WebVTTWriter;

    var WebVTTStyleSheet = (function () {
        function WebVTTStyleSheet() {
            this.ruledictionary = {};
            this.conventionalStyle = [
                "::cue { background: transparent; text-shadow: 0 0 0.2em black; text-outline: 2px 2px black; }",
                "::cue-region { font: 0.077vh sans-serif; line-height: 0.1vh; }"
            ];
        }
        WebVTTStyleSheet.prototype.isRuleForNameExist = function (targetname) {
            return !!this.ruledictionary[targetname];
        };
        WebVTTStyleSheet.prototype.insertRuleForName = function (targetname, rule) {
            this.ruledictionary[targetname] = "::cue(." + targetname + ") { " + rule + " }";
        };
        WebVTTStyleSheet.prototype.getStyleSheetString = function () {
            var resultarray = [];
            this.conventionalStyle.forEach(function (rule) {
                resultarray.push(rule);
            });
            for (var rule in this.ruledictionary)
                resultarray.push(this.ruledictionary[rule]);
            return resultarray.join('\r\n');
        };
        WebVTTStyleSheet.prototype.getCSSStyleSheetNode = function () {
            var styleSheet = document.createElement("style");
            var result = '';
            this.conventionalStyle.forEach(function (rule) {
                result += "video" + rule;
            });
            for (var rule in this.ruledictionary)
                result += "video" + this.ruledictionary[rule];
            if (styleSheet.sheet)
                (styleSheet.sheet).cssText = result;
else
                styleSheet.appendChild(document.createTextNode(result));
            return styleSheet;
        };
        return WebVTTStyleSheet;
    })();
})(SamiTS || (SamiTS = {}));
"use strict";
var SamiTS;
(function (SamiTS) {
    var SubRipWriter = (function () {
        function SubRipWriter() {
        }
        SubRipWriter.prototype.write = function (xsyncs, useTags) {
            var _this = this;
            var subDocument = "";
            var write = function (i, syncindex, text) {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + _this.getSubRipTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + _this.getSubRipTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text;
            var syncindex = 1;
            var getText = useTags ? function (xsync) {
                return _this.getRichText(xsync);
            } : function (xsync) {
                return _this.getSimpleText(xsync);
            };
            if (xsyncs.length > 0) {
                text = getText(xsyncs[0]);
                if (text.length > 0)
                    write(0, syncindex, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = getText(xsyncs[i]);
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        syncindex++;
                        write(i, syncindex, text);
                    }
                }
            }
            return subDocument;
        };

        SubRipWriter.prototype.getSubRipTime = function (ms) {
            var hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            var min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            var sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            var hourstr = hour.toString();
            if (hourstr.length < 2)
                hourstr = '0' + hourstr;
            var minstr = min.toString();
            if (minstr.length < 2)
                minstr = '0' + minstr;
            var secstr = sec.toString();
            if (secstr.length < 2)
                secstr = '0' + secstr;
            var msstr = ms.toString();
            while (msstr.length < 3)
                msstr = '0' + msstr;
            return hourstr + ':' + minstr + ':' + secstr + ',' + msstr;
        };

        SubRipWriter.prototype.getSimpleText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1)
                    switch ((node).tagName.toLowerCase()) {
                        case "p":
                        default: {
                            result += _this.getSimpleText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                    }
else
                    result += node.nodeValue.replace(/[\r\n]/g, '').trim();
            });
            return result;
        };

        SubRipWriter.prototype.getRichText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1) {
                    var tagname = (node).tagName.toLowerCase();
                    switch (tagname) {
                        case "p":
                        default: {
                            result += _this.getRichText(node);
                            break;
                        }
                        case "br": {
                            result += "\r\n";
                            break;
                        }
                        case "font": {
                            var fontelement = document.createElement("font");
                            var color = (node).getAttribute("color");
                            if (color)
                                fontelement.setAttribute("color", color);
                            if (fontelement.attributes.length > 0)
                                result += fontelement.outerHTML.replace("</font>", _this.getRichText(node) + "</font>");
else
                                result += _this.getRichText(node);
                            break;
                        }
                        case "b":
                        case "i":
                        case "u": {
                            result += '<' + tagname + '>' + _this.getRichText(node) + '</' + tagname + '>';
                            break;
                        }
                    }
                } else
                    result += node.nodeValue.replace(/[\r\n]/g, '').trim();
            });
            return result;
        };
        return SubRipWriter;
    })();
    SamiTS.SubRipWriter = SubRipWriter;
})(SamiTS || (SamiTS = {}));
///<reference path='syncparser.ts' />
///<reference path='webvttwriter.ts' />
///<reference path='subripwriter.ts' />
var SamiTS;
(function (SamiTS) {
    function convertToWebVTTFromString(samiString, styleOutput) {
        if (typeof styleOutput === "undefined") { styleOutput = null; }
        var xsyncs = SamiTS.SamiParser.Parse(samiString);
        return (new SamiTS.WebVTTWriter()).write(xsyncs, styleOutput);
    }
    SamiTS.convertToWebVTTFromString = convertToWebVTTFromString;

    function convertToSubRipFromString(samiString, useTextStyles) {
        var xsyncs = SamiTS.SamiParser.Parse(samiString);
        return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
    }
    SamiTS.convertToSubRipFromString = convertToSubRipFromString;

    function convertToWebVTTFromFile(samiFile, read, styleOutput) {
        if (typeof styleOutput === "undefined") { styleOutput = null; }
        var reader = new FileReader();
        reader.onload = function (ev) {
            read(convertToWebVTTFromString(ev.target.result, styleOutput));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToWebVTTFromFile = convertToWebVTTFromFile;

    function convertToSubRipFromFile(samiFile, read, useTextStyles) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            read(convertToSubRipFromString(ev.target.result, useTextStyles));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToSubRipFromFile = convertToSubRipFromFile;
})(SamiTS || (SamiTS = {}));
///<reference path='../SamiTS/samiconverter.ts' />
"use strict";
var subtypechecks;

var track;
var style;
var isPreviewAreaShown = false;
var subtitleFileDisplayName;
document.addEventListener("DOMContentLoaded", function () {
    subtypechecks = document.getElementsByName("subtype");
});

var SubType;
(function (SubType) {
    SubType[SubType["WebVTT"] = 0] = "WebVTT";
    SubType[SubType["SRT"] = 1] = "SRT";
})(SubType || (SubType = {}));

function load(evt) {
    var files = (evt.target).files;
    var videofile;
    var subfile;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!videofile && player.canPlayType(file.type))
            videofile = file;
else if (!subfile && getFileExtension(file) === "smi")
            subfile = file;
        if (videofile && subfile)
            break;
    }
    if (!subfile)
        return;

    subtitleFileDisplayName = getFileDisplayName(subfile);
    var resultOutput = function (result) {
        hidePreviewArea();
        hidePlayer();
        hideAreaSelector();
        output.value = result;
        if (track) {
            player.removeChild(track);
            (document.getElementById("areaselector"));
            player.src = '';
        }
        if (videofile) {
            player.src = URL.createObjectURL(videofile);
            track = document.createElement("track");
            track.label = "日本語";
            track.kind = "subtitles";
            track.srclang = "ja";
            track.src = URL.createObjectURL(new Blob([result], { type: "text/vtt" }));
            track.default = true;
            player.appendChild(track);
            showAreaSelector();
            showPlayer();
        } else
            showPreviewArea();
    };

    switch (getTargetSubType()) {
        case SubType.WebVTT:
            return SamiTS.convertToWebVTTFromFile(subfile, resultOutput, function (resultStyle) {
                if (style)
                    document.head.removeChild(style);
                style = resultStyle;
                document.head.appendChild(resultStyle);
            });
        case SubType.SRT:
            return SamiTS.convertToSubRipFromFile(subfile, resultOutput, getTagUse());
    }
    //SamiTS.convertFromFile(subfile, getTargetSubType(), getTagUse(), (result: string) => {
    //    hidePreviewArea();
    //    hidePlayer();
    //    hideAreaSelector();
    //    output.value = result;
    //    if (track) {
    //        player.removeChild(track); (<HTMLButtonElement>document.getElementById("areaselector"))
    //        player.src = '';
    //    }
    //    if (videofile) {
    //        player.src = URL.createObjectURL(videofile);
    //        track = document.createElement("track");
    //        track.label = "日本語";
    //        track.kind = "subtitles";
    //        track.srclang = "ja";
    //        track.src = URL.createObjectURL(new Blob([result], { type: "text/vtt" }));
    //        track.default = true;
    //        player.appendChild(track);
    //        showAreaSelector();
    //        showPlayer();
    //    }
    //    else
    //        showPreviewArea();
    //});
}

function selectArea() {
    if (isPreviewAreaShown) {
        hidePreviewArea();
        showPlayer();
    } else {
        hidePlayer();
        showPreviewArea();
    }
}

function showAreaSelector() {
    areaselector.style.display = "inline-block";
}
function hideAreaSelector() {
    areaselector.style.display = "none";
}
function showPreviewArea() {
    previewarea.style.display = "inline-block";
    isPreviewAreaShown = true;
    areaselector.value = "Play";
}
function hidePreviewArea() {
    previewarea.style.display = "none";
    isPreviewAreaShown = false;
}
function showPlayer() {
    player.style.display = "inline-block";
    areaselector.value = "Preview";
}
function hidePlayer() {
    player.style.display = "none";
}

function getExtensionForSubType() {
    switch (getTargetSubType()) {
        case SubType.WebVTT:
            return ".vtt";
        case SubType.SRT:
            return ".srt";
    }
}

function getMIMETypeForSubType() {
    switch (getTargetSubType()) {
        case SubType.WebVTT:
            return "text/vtt";
        case SubType.SRT:
            return "text/plain";
    }
}

function getTargetSubType() {
    if ((subtypechecks[0]).checked)
        return SubType.WebVTT;
else if ((subtypechecks[1]).checked)
        return SubType.SRT;
}

function getTagUse() {
    return taguse.checked;
}

function getFileExtension(file) {
    var splitted = file.name.split('.');
    return splitted[splitted.length - 1].toLowerCase();
}

function getFileDisplayName(file) {
    var splitted = file.name.split('.');
    splitted = splitted.slice(0, splitted.length - 1);
    return splitted.join('.');
}
"use strict";
var SamiTS;
(function (SamiTS) {
    var SDPUSWriter = (function () {
        function SDPUSWriter() {
            this.xmlNamespaceURI = "http://www.w3.org/XML/1998/namespace";
            this.xmlnsNamespaceURI = "http://www.w3.org/2000/xmlns/";
            this.ttmlNamespaceURI = "http://www.w3.org/ns/ttml";
            this.ttmlStyleNamespaceURI = "http://www.w3.org/ns/ttml#styling";
            this.ttmlParameterNamespaceURI = "http://www.w3.org/ns/ttml#parameter";
            this.sdpusNamespaceURI = "http://www.w3.org/ns/ttml/profile/sdp-us";
        }
        SDPUSWriter.prototype.write = function (xsyncs) {
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
            var sdpusdoc = document.implementation.createDocument(this.ttmlNamespaceURI, "tt", null);
            sdpusdoc.documentElement.setAttributeNS(this.xmlNamespaceURI, "xml:lang", "en-us");
            sdpusdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:s", this.ttmlStyleNamespaceURI);
            sdpusdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:p", this.ttmlParameterNamespaceURI);
            var body = sdpusdoc.createElementNS(this.ttmlNamespaceURI, "head");
            var profile = sdpusdoc.createElementNS(this.ttmlParameterNamespaceURI, "profile");
            profile.setAttributeNS(this.ttmlParameterNamespaceURI, "use", this.sdpusNamespaceURI);
            this.stylingElement = sdpusdoc.createElementNS(this.ttmlNamespaceURI, "styling");

            return (new XMLSerializer()).serializeToString(sdpusdoc);
        };
        return SDPUSWriter;
    })();
    SamiTS.SDPUSWriter = SDPUSWriter;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=sami.js.map
