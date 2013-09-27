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
                syncElements.push(_this.correctRubyNodes(sync.element));
            });
            return syncElements;
        };

        SamiParser.correctRubyNodes = function (syncobject) {
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

                return fontdeleted;
            } else
                return syncobject;
        };

        SamiParser.wrapWith = function (targetNode, newParentNode) {
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
            var newsync = syncobject.cloneNode(true);
            var newsyncstr = syncobject.dataset['originalstring'];
            SamiTS.HTMLTagFinder.FindStartTags('font', newsyncstr).reverse().forEach(function (fonttag) {
                newsyncstr = newsyncstr.slice(0, fonttag.startPosition) + "<temp />" + newsyncstr.slice(fonttag.endPosition);
            });
            newsync.innerHTML = newsyncstr.replace(/<\/font>/g, '');
            return newsync;
        };

        SamiParser.extractFontAndText = function (syncobject) {
            var newsync = syncobject.cloneNode(true);
            var newsyncstr = syncobject.dataset['originalstring'];
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
//# sourceMappingURL=syncparser.js.map
