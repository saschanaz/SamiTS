"use strict";
document.addEventListener("DOMContentLoaded", function () {
    (document.getElementById("loader")).onchange = function (ev) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            try  {
                var xsyncs = SamiParser.Parse(ev.target.result);
            } catch (e) {
                return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
            }

            var srtDocument = "";
            var write = function (i, text) {
                srtDocument += i.toString();
                srtDocument += "\r\n" + getSubRipTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + getSubRipTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                srtDocument += "\r\n" + text;
            };
            var text;
            var syncindex = 0;
            if (xsyncs.length > 0) {
                text = xsyncs[0].innerText.trim();
                if (text.length > 0)
                    write(syncindex, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = xsyncs[i].innerText.trim();
                    if (text.length > 0) {
                        srtDocument += "\r\n\r\n";
                        syncindex++;
                        write(syncindex, text);
                    }
                }
            }
            (document.getElementById("output")).value = srtDocument;
        };
        var file = (ev.target).files[0];
        if (getFileExtension(file) === "smi")
            reader.readAsText((ev.target).files[0]);
else
            alert("파일 형식이 .smi가 아닙니다.");
    };

    (document.getElementById("downloader")).onclick = function () {
        var blob = new Blob([(document.getElementById("output")).value], { type: "text/plain", endings: "transparent" });
        saveAs(blob, getFileDisplayName((document.getElementById("loader")).files[0]) + ".srt");
    };
});

function getFileExtension(file) {
    var splitted = file.name.split('.');
    return splitted[splitted.length - 1].toLowerCase();
}

function getFileDisplayName(file) {
    var splitted = file.name.split('.');
    splitted = splitted.slice(0, splitted.length - 1);
    return splitted.join('.');
}

function getSubRipTime(ms) {
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
}

var SamiParser = (function () {
    function SamiParser() {
    }
    SamiParser.Parse = function (samiDocument) {
        var bodyendindex = this.lastIndexOfInsensitive(samiDocument, "</body>");
        var syncs = this.parseSyncs(samiDocument);
        for (var i = 0; i < syncs.length - 1; i++)
            syncs[i].element.innerHTML = samiDocument.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
        if (i > 0)
            syncs[i].element.innerHTML = samiDocument.slice(syncs[i].endPosition, bodyendindex);
        var syncElements = [];
        syncs.forEach(function (sync) {
            syncElements.push(sync.element);
        });
        return syncElements;
    };

    SamiParser.parseSyncs = function (entirestr) {
        var list = [];
        var position = 0;
        var startPosition = 0;
        while (true) {
            position = this.indexOfInsensitive(entirestr, "<sync", position);
            if (position != -1) {
                startPosition = position;
                position += 5;
                if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F')) {
                    var xe = document.createElement("sync");
                    while (true) {
                        var attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attribute === null) {
                            position++;
                            list.push({ element: xe, startPosition: startPosition, endPosition: position });
                            break;
                        } else if (xe.getAttribute(attrAndPos.attribute.nodeName) !== null)
                            continue;
                        xe.setAttributeNode(attrAndPos.attribute);
                    }
                }
            } else
                break;
        }

        return list;
    };

    SamiParser.getAttribute = function (entirestr, position) {
        var _this = this;
        while (true) {
            if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F'))
                position++;
else
                break;
        }
        if (entirestr[position] == '>')
            return { attribute: null, nextPosition: position };
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
                    return { attribute: null, nextPosition: position };
else
                    try  {
                        var attr = document.createAttribute(namestr);
                        attr.nodeValue = valuestr;
                        return { attribute: attr, nextPosition: position };
                    } catch (e) {
                        return { attribute: null, nextPosition: position };
                    }
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

    SamiParser.indexOfInsensitive = function (target, searchString, position) {
        if (typeof position === "undefined") { position = 0; }
        if (!searchString)
            return -1;
else if (searchString.length == 0)
            return 0;
        var lowersearch = searchString.toLowerCase();
        for (var i = position; i < target.length - searchString.length + 1; i++) {
            if ((target[i]).toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                return i;
        }
        return -1;
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

    SamiParser.charCompare = function (a) {
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
    return SamiParser;
})();
//# sourceMappingURL=sami.js.map
