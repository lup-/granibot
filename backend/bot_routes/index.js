let adminRoutes = require('./admin');
let userRoutes = require('./user');

const defaultMessageRoute = userRoutes.saveMessage;

const routes = [
    { code: 'admin_new', handler: adminRoutes.new },
    { code: 'admin_group', handler: adminRoutes.group },
    { code: /^admin_select_(.+)/, handler: adminRoutes.select },
    { code: 'admin_reset', handler: adminRoutes.reset },
    { code: 'admin_send', handler: adminRoutes.send },
    { code: 'admin_reload', handler: adminRoutes.reload },
];

const events = [
    { code: 'message', handler: (ctx) => {

        let currentTarget = ctx.session.messageTarget;
        let messageTargets = {
            'admin_new': adminRoutes.catchMessage,
        }

        if (currentTarget && messageTargets[currentTarget]) {
            const messageRoute = messageTargets[currentTarget];
            return messageRoute(ctx);
        }

        return defaultMessageRoute(ctx);
    }},
];

module.exports = function (app) {
    for (const route of routes) {
        app.action(route.code, route.handler);
    }

    for (const event of events) {
        app.on(event.code, event.handler);
    }

    return app;
}