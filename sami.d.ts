declare module SamiTS {
    interface FoundHTMLTag {
        element: HTMLElement;
        startPosition: number;
        endPosition: number;
    }
    class HTMLTagFinder {
        static FindStartTag(tagname: string, entirestr: string): FoundHTMLTag;
        static FindStartTags(tagname: string, entirestr: string): FoundHTMLTag[];
        static FindAllStartTags(entirestr: string): FoundHTMLTag[];
        private static getAttribute(entirestr, position);
        private static searchWithIndex(target, query, position?);
        private static charCompare(a, ...b);
    }
}
declare module SamiTS {
    interface SamiTSResult {
        subtitle: string;
        stylesheet?: HTMLStyleElement;
    }
    function createWebVTT(input: string, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    function createWebVTT(input: Blob, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    function createWebVTT(input: SAMIDocument, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    function createSubRip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    function createSubRip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    function createSubRip(input: SAMIDocument, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    function createSAMIDocument(input: string): Promise<SAMIDocument>;
    function createSAMIDocument(input: Blob): Promise<SAMIDocument>;
}
declare module SamiTS {
    interface SAMILanguage {
        cssClass: string;
        displayName: string;
        code: string;
    }
    interface SAMIDocumentDictionary {
        [key: string]: SAMIDocument;
    }
    interface SAMIContentDataset extends DOMStringMap {
        language: string;
    }
    interface SAMISyncDataset extends DOMStringMap {
        originalString: string;
    }
    interface SAMIContentElement extends HTMLElement {
        dataset: SAMIContentDataset;
    }
    interface SAMISyncElement extends HTMLElement {
        dataset: SAMISyncDataset;
    }
    class SAMIDocument {
        cues: SAMICue[];
        languages: SAMILanguage[];
        splitByLanguage(): SAMIDocumentDictionary;
        delay(increment: number): void;
    }
    module SAMIDocument {
        function parse(samistr: string): SAMIDocument;
    }
}
declare module SamiTS {
    interface TagReadResult {
        start: string;
        end: string;
        content: string;
        language?: string;
        divides?: boolean;
    }
    class SAMICue {
        syncElement: SAMISyncElement;
        constructor(syncElement: SAMISyncElement);
        filter(...languages: string[]): {
            [key: string]: SAMICue;
        };
        readDOM<OptionBag>(readElement: (element: Element, options: OptionBag) => TagReadResult, options?: OptionBag): TagReadResult;
    }
}
declare module SamiTS {
    class SDPUSWriter {
        private xmlNamespaceURI;
        private xmlnsNamespaceURI;
        private ttmlNamespaceURI;
        private ttmlStyleNamespaceURI;
        private ttmlParameterNamespaceURI;
        private sdpusNamespaceURI;
        private stylingElement;
        write(xsyncs: HTMLElement[]): string;
    }
}
declare module SamiTS {
    interface SubRipWriterOptions {
        useTextStyles?: boolean;
    }
    class SubRipWriter {
        write(xsyncs: SAMICue[], options?: SubRipWriterOptions): SamiTSResult;
        private getSubRipTime(ms);
        private absorbAir(target);
        private getSimpleText(syncobject);
        private getRichText(syncobject);
    }
}
declare module SamiTS.util {
    function isEmptyOrEndsWithSpace(input: string): boolean;
    function absorbSpaceEnding(input: string): string;
}
declare module SamiTS {
    interface WebVTTWriterOptions {
        createStyleElement?: boolean;
        disableDefaultStyle?: boolean;
        enableLanguageTag?: boolean;
        selector?: string;
    }
    class WebVTTWriter {
        private webvttStyleSheet;
        write(xsyncs: SAMICue[], options?: WebVTTWriterOptions): SamiTSResult;
        private getWebVTTTime(ms);
        private absorbAir(target);
        private generateTemplate(content?);
        private readElement(element, options);
        private registerStyle(fontelement);
        private fixIncorrectColorAttribute(colorstr);
    }
}
