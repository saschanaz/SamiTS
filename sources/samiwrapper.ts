module SamiTS {
    const enum NodeType {
        Element = 1,
        Text = 3
    }

    export interface TagReadResult {
        start: string;
        end: string;
        content: string;
        divides?: boolean;
        linebreak?: boolean;
    }

    export interface DOMReadOptionBag {
        preventEmptyLine?: boolean;
    }
    
    export class SAMICue {
        syncElement: SAMISyncElement;
        constructor(syncElement: SAMISyncElement) {
            if (syncElement.tagName.toLowerCase() !== "sync")
                throw new Error("SamiCue can only accept sync element");
            else
                this.syncElement = syncElement;
        }

        filter(...languages: string[]) {
            // Dictionary initialization
            var cues: { [key: string]: SAMICue } = {};
            for (var i in languages)
                cues[languages[i]] = new SAMICue(<SAMISyncElement>this.syncElement.cloneNode());

            // Filter
            Array.prototype.forEach.call(this.syncElement.childNodes, (child: Node) => {
                var language: string;
                if (child.nodeType === NodeType.Element) {
                    language = (<SAMIContentElement>child).dataset.language;
                    if (languages.indexOf(language) >= 0) {
                        cues[language].syncElement.appendChild(child.cloneNode(true));
                        return;
                    }
                }

                // Nodes with no language code, including text nodes
                // Add them to all cue objects
                if (!language)
                    for (let language in cues)
                        cues[language].syncElement.appendChild(child.cloneNode(true));
            });
            return cues;
        }

        readDOM<OptionBag extends DOMReadOptionBag>(readElement: (element: Element, options: OptionBag) => TagReadResult, options = <OptionBag>{}) {
            var stack: TagReadResult[] = [];
            var walker = document.createTreeWalker(this.syncElement, -1, null, false);
            let isBlankNewLine = true;
            while (true) {
                if (walker.currentNode.nodeType === NodeType.Element) {
                    var element = readElement(<Element>walker.currentNode, options);
                    stack.unshift(element);
                    
                    // Read children if there are and if readElement understands current node
                    if (element && walker.firstChild())
                        continue;
                }
                else
                    stack.unshift({ start: '', end: '', content: walker.currentNode.nodeValue });

                do {
                    var zero = stack.shift();

                    if (!stack.length)
                        return util.manageLastLine(zero.content, options.preventEmptyLine);

                    if (zero) {
                        let isEffectiveDivider = zero.linebreak || (zero.divides && stack[0].content);
                        if (isEffectiveDivider) {
                            // Ending space in a line should be removed
                            stack[0].content = util.manageLastLine(util.absorbSpaceEnding(stack[0].content), options.preventEmptyLine) + "\r\n";
                            isBlankNewLine = true;
                        }

                        if (zero.content) {
                            let content = zero.start + zero.content + zero.end;
                            // Starting space in a line should be removed
                            if (isBlankNewLine && content[0] === ' ')
                                content = content.slice(1);
                            stack[0].content += content;
                            isBlankNewLine = false;
                        }
                    }

                    if (walker.nextSibling())
                        break;
                    else
                        walker.parentNode();
                } while (true)
            }
        }
    }
}