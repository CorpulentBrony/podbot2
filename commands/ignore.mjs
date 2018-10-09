import { AbstractApiRequestCommand } from "./AbstractApiRequestCommand";
import { BotError } from "/BotError";
import { IgnoreList } from "/IgnoreList";
import { MessageEmbed } from "/MessageEmbed";
import SETTINGS from "/settings";

export class ignore extends AbstractApiRequestCommand {
	static async exec({ author, channel, mentions }, args) {
		try {
			if (!SETTINGS.BOT.ADMINS.includes(author.id))
				throw new BotError("You do not have the necessary permissions to perform this action.");
			const users = Array.from(mentions.users.values());

			if (users.length > 0) {
				const changeFunction = (args.startsWith("delete") || args.startsWith("remove")) ? IgnoreList.delete : IgnoreList.add;
				users.forEach((user) => {
					if (!SETTINGS.BOT.ADMINS.includes(user.id))
						changeFunction(user.id);
				});
			}
			const embed = new MessageEmbed({ footer: SETTINGS.EMOTES.ALL.NO_ENTRY, description: `Current ignore list: ${await IgnoreList.toString()}`, title: "Ignore List" });
			return embed.send(channel, author);
		} catch (err) {
			if (err instanceof BotError)
				err.sendEmbed(channel, author);
			else
				throw err;
		}
	}
}
ignore.ALIASES = SETTINGS.COMMANDS.ALIASES.IGNORE;