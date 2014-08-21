﻿///<reference path="../sami.d.ts" />
///<reference path="../submodules/es6-promises.d.ts" />

/*
This file is excluded from VS project to prevent inclusion in sami.js.
This should be compiled on command line.
*/

// HTML
declare var taguse: HTMLInputElement;
declare var areaselector: HTMLButtonElement;
declare var previewarea: HTMLDivElement;
declare var player: HTMLVideoElement;
declare var output: HTMLTextAreaElement;

// Main
"use strict";
declare var saveAs: (data: Blob, filename: string) => void;

var subtypechecks: NodeList;
var track: HTMLTrackElement;
var style: HTMLStyleElement;
var isPreviewAreaShown = false;
var subtitleFileDisplayName: string;
document.addEventListener("DOMContentLoaded", () => {
    subtypechecks = document.getElementsByName("subtype");
});

enum SubType {
    WebVTT, SRT
}

function load(evt: Event) {
    var files = (<HTMLInputElement>evt.target).files;
    var videofile: File;
    var subfile: File;
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
    
    var sequence: Promise<SamiTS.SamiTSResult>;
    switch (getTargetSubType()) {
        case SubType.WebVTT:
            sequence = SamiTS.createWebVTT(subfile, { createStyleElement: true });
        case SubType.SRT:
            sequence = SamiTS.createSubrip(subfile, { useTextStyles: getTagUse() });
    }
    return sequence.then((result) => resultOutput(videofile, result));
}

var resultOutput = (videoFile: Blob, result: SamiTS.SamiTSResult) => {
    hidePreviewArea();
    hidePlayer();
    hideAreaSelector();
    output.value = result.subtitle;
    if (track) {
        player.removeChild(track); (<HTMLButtonElement>document.getElementById("areaselector"))
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
    }
    else
        showPreviewArea();

    loadStyle(result.stylesheet);
};

var loadStyle = (stylesheet: HTMLStyleElement) => {
    if (style)
        document.head.removeChild(style);
    style = stylesheet;
    document.head.appendChild(stylesheet);
};

function selectArea() {
    if (isPreviewAreaShown) {
        hidePreviewArea();
        showPlayer();
    }
    else {
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
        case SubType.WebVTT:
            return ".vtt";
        case SubType.SRT:
            return ".srt";
    }
}

function getMIMETypeForSubType() {
    switch (getTargetSubType()) {
        case SubType.WebVTT:
            return "text/vtt";
        case SubType.SRT:
            return "text/plain";
    }
}

function getTargetSubType() {
    if ((<HTMLInputElement>subtypechecks[0]).checked)
        return SubType.WebVTT;
    else if ((<HTMLInputElement>subtypechecks[1]).checked)
        return SubType.SRT;
}

function getTagUse() {
    return taguse.checked;
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