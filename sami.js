"use strict";
var SamiTS;
(function (SamiTS) {
    var HTMLTagFinder = (function () {
        function HTMLTagFinder() {
        }
        HTMLTagFinder.FindStartTag = function (tagname, entirestr) {
            var tag;
            var position = 0;
            var startPosition = 0;
            while (!tag) {
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
                            tag = { element: xe, startPosition: startPosition, endPosition: position };
                            break;
                        } else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                } else
                    break;
            }

            return tag;
        };

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
                    while (entirestr[position].search(/[A-z]/) === 0) {
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
                        namestr += entirestr[position].toLowerCase();
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
"use strict";
var SamiTS;
(function (SamiTS) {
    var SamiCue = (function () {
        function SamiCue(syncElement) {
            if (syncElement.tagName.toLowerCase() !== "sync")
                throw new Error("SamiCue can only accept sync element");
            else
                this.syncElement = syncElement;
        }
        SamiCue.prototype.filterByLanguageCode = function (lang) {
            var newsync = this.syncElement.cloneNode();
            Array.prototype.forEach.call(this.syncElement.childNodes, function (child) {
                if (child.nodeType == 1) {
                    var langData = child.dataset.language;
                    if (!langData || langData === lang)
                        newsync.appendChild(child.cloneNode(true));
                } else
                    newsync.appendChild(child.cloneNode());
            });
            return new SamiCue(newsync);
        };
        return SamiCue;
    })();
    SamiTS.SamiCue = SamiCue;

    var SamiDocument = (function () {
        function SamiDocument() {
            this.samiCues = [];
            this.languages = [];
        }
        SamiDocument.parse = function (samistr) {
            var _this = this;
            var samiDocument = new SamiDocument();
            var domparser = new DOMParser();

            var bodystart = SamiTS.HTMLTagFinder.FindStartTag('body', samistr);
            var bodyendindex = this.lastIndexOfInsensitive(samistr, "</body>");

            var samicontainer = domparser.parseFromString((samistr.slice(0, bodystart.endPosition) + samistr.slice(bodyendindex)).replace(/(<\/?)(\w+)[^<]+>/g, function (word) {
                return word.toLowerCase();
            }).replace(/<!--(.+)?-->/g, ''), "text/xml").firstChild;
            var samihead = samicontainer.getElementsByTagName("head")[0];

            var stylestr = '';
            Array.prototype.forEach.call(samihead.getElementsByTagName("style")[0].childNodes, function (text) {
                if (text.data)
                    stylestr += text.data;
            });
            samiDocument.languages = this.extractClassSelectors(stylestr);

            var samistyle = domparser.parseFromString("<style>" + stylestr + "</style>", "text/html").head.getElementsByTagName("style")[0].sheet;

            var samibody = samistr.slice(bodystart.endPosition, bodyendindex);

            var syncs = SamiTS.HTMLTagFinder.FindStartTags('sync', samibody);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = syncs[i].element.dataset.originalString = samibody.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = syncs[i].element.dataset.originalString = samibody.slice(syncs[i].endPosition, bodyendindex);

            syncs.forEach(function (sync) {
                samiDocument.samiCues.push(new SamiCue(_this.fixIncorrectRubyNodes(sync.element)));
            });
            samiDocument.samiCues.forEach(function (cue) {
                _this.giveLanguageData(cue, samiDocument.languages);
            });

            return samiDocument;
        };

        SamiDocument.prototype.splitByLanguage = function () {
            var _this = this;
            var samiDocuments = [];
            this.languages.forEach(function (value) {
                var newDocument = new SamiDocument();
                newDocument.languages.push(value);
                _this.samiCues.forEach(function (cue) {
                    var filtered = cue.filterByLanguageCode(value.languageCode);
                    if (filtered.syncElement.hasChildNodes())
                        newDocument.samiCues.push(filtered);
                });
                samiDocuments.push(newDocument);
            });
            return samiDocuments;
        };

        SamiDocument.giveLanguageData = function (cue, languages) {
            Array.prototype.forEach.call(cue.syncElement.children, function (child) {
                for (var i = 0; i < languages.length; i++) {
                    var classCode = child.className;
                    if (!classCode || classCode === languages[i].className)
                        child.dataset.language = languages[i].languageCode;
                }
            });
        };

        SamiDocument.extractClassSelectors = function (stylestr) {
            var classes = stylestr.replace(/\s/g, "").match(/\.\w+{[^{]+}/g);
            var languages = [];
            classes.forEach(function (classstr) {
                var classselector = classstr.match(/\.\w+{/);
                if (classselector.length != 1)
                    return;
                var stylebody = classstr.slice(classselector[0].length).split(';');
                var name;
                var lang;
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
        };

        SamiDocument.fixIncorrectRubyNodes = function (syncobject) {
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

        SamiDocument.fixIncorrectRPs = function (syncobject) {
            var newsync = syncobject.cloneNode(true);
            Array.prototype.forEach.call(newsync.getElementsByTagName("ruby"), function (ruby) {
                var rt = ruby.getElementsByTagName("rt")[0];
                if (rt && rt.innerHTML.length == 0 && rt !== ruby.childNodes[ruby.childNodes.length - 1]) {
                    var rtdetected = false;
                    var i = 0;
                    while (i < ruby.childNodes.length) {
                        var innernode = ruby.childNodes[i];
                        if (rtdetected === false) {
                            if (innernode.nodeType == 1 && innernode.tagName.toLowerCase() === "rt") {
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

        SamiDocument.wrapWith = function (targetNode, newParentNode) {
            var currentParentNode = targetNode.parentNode;
            var currentNextSibling = targetNode.nextSibling;
            currentParentNode.removeChild(targetNode);
            newParentNode.appendChild(targetNode);
            currentParentNode.insertBefore(newParentNode, currentNextSibling);
        };

        SamiDocument.isRubyParentExist = function (rtelement) {
            if (rtelement.parentElement) {
                if (rtelement.parentElement.tagName.toLowerCase() === "ruby")
                    return true;
                else
                    return this.isRubyParentExist(rtelement.parentElement);
            } else
                return false;
        };

        SamiDocument.getFontFromNode = function (text) {
            if (text.parentNode) {
                var parent = text.parentNode;
                if (parent.tagName.toLowerCase() === "font") {
                    if (parent.getAttribute("color"))
                        return parent.cloneNode(false);
                }
                return this.getFontFromNode(parent);
            } else
                return null;
        };

        SamiDocument.exchangeFontWithTemp = function (syncobject) {
            var newsync = syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset.originalString;
            SamiTS.HTMLTagFinder.FindStartTags('font', newsyncstr).reverse().forEach(function (fonttag) {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<temp />" + newsyncstr.slice(fonttag.endPosition);
            });
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '');
            return newsync;
        };

        SamiDocument.extractFontAndText = function (syncobject) {
            var newsync = syncobject.cloneNode(false);
            var newsyncstr = newsync.dataset.originalString;
            var tags = SamiTS.HTMLTagFinder.FindAllStartTags(syncobject.dataset.originalString);
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

        SamiDocument.extractReadableTextNodes = function (syncobject) {
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

        SamiDocument.lastIndexOfInsensitive = function (target, searchString, position) {
            if (typeof position === "undefined") { position = target.length - searchString.length; }
            if (!searchString)
                return -1;
            else if (searchString.length == 0)
                return 0;
            var lowersearch = searchString.toLowerCase();
            for (var i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if (target[i].toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        };
        return SamiDocument;
    })();
    SamiTS.SamiDocument = SamiDocument;
})(SamiTS || (SamiTS = {}));
"use strict";
var SamiTS;
(function (SamiTS) {
    var WebVTTWriter = (function () {
        function WebVTTWriter() {
            this.webvttStyleSheet = new WebVTTStyleSheet();
        }
        WebVTTWriter.prototype.write = function (xsyncs, options) {
            var _this = this;
            if (typeof options === "undefined") { options = null; }
            var subHeader = "WEBVTT";
            var subDocument = '';
            var writeText = function (i, text) {
                subDocument += _this.getWebVTTTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + _this.getWebVTTTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text;
            if (xsyncs.length > 0) {
                text = this.getRichText(xsyncs[0].syncElement);
                if (text.length > 0)
                    writeText(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(this.getRichText(xsyncs[i].syncElement));
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        writeText(i, text);
                    }
                }
            }

            if (options && options.onstyleload)
                options.onstyleload(this.webvttStyleSheet.getCSSStyleSheetNode());

            subHeader += "\r\n\r\nSTYLE -->\r\n" + this.webvttStyleSheet.getStyleSheetString();
            this.webvttStyleSheet.clear();
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

        WebVTTWriter.prototype.absorbAir = function (target) {
            var trimmed = target.trim();
            return trimmed.length != 0 ? target : trimmed;
        };

        WebVTTWriter.prototype.getRichText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1) {
                    var tagname = node.tagName.toLowerCase();
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
                        case "rp": {
                            break;
                        }
                        case "ruby":
                        case "rt":
                        case "b":
                        case "i":
                        case "u": {
                            var innertext = _this.getRichText(node);
                            if (innertext.length > 0)
                                result += '<' + tagname + '>' + innertext + '</' + tagname + '>';
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
            styleSheet.appendChild(document.createTextNode(result));
            return styleSheet;
        };
        WebVTTStyleSheet.prototype.clear = function () {
            this.ruledictionary = {};
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
        SubRipWriter.prototype.write = function (xsyncs, options) {
            var _this = this;
            if (typeof options === "undefined") { options = null; }
            var subDocument = "";
            var writeText = function (i, syncindex, text) {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + _this.getSubRipTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + _this.getSubRipTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text;
            var syncindex = 1;
            var getText = (options && options.useTextStyles) ? function (xsync) {
                return _this.getRichText(xsync);
            } : function (xsync) {
                return _this.getSimpleText(xsync);
            };
            if (xsyncs.length > 0) {
                text = this.absorbAir(getText(xsyncs[0].syncElement));
                if (text.length > 0)
                    writeText(0, syncindex, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = this.absorbAir(getText(xsyncs[i].syncElement));
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        syncindex++;
                        writeText(i, syncindex, text);
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

        SubRipWriter.prototype.absorbAir = function (target) {
            var trimmed = target.trim();
            return trimmed.length != 0 ? target : trimmed;
        };

        SubRipWriter.prototype.getSimpleText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1)
                    switch (node.tagName.toLowerCase()) {
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
                    result += node.nodeValue.replace(/[\r\n]/g, '');
            });
            return result;
        };

        SubRipWriter.prototype.getRichText = function (syncobject) {
            var _this = this;
            var result = '';
            Array.prototype.forEach.call(syncobject.childNodes, function (node) {
                if (node.nodeType === 1) {
                    var tagname = node.tagName.toLowerCase();
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
                            var color = node.getAttribute("color");
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
                    result += node.nodeValue.replace(/[\r\n]/g, '');
            });
            return result;
        };
        return SubRipWriter;
    })();
    SamiTS.SubRipWriter = SubRipWriter;
})(SamiTS || (SamiTS = {}));
var SamiTS;
(function (SamiTS) {
    function convertToWebVTTFromString(samiString, options) {
        if (typeof options === "undefined") { options = null; }
        var samiDocument = SamiTS.SamiDocument.parse(samiString);
        return (new SamiTS.WebVTTWriter()).write(samiDocument.samiCues, options);
    }
    SamiTS.convertToWebVTTFromString = convertToWebVTTFromString;

    function convertToSubRipFromString(samiString, options) {
        if (typeof options === "undefined") { options = null; }
        var samiDocument = SamiTS.SamiDocument.parse(samiString);
        return (new SamiTS.SubRipWriter()).write(samiDocument.samiCues, options);
    }
    SamiTS.convertToSubRipFromString = convertToSubRipFromString;

    function convertToWebVTTFromFile(samiFile, onread, options) {
        if (typeof options === "undefined") { options = null; }
        var reader = new FileReader();
        reader.onload = function (ev) {
            onread(convertToWebVTTFromString(reader.result, options));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToWebVTTFromFile = convertToWebVTTFromFile;

    function convertToSubRipFromFile(samiFile, onread, options) {
        if (typeof options === "undefined") { options = null; }
        var reader = new FileReader();
        reader.onload = function (ev) {
            onread(convertToSubRipFromString(reader.result, options));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToSubRipFromFile = convertToSubRipFromFile;
})(SamiTS || (SamiTS = {}));
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
            var ttdoc = document.implementation.createDocument(this.ttmlNamespaceURI, "tt", null);
            ttdoc.documentElement.setAttributeNS(this.xmlNamespaceURI, "xml:lang", "en-us");
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:s", this.ttmlStyleNamespaceURI);
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:p", this.ttmlParameterNamespaceURI);

            var head = ttdoc.createElementNS(this.ttmlNamespaceURI, "head");
            ttdoc.appendChild(head);

            var profile = ttdoc.createElementNS(this.ttmlParameterNamespaceURI, "profile");
            profile.setAttributeNS(this.ttmlParameterNamespaceURI, "use", this.sdpusNamespaceURI);
            head.appendChild(profile);

            this.stylingElement = ttdoc.createElementNS(this.ttmlNamespaceURI, "styling");
            head.appendChild(this.stylingElement);

            var regionStyle = ttdoc.createElementNS(this.ttmlNamespaceURI, "style");
            regionStyle.setAttributeNS(this.xmlNamespaceURI, "xml:id", "bottomMidStyle");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textAlign", "center");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textOutline", "#000000ff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:color", "#ffffffff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:origin", "20% 58%");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:extent", "60% 18%");
            this.stylingElement.appendChild(regionStyle);

            var layout = ttdoc.createElementNS(this.ttmlNamespaceURI, "layout");
            head.appendChild(layout);
            var region = ttdoc.createElementNS(this.ttmlNamespaceURI, "region");

            return '<?xml version="1.0" encoding="utf-8"?>' + (new XMLSerializer()).serializeToString(ttdoc);
        };
        return SDPUSWriter;
    })();
    SamiTS.SDPUSWriter = SDPUSWriter;
})(SamiTS || (SamiTS = {}));
