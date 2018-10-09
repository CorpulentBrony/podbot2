import { HttpRequest } from "./HttpRequest";
import { InternalCacheMixin } from "/InternalCacheMixin";
import SETTINGS from "/settings";
import util from "/util";

// API documentation: https://www.fimfiction.net/developers/api/v2/docs/applications

export class FimfictionRequest extends InternalCacheMixin(HttpRequest, { author: Map, tag: Map, tags: WeakMap }) {
	constructor() { super(new URL(SETTINGS.REQUESTS.FIMFICTION.API_PATH, SETTINGS.REQUESTS.FIMFICTION.URL)); }
	getAuthor(id) { return this.getIncludedById(id, "author", "user"); }
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const story = request.results[this.index];
			const author = request.getAuthor(story.relationships.author.data.id);
			const numComments = story.attributes.num_comments.toLocaleString();
			const numDislikes = Math.max(story.attributes.num_dislikes, 0).toLocaleString();
			const numLikes = Math.max(story.attributes.num_likes, 0).toLocaleString();
			const numWords = story.attributes.num_words.toLocaleString();
			const value = {
				color: undefined,
				description: util.formatBbCode(story.attributes.description),
				fields: {
					name: "--",
					value: `${numWords}${SETTINGS.EMOTES.ALL.BAR_CHART} ${numLikes}${SETTINGS.EMOTES.ALL.UP} ${numDislikes}${SETTINGS.EMOTES.ALL.DOWN} ${numComments}${SETTINGS.EMOTES.ALL.COMMENT}`
				},
				footer: { iconURL: SETTINGS.REQUESTS.FIMFICTION.FAVICON, text: `${(this.index + 1).toString()}/${request.results.length.toString()}\r\n${request.getTags(story.relationships.tags.data)}` },
				thumbnail: ("cover_image" in story.attributes) ? { url: story.attributes.cover_image.full } : undefined,
				title: `${story.attributes.title} written by ${author.attributes.name}`.trim(),
				url: `${SETTINGS.REQUESTS.FIMFICTION.STORY_URL}${story.id}`
			};

			if ("color" in story.attributes) {
				const color = Number.parseInt(story.attributes.color.hex, 16);

				if (!Number.isNaN(color))
					value.color = color;
			}
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
	getIncludedById(id, cachedType, includedType) { return this.getFromCache(cachedType, id, () => this.included.filter((included) => included.id === id && included.type === includedType)[0]); }
	getTags(tagArray) { return this.getFromCache("tags", tagArray, () => tagArray.map(({ id, type }) => this.getIncludedById(id, "tag", type)).map(({ attributes }) => attributes.name).join(", ")); }
	async query(queryString, isNsfw = false) {
		const query = Object.assign({ ["page[size]"]: 20, query: queryString.replace(/best pony/g, "Twilight Sparkle") }, SETTINGS.REQUESTS.FIMFICTION.SEARCH_FIELDS);
		let response = await super.query("GET", query);

		if (response.meta.num_stories === 0)
			throw new this.constructor.Error(`No stories were found for \`${queryString}\``);
		this.length = response.data.length;
		this.results = response.data;
		this.included = response.included;
		return this.getBidirectionalIterator();
	}
}
FimfictionRequest.headers = Object.assign({}, HttpRequest.headers, {
	accept: { accept: "application/json, application/vnd.api+json" },
	async getDefault() {
		if ("default" in this)
			return this.default;
		return this.default = Object.assign({ authorization: `Bearer ${SETTINGS.REQUESTS.FIMFICTION.TOKEN}` }, await HttpRequest.headers.getDefault(), this.accept);
	}
});
FimfictionRequest.prototype.included = [];