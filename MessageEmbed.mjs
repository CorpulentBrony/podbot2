import * as Constants from "./Constants";
import util from "./util";

const DEFAULT_EMBED_COLOR = 0x673888;
const DEFAULT_REACTS = { del: Constants.Reacts.DEL, next: Constants.Reacts.NEXT, prev: Constants.Reacts.PREV, stop: Constants.Reacts.STOP };
const DEFAULT_REACTS_COLLECT_OPTIONS = { time: 300000 };
const DEFAULT_REACTS_DISPLAY_ORDER = ["prev", "next", "stop", "del"];

export class MessageEmbed {
	constructor(options) {
		this.embed = new this.constructor.Embed(options);

		if (options.channel)
			this.channel = options.channel;
	}
	async edit(options) {
		const message = await this.message;
		return message.edit(undefined, { embed: this.embed.assign(options) });
	}
	async removeReactions(reactsToDelete) {
		for (const [snowflake, reaction] of this.message.reactions)
			if (reactsToDelete.includes(reaction.emoji.name))
				for (const [snowflake, user] of await reaction.fetchUsers())
					reaction.remove(user).catch((err) => {
						if (err.message !== "Missing Permissions")
							console.error(err);
						else
							throw err;
					});
	}
	async send(channel = this.channel, author = this.embed.author, reacts) {
		author = (typeof author === "object") ? { author: { icon_url: util.toString(author.avatarURL), name: util.toString(author.username) } } : {};
		reacts = (typeof reacts !== "object") ? { default: false, values: [] } : { collect: reacts.collect, default: Boolean(reacts.default), values: Array.isArray(reacts.values) ? reacts.values : [] };
		this.message = channel.send(undefined, { embed: Object.assign(this.embed, author) }).catch(console.error);

		if (reacts.default || reacts.values.length > 0) {
			const reactsToSend = (reacts.default ? this.constructor.DEFAULT_REACTS : reacts.values);
			this.message = await this.message;

			for (const react of reactsToSend)
				await this.message.react(react);

			if (reacts.collect) {
				if (typeof reacts.collect !== "object")
					reacts.collect = new Boolean(reacts.collect);

				if (!reacts.collect.options)
					reacts.collect.options = DEFAULT_REACTS_COLLECT_OPTIONS;
				const reactionCollector = this.message.createReactionCollector((reaction, user) => !user.bot && reactsToSend.includes(reaction.emoji.name), reacts.collect.options);
				reactionCollector.on("collect", (reaction) => {
					switch (reaction.emoji.name) {
						case Constants.Reacts.STOP: reactionCollector.stop(); break;
						case Constants.Reacts.DEL: reaction.message.delete().catch(console.error);
					}
				});
				reactionCollector.on("end", () => this.removeReactions(reactsToSend).catch(console.error));
				return reactionCollector;
			}
		}
		return { message: this.message };
	}
}
MessageEmbed.DEFAULT_REACTS = DEFAULT_REACTS_DISPLAY_ORDER.map((reactName) => DEFAULT_REACTS[reactName]);
MessageEmbed.Embed = class Embed {
	constructor(options) {
		this.assign(options);

		if (typeof this.color !== "number")
			this.color = DEFAULT_EMBED_COLOR;
	}
	assign(options) {
		for (const optionKey in options)
			switch (optionKey) {
				case "channel": break;
				case "fields": this.fields = Array.isArray(options.fields) ? fields.map((field) => new this.constructor.Field(field)) : [new this.constructor.Field(options.fields)]; break;
				case "footer": this.footer = new this.constructor.Footer(options.footer); break;
				default: this[optionKey] = (typeof options[optionKey] === "string") ? this.constructor.trim(options[optionKey], optionKey) : options[optionKey];
			}
		return this;
	}
};
MessageEmbed.Embed.Field = class Field {
	constructor(nameOrFieldObject, value = undefined, inline = false) {
		let name;

		if (typeof nameOrFieldObject === "object" && "name" in nameOrFieldObject)
			[this.inline, name, value] = [Boolean(nameOrFieldObject.inline), nameOrFieldObject.name, nameOrFieldObject.value];
		else
			[this.inline, name, value] = [Boolean(inline), nameOrFieldObject, value];
		[this.name, this.value] = [this.constructor.parent.trim(name, "name", this.constructor.parent.fieldLengths.field), this.constructor.parent.trim(value, "value", this.constructor.parent.fieldLengths.field)];
	}
};
MessageEmbed.Embed.Field.parent = MessageEmbed.Embed;
MessageEmbed.Embed.Footer = class Footer {
	constructor(textOrFooterObject, iconURL = undefined) {
		let text;

		if (typeof textOrFooterObject === "object" && "text" in textOrFooterObject)
			[this.iconURL, text] = [util.toString(textOrFooterObject.iconURL), textOrFooterObject.text];
		else
			[this.iconURL, text] = [util.toString(iconURL), textOrFooterObject];
		[this.icon_url, this.text] = [this.iconURL, this.constructor.parent.trim(text, "text", this.constructor.parent.fieldLengths.footer)];
	}
};
MessageEmbed.Embed.Footer.parent = MessageEmbed.Embed;
MessageEmbed.Embed.fieldLengths = { description: 2048, field: { name: 256, value: 1024 }, footer: { text: 2048 }, title: 256 };
MessageEmbed.Embed.trim = function(string, fieldName, fieldParent = MessageEmbed.Embed.fieldLengths) {
	[fieldName, string] = [util.toString(fieldName), util.toString(string)];

	if (typeof string !== "string" || typeof fieldParent !== "object" || !(fieldName in fieldParent) || typeof fieldParent[fieldName] !== "number" || string.length <= fieldParent[fieldName])
		return string;
	return `${string.slice(0, fieldParent[fieldName] - 1)}…`;
}