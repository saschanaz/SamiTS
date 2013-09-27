var SamiTS;
(function (SamiTS) {
    (function (SubType) {
        SubType[SubType["WebVTT"] = 0] = "WebVTT";
        SubType[SubType["SRT"] = 1] = "SRT";
    })(SamiTS.SubType || (SamiTS.SubType = {}));
    var SubType = SamiTS.SubType;

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

    function convertFromString(samiString, targetSubType, useTextStyles) {
        var xsyncs = SamiTS.SamiParser.Parse(samiString);
        switch (targetSubType) {
            case SubType.WebVTT:
                return (new SamiTS.WebVTTWriter()).write(xsyncs);
            case SubType.SRT:
                return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
        }
    }
    SamiTS.convertFromString = convertFromString;

    function convertFromFile(samiFile, targetSubType, useTextStyles, read) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            read(convertFromString(ev.target.result, targetSubType, useTextStyles));
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertFromFile = convertFromFile;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=sami.js.map
