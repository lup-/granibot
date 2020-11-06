const Telegram = require('telegraf/telegram');
const {ObjectId} = require('mongodb');
const {getDb, newDbInstance} = require('./Database');
const moment = require('moment');

let botInstance = false;

function escapeMarkdown(text) {
    //см. https://core.telegram.org/bots/api#markdownv2-style

    let pairedSymbols = [
        {from: '*', to: '@@asterisk@@'},
        {from: '__', to: '@@underline@@'},
        {from: '_', to: '@@underscore@@'},
        {from: '~', to: '@@strikethrough@@'},
        {from: '```', to: '@@blockcode@@'},
        {from: '`', to: '@@inlinecode@@'},
    ];

    let allSymbols = pairedSymbols.concat([
        {from: '[', to: '@@lsqb@@'},
        {from: ']', to: '@@rsqb@@'},
        {from: '(', to: '@@lcrb@@'},
        {from: ')', to: '@@rcrb@@'},
    ]);

    let safeText = text;
    for (const replacement of pairedSymbols) {
        let fromRegexp = new RegExp("\\"+replacement.from+"(.*?)\\"+replacement.from, 'gms');
        let toExp = replacement.to+'$1'+replacement.to;

        safeText = safeText.replace( fromRegexp, toExp );
    }

    safeText = safeText.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '@@lsqb@@$1@@rsqb@@@@lcrb@@$2@@rcrb@@'
    );

    safeText = safeText.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    for (const replacement of allSymbols) {
        let allRegexp = new RegExp( "\\"+replacement.to, 'g' );
        safeText = safeText.replace(allRegexp, replacement.from);
    }

    return safeText;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function GraniBot(token) {
    const telegram = new Telegram(token);
    let settings = {};
    let messages = {};

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
        async listUnread() {
            let filter = {
                unread: true,
                deleted: {$in: [null, false]},
            };

            const db = await getDb();
            const chats = db.collection('chats');
            let foundChats = await chats.find(filter).toArray();

            return foundChats;
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
        async sendReply(chatId, text, markdown = false) {
            let message = await this.sendMessage(chatId, text, markdown);
            if (message) {
                await this.saveMessage(chatId, message);
            }

            return message;
        },
        async sendMessage(chatId, text, markdown = true) {
            let options = {};
            if (markdown) {
                options['parse_mode'] = 'MarkdownV2';
                text = escapeMarkdown(text);
            }

            return this.safeSend(chatId, (chatId, text, options) => telegram.sendMessage(chatId, text, options), [chatId, text, options]);
        },
        async resendMessage(chatId, message) {
            return telegram.sendCopy(chatId, message);
        },
        async safeSend(chatId, sendFn, sendArgs) {
            let response = false;

            try {
                response = await sendFn(...sendArgs);
            }
            catch (sendError) {
                if (sendError && sendError.code) {
                    if (sendError.code === 403) {
                        return this.toggleUserBlock(chatId);
                    }

                    if (sendError.code === 429) {
                        await sleep(1000);
                        return this.safeSend(chatId, sendFn, sendArgs);
                    }
                }
            }

            return response;
        },
        async resendMessageToGroup(group, message) {
            let sendPromises = group.members.map(chatId => this.safeSend(chatId, this.resendMessage, [chatId, message]));
            let sent = await Promise.all(sendPromises);
            return sent;
        },
        async getChat(id) {
            const db = await getDb();
            const chats = db.collection('chats');
            let chat = await chats.findOne({id});

            return chat;
        },
        async saveChat(chatFields) {
            const db = await getDb();
            const chats = db.collection('chats');
            const id = chatFields.id;

            let oldChat = await this.getChat(id) || {};
            let chatToSave = Object.assign(oldChat, chatFields);

            let updateResult = await chats.findOneAndReplace({id}, chatToSave, {upsert: true, returnOriginal: false});
            return updateResult.value || false;
        },
        async toggleUserBlock(chatId) {
            let updateFields = {
                id: chatId,
                blocked: moment().unix(),
            }

            return this.saveChat(updateFields);
        },
        async toggleUnreadStatus(chatId, newStatus = true) {
            let chat = await this.getChat(chatId);
            chat.unread = newStatus;
            if (newStatus === false) {
                chat.last_read = moment().unix();
            }
            return this.saveChat(chat);
        },
        async saveMessage(chatId, message) {
            const db = await getDb();
            const messages = db.collection('messages');
            const message_id = message.message_id;

            if (!message.chat_id) {
                message.chat_id = chatId;
            }

            message.received_date = moment().unix();

            let updateResult = await messages.findOneAndReplace({message_id}, message, {upsert: true, returnOriginal: false});
            let savedMessage = updateResult.value || false;
            await this.toggleUnreadStatus(chatId, true);

            return savedMessage;
        },
        async getChatHistory(chatId) {
            let chat = await this.getChat(chatId);
            let lastRead = chat ? chat.last_read || 0 : 0;

            let filter = {
                chat_id: chatId,
                received_date: {$gte: lastRead},
                deleted: {$in: [null, false]},
            };

            const db = await getDb();

            const messages = db.collection('messages');
            let foundMessages = await messages.find(filter).toArray();

            return foundMessages;
        },

        async loadSettings(defaultSettings = {}) {
            const db = await getDb();
            const settingsStore = db.collection('settings');
            let loadedSettings = await settingsStore.find({}).toArray();
            if (loadedSettings.length === 0) {
                loadedSettings = [{}];
            }

            settings = Object.assign(defaultSettings, loadedSettings[0]);
            return settings;
        },
        async reloadSettings() {
            await newDbInstance();
            settings = await this.loadSettings(settings);
            messages = settings.messages || {};
        },
        async saveSettings(newSettings) {
            const db = await getDb();
            const settingsStore = db.collection('settings');
            let filter = {};
            let settingsToSave = Object.assign(settings, newSettings);

            if (settingsToSave) {
                let settingsId = settingsToSave['_id'];
                if (settingsId) {
                    settingsId = new ObjectId(settingsId);
                    filter = {'_id': settingsId}
                    delete settingsToSave['_id'];
                }
            }

            let updateResult = await settingsStore.findOneAndReplace(filter, settingsToSave, {upsert: true, returnOriginal: false});

            return updateResult.value || false;
        },
        async initMessages() {
            let defaultMessages = {
                'greetings': `Привет. 

Ты в боте Игр граней. И это - одна из комнат Лабиринта, который у тебя еще впереди.

Тут будут разборы, объяснения, объявления и еще много чего.

Ну а пока - айда в чат:
https://t.me/joinchat/FkLb9xG5kP5vm_J6XZnc7Q

И глянь там пост в закрепе, мало ли.`,
                'admin_deny': 'Мне родители запрещают говорить с незнакомыми!',
                'admin_hello': 'Привет, мудрый гранитель!',
                'admin_need_auth': 'Гранитель, представьтесь!',
                'admin_message_listen': 'Я готов. Теперь нужно сказать что-то умное',
                'admin_message_unknown': 'Так, и что мне с этим делать?',
                'admin_message_accepted': 'Принято',
                'admin_group_list': 'Вот, есть из чего выбрать',
                'admin_group_accepted': "Так, с группой определились",
                'admin_group_error': "Ой, про группу не понял что произошло. Можно повторить?",
                'admin_reset': 'Оооооок, ладно. Сбросил',
                'admin_missing_params': 'Только начал и понял, что чего-то не хватает',
                'admin_send_info': `Переслал сообщение %id% в группу %group_name% (%sent_count%/%chats_count%)`,
                'admin_reloaded': 'Перегрузил свои настройки',
            }

            let settings = await this.loadSettings();
            let loadedMessages = settings && settings.messages ? settings.messages : {};

            messages = Object.assign(defaultMessages, loadedMessages);
            settings.messages = messages;
            await this.saveSettings(settings);

            return messages;
        },
        getMessage(code) {
            return messages[code] || code;
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