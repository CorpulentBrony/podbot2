import * as Constants from "./Constants";
import { DerpibooruRequest } from "./DerpibooruRequest";
import Discord from "./node_modules/discord.js/src/index.js";
import { HttpRequest } from "./HttpRequest";
import { MessageEmbed } from "./MessageEmbed";
import * as Path from "path";
import { promisify } from "util";
import { readFile } from "fs";
import util from "./util";

const BOT_NAME = "Twibotism";
const BOT_SECRETS_FILE = ".bot_secrets.json";
const BOT_TRIGGER = "!";
const BOT_PRESENCE = { activity: { name: "my cringe comp", type: "WATCHING" } };

class Bot {
	constructor() {
		this.client = new Discord.Client({
			disabledEvents: [Discord.Constants.WSEvents.TYPING_START],
			messageCacheLifetime: 30 * 60,
			messageCacheMaxSize: 50,
			messageSweepInterval: 5 * 60,
			presence: BOT_PRESENCE,
			ws: { compress: true }
		});
		this.client.on("debug", console.log);
		this.client.on("message", this.onMessage.bind(this));
		// this.client.on("messageDelete", this.onMessageDelete.bind(this));
		// this.client.on("messageDeleteBulk", this.onMessageDeleteBulk.bind(this));
		// this.client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this));
		// this.client.on("messageReactionRemove", this.onMessageReactionRemove.bind(this));
		this.client.on("ready", this.log.bind(this, this.constructor.messages.ready));
		this.client.on("reconnecting", this.log.bind(this, this.constructor.messages.reconnecting));
	}
	log(message) { console.log(message); }
	async login() {
		const secrets = JSON.parse(await promisify(readFile)(Path.join(process.cwd(), BOT_SECRETS_FILE), { encoding: "utf8" }));
		this.client.login(secrets.token).catch(console.error);
		return this;
	}
	onMessage(message) {
		let triggerLength = 0;

		if (!message ||  !message.channel || !message.author || message.author.bot || message.channel.type == "voice")
			return;
		const content = message.content.replace(/[^\S ]/g, " ").replace(/\s{2,}/g, " ").trim();

		if (message.channel.type != "dm")
			if (content.startsWith(BOT_TRIGGER))
				triggerLength = BOT_TRIGGER.length;
			else
				return;
		const command = content.split(" ", 1)[0].slice(triggerLength).toLowerCase();
		const args = content.slice(triggerLength + command.length + 1);

		if (command in this.commands)
			return this.commands[command].bind(this, message, args)().catch(console.error);
	}
}

Bot.messages = {
	ready: `${BOT_NAME} connected and ready`,
	reconnecting: `${BOT_NAME} reconnecting to server`
};
Bot.prototype.commands = {
	async db({ author, channel }, args) {
		if (!args)
			return;
		try {
			const db = new DerpibooruRequest();
			const resultIterator = await db.query(args, channel.nsfw);
			const embed = new MessageEmbed(resultIterator.current().value);
			const reacts = { collect: true, default: db.length > 1, values: [Constants.Reacts.DEL] };
			const reactionCollector = await embed.send(channel, author, reacts);
			reactionCollector.on("collect", (reaction) => {
				switch (reaction.emoji.name) {
					case Constants.Reacts.PREV: return embed.edit(resultIterator.prev().value).catch(console.error);
					case Constants.Reacts.NEXT: return embed.edit(resultIterator.next().value).catch(console.error);
				}
			});
		} catch (err) {
			if (err instanceof HttpRequest.Error)
				err.sendEmbed(channel, author);
			else
				throw err;
		}
	},
	ping({ author, channel, createdTimestamp }) {
		const description = `Response took: ${util.formatTimestamp(Date.now() - createdTimestamp)}; average socket ping: ${util.formatTimestamp(this.client.ping)}`;
		const embed = new MessageEmbed({ footer: Constants.Emotes.PING, description, title: "Pong!" });
		return embed.send(channel, author);
	}
};

const bot = new Bot();
bot.login().catch(console.error);
// console.log(Discord.Constants);