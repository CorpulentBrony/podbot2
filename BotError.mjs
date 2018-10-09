import { MessageEmbed } from "./MessageEmbed";
import SETTINGS from "./settings";

export class BotError extends Error {
	sendEmbed(channel, author) {
		const embed = new MessageEmbed({ footer: SETTINGS.ERROR.FOOTER, description: this.message, image: { url: SETTINGS.ERROR.IMAGE }, title: SETTINGS.ERROR.TITLE });
		embed.send(channel, author);
	}
}