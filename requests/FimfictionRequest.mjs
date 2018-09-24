import * as Constants from "/Constants";
import { HttpRequest } from "./HttpRequest";
import util from "/util";

//https://www.fimfiction.net/developers/api/v2/docs/applications
const BASE_URL = "https://www.fimfiction.net";
const FAVICON_URL = "https://static.fimfiction.net/images/favicon.png";
const SEARCH_FIELDS = { ["fields[story]"]: "author,color,cover_image,description,name,num_comments,num_dislikes,num_likes,num_words,tags,title", ["fields[story_tag]"]: "name", ["fields[user]"]: "name" };
const SEARCH_PATH = "/api/v2/stories";
const SECRETS_FILE = ".fimfiction_secrets.json";
const STORY_BASE_URL = "https://www.fimfiction.net/story/";

export class FimfictionRequest extends HttpRequest {
	static get secrets() {
		delete this.secrets;
		return Object.defineProperty(this, "secrets", { value: this.getSecrets() }).secrets;
	}
	static async getSecrets() { return JSON.parse(await util.readFile(SECRETS_FILE)); }
	constructor() { super(new URL(SEARCH_PATH, BASE_URL)); }
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
				description: story.attributes.description.replace(/\[[^\[\]]+\]/g, "").trim(),
				fields: {
					name: "--",
					value: `${numWords}${Constants.Emotes.BAR_CHART} ${numLikes}${Constants.Emotes.UP} ${numDislikes}${Constants.Emotes.DOWN} ${numComments}${Constants.Emotes.COMMENT}`
				},
				footer: { iconURL: FAVICON_URL, text: `${(this.index + 1).toString()}/${request.results.length.toString()}\n\r${request.getTags(story.relationships.tags.data)}` },
				thumbnail: ("cover_image" in story.attributes) ? { url: story.attributes.cover_image.full } : undefined,
				title: `${story.attributes.title} written by ${author.attributes.name}`.trim(),
				url: `${STORY_BASE_URL}${story.id}`
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
	getIncludedById(id, cachedType, includedType) {
		if (this.cache[cachedType].has(id))
			return this.cache[cachedType].get(id);
		return this.cache[cachedType].set(id, this.included.filter((included) => included.id === id && included.type === includedType)[0]).get(id);
	}
	getTags(tagArray) {
		if (this.cache.tags.has(tagArray))
			return this.cache.tags.get(tagArray);
		return this.cache.tags.set(tagArray, tagArray.map(({ id, type }) => this.getIncludedById(id, "tag", type)).map(({ attributes }) => attributes.name).join(", ")).get(tagArray);
	}
	async query(queryString, isNsfw = false) {
		const query = Object.assign({ ["page[size]"]: 20, query: queryString.replace(/best pony/g, "Twilight Sparkle") }, SEARCH_FIELDS);
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
		const [result, secrets] = await Promise.all([HttpRequest.headers.getDefault(), FimfictionRequest.secrets]);
		return this.default = Object.assign({ authorization: `Bearer ${secrets.token}` }, result, this.accept);
	}
});
FimfictionRequest.prototype.cache = { author: new Map(), tag: new Map(), tags: new WeakMap() };
FimfictionRequest.prototype.included = [];