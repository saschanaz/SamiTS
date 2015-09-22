declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

declare type HeadersInit = Headers | string[][] | { [key: string]: string };
interface Headers {
	append(name: string, value: string): void;
	delete(name: string): void;
	get(name: string): string;
	getAll(name: string): string[];
	has(name: string): boolean;
	set(name: string, value: string): void;
	// iterable
}
interface HeadersConstructor {
	new (init?: HeadersInit): Headers;
}
declare var Headers: HeadersConstructor;

declare type BodyInit = Blob | ArrayBufferView | ArrayBuffer | FormData /* | URLSearchParams */ | string;
interface Body {
	bodyUsed: boolean;
	arrayBuffer(): Promise<ArrayBuffer>;
	blob(): Promise<Blob>;
	formData(): Promise<FormData>;
	json(): Promise<any>;
	text(): Promise<string>;
}

declare type RequestInfo = Request | string;
interface Request extends Body {
	method: string;
	url: string;
	headers: Headers;
	
	/** "", "audio", "font", "image", "script", "style", "track", "video" */
	type: string;
	/** "", "document", "sharedworker", "subresource", "unknown", "worker" */
	destination: string;
	referrer: string;
	/** "", "no-referrer", "no-referrer-when-downgrade", "origin-only", "origin-when-cross-origin", "unsafe-url" */
	referrerPolicy: string;
	/** "same-origin", "no-cors", "cors" */
	mode: string;
	/** "omit", "same-origin", "include" */
	credentials: string;
	/** "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached" */
	cache: string;
	/** "follow", "error", "manual" */
	redirect: string;
	integrity: string;
	
	clone(): Request;
}
interface RequestInit {
	method?: string;
	headers?: HeadersInit;
	body?: BodyInit;
	referrer?: string;
	/** "", "no-referrer", "no-referrer-when-downgrade", "origin-only", "origin-when-cross-origin", "unsafe-url" */
	referrerPolicy?: string;
	/** "same-origin", "no-cors", "cors" */
	mode?: string;
	/** "omit", "same-origin", "include" */
	credentials?: string;
	/** "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached" */
	cache?: string;
	/** "follow", "error", "manual" */
	redirect?: string;
	integrity?: string;
	window?: any;
}
interface RequestConstructor {
	new (input: RequestInfo, init?: RequestInit): Request;
}
declare var Request: RequestConstructor;

interface Response extends Body {
	/** "basic", "cors", "default", "error", "opaque", "opaqueredirect" */
	type: string;
	url: string;
	status: number;
	ok: boolean;
	statusText: string;
	headers: Headers;
	
	clone(): Response;
}
interface ResponseInit {
	status?: number;
	statusText?: number;
	headers?: HeadersInit;
}
interface ResponseConstructor {
	new (body?: BodyInit, init?: ResponseInit): Response;
	
	error(): Response;
	redirect(url: string, status?: number): Response;
}
declare var Response: ResponseConstructor;
