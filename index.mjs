import { Bot } from "./Bot";

const bot = new Bot();
bot.login().catch(console.error);
// console.log(Discord.Constants);