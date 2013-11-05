///<reference path='syncparser.ts' />
///<reference path='webvttwriter.ts' />
///<reference path='subripwriter.ts' />
module SamiTS {
    export function convertToWebVTTFromString(samiString: string, options: { onstyleload: (style: HTMLStyleElement) => void } = null) {
        var samiDocument = SamiDocument.parse(samiString);
        return (new SamiTS.WebVTTWriter()).write(samiDocument.samiCues, options);
    }

    export function convertToSubRipFromString(samiString: string, options: { useTextStyles: boolean } = null) {
        var samiDocument = SamiDocument.parse(samiString);
        return (new SamiTS.SubRipWriter()).write(samiDocument.samiCues, options);
    }

    export function convertToWebVTTFromFile(samiFile: File, onread: (convertedString: string) => any, options: { onstyleload: (style: HTMLStyleElement) => void } = null) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            onread(convertToWebVTTFromString(<string>ev.target.result, options));
        }
        reader.readAsText(samiFile);
    }

    export function convertToSubRipFromFile(samiFile: File, onread: (convertedString: string) => any, options: { useTextStyles: boolean } = null) {
        var reader = new FileReader();
        reader.onload = (ev: any) => {
            onread(convertToSubRipFromString(<string>ev.target.result, options));
        }
        reader.readAsText(samiFile);
    }

    //export function convertToSubRip

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