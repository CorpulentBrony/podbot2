import { HttpRequest } from "/requests/HttpRequest";
import SETTINGS from "/settings";

export class GoogleRequest extends HttpRequest {
	constructor() { super(new URL(SETTINGS.REQUESTS.GOOGLE.API_PATH, SETTINGS.REQUESTS.GOOGLE.URL)); }
	async query(query, isNsfw) {
		Object.assign(query, {
			cx: SETTINGS.REQUESTS.GOOGLE.SEARCH_ENGINE_ID,
			hl: SETTINGS.REQUESTS.GOOGLE.LANGUAGE,
			key: SETTINGS.REQUESTS.GOOGLE.API_KEY,
			safe: isNsfw ? SETTINGS.REQUESTS.GOOGLE.FILTERS.nsfw : SETTINGS.REQUESTS.GOOGLE.FILTERS.safe
		});
		query.q = query.q.replace(/best pony/g, "twilight sparkle");
		let response = await super.query("GET", query);

		if (Number.parseInt(response.searchInformation.totalResults) === 0)
			throw new this.constructor.Error(`No results were found for \`${queryString}\``);
		this.length = response.items.length;
		this.results = response.items;
		return this.getBidirectionalIterator();
	}
}
GoogleRequest.BASE_URL = SETTINGS.REQUESTS.GOOGLE.URL;
GoogleRequest.FAVICON_URL = SETTINGS.REQUESTS.GOOGLE.FAVICON;