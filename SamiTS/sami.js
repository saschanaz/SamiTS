"use strict";
(function () {
    var subtypechecks;
    var file;
    var xsyncs;
    document.addEventListener("DOMContentLoaded", function () {
        subtypechecks = document.getElementsByName("subtype");
        (document.getElementById("loader")).onchange = function (ev) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                try  {
                    xsyncs = SamiTS.SamiParser.Parse(ev.target.result);
                } catch (e) {
                    return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
                }
                convert(xsyncs);
            };
            file = (ev.target).files[0];
            if (getFileExtension(file) === "smi")
                reader.readAsText((ev.target).files[0]);
else
                alert("파일 형식이 .smi가 아닙니다.");
        };

        (document.getElementById("downloader")).onclick = function () {
            var blob = new Blob([(document.getElementById("output")).value], { type: "text/plain", endings: "transparent" });
            saveAs(blob, getFileDisplayName((document.getElementById("loader")).files[0]) + ".srt");
        };
        (subtypechecks[0]).onclick = (subtypechecks[1]).onclick = function (ev) {
            if (xsyncs)
                convert(xsyncs);
        };
    });

    function convert(xsyncs) {
        if ((subtypechecks[0]).checked)
            (document.getElementById("output")).value = SamiTS.SubRipWriter.write(xsyncs);
else if ((subtypechecks[1]).checked)
            (document.getElementById("output")).value = SamiTS.WebVTTWriter.write(xsyncs);
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
