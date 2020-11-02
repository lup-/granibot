const { Telegraf } = require('telegraf');
const getGraniBot = require('../modules/GraniBot');
const graniBot = getGraniBot(process.env.BOT_TOKEN);

function makeAdminMenu(session = {}) {
    let group = session.group || false;
    let message = session.message || false;

    let menu = Telegraf.Extra
        .markdown()
        .markup(m => {
            const b = m.callbackButton;

            return m.inlineKeyboard([
                [ b(message ? '✅ Пост сделан' : 'Создать пост', 'admin_new'), b(group ? `✅ ${group.name}` : 'Выбрать группу', 'admin_group') ],
                [ b( 'Сбросить все', 'admin_reset' ), b('Отправить', 'admin_send') ],
                [ b('Перегрузить бота', 'admin_reload') ]
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

module.exports = {makeAdminMenu, makeGroupsMenu}