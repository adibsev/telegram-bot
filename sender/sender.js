const db = require('../config/database');

module.exports = function (bot) {

    async function processQueue() {

        try {

            const [rows] = await db.execute(`
                SELECT
                    id,
                    chat_id,
                    message,
                    attempts
                FROM telegram_outbox
                WHERE status = 'pending'
                ORDER BY id ASC
                LIMIT 10
            `);


            for (const row of rows) {

                try {

                    /*
                     * Lock pesan
                     */

                    const [result] = await db.execute(`
                        UPDATE telegram_outbox

                        SET
                            status = 'processing',
                            attempts = attempts + 1,
                            processing_at = NOW()

                        WHERE id = ?
                        AND status = 'pending'
                    `, [
                        row.id
                    ]);


                    /*
                     * Kalau sudah diambil process lain,
                     * jangan kirim.
                     */

                    if (result.affectedRows !== 1) {
                        continue;
                    }


                    /*
                     * Kirim Telegram
                     */

                    await bot.api.sendMessage({
                        chat_id: row.chat_id,
                        text: row.message
                    });


                    /*
                     * Berhasil
                     */

                    await db.execute(`
                        UPDATE telegram_outbox

                        SET
                            status = 'sent',
                            sent_at = NOW(),
                            error_message = NULL

                        WHERE id = ?
                    `, [
                        row.id
                    ]);


                    console.log(
                        `[SENT] ${row.id}`
                    );


                } catch (error) {

                    console.error(
                        `[SEND ERROR] ${row.id}`,
                        error.message
                    );


                    await db.execute(`
                        UPDATE telegram_outbox

                        SET
                            status = 'failed',
                            error_message = ?

                        WHERE id = ?
                    `, [
                        error.message,
                        row.id
                    ]);

                }

            }

        } catch (error) {

            console.error(
                '[SENDER ERROR]',
                error
            );

        }

    }


    /*
     * Proses queue setiap 1 detik
     */

    setInterval(
        processQueue,
        1000
    );


    /*
     * Proses langsung saat aplikasi mulai
     */

    processQueue();

};