/*
- If Cache-Control header exists, max-age determines how long (seconds) until resource becomes stale.  If this exists, THEN IGNORE EXPIRES HEADER.
	- If this contains no-store, then you cannot store.
	- If this contains no-cache, then you must validate future requests using ETag or Last Modified (as below)
- Expires header determines date after which data is considered to be stale.  If the response has an Expires header and it is 0 or not a valid date, then ignore it (consider the data to be stale immediately)
- Check Last-Modified-Since and store that value; in future requests, send them with If-Modified-Since and the value.  If return HTTP code is 304, then use cache and possibly update Last-Modified-Since
- Check ETag and store that value; in future requests, send them with If-None-Match and the value.  If return HTTP code is 304, then use cache

- If response does not contain any headers above (or contains just Cache-Control with no-store), then don't cache it

implementation needs to:

for each request, check cache
	if record exists that is not yet expired, then return the data associated with that request
	if record exists and is expired but has a Last-Modified-Since and/or ETag value, then include the respective Last-Modified-Since and/or If-None-Match headers in the request and look for HTTP code 304 in the response
		if the HTTP code is 304, then return the cached data
		if the HTTP code is not 304, then clear the data from the cache and cache the new response data
	if record exists, is expired, and does not have a Last-Modified-Since or ETag value or if a record does not exist, then clear the data from the cache (if it exists) and cache the new response data

for each response that is received
	check for Cache-Control header
		if it exists and does not contain no-store, then cache the data.  max-age parameter will determine the number of seconds until expiration
			if there is no max-age, max-age<=0, or if the header contains no-cache, then continue below to determine if data is to be cached
		if it does not exist, then check for Expires header.  this will give the exact time when the data expires
			if the response contains an Expires header but the value is 0 or invalid, then continue below to determine if data is to be cached
	check for Last-Modified-Since header, if it exists then cache the response storing the value of this header
	check for ETag header, if it exists then cache the response storing the value of this header


when storing data
	use the full href of the request as the key for the cache
	store the expiration timestamp of the response data in the cache.  if it is in the past or does not exist, then store this as 0
	store the ETag and Last-Modified-Since headers, if available

enable trash collection to remove cached responses that are expired and have no ETag or Last-Modified-Since data
	if the expiration timestamp is in the past and the data does not contain either an ETag or Last-Modified-Since header, then remove it from the cache
*/

class HttpCache extends Map {
	get(url) {
		const response = super.get(url);

		if (response instanceof this.constructor.Item && !response.isTrash)
			return response;
		return undefined;
	}
}
HttpCache.Item = class Item {
	constructor(data, properties) {
		Object.assign(this, properties);

		if (!this.isTrash)
			this.data = data;
	}
	get hasConditionalRequest() { return this.etag !== "" && this.lastModified !== ""; }
	get isExpired() { return Date.now() > this.expires; }
	get isTrash() { return this.isExpired && !this.hasConditionalRequest; }
};
HttpCache.Item.prototype.data = "";
HttpCache.Item.prototype.etag = "";
HttpCache.Item.prototype.expires = 0;
HttpCache.Item.prototype.lastModified = "";

/*
CacheItem: { data: string, expires: timestamp, isExpired: get fn, lastModified: string, etag: string, isTrash: get fn }
*/