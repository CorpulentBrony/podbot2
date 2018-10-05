import { AbstractApiRequestCommand } from "./AbstractApiRequestCommand";
import * as Constants from "/Constants";
import { MessageEmbed } from "/MessageEmbed";
import util from "/util";

export class ping extends AbstractApiRequestCommand {
	static exec({ author, channel, createdTimestamp }) {
		const description = `Response took: ${util.formatTimestamp(Date.now() - createdTimestamp)}; average socket ping: ${util.formatTimestamp(this.client.ping)}`;
		const embed = new MessageEmbed({ footer: Constants.Emotes.PING, description, title: "Pong!" });
		return embed.send(channel, author);
	}
}
ping.bindWithSelf = false;