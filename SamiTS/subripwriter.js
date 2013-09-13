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
                if (node.nodeType === 1)
                    switch ((node).tagName.toLowerCase()) {
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
                            result += fontelement.outerHTML.replace("</font>", _this.getRichText(node) + "</font>");
                            break;
                        }
                        case "b":
                        case "i":
                        case "u": {
                            result += (node).outerHTML;
                            break;
                        }
                    }
else
                    result += node.nodeValue.replace(/[\r\n]/g, '').trim();
            });
            return result;
        };
        return SubRipWriter;
    })();
    SamiTS.SubRipWriter = SubRipWriter;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=subripwriter.js.map
