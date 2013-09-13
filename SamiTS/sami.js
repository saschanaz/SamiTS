"use strict";
var SubType;
(function (SubType) {
    SubType[SubType["SRT"] = 0] = "SRT";
    SubType[SubType["WebVTT"] = 1] = "WebVTT";
})(SubType || (SubType = {}));

(function () {
    var subtypechecks;
    var tagusecheck;
    var file;
    var xsyncs;
    document.addEventListener("DOMContentLoaded", function () {
        subtypechecks = document.getElementsByName("subtype");
        tagusecheck = document.getElementById("taguse");
        (document.getElementById("loader")).onchange = function (ev) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                try  {
                    xsyncs = SamiTS.SamiParser.Parse(ev.target.result);
                } catch (e) {
                    return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
                }
                (document.getElementById("output")).value = convert(xsyncs);
            };
            file = (ev.target).files[0];
            if (getFileExtension(file) === "smi")
                reader.readAsText((ev.target).files[0]);
else
                alert("파일 형식이 .smi가 아닙니다.");
        };

        (document.getElementById("downloader")).onclick = function () {
            if (xsyncs) {
                var blob = new Blob([(document.getElementById("output")).value], { type: "text/plain", endings: "transparent" });
                saveAs(blob, getFileDisplayName((document.getElementById("loader")).files[0]) + getExtensionForSubType());
            }
        };
        (subtypechecks[0]).onclick = (subtypechecks[1]).onclick = (tagusecheck).onclick = function (ev) {
            if (xsyncs)
                (document.getElementById("output")).value = convert(xsyncs);
        };
    });

    function convert(xsyncs) {
        var subtype = getTargetSubType();
        var taguse = getTagUse();
        if (subtype == SubType.SRT)
            return (new SamiTS.SubRipWriter()).write(xsyncs, taguse);
else if (subtype == SubType.WebVTT)
            return (new SamiTS.WebVTTWriter()).write(xsyncs);
    }

    function getExtensionForSubType() {
        var subtype = getTargetSubType();
        if (subtype == SubType.SRT)
            return ".srt";
else if (subtype == SubType.WebVTT)
            return ".vtt";
    }

    function getTargetSubType() {
        if ((subtypechecks[0]).checked)
            return SubType.SRT;
else if ((subtypechecks[1]).checked)
            return SubType.WebVTT;
    }

    function getTagUse() {
        return ((tagusecheck).checked);
    }

    function getFileExtension(file) {
        var splitted = file.name.split('.');
        return splitted[splitted.length - 1].toLowerCase();
    }

    function getFileDisplayName(file) {
        var splitted = file.name.split('.');
        splitted = splitted.slice(0, splitted.length - 1);
        return splitted.join('.');
    }
})();
//# sourceMappingURL=sami.js.map
