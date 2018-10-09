import { HttpRequest } from "/requests/HttpRequest";
import { GoogleRequest } from "./GoogleRequest";
import SETTINGS from "/settings";

export class YouTubeRequest extends HttpRequest {
	constructor() { super(new URL(SETTINGS.REQUESTS.GOOGLE.YOUTUBE.API_PATH, GoogleRequest.BASE_URL)); }
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const result = request.results[this.index];
			const url = new URL(SETTINGS.REQUESTS.GOOGLE.YOUTUBE.WATCH_URL);
			url.searchParams.set("v",  result.id.videoId);
			return { done: false, value: { footer: { text: `Video: ${(this.index + 1).toString()}/${request.results.length.toString()}` }, video: { url: url.toString() } } };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString, isNsfw = false) {
		const query = {
			key: SETTINGS.REQUESTS.GOOGLE.API_KEY,
			maxResults: SETTINGS.REQUESTS.GOOGLE.YOUTUBE.MAX_RESULTS,
			part: "snippet",
			q: queryString.replace(/best pony/g, "twilight sparkle"),
			safeSearch: isNsfw ? SETTINGS.REQUESTS.GOOGLE.YOUTUBE.FILTERS.nsfw : SETTINGS.REQUESTS.GOOGLE.YOUTUBE.FILTERS.safe
		};
		let response = await super.query("GET", query);

		if (Number.parseInt(response.pageInfo.totalResults) === 0)
			throw new this.constructor.Error(`No results were found for \`${queryString}\``);
		this.length = response.items.length;
		this.results = response.items;
		return this.getBidirectionalIterator();
	}
}