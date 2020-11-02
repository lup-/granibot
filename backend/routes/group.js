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

        const db = await getDb();
        const groups = db.collection('groups');
        let group = await groups.findOne({id});

        if (!group) {
            ctx.body = {group: false};
            return;
        }

        ctx.body = {group};
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

        const groups = db.collection('groups');
        let foundGroups = await groups.find(filter).toArray();

        ctx.body = {groups: foundGroups};
        return;
    },
    async save(ctx) {
        const db = await getDb();
        const groups = db.collection('groups');

        let groupFields = ctx.request.body.group;
        if (!groupFields.id) {
            groupFields.id = shortid.generate();
        }

        const id = groupFields.id;

        if (groupFields._id) {
            delete groupFields._id;
        }

        let updateResult = await groups.findOneAndReplace({id}, groupFields, {upsert: true, returnOriginal: false});
        let group = updateResult.value || false;

        ctx.body = {group};
        return;
    },
    async delete(ctx) {
        const id = ctx.request.body.id;

        if (!id) {
            ctx.body = {group: false};
            return;
        }

        const db = await getDb();
        const groups = db.collection('groups');
        let groupFields = await groups.findOne({id});

        groupFields = Object.assign(groupFields, {
            deleted: true,
            dateDeleted: moment().toISOString(),
        });

        let updateResult = await groups.findOneAndReplace({id}, groupFields, {returnOriginal: false});
        let group = updateResult.value || false;

        ctx.body = {group};
        return;
    },
    async message(ctx) {
        const chats = ctx.request.body.chats;
        const text =  ctx.request.body.text;

        if (!chats || !text) {
            ctx.body = {sent: false};
            return;
        }

        let sendPromises = chats.map(chatId => graniBot.sendMessage(chatId, text, true));
        let sent = await Promise.all(sendPromises);

        ctx.body = {sent};
        return;
    }
}