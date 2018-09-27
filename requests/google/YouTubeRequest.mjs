import { HttpRequest } from "/requests/HttpRequest";
import { GoogleRequest } from "./GoogleRequest";

const FILTERS = { safe: "none", nsfw: "none" }; // disabled safe search since YT content is mostly ok for SFW discord channels{ safe: "strict", nsfw: "none" };
const MAX_RESULTS = 25;
const RESULT_BASE_URL = "https://www.youtube.com";
const SEARCH_PATH = "/youtube/v3/search"; // https://developers.google.com/custom-search/json-api/v1/reference/cse/list
const WATCH_URL = new URL("https://www.youtube.com/watch");

export class YouTubeRequest extends HttpRequest {
	constructor() { super(new URL(SEARCH_PATH, GoogleRequest.BASE_URL)); }
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const result = request.results[this.index];
			const url = new URL(WATCH_URL);
			url.searchParams.set("v",  result.id.videoId);
			return { done: false, value: { footer: { text: `Video: ${(this.index + 1).toString()}/${request.results.length.toString()}` }, video: { url: url.toString() } } };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString, isNsfw = false) {
		const secrets = await GoogleRequest.secrets;
		const query = { key: secrets.apiKey, maxResults: MAX_RESULTS, part: "snippet", q: queryString.replace(/best pony/g, "twilight sparkle"), safeSearch: isNsfw ? FILTERS.nsfw : FILTERS.safe };
		let response = await super.query("GET", query);

		if (Number.parseInt(response.pageInfo.totalResults) === 0)
			throw new this.constructor.Error(`No results were found for \`${queryString}\``);
		this.length = response.items.length;
		this.results = response.items;
		return this.getBidirectionalIterator();
	}
}