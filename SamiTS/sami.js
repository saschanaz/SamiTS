var SamiTS;
(function (SamiTS) {
    (function (SubType) {
        SubType[SubType["SRT"] = 0] = "SRT";
        SubType[SubType["WebVTT"] = 1] = "WebVTT";
    })(SamiTS.SubType || (SamiTS.SubType = {}));
    var SubType = SamiTS.SubType;

    function convertFromString(samiString, targetSubType, useTextStyles) {
        try  {
            var xsyncs = SamiTS.SamiParser.Parse(samiString);
            if (targetSubType == SubType.SRT)
                return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
else if (targetSubType == SubType.WebVTT)
                return (new SamiTS.WebVTTWriter()).write(xsyncs);
        } catch (e) {
            alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
        }
    }
    SamiTS.convertFromString = convertFromString;

    function convertFromFile(samiFile, targetSubType, useTextStyles, read) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            try  {
                read(convertFromString(ev.target.result, targetSubType, useTextStyles));
            } catch (e) {
                alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
            }
        };
        reader.readAsText(samiFile);
    }
    SamiTS.convertFromFile = convertFromFile;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=sami.js.map
