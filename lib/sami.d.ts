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
    interface FoundHTMLTag extends FoundHTMLTagOf<HTMLElement> {
    }
    interface FoundHTMLTagOf<T extends HTMLElement> {
        element: T;
        startPosition: number;
        endPosition: number;
    }
    class HTMLTagFinder {
        static FindStartTag<T extends HTMLElement>(tagname: string, entirestr: string): FoundHTMLTagOf<T>;
        static FindStartTags<T extends HTMLElement>(tagname: string, entirestr: string): FoundHTMLTagOf<T>[];
        static FindAllStartTags(entirestr: string): FoundHTMLTag[];
        private static getAttribute(entirestr, position);
        private static searchWithIndex(target, query, position?);
        private static charCompare(a, ...b);
    }
}
declare module SamiTS {
    interface SAMILanguage {
        /** The CSS class name defined within SAMI markup. */
        cssClass: string;
        /** The display name */
        displayName: string;
        /** BCP47 language code */
        code: string;
    }
    /** A dictionary which is composed of SAMIDocument objects with BCP47 language code keys. */
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
        clone(): SAMIDocument;
        /**
        Split SAMI document by its languages. Result may not be strictly ordered by any ways.
        */
        splitByLanguage(): SAMIDocumentDictionary;
        /**
        @param increment Delay in microseconds
        */
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
        comment?: boolean;
        divides?: boolean;
        linebreak?: boolean;
    }
    interface DOMReadOptionBag {
        /** Give true if the target format thinks an empty line as the end of the cue */
        preventEmptyLine?: boolean;
    }
    class SAMICue {
        syncElement: SAMISyncElement;
        constructor(syncElement: SAMISyncElement);
        clone(): SAMICue;
        filter(...languages: string[]): {
            [key: string]: SAMICue;
        };
        readDOM<OptionBag extends DOMReadOptionBag>(readNode: (element: Node, options: OptionBag) => TagReadResult, options?: OptionBag): string;
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
        private readElementSimple(element);
        private readElementRich(element);
    }
}
interface Comment {
    nextElementSibling(): Element | null;
}
declare module SamiTS {
    interface WebVTTWriterOptions {
        createStyleElement?: boolean;
        disableDefaultStyle?: boolean;
        enableLanguageTag?: boolean;
        /** The default value is "video". */
        selector?: string;
    }
    class WebVTTWriter {
        private webvttStyleSheet;
        write(xsyncs: SAMICue[], options?: WebVTTWriterOptions): SamiTSResult;
        private getWebVTTTime(ms);
        private readNode(node, options);
        private registerStyle(fontelement);
    }
}
