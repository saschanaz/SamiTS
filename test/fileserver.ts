import { Server, ServerResult, mime } from "node-static";
import * as http from "http";

mime.define({ "text/plain;charset=utf-8": ["smi", "srt"], "text/vtt;charset=utf-8": ["vtt"] })

let server = new Server("../", {
	cache: false,
	headers: { "Cache-Control": "no-store" }
});

console.log(`Server opened at: ${server.root}`);

http.createServer((request, response) => {
	request.addListener("end", () => {
		console.log("Received a request.");
		server.serve(request, response).addListener("error", (err: ServerResult) => {
			console.log(`Error serving ${request.url}: ${err.status} ${err.message}`);
			
			response.writeHead(err.status, err.headers);
			response.end();
		});
	});
	request.resume();
}).listen(8080);