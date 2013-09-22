module SamiTS {
    export enum SubType {
        WebVTT, SRT
    }

    export function convertFromString(samiString: string, targetSubType: SubType, useTextStyles: boolean) {
        var xsyncs = SamiParser.Parse(samiString);
        switch (targetSubType) {
            case SubType.WebVTT:
                return (new SamiTS.WebVTTWriter()).write(xsyncs);
            case SubType.SRT:
                return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
        }
    }

    export function convertFromFile(samiFile: File, targetSubType: SubType, useTextStyles: boolean, read: (convertedString: string) => any) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            read(convertFromString(<string>ev.target.result, targetSubType, useTextStyles));
        }
        reader.readAsText(samiFile);
    }
}