const fs = require("fs-extra");
const path = __dirname + "/cache/bannedUsers.json";

module.exports.config = {
    name: "ban",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Gemini",
    description: "Ban ID triệt để",
    commandCategory: "Hệ thống",
    usages: "ban [ID]",
    cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body || !global.config.ADMINBOT.includes(event.senderID)) return;
    const args = event.body.split(" ");
    let data = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (args[0].toLowerCase() === "ban") {
        if (!args[1]) return;
        if (!data.includes(args[1])) data.push(args[1]);
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return api.sendMessage(`✅ Đã ban triệt để ID: ${args[1]}`, event.threadID);
    }
    if (args[0].toLowerCase() === "unban") {
        data = data.filter(i => i !== args[1]);
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return api.sendMessage(`🔓 Đã mở ban ID: ${args[1]}`, event.threadID);
    }
};
module.exports.run = async () => {};
