import * as Commands from "./commands/";
import { ConsoleLogger } from "./ConsoleLogger";
import Discord from "discord.js";
import { IgnoreList } from "./IgnoreList";
import { MessageEmbed } from "./MessageEmbed";
import * as Requests from "./requests/";
import util from "./util";

// join link: https://discordapp.com/api/oauth2/authorize?client_id=479736033223901196&permissions=60488&scope=bot
const BOT_NAME = "Twibotism";
const BOT_SECRETS_FILE = ".bot_secrets.json";
const BOT_TRIGGER = "!";
const BOT_PRESENCE = { game: { name: "my brony cringe comp", type: 3, url: "https://iwtcits.com/" } };

export class Bot {
	constructor() {
		const logger = new ConsoleLogger();
		this.log = logger.log;
		this.client = new Discord.Client({
			disabledEvents: [Discord.Constants.WSEvents.TYPING_START],
			messageCacheLifetime: 30 * 60,
			messageCacheMaxSize: 50,
			messageSweepInterval: 5 * 60,
			presence: BOT_PRESENCE,
			ws: { compress: true }
		});
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("ready", this.onReady.bind(this));
		this.client.on("reconnecting", this.log.bind(this, this.constructor.messages.reconnecting));
		Object.values(Commands).forEach((Command) => Command.attach(this.commands));
		IgnoreList.client = this.client;
	}
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
		this.log(this.constructor.messages.ready);
		this.log(`${BOT_NAME} currently a member of ${this.client.guilds.size} guilds: ${this.client.guilds.map((guild) => guild.name).join(", ")}`);
		this.client.user.setPresence(BOT_PRESENCE);
	}
}

Bot.messages = {
	ready: `${BOT_NAME} connected and ready`,
	reconnecting: `${BOT_NAME} connecting to server`
};
Bot.prototype.client = undefined;
Bot.prototype.commands = {};