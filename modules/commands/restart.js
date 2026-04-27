module.exports.config = {
    name: "restart",
    version: "1.0.2",
    hasPermssion: 2,
    credits: "GPT Fix",
    description: "Khởi động lại bot bằng từ khóa (Noprefix)",
    commandCategory: "Admin",
    cooldowns: 5,
    // Bật noprefix chính thức ở đây nếu core bot hỗ trợ
    prefix: false 
};

module.exports.handleEvent = function ({ event, api }) {
    const { body, senderID, threadID } = event;
    if (!body) return;

    // Danh sách từ khóa sếp muốn dùng để restart (gõ là chạy)
    const keywords = ["rs", "restart", "resetbot"];
    const msg = body.toLowerCase();

    if (keywords.includes(msg)) {
        // Danh sách ID Admin chuẩn cú pháp mảng []
        const ADMIN = ["100003516351912"]; 

        if (!ADMIN.includes(senderID)) {
            return api.sendMessage("⚠️ Chỉ Admin mới có quyền kh���i động lại hệ thống!", threadID);
        }

        return api.sendMessage("🔄 Đang tiến hành Restart hệ thống. Vui lòng đợi giây lát...", threadID, () => {
            process.exit(1);
        });
    }
};

module.exports.run = function ({ event, api }) {
    // Để trống vì đã xử lý hết ở handleEvent (Noprefix)
    api.sendMessage("Lệnh này hiện đã chuyển sang dạng Noprefix (Gõ 'rs' hoặc 'restart' để dùng).", event.threadID);
};
