/*
Copyright (c) 2014 SaschaNaz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
*/

module SamiTS {
    export interface SamiTSResult {
        subtitle: string;
        stylesheet?: HTMLStyleElement;
    }

    export function createWebVTT(input: string, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export function createWebVTT(input: Blob, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export function createWebVTT(input: SamiDocument, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export function createWebVTT(input: any, options?: WebVTTWriterOptions) {
        var sequence: Promise<SamiDocument>;
        if (input instanceof SamiDocument)
            sequence = Promise.resolve(input);
        else
            sequence = getString(input).then((samistr) => SamiDocument.parse(samistr));

        return sequence.then((sami) => (new SamiTS.WebVTTWriter()).write(sami.cues, options));
    }

    export function createSubrip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubrip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubrip(input: SamiDocument, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubrip(input: any, options?: SubRipWriterOptions) {
        var sequence: Promise<SamiDocument>;
        if (input instanceof SamiDocument)
            sequence = Promise.resolve(input);
        else
            sequence = getString(input).then((samistr) => SamiDocument.parse(samistr));

        return sequence.then((sami) => (new SamiTS.SubRipWriter()).write(sami.cues, options));
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