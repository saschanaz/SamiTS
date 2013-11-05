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
    class SamiCue {
        public syncElement: HTMLElement;
        constructor(syncElement: HTMLElement);
        public filterByLanguageCode(lang: string): HTMLElement;
    }
    class SamiDocument {
        public samiCues: SamiCue[];
        public languages: string[];
        static parse(samistr: string): SamiDocument;
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
    class WebVTTWriter {
        private webvttStyleSheet;
        private domparser;
        public write(xsyncs: SamiTS.SamiCue[], options?: {
            onstyleload: (style: HTMLStyleElement) => void;
        }): string;
        private getWebVTTTime(ms);
        private cleanVacuum(uncleaned);
        private getRichText(syncobject);
        private registerStyle(fontelement);
        private fixIncorrectColorAttribute(colorstr);
    }
}
declare module SamiTS {
    class SubRipWriter {
        public write(xsyncs: SamiTS.SamiCue[], options?: {
            useTextStyles: boolean;
        }): string;
        private getSubRipTime(ms);
        private getSimpleText(syncobject);
        private getRichText(syncobject);
    }
}
declare module SamiTS {
    function convertToWebVTTFromString(samiString: string, options?: {
        onstyleload: (style: HTMLStyleElement) => void;
    }): string;
    function convertToSubRipFromString(samiString: string, options?: {
        useTextStyles: boolean;
    }): string;
    function convertToWebVTTFromFile(samiFile: File, onread: (convertedString: string) => any, options?: {
        onstyleload: (style: HTMLStyleElement) => void;
    }): void;
    function convertToSubRipFromFile(samiFile: File, onread: (convertedString: string) => any, options?: {
        useTextStyles: boolean;
    }): void;
}
