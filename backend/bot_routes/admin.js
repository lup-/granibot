const { Telegraf } = require('telegraf');

const getGraniBot = require('../modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);
const {__} = require('../modules/Messages');
const {makeAdminMenu, makeGroupsMenu} = require('../bot_menus');

module.exports = {
    async new (ctx) {
        if (!ctx.session.isAdmin) {
            return ctx.reply(__('admin_need_auth'));
        }

        ctx.session.messageTarget = 'admin_new';
        return ctx.reply(__('admin_message_listen'));
    },
    async group(ctx) {
        if (!ctx.session.isAdmin) {
            return ctx.reply(__('admin_need_auth'));
        }

        let currentGroup = ctx.session.group || false;
        let groupsMenu = await makeGroupsMenu(currentGroup);
        return ctx.reply( __('admin_group_list'), groupsMenu, Telegraf.Extra.markdown() );
    },
    async select(ctx) {
        if (!ctx.session.isAdmin) {
            return ctx.reply(__('admin_need_auth'));
        }

        let groupId = ctx.match[1];
        let group = await graniBot.getGroup(groupId);
        let message = __('admin_group_accepted');

        ctx.session.group = group || false;
        let rootMenu = makeAdminMenu(ctx.session);

        if (!group) {
            message = __('admin_group_error');
        }

        return ctx.reply( message, rootMenu, Telegraf.Extra.markdown() );
    },
    async reset(ctx) {
        if (!ctx.session.isAdmin) {
            return ctx.reply(__('admin_need_auth'));
        }

        ctx.session.group = false;
        ctx.session.message = false;
        ctx.session.messageTarget = false;

        let rootMenu = makeAdminMenu(ctx.session);

        return ctx.reply( __('admin_reset'), rootMenu, Telegraf.Extra.markdown() );
    },
    async send(ctx) {
        if (!ctx.session.isAdmin) {
            return ctx.reply(__('admin_need_auth'));
        }

        let group = ctx.session.group;
        let message = ctx.session.message;
        let rootMenu = makeAdminMenu(ctx.session);

        if (!group || !message) {
            return ctx.reply(__('admin_missing_params'), rootMenu, Telegraf.Extra.markdown());
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

        let results = {
            id: message.message_id,
            group_name: group.name,
            sent_count: sentCount,
            chats_count: chatsCount,
        }

        return ctx.reply(__('admin_send_info', results), rootMenu, Telegraf.Extra.markdown());
    },
    async catchMessage(ctx, next) {
        if (!ctx.session.isAdmin) {
            return next();
        }

        ctx.session.message = ctx.update.message;
        ctx.session.messageTarget = false;

        let rootMenu = makeAdminMenu(ctx.session);
        return ctx.reply( __('admin_message_accepted'), rootMenu, Telegraf.Extra.markdown() );
    },
    async reload(ctx) {
        await graniBot.reloadSettings();
        let rootMenu = makeAdminMenu(ctx.session);
        return ctx.reply( __('admin_reloaded'), rootMenu, Telegraf.Extra.markdown() );
    }

}