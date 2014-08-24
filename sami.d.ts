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
    function createWebVTT(input: SamiDocument, options?: WebVTTWriterOptions): Promise<SamiTSResult>;
    function createSubrip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    function createSubrip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
    function createSubrip(input: SamiDocument, options?: SubRipWriterOptions): Promise<SamiTSResult>;
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
        public write(xsyncs: SamiCue[], options?: SubRipWriterOptions): SamiTSResult;
        private getSubRipTime(ms);
        private absorbAir(target);
        private getSimpleText(syncobject);
        private getRichText(syncobject);
    }
}
declare module SamiTS {
    interface SamiLanguage {
        className: string;
        languageName: string;
        languageCode: string;
    }
    class SamiCue {
        public syncElement: HTMLElement;
        constructor(syncElement: HTMLElement);
        public filter(...languages: string[]): any;
    }
    class SamiDocument {
        public cues: SamiCue[];
        public languages: SamiLanguage[];
        static parse(samistr: string): SamiDocument;
        public splitByLanguage(): any;
        public delay(increment: number): void;
        private static giveLanguageData(cue, languages);
        private static extractClassSelectors(stylestr);
        private static fixIncorrectRubyNodes(syncobject);
        private static fixIncorrectRPs(syncobject);
        private static wrapWith(targetNode, newParentNode);
        private static isRubyParentExist(rtelement);
        private static getFontFromNode(text);
        private static exchangeFontWithTemp(syncobject);
        private static _stripTemp(syncobject);
        private static extractFontAndText(syncobject);
        private static extractReadableTextNodes(syncobject);
        private static lastIndexOfInsensitive(target, searchString, position?);
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
        public write(xsyncs: SamiCue[], options?: WebVTTWriterOptions): SamiTSResult;
        private getWebVTTTime(ms);
        private absorbAir(target);
        private getRichText(syncobject);
        private registerStyle(fontelement);
        private fixIncorrectColorAttribute(colorstr);
    }
}
