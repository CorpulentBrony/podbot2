import { HttpRequest } from "./HttpRequest";
import { arrayShuffle } from "/util";
import SETTINGS from "/settings";

export class DerpibooruRequest extends HttpRequest {
	constructor() { super(new URL(SETTINGS.REQUESTS.DERPIBOORU.API_PATH, SETTINGS.REQUESTS.DERPIBOORU.URL)); }
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const image = request.results[this.index];
			const commentCount = image.comment_count.toLocaleString();
			const downvotes = image.downvotes.toLocaleString();
			const faves = image.faves.toLocaleString();
			const imageFileName = (image.file_name === null) ? "" : image.file_name;
			const imageUrl = new URL(`https:${image.image}`);
			const pageUrl = new URL(`/${image.id.toString()}`, SETTINGS.REQUESTS.DERPIBOORU.URL);
			const upvotes = image.upvotes.toLocaleString();
			const value = {
				description: image.description,
				fields: {
					name: "--",
					value: `${faves}${SETTINGS.EMOTES.ALL.STAR} ${upvotes}${SETTINGS.EMOTES.ALL.UP} ${downvotes}${SETTINGS.EMOTES.ALL.DOWN} ${commentCount}${SETTINGS.EMOTES.ALL.COMMENT}`
				},
				footer: { iconURL: SETTINGS.REQUESTS.DERPIBOORU.FAVICON, text: `${(this.index + 1).toString()}/${request.results.length.toString()}\n${image.tags}` },
				image: { url: imageUrl.toString() },
				title: `${imageFileName} uploaded by ${image.uploader}`.trim(),
				url: pageUrl.toString()
			};
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString, isNsfw = false) {
		const query = {
			filter_id: isNsfw ? SETTINGS.REQUESTS.DERPIBOORU.FILTERS.nsfw : SETTINGS.REQUESTS.DERPIBOORU.FILTERS.safe,
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
}