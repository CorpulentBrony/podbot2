import { HttpRequest } from "/requests/HttpRequest";
import util from "/util";

const BASE_URL = "https://www.googleapis.com";
const FAVICON_URL = "https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";
const FILTERS = { safe: "active", nsfw: "off" };
const SEARCH_LANGUAGE = "lang_en"; // https://developers.google.com/custom-search/docs/xml_results_appendices#languageCollections
const SEARCH_PATH = "/customsearch/v1"; // https://developers.google.com/custom-search/json-api/v1/reference/cse/list
const SECRETS_FILE = ".google_secrets.json";

export class GoogleRequest extends HttpRequest {
	static get secrets() {
		delete this.secrets;
		return Object.defineProperty(this, "secrets", { value: this.getSecrets() }).secrets;
	}
	static async getSecrets() { return JSON.parse(await util.readFile(SECRETS_FILE)); }
	constructor() { super(new URL(SEARCH_PATH, BASE_URL)); }
	async query(query, isNsfw) {
		const secrets = await this.constructor.secrets;
		Object.assign(query, { cx: secrets.searchEngineId, hl: SEARCH_LANGUAGE, key: secrets.apiKey, safe: isNsfw ? FILTERS.nsfw : FILTERS.safe });
		query.q = query.q.replace(/best pony/g, "twilight sparkle");
		let response = await super.query("GET", query);

		if (Number.parseInt(response.searchInformation.totalResults) === 0)
			throw new this.constructor.Error(`No results were found for \`${queryString}\``);
		this.length = response.items.length;
		this.results = response.items;
		return this.getBidirectionalIterator();
	}
}
GoogleRequest.BASE_URL = BASE_URL;
GoogleRequest.FAVICON_URL = FAVICON_URL;