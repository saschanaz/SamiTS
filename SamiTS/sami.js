var SamiTS;
(function (SamiTS) {
    (function (SubType) {
        SubType[SubType["WebVTT"] = 0] = "WebVTT";
        SubType[SubType["SRT"] = 1] = "SRT";
    })(SamiTS.SubType || (SamiTS.SubType = {}));
    var SubType = SamiTS.SubType;

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
