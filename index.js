require('dotenv').config();

const { Bot } = require('node-telegram-bot-api');

const responder = require('./responder/responder');
const sender = require('./sender/sender');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

console.log('Telegram bot starting...');

responder(bot);
sender(bot);

bot.startPolling()
    .then(() => {
        console.log('Telegram bot polling started');
    })
    .catch((error) => {
        console.error('Telegram polling error:', error);
        process.exit(1);
    });