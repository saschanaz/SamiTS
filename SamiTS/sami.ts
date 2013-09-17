"use strict";

declare var saveAs: (data: Blob, filename: string) => {}

var subtypechecks: NodeList;
var tagusecheck: Node;
var player: HTMLVideoElement;
var track: HTMLTrackElement;
document.addEventListener("DOMContentLoaded", () => {
    subtypechecks = document.getElementsByName("subtype");
    tagusecheck = document.getElementById("taguse");
    player = <HTMLVideoElement>document.getElementById("playarea");
});

function readSubtitle(ev: Event) {
    var reader = new FileReader();
    reader.onload = (ev: any) => {
        try {
            return SamiTS.convert(<string>ev.target.result, getTargetSubType(), getTagUse());
        }
        catch (e) {
            return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
        }
    }
    //file = (<HTMLInputElement>ev.target).files[0];
    //if (getFileExtension(file) === "smi")
    //    reader.readAsText((<HTMLInputElement>ev.target).files[0]);
    //else
    //    alert("파일 형식이 .smi가 아닙니다.");
}

function load(evt: Event) {
    var files = (<HTMLInputElement>evt.target).files;
    var videofile: File;
    var subfile: File;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!videofile && getFileExtension(file) === "mp4")
            videofile = file;
        else if (!subfile && getFileExtension(file) === "smi")
            subfile = file;
        if (videofile && subfile)
            break;
    }
    if (!subfile)
        return;

    var result = readSubtitle();
    if (videofile) {
        if (track)
            player.removeChild(track);
        player.src = URL.createObjectURL(videofile);
        track = document.createElement("track");
        track.label = "日本語";
        track.kind = "subtitles";
        track.srclang = "ja";
        track.src = URL.createObjectURL(subfile);
        track.default = true;
        player.appendChild(track);
    }
    (<HTMLTextAreaElement>document.getElementById("output")).value = result;
}

function preview(result: string) {
    (<HTMLTextAreaElement>document.getElementById("output")).value = result;
}

function download() {
    var blob = new Blob([(<HTMLTextAreaElement>document.getElementById("previewarea")).value], { type: getMIMETypeForSubType(), endings: "transparent" });
    saveAs(blob, getFileDisplayName((<HTMLInputElement>document.getElementById("loader")).files[0]) + getExtensionForSubType());
}

function getExtensionForSubType() {
    var subtype = getTargetSubType();
    if (subtype == SamiTS.SubType.SRT)
        return ".srt";
    else if (subtype == SamiTS.SubType.WebVTT)
        return ".vtt";
}

function getMIMETypeForSubType() {
    var subtype = getTargetSubType();
    if (subtype == SamiTS.SubType.SRT)
        return "text/plain";
    else if (subtype == SamiTS.SubType.WebVTT)
        return "text/vtt";
}

function getTargetSubType() {
    if ((<HTMLInputElement>subtypechecks[0]).checked)
        return SamiTS.SubType.SRT;
    else if ((<HTMLInputElement>subtypechecks[1]).checked)
        return SamiTS.SubType.WebVTT;
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