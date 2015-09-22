SamiTS
======

SamiTS converts Microsoft SAMI-formatted subtitle files to more popular WebVTT and Subrip ones to allow browsers to read the best popular subtitle format in South Korea.

SamiTS also supports styles by collecting SAMI styling tags to make a standard CSS stylesheet.

Get a sneak peak with [a sample](http://saschanaz.github.io/SamiTS/sample/) here.

# Example

### Simple use

```javascript
var player = document.getElementById("player");
var input = document.getElementById("loadVideo");

var track = document.createElement("track");
SamiTS.createWebVTT(input.files[0], { createStyleElement: true })
  .then(function (result) {
    track.src = URL.createObjectURL(new Blob([result.subtitle], { type: "text/vtt" }));
    document.head.appendChild(result.stylesheet);
  });
```

### More advanced

```javascript
SamiTS.createSamiDocument(input.files[0])
  .then(function (sami) {
    sami.delay(300);
	return SamiTS.createWebVTT(sami, { createStyleElement: true })
  })
  .then(function (result) {
    track.src = URL.createObjectURL(new Blob([result.subtitle], { type: "text/vtt" }));
    document.head.appendChild(result.stylesheet);
  });;
```

# API

```typescript
declare module SamiTS {
  interface WebVTTWriterOptions {
    createStyleElement?: boolean;
    disableDefaultStyle?: boolean;
	/** The default value is "video". */
    selector?: string;
  }
  interface SubRipWriterOptions {
    useTextStyles?: boolean
  }
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

// More advanced SAMI manipulation before any conversion
declare module SamiTS {
    interface SAMILanguage {
        cssClass: string;
        displayName: string;
        code: string;
    }
    interface SAMIDocumentDictionary {
        [key: string]: SAMIDocument;
    }
	
    class SAMIDocument {
        public languages: SAMILanguage[];
        public splitByLanguage(): SAMIDocumentDictionary;
        public delay(increment: number): void;
    }
}
```
