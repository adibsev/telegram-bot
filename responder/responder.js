const db = require('../config/database');

const callApi = require('./api');

const { isAllowed } = require('./auth');


module.exports = function (bot) {


    /*
     * /start
     */

    bot.command('start', async (ctx) => {

        try {

            await saveChat(ctx);

            await ctx.reply(
                'Telegram bot aktif.'
            );

        } catch (error) {

            console.error(
                '[RESPONDER /start]',
                error
            );

        }

    });


    /*
     * /ping
     */

    bot.command('ping', async (ctx) => {

        try {

            await saveChat(ctx);

            await ctx.reply(
                'Pong!'
            );

        } catch (error) {

            console.error(
                '[RESPONDER /ping]',
                error
            );

        }

    });


    /*
     * /id
     */

    bot.command('id', async (ctx) => {

        try {

            await saveChat(ctx);

            const chatId = String(
                ctx.chat.id
            );

            await ctx.reply(
                `Chat ID: ${chatId}`
            );

        } catch (error) {

            console.error(
                '[RESPONDER /id]',
                error
            );

        }

    });


    /*
     * /status
     *
     * Command yang membutuhkan authorization
     */

    bot.command('status', async (ctx) => {

        try {

            await saveChat(ctx);


            const chatId = String(
                ctx.chat.id
            );


            /*
             * Cek authorization
             */

            if (!isAllowed(chatId)) {

                console.log(
                    `[UNAUTHORIZED] ${chatId} -> /status`
                );

                return;
            }


            /*
             * Panggil API
             */

            const result = await callApi(
                process.env.API_SERVER_STATUS
            );


            /*
             * Telegram hanya menerima message
             */

            await ctx.reply(
                result.message
            );


        } catch (error) {

            console.error(
                '[RESPONDER /status]',
                error
            );

            await ctx.reply(
                'Terjadi kesalahan saat memproses perintah.'
            );

        }

    });


    /*
     * Pesan masuk lainnya
     */

    bot.on('message', async (ctx) => {

        try {

            await saveChat(ctx);

            const text =
                ctx.message?.text || '';

            console.log(
                `[INCOMING] ${ctx.chat.id}: ${text}`
            );

        } catch (error) {

            console.error(
                '[RESPONDER MESSAGE]',
                error
            );

        }

    });

};


/*
 * Simpan informasi chat
 */

async function saveChat(ctx) {

    const chatId = String(
        ctx.chat.id
    );

    const username =
        ctx.from?.username || null;

    const firstName =
        ctx.from?.first_name || null;

    const lastName =
        ctx.from?.last_name || null;

    const chatType =
        ctx.chat?.type || null;


    await db.execute(`
        INSERT INTO telegram_chat
        (
            chat_id,
            username,
            first_name,
            last_name,
            chat_type
        )

        VALUES (?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

            username = VALUES(username),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            chat_type = VALUES(chat_type),
            last_seen = NOW()
    `, [
        chatId,
        username,
        firstName,
        lastName,
        chatType
    ]);

}