const CACHE_GARBAGE_COLLECTION_INTERVAL_SECONDS = 60;

class HttpCache extends Map {
	constructor() {
		super();
		this.collectGarbage = this.collectGarbage.bind(this);
	}
	collectGarbage() {
		for (const [url, item] of this)
			if (item.isGarbage === true)
				super.delete(url);
		return this;
	}
	get(url) {
		const item = super.get(url);

		if (item instanceof this.constructor.Item && item.isGarbage === false)
			return item;
		super.delete(url);
		return this.constructor.garbageItem;
	}
	set(url, dataWithHeaders) {
		if (dataWithHeaders instanceof Object && dataWithHeaders.headers instanceof Object && "data" in dataWithHeaders)
			super.set(url, new this.constructor.Item(dataWithHeaders.data, dataWithHeaders.headers));
		return dataWithHeaders.data;
	}
}
HttpCache.Item = class Item {
	constructor(data = {}, headers = undefined) {
		if (!(headers instanceof Object))
			return;
		else if (typeof headers["cache-control"] === "string") {
			const cacheControl = headers["cache-control"].split(/\s*,\s*/g).reduce((result, field) => {
				const [key, value] = `${field}=true`.split(/\s*=\s*/, 2);
				return Object.assign(result, { [key]: (value === "true") ? true : Number.parseInt(value) });
			}, {});

			if (cacheControl["no-store"] === true)
				return;
			else if (cacheControl["only-if-cached"] === true)
				this.expires = 31536000;
			else if (cacheControl["no-cache"] !== true)
				if (typeof cacheControl["s-maxage"] === "number" && cacheControl["s-maxage"] >= 0)
					this.expires = cacheControl["s-maxage"];
				else if (typeof cacheControl["max-age"] === "number" && cacheControl["max-age"] >= 0)
					this.expires = cacheControl["max-age"];
		}

		if (typeof this.expires !== "number")
			this.expires = (typeof headers.expires === "string") ? headers.expires : 0;
		[this.etag, this.lastModified] = [headers.etag, headers["last-modified"]];

		if (!this.isGarbage)
			this.data = data;
	}
	get expires() { return this.constructor.privates.expires.get(this); }
	get hasConditionalRequest() { return typeof this.etag === "string" || typeof this.lastModified === "string"; }
	get isExpired() { return typeof this.expires !== "number" || Date.now() > this.expires; }
	get isGarbage() { return this.isExpired && !this.hasConditionalRequest; }
	set expires(expires) {
		if (typeof expires === "number" && !Number.isNaN(expires))
			this.constructor.privates.expires.set(this, Date.now() + expires * 1000);
		else if (typeof expires === "string") {
			const parsed = Date.parse(expires);
			this.constructor.privates.expires.set(this, Number.isNaN(parsed) ? 0 : parsed);
		}
	}
};
HttpCache.Item.privates = { expires: new WeakMap() };
HttpCache.Item.prototype.data = {};
HttpCache.Item.prototype.etag = undefined;
HttpCache.Item.prototype.lastModified = undefined;
HttpCache.garbageItem = new HttpCache.Item();

const httpCache = new HttpCache();
setInterval(httpCache.collectGarbage, CACHE_GARBAGE_COLLECTION_INTERVAL_SECONDS * 1000);

export { httpCache as HttpCache };