/// <reference path="node.d.ts" />

declare module "node-static" {
	import * as http from "http";
	import * as events from "events";
	
	class Server {
		constructor();
		constructor(root: string);
		constructor(root: string, options: ServerOptions);
		
		root: string;
		options: ServerOptions;
		
		serve(request: http.IncomingMessage, response: http.ServerResponse, callback: (error: ServerResult, result: ServerResult) => void): void;
		serve(request: http.IncomingMessage, response: http.ServerResponse): events.EventEmitter;
	} 
	interface ServerOptions {
		cache?: number | boolean;
		serverInfo?: string;
		headers?: any;
		gzip?: boolean | RegExp;
		indexFile?: string;
	}
	interface ServerResult {
		status: number;
		headers: any;
		message: string;
	}
}