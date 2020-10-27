const { Telegraf } = require('telegraf');
const getGraniBot = require('./modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const chatInfo = ctx.update.message.chat;
    let messageText = ctx.update.message.text;
    let commandParams = messageText.replace('/start ', '');

    let chat = await graniBot.saveChat(chatInfo);
    if (commandParams.length > 0) {
        let groupId = commandParams;
        let group = await graniBot.addChatToGroup(chat.id, groupId);
        return ctx.reply(`Добро пожаловать в группу "${group.name}"!`);
    }

    return ctx.reply('Спасибо за заявку, ожидайте сообщений!');
});

bot.launch();