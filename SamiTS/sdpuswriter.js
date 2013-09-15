var SamiTS;
(function (SamiTS) {
    var SDPUSWriter = (function () {
        function SDPUSWriter() {
            this.xmlNamespaceURI = "http://www.w3.org/XML/1998/namespace";
            this.xmlnsNamespaceURI = "http://www.w3.org/2000/xmlns/";
            this.ttmlNamespaceURI = "http://www.w3.org/ns/ttml";
            this.ttmlStyleNamespaceURI = "http://www.w3.org/ns/ttml#styling";
            this.ttmlParameterNamespaceURI = "http://www.w3.org/ns/ttml#parameter";
            this.sdpusNamespaceURI = "http://www.w3.org/ns/ttml/profile/sdp-us";
        }
        SDPUSWriter.prototype.write = function (xsyncs) {
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
            var sdpusdoc = document.implementation.createDocument(this.ttmlNamespaceURI, "tt", null);
            sdpusdoc.documentElement.setAttributeNS(this.xmlNamespaceURI, "xml:lang", "en-us");
            sdpusdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:s", this.ttmlStyleNamespaceURI);
            sdpusdoc.documentElement.setAttributeNS(this.xmlnsNamespaceURI, "xmlns:p", this.ttmlParameterNamespaceURI);
            var body = sdpusdoc.createElementNS(this.ttmlNamespaceURI, "head");
            var profile = sdpusdoc.createElementNS(this.ttmlParameterNamespaceURI, "profile");
            profile.setAttributeNS(this.ttmlParameterNamespaceURI, "use", this.sdpusNamespaceURI);
            this.stylingElement = sdpusdoc.createElementNS(this.ttmlNamespaceURI, "styling");

            return (new XMLSerializer()).serializeToString(sdpusdoc);
        };
        return SDPUSWriter;
    })();
    SamiTS.SDPUSWriter = SDPUSWriter;
})(SamiTS || (SamiTS = {}));
//# sourceMappingURL=sdpuswriter.js.map
