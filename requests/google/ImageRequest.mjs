import { GoogleRequest } from "./GoogleRequest";

const SEARCH_FIELDS = "items(image/contextLink,link,snippet,title),searchInformation(totalResults)";

export class ImageRequest extends GoogleRequest {
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const result = request.results[this.index];
			const value = {
				description: result.snippet.replace(/\n/g, ""),
				footer: { iconURL: request.constructor.FAVICON_URL, text: `${(this.index + 1).toString()}/${request.results.length.toString()}` },
				image: { url: result.link },
				title: result.title,
				url: ("image" in result && typeof result.image.contextLink === "string") ? result.image.contextLink : undefined
			};
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString, isNsfw = false) { return super.query({ fields: SEARCH_FIELDS, q: queryString, searchType: "image" }, isNsfw); }
}