import * as Constants from "./Constants";
import { MessageEmbed } from "./MessageEmbed";

const ERROR_FOOTER = Constants.Emotes.ERROR;
const ERROR_IMAGE = "https://mlp.one/404.png";
const ERROR_TITLE = "oopsie woopsie";

export class BotError extends Error {
	sendEmbed(channel, author) {
		const embed = new MessageEmbed({ footer: ERROR_FOOTER, description: this.message, image: { url: ERROR_IMAGE }, title: ERROR_TITLE });
		embed.send(channel, author);
	}
}