var node_static_1 = require("node-static");
var http = require("http");
var server = new node_static_1.Server("../");
console.log("Server opened at: " + server.root);
http.createServer(function (request, response) {
    request.addListener("end", function () {
        console.log("Received a request.");
        server.serve(request, response).addListener("error", function (err) {
            console.log("Error serving " + request.url + ": " + err.status + " " + err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        });
    });
    request.resume();
}).listen(8080);
