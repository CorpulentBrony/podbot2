import { HttpRequest } from "./HttpRequest";
import { arrayShuffle } from "/util";
import { BotError } from "/BotError";
import * as Constants from "/Constants";
import He from "he";
import * as Path from "path";

const BASE_API_URL = "https://a.4cdn.org";
const BASE_IMAGE_URL = "https://i.4cdn.org";
const BASE_LINK_URL = "https://boards.4chan.org";
const DEFAULT_BOARD = "mlp";
const FAVICON_URL = "https://s.4cdn.org/image/apple-touch-icon-iphone-retina.png";
const SEARCH_PATH = "catalog.json";

export class FourChanRequest extends HttpRequest {
	constructor(board = DEFAULT_BOARD) {
		super(new URL(Path.resolve("/", board, SEARCH_PATH), BASE_API_URL));
		[this.baseUrl, this.board] = [new URL(`${Path.resolve("/", board, "thread")}/`, BASE_LINK_URL), board];
	}
	getBidirectionalIterator() {
		const request = this;
		const current = function() {
			const thread = request.results[this.index];
			const threadImages = thread.images ? thread.images.toString() : "0";
			const threadReplies = thread.replies ? thread.replies.toString() : "0";
			const isSingleThread = request.isSingleThread && this.index > 0;
			const threadDetail = isSingleThread ? "" : `${thread.no.toString()}\n${threadImages}${Constants.Emotes.IMAGE} ${threadReplies}${Constants.Emotes.COMMENT}\n`;
			request.baseUrl.hash = isSingleThread ? `p${thread.no.toString()}` : "";
			const value = {
				description: `${threadDetail}${request.constructor.formatHtml(thread.com)}`,
				footer: { iconURL: FAVICON_URL, text: `${(this.index + 1).toString()}/${request.results.length.toString()}` },
				image: thread.tim ? { url: BASE_IMAGE_URL + Path.resolve("/", request.board, `${thread.tim}${thread.ext}`) } : undefined,
				title: `${thread.sub ? thread.sub : "Thread"} posted by ${thread.name}`,
				url: request.baseUrl.toString()
			};
			return { done: false, value };
		};
		return super.getBidirectionalIterator(current);
	}
	async query(queryString) {
		const threadNumber = Number.parseInt(queryString).toString();
		const queryStringIsNumeric = typeof queryString === "number" || threadNumber === queryString;
		let results = [];

		if (queryStringIsNumeric)
			[this.baseUrl.pathname, this.isSingleThread, this.url] = [`${this.baseUrl.pathname}${threadNumber}`, true, new URL(Path.resolve("/", this.board, "thread", `${threadNumber}.json`), BASE_API_URL)];
		const response = await super.query();

		if (!queryStringIsNumeric) {
			const threads = response.reduce((result, page) => result.concat(page.threads), []);

			if (queryString) {
				const regExps = queryString.split(",").map((term) => new RegExp(`\\b${term.trim().replace("*", "[^\\b]*")}\\b`, "i"));
				results = threads.filter((thread) => regExps.every((regExp) => thread.com && regExp.test(thread.com) || thread.sub && regExp.test(thread.sub)));
			} else
				results = threads;

			if (results.length === 1)
				return this.query(results[0].no);
			results = arrayShuffle(results);
		} else
			results = response.posts;

		if (results.length === 0)
			throw new BotError(`No threads were found for \`${queryString}\``);
		this.results = results;
		this.length = this.results.length;
		return this.getBidirectionalIterator();
	}
}
FourChanRequest.formatHtml = function(html) { return (typeof html === "string") ? He.decode(html.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "")) : ""; };
FourChanRequest.prototype.baseUrl = BASE_API_URL;
FourChanRequest.prototype.board = DEFAULT_BOARD;
FourChanRequest.prototype.isSingleThread = false;