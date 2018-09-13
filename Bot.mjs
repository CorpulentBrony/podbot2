import { BotError } from "./BotError";
import * as Constants from "./Constants";
import Discord from "./node_modules/discord.js/src/index.js";
import { IgnoreList } from "./IgnoreList";
import { MessageEmbed } from "./MessageEmbed";
import * as Requests from "./requests/";
import util from "./util";

const BOT_ADMINS = ["81203047132307456" /* Corpulent Brony#1337 */];
const BOT_NAME = "Twibotism";
const BOT_SECRETS_FILE = ".bot_secrets.json";
const BOT_TRIGGER = "!";
const BOT_PRESENCE = { game: { name: "my brony cringe comp", type: 3, url: "https://iwtcits.com/" } };

export class Bot {
	constructor() {
		this.client = new Discord.Client({
			disabledEvents: [Discord.Constants.WSEvents.TYPING_START],
			messageCacheLifetime: 30 * 60,
			messageCacheMaxSize: 50,
			messageSweepInterval: 5 * 60,
			presence: BOT_PRESENCE,
			ws: { compress: true }
		});
		// this.client.on("debug", console.log);
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("ready", this.onReady.bind(this));
		this.client.on("reconnecting", this.log.bind(this, this.constructor.messages.reconnecting));
		IgnoreList.client = this.client;
	}
	log(message) { console.log(message); }
	async login() {
		const secrets = JSON.parse(await util.readFile(BOT_SECRETS_FILE));
		this.client.login(secrets.token).catch(console.error);
		return this;
	}
	onMessage(message) {
		let triggerLength = 0;

		if (!message ||  !message.channel || !message.author || message.author.bot || message.channel.type == "voice" || IgnoreList.has(message.author.id))
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
	onReady() {
		this.log(this.constructor.messages.reconnecting);
		this.client.user.setPresence(BOT_PRESENCE);
	}
	async sendApiRequest(ApiRequest, author, channel, args) {
		try {
			const request = new ApiRequest();
			const resultIterator = await request.query(args, channel.nsfw);
			const embed = new MessageEmbed(resultIterator.current().value);
			const reacts = { collect: true, default: request.length > 1, values: [Constants.Reacts.DEL] };
			const reactionCollector = await embed.send(channel, author, reacts);
			reactionCollector.on("collect", (reaction) => {
				switch (reaction.emoji.name) {
					case Constants.ReactsDecoded.FIRST: return embed.edit(resultIterator.first().value);
					case Constants.ReactsDecoded.LAST: return embed.edit(resultIterator.last().value);
					case Constants.ReactsDecoded.PREV: return embed.edit(resultIterator.prev().value);
					case Constants.ReactsDecoded.NEXT: return embed.edit(resultIterator.next().value);
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

Bot.messages = {
	ready: `${BOT_NAME} connected and ready`,
	reconnecting: `${BOT_NAME} connecting to server`
};
Bot.prototype.client = undefined;
Bot.prototype.commands = {
	async ["4"](...args) { return this.commands["4chan"].bind(this)(...args); },
	async ["4chan"]({ author, channel }, args) { return this.sendApiRequest(Requests.FourChan, author, channel, args); },
	async db({ author, channel }, args) {
		if (!args)
			return;
		return this.sendApiRequest(Requests.Derpibooru, author, channel, args);
	},
	async g(...args) { return this.commands.google.bind(this)(...args); },
	async google({ author, channel }, args) {
		if (!args)
			return;
		return this.sendApiRequest(Requests.Google.Search, author, channel, args);
	},
	async ignore({ author, channel, mentions }, args) {
		try {
			if (!BOT_ADMINS.includes(author.id))
				throw new BotError("You do not have the necessary permissions to perform this action.");
			const users = Array.from(mentions.users.values());

			if (users.length > 0) {
				const changeFunction = (args.startsWith("delete") || args.startsWith("remove")) ? IgnoreList.delete : IgnoreList.add;
				users.forEach((user) => {
					if (!BOT_ADMINS.includes(user.id))
						changeFunction(user.id);
				});
			}
			const embed = new MessageEmbed({ footer: Constants.Emotes.NO_ENTRY, description: `Current ignore list: ${await IgnoreList.toString()}`, title: "Ignore List" });
			return embed.send(channel, author);
		} catch (err) {
			if (err instanceof BotError)
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
// console.log(Discord.Constants);