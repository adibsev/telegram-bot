const allowedIds = new Set(
    (process.env.TELEGRAM_ALLOWED_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
);

function isAllowed(chatId) {

    return allowedIds.has(
        String(chatId)
    );

}

module.exports = {
    isAllowed
};