import { AbstractCommand } from "./AbstractCommand";
import { BotError } from "/BotError";
import { MessageEmbed } from "/MessageEmbed";
import SETTINGS from "/settings";

export class AbstractApiRequestCommand extends AbstractCommand {
	static async exec({ author, channel }, args) {
		if (this.name.startsWith("Abstract"))
			throw new Error("Attempted to execute an abstract API request command.");
		else if (!this.areArgsOptional && !args)
			return;
		try {
			const request = new this.ApiRequest();
			const resultIterator = await request.query(args, channel.nsfw);
			const embed = new MessageEmbed(resultIterator.current().value);
			const reacts = { collect: true, default: request.length > 1, values: [SETTINGS.EMOTES.REACTS.DEL] };
			const reactionCollector = await embed.send(channel, author, reacts);
			reactionCollector.on("collect", (reaction) => {
				switch (reaction.emoji.name) {
					case SETTINGS.EMOTES.REACTS_DECODED.FIRST: return embed.edit(resultIterator.first().value);
					case SETTINGS.EMOTES.REACTS_DECODED.LAST: return embed.edit(resultIterator.last().value);
					case SETTINGS.EMOTES.REACTS_DECODED.PREV: return embed.edit(resultIterator.prev().value);
					case SETTINGS.EMOTES.REACTS_DECODED.NEXT: return embed.edit(resultIterator.next().value);
				}
			});
		} catch (err) {
			if (err instanceof BotError)
				err.sendEmbed(channel, author);
			else
				throw err;
		}
	}
}
AbstractApiRequestCommand.ApiRequest = undefined;
AbstractApiRequestCommand.areArgsOptional = false;