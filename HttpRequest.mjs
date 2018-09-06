import * as Constants from "./Constants";
import * as Https from "https";
import { MessageEmbed } from "./MessageEmbed";
import * as Path from "path";
import { promisify } from "util";
import { readFile } from "fs";
import * as Stream from "stream";
import * as Zlib from "zlib";

// should be "deflate", "gzip", "deflate, gzip", or "identity"; this is sent as accept-encoding with http request
const ACCEPT_ENCODING = "deflate, gzip";
const APP_NAME = "podbot2";
const APP_URL = "https://iwtcits.com";
// file that stores a version reference for the app (must be given in relation to app location and should be utf8 encoded)
const APP_VERSION_FILE = ".git/refs/heads/master";
// this is sent as user-agent with the http request.  the text "NOT_YET_CALCULATED" will be replaced with the app version
const DEFAULT_USER_AGENT = `${APP_NAME}/NOT_YET_CALCULATED (${process.platform}; ${process.arch}; ${ACCEPT_ENCODING}; +${APP_URL}) node/${process.version}`;
const ERROR_FOOTER = Constants.Emotes.ERROR;
const ERROR_IMAGE = "https://mlp.one/404.png";
const ERROR_TITLE = "oopsie woopsie";
const FAVICON_URL = "https://iwtcits.com/twibedroom.png";

export class HttpRequest {
	constructor(url, headers = undefined, useKeepAlive = true) {
		[this.headers, this.url, this.useKeepAlive] = [headers, (typeof url === "string") ? new URL(url) : url, useKeepAlive];
		this.agent = new Https.Agent({ keepAlive: this.useKeepAlive });
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
					error = new this.constructor.Error(`No results found for ${query}.  (404)`);

				if (response.statusCode === 304)
					resolve.call(this, undefined);

				if (response.statusCode !== 200)
					error = new this.constructor.Error(`HTTPS request failed.  Status code: ${response.statusCode.toString()}`);
				else if (!/^application\/json/.test(response.headers["content-type"]))
					error = new this.constructor.Error(`Invalid content-type for HTTPS request.  Expected application/json but received ${response.headers["content-type"]}`);

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
					case "gzip": response.pipe(Zlib.createGunzip()).pipe(finalize); break;
					case "deflate": response.pipe(Zlib.createInflate()).pipe(finalize); break;
					default: response.pipe(finalize);
				}
			})
			.on("error", reject)
			.end();
		});
	}
}
HttpRequest.Error = class HttpRequestError extends Error {
	sendEmbed(channel, author) {
		const embed = new MessageEmbed({ footer: ERROR_FOOTER, description: this.message, image: { url: ERROR_IMAGE }, title: ERROR_TITLE });
		embed.send(channel, author);
	}
};
HttpRequest.headers = {
	encoding: { ["accept-encoding"]: ACCEPT_ENCODING },
	keepAlive: { connection: "keep-alive" },
	async getDefault() {
		if ("default" in this)
			return this.default;
		const version = await promisify(readFile)(Path.join(process.cwd(), APP_VERSION_FILE), { encoding: "utf8" });
		return this.default = Object.assign({ ["user-agent"]: DEFAULT_USER_AGENT.replace(/NOT_YET_CALCULATED/g, version.trim()) }, this.encoding);
	}
};
// recreating this function here as the Node.js implementation appears to be broken for some reason
HttpRequest.urlToOptions = function(url) {
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
};
HttpRequest.prototype.agent = undefined;
HttpRequest.prototype.headers = undefined;
HttpRequest.prototype.url = undefined;
HttpRequest.prototype.useKeepAlive = true;