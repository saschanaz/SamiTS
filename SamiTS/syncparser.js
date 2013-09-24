"use strict";
var SamiTS;
(function (SamiTS) {
    var SamiParser = (function () {
        function SamiParser() {
        }
        SamiParser.Parse = function (samiDocument) {
            var bodyendindex = this.lastIndexOfInsensitive(samiDocument, "</body>");
            var syncs = SamiTS.HTMLTagFinder.FindStartTags('sync', samiDocument);
            for (var i = 0; i < syncs.length - 1; i++)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, syncs[i + 1].startPosition);
            if (i > 0)
                syncs[i].element.innerHTML = syncs[i].element.dataset['originalstring'] = samiDocument.slice(syncs[i].endPosition, bodyendindex);
            var syncElements = [];
            syncs.forEach(function (sync) {
                syncElements.push(sync.element);
            });
            return syncElements;
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
