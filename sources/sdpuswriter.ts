"use strict";

module SamiTS {
    export class SDPUSWriter {
        private xmlNamespaceURI = "http://www.w3.org/XML/1998/namespace";
        private xmlnsNamespaceURI = "http://www.w3.org/2000/xmlns/";
        private ttmlNamespaceURI = "http://www.w3.org/ns/ttml";
        private ttmlStyleNamespaceURI = "http://www.w3.org/ns/ttml#styling";
        private ttmlParameterNamespaceURI = "http://www.w3.org/ns/ttml#parameter";
        private sdpusNamespaceURI = "http://www.w3.org/ns/ttml/profile/sdp-us";
        private stylingElement: Element;
        write(xsyncs: HTMLElement[]) {
            /*
            example using 
            http://msmvps.com/blogs/martin_honnen/archive/2009/04/13/creating-xml-with-namespaces-with-javascript-and-the-w3c-dom.aspx
            var ttmlns = "http://www.w3.org/ns/ttml";
            var ttmlsns = "http://www.w3.org/ns/ttml#styling";
            var ttmlpns = "http://www.w3.org/ns/ttml#parameter";
            var doc = document.implementation.createDocument(ttmlns, "tt", null);
            doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:s", ttmlsns);
            doc.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', "xmlns:p", ttmlpns);
            (new XMLSerializer()).serializeToString(doc);
            이 다음엔 child node 추가 넣기
            */
            var ttdoc = document.implementation.createDocument(this.ttmlNamespaceURI, "tt", null);
            ttdoc.documentElement.setAttributeNS(this.xmlNamespaceURI, "xml:lang", "en-us");
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:s", this.ttmlStyleNamespaceURI);
            ttdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:p", this.ttmlParameterNamespaceURI);

            var head = ttdoc.createElementNS(this.ttmlNamespaceURI, "head");
            ttdoc.appendChild(head);

            var profile = ttdoc.createElementNS(this.ttmlParameterNamespaceURI, "profile");
            profile.setAttributeNS(this.ttmlParameterNamespaceURI, "use", this.sdpusNamespaceURI);
            head.appendChild(profile);

            this.stylingElement = ttdoc.createElementNS(this.ttmlNamespaceURI, "styling");
            head.appendChild(this.stylingElement);

            var regionStyle = ttdoc.createElementNS(this.ttmlNamespaceURI, "style");
            regionStyle.setAttributeNS(this.xmlNamespaceURI, "xml:id", "bottomMidStyle");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textAlign", "center");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:textOutline", "#000000ff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:color", "#ffffffff");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:origin", "20% 58%");
            regionStyle.setAttributeNS(this.ttmlStyleNamespaceURI, "s:extent", "60% 18%");
            this.stylingElement.appendChild(regionStyle);

            var layout = ttdoc.createElementNS(this.ttmlNamespaceURI, "layout");
            head.appendChild(layout);
            var region = ttdoc.createElementNS(this.ttmlNamespaceURI, "region");
            //region.setAttributeNS(this.xmlNamespaceURI

            //var layout = sdpusdoc.

            //var text: string;
            //if (xsyncs.length > 0) {
            //    text = this.getRichText(xsyncs[0].syncElement);
            //    if (text.length > 0) writeText(0, text);
            //    for (var i = 1; i < xsyncs.length - 1; i++) {
            //        text = this.absorbAir(this.getRichText(xsyncs[i].syncElement));//prevents cues consists of a single &nbsp;
            //        if (text.length > 0) {
            //            subDocument += "\r\n\r\n";
            //            writeText(i, text);
            //        }
            //    }
            //}

            return '<?xml version="1.0" encoding="utf-8"?>' +
                (new XMLSerializer()).serializeToString(ttdoc);
        }
    }
}