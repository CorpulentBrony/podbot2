import { ApiRequest } from "./ApiRequest";
import * as Constants from "./Constants";
import util from "./util";

const BASE_URL = "https://www.googleapis.com";
const FAVICON_URL = "https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";
const FILTERS = { safe: "high", nsfw: "off" };
const SEARCH_ENGINE_ID = "006965754145483107019:1pwwebw_oo0";
const SEARCH_PATH = "/customsearch/v1";
const SECRETS_FILE = ".google_secrets.json";

class Common {
	static get secrets() {
		delete this.secrets;
		return this.secrets = this.getSecrets();
	}
	static async getSecrets() { return JSON.parse(await util.readFile(SECRETS_FILE)); }
}

export class SearchRequest extends ApiRequest {
	static getThumbnailUrl(result) {
		if (!("pagemap" in result))
			return FAVICON_URL;
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
	constructor() { super(new URL(SEARCH_PATH, BASE_URL)); }
	async query(queryString, isNsfw = false) {
		const secrets = await Common.secrets;
		const query = { cx: secrets.searchEngineId, key: secrets.apiKey, q: queryString.replace(/best pony/g, "twilight sparkle"), safe: isNsfw ? FILTERS.nsfw : FILTERS.safe };
		let response = await super.query("GET", query);

		if (Number.parseInt(response.searchInformation.totalResults) === 0)
			throw new this.constructor.Error(`No results were found for \`${queryString}\``);
		this.length = response.items.length;
		this.results = response.items;
		return this.getBidirectionalIterator();
	}
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const result = request.results[this.index];
			const value = {
				description: result.snippet.replace(/\n/g, ""),
				footer: { iconURL: FAVICON_URL, text: `${(this.index + 1).toString()}/${request.results.length.toString()}` },
				thumbnail: request.constructor.getThumbnailUrl(result),
				title: result.title,
				url: result.link
			};

			if (Array.isArray(result.metatags))
				value.color = result.metatags.map((metatag) => Number.parseInt(metatag["theme-color"].slice(1), 16)).find((color) => !Number.isNaN(color));
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
}