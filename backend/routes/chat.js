const getDb = require('../modules/Database');
const shortid = require('shortid');
const moment = require('moment');

module.exports = {
    async load(ctx, next) {
        const id = ctx.params.id;

        if (!id) {
            ctx.body = {group: false};
            return next();
        }

        const db = await getDb();
        const chats = db.collection('chat');
        let chat = await chats.findOne({id});

        if (!chat) {
            ctx.body = {chat: false};
            return next();
        }

        ctx.body = {chat};
        return next();
    },
    async list(ctx, next) {
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
        return next();
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
        return next();
    },
}