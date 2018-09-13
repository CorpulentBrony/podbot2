import { GoogleRequest } from "./GoogleRequest";

const SEARCH_FIELDS = "items(link,pagemap(cse_image/src,cse_thumbnail/src,metatags/theme-color,scraped/image_link),snippet,title),searchInformation(totalResults)";

export class SearchRequest extends GoogleRequest {
	static getThumbnailUrl(result) {
		if (!("pagemap" in result))
			return this.FAVICON_URL;
		const isValidUrlProperty = (container, property) => property in container && typeof container[property] === "string" && container[property].length > 0;
		const targetProperties = [["scraped", "image_link"], ["cse_image", "src"], ["cse_thumbnail", "src"]];
		const urls = targetProperties.reduce((urls, [containerProperty, urlProperty]) => {
			if (Array.isArray(result.pagemap[containerProperty]))
				urls.splice(urls.length, 0, ...result.pagemap[containerProperty].filter((container) => isValidUrlProperty(container, urlProperty)).map((container) => container[urlProperty]));
			return urls;
		}, []);

		if (urls.length === 0)
			return undefined;
		return { url: urls[0] };
	}
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const result = request.results[this.index];
			const value = {
				description: result.snippet.replace(/\n/g, ""),
				footer: { iconURL: request.constructor.FAVICON_URL, text: `${(this.index + 1).toString()}/${request.results.length.toString()}` },
				thumbnail: request.constructor.getThumbnailUrl(result),
				title: result.title,
				url: result.link
			};

			if ("pagemap" in result && Array.isArray(result.pagemap.metatags))
				value.color = result.pagemap.metatags.map((metatag) => (typeof metatag["theme-color"] === "string") ? Number.parseInt(metatag["theme-color"].slice(1), 16) : Number.NaN).find((color) => !Number.isNaN(color));
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString, isNsfw = false) { return super.query({ q: queryString }, isNsfw); }
}