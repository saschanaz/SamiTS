var SamiTS;
(function (SamiTS) {
    (function (SubType) {
        SubType[SubType["SRT"] = 0] = "SRT";
        SubType[SubType["WebVTT"] = 1] = "WebVTT";
    })(SamiTS.SubType || (SamiTS.SubType = {}));
    var SubType = SamiTS.SubType;

    function convert(samiString, target) {
        try  {
            var xsyncs = SamiTS.SamiParser.Parse(samiString);
        } catch (e) {
            return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
        }
    }
    SamiTS.convert = convert;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=app.js.map
