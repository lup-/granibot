const getGraniBot = require('../modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

module.exports = {
    async saveMessage(ctx) {
        const chatInfo = ctx.update.message.chat;
        let message = ctx.update.message;

        await graniBot.saveMessage(chatInfo.id, message);

        return;
    }
}