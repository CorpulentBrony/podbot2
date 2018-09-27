export function InternalCacheMixin(Base, cachedFields = {}) {
	const result = class InternalCache extends Base {
			getFromCache(cacheName, key, valueGenerator, thisArg = this, ...args) {
			if (!(this.cache[cacheName] instanceof Map || this.cache[cacheName] instanceof WeakMap))
				throw new Error(`Cache ${cacheName} does not exist.`);
			else if (this.cache[cacheName].has(key))
				return this.cache[cacheName].get(key);
			return this.cache[cacheName].set(key, valueGenerator.apply(thisArg, args)).get(key);
		}
	};
	result.prototype.cache = {};

	for (const cacheName in cachedFields)
		result.prototype.cache[cacheName] = new cachedFields[cacheName]();
	return result;
}