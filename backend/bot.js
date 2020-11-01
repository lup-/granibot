const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const getGraniBot = require('./modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use((new LocalSession({ database: 'bot_sessions.json' })).middleware())

function makeAdminMenu(session = {}) {
    let group = session.group || false;
    let message = session.message || false;

    let menu = Telegraf.Extra
        .markdown()
        .markup(m => {
            const b = m.callbackButton;

            return m.inlineKeyboard([
                [ b(message ? '✅ Пост сделан' : 'Создать пост', 'admin_new'), b(group ? `✅ ${group.name}` : 'Выбрать группу', 'admin_group') ],
                [ b( 'Сбросить все', 'admin_reset' ), b('Отправить', 'admin_send') ]
            ]);
        });

    return menu;
}

async function makeGroupsMenu(selectedGroup = false) {
    let groups = await graniBot.listGroups();

    let menu = Telegraf.Extra
        .markdown()
        .markup(m => {
            let buttons = groups.map(group => {
                let buttonAction = `admin_select_${group.id}`;
                let buttonText = group.name;

                if (selectedGroup.id === group.id) {
                    buttonText = '✅ ' + buttonText;
                }

                return [m.callbackButton(buttonText, buttonAction)];
            });

            return m.inlineKeyboard(buttons);
        });

    return menu;
}

bot.start(async (ctx) => {
    const chatInfo = ctx.update.message.chat;
    let messageText = ctx.update.message.text;
    let commandParams = messageText.replace('/start ', '');

    let chat = await graniBot.saveChat(chatInfo);
    if (commandParams.length > 0) {
        let groupId = commandParams;
        await graniBot.addChatToGroup(chat.id, groupId);
    }

    return ctx.reply(`Привет. 

Ты в боте Игр граней. И это - одна из комнат Лабиринта, который у тебя еще впереди.

Тут будут разборы, объяснения, объявления и еще много чего. Тут же можно и спросить что-нибудь, если что.

Ну а пока - айда в чат:
https://t.me/joinchat/FkLb9xG5kP5vm_J6XZnc7Q

И глянь там пост в закрепе, мало ли.`);
});

bot.command('admin', async ctx => {
    const chatInfo = ctx.update.message.chat;
    let admins = [483896081, 21850982, 373480439];
    let isNotAdmin = admins.indexOf(chatInfo.id) === -1;

    ctx.session.isAdmin = !isNotAdmin;
    ctx.session.group = ctx.session.group || false;
    ctx.session.message = ctx.session.message || false;

    if (isNotAdmin) {
        return ctx.reply('Мне родители запрещают говорить с незнакомыми!');
    }

    let rootMenu = makeAdminMenu(ctx.session);
    return ctx.reply('Привет, мудрый гранитель!', rootMenu, Telegraf.Extra.markdown());
});

bot.action('admin_new', async ctx => {
    let isAdmin = ctx.session.isAdmin ;
    if (!isAdmin) {
        return ctx.reply('Гранитель, представьтесь!');
    }

    ctx.session.useNextMessage = true;
    return ctx.reply('Я готов. Теперь нужно сказать что-то умное');
});

bot.on('message', async (ctx, next) => {
    let isAdmin = ctx.session.isAdmin;
    let useNextMessage = ctx.session.useNextMessage;

    if (!isAdmin) {
        return next();
    }

    if (!useNextMessage) {
        return ctx.reply('Так, и что мне с этим делать?');
    }

    ctx.session.message = ctx.update.message;
    let rootMenu = makeAdminMenu(ctx.session);
    return ctx.reply( 'Принято', rootMenu, Telegraf.Extra.markdown() );
});

bot.action('admin_group', async ctx => {
    let isAdmin = ctx.session.isAdmin ;
    if (!isAdmin) {
        return ctx.reply('Гранитель, представьтесь!');
    }

    let currentGroup = ctx.session.group || false;
    let groupsMenu = await makeGroupsMenu(currentGroup);
    return ctx.reply( 'Вот, есть из чего выбрать', groupsMenu, Telegraf.Extra.markdown() );
});

bot.action(/^admin_select_(.+)/, async ctx => {
    let isAdmin = ctx.session.isAdmin ;
    if (!isAdmin) {
        return ctx.reply('Гранитель, представьтесь!');
    }

    let groupId = ctx.match[1];
    let group = await graniBot.getGroup(groupId);
    let message = "Так, с группой определились";

    ctx.session.group = group || false;
    let rootMenu = makeAdminMenu(ctx.session);

    if (!group) {
        message = "Ой, про группу не понял что произошло. Можно повторить?";
    }

    return ctx.reply( message, rootMenu, Telegraf.Extra.markdown() );
});

bot.action('admin_reset', async ctx => {
    let isAdmin = ctx.session.isAdmin ;
    if (!isAdmin) {
        return ctx.reply('Гранитель, представьтесь!');
    }

    ctx.session.group = false;
    ctx.session.message = false;

    let rootMenu = makeAdminMenu(ctx.session);

    return ctx.reply( 'Оооооок, ладно. Сбросил', rootMenu, Telegraf.Extra.markdown() );
});

bot.action('admin_send', async ctx => {
    let isAdmin = ctx.session.isAdmin ;
    if (!isAdmin) {
        return ctx.reply('Гранитель, представьтесь!');
    }

    let group = ctx.session.group;
    let message = ctx.session.message;
    let rootMenu = makeAdminMenu(ctx.session);

    if (!group || !message) {
        return ctx.reply('Только начал и понял, что чего-то не хватает', rootMenu, Telegraf.Extra.markdown());
    }

    let sentMessages = await graniBot.resendMessageToGroup(group, message);
    let chatsCount = group.members.length;
    let sentCount = sentMessages.reduce((count, message) => {
        let isSent = message && message.message_id;
        if (isSent) {
            count++;
        }
        return count;
    }, 0);

    return ctx.reply(`Переслал сообщение ${message.message_id} в группу ${group.name} (${sentCount}/${chatsCount})`, rootMenu, Telegraf.Extra.markdown());
});

bot.launch();