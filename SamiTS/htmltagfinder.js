"use strict";
var SamiTS;
(function (SamiTS) {
    var HTMLTagFinder = (function () {
        function HTMLTagFinder() {
        }
        HTMLTagFinder.FindTags = function (tagname, entirestr) {
            var list = [];
            var position = 0;
            var startPosition = 0;
            while (true) {
                position = this.indexOfInsensitive(entirestr, '<' + tagname, position);
                if (position != -1) {
                    startPosition = position;
                    position += 5;
                    if (this.charCompare(entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F')) {
                        var xe = document.createElement(tagname);
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

        HTMLTagFinder.getAttribute = function (entirestr, position) {
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

        HTMLTagFinder.indexOfInsensitive = function (target, searchString, position) {
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
//# sourceMappingURL=htmltagfinder.js.map
