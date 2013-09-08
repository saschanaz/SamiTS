var SamiTS;
(function (SamiTS) {
    var WebVTTWriter = (function () {
        function WebVTTWriter() {
        }
        WebVTTWriter.write = function (xsyncs) {
            var _this = this;
            var subDocument = "WEBVTT\r\n\r\n";
            var write = function (i, text) {
                subDocument += _this.getWebVTTTime(parseInt(xsyncs[i].getAttribute("start"))) + " --> " + _this.getWebVTTTime(parseInt(xsyncs[i + 1].getAttribute("start")));
                subDocument += "\r\n" + text;
            };
            var text;
            var syncindex = 0;
            if (xsyncs.length > 0) {
                text = xsyncs[0].innerText.trim();
                if (text.length > 0)
                    write(0, text);
                for (var i = 1; i < xsyncs.length - 1; i++) {
                    text = xsyncs[i].innerText.trim();
                    if (text.length > 0) {
                        subDocument += "\r\n\r\n";
                        write(i, text);
                    }
                }
            }
            return subDocument;
        };

        WebVTTWriter.getWebVTTTime = function (ms) {
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
        return WebVTTWriter;
    })();
    SamiTS.WebVTTWriter = WebVTTWriter;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=webvttwriter.js.map
