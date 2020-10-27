const Telegram = require('telegraf/telegram');
const getDb = require('./Database');

let botInstance = false;

function GraniBot(token) {
    const telegram = new Telegram(token);

    return {
        async getGroup(id) {
            const db = await getDb();
            const groups = db.collection('groups');
            let foundGroups = await groups.find({id}).toArray();

            return foundGroups[0];
        },
        async listGroups() {
            let filter = {
                deleted: {$in: [null, false]},
            };

            const db = await getDb();

            const groups = db.collection('groups');
            let foundGroups = await groups.find(filter).toArray();

            return foundGroups;
        },
        async addChatToGroup(chatId, groupId) {
            const db = await getDb();
            const groups = db.collection('groups');

            let foundGroups = await groups.find({id: groupId}).toArray();
            let group = foundGroups[0];

            if (!group) {
                return false;
            }

            delete group['_id'];

            if (!group.members) {
                group.members = [];
            }

            if (group.members.indexOf(chatId) === -1) {
                group.members.push(chatId);

                let updateResult = await groups.findOneAndReplace({id: groupId}, group, {upsert: true, returnOriginal: false});
                group = updateResult.value || false;
            }

            return group;
        },
        async sendMessage(chatId, text) {
            return telegram.sendMessage(chatId, text);
        },
        async resendMessage(chatId, message) {
            return telegram.sendCopy(chatId, message);
        },
        async resendMessageToGroup(group, message) {
            let sendPromises = group.members.map(chatId => this.resendMessage(chatId, message));
            let sent = await Promise.all(sendPromises);
            return sent;
        },
        async saveChat(chatFields) {
            const db = await getDb();
            const chats = db.collection('chats');
            const id = chatFields.id;

            let updateResult = await chats.findOneAndReplace({id}, chatFields, {upsert: true, returnOriginal: false});
            return updateResult.value || false;
        }
    }
}

function getInstance(token) {
    if (botInstance) {
        return botInstance;
    }

    const BOT_TOKEN = token || process.env.BOT_TOKEN;
    botInstance = new GraniBot(BOT_TOKEN);
    return botInstance;
}

module.exports = getInstance;