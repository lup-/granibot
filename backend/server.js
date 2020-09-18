const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const group = require('./routes/group');
const chat = require('./routes/chat');

const PORT = 3000;
const HOST = '0.0.0.0';

const app = new Koa();
const router = new Router();

router
    .get('/api/group/:id', group.load)
    .post('/api/group/:id', group.load)
    .post('/api/group', group.save)
    .post('/api/group/list', group.list)
    .post('/api/group/delete', group.delete)
    .post('/api/group/message', group.message);

router
    .get('/api/chat/:id', chat.load)
    .post('/api/chat/:id', chat.load)
    .post('/api/chat/list', chat.list)
    .post('/api/chat/delete', chat.delete);

app
    .use(bodyParser({
        formLimit: '50mb',
        jsonLimit: '1mb',
    }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, HOST);