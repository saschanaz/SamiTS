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
    export function createWebVTT(input: SAMIDocument, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    export async function createWebVTT(input: any, options?: WebVTTWriterOptions) {
        let sami: SAMIDocument;
        if (input instanceof SAMIDocument)
            sami = input;
        else
            sami = await createSAMIDocument(input);

        return (new SamiTS.WebVTTWriter()).write(sami.cues, options);
    }

    export function createSubRip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubRip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export function createSubRip(input: SAMIDocument, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    export async function createSubRip(input: any, options?: SubRipWriterOptions) {
        let sami: SAMIDocument;
        if (input instanceof SAMIDocument)
            sami = input;
        else
            sami = await createSAMIDocument(input);

        return (new SamiTS.SubRipWriter()).write(sami.cues, options);
    }

    export function createSAMIDocument(input: string): Promise<SAMIDocument>;
    export function createSAMIDocument(input: Blob): Promise<SAMIDocument>;
    export async function createSAMIDocument(input: any) {
        const samistr = await getString(input);
        return SAMIDocument.parse(samistr);
    }

    async function getString(input: string | Blob) {
        if (typeof input === "string")
            return input;
        else if (input instanceof Blob) {
            return readBlobAsText(input);
        }
    }

    function readBlobAsText(blob: Blob) {
        return new Promise<string>((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (ev: any) => {
                resolve(<string>reader.result);
            };
            reader.readAsText(blob);
        });
    }
}
