const db = require('../config/database');

const callApi = require('./api');

const {
    getApis,
    isAllowed
} = require('./config');


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
     * /id
     */

    bot.command('id', async (ctx) => {

        try {

            await saveChat(ctx);

            await ctx.reply(
                `Chat ID: ${ctx.chat.id}`
            );

        } catch (error) {

            console.error(
                '[RESPONDER /id]',
                error
            );

        }

    });


    /*
     * Semua command
     */

    bot.on('message', async (ctx) => {

        try {

            await saveChat(ctx);

            const text =
                ctx.message?.text || '';


            /*
             * Bukan command
             */

            if (!text.startsWith('/')) {
                return;
            }


            /*
             * Ambil command
             *
             * /status
             * menjadi:
             * status
             */

            const command =
                text
                    .split(/\s+/)[0]
                    .substring(1)
                    .toLowerCase();


            /*
             * Abaikan command khusus
             */

            if (
                command === 'start' ||
                command === 'id'
            ) {
                return;
            }


            const chatId =
                String(ctx.chat.id);


            /*
             * Ambil API berdasarkan
             * Chat ID + command
             */

            const apis =
                getApis(
                    chatId,
                    command
                );


            /*
             * Tidak punya akses
             */

            if (
                !Array.isArray(apis) ||
                apis.length === 0
            ) {

                console.log(
                    `[UNAUTHORIZED] ${chatId} -> /${command}`
                );

                return;
            }


            console.log(
                `[COMMAND] ${chatId} -> /${command}`
            );


            /*
             * Panggil semua API
             */

            const message =
                text
                    .replace(/^\/[^\s]+/, '')
                    .trim();


            const requestData = {
                chat_id: chatId,
                command: command,
                message: message
            };


            const results =
                await Promise.all(
                    apis.map(
                        api => callApi(
                            api,
                            requestData
                        )
                    )
                );


            /*
             * Ambil message dari API
             */

            const messages =
                results
                    .map(result => result.message)
                    .filter(
                        message =>
                            typeof message === 'string' &&
                            message.trim() !== ''
                    );


            /*
             * Tidak ada response
             */

            if (messages.length === 0) {

                await ctx.reply(
                    'Tidak ada response dari API.'
                );

                return;
            }


            /*
             * Gabungkan response
             */

            await ctx.reply(
                messages.join('\n')
            );


        } catch (error) {

            console.error(
                '[RESPONDER]',
                error
            );

            await ctx.reply(
                'Terjadi kesalahan saat memproses perintah.'
            );

        }

    });

};


/*
 * Simpan chat
 */

async function saveChat(ctx) {

    const chatId =
        String(ctx.chat.id);

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