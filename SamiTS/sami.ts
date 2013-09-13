"use strict";

declare var saveAs: (data: Blob, filename: string) => {}

enum SubType {
    SRT, WebVTT
}

(function () {
    var subtypechecks: NodeList;
    var tagusecheck: Node;
    var file: File;
    var xsyncs: HTMLElement[];
    document.addEventListener("DOMContentLoaded", () => {
        subtypechecks = document.getElementsByName("subtype");
        tagusecheck = document.getElementById("taguse");
        (<HTMLInputElement>document.getElementById("loader")).onchange = (ev: Event) => {
            var reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    xsyncs = SamiTS.SamiParser.Parse(<string>ev.target.result);
                }
                catch (e) {
                    return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
                }
                (<HTMLTextAreaElement>document.getElementById("output")).value = convert(xsyncs);
            }
            file = (<HTMLInputElement>ev.target).files[0];
            if (getFileExtension(file) === "smi")
                reader.readAsText((<HTMLInputElement>ev.target).files[0]);
            else
                alert("파일 형식이 .smi가 아닙니다.");
        };

        (<HTMLButtonElement>document.getElementById("downloader")).onclick = () => {
            if (xsyncs) {
                var blob = new Blob([(<HTMLTextAreaElement>document.getElementById("output")).value], { type: "text/plain", endings: "transparent" });
                saveAs(blob, getFileDisplayName((<HTMLInputElement>document.getElementById("loader")).files[0]) + getExtensionForSubType());
            }
        };
        (<HTMLInputElement>subtypechecks[0]).onclick
        = (<HTMLInputElement>subtypechecks[1]).onclick
        = (<HTMLInputElement>tagusecheck).onclick
            = (ev: MouseEvent) => {
                if (xsyncs)
                    (<HTMLTextAreaElement>document.getElementById("output")).value = convert(xsyncs);
            };
    });

    function convert(xsyncs: HTMLElement[]) {
        var subtype = getTargetSubType();
        var taguse = getTagUse();
        if (subtype == SubType.SRT)
            return SamiTS.SubRipWriter.write(xsyncs, taguse);
        else if (subtype == SubType.WebVTT)
            return SamiTS.WebVTTWriter.write(xsyncs);
    }

    function getExtensionForSubType() {
        var subtype = getTargetSubType();
        if (subtype == SubType.SRT)
            return ".srt";
        else if (subtype == SubType.WebVTT)
            return ".vtt";
    }

    function getTargetSubType() {
        if ((<HTMLInputElement>subtypechecks[0]).checked)
            return SubType.SRT;
        else if ((<HTMLInputElement>subtypechecks[1]).checked)
            return SubType.WebVTT;
    }

    function getTagUse() {
        return ((<HTMLInputElement>tagusecheck).checked);
    }

    function getFileExtension(file: File) {
        var splitted = file.name.split('.');
        return splitted[splitted.length - 1].toLowerCase();
    }

    function getFileDisplayName(file: File) {
        var splitted = file.name.split('.');
        splitted = splitted.slice(0, splitted.length - 1);
        return splitted.join('.');
    }
})();