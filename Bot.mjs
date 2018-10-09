import * as Commands from "./commands/";
import { ConsoleLogger } from "./ConsoleLogger";
import Discord from "discord.js";
import { IgnoreList } from "./IgnoreList";
import SETTINGS from "./settings";

// join link: https://discordapp.com/api/oauth2/authorize?client_id=479736033223901196&permissions=60488&scope=bot

export class Bot {
	constructor() {
		const logger = new ConsoleLogger();
		this.log = logger.log;
		this.client = new Discord.Client({
			disabledEvents: [Discord.Constants.WSEvents.TYPING_START],
			messageCacheLifetime: 30 * 60,
			messageCacheMaxSize: 50,
			messageSweepInterval: 5 * 60,
			presence: SETTINGS.BOT.PRESENCE,
			ws: { compress: true }
		});
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("ready", this.onReady.bind(this));
		this.client.on("reconnecting", this.log.bind(this, this.constructor.messages.reconnecting));
		Object.values(Commands).forEach((Command) => Command.attach(this.commands));
		IgnoreList.client = this.client;
	}
	async login() {
		this.client.login(SETTINGS.BOT.TOKEN).catch(console.error);
		return this;
	}
	onMessage(message) {
		let triggerLength = 0;

		if (!message ||  !message.channel || !message.author || message.author.bot || message.channel.type == "voice" || IgnoreList.has(message.author.id))
			return;
		const content = message.content.replace(/[^\S ]/g, " ").replace(/\s{2,}/g, " ").trim();

		if (message.channel.type != "dm")
			if (content.startsWith(SETTINGS.BOT.TRIGGER))
				triggerLength = SETTINGS.BOT.TRIGGER.length;
			else
				return;
		const command = content.split(" ", 1)[0].slice(triggerLength).toLowerCase();
		const args = content.slice(triggerLength + command.length + 1);

		if (command in this.commands)
			return this.commands[command].bind(this, message, args)().catch(console.error);
	}
	onReady() {
		this.log(this.constructor.messages.ready);
		this.log(`${SETTINGS.BOT.NAME} currently a member of ${this.client.guilds.size} guilds: ${this.client.guilds.map((guild) => guild.name).join(", ")}`);
		this.client.user.setPresence(SETTINGS.BOT.PRESENCE);
	}
}

Bot.messages = {
	ready: `${SETTINGS.BOT.NAME} connected and ready`,
	reconnecting: `${SETTINGS.BOT.NAME} connecting to server`
};
Bot.prototype.client = undefined;
Bot.prototype.commands = {};