"use strict";

module SamiTS {
    export interface SubRipWriterOptions {
        useTextStyles?: boolean
    }

    export class SubRipWriter {
        write(xsyncs: SAMICue[], options: SubRipWriterOptions = {}) {
            let subDocument = "";
            let writeText = (i: number, syncindex: number, text: string) => {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + this.getSubRipTime(parseInt(xsyncs[i].syncElement.getAttribute("start"))) + " --> " + this.getSubRipTime(parseInt(xsyncs[i + 1].syncElement.getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            options = util.assign<any>(<DOMReadOptionBag>{ preventEmptyLine: true }, options);

            var text: string;
            if (xsyncs.length > 0) {
                let syncindex = 1;
                let readElement = (options.useTextStyles ? this.readElementRich : this.readElementSimple).bind(this);

                for (let i = 0; i < xsyncs.length - 1; i++) {
                    text = util.absorbAir(xsyncs[i].readDOM(readElement, options));
                    if (text.length > 0) {
                        if (syncindex > 1)
                            subDocument += "\r\n\r\n";
                        writeText(i, syncindex, text);
                        syncindex++;
                    }
                }
            }
            return <SamiTSResult>{ subtitle: subDocument };
        }

        private getSubRipTime(ms: number) {
            let hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            let min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            let sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            let hourstr = hour.toString();
            if (hourstr.length < 2) hourstr = '0' + hourstr;
            let minstr = min.toString();
            if (minstr.length < 2) minstr = '0' + minstr;
            let secstr = sec.toString();
            if (secstr.length < 2) secstr = '0' + secstr;
            let msstr = ms.toString();
            while (msstr.length < 3) msstr = '0' + msstr;
            return `${hourstr}:${minstr}:${secstr},${msstr}`;
        }

        private readElementSimple(element: SAMISyncElement) {
            let template = util.generateTagReadResultTemplate();
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
                    break;
            }
            return template;
        }

        private readElementRich(element: SAMISyncElement) {
            let template = util.generateTagReadResultTemplate();
            switch (element.tagName.toLowerCase()) {
                case "p":
                    template.divides = true;
                    break;
                case "br":
                    template.linebreak = true;
                    break;
                case "font":
                    let fontelement = document.createElement("font");
                    let color = element.getAttribute("color");
                    if (color) fontelement.setAttribute("color", color);
                    if (fontelement.attributes.length > 0) {
                        template.start = fontelement.outerHTML.slice(0, -7);
                        template.end = "</font>";
                    }
                    break;
                case "b":
                case "i":
                case "u":
                    let tagname = element.tagName.toLowerCase();
                    template.start = `<${tagname}>`;
                    template.end = `</${tagname}>`;
                    break;
            }
            return template;
        }
    }
}