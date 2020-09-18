const { Telegraf } = require('telegraf');
const getGraniBot = require('./modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(async (ctx) => {
    const chatInfo = ctx.update.message.chat;
    await graniBot.saveChat(chatInfo);
    ctx.reply('Я тебя записал!');
});
bot.launch();