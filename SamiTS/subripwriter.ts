module SamiTS {
    export class SubRipWriter {
        static write(xsyncs: HTMLElement[]) {
            var subDocument = "";
            var write = (i: number, syncindex: number, text: string) => {
                subDocument += syncindex.toString();
                subDocument += "\r\n" + this.getSubRipTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + this.getSubRipTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text: string;
            var syncindex = 1;
            if (xsyncs.length > 0) {
                text = xsyncs[0].innerText.trim();
                if (text.length > 0) write(0, syncindex, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = xsyncs[i].innerText.trim();
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        syncindex++;
                        write(i, syncindex, text);
                    }
                }
            }
            return subDocument;
        }

        private static getSubRipTime(ms: number) {
            var hour = (ms - ms % 3600000) / 3600000;
            ms -= hour * 3600000;
            var min = (ms - ms % 60000) / 60000;
            ms -= min * 60000;
            var sec = (ms - ms % 1000) / 1000;
            ms -= sec * 1000;
            var hourstr = hour.toString();
            if (hourstr.length < 2) hourstr = '0' + hourstr;
            var minstr = min.toString();
            if (minstr.length < 2) minstr = '0' + minstr;
            var secstr = sec.toString();
            if (secstr.length < 2) secstr = '0' + secstr;
            var msstr = ms.toString();
            while (msstr.length < 3) msstr = '0' + msstr;
            return hourstr + ':' + minstr + ':' + secstr + ',' + msstr;
        }
    }
}