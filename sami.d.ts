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
    class SDPUSWriter {
        private xmlNamespaceURI;
        private xmlnsNamespaceURI;
        private ttmlNamespaceURI;
        private ttmlStyleNamespaceURI;
        private ttmlParameterNamespaceURI;
        private sdpusNamespaceURI;
        private stylingElement;
        public write(xsyncs: HTMLElement[]): string;
    }
}
declare module SamiTS {
    interface SubRipWriterOptions {
        useTextStyles?: boolean;
    }
    class SubRipWriter {
        public write(xsyncs: SAMICue[], options?: SubRipWriterOptions): SamiTSResult;
        private getSubRipTime(ms);
        private absorbAir(target);
        private getSimpleText(syncobject);
        private getRichText(syncobject);
    }
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
    class SAMICue {
        public syncElement: HTMLElement;
        constructor(syncElement: HTMLElement);
        public filter(...languages: string[]): {
            [key: string]: SAMICue;
        };
    }
    class SAMIDocument {
        public cues: SAMICue[];
        public languages: SAMILanguage[];
        public splitByLanguage(): SAMIDocumentDictionary;
        public delay(increment: number): void;
    }
    module SAMIDocument {
        function parse(samistr: string): SAMIDocument;
    }
}
declare module SamiTS {
    interface WebVTTWriterOptions {
        createStyleElement?: boolean;
        disableDefaultStyle?: boolean;
        selector?: string;
    }
    class WebVTTWriter {
        private webvttStyleSheet;
        public write(xsyncs: SAMICue[], options?: WebVTTWriterOptions): SamiTSResult;
        private getWebVTTTime(ms);
        private absorbAir(target);
        private getRichText(syncobject);
        private registerStyle(fontelement);
        private fixIncorrectColorAttribute(colorstr);
    }
}
