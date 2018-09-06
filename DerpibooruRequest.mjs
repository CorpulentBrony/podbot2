import { ApiRequest } from "./ApiRequest";
import { arrayShuffle } from "./util";
import * as Constants from "./Constants";

const BASE_URL = "https://derpibooru.org";
const FAVICON_URL = "https://derpicdn.net/img/2017/6/14/1461521/thumb.png";
const FILTERS = { safe: 100073, nsfw: 56027 };
const SEARCH_PATH = "/search.json";

export class DerpibooruRequest extends ApiRequest {
	constructor() { super(new URL(SEARCH_PATH, BASE_URL)); }
	async query(queryString, isNsfw = false) {
		const query = {
			filter_id: isNsfw ? FILTERS.nsfw : FILTERS.safe,
			q: (typeof queryString === "number" || Number.parseInt(queryString).toString() === queryString) ? `id:${Number.parseInt(queryString).toString()}` : queryString.replace(/best pony/g, "(ts,solo)")
		};
		let images;
		let response = await super.query("GET", query);

		if (response.total === 0)
			throw new this.constructor.Error(`No images were found for \`${queryString}\``);
		else if (response.total > 1) {
			const page = (response.total > response.search.length) ? (Math.random() * Math.ceil(response.total / response.search.length) >>> 0) + 1 : 1;

			if (page > 1) {
				query.page = page;
				response = await super.query("GET", query);
			}
			images = response.search;
			arrayShuffle(images);
		} else
			images = response.search;
		this.length = images.length;
		this.results = images;
		return this.getBidirectionalIterator();
	}
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const image = request.results[this.index];
			const imageFileName = (image.file_name === null) ? "" : image.file_name;
			const imageUrl = new URL(`https:${image.image}`);
			const pageUrl = new URL(`/${image.id.toString()}`, BASE_URL);
			const value = {
				fields: {
					name: `${imageFileName} uploaded by ${image.uploader}`.trim(),
					value: `${image.faves}${Constants.Emotes.STAR} ${image.upvotes}${Constants.Emotes.UP} ${image.downvotes}${Constants.Emotes.DOWN} ${image.comment_count}${Constants.Emotes.COMMENT}`
				},
				footer: { iconURL: FAVICON_URL, text: `${this.index + 1}/${request.results.length}\n${image.tags}` },
				image: { url: imageUrl.toString() },
				title: pageUrl.toString(),
				url: pageUrl.toString()
			};
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
}