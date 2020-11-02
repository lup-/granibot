const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const applyRoutes = require('./bot_routes');
const {__} = require('./modules/Messages');
const {makeAdminMenu} = require('./bot_menus');
const getGraniBot = require('./modules/GraniBot');

const app = new Telegraf(process.env.BOT_TOKEN);
app.use((new LocalSession({ database: 'bot_sessions.json' })).middleware())

const graniBot = getGraniBot(process.env.BOT_TOKEN);

graniBot.initMessages().then(() => {

    app.start(async (ctx) => {
        const chatInfo = ctx.update.message.chat;
        let messageText = ctx.update.message.text;
        let commandParams = messageText.replace('/start ', '');

        let chat = await graniBot.saveChat(chatInfo);
        if (commandParams.length > 0) {
            let groupId = commandParams;
            await graniBot.addChatToGroup(chat.id, groupId);
        }

        return ctx.reply(__('greetings'));
    });

    app.command('admin', async ctx => {
        const chatInfo = ctx.update.message.chat;
        let admins = [483896081, 21850982, 373480439];
        let isNotAdmin = admins.indexOf(chatInfo.id) === -1;

        ctx.session.isAdmin = !isNotAdmin;
        ctx.session.group = ctx.session.group || false;
        ctx.session.message = ctx.session.message || false;

        if (isNotAdmin) {
            return ctx.reply(__('admin_deny'));
        }

        let rootMenu = makeAdminMenu(ctx.session);
        return ctx.reply(__('admin_hello'), rootMenu, Telegraf.Extra.markdown());
    });

    applyRoutes(app);
    app.launch();
});