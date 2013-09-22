"use strict";
var subtypechecks;

var track;
var isPreviewAreaShown = false;
var subtitleFileDisplayName;
document.addEventListener("DOMContentLoaded", function () {
    subtypechecks = document.getElementsByName("subtype");
});

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

    subtitleFileDisplayName = getFileDisplayName(subfile);
    SamiTS.convertFromFile(subfile, getTargetSubType(), getTagUse(), function (result) {
        hidePreviewArea();
        hidePlayer();
        hideAreaSelector();
        output.value = result;
        if (track) {
            player.removeChild(track);
            (document.getElementById("areaselector"));
            player.src = '';
        }
        if (videofile) {
            player.src = URL.createObjectURL(videofile);
            track = document.createElement("track");
            track.label = "日本語";
            track.kind = "subtitles";
            track.srclang = "ja";
            track.src = URL.createObjectURL(new Blob([result], { type: "text/vtt" }));
            track.default = true;
            player.appendChild(track);
            showAreaSelector();
            showPlayer();
        } else
            showPreviewArea();
    });
}

function selectArea() {
    if (isPreviewAreaShown) {
        hidePreviewArea();
        showPlayer();
    } else {
        hidePlayer();
        showPreviewArea();
    }
}

function showAreaSelector() {
    areaselector.style.display = "inline-block";
}
function hideAreaSelector() {
    areaselector.style.display = "none";
}
function showPreviewArea() {
    previewarea.style.display = "inline-block";
    isPreviewAreaShown = true;
    areaselector.value = "Play";
}
function hidePreviewArea() {
    previewarea.style.display = "none";
    isPreviewAreaShown = false;
}
function showPlayer() {
    player.style.display = "inline-block";
    areaselector.value = "Preview";
}
function hidePlayer() {
    player.style.display = "none";
}

function download() {
    var blob = new Blob([output.value], { type: getMIMETypeForSubType(), endings: "transparent" });
    saveAs(blob, subtitleFileDisplayName + getExtensionForSubType());
}

function getExtensionForSubType() {
    switch (getTargetSubType()) {
        case SamiTS.SubType.WebVTT:
            return ".vtt";
        case SamiTS.SubType.SRT:
            return ".srt";
    }
}

function getMIMETypeForSubType() {
    switch (getTargetSubType()) {
        case SamiTS.SubType.WebVTT:
            return "text/vtt";
        case SamiTS.SubType.SRT:
            return "text/plain";
    }
}

function getTargetSubType() {
    if ((subtypechecks[0]).checked)
        return SamiTS.SubType.WebVTT;
else if ((subtypechecks[1]).checked)
        return SamiTS.SubType.SRT;
}

function getTagUse() {
    return taguse.checked;
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
//# sourceMappingURL=app.js.map
