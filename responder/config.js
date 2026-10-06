let commands = {};

try {

    commands = JSON.parse(
        process.env.TELEGRAM_COMMANDS || '{}'
    );

} catch (error) {

    console.error(
        '[CONFIG ERROR] TELEGRAM_COMMANDS bukan JSON valid'
    );

    process.exit(1);

}


function getCommands(chatId) {

    return commands[String(chatId)] || {};

}


function getApis(chatId, command) {

    const userCommands =
        getCommands(chatId);

    return userCommands[command] || [];

}


function isAllowed(chatId, command) {

    const apis =
        getApis(chatId, command);

    return Array.isArray(apis) &&
           apis.length > 0;

}


module.exports = {
    getCommands,
    getApis,
    isAllowed
};