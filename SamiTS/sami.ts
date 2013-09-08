"use strict";

declare var saveAs: (data: Blob, filename: string) => {}

(function () {
    var subtypechecks: NodeList;
    var file: File;
    var xsyncs: HTMLElement[];
    document.addEventListener("DOMContentLoaded", () => {
        subtypechecks = document.getElementsByName("subtype");
        (<HTMLInputElement>document.getElementById("loader")).onchange = (ev: Event) => {
            var reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    xsyncs = SamiTS.SamiParser.Parse(<string>ev.target.result);
                }
                catch (e) {
                    return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
                }
                convert(xsyncs);
            }
            file = (<HTMLInputElement>ev.target).files[0];
            if (getFileExtension(file) === "smi")
                reader.readAsText((<HTMLInputElement>ev.target).files[0]);
            else
                alert("파일 형식이 .smi가 아닙니다.");
        };

        (<HTMLButtonElement>document.getElementById("downloader")).onclick = () => {
            var blob = new Blob([(<HTMLTextAreaElement>document.getElementById("output")).value], { type: "text/plain", endings: "transparent" });
            saveAs(blob, getFileDisplayName((<HTMLInputElement>document.getElementById("loader")).files[0]) + ".srt");
        };
        (<HTMLInputElement>subtypechecks[0]).onclick
            = (<HTMLInputElement>subtypechecks[1]).onclick
            = (ev: MouseEvent) => {
                if (xsyncs)
                    convert(xsyncs);
            };
    });

    function convert(xsyncs: HTMLElement[]) {
        if ((<HTMLInputElement>subtypechecks[0]).checked)
            (<HTMLTextAreaElement>document.getElementById("output")).value = SamiTS.SubRipWriter.write(xsyncs);
        else if ((<HTMLInputElement>subtypechecks[1]).checked)
            (<HTMLTextAreaElement>document.getElementById("output")).value = SamiTS.WebVTTWriter.write(xsyncs);
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