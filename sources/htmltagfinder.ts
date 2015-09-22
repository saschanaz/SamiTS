"use strict";

module SamiTS {
    export interface FoundHTMLTag {
        element: HTMLElement;
        startPosition: number;
        endPosition: number;
    }

    export class HTMLTagFinder {
        static FindStartTag(tagname: string, entirestr: string): FoundHTMLTag {
            let tag: FoundHTMLTag;
            let position = 0;
            let startPosition = 0;
            while (!tag) {
                position = this.searchWithIndex(entirestr, new RegExp('<' + tagname, 'i'), position);
                if (position !== -1) {
                    startPosition = position;
                    position += tagname.length + 1;
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            tag = { element: xe, startPosition, endPosition: position };
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }

            return tag;
        }

        static FindStartTags(tagname: string, entirestr: string): FoundHTMLTag[] {
            let list: FoundHTMLTag[] = [];
            let position = 0;
            let startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, new RegExp('<' + tagname, 'i'), position);
                if (position != -1) {
                    startPosition = position;
                    position += tagname.length + 1;
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition, endPosition: position });
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }

            return list;
        }

        static FindAllStartTags(entirestr: string): FoundHTMLTag[] {
            let list: FoundHTMLTag[] = [];
            let position = 0;
            let startPosition = 0;
            while (true) {
                position = this.searchWithIndex(entirestr, /<\w+/, position);
                if (position != -1) {
                    startPosition = position;
                    position++;
                    let tagname = '';
                    while ((<string>entirestr[position]).search(/[A-z]/) === 0) {
                        tagname += entirestr[position];
                        position++;
                    }
                    let xe = document.createElement(tagname);
                    while (true) {
                        let attrAndPos = this.getAttribute(entirestr, position);
                        position = attrAndPos.nextPosition;
                        if (attrAndPos.attributeName === null) {
                            position++;
                            list.push({ element: xe, startPosition, endPosition: position });
                            break;
                        }
                        else if (xe.getAttribute(attrAndPos.attributeName) !== null)
                            continue;
                        xe.setAttribute(attrAndPos.attributeName, attrAndPos.attributeValue);
                    }
                }
                else
                    break;
            }

            return list;
            //return [];//RegExp로 모든 start tag의 시작부를 찾아낼 수 있다. /<\/?\w+/g
        }

        private static getAttribute(entirestr: string, position: number): { attributeName: string; attributeValue: string; nextPosition: number; } {
            while (true) {
                if (this.charCompare(<string>entirestr[position], '\u0009', '\u000A', '\u000C', '\u000D', '\u0020', '\u002F'))
                    position++;
                else
                    break;
            }
            if (<string>entirestr[position] == '>')
                return { attributeName: null, attributeValue: null, nextPosition: position };
            else {
                let namestr = '';
                let valuestr = '';

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
                        let b = <string>entirestr[position];
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
                        return { attributeName: null, attributeValue: null, nextPosition: position };
                    else
                        return { attributeName: namestr, attributeValue: valuestr, nextPosition: position };
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

        private static searchWithIndex(target: string, query: RegExp, position = 0) {
            if (target.length > position) {
                let found = target.slice(position).search(query);
                return found != -1 ? position + found : -1;
            }
            else
                return -1;
        }

        private static charCompare(a: string, ...b: string[]) {
            for (let item of b) {
                if (a === item)
                    return true;
            }
            return false;
        }
    }
}