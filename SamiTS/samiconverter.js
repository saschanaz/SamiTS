///<reference path='syncparser.ts' />
///<reference path='webvttwriter.ts' />
///<reference path='subripwriter.ts' />
var SamiTS;
(function (SamiTS) {
    function convertToWebVTTFromString(samiString, styleOutput) {
        if (typeof styleOutput === "undefined") { styleOutput = null; }
        var xsyncs = SamiTS.SamiParser.Parse(samiString);
        return (new SamiTS.WebVTTWriter()).write(xsyncs, styleOutput);
    }
    SamiTS.convertToWebVTTFromString = convertToWebVTTFromString;

    function convertToSubRipFromString(samiString, useTextStyles) {
        var xsyncs = SamiTS.SamiParser.Parse(samiString);
        return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
    }
    SamiTS.convertToSubRipFromString = convertToSubRipFromString;

    function convertToWebVTTFromFile(samiFile, read, styleOutput) {
        if (typeof styleOutput === "undefined") { styleOutput = null; }
        var reader = new FileReader();
        reader.onload = function (ev) {
            read(convertToWebVTTFromString(ev.target.result, styleOutput));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToWebVTTFromFile = convertToWebVTTFromFile;

    function convertToSubRipFromFile(samiFile, read, useTextStyles) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            read(convertToSubRipFromString(ev.target.result, useTextStyles));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertToSubRipFromFile = convertToSubRipFromFile;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=samiconverter.js.map
