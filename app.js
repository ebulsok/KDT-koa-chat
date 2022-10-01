// @ts-check
const Koa = require('koa');
const websockify = require('koa-websocket');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');
require('dotenv').config();

const Pug = require('koa-pug');
const path = require('path');

const mongoClient = require('./public/mongo');

const _client = mongoClient.connect();

const app = websockify(new Koa());
const PORT = process.env.PORT;

app.use(mount('/public', serve('public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

app.ws.use(
  route.all('/chat', async (ctx) => {
    const { server } = app.ws;

    const client = await _client;
    const cursor = client.db('KDT-1').collection('chats');
    const chats = cursor.find({}, { sort: { createdAt: 1 } });
    const chatsData = await chats.toArray();

    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        data: { chatsData },
      })
    );

    server?.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: 'chat',
          data: {
            name: 'system',
            msg: `새로운 유저가 참여했습니다. 현재 유저 수: ${server.clients.size}`,
            bg: 'bg-danger',
            textColor: 'text-white',
          },
        })
      );
    });

    ctx.websocket.on('message', async (message) => {
      const chat = JSON.parse(message.toString());
      const insertClient = await _client;
      const chatCursor = insertClient.db('KDT-1').collection('chats');
      await chatCursor.insertOne({
        ...chat,
        createdAt: new Date(),
      });

      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: { ...chat },
          })
        );
      });
    });

    ctx.websocket.on('close', (message) => {
      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              name: 'server',
              msg: `유저가 퇴장했습니다. 현재 유저 수: ${server.clients.size}`,
              bg: 'bg-dark',
              textColor: 'text-white',
            },
          })
        );
      });
    });
  })
);

app.use(async (ctx, next) => {
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`서버는 ${PORT}에서 작동 중입니다.`);
});
