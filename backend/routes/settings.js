const getGraniBot = require('../modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

module.exports = {
    async load(ctx, next) {
        ctx.body = {settings: await graniBot.loadSettings()};

        return next();
    },
    async save(ctx, next) {
        let settings = ctx.request.body.settings;

        ctx.body = {settings: await graniBot.saveSettings(settings)};
        return next();
    },
}