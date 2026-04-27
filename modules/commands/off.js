const fs = require("fs-extra");
const path = __dirname + "/cache/boxSleep.json";

module.exports.config = {
    name: "off",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Gemini",
    description: "Tắt/Mở bot triệt để",
    commandCategory: "Hệ thống",
    usages: "Bot off / Bot on",
    cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body || !global.config.ADMINBOT.includes(event.senderID)) return;
    const msg = event.body.toLowerCase();
    let data = JSON.parse(fs.readFileSync(path, "utf-8"));

    if (msg === "bot off") {
        data[event.threadID] = true;
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return api.sendMessage("😴 Đã khóa toàn bộ module. Chỉ Admin mới gõ được lệnh!", event.threadID);
    }
    if (msg === "bot on") {
        data[event.threadID] = false;
        fs.writeFileSync(path, JSON.stringify(data, null, 4));
        return api.sendMessage("🦁 Đã mở khóa hệ thống!", event.threadID);
    }
};
module.exports.run = async () => {};
