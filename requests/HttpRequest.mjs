import { BotError } from "/BotError";
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
		const options = Object.assign({ agent: this.agent, headers, method }, this.constructor.urlToOptions(url));
		return new Promise((resolve, reject) => {
			Https.request(options, (response) => {
				let error;

				if (response.statusCode === 404)
					error = new BotError(`No results found for ${query}.  (404)`);

				if (response.statusCode === 304)
					resolve.call(this, undefined);

				if (response.statusCode !== 200)
					error = new BotError(`HTTPS request failed.  Status code: ${response.statusCode.toString()}`);
				else if (!/^application\/json/.test(response.headers["content-type"]))
					error = new BotError(`Invalid content-type for HTTPS request.  Expected application/json but received ${response.headers["content-type"]}`);

				if (error) {
					reject(error);
					response.resume();
					return;
				}
				const finalize = new Stream.PassThrough();
				let objectString = "";
				finalize.on("data", (chunk) => { objectString += chunk.toString(); });
				finalize.on("end", () => {
					try { resolve.call(this, JSON.parse(objectString)); }
					catch (err) { reject(err); }
				});

				switch (response.headers["content-encoding"]) {
					case "br": response.pipe(Iltorb.decompressStream()).pipe(finalize); break;
					case "deflate": response.pipe(Zlib.createInflate()).pipe(finalize); break;
					case "gzip": response.pipe(Zlib.createGunzip()).pipe(finalize); break;
					default: response.pipe(finalize);
				}
			})
			.on("error", reject)
			.end();
		});
	}
}
HttpRequest.headers = {
	encoding: { ["accept-encoding"]: ACCEPT_ENCODING },
	keepAlive: { connection: "keep-alive" },
	async getDefault() {
		if ("default" in this)
			return this.default;
		const version = await util.readFile(APP_VERSION_FILE);
		return this.default = Object.assign({ ["user-agent"]: DEFAULT_USER_AGENT.replace(/NOT_YET_CALCULATED/g, version.trim()) }, this.encoding);
	}
};
HttpRequest.prototype.agent = undefined;
HttpRequest.prototype.headers = undefined;
HttpRequest.prototype.length = 0;
HttpRequest.prototype.results = [];
HttpRequest.prototype.url = undefined;
HttpRequest.prototype.useKeepAlive = true;