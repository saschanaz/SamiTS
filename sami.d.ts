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
    interface SamiLanguage {
        className: string;
        languageName: string;
        languageCode: string;
    }
    class SamiCue {
        public syncElement: HTMLElement;
        constructor(syncElement: HTMLElement);
        public filterByLanguageCode(lang: string): SamiCue;
    }
    class SamiDocument {
        public samiCues: SamiCue[];
        public languages: SamiLanguage[];
        static parse(samistr: string): SamiDocument;
        public splitByLanguage(): SamiDocument[];
        private static giveLanguageData(cue, languages);
        private static extractClassSelectors(stylestr);
        private static fixIncorrectRubyNodes(syncobject);
        private static fixIncorrectRPs(syncobject);
        private static wrapWith(targetNode, newParentNode);
        private static isRubyParentExist(rtelement);
        private static getFontFromNode(text);
        private static exchangeFontWithTemp(syncobject);
        private static extractFontAndText(syncobject);
        private static extractReadableTextNodes(syncobject);
        private static lastIndexOfInsensitive(target, searchString, position?);
    }
}
declare module SamiTS {
    interface WebVTTWriterOptions {
        onstyleload?: (style: HTMLStyleElement) => void;
    }
    class WebVTTWriter {
        private webvttStyleSheet;
        public write(xsyncs: SamiTS.SamiCue[], options?: WebVTTWriterOptions): string;
        private getWebVTTTime(ms);
        private absorbAir(target);
        private getRichText(syncobject);
        private registerStyle(fontelement);
        private fixIncorrectColorAttribute(colorstr);
    }
}
declare module SamiTS {
    interface SubRipWriterOptions {
        useTextStyles?: boolean;
    }
    class SubRipWriter {
        public write(xsyncs: SamiTS.SamiCue[], options?: SubRipWriterOptions): string;
        private getSubRipTime(ms);
        private absorbAir(target);
        private getSimpleText(syncobject);
        private getRichText(syncobject);
    }
}
declare module SamiTS {
    function convertToWebVTTFromString(samiString: string, options?: WebVTTWriterOptions): string;
    function convertToSubRipFromString(samiString: string, options?: SubRipWriterOptions): string;
    function convertToWebVTTFromFile(samiFile: File, onread: (convertedString: string) => any, options?: WebVTTWriterOptions): void;
    function convertToSubRipFromFile(samiFile: File, onread: (convertedString: string) => any, options?: SubRipWriterOptions): void;
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
