module.exports.config = {
    name: "haha",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Gemini",
    description: "Thả haha vào tin nhắn được reply (Noprefix)",
    commandCategory: "Tiện ích",
    usages: "reply tin nhắn và gõ 'haha'",
    cooldowns: 1
};

module.exports.handleEvent = async function ({ api, event }) {
    const { body, messageReply, threadID, messageID } = event;
    if (!body) return;

    // Kiểm tra từ khóa noprefix (không phân biệt hoa thường)
    if (body.toLowerCase() == "haha") {
        // Nếu sếp quên không reply tin nhắn nào
        if (!messageReply) {
            return api.sendMessage("⚠️ Sếp ơi, phải reply vào tin nhắn nào đó thì em mới biết đường mà cười chứ!", threadID, messageID);
        }

        // Thực hiện thả icon "Haha" (😆) vào tin nhắn được reply
        return api.setMessageReaction("😆", messageReply.messageID, (err) => {
            if (err) return console.error(err);
        }, true);
    }
};

module.exports.run = async function ({ api, event }) {
    // Để trống vì xử lý noprefix ở handleEvent
};
