module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Fixed by GPT",
    description: "Quản lý admin bot",
    commandCategory: "System",
    usages: "[list/add/remove]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID, senderID, mentions } = event;
    const fs = require("fs");
    const path = __dirname + "/../../config.json";
    const config = JSON.parse(fs.readFileSync(path));

    if (!args[0]) 
        return api.sendMessage("Dùng: .admin list | add @tag | remove @tag", threadID, messageID);

    if (args[0] == "list") {
        let msg = "📜 DANH SÁCH ADMIN BOT:\n";
        config.ADMINBOT.forEach(id => msg += `• ${id}\n`);
        return api.sendMessage(msg, threadID, messageID);
    }

    if (args[0] == "add") {
        if (Object.keys(mentions).length == 0)
            return api.sendMessage("Tag người cần thêm.", threadID, messageID);

        let id = Object.keys(mentions)[0];
        if (config.ADMINBOT.includes(id))
            return api.sendMessage("Người này đã là admin.", threadID, messageID);

        config.ADMINBOT.push(id);
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("✅ Đã thêm admin.", threadID, messageID);
    }

    if (args[0] == "remove") {
        if (Object.keys(mentions).length == 0)
            return api.sendMessage("Tag người cần xoá.", threadID, messageID);

        let id = Object.keys(mentions)[0];
        config.ADMINBOT = config.ADMINBOT.filter(item => item != id);
        fs.writeFileSync(path, JSON.stringify(config, null, 4));
        return api.sendMessage("❌ Đã xoá admin.", threadID, messageID);
    }
};
