///<reference path='syncparser.ts' />
///<reference path='webvttwriter.ts' />
///<reference path='subripwriter.ts' />
module SamiTS {
    export function convertToWebVTTFromString(samiString: string, styleOutput: (style: HTMLStyleElement) => void = null) {
        var xsyncs = SamiParser.Parse(samiString);
        return (new SamiTS.WebVTTWriter()).write(xsyncs, styleOutput);
    }

    export function convertToSubRipFromString(samiString: string, useTextStyles: boolean) {
        var xsyncs = SamiParser.Parse(samiString);
        return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
    }

    export function convertToWebVTTFromFile(samiFile: File, read: (convertedString: string) => any, styleOutput: (style: HTMLStyleElement) => void = null) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            read(convertToWebVTTFromString(<string>ev.target.result, styleOutput));
        }
        reader.readAsText(samiFile);
    }

    export function convertToSubRipFromFile(samiFile: File, read: (convertedString: string) => any, useTextStyles: boolean) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            read(convertToSubRipFromString(<string>ev.target.result, useTextStyles));
        }
        reader.readAsText(samiFile);
    }

    //export function convertFromString(samiString: string, targetSubType: SubType, useTextStyles: boolean) {
    //    var xsyncs = SamiParser.Parse(samiString);
    //    switch (targetSubType) {
    //        case SubType.WebVTT:
    //            return (new SamiTS.WebVTTWriter()).write(xsyncs);
    //        case SubType.SRT:
    //            return (new SamiTS.SubRipWriter()).write(xsyncs, useTextStyles);
    //    }
    //}

    //export function convertFromFile(samiFile: File, targetSubType: SubType, useTextStyles: boolean, read: (convertedString: string) => any) {
    //    var reader = new FileReader();
    //    reader.onload = (ev: any) => {
    //        read(convertFromString(<string>ev.target.result, targetSubType, useTextStyles));
    //    }
    //    reader.readAsText(samiFile);
    //}
}