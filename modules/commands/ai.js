const axios = require('axios');

module.exports = {
    config: {
        name: "ai",
        version: "4.0.0",
        hasPermssion: 0,
        credits: "Gemini",
        description: "AI thông minh - Tự động đổi Server khi lỗi 500",
        commandCategory: "AI",
        usages: "Aitl [câu hỏi]",
        cooldowns: 2
    },

    handleEvent: async function ({ api, event }) {
        const { threadID, messageID, body, senderID } = event;
        if (!body || senderID == api.getCurrentUserID()) return;

        if (body.toLowerCase().startsWith("aitl")) {
            const prompt = body.slice(4).trim();
            if (!prompt) return;

            api.setMessageReaction("🤔", messageID, () => {}, true);

            // Danh sách các API để bot thử lần lượt
            const urls = [
                `https://subhatde.id.vn/ai/meta?promt=${encodeURIComponent(prompt)}`,
                `https://api.kenliejame.com/ask?q=${encodeURIComponent(prompt)}`, // API dự phòng 1
                `https://de01.canvas.id.vn/gpt4?query=${encodeURIComponent(prompt)}` // API dự phòng 2
            ];

            let success = false;
            for (let url of urls) {
                try {
                    const res = await axios.get(url, { timeout: 8000 });
                    const data = res.data;

                    // Kiểm tra xem dữ liệu trả về có hợp lệ không
                    const reply = data.data || data.response || data.answer || (typeof data === 'string' ? data : null);
                    
                    if (reply && !reply.includes("fetch failed") && !reply.includes("500")) {
                        api.sendMessage(reply, threadID, messageID);
                        api.setMessageReaction("✅", messageID, () => {}, true);
                        success = true;
                        break; // Thoát vòng lặp nếu đã lấy được câu trả lời
                    }
                } catch (e) {
                    console.log("Server lỗi, đang thử server dự phòng...");
                    continue;
                }
            }

            if (!success) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("😔 Tất cả server AI đều đang bận. Bạn vui lòng thử lại sau vài phút nhé!", threadID, messageID);
            }
        }
    },

    run: async function ({ api, event }) {
        api.sendMessage("Hệ thống AI đa tầng đã sẵn sàng!", event.threadID);
    }
};
