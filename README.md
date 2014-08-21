SamiTS
======

Let's read SAMI subtitle popular in Korea with web browsers! This library converts SAMI-formatted file into more popular formats including WebVTT and SubRip.

SamiTS extracts styles and reprocess it to make standard CSS stylesheets.

Get a sneak peak at it in [a sample](http://saschanaz.github.io/SamiTS/sample/) here.

# API

```typescript
declare module SamiTS {
  interface WebVTTWriterOptions {
    createStyleElement?: boolean;
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
  function createSubrip(input: string, options?: SubRipWriterOptions): Promise<SamiTSResult>;
  function createSubrip(input: Blob, options?: SubRipWriterOptions): Promise<SamiTSResult>;
}
```

# Example

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
