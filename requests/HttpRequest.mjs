import { BotError } from "/BotError";
import { HttpCache } from "./HttpCache";
import * as Https from "https";
import Iltorb from "iltorb";
import * as Stream from "stream";
import util from "/util";
import * as Zlib from "zlib";

// should be "deflate", "gzip", "deflate, gzip", or "identity"; this is sent as accept-encoding with http request
const ACCEPT_ENCODING = "br;q=1.0, deflate;q=0.4, gzip;q=0.7";
const APP_NAME = "podbot2";
const APP_URL = "https://iwtcits.com";
// file that stores a version reference for the app (must be given in relation to app location and should be utf8 encoded)
const APP_VERSION_FILE = ".git/refs/heads/master";
// this is sent as user-agent with the http request.  the text "NOT_YET_CALCULATED" will be replaced with the app version
const DEFAULT_USER_AGENT = `${APP_NAME}/NOT_YET_CALCULATED (${process.platform}; ${process.arch}; ${ACCEPT_ENCODING}; +${APP_URL}) node/${process.version}`;
const FAVICON_URL = "https://iwtcits.com/twibedroom.png";

export class HttpRequest {
	// recreating this function here as the Node.js implementation appears to be broken for some reason
	static urlToOptions(url) {
		const options = {
			hash: url.hash,
			hostname: url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname,
			href: url.href,
			path: `${url.pathname}${url.search}`,
			pathname: url.pathname,
			protocol: url.protocol,
			search: url.search
		};

		if (url.port !== "")
			options.port = Number(url.port);

		if (url.username || url.password)
			options.auth = `${url.username}:${url.password}`;
		return options;
	}
	constructor(url, headers = undefined, useKeepAlive = true) {
		[this.headers, this.url, this.useKeepAlive] = [headers, (typeof url === "string") ? new URL(url) : url, useKeepAlive];
		this.agent = new Https.Agent({ keepAlive: this.useKeepAlive });
	}
	generateHttpsRequest(options, body = undefined) {
		return new Promise((resolve, reject) => {
			const request = Https.request(options, (response) => {
				const finalize = new Stream.PassThrough();
				let objectString = "";
				finalize.on("data", (chunk) => { objectString += chunk.toString(); });
				finalize.on("end", () => {
					try { resolve.call(this, { data: objectString, headers: response.headers, status: response.statusCode }); }
					catch (err) { reject(err); }
				});

				switch (response.headers["content-encoding"]) {
					case "br": response.pipe(Iltorb.decompressStream()).pipe(finalize); break;
					case "deflate": response.pipe(Zlib.createInflate()).pipe(finalize); break;
					case "gzip": response.pipe(Zlib.createGunzip()).pipe(finalize); break;
					default: response.pipe(finalize);
				}
			});
			request.on("error", reject);

			if (body !== undefined)
				request.write(body);
			request.end();
		});
	}
	getBidirectionalIterator(current) {
		const request = this;
		const first = function() {
			this.index = 0;
			return this.current();
		};
		const last = function() {
			this.index = request.results.length - 1;
			return this.current();
		};
		const next = function() {
			this.index = ++this.index % request.results.length;
			return this.current();
		};
		const prev = function() {
			if (--this.index < 0)
				this.index += request.results.length;
			return this.current();
		};
		const result = { first, index: 0, last, next, prev };
		result.current = current.bind(result);
		return result;
	}
	async query(method = "GET", query = undefined) {
		if (!this.headers)
			this.headers = await this.constructor.headers.getDefault();
		const headers = this.useKeepAlive ? Object.assign({}, this.headers, this.constructor.headers.keepAlive) : this.headers;
		const url = new URL(this.url);

		if (query)
			for (const item in query)
				url.searchParams.append(item, query[item]);
		url.searchParams.sort();
		const cacheItem = HttpCache.get(url.href);

		if (!cacheItem.isExpired)
			return cacheItem.data;
		else if (cacheItem.hasConditionalRequest)
			Object.assign(headers, (typeof cacheItem.etag === "string") ? { ["if-none-match"]: cacheItem.etag } : { ["if-modified-since"]: cacheItem.lastModified });
		// console.log({ url: url.href });
		const response = await this.generateHttpsRequest(Object.assign({ agent: this.agent, headers, method }, this.constructor.urlToOptions(url)));

		if (response.status === 404)
			throw new BotError(`No results found for ${query}.  (404)`);
		else if ([304, 412].includes(response.status) && cacheItem.hasConditionalRequest)
			return cacheItem.data;
		else if (response.status !== 200)
			throw new BotError(`HTTPS request failed.  Status code: ${response.status.toString()}`);
		const data = JSON.parse(response.data);
		HttpCache.set(url.href, { data, headers: response.headers });
		return data;
	}
}
HttpRequest.headers = {
	accept: { accept: "application/json" },
	encoding: { ["accept-encoding"]: ACCEPT_ENCODING },
	keepAlive: { connection: "keep-alive" },
	async getDefault() {
		if ("default" in this)
			return this.default;
		const version = await util.readFile(APP_VERSION_FILE);
		return this.default = Object.assign({ ["user-agent"]: DEFAULT_USER_AGENT.replace(/NOT_YET_CALCULATED/g, version.trim()) }, this.encoding, this.accept);
	}
};
HttpRequest.prototype.agent = undefined;
HttpRequest.prototype.headers = undefined;
HttpRequest.prototype.length = 0;
HttpRequest.prototype.results = [];
HttpRequest.prototype.url = undefined;
HttpRequest.prototype.useKeepAlive = true;