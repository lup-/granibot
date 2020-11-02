const {getDb} = require('../modules/Database');
const shortid = require('shortid');
const moment = require('moment');

const getGraniBot = require('../modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

module.exports = {
    async load(ctx) {
        const id = ctx.params.id;

        if (!id) {
            ctx.body = {group: false};
            return;
        }

        let chat = graniBot.getChat(id);

        if (!chat) {
            ctx.body = {chat: false};
            return;
        }

        ctx.body = {chat};
        return;
    },
    async list(ctx) {
        let filter = ctx.request.body && ctx.request.body.filter
            ? ctx.request.body.filter || {}
            : {};
        let defaultFilter = {
            deleted: {$in: [null, false]},
        };

        const db = await getDb();
        filter = Object.assign(defaultFilter, filter);

        const chats = db.collection('chats');
        let foundChats = await chats.find(filter).toArray();

        ctx.body = {chats: foundChats};
        return;
    },
    async listUnread(ctx) {
        let foundChats = await graniBot.listUnread();
        ctx.body = {chats: foundChats};
        return;
    },
    async delete(ctx, next) {
        const id = ctx.request.body.id;

        if (!id) {
            ctx.body = {group: false};
            return next();
        }

        const db = await getDb();
        const chats = db.collection('chats');
        let chatFields = await chats.findOne({id});

        chatFields = Object.assign(chatFields, {
            deleted: true,
            dateDeleted: moment().toISOString(),
        });

        let updateResult = await chats.findOneAndReplace({id}, chatFields, {returnOriginal: false});
        let chat = updateResult.value || false;

        ctx.body = {chat};
        return;
    },
    async markRead(ctx) {
        const id = ctx.request.body.chatId;

        if (!id) {
            ctx.body = {chat: false};
            return;
        }

        let chat = await graniBot.toggleUnreadStatus(id, false);
        ctx.body = {chat};
        return;
    },
    async history(ctx) {
        const chatId = ctx.request.body.chatId;

        let history = await graniBot.getChatHistory(chatId);

        ctx.body = {history};
        return;
    },
    async reply(ctx) {
        const chatId = ctx.request.body.chatId;
        const text =  ctx.request.body.text;

        if (!chatId || !text) {
            ctx.body = {sent: false};
            return;
        }

        let sent = await graniBot.sendReply(chatId, text, false);
        let history = await graniBot.getChatHistory(chatId);

        ctx.body = {sent, history};
        return;
    }
}