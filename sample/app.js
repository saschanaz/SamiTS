///<reference path="../sami.d.ts" />
///<reference path="../submodules/es6-promises.d.ts" />

// Main
"use strict";

var subtypechecks;
var track;
var style;
var isPreviewAreaShown = false;
var subtitleFileDisplayName;
document.addEventListener("DOMContentLoaded", function () {
    subtypechecks = document.getElementsByName("subtype");
});

var SubType;
(function (SubType) {
    SubType[SubType["WebVTT"] = 0] = "WebVTT";
    SubType[SubType["SRT"] = 1] = "SRT";
})(SubType || (SubType = {}));

function load(evt) {
    var files = evt.target.files;
    var videofile;
    var subfile;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!videofile && player.canPlayType(file.type))
            videofile = file;
        else if (!subfile && getFileExtension(file) === "smi")
            subfile = file;
        if (videofile && subfile)
            break;
    }
    if (!subfile)
        return;

    subtitleFileDisplayName = getFileDisplayName(subfile);

    var sequence;
    switch (getTargetSubType()) {
        case 0 /* WebVTT */:
            sequence = SamiTS.createWebVTT(subfile, { createStyleElement: true });
        case 1 /* SRT */:
            sequence = SamiTS.createSubrip(subfile, { useTextStyles: getTagUse() });
    }
    return sequence.then(function (result) {
        return resultOutput(videofile, result);
    });
}

var resultOutput = function (videoFile, result) {
    hidePreviewArea();
    hidePlayer();
    hideAreaSelector();
    output.value = result.subtitle;
    if (track) {
        player.removeChild(track);
        document.getElementById("areaselector");
        player.src = '';
    }
    if (videoFile) {
        player.src = URL.createObjectURL(videoFile);
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

    loadStyle(result.stylesheet);
};

var loadStyle = function (stylesheet) {
    if (style)
        document.head.removeChild(style);
    style = stylesheet;
    document.head.appendChild(stylesheet);
};

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
        case 0 /* WebVTT */:
            return ".vtt";
        case 1 /* SRT */:
            return ".srt";
    }
}

function getMIMETypeForSubType() {
    switch (getTargetSubType()) {
        case 0 /* WebVTT */:
            return "text/vtt";
        case 1 /* SRT */:
            return "text/plain";
    }
}

function getTargetSubType() {
    if (subtypechecks[0].checked)
        return 0 /* WebVTT */;
    else if (subtypechecks[1].checked)
        return 1 /* SRT */;
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
