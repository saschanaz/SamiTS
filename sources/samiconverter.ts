///<reference path='syncparser.ts' />
///<reference path='webvttwriter.ts' />
///<reference path='subripwriter.ts' />
module SamiTS {
    export interface SamiTSResult {
        subtitle: string;
        stylesheet?: HTMLStyleElement;
    }

    export function createWebVTT(input: string, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export function createWebVTT(input: Blob, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export function createWebVTT(input: any, options?: WebVTTWriterOptions) {
        var sequence = getString(input);

        return sequence.then((samistr) => {
            var samiDocument = SamiDocument.parse(samistr);
            return (new SamiTS.WebVTTWriter()).write(samiDocument.samiCues, options)
        });
    }

    export function createSubrip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubrip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubrip(input: any, options?: SubRipWriterOptions) {
        var sequence = getString(input);

        return sequence.then((samistr) => {
            var samiDocument = SamiDocument.parse(samistr);
            return (new SamiTS.SubRipWriter()).write(samiDocument.samiCues, options)
        });
    }

    function getString(input: Blob): Promise<string>;
    function getString(input: string): Promise<string>;
    function getString(input: any) {
        if (typeof input === "string")
            return Promise.resolve(<string>input);
        else if (input instanceof Blob) {
            return new Promise<string>((resolve, reject) => {
                var reader = new FileReader();
                reader.onload = (ev: any) => {
                    resolve(<string>reader.result);
                };
                reader.readAsText(input);
            });
        }
    }
}