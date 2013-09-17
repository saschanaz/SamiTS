"use strict";
var subtypechecks;
var tagusecheck;
var player;
var track;
document.addEventListener("DOMContentLoaded", function () {
    subtypechecks = document.getElementsByName("subtype");
    tagusecheck = document.getElementById("taguse");
    player = document.getElementById("playarea");
});

function readSubtitle(ev) {
    var reader = new FileReader();
    reader.onload = function (ev) {
        try  {
            return SamiTS.convert(ev.target.result, getTargetSubType(), getTagUse());
        } catch (e) {
            return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
        }
    };
    //file = (<HTMLInputElement>ev.target).files[0];
    //if (getFileExtension(file) === "smi")
    //    reader.readAsText((<HTMLInputElement>ev.target).files[0]);
    //else
    //    alert("파일 형식이 .smi가 아닙니다.");
}

function load(evt) {
    var files = (evt.target).files;
    var videofile;
    var subfile;
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
    (document.getElementById("output")).value = result;
}

function preview(result) {
    (document.getElementById("output")).value = result;
}

function download() {
    var blob = new Blob([(document.getElementById("previewarea")).value], { type: getMIMETypeForSubType(), endings: "transparent" });
    saveAs(blob, getFileDisplayName((document.getElementById("loader")).files[0]) + getExtensionForSubType());
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
    if ((subtypechecks[0]).checked)
        return SamiTS.SubType.SRT;
else if ((subtypechecks[1]).checked)
        return SamiTS.SubType.WebVTT;
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
//# sourceMappingURL=sami.js.map
