const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const group = require('./routes/group');
const chat = require('./routes/chat');
const settings = require('./routes/settings');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = new Koa();
const router = new Router();

router
    .post('/api/group', group.save)
    .post('/api/group/list', group.list)
    .post('/api/group/delete', group.delete)
    .post('/api/group/message', group.message)
    .get('/api/group/:id', group.load)
    .post('/api/group/:id', group.load);

router
    .post('/api/chat/list', chat.list)
    .post('/api/chat/unread', chat.listUnread)
    .post('/api/chat/read', chat.markRead)
    .post('/api/chat/delete', chat.delete)
    .post('/api/chat/history', chat.history)
    .post('/api/chat/reply', chat.reply)
    .get('/api/chat/:id', chat.load)
    .post('/api/chat/:id', chat.load);

router
    .get('/api/settings', settings.load)
    .post('/api/settings', settings.save);

app
    .use(bodyParser({
        formLimit: '50mb',
        jsonLimit: '1mb',
    }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, HOST);