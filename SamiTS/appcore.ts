module SamiTS {
    export enum SubType {
        SRT, WebVTT
    }

    export function convertFromString(samiString: string, targetSubType: SubType, useTextStyles: boolean) {
        try {
            var xsyncs = SamiParser.Parse(samiString);
            if (targetSubType == SubType.SRT)
                return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
            else if (targetSubType == SubType.WebVTT)
                return (new SamiTS.WebVTTWriter()).write(xsyncs);
        }
        catch (e) {
            return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
        }
    }

    //incomplete, howto?
    export function convertFromFile(samiFile: File, targetSubType: SubType, useTextStyles: boolean, onread: () => {}) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            try {
                return convertFromString(<string>ev.target.result, targetSubType, useTextStyles);
            }
            catch (e) {
                return alert("자막 파일을 읽는 중에 오류가 발생했습니다: " + e);
            }
        }
        reader.readAsText(samiFile);
    }
}