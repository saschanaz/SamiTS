"use strict";

module SamiTS {
    export class SamiParser {
        static Parse(samiDocument: string) {
            var bodyendindex = this.lastIndexOfInsensitive(samiDocument, "</body>");
            var syncs = this.parseSyncs(samiDocument);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, bodyendindex);
            var syncElements: HTMLElement[] = [];
            syncs.forEach((sync) => {
                syncElements.push(sync.element);
            });
            return syncElements;
        }

        private static parseSyncs(entirestr: string): { element: HTMLElement; startPosition: number; endPosition: number; }[] {
            var list: { element: HTMLElement; startPosition: number; endPosition: number; }[] = [];
            var position = 0;
            var startPosition = 0;
            while (true) {
                position = this.indexOfInsensitive(entirestr, "<sync", position);
                if (position != -1) {
                    startPosition = position;
                    position += 5;
                    if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F')) {
                        var xe = document.createElement("sync");
                        while (true) {
                            var attrAndPos = this.getAttribute(entirestr, position);
                            position = attrAndPos.nextPosition;
                            if (attrAndPos.attribute === null) {
                                position++;
                                list.push({ element: xe, startPosition: startPosition, endPosition: position });
                                break;
                            }
                            else if (xe.getAttribute(attrAndPos.attribute.nodeName) !== null)
                                continue;
                            xe.setAttributeNode(attrAndPos.attribute);
                        }
                    }
                }
                else
                    break;
            }

            return list;
        }

        private static getAttribute(entirestr: string, position: number): { attribute: Attr; nextPosition: number; } {
            while (true) {
                if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F'))
                    position++;
                else
                    break;
            }
            if (<string>entirestr[position] == '>')
                return { attribute: null, nextPosition: position };
            else {
                var namestr = '';
                var valuestr = '';

                var spaceparse = () => {
                    while (true) {
                        if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                            position++;
                        else
                            break;
                    }
                    if (<string>entirestr[position] != '=')
                        return parsefinish();
                    else
                        while (<string>entirestr[position] != '=')
                            position++;
                    return valueparse();
                }
            var valueparse = () => {
                    while (true) {
                        if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                            position++;
                        else
                            break;
                    }
                    if (this.charCompare(<string>entirestr[position], '\'', '\"')) {
                        var b = <string>entirestr[position];
                        while (true) {
                            position++;
                            if (<string>entirestr[position] == b) {
                                position++;
                                return parsefinish();
                            }
                            else
                                valuestr += <string>entirestr[position];
                        }
                    }
                    else if (<string>entirestr[position] == '>')
                        return parsefinish();
                    else {
                        valuestr += <string>entirestr[position];
                        position++;
                    }

                    while (true) {
                        if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u003E'))
                            return parsefinish();
                        else
                            valuestr += entirestr[position];
                        position++;
                    }
                    return parsefinish();
                }
            var parsefinish = () => {
                    if (namestr.length === 0)
                        return { attribute: null, nextPosition: position };
                    else
                        try {
                            var attr = document.createAttribute(namestr);
                            attr.nodeValue = valuestr;
                            return { attribute: attr, nextPosition: position };
                        }
                        catch (e) {
                            return { attribute: null, nextPosition: position };
                        }
                }

            //attribute name parsing
            while (true) {
                    if (<string>entirestr[position] == '=') {
                        position++;
                        return valueparse();
                    }
                    else if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020'))
                        return spaceparse();
                    else if (this.charCompare(<string>entirestr[position], '/', '>'))
                        return parsefinish();
                    else if (entirestr[position] >= 'A' && entirestr[position] <= 'Z')
                        namestr += (<string>entirestr[position]).toLowerCase();
                    else
                        namestr += entirestr[position];
                    position++;
                }
            }
        }

        private static indexOfInsensitive(target: string, searchString: string, position = 0) {
            if (!searchString)
                return -1;
            else if (searchString.length == 0)
                return 0;
            var lowersearch = searchString.toLowerCase();
            for (var i = position; i < target.length - searchString.length + 1; i++) {
                if ((<string>target[i]).toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        }

        private static lastIndexOfInsensitive(target: string, searchString: string, position = target.length - searchString.length) {
            if (!searchString)
                return -1;
            else if (searchString.length == 0)
                return 0;
            var lowersearch = searchString.toLowerCase();
            for (var i = Math.min(target.length - searchString.length, position); i >= 0; i--) {
                if ((<string>target[i]).toLowerCase() == lowersearch[0] && (target.slice(i, i + searchString.length).toLowerCase() == lowersearch))
                    return i;
            }
            return -1;
        }

        private static charCompare(a: string, ...b: string[]) {
            for (var i = 0; i < b.length; i++) {
                if (a === b[i])
                    return true;
            }
            return false;
        }
    }
}